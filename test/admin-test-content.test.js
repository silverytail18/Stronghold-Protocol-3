import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT} from '../server/index.js';
import {TestContentAccess} from '../server/test-content-access.js';
import {startServer} from '../server/index.js';
import {hashPassword} from '../server/auth.js';
import {TestContent} from '../server/test-content.js';
import {validateC2S} from '../shared/protocol.js';
import {TestClient} from './helpers/wsClient.js';

let passwordHash;const password='admin-test-content-password';before(async()=>{passwordHash=await hashPassword(password);});
class StartedMatch{
  constructor(opts){this.opts=opts;this.testRules=opts.testRules;this.players=new Map(opts.seats.map(s=>[s.playerId,{...s,alive:true}]));}
  start(){this.opts.broadcast({t:'m.public',phase:'INFO_CHECK',round:0,...(this.opts.testRules?{testRules:this.opts.testRules}:{})});}
  handle(){return{ok:true};}onReconnect(){}onDisconnect(){}onLeave(){}dispose(){}
}
async function fixture(t,{ranked=true,content}={}){
  const users=['admin','member','other'].map((username,i)=>({username,passwordHash,accountId:randomUUID(),role:i===0?'admin':'user',mustChangePassword:false}));
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,MatchClass:StartedMatch,auth:{secureCookie:false,users:{version:1,users}},ranked:ranked?{filename:':memory:'}:false});
  if(content)srv.lobby.testContent=content;const clients=[];
  t.after(async()=>{for(const client of clients)await client.close();await srv.close();});
  const connect=async(name,testContentVersion=1)=>{const login=await fetch(srv.url+'/auth/login',{method:'POST',headers:{Origin:srv.url,'Content-Type':'application/json','User-Agent':'StrongholdProtocolApp/1'},body:JSON.stringify({username:name,password})});const cookie=login.headers.get('set-cookie').split(';')[0];await login.arrayBuffer();const c=await TestClient.connect(srv.url.replace('http','ws')+'/ws',{wsOptions:{headers:{Cookie:cookie,Origin:srv.url}}});clients.push(c);c.id=(await c.hello(name,undefined,{testContentVersion})).playerId;return c;};
  const create=async(c,mode='solo',difficulty='NORMAL',rank=false)=>{assert.equal((await c.request({t:'room.create',mode,difficulty,ranked:rank})).t,'ok');return c.waitFor('room.state');};
  const api=async(username,method='GET',body,extra={})=>{
    const login=await fetch(srv.url+'/auth/login',{method:'POST',headers:{Origin:srv.url,'Content-Type':'application/json'},body:JSON.stringify({username,password})});const cookie=login.headers.get('set-cookie').split(';')[0];await login.arrayBuffer();
    const response=await fetch(srv.url+'/auth/admin/test-content',{method,headers:{Cookie:cookie,Origin:srv.url,'Content-Type':'application/json',...extra},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()};
  };
  return{srv,users,connect,create,api};
}
const activeContent=()=>new TestContent([
  {id:'fixture-a',name:'测试 A',version:'1',status:'ready',difficulties:['NORMAL','HARD','ABYSS'],apply:data=>{data.__testFixture={a:true};}},
  {id:'fixture-b',name:'测试 B',version:'1',status:'ready',apply:data=>{data.__testFixture.b=true;},requires:['fixture-a']},
]);

test('Kazdel defaults private, publication requires current capability 28 on every member and leaves formal data intact',async t=>{
  const f=await fixture(t),a=await f.connect('admin', 28),b=await f.connect('member', 28),c=await f.connect('other',20);
  const settings=(await f.api('admin')).body;
  assert.equal(settings.items.find(i=>i.id==='kazdel-expansion-v1').public,false);
  const initial=await f.create(b,'coop','HARD',true);assert.deepEqual(initial.testMenu.items,[]);
  const opened=await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:['kazdel-expansion-v1']});assert.equal(opened.status,200);
  const state=await b.waitFor('room.state',s=>s.testMenu?.items.some(i=>i.id==='kazdel-expansion-v1'));
  await c.request({t:'room.join',code:state.code});await c.request({t:'room.ready',ready:true});
  const start={t:'room.start',tests:{version:state.testMenu.version,ids:['kazdel-expansion-v1']}};
  assert.equal((await b.request(start)).t,'error');assert.equal(f.srv.ranked.one('SELECT count(*) n FROM matches').n,0);
  await c.hello('other',undefined,{testContentVersion: 28});assert.equal((await b.request(start)).t,'ok');
  const match=f.srv.lobby.rooms.get(initial.code).match;
  assert.equal(match.opts.data.bonds.kazdelShip.visibleMembers.length,11);assert.ok(match.opts.data.chess.chess_kz_meteo_a);
  assert.equal(f.srv.lobby.safeData().bonds.kazdelShip,undefined);assert.equal(f.srv.lobby.safeData().chess.chess_kz_meteo_a,undefined);
  assert.deepEqual((await b.waitFor('m.public')).testRules,(await c.waitFor('m.public')).testRules);
  assert.equal((await c.request({t:'hello',name:'other',version:1,testContentVersion:20})).t,'error');
});
test('Rhine defaults private, capability 32 is required for every member, and only the selected match receives the overlay',async t=>{
 const f=await fixture(t),host=await f.connect('member',32),member=await f.connect('other',31);
 const settings=(await f.api('admin')).body;assert.equal(settings.items.find(i=>i.id==='rhine-lab-v1').public,false);
 const initial=await f.create(host,'coop','HARD');assert.deepEqual(initial.testMenu.items,[]);
 assert.equal((await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:['rhine-lab-v1']})).status,200);
 const state=await host.waitFor('room.state',s=>s.testMenu.items.some(i=>i.id==='rhine-lab-v1'));
 await member.request({t:'room.join',code:state.code});await member.request({t:'room.ready',ready:true});
 const start={t:'room.start',tests:{version:state.testMenu.version,ids:['rhine-lab-v1']}};assert.equal((await host.request(start)).t,'error');assert.equal(f.srv.lobby.rooms.get(state.code).match,null);
 await member.hello('other',undefined,{testContentVersion:32});assert.equal((await host.request(start)).t,'ok');
 const match=f.srv.lobby.rooms.get(state.code).match;assert.equal(match.opts.testRules.clientVersion,32);assert.ok(match.opts.data.bonds.rhineShip);assert.ok(!f.srv.lobby.safeData().bonds.rhineShip);assert.ok(!f.srv.lobby.safeData().chess.chess_rhine_otter_a);
 assert.deepEqual((await host.waitFor('m.public')).testRules,(await member.waitFor('m.public')).testRules);
 assert.equal((await member.request({t:'hello',name:'other',version:1,testContentVersion:31})).t,'error');
});

test('real catalog enables round/shop tests, rejects conflicts before records, and empty choice is baseline',async t=>{
  const f=await fixture(t),a=await f.connect('admin'),state=await f.create(a);assert.ok(state.testMenu);assert.equal(state.testMenu.items.length,new TestContent().entries.length);assert.equal(state.testMenu.items.filter(i=>i.enabled).length,10);
  const reply=await a.request({t:'room.start',tests:{version:state.testMenu.version,ids:['extended-rounds-20','extended-rounds-24']}});assert.equal(reply.t,'error');assert.equal([...f.srv.lobby.rooms.values()][0].match,null);assert.equal(f.srv.ranked.one('SELECT count(*) n FROM battle_records').n,0);
  assert.equal((await a.request({t:'room.start',tests:{version:state.testMenu.version,ids:[]}})).t,'ok');const match=[...f.srv.lobby.rooms.values()][0].match;assert.equal(match.opts.testRules,undefined);
});

test('confirmation-order test defaults private, can be opened to a normal coop host, and never edits accounts or baseline',async t=>{
  const id='strategy-confirm-order',f=await fixture(t),host=await f.connect('member'),member=await f.connect('other'),state=await f.create(host,'coop');
  assert.deepEqual(state.testMenu.items,[]);const usersBefore=JSON.stringify([...f.srv.auth.users.values()]),settings=(await f.api('admin')).body;
  assert.equal(settings.items.find(e=>e.id===id).public,false);
  assert.equal((await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:[id]})).status,200);
  const opened=await host.waitFor('room.state',s=>s.testMenu?.items.some(e=>e.id===id));assert.equal(opened.testMenu.items[0].enabled,true);
  assert.equal((await member.request({t:'room.join',code:state.code})).t,'ok');assert.equal((await member.request({t:'room.ready',ready:true})).t,'ok');
  const tests={version:opened.testMenu.version,ids:[id]};assert.equal((await member.request({t:'room.start',tests})).t,'error');
  assert.equal((await host.request({t:'room.start',tests})).t,'ok');const match=f.srv.lobby.rooms.get(state.code).match;
  assert.equal(match.opts.data.config.bandDraft.confirmationOrder,true);assert.deepEqual(match.testRules.batches.map(b=>b.id),[id]);
  assert.equal(JSON.stringify([...f.srv.auth.users.values()]),usersBefore);
});
test('ordinary members receive an empty default menu and cannot inherit private admin choices',async t=>{
  const f=await fixture(t,{content:activeContent()}),a=await f.connect('admin'),b=await f.connect('member'),state=await f.create(a,'coop');await b.request({t:'room.join',code:state.code});const memberState=await b.waitFor('room.state');assert.deepEqual(memberState.testMenu.items,[]);
  await a.request({t:'room.leave'});await b.waitFor('room.state',s=>s.hostId===b.id);const room=[...f.srv.lobby.rooms.values()][0];
  assert.equal((await b.request({t:'room.start',tests:{version:state.testMenu.version,ids:['fixture-a']}})).code,'BAD_MSG');assert.equal(room.match,null);
  assert.equal((await b.request({t:'room.start'})).t,'ok');assert.equal(room.match.opts.testRules,undefined);assert.equal(room.match.opts.data.__testFixture,undefined);
});
test('admin member cannot start another host room even with a valid test catalog',async t=>{
  const f=await fixture(t),b=await f.connect('member'),a=await f.connect('admin'),state=await f.create(b,'coop');await a.request({t:'room.join',code:state.code});const own=await a.waitFor('room.state');assert.ok(own.testMenu);assert.equal(own.hostId,b.id);
  assert.equal((await a.request({t:'room.start',tests:{version:own.testMenu.version,ids:[]}})).code,'NOT_HOST');assert.equal([...f.srv.lobby.rooms.values()][0].match,null);
});
test('ordinary host with an admin member can start a normal game after that member is ready',async t=>{
  const f=await fixture(t),b=await f.connect('member'),a=await f.connect('admin'),state=await f.create(b,'coop');await a.request({t:'room.join',code:state.code});await a.request({t:'room.ready',ready:true});
  assert.equal((await b.request({t:'room.start'})).t,'ok');const match=[...f.srv.lobby.rooms.values()][0].match;assert.ok(match);assert.equal(match.opts.testRules,undefined);assert.equal(match.opts.data.__testFixture,undefined);
});
test('admin multi-select applies only on start, clones rules for one match and sends the same manifest to all members',async t=>{
  const content=activeContent(),f=await fixture(t,{content}),a=await f.connect('admin'),b=await f.connect('member'),state=await f.create(a,'coop', 'NORMAL',true);await b.request({t:'room.join',code:state.code});
  assert.equal((await a.request({t:'room.start',tests:{version:content.version,ids:['fixture-a','fixture-b']}})).code,'NOT_READY');assert.equal(f.srv.lobby.safeData().__testFixture,undefined);assert.equal(f.srv.ranked.one('SELECT count(*) n FROM matches').n,0);
  await b.request({t:'room.ready',ready:true});assert.equal((await a.request({t:'room.start',tests:{version:content.version,ids:['fixture-a','fixture-b']}})).t,'ok');
  const room=[...f.srv.lobby.rooms.values()][0];assert.deepEqual(room.match.opts.data.__testFixture,{a:true,b:true});assert.equal(f.srv.lobby.safeData().__testFixture,undefined);assert.equal(room.match.opts.ranked,true);
  const left=await a.waitFor('m.public'),right=await b.waitFor('m.public');assert.deepEqual(left.testRules,right.testRules);assert.equal(left.testRules.batches.length,2);
});
test('revoked admin permission and changed catalog are rechecked before any match is created',async t=>{
  const content=activeContent(),f=await fixture(t,{content}),a=await f.connect('admin'),state=await f.create(a);const msg={t:'room.start',tests:{version:state.testMenu.version,ids:['fixture-a']}};
  f.srv.lobby.testContent=new TestContent([]);assert.equal((await a.request(msg)).t,'error');f.srv.lobby.testContent=content;
  const user=f.srv.auth.users.get('admin');f.srv.auth.users.set('admin',{...user,role:'user'});assert.equal((await a.request(msg)).t,'error');assert.equal([...f.srv.lobby.rooms.values()][0].match,null);assert.equal(f.srv.ranked.one('SELECT count(*) n FROM battle_records').n,0);
});
test('admin test menu works when ranked service is disabled; standard simulation rejects incompatible tests',async t=>{
  const content=activeContent(),f=await fixture(t,{ranked:false,content}),a=await f.connect('admin'),state=await f.create(a,'solo','FUNNY');assert.ok(state.testMenu);assert.equal(state.testMenu.items[0].enabled,false);
  assert.equal((await a.request({t:'room.start',tests:{version:content.version,ids:['fixture-a']}})).t,'error');assert.equal((await a.request({t:'room.start'})).t,'ok');
});
test('selection rejects unknown, duplicate, unsupported, conflicting or dependency-incomplete batches',()=>{
  const content=new TestContent([{id:'a',name:'A',version:'1',status:'ready',apply:d=>{d.a=1;},conflicts:['c']},{id:'b',name:'B',version:'1',status:'ready',requires:['a'],apply:d=>{d.b=d.a+1;}},{id:'c',name:'C',version:'1',status:'ready',apply:()=>{}}]);
  for(const ids of [['unknown'],['a','a'],['b'],['a','c']])assert.throws(()=>content.resolve({version:content.version,ids},{difficulty:'NORMAL'},{base:true}));
  const source={base:true};assert.equal(content.resolve({version:content.version,ids:[]},{},source).data,source);assert.deepEqual(content.resolve({version:content.version,ids:['b','a']},{},source).data,{base:true,a:1,b:2});assert.deepEqual(source,{base:true});
  assert.ok(validateC2S({t:'room.start',tests:{version:content.version,ids:['a','a']}}));assert.ok(validateC2S({t:'room.start',tests:{version:content.version,ids:Array(17).fill('a')}}));assert.equal(validateC2S({t:'room.start'}),null);
});

for (const total of [20,24,30]) test(`production ${total}-round plus shop and pool tests start one ranked match for the whole team`,async t=>{
  const f=await fixture(t),a=await f.connect('admin'),b=await f.connect('member');
  const state=await f.create(a,'coop','HARD',true);await b.request({t:'room.join',code:state.code});await b.request({t:'room.ready',ready:true});
  const ids=[`extended-rounds-${total}`,'shop-extra-slot','coop-pool-150'];
  assert.equal((await a.request({t:'room.start',tests:{version:state.testMenu.version,ids}})).t,'ok');
  const room=[...f.srv.lobby.rooms.values()][0],opts=room.match.opts,mode=opts.data.config.modes.mode_multi_hard;
  assert.equal(mode.bossRound,total);assert.equal(mode.hiddenRound,total+1);assert.equal(mode.shopSlots[6].chess,6);assert.equal(opts.data.config.economy.poolCopies[6],8);
  assert.equal(opts.ranked,true);assert.equal(opts.clientCombat,true);assert.equal(opts.testRules.batches.length,3);
  assert.deepEqual((await a.waitFor('m.public')).testRules,(await b.waitFor('m.public')).testRules);
  assert.equal(f.srv.lobby.safeData().config.modes.mode_multi_hard.bossRound,14);
  assert.equal(f.srv.lobby.safeData().config.economy.poolCopies[6],5);
  assert.equal(f.srv.ranked.one('SELECT count(*) n FROM matches').n,1);
});

for(const total of [20,24,30])test(`${total}: old client capabilities prevent test start without records, and cannot downgrade a running test session`,async t=>{
  const f=await fixture(t),a=await f.connect('admin'),b=await f.connect('member',0),state=await f.create(a,'coop');
  await b.request({t:'room.join',code:state.code});await b.request({t:'room.ready',ready:true});
  const start={t:'room.start',tests:{version:state.testMenu.version,ids:[`extended-rounds-${total}`]}};
  assert.equal((await a.request(start)).t,'error');assert.equal(f.srv.ranked.one('SELECT count(*) n FROM battle_records').n,0);
  await b.hello('member',undefined,{testContentVersion:1});assert.equal((await a.request(start)).t,'ok');
  assert.equal((await b.request({t:'hello',name:'member',version:1,testContentVersion:0})).t,'error');
  assert.equal(f.srv.registry.byId(b.id).testContentVersion,1);
});

test('standard multiplayer allows experience tests but rejects extensions; solo rejects the coop pool',async t=>{
  const f=await fixture(t),a=await f.connect('admin'),state=await f.create(a,'coop','FUNNY');
  assert.deepEqual(state.testMenu.items.filter(i=>i.enabled).map(i=>i.id),['shop-extra-slot','coop-pool-150','strategy-confirm-order','arknights-expansion-v1','rhodes-mujica-v1','kazdel-expansion-v1','rhine-lab-v1']);
  assert.equal((await a.request({t:'room.start',tests:{version:state.testMenu.version,ids:['extended-rounds-20']}})).t,'error');
  assert.equal((await a.request({t:'room.start',tests:{version:state.testMenu.version,ids:['shop-extra-slot','coop-pool-150']}})).t,'ok');
  const content=new TestContent();assert.throws(()=>content.resolve({version:content.version,ids:['coop-pool-150']},{mode:'solo',difficulty:'NORMAL'},{}));
});

test('admin browser controls public tests, refuses user/app/cross-origin/stale requests, and ordinary solo host starts an open test',async t=>{
  const f=await fixture(t),a=await f.connect('admin'),b=await f.connect('member'),state=await f.create(b);
  assert.deepEqual(state.testMenu.items,[]);
  const usersBefore=JSON.stringify([...f.srv.auth.users.values()]);
  const settings=(await f.api('admin')).body;
  assert.equal(settings.items.length,new TestContent().entries.length);assert.ok(settings.items.every(i=>!i.public));
  assert.equal((await f.api('member')).status,403);
  assert.equal((await f.api('admin','GET',null,{'User-Agent':'StrongholdProtocolApp/1'})).status,403);
  const open={revision:settings.revision,catalog:settings.catalog,publicIds:['shop-extra-slot']};
  assert.equal((await f.api('admin','PUT',open,{Origin:'https://untrusted.invalid'})).status,403);
  assert.equal((await f.api('admin','PUT',{...open,publicIds:['unknown']})).status,400);
  assert.equal((await f.api('admin','PUT',open)).status,200);
  const updated=await b.waitFor('room.state',s=>s.testMenu?.items.length===1);
  assert.deepEqual(updated.testMenu.items.map(i=>i.id),['shop-extra-slot']);assert.notEqual(updated.testMenu.version,state.testMenu.version);
  assert.equal((await f.api('admin','PUT',open)).status,409);
  assert.equal((await b.request({t:'room.start',tests:{version:updated.testMenu.version,ids:['extended-rounds-20']}})).t,'error');
  assert.equal(f.srv.ranked.one('SELECT count(*) n FROM battle_records').n,0);
  assert.equal((await b.request({t:'room.start',tests:{version:updated.testMenu.version,ids:['shop-extra-slot']}})).t,'ok');
  const match=f.srv.lobby.rooms.get(state.code).match;
  assert.deepEqual(match.testRules.batches.map(i=>i.id),['shop-extra-slot']);
  assert.equal(match.opts.data.config.modes.mode_single_normal.shopSlots['1'].chess,4);
  assert.equal(JSON.stringify([...f.srv.auth.users.values()]),usersBefore);
  // Private tests remain visible and selectable by an administrator.
  const adminRoom=await f.create(a);assert.equal(adminRoom.testMenu.items.length,new TestContent().entries.length);
  assert.equal((await a.request({t:'room.start',tests:{version:adminRoom.testMenu.version,ids:['extended-rounds-24']}})).t,'ok');
});

test('ordinary co-op host selects open tests for all members; closing policy rejects stale/forged requests and preserves active matches',async t=>{
  const f=await fixture(t),a=await f.connect('admin'),b=await f.connect('member'),c=await f.connect('other');
  let settings=(await f.api('admin')).body;
  settings=(await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:['extended-rounds-20','shop-extra-slot','coop-pool-150']})).body;
  const state=await f.create(b,'coop','ABYSS',true);await c.request({t:'room.join',code:state.code});const member=await c.waitFor('room.state');
  const start={t:'room.start',tests:{version:state.testMenu.version,ids:state.testMenu.items.map(i=>i.id)}};
  assert.equal((await c.request(start)).code,'NOT_HOST');
  assert.equal((await b.request(start)).code,'NOT_READY');
  await c.request({t:'room.ready',ready:true});assert.equal((await b.request(start)).t,'ok');
  const left=await b.waitFor('m.public'),right=await c.waitFor('m.public');assert.deepEqual(left.testRules,right.testRules);
  const match=f.srv.lobby.rooms.get(state.code).match;assert.equal(match.opts.data.config.modes.mode_multi_abyss.bossRound,20);
  settings=(await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:[]})).body;
  assert.equal(match.testRules.fingerprint,left.testRules.fingerprint);assert.equal(match.opts.data.config.modes.mode_multi_abyss.bossRound,20);
  const ordinaryAccess={admin:false,publicIds:[],revision:settings.revision};
  const current=f.srv.lobby.testContent.menu({difficulty:'ABYSS',mode:'coop'},ordinaryAccess);
  assert.throws(()=>f.srv.lobby.testContent.resolve(start.tests,{difficulty:'ABYSS',mode:'coop'},f.srv.lobby.safeData(),ordinaryAccess));
  assert.throws(()=>f.srv.lobby.testContent.resolve({version:current.version,ids:['extended-rounds-20']},{difficulty:'ABYSS',mode:'coop'},f.srv.lobby.safeData(),ordinaryAccess));
  assert.equal(f.srv.lobby.testContent.resolve({version:current.version,ids:[]},{},f.srv.lobby.safeData(),ordinaryAccess).manifest,null);
});

test('closing public access refreshes waiting rooms and denies stale and forged starts before records; empty selection stays formal',async t=>{
  const f=await fixture(t),b=await f.connect('member');let settings=(await f.api('admin')).body;
  settings=(await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:['extended-rounds-20']})).body;
  const before=await f.create(b);
  assert.equal(before.testMenu.items[0].id,'extended-rounds-20');
  await f.api('admin','PUT',{revision:settings.revision,catalog:settings.catalog,publicIds:[]});
  const after=await b.waitFor('room.state',s=>s.testMenu?.items.length===0);
  assert.notEqual(before.testMenu.version,after.testMenu.version);
  for(const version of [before.testMenu.version,after.testMenu.version,f.srv.lobby.testContent.version])assert.equal((await b.request({t:'room.start',tests:{version,ids:['extended-rounds-20']}})).t,'error');
  assert.equal(f.srv.ranked.one('SELECT count(*) n FROM battle_records').n,0);
  assert.equal((await b.request({t:'room.start',tests:{version:after.testMenu.version,ids:[]}})).t,'ok');
  assert.equal(f.srv.lobby.rooms.get(before.code).match.testRules,undefined);
});

test('public settings persist independently, reject malformed files, serialize concurrent edits and preserve unknown IDs until explicit save',async t=>{
  const dir=await fs.mkdtemp(path.join(ROOT,'.cache','test-access-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const filename=path.join(dir,'test-content-access.json'),content=new TestContent();
  const store=await TestContentAccess.load(filename);assert.equal(store.revision,0);await assert.rejects(fs.access(filename));
  const body={revision:0,catalog:content.version,publicIds:['extended-rounds-20','extended-rounds-24']};
  const updates=await Promise.allSettled([store.update(body,content),store.update({...body,publicIds:[]},content)]);
  assert.equal(updates.filter(r=>r.status==='fulfilled').length,1);assert.equal(updates.find(r=>r.status==='rejected').reason.status,409);
  const restarted=await TestContentAccess.load(filename);assert.deepEqual(restarted.publicIds,body.publicIds);assert.equal(restarted.revision,1);
  for(const total of [20,24])assert.equal(content.entries.find(e=>e.id===`extended-rounds-${total}`).version,'test-2');
  assert.equal(content.entries.find(e=>e.id==='extended-rounds-30').version,'test-1');
  const access={admin:false,publicIds:restarted.publicIds,revision:restarted.revision};
  assert.deepEqual(content.menu({mode:'coop',difficulty:'NORMAL'},access).items.map(e=>e.id),body.publicIds);
  const previous=new TestContent(content.entries.map(e=>e.id.startsWith('extended-rounds-')?{...e,version:'test-1'}:e));
  assert.throws(()=>content.resolve({version:previous.menu({mode:'coop',difficulty:'NORMAL'},access).version,ids:['extended-rounds-20']},{mode:'coop',difficulty:'NORMAL'},{},access),/清单已变化/);
  const server=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false,testContentAccessFile:filename});t.after(()=>server.close());
  assert.deepEqual(server.lobby.testContentAccess.publicIds,body.publicIds);assert.equal(server.lobby.testContentAccess.revision,1);await server.close();
  const before=await fs.readFile(filename);await assert.rejects(restarted.update({revision:1,catalog:content.version,publicIds:[]},content,()=>{throw new Error('revoked');}));assert.deepEqual(await fs.readFile(filename),before);
  await fs.writeFile(filename,JSON.stringify({format:99,revision:1,publicIds:[]}));await assert.rejects(TestContentAccess.load(filename),/格式无效/);
  await fs.writeFile(filename,JSON.stringify({format:1,revision:2,publicIds:['retired-test']}));const old=await TestContentAccess.load(filename);assert.deepEqual(old.publicIds,['retired-test']);assert.deepEqual(content.menu({},{admin:false,publicIds:old.publicIds,revision:old.revision}).items,[]);
  await assert.rejects(TestContentAccess.load(filename,[dir]),/私有/);
  const blocked=path.join(dir,'blocked');await fs.mkdir(blocked);const unwritable=new TestContentAccess({filename:blocked});
  await assert.rejects(unwritable.update(body,content));assert.equal(unwritable.revision,0);assert.deepEqual(unwritable.publicIds,[]);
  const deps=activeContent(),memory=new TestContentAccess();await assert.rejects(memory.update({revision:0,catalog:deps.version,publicIds:['fixture-b']},deps),/依赖/);
});
