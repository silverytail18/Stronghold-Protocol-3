import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RI_RAW,fireFixture,nativeHit,fireEvents,artilleryHits,finishFire} from '../helpers/rhodesFireHarness.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {DataSource} from '../../server/sim/simdata.js';
import {GameData} from '../../server/match/gamedata.js';
import {engineeringBase,legacyEngineeringBase,engineeringDamage} from '../../shared/rhodes-engineering.js';
import {ENGINEERING_BALANCE as E} from '../../server/sim/content/rhodes-mujica/balance.js';
import {AMIYA,MORTIS,TMORIS,OBLVNS,MONSTR,RI} from '../../server/sim/content/rhodes-mujica/data.js';
import {KROOS} from '../../server/sim/content/rhodes-mujica/personal.js';
import {rhodesCanEngage} from '../../server/sim/content/rhodes-mujica/engineering.js';
import {emitNote,updateNotes} from '../../server/sim/content/rhodes-mujica/notes.js';
import {monChain,RECONSTRUCT} from '../../server/sim/content/new-operators/monstr.js';
import {isRhodesCarry} from '../../shared/rhodes-wire.js';
import {compactResult} from '../../server/sim/spec.js';
import {isBattleResult} from '../../shared/protocol.js';
import {sanitizeRhodesResult} from '../../server/sim/content/rhodes-mujica/result.js';
const RAW=structuredClone(RI_RAW);RAW.enemies.mid_dummy=enemyRec({key:'mid_dummy',hp:1e9,atk:0,speed:0});RAW.chess.mid_friend=chessRec({id:'mid_friend',skill:null,stats:{atk:0,maxHp:10000,cost:0},rangeGrid:[[0,0]]});
function fixture(id,{elite=false,tier=2,skillIndex=0,carry=null,unitCarry=null,kind='normal',layers=300}={}){
 const chessId=elite?id.replace(/_a$/,'_b'):id,units=[{uid:1,kind:'chess',chessId,row:10,col:4,skillIndex,...(unitCarry?{carryState:unitCarry}:{})},...[[9,3],[10,3],[11,3]].map(([row,col],i)=>({uid:i+2,kind:'chess',chessId:'mid_friend',row,col}))];
 const input={playerId:'p1',seat:0,side:'L',colOffset:0,units,bonds:{[RI]:{active:true,count:tier*3,tier,layers}},dp:100,contentInfo:{round:7,kind,...(carry?{rhodesCarry:carry}:{})}};
 const h=makeBattle({data:new DataSource(structuredClone(RAW),null),players:[input],round:7,kind,enemies:[{key:'mid_dummy',pos:[10,6]}],autoFinish:false,timeLimit:100,captureNoisy:true,flags:{dpStart:100,dpMax:100}});h.step(2);
 for(const u of h.allies())h.b.addBuff(u,{key:'qa:hold',flags:{stun:true},persist:true});
 h.u=h.unit(1);h.input=input;return h;
}
const state=h=>h.b.rhodesPersonal.view('p1').find(v=>v.uid===1);
const hit=(h,extra={},target=h.enemies()[0])=>h.b.dealDamage(h.u,target,{amount:100,type:'phys',isAttack:true,attackId:1,canDodge:false,tags:['rm:own'],...extra});
const clean=h=>{assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);};
function activate(h,free=false){h.b.removeBuff(h.u,'qa:hold');h.u.skill.gainSp(10000,'qa');assert.equal(h.u.skill.activate('qa',{free}),true);}

test('fixed ATK supply is 8/12 percent at every layer and intrinsic curves are monotone, continuous and tier-specific',()=>{
 for(const tier of [2,3]){let last=0;for(let L=0;L<=999;L++){const n=engineeringDamage(E,L,8000,tier);assert.equal(n.atkScale,tier===2?.08:.12);assert.ok(n.base>=last);last=n.base;}
  for(const L of [100,150,200,300,400,500,650,800])assert.ok(Math.abs(engineeringBase(L+.0001,tier)-engineeringBase(L-.0001,tier))<.1);
 }
 assert.equal(engineeringBase(0,2),500);assert.equal(engineeringBase(0,3),500);assert.equal(engineeringBase(999,2),30110);assert.equal(engineeringBase(999,3),33790);
});
test('converted middle/late base matches approved A8000 reference nodes without a live growing ATK multiplier',()=>{
 for(const[tier,points]of [[2,[[200,.12],[300,.22],[400,.32],[500,.40],[650,.48],[800,.50],[999,.50]]],[3,[[200,.16],[300,.32],[400,.50],[500,.68],[650,.88],[800,1],[999,1]]]])for(const[L,scale]of points){assert.ok(Math.abs(engineeringDamage(E,L,8000,tier).fire-legacyEngineeringBase(L)-scale*8000)<1e-7);}
 for(const tier of [2,3])assert.equal(engineeringDamage(E,500,9000,tier).fire-engineeringDamage(E,500,8000,tier).fire,tier===2?80:120);
});
for(const [tier,seconds]of [[3,6],[5,8],[6,10]])test(`tier${tier} native provider receives one command and carries its ${seconds}s family cooldown`,()=>{
 const h=fireFixture({providerTier:tier});nativeHit(h);assert.equal(h.b.rhodesInfo('p1').commands,1);const a=finishFire(h);assert.ok(Math.abs(a.families[0].remaining-seconds)<1e-6);assert.ok(isRhodesCarry(a));clean(h);
});
test('pending follow-up can continue onto another marked, engaged foe after all old primaries die, with one growth award',()=>{
 const h=fireFixture();nativeHit(h);h.run(2.8);const old=h.enemies()[0],next=h.spawn('qa_ri_enemy',{pos:[10,5.1]});nativeHit(h,h.allies()[2],next);h.b.dealDamage(null,old,{amount:1e9,type:'true',sourceless:true,canDodge:false});h.run(1);
 assert.ok(fireEvents(h).some(v=>v.followUp&&v.locks.some(l=>l.target===next.id)));assert.equal(finishFire(h).growthUsed,2);clean(h);
});
test('shell damage keeps normal mitigation and receives none of the new personal penetration',()=>{
 const h=fireFixture({layers:300});const e=h.enemies()[0];h.b.addBuff(e,{key:'qa:armor',mods:{defFlat:1500,resFlat:50}});h.run(3);const shots=artilleryHits(h);assert.equal(shots.length,2);
 for(const v of shots){assert.equal(v.dmg.defIgnorePct,0);assert.equal(v.dmg.resIgnorePct,0);assert.equal(v.dmg.resIgnoreFlat,0);const expected=v.dmg.type==='phys'?Math.max(v.dmg.amount-1500,v.dmg.amount*.05):v.dmg.amount*.5;assert.ok(Math.abs(v.dealt-expected)<1e-6);}clean(h);
});
for(const elite of [false,true])test(`Amiya native skill amplification and marked flat RES ignore (${elite?'elite':'normal'})`,()=>{
 const h=fixture(AMIYA,{elite});nativeHit(h,h.u);activate(h);const e=h.enemies()[0];h.b.addBuff(e,{key:'qa:res',mods:{resFlat:50}});
 const dealt=hit(h,{type:'arts',isSkill:true,attackId:50});const expected=100*(elite?1.3:1.2)*(1-(50-(elite?18:12))/100);assert.ok(Math.abs(dealt-expected)<1e-6);
 const trueDamage=hit(h,{type:'true',isSkill:true,attackId:51});assert.ok(Math.abs(trueDamage-(elite?130:120))<1e-6);clean(h);
});
test('Amiya personal bonus is inactive below six, and never changes her ATK or artillery contribution',()=>{
 const h=fixture(AMIYA,{tier:1}),atk=h.u.s.atk;activate(h);assert.equal(hit(h,{type:'true',isSkill:true}),100);assert.equal(h.u.s.atk,atk);clean(h);
});
for(const elite of [false,true])test(`Kroos focus counts complete attack cycles, preserves partial focus on swap and expires (${elite?'elite':'normal'})`,()=>{
 const h=fixture(KROOS,{elite});for(let attackId=1;attackId<=4;attackId++)for(let segment=0;segment<3;segment++)hit(h,{attackId});assert.equal(state(h).focus,4);
 hit(h,{attackId:5});const d=h.hooksOf('damageResolved').at(-1).dmg;assert.ok(Math.abs(d.defIgnorePct-(elite?.45:.35))<1e-9);assert.ok(d.mul>=(elite?1.28:1.2)-1e-6);
 const other=h.spawn('mid_dummy',{pos:[10,6.1]});hit(h,{attackId:6},other);assert.equal(state(h).focus,3);h.run(4.1);assert.equal(state(h).focus,0);clean(h);
});
test('Mortis self damage cannot arm the trait, enemy hits do, and the timed bonus expires without growing layers',()=>{
 const h=fixture(MORTIS),e=h.enemies()[0];h.b.dealDamage(h.u,h.u,{amount:10,type:'true',canDodge:false});assert.equal(hit(h,{type:'true'}),100);
 h.b.dealDamage(e,h.u,{amount:10,type:'true',isAttack:true,canDodge:false});hit(h,{attackId:2});assert.ok(h.hooksOf('damageResolved').at(-1).dmg.mul>=1.2);h.run(4.1);assert.equal(hit(h,{attackId:3,type:'true'}),100);clean(h);
});
for(const free of [false,true])test(`Tmoris native paid/free skill completion refunds only paid casts, source=${free}`,()=>{
 const h=fixture(TMORIS);nativeHit(h,h.u);activate(h,free);assert.equal(rhodesCanEngage(h.b,h.u,h.enemies()[0]),true);h.b.addBuff(h.u,{key:'qa:externalDisarm',flags:{disarm:true}});assert.equal(rhodesCanEngage(h.b,h.u,h.enemies()[0]),false);h.b.removeBuff(h.u,'qa:externalDisarm');h.run(2.3);
 const refunds=h.hooksOf('spGain').filter(v=>v.reason==='rm:personal:refund');assert.equal(refunds.length,free?0:1);clean(h);
});
test('Tmoris empty skills and forced interruption produce no refund',()=>{
 const h=fixture(TMORIS);activate(h);h.u.skill.end('retreat');assert.equal(h.hooksOf('spGain').filter(v=>v.reason==='rm:personal:refund').length,0);clean(h);
});
for(const elite of [false,true])test(`Sakiko lead is once per full attack, amplifies only own notes and decays (${elite?'elite':'normal'})`,()=>{
 const h=fixture(OBLVNS,{elite});for(let attackId=1;attackId<=3;attackId++)for(let segment=0;segment<4;segment++)hit(h,{attackId,tags:['rm:own','rm:note','rm:cycle:attack:'+attackId]});assert.equal(state(h).leading,3);
 const dealt=hit(h,{attackId:4,type:'true',tags:['rm:own','rm:note','rm:cycle:attack:4']});assert.ok(Math.abs(dealt-(elite?136:124))<1e-6);assert.equal(hit(h,{attackId:5,type:'true',tags:['rm:own']}),100);
 h.run(4.1);assert.equal(state(h).leading,2);h.run(2);assert.equal(state(h).leading,0);clean(h);
});
test('Sakiko full lead gives one legal retarget to an unhit note after its old target dies',()=>{
 const h=fixture(OBLVNS),old=h.enemies()[0];for(let i=1;i<=3;i++)hit(h,{attackId:i,tags:['rm:own','rm:note','rm:cycle:attack:'+i]});
 const at=h.u.rangeKeys.map(k=>[Math.floor(k/h.b.grid.cols),k%h.b.grid.cols]).filter(([r,c])=>r===10&&c>=h.u.x+2).sort((a,z)=>z[1]-a[1])[0];assert.ok(at);
 const next=h.spawn('mid_dummy',{pos:at});h.step();const note=emitNote(h.b,h.u,old,1,'phys');h.b.dealDamage(null,old,{amount:1e12,type:'true',sourceless:true,canDodge:false});updateNotes(h.b,h.u,.4,new Set(h.u.rangeKeys));assert.equal(note.riRetargeted,true);assert.equal(note.target?.id,next.id);assert.equal(note.hit.size,0);clean(h);
});
for(const elite of [false,true])test(`Mon3tr real native chains charge once, improve healing and convert to personal fusion (${elite?'elite':'normal'})`,()=>{
 const h=fixture(MONSTR,{elite,skillIndex:2}),friends=h.allies().filter(u=>u.defId==='mid_friend');for(const f of friends)f.hp=1;
 monChain(h.b,h.u,friends[0]);assert.equal(state(h).charges,1);monChain(h.b,h.u,friends[1]);assert.equal(state(h).charges,1);
 h.run(3.1);for(const f of friends)f.hp=1;monChain(h.b,h.u,friends[0]);h.run(3.1);for(const f of friends)f.hp=1;monChain(h.b,h.u,friends[0]);assert.equal(state(h).charges,3);
 activate(h);assert.equal(h.u.skill.id,'skchr_monstr_3');assert.equal(state(h).charges,0);assert.equal(state(h).fusion,3);const dealt=hit(h,{type:'true',isSkill:true,tags:['native:new','native:new:monAttack']});assert.ok(Math.abs(dealt-(elite?145:130))<1e-6);clean(h);
});
test('Mon3tr reconstruction/self/overhealing never generates repair energy',()=>{
 const h=fixture(MONSTR);h.run(.1);const token=h.allies().find(u=>u.defId===RECONSTRUCT);assert.ok(token);token.hp=1;monChain(h.b,h.u,token);assert.equal(state(h).charges,0);h.u.hp=1;monChain(h.b,h.u,h.u);assert.equal(state(h).charges,0);clean(h);
});
test('personal state and family cooldowns survive the complete result wire and cannot be forged onto other units',()=>{
 const h=fixture(OBLVNS);for(let i=1;i<=3;i++)hit(h,{attackId:i,tags:['rm:own','rm:note','rm:cycle:attack:'+i]});h.b.forceEnd();const result=compactResult(h.result()),a=result.perPlayer.p1.rhodesCarry;assert.ok(isBattleResult(result));assert.ok(isRhodesCarry(a));
 const gd=new GameData(RAW,'mode_multi_hard');assert.ok(sanitizeRhodesResult(h.input,result.perPlayer.p1,h.result().time,gd,7));
 const u=fixture(OBLVNS,{carry:a,kind:'unite'});assert.equal(state(u).leading,3);assert.equal(state(u).focus,0);clean(u);
 for(const change of [{uid:999},{family:MONSTR},{charges:1},{leading:4},{leadRemaining:5}]){const bad=structuredClone(result.perPlayer.p1);Object.assign(bad.rhodesCarry.personal[0],change);assert.equal(sanitizeRhodesResult(h.input,bad,h.result().time,gd,7),null);}
});
test('new personal descriptions append to original records and do not mutate formal native skills/modules',()=>{
 for(const id of [AMIYA,KROOS,MORTIS,TMORIS,OBLVNS,MONSTR]){const c=RAW.chess[id];assert.ok(c.garrisonIds.some(g=>g.startsWith('rm_personal_')));assert.equal(c.garrisonIds.some(g=>!g.startsWith('rm_personal_')),id===KROOS);assert.ok(!c.garrisonIds.some(g=>g.startsWith('rm_growth_')||g.startsWith('newop_monstr_')));assert.ok(c.garrisonIds.filter(g=>g.startsWith('rm_personal_')).every(g=>RAW.garrisons[g].desc.includes('6罗德岛')));}
});
test('Mon3tr reserve and shared repair cooldown carry without granting a new free charge',()=>{
 const h=fixture(MONSTR),friend=h.unit(2);friend.hp=1;monChain(h.b,h.u,friend);assert.equal(state(h).charges,1);h.b.forceEnd();const p=compactResult(h.result()).perPlayer.p1,a=p.rhodesCarry;
 assert.ok(sanitizeRhodesResult(h.input,p,h.result().time,new GameData(RAW),7));const next=fixture(MONSTR,{carry:a,kind:'unite'});assert.equal(state(next).charges,1);next.unit(2).hp=1;monChain(next.b,next.u,next.unit(2));assert.equal(state(next).charges,1);clean(next);
});
test('a paid ongoing Tmoris cast retains exactly one refund eligibility through native unite restoration',()=>{
 const h=fixture(TMORIS);activate(h);h.run(.5);h.b.forceEnd();const p=compactResult(h.result()).perPlayer.p1,a=p.rhodesCarry;assert.equal(a.personal[0].refundArmed,true);assert.equal(a.personal[0].refundEffective,true);
 assert.ok(sanitizeRhodesResult(h.input,p,h.result().time,new GameData(RAW),7));const next=fixture(TMORIS,{carry:a,kind:'unite',unitCarry:{hpPct:1,sp:0,skillActive:true}});next.run(2.3);assert.equal(next.hooksOf('spGain').filter(v=>v.reason==='rm:personal:refund').length,1);clean(next);
});
