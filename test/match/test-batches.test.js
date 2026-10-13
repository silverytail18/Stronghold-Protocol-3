import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TestContent} from '../../server/test-content.js';
import {extendRounds} from '../../server/test-batches.js';
import {toggleTestSelection} from '../../public/js/ui/testContent.js';
import {GameData} from '../../server/match/gamedata.js';
import {setupMatchWaves,buildNormalWave,buildBossWave} from '../../server/match/waves.js';
import {bossPoolHp,hiddenEligible} from '../../server/match/finalAssault.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
import {createRng} from '../../server/sim/rng.js';
import {SharedPool} from '../../server/match/pool.js';
import {baselineRewardRound,buildResult} from '../../server/match/results.js';
import {phaseTotalSeconds} from '../../public/js/ui/gameLogic.js';
import {bossLevelSeconds} from '../../public/js/ui/matchStatus.js';
import {DATA,makeMatch,give,legalTileFor} from './harness.js';

const content=new TestContent();
const rules=(ids,mode='coop',difficulty='NORMAL')=>content.resolve({version:content.version,ids},{mode,difficulty},DATA);
const totals=[20,24,30];
const expectedHp=[1,1.2,1.2,1.44,1.44,1.44,1.728,1.728,1.728,2.0736,2.0736,2.0736,2.48832,2.48832,2.48832,2.985984];
const expectedAtk=[1,1.1,1.1,1.1,1.21,1.21,1.21,1.331,1.331,1.331,1.4641,1.4641,1.4641,1.61051,1.61051,1.61051];const expectedSingleAtk=[1,1.1,1.1,1.21,1.21,1.21,1.331,1.331,1.331,1.4641,1.4641,1.4641,1.61051,1.61051,1.61051,1.771561];
const expectedBoss={20:[1.3,1.25,1.2,1.05],24:[1.5,1.4,1.35,1.1],30:[1.8,1.65,1.5,1.15]};
const expanded=new Map(totals.map(total=>[total,rules([`extended-rounds-${total}`]).data]));

test('all round extensions are mutually exclusive; invalid totals and standard starts leave baseline intact',()=>{
  const before=JSON.stringify(DATA),room={mode:'coop',difficulty:'ABYSS'},items=content.menu(room).items;
  for(const a of totals)for(const b of totals){
    if(a===b)continue;
    const ids=[`extended-rounds-${a}`,`extended-rounds-${b}`];
    assert.throws(()=>rules(ids),/冲突/);
    assert.deepEqual(toggleTestSelection(items,[ids[0],'shop-extra-slot'],ids[1]),[ids[1],'shop-extra-slot']);
  }
  for(const total of totals){
    assert.throws(()=>rules([`extended-rounds-${total}`],'coop','FUNNY'),/不支持/);
    assert.deepEqual(expanded.get(total).config.modes.mode_multi_funny,DATA.config.modes.mode_multi_funny);
    assert.deepEqual(expanded.get(total).config.modes.mode_single_funny,DATA.config.modes.mode_single_funny);
  }
  for(const total of [14,16,18,19,21,25,'24',null])assert.throws(()=>extendRounds(DATA,total),/不支持/);
  assert.equal(JSON.stringify(DATA),before);
});

test('20 and 24 share the same extra-round prefix; long extensions compose with both content and experience batches',()=>{
  for(const modeId of ['mode_single_abyss','mode_multi_abyss'])for(let seed=1;seed<=20;seed++){
    const a=new GameData(expanded.get(20),modeId),b=new GameData(expanded.get(24),modeId);
    const wa=setupMatchWaves(a,createRng(seed)),wb=setupMatchWaves(b,createRng(seed));
    assert.deepEqual(wa.picks.slice(14,20),wb.picks.slice(14,20));
    for(let r=14;r<20;r++){assert.deepEqual(a.roundCfg(r),b.roundCfg(r));assert.deepEqual(a.enemyScale(r),b.enemyScale(r));}
  }
  for(const total of [20,24,30]){
    const ids=[`extended-rounds-${total}`,'shop-extra-slot','coop-pool-150','arknights-expansion-v1','rhodes-mujica-v1'];
    const {data,manifest}=rules(ids,'coop','ABYSS'),gd=new GameData(data,'mode_multi_abyss');
    assert.equal(gd.bossRound,total);assert.equal(gd.hiddenRound,total+1);assert.equal(gd.shopSlots(6).chess,6);
    assert.equal(data.config.economy.poolCopies[6],8);assert.equal(manifest.clientVersion,Math.max(...content.entries.filter(e=>ids.includes(e.id)).map(e=>e.clientVersion)));
    assert.deepEqual(manifest.batches.map(b=>b.id),ids);
    const contentOnly=rules(['arknights-expansion-v1','rhodes-mujica-v1']).data;
    assert.deepEqual(data.chess,contentOnly.chess);assert.deepEqual(data.bonds,contentOnly.bonds);
    assert.deepEqual(data.assets,contentOnly.assets);
  }
});

test('empty selection preserves the formal object; experience overlays remain independent and preserve tier scarcity',()=>{
  assert.equal(rules([]).data,DATA);
  const shop=rules(['shop-extra-slot']).data,pool=rules(['coop-pool-150']).data,both=rules(['shop-extra-slot','coop-pool-150']).data;
  for(const level of [1,2,3,4,5,6])assert.equal(shop.config.modes.mode_multi_normal.shopSlots[level].chess,DATA.config.modes.mode_multi_normal.shopSlots[level].chess+1);
  assert.deepEqual(shop.config.economy,DATA.config.economy);
  assert.deepEqual(pool.config.modes,DATA.config.modes);
  assert.deepEqual(Object.values(pool.config.economy.poolCopies),[18,21,27,24,12,8]);
  assert.equal(pool.config.economy.poolCopiesOverrides.chess_char_6_11_a,6);
  const gd=new GameData(both,'mode_multi_normal'),shared=new SharedPool(gd);
  for(const id of gd.visibleChess){const original=new GameData(DATA,'mode_multi_normal').poolCopies(id);assert.equal(shared.cap(id),Math.ceil(original*1.5));}
  assert.equal(gd.refreshPrice,1);assert.equal(gd.shopSlots(6).item,1);
  const h=makeMatch({data:both,humans:2,fake:true});h.start().toPrep(1);
  for(const ps of h.m.order){ps.shop.level=6;ps.rollShop();assert.equal(ps.shop.slots.length,7);assert.equal(ps.shop.slots.filter(s=>s?.kind==='chess').length,6);assert.equal(ps.shop.slots.at(-1)?.kind,'item');}
  h.invariants();h.m.dispose();
});

for(const total of totals)for(const kind of ['single','multi'])for(const difficulty of ['normal','hard','abyss']){
  const modeId=`mode_${kind}_${difficulty}`;
  test(`${modeId} ${total}: complete waves, matched difficulty, same early seed sequence and delayed boss picks`,()=>{
    const original=new GameData(DATA,modeId),gd=new GameData(expanded.get(total),modeId);
    assert.equal(gd.bossRound,total);assert.equal(gd.hiddenRound,total+1);assert.deepEqual(gd.hiddenCore,original.hiddenCore);assert.deepEqual(gd.spRounds(),[...original.spRounds(),...[16,20,24].filter(r=>r<total)]);
    for(let r=1;r<14;r++){assert.deepEqual(gd.roundCfg(r),original.roundCfg(r));assert.deepEqual(gd.enemyScale(r),original.enemyScale(r));}
    const hp=expectedHp,atk=kind==='single'?expectedSingleAtk:expectedAtk;
    for(let r=14;r<total;r++){const s=gd.enemyScale(r),base=original.enemyScale(13);assert.ok(Math.abs(s.hpMul-base.hpMul*hp[r-14])<1e-6);assert.ok(Math.abs(s.atkMul-base.atkMul*atk[r-14])<1e-6);assert.equal(s.speedMul,base.speedMul);assert.equal(gd.prepTime(r),kind==='single'?null:90);assert.equal(gd.combatTimeLimitReal(r),115);assert.equal(gd.income(r),12);}
    for(const [r,source]of [[total,14],[total+1,15]]){assert.ok(Math.abs(gd.enemyScale(r).hpMul-original.enemyScale(source).hpMul*expectedBoss[total][2])<1e-6);assert.ok(Math.abs(gd.enemyScale(r).atkMul-original.enemyScale(source).atkMul*expectedBoss[total][3])<1e-6);}
    for(let seed=1;seed<=20;seed++){
      const beforeRng=createRng(seed),afterRng=createRng(seed),old=setupMatchWaves(original,beforeRng),now=setupMatchWaves(gd,afterRng);
      assert.equal(beforeRng.state(),afterRng.state());assert.deepEqual(now.factions,old.factions);assert.equal(now.stageId,old.stageId);assert.equal(now.bossId,old.bossId);assert.equal(now.hiddenBossId,old.hiddenBossId);
      assert.deepEqual(now.picks.slice(1,14),old.picks.slice(1,14));assert.equal(now.typeSlots.length,total+1);
      assert.deepEqual(now.picks[total],{...old.picks[14],round:total});assert.deepEqual(now.picks[total+1],{...old.picks[15],round:total+1});
      for(let r=14;r<total;r++){assert.ok(now.picks[r]);const wave=buildNormalWave(gd,createRng(seed),now.factions,r);assert.ok(wave.spawns.length);assert.ok(wave.spawns.every(s=>Number.isFinite(s.time)&&s.count>0&&gd.enemy(s.enemyKey)));}
      assert.ok(buildBossWave(gd,createRng(seed),now.factions,total,{bossId:now.bossId,solo:kind==='single'}).spawns.length);
      assert.ok(buildBossWave(gd,createRng(seed),now.factions,total+1,{bossId:now.hiddenBossId,solo:kind==='single'}).spawns.length);
    }
    for(const id of Object.keys(DATA.bosses)){assert.equal(bossPoolHp(gd,id,4),Math.max(1,Math.round(bossPoolHp(original,id,4)*expectedBoss[total][DATA.bosses[id].hidden?1:0])));assert.equal(gd.bossPoolHp(id,4),bossPoolHp(gd,id,4));}
    assert.equal(hiddenEligible(gd,{layerSum:kind==='single'?351:1201,teamLp:2}),true);
    assert.equal(hiddenEligible(gd,{layerSum:kind==='single'?350:1200,teamLp:2}),false);
    assert.equal(hiddenEligible(gd,{layerSum:2000,teamLp:1}),false);
  });
}

for(const total of totals)test(`${total}: full main/hidden phase flow and old reward equivalent without early boss payout`,()=>{
  const {data,manifest}=rules([`extended-rounds-${total}`,'shop-extra-slot','coop-pool-150']);
  const h=makeMatch({data,humans:2,fake:true,clientCombat:true,script:()=>({duration:0.3,bossDps:1e9})});
  h.m.testRules=manifest;for(const ps of h.m.order)ps.activatedLayers=()=>650;
  const ordinary=new Set();h.onBroadcast.push(msg=>{if(msg.t==='m.public'&&msg.phase==='COMBAT')ordinary.add(msg.round);});
  h.start();assert.equal(h.drive(()=>!!h.ended),true);assert.equal(h.ended.victory,true);assert.equal(h.ended.hiddenCleared,true);
  assert.equal(h.ended.roundsPassed,total+1);assert.ok([...ordinary].includes(total-1));
  assert.equal(h.ended.players[0].trophies,5);assert.equal(h.m.errorCount,0,JSON.stringify(h.m.errors));
  assert.equal(baselineRewardRound(h.m.gd,total-1),13);assert.equal(baselineRewardRound(h.m.gd,total),14);assert.equal(baselineRewardRound(h.m.gd,total+1),15);
  h.m.round=total-1;const lost=buildResult(h.m,{victory:false,hiddenReached:false,hiddenCleared:false,reason:'defeat'});
  assert.equal(lost.players[0].trophies,3);h.invariants();h.m.dispose();
});

for(const total of [20,24,30])test(`${total}: late BattleSpecs run identically with unchanged client data and per-match server data; UI uses current-round timers`,()=>{
  const gd=new GameData(expanded.get(total),'mode_multi_abyss'),setup=setupMatchWaves(gd,createRng(815));
  const h=makeMatch({data:expanded.get(total),difficulty:'ABYSS',fake:true});h.start().toPrep(1);h.setStage(setup.stageId);
  const ps=h.ps('p_0');
  for(const id of gd.visibleChess.filter(id=>gd.tierOf(id)===6).slice(0,4)){
    const golden=gd.goldenIdOf(id),tile=legalTileFor(h.m,ps,golden);if(tile)give(h.m,ps,golden,'board',tile);
  }
  const players=[ps.battleInput()];assert.ok(players[0].units.length>=2);
  for(let round=14;round<=total+1;round++){
    const bossLike=round>=total,bossId=round===total+1?setup.hiddenBossId:setup.bossId;
    const wave=bossLike?buildBossWave(gd,createRng(815),setup.factions,round,{bossId,solo:true}):buildNormalWave(gd,createRng(815),setup.factions,round);
    const pool=gd.bossPoolHp(bossId,1);
    const spec=buildBattleSpec({battleId:`test-${round}`,fieldId:'n:p_0',kind:round===total+1?'hidden':bossLike?'boss':'normal',seed:815,modeId:gd.modeId,round,stageId:setup.stageId,timeLimit:gd.combatTimeLimit(round),players,spawns:wave.spawns,routes:wave.routes,enemyOverrides:wave.overrides,flags:{layerGainsEnabled:!bossLike,...gd.dp},...(bossLike?{bossId,boss:{poolHp:pool,poolMax:pool}}:{})});
    const clientBattle=createBattleFromSpec(spec,new DataSource(DATA,null),{quiet:true,recordEvents:false});
    const client=clientBattle.runToEnd(500);
    const server=createBattleFromSpec(spec,new DataSource(expanded.get(total),null),{quiet:true,recordEvents:false}).runToEnd(500);
    assert.equal(resultDigest(client).hash,resultDigest(server).hash);assert.equal(clientBattle.errorCount,0);
    if(!bossLike){const pub={modeId:gd.modeId,round,phase:'PREP',roundRules:gd.roundCfg(round)};assert.equal(phaseTotalSeconds(pub,DATA.config),90);pub.phase='COMBAT';assert.equal(phaseTotalSeconds(pub,DATA.config),115);}
  }
  h.m.dispose();
  assert.equal(bossLevelSeconds({modeId:gd.modeId,round:total+1,phase:'HIDDEN_CORE',roundRules:gd.roundCfg(total+1)},DATA.config),120);
});
