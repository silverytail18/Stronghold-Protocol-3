import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {referenceCatalog} from '../../server/product/reference-catalog.js';
import {GameData} from '../../server/match/gamedata.js';
import {SharedPool} from '../../server/match/pool.js';
import {DataSource} from '../../server/sim/simdata.js';
import {skillSpecSource} from '../../server/sim/content/index.js';
import {makeBattle} from '../helpers/battleHarness.js';
const id='chess_kz_wisdel_a',charId='char_1035_wisdel',shadow='token_10035_wisdel_wward';

test('Kazdel Wisdel has one preset identity, original skills/modules, ordinary stock and summon variants',()=>{
 const base=getData(),data=composeProductData(base,['kazdel-expansion-v1']),ds=new DataSource(data);
 assert(!base.chess[id]);assert(data.bonds.kazdelShip.visibleMembers.includes(id));assert(!data.backups.diy.ownedPool.includes(charId));
 assert.equal(new SharedPool(new GameData(data,'mode_single_normal')).cap(id),5);
 assert.equal(new SharedPool(new GameData(data,'mode_multi_normal')).cap(id),10);
 for(const golden of [false,true])for(const skillIndex of [0,1,2]){
  const key=id.replace(/_a$/,golden?'_b':'_a'),d=ds.getChess(key,{skillIndex});
  assert.equal(d.charId,charId);assert.equal(d.raw.skill.index,skillIndex);assert.notEqual(skillSpecSource(d),'generic');
  assert(ds.getToken(shadow,key,d.loadout));assert(data.tokens[shadow].variants[key]);
 }
 const upstream=new DataSource(base);
 for(const golden of [false,true])for(let potential=1;potential<=6;potential++){
  const suffix=golden?'b':'a',native=ds.getChess(id.replace(/_a$/,'_'+suffix),{potential});
  const diy=upstream.getChess('chess_char_6_diy1_'+suffix,{diy:{charId,skillIndex:2,uniEquipId:'uniequip_002_wisdel'},potential});
  assert.deepEqual(native.stats,diy.stats);assert.deepEqual(native.raw.talents,diy.raw.talents);
 }
 const ref=referenceCatalog().values;assert.equal(Object.values(ref.chess).filter(c=>c.charId===charId&&c.visible&&!c.isGolden&&!c.isDiy).length,1);
});

test('preset Wisdel uses upstream S3 and summons her native shadows',()=>{
 const data=composeProductData(getData(),['kazdel-expansion-v1']),key=id.replace(/_a$/,'_b');
 const h=makeBattle({defs:data,units:[{chessId:key,row:10,col:5}],timeLimit:3,autoFinish:false});
 h.step();const u=h.unit(key);assert.equal(u.skill.kind,'ammo');assert.equal(u.skill.rule,'SP_FULL');
 u.skill.gainSp(999);h.step();assert(u.skill.active);
 const shadows=h.b.allyUnits.filter(t=>t.kind==='token'&&t.defId===shadow);assert.equal(shadows.length,3);
 const variant=data.tokens[shadow].variants[key];assert(shadows.every(t=>t.def.stats.maxHp===variant.stats.maxHp));
});
