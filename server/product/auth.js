// Private account store and revocable HTTP/WebSocket sessions. No credentials are served to the browser.
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, realpath, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { clientAddress } from '../net.js';
import { isAppRequest } from './app-client.js';
import { resolveStatePaths, assertStateFiles } from './state-paths.js';
import {DeviceAuth} from './device-auth.js';

const derive = promisify(scrypt);
const SCRYPT = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
export const COOKIE_NAME = 'sp_auth';
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'Stronghold@123456';
export const validUsername = (s) => typeof s === 'string' && s !== '.' && s !== '..' && /^[A-Za-z0-9_.-]{1,64}$/.test(s);
const validPassword = (s) => typeof s === 'string' && s.length >= 6 && Buffer.byteLength(s) <= 256;
const hashToken = (s) => createHash('sha256').update(s).digest('hex');

export async function hashPassword(password) {
  if (!validPassword(password)) throw new Error('密码至少 6 个字符，且不超过 256 字节');
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64, SCRYPT);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

export function validateUsers(config) {
  if (config?.version !== 1 || !Array.isArray(config.users) || !config.users.length || config.users.length > 1000) {
    throw new Error('认证账号文件无效：需要 version: 1 和非空 users 数组（最多 1000 个账号）');
  }
  const users = new Map();
  const accountIds = new Set();
  for (const [index, user] of config.users.entries()) {
    if (!validUsername(user?.username) || users.has(user.username)
      || typeof user.passwordHash !== 'string' || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(user.passwordHash)) {
      throw new Error('认证账号文件包含无效或重复账号 / 密码哈希');
    }
    if (user.sponsor != null && typeof user.sponsor !== 'boolean') throw new Error('赞助者状态无效');
    const change = user.sponsorChange;
    if (change != null && (!Number.isSafeInteger(change.at) || change.at < 0 || typeof change.by !== 'string' || !/^[a-f0-9-]{36}$/.test(change.by) || typeof change.enabled !== 'boolean')) throw new Error('赞助者变更记录无效');
    const role = user.role ?? (index === 0 ? 'admin' : 'user');
    if (!['admin', 'user'].includes(role) || (user.disabled != null && typeof user.disabled !== 'boolean')
      || (user.mustChangePassword != null && typeof user.mustChangePassword !== 'boolean')) {
      throw new Error('认证账号文件包含无效的角色或账号状态');
    }
    const accountId = user.accountId ?? randomUUID();
    if (typeof accountId !== 'string' || !/^[a-f0-9-]{36}$/.test(accountId) || accountIds.has(accountId)) throw new Error('账号标识无效或重复');
    accountIds.add(accountId);
    users.set(user.username, { username: user.username, passwordHash: user.passwordHash, role, accountId,
      disabled: user.disabled ?? false, mustChangePassword: user.mustChangePassword ?? false,
      sponsor: user.sponsor === true, ...(change ? { sponsorChange: { at: change.at, by: change.by, enabled: change.enabled } } : {}) });
  }
  if (![...users.values()].some((user) => user.role === 'admin' && !user.disabled)) {
    throw new Error('必须保留至少一个启用的管理员账号');
  }
  return users;
}

export async function writeUserStore(filename, users) {
  // Retain extension fields when an administrator changes one supported account property.
  let previous = { version: 1, users: [] };
  try { previous = JSON.parse(await readFile(filename, 'utf8')); validateUsers(previous); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  const known = new Map(previous.users.map(user => [user.accountId, user]));
  const config = { ...previous, version: 1, users: [...users.values()].map(user => ({ ...known.get(user.accountId), ...user })) };
  validateUsers(config);
  const temporary = `${filename}.${randomBytes(8).toString('hex')}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(config, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    await rename(temporary, filename);
  } finally { await rm(temporary, { force: true }); }
}

const accountView = ({ accountId, username, role, disabled, mustChangePassword, sponsor, sponsorChange }) => ({ accountId, username, role, disabled, mustChangePassword, sponsor: sponsor === true, ...(sponsorChange ? { sponsorChangedAt: sponsorChange.at } : {}) });
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };

async function verifyPassword(password, passwordHash) {
  const [, salt, expected] = passwordHash.split('$');
  const actual = await derive(password, salt, 64, SCRYPT);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}

function cookieToken(req) {
  const tokens = (req.headers.cookie || '').split(';').map((v) => v.trim()).filter((v) => v.startsWith(`${COOKIE_NAME}=`));
  if (tokens.length !== 1) return null;
  const token = tokens[0].slice(COOKIE_NAME.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function json(req, res, status, body, extra = {}) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': data.length,
    'Cache-Control': 'no-store', ...extra });
  res.end(req.method === 'HEAD' ? undefined : data);
}

async function readJson(req) {
  if ((req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw Object.assign(new Error('请使用 JSON 请求'), { status: 415 });
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2048) throw Object.assign(new Error('请求过大'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('JSON 格式错误'), { status: 400 }); }
}

// Bounded fixed-window limiter. Even local requests are limited; proxy handling matches server/net.js.
class LoginLimiter {
  constructor() { this.entries = new Map(); this.global = { until: 0, count: 0 }; }
  take(key, now) {
    if (now >= this.global.until) this.global = { until: now + 60_000, count: 0 };
    if (++this.global.count > 30) return Math.ceil((this.global.until - now) / 1000);
    let entry = this.entries.get(key);
    if (!entry || now >= entry.until) {
      if (this.entries.size >= 10_000) {
        for (const [k, v] of this.entries) if (now >= v.until) this.entries.delete(k);
        if (this.entries.size >= 10_000) return 60;
      }
      entry = { until: now + 15 * 60_000, count: 0 };
      this.entries.set(key, entry);
    }
    return ++entry.count > 10 ? Math.ceil((entry.until - now) / 1000) : 0;
  }
}

// Preference writes are frequent UI operations; keep them separate from password/account mutation limits.
class PreferenceLimiter {
  constructor(){this.entries=new Map();}
  take(key,now){
    for(const[k,v]of this.entries)if(v.until<=now)this.entries.delete(k);
    let row=this.entries.get(key);if(!row){if(this.entries.size>=10000)return 60;this.entries.set(key,row={until:now+60000,count:0});}
    return ++row.count>120?Math.max(1,Math.ceil((row.until-now)/1000)):0;
  }
}

export class Auth {
  constructor({ users, usersFile = null, secureCookie = true, sessionTtlMs = 12 * 3600_000, trustProxy = 'auto', now = Date.now }) {
    this.users = validateUsers(users);
    this.usersFile = usersFile;
    this.writeQueue = Promise.resolve();
    this.secureCookie = secureCookie;
    if (!Number.isSafeInteger(sessionTtlMs) || sessionTtlMs < 1 || sessionTtlMs > 7 * 24 * 3600_000) {
      throw new Error('认证会话有效期必须在 1 毫秒到 7 天之间');
    }
    this.sessionTtlMs = sessionTtlMs;
    this.trustProxy = trustProxy;
    this.now = now;
    this.sessions = new Map();
    this.devices = new DeviceAuth(usersFile?path.join(path.dirname(usersFile),'account-devices.sqlite'):null);
    this.limiter = new LoginLimiter();
    this.accountLimiter = new LoginLimiter();
    this.preferenceLimiter = new PreferenceLimiter();
    this.pendingLogins = 0;
    // Unknown accounts run the same KDF, avoiding a fast username existence check.
    this.dummyHash = `scrypt$${randomBytes(16).toString('hex')}$${randomBytes(64).toString('hex')}`;
    this.sweep = setInterval(() => this.prune(), 30_000).unref();
  }

  sameOrigin(req, required = true) {
    const origin = req.headers.origin;
    if (!origin) return !required;
    try {
      const parsed = new URL(origin);
      return parsed.origin === origin && parsed.host === req.headers.host
        && parsed.protocol === (this.secureCookie ? 'https:' : 'http:');
    } catch { return false; }
  }

  session(req) {
    const token = cookieToken(req);
    if (!token) return null;
    const key = hashToken(token);
    let session = this.sessions.get(key);
    if(!session){session=this.devices.restore(key,this.users,this.now());if(session)this.sessions.set(key,session);}
    if (!session) return null;
    const user = this.users.get(session.username);
    if (this.now() >= session.expiresAt || !user || user.disabled) { this.revoke(key); return null; }
    return session;
  }

  isSponsor(accountId) { return !!accountId && [...this.users.values()].some(u => u.accountId === accountId && !u.disabled && u.sponsor === true); }

  account(session) { return this.users.get(session?.username); }

  authorize(session, admin = false, allowInitial = false) {
    const user = this.account(session);
    if (!session || this.sessions.get(session.key) !== session || this.now() >= session.expiresAt || !user || user.disabled) {
      fail(401, '请先登录');
    }
    if (admin && user.role !== 'admin') fail(403, '仅管理员可以操作');
    if (!allowInitial && user.mustChangePassword) fail(403, '请先修改初始密码');
    return user;
  }

  revokeUser(username) {
    this.devices.revokeUser(username);
    for (const [key, session] of this.sessions) if (session.username === username) this.revoke(key);
  }

  // Serialize writes and authorize again at commit time; publish in-memory changes only after a durable write.
  commit(session, admin, transform) {
    const pending = this.writeQueue.then(async () => {
      this.authorize(session, admin, !admin);
      const draft = new Map([...this.users].map(([key, value]) => [key, { ...value }]));
      transform(draft);
      const checked = validateUsers({ version: 1, users: [...draft.values()] });
      if (this.usersFile) await writeUserStore(this.usersFile, checked);
      this.users = checked;
    });
    this.writeQueue = pending.catch(() => {});
    return pending;
  }

  cookie(token, maxAge = Math.floor(this.sessionTtlMs / 1000)) {
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${this.secureCookie ? '; Secure' : ''}`;
  }

  revoke(key) {
    this.devices.revoke(key);
    const session = this.sessions.get(key);
    if (!session) return;
    this.sessions.delete(key);
    for (const ws of session.sockets) {
      // terminate immediately, so queued frames cannot continue a revoked session.
      try { ws.close(4003, 'authentication required'); } catch { /* already closed */ }
      const timer = setTimeout(() => ws.terminate(), 1000).unref();
      ws.once('close', () => clearTimeout(timer));
    }
  }

  prune() {
    for (const [key, session] of this.sessions) if (this.now() >= session.expiresAt) this.revoke(key);
  }

  attachSocket(ws, session) {
    const key = session.key;
    session.sockets.add(ws);
    ws.authIsValid = () => this.sessions.get(key) === session && this.now() < session.expiresAt;
    let timer;
    const expire=()=>{const remaining=session.expiresAt-this.now();if(remaining<=0){this.revoke(key);return;}timer=setTimeout(expire,Math.min(2147483647,remaining)).unref();};
    expire();
    ws.once('close', () => { clearTimeout(timer); session.sockets.delete(ws); });
  }

  close() {
    clearInterval(this.sweep);
    for (const session of this.sessions.values())for(const ws of session.sockets)ws.close(1001,'server stopping');
    this.sessions.clear();this.devices.close();
  }

  async handle(req, res, pathname) {
    if(pathname==='/auth/devices') {
      const session=this.session(req),user=this.authorize(session);
      if(req.method==='GET'){json(req,res,200,{devices:this.devices.list(user.accountId,session.key)});return;}
      if(req.method!=='POST')fail(405,'请求方法不支持');
      if(!this.sameOrigin(req))fail(403,'请求来源不允许');
      const body=await readJson(req);this.authorize(session);
      if(body.all===true)this.revokeUser(user.username);
      else {const owned=this.devices.list(user.accountId,session.key).some(x=>x.id===body.id);if(!owned)fail(404,'设备不存在');this.revoke(body.id);}
      json(req,res,200,{ok:true});return;
    }
    if (pathname === '/auth/session' && (req.method === 'GET' || req.method === 'HEAD')) {
      const session = this.session(req);
      json(req, res, 200, { enabled: true, authenticated: !!session, app: isAppRequest(req), playAllowed: !!session&&isAppRequest(req)&&!this.account(session)?.mustChangePassword,
        ...(session ? { ...accountView(this.account(session)), expiresAt: session.expiresAt } : {}) });
      return;
    }
    if (pathname === '/auth/password' || pathname === '/auth/admin/users' || pathname.startsWith('/auth/admin/users/')) {
      try { await this.handleAccount(req, res, pathname); }
      catch (e) {
        if (!e.status) { json(req, res, 500, { error: '账号保存失败，请检查账号文件的写入权限后重试' }); return; }
        if (!res.destroyed) json(req, res, e.status, { error: e.message });
      }
      return;
    }
    if (pathname !== '/auth/login' && pathname !== '/auth/logout') { json(req, res, 404, { error: '接口不存在' }); return; }
    if (req.method !== 'POST') { json(req, res, 405, { error: '请使用 POST' }, { Allow: 'POST' }); return; }
    if (!this.sameOrigin(req)) { json(req, res, 403, { error: '请求来源不允许' }); return; }
    if (pathname === '/auth/logout') {
      const token = cookieToken(req);
      if (token) this.revoke(hashToken(token));
      json(req, res, 200, { ok: true }, { 'Set-Cookie': this.cookie('', 0) });
      return;
    }
    const address = clientAddress(req, this.trustProxy);
    const retry = this.limiter.take(address.key || address.ip, this.now());
    if (retry) { json(req, res, 429, { error: '登录尝试过于频繁，请稍后再试' }, { 'Retry-After': String(retry) }); return; }
    if (this.pendingLogins >= 2) { json(req, res, 503, { error: '登录服务繁忙，请稍后再试' }, { 'Retry-After': '2' }); return; }
    this.pendingLogins++;
    try {
      const body = await readJson(req);
      if (!validUsername(body?.username) || !validPassword(body?.password)) {
        json(req, res, 401, { error: '账号或密码错误' }); return;
      }
      const stored = this.users.get(body.username);
      const correct = await verifyPassword(body.password, stored?.passwordHash || this.dummyHash);
      const current = this.users.get(body.username);
      if (!correct || !stored || !current || current.disabled || current.passwordHash !== stored.passwordHash) {
        json(req, res, 401, { error: '账号或密码错误' }); return;
      }
      this.prune();
      if (this.sessions.size >= 5000) { json(req, res, 503, { error: '会话已满，请稍后再试' }); return; }
      const previous = cookieToken(req);
      if (previous) this.revoke(hashToken(previous));
      const token = randomBytes(32).toString('hex');
      const key = hashToken(token);
      const remembered=body.remember===true&&!current.mustChangePassword;
      const ttl=remembered?30*86400000:this.sessionTtlMs;
      const expiresAt = this.now() + ttl;
      if(remembered)this.devices.remember(key,current,expiresAt,/Android/i.test(req.headers['user-agent']||'')?'Android客户端':'电脑设备',this.now());
      this.sessions.set(key, { key, username: body.username, expiresAt, sockets: new Set() });
      json(req, res, 200, { ok: true, ...accountView(current), app: isAppRequest(req), playAllowed: isAppRequest(req)&&!current.mustChangePassword, expiresAt }, { 'Set-Cookie': this.cookie(token,Math.floor(ttl/1000)) });
    } catch (e) {
      if (!e.status) throw e;
      if (!res.destroyed) json(req, res, e.status, { error: e.message });
    } finally { this.pendingLogins--; }
  }

  async handleAccount(req, res, pathname) {
    const session = this.session(req);
    const isPassword = pathname === '/auth/password';
    const actor = this.authorize(session, !isPassword, isPassword);
    if (pathname === '/auth/admin/users' && (req.method === 'GET' || req.method === 'HEAD')) {
      json(req, res, 200, { users: [...this.users.values()].map(accountView) }); return;
    }
    const allowed = isPassword || pathname === '/auth/admin/users' ? ['POST'] : ['PATCH', 'DELETE'];
    if (!allowed.includes(req.method)) { json(req, res, 405, { error: '不支持的请求方法' }, { Allow: allowed.join(', ') }); return; }
    if (!this.sameOrigin(req)) fail(403, '请求来源不允许');
    const retry = this.accountLimiter.take(actor.username, this.now());
    if (retry) { json(req, res, 429, { error: '账号操作过于频繁，请稍后再试' }, { 'Retry-After': String(retry) }); return; }
    if (this.pendingLogins >= 2) { json(req, res, 503, { error: '账号服务繁忙，请稍后再试' }, { 'Retry-After': '2' }); return; }
    this.pendingLogins++;
    try {
      if (isPassword) {
        const body = await readJson(req);
        if (!validPassword(body?.currentPassword) || !await verifyPassword(body.currentPassword, actor.passwordHash)) {
          fail(401, '当前密码错误');
        }
        if (!validPassword(body.newPassword)) fail(400, '新密码至少 6 个字符，且不超过 256 字节');
        if (body.newPassword === body.currentPassword) fail(400, '新密码不能与当前密码相同');
        const passwordHash = await hashPassword(body.newPassword);
        await this.commit(session, false, (draft) => {
          const current = draft.get(actor.username);
          if (current.passwordHash !== actor.passwordHash) fail(409, '密码已发生变更，请重新登录');
          draft.set(actor.username, { ...current, passwordHash, mustChangePassword: false });
        });
        this.revokeUser(actor.username);
        json(req, res, 200, { ok: true, message: '密码已修改，请使用新密码重新登录' }, { 'Set-Cookie': this.cookie('', 0) });
        return;
      }
      if (pathname === '/auth/admin/users') {
        const body = await readJson(req);
        if (!validUsername(body?.username)) fail(400, '账号限 1–64 个字母、数字、下划线、点或短横线');
        if (!validPassword(body.password)) fail(400, '密码至少 6 个字符，且不超过 256 字节');
        const role = body.role ?? 'user';
        if (!['admin', 'user'].includes(role)) fail(400, '账号角色无效');
        const passwordHash = await hashPassword(body.password);
        await this.commit(session, true, (draft) => {
          if (draft.has(body.username)) fail(409, '账号已存在');
          if (draft.size >= 1000) fail(409, '账号数量已达上限');
          draft.set(body.username, { username: body.username, passwordHash, role, disabled: false, mustChangePassword: true });
        });
        json(req, res, 201, { ok: true }); return;
      }
      let username;
      try { username = decodeURIComponent(pathname.slice('/auth/admin/users/'.length)); }
      catch { fail(400, '账号无效'); }
      if (!validUsername(username)) fail(400, '账号无效');
      if (username === actor.username && req.method === 'DELETE') fail(400, '不能删除自己的账号');
      if (req.method === 'DELETE') {
        await this.commit(session, true, (draft) => {
          if (!draft.has(username)) fail(404, '账号不存在');
          draft.delete(username);
        });
      } else {
        const body = await readJson(req);
        if (!body || typeof body !== 'object' || Array.isArray(body) || !Object.keys(body).length
          || Object.keys(body).some((key) => !['password', 'role', 'disabled', 'sponsor'].includes(key))) fail(400, '账号修改字段无效');
        if (username === actor.username && Object.keys(body).some(key => key !== 'sponsor')) fail(400, '不能修改自己的权限或账号状态，请使用修改密码表单');
        if ('sponsor' in body && typeof body.sponsor !== 'boolean') fail(400, '赞助者状态无效');
        if ('role' in body && !['admin', 'user'].includes(body.role)) fail(400, '账号角色无效');
        if ('disabled' in body && typeof body.disabled !== 'boolean') fail(400, '账号状态无效');
        let passwordHash;
        if ('password' in body) {
          if (!validPassword(body.password)) fail(400, '密码至少 6 个字符，且不超过 256 字节');
          passwordHash = await hashPassword(body.password);
        }
        await this.commit(session, true, (draft) => {
          const user = draft.get(username);
          if (!user) fail(404, '账号不存在');
          draft.set(username, { ...user, ...(body.role ? { role: body.role } : {}),
            ...('disabled' in body ? { disabled: body.disabled } : {}),
            ...('sponsor' in body ? { sponsor: body.sponsor, sponsorChange: { at: this.now(), by: actor.accountId, enabled: body.sponsor } } : {}),
            ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}) });
        });
        if ('sponsor' in body) this.onSponsorChange?.();
        if (Object.keys(body).every(key => key === 'sponsor')) { json(req, res, 200, { ok: true }); return; }
      }
      this.revokeUser(username);
      json(req, res, 200, { ok: true });
    } finally { this.pendingLogins--; }
  }
}

export async function createAuth(opts, root, trustProxy, servedRoots = []) {
  const enabled = opts === false ? 'off' : process.env.SP_AUTH ?? 'on';
  if (enabled === 'off') return null;
  if (enabled !== 'on') throw new Error('SP_AUTH 必须为 on 或 off');
  const config = opts || {};
  const paths = resolveStatePaths(root);
  if (!config.users && !config.usersFile) assertStateFiles(root, paths);
  const filename = config.usersFile || paths.usersFile;
  let persistedPath = path.resolve(filename);
  let users = config.users;
  if (!users) {
    let actual;
    let missing = false;
    try { actual = await realpath(filename); }
    catch (e) {
      if (e.code !== 'ENOENT') throw new Error('无法读取认证账号文件，请检查路径与权限；详见 docs/AUTH.md');
      missing = true;
      await mkdir(path.dirname(path.resolve(filename)), { recursive: true, mode: 0o700 });
      actual = path.join(await realpath(path.dirname(path.resolve(filename))), path.basename(filename));
    }
    const roots = [path.join(root, 'public'), path.join(root, 'data'), path.join(root, 'shared'),
      path.join(root, 'server', 'sim'), ...servedRoots];
    const canonical = (value) => process.platform === 'win32' ? value.toLowerCase() : value;
    for (const directory of roots) {
      const directoryPath = canonical(await realpath(directory).catch(() => path.resolve(directory)));
      const filePath = canonical(actual);
      if (filePath === directoryPath || filePath.startsWith(directoryPath + path.sep)) {
        throw new Error('认证账号文件不能放在网页可访问的目录中，请使用 storage/auth-users.json 或私有绝对路径');
      }
    }
    if (missing) {
      const initial = { version: 1, users: [{ username: DEFAULT_ADMIN_USERNAME,
        passwordHash: await hashPassword(DEFAULT_ADMIN_PASSWORD), role: 'admin', disabled: false, mustChangePassword: true }] };
      try { await writeFile(actual, JSON.stringify(initial, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); }
      catch (e) { if (e.code !== 'EEXIST') throw new Error('无法初始化默认管理员，请检查账号目录写入权限'); }
    }
    try { users = JSON.parse(await readFile(actual, 'utf8')); }
    catch { throw new Error('认证账号文件不是有效 JSON，请检查配置；详见 docs/AUTH.md'); }
    persistedPath = actual;
  }
  const secure = config.secureCookie ?? process.env.SP_AUTH_COOKIE_SECURE ?? '1';
  if (![true, false, '1', '0'].includes(secure)) throw new Error('SP_AUTH_COOKIE_SECURE 必须为 1 或 0');
  const auth = new Auth({ users, usersFile: config.users ? config.usersFile ?? null : persistedPath, trustProxy, secureCookie: secure === true || secure === '1',
    sessionTtlMs: config.sessionTtlMs ?? Number(process.env.SP_AUTH_SESSION_HOURS ?? 12) * 3600_000, now: config.now });
  // Upgrade pre-admin account files once. Their first account becomes admin; existing passwords remain unchanged.
  if (!config.users && users.users.some((user) => user.accountId == null || user.role == null || user.disabled == null || user.mustChangePassword == null)) {
    try { await writeUserStore(persistedPath, auth.users); }
    catch (e) { auth.close(); throw new Error('无法升级账号文件，请确认服务用户具有目录写入权限'); }
  }
  return auth;
}
