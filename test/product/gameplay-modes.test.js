import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {WebSocket} from 'ws';
import {ProductModePolicy} from '../../server/product/mode-policy.js';
import {productFixture, login} from './fixture.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {StubMatch} from '../../server/match/StubMatch.js';
import {CYCLOPS_VARIANT, PROTOCOL_VERSION} from '../../shared/constants.js';
import {RESOURCE_CONTRACT, CLIENT_LINE, CLIENT_BUILD, RESOURCE_EPOCH} from '../../shared/client-resources.js';

const resourceHash = '1'.repeat(64);
const ua = `Fixture StrongholdProtocolApp/${RESOURCE_CONTRACT} Resources/${resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/${RESOURCE_EPOCH}`;
const quiet = {info() {}, debug() {}, warn() {}, error() {}};
const update = (p, enabled) => ({revision: p.doc.revision, modes: [{id: CYCLOPS_VARIANT, enabled}]});

test('玩法策略保留现有开放状态、原子保存、审计与未知字段，重启恢复关闭设置', async t => {
  const f = await productFixture(); t.after(() => f.close());
  const policy = await ProductModePolicy.load(f.state);
  assert.equal(policy.permits(CYCLOPS_VARIANT), true);
  assert.equal(policy.permits('unknown'), false);
  policy.doc.future = {keep: true}; policy.doc.modes.futureMode = {enabled: false, keep: 1};
  const view = policy.view(); view.modes[0].enabled = false;
  assert.equal(policy.permits(CYCLOPS_VARIANT), true);
  await policy.update(update(policy, false), 'admin');
  const reopened = await ProductModePolicy.load(f.state);
  assert.equal(reopened.permits(CYCLOPS_VARIANT), false);
  assert.deepEqual(reopened.doc.future, {keep: true});
  assert.deepEqual(reopened.doc.modes.futureMode, {enabled: false, keep: 1});
  assert.deepEqual(reopened.doc.audit.at(-1).modes, [{id: CYCLOPS_VARIANT, enabled: false}]);
  await assert.rejects(() => reopened.update({revision: 0, modes: [{id: CYCLOPS_VARIANT, enabled: true}]}, 'admin'), {status: 409});
  const revision = reopened.doc.revision;
  for (const modes of [[{id: 'unknown', enabled: true}], [{id: CYCLOPS_VARIANT, enabled: 'false'}], [{id: CYCLOPS_VARIANT, enabled: true}, {id: CYCLOPS_VARIANT, enabled: false}], []])
    await assert.rejects(() => reopened.update({revision, modes}, 'admin'), {status: 400});
  assert.equal(reopened.doc.revision, revision);
  await fs.writeFile(reopened.filename, '{broken');
  await assert.rejects(() => ProductModePolicy.load(f.state));
  assert.equal(await fs.readFile(reopened.filename, 'utf8'), '{broken');
});

test('并发保存只接受当前修订；写盘失败或排队时权限撤销不改变生效策略', async t => {
  const f = await productFixture(); t.after(() => f.close());
  const policy = await ProductModePolicy.load(f.state);
  const result = await Promise.allSettled([policy.update(update(policy, false), 'admin'), policy.update(update(policy, true), 'admin')]);
  assert.equal(result[0].status, 'fulfilled'); assert.equal(result[1].status, 'rejected');
  assert.equal(result[1].reason.status, 409);
  await assert.rejects(() => policy.update(update(policy, true), 'admin', () => {throw Object.assign(Error('revoked'), {status: 403});}), {status: 403});
  assert.equal(policy.permits(CYCLOPS_VARIANT), false);
  const file = policy.filename;
  policy.filename = path.join(file, 'not-a-file.json');
  await assert.rejects(() => policy.update(update(policy, true), 'admin'));
  assert.equal(policy.permits(CYCLOPS_VARIANT), false);
  assert.equal((await ProductModePolicy.load(f.state)).permits(CYCLOPS_VARIANT), false);
});

test('管理员开放API权限/来源/修订校验，关闭后真实WS无法绕过创建/加入/开局，现有对局保留', async t => {
  const f = await productFixture(); let server;
  t.after(async () => {await server?.close(); await f.close();});
  const directory = path.join(f.dir, 'resources');
  const policy = await writeInitialPolicy({format: 1, contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH,
    files: [{path: '/assets/a.bin', sha256: '2'.repeat(64), size: 1, mime: 'application/octet-stream'}]}, directory);
  await fs.writeFile(path.join(directory, 'client.json'), JSON.stringify({...policy, resourceHash}));
  server = await startProductServer({root: f.project, env: f.env, port: 0, host: '127.0.0.1', resourceDirectory: directory, publicKey: 'fixture', MatchClass: StubMatch, log: quiet});
  const base = `http://127.0.0.1:${server.port}`, admin = await login(base), member = await login(base, 'member');
  const req = (cookie, method = 'GET', body, headers = {}) => fetch(base + '/auth/admin/gameplay-modes', {method,
    headers: {Cookie: cookie, Origin: base, 'Content-Type': 'application/json', ...headers}, ...(body ? {body: JSON.stringify(body)} : {})});
  assert.equal((await req('')).status, 401);
  assert.equal((await req(member.cookie)).status, 403);
  assert.equal((await req(admin.cookie, 'GET', null, {'User-Agent': ua})).status, 403);
  assert.equal((await req(admin.cookie, 'PUT', update(server.product.modes, false), {Origin: 'https://other.invalid'})).status, 403);
  assert.equal((await req(admin.cookie, 'PUT', update(server.product.modes, false), {'Content-Type': 'text/plain'})).status, 415);
  assert.equal((await req(admin.cookie, 'PUT', {revision: 99, modes: [{id: CYCLOPS_VARIANT, enabled: false}]})).status, 409);
  assert.equal((await req(admin.cookie)).status, 200);
  async function socket(cookie) {
    const ws = new WebSocket(base.replace('http:', 'ws:') + '/ws', {headers: {Origin: base, Cookie: cookie, 'User-Agent': ua}});
    t.after(() => ws.terminate()); let rid = 0; const pending = new Map();
    ws.on('message', bytes => {const msg = JSON.parse(bytes); pending.get(msg.rid)?.(msg);});
    await new Promise((resolve, reject) => {ws.once('open', resolve); ws.once('error', reject);});
    const request = msg => new Promise((resolve, reject) => {
      const id = ++rid, timer = setTimeout(() => {pending.delete(id); reject(Error('request timeout'));}, 6000);
      pending.set(id, reply => {clearTimeout(timer); pending.delete(id); resolve(reply);}); ws.send(JSON.stringify({...msg, rid: id}));
    });
    await request({t: 'hello', name: '开放测试', version: PROTOCOL_VERSION}); return request;
  }
  const a = await socket(admin.cookie), b = await socket(member.cookie);
  const create = {t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: CYCLOPS_VARIANT};
  assert.equal((await a(create)).t, 'ok');
  const room = [...server.lobby.rooms.values()][0];
  assert.equal((await req(admin.cookie, 'PUT', update(server.product.modes, false))).status, 200);
  const closed = await b(create); assert.equal(closed.t, 'error'); assert.equal(closed.code, 'MODE_CLOSED');
  assert.equal((await a(create)).t, 'error', '管理员游戏连接也不绕过关闭');
  assert.equal((await b({t: 'room.join', code: room.code})).t, 'error');
  assert.equal((await a({t: 'room.start'})).t, 'error'); assert.equal(room.match, null);
  assert.equal(server.product.currentRooms(null).find(r => r.code === room.code).canJoin, false);
  const catalog = await fetch(base + '/product/modes', {headers: {Cookie: member.cookie, 'User-Agent': ua}}).then(r => r.json());
  assert.equal(catalog.modes.find(mode => mode.id === CYCLOPS_VARIANT).enabled, false);
  assert.equal((await req(admin.cookie, 'PUT', update(server.product.modes, true))).status, 200);
  assert.equal((await b({t: 'room.join', code: room.code})).t, 'ok');
  assert.equal((await b({t: 'room.ready', ready: true})).t, 'ok');
  assert.equal((await a({t: 'room.start'})).t, 'ok'); const match = room.match;
  await req(admin.cookie, 'PUT', update(server.product.modes, false));
  assert.equal(room.match, match, '关闭不销毁已开始对局');
  assert.equal((await ProductModePolicy.load(f.state)).permits(CYCLOPS_VARIANT), false);
  await a({t: 'g.leave'}); await b({t: 'g.leave'});
  assert.equal((await a({t: 'room.create', mode: 'solo', difficulty: 'NORMAL'})).t, 'ok', '普通模式不受关闭影响');
});
