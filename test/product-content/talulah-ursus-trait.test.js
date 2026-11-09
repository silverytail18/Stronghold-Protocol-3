import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildUrsusData,CORE} from '../../server/sim/content/ursus/data.js';
import {talulahTrait} from '../../server/sim/content/ursus/talulah-trait.js';
import {makeBattle,enemyRec} from '../helpers/battleHarness.js';

const DATA=buildUrsusData(getData());
function field(active=true){
 const data=structuredClone(DATA);
 data.enemies.counter=enemyRec({key:'counter',hp:1e7,atk:1,def:0,res:0,speed:0});
 data.enemies.air=enemyRec({key:'air',hp:1e7,atk:1,def:0,res:0,speed:0,motion:'FLY'});
 const h=makeBattle({data,players:[{playerId:'p1',units:[{uid:1,chessId:'chess_ursus_oxi_a',skillIndex:1,row:10,col:4}],bonds:{[CORE]:{active,count:active?3:2,tier:active?1:0,layers:0}}}],enemies:[{key:'counter',pos:[10,5]},{key:'air',pos:[10,6]}],autoFinish:false});
 h.step();
 for(const e of h.enemies())h.b.addBuff(e,{key:'test:stealth',flags:{stealth:true},persist:true});
 return h;
}

test('Talulah S2 permanent counter requires active Ursus, then repeats full counter for hits, DoT and source-less HP loss',()=>{
 const inactive=field(false),inactiveUnit=inactive.allies()[0];
 assert.equal(talulahTrait(inactiveUnit,inactive.b),null);
 assert.equal(inactiveUnit.mem.oxiS2Infinite,false);

 const h=field(true),u=h.allies()[0],[source,air]=h.enemies();
 assert.ok(talulahTrait(u,h.b));
 assert.equal(u.skill.id,'skchr_oxi_2');
 u.skill.charges=1;
 let casts=0,lastTarget=null;h.b.on('oxiSkillCast',e=>{casts++;lastTarget=e.target;});
 const before=[source.hp,air.hp];
 h.b.dealDamage(source,u,{amount:5,type:'true'});
 assert.equal(casts,1,'first trigger spends the available S2 charge');
 assert.equal(u.mem.oxiS2Infinite,true,'active Ursus opens the persistent stance');
 const fx=()=>h.eventsOf('fx');
 assert.ok(fx().some(e=>e[1]==='oxiGuard'&&e[4]?.id===u.id),'S2 emits its guard visual');
 assert.ok(fx().some(e=>e[1]==='oxiCounter'&&e[4]?.target===source.id),'the first counter emits its target visual');
 assert.ok(source.hp<before[0],'the stealthed attacker is hit');
 assert.ok(air.hp<before[1],'the airborne stealthed enemy is hit');

 u.skill.charges=0;
 h.b.dealDamage(source,u,{amount:5,type:'true',tags:['dot']});
 assert.equal(casts,2,'each DoT tick triggers after charges are exhausted');
 assert.equal(fx().filter(e=>e[1]==='oxiCounter').length,2,'each counter hit emits its visual');
 const hp=source.hp;
 h.b.loseHp(u,5,{source:null});
 assert.equal(casts,3,'source-less HP loss triggers');
 assert.equal(lastTarget,source,'source-less loss selects the nearest valid enemy as the counter centre');
 assert.ok(source.hp<hp,'source-less loss centres the counter on the nearest enemy');
 assert.equal(fx().filter(e=>e[1]==='oxiCounter').at(-1)[4].target,source.id,'source-less counter visual follows the selected enemy');
 assert.deepEqual(h.b.errors,[]);
});

test('Talulah S2 does not gain the permanent stance while Ursus is inactive',()=>{
 const h=field(false),u=h.allies()[0],e=h.enemies()[0];
 u.skill.charges=1;
 h.b.dealDamage(e,u,{amount:5,type:'true'});
 assert.equal(u.mem.oxiS2Infinite,false);
 assert.equal(talulahTrait(u,h.b),null);
 assert.deepEqual(h.b.errors,[]);
});
