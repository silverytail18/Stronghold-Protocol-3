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


test('one account keeps one gameplay identity across fresh devices, co-op reconnects and token claims',async t=>{
 const f=await fixture(t),a=await socket(t,f),b=await socket(t,f,'member');
 const w=await a.request({t:'hello',name:'设备一',version:PROTOCOL_VERSION});
 const member=await b.request({t:'hello',name:'队友',version:PROTOCOL_VERSION});
 const a2=await socket(t,f);const closed=new Promise(resolve=>a.ws.once('close',code=>resolve(code)));
 const w2=await a2.request({t:'hello',name:'设备二',version:PROTOCOL_VERSION});
 assert.equal(w2.playerId,w.playerId);assert.equal(w2.resumed,true);assert.equal(await closed,4001);
 assert.equal([...f.registry.all()].filter(s=>s.accountId===f.users[0].accountId).length,1);
 assert.equal((await a2.request({t:'room.create',mode:'coop',difficulty:'NORMAL'})).t,'ok');
 const room=[...f.lobby.rooms.values()][0];assert.equal((await b.request({t:'room.join',code:room.code})).t,'ok');
 const protectedDevice=await socket(t,f);assert.equal((await protectedDevice.request({t:'hello',name:'不接管',noReplace:true,version:PROTOCOL_VERSION})).code,'SESSION_IN_USE');
 const foreign=await socket(t,f);assert.equal((await foreign.request({t:'hello',name:'越权',token:member.token,version:PROTOCOL_VERSION})).code,'BAD_TARGET');
 assert.equal(room.seats.filter(Boolean).length,2);
 assert.equal(f.lobby.startMatch(room).ok,true);const match=room.match;
 const offline=new Promise(resolve=>a2.ws.once('close',resolve));a2.ws.close();await offline;
 for(let i=0;i<20&&f.registry.byId(w.playerId).connected;i++)await new Promise(resolve=>setImmediate(resolve));
 const a3=await socket(t,f);const w3=await a3.request({t:'hello',name:'设备三',version:PROTOCOL_VERSION});
 assert.equal(w3.playerId,w.playerId);assert.equal(w3.resumed,true);assert.equal(room.match,match);
 assert.equal(room.seats.filter(s=>s?.playerId===w.playerId).length,1);
 assert.equal([...f.registry.all()].filter(s=>s.accountId===f.users[0].accountId).length,1);
 const a4=await socket(t,f);const w4=await a4.request({t:'hello',name:'设备四',token:'stale-token',version:PROTOCOL_VERSION});
 assert.equal(w4.playerId,w.playerId);assert.equal(room.match,match);assert.equal(room.seats.filter(Boolean).length,2);
 assert.equal(f.product.ranked.all("SELECT id FROM battle_records WHERE status='running'").length,1);
});
