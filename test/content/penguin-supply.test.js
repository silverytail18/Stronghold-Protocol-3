import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {buildEncyclopediaCatalog,encyclopediaEntries} from '../../server/sim/content/expansion/encyclopedia-catalog.js';
import {CROISSANT,SORA,PENGUIN} from '../../server/sim/content/expansion/penguin-data.js';
import {makeMatch,give} from '../match/harness.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {DataSource} from '../../server/sim/simdata.js';
import {createRegistry} from '../../server/match/effectsMeta.js';
const BASE=getData({log:{info(){},warn(){}}}),DATA=buildExpansionData(BASE),gear='chess_item_1_01_e_a';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,a+' != '+b);
function prep(humans=1,raw=DATA,registry=createRegistry()){
 const h=makeMatch({data:structuredClone(raw),mode:humans===1?'solo':'coop',humans,fake:true,registry,seed:17}).start();h.toPrep(1);
 for(const p of h.m.players.values()){for(const q of [...p.board.values(),...p.hand.filter(Boolean),...p.temp.filter(Boolean)])if(q.kind==='chess')p.returnCopies(q);p.board.clear();p.hand.fill(null);p.temp.fill(null);p.layers={};p.offers=[];p.bandId=null;p.recompute();}
 const p=h.ps('p_0'),m=h.m;const put=id=>give(m,p,id,'board',[9,p.board.size+3]);
 return {h,m,p,put,entry:()=>m.enterPrep(),next:()=>{m.round++;m.enterPrep();}};
}
const items=p=>[...p.hand,...p.temp].filter(q=>q?.kind==='item');
function members(s,n){const ids=[CROISSANT,SORA,...Object.values(DATA.chess).filter(c=>!c.isGolden&&c.bonds.includes(PENGUIN)&&![CROISSANT,SORA].includes(c.chessId)).map(c=>c.chessId)];for(const id of ids.slice(0,n))s.put(id);s.p.recompute();}
for(const tier of [1,2])test('armed whole own team gets flat and additive percent once, tier '+tier,()=>{
 const raw=structuredClone(DATA);raw.chess.armed=chessRec({id:'armed',stats:{atk:400,def:300},skill:null});raw.chess.unarmed=chessRec({id:'unarmed',stats:{atk:400,def:300},skill:null});
 const h=makeBattle({data:new DataSource(raw,null),units:[{chessId:'armed',uid:1,row:10,col:4,items:[gear,gear]},{chessId:'unarmed',row:10,col:5}],bonds:{[PENGUIN]:{active:true,tier,count:tier===2?4:2,layers:999}},autoFinish:false});h.step(2);const u=h.unit(1),a=h.unit('unarmed');
 close(u.s.atk,(400+(tier===2?80:40))*(1+.15+(tier===2?.10:.05)));close(u.s.def,(300+(tier===2?100:60))*(tier===2?1.10:1.05));close(a.s.atk,400);close(a.s.def,300);close(u.s.aspd,100);assert.ok(!u.s.defIgnorePct);h.b.emit?.('deploy',{unit:u});close(u.s.def,tier===2?440:378);checkInvariants(h.b);
});
test('multiplayer owner isolation and summoned units exclusion',()=>{
 const raw=structuredClone(DATA);raw.chess.armed=chessRec({id:'armed',stats:{atk:400,def:300},skill:null});
 const h=makeBattle({data:new DataSource(raw,null),players:[{playerId:'p1',seat:0,side:'L',units:[{uid:1,kind:'chess',chessId:'armed',row:10,col:4,items:[gear]}],bonds:{[PENGUIN]:{active:true,tier:2,layers:50,count:4}}},{playerId:'p2',seat:1,side:'R',units:[{uid:2,kind:'chess',chessId:'armed',row:11,col:4,items:[gear]}],bonds:{}}],autoFinish:false});h.step(2);close(h.unit(1).s.def,440);close(h.unit(2).s.def,300);const token=h.b.spawnToken(h.unit(1),'token_10030_mlyss_wtrman',10,5,{anySource:true});assert.ok(token);assert.ok(!token.findBuff('exp:penguin:armed'));checkInvariants(h.b);
});
test('12/30/50 boundary rewards immediately at PREP entry, once per round and max three',()=>{
 const s=prep();members(s,2);s.p.layers[PENGUIN]=11;s.entry();assert.equal(items(s.p).length,0);
 s.p.layers[PENGUIN]=12;s.p.recompute();assert.equal(items(s.p).length,0);s.next();assert.equal(items(s.p).length,1);s.entry();s.m.onReconnect(s.p.playerId);assert.equal(items(s.p).length,1);
 s.p.layers[PENGUIN]=29;s.next();assert.equal(s.p.counters['exp:penguin:supply:claimed'],1);s.p.layers[PENGUIN]=30;s.next();assert.equal(s.p.counters['exp:penguin:supply:claimed'],2);s.p.layers[PENGUIN]=49;s.next();assert.equal(s.p.counters['exp:penguin:supply:claimed'],2);s.p.layers[PENGUIN]=50;s.next();assert.equal(s.p.counters['exp:penguin:supply:claimed'],3);s.p.layers[PENGUIN]=999;s.next();assert.equal(s.p.counters['exp:penguin:supply:claimed'],3);s.m.dispose();
});
test('multiple crossed milestones issue one per entry and quality follows current roster',()=>{
 const s=prep();members(s,2);s.p.layers[PENGUIN]=100;s.entry();assert.equal(s.p.counters['exp:penguin:supply:claimed'],1);assert.ok(!s.m.gd.item(items(s.p)[0].id).isGolden);const ids=Object.values(DATA.chess).filter(c=>!c.isGolden&&c.bonds.includes(PENGUIN)&&![CROISSANT,SORA].includes(c.chessId));s.put(ids[0].chessId);s.put(ids[1].chessId);s.p.shop.level=6;s.next();assert.equal(s.p.counters['exp:penguin:supply:claimed'],2);const reward=items(s.p).find(it=>s.m.gd.item(it.id).isGolden);assert.ok(reward);assert.ok(s.m.gd.item(reward.id).tier<=4);s.m.dispose();
});
test('no active members postpones milestone; equipment pool excludes consumables and honors shop tier',()=>{
 const s=prep();s.p.layers[PENGUIN]=100;s.entry();assert.equal(items(s.p).length,0);members(s,2);s.next();const rec=s.m.gd.item(items(s.p)[0].id);assert.equal(rec.tier,1);assert.ok(['passive','passive_counter','post_battle_transform'].includes(rec.kind));s.m.dispose();
});
test('PREP entry layer effects settle before milestone check and reward only belongs to its player',()=>{
 const registry=createRegistry();registry.global('supply_entry_test',{onPrepStart(ctx){if(ctx.round>1)ctx.addLayers(PENGUIN,1);}});const s=prep(2,DATA,registry);members(s,2);s.p.layers[PENGUIN]=11;s.next();assert.equal(items(s.p).length,1);assert.equal(items(s.h.ps('p_1')).length,0);s.m.dispose();
});
test('overflow follows normal temporary storage without consuming a second milestone',()=>{
 const s=prep();members(s,2);for(let i=0;i<s.p.hand.length;i++)s.p.hand[i]=s.p.newPiece('item',gear.replace('_a','_b'));s.p.layers[PENGUIN]=12;s.entry();assert.equal(s.p.counters['exp:penguin:supply:claimed'],1);assert.ok(s.p.temp.some(Boolean));s.entry();assert.equal(s.p.counters['exp:penguin:supply:claimed'],1);s.m.dispose();
});
test('bond base growth four replaces two and ordinary/elite duplicate does not add members',()=>{
 const s=prep();members(s,4);s.m.dispatch(s.p,'onPrepEnd',{round:s.m.round});assert.equal(s.p.layers[PENGUIN],7);s.m.dispatch(s.p,'onPrepEnd',{round:s.m.round});assert.equal(s.p.layers[PENGUIN],7);s.m.dispose();
});
test('catalog includes all formal/test bonds, normal/advanced gear, traits and searchable labels without mutation',()=>{
 const before=JSON.stringify(BASE),c=buildEncyclopediaCatalog(BASE);assert.equal(JSON.stringify(BASE),before);assert.equal(c.batches.bonds[PENGUIN],'岁与企鹅');assert.equal(c.batches.bonds.rhodesShip,'罗德岛与乐队');assert.ok(Object.values(c.items).find(i=>i.name==='罗德岛作战终端'));assert.ok(Object.keys(c.garrisons).length>Object.keys(BASE.garrisons).length);assert.equal(encyclopediaEntries(c,'bonds','企鹅物流').length,1);assert.ok(encyclopediaEntries(c,'items','罗德岛').length);assert.equal(encyclopediaEntries(c,'bonds').length,Object.keys(c.bonds).length);assert.equal(encyclopediaEntries(c,'items').length,Object.values(c.items).filter(i=>!i.isGolden).length);assert.ok(!BASE.bonds[PENGUIN]);
});
