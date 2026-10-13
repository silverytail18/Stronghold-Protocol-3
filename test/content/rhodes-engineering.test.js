import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {buildRhodesMujicaData,RI,GIRL,AMORIS} from '../../server/sim/content/rhodes-mujica/data.js';
import {TERMINAL} from '../../server/sim/content/rhodes-mujica/balance.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {formatBondEffect} from '../../public/js/ui/richText.js';
const BASE=getData({log:{warn(){},error(){},info(){}}}),DATA=buildRhodesMujicaData(BASE);
const names=['guard','caster','support','medic','sniper','tank'],professions=['WARRIOR','CASTER','SUPPORT','MEDIC','SNIPER','TANK'];
const nodes=names.map((name,i)=>({chessId:'r5_'+name+'_a',row:9+Math.floor(i/2),col:3+i%2}));
const bond=(tier,layers=40)=>({active:true,tier,count:tier*3,layers});
function fixture({tier=2,layers=40,enemySpeed=0,enemies=[{key:'enemy_r5',pos:[10,5]}],...opts}={}){
 const raw=structuredClone(DATA);
 for(let i=0;i<names.length;i++)raw.chess[nodes[i].chessId]=chessRec({id:nodes[i].chessId,bonds:[RI],profession:professions[i],tier:3,stats:{atk:0,cost:0},skill:{spCost:10000}});
 raw.enemies.enemy_r5=enemyRec({key:'enemy_r5',hp:1e7,speed:enemySpeed,atk:0});
 raw.enemies.enemy_r5_air=enemyRec({key:'enemy_r5_air',hp:1e7,speed:enemySpeed,atk:0,motion:'FLY'});
 const h=makeBattle({data:new DataSource(raw,null),units:nodes,bonds:tier?{[RI]:bond(tier,layers)}:{},enemies,captureNoisy:true,autoFinish:false,timeLimit:180,...opts});h.step(2);return h;
}
const shots=(h,type)=>h.hooksOf('damageResolved').filter(c=>c.dmg?.tags?.includes('bond:rhodes:engineering')&&(!type||c.dmg.type===type));
const emit=(h,name,reason='test')=>h.b.emit('skillStart',{unit:h.unit('r5_'+name+'_a'),reason});
const clean=h=>{assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);};


test('six fires physical and arts independently every four seconds without a six-tier operator',()=>{
 const h=fixture();h.run(3);assert.equal(shots(h).length,2);for(const c of shots(h)){assert.equal(c.dmg.amount,180);assert.equal(c.credit.ownerId,'p1');assert.equal(c.source,null);}assert.equal(h.b.getPlayer('p1').bonds[RI].layers,42);h.run(4);assert.equal(shots(h).length,4);clean(h);
});
test('inactive/RI3/outside reach have no fire',()=>{for(const o of [{tier:0},{tier:1},{enemies:[{key:'enemy_r5',pos:[12,9]}]}]){const h=fixture(o);h.run(10);assert.equal(shots(h).length,0);clean(h);}});

test('new artillery radii include near secondary foes and exclude beyond-boundary foes',()=>{
 for(const tier of [2,3]){const h=fixture({tier});h.run(2.2);const r=tier===2?.8:1.2;
  const inside=h.b.spawnEnemy('enemy_r5',{pos:[10,5+r-.02]}),outside=h.b.spawnEnemy('enemy_r5',{pos:[10,5+r+.02]});h.run(.8);
  assert.ok(shots(h).some(c=>c.target.id===inside.id));assert.ok(!shots(h).some(c=>c.target.id===outside.id));clean(h);
 }
});
test('six and nine salvo events use four and two-and-a-half second cadence',()=>{
 for(const tier of [2,3]){const h=fixture({tier}),salvos=[],fx=h.b.fx.bind(h.b);h.b.fx=(kind,params)=>{if(kind==='rm-ri-salvo')salvos.push(h.b.time);return fx(kind,params);};h.run(11);
  assert.ok(salvos.length>=3);for(let i=1;i<salvos.length;i++)assert.ok(Math.abs(salvos[i]-salvos[i-1]-(tier===2?4:2.5))<.11);clean(h);
 }
});
test('six caps each shell at three; nine hits the whole area and includes flying foes',()=>{
 const enemies=[{key:'enemy_r5_air',route:2,pos:[10,5]},...Array.from({length:4},()=>({key:'enemy_r5',pos:[10,5.1]}))];
 for(const tier of [2,3]){const h=fixture({tier,enemies});h.run(3);assert.equal(shots(h).length,tier===2?6:15);assert.ok(shots(h).some(c=>c.target.isFlying));if(tier===3)assert.equal(shots(h,'true')[0].dmg.amount,90);clean(h);}
});
test('shell locks are distinct when possible, repeat only when enemies are fewer than shells',()=>{
 for(const count of [1,2,3,4]){const h=fixture({tier:3,enemies:Array.from({length:count},(_,i)=>({key:'enemy_r5',pos:[10,5+i*.03]}))});h.run(2.2);const fx=h.eventsOf('fx').find(e=>e[1]==='rm-ri-salvo');assert.ok(fx);const locks=fx[4].locks;assert.equal(new Set(locks.map(v=>v.target)).size,Math.min(count,3));assert.deepEqual(locks.map(v=>v.angle),[12,18,6]);clean(h);}
});
test('normal casts and free casts do not create extra artillery or offense',()=>{
 for(const reason of ['test','carry','rm:fever']){const h=fixture();emit(h,'guard',reason);emit(h,'caster',reason);emit(h,'support',reason);h.run(3);assert.equal(shots(h).length,2);assert.ok(h.allies().every(u=>!u.findBuff('rm:ri:offense')));clean(h);}
});
test('one salvo freezes layers and current ATK; personal damage multipliers do not transfer',()=>{
 const h=fixture();h.b.addBuff(h.allies()[0],{key:'atk',mods:{atkFlat:1000,dmgDealtMul:10}});h.run(2.2);h.b.addLayers('p1',RI,100);h.run(.8);assert.equal(shots(h)[0].dmg.amount,227.2);assert.ok(Math.abs(shots(h)[0].dealt-227.2)<1e-6);clean(h);
});

test('rebalanced RI stats feed the actual late artillery with six/nine caps and half-strength true shell',()=>{
 for(const [tier,expected]of [[2,19870],[3,21220]]){
  const h=fixture({tier,layers:800}),u=h.allies()[0];h.b.addBuff(u,{key:'qa:atk',mods:{atkFlat:1000}});
  assert.ok(Math.abs(u.s.atk-2700)<1e-8);h.run(3);
  for(const type of ['phys','arts'])assert.equal(shots(h,type)[0].dmg.amount,expected);
  if(tier===3)assert.equal(shots(h,'true')[0].dmg.amount,10610);clean(h);
 }
});

test('all RI thresholds apply the reduced attack growth at opening and at 999 layers',()=>{
 for(const tier of [1,2,3])for(const [layers,multiplier]of [[0,1.1],[220,1.54],[800,2.7],[999,3.098]]){
  const h=fixture({tier,layers,enemies:[]}),u=h.allies()[0];h.b.addBuff(u,{key:'qa:atk',mods:{atkFlat:1000}});
  assert.ok(Math.abs(u.s.atk-1000*multiplier)<1e-8);clean(h);
 }
});
test('different shells may each damage the same enemy in overlapping areas',()=>{
 const h=fixture({tier:3});h.run(3);const e=h.enemy('enemy_r5');assert.equal(shots(h).length,3);assert.equal(new Set(shots(h).map(c=>c.target.id)).size,1);assert.equal(1e7-e.hp,450);clean(h);
});
test('a moving or dead locked target cannot make a shell track to its new position',()=>{
 const h=fixture();h.run(2.2);const e=h.enemy('enemy_r5');e.x=9;e.y=12;h.run(.8);assert.equal(shots(h).length,0);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,40);clean(h);
});
test('pure shield absorption awards one growth per salvo, with battle caps and 999 hard cap',()=>{
 const h=fixture();h.b.addBuff(h.enemy('enemy_r5'),{key:'shield',shield:1e10,duration:180});h.run(70);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,64);assert.ok(shots(h).every(c=>c.dealt===0));clean(h);
 const z=fixture({tier:3,layers:998});z.run(3);assert.equal(z.b.getPlayer('p1').bonds[RI].layers,999);clean(z);
});
test('all operators retreating cancels a pending salvo',()=>{const h=fixture();h.run(2.2);for(const u of h.allies())h.b.retreat(u);h.run(8);assert.equal(shots(h).length,0);clean(h);});
test('engineering kills are credited to the bond and never trigger Humus personal kills',()=>{
 const native=name=>Object.values(DATA.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
 const h=fixture({units:[{chessId:native('休谟斯'),row:10,col:4},{chessId:AMORIS,row:11,col:4}]});for(const u of h.allies())h.b.addBuff(u,{key:'disarm',flags:{disarm:true}});h.enemy('enemy_r5').hp=1;h.run(3);assert.ok(!h.enemy('enemy_r5').alive);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,42);assert.ok(h.allies().every(u=>u.stats.kills===0));clean(h);
});
test('cooperative owner damage and layer gains stay isolated',()=>{
 const raw=structuredClone(DATA);raw.chess.r5_guard_a=chessRec({id:'r5_guard_a',bonds:[RI],stats:{atk:0,cost:0}});raw.enemies.enemy_r5=enemyRec({key:'enemy_r5',hp:1e7,speed:0,atk:0});
 const h=makeBattle({data:new DataSource(raw,null),kind:'unite',players:[{playerId:'p1',units:[{chessId:'r5_guard_a',uid:1,row:10,col:4}],bonds:{[RI]:bond(2)}},{playerId:'p2',units:[{chessId:'r5_guard_a',uid:2,row:10,col:14}],bonds:{[RI]:bond(2)}}],enemies:[{key:'enemy_r5',pos:[10,5]}],autoFinish:false});h.run(3);const cs=shots(h);assert.ok(cs.length);assert.ok(cs.every(c=>c.credit.ownerId==='p1'));assert.equal(h.b.getPlayer('p1').bonds[RI].layers,40);assert.equal(h.b.getPlayer('p2').bonds[RI].layers,40);clean(h);
});
test('two and three profession casts plus personal shield absorption grant no removed support growth',()=>{
 for(const tier of [2,3]){const h=fixture({tier}),u=h.allies()[0],e=h.enemy('enemy_r5');
  for(const reason of ['test','carry','rm:fever']){emit(h,'guard',reason);emit(h,'caster',reason);emit(h,'support',reason);}
  assert.ok(h.allies().every(a=>!a.findBuff('rm:ri:shield')));assert.equal(h.b.getPlayer('p1').bonds[RI].layers,40);
  h.b.addBuff(u,{key:'qa:personalShield',shield:100});assert.equal(h.b.dealDamage(e,u,{amount:10,type:'true',canDodge:false}),0);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,40);
  h.run(3);assert.equal(h.b.getPlayer('p1').bonds[RI].layers,42);assert.ok(shots(h).length>0);assert.ok(!h.hooksOf('layerGain').some(c=>c.reason==='rm:support'));clean(h);
 }
});

test('current text resolves ATK, life and all per-shell numbers without shield',()=>{
 const six=formatBondEffect(DATA.bonds[RI],800,2,{atk:10000}),nine=formatBondEffect(DATA.bonds[RI],800,3,{atk:10000});
 for(const v of ['170%','23520'])assert.ok(six.includes(v),v);
 for(const v of ['28520','14260'])assert.ok(nine.includes(v),v);assert.ok(!six.includes('协同')&&!nine.includes('屏障'));assert.ok(!/[{}]/.test(six+nine));assert.ok(!six.includes('\\n'));
});
test('startup supply is once, low-tier only, and tops up instead of stacking with Girl/terminal',()=>{
 for(const golden of [false,true]){const native=Object.values(DATA.chess).find(c=>c.name==='休谟斯'&&c.visible&&c.isGolden===golden).chessId;
  const h=fixture({tier:1,enemies:[],units:[{chessId:native,row:10,col:4}]});const u=h.unit(native),init=u.skill.initSp;
  assert.ok(Math.abs(u.skill.sp-init-(golden?12:8)-h.b.time)<.01);h.b.retreat(u);h.b.redeploy(u,{free:true,tile:[10,4]});assert.equal(u.skill.sp,init);clean(h);
 }
 const plain=fixture({tier:1,enemies:[],units:[{chessId:AMORIS,row:10,col:4}]}),girl=fixture({tier:1,enemies:[],units:[{chessId:AMORIS,row:10,col:4}],bonds:{[RI]:bond(1),[GIRL]:{active:true,tier:1,layers:0,count:2}}});
 const supplied=(h,n)=>assert.ok(Math.abs(h.unit(AMORIS).skill.sp-h.unit(AMORIS).skill.initSp-n-(h.unit(AMORIS).skill.spType==="time"?h.b.time:0))<.01);
 supplied(plain,8);supplied(girl,10);
 const gear=fixture({tier:1,enemies:[],units:[{chessId:AMORIS,row:10,col:4,items:[TERMINAL+'_a']}]});supplied(gear,10);clean(girl);clean(gear);
});

test('locked primary foes slow 50 percent only until detonation at both thresholds',()=>{
 for(const tier of [2,3]){const h=fixture({tier,enemySpeed:.1}),e=h.enemy('enemy_r5'),speed=e.s.moveSpeed;h.run(2.2);assert.ok(Math.abs(e.s.moveSpeed-speed*.5)<1e-9);assert.equal(e.buffs.filter(v=>v.key==='slow').length,1);h.run(tier===3?.4:.5);assert.ok(Math.abs(e.s.moveSpeed-speed)<1e-9);clean(h);}
});
test('secondary area foes are not slowed; repeated shell locks never multiply the debuff',()=>{
 const h=fixture({tier:2,enemySpeed:.1,enemies:Array.from({length:4},(_,i)=>({key:'enemy_r5',pos:[10,5+i*.03]}))});h.run(2.2);const locks=new Set(h.eventsOf('fx').find(e=>e[1]==='rm-ri-salvo')[4].locks.map(l=>l.target));assert.equal(locks.size,2);for(const e of h.enemies())assert.ok(Math.abs(e.s.moveSpeed-(locks.has(e.id)?.05:.1))<1e-9);clean(h);
});
test('stronger and longer existing slows survive the lock and resume their own remaining tail',()=>{
 for(const value of [.3,.8]){const h=fixture({tier:3,enemySpeed:.1}),e=h.enemy('enemy_r5');h.b.applyStatus(e,'slow',{value,duration:10});h.run(2.2);assert.ok(Math.abs(e.s.moveSpeed-.1*(1-Math.max(value,.5)))<1e-9);h.run(.7);assert.ok(Math.abs(e.s.moveSpeed-.1*(1-value))<1e-9);clean(h);}
});
