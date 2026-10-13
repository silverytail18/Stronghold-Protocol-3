// A stopped deployment can relocate its account/score pair without changing identities or deleting originals.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { DatabaseSync, backup } from 'node:sqlite';
import { validateUsers } from '../server/auth.js';
import { resolveStatePaths, deploymentSettings, assertStateFiles } from '../server/state-paths.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contains = (parent, child) => { const rel=path.relative(parent,child);return !rel||rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel); };
const exists = async file => { try { await fs.lstat(file); return true; } catch(e) { if(e.code==='ENOENT')return false;throw e; } };
async function validateDatabase(file) {
  const db = new DatabaseSync(file, {readOnly:true});
  try {
    if(db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value !== '1')throw new Error('未知排位数据库格式，拒绝迁移');
    if(db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok')throw new Error('数据库完整性校验失败，拒绝迁移');
  } finally { db.close(); }
}
export async function migrateState({project=root,to,stopped=false,env=process.env}) {
  if(!stopped)throw new Error('请等待对局结束并停止服务器，然后使用 --stopped 迁移。');
  project=await fs.realpath(project);
  const settings=await deploymentSettings(project,env), source=resolveStatePaths(project,settings);
  assertStateFiles(project,source,settings);
  if(source.rankedFile===':memory:')throw new Error('内存数据库不能作为持久化迁移源');
  to=path.resolve(project,to||'storage');
  if(to===project)throw new Error('数据目录必须独立于源码根目录');
  // Resolve symlink ancestors before any writes so private data cannot land in a served directory.
  let ancestor=to;
  while(!await exists(ancestor))ancestor=path.dirname(ancestor);
  const canonical=path.join(await fs.realpath(ancestor),path.relative(ancestor,to));
  for(const folder of ['public','data','shared','server/sim']) {
    const served=await fs.realpath(path.join(project,folder)).catch(()=>path.join(project,folder));
    if(contains(served,canonical))throw new Error('持久化数据不能放在网页可访问目录');
  }
  to=canonical;
  if(to===project||to.includes("'")||/[\r\n]/.test(to))throw new Error('请使用独立私有数据目录，路径不能包含单引号或换行');
  const destination={usersFile:path.join(to,'auth-users.json'),rankedFile:path.join(to,'ranked.sqlite')};
  if(source.usersFile===destination.usersFile&&source.rankedFile===destination.rankedFile)return {directory:to,unchanged:true};
  for(const file of [destination.usersFile,destination.rankedFile,destination.rankedFile+'-wal',destination.rankedFile+'-shm']) {
    if(await exists(file))throw new Error('目标已有账号或数据库，拒绝覆盖；请选择空数据目录');
  }
  const hasUsers=await exists(source.usersFile),hasRanked=await exists(source.rankedFile);
  if(!hasRanked && (await exists(source.rankedFile+'-wal') || await exists(source.rankedFile+'-shm')))throw new Error('数据库主文件缺失但仍有 WAL / SHM，拒绝遗漏迁移；请恢复完整数据库');
  let accounts;
  if(hasUsers) { accounts=await fs.readFile(source.usersFile); const parsed=JSON.parse(accounts);validateUsers(parsed);
    if(parsed.users.some(user=>!user.accountId))throw new Error('旧账号缺少 accountId，请先使用现有版本启动一次完成兼容升级，再停服迁移'); }
  if(hasRanked)await validateDatabase(source.rankedFile);
  const configFile=path.join(project,'config','server.env');
  const originalConfig=await fs.readFile(configFile,'utf8').catch(e=>{if(e.code==='ENOENT')return '';throw e;});
  const snapshot=path.join(project,'.backups','state-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8));
  try { if((await fs.lstat(path.dirname(snapshot))).isSymbolicLink())throw new Error('备份目录不能是符号链接'); }
  catch(e) { if(e.code!=='ENOENT')throw e; }
  await fs.mkdir(snapshot,{recursive:true,mode:0o700});
  if(hasUsers)await fs.writeFile(path.join(snapshot,'auth-users.json'),accounts,{flag:'wx',mode:0o600});
  if(hasRanked) {
    const db=new DatabaseSync(source.rankedFile,{readOnly:true});
    try{await backup(db,path.join(snapshot,'ranked.sqlite'));}finally{db.close();}
    await validateDatabase(path.join(snapshot,'ranked.sqlite'));
    const snapshotDb=new DatabaseSync(path.join(snapshot,'ranked.sqlite'),{readOnly:true});
    try { const known=new Set(JSON.parse(accounts).users.map(user=>user.accountId));
      const rows=snapshotDb.prepare('SELECT id FROM accounts').all();
      if(rows.length&&!rows.some(row=>known.has(row.id)))throw new Error('数据库与账号身份不匹配，请提供同一套文件');
    } finally {snapshotDb.close();}
  }
  await fs.writeFile(path.join(snapshot,'server.env'),originalConfig,{flag:'wx',mode:0o600});
  await fs.mkdir(to,{recursive:true,mode:0o700});
  // Exclusive files are safe to retain on failure; configuration changes only after both copies validate.
  if(hasUsers)await fs.copyFile(path.join(snapshot,'auth-users.json'),destination.usersFile,fs.constants.COPYFILE_EXCL);
  if(hasRanked) { await fs.copyFile(path.join(snapshot,'ranked.sqlite'),destination.rankedFile,fs.constants.COPYFILE_EXCL);await validateDatabase(destination.rankedFile); }
  for(const file of [destination.usersFile,destination.rankedFile])if(await exists(file))await fs.chmod(file,0o600);
  const quote=value=>"'"+value.replaceAll('\\','/')+"'";
  const retained=originalConfig.split(/\r?\n/).filter(line=>!/^\s*(?:export\s+)?(?:SP_STATE_DIR|SP_AUTH_USERS_FILE|SP_RANKED_FILE)\s*=/.test(line)).join('\n').replace(/\n*$/,'');
  const text=retained+'\nSP_STATE_DIR='+quote(to)+'\nSP_AUTH_USERS_FILE='+quote(destination.usersFile)+'\nSP_RANKED_FILE='+quote(destination.rankedFile)+'\n';
  await fs.mkdir(path.dirname(configFile),{recursive:true,mode:0o700});
  const temporary=configFile+'.'+randomUUID()+'.tmp';
  try{await fs.writeFile(temporary,text,{flag:'wx',mode:0o600});await fs.rename(temporary,configFile);}finally{await fs.rm(temporary,{force:true});}
  return {directory:to,backup:snapshot,users:hasUsers,ranked:hasRanked,configFile};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--stopped')options.stopped=true;
    else if(['--to','--project'].includes(args[i])&&args[i+1])options[args[i].slice(2)]=args[++i];
    else throw new Error('用法：node tools/migrate-state.mjs --to <私有固定数据目录> [--project <部署目录>] --stopped');
  }
  const result=await migrateState(options);
  console.log(JSON.stringify(result,null,2));
  console.log('原数据文件保留；请使用 config/server.env 启动新源码，不要用旧环境变量覆盖新的数据路径。');
}
