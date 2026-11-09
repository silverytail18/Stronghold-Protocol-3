import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {WebSocket} from 'ws';
import {productFixture,login} from './fixture.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {PROTOCOL_VERSION,CYCLOPS_VARIANT} from '../../shared/constants.js';
import {StubMatch} from '../../server/match/StubMatch.js';
import {Match} from '../../server/match/Match.js';
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


test('multiplayer ordinary/ranked and vanilla/plugin rooms reject addBot, allow human join, and refuse legacy AI seats before recording a match',async t=>{
 const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
 const w=await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});await b.request({t:'hello',name:'队友',version:PROTOCOL_VERSION});
 assert.equal((await a.request({t:'room.create',mode:'coop',difficulty:'NORMAL'})).t,'ok');const room=[...f.lobby.rooms.values()][0];
 for(const ranked of [false,true])for(const ids of [[],['arknights-expansion-v1']]){
  assert.equal((await a.request({t:'room.setRanked',on:ranked})).t,'ok');
  assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids})).t,'ok');
  const before=JSON.stringify(room.seats);const result=await a.request({t:'room.addBot'});assert.equal(result.t,'error');assert.match(result.detail,/不允许添加 AI/);assert.equal(JSON.stringify(room.seats),before);
 }
 assert.equal((await b.request({t:'room.join',code:room.code})).t,'ok');assert.equal(room.seats.filter(Boolean).length,2);
 const before=f.product.ranked.all('SELECT id FROM battle_records').length;
 assert.equal(f.lobby.addBot(f.registry.byId(w.playerId)).ok,true); // Simulate a seat retained by an older server.
 const result=f.lobby.startMatch(room);assert.ok(result.error);assert.match(result.detail,/不允许 AI/);assert.equal(room.match,null);assert.equal(f.product.ranked.all('SELECT id FROM battle_records').length,before);
 const index=room.seats.findIndex(s=>s?.isBot);assert.equal((await a.request({t:'room.removeBot',seat:index})).t,'ok');assert.equal(room.seats.some(s=>s?.isBot),false);
});

test('舟铲铲产品房可创建并启动真实模式，不允许排位或AI且不写普通/排位战绩',async t=>{
 const f=await fixture(t),a=await socket(t,f);f.lobby.MatchClass=Match;
 await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});
 const created=await a.request({t:'room.create',mode:'coop',difficulty:'NORMAL',variant:CYCLOPS_VARIANT});
 assert.equal(created.t,'ok');
 const room=[...f.lobby.rooms.values()][0];assert.equal(room.variant,CYCLOPS_VARIANT);assert.equal(room.seats.length,8);
 const before=f.product.ranked.all('SELECT id FROM battle_records').length;
 const ranked=await a.request({t:'room.setRanked',on:true});assert.equal(ranked.t,'error');assert.match(ranked.detail,/不支持排位/);
 const bot=await a.request({t:'room.addBot'});assert.equal(bot.t,'error');assert.match(bot.detail,/不允许添加 AI/);
 const started=await a.request({t:'room.start'});assert.equal(started.t,'ok');
 assert.ok(room.match instanceof Match);assert.equal(room.match.isCyclops,true);assert.equal(room.match.modeId,'mode_cyclops');
 assert.equal(room.match.gd.lastRound,21);assert.ok(room.match.gd.visibleChess.length>100);
 assert.equal(room.productRecordId,undefined);
 assert.equal(f.product.ranked.all('SELECT id FROM battle_records').length,before);
});
