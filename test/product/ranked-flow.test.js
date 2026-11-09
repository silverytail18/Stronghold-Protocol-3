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


test('actual lobby ordinary/ranked, solo/coop and vanilla/plugin matches record once; only ranked changes points',async t=>{
 const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
 const wa=await a.request({t:'hello',name:'排位核验',version:PROTOCOL_VERSION});
 const wb=await b.request({t:'hello',name:'队友',version:PROTOCOL_VERSION});
 const checks=[];
 for(const mode of ['solo','coop'])for(const ranked of [false,true])for(const modded of [false,true]){
  assert.equal((await a.request({t:'room.create',mode,difficulty:'NORMAL'})).t,'ok');
  const room=f.lobby.roomOf(f.registry.byId(wa.playerId));
  if(mode==='coop')assert.equal((await b.request({t:'room.join',code:room.code})).t,'ok');
  assert.equal((await a.request({t:'room.setRanked',on:ranked})).t,'ok');
  assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids:modded?['arknights-expansion-v1']:[]})).t,'ok');
  const before=f.users.slice(0,mode==='solo'?1:2).map(u=>f.product.ranked.profile(u.accountId).points);
  assert(!f.lobby.startMatch(room).error);const id=room.productRecordId,ctx=room.matchCtx;
  const players=[wa,...(mode==='coop'?[wb]:[])].map(w=>({playerId:w.playerId,name:w.name,roundsPassed:15}));
  const summary={victory:true,hiddenCleared:true,reason:'victory',errors:0,players};
  f.lobby.onMatchEnd(room,ctx,summary);f.lobby.onMatchEnd(room,ctx,summary);
  const ledger=f.product.ranked.all('SELECT * FROM ledger WHERE match_id=?',id);
  assert.equal(ledger.length,ranked?players.length:0);
  const expected=ranked?(mode==='solo'?34:17):0;
  const after=f.users.slice(0,players.length).map(u=>f.product.ranked.profile(u.accountId).points);
  after.forEach((n,i)=>assert.equal(n-before[i],expected));
  assert.equal(f.product.ranked.all('SELECT id FROM battle_records WHERE id=?',id).length,1);
  checks.push({mode,ranked,modded,ledgerRows:ledger.length,expected});
  if(mode==='coop')assert.equal((await b.request({t:'room.leave'})).t,'ok');
  assert.equal((await a.request({t:'room.leave'})).t,'ok');
 }
 t.diagnostic(JSON.stringify({passed:true,checks}));
});
