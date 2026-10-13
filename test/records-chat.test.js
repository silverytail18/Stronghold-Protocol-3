import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Ranked } from '../server/ranked.js';
import { Match } from '../server/match/Match.js';
import { DATA, makeMatch } from './match/harness.js';
import { VirtualScheduler } from '../server/match/scheduler.js';
import { chatText, CHAT_KEEP, CHAT_COOLDOWN_MS } from '../shared/chat.js';
import { validateC2S } from '../shared/protocol.js';
import { createStore } from '../public/js/store.js';
import { installChatSync } from '../public/js/ui/chatSync.js';

const quiet = { info(){},warn(){},debug(){},error(){} };
function fixture(t) {
  const users = [0,1,2].map(i => ({username:`user${i}`,accountId:randomUUID()}));
  const rank = new Ranked({filename:':memory:',auth:{users:new Map(users.map(u=>[u.username,u]))},log:quiet});
  t.after(()=>rank.close());
  const seats = users.slice(0,2).map((u,i)=>({accountId:u.accountId,playerId:`p${i}`,name:`昵称${i}`,isBot:false}));
  const summary = {victory:true,roundsPassed:14,hiddenCleared:true,errors:0,players:seats.map(s=>({...s,lp:12,lineup:[{id:'chess_test',tier:3,items:['item_test']}],stats:{kills:145,dmgDealt:50000}}))};
  return {rank,users,seats,summary};
}
test('ordinary and ranked records are account-owned, include stats, and do not expose internal account IDs', t => {
  const {rank,users,seats,summary}=fixture(t);
  const id=rank.recordStart({mode:'coop',difficulty:'FUNNY',seats});rank.recordFinish(id,summary);
  const ranked=rank.start({mode:'coop',difficulty:'NORMAL',roomCode:'ABCD',seats});rank.finish(ranked.id,summary);
  assert.equal(rank.records(users[0].accountId).total,2);assert.equal(rank.records(users[1].accountId).total,2);assert.equal(rank.records(users[2].accountId).total,0);
  assert.throws(()=>rank.recordDetail(users[2].accountId,id),e=>e.status===404);
  const detail=rank.recordDetail(users[0].accountId,id);
  assert.equal(detail.summary.players[0].stats.kills,145);assert.equal(detail.summary.players[0].lineup[0].id,'chess_test');
  assert.ok(!JSON.stringify(detail).includes(users[0].accountId));
  const score=rank.recordDetail(users[0].accountId,ranked.id).ranking;
  assert.equal(score.after_points-score.before_points,17);
  rank.voidMatch(ranked.id,'admin','测试撤销');assert.equal(rank.recordDetail(users[0].accountId,ranked.id).ranking.status,'void');
  assert.equal(rank.records(users[0].accountId).rows.find(r=>r.id===ranked.id).ranked_status,'void');
});
test('current season isolation, start-time season attribution, filters and pagination', t => {
  const {rank,users,seats,summary}=fixture(t);
  for(let i=0;i<23;i++) { const id=rank.recordStart({mode:'solo',difficulty:'FUNNY',seats:seats.slice(0,1)});rank.recordFinish(id,summary); }
  const old=rank.recordStart({mode:'coop',difficulty:'FUNNY',seats});
  assert.equal(rank.records(users[0].accountId).rows.length,20);assert.equal(rank.records(users[0].accountId,{page:1}).rows.length,4);
  assert.equal(rank.records(users[0].accountId,{mode:'coop',kind:'normal'}).total,1);
  assert.equal(rank.records(users[0].accountId,{kind:'ranked'}).total,0);
  assert.throws(()=>rank.records(users[0].accountId,{mode:'other'}),e=>e.status===400);
  const next=rank.createSeason({name:'第二赛季'},'admin');rank.rollover(next.id,'admin');rank.recordFinish(old,summary);
  assert.equal(rank.records(users[0].accountId).total,0);assert.notEqual(rank.recordDetail(users[0].accountId,old).season_id,next.id);
});
test('record completion is idempotent and transient storage failure retries', t => {
  const {rank,users,seats,summary}=fixture(t),id=rank.recordStart({mode:'solo',difficulty:'FUNNY',seats:seats.slice(0,1)});
  const run=rank.run.bind(rank);rank.run=(sql,...args)=>{if(sql.startsWith('UPDATE battle_records'))throw new Error('disk busy');return run(sql,...args);};
  rank.recordFinish(id,summary);assert.equal(rank.recordPending.size,1);
  rank.run=run;rank.tick();assert.equal(rank.recordPending.size,0);
  rank.recordFinish(id,{...summary,victory:false});assert.equal(rank.recordDetail(users[0].accountId,id).summary.victory,true);
});
test('existing ranked database gains record tables without losing scores; unfinished records become interrupted on restart', async t => {
  const cache=path.resolve('.cache');await fs.mkdir(cache,{recursive:true});const directory=await fs.mkdtemp(path.join(cache,'records-upgrade-'));
  const user={username:'player',accountId:randomUUID()},options={filename:path.join(directory,'ranked.sqlite'),auth:{users:new Map([['player',user]])},log:quiet};
  let rank=new Ranked(options);t.after(()=>rank.close());
  const seats=[{accountId:user.accountId,playerId:'p',name:'玩家',isBot:false}],summary={victory:true,reason:'victory',errors:0,players:seats};
  const win=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'ABCD',seats});rank.finish(win.id,summary);
  // Reproduce the old database schema before records were introduced.
  rank.db.exec('DROP TABLE record_members; DROP TABLE battle_records;');rank.close();rank=new Ranked(options);
  assert.equal(rank.profile(user.accountId).points,30);assert.equal(rank.recordDetail(user.accountId,win.id).summary.victory,true);
  const normal=rank.recordStart({mode:'solo',difficulty:'FUNNY',seats});rank.close();rank=new Ranked(options);
  assert.equal(rank.recordDetail(user.accountId,normal).status,'interrupted');assert.equal(rank.profile(user.accountId).points,30);
});
test('ranked connected-human fields send browser specs without creating server battle simulations', t => {
  const h=makeMatch({mode:'coop',humans:2,bots:0,clientCombat:true,clients:false,fake:true,verify:'off'});t.after(()=>h.m.dispose());
  h.m.ranked=true;h.m._specBattle=()=>{throw new Error('unexpected server simulation');};h.start();h.toPrep(1);
  h.m.handle('p_0',{t:'g.ready',ready:true});h.m.handle('p_1',{t:'g.ready',ready:true});h.run(()=>h.m.phase==='COMBAT');
  assert.equal(h.m.fields.length,2);assert.ok(h.m.fields.every(f=>f.mode==='client' && f.battle===null));
  assert.equal(h.m.verifyStats.checked,0);assert.equal(h.m.errorCount,0);assert.equal(h.sent.filter(([,m])=>m.t==='b.start').length,2);
});
test('chat validates Unicode, controls, empty and excessive text', () => {
  assert.equal(chatText('  配合防守！  '),'配合防守！');assert.equal(chatText('a\n\u202eb'),'a  b');
  assert.equal(chatText('😀'.repeat(200)),'😀'.repeat(200));assert.equal(chatText('😀'.repeat(201)),null);
  for(const value of ['', '  ', '\u0000', null, {}, '字'.repeat(201)]) assert.equal(chatText(value),null);
  assert.equal(validateC2S({t:'g.chat',text:'队友加油'}),null);assert.notEqual(validateC2S({t:'g.chat',text:' '}),null);
});
function chatMatch(t) {
  const scheduler=new VirtualScheduler(),frames=[],sent=[];
  const match=new Match({mode:'coop',difficulty:'NORMAL',roomCode:'CHAT',seed:1,data:DATA,scheduler,
    seats:[0,1].map(i=>({seat:i,playerId:`p${i}`,name:`玩家${i}`,isBot:false,connected:true})),
    send:(id,m)=>{sent.push([id,m]);return true;},broadcast:m=>frames.push(m),onEnd:()=>{},log:quiet});
  t.after(()=>match.dispose());return{match,scheduler,frames,sent};
}
test('chat uses the server seat name, rate limits across reconnect, and rejects departed members', t => {
  const {match,scheduler,frames,sent}=chatMatch(t);
  assert.equal(match.handle('p0',{t:'g.chat',text:'<img src=x onerror=alert(1)>',name:'伪造昵称'}).ok,true);
  assert.equal(frames.find(m=>m.t==='m.chat').name,'玩家0');assert.equal(match.chatMessages[0].text,'<img src=x onerror=alert(1)>');
  assert.equal(match.handle('p0',{t:'g.chat',text:'太快'}).error,'RATE');
  match.onReconnect('p0');assert.equal(sent.find(([id,m])=>id==='p0'&&m.t==='m.chatHistory')[1].messages.length,1);
  assert.equal(match.handle('p0',{t:'g.chat',text:'重连后仍限速'}).error,'RATE');
  scheduler.advance(CHAT_COOLDOWN_MS);match.players.get('p0').alive=false;assert.equal(match.handle('p0',{t:'g.chat',text:'淘汰后协助队友'}).ok,true);
  match.players.get('p0').left=true;assert.equal(match.handle('p0',{t:'g.chat',text:'离开后'}).error,'NOT_IN_ROOM');
  assert.equal(match.handle('stranger',{t:'g.chat',text:'冒名'}).error,'NOT_IN_ROOM');
});
test('chat retains at most 50 messages and separate matches cannot see each other', t => {
  const a=chatMatch(t),b=chatMatch(t);
  for(let i=0;i<65;i++){assert.equal(a.match.handle('p0',{t:'g.chat',text:`消息${i}`}).ok,true);a.scheduler.advance(CHAT_COOLDOWN_MS);}
  assert.equal(a.match.chatMessages.length,CHAT_KEEP);assert.equal(a.match.chatMessages[0].text,'消息15');assert.equal(b.match.chatMessages.length,0);
});

for (const outcome of [{victory:true,reason:'victory'},{victory:false,reason:'defeat'},{victory:false,reason:'abandoned'},{victory:false,reason:'error'}]) {
  test(`chat is erased at ${outcome.reason}, absent from results and cannot be recovered after finish`, t => {
    const {match,frames,sent}=chatMatch(t);
    match.handle('p0',{t:'g.chat',text:'只在这一局保留的消息'});
    const retained=match.chatMessages;
    match.finish(outcome);
    assert.equal(match.chatMessages.length,0);assert.equal(retained.length,0);
    assert.ok(!JSON.stringify(match.lastResultMsg).includes('只在这一局保留的消息'));
    match.onReconnect('p1');
    assert.deepEqual(sent.filter(([,m])=>m.t==='m.chatHistory').at(-1)[1].messages,[]);
    assert.equal(match.handle('p0',{t:'g.chat',text:'已结束不能再发言'}).error,'WRONG_PHASE');
    assert.equal(frames.filter(m=>m.t==='m.chat').length,1,'cleanup needs no extra chat broadcast');
  });
}
test('forced disposal also erases chat immediately', t => {
  const {match}=chatMatch(t);match.handle('p0',{t:'g.chat',text:'异常关闭时清理'});
  match.dispose();assert.equal(match.chatMessages.length,0);
});
function clientChat() {
  const handlers=new Map(),net={on(type,fn){handlers.set(type,fn);}};
  const store=createStore({room:{code:'ABCD',inMatch:true},match:{public:{phase:'PREP'},result:null},chat:[]});
  installChatSync(net,store,()=>10000);
  return {store,emit:(type,fields={})=>handlers.get(type)?.({t:type,...fields})};
}
test('client erases messages/bubbles on RESULT or final result, ignores late history, and keeps match records', () => {
  for(const final of [{public:{phase:'RESULT'}},{result:{victory:true,ranking:{delta:30}}}]) {
    const {store,emit}=clientChat();emit('m.chat',{seq:1,playerId:'p',text:'不应留到下一局'});
    assert.equal(store.get().chat[0].receivedAt,10000);
    store.patch('match',final);assert.deepEqual(store.get().chat,[]);
    emit('m.chatHistory',{messages:[{seq:1,text:'延迟历史消息'}]});emit('m.chat',{seq:2,text:'延迟发言'});
    assert.deepEqual(store.get().chat,[]);
    if(final.result)assert.equal(store.get().match.result.ranking.delta,30);
  }
});
test('client drops chat on end/room closure/room switch and restores only an active match', () => {
  for(const nextRoom of [{code:'ABCD',inMatch:false},null,{code:'EFGH',inMatch:true}]) {
    const {store,emit}=clientChat();emit('m.chat',{seq:1,text:'旧局'});
    store.set({room:nextRoom});assert.deepEqual(store.get().chat,[]);
    if(!nextRoom?.inMatch){emit('m.chatHistory',{messages:[{seq:1,text:'旧局'}]});assert.deepEqual(store.get().chat,[]);}
  }
  const {store,emit}=clientChat();emit('m.chatHistory',{messages:[{seq:1,playerId:'p',text:'本局重连'}]});
  assert.equal(store.get().chat.length,1);assert.equal(store.get().chat[0].receivedAt,0,'history never restarts avatar bubbles');
  store.set({room:{code:'ABCD',inMatch:false}});store.set({room:{code:'ABCD',inMatch:true},match:{public:null,result:null}});
  emit('m.chat',{seq:1,text:'新局'});assert.deepEqual(store.get().chat.map(m=>m.text),['新局']);
});
