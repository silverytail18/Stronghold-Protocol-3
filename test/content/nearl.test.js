import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {buildRhodesMujicaData,RI,NEARL,AMIYA} from '../../server/sim/content/rhodes-mujica/data.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
const DATA=buildRhodesMujicaData(getData({log:{warn(){},error(){},info(){}}})),elite=id=>id.replace(/_a$/,'_b');
function setup({golden=false,active=true,companion=true,skillIndex=0,...opts}={}){
 const raw=structuredClone(DATA);raw.chess.nearl_plain=chessRec({id:'nearl_plain',skill:null});raw.enemies.enemy_nearl_test=enemyRec({key:'enemy_nearl_test',hp:1e9,atk:0,speed:0});
 const id=golden?elite(NEARL):NEARL,h=makeBattle({data:new DataSource(raw,null),units:[{chessId:id,row:10,col:4,skillIndex},...(companion?[{chessId:AMIYA,row:11,col:4}]:[])],enemies:[{key:'enemy_nearl_test',pos:[10,4]}],bonds:active?{[RI]:{active:true,tier:1,layers:0,count:3}}:{},autoFinish:false,timeLimit:180,...opts});
 h.step(2);for(const u of h.allies())h.b.addBuff(u,{key:'test:disarm',flags:{disarm:true}});return{h,u:h.unit(id),e:h.enemy('enemy_nearl_test')};
}
const clean=h=>{assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);};
test('Nearl is T3 Guardian with authentic S1/S2 and X module; removed native memberships stay removed',()=>{
 const a=DATA.chess[NEARL],z=DATA.chess[elite(NEARL)];assert.equal(a.tier,3);assert.equal(z.tier,3);assert.deepEqual(a.bonds,[RI]);assert.equal(a.skills.length,2);assert.equal(z.modules[0].uniEquipId,'uniequip_002_nearl');assert.equal(a.skills[0].bb.heal_scale,1.3);assert.equal(z.skills[0].bb.heal_scale,1.5);assert.equal(a.skills[1].bb.base_attack_time,1.3);
 for(const c of Object.values(DATA.chess).filter(c=>['百炼嘉维尔','予愿安洁莉娜'].includes(c.name)))assert.ok(!c.bonds.includes(RI));
});
for(const golden of [false,true])test('Nearl reduced blocked physical/arts damage, not true ('+golden+')',()=>{
 const{h,u,e}=setup({golden});u.blocking=[e];const ratio=golden?.85:.9;
 for(const type of ['phys','arts']){const hit=h.b.dealDamage(e,u,{amount:1000,type,canDodge:false});const want=(type==='phys'?Math.max(1000-u.s.def,50)*ratio:1000*ratio*(1-u.s.res/100));assert.ok(Math.abs(hit-want)<1e-5,hit+' '+want);}
 const before=u.hp;h.b.dealDamage(e,u,{amount:50,type:'true',canDodge:false});assert.equal(before-u.hp,50);clean(h);
});
test('Nearl does not gain field growth by standing idle, absent companion, inactive RI or incoming nonblocked enemies',()=>{
 for(const o of [{},{companion:false},{active:false}]){const{h,u,e}=setup(o);h.run(20);assert.equal(h.b.getPlayer('p1').bonds[RI]?.layers||0,0);clean(h);}
});
for(const golden of [false,true])test('pressure clock pauses without resetting and respects normal/elite battle cap ('+golden+')',()=>{
 const{h,u,e}=setup({golden});u.blocking=[e];h.b.addBuff(u,{key:'test:shield',shield:1e8,duration:180});
 const push=seconds=>{for(let i=0;i<Math.round(seconds*10);i++){u.blocking=[e];h.b.dealDamage(e,u,{amount:1,type:'true',canDodge:false});h.run(.1);}};
 push(4);u.blocking=[];h.run(4);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,0);push(4.2);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,golden?4:2);push(50);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,golden?20:10);clean(h);
});
test('S2 uses 2.3 times the base attack interval and heals without attacking enemies',()=>{
 const{h,u,e}=setup({skillIndex:1});h.b.removeBuff(u,'test:disarm');const ally=h.unit(AMIYA);ally.hp=10;u.skill.gainSp(999,'test');u.skill.activate('test');assert.ok(u.skill.active);assert.ok(Math.abs(u.s.bat/u.base.bat-2.3)<1e-6);const ownDamage=u.stats.dmg;h.run(5);assert.ok(ally.hp>10);assert.equal(u.stats.dmg,ownDamage);clean(h);
});
test('elite Nearl aura heals own team once despite normal duplicates',()=>{
 const raw=structuredClone(DATA);raw.chess.nearl_plain=chessRec({id:'nearl_plain',skill:null});
 const h=makeBattle({data:new DataSource(raw,null),units:[{chessId:NEARL,row:10,col:3},{chessId:elite(NEARL),row:10,col:4},{chessId:'nearl_plain',row:11,col:4}],autoFinish:false});h.step(2);const ally=h.unit('nearl_plain');ally.hp=10;const healed=h.b.heal(ally,ally,100);assert.ok(Math.abs(healed-110)<1e-6);clean(h);
});

