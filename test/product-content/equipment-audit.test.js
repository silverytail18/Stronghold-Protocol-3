import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {makeBattle} from '../helpers/battleHarness.js';
import {makeMatch,give,giveItem,legalTileFor} from '../match/harness.js';
import {pieceBonds} from '../../server/match/bondsMeta.js';

const ids=['rhodes-mujica-v1','kazdel-expansion-v1','rhine-lab-v1','higashi-expansion-v1','ursus-expansion-v1','iberia-expansion-v1','genius-trader-v1'];
const data=composeProductData(getData(),ids),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const battle=(id,extra={})=>{const h=makeBattle({defs:data,units:[{chessId:'chess_char_1_01_a',row:10,col:4,items:id?[id]:[]}],autoFinish:false,...extra});h.step();return h;};
test('normal and elite equipment apply actual attack, HP, starting SP and forward-range effects without an active covenant',()=>{
  const baseline=battle(''),base=baseline.allies()[0];
  for(const key of ['chess_rm_terminal_e','higashi_seal','higashi_talisman','ursus_badge','ursus_survey','iberia_eye','field_medic_bandage','iberia_lamp'])for(const suffix of ['a','b']){
    const id=key+'_'+suffix,rec=data.items[id],h=battle(id),u=h.allies()[0];
    near(u.s.atk,base.s.atk*(1+(rec.params.atk||0)));near(u.s.maxHp,base.s.maxHp+(rec.params.hpFlat||0));
    if(key==='iberia_lamp')near(u.skill.sp-base.skill.sp,suffix==='b'?15:10);
    if(key==='field_medic_bandage'){
      u.hp-=500;const before=u.hp;h.b.heal(u,u,100);near(u.hp-before,100*(1+rec.params.recoveryBonus));
    }
    if(key==='ursus_survey')assert.ok(u.rangeKeys.length>base.rangeKeys.length);
    assert.deepEqual(h.b.errors,[],id);
  }
});
test('both old flags increase real deferred-damage capacity without adding shared soul-fire capacity',()=>{
  const chess=data.chess.chess_kz_vigna_a; // Mudrock's native damage shields would correctly absorb the fixture hit.
  for(const suffix of ['a','b']){
    const id='kazdel_memory_standard_'+suffix,h=battle(id,{units:[{chessId:chess.chessId,row:10,col:4,items:[id]}],bonds:{kazdelShip:{active:true,tier:1,count:3,layers:0}}});
    const u=h.allies()[0],s=h.b.kazdel.states.get('p1'),capacity=s.C;
    h.b.addBuff(u,{key:'fixture:temporary-hp',mods:{hpFlat:1e6}});u.hp=u.s.maxHp;
    const enemy=h.spawn('enemy_1045_hammer_2');h.b.dealDamage(enemy,u,{amount:(capacity+1000)*10,type:'phys',defIgnorePct:1,canDodge:false});
    near(h.b.kazdel.debt(u),capacity+data.items[id].params.debtCapacity);near(s.C,capacity);assert.deepEqual(h.b.errors,[]);
  }
});
test('Rhine controller grants and spends its shield on the actual first enemy attack, never refreshes on later attacks',()=>{
  const c=Object.values(data.chess).find(c=>!c.isGolden&&c.bonds?.includes('rhineShip'));
  for(const suffix of ['a','b']){
    const id='rhine_field_controller_'+suffix,h=makeBattle({defs:data,players:[{playerId:'p1',seat:0,side:'L',colOffset:0,
      units:[{uid:1,kind:'chess',chessId:c.chessId,row:10,col:4,items:[id]}],bonds:{rhineShip:{active:true,tier:1,count:3,layers:0}},
      contentInfo:{rhine:{count:3,active:[],positions:{},layers:0}}}],autoFinish:false});h.step();
    const u=h.allies()[0],enemy=h.spawn('enemy_1045_hammer_2'),amount=u.s.maxHp*data.items[id].params.shieldRatio;
    const hp=u.hp;h.b.dealDamage(enemy,u,{amount:10,type:'true',isAttack:true,canDodge:false});
    near(u.hp,hp);near(u.findBuff('rhine:environment').shield,amount-10);
    h.b.dealDamage(enemy,u,{amount:10,type:'true',isAttack:true,canDodge:false});near(u.findBuff('rhine:environment').shield,amount-20);assert.deepEqual(h.b.errors,[]);
  }
});
test('samplers add their documented layers through actual prep-end processing, each quality uses its own amount',()=>{
  const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.visible&&c.bonds?.includes('rhineShip')).slice(0,3);
  function run(item){const h=makeMatch({data,mode:'solo',fake:true}).start().toPrep(1),p=h.ps('p_0');try{
    for(const c of members)give(h.m,p,c.chessId,'board',legalTileFor(h.m,p,c.chessId));
    if(item){const holder=[...p.board.values()][0],gear=giveItem(h.m,p,item);assert.equal(p.equip(gear.uid,holder.uid).ok,true);}
    h.toPrep(2);return p.layers.rhineShip||0;
  }finally{h.m.dispose();}}
  const before=run(null);for(const suffix of ['a','b']){const id='rhine_sampler_'+suffix;near(run(id)-before,data.items[id].params.rhineLayers);}
});
test('PRTS consumable sets deploy floor and consumes itself while preserving two worn items',()=>{
  const h=makeMatch({data,mode:'solo',fake:true}).start().toPrep(1),p=h.ps('p_0');try{
    const piece=give(h.m,p,'chess_char_1_01_a');
    for(const id of ['higashi_seal_a','ursus_badge_a']){const gear=giveItem(h.m,p,id);assert.equal(p.equip(gear.uid,piece.uid).ok,true);}
    const before=piece.items.map(i=>i.uid),gear=giveItem(h.m,p,'chess_item_prts_archive_a');
    assert.equal(p.equip(gear.uid,piece.uid).ok,true);assert.equal(p.find(gear.uid),null);assert.ok(p.deployCap>=10);assert.deepEqual(piece.items.map(i=>i.uid),before);
  }finally{h.m.dispose();}
});
test('all six covenant identity equipment families require the actual morph item, for normal and elite gear',()=>{
  const morph=Object.values(data.items).find(i=>i.canGiveBond&&!i.isGolden);
  assert.ok(morph);
  for(const [key,bond]of [['chess_rm_terminal_e','rhodesShip'],['kazdel_memory_standard','kazdelShip'],['rhine_field_controller','rhineShip'],['higashi_seal','higashiShip'],['ursus_badge','ursusShip'],['iberia_lamp','iberiaShip']])for(const suffix of ['a','b']){
    const h=makeMatch({data,mode:'solo',fake:true}).start().toPrep(1),p=h.ps('p_0');try{
      const c=Object.values(data.chess).find(c=>c.visible&&!c.isGolden&&!c.isDiy&&!c.bonds?.includes(bond));
      const piece=give(h.m,p,c.chessId),gear=giveItem(h.m,p,key+'_'+suffix);
      assert.equal(p.equip(gear.uid,piece.uid).ok,true);assert.ok(!pieceBonds(p.gd,piece).includes(bond),key);
      const trans=giveItem(h.m,p,morph.id);assert.equal(p.equip(trans.uid,piece.uid).ok,true);
      assert.equal(pieceBonds(p.gd,piece).filter(id=>id===bond).length,1,key+'_'+suffix);
    }finally{h.m.dispose();}
  }
});
