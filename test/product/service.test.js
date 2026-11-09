import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
import {productFixture,login} from './fixture.js';
const headers=(url,cookie)=>({Origin:url,Cookie:cookie,'Content-Type':'application/json'});
const wire=value=>JSON.parse(JSON.stringify(value));

test('candidate account service retains existing identities, hashes, sponsors, points, histories and audit across restart',async t=>{
  const f=await productFixture();t.after(()=>f.close());let s=await f.start();const bytes=await fs.readFile(f.authFile);
  const auth=await login(s.url,'member');assert.equal(auth.status,200);assert.equal(auth.body.sponsor,true);assert.equal(s.product.auth.users.get('member').accountId,f.users[1].accountId);
  const profile=await fetch(s.url+'/ranked/profile',{headers:{Cookie:auth.cookie}}).then(r=>r.json());assert.deepEqual(profile,wire(f.expected.profile));
  const records=await fetch(s.url+'/ranked/records',{headers:{Cookie:auth.cookie}}).then(r=>r.json());assert.deepEqual(records,wire(f.expected.records));
  assert.deepEqual(await fs.readFile(f.authFile),bytes);
  assert.deepEqual(s.product.ranked.all('SELECT * FROM audit'),f.expected.audit);
  await f.stop();s=await f.start();const again=await login(s.url,'member');assert.equal(again.status,200);assert.deepEqual(s.product.ranked.profile(f.users[1].accountId),f.expected.profile);assert.deepEqual(s.product.ranked.all('SELECT * FROM seasons'),f.expected.seasons);assert.deepEqual(await fs.readFile(f.authFile),bytes);
});
test('version admin endpoint requires real administrator session, origin and revision; persists without changing histories',async t=>{
  const f=await productFixture();t.after(()=>f.close());let s=await f.start();const member=await login(s.url,'member'),admin=await login(s.url);
  assert.equal((await fetch(s.url+'/auth/admin/game-versions')).status,401);
  assert.equal((await fetch(s.url+'/auth/admin/game-versions',{headers:{Cookie:member.cookie}})).status,403);
  const before=await fetch(s.url+'/auth/admin/game-versions',{headers:{Cookie:admin.cookie}}).then(r=>r.json());assert.equal(before.versions.length,4);assert.ok(before.versions.every(v=>v.available));
  const body={revision:before.revision,enabled:['act2autochess','act1autochess'],default:'act1autochess'};
  assert.equal((await fetch(s.url+'/auth/admin/game-versions',{method:'PUT',headers:{...headers(s.url,admin.cookie),Origin:'https://wrong.example'},body:JSON.stringify(body)})).status,403);
  const response=await fetch(s.url+'/auth/admin/game-versions',{method:'PUT',headers:headers(s.url,admin.cookie),body:JSON.stringify(body)});assert.equal(response.status,200);assert.equal((await response.json()).default,'act1autochess');
  assert.equal((await fetch(s.url+'/auth/admin/game-versions',{method:'PUT',headers:headers(s.url,admin.cookie),body:JSON.stringify(body)})).status,409);
  assert.deepEqual(s.product.ranked.profile(f.users[1].accountId),f.expected.profile);
  await f.stop();s=await f.start();assert.equal(s.product.versions.defaultId,'act1autochess');assert.equal(s.product.versions.permits('act2autochess@V2_1'),false);assert.deepEqual(s.product.ranked.records(f.users[1].accountId),f.expected.records);
});
test('disabled accounts cannot log in; sponsor changes keep identities, hashes and unknown fields',async t=>{
  const f=await productFixture();t.after(()=>f.close());const s=await f.start();assert.equal((await login(s.url,'disabled')).status,401);const a=await login(s.url);
  const response=await fetch(s.url+'/auth/admin/users/member',{method:'PATCH',headers:headers(s.url,a.cookie),body:JSON.stringify({sponsor:false})});assert.equal(response.status,200);
  const saved=JSON.parse(await fs.readFile(f.authFile,'utf8'));assert.deepEqual(saved.retainedExtension,{keep:true});const member=saved.users.find(u=>u.username==='member');assert.equal(member.accountId,f.users[1].accountId);assert.equal(member.passwordHash,f.users[1].passwordHash);assert.deepEqual(member.retainedExtension,{value:'member'});assert.equal(member.sponsor,false);
});
test('review host serves only account UI; native account management, game, installers and assets are unavailable',async t=>{
  const f=await productFixture();t.after(()=>f.close());const s=await f.start();assert.equal((await fetch(s.url+'/account')).status,200);
  for(const path of ['/index.html','/js/main.js','/assets/test.png','/fonts/fonts.css','/media/bgm/act1','/resource-packs/current.json','/downloads','/mobile/dist/test.apk','/p/example/a.png','/studio/'])assert.equal((await fetch(s.url+path)).status,404,path);
  const app={'User-Agent':'StrongholdProtocolApp/1'};assert.equal((await fetch(s.url+'/account',{headers:app})).status,403);
  const a=await login(s.url,'admin',app);assert.equal(a.status,200);assert.equal((await fetch(s.url+'/auth/admin/game-versions',{headers:{...app,Cookie:a.cookie}})).status,403);
});

test('creating a new account preserves every existing account identity, password hash and extension',async t=>{
  const f=await productFixture();t.after(()=>f.close());const s=await f.start(),a=await login(s.url);
  const response=await fetch(s.url+'/auth/admin/users',{method:'POST',headers:headers(s.url,a.cookie),body:JSON.stringify({username:'new-member',password:'new-fixture-pass',role:'user'})});assert.equal(response.status,201);
  const saved=JSON.parse(await fs.readFile(f.authFile,'utf8'));assert.equal(saved.users.length,4);assert.deepEqual(saved.retainedExtension,{keep:true});
  for(const old of f.users){const row=saved.users.find(u=>u.username===old.username);assert.equal(row.accountId,old.accountId);assert.equal(row.passwordHash,old.passwordHash);assert.deepEqual(row.retainedExtension,old.retainedExtension);}
  const added=saved.users.find(u=>u.username==='new-member');assert.match(added.accountId,/^[a-f0-9-]{36}$/);assert.equal(added.mustChangePassword,true);
  assert.deepEqual(s.product.ranked.profile(f.users[1].accountId),f.expected.profile);
});

test('password changes retain immutable identity, sponsor status and historical score ownership',async t=>{
  const f=await productFixture();t.after(()=>f.close());const s=await f.start(),member=await login(s.url,'member');
  const response=await fetch(s.url+'/auth/password',{method:'POST',headers:headers(s.url,member.cookie),body:JSON.stringify({currentPassword:'fixture-pass',newPassword:'changed-fixture-pass'})});assert.equal(response.status,200);
  assert.equal((await fetch(s.url+'/auth/session',{headers:{Cookie:member.cookie}}).then(r=>r.json())).authenticated,false);
  assert.equal((await login(s.url,'member')).status,401);
  const reauth=await fetch(s.url+'/auth/login',{method:'POST',headers:headers(s.url,''),body:JSON.stringify({username:'member',password:'changed-fixture-pass'})});assert.equal(reauth.status,200);
  const saved=JSON.parse(await fs.readFile(f.authFile,'utf8')).users.find(u=>u.username==='member');assert.equal(saved.accountId,f.users[1].accountId);assert.equal(saved.sponsor,true);assert.notEqual(saved.passwordHash,f.users[1].passwordHash);assert.deepEqual(saved.retainedExtension,f.users[1].retainedExtension);assert.deepEqual(s.product.ranked.profile(saved.accountId),f.expected.profile);
});

test('an unknown saved version-policy format refuses startup before changing account or database files',async t=>{
  const f=await productFixture();t.after(()=>f.close());const policy=path.join(f.state,'official-versions.json'),db=path.join(f.state,'ranked.sqlite');
  await fs.writeFile(policy,JSON.stringify({format:999}));const digest=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');const before={accounts:await digest(f.authFile),db:await digest(db),policy:await digest(policy)};
  await assert.rejects(f.start(),/版本设置格式未知/);assert.equal(await digest(f.authFile),before.accounts);assert.equal(await digest(db),before.db);assert.equal(await digest(policy),before.policy);
});
