import {test} from 'node:test';import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildKazdelData,CORE,BLOOD,FLAG} from '../../server/sim/content/kazdel/data.js';
import {makeBattle,chessRec,enemyRec} from '../helpers/battleHarness.js';
import * as rules from '../../shared/kazdel-rules.js';
import {compactResult,fitResult} from '../../server/sim/spec.js';
import {sanitizeKazdelResult} from '../../server/sim/content/kazdel/result.js';
import {pendingGrowth} from '../../server/sim/content/kazdel/meta.js';
const data=buildKazdelData(getData());
for(let i=0;i<10;i++)data.chess['kz53_'+i+'_a']=chessRec({id:'kz53_'+i+'_a',bonds:[CORE],stats:{maxHp:2000,atk:100,def:0,blockCnt:0,cost:0},skill:null});
data.chess.kz53_external_a=chessRec({id:'kz53_external_a',bonds:[],stats:{maxHp:2000,atk:100,def:0,blockCnt:0,cost:0},skill:null});
data.enemies.kz53_ground=enemyRec({key:'kz53_ground',hp:1e8,atk:0,def:0,res:0,speed:0});
data.enemies.kz53_air=enemyRec({key:'kz53_air',hp:1e8,atk:0,def:0,res:0,speed:0,motion:'FLY'});
const close=(a,z)=>assert.ok(Math.abs(a-z)<1e-4,`${a} ≈ ${z}`);
function combat(tier=1,L=0,opts={}){
 const h=makeBattle({defs:data,units:[{chessId:'kz53_0_a',uid:1,row:10,col:5,dir:'RIGHT'}],bonds:{[CORE]:{active:true,tier,layers:L,count:[3,6,9][tier-1]}},enemies:[{key:'kz53_ground',pos:[10,6]}],autoFinish:false,timeLimit:60,...opts,setup:b=>b.on('battleStart',()=>{for(const u of b.allyUnits)u.atkCd=1e5;},{priority:-10000})});h.step();h.b.projectiles.clear();const st=h.b.kazdel.states.get('p1');st.releaseReady=999;return{h,b:h.b,u:h.unit(1),st,e:h.enemy()};
}
const attack=(c,u=c.u,e=c.e,id=++c.b._attackSeq,n=100)=>c.b.dealDamage(u,e,{amount:n,type:'phys',isAttack:true,attackId:id,canDodge:false});
for(const tier of [1,2,3])test(`tier ${tier}: opening fire, capacity and budget agree with the same roster`,()=>{
 const {h,u,st}=combat(tier);const H=u.s.maxHp;close(st.K,rules.storageCapacity(st.C,1,H));close(st.Q,rules.openingFire(tier,st.C,H));close(st.generated,st.Q);close(st.B,rules.generationBudget(tier,0,st.K0));assert.deepEqual(h.b.errors,[]);
});
test('distinct members count once, virtual population and temporary HP do not inflate capacity',()=>{
 const c=combat(2,40,{units:[{chessId:'kz53_0_a',uid:1,row:10,col:5},{chessId:'kz53_0_a',uid:2,row:11,col:5},{chessId:'kz53_1_a',uid:3,row:12,col:5}]});assert.equal(c.st.N,2);const old=c.st.K;c.b.addBuff(c.u,{key:'test:tempHp',mods:{hpPct:5},duration:5});c.h.run(.04);close(c.st.K,old);c.b.addBuff(c.u,{key:'test:permanentHp',mods:{hpFlat:500},persist:true});c.h.run(.04);assert.ok(c.st.K>old);c.b.retreat(c.h.unit(3));c.h.run(.04);assert.equal(c.st.N,1);assert.ok(c.st.K<old);
});
test('full-pool overflow does not waste generation allowance',()=>{const c=combat();c.st.Q=c.st.K;const before=c.st.generated;c.b.loseHp(c.u,100,{source:c.u});close(c.st.generated,before);c.st.Q-=100;c.b.heal(c.u,c.u,100,{self:true});assert.ok(c.st.generated>before);});
test('successful skill cycle loses 10%, restores twice in one game second, and never drops below one',()=>{
 const c=combat();c.b.kazdel.suspend(()=>c.u.hp=1000);c.b.emit('skillStart',{unit:c.u,reason:'ready'});close(c.u.hp,900);c.h.run(.5);assert.ok(c.u.hp>990&&c.u.hp<1010);c.h.run(.55);close(c.u.hp,1100);close(c.st.metrics.skillLoss,100);close(c.st.metrics.skillRecovery,200);assert.ok(c.st.flow.kz53_0_a.units[1].amount>=300-1e-5);close(c.st.flow.kz53_0_a.units[1].bloodAmount,0);
 c.b.kazdel.suspend(()=>c.u.hp=1);c.b.emit('skillStart',{unit:c.u,reason:'ready'});close(c.u.hp,1);const hp=c.u.hp;c.b.emit('skillStart',{unit:c.u,reason:'carry'});close(c.u.hp,hp);
});
test('six and nine accelerate only normal SP, leaving gifts unchanged',()=>{for(const tier of [1,2,3]){const c=combat(tier);for(const reason of ['time','attack','hurt','gift','init']){const v={unit:c.u,reason,amount:1};c.b.emit('spGain',v);close(v.amount,tier>=2&&['time','attack','hurt'].includes(reason)?1.2:1);}}});
test('damage charge, follow-up and tags cannot recursively generate more fire',()=>{
 const c=combat(1);c.st.guardReady=999;c.st.Q=1000;const before=c.st.generated;attack(c);c.h.run(.04);close(c.st.generated-before,10);close(c.st.metrics.release,30);close(c.st.metrics.followUp,36);assert.equal(c.st.metrics.meleeProcs,0);
});
test('effective native healing gives the recipient a single four-second stronger conversion',()=>{
 const c=combat(1);c.st.guardReady=999;c.b.kazdel.suspend(()=>c.u.hp=1000);c.b.heal(c.u,c.u,100,{self:true});assert.ok(c.st.marks.has(c.u.uid));attack(c);c.h.run(.04);close(c.st.metrics.release,45);assert.ok(!c.st.marks.has(c.u.uid));c.h.run(.55);attack(c);c.h.run(.04);close(c.st.metrics.release,75);
});
test('six-person blood vortex hits the full front area including air and uses its own two-second CD',()=>{
 const c=combat(2),air=c.h.spawn('kz53_air',{pos:[10,6.2]}),behind=c.h.spawn('kz53_ground',{pos:[10,4]});const hp=air.hp;attack(c);c.h.run(.04);assert.ok(air.hp<hp);close(behind.hp,1e8);assert.equal(c.st.metrics.meleeProcs,1);attack(c);c.h.run(.5);assert.equal(c.st.metrics.meleeProcs,1);c.h.run(1.6);attack(c);c.h.run(.04);assert.equal(c.st.metrics.meleeProcs,2);
});
test('cooldowns are independent for two melee operators',()=>{
 const c=combat(2,0,{units:[{chessId:'kz53_0_a',uid:1,row:10,col:5,dir:'RIGHT'},{chessId:'kz53_1_a',uid:2,row:11,col:5,dir:'RIGHT'}]});attack(c);attack(c,c.h.unit(2));c.h.run(.04);assert.equal(c.st.metrics.meleeProcs,2);
});
test('nine-person sword flies to five tiles, pierces each target once and has one-second CD',()=>{
 const c=combat(3,0,{units:[{chessId:'kz53_0_a',uid:1,row:10,col:3,dir:'RIGHT'}]}),air=c.h.spawn('kz53_air',{pos:[10,8]}),outside=c.h.spawn('kz53_ground',{pos:[10,10]});const hits=[];c.b.on('damageResolved',v=>{if(v.target===air&&v.dmg.tags?.includes('kz:sword'))hits.push(c.b.time);});attack(c);c.h.run(.2);close(air.hp,1e8);c.h.run(.65);assert.ok(air.hp<1e8);assert.equal(hits.length,2);close(outside.hp,1e8);assert.equal(c.st.metrics.meleeProcs,1);c.h.run(.25);attack(c);c.h.run(.04);assert.equal(c.st.metrics.meleeProcs,2);
});
test('a valid identity conversion obtains vortex and an external unconverted melee does not',()=>{
 const morph=Object.values(data.items).find(i=>i.canGiveBond&&!i.isGolden).id;
 for(const converted of [false,true]){const c=combat(2,0,{units:[{chessId:'kz53_external_a',uid:1,row:10,col:5,dir:'RIGHT',items:converted?[morph,FLAG+'_a']:[]}]});attack(c);c.h.run(.04);assert.equal(c.st.metrics.meleeProcs,converted?1:0);assert.equal(c.st.N,converted?1:0);}
});
test('one native multi-target action produces one wave, not one wave per target',()=>{const c=combat(2),e2=c.h.spawn('kz53_ground',{pos:[10,6.2]}),id=++c.b._attackSeq;attack(c,c.u,c.e,id);attack(c,c.u,e2,id);c.h.run(.04);assert.equal(c.st.metrics.meleeProcs,1);});
test('no remaining eligible wave target refunds its paid fire and conversion allowance',()=>{const c=combat(2);c.st.guardReady=999;attack(c);c.b.addBuff(c.e,{key:'test:invulnerable',flags:{invulnerable:true},duration:3});const allowance=c.st.E;c.h.run(.04);close(c.st.metrics.release,0);assert.ok(c.st.E>=allowance);});
test('cancelled ordinary follow-up also refunds fire; consumed shields commit a wave even without HP loss',()=>{const c=combat(1);attack(c);c.b.addBuff(c.e,{key:'test:invulnerable',flags:{invulnerable:true},duration:3});c.h.run(.04);close(c.st.metrics.release,0);const d=combat(2);d.b.addBuff(d.e,{key:'test:shield',shield:5000,duration:5});attack(d);const hp=d.e.hp;d.h.run(.04);close(d.e.hp,hp);assert.ok(d.st.metrics.release>0);});
test('zero-layer nine-person resonance upgrades paid damage only, with six/16-second timing',()=>{const c=combat(3);c.st.Q=1.1*c.st.C;c.b.emit('skillStart',{unit:c.u,reason:'ready'});assert.equal(c.st.metrics.resonances,1);close(c.st.resonanceUntil-c.b.time,6);close(c.st.resonanceReady-c.b.time,16);c.b.emit('skillStart',{unit:c.u,reason:'ready'});assert.equal(c.st.metrics.resonances,1);});
test('natural decay waits eight seconds after actual enemies, then decays stored fire without restoring budget',()=>{const c=combat();c.st.Q=500;const generated=c.st.generated;c.h.run(7.8);close(c.st.Q,500);c.h.run(1.3);assert.ok(c.st.Q<500&&c.st.Q>480);close(c.st.generated,generated);assert.ok(c.st.metrics.decayed>0);});
test('curse is global, repeats every two seconds, full ground and double air, including outside native range',()=>{
 const c=combat(1),air=c.h.spawn('kz53_air',{pos:[12,10]}),ground=c.h.spawn('kz53_ground',{pos:[12,10]});c.st.Q=0;const hits=[];c.b.on('damageResolved',v=>{if(v.target===ground&&v.dmg.tags?.includes('kz:curse'))hits.push(c.b.time);});c.h.run(3.2);assert.equal(hits.length,2);close(hits[1]-hits[0],2);close(1e8-ground.hp,750);close(1e8-air.hp,1500);c.b.retreat(c.u);const hp=ground.hp;c.h.run(2.1);close(ground.hp,hp);
});
test('compact wire result preserves growth and recovery/CD state and is accepted by field sanitation',()=>{
 const c=combat(3);attack(c);c.b.emit('skillStart',{unit:c.u,reason:'ready'});c.h.run(.2);c.b.forceEnd();const full=c.h.result(),wire=fitResult(compactResult(full)),input=c.b.players[0].input;input.contentInfo={kind:'normal',round:1};assert.ok(wire.perPlayer.p1.kazdelCarry);assert.ok(JSON.stringify(wire).length<60000);const accepted=sanitizeKazdelResult(input,wire.perPlayer.p1,wire.time);assert.ok(accepted.kazdelFlow.kz53_0_a.points>=1);assert.ok(accepted.kazdelCarry.recoveries.length);assert.ok(accepted.kazdelCarry.meleeCooldowns[0].remaining>0);assert.ok(accepted.kazdelCarry.K0>2000);
});
test('layer values never unlock extra mechanics; all populations use the same mechanics at zero and 700',()=>{for(const tier of [1,2,3]){const counts=[];for(const L of [0,700]){const c=combat(tier,L);attack(c);c.h.run(.04);counts.push(c.st.metrics.meleeProcs);}assert.deepEqual(counts,tier===1?[0,0]:[1,1]);}assert.equal(rules.prosperity(3,999),false);assert.equal(rules.initialFireScale(999),0);});
test('ordinary/elite action growth and normal 20-round pacing remain bounded near 700',()=>{
 close(rules.flowPoints(2000,2000,false,true),5);close(rules.flowPoints(2000,2000,true,true),10);close(rules.bloodFlowPoints(0,2000,true),0);
 let L=0;for(let r=1;r<=20;r++){const tier=r<3?0:r<8?1:r<12?2:3;if(!tier)continue;L+=rules.PREP_GROWTH[tier-1];if(r>3){const prior=r<=8?1:r<=12?2:3;L+=Math.min(rules.PERFORMANCE_CAP[tier-1],rules.PERFORMANCE_CAP[prior-1],[13,24,40][prior-1]);}}assert.ok(L>=650&&L<=750,L);
 const p=pendingGrowth({round:2,counters:{'kz:flowRound':1,'kz:earningTier':3,'kz:earningBloodTier':2,'kz:points:kz53_0_a':10,'kz:blood:kz53_0_a':1,'kz:bloodPoints:kz53_0_a':0},bonds:{[CORE]:{active:true,tier:3},[BLOOD]:{active:true,tier:2}},board:[{kind:'chess',id:'kz53_0_a'}],baseId:x=>x,pieceBonds:()=>[CORE,BLOOD]});assert.deepEqual(p,{core:10,blood:0});
});
