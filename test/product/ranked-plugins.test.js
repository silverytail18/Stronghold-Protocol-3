import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {WebSocket} from 'ws';
import {productFixture,login} from './fixture.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {PROTOCOL_VERSION} from '../../shared/constants.js';
import {StubMatch} from '../../server/match/StubMatch.js';
const resourceHash='1'.repeat(64);
const ua='Fixture StrongholdProtocolApp/2 Resources/'+resourceHash+' ClientLine/0.9 Build/45 Epoch/1';
async function fixture(t) {
  const f=await productFixture();let server;t.after(async()=>{await server?.close();await f.close();});const directory=path.join(f.dir,'resources');
  const policy=await writeInitialPolicy({format:1,contract:2,clientLine:'0.9',epoch:1,files:[{path:'/assets/a.bin',sha256:'2'.repeat(64),size:1,mime:'application/octet-stream'}]},directory);
  await fs.writeFile(path.join(directory,'client.json'),JSON.stringify({...policy,minBuild:45,resourceHash}));
  server=await startProductServer({root:f.project,env:f.env,port:0,host:'127.0.0.1',resourceDirectory:directory,publicKey:'unused-without-patches',MatchClass:StubMatch,log:{info(){},debug(){},warn(){},error(){}}});
  const url='http://127.0.0.1:'+server.port;
  return {...f,...server,url};
}
async function socket(t,f,username='admin') {
  const auth=await login(f.url,username,{'User-Agent':ua});assert.equal(auth.status,200);
  const ws=new WebSocket(f.url.replace('http:','ws:')+'/ws',{headers:{Origin:f.url,Cookie:auth.cookie,'User-Agent':ua}});t.after(()=>ws.terminate());
  const messages=[],listeners=new Set();ws.on('message',bytes=>{const msg=JSON.parse(bytes);messages.push(msg);for(const fn of listeners)fn();});
  await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
  const wait=predicate=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{listeners.delete(check);reject(Error('Timed out; messages '+messages.map(m=>m.t+':'+(m.detail||m.code||'')).join(',')));},6000);function check(){const index=messages.findIndex(predicate);if(index<0)return;clearTimeout(timer);listeners.delete(check);resolve(messages.splice(index,1)[0]);}listeners.add(check);check();});
  let rid=0;const request=async msg=>{const id=++rid;ws.send(JSON.stringify({...msg,rid:id}));return wait(m=>m.rid===id);};
  return {ws,wait,request,auth};
}

test('ranked plugin matches settle once at full frozen season scores, independent of later rule edits',async t=>{
 const f=await fixture(t),a=await socket(t,f);const w=await a.request({t:'hello',name:'插件排位',version:PROTOCOL_VERSION});
 const rules=Object.fromEntries(['NORMAL','HARD','ABYSS'].map(d=>[d,{win:37,loss:13,hidden:7,coopWin:19,coopLoss:11,coopHidden:5}]));
 f.product.ranked.run('UPDATE seasons SET rules=? WHERE id=?',JSON.stringify(rules),f.product.ranked.current().id);
 assert.equal((await a.request({t:'room.create',mode:'solo',difficulty:'NORMAL'})).t,'ok');
 assert.equal((await a.request({t:'room.setRanked',on:true})).t,'ok');const room=[...f.lobby.rooms.values()][0];
 assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids:['arknights-expansion-v1']})).t,'ok');
 assert.equal(room.content.vanilla,false);assert(!f.lobby.startMatch(room).error);
 const id=room.productRecordId,ctx=room.matchCtx;f.product.ranked.run('UPDATE seasons SET rules=? WHERE id=?',JSON.stringify(Object.fromEntries(Object.entries(rules).map(([d,r])=>[d,{...r,win:100}]))),f.product.ranked.current().id);
 const summary={reason:'victory',victory:true,hiddenCleared:true,errors:0,players:[{playerId:w.playerId,name:'插件排位',roundsPassed:15}]};
 f.lobby.onMatchEnd(room,ctx,summary);f.lobby.onMatchEnd(room,ctx,summary);
 const ledger=f.product.ranked.all('SELECT * FROM ledger WHERE match_id=?',id);assert.equal(ledger.length,1);assert.equal(ledger[0].nominal,44);assert.equal(f.product.ranked.profile(f.users[0].accountId).points,44);
 f.product.ranked.run('UPDATE seasons SET rules=? WHERE id=?',JSON.stringify(rules),f.product.ranked.current().id);
 for(const mode of ['solo','coop'])for(const modded of [false,true])for(const victory of [false,true]){
  const seats=f.users.slice(0,mode==='solo'?1:2).map((u,i)=>({accountId:u.accountId,playerId:'score-'+i,name:u.username,isBot:false}));
  const match=f.product.ranked.start({mode,difficulty:'NORMAL',roomCode:'SCORE',seats});
  f.product.ranked.finish(match.id,{victory,hiddenCleared:victory,reason:victory?'victory':'defeat',errors:0,content:modded?{vanilla:false,plugins:['test']}:{vanilla:true},players:seats});
  assert.equal(f.product.ranked.one('SELECT nominal FROM ledger WHERE match_id=?',match.id).nominal,victory?(mode==='solo'?44:24):-(mode==='solo'?13:11));
 }
});

test('leaving a hosted ranked match before the first round still settles one abandoned game',async t=>{
 const f=await fixture(t),a=await socket(t,f);
 await a.request({t:'hello',name:'开局放弃核验',version:PROTOCOL_VERSION});
 assert.equal((await a.request({t:'room.create',mode:'solo',difficulty:'NORMAL'})).t,'ok');
 const room=[...f.lobby.rooms.values()][0];
 assert.equal((await a.request({t:'room.setRanked',on:true})).t,'ok');
 assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids:['arknights-expansion-v1']})).t,'ok');
 const before=f.product.ranked.profile(f.users[0].accountId);
 assert(!f.lobby.startMatch(room).error);const id=room.productRecordId,proxy=room.match;
 assert.equal(proxy.hosted,true);const diag=await proxy.diag();assert.equal(diag.errorCount,0);
 assert.equal((await a.request({t:'room.leave'})).t,'ok');
 const until=Date.now()+3000;
 while(f.product.ranked.one('SELECT status FROM matches WHERE id=?',id)?.status==='running'&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,20));
 const after=f.product.ranked.profile(f.users[0].accountId);
 assert.equal(after.games,before.games+1);assert.equal(after.activeMatch,null);
 assert.equal(f.product.ranked.one('SELECT status FROM matches WHERE id=?',id).status,'settled');
 const ledger=f.product.ranked.all('SELECT * FROM ledger WHERE match_id=?',id);
 assert.equal(ledger.length,1);assert.equal(ledger[0].reason,'abandoned');assert.ok(ledger[0].nominal<0);
 assert.equal(f.product.ranked.one('SELECT status FROM battle_records WHERE id=?',id).status,'finished');
 assert.equal(f.lobby.rooms.has(room.code),false);
});

test('hosted coop ranked abandonment waits for the last human and counts both participants once',async t=>{
 const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
 await a.request({t:'hello',name:'退出者甲',version:PROTOCOL_VERSION});
 await b.request({t:'hello',name:'退出者乙',version:PROTOCOL_VERSION});
 assert.equal((await a.request({t:'room.create',mode:'coop',difficulty:'NORMAL'})).t,'ok');
 const room=[...f.lobby.rooms.values()][0];
 assert.equal((await b.request({t:'room.join',code:room.code})).t,'ok');
 assert.equal((await a.request({t:'room.setRanked',on:true})).t,'ok');
 assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids:['arknights-expansion-v1']})).t,'ok');
 const before=f.users.slice(0,2).map(u=>f.product.ranked.profile(u.accountId).games);
 assert(!f.lobby.startMatch(room).error);const id=room.productRecordId,proxy=room.match;
 assert.equal((await proxy.diag()).errorCount,0);
 assert.equal((await a.request({t:'room.leave'})).t,'ok');
 assert.equal(f.product.ranked.one('SELECT status FROM matches WHERE id=?',id).status,'running');
 assert.equal(f.lobby.rooms.has(room.code),true);
 assert.equal((await b.request({t:'room.leave'})).t,'ok');
 const until=Date.now()+3000;
 while(f.product.ranked.one('SELECT status FROM matches WHERE id=?',id)?.status==='running'&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(f.product.ranked.one('SELECT status FROM matches WHERE id=?',id).status,'settled');
 for(const[i,u]of f.users.slice(0,2).entries()){
  const p=f.product.ranked.profile(u.accountId);assert.equal(p.games,before[i]+1);assert.equal(p.activeMatch,null);
 }
 const ledger=f.product.ranked.all('SELECT * FROM ledger WHERE match_id=?',id);
 assert.equal(ledger.length,2);assert.ok(ledger.every(v=>v.reason==='abandoned'&&v.nominal<0));
 assert.equal(f.lobby.rooms.has(room.code),false);
});

test('Emi season hosted plugin abandon carries new statistics over IPC and clears both account locks',async t=>{
 const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
 await a.request({t:'hello',name:'新排位甲',version:PROTOCOL_VERSION});await b.request({t:'hello',name:'新排位乙',version:PROTOCOL_VERSION});
 f.product.ranked.upgradeSeason({name:'Emi新季',reason:'合成升级',confirm:'保留对局并清理旧赛季'},'admin');
 for(const mode of ['solo','coop']){
  const users=f.users.slice(0,mode==='solo'?1:2);
  for(const user of users)f.product.ranked.directPlacement({accountId:user.accountId,points:2200,reason:'指定定级测试'},'admin');
  assert.equal((await a.request({t:'room.create',mode,difficulty:'NORMAL'})).t,'ok');const room=[...f.lobby.rooms.values()][0];
  if(mode==='coop')assert.equal((await b.request({t:'room.join',code:room.code})).t,'ok');
  assert.equal((await a.request({t:'room.setRanked',on:true})).t,'ok');
  assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids:['arknights-expansion-v1']})).t,'ok');
  assert(!f.lobby.startMatch(room).error);const id=room.productRecordId;assert.equal((await room.match.diag()).errorCount,0);
  assert.equal((await a.request({t:'room.leave'})).t,'ok');if(mode==='coop')assert.equal((await b.request({t:'room.leave'})).t,'ok');
  const until=Date.now()+4000;while(f.product.ranked.one('SELECT status FROM matches WHERE id=?',id)?.status==='running'&&Date.now()<until)await new Promise(r=>setTimeout(r,20));
  const match=f.product.ranked.one('SELECT * FROM matches WHERE id=?',id);assert.equal(match.status,'settled',match.summary);
  const entries=f.product.ranked.all('SELECT * FROM ledger WHERE match_id=?',id);assert.equal(entries.length,users.length);assert.ok(entries.every(e=>e.nominal===(mode==='solo'?-40:-47)));
  for(const user of users){const p=f.product.ranked.profile(user.accountId);assert.equal(p.activeMatch,null);assert.equal(p.cooldownUntil,0);}
 }
});
