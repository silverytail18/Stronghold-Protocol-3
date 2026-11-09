import {mizukiDatabaseInfo} from './mizuki/retention.js';
// Standalone retention tool. No game engine is imported and no source state is initialized or upgraded.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {DatabaseSync,backup} from 'node:sqlite';
import {parseEnv} from 'node:util';
import {fileURLToPath} from 'node:url';

const sha=b=>createHash('sha256').update(b).digest('hex');
const inside=(a,b)=>{const r=path.relative(a,b);return !r||r!=='..'&&!r.startsWith('..'+path.sep)&&!path.isAbsolute(r);};
const exists=async f=>{try{await fs.lstat(f);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const quote=s=>'"'+s.replaceAll('"','""')+'"';
const sort=(a,b)=>a<b?-1:a>b?1:0;
const json=x=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?{$integer:String(v)}:v);
const portable=s=>s.split(path.sep).join('/');
const fail=message=>{throw Error(message);};

async function canonical(file){
  const absolute=path.resolve(file);let ancestor=absolute;
  while(!await exists(ancestor))ancestor=path.dirname(ancestor);
  return path.join(await fs.realpath(ancestor),path.relative(ancestor,absolute));
}
async function noLinks(file){
  let current=path.resolve(file),parts=[];
  while(path.dirname(current)!==current){parts.push(current);current=path.dirname(current);}
  for(const part of parts.reverse())if(await exists(part)&&(await fs.lstat(part)).isSymbolicLink())fail('路径包含符号链接或目录联接，拒绝自动处理');
}
async function privatePath(project,file){
  const resolved=await canonical(file);
  for(const name of ['public','data','shared','server','tools','scripts','node_modules']){
    if(inside(await canonical(path.join(project,name)),resolved))fail('持久化数据或备份不能位于可服务或源码目录中');
  }
  if(resolved===await canonical(project))fail('持久化目录不能是项目根目录');
  await noLinks(file);return resolved;
}
export async function settingsFor(project,overrides={}){
  const settings={};
  for(const name of ['.env','.env.local','config/server.env']){
    const file=path.join(project,name);
    if(await exists(file)){await noLinks(file);Object.assign(settings,parseEnv(await fs.readFile(file,'utf8')));}
  }
  for(const key of ['SP_STATE_DIR','SP_AUTH_USERS_FILE','SP_RANKED_FILE'])if(overrides[key]!==undefined)settings[key]=overrides[key];
  return settings;
}
export async function statePaths(project,env){
  const hasState=async dir=>{for(const f of ['auth-users.json','ranked.sqlite','ranked.sqlite-wal','ranked.sqlite-shm'])if(await exists(path.join(dir,f)))return true;return false;};
  const legacy=path.join(project,'config'),standard=path.join(project,'storage');
  const old=await hasState(legacy),fresh=await hasState(standard);
  if(!env.SP_STATE_DIR&&old&&fresh&&!env.SP_AUTH_USERS_FILE&&!env.SP_RANKED_FILE)fail('config 和 storage 都有数据，必须明确实际部署路径');
  const directory=await privatePath(project,path.resolve(project,env.SP_STATE_DIR||(old?legacy:standard)));
  if(env.SP_RANKED_FILE===':memory:')fail('内存排位库不能用于持久化迁移');
  const usersFile=await privatePath(project,path.resolve(project,env.SP_AUTH_USERS_FILE||path.join(directory,'auth-users.json')));
  const rankedFile=await privatePath(project,path.resolve(project,env.SP_RANKED_FILE||path.join(directory,'ranked.sqlite')));
  if(usersFile===rankedFile)fail('账号和排位数据库不能使用同一路径');
  if(!await exists(usersFile))fail('未找到实际账号文件，拒绝创建默认账号；请核对部署环境与外部数据路径');
  if(!await exists(rankedFile)&&(await exists(rankedFile+'-wal')||await exists(rankedFile+'-shm')))fail('数据库主文件缺失但存在 WAL/SHM，拒绝创建空库');
  const mizukiFile=await privatePath(project,path.join(directory,'mizuki.sqlite'));
  if([usersFile,rankedFile].includes(mizukiFile))fail('水月数据库路径与其他状态冲突');
  if(!await exists(mizukiFile)&&(await exists(mizukiFile+'-wal')||await exists(mizukiFile+'-shm')))fail('水月主库缺失但存在 WAL/SHM');
  return {directory,usersFile,rankedFile,mizukiFile};
}
function accountsInfo(bytes){
  let doc;try{doc=JSON.parse(bytes);}catch{fail('账号文件 JSON 无效');}
  if(doc?.version!==1||!Array.isArray(doc.users)||!doc.users.length||doc.users.length>1000)fail('账号格式未知，拒绝覆盖');
  const ids=new Set(),names=new Set();
  for(const u of doc.users){
    if(typeof u.username!=='string'||!/^[A-Za-z0-9_.-]{1,64}$/.test(u.username)||['.','..'].includes(u.username)||names.has(u.username)
      ||typeof u.accountId!=='string'||!/^[a-f0-9-]{36}$/.test(u.accountId)||ids.has(u.accountId)
      ||typeof u.passwordHash!=='string'||!/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(u.passwordHash)
      ||!['admin','user'].includes(u.role)||typeof u.disabled!=='boolean'||typeof u.mustChangePassword!=='boolean'
      ||u.sponsor!==undefined&&typeof u.sponsor!=='boolean'
      ||u.sponsorChange!==undefined&&(!Number.isSafeInteger(u.sponsorChange?.at)||u.sponsorChange.at<0||typeof u.sponsorChange.by!=='string'||!/^[a-f0-9-]{36}$/.test(u.sponsorChange.by)||typeof u.sponsorChange.enabled!=='boolean'))fail('账号缺少稳定身份或格式无效；请在原版本处理后重试');
    names.add(u.username);ids.add(u.accountId);
  }
  if(!doc.users.some(u=>u.role==='admin'&&!u.disabled))fail('账号文件没有可用管理员，拒绝自动修复');
  return {ids,summary:{count:doc.users.length,admins:doc.users.filter(u=>u.role==='admin').length,sponsors:doc.users.filter(u=>u.sponsor).length,sha256:sha(bytes)}};
}
export function databaseInfo(file,accountIds){
  const db=new DatabaseSync(file,{readOnly:true,timeout:5000});
  try{
    db.exec('BEGIN');
    if(!['1','2'].includes(db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value))fail('未知数据库 schema，拒绝迁移');
    const integrity=db.prepare('PRAGMA integrity_check').all();
    if(integrity.length!==1||integrity[0].integrity_check!=='ok')fail('数据库完整性检查失败');
    if(db.prepare('PRAGMA foreign_key_check').all().length)fail('数据库存在外键损坏，拒绝迁移');
    const names=db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(x=>x.name);
    for(const table of ['accounts','seasons','standings','matches','participants','locks','ledger','audit'])if(!names.includes(table))fail('数据库缺少必须表，拒绝自动补空');
    const stored=new Set(db.prepare('SELECT id FROM accounts').all().map(x=>x.id));
    if(stored.size&&[...accountIds].some(id=>!stored.has(id)))fail('账号与排位数据库未完整配对；拒绝混用不同部署的数据');
    const tables={};
    for(const table of names){
      const columns=db.prepare(`PRAGMA table_info(${quote(table)})`).all().map(x=>x.name);
      const statement=db.prepare(`SELECT * FROM ${quote(table)} ORDER BY ${columns.map(quote).join(',')}`);statement.setReadBigInts(true);
      const digest=createHash('sha256');let rows=0;
      for(const row of statement.iterate()){digest.update(json(row)+'\n');rows++;}
      tables[table]={rows,sha256:digest.digest('hex')};
    }
    const unfinished={running:db.prepare("SELECT COUNT(*) n FROM matches WHERE status='running'").get().n,pending:db.prepare("SELECT COUNT(*) n FROM matches WHERE status='pending'").get().n,locks:db.prepare('SELECT COUNT(*) n FROM locks').get().n,activeRecords:names.includes('battle_records')?db.prepare("SELECT COUNT(*) n FROM battle_records WHERE status='running'").get().n:0};
    const schema=sha(json(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name").all()));
    db.exec('ROLLBACK');return {schema,tables,unfinished,ready:Object.values(unfinished).every(n=>n===0)};
  }finally{db.close();}
}
async function collect(root,prefix,rows){
  if(!await exists(root))return;
  await noLinks(root);const stat=await fs.lstat(root);
  if(stat.isFile()){rows.push({source:root,relative:prefix});return;}
  if(!stat.isDirectory())fail('私有数据包含非普通文件');
  for(const name of (await fs.readdir(root)).sort(sort))await collect(path.join(root,name),prefix+'/'+name,rows);
}
function validateSetting(relative,bytes){
  const name=path.basename(relative);if(!['operator-loadouts.json','test-content-access.json','music-rules.json','content-packs.json'].includes(name))return;
  let d;try{d=JSON.parse(bytes);}catch{fail('现有设置 JSON 无效，拒绝迁移');}
  if(d?.format!==1)fail('现有设置格式未知，拒绝迁移');
  // Content IDs are intentionally not filtered against the first-batch runtime catalog.
  if(name==='operator-loadouts.json'&&(!d.accounts||Array.isArray(d.accounts)||typeof d.accounts!=='object'))fail('调配偏好格式无效');
  if(name==='test-content-access.json'&&(!Number.isSafeInteger(d.revision)||d.revision<0||!Array.isArray(d.publicIds)))fail('开放设置格式无效');
  if(name==='music-rules.json'&&(!Number.isSafeInteger(d.revision)||d.revision<0||!d.rules||typeof d.rules!=='object'))fail('音乐设置格式无效');
  if(name==='content-packs.json'&&(!d.access||!d.preset||!Array.isArray(d.audit)))fail('退休内容设置格式无效');
}
export async function inspectState({project,env={}}){
  project=await fs.realpath(project);
  const settings=await settingsFor(project,env),paths=await statePaths(project,settings);
  const accounts=accountsInfo(await fs.readFile(paths.usersFile));
  const database=await exists(paths.rankedFile)?databaseInfo(paths.rankedFile,accounts.ids):null;
  const mizuki=await exists(paths.mizukiFile)?mizukiDatabaseInfo(paths.mizukiFile,accounts.ids):null;
  return {project,paths,accounts:accounts.summary,database,mizuki,ready:(database?.ready??true)&&(mizuki?.ready??true)};
}
export async function snapshotState({project,output,stopped=false,env={}}){
  if(!stopped)fail('请等待旧对局结束并停止服务后，使用 --stopped 创建一致的数据快照');
  const info=await inspectState({project,env});project=info.project;
  output=await privatePath(project,path.resolve(output));
  for(const source of [project,info.paths.directory,info.paths.usersFile,info.paths.rankedFile]){
    if(output===source||source!==project&&(inside(source,output)||inside(output,source)))fail('快照输出不能与源数据目录互相包含');
  }
  if(await exists(output))fail('快照目标已存在，拒绝覆盖');
  const rows=[];await collect(info.paths.directory,'state',rows);
  if(!inside(info.paths.directory,info.paths.usersFile))rows.push({source:info.paths.usersFile,relative:'external/auth-users.json'});
  if(await exists(info.paths.rankedFile)&&!inside(info.paths.directory,info.paths.rankedFile))rows.push({source:info.paths.rankedFile,relative:'external/ranked.sqlite'});
  if(!inside(info.paths.directory,path.join(project,'config')))await collect(path.join(project,'config'),'deployment/config',rows);
  for(const name of (await fs.readdir(project)).filter(n=>n.toLowerCase()==='.env'||n.toLowerCase().startsWith('.env.')))await collect(path.join(project,name),'deployment/'+name,rows);
  await collect(path.join(project,'mobile/android/.signing'),'deployment/android-signing',rows);
  const mapped=file=>inside(info.paths.directory,file)?'state/'+portable(path.relative(info.paths.directory,file)):file===info.paths.usersFile?'external/auth-users.json':'external/ranked.sqlite';
  const effective={directory:'state',usersFile:mapped(info.paths.usersFile),rankedFile:mapped(info.paths.rankedFile),...(info.mizuki?{mizukiFile:mapped(info.paths.mizukiFile)}:{})};
  const files=[],sourceHashes=new Map();let dbSaved=false;
  await fs.mkdir(path.dirname(output),{recursive:true,mode:0o700});await fs.mkdir(output,{mode:0o700});
  // A missing manifest means an incomplete snapshot. Source files and configuration are never written.
  for(const row of rows){
    if([info.paths.rankedFile,info.paths.mizukiFile].some(f=>[f+'-wal',f+'-shm'].includes(row.source)))continue;
    const destination=path.join(output,row.relative);await fs.mkdir(path.dirname(destination),{recursive:true,mode:0o700});
    if(row.source===info.paths.mizukiFile){
      const db=new DatabaseSync(row.source,{readOnly:true});try{await backup(db,destination);}finally{db.close();}
    }else if(row.source===info.paths.rankedFile){
      if(!dbSaved){const db=new DatabaseSync(row.source,{readOnly:true});try{await backup(db,destination);}finally{db.close();}dbSaved=true;}
      else await fs.copyFile(path.join(output,effective.rankedFile),destination,fs.constants.COPYFILE_EXCL);
    }else{
      const bytes=await fs.readFile(row.source);validateSetting(row.relative,bytes);
      await fs.writeFile(destination,bytes,{flag:'wx',mode:0o600});
      sourceHashes.set(row.source,sha(bytes));
      if(sha(await fs.readFile(row.source))!==sha(bytes))fail('源设置在快照过程中发生变化，请确认服务已停止');
    }
    const bytes=await fs.readFile(destination);await fs.chmod(destination,0o600);
    files.push({path:row.relative,bytes:bytes.length,sha256:sha(bytes)});
  }
  if(!await exists(path.join(output,'state')))await fs.mkdir(path.join(output,'state'),{mode:0o700});
  if(info.database){
    const saved=databaseInfo(path.join(output,effective.rankedFile),accountsInfo(await fs.readFile(path.join(output,effective.usersFile))).ids);
    if(json(saved)!==json(info.database))fail('SQLite 在线备份与检查点逻辑内容不同，请确认停止所有写入后重试');
  }
  if(info.mizuki&&json(mizukiDatabaseInfo(path.join(output,effective.mizukiFile),accountsInfo(await fs.readFile(info.paths.usersFile)).ids))!==json(info.mizuki))fail('水月在线备份逻辑内容不一致');
  const after=await inspectState({project,env});if(json(info)!==json(after))fail('快照期间源数据发生变化，拒绝发布不一致快照');
  for(const [file,hash] of sourceHashes)if(sha(await fs.readFile(file))!==hash)fail('快照期间源配置发生变化，拒绝发布不一致快照');
  const manifest={format:1,kind:'stronghold-state-retention',id:randomUUID(),createdAt:new Date().toISOString(),sourceVersion:JSON.parse(await fs.readFile(path.join(project,'package.json'),'utf8')).version,effective,accounts:info.accounts,database:info.database,mizuki:info.mizuki,ready:info.ready,files:files.sort((a,b)=>sort(a.path,b.path))};
  await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
  await verifySnapshot(output);return {output,id:manifest.id,files:files.length,accounts:info.accounts.count,ready:info.ready};
}
function safeRelative(name){
  if(typeof name!=='string'||!name||name.includes('\\')||name.includes('\0')||name.includes(':')||path.posix.isAbsolute(name)||name.split('/').some(p=>!p||p==='.'||p==='..'))fail('快照清单路径无效');
  return name;
}
export async function verifySnapshot(snapshot){
  await noLinks(snapshot);const manifest=JSON.parse(await fs.readFile(path.join(snapshot,'manifest.json'),'utf8'));
  if(manifest.format!==1||manifest.kind!=='stronghold-state-retention'||!Array.isArray(manifest.files)||!manifest.effective)fail('未知快照格式');
  const seen=new Set();
  for(const row of manifest.files){
    const relative=safeRelative(row.path);if(seen.has(relative))fail('快照包含重复路径');seen.add(relative);
    const file=path.join(snapshot,relative);await noLinks(file);
    if(!(await fs.lstat(file)).isFile())fail('快照包含非普通文件');
    const bytes=await fs.readFile(file);if(bytes.length!==row.bytes||sha(bytes)!==row.sha256)fail('快照文件哈希不匹配');
  }
  for(const name of Object.values(manifest.effective))safeRelative(name);
  if(manifest.effective.directory!=='state'||!seen.has(manifest.effective.usersFile)||manifest.database&&!seen.has(manifest.effective.rankedFile))fail('快照缺少有效账号或数据库');
  const accounts=accountsInfo(await fs.readFile(path.join(snapshot,manifest.effective.usersFile)));
  if(json(accounts.summary)!==json(manifest.accounts))fail('快照账号摘要不匹配');
  if(manifest.database&&json(databaseInfo(path.join(snapshot,manifest.effective.rankedFile),accounts.ids))!==json(manifest.database))fail('快照数据库逻辑校验不匹配');
  if(manifest.mizuki&&(!seen.has(manifest.effective.mizukiFile)||json(mizukiDatabaseInfo(path.join(snapshot,manifest.effective.mizukiFile),accounts.ids))!==json(manifest.mizuki)))fail('水月快照逻辑校验失败');
  if(manifest.ready!==((manifest.database?.ready??true)&&(manifest.mizuki?.ready??true)))fail('快照切换状态不匹配');
  return manifest;
}
export async function restoreState({snapshot,target,project,stopped=false,dryRun=true}){
  const manifest=await verifySnapshot(snapshot);
  project=await fs.realpath(project);target=await privatePath(project,path.resolve(target));snapshot=await fs.realpath(snapshot);
  if(inside(snapshot,target)||inside(target,snapshot))fail('还原目标不能与快照互相包含');
  const settings=await settingsFor(project,{});
  const current=await statePaths(project,settings).catch(e=>{if(e.message.startsWith('未找到实际账号文件'))return null;throw e;});
  if(current)for(const source of [current.directory,current.usersFile,current.rankedFile])if(inside(source,target)||inside(target,source))fail('还原不能覆盖或嵌套当前有效数据');
  const stateFiles=manifest.files.filter(row=>row.path.startsWith('state/')||row.path.startsWith('external/'));
  const result={target,id:manifest.id,files:stateFiles.length,ready:manifest.ready,dryRun};
  if(await exists(target)){
    const receipt=await fs.readFile(path.join(target,'.retention.json'),'utf8').catch(()=>null);
    if(!receipt||JSON.parse(receipt).id!==manifest.id)fail('目标非空或来源不同，拒绝覆盖');
    for(const row of stateFiles)if(sha(await fs.readFile(path.join(target,row.path)))!==row.sha256)fail('已还原数据发生变化，拒绝重新导入旧快照');
    const rows=[];await collect(target,'',rows);
    const expected=new Set([...stateFiles.map(r=>'/'+r.path),'/.retention.json','/candidate-state.env']);
    if(rows.some(r=>!expected.has(r.relative)))fail('已还原目录含新写入文件，拒绝重导');
    return {...result,unchanged:true};
  }
  if(dryRun)return result;
  if(!stopped)fail('实际还原需要 --stopped；只允许写入独立新目录');
  if(!manifest.ready)fail('旧快照仍有运行中对局、待结算或账号锁，请先在原版本完成处理再切换');
  if(/[\r\n'"#]/.test(target))fail('目标路径含不支持的环境文件字符');
  await fs.mkdir(path.dirname(target),{recursive:true,mode:0o700});await fs.mkdir(target,{mode:0o700});
  await fs.mkdir(path.join(target,'state'),{mode:0o700});
  for(const row of stateFiles){const file=path.join(target,row.path);await fs.mkdir(path.dirname(file),{recursive:true,mode:0o700});await fs.copyFile(path.join(snapshot,row.path),file,fs.constants.COPYFILE_EXCL);await fs.chmod(file,0o600);if(sha(await fs.readFile(file))!==row.sha256)fail('还原校验失败');}
  const literal=value=>{if(/[\r\n'"#]/.test(value))fail('目标路径含不支持的环境文件字符');return "'"+value.replaceAll('\\','/')+"'";};
  const environment=['# 独立候选数据副本；不会自动改写原 server.env',...Object.entries({SP_STATE_DIR:manifest.effective.directory,SP_AUTH_USERS_FILE:manifest.effective.usersFile,SP_RANKED_FILE:manifest.effective.rankedFile}).map(([k,v])=>k+'='+literal(path.join(target,v)))].join('\n')+'\n';
  await fs.writeFile(path.join(target,'candidate-state.env'),environment,{flag:'wx',mode:0o600});
  await fs.writeFile(path.join(target,'.retention.json'),JSON.stringify({format:1,id:manifest.id,restoredAt:new Date().toISOString()})+'\n',{flag:'wx',mode:0o600});
  return {...result,envFile:path.join(target,'candidate-state.env')};
}
export async function runStateTransfer(argv){
  const [command,...args]=argv,opts={env:process.env};
  for(let i=0;i<args.length;i++){
    if(args[i]==='--stopped')opts.stopped=true;
    else if(args[i]==='--apply')opts.dryRun=false;
    else if(['--project','--output','--snapshot','--target'].includes(args[i])&&args[i+1])opts[args[i].slice(2)]=path.resolve(args[++i]);
    else fail('参数无效；inspect --project，snapshot --project --output --stopped，restore --project --snapshot --target [--apply --stopped]');
  }
  let result;
  if(command==='inspect'){
    const info=await inspectState(opts);result={accounts:info.accounts,database:info.database,ready:info.ready,note:'只读检查；不包含密码、账号名或环境配置值'};
  }else if(command==='snapshot')result=await snapshotState(opts);
  else if(command==='verify') {const m=await verifySnapshot(opts.snapshot);result={id:m.id,files:m.files.length,ready:m.ready};}
  else if(command==='restore')result=await restoreState(opts);
  else fail('请指定 inspect、snapshot、verify 或 restore');
  console.log(JSON.stringify(result,null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await runStateTransfer(process.argv.slice(2));
