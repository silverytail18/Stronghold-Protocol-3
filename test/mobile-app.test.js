import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { startServer } from '../server/index.js';
import { hashPassword } from '../server/auth.js';
import { APP_USER_AGENT, isAppRequest, isAccountResource } from '../server/app-client.js';
import { TestClient } from './helpers/wsClient.js';

const password = 'mobile-test-long-password';
let passwordHash;
before(async () => { passwordHash = await hashPassword(password); });

function request(srv, route, { app = true, cookie, method = 'GET', body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(srv.url + route, { method, headers: {
      Origin: srv.url, 'User-Agent': app ? `Mozilla/5.0 ${APP_USER_AGENT}` : 'Mozilla/5.0',
      ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}),
    } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data; try { data = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, text, data, cookie: res.headers['set-cookie']?.[0].split(';')[0] });
      });
    });
    req.on('error', reject); req.end(body ? JSON.stringify(body) : undefined);
  });
}

async function fixture(t, initial = false) {
  const srv = await startServer({ port: 0, host: '127.0.0.1', quiet: true,
    auth: { secureCookie: false, users: { version: 1, users: [
      { username: 'admin', passwordHash, role: 'admin', mustChangePassword: initial },
      { username: 'player', passwordHash, role: 'user', mustChangePassword: initial },
    ] } } });
  t.after(() => srv.close()); return srv;
}
const login = (srv, username = 'admin', app = true) => request(srv, '/auth/login', { app, method: 'POST', body: { username, password } });

test('App marker is exact and account resources cannot bypass the filter using encoded/static paths', () => {
  assert.equal(isAppRequest({ headers: { 'user-agent': APP_USER_AGENT } }), true);
  assert.equal(isAppRequest({ headers: { 'user-agent': 'Mozilla/5.0 ' + APP_USER_AGENT } }), true);
  for (const value of ['StrongholdProtocolApp/10', 'FakeStrongholdProtocolApp/1', 'Mozilla/5.0']) assert.equal(isAppRequest({ headers: { 'user-agent': value } }), false);
  for (const route of ['/admin/', '/account', '/%61ccount.html', '/ACCOUNT.HTML', '/js//account.js', '/css/%61ccount.css', '/js/adminTestControls.js', '/js/%61dmintestcontrols.js', '/auth/admin/users/player', '/auth/password']) assert.equal(isAccountResource(route), true, route);
  for (const route of ['/', '/login', '/js/auth.js', '/auth/session', '/auth/login', '/auth/logout', '/ws']) assert.equal(isAccountResource(route), false, route);
});

test('App admin logs in to game but cannot load account UI or use account-management APIs', async (t) => {
  const srv = await fixture(t);
  const admin = await login(srv);
  assert.equal(admin.status, 200); assert.equal(admin.data.app, true); assert.equal(admin.data.role, 'admin');
  const { cookie } = admin;
  assert.equal((await request(srv, '/', { cookie })).status, 200);
  assert.equal((await request(srv, '/js/main.js', { cookie })).status, 200);
  assert.equal((await request(srv, '/auth/session', { cookie })).data.app, true);
  for (const route of ['/admin', '/account', '/account.html', '/%61ccount.html', '/js/account.js', '/js/adminTestControls.js', '/css/account.css', '/auth/admin/users']) {
    assert.equal((await request(srv, route, { cookie })).status, 403, route);
  }
  for (const [route, method, body] of [
    ['/auth/password', 'POST', { currentPassword: password, newPassword: 'changed-mobile-password' }],
    ['/auth/admin/users', 'POST', { username: 'new-user', password }],
    ['/auth/admin/users/player', 'PATCH', { disabled: true }],
    ['/auth/admin/users/player', 'DELETE'],
  ]) assert.equal((await request(srv, route, { cookie, method, body })).status, 403);
  // The web remains fully functional; the marker selects presentation, never grants authorization.
  assert.equal((await request(srv, '/admin', { app: false, cookie })).status, 200);
  assert.equal((await request(srv, '/auth/admin/users', { app: false, cookie })).status, 200);
  assert.equal((await request(srv, '/auth/session', { app: false, cookie })).data.app, false);
  const player = await login(srv, 'player');
  assert.equal((await request(srv, '/', { cookie: player.cookie })).status, 200);
  assert.equal((await request(srv, '/auth/admin/users', { app: false, cookie: player.cookie })).status, 403);
  assert.equal((await request(srv, '/auth/logout', { cookie, method: 'POST' })).status, 200);
  assert.equal((await request(srv, '/auth/session', { cookie })).data.authenticated, false);
});

test('App initial password login directs users to web; after changing on web App login succeeds', async (t) => {
  const srv = await fixture(t, true);
  const denied = await login(srv, 'player');
  assert.equal(denied.status, 403); assert.equal(denied.data.code, 'PASSWORD_CHANGE_REQUIRED');
  assert.equal(denied.cookie, undefined);
  const web = await login(srv, 'player', false);
  assert.equal(web.status, 200); assert.equal(web.data.mustChangePassword, true);
  assert.equal((await request(srv, '/auth/password', { cookie: web.cookie, method: 'POST', body: { currentPassword: password, newPassword: 'mobile-changed-password' } })).status, 403);
  assert.equal((await request(srv, '/auth/password', { app: false, cookie: web.cookie, method: 'POST', body: { currentPassword: password, newPassword: 'mobile-changed-password' } })).status, 200);
  const loggedIn = await request(srv, '/auth/login', { method: 'POST', body: { username: 'player', password: 'mobile-changed-password' } });
  assert.equal(loggedIn.status, 200); assert.equal(loggedIn.data.app, true); assert.equal(loggedIn.data.mustChangePassword, false);
  assert.equal((await request(srv, '/', { cookie: loggedIn.cookie })).status, 200);
});

test('App login supports authenticated WebSocket room creation and logout revokes the live game connection', async (t) => {
  const srv = await fixture(t);
  const player = await login(srv, 'player');
  const client = await TestClient.connect(srv.url.replace('http:', 'ws:') + '/ws', { wsOptions: { headers: {
    Cookie: player.cookie, Origin: srv.url, 'User-Agent': APP_USER_AGENT,
  } } });
  t.after(() => client.close());
  await client.hello('AppPlayer');
  const created = await client.request({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL' });
  assert.equal(created.t, 'ok');
  const room = await client.waitFor('room.state');
  assert.match(room.code, /^[A-Z]{4}$/);
  assert.equal((await request(srv, '/auth/logout', { method: 'POST', cookie: player.cookie })).status, 200);
  assert.equal((await client.closed).code, 4003);
});

test('A pending-password session from an older client returns to App login without a redirect loop', async (t) => {
  const srv = await fixture(t, true);
  const old = await login(srv, 'admin', false);
  const root = await request(srv, '/', { cookie: old.cookie });
  assert.equal(root.headers.location, '/login?next=%2F');
  const loginPage = await request(srv, '/login', { cookie: old.cookie });
  assert.equal(loginPage.status, 200); assert.match(loginPage.text, /login-form/);
  assert.match(loginPage.headers['set-cookie'][0], /Max-Age=0/);
  assert.equal((await request(srv, '/auth/session', { cookie: old.cookie })).data.authenticated, false);
});

test('App login redirects admins and user-supplied management URLs to game; web redirects remain available', async (t) => {
  const saved = { document: globalThis.document, fetch: globalThis.fetch, location: globalThis.location };
  t.after(() => Object.assign(globalThis, saved));
  const listeners = new Map();
  const form = { elements: { username: { value: 'admin' }, password: { value: password } }, addEventListener: (name, fn) => listeners.set(name, fn) };
  const button = {}, error = {}, info = {};
  globalThis.document = { getElementById: (id) => ({ 'login-form': form, 'login-submit': button, 'login-error': error, 'login-info': info })[id] };
  let destination;
  globalThis.location = { search: '', replace: (url) => { destination = url; } };
  const { safeNext } = await import('../public/js/login.js?mobile-test');
  let response = { app: true, role: 'admin', mustChangePassword: false };
  globalThis.fetch = async () => ({ ok: true, json: async () => response });
  for (const next of ['', '?next=%2Fadmin', '?next=%2Faccount', '?next=https%3A%2F%2Fevil.test%2F']) {
    location.search = next; form.elements.password.value = password;
    await listeners.get('submit')({ preventDefault() {} }); assert.equal(destination, '/');
  }
  assert.equal(safeNext('/?room=ABCD', true), '/?room=ABCD');
  assert.equal(safeNext('/account', false), '/account');
  response = { app: false, role: 'admin', mustChangePassword: false }; location.search = '';
  await listeners.get('submit')({ preventDefault() {} }); assert.equal(destination, '/admin');
  response = { app: false, role: 'user', mustChangePassword: true };
  await listeners.get('submit')({ preventDefault() {} }); assert.equal(destination, '/account');
});

test('App game account badge has no management link; web administrators keep their link', async (t) => {
  const saved = { document: globalThis.document, fetch: globalThis.fetch, window: globalThis.window, location: globalThis.location };
  t.after(() => Object.assign(globalThis, saved));
  const { initAuth } = await import('../public/js/auth.js');
  const panels = [];
  globalThis.document = {
    createElement: (tag) => ({ tag, children: [], append(...items) { this.children.push(...items); }, addEventListener() {}, setAttribute(key, value) { this[key] = value; } }),
    body: { append: (element) => panels.push(element) }, addEventListener() {},
  };
  globalThis.window = { addEventListener() {} }; globalThis.location = { replace() {} };
  let app = true;
  globalThis.fetch = async url => ({ ok: true, json: async () => url === '/app/resource-manifest'
    ? { version: 1, art: 'a'.repeat(64), revision: 'b'.repeat(64) }
    : { enabled: true, authenticated: true, app, role: 'admin', username: 'admin', mustChangePassword: false } });
  const net = { close() {}, on() {} }, store = { get() { return {}; }, subscribe() {} };
  assert.equal(await initAuth(net, store, () => 'title'), true);
  assert.ok(!panels[0].children.some(child => child.tag === 'a'), 'App keeps all management links out of the game');
  assert.deepEqual(panels[0].children.filter(child => child.tag === 'button').map(child => child.textContent), ['从服务器更新数据', '退出登录']);
  app = false; await initAuth(net, store, () => 'title');
  assert.equal(panels[1].children[1].href, '/admin');
});

test('native Android URL policy compiles and rejects foreign origins, management URLs and unsafe server addresses', async (t) => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const compiler = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'javac.exe' : 'javac') : 'javac';
  const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
  if (spawnSync(compiler, ['-version']).status !== 0) { t.skip('JDK unavailable on PATH; set JAVA_HOME for native Android checks'); return; }
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'sp-android-policy-'));
  t.after(() => fs.rm(folder, { recursive: true, force: true }));
  const compiled = spawnSync(compiler, ['-encoding', 'UTF-8', '-d', folder,
    path.join(root, 'mobile/android/app/src/main/java/io/stronghold/protocol/ServerPolicy.java'),
    path.join(root, 'mobile/android/tests/ServerPolicyTest.java')], { encoding: 'utf8', windowsHide: true });
  assert.equal(compiled.status, 0, compiled.stderr);
  const result = spawnSync(java, ['-cp', folder, 'io.stronghold.protocol.ServerPolicyTest'], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /URL checks passed/);
  t.diagnostic(result.stdout.trim());
});
