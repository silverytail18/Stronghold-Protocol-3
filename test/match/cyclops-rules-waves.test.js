import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match } from '../../server/match/Match.js';
import { VirtualScheduler } from '../../server/match/scheduler.js';
import { getData } from '../../server/data.js';
import { PHASE } from '../../shared/constants.js';
import { buildNormalWave, buildBossWave, previewOf } from '../../server/match/waves.js';
import { applyCyclopsHex, cyclopsHexCard, cyclopsHexes, cyclopsHooks, settleCyclopsHexes, rollCyclopsDraftPool } from '../../server/match/cyclops.js';
import { collectViolations } from '../../server/match/invariants.js';
import { makeCtx } from '../../server/match/effectsMeta.js';

const data = getData({ log: { warn() {}, error() {}, info() {} } });
function fixture(t, { count = 1, seed = 77, variant = 'entertainment_cyclops', difficulty = 'NORMAL' } = {}) {
  const scheduler = new VirtualScheduler({ instantCombat: true });
  const m = new Match({ mode: 'coop', difficulty, variant, seed, data, scheduler, clientCombat: false, botRehearsal: 0,
    seats: Array.from({ length: count }, (_, seat) => ({ seat, playerId: `p${seat}`, name: `P${seat}`, isBot: false, connected: true })),
    send() {}, broadcast() {}, onEnd() {} });
  t.after(() => { m.dispose(); scheduler.dispose(); });
  return m;
}
function gift(m, ps, id, q) { applyCyclopsHex(m, ps, cyclopsHexCard(cyclopsHexes(data).find(h => h.id === id), q)); }
function prep(m, round = 10) { m.phase = PHASE.PREP; m.round = round; for (const p of m.order) p.ready = false; }
const signature = wave => JSON.stringify(wave.spawns.map(s => [s.enemyKey, s.count, s.time, s.routeIndex, s.interval]));

test('21回合真实波次：32种子所有随机表完整，后期替换有效、相邻构成变化、预览可重放', t => {
  for (let seed = 1; seed <= 32; seed++) {
    const m = fixture(t, { seed }), again = fixture(t, { seed });
    assert.equal(m.factions.schedule.picks.length, 22);
    let previous = null;
    for (let r = 1; r <= 21; r++) {
      assert.ok(m.factions.schedule.picks[r], `seed${seed} R${r} has a pick`);
      if (r >= 17 && r <= 20) {
        const a = buildNormalWave(m.gd, m.rngSetup, m.factions, r);
        const b = buildNormalWave(again.gd, again.rngSetup, again.factions, r);
        assert.ok(a.spawns.length > 0); assert.equal(signature(a), signature(b));
        assert.ok(a.spawns.some(s => [a.pick.key, a.pick.elite, a.pick.normal].includes(s.enemyKey)), 'spawn uses seeded faction replacement');
        assert.equal(previewOf(a.spawns).reduce((n,s) => n+s.count, 0), a.spawns.reduce((n,s) => n+s.count, 0));
        if (previous) assert.notEqual(signature(a), previous, `seed${seed} adjacent R${r}`);
        previous = signature(a);
      }
    }
    const boss = buildBossWave(m.gd, m.rngSetup, m.factions, 21, m.bossId);
    assert.ok(boss.spawns.some(s => s.tag === 'boss'));
  }
});

test('1至8人按开局座位固定分池，同组共用、跨组独立，容量保持原四人池', t => {
  for (let count = 1; count <= 8; count++) {
    const m = fixture(t, { count });
    assert.deepEqual(m.poolGroups.map(g => g.playerIds.length), count <= 4 ? [count] : [4, count - 4]);
    assert.equal(m.order[0].pool, m.pool);
    for (const p of m.order) {
      assert.equal(p.pool, m.order[Math.floor(p.seat / 4) * 4].pool);
      const id = [...p.pool.entries.keys()][0]; assert.equal(p.pool.cap(id), m.gd.poolCopies(id));
      assert.equal(p.privateView().poolGroupId, `g${Math.floor(p.seat / 4) + 1}`);
    }
    if (count > 4) assert.notEqual(m.order[0].pool, m.order[4].pool);
  }
});

test('跨组库存：购买、晋升、出售、淘汰、馈赠、奖励与特质抽取均使用本人池', t => {
  const m = fixture(t, { count: 8 }), [p, same, , , other] = m.order;
  prep(m); p.funds = 100;
  const id = [...p.pool.entries.keys()].find(id => m.gd.tierOf(id) === 2 && m.gd.goldenIdOf(id));
  const cap = p.pool.cap(id);
  p.shop.slots = [{ kind: 'chess', id, basePrice: m.gd.chessPrice(id) }]; p.shop.layout = { chess: 1, item: 0 };
  assert.equal(m.handle(p.playerId, { t: 'g.buy', slot: 0 }).ok, true);
  assert.equal(same.pool.left(id), cap - 1); assert.equal(other.pool.left(id), cap);
  p.acquireChess(id); p.acquireChess(id);
  const elite = p.allChess().find(u => m.gd.isGolden(u.id)); assert.ok(elite);
  assert.equal(p.pool.entries.get(id).left + elite.poolCopies, cap);
  assert.equal(m.handle(p.playerId, { t: 'g.sell', uid: elite.uid }).ok, true);
  assert.equal(p.pool.left(id), cap); assert.equal(other.pool.left(id), cap);
  // Leave exactly one candidate in group 2. Shop, reward and content APIs must agree, independently of group 1.
  for (const [base, entry] of other.pool.entries) entry.left = base === id ? entry.cap : 0;
  other.shop.level = 6; other.rollShop();
  assert.ok(other.shop.slots.filter(s => s?.kind === 'chess').every(s => s.id === id));
  assert.ok(other.pushRewardOffer('effect').slots.every(s => s.id === id));
  const ctx = makeCtx(m, other, { key: 'test' }, 'onGain');
  assert.equal(ctx.rollChess({ tier: 2 }), id);
  assert.ok(rollCyclopsDraftPool(m, other).every(s => s.chessId === id));
  const piece = other.acquireChess(id); assert.equal(other.pool.left(id), cap - 1);
  other.eliminate(m.round); assert.equal(other.pool.left(id), cap); assert.equal(p.pool.left(id), cap);
  assert.ok(piece);
});

test('分池不变量按本组核账，重摇开局仍不禁抽并原子替换两组池', t => {
  const m = fixture(t, { count: 8 });
  const id = [...m.pool.entries.keys()][0];
  m.order[4].acquireChess(id);
  assert.deepEqual(collectViolations(m), []);
  const clean = fixture(t, { count: 8 });
  const before = clean.order[4].pool;
  assert.equal(clean.completeSetupReroll().ok, true);
  assert.notEqual(clean.order[4].pool, before); assert.notEqual(clean.order[4].pool, clean.pool);
  assert.deepEqual(clean.bannedChess, []); assert.deepEqual(clean.disabledBonds, []);
  assert.ok(clean.factions.schedule.picks[20]);
});

test('选秀沿开局池分组，淘汰不会让后一组玩家迁入前组', t => {
  const m = fixture(t, { count: 8 });
  m.order[0].eliminate(9); m.order[2].eliminate(9); m.order[3].eliminate(9);
  const second = m.order[4].pool; prep(m); m.enterCyclopsDraft();
  assert.deepEqual(m.cyclops.groups.map(g => g.playerIds), [['p1'], ['p4', 'p5', 'p6', 'p7']]);
  assert.equal(m.cyclops.groupByPlayer.p4, 'g2'); assert.equal(m.order[4].pool, second);
});

test('利息上限：银加1，绝对上限取高，组合与顺序无关，无关馈赠不抵消', t => {
  for (const [gifts, expected] of [
    [[], 5], [[['cyc_interest','silver']],6], [[['cyc_interest','gold']],8],
    [[['cyc_interest','prismatic']],10], [[['cyc_interest','gold'],['cyc_refresh','silver']],8],
    [[['cyc_interest','silver'],['cyc_interest','gold']],8], [[['cyc_interest','gold'],['cyc_interest','silver']],8],
    [[['cyc_economy','prismatic'],['cyc_interest','prismatic']],10],
  ]) {
    const m = fixture(t), p = m.order[0];
    for (const [id,q] of gifts) gift(m,p,id,q);
    p.funds = 100; p.pendingFunds = 0; p.startRound(6);
    assert.equal(p.funds - 100 - p.gd.income(6), expected, JSON.stringify(gifts));
  }
});

test('运营只在真实战斗结算发一次，百分比用同批结算前存款，重复/合成结果不发', t => {
  const m = fixture(t), p = m.order[0]; prep(m,6);
  gift(m,p,'cyc_economy','gold'); gift(m,p,'cyc_interest','gold');
  p.funds=40; p.pendingFunds=0; p.startRound(6);
  assert.equal(p.funds,40+p.gd.income(6)+4);
  p.funds=39;
  settleCyclopsHexes(m,p,{synthetic:true},true); assert.equal(p.funds,39);
  settleCyclopsHexes(m,p,{},true); assert.equal(p.funds,42,'3 income + floor(39*.025)=0');
  settleCyclopsHexes(m,p,{},true); assert.equal(p.funds,42);
});

test('经验达到阈值立即开启空槽并保留已展示商品；升级无凭空免费奖励，干员合成仍有奖励', t => {
  const m=fixture(t),p=m.order[0]; prep(m);p.funds=100;p.rollShop();p.shop.exp=p._cyclopsExpNeeded(1)-1;
  const old=p.shop.slots.slice();
  assert.equal(m.handle(p.playerId,{t:'g.levelUp'}).ok,true);
  assert.equal(p.shop.level,2);assert.equal(p.shop.exp,0);assert.equal(p.funds,98);
  assert.deepEqual(p.shop.slots.slice(0,3),old.slice(0,3));assert.equal(p.shop.slots[3],null);assert.equal(p.shop.slots[4],old[3]);
  assert.equal(p.offers.length,0);
  const id=[...p.pool.entries.keys()].find(id=>m.gd.goldenIdOf(id));
  for(let n=0;n<m.gd.mergeCount(id);n++)p.acquireChess(id);
  assert.equal(p.offers[0].source,'merge');
});

test('金阶赌徒真实路由：返还装备与本组副本，每轮一次、到期/其他玩家UID/装备/就绪/战斗拒绝', t => {
  const m=fixture(t,{count:5}),p=m.order[4];prep(m);
  gift(m,p,'cyc_risk','gold');
  const id=[...p.pool.entries.keys()].find(id=>m.gd.tierOf(id)===2),cap=p.pool.cap(id);
  const piece=p.acquireChess(id),foreign=m.order[0].acquireChess(id);
  const it=p.acquireItem(p.gd.shopItemsByTier[2][0]);p._detach(p.find(it.uid));piece.items.push(it);p.recompute();
  const reject=uid=>assert.ok(m.handle(p.playerId,{t:'g.cyclopsRisk',uid}).error);
  reject(foreign.uid);reject(it.uid);
  const funds=p.funds;
  assert.equal(m.handle(p.playerId,{t:'g.cyclopsRisk',uid:piece.uid}).ok,true);
  assert.equal(p.funds-funds,Math.min(8,p.gd.chessPrice(id)*2));assert.equal(p.find(piece.uid),null);assert.ok(p.find(it.uid));
  assert.equal(p.pool.left(id),cap);assert.equal(m.order[0].pool.left(id),cap-1);
  reject(piece.uid);assert.equal(p.privateView().cyclopsRisk.sacrifice.used,true);
  const next=p.acquireChess(id);m.round++;p.ready=true;reject(next.uid);p.ready=false;m.phase=PHASE.COMBAT;reject(next.uid);
  prep(m,13);reject(next.uid);assert.equal(p.privateView().cyclopsRisk,null);
});

test('彩阶赌徒：血量安全、整局3次、每轮1次；重连私有视图不重置', t => {
  const m=fixture(t),p=m.order[0];prep(m,15);p.lp=60;gift(m,p,'cyc_risk','prismatic');
  for(let i=0;i<3;i++) {
    prep(m,15+i);const view=p.privateView().cyclopsRisk.blood,lp=p.lp,funds=p.funds;
    assert.equal(view.remaining,3-i);assert.equal(m.handle(p.playerId,{t:'g.cyclopsRisk'}).ok,true);
    assert.equal(p.lp,lp-view.cost);assert.equal(p.funds,funds+12);
    assert.ok(m.handle(p.playerId,{t:'g.cyclopsRisk'}).error);assert.equal(p.privateView().cyclopsRisk.blood.used,true);
  }
  prep(m,18);assert.ok(m.handle(p.playerId,{t:'g.cyclopsRisk'}).error);
  cyclopsHooks(p,'cyc_risk')[0].params.bloodUses=0;p.lp=4;
  assert.equal(p.privateView().cyclopsRisk.blood.affordable,false);assert.ok(m.handle(p.playerId,{t:'g.cyclopsRisk'}).error);assert.equal(p.lp,4);
});

test('普通模式保持单池与原经济入口，不能借请求触发舟铲铲赌徒操作', t => {
  const m=fixture(t,{count:4,variant:null}),p=m.order[0];prep(m);p.funds=100;
  assert.equal(m.poolGroups,null);assert.equal(p.pool,m.order[3].pool);assert.equal(p.poolGroupId,null);
  const level=p.shop.level;assert.equal(m.handle(p.playerId,{t:'g.levelUp'}).ok,true);assert.equal(p.shop.level,level+1);
  assert.equal(m.handle(p.playerId,{t:'g.cyclopsRisk'}).error,'WRONG_PHASE');assert.equal(p.privateView().cyclopsRisk,undefined);
});
