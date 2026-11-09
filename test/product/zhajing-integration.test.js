import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {WebSocket} from 'ws';
import {Match, getZhajingData} from '../../server/modes/zhajing/Match.js';
import {VirtualScheduler} from '../../server/modes/zhajing/engine/server/match/scheduler.js';
import {applyCard, jibianCard} from '../../server/modes/zhajing/engine/server/match/choices.js';
import {hiddenEligible} from '../../server/modes/zhajing/engine/server/match/finalAssault.js';
import {buildResult} from '../../server/modes/zhajing/engine/server/match/results.js';
import {collectViolations} from '../../server/modes/zhajing/engine/server/match/invariants.js';
import {getData} from '../../server/data.js';
import {validateC2S} from '../../shared/protocol.js';
import {ZHAJING_VARIANT} from '../../shared/zhajing-constants.js';
import {store} from '../../public/js/store.js';
import {createDataStore} from '../../public/js/data.js';
import {zjBondView} from '../../shared/zhajing-bonds.js';
import {pieceTile, tileSlot} from '../../public/js/render/drag.js';
import {productFixture, login} from './fixture.js';
import {makeBattle, enemyRec} from '../helpers/zhajingBattleHarness.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {PROTOCOL_VERSION} from '../../shared/constants.js';
import {RESOURCE_CONTRACT, CLIENT_LINE, CLIENT_BUILD, RESOURCE_EPOCH} from '../../shared/client-resources.js';

const quiet = {info() {}, debug() {}, warn() {}, error() {}};
test('炸惊界面显示生效的盟约覆盖值，普通数据存储保留原文', async () => {
  const raw = getZhajingData().bonds;
  const mode = createDataStore({fetch: async () => new Response(JSON.stringify(raw)), transformJson: (name, value) => name === 'bonds' ? zjBondView(value) : value});
  const normal = createDataStore({fetch: async () => new Response(JSON.stringify(raw))});
  await Promise.all([mode.load('bonds'), normal.load('bonds')]);
  for (const [id, rec] of Object.entries(raw)) if (rec.zj) {
    assert.deepEqual(mode.lookup('bonds', id), zjBondView(raw)[id]);
    assert.deepEqual(normal.lookup('bonds', id), rec);
  }
});
function fixture(humans = 1) {
  const scheduler = new VirtualScheduler(), frames = [];
  const match = new Match({scheduler, mode: humans === 1 ? 'solo' : 'coop', seed: 18345,
    seats: Array.from({length: humans}, (_, seat) => ({seat, playerId: 'p' + seat, name: '博士' + seat, connected: true, isBot: false})),
    send: (id, frame) => frames.push({id, frame}), broadcast: frame => frames.push({frame}), onEnd() {}, botRehearsal: 0, log: quiet});
  return {match, scheduler, frames, ps: match.order[0]};
}
function draft(f) {
  const m = f.match; m.start();
  for (const p of m.order) assert.deepEqual(m.handle(p.playerId, {t: 'g.zhajing', intent: {t: 'g.infoReady'}}), {ok: true});
  f.scheduler.runUntil(() => m.phase === 'BAND_DRAFT', {maxSteps: 100});
  while (m.phase === 'BAND_DRAFT') {
    const pid = m.draftTurn();
    if (!pid) {f.scheduler.runNext(); continue;}
    assert.deepEqual(m.handle(pid, {t: 'g.band', bandId: m.defaultBand(m.players.get(pid))}), {ok: true});
  }
  f.scheduler.runUntil(() => m.phase === 'SP_DRAFT', {maxSteps: 100});
  assert.equal(m.phase, 'SP_DRAFT');
}

test('炸惊数据、协议、普通规则和二十格点击坐标相互隔离', t => {
  const f = fixture(); t.after(() => f.match.dispose());
  assert.equal(getData().config.modes.mode_single_zhajing, undefined);
  assert.equal(f.ps.hand.length, 20); assert.equal(f.match.gd.income(1), 9);
  assert.equal(f.ps.temp.length, 5);
  assert.deepEqual(collectViolations(f.match), []);
  assert.equal(f.match.gd.jibian().pool.length, 99); assert.equal(f.match.gd.enemyJibian().pool.length, 21);
  assert.equal(validateC2S({t: 'room.create', mode: 'coop', difficulty: 'ZHAJING', variant: ZHAJING_VARIANT, capacity: 4}), null);
  assert.ok(validateC2S({t: 'room.create', mode: 'coop', difficulty: 'ZHAJING'}));
  assert.ok(validateC2S({t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: ZHAJING_VARIANT}));
  assert.ok(validateC2S({t: 'room.create', mode: 'coop', difficulty: 'NORMAL', capacity: 4}));
  const before = store.get(); t.after(() => store.set(before));
  store.set({room: {variant: ZHAJING_VARIANT}});
  const positions = new Set();
  for (const area of ['hand', 'temp']) for (let idx = 0; idx < (area === 'hand' ? 20 : 6); idx++) {
    const tile = pieceTile({area, idx}); assert.deepEqual(tileSlot(tile), {area, idx});
    assert.ok(!positions.has(JSON.stringify(tile))); positions.add(JSON.stringify(tile));
  }
  store.set({room: {mode: 'solo'}});
  assert.deepEqual(pieceTile({area: 'hand', idx: 9}), {row: 7, col: 9});
});

for (const humans of [1, 4]) test(`${humans} 人实际引擎：简报、策略、敌方惊变、个人刷新选择、重连到整备`, t => {
  const f = fixture(humans); t.after(() => f.match.dispose()); draft(f);
  const m = f.match;
  assert.equal(m.enemyJibianCards.length, 1);
  const other = humans > 1 ? JSON.stringify(m.order[1].privateView().sp.cards) : null;
  assert.deepEqual(m.handle('p0', {t: 'g.zhajing', intent: {t: 'g.spReroll', idx: 0}}), {ok: true});
  assert.ok(m.handle('p0', {t: 'g.zhajing', intent: {t: 'g.spReroll', idx: 0}}).error);
  if (other) assert.equal(JSON.stringify(m.order[1].privateView().sp.cards), other);
  for (const p of m.order) assert.deepEqual(m.handle(p.playerId, {t: 'g.zhajing', intent: {t: 'g.choice', idx: 0}}), {ok: true});
  f.scheduler.runUntil(() => m.phase === 'PREP', {maxSteps: 100}); assert.equal(m.phase, 'PREP');
  assert.equal(f.ps.privateView().sp, null); assert.ok(f.ps.funds >= 9);
  assert.deepEqual(collectViolations(m), []);
  m.onReconnect('p0'); assert.ok(f.frames.some(x => x.id === 'p0' && x.frame.t === 'm.private'));
  assert.ok(m.handle('p0', {t: 'g.zhajing', intent: {t: 'g.test'}}).error);
  assert.ok(m.handle('p0', {t: 'g.zhajing', intent: {t: 'g.choice', idx: 0}}).error);
});

test('99 张惊变逐张通过真实获得入口，未发生规则回调错误', () => {
  const specs = getZhajingData().config.modes.mode_single_zhajing.jibian.pool;
  for (const spec of specs) {
    const f = fixture();
    try {
      f.match.startRound(1); f.match.phase = 'PREP';
      applyCard(f.match, f.ps, jibianCard(f.match.gd, spec));
      assert.equal(f.match.errorCount, 0, spec.effectId || spec.id);
      assert.equal(f.match.dispatcher.errors, 0, spec.effectId || spec.id);
    } finally {f.match.dispose();}
  }
});

test('经济、锻造单次消费和隐秘核心解锁边界', t => {
  const f = fixture(); t.after(() => f.match.dispose());
  f.match.startRound(1); f.match.phase = 'PREP';
  f.ps.funds = 10; f.ps.startRound(2); assert.equal(f.ps.funds, 22);
  f.ps.grantForge(1); const roll = f.ps.privateView().forge.rolled;
  assert.equal(roll.picks.length, 3); assert.equal(new Set(roll.picks).size, 3);
  assert.deepEqual(f.ps.forgeTake(roll.picks[0], roll.rarity), {ok: true});
  assert.ok(f.ps.forgeTake(roll.picks[0], roll.rarity).error);
  assert.equal(hiddenEligible(f.match.gd, {layerSum: 350, teamLp: 2}), false);
  assert.equal(hiddenEligible(f.match.gd, {layerSum: 351, teamLp: 1}), false);
  assert.equal(hiddenEligible(f.match.gd, {layerSum: 351, teamLp: 2}), true);
  const coop = fixture(4); t.after(() => coop.match.dispose());
  assert.equal(hiddenEligible(coop.match.gd, {layerSum: 1200, teamLp: 2}), false);
  assert.equal(hiddenEligible(coop.match.gd, {layerSum: 1201, teamLp: 2}), true);
  const summary = buildResult(f.match, 'forced');
  assert.equal(summary.difficulty, 'ZHAJING');
});

test('敌人法抗配置通过实际出生路径生效：加20，上限70；无模式修正时不变', t => {
  const f = fixture(); t.after(() => f.match.dispose());
  for (const [res, expected] of [[0,20],[40,60],[60,70],[90,70]]) {
    const rec = enemyRec({key:'res_audit',hp:10000,res,speed:0});
    const fight = mods => {const h=makeBattle({defs:{enemies:{res_audit:rec}},enemies:[{key:'res_audit',mods}],modeId:'mode_single_zhajing',content:'none'});h.step();return h.enemies()[0].s.res;};
    assert.equal(fight(f.match.gd.enemyScale(1)),expected);
    assert.equal(fight({}),res);
  }
});

test('正式产品服务 HTTP/WS：创建、人数、开局、资源、关闭、重连与普通局隔离', async t => {
  const f = await productFixture(); let server;
  t.after(async () => {await server?.close(); await f.close();});
  const directory = path.join(f.dir, 'resources'), resourceHash = '1'.repeat(64);
  const policy = await writeInitialPolicy({format: 1, contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH,
    files: [{path: '/assets/a.bin', sha256: '2'.repeat(64), size: 1, mime: 'application/octet-stream'}]}, directory);
  await fs.writeFile(path.join(directory, 'client.json'), JSON.stringify({...policy, resourceHash}));
  server = await startProductServer({root: f.project, env: f.env, port: 0, host: '127.0.0.1', resourceDirectory: directory, publicKey: 'fixture', log: quiet});
  const base = `http://127.0.0.1:${server.port}`, admin = await login(base), member = await login(base, 'member');
  const ua = `Fixture StrongholdProtocolApp/${RESOURCE_CONTRACT} Resources/${resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/${RESOURCE_EPOCH}`;
  async function socket(cookie) {
    const ws = new WebSocket(base.replace('http:', 'ws:') + '/ws', {headers: {Origin: base, Cookie: cookie, 'User-Agent': ua}});
    t.after(() => ws.terminate()); let rid = 0; const pending = new Map(), frames = [];
    ws.on('message', bytes => {const msg = JSON.parse(bytes); frames.push(msg); pending.get(msg.rid)?.(msg);});
    await new Promise((resolve, reject) => {ws.once('open', resolve); ws.once('error', reject);});
    const request = msg => new Promise((resolve, reject) => {
      const id = ++rid, timer = setTimeout(() => {pending.delete(id); reject(Error('timeout ' + msg.t));}, 6000);
      pending.set(id, reply => {clearTimeout(timer); pending.delete(id); resolve(reply);}); ws.send(JSON.stringify({...msg, rid: id}));
    });
    assert.equal((await request({t: 'hello', name: '接入验证', version: PROTOCOL_VERSION})).t, 'welcome');
    return {request, frames};
  }
  const a = await socket(admin.cookie), b = await socket(member.cookie);
  const create = {t: 'room.create', mode: 'coop', difficulty: 'ZHAJING', variant: ZHAJING_VARIANT, capacity: 2};
  assert.equal((await a.request(create)).t, 'ok');
  const room = [...server.lobby.rooms.values()][0];
  assert.equal(room.seats.length, 2); assert.equal(room.difficulty, 'ZHAJING');
  assert.equal((await a.request({t: 'room.setRanked', on: true})).t, 'error');
  assert.equal((await a.request({t: 'room.proposeVersion', version: '0.2.0'})).t, 'error');
  assert.equal((await b.request({t: 'room.join', code: room.code})).t, 'ok');
  assert.equal((await b.request({t: 'room.ready', ready: true})).t, 'ok');
  assert.equal((await a.request({t: 'room.start'})).t, 'ok');
  assert.equal(room.match.variant, ZHAJING_VARIANT);
  assert.equal(room.productRecordId, undefined, '不写入排位或普通战绩');
  assert.equal((await a.request({t: 'g.zhajing', intent: {t: 'g.infoReady'}})).t, 'ok');
  assert.equal((await b.request({t: 'g.zhajing', intent: {t: 'g.infoReady'}})).t, 'ok');
  room.match.onReconnect(room.hostId);
  const headers = {Cookie: admin.cookie, 'User-Agent': ua};
  for (const url of ['/data/zhajing/config.json', '/zhajing/server/sim/spec.js', '/zhajing/shared/constants.js', '/zhajing/server/data.js']) {
    const response = await fetch(base + url, {headers}); assert.equal(response.status, 200, url); await response.arrayBuffer();
  }
  for (const url of ['/zhajing/server/match/Match.js', '/zhajing/server/sim/nodedata.js']) assert.equal((await fetch(base + url, {headers})).status, 404, url);
  await server.product.modes.update({revision: server.product.modes.doc.revision, modes: [{id: ZHAJING_VARIANT, enabled: false}]}, 'admin');
  assert.ok(room.match); assert.equal((await b.request(create)).code, 'MODE_CLOSED');
  await a.request({t: 'g.leave'}); await b.request({t: 'g.leave'});
  assert.equal((await a.request({t: 'room.create', mode: 'solo', difficulty: 'NORMAL'})).t, 'ok');
  assert.equal((await a.request({t: 'g.zhajing', intent: {t: 'g.infoReady'}})).t, 'error');
});
