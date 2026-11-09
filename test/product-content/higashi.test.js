import {test} from 'node:test';import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildHigashiData,CORE,NINJA,NEW,DEFEND,MARKET} from '../../server/sim/content/higashi/data.js';
import {makeBattle,enemyRec} from '../helpers/battleHarness.js';
import {makeMatch} from '../match/harness.js';
import {compactResult} from '../../server/sim/spec.js';
import {isBattleResult} from '../../shared/protocol.js';
import {stats,releaseDamage} from '../../shared/higashi-rules.js';
import {isHigashiResult} from '../../shared/higashi-wire.js';
const BASE=getData(),DATA=buildHigashiData(BASE),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
export function fixture({count=6,ninja=0,L=100,bandId=null,kind='normal',units=null,carry=null,lock=true}={}){
 const data=structuredClone(DATA);data.enemies.hgqa=enemyRec({key:'hgqa',hp:1e7,atk:50,def:0,res:0,speed:0});
 const input={playerId:'p1',bandId,units:units||['noirc','gyuki','yuki'].map((key,i)=>({uid:i+1,chessId:'chess_higashi_'+key+'_a',row:10+i%2,col:4})),bonds:{[CORE]:{active:count>=3,count,tier:count>=9?3:count>=6?2:count>=3?1:0,layers:L},[NINJA]:{active:ninja>=2,count:ninja,tier:ninja>=4?2:1,layers:0}},contentInfo:carry?{higashiCarry:carry}:{}};
 const h=makeBattle({data,players:[input],kind,autoFinish:false,enemies:[{key:'hgqa',pos:[10,4]},{key:'hgqa',pos:[11,4]}],setup(b){b.on('enemySpawn',({enemy:e})=>b.addBuff(e,{key:'qa:quiet',flags:{disarm:true},persist:true}));if(lock)for(const u of b.allyUnits)b.addBuff(u,{key:'qa:lock',flags:{disarm:true,noSp:true},persist:true,allowDead:true});}});h.step();return h;
}
test('isolated overlay preserves baseline, has precisely approved operators, native skill records and equipment',()=>{
 const before=JSON.stringify(BASE);buildHigashiData(BASE);assert.equal(JSON.stringify(BASE),before);assert.equal(NEW.length,8);
 const cs=Object.values(DATA.chess).filter(c=>!c.isGolden&&c.bonds.includes(CORE));assert.equal(cs.length,11);assert.ok(!cs.some(c=>['夜刀','水月','松桐'].includes(c.name)));
 assert.deepEqual(DATA.bonds[CORE].thresholds,[3,6,9]);assert.equal(cs.filter(c=>c.bonds.includes(NINJA)).length,4);
 assert.equal(Object.values(DATA.chess).filter(c=>c.expansionBatch==='higashi-expansion-v1').reduce((n,c)=>n+c.skills.length,0),32);
 assert.equal(Object.values(DATA.items).filter(c=>c.expansionBatch==='higashi-expansion-v1').length,4);assert.ok(!DATA.bands.band_higashi_akafuyu);
 for(const base of ['chess_char_1_18','chess_char_2_11','chess_char_4_17'])for(const q of ['a','b']){const old=BASE.chess[base+'_'+q],rec=DATA.chess[base+'_'+q];for(const k of Object.keys(old).filter(k=>!['bonds','garrisonIds'].includes(k)))assert.deepEqual(rec[k],old[k]);}
});
for(const [count,expected]of [[2,0],[3,1],[5,1],[6,2],[7,2],[8,2],[9,3]])test(`core ${count} snapshot applies tier ${expected} correctly`,()=>{const h=fixture({count});assert.equal(h.b.higashi.states.get('p1').tier,expected);const u=h.allies()[0];near(u.s.atk,u.base.atk*(1+(expected?stats(100).atkPct:0)));assert.deepEqual(h.b.errors,[]);});
test('successful parry shares cooldown and rejects true/dot/self damage; ordinary shield absorption remains',()=>{
 const h=fixture({count:8}),u=h.allies()[1],e=h.enemies()[0];const before=u.hp;h.b.dealDamage(e,u,{amount:1000,type:'arts',isAttack:true,canDodge:false});near(before-u.hp,730);assert.equal(h.b.higashi.states.get('p1').metrics.parries,1);
 let hp=u.hp;h.b.dealDamage(e,u,{amount:100,type:'arts',isAttack:true,canDodge:false});near(hp-u.hp,73);
 h.run(8);hp=u.hp;h.b.dealDamage(e,u,{amount:100,type:'true',isAttack:true});near(hp-u.hp,100);h.b.dealDamage(e,u,{amount:100,type:'arts',tags:['dot']});assert.equal(h.b.higashi.states.get('p1').metrics.parries,1);assert.deepEqual(h.b.errors,[]);
});
test('multi-target/multi-segment attacks are one native action and per-second native supply is capped at eight',()=>{
 const h=fixture(),u=h.allies()[1],s=h.b.higashi.states.get('p1');s.Q=75;u.profile.hits=3;h.b.forceAttack(u,h.enemies());assert.equal(s.Q,79);assert.equal(s.metrics.attackSupply,4);h.b.forceAttack(u,h.enemies());assert.equal(s.Q,79);assert.deepEqual(h.b.errors,[]);
});
test('a cancelled projectile does not suppress the same action successful remaining target',()=>{
 const h=fixture(),u=h.allies()[1],s=h.b.higashi.states.get('p1');
 s.Q=75;u.profile.attack='ranged';u.profile.projectile='arrow';h.b.forceAttack(u,h.enemies());h.enemies()[0].alive=false;
 h.run(.5);assert.equal(s.Q,79);assert.equal(s.metrics.attackSupply,4);assert.deepEqual(h.b.errors,[]);
});
test('nine-member release acts independently and automatically returns after 0.8s',()=>{
 const h=fixture({count:9,L:300}),u=h.allies()[0],s=h.b.higashi.states.get('p1');h.b.removeBuff(u,'qa:lock');u.atkCd=1e6;h.b.addBuff(u,{key:'qa:noSp',flags:{noSp:true},persist:true});h.run(1.3);assert.equal(s.metrics.releases,1);const v=s.units.get('1');assert.equal(v.releaseLeft,1);h.run(.85);assert.equal(v.releaseLeft,0);assert.equal(s.metrics.spent,2);assert.equal(h.hooksOf('attack').length,0);assert.deepEqual(h.b.errors,[]);
});

test('dedicated conversion requires original isomorph pair; harmony is attributes-only',()=>{
 const id='chess_char_1_01_a',h=fixture({count:3,units:[{uid:1,chessId:id,row:10,col:4,items:['higashi_seal_a','chess_item_6_09_e_a']},{uid:2,chessId:id,row:11,col:4,items:['higashi_seal_a']}]});
 const [a,z]=h.allies();assert.ok(a.s.atk>z.s.atk);const e=h.enemies()[0];h.b.dealDamage(e,a,{amount:100,type:'arts',canDodge:false});h.b.dealDamage(e,z,{amount:100,type:'arts',canDodge:false});assert.equal(h.b.higashi.states.get('p1').metrics.parries,1);assert.deepEqual(h.b.errors,[]);
});
test('general talisman works without active core and excludes AoE duplication and cooldown precharge',()=>{
 const h=fixture({count:0,units:[{uid:1,chessId:'chess_higashi_noirc_a',row:10,col:4,items:['higashi_talisman_b']}]}),u=h.allies()[0],s=h.b.higashi.states.get('p1'),v=s.units.get('1');
 for(let i=0;i<3;i++)h.b.forceAttack(u,h.enemies());assert.equal(s.metrics.shields,1);near(u.findBuff('hg:talisman').shield,u.base.maxHp*.12);for(let i=0;i<10;i++)h.b.forceAttack(u,h.enemies());assert.equal(s.metrics.shields,1);assert.equal(v.shieldCount,0);h.run(8.1);for(let i=0;i<2;i++)h.b.forceAttack(u,h.enemies());assert.equal(s.metrics.shields,1);h.b.forceAttack(u,h.enemies());assert.equal(s.metrics.shields,2);assert.deepEqual(h.b.errors,[]);
});
test('core metrics and temporary windows survive compact protocol and unite carry without new opening resource',()=>{
 const h=fixture({count:8});h.run(4);const s=h.b.higashi.states.get('p1');s.Q=100;h.step();h.b.forceAttack(h.allies()[0],[h.enemies()[0]]);h.b._finish('forced');const r=compactResult(h.b.result());assert.ok(isBattleResult(r));assert.ok(isHigashiResult(r.perPlayer.p1.higashi));
 const carry=r.perPlayer.p1.higashi.carry,k=fixture({count:8,kind:'unite',carry});assert.equal(k.b.higashi.states.get('p1').Q,carry.Q);assert.ok(k.b.higashi.states.get('p1').releaseReady>k.b.time);assert.equal(k.b.higashi.states.get('p1').metrics.releases,0);assert.deepEqual(k.b.errors,[]);
});
test('market milestones grant stock-backed unheld operators, fixed tier caps, and preserve full-hand opportunities',()=>{
 const h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true}).start();h.toPrep(1);const p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.bandId=MARKET;p.shop.level=4;p.recompute();assert.ok(p.offers[0]);assert.equal(p.offers[0].recruitTier,2);assert.ok(p.offers[0].slots.every(s=>DATA.chess[s.id].tier<=2));assert.ok(p.pickReward(0).ok);assert.equal(p.offers[0].recruitTier,4);assert.ok(p.pickReward(0).ok);p.recompute();assert.equal(p.offers.length,0);assert.equal(p.hand.filter(Boolean).length,2);h.m.dispose();
});
test('Black Corne has no invented skill, common original stages capped and native kits resolve all 34 skill variants',async()=>{
 const {DataSource}=await import('../../server/sim/simdata.js');const {skillSpecSource}=await import('../../server/sim/content/index.js');const ds=new DataSource(DATA,null);
 for(const id of NEW)for(const q of ['a','b']){const rec=DATA.chess[id.replace(/_a$/,'_'+q)];for(const sk of rec.skills)assert.equal(skillSpecSource(ds.getChess(rec.chessId,{skillIndex:sk.index})),'skills');}
 const h=fixture({units:[{uid:1,chessId:'chess_higashi_noirc_b',row:10,col:4}]});assert.ok(h.allies()[0].skill.noSkill);assert.equal(DATA.chess.chess_higashi_midn_b,undefined);
});

const chess=(key,q='a',skillIndex=0,extra={})=>({uid:1,chessId:'chess_higashi_'+key+'_'+q,row:10,col:4,dir:'RIGHT',skillIndex,...extra});
const cast=u=>{const b=u.skill.battle,lock=u.findBuff('qa:lock');if(lock)b.removeBuff(u,'qa:lock');u.skill.gainSp(1e4,'qa',true);assert.ok(u.skill.activate('qa'),u.name+' '+u.skill.id);if(lock)b.addBuff(u,{key:'qa:lock',flags:{disarm:true,noSp:true},persist:true});};
test('all 32 normal/elite native skills execute on real runtime without isolated handler errors',()=>{
 for(const id of NEW)for(const q of ['a','b'])for(const sk of DATA.chess[id.replace(/_a$/,'_'+q)].skills){
  const h=fixture({units:[chess(id.split('_')[2],q,sk.index)],lock:true}),u=h.allies()[0];u.hp=u.s.maxHp*.4;cast(u);for(let i=0;i<3;i++){h.b.forceAttack(u,h.enemies());h.run(1);}assert.deepEqual(h.b.errors,[],`${id} ${q} S${sk.index+1}`);
 }
});
test('Akafuyu S1 zero block and two hits; S2 shield consumes before parry and native recovery growth',()=>{
 let h=fixture({units:[chess('akafyu','a',0)]}),u=h.allies()[0];cast(u);assert.equal(u.s.blockCnt,0);const e=h.enemies()[0],hp=e.hp;h.b.forceAttack(u,[e]);assert.ok(hp-e.hp>u.s.atk*1.9);assert.deepEqual(h.b.errors,[]);
 h=fixture({units:[chess('akafyu','a',1)]});u=h.allies()[0];const enemy=h.enemies()[0];cast(u);const start=u.hp;h.b.dealDamage(enemy,u,{amount:100,type:'arts',isAttack:true,canDodge:false});near(u.hp,start);assert.equal(h.b.higashi.states.get('p1').metrics.parries,0);h.b.forceAttack(u,[enemy]);assert.equal(h.b.higashi.states.get('p1').growth[u.def.baseId].points,5);assert.deepEqual(h.b.errors,[]);
});
test('Haruka bubbles use cached attack, actual enemy HP loss, multiple independent hosts and no-heal rules',()=>{
 const h=fixture({count:3,units:[chess('haruka','b'),{uid:2,chessId:'chess_higashi_noirc_a',row:10,col:5},{uid:3,chessId:'chess_higashi_gyuki_a',row:11,col:5}]}),u=h.allies()[0];h.run(5);assert.ok(u.mem.hgNative.bubbles.length>=2);
 const bubble=u.mem.hgNative.bubbles.find(x=>x.uid===2),a=h.allies()[1],e=h.enemies()[0];assert.ok(bubble);a.hp=a.s.maxHp*.7;
 h.b.addBuff(a,{key:'qa:shield',shieldHits:1,duration:1});h.b.dealDamage(e,a,{amount:100,type:'arts',canDodge:false});assert.equal(bubble.breakAt,0);h.b.dealDamage(e,a,{amount:100,type:'arts',canDodge:false});assert.ok(bubble.breakAt>0);const before=a.hp;h.b.addBuff(u,{key:'qa:atk',mods:{atkPct:10},persist:true});h.run(.6);near(a.hp-before,bubble.attack*.25);assert.deepEqual(h.b.errors,[]);
});
test('Haruka second S2 cast becomes sustained healing and actual healing drives damage, and contributes native action supply',()=>{
 const h=fixture({units:[chess('haruka','a',1),{uid:2,chessId:'chess_higashi_noirc_a',row:10,col:5}]}),u=h.allies()[0],a=h.allies()[1],e=h.enemies()[0];cast(u);assert.ok(u.skill.timeLeft<30);u.skill.end('qa');cast(u);assert.ok(u.skill.timeLeft>1e8);a.hp=a.s.maxHp-100;const hp=e.hp;h.b.forceAttack(u,[a]);near(hp-e.hp,140);assert.equal(h.b.higashi.states.get('p1').metrics.attackSupply,4);h.b.addBuff(a,{key:'qa:noheal',flags:{noHeal:true},persist:true});a.hp-=100;const unchanged=e.hp;h.b.forceAttack(u,[a]);near(e.hp,unchanged);assert.deepEqual(h.b.errors,[]);
});
test('Hoshiguma alter negative life rejects ally heal, pays own debt and forced exit beats ordinary revivals',()=>{
 const h=fixture({count:0,units:[chess('hsgma2'),{uid:2,chessId:'chess_higashi_haruka_a',row:11,col:4}]}),u=h.allies()[0],e=h.enemies()[0],ally=h.allies()[1];h.b.dealDamage(e,u,{amount:u.hp+200,type:'true',canDodge:false});assert.ok(u.alive&&u.mem.hgNative.negative);near(u.mem.hgNative.debt,200);assert.equal(h.b.heal(ally,u,500),0);h.b.heal(u,u,201,{self:true});assert.ok(!u.mem.hgNative.negative);h.b.dealDamage(e,u,{amount:u.s.maxHp*4,type:'true',canDodge:false});assert.ok(!u.alive&&!u.removed&&u.removeReason==='killed');assert.deepEqual(h.b.errors,[]);
});
test('Hoshiguma alter orbit slows rotation on contact, blocks SP until return and has native per-victim damage',()=>{
 const h=fixture({units:[chess('hsgma2','a',1)]}),u=h.allies()[0],e=h.enemies()[0];e.x=u.x+1.2;e.y=u.y;cast(u);assert.ok(u.skill.active);h.run(.6);assert.ok(u.mem.hgNative.orbitAngle<.4);assert.ok(u.stats.dmg>0);const sp=u.skill.sp;u.skill.gainSp(1,'qa');near(u.skill.sp,sp);h.run(25);assert.equal(u.mem.hgNative.orbitActive,false);assert.deepEqual(h.b.errors,[]);
});
test('Hoshiguma alter S3 terminal retains stats, four-hit profile protects ally and permanently exits at 11s',()=>{
 const h=fixture({units:[chess('hsgma2','a',2),{uid:2,chessId:'chess_higashi_noirc_a',row:10,col:5}]}),u=h.allies()[0],a=h.allies()[1],e=h.enemies()[0];cast(u);const hp=u.s.maxHp;h.run(32.1);assert.equal(u.profile.hits,4);near(u.s.maxHp,hp);h.b.dealDamage(e,a,{amount:a.hp+100,type:'true',canDodge:false});assert.ok(a.alive);assert.ok(u.mem.hgNative.transferred>0);h.run(11);assert.ok(u.removed&&u.removeReason==='forcedExit');assert.deepEqual(h.b.errors,[]);
});
test('unite carries exact remaining native skill, unused shield and talisman amount without fresh generation',()=>{
 const h=fixture({units:[chess('akafyu','a',1,{items:['higashi_talisman_a']})]}),u=h.allies()[0];cast(u);h.run(4);for(let i=0;i<3;i++)h.b.forceAttack(u,h.enemies());const remaining=u.skill.timeLeft,amount=u.findBuff('hg:talisman').shield;h.b._finish('forced');const carry=h.b.result().perPlayer.p1.higashi.carry;
 const k=fixture({kind:'unite',carry,units:[chess('akafyu','a',1,{items:['higashi_talisman_a'],carryState:{hpPct:.5,sp:0,skillActive:true}})]}),a=k.allies()[0];assert.ok(a.skill.timeLeft<=remaining&&a.skill.timeLeft>=remaining-.1);near(a.findBuff('hg:talisman').shield,amount);assert.equal(a.findBuff('native:akafuyu:shield').shieldHits,1);assert.deepEqual(k.b.errors,[]);
});

test('Yuki native dart damages along flight and has later DoT while one throw only counts once',()=>{
 const h=fixture({units:[chess('yuki','a',1)],ninja:2}),u=h.allies()[0],e=h.enemies()[0];e.x=u.x+1.5;e.y=u.y;cast(u);h.b.forceAttack(u,[e]);h.run(2.8);assert.ok(u.stats.dmg>0);const events=h.hooksOf('damageResolved').filter(e=>e.source===u&&e.dmg?.tags?.includes('native:hg:yuki'));assert.ok(events.some(e=>e.dmg.tags.includes('dot')));assert.equal(h.b.higashi.states.get('p1').metrics.attackSupply,4);assert.deepEqual(h.b.errors,[]);
});
test('autonomous slash replaces an already dead local target without waiting for a native action',()=>{
 const h=fixture({count:6}),u=h.allies()[0],s=h.b.higashi.states.get('p1');h.run(2.1);h.enemies()[0].alive=false;h.b.removeBuff(u,'qa:lock');u.atkCd=1e6;s.Q=100;h.step();assert.equal(s.metrics.spent,1);assert.deepEqual(h.b.errors,[]);
});

test('true natural distinct counts 3/6/9 and growth dispatches once, caps at 999 and respects boss skip',()=>{
 const h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true}).start();h.toPrep(1);const p=h.ps('p_0'),cells=[...p.deployMap().keys()];p.bandId=null;p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];
 for(const [n,t,g]of [[3,1,6],[6,2,12],[8,2,12],[9,3,14]]){p.board.clear();for(let i=0;i<n;i++)p.board.set(cells[i],p.newPiece('chess',[...NEW,'chess_char_1_18_a'][i]));p.recompute();assert.equal(p.bonds[CORE].count,n);assert.equal(p.bonds[CORE].tier,t);h.m.round=n;const before=p.layers[CORE]||0;h.m.dispatch(p,'onPrepEnd',{});assert.equal(p.layers[CORE],before+g);h.m.dispatch(p,'onPrepEnd',{});assert.equal(p.layers[CORE],before+g);}
 p.layers[CORE]=998;p.recompute();h.m.round=10;h.m.dispatch(p,'onPrepEnd',{});assert.equal(p.layers[CORE],999);p.layers[CORE]=100;p.recompute();h.m.round=10;h.m.dispatch(p,'onBattleResult',{boss:true,result:{higashi:{personal:16,performance:10}}});assert.equal(p.layers[CORE],100);h.m.dispatch(p,'onBattleResult',{boss:false,result:{higashi:{personal:16,performance:10}}});assert.equal(p.layers[CORE],126);h.m.dispatch(p,'onBattleResult',{boss:false,result:{higashi:{personal:16,performance:10}}});assert.equal(p.layers[CORE],126);h.m.dispose();
});
for(const humans of [2,3,4])test(`market ${humans}-player shared stock refuses exhausted old choice and retains milestone`,()=>{
 const h=makeMatch({data:structuredClone(DATA),mode:'coop',humans,fake:true}).start();h.toPrep(1);const p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.bandId=MARKET;p.shop.level=2;p.recompute();const offer=p.offers[0],id=offer.slots[0].id;h.m.pool.take(id,h.m.pool.left(id));const result=p.pickReward(0);assert.ok(result.error||!result.ok);assert.equal(p.hand.filter(Boolean).length,0);assert.ok(!p.counters['hg:market:2:claimed']);p.recompute();assert.ok(!p.offers[0]?.slots.some(s=>s.id===id));h.m.dispose();
});
test('unite output awards no new performance growth even with successful parries',()=>{
 const h=fixture({kind:'unite',count:8}),u=h.allies()[0],e=h.enemies()[0];for(let i=0;i<4;i++){h.b.dealDamage(e,u,{amount:30,type:'arts',canDodge:false});h.run(8.1);}h.b._finish('forced');const r=h.b.result().perPlayer.p1.higashi;assert.ok(r.metrics.parries>=3);assert.equal(r.performance,0);assert.equal(r.personal,0);
});

test('a sustained healer does not prevent one other available member from releasing',()=>{
 const h=fixture({units:[chess('noirc'),{...chess('haruka','a',1),uid:2,row:11}]}),s=h.b.higashi.states.get('p1');cast(h.allies()[1]);h.run(4);const u=h.allies()[0];h.b.removeBuff(u,'qa:lock');u.atkCd=1e6;s.Q=100;h.step();assert.equal(s.metrics.releases,1);assert.equal(s.Q,0);
});

test('native ninja never accepts legacy layer grants and bounded wire rejects impossible future deadlines',()=>{
 const h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true}).start();h.toPrep(1);const p=h.ps('p_0');assert.equal(p.addLayers(NINJA,100),0);h.m.dispose();const k=fixture({count:8});k.b._finish('forced');const value=k.b.result().perPlayer.p1.higashi;assert.ok(isHigashiResult(value));const forged=structuredClone(value);forged.carry.units['1'].releaseUntil=forged.carry.elapsed+100;assert.equal(isHigashiResult(forged),false);
});
test('highest seal quality returns exactly 3 SP, shares generation cooldown and obeys SP lock',()=>{
 const h=fixture({count:3,units:[chess('gyuki','a',0,{items:['higashi_seal_a','higashi_seal_b']})]}),u=h.allies()[0],e=h.enemies()[0];h.b.removeBuff(u,'qa:lock');h.b.addBuff(u,{key:'qa:lock',flags:{disarm:true},persist:true});u.skill.sp=0;u.skill.charges=0;h.b.dealDamage(e,u,{amount:10,type:'arts',canDodge:false});h.b.forceAttack(u,[e]);near(u.skill.sp,3);h.b.forceAttack(u,[e]);near(u.skill.sp,3);h.run(8.1);h.b.addBuff(u,{key:'qa:sp',flags:{noSp:true},persist:true});const sp=u.skill.sp;h.b.dealDamage(e,u,{amount:10,type:'arts',canDodge:false});h.b.forceAttack(u,[e]);near(u.skill.sp,sp);assert.equal(h.b.higashi.states.get('p1').units.get('1').sealUntil,0);assert.deepEqual(h.b.errors,[]);
});
test('same-name normal and elite share parry cooldown; unite preserves the current second supply budget',()=>{
 const h=fixture({units:[chess('noirc'),{...chess('noirc','b'),uid:2,row:11}]}),[a,z]=h.allies(),e=h.enemies()[0],s=h.b.higashi.states.get('p1');h.b.dealDamage(e,a,{amount:10,type:'arts',canDodge:false});h.b.dealDamage(e,z,{amount:10,type:'arts',canDodge:false});assert.equal(s.metrics.parries,1);h.b.forceAttack(a,[e]);h.b._finish('forced');const carry=h.b.result().perPlayer.p1.higashi.carry,k=fixture({kind:'unite',carry,units:[chess('noirc')]});const q=k.b.higashi.states.get('p1').Q;k.b.forceAttack(k.allies()[0],k.enemies());near(k.b.higashi.states.get('p1').Q,q);assert.deepEqual(k.b.errors,[]);
});
test('native Gyuki module reduced-health revival is not reissued on unite; permanent S3 exit stays out',()=>{
 const h=fixture({count:0,units:[chess('gyuki','b')]}),u=h.allies()[0],e=h.enemies()[0],max=u.s.maxHp;h.b.dealDamage(e,u,{amount:u.hp+20,type:'true',canDodge:false});assert.ok(u.alive&&u.mem.hgNative.revived);near(u.s.maxHp,max*.4);h.b._finish('forced');const carry=h.b.result().perPlayer.p1.higashi.carry,k=fixture({count:0,kind:'unite',carry,units:[chess('gyuki','b',0,{carryState:{hpPct:1,sp:0}})]}),a=k.allies()[0];near(a.s.maxHp,max*.4);k.b.dealDamage(k.enemies()[0],a,{amount:a.hp+20,type:'true',canDodge:false});assert.ok(!a.alive);
 const s=fixture({units:[chess('hsgma2','a',2)]});cast(s.allies()[0]);s.run(43.2);assert.ok(s.allies().length===0);s.b._finish('forced');const c=s.b.result().perPlayer.p1.higashi.carry,r=fixture({kind:'unite',carry:c,units:[chess('hsgma2','a',2,{carryState:{hpPct:0,down:true,sp:0}})]});r.run(80);assert.equal(r.allies().length,0);assert.ok(r.b.allyUnits[0].removed);assert.deepEqual(r.b.errors,[]);
});
