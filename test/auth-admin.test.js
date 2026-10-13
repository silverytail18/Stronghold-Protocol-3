import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import WebSocket from 'ws';
import { startServer } from '../server/index.js';
import { DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, hashPassword, validateUsers } from '../server/auth.js';
import { TestClient } from './helpers/wsClient.js';

const password = 'admin-test-long-password';
const changedPassword = 'changed-test-long-password';
let passwordHash;
before(async () => { passwordHash = await hashPassword(password); });

function request(srv, route, { method = 'GET', cookie, body, origin = srv.url, contentType = 'application/json' } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(srv.url + route, { method, headers: {
      ...(cookie ? { Cookie: cookie } : {}), ...(origin ? { Origin: origin } : {}),
      ...(body !== undefined ? { 'Content-Type': contentType } : {}),
    } }, (res) => {
      const chunks = [];
      res.on('data', (data) => chunks.push(data));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data; try { data = JSON.parse(text); } catch { /* HTML page */ }
        resolve({ status: res.statusCode, headers: res.headers, data, text,
          cookie: res.headers['set-cookie']?.[0].split(';')[0] });
      });
      res.on('error', reject);
    });
    req.on('error', reject); req.end(body === undefined ? undefined : JSON.stringify(body));
  });
}
const login = (srv, username = 'admin', suppliedPassword = password) => request(srv, '/auth/login', {
  method: 'POST', body: { username, password: suppliedPassword },
});
const mutate = (srv, cookie, username, body, method = 'PATCH') => request(srv, `/auth/admin/users/${encodeURIComponent(username)}`, { method, cookie, body });

async function fixture(t, bootstrap = false, suppliedUsers) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sp-admin-'));
  const folder = path.join(dir, 'accounts');
  await fs.mkdir(folder);
  const filename = path.join(folder, 'users.json');
  if (!bootstrap) await fs.writeFile(filename, JSON.stringify({ version: 1, users: suppliedUsers || [
    { username: 'admin', passwordHash, role: 'admin', disabled: false, mustChangePassword: false },
    { username: 'player', passwordHash, role: 'user', disabled: false, mustChangePassword: false },
  ] }));
  const srv = await startServer({ port: 0, host: '127.0.0.1', quiet: true, auth: { usersFile: filename, secureCookie: false } });
  t.after(async () => { await srv.close(); await fs.rm(dir, { recursive: true, force: true }); });
  return { srv, filename, folder };
}

test('six-character passwords work for creation, login, change and reset; five are rejected', async (t) => {
  const { srv } = await fixture(t);
  const admin = await login(srv);
  const create = (password) => request(srv, '/auth/admin/users', { method: 'POST', cookie: admin.cookie, body: { username: 'six', password, role: 'user' } });
  assert.equal((await create('12345')).status, 400);
  assert.equal((await create('123456')).status, 201);
  const accountId = srv.auth.users.get('six').accountId;
  let signedIn = await login(srv, 'six', '123456');
  assert.equal(signedIn.status, 200);
  const change = (password) => request(srv, '/auth/password', { method: 'POST', cookie: signedIn.cookie, body: { currentPassword: '123456', newPassword: password } });
  assert.equal((await change('abcde')).status, 400);
  assert.equal((await change('abcdef')).status, 200);
  assert.equal((await login(srv, 'six', 'abcdef')).status, 200);
  assert.equal((await mutate(srv, admin.cookie, 'six', { password: '54321' })).status, 400);
  assert.equal((await mutate(srv, admin.cookie, 'six', { password: '654321' })).status, 200);
  assert.equal((await login(srv, 'six', '654321')).status, 200);
  assert.equal(srv.auth.users.get('six').accountId, accountId);
});

test('default admin must change password before game, WebSocket and user management access', async (t) => {
  const { srv, filename } = await fixture(t, true);
  const result = await login(srv, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
  assert.equal(result.status, 200);
  assert.equal(result.data.role, 'admin');
  assert.equal(result.data.mustChangePassword, true);
  const { cookie } = result;
  assert.equal((await request(srv, '/admin', { cookie })).status, 200);
  assert.equal((await request(srv, '/js/account.js', { cookie })).status, 200);
  assert.equal((await request(srv, '/css/account.css', { cookie })).status, 200);
  assert.equal((await request(srv, '/', { cookie })).headers.location, '/admin');
  assert.equal((await request(srv, '/data/config.json', { cookie })).status, 403);
  assert.equal((await request(srv, '/auth/admin/users', { cookie })).status, 403);
  assert.equal((await request(srv, '/admin')).headers.location, '/login?next=%2Fadmin');
  const denied = await new Promise((resolve, reject) => {
    const ws = new WebSocket(srv.url.replace('http:', 'ws:') + '/ws', { headers: { 'User-Agent': 'StrongholdProtocolApp/1', Cookie: cookie, Origin: srv.url } });
    ws.on('error', () => {});
    ws.once('unexpected-response', (_req, response) => { response.resume(); resolve(response.statusCode); ws.terminate(); });
    ws.once('open', () => { ws.terminate(); reject(new Error('initial password bypassed')); });
  });
  assert.equal(denied, 403);
  assert.ok(!(await fs.readFile(filename, 'utf8')).includes(DEFAULT_ADMIN_PASSWORD));
});

test('password change verifies current password, persists and revokes every session', async (t) => {
  const { srv, filename } = await fixture(t, true);
  const first = await login(srv, 'admin', DEFAULT_ADMIN_PASSWORD);
  const other = await login(srv, 'admin', DEFAULT_ADMIN_PASSWORD);
  const change = (currentPassword, newPassword) => request(srv, '/auth/password', { method: 'POST', cookie: first.cookie, body: { currentPassword, newPassword } });
  assert.equal((await change('wrong-current-password', changedPassword)).status, 401);
  assert.equal((await change(DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD)).status, 400);
  assert.equal((await change(DEFAULT_ADMIN_PASSWORD, 'short')).status, 400);
  assert.equal((await change(DEFAULT_ADMIN_PASSWORD, changedPassword)).status, 200);
  assert.equal((await request(srv, '/auth/session', { cookie: first.cookie })).data.authenticated, false);
  assert.equal((await request(srv, '/auth/session', { cookie: other.cookie })).data.authenticated, false);
  assert.equal((await login(srv, 'admin', DEFAULT_ADMIN_PASSWORD)).status, 401);
  const fresh = await login(srv, 'admin', changedPassword);
  assert.equal(fresh.status, 200);
  assert.equal(fresh.data.mustChangePassword, false);
  assert.equal((await request(srv, '/auth/admin/users', { cookie: fresh.cookie })).status, 200);
  const stored = JSON.parse(await fs.readFile(filename, 'utf8'));
  assert.equal(stored.users[0].mustChangePassword, false);
  assert.ok(!JSON.stringify(stored).includes(changedPassword));
});

test('restart preserves changed passwords and account changes, without restoring defaults', async (t) => {
  const { srv, filename } = await fixture(t, true);
  const first = await login(srv, 'admin', DEFAULT_ADMIN_PASSWORD);
  await request(srv, '/auth/password', { method: 'POST', cookie: first.cookie,
    body: { currentPassword: DEFAULT_ADMIN_PASSWORD, newPassword: changedPassword } });
  const fresh = await login(srv, 'admin', changedPassword);
  await request(srv, '/auth/admin/users', { method: 'POST', cookie: fresh.cookie,
    body: { username: 'friend', password, role: 'user' } });
  await srv.close();
  const restarted = await startServer({ port: 0, host: '127.0.0.1', quiet: true, auth: { usersFile: filename, secureCookie: false } });
  t.after(() => restarted.close());
  assert.equal((await login(restarted, 'admin', DEFAULT_ADMIN_PASSWORD)).status, 401);
  assert.equal((await login(restarted, 'admin', changedPassword)).data.mustChangePassword, false);
  assert.equal((await login(restarted, 'friend')).data.mustChangePassword, true);
});

test('anonymous and ordinary users cannot manage users; admin responses never expose hashes', async (t) => {
  const { srv } = await fixture(t);
  const player = await login(srv, 'player');
  assert.equal((await request(srv, '/auth/admin/users')).status, 401);
  assert.equal((await request(srv, '/auth/admin/users', { cookie: player.cookie })).status, 403);
  assert.equal((await request(srv, '/admin', { cookie: player.cookie })).status, 403);
  assert.equal((await request(srv, '/account', { cookie: player.cookie })).status, 200);
  assert.equal((await mutate(srv, player.cookie, 'player', { role: 'admin' })).status, 403);
  assert.equal((await request(srv, '/auth/admin/users', { method: 'POST', cookie: player.cookie,
    body: { username: 'intruder', password, role: 'admin' } })).status, 403);
  const admin = await login(srv);
  const list = await request(srv, '/auth/admin/users', { cookie: admin.cookie });
  assert.equal(list.status, 200);
  assert.ok(!list.text.includes('passwordHash') && !list.text.includes('scrypt$'));
  assert.equal((await request(srv, '/auth/admin/users', { method: 'POST', cookie: admin.cookie,
    origin: 'http://evil.example', body: { username: 'intruder', password } })).status, 403);
  assert.equal((await request(srv, '/auth/password', { method: 'POST', cookie: admin.cookie,
    origin: null, body: { currentPassword: password, newPassword: changedPassword } })).status, 403);
});

test('admin can create accounts; new users change their temporary password before game access', async (t) => {
  const { srv, filename } = await fixture(t);
  const admin = await login(srv);
  const create = (body) => request(srv, '/auth/admin/users', { method: 'POST', cookie: admin.cookie, body });
  assert.equal((await create({ username: '..', password })).status, 400);
  assert.equal((await create({ username: 'weak', password: 'short' })).status, 400);
  assert.equal((await create({ username: 'friend', password })).status, 201);
  assert.equal((await create({ username: 'friend', password })).status, 409);
  const friend = await login(srv, 'friend');
  assert.equal(friend.data.role, 'user');
  assert.equal(friend.data.mustChangePassword, true);
  assert.equal((await request(srv, '/', { cookie: friend.cookie })).headers.location, '/account');
  assert.equal((await request(srv, '/auth/password', { method: 'POST', cookie: friend.cookie,
    body: { currentPassword: password, newPassword: changedPassword } })).status, 200);
  const changed = await login(srv, 'friend', changedPassword);
  assert.equal((await request(srv, '/', { cookie: changed.cookie })).headers.location, '/account');
  assert.equal(JSON.parse(await fs.readFile(filename, 'utf8')).users.length, 3);
});

test('password reset immediately disconnects game sockets and invalidates old passwords', async (t) => {
  const { srv } = await fixture(t);
  const admin = await login(srv);
  const player = await login(srv, 'player');
  const client = await TestClient.connect(srv.url.replace('http:', 'ws:') + '/ws', {
    wsOptions: { headers: { Cookie: player.cookie, Origin: srv.url } },
  });
  t.after(() => client.close());
  await client.hello('Doctor');
  const closed = once(client.ws, 'close');
  assert.equal((await mutate(srv, admin.cookie, 'player', { password: changedPassword })).status, 200);
  assert.equal((await closed)[0], 4003);
  assert.equal((await request(srv, '/data/config.json', { cookie: player.cookie })).status, 401);
  assert.equal((await login(srv, 'player')).status, 401);
  assert.equal((await login(srv, 'player', changedPassword)).data.mustChangePassword, true);
});

test('disable and enable take effect immediately and do not revive old sessions', async (t) => {
  const { srv } = await fixture(t);
  const admin = await login(srv);
  const player = await login(srv, 'player');
  assert.equal((await mutate(srv, admin.cookie, 'player', { disabled: true })).status, 200);
  assert.equal((await login(srv, 'player')).status, 401);
  assert.equal((await request(srv, '/auth/session', { cookie: player.cookie })).data.authenticated, false);
  assert.equal((await mutate(srv, admin.cookie, 'player', { disabled: false })).status, 200);
  assert.equal((await login(srv, 'player')).status, 200);
  assert.equal((await request(srv, '/auth/session', { cookie: player.cookie })).data.authenticated, false);
});

test('role changes require a new session; self deletion/demotion is rejected, delete is durable', async (t) => {
  const { srv, filename } = await fixture(t);
  const admin = await login(srv);
  const player = await login(srv, 'player');
  assert.equal((await mutate(srv, admin.cookie, 'admin', undefined, 'DELETE')).status, 400);
  assert.equal((await mutate(srv, admin.cookie, 'admin', { role: 'user' })).status, 400);
  assert.equal((await mutate(srv, admin.cookie, 'player', { role: 'admin' })).status, 200);
  assert.equal((await request(srv, '/auth/admin/users', { cookie: player.cookie })).status, 401);
  const promoted = await login(srv, 'player');
  assert.equal((await request(srv, '/auth/admin/users', { cookie: promoted.cookie })).status, 200);
  assert.equal((await mutate(srv, admin.cookie, 'player', undefined, 'DELETE')).status, 200);
  assert.equal((await login(srv, 'player')).status, 401);
  assert.equal(JSON.parse(await fs.readFile(filename, 'utf8')).users.length, 1);
  assert.throws(() => validateUsers({ version: 1, users: [{ username: 'player', passwordHash, role: 'user' }] }), /管理员/);
});

test('concurrent creates preserve both users and reject invalid mutation fields', async (t) => {
  const { srv, filename } = await fixture(t);
  const admin = await login(srv);
  const results = await Promise.all(['friend1', 'friend2'].map((username) => request(srv, '/auth/admin/users', {
    method: 'POST', cookie: admin.cookie, body: { username, password },
  })));
  assert.deepEqual(results.map((res) => res.status), [201, 201]);
  const names = JSON.parse(await fs.readFile(filename, 'utf8')).users.map((user) => user.username);
  assert.ok(names.includes('friend1') && names.includes('friend2'));
  assert.equal((await mutate(srv, admin.cookie, 'player', { mustChangePassword: false })).status, 400);
  assert.equal((await mutate(srv, admin.cookie, 'player', { role: null })).status, 400);
  assert.equal((await mutate(srv, admin.cookie, 'missing', { disabled: true })).status, 404);
});

test('failed persistence does not publish account changes or revoke existing sessions', async (t) => {
  const { srv, filename, folder } = await fixture(t);
  const admin = await login(srv);
  const player = await login(srv, 'player');
  await fs.rm(filename); await fs.rmdir(folder); await fs.writeFile(folder, 'not a directory');
  const result = await mutate(srv, admin.cookie, 'player', { disabled: true });
  assert.equal(result.status, 500);
  assert.equal((await request(srv, '/auth/session', { cookie: player.cookie })).data.authenticated, true);
  assert.equal(srv.auth.users.get('player').disabled, false);
});

test('legacy files promote only the first account and keep existing password hashes', async (t) => {
  const { srv, filename } = await fixture(t, false, [
    { username: 'original-owner', passwordHash }, { username: 'friend', passwordHash },
  ]);
  assert.equal((await login(srv, 'original-owner')).data.role, 'admin');
  assert.equal((await login(srv, 'friend')).data.role, 'user');
  assert.equal((await login(srv, 'admin', DEFAULT_ADMIN_PASSWORD)).status, 401);
  const stored = JSON.parse(await fs.readFile(filename, 'utf8'));
  assert.equal(stored.users[0].passwordHash, passwordHash);
  assert.equal(stored.users[0].role, 'admin');
});

test('concurrent admins cannot remove the last administrator through stale authorization', async (t) => {
  const { srv, filename } = await fixture(t, false, ['admin1', 'admin2'].map((username) => ({
    username, passwordHash, role: 'admin', disabled: false, mustChangePassword: false,
  })));
  const first = await login(srv, 'admin1');
  const second = await login(srv, 'admin2');
  const results = await Promise.all([
    mutate(srv, first.cookie, 'admin2', { role: 'user' }),
    mutate(srv, second.cookie, 'admin1', { role: 'user' }),
  ]);
  assert.ok(results.some((result) => result.status === 200));
  assert.ok(results.some((result) => result.status === 401 || result.status === 403));
  assert.equal(JSON.parse(await fs.readFile(filename, 'utf8')).users.filter((user) => user.role === 'admin' && !user.disabled).length, 1);
});
