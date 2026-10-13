import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getData} from '../../server/data.js';
import {buildRhineData,NEW} from '../../server/sim/content/rhine/data.js';
import {RHINE,TECHNOLOGIES,TECH_ROWS,normalPoints,spentPoints,RHINE_KRISTEN,RHINE_SILENCE,qualifies,activationCount} from '../../shared/rhine.js';
import {rhineIntent,rhineBattleInput,ensure,regionTile} from '../../server/sim/content/rhine/state.js';
import {sanitizeRhineResult} from '../../server/sim/content/rhine/result.js';
import {makeMatch} from '../match/harness.js';
import {makeBattle,enemyRec} from '../helpers/battleHarness.js';
import {DataSource} from '../../server/sim/simdata.js';
import {skillSpecSource} from '../../server/sim/content/index.js';
import {RHINE_COLORS} from '../../shared/rhine-visual.js';
import {compactResult} from '../../server/sim/spec.js';
import {isBattleResult} from '../../shared/protocol.js';
import {pieceBondIds,bondMembers} from '../../public/js/ui/gameLogic.js';
const BASE=getData(),DATA=buildRhineData(BASE),members=Object.values(DATA.chess).filter(c=>c.visible&&!c.isGolden&&c.bonds.includes(RHINE));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function prep(n=6){const h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true}).start();h.toPrep(1);const p=h.ps('p_0'),m=h.m;p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.bandId=null;p.funds=100;p.shop.level=6;
 const positions=[...p.deployMap()].map(([key])=>key.split(',').map(Number));for(let i=0;i<n;i++){const pos=positions[i];p.board.set(pos.join(','),p.newPiece('chess',members[i].chessId));}p.layers[RHINE]=999;p.recompute();return{h,p,m};}
function battle({count=6,active=[],positions={},units=null,layers=0,preview=false,kind='normal',enemies=0,researchCount=0}={}){
 const raw=structuredClone(DATA);raw.enemies.qa=enemyRec({key:'qa',hp:100000,atk:100,def:0,res:0,speed:0});
 const input={playerId:'p1',units:units||[{uid:1,chessId:'chess_rhine_halo_a',row:10,col:5},{uid:2,chessId:'chess_rhine_astesi_a',row:10,col:4},{uid:3,chessId:'chess_char_1_01_a',row:10,col:3}],bonds:{rhineShip:{active:count>=3,count,tier:count>=10?4:count>=9?3:count>=6?2:count>=3?1:0,layers},...(researchCount?{specialResearchShip:{active:researchCount>=2,count:researchCount,tier:researchCount>=4?2:1,layers:0}}:{})},contentInfo:{rhine:{count,active,positions,layers,preview}}};
 const h=makeBattle({data:new DataSource(raw,null),players:[input],kind,autoFinish:false,enemies:Array.from({length:enemies},()=>({key:'qa',pos:[10,6]})),setup(b){for(const u of b.allyUnits)b.addBuff(u,{key:'qa:noAttack',flags:{disarm:true},persist:true,allowDead:true});}});h.step();return h;
}
test('Rhine graph has 14 single-level nodes, 29 total points, 19 normal points and six rows of at most three',()=>{
 assert.equal(TECHNOLOGIES.length,14);assert.equal(spentPoints(TECHNOLOGIES.map(t=>t.id)),29);assert.equal(normalPoints(999),19);assert.equal(normalPoints(1000),19);assert.equal(normalPoints(49),0);assert.equal(normalPoints(50),1);assert.ok(TECH_ROWS.every(r=>r.length<=3));assert.ok(!TECHNOLOGIES.some(t=>['T15','T18','T05'].includes(t.id)));assert.equal(new Set(Object.values(RHINE_COLORS)).size,6);
 const before=JSON.stringify(BASE);buildRhineData(BASE);assert.equal(JSON.stringify(BASE),before);assert.equal(NEW.length,6);assert.equal(members.length,11);assert.equal(DATA.bonds[RHINE].weight,0);assert.equal(DATA.bonds[RHINE].bb.banWeight,0);
});
test('Prep pauses retain data; research, prerequisites, exclusive tiles and ready gates are authoritative',()=>{const {m,p}=prep();const st=ensure(p);assert.ok(rhineIntent(p,{t:'g.rhineResearch',id:'T01'}).error);assert.ok(rhineIntent(p,{t:'g.rhineResearch',id:'T04'}).ok);assert.ok(rhineIntent(p,{t:'g.rhineResearch',id:'T01'}).ok);const cell=p.privateView().rhine.grid.find(c=>c.legal).position;
 assert.ok(rhineIntent(p,{t:'g.rhinePositions',id:'T04',positions:[cell]}).ok);assert.ok(rhineIntent(p,{t:'g.rhinePositions',id:'T01',positions:[cell]}).error);p.ready=true;assert.ok(rhineIntent(p,{t:'g.rhineReset'}).error);p.ready=false;
 while(p.board.size>2)p.board.delete([...p.board.keys()].at(-1));p.recompute();assert.equal(p.privateView().rhine.enabled,false);assert.equal(p.privateView().rhine.active.length,0);assert.deepEqual(st.positions.T04,[cell]);assert.ok(rhineIntent(p,{t:'g.rhineResearch',id:'T21'}).error);m.dispose();
});
test('19 normal points + milestones + ten-member reward are once per match; private views are read-only',()=>{const{m,p}=prep(10);p.bandId=RHINE_KRISTEN;p.recompute();assert.equal(p.privateView().rhine.totalPoints,23);const before=JSON.stringify(p.rhineState);for(let i=0;i<3;i++)p.privateView();assert.equal(JSON.stringify(p.rhineState),before);p.board.clear();p.recompute();p.recompute();assert.equal(p.privateView().rhine.totalPoints,23);m.dispose();});
test('T21 consumes only the first paid manual refresh and respects shop tier / available pool',()=>{const{m,p}=prep(3);ensure(p).research=['T21'];p.shop.level=1;p.shop.freeRefreshes=1;p.refresh();assert.equal(ensure(p).paidRefreshes,0);p.refresh();assert.equal(ensure(p).paidRefreshes,1);assert.ok(p.shop.slots.some(s=>s?.kind==='chess'&&DATA.chess[s.id].bonds.includes(RHINE)));assert.ok(p.shop.slots.filter(s=>s?.kind==='chess').every(s=>DATA.chess[s.id].tier<=1));p.refresh();assert.equal(ensure(p).paidRefreshes,2);m.dispose();});
test('Joint strategy grants a stock-aware normal operator on rounds 2 and 3, once each',()=>{const{m,p}=prep(0);p.bandId=RHINE_SILENCE;p.shop.level=2;for(const round of [2,3]){m.round=round;m.dispatch(p,'onRoundStart',{});m.dispatch(p,'onPrepStart',{});m.dispatch(p,'onPrepStart',{});}assert.equal(ensure(p).giftRounds.length,2);assert.equal(p.hand.filter(x=>x?.kind==='chess').length,2);assert.ok(p.hand.filter(Boolean).every(x=>DATA.chess[x.id].tier<=2&&!DATA.chess[x.id].isGolden));m.dispose();});
test('Base attack and HP are 10% + 0.1%/layer and scope only true identity, including a visitor',()=>{const h=battle({layers:200,units:[{uid:1,chessId:'chess_rhine_halo_a',row:10,col:5},{uid:2,chessId:'chess_char_1_01_a',row:10,col:4,rhineIdentity:true},{uid:3,chessId:'chess_char_1_01_a',row:10,col:3}]});const [a,v,o]=h.allies();near(a.s.atk,a.base.atk*1.3);near(a.s.maxHp,a.base.maxHp*1.3);near(v.s.atk,v.base.atk*1.3);near(o.s.atk,o.base.atk);assert.deepEqual(h.b.errors,[]);});
test('Frozen six-member T01/T02 remain after deaths; global and local effects include only Rhine operators',()=>{const h=battle({active:['T01','T02'],positions:{T01:[[10,5]],T02:[[10,4]]},enemies:1});h.b.flags.layerGainsEnabled=false;const [a,c,o]=h.allies(),e=h.enemies()[0];h.b.kill(o,null);let before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,130);before=e.hp;h.b.dealDamage(c,e,{amount:100,type:'true'});near(before-e.hp,115);before=c.hp;h.b.dealDamage(e,c,{amount:100,type:'true'});near(before-c.hp,80);assert.deepEqual(h.b.errors,[]);});
test('T04 appends exactly 10% actual HP loss, never shield loss or recursive technology damage',()=>{const h=battle({active:['T04'],positions:{T04:[[10,6]]},enemies:1});const a=h.allies()[0],e=h.enemies()[0];let before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,110);h.b.addBuff(e,{key:'qa:shield',shield:1000});before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(e.hp,before);h.b.removeBuff(e,'qa:shield');before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true',sourceless:true,tags:['rhine:technology']});near(before-e.hp,100);assert.deepEqual(h.b.errors,[]);});
test('Prep previews never run region damage, regen, scans, controller shield or hiring',()=>{const h=battle({active:['T01','T04','T06','T07','T12'],positions:{T01:[[10,5]],T04:[[10,6]],T06:[[10,4]]},preview:true,enemies:1});const e=h.enemies()[0],a=h.allies()[0],before=e.hp;h.run(3);near(e.hp,before);h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,100);assert.deepEqual(h.snapshot().rhine,[]);});
test('T03 broadcasts a fixed 50% donor attack without receiving its own gift or compounding with receiver percentages',()=>{const h=battle({count:9,active:['T03'],positions:{T03:[[10,5]]},layers:200});const [donor,recipient,other]=h.allies();const attack=donor.s.atk;near(recipient.s.atk,recipient.base.atk*1.3+attack*.5);near(other.s.atk,other.base.atk);h.run(2);near(donor.s.atk,attack);near(recipient.s.atk,recipient.base.atk*1.3+attack*.5);h.b.kill(donor,null);h.step();near(recipient.s.atk,recipient.base.atk*1.3);assert.deepEqual(h.b.errors,[]);});
test('T07 pulses cap unique enemies at three; T10 expands to five and adds 0.5s sluggish',()=>{for(const [extra,n]of [[[],3],[['T10'],5]]){const h=battle({active:['T04','T07',...extra],positions:{T04:[[10,6]],T01:[[10,5]]},enemies:6});h.run(1.9);assert.ok(h.enemies().every(e=>e.hp===e.s.maxHp));h.run(.15);assert.equal(h.enemies().filter(e=>e.hp<e.s.maxHp).length,n);if(n===5)assert.equal(h.enemies().filter(e=>e.findBuff('sluggish')).length,5);assert.deepEqual(h.b.errors,[]);}});
test('T12 scans all legal enemies at 2s then 12s; outside tiles are marked without slow',()=>{const h=battle({active:['T04','T12'],positions:{T04:[[10,7]]},enemies:1});const e=h.enemies()[0];h.run(2);assert.ok(e.s.flags.reveal);near(e.s.moveSpeed,e.base.moveSpeed);const a=h.allies()[0],hp=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(hp-e.hp,110);h.run(6.1);assert.ok(!e.s.flags.reveal);h.run(4);assert.ok(e.s.flags.reveal);assert.deepEqual(h.b.errors,[]);});
test('Controller shields before the first attack; later attacks do not refill; sanitization discards foreign ids',()=>{const h=battle({units:[{uid:1,chessId:'chess_rhine_halo_a',row:10,col:5,items:['rhine_field_controller_a']}],enemies:1});const a=h.allies()[0],e=h.enemies()[0],hp=a.hp,shield=a.s.maxHp*.1;h.b.dealDamage(e,a,{amount:50,type:'true',isAttack:true});near(a.hp,hp);near(a.findBuff('rhine:environment').shield,shield-50);h.b.dealDamage(e,a,{amount:50,type:'true',isAttack:true});near(a.findBuff('rhine:environment').shield,shield-100);assert.deepEqual(sanitizeRhineResult(h.b.players[0].input,{rhineCarry:{controllerUsed:[1,999,1]}},{item:id=>DATA.items[id]}),{rhineCarry:{controllerUsed:[1]}});});
test('T11 cleans and grants temporary immunity, once per instance per Battle',()=>{const h=battle({active:['T11'],enemies:1});const a=h.allies()[0],e=h.enemies()[0];h.b.applyStatus(a,'stun',{duration:9});h.b.dealDamage(e,a,{amount:a.s.maxHp*.65,type:'true'});assert.ok(!a.findBuff('stun'));assert.ok(a.findBuff('rhine:environment'));assert.equal(h.b.applyStatus(a,'freeze',{duration:3}),false);h.run(5.1);assert.equal(h.b.applyStatus(a,'freeze',{duration:3}),true);assert.deepEqual(h.b.errors,[]);});
test('All 30 native normal/elite skill records resolve hand-authored specs and execute without handler errors',()=>{for(const c of Object.values(DATA.chess).filter(c=>c.expansionBatch==='rhine-lab-v1'))for(const s of c.skills){const ds=new DataSource(DATA,null),d=ds.getChess(c.chessId,{skillIndex:s.index,moduleId:c.isGolden?c.modules[0].uniEquipId:null});assert.equal(skillSpecSource(d),'skills',c.name+s.index);const raw=structuredClone(DATA);raw.enemies.qa=enemyRec({key:'qa',hp:1e7,atk:0,speed:0});const tokens=c.tokens.filter(id=>ds.getToken(id,c.chessId,d.loadout)?.sources?.some(k=>k==='skill'||k==='talent'));const units=[{uid:1,chessId:c.chessId,row:10,col:5,skillIndex:s.index,moduleId:d.loadout.moduleId},...tokens.map((id,i)=>({uid:2+i,kind:'token',tokenId:id,ownerUid:1,row:10,col:6+i}))];const h=makeBattle({data:new DataSource(raw,null),units,autoFinish:false,enemies:[{key:'qa',pos:[10,7]}]});h.step();const u=h.allies()[0];u.skill.gainSp(999,'qa');u.skill.opReadyAt=0;if(u.skill.kind!=='passive')u.skill.activate('qa');h.run(5);assert.deepEqual(h.b.errors,[],c.name+' '+s.skillId);}});
test('All delivered native resources match pinned original or documented normalized-atlas hashes',async()=>{const report=JSON.parse(await fs.readFile(new URL('../../docs/RHINE-ASSETS.json',import.meta.url)));assert.ok(report.proof.length>=100);for(const p of report.proof){const bytes=await fs.readFile(new URL('../../public'+p.url,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),p.deliveredSha256||p.sha256,p.url);}});

test('T13 grants temporary identity repeatedly after nine-member unlock without changing prep or merge identity',()=>{
 const {m,p}=prep(0);p.deployCapBonus=1;const st=ensure(p);st.research=['T04','T01','T02','T09','T08','T10','T13'];
 const ids=['chess_rhine_otter_a','chess_rhine_halo_a','chess_char_2_02_a','chess_rhine_astesi_a','chess_rhine_mgllan_a','chess_rhine_ifrit_a','chess_char_5_11_a','chess_char_6_11_a'];
 for(const id of ids){const q=p.newPiece('chess',id),cell=[...p.deployMap().keys()].map(k=>k.split(',').map(Number)).find(pos=>!p.board.has(pos.join(','))&&p._legal(q,...pos));assert.ok(cell,id);p.board.set(cell.join(','),q);}p.recompute();assert.equal(p.bonds[RHINE].count,9);
 const candidate=p.newPiece('chess','chess_char_1_01_a'),seat=[...p.deployMap().keys()].map(k=>k.split(',').map(Number)).find(pos=>!p.board.has(pos.join(','))&&p._legal(candidate,...pos));assert.ok(seat);p.board.set(seat.join(','),candidate);p.recompute();assert.ok(p.deployCount<=p.deployCap);
 assert.ok(rhineIntent(p,{t:'g.rhinePositions',id:'T13',positions:[seat]}).ok,'no T04 adjacency required');
 const input=()=>({playerId:p.playerId,units:[...p.board].map(([key,q])=>({uid:q.uid,chessId:q.id,row:Number(key.split(',')[0]),col:Number(key.split(',')[1])})),bonds:{}});
 const preview=rhineBattleInput(p,input(),{preview:true});assert.ok(!preview.units.find(q=>q.uid===candidate.uid).rhineIdentity);
 const opening=rhineBattleInput(p,input());assert.equal(opening.units.find(q=>q.uid===candidate.uid).rhineIdentity,true);assert.equal(opening.contentInfo.rhine.count,10);assert.equal(p.bonds[RHINE].count,9);assert.ok(!candidate.meta.rhineVisitor);assert.equal(st.tenReward,false);
 const second=rhineBattleInput(p,input(),{kind:'unite'});assert.equal(second.units.find(q=>q.uid===candidate.uid).rhineIdentity,true);
 p.board.delete(seat.join(','));p.hand[0]=candidate;p.recompute();const off=rhineBattleInput(p,input());assert.equal(off.contentInfo.rhine.visitorUid,null);assert.ok(!pieceBondIds(DATA.chess[candidate.id],[],id=>DATA.items[id]).includes(RHINE));
 assert.ok(rhineIntent(p,{t:'g.rhineReset'}).ok);assert.ok(!candidate.meta.rhineVisitor);m.dispose();
});
test('T09 saves a second tile while lower prep counts temporarily suppress it; each subsequent Battle rechecks current counts',()=>{
 const {m,p}=prep(),st=ensure(p);st.research=['T04','T01','T02','T09'];const cells=p.privateView().rhine.grid.filter(c=>c.legal).slice(0,2).map(c=>c.position);
 assert.ok(rhineIntent(p,{t:'g.rhinePositions',id:'T04',positions:cells}).ok);const opening=rhineBattleInput(p,{units:[],bonds:{}});assert.equal(opening.contentInfo.rhine.positions.T04.length,2);
 while(p.board.size>3)p.board.delete([...p.board.keys()].at(-1));p.recompute();assert.equal(st.positions.T04.length,2);assert.equal(rhineBattleInput(p,{units:[],bonds:{}},{preview:true}).contentInfo.rhine.positions.T04.length,1);
 const unite=rhineBattleInput(p,{units:[],bonds:{}},{kind:'unite'});assert.equal(unite.contentInfo.rhine.count,3);assert.equal(unite.contentInfo.rhine.positions.T04.length,1);m.dispose();
});
test('Controller carry survives compact protocol and is scoped to the input wearer',()=>{
 const h=battle({units:[{uid:1,chessId:'chess_rhine_halo_a',row:10,col:5,items:['rhine_field_controller_a']}],enemies:1});h.b.dealDamage(h.enemies()[0],h.allies()[0],{amount:10,type:'true',isAttack:true});h.b.forceEnd('forced');const wire=compactResult(h.result());assert.ok(isBattleResult(wire));assert.deepEqual(wire.perPlayer.p1.rhineCarry,{controllerUsed:[1]});
 wire.perPlayer.p1.rhineCarry.controllerUsed=[-1];assert.ok(!isBattleResult(wire));
});
test('T10 without neighboring experiment cells grants neither the larger pulse cap nor the pause',()=>{
 const h=battle({active:['T04','T07','T10'],positions:{T04:[[10,6]],T01:[[10,3]]},enemies:6});h.run(2.1);assert.equal(h.enemies().filter(e=>e.hp<e.s.maxHp).length,3);assert.equal(h.enemies().filter(e=>e.findBuff('sluggish')).length,0);
});
test('Native module choices change real attacks, elemental gauges, stock and deployment cost',()=>{
 const ds=new DataSource(DATA,null);
 const c=DATA.chess.chess_rhine_mgllan_b;const t=ds.getToken('token_10005_mgllan_drone3',c.chessId,{skillIndex:2,moduleId:'uniequip_003_mgllan'});assert.equal(t.stats.cost,DATA.tokens[t.id].variants[c.chessId].byModule.none.stats.cost-3);
 const h=makeBattle({data:ds,units:[{uid:1,chessId:c.chessId,row:10,col:5,moduleId:'uniequip_003_mgllan'}],autoFinish:false});h.step();assert.equal(h.allies()[0].mem.rhineStock,8);
 const y=makeBattle({data:ds,units:[{uid:1,chessId:'chess_rhine_slent2_b',row:10,col:5,moduleId:'uniequip_003_slent2'}],autoFinish:false});y.step();assert.equal(y.allies()[0].profile.maxTargets,2);
 const inf=battle({units:[{uid:1,chessId:'chess_rhine_ifrit_b',row:10,col:5,moduleId:'uniequip_003_ifrit'}],enemies:1});inf.b.dealDamage(inf.allies()[0],inf.enemies()[0],{amount:100,type:'arts'});assert.ok(inf.enemies()[0].elem.burn>0);
 assert.deepEqual(h.b.errors,[]);assert.deepEqual(y.b.errors,[]);assert.deepEqual(inf.b.errors,[]);
});
test('Magallan selects exactly one native drone type for each skill; Silence Alter supplies a drone only for S2',()=>{
 const {m,p}=prep(0);for(const golden of ['a','b'])for(let skillIndex=0;skillIndex<3;skillIndex++){
  const mag=p.gd.placeableTokens('chess_rhine_mgllan_'+golden,{skillIndex,moduleId:golden==='b'?'uniequip_003_mgllan':null});assert.equal(mag.length,1);assert.equal(mag[0].tokenId,'token_10005_mgllan_drone'+(skillIndex+1));
  const silence=p.gd.placeableTokens('chess_rhine_slent2_'+golden,{skillIndex});assert.equal(silence.length,skillIndex===1?1:0);
 }m.dispose();
});
test('The real Match onBattleStart dispatch extends standard metadata and sends a frozen Rhine configuration',()=>{
 const {m,p}=prep(6),st=ensure(p);st.research=['T04'];st.positions.T04=[p.privateView().rhine.grid.find(c=>c.legal).position];
 const opts=m._normalOpts(p),input=opts.players[0];assert.equal(input.contentInfo.round,m.round);assert.equal(input.contentInfo.shopLevel,p.shop.level);assert.equal(input.contentInfo.rhine.count,p.bonds[RHINE].count);assert.deepEqual(input.contentInfo.rhine.active,['T04']);
 const h=makeBattle({data:m.ds,players:opts.players,stageId:opts.stageId,enemies:[],autoFinish:false});h.step();assert.ok(h.b.rhine);assert.equal(h.snapshot().rhine.length,1);assert.deepEqual(h.b.errors,[]);m.dispose();
});
test('Sampler increases only the wearer own active bonds once per round; Rhine replaces the generic increment',()=>{
 const {m,p}=prep(6);const c=[...p.board.values()].find(q=>DATA.chess[q.id].bonds.includes('arcaneShip'))||[...p.board.values()][0];
 c.items=[p.newPiece('item','rhine_sampler_a'),p.newPiece('item','rhine_sampler_b')];p.recompute();const before=p.layers[RHINE];m.dispatch(p,'onPrepEnd',{});assert.equal(p.layers[RHINE]-before,0,'999-layer ceiling remains in force');
 p.layers[RHINE]=100;m.round=2;m.dispatch(p,'onPrepEnd',{});const after=p.layers[RHINE];assert.equal(after-100,13,'six-member base 10 + highest sampler 3');m.dispatch(p,'onPrepEnd',{});assert.equal(p.layers[RHINE],after);m.dispose();
});

test('Supporting regions accept every authoritative deployment cell, including high ground and device overrides',()=>{
 const {m,p}=prep(9),s=ensure(p);s.research=['T04','T01','T02','T07','T09','T08','T10','T12','T03'];
 for(const id of ['T01','T02','T03'])for(const key of p.deployMap().keys())assert.ok(regionTile(p,key.split(',').map(Number),id),id+' '+key);
 // The deployment device map is authoritative even if the original stage glyph was non-deployable.
 const cell=p.privateView().rhine.grid.find(c=>!c.legal).position;p.deployMap().set(cell.join(','),'ranged');
 const view=p.privateView().rhine.grid.find(c=>c.position.join(',')===cell.join(','));assert.ok(!view.legal);assert.ok(['T01','T02','T03'].every(id=>view.legalFor.includes(id)));
 for(const id of ['T01','T02','T03']){assert.ok(rhineIntent(p,{t:'g.rhinePositions',id,positions:[cell]}).ok);assert.ok(rhineIntent(p,{t:'g.rhinePositions',id,positions:[]}).ok);}m.dispose();
});

test('Six-member damage and protection use fixed tier values and benefit only Rhine members',()=>{
 const h=battle({layers:600,active:['T01','T02'],positions:{T01:[[10,5]],T02:[[10,4]]},enemies:1});h.b.flags.layerGainsEnabled=false;
 const [a,c,o]=h.allies(),e=h.enemies()[0];let hp=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(hp-e.hp,130);
 hp=e.hp;h.b.dealDamage(c,e,{amount:100,type:'true'});near(hp-e.hp,115);hp=e.hp;h.b.dealDamage(o,e,{amount:100,type:'true'});near(hp-e.hp,100);
 hp=c.hp;h.b.dealDamage(e,c,{amount:100,type:'true'});near(hp-c.hp,80);hp=a.hp;h.b.dealDamage(e,a,{amount:100,type:'true'});near(hp-a.hp,96);
 hp=o.hp;h.b.dealDamage(e,o,{amount:100,type:'true'});near(hp-o.hp,100);assert.deepEqual(h.b.errors,[]);
});

test('T10 remote mark never lets T07 damage enemies outside T04',()=>{
 const h=battle({active:['T04','T01','T07','T10'],positions:{T01:[[10,5]],T04:[[10,6]]},enemies:1});h.b.flags.layerGainsEnabled=false;const a=h.allies()[0],e=h.enemies()[0];e.x=8;
 const hp=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(hp-e.hp,143);h.run(2.05);near(e.hp,hp-143);assert.ok(!e.findBuff('sluggish'));assert.deepEqual(h.b.errors,[]);
});

test('T11 rescues one lethal enemy hit per Battle without rescuing voluntary HP loss',()=>{
 const h=battle({active:['T11'],enemies:1}),a=h.allies()[0],e=h.enemies()[0];h.b.dealDamage(e,a,{amount:a.s.maxHp*2,type:'true'});
 assert.ok(a.alive&&a.hp>1);assert.ok(a.findBuff('rhine:environment'));h.b.dealDamage(e,a,{amount:a.s.maxHp*5,type:'true'});assert.ok(a.alive,'two seconds of invulnerability block the next hit');h.run(2.1);h.b.dealDamage(e,a,{amount:a.s.maxHp*5,type:'true'});assert.ok(!a.alive);
 const x=battle({active:['T11'],enemies:1}),u=x.allies()[0];x.b.dealDamage(u,u,{amount:u.s.maxHp*2,type:'true',sourceless:true,tags:['hpLoss']});assert.ok(!u.alive);assert.deepEqual(h.b.errors,[]);assert.deepEqual(x.b.errors,[]);
});

test('Special Research has exactly four specified forms and Dorothy is absent from every runtime catalog',()=>{
 const r=DATA.bonds.specialResearchShip;assert.deepEqual(r.thresholds,[2,4]);assert.equal(r.weight,0);
 assert.deepEqual(r.visibleMembers.map(id=>DATA.chess[id].name).sort(),['星源','溯光星源','赫默','淬羽赫默'].sort());
 for(const table of [DATA.chess,DATA.tokens,DATA.assets.chars,DATA.assets.tokens,DATA.assets.skillsById,DATA.assets.modules])assert.ok(!Object.keys(table).some(id=>/doroth|10025/.test(id)));
});

function researchBattle(count=4){return battle({count:2,researchCount:count,enemies:1,units:[{uid:1,chessId:'chess_rhine_halo_a',row:10,col:5},{uid:2,chessId:'chess_char_2_02_a',row:10,col:4},{uid:3,chessId:'chess_char_6_16_a',row:9,col:4},{uid:4,chessId:'chess_rhine_slent2_a',row:9,col:5},{uid:5,chessId:'chess_rhine_astesi_a',row:10,col:3}]});}
test('Special Research shares attack and heal cooldowns across members, but the two channels are independent',()=>{
 const h=researchBattle(),[halo,silent,tinman,alter]=h.allies(),e=h.enemies()[0];let hp=e.hp;
 h.b.dealDamage(halo,e,{amount:100,type:'true'});near(hp-e.hp,250);assert.ok(e.findBuff('specialResearch:slow'));
 hp=e.hp;h.b.dealDamage(tinman,e,{amount:100,type:'true'});near(hp-e.hp,100,'second member cannot bypass attack cooldown');
 h.b.dealDamage(e,halo,{amount:100,type:'true'});hp=e.hp;h.b.heal(silent,halo,40);near(hp-e.hp,120);assert.ok(e.findBuff('stun'));
 hp=e.hp;h.b.heal(alter,halo,40);near(hp-e.hp,0);const state=h.b.specialResearch.states.get('p1');near(state.nextAttack-h.b.time,8);near(state.nextHeal-h.b.time,5);
 h.run(5.05);h.b.dealDamage(e,halo,{amount:100,type:'true'});hp=e.hp;const healedBefore=halo.hp;h.b.heal(alter,halo,40);assert.ok(hp-e.hp>=(halo.hp-healedBefore)*3-1e-6);assert.ok(state.nextHeal>h.b.time);hp=e.hp;const attackDeadline=state.nextAttack;h.b.dealDamage(tinman,e,{amount:100,type:'true'});near(hp-e.hp,110);assert.equal(state.nextAttack,attackDeadline);
 h.run(3.05);hp=e.hp;h.b.dealDamage(tinman,e,{amount:100,type:'true'});assert.ok(hp-e.hp>=250);assert.ok(state.nextAttack>h.b.time);assert.deepEqual(h.b.errors,[]);
});

test('Special Research two-member cooldowns are ten seconds, empty healing and secondary damage do not trigger explosions',()=>{
 const h=researchBattle(2),[halo,silent]=h.allies(),e=h.enemies()[0];let hp=e.hp;h.b.heal(silent,halo,999);near(e.hp,hp);assert.equal(h.b.specialResearch.states.get('p1').nextHeal,0);
 h.b.dealDamage(halo,e,{amount:100,type:'true',sourceless:true,tags:['bond']});near(hp-e.hp,100);assert.equal(h.b.specialResearch.states.get('p1').nextAttack,0);
 hp=e.hp;h.b.dealDamage(halo,e,{amount:100,type:'true'});near(hp-e.hp,250);near(h.b.specialResearch.states.get('p1').nextAttack-h.b.time,10);
 h.b.dealDamage(e,halo,{amount:100,type:'true'});h.b.heal(silent,halo,20);near(h.b.specialResearch.states.get('p1').nextHeal-h.b.time,10);assert.deepEqual(h.b.errors,[]);
});

test('Two player experiment regions touching one huge enemy apply one strongest 50% slow',()=>{
 const raw=structuredClone(DATA);raw.enemies.qa=enemyRec({key:'qa',hp:100000,atk:0,speed:1});raw.enemies.qa.hitArea={w:4.95,h:2.95,dx:0,dy:0};
 const players=[{playerId:'p1',side:'L',colOffset:0,positions:[[10,9]],uid:1},{playerId:'p2',side:'R',colOffset:8,positions:[[10,4]],uid:2}].map(p=>({playerId:p.playerId,side:p.side,colOffset:p.colOffset,units:[{uid:p.uid,chessId:'chess_rhine_halo_a',row:10,col:5}],bonds:{rhineShip:{active:true,count:3,tier:1,layers:0}},contentInfo:{rhine:{count:3,active:['T04'],positions:{T04:p.positions},layers:0}}}));
 const h=makeBattle({data:new DataSource(raw,null),players,kind:'unite',autoFinish:false,enemies:[{key:'qa',pos:[10,10.5]}],setup(b){for(const u of b.allyUnits)b.addBuff(u,{key:'qa:disarm',flags:{disarm:true},persist:true});}});h.step();const e=h.enemies()[0];
 assert.ok(e.findBuff('rhine:mark:p1')&&e.findBuff('rhine:mark:p2'));near(e.s.moveSpeed,e.base.moveSpeed*.5);assert.deepEqual(h.b.errors,[]);
});


test('T01 and T02 use all four exact count tiers without any layer scaling',()=>{
 for(const [count,damage,localDamage,reduction,localReduction]of [[3,10,10,2,8],[6,15,15,4,16],[9,20,20,6,24],[10,30,30,8,32]])for(const layers of [0,999]){
  const h=battle({count,layers,active:['T01','T02'],positions:{T01:[[10,5]],T02:[[10,5]]},enemies:1});h.b.flags.layerGainsEnabled=false;const [inside,outside]=h.allies(),e=h.enemies()[0];
  let hp=e.hp;h.b.dealDamage(inside,e,{amount:100,type:'true'});near(hp-e.hp,100+damage+localDamage);hp=e.hp;h.b.dealDamage(outside,e,{amount:100,type:'true'});near(hp-e.hp,100+damage);
  hp=inside.hp;h.b.dealDamage(e,inside,{amount:100,type:'true'});near(hp-inside.hp,100-reduction-localReduction);hp=outside.hp;h.b.dealDamage(e,outside,{amount:100,type:'true'});near(hp-outside.hp,100-reduction);assert.deepEqual(h.b.errors,[]);
 }
});
test('T07 is physical 120+2L and never hits outside T04 even under a global scan',()=>{
 const h=battle({layers:100,active:['T04','T07','T12'],positions:{T04:[[10,6]]},enemies:2});h.b.flags.layerGainsEnabled=false;const [inside,outside]=h.enemies();outside.x=8;
 h.b.addBuff(inside,{key:'qa:res',mods:{res:90},persist:true});const hp=inside.hp,far=outside.hp;h.run(2.05);near(hp-inside.hp,320);near(outside.hp,far);assert.ok(outside.s.flags.reveal);assert.deepEqual(h.b.errors,[]);
});
test('T12 scan marks expire after three seconds and resume on the next ten-second scan',()=>{
 const h=battle({active:['T04','T12'],positions:{T04:[[10,7]]},enemies:1}),e=h.enemies()[0];h.run(2.1);assert.ok(e.s.flags.reveal);h.run(2.8);assert.ok(e.s.flags.reveal);h.run(.3);assert.ok(!e.s.flags.reveal);h.run(7);assert.ok(e.s.flags.reveal);
});
test('Equipment-granted and battle-granted members receive researched technology exactly like native members',()=>{
 const morph=Object.values(DATA.items).find(r=>r.canGiveBond&&!r.isGolden).id;
 for(const visitor of [false,true]){const h=battle({active:['T01','T02'],positions:{T01:[[10,5]],T02:[[10,5]]},enemies:1,units:[{uid:1,chessId:'chess_char_1_01_a',row:10,col:5,...(visitor?{rhineIdentity:true}:{items:[morph,'rhine_field_controller_a']})}]});
 const u=h.allies()[0],e=h.enemies()[0];let hp=e.hp;h.b.dealDamage(u,e,{amount:100,type:'true'});near(hp-e.hp,130);hp=u.hp;h.b.dealDamage(e,u,{amount:100,type:'true'});near(hp-u.hp,80);assert.deepEqual(h.b.errors,[]);}
});
test('New Battle start pauses researched higher-count nodes and restores them when the roster returns',()=>{
 const {m,p}=prep(6),st=ensure(p);st.research=['T04','T01','T02','T07','T12'];let input=rhineBattleInput(p,{units:[]});assert.ok(input.contentInfo.rhine.active.includes('T12'));
 while(p.board.size>3)p.board.delete([...p.board.keys()].at(-1));p.recompute();input=rhineBattleInput(p,{units:[]},{kind:'unite'});assert.ok(!input.contentInfo.rhine.active.includes('T07'));assert.ok(input.contentInfo.rhine.active.includes('T01'));assert.ok(st.research.includes('T12'));
 while(p.board.size>2)p.board.delete([...p.board.keys()].at(-1));p.recompute();input=rhineBattleInput(p,{units:[]});assert.equal(input.contentInfo.rhine.active.length,0);m.dispose();
});

test('Research thresholds stay 3/6/9, while researched technologies activate at min(threshold, 6)',()=>{
 const ids=TECHNOLOGIES.map(t=>t.id);
 for(const t of TECHNOLOGIES){assert.equal(activationCount(t),Math.min(t.count,6));assert.equal(qualifies(t.id,ids,activationCount(t)-1),false);assert.equal(qualifies(t.id,ids,activationCount(t)),true);assert.equal(qualifies(t.id,ids.filter(id=>id!==t.id),9),false);}
 assert.equal(activationCount('missing'),Infinity);
 assert.equal(qualifies('T03',ids.filter(id=>id!=='T12'),6),false);
 assert.equal(qualifies('T13',ids.filter(id=>id!=='T09'),6),false);
});
test('Authoritative nine-member research survives six-member activation, pauses below six, and restores next battle',()=>{
 const {m,p}=prep(0);p.deployCapBonus=2;p.bandId=RHINE_KRISTEN;
 const ids=members.filter(c=>!c.bonds.includes('maniShip')).slice(0,9).map(c=>c.chessId);
 assert.equal(ids.length,9);const slots=[];
 for(const id of ids){const q=p.newPiece('chess',id),pos=[...p.deployMap().keys()].map(k=>k.split(',').map(Number)).find(pos=>!p.board.has(pos.join(','))&&p._legal(q,...pos));assert.ok(pos,id);slots.push([pos.join(','),q]);p.board.set(pos.join(','),q);}
 p.recompute();assert.equal(p.bonds[RHINE].count,9);
 const st=ensure(p),pre=['T04','T01','T02','T09','T08','T10','T07','T12'];st.research=[...pre];
 for(const [key] of slots.slice(6))p.board.delete(key);p.recompute();assert.equal(p.bonds[RHINE].count,6);
 for(const id of ['T03','T13'])assert.ok(rhineIntent(p,{t:'g.rhineResearch',id}).error,'six cannot research '+id);
 for(const [key,q] of slots.slice(6))p.board.set(key,q);p.recompute();
 for(const id of ['T03','T13'])assert.ok(rhineIntent(p,{t:'g.rhineResearch',id}).ok,'nine unlocks '+id);
 const candidate=p.newPiece('chess','chess_char_1_01_a'),seat=[...p.deployMap().keys()].map(k=>k.split(',').map(Number)).find(pos=>!p.board.has(pos.join(','))&&p._legal(candidate,...pos));assert.ok(seat);p.board.set(seat.join(','),candidate);p.recompute();
 for(const [key] of slots.slice(6))p.board.delete(key);p.recompute();assert.equal(p.bonds[RHINE].count,6);
 assert.ok(rhineIntent(p,{t:'g.rhinePositions',id:'T13',positions:[seat]}).ok);
 const donorPos=slots[0][0].split(',').map(Number);assert.ok(rhineIntent(p,{t:'g.rhinePositions',id:'T03',positions:[donorPos]}).ok);
 const persistent=()=>JSON.stringify(Object.fromEntries(Object.entries(st).filter(([key])=>key!=='snapshot'))),saved=persistent(),input=()=>({playerId:p.playerId,units:[...p.board].map(([key,q])=>({uid:q.uid,chessId:q.id,row:Number(key.split(',')[0]),col:Number(key.split(',')[1])})),bonds:{}});
 const opening=rhineBattleInput(p,input());assert.equal(opening.contentInfo.rhine.count,7);assert.ok(opening.contentInfo.rhine.active.includes('T03'));assert.ok(opening.contentInfo.rhine.active.includes('T13'));assert.equal(opening.units.find(q=>q.uid===candidate.uid).rhineIdentity,true);assert.equal(p.bonds[RHINE].count,6);assert.equal(persistent(),saved);
 const sim=makeBattle({data:m.ds,players:[opening],autoFinish:false});sim.step();const donor=sim.allies().find(q=>q.uid===slots[0][1].uid),visitor=sim.allies().find(q=>q.uid===candidate.uid);near(visitor.s.atk,visitor.base.atk*(1+.1+.001*999)+donor.s.atk*.5);assert.deepEqual(sim.b.errors,[]);
 p.board.delete(slots[5][0]);p.recompute();assert.equal(p.bonds[RHINE].count,5);const next=rhineBattleInput(p,input(),{kind:'unite'});assert.equal(next.contentInfo.rhine.count,5);assert.ok(!next.contentInfo.rhine.active.includes('T03'));assert.ok(!next.contentInfo.rhine.active.includes('T13'));assert.ok(next.contentInfo.rhine.active.includes('T01'));assert.ok(!next.units.find(q=>q.uid===candidate.uid).rhineIdentity,'five cannot bootstrap six with visitor');assert.deepEqual(st.positions.T13,[seat]);
 assert.ok(opening.contentInfo.rhine.active.includes('T13'),'previous battle eligibility stays frozen');
 p.board.set(...slots[5]);p.recompute();assert.ok(rhineBattleInput(p,input()).contentInfo.rhine.active.includes('T13'));assert.equal(persistent(),saved);m.dispose();
});

test('T13 seat inherits current T01/T02 local bonuses for visitors and native members, follows position and never duplicates',()=>{
 for(const [count,damage,reduction,globalDamage,globalReduction]of [[6,130,80,115,96],[9,140,70,120,94],[10,160,60,130,92]])for(const visitor of [false,true]){
  const h=battle({count,active:['T01','T02','T13'],positions:{T01:[[10,4]],T02:[[10,3]],T13:[[10,5]]},units:[{uid:1,chessId:visitor?'chess_char_1_01_a':'chess_rhine_halo_a',rhineIdentity:visitor,row:10,col:5}],enemies:1});h.b.flags.layerGainsEnabled=false;
  const a=h.allies()[0],e=h.enemies()[0];let before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,damage);before=a.hp;h.b.dealDamage(e,a,{amount:100,type:'true'});near(before-a.hp,reduction);
  a.x=4;before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,damage,'moving from T13 to T01 retains exactly one local bonus');before=a.hp;h.b.dealDamage(e,a,{amount:100,type:'true'});near(before-a.hp,globalReduction);
  a.x=3;before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,globalDamage);before=a.hp;h.b.dealDamage(e,a,{amount:100,type:'true'});near(before-a.hp,reduction);
  a.x=8;before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,globalDamage);before=a.hp;h.b.dealDamage(e,a,{amount:100,type:'true'});near(before-a.hp,globalReduction);assert.deepEqual(h.b.errors,[]);
 }
});
test('T13 local amplification requires the seat and respective technology active; preview and outsiders receive none',()=>{
 for(const [active,preview,member,damage,reduction]of [[['T01','T02'],false,true,115,96],[['T02','T13'],false,true,100,80],[['T01','T13'],false,true,130,100],[['T01','T02','T13'],true,true,100,100],[['T01','T02','T13'],false,false,100,100]]){
  const h=battle({active,preview,positions:{T13:[[10,5]]},units:[{uid:1,chessId:member?'chess_rhine_halo_a':'chess_char_1_01_a',row:10,col:5}],enemies:1}),a=h.allies()[0],e=h.enemies()[0];h.b.flags.layerGainsEnabled=false;
  let before=e.hp;h.b.dealDamage(a,e,{amount:100,type:'true'});near(before-e.hp,damage);before=a.hp;h.b.dealDamage(e,a,{amount:100,type:'true'});near(before-a.hp,reduction);assert.deepEqual(h.b.errors,[]);
 }
});
