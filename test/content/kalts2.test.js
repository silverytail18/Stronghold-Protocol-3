import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {buildRhodesMujicaData,KALTS2,RI} from '../../server/sim/content/rhodes-mujica/data.js';
import {makeBattle,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {absoluteRangeKeys} from '../../server/sim/targeting.js';
import {makeMatch,give,legalTileFor} from '../match/harness.js';
import {createRegistry} from '../../server/match/effectsMeta.js';
import {registerMeta} from '../../server/sim/content/bonds/addon.js';
import {buildLoadoutCatalog} from '../../server/sim/content/expansion/loadout-catalog.js';
import {buildEncyclopediaCatalog} from '../../server/sim/content/expansion/encyclopedia-catalog.js';
const DATA=buildRhodesMujicaData(getData()),HUMUS=Object.values(DATA.chess).find(c=>c.name==='休谟斯'&&!c.isGolden).chessId;
const fixture=(index=1,golden=false,extra=[])=>{const raw=structuredClone(DATA);raw.enemies.enemy_kalts=enemyRec({key:'enemy_kalts',hp:1e7,def:1e5,res:100,atk:0,speed:0});const h=makeBattle({data:new DataSource(raw,null),autoFinish:false,captureNoisy:true,units:[{chessId:golden?KALTS2.replace('_a','_b'):KALTS2,row:10,col:4,skillIndex:index},{chessId:HUMUS,row:10,col:5},...extra],enemies:[{key:'enemy_kalts',pos:[10,5]}]});h.step(2);return h;};
function searchFixture(golden=false,index=1){
 const raw=structuredClone(DATA);
 for(const [key,motion,taunt]of [['search_ground','WALK',0],['search_air','FLY',0],['search_taunt','WALK',10]])raw.enemies[key]=enemyRec({key,motion,taunt,hp:1e7,def:1e5,res:100,atk:0,speed:0});
 const h=makeBattle({data:new DataSource(raw,null),autoFinish:false,captureNoisy:true,units:[{chessId:golden?KALTS2.replace(/_a$/,'_b'):KALTS2,uid:1,row:10,col:4,dir:'RIGHT',skillIndex:index},{chessId:HUMUS,uid:2,row:10,col:5}]});
 h.step(2);h.b.addBuff(h.unit(2),{key:'qa:disarm',flags:{disarm:true}});return h;
}
for(const golden of [false,true]){
 test(`Kalts2 S2 ${golden} auto starts against an enemy outside base range but inside expanded range, with all allies healthy`,()=>{
  const h=searchFixture(golden),u=h.unit(1),keys=absoluteRangeKeys(u.skill.spec.targeting.rangeGrid,u.tileR,u.tileC,u.dir);
  const key=keys.find(k=>!u.baseRangeKeys.includes(k));assert.ok(key!==undefined);
  const e=h.spawn('search_ground',{pos:[Math.floor(key/h.b.grid.cols),key%h.b.grid.cols]});u.skill.gainSp(999);h.run(1);
  assert.equal(u.skill.activations,1);assert.ok(e.hp<1e7);assert.ok(u.skill.ammoLeft<10);assert.equal(h.unit(2).hpRatio,1);assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);
 });
 test(`Kalts2 S2 ${golden} automatically attacks air and prioritizes taunt then its own blocked enemy outside the grid`,()=>{
  const h=searchFixture(golden),u=h.unit(1),air=h.spawn('search_air',{pos:[10,6]}),taunt=h.spawn('search_taunt',{pos:[11,6]});u.skill.gainSp(999);h.run(.4);
  assert.equal(h.hooksOf('attack').find(c=>c.attacker===u).targets[0],taunt);assert.equal(u.skill.activations,1);
  const blocked=h.spawn('search_air',{pos:[10,3.6]});h.b._checkBlock(blocked);assert.equal(blocked.blockedBy,u);
  h.run(3);assert.ok(h.hooksOf('attack').some(c=>c.attacker===u&&c.targets[0]===blocked));assert.ok(air.hp<1e7||blocked.hp<1e7);checkInvariants(h.b);
 });
 test(`Kalts2 S2 ${golden} waits for cooldown and silence, then starts without an injured ally`,()=>{
  const h=searchFixture(golden),u=h.unit(1);h.spawn('search_ground',{pos:[10,6]});u.skill.gainSp(999);u.skill.opReadyAt=h.b.time+1;
  h.b.addBuff(u,{key:'qa:silence',flags:{silence:true}});h.run(1.2);assert.equal(u.skill.activations,0);
  h.b.removeBuff(u,'qa:silence');h.run(.4);assert.equal(u.skill.activations,1);assert.deepEqual(h.b.errors,[]);
 });
 test(`Kalts2 S2 ${golden} needs a legal enemy or injured ally; healing fallback still works`,()=>{
  const h=searchFixture(golden),u=h.unit(1),a=h.unit(2);u.skill.gainSp(999);h.run(.2);assert.equal(u.skill.activations,0);
  const e=h.spawn('search_ground',{pos:[10,6]});h.b.addBuff(e,{key:'qa:hidden',flags:{untargetable:true}});h.run(.2);assert.equal(u.skill.activations,0);
  a.hp=10;h.run(.5);assert.equal(u.skill.activations,1);assert.equal(h.hooksOf('attack').find(c=>c.attacker===u).targets[0],a);assert.ok(a.hp>10);checkInvariants(h.b);
 });
}

test('both Kaltsit grades reference the real Chinese deputy bond in match, loadout and encyclopedia catalogs',()=>{
 const catalogs=[DATA,buildLoadoutCatalog(getData()),buildEncyclopediaCatalog(getData())];
 for(const data of catalogs)for(const id of [KALTS2,KALTS2.replace(/_a$/,'_b')]){
  assert.deepEqual(data.chess[id].bonds,[RI,'deputShip']);assert.equal(data.bonds.deputShip.name,'助力');
  for(const bond of data.chess[id].bonds)assert.ok(data.bonds[bond]);
 }
 assert.ok(DATA.bonds.deputShip.visibleMembers.includes(KALTS2));
});

for(const golden of [false,true])test(`Kaltsit ${golden?'elite':'ordinary'} activates deputy with another member and grants its real prep and battle benefits`,()=>{
 const registry=createRegistry({builtins:false,content:false,log:{warn(){},error(){}}});registerMeta(registry);
 const h=makeMatch({data:structuredClone(DATA),fake:true,registry,mode:'solo'}).start();h.toPrep(1);
 const m=h.m,p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.layers={};p.recompute();
 const id=golden?KALTS2.replace(/_a$/,'_b'):KALTS2;
 for(const member of [id,'chess_char_6_14_a'])give(m,p,member,'board',legalTileFor(m,p,member));
 assert.equal(p.bonds.deputShip.active,true);assert.equal(p.bonds.deputShip.count,2);assert.equal(p.bonds.deputShip.tier,1);
 m.dispatch(p,'onPrepEnd',{round:1});assert.equal(p.layers.deputShip,2);
 const run=bonds=>{const sim=makeBattle({data:new DataSource(DATA,null),autoFinish:false,units:[{chessId:id,uid:1,row:10,col:4,skillIndex:1}],bonds});sim.step(2);return sim;};
 const off=run({}),on=run({deputShip:{active:true,tier:1,count:2,layers:2}});
 const u=on.unit(1),v=off.unit(1);assert.ok(u.s.def>v.s.def);assert.equal(u.findBuff('bond:deputShip').mods.redeployMul,.7);
 checkInvariants(on.b);checkInvariants(off.b);h.invariants();m.dispose();
});
test('S3 actually moves to a legal anchor to cover an out-of-range wounded ally and returns home',()=>{const h=fixture(2,false,[{chessId:HUMUS,uid:3,row:10,col:8}]);h.run(.1);const u=h.unit(KALTS2),far=h.allies().find(a=>a.tileC===8),home=[u.tileR,u.tileC];far.hp=1;u.skill.gainSp(999);u.skill.activate();assert.notDeepEqual([u.tileR,u.tileC],home);assert.ok(h.b.grid.canStand(u.tileR,u.tileC,{ranged:true}));assert.ok(u.mem.rmKaltsTrip.length>=1);u.skill.end('test');assert.deepEqual([u.tileR,u.tileC],home);assert.equal(h.b._movementHomes.size,0);checkInvariants(h.b);});
test('Kalts2 S2 fires true damage through armor, heals around impact and consumes exactly ten ammo',()=>{
 for(const gold of [false,true]){const h=fixture(1,gold),u=h.allies().find(a=>a.def.charId==='char_1052_kalts2'),a=h.unit(HUMUS),e=h.enemy('enemy_kalts');h.b.addBuff(a,{key:'qa:disarm',flags:{disarm:true}});u.skill.gainSp(999);u.skill.activate();a.hp=10;const base=e.hp,ammo=u.skill.ammoLeft;h.run(1);
  assert.ok(e.hp<base);assert.ok(a.hp>10);assert.equal(ammo,10);assert.ok(u.skill.ammoLeft<ammo);assert.ok(h.hooksOf('damageResolved').some(c=>c.source===u&&c.dmg.type==='true'&&c.dealt>0));h.run(32);assert.ok(u.skill.ammoLeft===0||u.skill.activations>1);assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);
 }
});
test('Kalts2 is airborne with two blocks; entry shield and Rhodes regen do not refresh every tick',()=>{const h=fixture(0);h.run(.1);const u=h.unit(KALTS2),a=h.unit(HUMUS);assert.ok(u.s.flags.liftoff&&u.s.flags.blockFly);assert.equal(u.s.blockCnt,2);assert.equal(a.findBuff('rm:kalts2:barrier').shieldHits,1);const e=h.enemy('enemy_kalts'),hp=a.hp;h.b.dealDamage(e,a,{amount:1000,type:'true'});assert.equal(a.hp,hp);h.run(.3);assert.ok(!a.findBuff('rm:kalts2:barrier')||a.findBuff('rm:kalts2:barrier').shieldHits===0);assert.equal(a.findBuff('rm:kalts2:regen').mods.hpRegen,100);assert.deepEqual(h.b.errors,[]);});
test('Kalts2 S3 changes interval and cleans all tactical anchor reservations on end',()=>{const h=fixture(2),u=h.unit(KALTS2),a=h.unit(HUMUS),home=[u.tileR,u.tileC];a.hp=10;u.skill.gainSp(999);u.skill.activate();assert.ok(Math.abs(u.s.bat-1.3)<1e-6);u.skill.end('test');assert.deepEqual([u.tileR,u.tileC],home);assert.equal(h.b._movementHomes?.size||0,0);assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);});
test('Rhodes overlay keeps exact skill mapping for every Amiya skin and required Mortis clipping',()=>{for(const r of [DATA.assets.chars.char_002_amiya,...Object.values(DATA.assets.skinModels).filter(s=>s.charId==='char_002_amiya')])for(const e of Object.values(r.spine)){assert.equal(e.anims.skills[0].loop,'Attack');assert.equal(e.anims.skills[1].loop,'Skill');assert.equal(e.anims.skills[2].loop,'Skill_2');}for(const s of Object.values(DATA.assets.skinModels).filter(s=>s.charId==='char_4183_mortis'))for(const e of Object.values(s.spine))assert.equal(e.requireClipping,true);});
