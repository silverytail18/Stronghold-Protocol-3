import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {randomUUID,createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {Ranked} from '../../server/product/ranked.js';
import {inspectState,snapshotState,restoreState,verifySnapshot} from '../../server/product/retention.js';

const digest=b=>createHash('sha256').update(b).digest('hex');
async function fixture(t,{external=false}={}){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-retention-'));
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const project=path.join(dir,'installed'),state=path.join(dir,'private-state');
  await fs.mkdir(path.join(project,'config'),{recursive:true});await fs.mkdir(state);
  await fs.writeFile(path.join(project,'package.json'),JSON.stringify({version:'0.9.13'}));
  const users=['keeper','disabled','sponsor'].map((username,i)=>({username,accountId:randomUUID(),passwordHash:'scrypt$'+'1'.repeat(32)+'$'+'2'.repeat(128),role:i?'user':'admin',disabled:i===1,mustChangePassword:false,sponsor:i===2,...(i===2?{sponsorChange:{at:123,by:'00000000-0000-0000-0000-000000000000',enabled:true}}:{})}));
  const accounts=path.join(external?dir:state,'auth-users.json'),dbfile=path.join(external?dir:state,'ranked.sqlite');
  const auth={users:new Map(users.map(u=>[u.username,u]))};
  await fs.writeFile(accounts,JSON.stringify({version:1,users,extension:{mustPreserve:true}})+'\n');
  const config='PORT=3456\nPRIVATE_SETTING=keep-this-exactly\nSP_STATE_DIR='+JSON.stringify(state)+'\n'+(external?'SP_AUTH_USERS_FILE='+JSON.stringify(accounts)+'\nSP_RANKED_FILE='+JSON.stringify(dbfile)+'\n':'');
  await fs.writeFile(path.join(project,'config/server.env'),config);
  await fs.writeFile(path.join(project,'.env.local'),'CUSTOM_ENV=preserve\n');
  const ranked=new Ranked({filename:dbfile,auth});
  const seats=[{accountId:users[0].accountId,playerId:'seat-1',name:'保留昵称',isBot:false}];
  const match=ranked.start({mode:'solo',difficulty:'NORMAL',roomCode:'KEEP',seats});
  ranked.finish(match.id,{victory:true,reason:'victory',roundsPassed:14,errors:0,players:seats});
  ranked.audit('keeper','retention-fixture','season','keep');
  ranked.close();
  const settings={
    'operator-loadouts.json':{format:1,accounts:{[users[0].accountId]:{revision:4,entries:{custom_operator:{skill:2,module:'legacy'}}}}},
    'test-content-access.json':{format:1,revision:8,publicIds:['rhodes-mujica-v1','retired-or-future-id'],adminControls:{keep:true}},
    'music-rules.json':{format:1,revision:3,rules:{custom_music:{enabled:false,probability:20}}},
    'content-packs.json':{format:1,access:{revision:1,public:true},preset:{revision:4,rules:{legacy:true}},appearance:{theme:'iberia'},audit:[{keep:true}]},
    'unknown-setting.json':{futureFormat:900,retained:true},
  };
  for(const [name,value] of Object.entries(settings))await fs.writeFile(path.join(state,name),JSON.stringify(value)+'\n');
  await fs.mkdir(path.join(state,'nested'));await fs.writeFile(path.join(state,'nested/private.bin'),Buffer.from([0,1,2,255]));
  return {dir,project,state,accounts,dbfile,users,auth,seats,config,snapshot:path.join(dir,'snapshot'),target:path.join(dir,'restored')};
}

test('retains every table, identity, password hash, sponsor, unknown and retired settings; source unchanged',async t=>{
  const f=await fixture(t),before=await inspectState({project:f.project});
  const bytes=await fs.readFile(f.accounts),config=await fs.readFile(path.join(f.project,'config/server.env'));
  const saved=await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  assert.equal(saved.ready,true);assert.equal(saved.accounts,3);
  const manifest=await verifySnapshot(f.snapshot);
  assert.deepEqual(manifest.database,before.database);
  assert.ok(manifest.files.some(r=>r.path==='state/unknown-setting.json'));
  assert.ok(manifest.files.some(r=>r.path==='deployment/.env.local'));
  assert.ok(manifest.files.some(r=>r.path==='deployment/config/server.env'));
  assert.deepEqual(await fs.readFile(f.accounts),bytes);
  assert.deepEqual(await fs.readFile(path.join(f.project,'config/server.env')),config);
  const dry=await restoreState({snapshot:f.snapshot,target:f.target,project:f.project});
  assert.equal(dry.dryRun,true);await assert.rejects(fs.stat(f.target),{code:'ENOENT'});
  const applied=await restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false});
  assert.equal(applied.dryRun,false);
  assert.deepEqual(await fs.readFile(path.join(f.target,'state/auth-users.json')),bytes);
  for(const row of manifest.files.filter(r=>r.path.startsWith('state/')))assert.equal(digest(await fs.readFile(path.join(f.target,row.path))),row.sha256);
  assert.match(await fs.readFile(applied.envFile,'utf8'),/SP_AUTH_USERS_FILE=/);
  const repeat=await restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false});assert.equal(repeat.unchanged,true);
  await fs.writeFile(path.join(f.target,'state/music-rules.json'),'new production write');
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false}),/发生变化/);
});

test('explicit external accounts/database are kept paired and source environment overrides are honored',async t=>{
  const f=await fixture(t,{external:true});
  const inspected=await inspectState({project:f.project});assert.equal(inspected.paths.usersFile,f.accounts);
  await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  const m=await verifySnapshot(f.snapshot);assert.equal(m.effective.usersFile,'external/auth-users.json');assert.equal(m.effective.rankedFile,'external/ranked.sqlite');
  await restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false});
  assert.deepEqual(await fs.readFile(path.join(f.target,m.effective.usersFile)),await fs.readFile(f.accounts));
  await assert.rejects(inspectState({project:f.project,env:{SP_AUTH_USERS_FILE:path.join(f.dir,'missing.json')}}),/未找到实际账号/);
});

test('SQLite backup contains committed WAL rows rather than only the stale main database',async t=>{
  const f=await fixture(t),writer=new DatabaseSync(f.dbfile);
  try{
    writer.exec('PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0;');
    writer.prepare('INSERT INTO audit(actor,action,target,reason,created_at) VALUES(?,?,?,?,?)').run('fixture','wal-only','retained','WAL',999);
    assert.ok((await fs.stat(f.dbfile+'-wal')).size>0);
    await snapshotState({project:f.project,output:f.snapshot,stopped:true});
    const copy=new DatabaseSync(path.join(f.snapshot,'state/ranked.sqlite'),{readOnly:true});
    try{assert.equal(copy.prepare("SELECT COUNT(*) n FROM audit WHERE action='wal-only'").get().n,1);}finally{copy.close();}
  }finally{writer.close();}
});

test('running/pending matches and locks are preserved in snapshots and prevent activation',async t=>{
  const f=await fixture(t),r=new Ranked({filename:f.dbfile,auth:f.auth});
  r.start({mode:'solo',difficulty:'NORMAL',roomCode:'LIVE',seats:f.seats});r.close();
  const saved=await snapshotState({project:f.project,output:f.snapshot,stopped:true});assert.equal(saved.ready,false);
  const m=await verifySnapshot(f.snapshot);assert.equal(m.database.unfinished.running,1);assert.equal(m.database.unfinished.locks,1);
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false}),/旧快照仍有/);
  await assert.rejects(fs.stat(f.target),{code:'ENOENT'});
});

test('refuses mixed identities, unknown schemas and orphaned WAL without initializing replacements',async t=>{
  const f=await fixture(t),doc=JSON.parse(await fs.readFile(f.accounts,'utf8'));doc.users[0].accountId=randomUUID();
  await fs.writeFile(f.accounts,JSON.stringify(doc));await assert.rejects(inspectState({project:f.project}),/未完整配对/);
  doc.users=f.users;await fs.writeFile(f.accounts,JSON.stringify(doc));
  const db=new DatabaseSync(f.dbfile);db.exec("UPDATE metadata SET value='999' WHERE key='schema'");db.close();
  await assert.rejects(snapshotState({project:f.project,output:f.snapshot,stopped:true}),/未知数据库/);
  await assert.rejects(fs.stat(f.snapshot),{code:'ENOENT'});
  await fs.rename(f.dbfile,f.dbfile+'.original');await fs.writeFile(f.dbfile+'-wal','orphan');
  await assert.rejects(inspectState({project:f.project}),/主文件缺失/);await assert.rejects(fs.stat(f.dbfile),{code:'ENOENT'});
});

test('no stopped declaration, existing targets, served paths, symlinks, malformed settings and missing account IDs fail closed',async t=>{
  const f=await fixture(t);
  await assert.rejects(snapshotState({project:f.project,output:f.snapshot}),/--stopped/);
  await fs.mkdir(f.snapshot);await assert.rejects(snapshotState({project:f.project,output:f.snapshot,stopped:true}),/已存在/);
  await assert.rejects(snapshotState({project:f.project,output:path.join(f.project,'public/snapshot'),stopped:true}),/不能位于/);
  await fs.writeFile(path.join(f.state,'music-rules.json'),'{}');await assert.rejects(snapshotState({project:f.project,output:path.join(f.dir,'bad-setting'),stopped:true}),/设置格式未知/);
  const d=JSON.parse(await fs.readFile(f.accounts,'utf8'));delete d.users[0].accountId;await fs.writeFile(f.accounts,JSON.stringify(d));
  await assert.rejects(inspectState({project:f.project}),/缺少稳定身份/);
});

test('snapshot tampering, traversal and duplicate paths are rejected before any restore writes',async t=>{
  const f=await fixture(t);await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  const file=path.join(f.snapshot,'manifest.json'),original=await fs.readFile(file,'utf8'),m=JSON.parse(original);
  m.files[0].path='../escape';await fs.writeFile(file,JSON.stringify(m));
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false}),/路径无效/);
  m.files=JSON.parse(original).files;m.files.push(m.files[0]);await fs.writeFile(file,JSON.stringify(m));
  await assert.rejects(verifySnapshot(f.snapshot),/重复路径/);
  await fs.writeFile(file,original);await fs.appendFile(path.join(f.snapshot,'state/unknown-setting.json'),'tamper');
  await assert.rejects(verifySnapshot(f.snapshot),/哈希不匹配/);
  await assert.rejects(fs.stat(f.target),{code:'ENOENT'});
});

test('ambiguous legacy/default state and missing account-file overrides never fall back to defaults',async t=>{
  const f=await fixture(t);await fs.writeFile(path.join(f.project,'config/server.env'),'PORT=3456\n');
  await fs.mkdir(path.join(f.project,'storage'));await fs.copyFile(f.accounts,path.join(f.project,'config/auth-users.json'));await fs.copyFile(f.accounts,path.join(f.project,'storage/auth-users.json'));
  await assert.rejects(inspectState({project:f.project}),/都 有数据|都有数据/);
  await assert.rejects(inspectState({project:f.project,env:{SP_STATE_DIR:f.state,SP_AUTH_USERS_FILE:path.join(f.dir,'not-exist')}}),/未找到实际账号/);
});

test('restored SQLite opens with the retained store and preserves seasons, points, histories and audit on restart',async t=>{
  const f=await fixture(t),before=new Ranked({filename:f.dbfile,auth:f.auth});
  const expected={profile:before.profile(f.users[0].accountId),records:before.records(f.users[0].accountId),seasons:before.all('SELECT * FROM seasons'),ledger:before.all('SELECT * FROM ledger'),audit:before.all('SELECT * FROM audit')};before.close();
  await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  await restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false});
  const retained=JSON.parse(await fs.readFile(path.join(f.target,'state/auth-users.json'),'utf8'));
  for(let n=0;n<2;n++){
    const r=new Ranked({filename:path.join(f.target,'state/ranked.sqlite'),auth:{users:new Map(retained.users.map(u=>[u.username,u]))}});
    try{assert.deepEqual(r.profile(f.users[0].accountId),expected.profile);assert.deepEqual(r.records(f.users[0].accountId),expected.records);assert.deepEqual(r.all('SELECT * FROM seasons'),expected.seasons);assert.deepEqual(r.all('SELECT * FROM ledger'),expected.ledger);assert.deepEqual(r.all('SELECT * FROM audit'),expected.audit);}finally{r.close();}
  }
});

test('unknown database extension tables, deleted historical identities and inactive content IDs survive intact',async t=>{
  const f=await fixture(t),db=new DatabaseSync(f.dbfile);
  db.exec("CREATE TABLE future_extensions(id TEXT PRIMARY KEY,value TEXT); INSERT INTO future_extensions VALUES('future','retained');");
  db.prepare('INSERT INTO accounts VALUES(?,?,?,?)').run(randomUUID(),999,'历史已删除账号',0);db.close();
  const before=await inspectState({project:f.project});await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  const m=await verifySnapshot(f.snapshot);assert.deepEqual(m.database.tables,before.database.tables);assert.equal(m.database.tables.future_extensions.rows,1);
  assert.match(await fs.readFile(path.join(f.snapshot,'state/test-content-access.json'),'utf8'),/retired-or-future-id/);
});

test('pending old settlement cannot be imported into the new runtime or automatically replayed',async t=>{
  const f=await fixture(t),db=new DatabaseSync(f.dbfile);db.exec("UPDATE matches SET status='pending'");db.close();
  await snapshotState({project:f.project,output:f.snapshot,stopped:true});const m=await verifySnapshot(f.snapshot);
  assert.equal(m.database.unfinished.pending,1);assert.equal(m.database.tables.ledger.rows,1);
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false}),/待结算/);
  assert.equal((await inspectState({project:f.project})).database.unfinished.pending,1);
});

test('foreign-key damage and directory junctions are refused before writing snapshots',async t=>{
  const f=await fixture(t),db=new DatabaseSync(f.dbfile);
  db.exec('PRAGMA foreign_keys=OFF');db.prepare('INSERT INTO locks VALUES(?,?)').run(randomUUID(),randomUUID());db.close();
  await assert.rejects(snapshotState({project:f.project,output:f.snapshot,stopped:true}),/外键损坏/);
  await assert.rejects(fs.stat(f.snapshot),{code:'ENOENT'});
  const link=path.join(f.dir,'linked');await fs.symlink(f.state,link,process.platform==='win32'?'junction':'dir');
  await assert.rejects(inspectState({project:f.project,env:{SP_STATE_DIR:link}}),/符号链接或目录联接/);
});

test('dry-run refuses an unrelated existing target and actual restore never overwrites the source directory',async t=>{
  const f=await fixture(t);await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  await fs.mkdir(f.target);await fs.writeFile(path.join(f.target,'keep.txt'),'must remain');
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.target,project:f.project}),/目标非空/);
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.state,project:f.project,stopped:true,dryRun:false}),/当前有效数据/);
  assert.equal(await fs.readFile(path.join(f.target,'keep.txt'),'utf8'),'must remain');
});

test('running normal-match records also block engine cutover without being marked interrupted by inspection',async t=>{
  const f=await fixture(t),r=new Ranked({filename:f.dbfile,auth:f.auth});r.recordStart({ranked:false,mode:'solo',difficulty:'NORMAL',seats:f.seats});r.close();
  const before=await inspectState({project:f.project});assert.equal(before.ready,false);assert.equal(before.database.unfinished.running,0);assert.equal(before.database.unfinished.activeRecords,1);
  await snapshotState({project:f.project,output:f.snapshot,stopped:true});
  await assert.rejects(restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false}),/旧快照仍有/);
  assert.equal((await inspectState({project:f.project})).database.unfinished.activeRecords,1);
});
import {MizukiStore} from '../../server/product/mizuki/store.js';

test('Mizuki WAL snapshot retains suspended checkpoints, bank and ledger, paired with accounts',async t=>{
 const f=await fixture(t),filename=path.join(f.state,'mizuki.sqlite'),store=new MizukiStore(filename);
 try {
 store.db.exec('PRAGMA wal_autocheckpoint=0');
 const seats=[{playerId:'m1',seat:0,connected:true}],run=store.begin({seats,roomCode:'MZ01',seed:123,matchNo:1,mizukiDifficultyGrade:0},new Map([['m1',f.users[0].accountId]]));
 store.commit(run.id,{epoch:1,seq:1,checkpoint:{v:1,engine:'mizuki',variant:'entertainment_mizuki',matchId:run.id,roomCode:'MZ01',seed:123,matchNo:1,players:seats,mizuki:{difficultyGrade:0}},banks:{m1:{current:5,record:5,totalPut:5}}});
 const running=await inspectState({project:f.project});assert.equal(running.mizuki.running,1);assert.equal(running.ready,false);
 store.suspend(run.id);
 store.adminAudit({actor:f.users[0].accountId,action:'closeRoom',reason:'snapshot audit fixture',runId:run.id});
 const before=await inspectState({project:f.project});assert.equal(before.mizuki.suspended,1);
 assert.equal(before.mizuki.tables.admin_audit.rows,1);
 await snapshotState({project:f.project,output:f.snapshot,stopped:true});const manifest=await verifySnapshot(f.snapshot);assert.deepEqual(manifest.mizuki,before.mizuki);
 assert.ok(manifest.files.some(r=>r.path.endsWith('/mizuki.sqlite')));assert.ok(manifest.files.every(r=>!r.path.endsWith('-wal')&&!r.path.endsWith('-shm')));
 await restoreState({snapshot:f.snapshot,target:f.target,project:f.project,stopped:true,dryRun:false});
 const db=new DatabaseSync(path.join(f.target,'state/mizuki.sqlite'),{readOnly:true});try{assert.equal(db.prepare('SELECT status FROM runs WHERE id=?').get(run.id).status,'suspended');assert.equal(db.prepare('SELECT COUNT(*) n FROM ledger').get().n,1);assert.equal(JSON.parse(db.prepare('SELECT doc FROM admin_audit').get().doc).reason,'snapshot audit fixture');}finally{db.close();}
 } finally {store.close();}
});
