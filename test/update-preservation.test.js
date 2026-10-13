import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {ROOT,startServer} from '../server/index.js';
import {hashPassword} from '../server/auth.js';
import {updateProject} from '../tools/update-project.mjs';

async function fixture(t) {
  const dir=await fs.mkdtemp(path.join(ROOT,'.cache','update-preservation-'));
  const source=path.join(dir,'release'),target=path.join(dir,'installed');
  for(const location of [source,target])await fs.mkdir(path.join(location,'config'),{recursive:true});
  await fs.writeFile(path.join(source,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:'0.2.3'}));
  await fs.writeFile(path.join(target,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:'0.2.2'}));
  await fs.mkdir(path.join(source,'server'),{recursive:true});await fs.writeFile(path.join(source,'server','release-marker.js'),'export const updated=true;');
  return{dir,source,target};
}
test('updating source preserves account identities/passwords/permissions, season, score, history, config and signing keys across restart',async t=>{
  const {source,target,dir}=await fixture(t),accountId=randomUUID(),disabledId=randomUUID();
  const passwordHash=await hashPassword('keep123');
  const user={username:'keeper',accountId,passwordHash,role:'admin',disabled:false,mustChangePassword:false};
  const users={version:1,users:[user,{...user,username:'disabled',accountId:disabledId,role:'user',disabled:true}]};
  const usersFile=path.join(target,'config','auth-users.json'),database=path.join(target,'config','ranked.sqlite');
  await fs.writeFile(usersFile,JSON.stringify(users));await fs.writeFile(path.join(target,'config','server.env'),'PORT=3456\nSP_AUTH_COOKIE_SECURE=0\n');
  await fs.mkdir(path.join(target,'mobile','android','.signing'),{recursive:true});
  await fs.writeFile(path.join(target,'mobile/android/.signing/release.p12'),'existing-signing-key');
  await fs.writeFile(path.join(target,'.env.local'),'PRIVATE_SETTING=keep');
  const options={port:0,host:'127.0.0.1',quiet:true,auth:{usersFile,secureCookie:false},ranked:{filename:database}};
  let srv=await startServer(options);t.after(async()=>{await srv?.close();await fs.rm(dir,{recursive:true,force:true});});
  const seats=[{accountId,playerId:'keeper',name:'保留昵称',isBot:false}];
  const match=srv.ranked.start({mode:'solo',difficulty:'NORMAL',roomCode:'KEEP',seats});
  srv.ranked.finish(match.id,{victory:true,reason:'victory',errors:0,roundsPassed:14,players:seats});
  const draft=srv.ranked.createSeason({name:'保留的下一赛季'},'keeper');
  const before={profile:srv.ranked.profile(accountId),records:srv.ranked.records(accountId),season:srv.ranked.current(),audit:srv.ranked.all('SELECT * FROM audit'),draft:srv.ranked.one('SELECT * FROM seasons WHERE id=?',draft.id)};
  assert.equal(before.profile.points,30);await srv.close();srv=null;
  const dbBefore=await fs.readFile(database),accountsBefore=await fs.readFile(usersFile);
  await fs.writeFile(path.join(source,'config','auth-users.json'),'replacement-should-never-be-copied');
  await fs.writeFile(path.join(source,'config','ranked.sqlite'),'replacement-should-never-be-copied');
  await fs.writeFile(path.join(source,'.env.local'),'replacement-should-never-be-copied');
  await fs.mkdir(path.join(source,'mobile/android/.signing'),{recursive:true});await fs.writeFile(path.join(source,'mobile/android/.signing/release.p12'),'replacement');
  const updated=await updateProject({source,target,stopped:true});
  assert.deepEqual(await fs.readFile(database),dbBefore);assert.deepEqual(await fs.readFile(usersFile),accountsBefore);
  assert.deepEqual(await fs.readFile(path.join(updated.backup,'config/ranked.sqlite')),dbBefore);
  assert.deepEqual(await fs.readFile(path.join(updated.backup,'config/auth-users.json')),accountsBefore);
  assert.equal(await fs.readFile(path.join(target,'config/server.env'),'utf8'),'PORT=3456\nSP_AUTH_COOKIE_SECURE=0\n');
  assert.equal(await fs.readFile(path.join(target,'.env.local'),'utf8'),'PRIVATE_SETTING=keep');
  assert.equal(await fs.readFile(path.join(target,'mobile/android/.signing/release.p12'),'utf8'),'existing-signing-key');
  assert.equal(await fs.readFile(path.join(target,'server/release-marker.js'),'utf8'),'export const updated=true;');
  srv=await startServer(options);
  assert.deepEqual(srv.ranked.profile(accountId),before.profile);assert.deepEqual(srv.ranked.records(accountId),before.records);
  assert.deepEqual(srv.ranked.current(),before.season);assert.deepEqual(srv.ranked.all('SELECT * FROM audit'),before.audit);
  assert.deepEqual(srv.ranked.one('SELECT * FROM seasons WHERE id=?',draft.id),before.draft);
  assert.equal(srv.auth.users.get('keeper').accountId,accountId);assert.equal(srv.auth.users.get('keeper').passwordHash,passwordHash);
  assert.equal(srv.auth.users.get('disabled').disabled,true);assert.equal(srv.auth.users.get('keeper').role,'admin');
  const logged=await fetch(srv.url+'/auth/login',{method:'POST',headers:{Origin:srv.url,'Content-Type':'application/json'},body:JSON.stringify({username:'keeper',password:'keep123'})});assert.equal(logged.status,200);await logged.arrayBuffer();
});
test('update refuses missing stop acknowledgment and overlapping paths before any writes',async t=>{
  const {source,target,dir}=await fixture(t);t.after(()=>fs.rm(dir,{recursive:true,force:true}));const original=await fs.readFile(path.join(target,'package.json'));
  await assert.rejects(updateProject({source,target}),/停止服务器/);
  await assert.rejects(updateProject({source:target,target,stopped:true}),/相同或互相包含/);
  assert.deepEqual(await fs.readFile(path.join(target,'package.json')),original);
});

test('source update publishes only allowlisted installers and excludes signing/build artifacts',async t=>{
  const {source,target,dir}=await fixture(t);t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  await fs.mkdir(path.join(source,'mobile/dist'),{recursive:true});
  for(const name of ['stronghold-protocol.apk','stronghold-protocol.apk.sha256','stronghold-protocol-full.apk','stronghold-windows.zip','stronghold-windows-full.zip'])await fs.writeFile(path.join(source,'mobile/dist',name),'public-installer');
  await fs.writeFile(path.join(source,'mobile/dist/credentials.json'),'private');
  await fs.mkdir(path.join(source,'mobile/full-dist/stronghold-windows-full'),{recursive:true});await fs.writeFile(path.join(source,'mobile/full-dist/stronghold-windows-full/resource-pack.zip'),'offline-only');
  await fs.mkdir(path.join(source,'mobile/windows/obj'),{recursive:true});await fs.writeFile(path.join(source,'mobile/windows/obj/private-build.txt'),'ignored-build');
  await fs.mkdir(path.join(source,'test/resource-scenes/obj'),{recursive:true});await fs.writeFile(path.join(source,'test/resource-scenes/obj/cache-bridge.dll'),'ignored-test-build');
  await updateProject({source,target,stopped:true});
  assert.equal(await fs.readFile(path.join(target,'mobile/dist/stronghold-protocol.apk'),'utf8'),'public-installer');
  await assert.rejects(fs.access(path.join(target,'mobile/dist/stronghold-protocol-full.apk')));
  await assert.rejects(fs.access(path.join(target,'mobile/dist/stronghold-windows-full.zip')));
  await assert.rejects(fs.access(path.join(target,'mobile/full-dist')));
  await assert.rejects(fs.access(path.join(target,'mobile/dist/credentials.json')));
  await assert.rejects(fs.access(path.join(target,'mobile/windows/obj/private-build.txt')));
  await assert.rejects(fs.access(path.join(target,'test/resource-scenes/obj/cache-bridge.dll')));
});
test('update protects and backs up custom account/database paths and WAL configured in the deployment env',async t=>{
  const {source,target,dir}=await fixture(t);t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  await fs.writeFile(path.join(target,'config/server.env'),'SP_AUTH_USERS_FILE=private/accounts.custom.json\nSP_RANKED_FILE=private/scores.db\n');
  for(const location of [source,target])await fs.mkdir(path.join(location,'private'),{recursive:true});
  for(const file of ['accounts.custom.json','scores.db','scores.db-wal','scores.db-shm']) {
    await fs.writeFile(path.join(target,'private',file),'keep-'+file);await fs.writeFile(path.join(source,'private',file),'replacement');
  }
  const {backup}=await updateProject({source,target,stopped:true});
  for(const file of ['accounts.custom.json','scores.db','scores.db-wal','scores.db-shm']) {
    assert.equal(await fs.readFile(path.join(target,'private',file),'utf8'),'keep-'+file);
    assert.equal(await fs.readFile(path.join(backup,'private',file),'utf8'),'keep-'+file);
  }
});

test('updates retain and back up test access settings in local and external state directories',async t=>{
  const {source,target,dir}=await fixture(t);t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const local=path.join(target,'storage');await fs.mkdir(local,{recursive:true});
  const payload=JSON.stringify({format:1,revision:3,publicIds:['shop-extra-slot'],adminControls:{testOperatorGrant:true}});
  await fs.writeFile(path.join(local,'test-content-access.json'),payload);
  await fs.writeFile(path.join(source,'server','test-content-access.json'),'should-not-copy');
  let updated=await updateProject({source,target,stopped:true});
  assert.equal(await fs.readFile(path.join(local,'test-content-access.json'),'utf8'),payload);
  assert.equal(await fs.readFile(path.join(updated.backup,'storage','test-content-access.json'),'utf8'),payload);
  await assert.rejects(fs.access(path.join(target,'server','test-content-access.json')));
  const external=path.join(dir,'private-state');await fs.mkdir(external,{recursive:true});await fs.writeFile(path.join(external,'test-content-access.json'),payload);
  await fs.writeFile(path.join(target,'config/server.env'),'SP_STATE_DIR='+external.replaceAll('\\','/')+'\n');
  updated=await updateProject({source,target,stopped:true});
  assert.equal(await fs.readFile(path.join(external,'test-content-access.json'),'utf8'),payload);
  assert.equal(await fs.readFile(path.join(updated.backup,'external','testAccess'),'utf8'),payload);
});
