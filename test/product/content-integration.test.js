import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {WebSocket} from 'ws';
import {productFixture,login} from './fixture.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {PROTOCOL_VERSION} from '../../shared/constants.js';
import {RESOURCE_CONTRACT,CLIENT_LINE,CLIENT_BUILD,RESOURCE_EPOCH} from '../../shared/client-resources.js';
import {contentHashOf} from '../../shared/plugins/identity.js';
import {createHash} from 'node:crypto';
const resourceHash='1'.repeat(64);
const ua=`Fixture StrongholdProtocolApp/${RESOURCE_CONTRACT} Resources/${resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/${RESOURCE_EPOCH}`;
async function fixture(t) {
  const f=await productFixture();let server;t.after(async()=>{await server?.close();await f.close();});const directory=path.join(f.dir,'resources');
  const policy=await writeInitialPolicy({format:1,contract:RESOURCE_CONTRACT,clientLine:CLIENT_LINE,epoch:RESOURCE_EPOCH,files:[{path:'/assets/a.bin',sha256:'2'.repeat(64),size:1,mime:'application/octet-stream'}]},directory);
  await fs.writeFile(path.join(directory,'client.json'),JSON.stringify({...policy,resourceHash}));
  server=await startProductServer({root:f.project,env:f.env,port:0,host:'127.0.0.1',resourceDirectory:directory,publicKey:'unused-without-patches',log:{info(){},debug(){},warn(){},error(){}}});
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

test('host selects version-scoped built-ins; switch clears selection in solo and coop, stale submissions fail',async t=>{
 for(const mode of ['solo','coop']){
  const f=await fixture(t),a=await socket(t,f);await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});assert.equal((await a.request({t:'room.create',mode,difficulty:'NORMAL'})).t,'ok');const room=[...f.lobby.rooms.values()][0];
  const select=ids=>a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids});
  const result=await select(['arknights-expansion-v1']);assert.equal(result.t,'ok',JSON.stringify(result));assert.deepEqual(room.productSelection,['arknights-expansion-v1']);assert.equal(room.content.vanilla,false);
  const index=await fetch(f.url+'/cs/'+room.content.cs.slice(0,16)+'/index.json',{headers:{'User-Agent':ua,Cookie:a.auth.cookie}}).then(r=>r.json());assert.equal(index.vanilla,false);assert.equal(index.cs,room.content.cs);assert.equal(contentHashOf({...index,data:Object.fromEntries(Object.entries(index.data).map(([k,v])=>[k,v.sha256]))}),index.cs);
  for(const [name,entry]of Object.entries(index.data)){const bytes=Buffer.from(await fetch(f.url+entry.url,{headers:{'User-Agent':ua,Cookie:a.auth.cookie}}).then(r=>r.arrayBuffer()));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,name);}
  const data=f.lobby.dataFor(room);assert.ok(data.chess.chess_exp_aglna2_a);assert.equal(data.chess.chess_exp_aglna2_a.expansionBatch,'arknights-expansion-v1');
  const old=room.version;assert.equal((await a.request({t:'room.setVersion',version:old})).t,'ok');assert.equal(room.productSelection.length,1);
  assert.equal((await a.request({t:'room.setVersion',version:'act2autochess@V2_1'})).t,'ok');assert.deepEqual(room.productSelection,[]);assert.equal(room.content.vanilla,true);
  assert.equal((await select(['arknights-expansion-v1'])).t,'error');assert.deepEqual(room.productSelection,[]);
  assert.equal((await a.request({t:'room.setVersion',version:old})).t,'ok');assert.deepEqual(room.productSelection,[]);
  assert.equal((await a.request({t:'room.setProductContent',version:'act2autochess@V2_1',revision:0,ids:['rhine-lab-v1']})).t,'error');assert.deepEqual(room.productSelection,[]);
 }
});

test('admin policy version matrix takes effect for actual data composition and never grants a member host access',async t=>{
 const f=await fixture(t),a=await socket(t,f);await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});await a.request({t:'room.create',mode:'solo',difficulty:'NORMAL'});const room=[...f.lobby.rooms.values()][0],policy=f.product.contentCatalog;
 await policy.update({revision:0,items:[{id:'arknights-expansion-v1',public:true,versions:['act1autochess']}]},f.users[0].accountId);
 assert.equal((await a.request({t:'room.setProductContent',version:room.version,revision:1,ids:['arknights-expansion-v1']})).t,'error');await a.request({t:'room.setVersion',version:'act1autochess'});
 const result=await a.request({t:'room.setProductContent',version:room.version,revision:1,ids:['arknights-expansion-v1']});assert.equal(result.t,'ok',JSON.stringify(result));assert.equal(f.lobby.dataFor(room).config.version.id,'act1autochess');
 await policy.update({revision:1,items:[{id:'arknights-expansion-v1',public:true,versions:[]}]},f.users[0].accountId);assert.ok(f.lobby.startMatch(room).error);assert.equal(room.match,null);
});

test('hosts can apply every round extension and combine the 24-round package with existing packs',async t=>{
 for(const mode of ['solo','coop']){
  const f=await fixture(t),a=await socket(t,f);
  await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});
  assert.equal((await a.request({t:'room.create',mode,difficulty:'NORMAL'})).t,'ok');
  const room=[...f.lobby.rooms.values()][0],base=f.lobby.dataFor(room);
  const selections=[[20,[]],[24,[]],[30,[]],[24,['genius-trader-v1','shop-extra-slot','arknights-expansion-v1','rhodes-mujica-v1']]];
  for(const [total,extra]of selections){
   const ids=[`extended-rounds-${total}`,...extra];
   const result=await a.request({t:'room.setProductContent',version:room.version,revision:f.product.contentCatalog.doc.revision,ids});
   assert.equal(result.t,'ok',JSON.stringify(result));
   assert.deepEqual(room.productSelection,ids);
   const data=f.lobby.dataFor(room),id=`mode_${mode==='solo'?'single':'multi'}_normal`;
   assert.equal(data.config.modes[id].bossRound,total);
   assert.equal(data.config.modes[id].hiddenRound,total+1);
   const cyclops=data.config.modes.mode_cyclops,original=base.config.modes.mode_cyclops;
   for(const key of ['rounds','enemyScale','bossRound','hiddenRound','combatTimeLimit'])assert.deepEqual(cyclops[key],original[key],key);
   const response=await fetch(f.url+'/cs/'+room.content.cs.slice(0,16)+'/data/config.json',{headers:{'User-Agent':ua,Cookie:a.auth.cookie}});
   assert.equal(response.status,200);
   assert.equal((await response.json()).modes[id].bossRound,total);
   if(extra.length){assert.ok(data.lateInvestment);assert.ok(data.chess.chess_exp_aglna2_a);}
  }
 }
});

test('舟铲铲仅开放已适配的新内容包，并在数据合成与开局快照中保留逐包身份',async t=>{
 const f=await fixture(t),a=await socket(t,f);
 await a.request({t:'hello',name:'房主',version:PROTOCOL_VERSION});
 assert.equal((await a.request({t:'room.create',mode:'coop',difficulty:'NORMAL',variant:'entertainment_cyclops'})).t,'ok');
 const room=[...f.lobby.rooms.values()][0],revision=f.product.contentCatalog.doc.revision,originalVersion=room.version;
 assert.equal((await a.request({t:'room.setVersion',version:'act1autochess'})).t,'error');
 assert.equal(room.version,originalVersion,'舟铲铲房间不能切换到其他官方版本');
 const supported=['arknights-expansion-v1','rhodes-mujica-v1','kazdel-expansion-v1','higashi-expansion-v1','ursus-expansion-v1','iberia-expansion-v1'];
 const menu=await fetch(f.url+'/product/content?version='+encodeURIComponent(room.version)+'&mode=coop&difficulty=NORMAL&variant=entertainment_cyclops',{headers:{'User-Agent':ua,Cookie:a.auth.cookie}}).then(r=>r.json());
 for(const id of supported)assert.equal(menu.items.find(item=>item.id===id)?.enabled,true,id);
 for(const id of ['rhine-lab-v1','extended-rounds-20','genius-trader-v1','shop-extra-slot'])assert.equal(menu.items.find(item=>item.id===id)?.enabled,false,id);
 for(const id of supported){
  const result=await a.request({t:'room.setProductContent',version:room.version,revision,ids:[id]});
  assert.equal(result.t,'ok',id+': '+JSON.stringify(result));
  assert.deepEqual(f.lobby.dataFor(room).config.productContent.ids,[id]);
  assert.equal(f.lobby.dataFor(room).config.modes.mode_cyclops.lastRound,21,id+' leaves the isolated mode schedule intact');
 }
 const before=f.product.ranked.all('SELECT id FROM battle_records').length;
  assert.equal((await a.request({t:'room.contentReady',cs:room.content.cs,ok:true})).t,'ok');
 assert.equal((await a.request({t:'room.start'})).t,'ok');
 assert.ok(room.match);
 assert.equal(room.match.hosted,true);
 assert.equal(room.match.opts.variant,'entertainment_cyclops');
 assert.equal(room.productRules.variant,'entertainment_cyclops');
 assert.equal(room.productRecordId,undefined);
 assert.equal(f.product.ranked.all('SELECT id FROM battle_records').length,before);
});
