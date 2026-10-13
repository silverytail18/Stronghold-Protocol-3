import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import WebSocket from 'ws';
import http from 'node:http';
import { startServer } from '../server/index.js';
import { createAuth, hashPassword, validateUsers, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD } from '../server/auth.js';
import { TestClient } from './helpers/wsClient.js';
import { probePort } from '../tools/doctor.mjs';

const password = 'test-only-long-password';
// http.request avoids fetch's browser-only blocked-port list on Windows ephemeral ports.
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: options.method || 'GET', headers: options.headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: new Headers(Object.entries(res.headers).map(([key, value]) =>
          [key, Array.isArray(value) ? value.join(', ') : value])), json: async () => JSON.parse(body), text: async () => body });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end(options.body);
  });
}
let users;
before(async () => {
  users = { version: 1, users: [
    { username: 'alice', passwordHash: await hashPassword(password) },
    { username: 'bob', passwordHash: await hashPassword(password) },
  ] };
});

async function fixture(t, config = {}) {
  const srv = await startServer({ port: 0, host: '127.0.0.1', quiet: true,
    auth: { users, secureCookie: false, ...config } });
  t.after(() => srv.close());
  return srv;
}
const get = (srv, route, cookie, extra = {}) => request(srv.url + route, {
  redirect: 'manual', headers: { 'User-Agent': 'StrongholdProtocolApp/1', ...(cookie ? { Cookie: cookie } : {}), ...extra },
});
const login = (srv, username = 'alice', suppliedPassword = password, extra = {}) => request(srv.url + '/auth/login', {
  method: 'POST', headers: { Origin: srv.url, 'Content-Type': 'application/json', ...extra },
  body: JSON.stringify({ username, password: suppliedPassword }),
});
const cookieOf = (res) => res.headers.get('set-cookie').split(';')[0];
const wsOptions = (srv, cookie, origin = srv.url) => ({ headers: { 'User-Agent': 'StrongholdProtocolApp/1', Cookie: cookie, ...(origin ? { Origin: origin } : {}) } });

test('account hashes have unique salts; weak passwords and malformed account stores fail', async () => {
  assert.notEqual(await hashPassword(password), await hashPassword(password));
  await assert.rejects(hashPassword('short'));
  await assert.rejects(hashPassword('x'.repeat(257)));
  assert.throws(() => validateUsers({ version: 1, users: [] }));
  assert.throws(() => validateUsers({ version: 1, users: [users.users[0], users.users[0]] }));
  assert.throws(() => validateUsers({ version: 1, users: [{ username: 'alice', passwordHash: 'plaintext' }] }));
});

test('first boot initializes a default admin; malformed files fail closed; auth:false allows local play', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sp-auth-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const filename = path.join(dir, 'users.json');
  const auth = await createAuth({ usersFile: filename }, dir, false);
  assert.equal(auth.users.get(DEFAULT_ADMIN_USERNAME).mustChangePassword, true);
  assert.equal(auth.users.get(DEFAULT_ADMIN_USERNAME).role, 'admin');
  auth.close();
  const store = JSON.parse(await fs.readFile(filename, 'utf8'));
  assert.equal(store.users.length, 1);
  assert.ok(!JSON.stringify(store).includes(DEFAULT_ADMIN_PASSWORD));
  await fs.writeFile(filename, '{broken');
  await assert.rejects(startServer({ port: 0, quiet: true, auth: { usersFile: filename } }), /JSON/);
  assert.equal(await fs.readFile(filename, 'utf8'), '{broken');
  const srv = await startServer({ port: 0, host: '127.0.0.1', quiet: true, auth: false });
  t.after(() => srv.close());
  assert.equal((await get(srv, '/')).status, 200);
  assert.deepEqual(await (await get(srv, '/auth/session')).json(), { enabled: false, authenticated: false, app: true, playAllowed: true });
});

test('anonymous users only reach the login page, its assets, and minimal health status', async (t) => {
  const srv = await fixture(t);
  const root = await get(srv, '/?room=ABCD&board=2d');
  assert.equal(root.status, 302);
  assert.equal(root.headers.get('location'), '/login?next=%2F%3Froom%3DABCD%26board%3D2d');
  const page = await get(srv, '/login');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(await page.text(), /登录并进入/);
  assert.equal((await get(srv, '/js/login.js')).status, 200);
  assert.equal((await get(srv, '/css/login.css')).status, 200);
  for (const route of ['/index.html?x=1', '/data/config.json', '/js/main.js', '/sim/Battle.js', '/shared/protocol.js',
    '/vendor/preact.module.js', '/assets/anything.png', '/media/bgm/act1', '/dev/game-mock.html', '/%69ndex.html', '//data/config.json']) {
    const response = await get(srv, route);
    assert.equal(response.status, route.startsWith('/index.html?') ? 302 : 401, route);
  }
  assert.deepEqual(await (await get(srv, '/healthz')).json(), { ok: true });
  assert.equal((await probePort(srv.port, srv.host)).state, 'ours', 'doctor identifies protected servers without accessing private stats');
});

test('account files in static mounts are rejected and private files load successfully', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sp-auth-store-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const publicDir = path.join(dir, 'public');
  await fs.mkdir(publicDir);
  const exposed = path.join(publicDir, 'users.json');
  await fs.writeFile(exposed, JSON.stringify(users));
  await assert.rejects(startServer({ port: 0, quiet: true, publicDir, auth: { usersFile: exposed } }), /网页可访问/);
  const privateFile = path.join(dir, 'users.json');
  await fs.writeFile(privateFile, JSON.stringify(users));
  const srv = await startServer({ port: 0, quiet: true, host: '127.0.0.1', auth: { usersFile: privateFile, secureCookie: false } });
  t.after(() => srv.close());
  assert.equal((await login(srv)).status, 200);
});

test('correct password sets private cookie and grants resources; wrong credentials have identical errors', async (t) => {
  const srv = await fixture(t);
  const badPassword = await login(srv, 'alice', 'wrong-long-password');
  const unknownUser = await login(srv, 'unknown-user');
  assert.equal(badPassword.status, 401);
  assert.equal(unknownUser.status, 401);
  assert.deepEqual(await badPassword.json(), await unknownUser.json());
  const response = await login(srv);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict; Max-Age=43200/);
  const cookie = cookieOf(response);
  const status = await (await get(srv, '/auth/session', cookie)).json();
  assert.equal(status.username, 'alice');
  assert.equal(status.authenticated, true);
  assert.equal((await get(srv, '/', cookie)).status, 200);
  const data = await get(srv, '/data/config.json?v=1', cookie);
  assert.equal(data.status, 200);
  assert.equal(data.headers.get('cache-control'), 'private, no-cache');
  assert.equal((await get(srv, '/login', cookie)).status, 302);
  assert.equal((await get(srv, '/data/config.json', cookie.replace(/.$/, 'z'))).status, 401);
  assert.equal((await get(srv, '/data/config.json', `${cookie}; ${cookie}`)).status, 401);
});

test('HTTPS cookies are secure by default and Origin must match scheme and host', async (t) => {
  const srv = await fixture(t, { secureCookie: true });
  assert.equal((await login(srv)).status, 403);
  const good = await login(srv, 'alice', password, { Origin: srv.url.replace('http:', 'https:') });
  assert.equal(good.status, 200);
  assert.match(good.headers.get('set-cookie'), /; Secure$/);
  assert.equal((await login(srv, 'alice', password, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await login(srv, 'alice', password, { Origin: 'null' })).status, 403);
  assert.equal((await request(srv.url + '/auth/login', { method: 'POST' })).status, 403);
});

test('auth endpoints reject wrong methods, content types and malformed requests', async (t) => {
  const srv = await fixture(t);
  assert.equal((await get(srv, '/auth/login')).status, 405);
  for (const [contentType, body, status] of [
    ['text/plain', '{}', 415], ['application/json', '{', 400],
    ['application/json', 'null', 401], ['application/json', '{"username":"a","password":"' + 'x'.repeat(2200) + '"}', 413],
  ]) {
    const response = await request(srv.url + '/auth/login', { method: 'POST', headers: {
      Origin: srv.url, 'Content-Type': contentType,
    }, body });
    assert.equal(response.status, status);
  }
});

test('login attempts are limited even from localhost', async (t) => {
  const srv = await fixture(t);
  for (let i = 0; i < 10; i++) assert.equal((await login(srv, 'alice', 'short')).status, 401);
  const limited = await login(srv);
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
});

test('WebSocket rejects missing cookies and foreign or missing Origin before connecting', async (t) => {
  const srv = await fixture(t);
  const cookie = cookieOf(await login(srv));
  for (const [headers, status] of [[{'User-Agent':'StrongholdProtocolApp/1'}, 401], [wsOptions(srv, cookie, 'https://evil.example').headers, 403],
    [wsOptions(srv, cookie, null).headers, 403]]) {
    const actual = await new Promise((resolve, reject) => {
      const ws = new WebSocket(srv.url.replace('http:', 'ws:') + '/ws', { headers });
      ws.on('error', () => {});
      ws.once('unexpected-response', (_req, response) => { response.resume(); resolve(response.statusCode); ws.terminate(); });
      ws.once('open', () => { ws.terminate(); reject(new Error('upgrade unexpectedly succeeded')); });
    });
    assert.equal(actual, status);
  }
});

test('logout revokes cookies and existing sockets, while another browser session stays valid', async (t) => {
  const srv = await fixture(t);
  const cookie = cookieOf(await login(srv));
  const other = cookieOf(await login(srv));
  const client = await TestClient.connect(srv.url.replace('http:', 'ws:') + '/ws', { wsOptions: wsOptions(srv, cookie) });
  t.after(() => client.close());
  await client.hello('Doctor');
  const closed = once(client.ws, 'close');
  const foreign = await request(srv.url + '/auth/logout', { method: 'POST', headers: { Origin: 'https://evil.example', Cookie: cookie } });
  assert.equal(foreign.status, 403);
  const response = await request(srv.url + '/auth/logout', { method: 'POST', headers: { Origin: srv.url, Cookie: cookie } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await closed)[0], 4003);
  assert.equal((await get(srv, '/data/config.json', cookie)).status, 401);
  assert.equal((await get(srv, '/data/config.json', other)).status, 200);
});

test('session expiry revokes already-open sockets and reconnect access', async (t) => {
  let now = Date.now();
  const srv = await fixture(t, { sessionTtlMs: 1000, now: () => now });
  const cookie = cookieOf(await login(srv));
  const client = await TestClient.connect(srv.url.replace('http:', 'ws:') + '/ws', { wsOptions: wsOptions(srv, cookie) });
  t.after(() => client.close());
  await client.hello('Doctor');
  const closed = once(client.ws, 'close');
  now += 1001;
  client.ws.send(JSON.stringify({ t: 'ping' }));
  assert.equal((await closed)[0], 4003);
  assert.equal((await get(srv, '/data/config.json', cookie)).status, 401);
});

test('game reconnect token is bound to account; same account resumes and another starts fresh', async (t) => {
  const srv = await fixture(t);
  const alice = cookieOf(await login(srv));
  const bob = cookieOf(await login(srv, 'bob'));
  const connect = (cookie) => TestClient.connect(srv.url.replace('http:', 'ws:') + '/ws', { wsOptions: wsOptions(srv, cookie) });
  const first = await connect(alice);
  const identity = await first.hello('Alice');
  await first.close();
  const resumed = await connect(alice);
  const same = await resumed.hello('Alice', identity.token);
  assert.equal(same.resumed, true);
  assert.equal(same.playerId, identity.playerId);
  t.after(() => resumed.close());
  const other = await connect(bob);
  t.after(() => other.close());
  const distinct = await other.hello('Bob', identity.token);
  assert.equal(distinct.resumed, false);
  assert.notEqual(distinct.playerId, identity.playerId);
});

test('login rotates a supplied existing session rather than keeping its token', async (t) => {
  const srv = await fixture(t);
  const previous = cookieOf(await login(srv));
  const next = await login(srv, 'bob', password, { Cookie: previous });
  assert.notEqual(cookieOf(next), previous);
  assert.equal((await get(srv, '/data/config.json', previous)).status, 401);
});
