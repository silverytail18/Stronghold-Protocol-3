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
  await fs.writeFile(path.join(directory,'client.json'),JSON.stringify({...policy,resourceHash}));
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
test('browser only gets account UI; native requires login, exact resources, and no raw art routes',async t=>{
  const f=await fixture(t);
  assert.equal((await fetch(f.url+'/',{redirect:'manual'})).headers.get('location'),'/account');
  assert.equal((await fetch(f.url+'/js/main.js')).status,403);
  assert.equal((await fetch(f.url+'/assets/test.png',{headers:{'User-Agent':ua}})).status,404);
  assert.equal((await fetch(f.url+'/downloads/client.apk')).status,404);
  const loginStyle=await fetch(f.url+'/product/login.css',{headers:{'User-Agent':ua}});
  assert.equal(loginStyle.status,200);assert.match(loginStyle.headers.get('content-type'),/^text\/css/);
  assert.match(await loginStyle.text(),/client-progress/);
  assert.equal((await fetch(f.url+'/',{headers:{'User-Agent':ua},redirect:'manual'})).headers.get('location'),'/product/login.html');
  const auth=await login(f.url,'admin',{'User-Agent':ua});
  assert.equal((await fetch(f.url+'/js/main.js',{headers:{'User-Agent':ua,Cookie:auth.cookie}})).status,200);
  assert.equal((await fetch(f.url+'/auth/admin/game-versions',{headers:{'User-Agent':ua,Cookie:auth.cookie}})).status,403);
});
test('anonymous browser and incompatible native cannot upgrade WebSocket',async t=>{
  const f=await fixture(t);
  for(const headers of [{Origin:f.url},{Origin:f.url,'User-Agent':ua},{Origin:f.url,'User-Agent':ua.replace(resourceHash,'3'.repeat(64))}]) {
    const ws=new WebSocket(f.url.replace('http:','ws:')+'/ws',{headers});t.after(()=>ws.terminate());
    const status=await new Promise(resolve=>{ws.on('unexpected-response',(_req,res)=>{resolve(res.statusCode);res.resume();});ws.on('error',()=>resolve(-1));});assert.equal(status,403);
  }
});
test('native identity is bound to immutable account ID; foreign reconnect token is rejected',async t=>{
  const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
  const first=await a.request({t:'hello',name:'相同昵称',version:PROTOCOL_VERSION});assert.equal(first.t,'welcome');
  const rejected=await b.request({t:'hello',name:'相同昵称',token:first.token,version:PROTOCOL_VERSION});assert.equal(rejected.t,'error');
  const second=await b.request({t:'hello',name:'相同昵称',version:PROTOCOL_VERSION});assert.equal(second.t,'welcome');assert.notEqual(second.playerId,first.playerId);
  assert.equal(f.registry.byId(first.playerId).accountId,f.users[0].accountId);
  assert.equal(f.registry.byId(second.playerId).accountId,f.users[1].accountId);
});
test('administrator policy immediately controls new room versions without disabling existing rooms',async t=>{
  const f=await fixture(t),a=await socket(t,f);await a.request({t:'hello',name:'甲',version:PROTOCOL_VERSION});
  assert.equal((await a.request({t:'room.create',mode:'solo',version:'act1autochess'})).t,'ok');
  const room=[...f.lobby.rooms.values()][0];assert.equal(room.version,'act1autochess');
  const browser=await login(f.url);const view=f.product.versions.view();
  const response=await fetch(f.url+'/auth/admin/game-versions',{method:'PUT',headers:{Origin:f.url,Cookie:browser.cookie,'Content-Type':'application/json'},body:JSON.stringify({revision:view.revision,enabled:['act2autochess'],default:'act2autochess'})});
  assert.equal(response.status,200);const notification=await a.wait(msg=>msg.t==='versions.policy');assert.equal(notification.versions.length,1);assert.equal(room.version,'act1autochess');
  assert.equal((await a.request({t:'room.create',mode:'solo',version:'act1autochess'})).t,'error');
  assert.equal((await a.request({t:'room.create',mode:'solo'})).t,'ok');assert.equal([...f.lobby.rooms.values()][0].version,'act2autochess');
});
test('ranked toggle is host controlled, blocks bots and persists original account history',async t=>{
  const f=await fixture(t),a=await socket(t,f,'member');await a.request({t:'hello',name:'乙',version:PROTOCOL_VERSION});
  await a.request({t:'room.create',mode:'solo',difficulty:'NORMAL'});
  assert.equal((await a.request({t:'room.setRanked',on:true})).t,'ok');assert.equal([...f.lobby.rooms.values()][0].productRanked,true);
  assert.equal((await a.request({t:'room.addBot'})).t,'error');
  assert.deepEqual(f.product.ranked.profile(f.users[1].accountId).account,f.expected.profile.account);
});
test('ranked match is recorded once with official version and leave penalties use account identity',async t=>{
  const f=await fixture(t),a=await socket(t,f,'member');const welcome=await a.request({t:'hello',name:'排行昵称',version:PROTOCOL_VERSION});
  await a.request({t:'room.create',mode:'solo',difficulty:'NORMAL'});await a.request({t:'room.setRanked',on:true});
  const room=[...f.lobby.rooms.values()][0],result=f.lobby.startMatch(room);assert(!result.error,result.detail);
  const id=room.productRecordId,ctx=room.matchCtx;assert(id);assert.equal(f.product.ranked.profile(f.users[1].accountId).activeMatch,id);
  const summary={reason:'victory',victory:true,hiddenCleared:false,errors:0,players:[{playerId:welcome.playerId,name:'排行昵称',autoplay:true,roundsPassed:14}]};
  f.lobby.onMatchEnd(room,ctx,summary);f.lobby.onMatchEnd(room,ctx,summary);
  assert.equal(f.product.ranked.one('SELECT COUNT(*) AS n FROM ledger WHERE match_id=?',id).n,1);
  const record=f.product.ranked.one('SELECT summary FROM battle_records WHERE id=?',id);assert.equal(JSON.parse(record.summary).officialVersion,'act2autochess');assert(!('autoplay' in JSON.parse(record.summary).players[0]));
  assert.equal(f.product.ranked.profile(f.users[1].accountId).activeMatch,null);
});
test('ordinary match preserves score and new-engine interrupted records recover without touching historical rows',async t=>{
  const f=await fixture(t),a=await socket(t,f,'member');const welcome=await a.request({t:'hello',name:'普通昵称',version:PROTOCOL_VERSION});
  await a.request({t:'room.create',mode:'solo',difficulty:'NORMAL'});const room=[...f.lobby.rooms.values()][0];assert(!f.lobby.startMatch(room).error);
  f.lobby.onMatchEnd(room,room.matchCtx,{reason:'victory',victory:true,errors:0,players:[{playerId:welcome.playerId,name:'普通昵称'}]});
  assert.equal(f.product.ranked.profile(f.users[1].accountId).points,f.expected.profile.points);
  assert.equal(f.product.ranked.one('SELECT COUNT(*) AS n FROM ledger').n,1);
  assert.equal(JSON.parse(await fs.readFile(path.join(f.state,'runtime-generation.json'),'utf8')).engine,'upstream-bfd2a920-product-v1');
});
test('coop version changes immediately when the host selects it, resets peer readiness and never creates a vote',async t=>{
  const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
  await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});await b.request({t:'hello',name:'队友',version:PROTOCOL_VERSION});
  await a.request({t:'room.create',mode:'coop',difficulty:'ABYSS'});const room=[...f.lobby.rooms.values()][0];await b.request({t:'room.join',code:room.code});await b.request({t:'room.ready',ready:true});
  assert.equal((await b.request({t:'room.setVersion',version:'act1autochess'})).t,'error');assert.equal(room.version,'act2autochess');
  assert.equal((await a.request({t:'room.setVersion',version:'act1autochess'})).t,'ok');assert.equal(room.version,'act1autochess');assert.equal(room.versionVote,null);assert.equal(room.seats.find(s=>s&&s.name==='队友').ready,false);assert.notEqual(room.difficulty,'ABYSS');
  assert.equal((await b.request({t:'room.versionVote',voteId:1,agree:true})).t,'error');
});
test('solo selects in the waiting room, rejects disabled versions and cannot switch after game start',async t=>{
  const f=await fixture(t),a=await socket(t,f);await a.request({t:'hello',name:'独立玩家',version:PROTOCOL_VERSION});await a.request({t:'room.create',mode:'solo'});const room=[...f.lobby.rooms.values()][0];
  assert.equal((await a.request({t:'room.setVersion',version:'act2autochess@V2_1'})).t,'ok');assert.equal(room.versionVote,null);assert.equal(room.version,'act2autochess@V2_1');
  assert(!f.lobby.startMatch(room).error);const session=[...f.registry.all()][0];assert(f.lobby.handleMessage(session,{t:'room.setVersion',version:'act1autochess'}).error);assert.equal(room.version,'act2autochess@V2_1');
});
test('an administrator cannot enable a test pack conflicting with the selected official roster',async t=>{
  const f=await fixture(t),a=await socket(t,f);await a.request({t:'hello',name:'冲突验证',version:PROTOCOL_VERSION});
  f.product.contentCatalog.doc.items['rhine-lab-v1'].versions=['act1autochess','act2autochess'];
  await a.request({t:'room.create',mode:'solo',version:'act1autochess'});const room=[...f.lobby.rooms.values()][0];
  const result=await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids:['rhine-lab-v1']});
  assert.equal(result.t,'error');assert.match(result.detail,/本体已包含干员/);assert.deepEqual(room.productSelection,[]);
  room.productSelection=['rhine-lab-v1'];const start=f.lobby.startMatch(room);assert.ok(start.error);assert.match(start.detail,/本体已包含干员/);assert.equal(room.match,null);
});
