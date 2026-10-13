import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {RI,GIRL,BATCH,NEW,GIRLS,AMIYA,DOLRIS,AMORIS,MORTIS,TMORIS,OBLVNS,KALTS2,NEARL,buildRhodesMujicaData,applyRhodesMujica} from '../../server/sim/content/rhodes-mujica/data.js';
import {TERMINAL} from '../../server/sim/content/rhodes-mujica/balance.js';
import {formatBondEffect,richTextPlain} from '../../public/js/ui/richText.js';
import {testBondCalculation} from '../../shared/test-bond-descriptions.js';
import {unitBonds} from '../../server/sim/content/support/index.js';
import {pieceBonds} from '../../server/match/bondsMeta.js';
import {lendItemEffects} from '../../server/sim/content/items/battle.js';
import {EXPANSION_OVERLAY} from '../../server/sim/content/expansion/expansion-records.js';
import {AGLNA2,applyExpansion,buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {state,gainFever,startFever,inFever} from '../../server/sim/content/rhodes-mujica/fever.js';
import {emitNote,updateNotes} from '../../server/sim/content/rhodes-mujica/notes.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {performAttack,effectiveProfile} from '../../server/sim/ai.js';
import {makeMatch,give} from '../match/harness.js';
import {canPlace,positionClass} from '../../server/match/board.js';
import {createRegistry} from '../../server/match/effectsMeta.js';
import {GameData} from '../../server/match/gamedata.js';
import {TestContent} from '../../server/test-content.js';
import {SharedPool,drawDisabledBonds} from '../../server/match/pool.js';
import {createRng} from '../../server/sim/rng.js';
import {normalizeSnapshot,SnapshotBuffer} from '../../public/js/render/interp.js';
import {ASSETS} from '../../server/sim/content/rhodes-mujica/assets.js';
import {buildBattleSpec,createBattleFromSpec} from '../../server/sim/spec.js';
import {buildLoadoutCatalog,matchLoadout} from '../../server/sim/content/expansion/loadout-catalog.js';
import {buildEncyclopediaCatalog} from '../../server/sim/content/expansion/encyclopedia-catalog.js';
import {TEST_OPERATOR_CATALOG} from '../../shared/test-operator-catalog.js';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const Q={warn(){},error(){},info(){}},BASE=getData({log:Q}),DATA=buildRhodesMujicaData(BASE),elite=id=>id.replace(/_a$/,'_b');
const native=name=>Object.values(DATA.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId,PODENCO=native('波登可'),HUMUS=native('休谟斯');
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`),bond=(tier,layers=0)=>({active:true,tier,layers,count:tier*3});
function battle(o={}){const raw=structuredClone(DATA);raw.enemies.enemy_rm_ground=enemyRec({key:'enemy_rm_ground',hp:1e7,speed:0,atk:0});raw.enemies.enemy_rm_air=enemyRec({key:'enemy_rm_air',hp:1e7,speed:0,motion:'FLY'});raw.chess.rm_plain=chessRec({id:'rm_plain',skill:null});const h=makeBattle({data:new DataSource(raw,null),timeLimit:180,autoFinish:false,...o});h.step(2);return h;}
function clean(h){assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);}
function prep(){const h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true,registry:createRegistry({log:Q})}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.layers={};p.bandId=null;p.funds=100;p.recompute();return{h,m,p,put:(id,r,c)=>give(m,p,id,'board',[r,c]),end:()=>m.dispatch(p,'onPrepEnd',{round:m.round})};}
test('RI overlay is idempotent and old multi-bond operators are never retagged',()=>{const before=JSON.stringify(BASE),raw=buildRhodesMujicaData(BASE),once=JSON.stringify(raw);applyRhodesMujica(raw);assert.equal(JSON.stringify(raw),once);assert.equal(JSON.stringify(BASE),before);for(const c of Object.values(BASE.chess))if(c.bonds.length>1)assert.deepEqual(raw.chess[c.chessId].bonds,c.bonds);assert.equal(raw.bonds[RI].visibleMembers.length,13);assert.equal(raw.bonds[GIRL].visibleMembers.length,5);assert.deepEqual(GIRLS.map(id=>raw.chess[id].tier),[2,3,4,5,6]);});
test('RI and Girl use normal ban weight and enter their core/addon draws in solo and coop',()=>{
 assert.equal(DATA.bonds[RI].weight,10);assert.equal(DATA.bonds[GIRL].weight,10);
 for(const mode of ['single','multi'])for(const difficulty of ['normal','hard','abyss','funny']){
  const gd=new GameData(DATA,'mode_'+mode+'_'+difficulty),limits=gd.bans(gd.difficulty),seen=new Set();
  for(let seed=1;seed<=128;seed++){
   const result=drawDisabledBonds(gd,createRng(seed));result.drawn.forEach(id=>seen.add(id));
   assert.equal(result.drawn.filter(id=>gd.bond(id).isCore).length,limits.core);
   assert.equal(result.drawn.filter(id=>!gd.bond(id).isCore).length,limits.addon);
   const off=new Set([...result.drawn,...result.staticOff]);
   for(const id of NEW)assert.equal(result.banned.includes(id),DATA.chess[id].bonds.every(b=>off.has(b)),id);
  }
  assert.equal(seen.has(RI),limits.core>0);assert.ok(seen.has(GIRL),mode+' '+difficulty);
 }
});
test('normal subset bans remove band operators only when both memberships are off and respect other memberships',()=>{
 for(const selected of [[RI],[GIRL],[RI,GIRL]]){
  const raw=structuredClone(DATA);for(const b of Object.values(raw.bonds))b.weight=selected.includes(b.bondId)?10:0;
  const gd=new GameData(raw,'mode_single_hard'),result=drawDisabledBonds(gd,createRng(17)),pool=new SharedPool(gd,{banned:result.banned});
  assert.deepEqual(result.drawn,[...selected].sort());
  for(const id of GIRLS){assert.equal(result.banned.includes(id),selected.length===2,id);assert.equal(pool.has(id),selected.length!==2,id);}
  assert.equal(pool.has(NEARL),!selected.includes(RI));assert.ok(pool.has(AMIYA));assert.ok(pool.has(KALTS2));assert.ok(pool.has(AGLNA2));
 }
});
test('actual match publishes RI/Girl bans and removes banned new operators from its shared pool',()=>{
 const raw=structuredClone(DATA);for(const b of Object.values(raw.bonds))b.weight=[RI,GIRL].includes(b.bondId)?10:0;
 const h=makeMatch({data:raw,mode:'solo',difficulty:'HARD',fake:true,seed:17}).start(),pub=h.m.publicView();
 assert.ok(pub.drawnDisabledBonds.includes(RI));assert.ok(pub.drawnDisabledBonds.includes(GIRL));
 for(const id of [...GIRLS,NEARL]){assert.ok(pub.bannedChess.includes(id));assert.ok(!h.m.pool.has(id));}
 h.m.dispose();
});
for(const base of NEW)for(const id of [base,elite(base)])for(const s of DATA.chess[id].skills)test(`${id} S${s.index+1} executes authored kit without simulation errors`,()=>{const h=battle({units:[{chessId:id,skillIndex:s.index,row:10,col:4},{chessId:'rm_plain',row:11,col:4}],enemies:[{key:'enemy_rm_ground',pos:[10,5]}]}),u=h.unit(id);assert.equal(u.kit.skillSource,'skills');assert.equal(u.skill.baseSpCost,s.spCost);h.unit('rm_plain').hp=500;u.skill.gainSp(999,'test');if(!u.skill.active)u.skill.activate('test');h.run(6);clean(h);});
for(const base of NEW)for(const mid of ['none',...(DATA.chess[elite(base)].modules||[]).map(m=>m.uniEquipId)])test(`${base} module ${mid} is selected with exact original flat stats`,()=>{const h=battle({units:[{chessId:elite(base),moduleId:mid,row:10,col:4}]}),u=h.unit(elite(base)),rec=DATA.chess[elite(base)],mod=rec.modules?.find(m=>m.uniEquipId===mid);close(u.def.stats.atk,rec.statsBase.atk+(mod?.attr.atk||0));close(u.def.stats.maxHp,rec.statsBase.maxHp+(mod?.attr.maxHp||0));clean(h);});
test('RI3 starts at full boosted HP, grows past 60 layers, and Harmony inherits core stats',()=>{const mani=Object.values(DATA.chess).find(c=>!c.isGolden&&c.bonds.includes('maniShip')),h=battle({units:[{chessId:HUMUS,row:10,col:4},{chessId:mani.chessId,row:11,col:4}],bonds:{[RI]:bond(1,100),maniShip:bond(1)}}),u=h.unit(HUMUS);close(u.s.maxHp,u.def.stats.maxHp*1.3);close(u.hp,u.s.maxHp);assert.ok(h.unit(mani.chessId).findBuff('rm:ri:stats'));h.b.addLayers('p1',RI,1);h.run(.1);close(u.s.maxHp,u.def.stats.maxHp*1.302);clean(h);});
test('Girl opening SP is once per battle per operator and carry state is not topped up',()=>{const h=battle({units:[{chessId:AMORIS,row:10,col:4}],bonds:{[GIRL]:bond(2)}}),u=h.unit(AMORIS);close(u.skill.sp,16);h.b.retreat(u);h.b.redeploy(u,{free:true,tile:[10,4]});close(u.skill.sp,1);clean(h);});
test('Girl2 and Girl4 scale own phys/arts and direct heals, exclude true/element/items/regen',()=>{for(const tier of [1,2]){const h=battle({units:[{chessId:AMORIS,row:10,col:4}],bonds:{[GIRL]:bond(tier)},enemies:[{key:'enemy_rm_ground',pos:[10,6]}]}),u=h.unit(AMORIS),e=h.enemy('enemy_rm_ground');h.b.rng=()=>.99;for(const type of ['phys','arts','true','elemental'])close(h.b.dealDamage(u,e,{amount:100,type}),['phys','arts'].includes(type)?tier===1?115:120:100);close(h.b.dealDamage(u,e,{amount:100,type:'arts',tags:['item:test']}),100);u.hp=1;close(h.b.heal(u,u,100),tier===1?115:120);close(h.b.heal(u,u,100,{regen:true}),100);clean(h);}});
test('RI6 normal casts no longer grant cooperative shields or absorption growth',()=>{
 const h=battle({units:[{chessId:HUMUS,row:10,col:4},{chessId:AMIYA,row:11,col:4}],bonds:{[RI]:bond(2,20)},enemies:[{key:'enemy_rm_ground',pos:[10,6]}]}),a=h.unit(HUMUS),z=h.unit(AMIYA),e=h.enemy('enemy_rm_ground');
 for(const u of [a,z]){u.skill.gainSp(999);u.skill.activate();}assert.ok(!a.findBuff('rm:ri:shield'));assert.ok(!z.findBuff('rm:ri:shield'));close(h.b.dealDamage(e,a,{amount:10,type:'true'}),10);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,20);clean(h);
});

test('RI9 no longer adds direct true damage and does not boost item triggers',()=>{const h=battle({units:[{chessId:HUMUS,row:10,col:4},{chessId:AMIYA,row:11,col:4}],bonds:{[RI]:bond(3)},enemies:[{key:'enemy_rm_ground',pos:[10,6]}]}),a=h.unit(HUMUS),z=h.unit(AMIYA),e=h.enemy('enemy_rm_ground');for(const u of [a,z]){u.skill.gainSp(999);u.skill.activate();}close(h.b.dealDamage(a,e,{amount:100,type:'true'}),100);close(h.b.dealDamage(a,e,{amount:100,type:'true',tags:['item:test']}),100);clean(h);});
test('Fever waits for an actual opening at 450, pauses old skill, stops new skill, then gives encore',()=>{const h=battle({units:[{chessId:AMORIS,row:10,col:4},{chessId:DOLRIS,row:11,col:4}],bonds:{[GIRL]:bond(2)}}),a=h.unit(AMORIS),z=h.unit(DOLRIS);a.skill.gainSp(999);a.skill.activate();const left=a.skill.timeLeft;state(h.b,'p1').heat=449;gainFever(h.b,a,1);assert.equal(state(h.b,'p1').heat,450);assert.ok(!inFever(h.b,'p1'));z.skill.gainSp(999);z.skill.activate();assert.ok(inFever(h.b,'p1'));assert.equal(state(h.b,'p1').heat,0);assert.equal(gainFever(h.b,a,99),0);h.run(19);close(a.skill.timeLeft,left);h.run(1.1);assert.ok(!inFever(h.b,'p1'));assert.ok(state(h.b,'p1').encoreUntil>h.b.time);assert.ok(a.skill.active);clean(h);});
test('祥子S2 preserves the tone during Fever and never toggles through a free Fever cast',()=>{const h=battle({units:[{chessId:OBLVNS,skillIndex:1,row:10,col:4}]}),u=h.unit(OBLVNS);state(h.b,'p1').heat=450;u.skill.gainSp(999);u.skill.activate();assert.equal(u.mem.rmOrgan,false);const n=u.skill.activations;h.run(5);assert.equal(u.skill.activations,n);assert.equal(u.mem.rmOrgan,false);clean(h);});
test('Fever fatal protection defers retirement only while 祥子S3 is active',()=>{const h=battle({units:[{chessId:OBLVNS,row:10,col:4},{chessId:MORTIS,row:11,col:4}]}),s=h.unit(OBLVNS),m=h.unit(MORTIS);state(h.b,'p1').heat=450;s.skill.gainSp(999);s.skill.activate();h.b.dealDamage(null,m,{amount:1e8,type:'true'});assert.ok(m.alive);assert.equal(m.hp,1);assert.ok(!m.trait.doll);h.run(20.1);assert.ok(!m.alive);clean(h);});
test('Mortis converts mitigated physical damage and every S2 segment causes self damage',()=>{const h=battle({units:[{chessId:MORTIS,skillIndex:1,row:10,col:4}],enemies:[{key:'enemy_rm_ground',pos:[10,5]}]}),u=h.unit(MORTIS),e=h.enemy('enemy_rm_ground');const hp=u.hp,afterDef=Math.max(1000-u.s.def,50);h.b.dealDamage(e,u,{amount:1000,type:'phys',canDodge:false});close(hp-u.hp,afterDef*.7);close(u.elem?.apoptosis??0,afterDef*.15);u.skill.gainSp(999);u.skill.activate();const before=u.hp;performAttack(h.b,u,effectiveProfile(u),[e]);close(before-u.hp,3*20*(1-u.s.res/100)*.7);clean(h);});
test('Mortis fatal replacement retains S1 and returns to normal after 20 seconds',()=>{const h=battle({units:[{chessId:elite(MORTIS),row:10,col:4}]}),u=h.unit(elite(MORTIS));u.skill.gainSp(999);u.skill.activate();h.b.dealDamage(null,u,{amount:1e8,type:'true'});assert.ok(u.alive&&u.trait.doll);assert.ok(u.skill.active);assert.equal(u.skill.timeLeft,Infinity);assert.ok(u.s.flags.disarm);h.run(20.1);assert.ok(u.alive&&!u.trait.doll);assert.ok(!u.skill.active);clean(h);});
test('Amiya S2 distributes seven segments over distinct selectable enemies',()=>{const h=battle({units:[{chessId:AMIYA,skillIndex:1,row:10,col:4}],enemies:[{key:'enemy_rm_ground',pos:[10,5]},{key:'enemy_rm_ground',pos:[11,5]}],captureNoisy:true}),u=h.unit(AMIYA),es=h.enemies();u.skill.gainSp(999);u.skill.activate();let n=0;h.b.rng=()=>n++%2?.9:0;const before=es.map(e=>e.hp);performAttack(h.b,u,{...effectiveProfile(u),projectile:"none"},[es[0]]);assert.ok(es.every((e,i)=>e.hp<before[i]));clean(h);});
test('Tmoris S2 applies fear only on ground and gains Fever from successful statuses',()=>{const h=battle({units:[{chessId:TMORIS,skillIndex:1,row:10,col:4}],enemies:[{key:'enemy_rm_ground',pos:[10,6]},{key:'enemy_rm_air',route:2,pos:[10,6]}]}),u=h.unit(TMORIS);u.skill.gainSp(999);u.skill.activate();assert.ok(h.enemy('enemy_rm_ground').s.flags.fear);assert.ok(!h.enemy('enemy_rm_air').s.flags.fear);assert.equal(state(h.b,'p1').heat,2);h.run(2);clean(h);});
test('Oblvns notes cache ATK, normal notes hit once, piano pierces, and emitted notes carry attack id',()=>{const h=battle({units:[{chessId:OBLVNS,row:10,col:4}],enemies:[{key:'enemy_rm_ground',pos:[10,5]}]}),u=h.unit(OBLVNS),e=h.enemy('enemy_rm_ground');u.mem.rmNotes=[];const n=emitNote(h.b,u,e,1,'phys'),amount=n.amount;h.b.addBuff(u,{key:'test:atk',mods:{atkPct:1}});close(n.amount,amount);n.x=e.x;n.y=e.y;n.state='track';const hp=e.hp;updateNotes(h.b,u,.05,new Set(u.rangeKeys));assert.equal(u.mem.rmNotes.length,0);close(hp-e.hp,amount);assert.equal(n.attackId,u.mem.rmAttackId||0);clean(h);});
test('Prep growth settles once and never grows from hand or inactive RI',()=>{const {m,p,put,end}=prep();put(DOLRIS,9,3);put(HUMUS,9,4);put(AMIYA,10,4);p.recompute();end();assert.equal(p.layers[RI],3);end();assert.equal(p.layers[RI],3);p.layers={};p.board.clear();put(HUMUS,9,4);p.recompute();m.round=2;end();assert.ok(!p.layers[RI]);});
test('Kaltsit start offer uses native Podenco after T1 Fang retirement, and milestones grant once',()=>{const {m,p,put,end}=prep();p.bandId='band_rm_kaltsit';m.dispatch(p,'onPrepStart',{round:1});assert.equal(p.offers.length,1);for(const c of p.offers[0].options||p.offers[0].ids||[])assert.equal(c.id||c,PODENCO);put(DOLRIS,9,3);put(HUMUS,9,4);put(AMIYA,10,4);p.recompute();end();assert.equal(p.layers[RI],7);end();assert.equal(p.layers[RI],7);});
test('Closure gives exactly one three-distinct normal equipment offer in round 3',()=>{const {m,p}=prep();p.bandId='band_rm_closure';m.round=3;m.dispatch(p,'onPrepStart',{round:3});m.dispatch(p,'onPrepStart',{round:3});assert.equal(p.offers.length,1);});
test('Ready RI batch is private by default, rejects old client choices, composes with Sui and all economic batches',()=>{
 const tc=new TestContent(),room={mode:'coop',difficulty:'HARD'},menu=tc.menu(room),off=tc.resolve({version:menu.version,ids:[]},room,BASE);assert.equal(off.data,BASE);assert.equal(off.manifest,null);
 assert.ok(!tc.menu(room,{admin:false}).items.some(i=>i.id===BATCH));assert.ok(menu.items.find(i=>i.id===BATCH).enabled);
 const x=tc.resolve({version:menu.version,ids:[BATCH,'arknights-expansion-v1','extended-rounds-24','shop-extra-slot','coop-pool-150']},room,BASE);
 assert.equal(x.manifest.clientVersion,27);assert.equal(x.manifest.batches.length,5);assert.ok(x.data.chess[PODENCO]&&x.data.chess.chess_exp_shu_a);assert.equal(new GameData(x.data,'mode_multi_hard').lastRound,24);
 const gd=new GameData(x.data,'mode_multi_hard'),pool=new SharedPool(gd);assert.equal(pool.cap(OBLVNS),8);assert.equal(pool.cap(PODENCO),18);
 assert.throws(()=>tc.resolve({version:'old',ids:[BATCH]},room,BASE));assert.deepEqual(TEST_OPERATOR_CATALOG.filter(r=>r.batch===BATCH&&![AGLNA2,KALTS2,NEARL].includes(r.baseId)).map(r=>r.baseId),GIRLS);
});
test('New pool counts follow tier inventory, exhaustion cannot be bypassed by Kaltsit offers',()=>{const {m,p}=prep();p.bandId='band_rm_kaltsit';for(const id of m.gd.visibleChess)if(m.gd.tierOf(id)===1&&m.gd.chess(id).bonds.includes(RI))m.pool.take(id,999);m.dispatch(p,'onPrepStart',{round:1});assert.equal(p.offers.length,0);assert.equal(p.shop.freeRefreshes,1);const pool=new SharedPool(new GameData(DATA,'mode_single_normal'));for(const id of NEW)assert.equal(pool.cap(id),DATA.config.economy.poolCopies[DATA.chess[id].tier]);});
test('Configuration catalog exposes new choices without making disabled operators legal in a formal match',()=>{const cat=buildLoadoutCatalog(BASE);assert.ok(cat.chess[OBLVNS]);assert.equal(BASE.chess[OBLVNS],undefined);assert.deepEqual(matchLoadout({[OBLVNS]:{skill:1,module:'none'}},BASE.chess),{});assert.deepEqual(Object.keys(cat).sort(),['assets','bonds','chess']);});
test('All referenced assets are local, parsed battle roles exist and the three-star elite portrait uses the native E1 image',()=>{
 function walk(v){if(typeof v==='string'&&v.startsWith('/assets/'))assert.ok(existsSync(fileURLToPath(new URL('../../public'+v,import.meta.url))),v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);}walk(ASSETS);
 for(const a of Object.values(ASSETS.chars))for(const s of Object.values(a.spine)){assert.ok(s.skel.includes('/spine/op/'));assert.ok(s.animations[s.anims.idle]>=0);assert.ok(s.bounds.width>0);}
 assert.equal(ASSETS.chars.char_123_fang.portrait,ASSETS.chars.char_123_fang.portraitE2);assert.ok(!ASSETS.chars.char_4184_dolris.spine.back);
});
test('Fever snapshot survives interpolation and a malformed note position is rejected without changing element data',()=>{
 const h=battle({units:[{chessId:OBLVNS,row:10,col:4}]});h.run(.2);const snap=h.b.snapshot(),n=normalizeSnapshot(snap);assert.ok(n.units.get(h.unit(OBLVNS).id)[13]);
 const buf=new SnapshotBuffer();buf.push(snap,0);const samples=buf.sample(snap.t,new Map());assert.ok(samples.get(h.unit(OBLVNS).id).rm);
 snap.rm[0][7].push([999,Infinity,NaN,'arts']);const validated=normalizeSnapshot(snap);assert.ok(validated.units.get(h.unit(OBLVNS).id)[13].positions.every(p=>Number.isFinite(p[1])));clean(h);
});
test('Native Fever and covenant bonuses stay with their owner in a shared field',()=>{
 const h=battle({kind:'unite',players:[{playerId:'p1',board:{r0:9,r1:12,c0:2,c1:10},units:[{chessId:AMORIS,uid:1,row:10,col:4}],bonds:{[GIRL]:bond(2)}},{playerId:'p2',board:{r0:9,r1:12,c0:11,c1:18},units:[{chessId:AMORIS,uid:2,row:10,col:14}],bonds:{}}]});
 const a=h.unit(1),z=h.unit(2);gainFever(h.b,a,100);close(state(h.b,'p1').heat,130);close(state(h.b,'p2').heat,0);assert.ok(a.skill.sp>=15&&z.skill.sp<15);clean(h);
});
test('Directly carried operators do not receive a new opening grant on subsequent redeployment',()=>{const h=battle({units:[{chessId:AMORIS,row:10,col:4,carryState:{hpRatio:1,sp:7,skillActive:false}}],bonds:{[GIRL]:bond(2)}}),u=h.unit(AMORIS);assert.ok(u.skill.sp<15);h.b.retreat(u);h.b.redeploy(u,{free:true,tile:[10,4]});assert.ok(u.skill.sp<15);clean(h);});
test('Kaltsit pays both milestones only once and only a paid refresh changes a chess slot',()=>{
 const {m,p,put,end}=prep();p.bandId='band_rm_kaltsit';const ids=[KALTS2,HUMUS,AMIYA,DOLRIS,AMORIS,MORTIS];ids.forEach((id,i)=>put(id,9+Math.floor(i/4),3+i%4));p.recompute();end();assert.equal(p.counters['rm:kaltsit:3'],1);assert.equal(p.counters['rm:kaltsit:6'],1);const n=p.layers[RI];end();assert.equal(p.layers[RI],n);
 p.shop.slots=[{kind:'chess',id:HUMUS,sold:false},{kind:'item',id:'test',sold:false}];m.dispatch(p,'onRefresh',{free:true,price:0});assert.equal(p.counters['rm:kaltsit:refresh']||0,0);m.dispatch(p,'onRefresh',{free:false,price:1});assert.equal(p.counters['rm:kaltsit:refresh'],1);assert.ok(DATA.chess[p.shop.slots[0].id].bonds.includes(RI));assert.equal(p.shop.slots[1].kind,'item');
});
test('Closure battle bonuses count real equipped items, stay owner-specific and exclude true damage',()=>{
 const h=battle({units:[{chessId:HUMUS,items:[],row:10,col:4}],enemies:[{key:'enemy_rm_ground',pos:[10,6]}],bandId:'band_rm_closure'}),u=h.unit(HUMUS),e=h.enemy('enemy_rm_ground');u.items=['test-real-1'];const hp=u.hp;h.b.dealDamage(e,u,{amount:100,type:'arts',canDodge:false});close(hp-u.hp,90);u.items.push('test-real-2');close(h.b.dealDamage(u,e,{amount:100,type:'arts'}),112);close(h.b.dealDamage(u,e,{amount:100,type:'true'}),100);clean(h);
});
test('Amoris recognizes a real elite fusion alongside native RI members',()=>{
 const {m,p,put,end}=prep();put(PODENCO,9,3);put(HUMUS,9,4);put(AMIYA,10,4);put(AMORIS,10,3);p.recompute();p.acquireChess(DOLRIS,{source:'buy'});p.acquireChess(DOLRIS,{source:'buy'});p.acquireChess(DOLRIS,{source:'buy'});assert.equal(p.counters['rm:amoris:eligible'],1);end();assert.equal(p.layers[RI],7);
});
test('The full eight-family field is deterministic under the same random seed',()=>{
 const opts={seed:173,units:NEW.map((chessId,i)=>({chessId,row:9+Math.floor(i/4),col:3+i%4})),bonds:{[RI]:bond(2,30),[GIRL]:bond(2)},enemies:[{key:'enemy_rm_ground',pos:[10,7]},{key:'enemy_rm_ground',pos:[9,7]},{key:'enemy_rm_air',route:2,pos:[11,7]}]};
 const a=battle(opts),b=battle(opts);a.run(35);b.run(35);assert.deepEqual(a.b.snapshot(),b.b.snapshot());assert.deepEqual(a.result(),b.result());clean(a);clean(b);
});
test('RI9 uses the real personnel-document expansion; default eight slots cannot silently reach it',()=>{
 const {m,p,put}=prep();NEW.slice(0,8).forEach((id,i)=>put(id,9+Math.floor(i/4),3+i%4));p.recompute();
 assert.equal(p.deployCap,8);assert.equal(p.bonds[RI].count,8);assert.equal(p.bonds[RI].tier,2);
 const c=Object.values(DATA.chess).find(c=>c.name==='波登可'&&!c.isGolden),ninth=p.acquireChess(c.chessId),map=m.deployMapFor(p);
 const tile=[...map.keys()].map(k=>k.split(',').map(Number)).find(([row,col])=>!p.board.has(`${row},${col}`)&&canPlace(map,positionClass(c),row,col));assert.ok(tile);
 assert.ok(!p.move(ninth.uid,{area:'board',row:tile[0],col:tile[1]},'RIGHT').ok);
 const item=p.acquireItem('chess_item_6_08_e_a');assert.ok(p.equip(item.uid,[...p.board.values()][0].uid).ok);assert.equal(p.deployCap,9);
 assert.ok(p.move(ninth.uid,{area:'board',row:tile[0],col:tile[1]},'RIGHT').ok);p.recompute();assert.equal(p.bonds[RI].count,9);assert.equal(p.bonds[RI].tier,3);
});

test('RI6 has direct offense before rally and the widened window grants only its owner a non-stacking burst',()=>{
 const h=battle({units:[{chessId:HUMUS,row:10,col:4},{chessId:AMIYA,row:11,col:4}],bonds:{[RI]:bond(2,40)},enemies:[{key:'enemy_rm_ground',pos:[10,6]}]}),a=h.unit(HUMUS),z=h.unit(AMIYA),e=h.enemy('enemy_rm_ground');
 for(const type of ['arts','true'])close(h.b.dealDamage(a,e,{amount:100,type}),100);
 a.skill.gainSp(999);a.skill.activate();h.run(7);z.skill.gainSp(999);z.skill.activate();assert.ok(!a.findBuff('rm:ri:offense'));assert.ok(!a.findBuff('rm:ri:shield'));close(h.b.dealDamage(a,e,{amount:100,type:'true'}),100);
 for(const tags of [['item'],['item:trigger'],['bond'],['bond:trigger']])close(h.b.dealDamage(a,e,{amount:100,type:'true',tags}),100);
 close(h.b.dealDamage(a,e,{amount:100,type:'true',sourceless:true,tags:['burst','necrosis']}),100);clean(h);
});
test('RI9 normal and free casts do not grant the removed cooperative shield',()=>{
 const h=battle({units:[{chessId:HUMUS,row:10,col:4},{chessId:AMIYA,row:11,col:4}],bonds:{[RI]:bond(3,40)}}),a=h.unit(HUMUS),z=h.unit(AMIYA);
 for(const reason of ['test','carry','rm:fever'])for(const u of [a,z])h.b.emit('skillStart',{unit:u,reason});
 assert.ok(!a.findBuff('rm:ri:shield'));assert.ok(!z.findBuff('rm:ri:shield'));assert.equal(h.b.getPlayer('p1').bonds[RI].layers,40);clean(h);
});

test('Resolved RI text shows current numbers and only the currently active tier',()=>{
 const six=richTextPlain(formatBondEffect(DATA.bonds[RI],40,2,{atk:0})),nine=richTextPlain(formatBondEffect(DATA.bonds[RI],40,3,{atk:0}));
 for(const value of ['18%','180'])assert.ok(six.includes(value));assert.ok(!six.includes('协同')&&!nine.includes('屏障'));assert.ok(nine.includes('18%'));assert.ok(nine.includes('180'));assert.ok(!/[{}]/.test(six+nine));
 assert.ok(richTextPlain(testBondCalculation(DATA.bonds[RI],40,3,{atk:0})).includes('4%'));
 assert.ok(richTextPlain(testBondCalculation(DATA.bonds[RI],800,3,{atk:0})).includes('100%'));
});
test('The terminal is opt-in T4 equipment, grants RI with either-quality Isomorph and drops membership when replaced',()=>{
 const plain=Object.values(DATA.chess).find(c=>!c.isGolden&&c.visible&&!c.bonds.includes(RI));
 assert.equal(BASE.items[TERMINAL+'_a'],undefined);assert.equal(DATA.items[TERMINAL+'_a'].tier,4);
 for(const quality of ['a','b'])for(const isoQuality of ['a','b']){const {m,p,put}=prep(),u=put(plain.chessId,10,4),terminal=p.acquireItem(TERMINAL+'_'+quality),iso=p.acquireItem('chess_item_6_09_e_'+isoQuality);assert.ok(p.equip(terminal.uid,u.uid).ok);assert.ok(!pieceBonds(m.gd,u).includes(RI));assert.ok(p.equip(iso.uid,u.uid).ok);assert.ok(pieceBonds(m.gd,u).includes(RI));const other=Object.values(DATA.items).find(i=>i.itemType==='EQUIP'&&!i.isGolden&&!i.canGiveBond&&i.giveBondId!==RI);const replacement=p.acquireItem(other.id);assert.ok(p.equip(replacement.uid,u.uid,terminal.uid).ok);assert.ok(!pieceBonds(m.gd,u).includes(RI));}
});
test('Terminal stats and opening SP use the existing equipment scope without granting Girl membership',()=>{
 const plain=Object.values(DATA.chess).find(c=>!c.isGolden&&c.visible&&!c.bonds.includes(RI));
 const h=battle({units:[{chessId:plain.chessId,items:[TERMINAL+'_a','chess_item_6_09_e_a'],row:10,col:4}],bonds:{[RI]:bond(1)}}),u=h.unit(plain.chessId);
 assert.ok(unitBonds(u).includes(RI));assert.ok(!unitBonds(u).includes(GIRL));close(u.s.atk/u.def.stats.atk,1.22);assert.ok(u.skill.sp>=10);h.b.retreat(u);h.b.redeploy(u,{free:true,tile:[10,4]});assert.ok(u.skill.sp<10);clean(h);
});
test('retired Ceobe cannot enter either pool or loadout; Kalts2 has three medical skills',()=>{assert.ok(!Object.values(DATA.chess).some(c=>c.charId==='char_2013_cerber'));assert.equal(DATA.chess[KALTS2].tier,5);assert.equal(DATA.chess[KALTS2].profession,'MEDIC');assert.equal(DATA.chess[KALTS2].skills.length,3);});

test('Borrowed terminal stats expire and refresh without accumulating or transferring covenant membership',()=>{
 const h=battle({units:[{chessId:HUMUS,items:[TERMINAL+'_b'],row:10,col:4},{chessId:'rm_plain',row:11,col:4}]}),from=h.unit(HUMUS),to=h.unit('rm_plain'),atk=to.s.atk;
 assert.equal(lendItemEffects(h.b,from,to,{duration:2}),1);close(to.s.atk,atk*1.2);assert.ok(!unitBonds(to).includes(RI));
 assert.equal(lendItemEffects(h.b,from,to,{duration:2}),1);close(to.s.atk,atk*1.2);h.run(2.1);close(to.s.atk,atk);clean(h);
});

test('Standing elites and native Podenco support recurring growth without retired operators',()=>{
 const {m,p,put,end}=prep();put(elite(PODENCO),9,3);put(elite(HUMUS),9,4);put(elite(AMIYA),10,4);put(elite(AMORIS),10,3);p.recompute();
 p.acquireChess(DOLRIS,{source:'buy'});end();assert.equal(p.layers[RI],13);m.round=2;p.acquireChess(DOLRIS,{source:'buy'});end();assert.equal(p.layers[RI],26);
 assert.equal(p.counters['rm:growth:round'],2);
});

test('Angelina remains in the RI test package without native RI, retains her old bonds and traits, and the Sui-only batch excludes her',()=>{
 const sui=buildExpansionData(BASE);assert.equal(sui.chess[AGLNA2],undefined);const native=EXPANSION_OVERLAY.chess[AGLNA2].bonds;
 for(const data of [DATA,applyRhodesMujica(structuredClone(sui)),applyExpansion(buildRhodesMujicaData(BASE))]){
  for(const id of [AGLNA2,elite(AGLNA2)]){assert.deepEqual(data.chess[id].bonds,native);assert.equal(data.chess[id].expansionBatch,BATCH);}
  assert.equal(data.bonds[RI].visibleMembers.length,13);
  const opts={data:new DataSource(data,null),units:[{chessId:AGLNA2,row:10,col:4}]},a=makeBattle(opts),h=makeBattle({...opts,bonds:{[RI]:bond(1,40)}});a.step(2);h.step(2);close(h.unit(AGLNA2).s.atk-a.unit(AGLNA2).s.atk,0);clean(h);
 }
 const catalog=buildLoadoutCatalog(BASE);assert.ok(!catalog.chess[AGLNA2].bonds.includes(RI));assert.equal(catalog.chess[AGLNA2].expansionBatch,BATCH);
 assert.ok(!catalog.bonds[RI].visibleMembers.includes(AGLNA2));assert.equal(TEST_OPERATOR_CATALOG.find(r=>r.baseId===AGLNA2).batch,BATCH);
 const {m,p,put,end}=prep();put(AGLNA2,10,4);const other=Object.values(DATA.chess).find(c=>!c.isGolden&&c.visible&&c.chessId!==AGLNA2&&c.bonds.includes('skillfulShip'));put(other.chessId,10,5);p.recompute();assert.ok(p.bonds.skillfulShip.active);end();assert.equal(p.layers.skillfulShip,1);end();assert.equal(p.layers.skillfulShip,1);
});


test('retired Fang/Beagle disappear from match, simulator, loadout and pool; five original RI families remain',()=>{
 const catalog=buildLoadoutCatalog(BASE),gd=new GameData(DATA,'mode_single_normal');
 for(const key of ['fang','beagle'])for(const suffix of ['a','b']){const id='chess_rm_'+key+'_'+suffix;assert.equal(DATA.chess[id],undefined);assert.equal(catalog.chess[id],undefined);assert.equal(new DataSource(DATA,null).rawChess(id),null);assert.ok(!gd.visibleChess.includes(id));}
 assert.equal(NEW.length,9);assert.equal(DATA.bonds[RI].visibleMembers.length,13);
 for(const name of ['波登可','休谟斯','寒芒克洛丝','泥岩','妮芙']){
  const id=native(name),before=BASE.chess[id],after=DATA.chess[id];assert.ok(after.bonds.includes(RI));assert.deepEqual(after.skills,before.skills);assert.deepEqual(after.stats,before.stats);assert.ok(before.garrisonIds.every(g=>after.garrisonIds.includes(g)));assert.ok(before.garrisonIds.every(g=>JSON.stringify(DATA.garrisons[g])===JSON.stringify(BASE.garrisons[g])));
 }
 const oldPreferences={chess_rm_fang_a:{skillIndex:0},chess_rm_beagle_b:{skillIndex:0},[AMIYA]:{skillIndex:1}};assert.deepEqual(Object.keys(matchLoadout(oldPreferences,DATA.chess)),[AMIYA]);
});

test('Theresa and Warfarin retain their complete original families but no native RI tags, counts or added traits',()=>{
 const before=JSON.stringify(BASE),catalogs=[DATA,buildLoadoutCatalog(BASE),buildEncyclopediaCatalog(BASE),applyExpansion(buildRhodesMujicaData(BASE)),applyRhodesMujica(buildExpansionData(BASE))];
 const originals=Object.values(BASE.chess).filter(c=>['魔王','华法琳'].includes(c.name));assert.ok(originals.length>=4);
 for(const data of catalogs){
  assert.equal(data.bonds[RI].visibleMembers.length,13);
  for(const c of originals){
   const actual=data.chess[c.chessId];assert.deepEqual(actual.bonds.filter(b=>!['kazdelShip','bloodlineShip'].includes(b)),c.bonds);assert.ok(!actual.bonds.includes(RI));
   if(actual.garrisonIds[0]?.startsWith('kz_personal_')){const g=data.garrisons[actual.garrisonIds[0]],old=BASE.garrisons[c.garrisonIds[0]];assert.deepEqual(g.bb,old.bb);assert.equal(g.effectKey,old.effectKey);assert.ok(g.desc.includes(old.desc));}else assert.deepEqual(actual.garrisonIds,c.garrisonIds);assert.deepEqual(actual.skills,c.skills);assert.deepEqual(actual.stats,c.stats);
   assert.ok(!data.bonds[RI].members.includes(c.chessId));assert.ok(!data.bonds[RI].visibleMembers.includes(c.chessId));
  }
 }
 assert.ok(!Object.keys(DATA.garrisons).some(id=>id.startsWith('rm_old_warfarin')));
 const {h,m,p,put}=prep();for(const [i,id]of [native('魔王'),native('华法琳'),HUMUS,DOLRIS].entries())put(id,9,3+i);
 assert.equal(p.bonds[RI].count,2);assert.equal(p.bonds[RI].active,false);h.invariants();m.dispose();assert.equal(JSON.stringify(BASE),before);
});
test('Podenco extra prep growth counts the strongest same-family copy only, excludes hand and inactive RI',()=>{
 const {m,p,put,end}=prep();put(PODENCO,9,3);put(elite(PODENCO),9,4);put(HUMUS,10,3);put(AMIYA,10,4);p.recompute();p.layers[RI]=10;const start=p.layers[RI];end();
 // Native highest-active trait: 1+2; RI composition 1, Amiya 2, new strongest Podenco 2.
 assert.equal(p.layers[RI]-start,8);
 const a=prep();a.put(DOLRIS,9,3);a.put(HUMUS,9,4);a.put(AMIYA,10,4);a.p.acquireChess(PODENCO);a.p.recompute();a.p.layers[RI]=10;a.end();assert.equal(a.p.layers[RI],14); // native hand trait still +1; no new hand bonus
 const z=prep();z.put(PODENCO,9,3);z.p.recompute();z.end();assert.equal(z.p.layers[RI]||0,0);
});
for(const golden of [false,true])test('native combat RI growth caps retain original target bonds ('+(golden?'elite':'normal')+')',()=>{
 const scale=golden?2:1,humus=golden?elite(HUMUS):HUMUS,gavial=golden?elite(native('百炼嘉维尔')):native('百炼嘉维尔');
 const h=battle({units:[{chessId:humus,row:10,col:4},{chessId:gavial,row:11,col:4}],bonds:{[RI]:bond(2),'raidShip':bond(1),'sargonShip':bond(1)}}),u=h.unit(humus),g=h.unit(gavial);
 for(let i=0;i<16;i++){const e=h.spawn('enemy_rm_ground',{pos:[10,6]});h.b.dealDamage(u,e,{amount:1e8,type:'true',canDodge:false});}
 assert.equal(h.b.getPlayer('p1').bonds[RI].layers,8*scale);assert.equal(h.b.getPlayer('p1').bonds.raidShip.layers,8*scale);
 for(let i=0;i<6;i++)h.b.emit('skillStart',{unit:g,reason:'test'});
 assert.equal(h.b.getPlayer('p1').bonds[RI].layers,8*scale);assert.equal(h.b.getPlayer('p1').bonds.sargonShip.layers,54*scale);clean(h);
});
for(const golden of [false,true])test('Warfarin keeps only her original front-ally trait without the removed RI bonus ('+(golden?'elite':'normal')+')',()=>{
 const scale=golden?2:1,warfarin=golden?elite(native('华法琳')):native('华法琳');
 const h=battle({units:[{chessId:warfarin,row:10,col:3,dir:'RIGHT'},{chessId:AMIYA,row:10,col:4}],bonds:{[RI]:bond(1)}}),u=h.unit(AMIYA);
 for(let i=0;i<20;i++)h.b.emit('skillStart',{unit:u,reason:'test'});
 // Her original trait can still grow a front ally's bonds; the extra 8/16 RI trait is removed.
 assert.equal(h.b.getPlayer('p1').bonds[RI].layers,12*scale);clean(h);
 const absent=battle({units:[{chessId:warfarin,row:10,col:3,dir:'RIGHT'},{chessId:'rm_plain',row:10,col:4}],bonds:{[RI]:bond(1)}});
 for(let i=0;i<5;i++)absent.b.emit('skillStart',{unit:absent.unit('rm_plain'),reason:'test'});assert.equal(absent.b.getPlayer('p1').bonds[RI].layers,0);clean(absent);
});
test('new combat traits respect inactive RI and the existing final-assault layer lock',()=>{
 for(const o of [{bonds:{}},{kind:'boss',bonds:{[RI]:bond(2)}}]){
  const id=native('百炼嘉维尔'),h=battle({...o,units:[{chessId:id,row:o.kind==='boss'?3:10,col:4}]});for(let i=0;i<5;i++)h.b.emit('skillStart',{unit:h.unit(id),reason:'test'});assert.equal(h.b.getPlayer('p1').bonds[RI]?.layers||0,0);clean(h);
 }
});
