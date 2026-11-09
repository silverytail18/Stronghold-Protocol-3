import test from 'node:test';
import assert from 'node:assert/strict';
import {Match, getZhajingData} from '../../server/modes/zhajing/Match.js';
import {VirtualScheduler} from '../../server/modes/zhajing/engine/server/match/scheduler.js';
import * as spec from '../../server/modes/zhajing/engine/server/sim/spec.js';
import {DataSource} from '../../server/modes/zhajing/engine/server/sim/simdata.js';
import {createModeBattleRunner} from '../../public/js/battle/runner.js';
import {createStore, initialState} from '../../public/js/store.js';
import {settledRoundCost, battleResultBox, phaseBanner} from '../../public/js/ui/gameLogic/phases.js';
import {phasePopupOf} from '../../public/js/ui/matchPopups.js';
import {unitInfo} from '../../server/modes/zhajing/engine/server/sim/snapshot.js';
import {makeBattle, enemyRec} from '../helpers/zhajingBattleHarness.js';
import {MujicaNoteSystem} from '../../public/js/render/fx/mujicaNotes.js';
import {charPotentialChanges} from '../../server/modes/zhajing/engine/shared/protocol.js';

function fixture(t, count = 1) {
  const frames = [], scheduler = new VirtualScheduler();
  const match = new Match({mode: count === 1 ? 'solo' : 'coop', scheduler, seed: 19931,
    seats: Array.from({length: count}, (_, seat) => ({seat, playerId: 'p' + seat, name: '博士' + seat,
      connected: true, presentation: {avatar: 'avatar', frame: 'frame', namecard: 'namecard'}})),
    send: (id, msg) => frames.push({id, ...msg}), broadcast: msg => frames.push(msg), onEnd() {},
    log: {error() {}, warn() {}, info() {}, debug() {}}, botRehearsal: 0});
  t.after(() => match.dispose());
  return {match, frames, scheduler, ps: match.order[0], intent: (intent, pid = 'p0') => match.handle(pid, {t: 'g.zhajing', intent})};
}

test('炸惊聊天：合法封装、纯文本、200字、2秒冷却、50条历史及重连；旁观者不能发送', t => {
  const f = fixture(t);
  assert.deepEqual(f.intent({t: 'g.chat', text: '  <b>你好</b>\n世界  '}), {ok: true});
  const msg = f.frames.find(x => x.t === 'm.chat');
  assert.equal(msg.text, '<b>你好</b> 世界'); assert.equal(msg.playerId, 'p0');
  assert.equal(msg.frame, 'frame'); assert.equal(msg.namecard, 'namecard');
  assert.equal(f.intent({t: 'g.chat', text: '过快'}).error, 'RATE');
  f.scheduler.advance(2000);
  assert.equal(f.intent({t: 'g.chat', text: '字'.repeat(201)}).error, 'BAD_MSG');
  assert.equal(f.intent({t: 'g.chat', text: ' \n '}).error, 'BAD_MSG');
  for (let i = 0; i < 55; i++) { assert.deepEqual(f.intent({t: 'g.chat', text: String(i)}), {ok: true}); f.scheduler.advance(2000); }
  f.match.onReconnect('p0');
  const history = f.frames.filter(x => x.t === 'm.chatHistory').at(-1);
  assert.equal(history.messages.length, 50); assert.equal(history.messages[0].text, '5');
  assert.equal(history.messages.at(-1).text, '54');
  f.match.addObserver('watcher');
  assert.equal(f.intent({t: 'g.chat', text: '禁止'}, 'watcher').error, 'SPECTATOR');
  assert.equal(f.intent({t: 'g.chat', text: '禁止'}, 'unknown').error, 'NOT_IN_ROOM');
});

test('炸惊表情使用产品自定义目录校验和冷却，拒绝目录外ID', t => {
  const f = fixture(t), id = 'pack.runtime.1';
  f.match.isPackEmote = value => value === id;
  assert.deepEqual(f.intent({t: 'g.emote', id}), {ok: true});
  assert.ok(f.frames.some(x => x.t === 'm.emote' && x.id === id));
  assert.equal(f.intent({t: 'g.emote', id}).error, 'RATE');
  f.scheduler.advance(3000);
  assert.equal(f.intent({t: 'g.emote', id: 'pack.runtime.2'}).error, 'BAD_MSG');
  assert.equal(f.intent({t: 'g.emote', id: 'arbitrary'}).error, 'BAD_MSG');
});

test('局外char皮肤在炸惊手牌、备战、战斗输入和模拟快照一致，切换及清除不污染账号格式', t => {
  const f = fixture(t), m = f.match, ps = f.ps;
  const char = 'char_1035_wisdel', skin = char + '@game#9';
  m.startRound(1); m.phase = 'PREP';
  m.setSkins('p0', {['char:' + char]: skin});
  const piece = ps.acquireChess('chess_zj_37_a', {fromPool: false}); assert.ok(piece?.uid);
  assert.equal(ps.pieceView(piece).skin, skin);
  let placed = false;
  for (let r = 9; r <= 12 && !placed; r++) for (let c = 2; c <= 10 && !placed; c++) placed = ps.move(piece.uid, {area: 'board', row: r, col: c}, 'RIGHT').ok === true;
  assert.ok(placed);
  assert.equal(ps.privateView().board.find(p => p.uid === piece.uid).skin, skin);
  assert.equal(ps.battleInput().units.find(p => p.uid === piece.uid).skin, skin);
  const battle = m._normalBattle(ps); battle.start();
  assert.equal(unitInfo(battle.allyUnits.find(u => u.uid === piece.uid)).skin, skin);
  m.setSkins('p0', {});
  assert.equal(ps.pieceView(piece).skin, undefined);
  assert.equal(ps.battleInput().units.find(p => p.uid === piece.uid).skin, undefined);
});

for (const count of [1, 2, 4]) test(`${count}人全员漏怪：13→11直接结算，无空联防；旧漏怪峰值4不影响−2`, t => {
  const f = fixture(t, count), m = f.match;
  m.startRound(1); m.phase = 'COMBAT';
  for (const ps of m.order) { ps.lp = 13; m.lastResults.set(ps.playerId, {leaked: [{counted: true}, {counted: true}], perfect: false}); }
  const phases = [], mark = m.markPublic.bind(m);
  m.markPublic = (...args) => {phases.push(m.phase); return mark(...args);};
  m._afterCombat(); m.flush();
  assert.equal(m.phase, 'SETTLE'); assert.equal(phases.includes('UNITE'), false);
  assert.ok(m.order.every(ps => ps.lp === 11));
  const pub = m.publicView();
  const cost = settledRoundCost({round: 1, leaks: 4, cap: 10}, pub, 'p0');
  assert.equal(battleResultBox(cost).sub, '生命值减少 −2');
  assert.equal(battleResultBox(settledRoundCost(null, pub, 'p0')).sub, '生命值减少 −2', '重连结算时仍有权威扣血');
  assert.equal(phasePopupOf(pub.phase, phaseBanner(pub.phase, pub)), null);
});

test('有完美队友且有漏怪时仍进入真实联防', t => {
  const f = fixture(t, 2), m = f.match;
  m.startRound(1); m.phase = 'COMBAT';
  m.lastResults.set('p0', {leaked: [{enemyKey: Object.keys(m.data.enemies)[0], counted: true}], perfect: false});
  m.lastResults.set('p1', {leaked: [], perfect: true});
  m._afterCombat();
  assert.equal(m.phase, 'UNITE'); assert.ok(m.fields.some(f => f.kind === 'unite'));
});

test('大厅启用统计后切入炸惊：实际独立引擎挂接统计，离开模式后关闭也会移除挂钩', async t => {
  const f = fixture(t), m = f.match;
  m.startRound(1); m.startCombat(); m.flush();
  const start = f.frames.find(frame => frame.t === 'b.start'); assert.ok(start);
  const handlers = new Map(), store = createStore(initialState);
  const net = {on(type, fn) {const set = handlers.get(type) || new Set(); set.add(fn); handlers.set(type, set); return () => set.delete(fn);},
    send() {return true;}, request() {return Promise.resolve({t: 'ok'});}};
  const runner = createModeBattleRunner({net, store, loadZhajingSim: async () => ({spec, ds: new DataSource(getZhajingData(), null)}),
    raf: () => 1, caf() {}, setInterval: () => 1, clearInterval() {}, doc: {hidden: false, addEventListener() {}},
    logger: {error() {}, warn() {}, debug() {}, info() {}}});
  t.after(() => runner.dispose());
  runner.setCombatMetrics(true);
  store.set({room: {variant: 'entertainment_zhajing'}});
  await runner.onStart(start);
  const entry = runner._entries.get(start.battleId); assert.ok(entry?.battle);
  assert.equal(typeof entry.combatMetrics, 'function');
  store.set({room: null}); runner.setCombatMetrics(false);
  assert.equal(entry.combatMetrics, null, '关闭设置必须同步非活动模式');
});

test('祥子S3实际技能产生两物理两法术音符，攻击通道不再另发普通弹道', () => {
  const raw = getZhajingData().chess.chess_zj_oblvns_b;
  const h = makeBattle({modeId: 'mode_single_zhajing',
    defs: {chess: {[raw.chessId]: {...raw, skill: raw.skills.find(s => s.index === 2)}},
      enemies: {note_dummy: enemyRec({key: 'note_dummy', hp: 1e9, speed: 0})}},
    units: [{chessId: raw.chessId, row: 9, col: 6}],
    enemies: [{key: 'note_dummy', route: {motion: 'WALK', start: [9, 8], end: [9, 8], checkpoints: []}}],
    autoFinish: false, timeLimit: 100, flags: {startOpCooldown: 0}, captureNoisy: true});
  h.run(.1); const u = h.unit(raw.chessId);
  u.skill.addCharge(1); assert.equal(u.skill.activate('test'), true); h.run(8);
  const events = h.eventsOf('fx').filter(e => e[1] === 'mujicaNote' && e[4].state === 'spawn');
  assert.ok(events.filter(e => e[4].projectile === 'projectile_chr_oblvns_s3_phy').length >= 2);
  assert.ok(events.filter(e => e[4].projectile === 'projectile_chr_oblvns_s3_mag').length >= 2);
  assert.ok(h.eventsOf('atk').filter(e => e[1] === u.id).every(e => e[3] === 'product-note'));
  assert.deepEqual(h.b.errors, []);
});

test('原始特效关闭时音符后备绘制也按身份更新、结束、超时和切场清理', () => {
  class Graphics {
    constructor() {this.position = {set: (x, y) => {this.x = x; this.y = y;}};}
    lineStyle() {} beginFill() {} drawEllipse() {} endFill() {} moveTo() {} lineTo() {}
    destroy() {this.destroyed = true;}
  }
  const children = [], system = {time: 0, P: {Graphics}, ctx: {layers: {fxNormal: {addChild: g => children.push(g)}}}, _point: (x, y) => ({x: x * 10, y: y * 10})};
  const notes = new MujicaNoteSystem(system);
  for (let i = 0; i < 20; i++) notes.event(i, 4, {id: 1, noteId: '1:1', state: i ? 'move' : 'spawn'});
  assert.equal(children.length, 1); assert.equal(children[0].x, 190);
  notes.event(19, 4, {id: 1, noteId: '1:1', state: 'end'});
  assert.equal(notes.rows.size, 0); assert.equal(children[0].destroyed, true);
  notes.event(1, 4, {id: 2, noteId: '2:1', state: 'spawn'});
  system.time = 1; notes.update(); assert.equal(notes.rows.size, 0);
  notes.event(1, 4, {id: 2, noteId: '2:2', state: 'spawn'}); notes.clear(); assert.equal(notes.rows.size, 0);
});

test('作战时限是最长时间：清空敌人可提前结束，有存活目标且未到时限时继续战斗', () => {
  const empty = makeBattle({enemies: [], timeLimit: 30, autoFinish: true}); empty.step();
  assert.equal(empty.b.finished, true); assert.ok(empty.b.time < 30);
  const active = makeBattle({defs: {enemies: {clock_dummy: enemyRec({key: 'clock_dummy', hp: 1e9, speed: 0})}},
    enemies: [{key: 'clock_dummy', route: {motion: 'WALK', start: [9, 8], end: [9, 2], checkpoints: []}}], timeLimit: 30});
  active.run(5); assert.equal(active.b.finished, false); assert.equal(active.enemies().length, 1);
});

test('参考潜能检测遗漏导入修复：扩展干员与缺少潜能曲线的条目不会抛错', () => {
  assert.equal(charPotentialChanges({chess: {a: {charId: 'char_x_test'}}}, 'char_x_test'), false);
  assert.equal(charPotentialChanges(getZhajingData(), 'char_1035_wisdel'), true);
});

test('参考已有的选卡意向路由通过封装协议，选择、取消、坏索引与阶段检查一致', t => {
  const f = fixture(t, 2), m = f.match;
  m.startRound(1); m.enterSpDraft();
  assert.equal(m.phase, 'SP_DRAFT');
  const draft = m.spOf(f.ps);
  assert.ok(draft.cards.length > 0);
  assert.deepEqual(f.intent({t: 'g.spWant', idx: 0}), {ok: true});
  assert.equal(draft.want.p0, 0);
  assert.deepEqual(f.intent({t: 'g.spWant', idx: null}), {ok: true});
  assert.equal(draft.want.p0, undefined);
  assert.equal(f.intent({t: 'g.spWant', idx: 99}).error, 'BAD_MSG');
  m.phase = 'PREP'; assert.equal(f.intent({t: 'g.spWant', idx: 0}).error, 'WRONG_PHASE');
});

test('召唤物晚绑定与动态召唤跟随实际主人皮肤，默认主人不串皮肤，弹药技能快照明确标识', () => {
  const skin = 'char_1035_wisdel@game#9', tokenId = 'token_10035_wisdel_wward';
  const h = makeBattle({data: new DataSource(getZhajingData(), null), modeId: 'mode_single_zhajing', units: [
    {uid: 'early', kind: 'token', tokenId, ownerUid: 'skin', row: 10, col: 4},
    {uid: 'skin', chessId: 'chess_zj_37_a', skin, row: 9, col: 4},
    {uid: 'default', chessId: 'chess_zj_37_a', row: 9, col: 6}], enemies: []});
  h.step();
  const owner = h.unit('skin'), other = h.unit('default'), early = h.unit('early');
  assert.equal(early.ownerUnit, owner); assert.equal(early.skin, skin);
  assert.equal(unitInfo(early).ownerCharId, 'char_1035_wisdel');
  assert.equal(unitInfo(owner).ammoSkill, true);
  const summon = h.b.spawnToken(owner, tokenId, 10, 5);
  const plain = h.b.spawnToken(other, tokenId, 10, 6);
  assert.ok(summon && plain); assert.equal(unitInfo(summon).skin, skin);
  assert.equal(unitInfo(plain).skin, undefined); assert.deepEqual(h.b.errors, []);
});
