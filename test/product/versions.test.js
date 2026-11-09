import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {OfficialVersionPolicy} from '../../server/product/version-policy.js';
import {VERSIONS} from '../../shared/versions.js';
const options={catalog:VERSIONS,initial:{enabled:VERSIONS.map(v=>v.id),default:'act2autochess'}};
const body=revision=>({revision,enabled:['act2autochess','act1autochess@V1_1'],default:'act1autochess@V1_1'});

test('uses exactly the four original-game versions of the pinned upstream registry',()=>{
  assert.deepEqual(VERSIONS.map(v=>v.label),['第二期下半','第二期上半','第一期下半','第一期上半']);
  const p=new OfficialVersionPolicy(options);assert.equal(p.view().versions.length,4);assert.equal(p.defaultId,'act2autochess');
  assert.equal(p.permits('software-0.9.13'),false);assert.equal(p.view().existingRooms,'keep-selected-version');
});
test('persists admin policy with audit, retains unknown fields and survives reload without rewriting',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-versions-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const filename=path.join(dir,'official-versions.json');
  const p=await OfficialVersionPolicy.load({...options,filename});await assert.rejects(fs.stat(filename),{code:'ENOENT'});
  const v=await p.update(body(0),'immutable-admin-id');assert.equal(v.revision,1);assert.equal(p.permits('act2autochess@V2_1'),false);assert.equal(p.permits('act1autochess@V1_1'),true);
  const d=JSON.parse(await fs.readFile(filename,'utf8'));d.futureSetting={preserve:true};await fs.writeFile(filename,JSON.stringify(d));
  const before=await fs.readFile(filename),reloaded=await OfficialVersionPolicy.load({...options,filename});assert.deepEqual(await fs.readFile(filename),before);
  await reloaded.update({...body(1),default:'act2autochess'},'admin-2');
  const saved=JSON.parse(await fs.readFile(filename,'utf8'));assert.deepEqual(saved.futureSetting,{preserve:true});assert.equal(saved.audit.length,2);assert.equal(saved.audit[0].actor,'immutable-admin-id');
});
for(const [name,patch] of [
  ['empty enabled list',{enabled:[]}],['unknown original version',{enabled:['unknown'],default:'unknown'}],
  ['disabled default',{default:'act2autochess@V2_1'}],['duplicate IDs',{enabled:['act2autochess','act2autochess'],default:'act2autochess'}],
  ['unrecognized request field',{extra:true}],['stale revision',{revision:99}],
])test('rejects '+name+' without changing current policy',async()=>{
  const p=new OfficialVersionPolicy(options),before=p.view();await assert.rejects(p.update({...body(0),...patch},'admin'));assert.deepEqual(p.view(),before);
});
test('only the first concurrent save at the same revision succeeds',async()=>{
  const p=new OfficialVersionPolicy(options),jobs=await Promise.allSettled([p.update(body(0),'admin-1'),p.update(body(0),'admin-2')]);
  assert.equal(jobs[0].status,'fulfilled');assert.equal(jobs[1].status,'rejected');assert.equal(jobs[1].reason.status,409);assert.equal(p.view().revision,1);
});
test('authorization is checked again at queued commit time',async()=>{
  const p=new OfficialVersionPolicy(options);let authorized=true;const queued=p.update(body(0),'admin',()=>{if(!authorized)throw Object.assign(Error('revoked'),{status:403});});authorized=false;
  await assert.rejects(queued,{status:403});assert.equal(p.view().revision,0);
});
test('unavailable version data cannot be enabled or made default',async()=>{
  const p=new OfficialVersionPolicy({...options,available:id=>id!=='act1autochess@V1_1'});await assert.rejects(p.update(body(0),'admin'),{status:409});assert.equal(p.view().revision,0);
});
test('unknown saved policy format is rejected instead of reset',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-versions-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const filename=path.join(dir,'official-versions.json'),bytes=JSON.stringify({format:900,enabled:[]});await fs.writeFile(filename,bytes);
  await assert.rejects(OfficialVersionPolicy.load({...options,filename}),/格式未知/);assert.equal(await fs.readFile(filename,'utf8'),bytes);
});
