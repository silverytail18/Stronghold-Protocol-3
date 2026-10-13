import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {applyExpansion} from '../../server/sim/content/expansion/expansion-data.js';
import {applyRhodesMujica,GIRLS} from '../../server/sim/content/rhodes-mujica/data.js';
import {TEST_BOND_IDS,testBondMemberEffects,testBondCalculation} from '../../shared/test-bond-descriptions.js';
import {battleTestBondContext,penguinSupplyContext,snowOpeningContext} from '../../shared/test-bond-context.js';
import {formatBondEffect,richTextPlain} from '../../public/js/ui/richText.js';
import {engineeringDamage} from '../../shared/rhodes-engineering.js';
import {gainFever,startFever} from '../../server/sim/content/rhodes-mujica/fever.js';
import {makeBattle,chessRec,enemyRec} from '../helpers/battleHarness.js';
import {resultDigest} from '../../server/sim/spec.js';
const base=getData(),raw=structuredClone(base);applyExpansion(raw);applyRhodesMujica(raw);
const text=(id,L,tier,c)=>richTextPlain(formatBondEffect(raw.bonds[id],L,tier,c));
test('five opt-in descriptions preserve baseline, plain/rich parity and full rules; all tiers resolve without placeholders',()=>{
 for(const id of TEST_BOND_IDS){const b=raw.bonds[id];assert.equal(base.bonds[id],undefined);assert.equal(b.desc,richTextPlain(b.descRaw));assert.ok(b.detailSections[0].text.length>0);assert.ok(text(id,999,0).includes('未激活'));
  for(let tier=1;tier<=b.thresholds.length;tier++)for(const L of [0,40,80,100,220,300,800,999]){const s=text(id,L,tier,{atk:10000});assert.ok(!/[{}]|NaN|Infinity/.test(s),id+s);assert.ok(s.split('\n').length<=6);}
 }
 assert.ok(!raw.bonds.kazdelShip&&!raw.bonds.bloodlineShip);
 assert.ok(!raw.bonds.rhodesShip.desc.includes('屏障'));assert.ok(!raw.bonds.rhodesShip.detailSections[0].text.includes('协同屏障'));
});
test('Sui applies the80-layer cap and only unlocks physical damage at four members',()=>{
 assert.ok(text('suiShip',40,1).includes('280%'));assert.ok(!text('suiShip',40,1).includes('物理'));assert.ok(text('suiShip',40,1).includes('至多2名'));
 const four=text('suiShip',40,2);for(const s of ['280%','160%','168%','至多4名'])assert.ok(four.includes(s));
 assert.equal(text('suiShip',80,2),text('suiShip',999,2));
});
test('Penguin displays actual grants rather than inferring them from layers; unknown teammate stays unknown',()=>{
 const c=penguinSupplyContext({effects:[{id:'exp:penguin:supply',counter:1}]});
 const s=text('penguinShip',999,1,c);for(const v of ['攻击力+40','防御力+60','+5%','1/3','30层'])assert.ok(s.includes(v));
 assert.ok(text('penguinShip',999,2,{claimed:3}).includes('全部领取'));assert.ok(text('penguinShip',999,2,null).includes('待获取'));
 assert.equal(penguinSupplyContext(null),null);assert.deepEqual(penguinSupplyContext({effects:[]}),{claimed:0});
});
test('RI current shell damage uses the latest curve; calculation and growth are separate; no cooperative shield promise',()=>{
 const b=raw.bonds.rhodesShip;for(const tier of [2,3])for(const L of [0,220,300,800,999]){
  const c={atk:10000,live:true},s=text('rhodesShip',L,tier,c),n=engineeringDamage(b.engineering,L,10000,tier);
  assert.ok(s.includes('物理 '+Math.round(n.fire)));assert.equal(s.includes('真实 '),tier===3);assert.ok(!/底伤|系数|屏障|平方/.test(s));
  assert.ok(richTextPlain(testBondCalculation(b,L,tier,c)).includes('攻击力总和 10000'));
 }
 assert.ok(text('rhodesShip',300,2,{atk:10000,live:false}).includes('开战预计'));assert.ok(text('rhodesShip',300,2).includes('物理 待获取'));
 assert.ok(text('rhodesShip',300,2,{atk:10000}).includes('2054'));assert.ok(text('rhodesShip',300,1).includes('基础+0层'));
});
test('Guide resolves per-member attack, caps only the attribute term and filters opening membership',()=>{
 const b=raw.bonds.snowfieldGuideShip,c={live:true,coldRemaining:6.25,iceRemaining:10,members:[{uid:1,name:'甲',atk:1000},{uid:2,name:'乙',atk:1e4}]};
 const s=text('snowfieldGuideShip',999,2,c);for(const v of ['750—780','375—390','剩余6.3秒','冰爆剩余10秒'])assert.ok(s.includes(v),s);
 assert.ok(!text('snowfieldGuideShip',999,1,c).includes('冰爆'));const rows=testBondMemberEffects(b,c);assert.ok(richTextPlain(rows[0].text).includes('750'));assert.ok(richTextPlain(rows[1].text).includes('780'));
 const prep=snowOpeningContext(new Map([[1,{uid:1,defId:'a',atk:1000,alive:true}],[2,{uid:2,defId:'b',atk:9999}]]),id=>({name:id,bonds:id==='a'?['snowfieldGuideShip']:[]}));assert.equal(prep.members.length,1);assert.equal(prep.live,false);
});
test('Girl common, Fever and encore buffs replace each other; two-member tier never receives the40% upgrade',()=>{
 for(const c of [{live:true,feverRemaining:5,encoreRemaining:0},{live:true,feverRemaining:0,encoreRemaining:5}]){assert.ok(text('girlbandShip',999,2,c).includes('+40%'));assert.ok(text('girlbandShip',999,1,c).includes('+15%'));assert.ok(!text('girlbandShip',999,1,c).includes('+40%'));}
 assert.ok(text('girlbandShip',0,2,{live:true,feverRemaining:0,encoreRemaining:0}).includes('当前常态'));assert.ok(text('girlbandShip',0,2,{live:false}).includes('余韵持续6秒'));
});

function fixture(kind='normal'){
 const d=structuredClone(raw),guide='snowfieldGuideShip';
 d.chess.guide=chessRec({id:'guide',bonds:[guide],stats:{atk:1000,cost:0,blockCnt:0},rangeGrid:[[0,1],[1,1]],skill:null});
 d.enemies.target=enemyRec({key:'target',hp:1e7,atk:0,speed:0});
 const row=['boss','hidden'].includes(kind)?3:10;
 const players=['a','b'].map((playerId,i)=>({playerId,seat:i,side:i?'R':'L',colOffset:0,units:[{kind:'chess',chessId:'guide',uid:1+i*10,row,col:4+i*8,dir:'RIGHT'},{kind:'chess',chessId:GIRLS[0],uid:2+i*10,row:row+1,col:4+i*8,dir:'RIGHT'}],bonds:{[guide]:{active:true,tier:2,count:4,layers:40},girlbandShip:{active:true,tier:2,count:4,layers:0}}}));
 const h=makeBattle({kind,defs:d,players,autoFinish:false,timeLimit:60});h.step();return h;
}
for(const kind of ['normal','unite','boss','hidden'])test(`${kind}: live reads are pure, owner-specific and match real freeze refunds/Fever timers`,()=>{
 const h=fixture(kind),b=h.b;
 assert.equal(battleTestBondContext(b,'unknown','snowfieldGuideShip'),null);
 const girl=b.allyUnits.find(u=>u.ownerId==='a'&&u.defId===GIRLS[0]);gainFever(b,girl,450);assert.equal(startFever(b,'a'),true);
 const a=battleTestBondContext(b,'a','girlbandShip'),other=battleTestBondContext(b,'b','girlbandShip');assert.ok(a.feverRemaining>0);assert.equal(other.feverRemaining,0);
 const u=b.allyUnits.find(u=>u.defId==='guide'&&u.ownerId==='a'),target=h.spawn('target',{pos:[u.tileR,u.tileC+1]});b.applyStatus(target,'freeze',{duration:3});b.dealDamage(u,target,{amount:1,type:'true',isAttack:true,attackId:++b._attackSeq});
 let c=battleTestBondContext(b,'a','snowfieldGuideShip');assert.equal(c.iceRemaining,14);assert.ok(c.members.some(m=>m.atk===1000));
 const e=h.spawn('target',{pos:[u.tileR+1,u.tileC+1]});b.applyStatus(e,'freeze',{duration:3});c=battleTestBondContext(b,'a','snowfieldGuideShip');assert.equal(c.iceRemaining,13.5);assert.equal(battleTestBondContext(b,'b','snowfieldGuideShip').iceRemaining,0);
 const digest=resultDigest(b.result()).json,state=JSON.stringify([b.time,b.rng.state,b.snapshot(),b.enemies.map(e=>e.hp),b.errors]);
 for(let n=0;n<20;n++)for(const pid of ['a','b'])for(const id of ['snowfieldGuideShip','girlbandShip'])formatBondEffect(raw.bonds[id],40,2,battleTestBondContext(b,pid,id));
 assert.equal(resultDigest(b.result()).json,digest);assert.equal(JSON.stringify([b.time,b.rng.state,b.snapshot(),b.enemies.map(e=>e.hp),b.errors]),state);
 b.step();assert.ok(battleTestBondContext(b,'a','girlbandShip').feverRemaining<a.feverRemaining);assert.deepEqual(b.errors,[]);
});
