import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TestContent} from '../../server/test-content.js';
import {GameData} from '../../server/match/gamedata.js';
import {setupMatchWaves,buildNormalWave,buildBossWave,attrPower} from '../../server/match/waves.js';
import {generateDraft,applyCard} from '../../server/match/choices.js';
import {createRng} from '../../server/sim/rng.js';
import {EXTENSION_DECISIONS,EXTENSION_FLY} from '../../shared/round-extensions.js';
import {DATA,makeMatch} from '../match/harness.js';
const tc=new TestContent(),room={mode:'coop',difficulty:'ABYSS'};
const resolve=(n,extra=[])=>tc.resolve({version:tc.version,ids:[`extended-rounds-${n}`,...extra]},room,DATA).data;
const d24=resolve(24),d30=resolve(30),gd30=new GameData(d30,'mode_multi_abyss');

test('new wave variants keep routes, count budget, original templates and legal spawn windows',()=>{
 const sourceNames=new Set();let different=0;
 for(const [id,w]of Object.entries(d30.waves).filter(([id])=>id.startsWith('round_ext_v2_'))){
  const src=DATA.waves[w.extensionSource];assert.ok(src);sourceNames.add(w.extensionSource);
  assert.deepEqual(w.routes,src.routes);assert.equal(w.totalCount,src.totalCount);assert.equal(w.spawns.length,src.spawns.length);
  for(let i=0;i<w.spawns.length;i++){const a=w.spawns[i],b=src.spawns[i];assert.equal(a.key,b.key);assert.equal(a.count,b.count);assert.equal(a.routeIndex,b.routeIndex);assert.ok(a.time>=0&&a.time+Math.max(0,a.count-1)*a.interval<200);if(a.time!==b.time||a.interval!==b.interval)different++;}
  assert.equal(w.id,id);
 }
 assert.ok(different>0);assert.ok(sourceNames.size>=2);for(const name of sourceNames)assert.deepEqual(d30.waves[name],DATA.waves[name]);
});

test('seeded extended types avoid triple repeats and all lengths share picks AND generated spawn prefixes',()=>{
 const gd20=new GameData(resolve(20),'mode_multi_abyss'),gd24=new GameData(resolve(24),'mode_multi_abyss');
 let air=0,ground=0;
 for(let seed=1;seed<=128;seed++){
  const a=setupMatchWaves(gd20,createRng(seed)),b=setupMatchWaves(gd24,createRng(seed)),c=setupMatchWaves(gd30,createRng(seed));
  assert.deepEqual(a.picks.slice(14,20),c.picks.slice(14,20));assert.deepEqual(b.picks.slice(14,24),c.picks.slice(14,24));
  for(let r=14;r<30;r++){
   assert.ok(c.picks[r]);assert.ok(c.picks[r].type!==c.picks[r-1]?.type||c.picks[r].type!==c.picks[r-2]?.type,`seed${seed}/R${r}`);
   c.picks[r].fly?air++:ground++;
   const desired=EXTENSION_FLY[r-14],last=c.picks[r-1]?.type,twice=last===c.picks[r-2]?.type;
   if(typeof desired==='boolean'){
    const types=[...c.factions,'SPECIAL'].filter(t=>!twice||t!==last);
    const candidates=Object.values(gd30.factions.entries).filter(e=>types.includes(e.type)&&!e.firstHalf&&gd30.enemy(e.key)&&!gd30.inactiveEnemies.has(e.key));
    if(candidates.some(e=>e.fly===desired))assert.equal(c.picks[r].fly,desired,`preferred movement seed${seed}/R${r}`);
   }
   const w=buildNormalWave(gd30,createRng(3),c.factions,r);assert.ok(w.spawns.length);assert.ok(w.spawns.every(s=>gd30.enemy(s.enemyKey)&&s.routeIndex<w.routes.length));
   if(r<20)assert.deepEqual(buildNormalWave(gd20,createRng(3),a.factions,r).spawns,w.spawns);
   if(r<24)assert.deepEqual(buildNormalWave(gd24,createRng(3),b.factions,r).spawns,w.spawns);
  }
 }
 assert.ok(air>0&&ground>0);
});

test('late supply is normal legal 4-6 combat equipment; tactical pool is finite and never buffs a disabled bond',()=>{
 const allowed=new Set(d30.choices.schedule.mode_multi_abyss.rounds[20].tacticIds);
 for(const modeId of ['mode_single_abyss','mode_multi_abyss']){
  const gd=new GameData(d30,modeId);
  for(let seed=1;seed<=100;seed++)for(const r of EXTENSION_DECISIONS[30]){
   const draft=generateDraft(gd,createRng(seed),r,{bondAvailable:()=>false});assert.equal(draft.cards.length,gd.isSolo?3:6);
    for(const c of draft.cards){if(r===20||r===28){assert.equal(c.kind,'tactic');assert.ok(allowed.has(c.id));assert.ok(!c.desc.includes('驰援')&&!c.name.includes('盟誓'));}
    else{const it=gd.item(c.id);assert.equal(c.kind,'item');assert.ok(it.tier>=4&&it.tier<=6&&!it.isGolden&&it.itemType==='EQUIP');assert.ok(['passive','passive_counter','post_battle_transform'].includes(it.kind));assert.equal(c.price,0);}}
  }
 }
});

test('24- and 30-round packages add the planned late support and tactic choices',()=>{
 const plans=[[d24,'mode_multi_abyss',[16,20,22]],[d30,'mode_multi_abyss',[16,20,24,28]]];
 for(const[data,modeId,rounds]of plans){const gd=new GameData(data,modeId),tactics=new Set(gd.raw.choices.schedule[modeId].rounds[20].tacticIds);
  for(const round of rounds){for(let seed=1;seed<=30;seed++){const draft=generateDraft(gd,createRng(seed),round,{bondAvailable:()=>false});
   assert.ok(draft.cards.length>0);for(const card of draft.cards){if(round===20||round===28){assert.equal(card.kind,'tactic');assert.ok(tactics.has(card.id));}
    else{const item=gd.item(card.id);assert.equal(card.kind,'item');assert.ok(item.tier>=4&&item.tier<=6&&!item.isGolden&&item.itemType==='EQUIP');}}
  }}
 }
});

test('late reinforcement cannot manufacture chess outside shared stock',()=>{
 const h=makeMatch({data:d30,humans:2,fake:true}).start();try{h.toPrep(1);const p=h.ps('p_0');
 const card=d30.choices.cards.tactic.find(c=>c.effectId==='allybuff_select_7_1');assert.ok(card);
 for(const id of h.m.gd.visibleChess)if(h.m.gd.chess(id).bonds.includes('yanShip'))h.m.pool.take(id,999);
 const count=p.hand.filter(Boolean).length+p.board.size+p.temp.filter(Boolean).length;
 applyCard(h.m,p,{...card,id:card.effectId,kind:'tactic',team:false,family:'tactic'});
 assert.equal(p.hand.filter(Boolean).length+p.board.size+p.temp.filter(Boolean).length,count);
 }finally{h.m.dispose();}
});

test('boss body and parts never get escort HP; independent main/hidden pools preserve old multiplier fallback',()=>{
 const original=new GameData(DATA,'mode_multi_abyss'),set=setupMatchWaves(gd30,createRng(4));
 for(const [r,id]of [[30,'boss_1'],[31,'boss_8']]){
  const w=buildBossWave(gd30,createRng(5),set.factions,r,{bossId:id,solo:false});
  const s=original.enemyScale(r===30?14:15);assert.ok(w.spawns.some(x=>x.tag==='boss'));
  for(const e of w.spawns){if(e.tag==='boss')assert.equal(e.mods.hpMul,undefined);else if(e.tag==='part')assert.equal(e.mods.hpMul,s.hpMul);else assert.ok(Math.abs(e.mods.hpMul-s.hpMul*1.5)<1e-6);assert.ok(Math.abs(e.mods.atkMul-s.atkMul*1.15)<1e-6);}
 }
 const legacy=structuredClone(DATA);legacy.config.modes.mode_multi_abyss.bossHpScale.testMultiplier=1.7;const gd=new GameData(legacy,'mode_multi_abyss');
 assert.equal(gd.bossPoolHp('boss_8',4),Math.round(original.bossPoolHp('boss_8',4)*1.7));
});
