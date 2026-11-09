import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { productFixture, login } from './fixture.js';
import { startProductServer } from '../../server/product/game-server.js';
import { MIZUKI_VARIANT } from '../../shared/mizuki-constants.js';
import { CLIENT_LINE, CLIENT_BUILD } from '../../shared/client-resources.js';
import { PROTOCOL_VERSION } from '../../shared/constants.js';
import { MizukiStore } from '../../server/product/mizuki/store.js';
import { MizukiAdmin } from '../../server/product/mizuki/admin.js';

async function fixture(t) {
  const f = await productFixture();
  const server = await startProductServer({ root: f.project, env: f.env, port: 0, host: '127.0.0.1', log: { info() {}, warn() {}, debug() {}, error() {} } });
  const url = server.url, admin = await login(url), member = await login(url, 'member'), sockets = [];
  t.after(async () => { for (const ws of sockets) ws.terminate(); await server.close(); await f.close(); });
  server.product.modes.doc.modes[MIZUKI_VARIANT].enabled = true;
  const policy = await fetch(url + '/product/client.json').then(r => r.json());
  const ua = `StrongholdProtocolApp/2 Resources/${policy.resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/1`;
  const control = async (body = null, { cookie = admin.cookie, origin = url, userAgent = '', method = body ? 'POST' : 'GET' } = {}) => {
    const response = await fetch(url + '/auth/admin/mizuki-control', { method,
      headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json', 'User-Agent': userAgent }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  async function connect(username) {
    const auth = await login(url, username, { 'User-Agent': ua });
    assert.equal(auth.status, 200);
    const ws = new WebSocket(url.replace('http:', 'ws:') + '/ws', { headers: { Origin: url, Cookie: auth.cookie, 'User-Agent': ua } }); sockets.push(ws);
    const messages = [], listeners = new Set();
    ws.on('message', bytes => { messages.push(JSON.parse(bytes)); for (const fn of listeners) fn(); });
    const wait = predicate => new Promise((resolve, reject) => {
      const timer = setTimeout(() => { listeners.delete(check); reject(Error('WS timeout: ' + JSON.stringify(messages).slice(0, 1000))); }, 10000);
      function check() { const i = messages.findIndex(predicate); if (i < 0) return; clearTimeout(timer); listeners.delete(check); resolve(messages.splice(i, 1)[0]); }
      listeners.add(check); check();
    });
    await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
    let rid = 0;
    const request = async message => { const id = ++rid; ws.send(JSON.stringify({ ...message, rid: id })); return wait(m => m.rid === id); };
    const welcome = await request({ t: 'hello', version: PROTOCOL_VERSION, name: username });
    return { request, wait, playerId: welcome.playerId };
  }
  return { ...f, ...server, control, connect, ua, admin, member };
}
const eventually = async predicate => { const until = Date.now() + 10000; while (!predicate()) { if (Date.now() > until) assert.fail('condition timeout'); await new Promise(r => setTimeout(r, 30)); } };

test('Mizuki management refuses non-admin/native/cross-origin/invalid requests without mutation', async t => {
  const f = await fixture(t);
  assert.equal((await f.control()).status, 200);
  assert.equal((await f.control(null, { cookie: '' })).status, 401);
  assert.equal((await f.control(null, { cookie: f.member.cookie })).status, 403);
  assert.equal((await f.control(null, { userAgent: f.ua })).status, 403);
  assert.equal((await f.control({ action: 'resetAccount' }, { origin: 'https://elsewhere.example' })).status, 403);
  assert.equal((await f.control({ action: 'unknown', reason: 'test' })).status, 400);
  assert.equal((await f.control({ action: 'resetAccount', reason: '' })).status, 400);
  assert.equal((await f.control(null, { method: 'DELETE' })).status, 405);
  assert.equal(f.product.mizuki.db.prepare('SELECT COUNT(*) n FROM admin_audit').get().n, 0);
});

test('Mizuki full capacity is required before creating a run, and shrinking to one permits start', async t => {
  const f = await fixture(t), host = await f.connect('member');
  assert.notEqual((await host.request({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity: 2 })).t, 'error');
  const before = await host.request({ t: 'room.start' });
  assert.equal(before.t, 'error'); assert.match(before.detail, /满员/);
  assert.equal(f.product.mizuki.active(f.users[1].accountId), null); assert.equal(f.product.mizukiHosts.hosts.size, 0);
  await host.request({ t: 'room.setCapacity', capacity: 1 });
  assert.notEqual((await host.request({ t: 'room.start' })).t, 'error');
  await eventually(() => f.product.mizuki.active(f.users[1].accountId)?.seq > 0);
});

test('admin closes a real worker room, preserves checkpoint, rejects stale tokens, and deletes saved run', async t => {
  const f = await fixture(t), host = await f.connect('member');
  await host.request({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity: 1 });
  const waiting = (await f.control()).body.rooms[0];
  await host.request({ t: 'room.start' });
  await eventually(() => f.product.mizuki.active(f.users[1].accountId)?.seq > 0);
  const run = f.product.mizuki.active(f.users[1].accountId);
  assert.equal((await f.control({ action: 'closeRoom', roomCode: waiting.code, runId: waiting.runId, token: waiting.token, confirm: waiting.code, reason: 'stale preview' })).status, 409);
  const room = (await f.control()).body.rooms[0];
  assert.equal((await f.control({ action: 'closeRoom', roomCode: room.code, runId: room.runId, token: room.token, confirm: room.code, reason: '卡住分队' })).status, 200);
  await host.wait(m => m.t === 'room.closed');
  assert.equal(f.product.mizukiHosts.hosts.size, 0); assert.equal(f.lobby.rooms.has(room.code), false);
  assert.equal(f.product.mizuki.get(run.id).status, 'suspended'); assert.ok(f.product.mizuki.get(run.id).checkpoint);
  assert.throws(() => f.product.mizuki.commit(run.id, { epoch: run.epoch, seq: run.seq + 1 }), /失去操作资格/);
  const saved = f.product.mizuki.get(run.id);
  assert.equal((await f.control({ action: 'deleteRun', runId: run.id, epoch: saved.epoch, confirm: 'wrong', reason: '清理卡局' })).status, 409);
  assert.equal((await f.control({ action: 'deleteRun', runId: run.id, epoch: saved.epoch, confirm: run.id, reason: '清理卡局' })).status, 200);
  assert.equal(f.product.mizuki.get(run.id), null); assert.equal(f.product.mizuki.active(f.users[1].accountId), null);
  assert.equal((await f.control()).body.audit.length, 2);
});

test('admin deleting a running shared exploration releases every member and cannot resurrect from queued worker writes', async t => {
  const f = await fixture(t), host = await f.connect('member'), guest = await f.connect('admin');
  await host.request({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity: 2 });
  const room = [...f.lobby.rooms.values()][0];
  await guest.request({ t: 'room.join', code: room.code });
  await guest.request({ t: 'room.ready', ready: true });
  assert.notEqual((await host.request({ t: 'room.start' })).t, 'error');
  await eventually(() => f.product.mizuki.active(f.users[1].accountId)?.seq > 0);
  const run = f.product.mizuki.active(f.users[1].accountId);
  assert.equal((await f.control({ action: 'deleteRun', runId: run.id, epoch: run.epoch, confirm: run.id, reason: '删除多人卡局' })).status, 200);
  await Promise.all([host.wait(m => m.t === 'room.closed'), guest.wait(m => m.t === 'room.closed')]);
  assert.equal(f.product.mizukiHosts.hosts.size, 0);
  for (const user of f.users.slice(0, 2)) assert.equal(f.product.mizuki.active(user.accountId), null);
  assert.throws(() => f.product.mizuki.commit(run.id, { epoch: run.epoch, seq: run.seq + 1 }), /失去操作资格/);
  await new Promise(r => setTimeout(r, 100)); assert.equal(f.product.mizuki.get(run.id), null);
  assert.notEqual((await host.request({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity: 1 })).t, 'error');
});

test('reset deletes all target Mizuki data including shared histories, keeps other profiles and records durable audit', t => {
  const store = new MizukiStore(':memory:'); t.after(() => store.close());
  const users = new Map([['member', { accountId: 'a', username: 'member' }], ['other', { accountId: 'b', username: 'other' }]]);
  const admin = new MizukiAdmin({ mizuki: store, auth: { users } });
  const run = store.begin({ seats: [{ playerId: 'p', seat: 0 }, { playerId: 'q', seat: 1 }], seed: 1 }, new Map([['p', 'a'], ['q', 'b']]));
  store.commit(run.id, { epoch: 1, seq: 1, banks: { p: { current: 0, record: 0, totalPut: 0 }, q: { current: 0, record: 0, totalPut: 0 } },
    summary: { matchId: run.id, variant: MIZUKI_VARIANT, ranked: false, players: ['p', 'q'].map(playerId => ({ playerId, mizuki: { explorationScore: 12, cellPoints: 3 } })) } });
  assert.equal(store.history('a').length, 1); assert.equal(store.history('b').length, 1);
  const body = { action: 'resetAccount', accountId: 'a', confirm: 'member', reason: '清空进度', token: admin.plan('a').token };
  assert.throws(() => admin.execute({ ...body, token: 'stale' }, 'root'), /已变化/);
  admin.execute(body, 'root');
  assert.equal(store.get(run.id), null); assert.equal(store.active('a'), null); assert.equal(store.active('b'), null);
  assert.equal(store.profile('a').score, 0); assert.equal(store.profile('b').score, 12);
  assert.deepEqual(store.history('a'), []); assert.deepEqual(store.history('b'), []);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM ledger').get().n, 0); assert.equal(store.db.prepare('SELECT COUNT(*) n FROM outbox').get().n, 0);
  assert.equal(store.db.prepare('PRAGMA foreign_key_check').all().length, 0);
  const event = JSON.parse(store.db.prepare('SELECT doc FROM admin_audit').get().doc);
  assert.equal(event.actor, 'root'); assert.equal(event.reason, '清空进度'); assert.deepEqual(event.affectedAccounts.sort(), ['a', 'b']);
});

test('failed admin deletion rolls back all run data, profile reset and audit together', t => {
  const store = new MizukiStore(':memory:'); t.after(() => store.close());
  const run = store.begin({ seats: [{ playerId: 'p', seat: 0 }], seed: 1 }, new Map([['p', 'a']]));
  store.saveProfile('a', { ...store.profile('a'), score: 11 });
  store.db.exec("CREATE TRIGGER reject_admin_delete BEFORE DELETE ON runs BEGIN SELECT RAISE(ABORT, 'fixture reject'); END;");
  assert.throws(() => store.adminDelete({ runIds: [run.id], accountId: 'a', actor: 'root', action: 'resetAccount', reason: 'test rollback' }), /fixture reject/);
  assert.equal(store.get(run.id).participants.length, 1); assert.equal(store.active('a').id, run.id);
  assert.equal(store.profile('a').score, 11); assert.equal(store.db.prepare('SELECT COUNT(*) n FROM admin_audit').get().n, 0);
});
