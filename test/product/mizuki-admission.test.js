import test from 'node:test';import assert from 'node:assert/strict';
import {createMatchHosts} from '../../server/match/host/index.js';
import {MizukiHosts} from '../../server/product/mizuki/hosts.js';
import {startProductServer} from '../../server/product/game-server.js';
import {productFixture,login} from './fixture.js';

test('all hosted mode pools refuse a new worker when other pools consume the capacity',t=>{
 for(const kind of ['plugin','version']){const pool=createMatchHosts({contents:new Map(),options:{maxWorkers:1,kind}});t.after(()=>pool.close());pool.setExternalWorkers(()=>1);assert.throws(()=>pool.create('fixture',{}),/busy|limit/);assert.equal(pool.stats().workers,0);}
 const mizuki=new MizukiHosts({store:{},maxWorkers:1,otherWorkers:()=>1});t.after(()=>mizuki.close());assert.throws(()=>mizuki.create({}),/容量已满/);assert.equal(mizuki.hosts.size,0);
});
test('Mizuki admin diagnosis is read-only, browser-only and restricted to administrators',async t=>{
 const f=await productFixture();const server=await startProductServer({root:f.project,env:f.env,port:0,host:'127.0.0.1',log:{info(){},debug(){},warn(){},error(){}}});t.after(async()=>{await server.close();await f.close();});
 const url=server.url,admin=await login(url),member=await login(url,'member');
 const query=(cookie,options={})=>fetch(url+'/auth/admin/mizuki-status',{...options,headers:{Cookie:cookie,...options.headers}});
 assert.equal((await query(member.cookie)).status,403,'member forbidden');const allowed=await query(admin.cookie);assert.equal(allowed.status,200,await allowed.clone().text());const doc=await allowed.json();assert.equal(doc.schema,1);assert.deepEqual(doc.runs,[]);assert.equal(doc.resourceReady,server.product.mizukiResourceReady);
 assert.equal((await query(admin.cookie,{method:'POST'})).status,405);assert.equal((await query(admin.cookie,{headers:{'User-Agent':'StrongholdProtocolApp/2 Resources/'+ '1'.repeat(64)+' ClientLine/1.0 Build/48 Epoch/1'}})).status,403);
 const module=await fetch(url+'/product/mizuki-admin.js');assert.equal(module.status,200);assert.match(await module.text(),/renderMizukiAdmin/);
});

