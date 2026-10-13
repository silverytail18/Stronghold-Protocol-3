import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {buildPenguinData,applyPenguin,CROISSANT,SORA,PENGUIN} from '../../server/sim/content/expansion/penguin-data.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {makeMatch,give,giveItem} from '../match/harness.js';
import {createRegistry} from '../../server/match/effectsMeta.js';
import {effectiveProfile} from '../../server/sim/ai.js';
import {GameData} from '../../server/match/gamedata.js';
import {SharedPool,drawDisabledBonds} from '../../server/match/pool.js';
import {createRng} from '../../server/sim/rng.js';
import {loadoutOptions} from '../../shared/protocol.js';
import {avatarUrl,portraitUrl,skillIconUrl,bondIconUrl} from '../../public/js/assets.js';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildBattleSpec,createBattleFromSpec} from '../../server/sim/spec.js';
import {flatStage} from '../helpers/battleHarness.js';
const QUIET={warn(){},error(){},info(){}};
const BASE=getData({log:QUIET}),DATA=buildPenguinData(BASE);
const elite=id=>id.replace(/_a$/,'_b');
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
const bond=(tier,L=0)=>({active:!!tier,tier,layers:L,count:tier===2?4:2});
function battle(opts={}){
  const raw=structuredClone(DATA);
  raw.enemies.enemy_c1_dummy=enemyRec({key:'enemy_c1_dummy',hp:1e7,speed:0,def:500,res:50});
  raw.chess.c1_plain=chessRec({id:'c1_plain',stats:{atk:600},skill:null});
  raw.chess.c1_penguin=chessRec({id:'c1_penguin',bonds:[PENGUIN],stats:{atk:600},skill:null});
  const h=makeBattle({data:new DataSource(raw,null),timeLimit:120,autoFinish:false,...opts});
  h.step(2);return h;
}
function settle(){
  const h=makeMatch({data:structuredClone(DATA),mode:'solo',difficulty:'NORMAL',seed:17,fake:true,registry:createRegistry({log:QUIET})}).start();h.toPrep(1);
  const m=h.m,p=h.ps('p_0');
  for(const q of [...p.board.values(),...p.hand.filter(Boolean),...p.temp.filter(Boolean)])if(q.kind==='chess')p.returnCopies(q);
  p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers.length=0;p.layers={};p.bandId=null;p.funds=50;p.recompute();
  return {h,m,p,put:(id,row,col)=>give(m,p,id,'board',[row,col]),end:()=>m.dispatch(p,'onPrepEnd',{round:m.round})};
}
function duel(tier,L=0){return battle({units:[{chessId:'c1_penguin',row:10,col:4}],bonds:{[PENGUIN]:bond(tier,L)},enemies:[{key:'enemy_c1_dummy',pos:[10,8]}]});}
const linkBlock=(h,u,e)=>{h.b._unblock(e);e.blockedBy=u;u.blocking.push(e);};
const clean=h=>{assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);};

test('C1 overlay is idempotent and leaves original rules unchanged',()=>{
  const before=JSON.stringify(BASE),x=buildPenguinData(BASE),once=JSON.stringify(x);applyPenguin(x);assert.equal(JSON.stringify(x),once);assert.equal(JSON.stringify(BASE),before);
  assert.equal(Object.values(x.chess).filter(c=>c.visible&&!c.isGolden).length,Object.values(BASE.chess).filter(c=>c.visible&&!c.isGolden).length+2);
  for(const c of Object.values(BASE.chess))if(['char_102_texas','char_103_angel','char_213_mostma'].includes(c.charId)){assert.deepEqual(x.chess[c.chessId].bonds,[...c.bonds,PENGUIN]);assert.deepEqual(x.chess[c.chessId].garrisonIds,c.garrisonIds);}
});
test('Current ban semantics: any positive Penguin weight participates equally; promotion does not turn drawn bonds off',()=>{
  const one=structuredClone(DATA),ten=structuredClone(DATA);one.bonds[PENGUIN].weight=1;ten.bonds[PENGUIN].weight=10;
  for(const seed of [1,7,17,83,991])assert.deepEqual(drawDisabledBonds(new GameData(one,'mode_single_normal'),createRng(seed)),drawDisabledBonds(new GameData(ten,'mode_single_normal'),createRng(seed)));
  const s=settle();s.put(CROISSANT,9,3);s.put(SORA,10,3);s.m.disabledBonds.push(PENGUIN);s.p.recompute();assert.equal(s.p.bonds[PENGUIN].active,true);s.m.dispose();
});
test('C1 enters the existing shop/pool and buys, merges, sells with exact copy accounting',()=>{
  const gd=new GameData(DATA,'mode_single_normal'),pool=new SharedPool(gd);assert.equal(gd.visibleChess.length,114);assert.equal(pool.cap(CROISSANT),14);assert.equal(pool.cap(SORA),18);
  for(const id of [CROISSANT,SORA]){
    assert.deepEqual(loadoutOptions(DATA.chess[id],DATA.chess[elite(id)]).skills,[0,1]);
    const s=settle();assert.ok(s.m.pool.has(id));const cap=s.m.pool.cap(id);s.p.shop.level=3;
    for(let i=0;i<3;i++){s.p.shop.slots=[{kind:'chess',id,sold:false}];assert.deepEqual(s.p.buy(0),{ok:true});}
    const merged=[...s.p.hand,...s.p.temp].filter(p=>p?.id===elite(id));assert.equal(merged.length,1);assert.equal(merged[0].poolCopies,3);assert.equal(s.m.pool.left(id),cap-3);
    assert.deepEqual(s.p.sell(merged[0].uid),{ok:true});assert.equal(s.m.pool.left(id),cap);s.p.rollShop();s.h.invariants();s.m.dispose();
  }
});
test('C1 client asset helpers resolve all new cards, skills, bond icons and skeleton files',()=>{
  const urls=[bondIconUrl(DATA.assets,PENGUIN)];
  for(const id of [CROISSANT,SORA])for(const status of [id,elite(id)]){
    const c=DATA.chess[status];urls.push(avatarUrl(DATA.assets,c.assets.avatar),portraitUrl(DATA.assets,c.assets.portrait));
    for(const s of c.skills)urls.push(skillIconUrl(DATA.assets,s.skillId,{fallback:false}));
    for(const model of Object.values(DATA.assets.chars[c.charId].spine))urls.push(model.skel,model.atlas,...model.textures);
  }
  for(const url of urls){assert.ok(url);assert.ok(existsSync(fileURLToPath(new URL('../../public'+url,import.meta.url))),url);}
});
test('C1 prep loadouts survive PlayerBattleInput and JSON BattleSpec without relying on global expanded data',()=>{
  const s=settle();s.put(elite(CROISSANT),9,3);s.put(elite(SORA),10,3);
  assert.equal(s.p.setLoadout({[CROISSANT]:{skill:1,module:'none'},[SORA]:{skill:0,module:'none'}}),true);
  const input=s.p.battleInput();assert.equal(input.units.find(u=>u.chessId===elite(CROISSANT)).skillIndex,1);assert.equal(input.units.find(u=>u.chessId===elite(SORA)).skillIndex,0);
  const raw=structuredClone(DATA);raw.stages.c1_flat=flatStage({id:'c1_flat'});
  const spec=JSON.parse(JSON.stringify(buildBattleSpec({stageId:'c1_flat',players:[input],kind:'normal',seed:17,timeLimit:60,flags:{startOpCooldown:0}})));
  const b=createBattleFromSpec(spec,new DataSource(raw,null),{logger:QUIET,quiet:true});b.start();b.step();
  const c=b.allyUnits.find(u=>u.defId===elite(CROISSANT)),o=b.allyUnits.find(u=>u.defId===elite(SORA));assert.equal(c.skill.id,'skchr_moeshd_2');assert.equal(o.skill.id,'skchr_sora_1');close(c.s.blockCnt,3);close(o.def.stats.atk,321);assert.equal(o.def.raw.module.active,false);assert.deepEqual(b.errors,[]);s.m.dispose();
});
test('C1 ordinary/elite default attributes and all four skills resolve without generic fallback',()=>{
  const expect=[[CROISSANT,2483,314,491,3],[elite(CROISSANT),3399,362,697,4],[SORA,1017,278,190,1],[elite(SORA),1412,334,226,1]];
  for(const[id,hp,atk,def,block]of expect)for(const skillIndex of [0,1]){const h=battle({units:[{chessId:id,skillIndex,row:10,col:4}]});const u=h.unit(id);close(u.s.maxHp,hp);close(u.s.atk,atk);close(u.s.def,def);close(u.s.blockCnt,block);assert.equal(u.kit.skillSource,'skills');clean(h);}
});
test('C1 no-module loadout removes only module attributes/trait and preserves E2 talents',()=>{
  for(const[id,hp,atk,def,block]of [[elite(CROISSANT),3219,362,647,3],[elite(SORA),1270,321,226,1]]){
    const h=battle({units:[{chessId:id,moduleId:'none',row:10,col:4}]});const u=h.unit(id);close(u.s.maxHp,hp);close(u.s.atk,atk);close(u.s.def,def);close(u.s.blockCnt,block);assert.equal(u.def.raw.module.active,false);clean(h);
  }
});
test('Croissant S1 is automatic at full SP even with no enemy, uses exact duration and enhanced field',()=>{
  const h=battle({units:[{chessId:elite(CROISSANT),row:10,col:4},{chessId:'c1_plain',row:11,col:4}]});const u=h.unit(elite(CROISSANT)),ally=h.unit('c1_plain');
  close(u.s.dodgePhys,0.2);close(ally.s.dodgeArts,0.1);u.skill.gainSp(100,'test');h.step(2);assert.ok(u.skill.active);close(u.s.def,697*1.4);close(u.s.dodgePhys,0.34);close(ally.s.dodgeArts,0.17);h.run(26.2);assert.equal(u.skill.active,false);close(u.s.dodgePhys,0.2);clean(h);
});
test('Croissant miracle field applies to four neighbours, not diagonals; repeated sources take highest',()=>{
  const h=battle({units:[{chessId:CROISSANT,row:10,col:4},{chessId:elite(CROISSANT),row:10,col:6},{chessId:'c1_plain',uid:3,row:10,col:5},{chessId:'c1_plain',uid:4,row:11,col:5}]});close(h.unit(3).s.dodgePhys,0.1);close(h.unit(4).s.dodgePhys,0);clean(h);
});
test('Croissant S2 deals its own physical AoE, push/stun and does not recover SP naturally',()=>{
  for(const id of [CROISSANT,elite(CROISSANT)]){
    const h=battle({units:[{chessId:id,skillIndex:1,row:10,col:4}],enemies:[{key:'enemy_c1_dummy',pos:[10,4]}],captureNoisy:true});const u=h.unit(id),e=h.enemy('enemy_c1_dummy');h.run(2);assert.equal(u.skill.sp,0);u.skill.gainSp(100,'test');u.skill.activate('test');
    const hits=h.hooksOf('damaged').filter(c=>c.dmg?.tags.includes('c1:croissant:hammer'));assert.equal(hits.length,1);close(hits[0].amount,u.s.atk*(id===CROISSANT?3:3.6)-500);assert.ok(e.s.flags.stun);assert.ok(e.shift||!e.blockedBy);clean(h);
  }
});
test('Sora supplies HP regeneration to a noHeal ally, has no normal attack',()=>{
  const h=battle({units:[{chessId:SORA,row:10,col:4},{chessId:'c1_plain',row:11,col:4}]});const s=h.unit(SORA),a=h.unit('c1_plain');h.b.addBuff(a,{key:'test:noHeal',flags:{noHeal:true}});a.hp=1000;h.run(1.2);assert.ok(a.hp>1020&&a.hp<1040);close(a.s.hpRegen,27.8);assert.equal(effectiveProfile(s).noAttack,true);assert.equal(h.b.heal(s,a,100),0);clean(h);
});
test('Sora BAR-X counts two other actual operators, not herself; no module has no 8% bonus',()=>{
  const units=[{chessId:elite(SORA),row:10,col:5},{chessId:'c1_plain',uid:2,row:10,col:4},{chessId:'c1_plain',uid:3,row:11,col:5}];
  const h=battle({units});close(h.unit(elite(SORA)).s.atk,334*1.08);h.b.retreat(h.unit(3));h.run(0.2);close(h.unit(elite(SORA)).s.atk,334);
  const x=battle({units:units.map(u=>u.chessId===elite(SORA)?{...u,moduleId:'none'}:u)});close(x.unit(elite(SORA)).s.atk,321);clean(h);clean(x);
});
test('Sora S2 adds final flat inspire to other allies, not herself, respects higher inspire, ignores isolation',()=>{
  const h=battle({units:[{chessId:SORA,row:10,col:4},{chessId:'c1_plain',row:11,col:4}]});const s=h.unit(SORA),a=h.unit('c1_plain');h.b.addBuff(a,{key:'test:atk',mods:{atkPct:1},flags:{isolated:true}});s.skill.gainSp(100,'test');s.skill.activate('test');h.run(0.1);close(a.s.atk,1200+278*0.8);close(s.s.atk,278);assert.equal(a.s.hpRegen,0,'regen does not opt into S2 isolation exception');
  h.b.addBuff(a,{key:'inspire',mods:{atkFlat:250},duration:2,data:{src:-1,val:500}});h.run(0.1);close(a.s.atk,1700);clean(h);
});
test('Sora S2 automatic trigger waits for an engaged ally, then casts',()=>{
  const h=battle({units:[{chessId:SORA,row:10,col:4},{chessId:'c1_plain',row:11,col:4}]});const s=h.unit(SORA);s.skill.gainSp(100,'test');h.run(0.5);assert.equal(s.skill.active,false);h.spawn('enemy_c1_dummy',{pos:[11,4]});h.run(0.3);assert.equal(s.skill.active,true);clean(h);
});
test('Sora S1 uses original expanded range, sleeps enemies and boosts regeneration then restores',()=>{
  const h=battle({units:[{chessId:SORA,skillIndex:0,row:10,col:4},{chessId:'c1_plain',row:11,col:4}],enemies:[{key:'enemy_c1_dummy',pos:[10,5]}]});const s=h.unit(SORA),a=h.unit('c1_plain'),e=h.enemy('enemy_c1_dummy');s.skill.gainSp(100,'test');s.skill.activate('test');h.run(0.1);assert.ok(e.s.flags.sleep);assert.ok(s.rangeKeys.length>13);close(a.s.hpRegen,278*0.55);assert.equal(h.b.dealDamage(a,e,{amount:600,type:'phys',isAttack:true}),0);h.run(7.2);assert.equal(s.skill.active,false);assert.equal(!!e.s.flags.sleep,false);close(a.s.hpRegen,27.8);clean(h);
});
test('Sora encore uses battle RNG and restores half cost only on skill duration completion',()=>{
  const h=battle({units:[{chessId:SORA,row:10,col:4}]});const s=h.unit(SORA);s.skill.gainSp(100,'test');s.skill.activate('test');h.b.rng=()=>0;s.skill.end('duration');close(s.skill.sp,22.5);s.skill.gainSp(100,'test');s.skill.activate('test');h.b.rng=()=>0.99;s.skill.end('duration');close(s.skill.sp,0);clean(h);
});
test('C1 growth checks equipped copies across a family even when its highest copy is unarmed',()=>{
  const s=settle(),c=s.put(CROISSANT,9,3),o=s.put(SORA,10,3);s.put(elite(CROISSANT),9,4);
  c.items.push({id:'chess_item_1_01_e_a',uid:9001});o.items.push({id:'chess_item_1_01_e_a',uid:9002});s.p.recompute();s.end();assert.equal(s.p.layers[PENGUIN],11);s.end();assert.equal(s.p.layers[PENGUIN],11);
});
test('C1 growth: one geared member gives Croissant 3/6, Sora adds 2/4; duplicate settlement grants once',()=>{
  for(const golden of [false,true]){const s=settle();const c=s.put(golden?elite(CROISSANT):CROISSANT,9,3),o=s.put(golden?elite(SORA):SORA,10,3);c.items.push({id:'chess_item_1_01_e_a',uid:9001});o.items.push({id:'chess_item_1_01_e_a',uid:9002});s.p.recompute();assert.equal(s.p.bonds[PENGUIN].active,true);s.end();assert.equal(s.p.layers[PENGUIN],golden?13:8);s.end();assert.equal(s.p.layers[PENGUIN],golden?13:8);assert.deepEqual(s.h.logs.error,[]);}
});
test('C1 growth: two items on one penguin, a bench Sora or duplicate family do not satisfy another member',()=>{
  const s=settle();const c=s.put(CROISSANT,9,3);c.items.push({id:'chess_item_1_01_e_a',uid:9001},{id:'chess_item_1_01_e_a',uid:9002});s.put(elite(CROISSANT),10,3);give(s.m,s.p,SORA);s.p.recompute();assert.equal(s.p.bonds[PENGUIN].count,1);s.end();assert.equal(s.p.layers[PENGUIN]||0,0);
});
test('C1 growth: ordinary + elite same family chooses elite tier once, neighbouring distinct skillful gives 2',()=>{
  const s=settle();s.put(SORA,9,3);s.put(elite(SORA),10,3);s.put('chess_char_1_14_a',10,4);s.put(CROISSANT,9,4);s.p.recompute();s.end();assert.equal(s.p.layers[PENGUIN],7);assert.equal(s.p.layers.skillfulShip,2);s.end();assert.equal(s.p.layers.skillfulShip,2);
});
test('C1 growth next round re-enables, onGain does not issue prep rewards and investment cannot multiply them',()=>{
  const s=settle();s.put(CROISSANT,9,3);const sora=s.put(SORA,10,3);s.p.bondCountBonus.investShip=20;s.p.layers.investShip=100;s.p.recompute();s.m.dispatch(s.p,'onGain',{kind:'chess',piece:sora});assert.equal(s.p.layers[PENGUIN]||0,0);s.end();assert.equal(s.p.layers[PENGUIN],5);s.m.round++;s.end();assert.equal(s.p.layers[PENGUIN],10);
});
test('C1 runtime with no overlay neither installs penguin hooks nor changes source data/random stream',()=>{
  const h=makeBattle({units:[{chessId:'chess_char_3_16_a',row:10,col:4}],seed:123});h.run(0.2);assert.ok(!h.b.allyUnits.some(u=>u.findBuff('exp:penguin:armed')));assert.equal(JSON.stringify(BASE.chess[CROISSANT]),undefined);clean(h);
});
