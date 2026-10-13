import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {ROOT,startServer} from '../server/index.js';
import {hashPassword,createAuth} from '../server/auth.js';
import {resolveStatePaths,assertStateFiles,deploymentSettings} from '../server/state-paths.js';
import {migrateState} from '../tools/migrate-state.mjs';
import {updateProject} from '../tools/update-project.mjs';
let passwordHash;
before(async()=>{passwordHash=await hashPassword('keep123');});
async function fixture(t) {
  const dir=await fs.mkdtemp(path.join(ROOT,'.cache','state-storage-')),project=path.join(dir,'installed');
  await fs.mkdir(path.join(project,'config'),{recursive:true});
  await fs.writeFile(path.join(project,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:'0.2.4'}));
  let server;
  t.after(async()=>{await server?.close();await fs.rm(dir,{recursive:true,force:true});});
  const users={version:1,users:['keeper','member'].map((username,i)=>({username,accountId:randomUUID(),passwordHash,role:i?'user':'admin',disabled:false,mustChangePassword:false}))};
  return {dir,project,users,get server(){return server;},set server(value){server=value;}};
}
test('new installs use storage; legacy files retain their location and ambiguous or orphaned state refuses initialization',async t=>{
  const f=await fixture(t);
  assert.equal(resolveStatePaths(f.project,{}).directory,path.join(f.project,'storage'));
  await fs.writeFile(path.join(f.project,'config','auth-users.json'),JSON.stringify(f.users));
  assert.equal(resolveStatePaths(f.project,{}).legacy,true);
  await fs.mkdir(path.join(f.project,'storage'));
  await fs.writeFile(path.join(f.project,'storage','ranked.sqlite'),'existing');
  assert.throws(()=>resolveStatePaths(f.project,{}),/都包含持久化数据/);
  const env={SP_STATE_DIR:'storage'};
  assert.throws(()=>assertStateFiles(f.project,resolveStatePaths(f.project,env),env),/缺少对应账号文件/);
  await fs.rm(path.join(f.project,'storage','ranked.sqlite'));
  assert.throws(()=>assertStateFiles(f.project,resolveStatePaths(f.project,env),env),/尚未迁移旧账号/);
  await fs.writeFile(path.join(f.project,'storage','ranked.sqlite-wal'),'committed-write');
  assert.throws(()=>assertStateFiles(f.project,resolveStatePaths(f.project,env),env),/主文件缺失/);
});
test('first authentication creates durable accounts in storage and subsequent startup retains identity and password',async t=>{
  const f=await fixture(t);
  let auth=await createAuth({},f.project,false);
  const file=path.join(f.project,'storage','auth-users.json');
  assert.equal(auth.usersFile,file);
  const before=await fs.readFile(file),account={...auth.users.get('admin')};auth.close();
  auth=await createAuth({},f.project,false);
  try { assert.deepEqual(auth.users.get('admin'),account);assert.deepEqual(await fs.readFile(file),before); }
  finally { auth.close(); }
});
test('migration preserves account identities/passwords, scores, seasons, histories and audit across restart and an external-dir source update',async t=>{
  const f=await fixture(t),old=resolveStatePaths(f.project,{});
  // Seed the legacy deployment explicitly, as an already running v0.2.4 installation.
  old.usersFile=path.join(f.project,'config','auth-users.json');old.rankedFile=path.join(f.project,'config','ranked.sqlite');
  await fs.writeFile(old.usersFile,JSON.stringify(f.users));
  await fs.writeFile(path.join(f.project,'config/server.env'),'PORT=3456\nSP_AUTH_COOKIE_SECURE=0\n');
  const accountId=f.users.users[0].accountId;
  f.server=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:{usersFile:old.usersFile,secureCookie:false},ranked:{filename:old.rankedFile}});
  let srv=f.server;
  const seats=[{accountId,playerId:'keeper',name:'保留昵称',isBot:false}];
  const match=srv.ranked.start({mode:'solo',difficulty:'NORMAL',roomCode:'KEEP',seats});
  srv.ranked.finish(match.id,{victory:true,reason:'victory',roundsPassed:14,errors:0,players:seats});
  const draft=srv.ranked.createSeason({name:'保留下一赛季'},'keeper');
  const before={profile:srv.ranked.profile(accountId),records:srv.ranked.records(accountId),seasons:srv.ranked.all('SELECT * FROM seasons'),audit:srv.ranked.all('SELECT * FROM audit')};
  await srv.close();f.server=null;
  const sourceAccounts=await fs.readFile(old.usersFile);
  const fixed=path.join(f.dir,'fixed-state');
  const result=await migrateState({project:f.project,to:fixed,stopped:true,env:{}});
  assert.equal(result.directory,fixed);
  const settings=await deploymentSettings(f.project,{}),current=resolveStatePaths(f.project,settings);
  assert.equal(current.usersFile,path.join(fixed,'auth-users.json'));
  assert.deepEqual(await fs.readFile(current.usersFile),sourceAccounts);
  assert.deepEqual(await fs.readFile(old.usersFile),sourceAccounts,'migration retains old accounts');
  assert.deepEqual(await fs.readFile(path.join(result.backup,'auth-users.json')),sourceAccounts);
  const keys=['SP_STATE_DIR','SP_AUTH_USERS_FILE','SP_RANKED_FILE','SP_AUTH_COOKIE_SECURE'];
  const saved=keys.map(key=>process.env[key]);
  t.after(()=>keys.forEach((key,i)=>saved[i]===undefined?delete process.env[key]:process.env[key]=saved[i]));
  for(const key of keys.slice(0,3))process.env[key]=settings[key];
  process.env.SP_AUTH_COOKIE_SECURE='0';
  // Use production defaults, not injected memory auth/database options, after migration.
  const options={port:0,host:'127.0.0.1',quiet:true};
  srv=await startServer(options);f.server=srv;
  assert.deepEqual(srv.ranked.profile(accountId),before.profile);
  assert.deepEqual(srv.ranked.records(accountId),before.records);
  assert.deepEqual(srv.ranked.all('SELECT * FROM seasons'),before.seasons);
  assert.deepEqual(srv.ranked.all('SELECT * FROM audit'),before.audit);
  assert.equal(srv.ranked.one('SELECT id FROM seasons WHERE id=?',draft.id).id,draft.id);
  assert.equal(srv.auth.users.get('keeper').passwordHash,passwordHash);
  assert.equal(srv.auth.usersFile,current.usersFile);
  await srv.close();f.server=null;
  const release=path.join(f.dir,'release');await fs.mkdir(path.join(release,'storage'),{recursive:true});
  await fs.writeFile(path.join(release,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:'0.2.5'}));
  await fs.writeFile(path.join(release,'storage','auth-users.json'),'must-never-be-copied');
  const update=await updateProject({source:release,target:f.project,stopped:true});
  assert.deepEqual(await fs.readFile(path.join(update.backup,'external','accounts')),sourceAccounts);
  assert.deepEqual(await fs.readFile(current.usersFile),sourceAccounts);
  f.server=await startServer(options);srv=f.server;
  assert.deepEqual(srv.ranked.profile(accountId),before.profile);
  assert.deepEqual(srv.ranked.records(accountId),before.records);
  assert.deepEqual(srv.ranked.all('SELECT * FROM seasons'),before.seasons);
  assert.deepEqual(srv.ranked.all('SELECT * FROM audit'),before.audit);
  const login=await fetch(srv.url+'/auth/login',{method:'POST',headers:{Origin:srv.url,'Content-Type':'application/json'},body:JSON.stringify({username:'keeper',password:'keep123'})});
  assert.equal(login.status,200);await login.arrayBuffer();
});
test('migration refuses live/served/non-empty destinations and corrupt accounts before changing configuration',async t=>{
  const f=await fixture(t),accounts=path.join(f.project,'config','auth-users.json'),config=path.join(f.project,'config/server.env');
  await fs.writeFile(accounts,JSON.stringify(f.users));await fs.writeFile(config,'PORT=3456\n');
  await assert.rejects(migrateState({project:f.project,env:{}}),/停止服务器/);
  await assert.rejects(migrateState({project:f.project,to:'public/state',stopped:true,env:{}}),/网页可访问/);
  await fs.mkdir(path.join(f.project,'storage'));await fs.writeFile(path.join(f.project,'storage','auth-users.json'),'existing');
  await assert.rejects(migrateState({project:f.project,to:'storage',stopped:true,env:{SP_STATE_DIR:'config'}}),/目标已有/);
  await fs.writeFile(accounts,'{"version":99}');
  await assert.rejects(migrateState({project:f.project,to:path.join(f.dir,'empty'),stopped:true,env:{SP_STATE_DIR:'config'}}),/账号文件无效/);
  assert.equal(await fs.readFile(config,'utf8'),'PORT=3456\n');
});
test('source updates skip and back up complete default and custom state directories',async t=>{
  const f=await fixture(t),release=path.join(f.dir,'release');
  await fs.mkdir(release);await fs.writeFile(path.join(release,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:'0.2.5'}));
  await fs.writeFile(path.join(f.project,'config/server.env'),'SP_STATE_DIR=private-state\n');
  for(const base of [f.project,release])for(const directory of ['storage','private-state']) {
    await fs.mkdir(path.join(base,directory),{recursive:true});
    await fs.writeFile(path.join(base,directory,'custom-persistent.bin'),base===release?'replacement':'keep');
  }
  const update=await updateProject({source:release,target:f.project,stopped:true});
  for(const directory of ['storage','private-state']) {
    assert.equal(await fs.readFile(path.join(f.project,directory,'custom-persistent.bin'),'utf8'),'keep');
    assert.equal(await fs.readFile(path.join(update.backup,directory,'custom-persistent.bin'),'utf8'),'keep');
  }
});
