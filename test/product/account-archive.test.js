import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {AccountArchive} from '../../server/product/account-archive.js';
import {productFixture,login} from './fixture.js';
import {startAccountServer} from '../../server/product/account-server.js';

test('account achievements persist isolated imports and idempotent authority settlements without changing existing files',async t=>{
  const f=await productFixture();t.after(()=>f.close());const archive=await AccountArchive.load(f.state);
  const a=f.users[0].accountId,b=f.users[1].accountId;
  const rec={v:3,id:'legacy-record',selfId:'p_a',players:[{playerId:'p_a'}],t:1,end:'settled'};
  await archive.importAchievements(a,{accountId:a,revision:0,records:[rec]});
  assert.equal(archive.achievements(b).records.length,0);
  const args={id:'trusted-match',accounts:new Map([['p_b',b]]),summary:{players:[{playerId:'p_b'}],victory:true},version:'act2autochess',mode:'coop'};
  await archive.recordSettlement(args);await archive.recordSettlement(args);
  const reload=await AccountArchive.load(f.state);assert.equal(reload.achievements(a).records.length,1);assert.equal(reload.achievements(b).settlements.length,1);
  assert.throws(()=>reload.importAchievements(a,{accountId:b,revision:1,records:[]}),/账号已切换/);
  await assert.rejects(reload.importAchievements(a,{accountId:a,revision:0,records:[]}),/另一设备/);
  assert.throws(()=>reload.importAchievements(a,{accountId:a,revision:1,records:[],clear:true}),{status:403});await reload.clearStatistics(a);assert.equal(reload.achievements(a).records.length,0);assert.ok(reload.achievements(a).clearedAt>0);
  const doc=JSON.parse(await fs.readFile(path.join(f.state,'account-archive.json'),'utf8'));doc.future={keep:true};await fs.writeFile(path.join(f.state,'account-archive.json'),JSON.stringify(doc));
  const future=await AccountArchive.load(f.state);await future.recordSettlement({...args,id:'second'});assert.deepEqual(future.doc.future,{keep:true});
});
test('authenticated feedback is private to browser administrators and safe text is stored for their inbox',async t=>{
  const f=await productFixture();const server=await startAccountServer({root:f.project,env:f.env});t.after(async()=>{await server.close();await f.close();});
  const admin=await login(server.url),member=await login(server.url,'member');
  const request=(url,method,cookie,body,origin=server.url)=>fetch(server.url+url,{method,headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  assert.equal((await request('/auth/admin/feedback','GET',member.cookie)).status,403);
  assert.equal((await request('/product/feedback','POST',member.cookie,{message:'A target problem',diagnostics:'version: 0.9.15'},'http://evil.invalid')).status,403);
  const sent=await request('/product/feedback','POST',member.cookie,{message:'<script>plain text</script>',diagnostics:'BAD_TARGET'});assert.equal(sent.status,201);const receipt=await sent.json();
  const list=await request('/auth/admin/feedback','GET',admin.cookie).then(r=>r.json());assert.equal(list.reports.length,1);assert.equal(list.reports[0].message,'<script>plain text</script>');assert.equal(list.reports[0].accountId,f.users[1].accountId);
  assert.equal((await request('/auth/admin/feedback','PATCH',admin.cookie,{id:receipt.id,status:'resolved'})).status,200);
  assert.equal(server.product.archive.doc.feedback[0].status,'resolved');
  assert.equal((await request('/product/achievements','GET',member.cookie)).status,200);
});
