import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DATA,makeMatch as makeBaseMatch,checkInvariants} from './harness.js';
import {PHASE,ERR} from '../../shared/constants.js';
import {createRng,deriveSeed} from '../../server/sim/rng.js';
import {TestContent} from '../../server/test-content.js';
import {GameData} from '../../server/match/gamedata.js';
const content=new TestContent(),id='strategy-confirm-order',room={mode:'coop',difficulty:'NORMAL'};
const enabledData=content.resolve({version:content.version,ids:[id]},room,DATA).data;
const makeMatch=(opts={})=>makeBaseMatch({...opts,data:enabledData});

const ready=(h,pid)=>assert.deepEqual(h.m.handle(pid,{t:'g.infoReady'}),{ok:true});
function check(h,expected){h.sched.advance(1);assert.equal(h.m.phase,PHASE.BAND_DRAFT);assert.deepEqual(h.m.publicView().draft.order,expected);assert.equal(h.m.draftTurn(),expected[0]);checkInvariants(h.m);}

test('test is opt-in, match-scoped, public-access controlled, multiplayer only and compatible with other tests',()=>{
 const before=JSON.stringify(DATA),empty=content.resolve({version:content.version,ids:[]},room,DATA);
 assert.equal(empty.data,DATA);assert.equal(new GameData(DATA,'mode_multi_normal').bandDraft.confirmationOrder,false);
 assert.equal(new GameData(enabledData,'mode_multi_normal').bandDraft.confirmationOrder,true);
 assert.equal(content.menu({...room,mode:'solo'}).items.find(e=>e.id===id).enabled,false);
 assert.throws(()=>content.resolve({version:content.version,ids:[id]},{...room,mode:'solo'},DATA),/不支持/);
 const access={admin:false,publicIds:[],revision:0},closed=content.menu(room,access);assert.ok(!closed.items.some(e=>e.id===id));
 assert.throws(()=>content.resolve({version:closed.version,ids:[id]},room,DATA,access),/不存在/);
 const open={...access,publicIds:[id]},menu=content.menu(room,open),selected=content.resolve({version:menu.version,ids:[id]},room,DATA,open);
 assert.deepEqual(selected.manifest.batches.map(b=>b.id),[id]);assert.equal(selected.manifest.clientVersion,1);
 const combined=content.resolve({version:content.version,ids:[id,'shop-extra-slot','opening-bans-4-6','extended-rounds-20']},room,DATA);
 assert.equal(new GameData(combined.data,'mode_multi_normal').bandDraft.confirmationOrder,true);assert.equal(combined.data.config.modes.mode_multi_normal.bossRound,20);
 assert.equal(JSON.stringify(DATA),before);assert.deepEqual(enabledData.config.bandDraft,{...DATA.config.bandDraft,confirmationOrder:true});
 for(const key of Object.keys(DATA))if(key!=='config')assert.deepEqual(enabledData[key],DATA[key]);
});

for(const seed of [1,5,91,999])test(`disabled preserves the original seeded random order ${seed}`,t=>{
 const h=makeBaseMatch({humans:4,seed,fake:true}).start();t.after(()=>h.m.dispose());for(const pid of ['p_2','p_0','p_3','p_1'])ready(h,pid);
 const rng=createRng(deriveSeed(seed,'draft')),expected=rng.shuffle(['p_0','p_1','p_2','p_3']);check(h,expected);assert.equal(h.m.rngDraft.state(),rng.state());
});

for(const seed of [1,5,91,999])test(`manual confirmation order wins over seats and seed ${seed}`,t=>{
 const h=makeMatch({humans:4,seed,fake:true});t.after(()=>h.m.dispose());
 assert.equal(h.m.handle('p_2',{t:'g.infoReady'}).error,ERR.WRONG_PHASE);assert.deepEqual(h.m.infoReadyOrder,[]);h.start();
 const order=['p_2','p_0','p_3','p_1'];for(const pid of order)ready(h,pid);check(h,order);
 // Preserve the previous RNG advancement without using the shuffled order as the queue.
 const rng=createRng(deriveSeed(seed,'draft'));rng.shuffle(h.m.order.map(p=>p.playerId));assert.equal(h.m.rngDraft.state(),rng.state());
 const second=order[1];assert.equal(h.m.handle(second,{t:'g.band',bandId:'band_amiya'}).error,ERR.NOT_YOUR_TURN);
 assert.deepEqual(h.m.handle(order[0],{t:'g.bandSkip'}),{ok:true});assert.deepEqual(h.m.draft.order,[...order.slice(1),order[0]]);assert.equal(h.m.draftTurn(),second);
});

test('duplicate confirmations and reconnects retain the first position',t=>{
 const h=makeMatch({humans:3,fake:true}).start();t.after(()=>h.m.dispose());ready(h,'p_1');ready(h,'p_1');h.m.onDisconnect('p_1');h.m.onReconnect('p_1');ready(h,'p_2');ready(h,'p_1');ready(h,'p_0');ready(h,'p_0');
 assert.deepEqual(h.m.infoReadyOrder,['p_1','p_2','p_0']);check(h,['p_1','p_2','p_0']);assert.equal(h.m.handle('p_1',{t:'g.infoReady'}).error,ERR.WRONG_PHASE);
});

test('deadline appends unconfirmed humans in seat order before AI',t=>{
 const h=makeMatch({humans:3,bots:1,fake:true}).start();t.after(()=>h.m.dispose());ready(h,'p_2');h.sched.advance(25001);check(h,['p_2','p_0','p_1','ai_0']);
});

test('deadline with no confirmations uses seat order, even when input seats are unsorted',t=>{
 const seats=[{seat:3,playerId:'p_3'},{seat:1,playerId:'p_1'},{seat:2,playerId:'p_2'}].map(p=>({...p,name:p.playerId,isBot:false,connected:true}));
 const h=makeMatch({seats,fake:true}).start();t.after(()=>h.m.dispose());h.sched.advance(25001);check(h,['p_1','p_2','p_3']);
});

test('automatically readied autoplay and AI seats never outrank manual humans',t=>{
 const h=makeMatch({humans:3,bots:1,fake:true}).start();t.after(()=>h.m.dispose());assert.deepEqual(h.m.handle('p_1',{t:'g.autoplay',on:true}),{ok:true});
 assert.equal(h.m.handle('p_1',{t:'g.infoReady'}).error,ERR.WRONG_PHASE);ready(h,'p_2');ready(h,'p_0');check(h,['p_2','p_0','p_1','ai_0']);assert.deepEqual(h.m.infoReadyOrder,['p_2','p_0']);
});

test('a confirmed human who enables autoplay moves behind manual humans',t=>{
 const h=makeMatch({humans:3,bots:1,fake:true}).start();t.after(()=>h.m.dispose());ready(h,'p_1');assert.deepEqual(h.m.handle('p_1',{t:'g.autoplay',on:true}),{ok:true});ready(h,'p_2');ready(h,'p_0');check(h,['p_2','p_0','p_1','ai_0']);
});

test('manual confirmation after leaving autoplay is recorded even if already auto-readied',t=>{
 const h=makeMatch({humans:3,fake:true}).start();t.after(()=>h.m.dispose());h.m.handle('p_1',{t:'g.autoplay',on:true});h.m.handle('p_1',{t:'g.autoplay',on:false});ready(h,'p_2');ready(h,'p_1');ready(h,'p_0');check(h,['p_2','p_1','p_0']);
});

test('disconnection without autoplay retains a manual position; departure cannot hold first choice',t=>{
 const h=makeMatch({humans:4,fake:true}).start();t.after(()=>h.m.dispose());ready(h,'p_1');ready(h,'p_2');h.m.onDisconnect('p_2');h.m.onLeave('p_1');ready(h,'p_3');ready(h,'p_0');check(h,['p_2','p_3','p_0','p_1']);
});

test('solo stays untimed and independent new matches have empty confirmation queues',t=>{
 const a=makeMatch({mode:'solo',fake:true}).start(),b=makeMatch({humans:2,fake:true}).start();t.after(()=>{a.m.dispose();b.m.dispose();});ready(a,'p_0');check(a,['p_0']);assert.equal(a.m.deadline,0);assert.equal(a.m.handle('p_0',{t:'g.bandSkip'}).error,ERR.WRONG_PHASE);assert.deepEqual(b.m.infoReadyOrder,[]);
});
