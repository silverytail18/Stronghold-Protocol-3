import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {ProductContentCatalog} from '../../server/product/content-catalog.js';
import {productFixture,login} from './fixture.js';
test('ready catalog preserves legacy settings and stable IDs with period restrictions',async t=>{
 const f=await productFixture();t.after(()=>f.close());const file=path.join(f.state,'test-content-access.json'),bytes=JSON.stringify({format:1,revision:12,publicIds:['rhine-lab-v1','unknown-future'],future:{keep:true}});await fs.writeFile(file,bytes);
 const catalog=await ProductContentCatalog.load(f.state),view=catalog.view({admin:true});assert.equal(view.items.length,16);assert.ok(view.items.every(item=>item.status==='ready'&&item.enabled));assert.ok(view.items.some(item=>item.id==='iberia-expansion-v1'));assert.ok(!view.items.some(item=>item.id==='iberia-tide'));
 assert.deepEqual(view.retired,['iberia']);const snapshot=catalog.freeze('act2autochess');assert.ok(Object.isFrozen(snapshot)&&Object.isFrozen(snapshot.custom));assert.deepEqual(snapshot.custom,[]);view.items[0].enabled=false;assert.equal(catalog.view({admin:true}).items[0].enabled,true);assert.ok(catalog.view({version:'act1autochess',admin:true}).items.every(item=>!item.enabled));
 const admin=await catalog.adminView();assert.equal(admin.preserved.find(row=>row.file==='test-content-access.json').present,true);assert.equal(await fs.readFile(file,'utf8'),bytes);
 const s=await f.start(),a=await login(s.url),b=await login(s.url,'member');assert.equal((await fetch(s.url+'/auth/admin/content-status',{headers:{Cookie:b.cookie}})).status,403);assert.equal((await fetch(s.url+'/auth/admin/content-status',{headers:{Cookie:a.cookie}})).status,200);assert.equal((await fetch(s.url+'/auth/admin/content-status',{method:'PUT',headers:{Origin:s.url,Cookie:a.cookie}})).status,415);assert.equal(await fs.readFile(file,'utf8'),bytes);
});
