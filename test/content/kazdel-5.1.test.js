import {nativeDamageBonus,curseDamage} from '../../shared/kazdel-rules.js';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildKazdelData,CORE,BLOOD,NEW,FLAG} from '../../server/sim/content/kazdel/data.js';
import {makeBattle,chessRec,enemyRec} from '../helpers/battleHarness.js';
import {pendingGrowth} from '../../server/sim/content/kazdel/meta.js';
import {sanitizeKazdelResult} from '../../server/sim/content/kazdel/result.js';
import {TestContent} from '../../server/test-content.js';
const raw=buildKazdelData(getData());
raw.chess.kz_probe_a=chessRec({id:'kz_probe_a',bonds:[CORE],stats:{maxHp:3000,atk:0,def:0,blockCnt:0},skill:null});
raw.chess.kz_probe_b={...structuredClone(raw.chess.kz_probe_a),chessId:'kz_probe_b',baseId:'kz_probe_a',isGolden:true};
raw.chess.kz_external_a=chessRec({id:'kz_external_a',stats:{maxHp:3000,atk:0,blockCnt:0},skill:null});
raw.enemies.kz_probe=enemyRec({key:'kz_probe',hp:1e8,atk:0,def:0,res:0,speed:0});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} ≈ ${b}`);

test('Meteorite talent is an additive ATK bonus for one attack and never mutates the next attack or expanded blast range',()=>{
 const h=makeBattle({defs:raw,units:[{chessId:'chess_kz_meteo_a',row:10,col:5,dir:'RIGHT'}],autoFinish:false});h.step();const u=h.unit('chess_kz_meteo_a');h.b.rng.chance=()=>true;
 for(let i=0;i<3;i++){const profile=u.profile;h.b.emit('beforeAttack',{attacker:u,profile});close(profile.atkScale??1,1.6);close(u.profile.atkScale??1,1);}
 h.b.addBuff(u,{key:'probe:atk',mods:{atkPct:1},duration:10});const profile=u.profile;h.b.emit('beforeAttack',{attacker:u,profile});close(profile.atkScale,1.3);close(u.profile.atkScale??1,1);
 h.b.rng.chance=()=>false;const next=u.profile;h.b.emit('beforeAttack',{attacker:u,profile:next});close(next.atkScale??1,1);
 assert.deepEqual(h.b.errors,[]);
});
function combat({L=0,tier=3,ids=['kz_probe_a'],blood=0,T=0,items=[],kind='normal'}={}){
 const h=makeBattle({defs:raw,kind,units:ids.map((chessId,i)=>({chessId,uid:i+1,row:10,col:5+i,dir:'RIGHT',items})),enemies:[{key:'kz_probe',pos:[10,6]}],bonds:{[CORE]:{active:true,tier,layers:L,count:[3,6,9][tier-1]},...(blood?{[BLOOD]:{active:true,tier:blood,layers:T,count:blood*2}}:{})},autoFinish:false,timeLimit:200});
 h.step();for(const u of h.b.allyUnits)u.atkCd=1e4;h.b.projectiles.clear();h.b.kazdel.states.get('p1').releaseReady=1e4;return h;
}
for(const L of [0,99,100,250,499,500,649,650,675,750,999])test(`5.3 real Battle HP and native damage at ${L} layers`,()=>{
 const h=combat({L}),u=h.unit(1),e=h.enemy(),st=h.b.kazdel.states.get('p1');close(u.s.maxHp,3000*(1.2+.005*L));
 const before=e.hp;h.b.dealDamage(u,e,{amount:100,type:'true',canDodge:false});close(before-e.hp,100*(1+nativeDamageBonus(3,L)));
 close(st.defer,Math.min(.45,.2+.0003*L));
 const hp=e.hp;h.b.dealDamage(u,e,{amount:100,type:'elemental',canDodge:false});close(hp-e.hp,100);
 assert.deepEqual(h.b.errors,[]);
});
test('999 layers: ground pulse is 1655 and air 3310 every two seconds, globally',()=>{const h=combat({L:999}),e=h.enemy(),st=h.b.kazdel.states.get('p1');st.Q=2*st.C;let hp=e.hp;h.run(1.05);close(hp-e.hp,1655);e.motion='FLY';e.markDirty();hp=e.hp;h.run(2);close(hp-e.hp,3310);e.x=10;hp=e.hp;h.run(2);close(hp-e.hp,3310);});test('curse geometry works when a melee provider is stunned/disarmed and cannot attack flyers; overlap does not stack',()=>{
 const h=combat({ids:['kz_probe_a','kz_probe_b']}),e=h.enemy(),st=h.b.kazdel.states.get('p1');st.Q=0;e.motion='FLY';e.markDirty();
 for(const u of h.b.allyUnits)h.b.addBuff(u,{key:'probe:pause',flags:{stun:true,disarm:true},duration:10});
 const hp=e.hp;h.run(1.05);close(hp-e.hp,1300);h.b.retreat(h.unit(1));h.b.retreat(h.unit(2));const old=e.hp;h.run(5);close(old-e.hp,0);
});
test('actual medic enables global curse and native bard, while external allies and harmony do not supply identity',()=>{for(const id of ['kz_external_a','chess_kz_hibisc_a','chess_char_4_25_a','chess_char_6_11_a']){const h=combat({ids:[id]}),e=h.enemy();h.b.kazdel.states.get('p1').Q=0;h.b.players[0].bonds.maniShip={active:true,tier:1};const hp=e.hp;h.run(1.05);close(hp-e.hp,['chess_kz_hibisc_a','chess_char_4_25_a'].includes(id)?650:0);}});test('flag plus morph gives actual curse identity; flag alone does not',()=>{
 const morph=Object.values(raw.items).find(i=>i.canGiveBond&&!i.isGolden).id;
 for(const pair of [false,true]){const h=combat({ids:['kz_external_a'],items:[FLAG+'_a',...(pair?[morph]:[])]}),e=h.enemy(),hp=e.hp;h.b.kazdel.states.get('p1').Q=0;h.run(1.05);close(hp-e.hp,pair?650:0);}
});
test('native self-loss and heal grow all actual members; same-name ordinary/elite copies select best and exclude external supply',()=>{
 const h=combat({ids:['kz_probe_a','kz_probe_b','kz_external_a']}),st=h.b.kazdel.states.get('p1');
 for(const u of h.b.allyUnits){h.b.loseHp(u,.8*u.s.maxHp,{source:u});h.b.heal(u,u,.8*u.s.maxHp,{self:true});}
 assert.equal(st.flow.kz_probe_a.points,10);assert.equal(st.flow.kz_probe_a.units[1].golden,false);assert.equal(st.flow.kz_probe_a.units[2].golden,true);assert.equal(st.flow.kz_external_a,undefined);
});
test('rescue gives fire but never permanent growth; shields, pure repayment, lifecycle and boss also give no growth',()=>{
 const h=combat({L:675}),u=h.unit(1),st=h.b.kazdel.states.get('p1');h.b.kazdel.suspend(()=>u.hp=.2*u.s.maxHp);st.Q=2*st.C;st.releaseReady=0;
 h.run(.04);assert.ok(st.metrics.rescue>0);assert.equal(st.flow.kz_probe_a.points,0);
 st.releaseReady=1e4;const generated=st.generated;h.b.kazdel.debts.set(u.id,[{amount:100,due:50}]);h.b.heal(u,u,1e6,{self:true});assert.ok(st.generated>=generated);
 const b=combat({kind:'boss'});b.b.loseHp(b.unit(1),100,{source:b.unit(1)});assert.deepEqual(b.b.kazdel.states.get('p1').flow,{});
});
test('earning cap locks to battle tier, board identities survive settlement, current elite upgrade cannot double old earnings',()=>{
 const counters={'kz:flowRound':2,'kz:earningTier':1,'kz:earningBloodTier':1};const board=[];
 for(let i=0;i<11;i++){const id='p'+i;counters['kz:points:'+id]=8;counters['kz:blood:'+id]=i<4?1:0;counters['kz:bloodPoints:'+id]=i<4?8:0;board.push({kind:'chess',id});}
 const args={round:3,counters,bonds:{[CORE]:{active:true,tier:3},[BLOOD]:{active:true,tier:2}},board,baseId:id=>id,pieceBonds:p=>[CORE,...(Number(p.id.slice(1))<4?[BLOOD]:[])]};
 assert.deepEqual(pendingGrowth(args),{core:18,blood:8});args.bonds[CORE].tier=1;counters['kz:earningTier']=3;assert.equal(pendingGrowth(args).core,18);
 args.board=board.slice(0,1);assert.equal(pendingGrowth(args).core,8);args.round=4;assert.deepEqual(pendingGrowth(args),{core:0,blood:0});
});
test('native received healing applies to external teammates at 999 blood layers, rescues exclude it',()=>{
 const h=combat({blood:2,T:999,ids:['kz_probe_a','kz_external_a']}),u=h.unit(2);h.b.loseHp(u,1000,{source:u});let hp=u.hp;h.b.heal(u,u,100,{self:true});close(u.hp-hp,119.98);hp=u.hp;h.b.heal(null,u,100,{self:true,kazdel:true});close(u.hp-hp,100);
});
test('opening fire exists without layer milestones and is budgeted once across union carry',()=>{for(const L of [0,99,100,250,500,750,999]){const h=combat({L}),st=h.b.kazdel.states.get('p1');assert.ok(st.Q>=1.2*st.C);close(st.generated,st.Q);}const h=combat({L:750});h.b.kazdel.states.get('p1').Q=123;h.b.forceEnd();const carry=h.result().perPlayer.p1.kazdelCarry;const input={...h.b.players[0].input,contentInfo:{round:1,kind:'unite',kazdelCarry:carry}};const u=makeBattle({defs:raw,players:[input],kind:'unite',autoFinish:false,timeLimit:200});u.step();close(u.b.kazdel.states.get('p1').Q,123);});test('500 and 650 layers never cause autonomous release or extra neighbour mechanics',()=>{for(const L of [499,500,649,650,999]){const h=combat({L}),st=h.b.kazdel.states.get('p1'),e=h.enemy();st.Q=2*st.C;st.releaseReady=0;const hp=e.hp;h.run(.04);close(hp-e.hp,0);close(st.metrics.release,0);}});test('roster, three-tag exceptions, latest packs and unselected data remain isolated in all content combinations',()=>{
 const baseline=getData(),snapshot=JSON.stringify(baseline),tc=new TestContent(),room={mode:'solo',difficulty:'HARD'},version=tc.menu(room).version;
 assert.ok(!raw.chess.chess_kz_chimes_a);assert.equal(raw.chess.chess_kz_meteo_a.name,'陨星');assert.equal(raw.bonds[BLOOD].visibleMembers.length,4);assert.ok(raw.chess.chess_char_4_26_a.bonds.includes(BLOOD));assert.ok(!raw.chess.chess_char_5_04_a.bonds.includes(CORE));
 for(const ids of [[CORE],['arknights-expansion-v1'],['rhodes-mujica-v1'],['arknights-expansion-v1','rhodes-mujica-v1']]){
  const list=['kazdel-expansion-v1',...ids.filter(id=>id!==CORE)];const r=tc.resolve({version,ids:list},room,baseline);assert.equal(r.manifest.clientVersion,28);assert.equal(r.data.bonds[CORE].visibleMembers.length,11);
 }
 assert.equal(tc.entries.find(e=>e.id==='rhodes-mujica-v1').version,'ri-mujica-test-15');assert.equal(tc.entries.find(e=>e.id==='arknights-expansion-v1').version,'expansion-test-9');assert.equal(JSON.stringify(baseline),snapshot);
});
test('999 resource result validation uses full budgets and rejects duplicate/fake contribution units',()=>{
 const h=combat({L:999}),u=h.unit(1);h.b.loseHp(u,1000,{source:u});h.b.forceEnd();const input=h.b.players[0].input;input.contentInfo={round:1,kind:'normal'};const p=h.result().perPlayer.p1;p.kazdelCarry.Q=2*25975;p.kazdelCarry.generated=193820;
 p.kazdelCarry.flow.kz_probe_a.units.forged={amount:1e9,startHp:1,golden:true};const v=sanitizeKazdelResult(input,p,h.b.time);close(v.kazdelCarry.Q,51950);assert.ok(v.kazdelCarry.generated>0&&v.kazdelCarry.generated<193820);assert.equal(v.kazdelFlow.kz_probe_a.units.forged,undefined);
});
