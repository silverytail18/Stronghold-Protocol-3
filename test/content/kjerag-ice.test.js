import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {GUIDE} from '../../server/sim/content/expansion/kjerag-data.js';
import {ICE_TAG} from '../../server/sim/content/expansion/kjerag-balance.js';
import {DataSource} from '../../server/sim/simdata.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
const BASE=getData({log:{info(){},warn(){},error(){}}});
function fixture({tier=2,active=true,core=false,players,atk=0,...options}={}){
  const raw=buildExpansionData(BASE);
  for(let i=0;i<4;i++)raw.chess['ice_test_'+i]=chessRec({id:'ice_test_'+i,bonds:[GUIDE,...(core?['kjeragShip']:[])],stats:{atk,cost:0,blockCnt:0},rangeGrid:Array.from({length:7},(_,r)=>[r-3,1]),skill:null});
  raw.enemies.ice_enemy=enemyRec({key:'ice_enemy',hp:1e7,atk:0,speed:0});
  const bonds={[GUIDE]:{active,tier,count:tier*2,layers:0},...(core?{kjeragShip:{active:true,tier:1,count:3,layers:20}}:{})};
  const resolved=[];
  const h=makeBattle({data:new DataSource(raw,null),units:[0,1,2,3].map(i=>({chessId:'ice_test_'+i,row:9+i,col:4})),bonds,
    ...(players?{players:players(bonds)}:{}),autoFinish:false,timeLimit:90,
    setup:b=>b.on('damageResolved',c=>resolved.push({...c,time:b.time,amount:c.dmg.amount}),{priority:-999}),...options});
  h.step();return {h,b:h.b,u:h.unit(1),resolved,spawn:(row=10,col=5)=>h.spawn('ice_enemy',{pos:[row,col]})};
}
const freeze=(b,e,duration=60)=>b.applyStatus(e,'freeze',{duration});
const attack=(b,u,e,extra={})=>b.dealDamage(u,e,{amount:1,type:'true',isAttack:true,attackId:++b._attackSeq,...extra});
const bursts=h=>h.eventsOf('fx').filter(e=>e[1]==='snowfieldIceBurst');
const ice=resolved=>resolved.filter(c=>c.dmg.tags.includes(ICE_TAG));
const cold=h=>h.hooks.statusApplied.filter(c=>c.status==='cold'&&c.source===GUIDE);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const clean=h=>{assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);};
function until(h,time){while(h.b.time+1e-9<time)h.step();}
function quiet(h){for(const u of h.b.allyUnits)h.b.addBuff(u,{key:'qa:disarm',duration:80,flags:{disarm:true}});}

test('Ice main is full, splash half before individual RES; main excluded from splash, midpoint radius and credit preserved',()=>{
  const {h,b,u,spawn,resolved}=fixture(),main=spawn(),near=spawn(11),outside=spawn(10,6.21);
  b.addBuff(u,{key:'qa:atk',mods:{atkFlat:500}});b.addBuff(main,{key:'qa:res',mods:{resFlat:40}});b.addBuff(near,{key:'qa:res',mods:{resFlat:60}});
  freeze(b,main);attack(b,u,main);const hits=ice(resolved);assert.equal(hits.length,2);assert.equal(hits[0].target,main);assert.equal(hits[0].amount,675);close(hits[0].dealt,675*.75);assert.equal(hits[1].amount,337.5);close(hits[1].dealt,337.5*.4);
  assert.equal(outside.hp,1e7);assert.ok(hits.every(c=>c.source===u&&c.credit===u&&!c.dmg.isAttack&&!c.dmg.isSkill&&!c.dmg.sourceless));close(u.stats.dmg,1+675*.75+337.5*.4);assert.equal(bursts(h).length,1);clean(h);
});
test('Attribute damage uses current triggering member ATK, including buffs, capped at180; ignores attack multiplier',()=>{
  for(const [atk,expected]of [[500,675],[1000,750],[1200,780],[10000,780]]){
    const {h,b,u,spawn,resolved}=fixture(),e=spawn();b.addBuff(u,{key:'qa:atk',mods:{atkFlat:atk/2,atkMul:2}});
    b.addBuff(h.unit(2),{key:'qa:larger',mods:{atkFlat:1e6}});freeze(b,e);attack(b,u,e,{mul:9,isSkill:true});assert.equal(ice(resolved)[0].amount,expected);clean(h);
  }
});
test('Ordinary and skill-enhanced AI attacks trigger ice through the real attack pipeline',()=>{
  const {h,b,spawn,resolved}=fixture({atk:500});const e=spawn();freeze(b,e);h.run(1);assert.equal(bursts(h).length,1);assert.equal(ice(resolved)[0].amount,675);assert.ok(resolved.some(c=>c.dmg.isAttack&&c.dmg.attackId>0));clean(h);
});
test('Two-member / inactive guide and non-guide attacker cannot trigger ice',()=>{
  for(const opts of [{tier:1},{active:false},{}]){const {h,b,u,spawn}=fixture(opts),e=spawn();if(!Object.keys(opts).length)u.def={...u.def,bonds:[]};freeze(b,e);attack(b,u,e);assert.equal(bursts(h).length,0);clean(h);}
});
for(const extra of [{isAttack:false,isSkill:true},{isSplash:true},{tags:['chain']},{tags:['dot']},{tags:['periodic']},{tags:[ICE_TAG]},{sourceless:true}])test('Non-primary / secondary damage does not trigger ice: '+JSON.stringify(extra),()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();freeze(b,e);attack(b,u,e,extra);assert.equal(bursts(h).length,0);attack(b,u,e);assert.equal(bursts(h).length,1);clean(h);
});
test('A hit freezing an un-frozen victim does not retroactively trigger; a subsequent attack does',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();b.on('hit',c=>{if(c.source===u&&c.dmg.isAttack)freeze(b,e);});attack(b,u,e);assert.equal(bursts(h).length,0);attack(b,u,e);assert.equal(bursts(h).length,1);clean(h);
});
for(const kind of ['cancel','dodge','shield','invulnerable','zero'])test('No HP loss does not consume ice proc: '+kind,()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();freeze(b,e);let hook;
  if(kind==='cancel')hook=b.on('hit',c=>{if(c.dmg.isAttack)c.dmg.cancel=true;});
  if(kind==='dodge')b.addBuff(e,{key:'qa:nohit',mods:{dodgePhys:1}});
  if(kind==='shield')b.addBuff(e,{key:'qa:nohit',shield:1000});
  if(kind==='invulnerable')b.addBuff(e,{key:'qa:nohit',flags:{invulnerable:true}});
  attack(b,u,e,{type:kind==='dodge'?'phys':'true',amount:kind==='zero'?0:1});assert.equal(bursts(h).length,0);
  if(hook)b.off(hook);b.removeBuff(e,'qa:nohit');attack(b,u,e);assert.equal(bursts(h).length,1);clean(h);
});
test('Fatal attack preserves ice at captured hit position; dead main gets no second damage',()=>{
  const {h,b,u,spawn,resolved}=fixture(),e=spawn(),neighbor=spawn(11);e.hp=1;freeze(b,e);
  b.on('kill',({victim})=>{if(victim===e){victim.x=15;victim.y=15;}});attack(b,u,e);
  assert.equal(e.alive,false);assert.equal(ice(resolved).length,1);assert.equal(ice(resolved)[0].target,neighbor);assert.equal(ice(resolved)[0].amount,300);assert.deepEqual(bursts(h)[0].slice(2,4),[5,10]);clean(h);
});
test('Secondary ice respects target selection but can hit airborne enemies',()=>{
  const {h,b,u,spawn,resolved}=fixture(),e=spawn(),fly=spawn(11);fly.motion='FLY';const excluded=[];
  for(const flag of ['sleep','stealth','untargetable','invulnerable']){const n=spawn();b.addBuff(n,{key:'qa:'+flag,flags:{[flag]:true}});excluded.push(n);}
  freeze(b,e);attack(b,u,e);assert.equal(ice(resolved).length,2);assert.ok(ice(resolved).some(c=>c.target===fly));assert.ok(excluded.every(n=>n.hp===1e7));clean(h);
});
test('Original Kjerag cold/freeze damage multiplier and fragile apply per victim; ice gives no direct layers/statuses',()=>{
  const {h,b,u,spawn,resolved}=fixture({core:true}),e=spawn(),neighbor=spawn(11);freeze(b,e);b.applyStatus(neighbor,'cold',{duration:30});b.addBuff(neighbor,{key:'qa:fragile',mods:{dmgTakenMul:1.2}});
  const before=h.hooks.statusApplied.length,layers=b.players[0].bonds.kjeragShip.layers;attack(b,u,e);
  close(ice(resolved)[0].dealt,600*1.55);close(ice(resolved)[1].dealt,300*1.55*1.2);assert.equal(h.hooks.statusApplied.length,before);assert.equal(b.players[0].bonds.kjeragShip.layers,layers);clean(h);
});
test('Shared ice cooldown is fourteen seconds; all members share it and the same attack ID never explodes twice',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();quiet(h);freeze(b,e);const id=++b._attackSeq,start=b.time;attack(b,u,e,{attackId:id});attack(b,h.unit(2),e);assert.equal(bursts(h).length,1);
  until(h,start+13.95);attack(b,u,e);assert.equal(bursts(h).length,1);until(h,start+14);attack(b,u,e,{attackId:id});assert.equal(bursts(h).length,1);attack(b,h.unit(2),e);assert.equal(bursts(h).length,2);clean(h);
});
test('New freezes refund at most four seconds per burst, never below ten seconds; refund budget resets',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();quiet(h);freeze(b,e);attack(b,u,e);const start=b.time;
  for(let i=0;i<12;i++)freeze(b,spawn(),1);
  until(h,start+9.95);attack(b,u,e);assert.equal(bursts(h).length,1);until(h,start+10);attack(b,u,e);assert.equal(bursts(h).length,2);
  for(let i=0;i<8;i++)freeze(b,spawn(),1);
  until(h,start+19.95);attack(b,u,e);assert.equal(bursts(h).length,2);until(h,start+20);attack(b,u,e);assert.equal(bursts(h).length,3);clean(h);
});
test('Overlapping ranges count each freeze once; refresh is ignored, actual re-entry counts',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn(),other=spawn();quiet(h);freeze(b,e);attack(b,u,e);const start=b.time;
  freeze(b,other);for(let i=0;i<9;i++)freeze(b,other);b.removeBuff(other,'freeze');freeze(b,other);
  until(h,start+12.95);attack(b,u,e);assert.equal(bursts(h).length,1);until(h,start+13);attack(b,u,e);assert.equal(bursts(h).length,2);clean(h);
});
test('Outside range / dead-member-only range / expired cooldown give no frozen refund',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();quiet(h);freeze(b,e);attack(b,u,e);const start=b.time;
  freeze(b,spawn(10,8));h.unit(4).rangeGrid=[[0,2]];b._refreshRange(h.unit(4));const isolated=spawn(12,6);b.retreat(h.unit(4));freeze(b,isolated);
  until(h,start+13.95);attack(b,u,e);assert.equal(bursts(h).length,1);until(h,start+14);for(let i=0;i<10;i++)freeze(b,spawn());attack(b,u,e);assert.equal(bursts(h).length,2);
  until(h,start+27.95);attack(b,u,e);assert.equal(bursts(h).length,2);until(h,start+28);attack(b,u,e);assert.equal(bursts(h).length,3);clean(h);
});
test('Freeze before first burst does not bank refunds',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();quiet(h);for(let i=0;i<10;i++)freeze(b,spawn());freeze(b,e);attack(b,u,e);const start=b.time;
  until(h,start+13.95);attack(b,u,e);assert.equal(bursts(h).length,1);until(h,start+14);attack(b,u,e);assert.equal(bursts(h).length,2);clean(h);
});
test('Every ice burst refunds only its own ongoing cold once, regardless of splash count',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn(),others=[spawn(11),spawn(10)];quiet(h);h.run(2.2);assert.equal(cold(h).length,3);const last=cold(h)[0].t;freeze(b,e);attack(b,u,e);assert.equal(bursts(h).length,1);
  b.removeStatus(e,'freeze');until(h,last+10.95);assert.equal(cold(h).length,3);until(h,last+11);h.step();assert.equal(cold(h).length,6);assert.ok(others.every(n=>n.hp<1e7));clean(h);
});
test('Cold refund clamps to ten seconds even if two ice bursts fall in the same cold cycle',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn();quiet(h);h.run(2.2);const last=cold(h)[0].t;freeze(b,e);attack(b,u,e);
  for(let i=0;i<8;i++)freeze(b,spawn(),1);
  until(h,b.time+10);const before=cold(h).length;attack(b,u,e);h.step();assert.ok(cold(h).length>before);const latest=cold(h).at(-1).t;assert.ok(latest-last>=10-1e-9);assert.ok(latest-last<11);clean(h);
});
test('Ice cannot reduce initial cold delay, and no targets still wait without catching up',()=>{
  const {h,b,u,spawn}=fixture(),e=spawn(),other=spawn(11);quiet(h);h.step();freeze(b,e);attack(b,u,e);h.run(1.8);assert.equal(cold(h).length,0);h.run(.3);assert.equal(cold(h).length,1);other.x=8;b._enemiesDirty=true;h.run(25);assert.equal(cold(h).length,1);other.x=5;b._enemiesDirty=true;h.run(.1);assert.equal(cold(h).length,2);clean(h);
});
test('Multiplayer ice and cold CDs are independent; a shared in-range freeze refunds each owner once',()=>{
  const {h,b,spawn}=fixture({players:bonds=>['p1','p2'].map((playerId,seat)=>({playerId,seat,side:'L',units:[0,1].map(i=>({chessId:'ice_test_'+i,uid:seat*2+i+1,row:9+seat*2+i,col:4})),bonds:structuredClone(bonds)}))});quiet(h);
  const e=spawn(),u=b.allyUnits.find(x=>x.ownerId==='p1'),v=b.allyUnits.find(x=>x.ownerId==='p2');h.run(2.2);const first=cold(h)[0].t;freeze(b,e);attack(b,u,e);assert.equal(bursts(h).length,1);
  b.removeStatus(e,'freeze');until(h,first+11);h.step();assert.equal(cold(h).filter(c=>c.t>first+1).length,1);until(h,first+12);h.step();assert.equal(cold(h).filter(c=>c.t>first+1).length,2);
  freeze(b,e);attack(b,v,e);assert.equal(bursts(h).length,2);const p2start=b.time;freeze(b,spawn());freeze(b,e);
  until(h,p2start+13.45);attack(b,v,e);assert.equal(bursts(h).length,2);until(h,p2start+13.5);freeze(b,e);attack(b,v,e);assert.equal(bursts(h).length,3);clean(h);
});
