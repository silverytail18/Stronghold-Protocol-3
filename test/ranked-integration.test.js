import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { startServer } from '../server/index.js';
import { hashPassword, validateUsers } from '../server/auth.js';
import { APP_USER_AGENT } from '../server/app-client.js';
import { TestClient } from './helpers/wsClient.js';
import { Match } from '../server/match/Match.js';
import { DATA } from './match/harness.js';
import { VirtualScheduler } from '../server/match/scheduler.js';
import { PHASE } from '../shared/constants.js';

const password='ranked-test-password-long'; let passwordHash;
before(async()=>{passwordHash=await hashPassword(password);});
function request(srv,route,{cookie,method='GET',body,origin=srv.url,app=false}={}) {
  return new Promise((resolve,reject)=>{
    const req=http.request(srv.url+route,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...(app?{'User-Agent':APP_USER_AGENT}:{})}},res=>{
      const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>{let data;try{data=JSON.parse(Buffer.concat(chunks).toString());}catch{}resolve({status:res.statusCode,data,cookie:res.headers['set-cookie']?.[0].split(';')[0]});});
    });req.on('error',reject);req.end(body?JSON.stringify(body):undefined);
  });
}
class ControlledMatch {
  constructor(opts){this.opts=opts;this.players=new Map(opts.seats.map(s=>[s.playerId,{...s,alive:true,left:false}]));this.rankMainCleared=false;this.disposed=false;}
  start(){this.opts.broadcast({t:'m.public',phase:'INFO_CHECK',round:0,ranked:!!this.opts.ranked,players:[...this.players.values()]});}
  handle(){return {ok:true};}
  onReconnect(pid){this.opts.send(pid,{t:'m.public',phase:'INFO_CHECK',round:0,ranked:!!this.opts.ranked,players:[...this.players.values()]});}
  onDisconnect(){}
  onLeave(pid){this.players.get(pid).left=true;if([...this.players.values()].every(p=>p.left))this.complete(false,{reason:'abandoned'});}
  complete(victory,{hiddenCleared=false,reason= victory?'victory':'defeat'}={}) {
    const summary={victory,hiddenCleared,reason,errors:0,rankMainCleared:this.rankMainCleared,players:[...this.players.values()]};
    for(const p of this.players.values())if(!p.left)this.opts.send(p.playerId,{t:'m.result',...summary,playerId:p.playerId});this.opts.onEnd(summary);
  }
  dispose(){this.disposed=true;}
}
async function fixture(t,options={}) {
  const users=['admin','alice','bob'].map((username,i)=>({username,passwordHash,accountId:randomUUID(),role:i===0?'admin':'user',mustChangePassword:false}));
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,MatchClass:options.MatchClass || ControlledMatch,auth:{secureCookie:false,users:{version:1,users}},ranked:{filename:':memory:',...options}});
  const clients=[];t.after(async()=>{for(const client of clients)await client.close();await srv.close();});
  const login=async(username='admin')=>(await request(srv,'/auth/login',{method:'POST',body:{username,password}})).cookie;
  const connect=async(username='alice',cookie=null)=>{
    cookie ||= await login(username);const client=await TestClient.connect(srv.url.replace('http','ws')+'/ws',{wsOptions:{headers:{Cookie:cookie,Origin:srv.url}}});clients.push(client);const welcome=await client.hello(username);return{client,welcome,cookie};
  };
  return{srv,users,login,connect};
}

test('ranked HTTP requires login/admin/origin; App sees game data but cannot manage seasons',async t=>{
  const f=await fixture(t), admin=await f.login(), user=await f.login('alice');
  assert.equal((await request(f.srv,'/ranked/profile')).status,401);
  const profile=await request(f.srv,'/ranked/profile',{cookie:user});assert.equal(profile.status,200);assert.equal(profile.data.points,0);assert.equal(profile.data.rank.label,'青铜 III');
  assert.equal((await request(f.srv,'/auth/admin/ranked',{cookie:user})).status,403);
  assert.equal((await request(f.srv,'/auth/admin/ranked',{cookie:admin,app:true})).status,403);
  assert.equal((await request(f.srv,'/js/ranked-admin.js',{cookie:admin,app:true})).status,403);
  assert.equal((await request(f.srv,'/ranked/profile',{cookie:user,app:true})).status,200);
  assert.equal((await request(f.srv,'/auth/admin/ranked/seasons',{cookie:admin,method:'POST',body:{name:'S2'},origin:'http://evil.example'})).status,403);
  const created=await request(f.srv,'/auth/admin/ranked/seasons',{cookie:admin,method:'POST',body:{name:'S2 新赛季'}});assert.equal(created.status,200);
  assert.equal((await request(f.srv,'/auth/admin/ranked/rollover',{cookie:admin,method:'POST',body:{nextId:created.data.season.id}})).status,200);
  assert.equal((await request(f.srv,'/ranked/profile',{cookie:user})).data.season.id,created.data.season.id);
  assert.equal((await request(f.srv,'/ranked/profile?page=-1',{cookie:user})).status,400);
  assert.equal((await request(f.srv,'/ranked/history?mode=bad',{cookie:user})).status,400);
});

test('all authenticated App roles receive the same complete fixed pack before any test match exists',async t=>{
  const f=await fixture(t),admin=await f.login(),user=await f.login('alice');
  const a=await request(f.srv,'/app/resource-manifest',{cookie:admin,app:true}),u=await request(f.srv,'/app/resource-manifest',{cookie:user,app:true});
  assert.equal(a.status,200);assert.equal(u.status,200);assert.deepEqual(u.data.resourcePack,a.data.resourcePack);assert.ok(u.data.resourcePack.fileCount>6914);
  const catalog=await request(f.srv,u.data.resourcePack.catalog.url,{cookie:user,app:true});assert.equal(catalog.status,200);
  const files=new Set(catalog.data.files.map(f=>f.path));
  assert.ok([...files].some(p=>p.includes('/spine/op/char_1015_aglna2/')));
  for(const id of ['char_2025_shu_nian_11','char_2014_nian_nian_4','char_101_sora_epoque_17','char_2023_ling_nian_12','char_201_moeshd_kfc_1'])assert.ok([...files].some(p=>p.includes('/assets/skins/')&&p.includes(id)&&p.endsWith('.skel')),id);
  assert.equal(f.srv.lobby.rooms.size,0);assert.deepEqual(f.srv.lobby.testContentAccess.publicIds,[]);
});
test('real sockets: solo and coop settle shared scores, equal reward, server flags, AI blocked and result replay',async t=>{
  const f=await fixture(t), a=await f.connect('alice');
  assert.equal((await a.client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:true})).t,'ok');
  let room=[...f.srv.lobby.rooms.values()][0];assert.equal((await a.client.request({t:'room.start'})).t,'ok');
  assert.equal(room.match.opts.clientCombat,true);assert.equal(room.match.opts.ranked,true);
  assert.equal((await a.client.request({t:'g.autoplay',on:true})).code,'RANKED');
  const solo=room.match;solo.complete(true);solo.complete(true);
  const soloResult=await a.client.waitFor('m.result',m=>m.ranking?.pending===false);assert.equal(soloResult.ranking.delta,30);
  assert.equal(f.srv.ranked.profile(f.users[1].accountId).points,30);
  await a.client.request({t:'room.leave'});const b=await f.connect('bob');
  await a.client.request({t:'room.create',mode:'coop',difficulty:'HARD',ranked:true});room=[...f.srv.lobby.rooms.values()][0];
  assert.equal((await a.client.request({t:'room.addBot'})).code,'RANKED');
  assert.equal((await a.client.request({t:'room.start'})).code,'RANKED');
  assert.equal((await b.client.request({t:'room.join',code:room.code})).t,'ok');await b.client.request({t:'room.ready',ready:true});
  assert.equal((await a.client.request({t:'room.start'})).t,'ok');room.match.players.get(b.welcome.playerId).alive=false;room.match.complete(true,{hiddenCleared:true});
  const ra=await a.client.waitFor('m.result',m=>m.ranking?.difficulty==='HARD'&&m.ranking.pending===false),rb=await b.client.waitFor('m.result',m=>m.ranking?.pending===false);
  assert.equal(ra.ranking.delta,24);assert.equal(rb.ranking.delta,24);
  assert.equal(f.srv.ranked.profile(f.users[1].accountId).points,54);assert.equal(f.srv.ranked.profile(f.users[2].accountId).points,24);
  await b.client.hello('bob',b.welcome.token);const replay=await b.client.waitFor('m.result',m=>m.ranking?.pending===false);assert.equal(replay.ranking.delta,24);
  assert.equal(f.srv.ranked.profile(f.users[2].accountId).games,1);
});

test('real sockets: solo cooldown blocks solo but allows coop create, join, configure and start',async t=>{
  const f=await fixture(t),a=await f.connect('alice'),b=await f.connect('bob');
  await a.client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:true});
  await a.client.request({t:'room.start'});
  await a.client.request({t:'room.leave'});
  const before=f.srv.ranked.profile(f.users[1].accountId).cooldownUntil;
  assert.ok(before>Date.now());
  assert.equal((await a.client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:true})).t,'error');
  assert.equal((await a.client.request({t:'room.create',mode:'coop',difficulty:'NORMAL',ranked:true})).t,'ok');
  await a.client.request({t:'room.leave'});
  await b.client.request({t:'room.create',mode:'coop',difficulty:'NORMAL',ranked:true});
  let room=[...f.srv.lobby.rooms.values()].find(r=>r.hostId===b.welcome.playerId)||[...f.srv.lobby.rooms.values()][0];
  assert.equal((await a.client.request({t:'room.join',code:room.code})).t,'ok');
  assert.equal((await b.client.request({t:'room.setDifficulty',difficulty:'HARD'})).t,'ok');
  await a.client.request({t:'room.ready',ready:true});
  assert.equal((await b.client.request({t:'room.start'})).t,'ok');
  assert.equal(room.match.opts.mode,'coop');
  await a.client.request({t:'room.leave'});room.match.complete(true);
  assert.equal(f.srv.ranked.profile(f.users[1].accountId).cooldownUntil,before);
  assert.equal(f.srv.ranked.one('SELECT COUNT(*) AS n FROM abandons').n,1);
  assert.equal(f.srv.ranked.history(f.users[1].accountId).rows[0].nominal,-25);
});
test('admin autoplay works in every solo ranked difficulty; ordinary accounts remain blocked',async t=>{
  for(const difficulty of ['NORMAL','HARD','ABYSS']) {
    const f=await fixture(t,{MatchClass:Match}),admin=await f.connect('admin');
    assert.equal((await admin.client.request({t:'room.create',mode:'solo',difficulty,ranked:true})).t,'ok');
    assert.equal((await admin.client.request({t:'room.start'})).t,'ok');
    const room=[...f.srv.lobby.rooms.values()].find(r=>r.match);
    assert.equal((await admin.client.waitFor('m.private',m=>m.canAutoplay===true)).autoplay,false);
    assert.equal(room.match.botRehearsal,0,'ranked autoplay must not rehearse battles on the server');
    assert.equal(room.match.clientCombat,true);
    assert.equal((await admin.client.request({t:'g.autoplay',on:true})).t,'ok');
    assert.equal((await admin.client.waitFor('m.private',m=>m.autoplay===true)).canAutoplay,true);
    assert.equal((await admin.client.request({t:'g.autoplay',on:false})).t,'ok');
    assert.equal(room.match.players.get(admin.welcome.playerId).autoplay,false);
    assert.ok(room.match.publicView().players.every(p=>!Object.hasOwn(p,'autoplay')));
    room.match.finish({victory:false,reason:'defeat'});
    await admin.client.waitFor('m.result');await admin.client.request({t:'room.leave'});
  }
});
test('ranked coop admin permission/state stay private, reconnect restores them, peer cannot impersonate the admin',async t=>{
  const f=await fixture(t,{MatchClass:Match}),admin=await f.connect('admin'),peer=await f.connect('alice');
  await admin.client.request({t:'room.create',mode:'coop',difficulty:'ABYSS',ranked:true});
  const room=[...f.srv.lobby.rooms.values()][0];
  await peer.client.request({t:'room.join',code:room.code});await peer.client.request({t:'room.ready',ready:true});await admin.client.request({t:'room.start'});
  assert.equal((await peer.client.waitFor('m.private')).canAutoplay,false);
  assert.equal((await peer.client.request({t:'g.autoplay',on:true})).code,'RANKED');
  assert.equal(room.match.handle(peer.welcome.playerId,{t:'g.autoplay',on:true}).error,'BAD_MSG','match engine also checks permission');
  await admin.client.request({t:'g.autoplay',on:true});
  await admin.client.waitFor('m.private',m=>m.autoplay===true&&m.canAutoplay===true);
  await peer.client.request({t:'ping'});
  assert.ok(peer.client.log.filter(m=>m.t==='m.public').every(m=>m.players.every(p=>!Object.hasOwn(p,'autoplay')&&!Object.hasOwn(p,'canAutoplay'))));
  assert.ok(peer.client.log.filter(m=>m.t==='m.private').every(m=>m.autoplay===false&&m.canAutoplay===false));
  assert.ok(!peer.client.log.some(m=>m.t==='m.ticker'&&/托管|AUTOPILOT/.test(m.text)));
  await admin.client.hello('admin',admin.welcome.token);
  await admin.client.waitFor('m.private',m=>m.autoplay===true&&m.canAutoplay===true);
  await admin.client.request({t:'g.autoplay',on:false});
  await admin.client.waitFor('m.private',m=>m.autoplay===false&&m.canAutoplay===true);
  room.match.finish({victory:true,reason:'victory'});
  const result=await admin.client.waitFor('m.result',m=>m.ranking?.pending===false);
  assert.equal(result.ranking.delta,30);
  assert.ok(!JSON.stringify(result).includes('autoplay'));
});

test('battle record HTTP is private to participants and returns current-season ordinary and ranked games',async t=>{
  const f=await fixture(t),a=await f.connect('alice'),admin=await f.login('admin');
  assert.equal((await request(f.srv,'/ranked/records')).status,401);
  await a.client.request({t:'room.create',mode:'solo',difficulty:'FUNNY'});await a.client.request({t:'room.start'});
  let room=[...f.srv.lobby.rooms.values()][0];room.match.complete(true);
  await a.client.request({t:'room.start'});room.match.complete(false);
  const records=await request(f.srv,'/ranked/records',{cookie:a.cookie});assert.equal(records.data.total,2);
  const id=records.data.rows[0].id;
  assert.equal((await request(f.srv,`/ranked/records/${id}`,{cookie:admin})).status,404);
  const detail=await request(f.srv,`/ranked/records/${id}`,{cookie:a.cookie,app:true});assert.equal(detail.status,200);
  assert.ok(!JSON.stringify(detail.data).includes(f.users[1].accountId));
  assert.equal((await request(f.srv,'/ranked/records?kind=bad',{cookie:a.cookie})).status,400);
  const next=f.srv.ranked.createSeason({name:'S2'},'admin');f.srv.ranked.rollover(next.id,'admin');
  assert.equal((await request(f.srv,'/ranked/records',{cookie:a.cookie})).data.total,0);
});

test('real room chat reaches both members, stays out of another room, and restores on reconnect',async t=>{
  const f=await fixture(t,{MatchClass:Match}),a=await f.connect('alice'),b=await f.connect('bob'),c=await f.connect('admin');
  await a.client.request({t:'room.create',mode:'coop',difficulty:'NORMAL'});const room=[...f.srv.lobby.rooms.values()][0];
  await b.client.request({t:'room.join',code:room.code});await b.client.request({t:'room.ready',ready:true});await a.client.request({t:'room.start'});
  await c.client.request({t:'room.create',mode:'solo',difficulty:'FUNNY'});await c.client.request({t:'room.start'});
  assert.equal((await a.client.request({t:'g.chat',text:'守住右路！'})).t,'ok');
  assert.equal((await a.client.waitFor('m.chat')).text,'守住右路！');assert.equal((await b.client.waitFor('m.chat')).name,'alice');
  assert.ok(!c.client.log.some(m=>m.t==='m.chat'));
  assert.equal((await a.client.request({t:'g.chat',text:'发送太快'})).code,'RATE');
  await b.client.hello('bob',b.welcome.token);const history=await b.client.waitFor('m.chatHistory',m=>m.messages.length===1);assert.equal(history.messages[0].text,'守住右路！');
  const finishedMatch=room.match;finishedMatch.finish({victory:false,reason:'defeat'});
  await a.client.waitFor('m.result');await b.client.waitFor('m.result');assert.deepEqual(finishedMatch.chatMessages,[]);
  const records=f.srv.ranked.records(f.users[1].accountId);assert.equal(records.total,1);
  assert.ok(!JSON.stringify(f.srv.ranked.recordDetail(f.users[1].accountId,records.rows[0].id)).includes('守住右路！'));
  await b.client.hello('bob',b.welcome.token);await b.client.waitFor('m.result');
  await b.client.request({t:'room.ready',ready:true});await a.client.request({t:'room.start'});
  assert.notEqual(room.match,finishedMatch);assert.deepEqual(room.match.chatMessages,[]);
});

test('same account from another device resumes ranked seat with no old game token and cannot occupy another seat',async t=>{
  const f=await fixture(t), a=await f.connect('alice');await a.client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:true});await a.client.request({t:'room.start'});
  const other=await f.connect('alice');assert.equal(other.welcome.playerId,a.welcome.playerId);assert.equal(other.welcome.resumed,true);
  const room=await other.client.waitFor('room.state');assert.equal(room.ranked,true);assert.equal(room.inMatch,true);assert.equal((await a.client.closed).code,4001);
  assert.equal((await other.client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:true})).t,'error');
});
test('normal eliminated member can leave and still receives final team win; live voluntary leaver gets fixed loss',async t=>{
  const f=await fixture(t),a=await f.connect('alice'),b=await f.connect('bob');await a.client.request({t:'room.create',mode:'coop',difficulty:'NORMAL',ranked:true});
  let room=[...f.srv.lobby.rooms.values()][0];await b.client.request({t:'room.join',code:room.code});await b.client.request({t:'room.ready',ready:true});await a.client.request({t:'room.start'});
  room.match.players.get(b.welcome.playerId).alive=false;await b.client.request({t:'g.leave'});room.match.complete(true);
  assert.equal(f.srv.ranked.profile(f.users[2].accountId).points,15);assert.equal(f.srv.ranked.profile(f.users[2].accountId).cooldownUntil,0);
  await b.client.request({t:'room.join',code:room.code});await b.client.request({t:'room.ready',ready:true});await a.client.request({t:'room.start'});await b.client.request({t:'g.leave'});room.match.complete(true);
  assert.equal(f.srv.ranked.profile(f.users[1].accountId).points,30);assert.equal(f.srv.ranked.profile(f.users[2].accountId).points,0);
  assert.equal(f.srv.ranked.history(f.users[2].accountId).rows[0].nominal,-20);
});
test('season drain closes live ranked room, releases locks and preserves ordinary room',async t=>{
  const f=await fixture(t,{drainMs:0}),a=await f.connect('alice'),b=await f.connect('bob');
  await a.client.request({t:'room.create',mode:'solo',difficulty:'HARD',ranked:true});await a.client.request({t:'room.start'});
  await b.client.request({t:'room.create',mode:'solo',difficulty:'FUNNY'});const normal=[...f.srv.lobby.rooms.values()].find(r=>!r.ranked);
  const next=f.srv.ranked.createSeason({name:'next'},'admin');f.srv.ranked.rollover(next.id,'admin');
  const closed=await a.client.waitFor('room.closed');assert.equal(closed.reason,'season-ended');assert.ok(f.srv.lobby.getRoom(normal.code));
  assert.equal(f.srv.ranked.profile(f.users[1].accountId).points,0);assert.equal(f.srv.ranked.profile(f.users[1].accountId).activeMatch,null);
});
test('actual Match forces client combat and disables server verification in ranked and rejects AI autoplay; main-clear checkpoint survives exit',()=>{
  const scheduler=new VirtualScheduler(),end=[];
  const match=new Match({roomCode:'TEST',mode:'solo',difficulty:'NORMAL',seats:[{seat:0,playerId:'p0',name:'player',connected:true,isBot:false}],data:DATA,seed:1,
    ranked:true,clientCombat:false,verify:'all',scheduler,send:()=>true,broadcast:()=>{},onEnd:s=>end.push(s),log:{error(){},warn(){},info(){},debug(){}}});
  assert.equal(match.clientCombat,true);assert.equal(match.verifyMode,'off');assert.equal(match.publicView().ranked,true);assert.equal(match.handle('p0',{t:'g.autoplay',on:true}).error,'BAD_MSG');
  match.phase=PHASE.FINAL_ASSAULT;match.fields=[];match.bossPool={hp:0};match.teamLp=100;
  match._finishFinal(false,()=>({}));assert.equal(match.rankMainCleared,true);
  match.onLeave('p0');assert.equal(end[0].rankMainCleared,true);match.dispose();
});

test('actual server Match preserves main victory when hidden core fails',()=>{
  const scheduler=new VirtualScheduler(),end=[];
  const match=new Match({roomCode:'TEST',mode:'solo',difficulty:'NORMAL',seats:[{seat:0,playerId:'p0',name:'player',connected:true,isBot:false}],data:DATA,seed:1,
    ranked:true,scheduler,send:()=>true,broadcast:()=>{},onEnd:s=>end.push(s),log:{error(){},warn(){},info(){},debug(){}}});
  match.phase=PHASE.FINAL_ASSAULT;match.fields=[];match.bossPool={hp:0};match.teamLp=100;match._finishFinal(false,()=>({}));
  match.phase=PHASE.HIDDEN_CORE;match.hiddenReached=true;match.bossPool={hp:100};match._finishFinal(true,()=>({}));
  scheduler.runUntil(()=>end.length>0);
  assert.equal(end[0].victory,true);assert.equal(end[0].hiddenCleared,false);assert.equal(end[0].rankMainCleared,true);match.dispose();
});
test('immutable account IDs survive validation and reject duplicates',()=>{
  const id=randomUUID(),first=validateUsers({version:1,users:[{username:'admin',passwordHash,accountId:id}]});assert.equal(first.get('admin').accountId,id);
  assert.throws(()=>validateUsers({version:1,users:[{username:'admin',passwordHash,accountId:id},{username:'other',passwordHash,accountId:id}]}),/重复/);
});

test('storage failure during voluntary leave reports error and keeps the original ranked seat', async t=>{
  const f=await fixture(t),a=await f.connect('alice');
  await a.client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:true});await a.client.request({t:'room.start'});
  const room=[...f.srv.lobby.rooms.values()][0],markLeave=f.srv.ranked.markLeave.bind(f.srv.ranked);
  f.srv.ranked.markLeave=()=>{throw new Error('injected storage failure');};
  assert.equal((await a.client.request({t:'g.leave'})).code,'RANKED');
  assert.equal(room.seatOf(a.welcome.playerId).left,false);
  assert.equal(f.srv.registry.byId(a.welcome.playerId).roomCode,room.code);
  f.srv.ranked.markLeave=markLeave;
  assert.equal((await a.client.request({t:'g.leave'})).t,'ok');
});
