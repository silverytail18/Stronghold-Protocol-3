import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildKazdelData} from '../../server/sim/content/kazdel/data.js';
import {kazdelTraitFor,personalGrowthPoints} from '../../shared/kazdel-personal.js';
import {makeBattle,enemyRec} from '../helpers/battleHarness.js';
import {referenceCatalog} from '../../server/product/reference-catalog.js';
const ID='chess_kz_wisdel_a',CHAR='char_1035_wisdel',SHADOW='token_10035_wisdel_wward';
const data=buildKazdelData(getData());
data.enemies.wisdel_trait_dummy=enemyRec({key:'wisdel_trait_dummy',hp:1e7,def:0,res:0,atk:0,speed:0});
function field(golden=false,active=false){
 const id=ID.replace(/_a$/,golden?'_b':'_a');
 const h=makeBattle({defs:data,units:[{chessId:id,uid:1,row:10,col:5},
  {diy:{slot:6,charId:CHAR,skillIndex:2,uniEquipId:null},elite:golden,uid:2,row:11,col:5}],
  ...(active?{bonds:{kazdelShip:{active:true,tier:1,layers:0,count:3}}}:{}),autoFinish:false,timeLimit:3});
 h.step();const enemy=h.spawn('wisdel_trait_dummy',{pos:[10,7]});
 const hit=(source,tags=['aftershock','wisdel:shock'],type='phys')=>h.b.dealDamage(source,enemy,{amount:100,type,tags,canDodge:false});
 return{h,u:h.unit(1),diy:h.unit(2),enemy,hit};
}
test('only Kazdel preset forms gain Precision and the personal trait; base DIY data remain unchanged',()=>{
 const base=getData(),before=JSON.stringify(base.backups.units[CHAR]);
 for(const id of [ID,ID.replace(/_a$/,'_b')]){
  const c=data.chess[id],g=data.garrisons[c.garrisonIds[0]];
  assert(c.bonds.includes('preciShip'));assert(data.bonds.preciShip.members.includes(ID));
  assert.equal(kazdelTraitFor(c).id,'wisdel');assert.equal(g.name,'余震压制');assert(g.kazdelPersonal);
  assert(g.desc.includes('有效命中敌人3次'));assert(g.desc.includes('+10%'));assert(!g.desc.includes('undefined'));
 }
 const ref=referenceCatalog().values;assert(ref.chess[ID].bonds.includes('preciShip'));assert(ref.garrisons[ref.chess[ID].garrisonIds[0]].kazdelPersonal);
 assert.equal(JSON.stringify(base.backups.units[CHAR]),before);assert(!kazdelTraitFor({chessId:'chess_char_6_diy1_b',charId:CHAR}));
});
test('native aftershocks gain 10%; main hits, bombs, item packets, shadows and DIY Wisdel do not',()=>{
 for(const golden of [false,true]){
  const{h,u,diy,hit}=field(golden);
  assert(Math.abs(hit(u)-110)<1e-6);assert.equal(hit(u,[]),100);assert.equal(hit(u,['wisdel:bomb']),100);
  assert.equal(hit(u,['wisdel:shadow'],'arts'),100);assert.equal(hit(u,['wisdel:shock','item:test']),100);
  assert.equal(hit(diy),100);assert(!diy.def.raw.kazdelTrait);assert(!diy.def.bonds.includes('preciShip'));
  const shadow=h.b.allyUnits.find(t=>t.defId===SHADOW);assert(shadow);assert.equal(hit(shadow),100);
  assert.deepEqual(h.b.errors,[]);
 }
});
test('effective native shock hits count once through shields and obey ordinary/elite growth caps',()=>{
 for(const golden of [false,true]){
  const{h,u,diy,enemy,hit}=field(golden,true);
  h.b.addBuff(enemy,{key:'test:partial-shield',shield:40});hit(u);
  let flow=h.b.kazdel.record(u);assert.equal(flow.growth.blastHits,1,'partial shield plus HP damage is one hit');
  hit(u);hit(u);flow=h.b.kazdel.record(u);assert.equal(flow.growth.blastHits,3);
  assert.equal(personalGrowthPoints(u.def.raw,flow),golden?4:2);
  hit(diy);hit(u,['wisdel:bomb']);assert.equal(h.b.kazdel.record(u).growth.blastHits,3);
  for(let i=0;i<40;i++)hit(u);
  flow=h.b.kazdel.record(u);assert.equal(personalGrowthPoints(u.def.raw,flow),golden?10:6);
  assert.deepEqual(h.b.errors,[]);
 }
});
