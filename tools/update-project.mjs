// Copy a release into a stopped installation without replacing its accounts, database or APK signing key.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deploymentSettings } from '../server/state-paths.js';
import {CLIENT_DOWNLOADS} from '../server/client-downloads.js';
import {retiredResources,fileHash} from './retired-resources.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['config','storage','node_modules','.git','.cache','.backups','.codex','.agents','.signing']);
const installers=new Set([...CLIENT_DOWNLOADS.keys(),...[...CLIENT_DOWNLOADS.keys()].map(n=>n+'.sha256')].map(n=>'mobile/dist/'+n));
const contains = (parent,child) => {const rel=path.relative(parent,child);return !rel || !rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel);};
export async function updateProject({source,target,stopped=false}) {
  if(!stopped)throw new Error('请先暂停新排位、等待已有对局结束并停止服务器，再使用 --stopped 更新。');
  source=await fs.realpath(source);target=await fs.realpath(target);
  if(contains(source,target)||contains(target,source))throw new Error('新版本目录与部署目录不能相同或互相包含');
  const from=JSON.parse(await fs.readFile(path.join(source,'package.json'),'utf8'));
  const to=JSON.parse(await fs.readFile(path.join(target,'package.json'),'utf8'));
  if(from.name!=='stronghold-protocol-covenant'||to.name!==from.name)throw new Error('目标不是卫戍协议项目，拒绝更新');
  const settings=await deploymentSettings(target);
  const protectedFiles=[];
  const protectedDirectories=['config','storage'];
  if(settings.SP_STATE_DIR) {
    const directory=path.resolve(target,settings.SP_STATE_DIR);
    if(contains(target,directory)) {
      const relative=path.relative(target,directory);
      if(!relative)throw new Error('SP_STATE_DIR 不能是源码根目录，请使用独立私有文件夹');
      protectedFiles.push(relative);protectedDirectories.push(relative);
    }
  }
  for(const key of ['SP_AUTH_USERS_FILE','SP_RANKED_FILE'])if(settings[key] && settings[key]!==':memory:') {
    const file=path.resolve(target,settings[key]);
    if(contains(target,file)) {
      const relative=path.relative(target,file);protectedFiles.push(relative);
      if(key==='SP_RANKED_FILE')protectedFiles.push(relative+'-wal',relative+'-shm');
    }
  }
  const plan=[];
  const walk=async(dir,rel='')=>{
    for(const entry of await fs.readdir(dir,{withFileTypes:true})) {
      const portable=path.join(rel,entry.name).replaceAll('\\','/');
      if(portable==='mobile/full-dist'||portable.startsWith('mobile/full-dist/'))continue;
      if(portable==='mobile/offline-dist'||portable.startsWith('mobile/offline-dist/'))continue;
      if(portable.startsWith('mobile/dist/')&&!installers.has(portable))continue;
      if(/^(mobile\/windows|test\/(?:windows-cache|resource-scenes))\/(bin|obj)(\/|$)/.test(portable))continue;
      if(excluded.has(entry.name)||entry.name.startsWith('.env')||entry.name.startsWith('.codex')||entry.name==='server.env'||entry.name==='auth-users.json'||entry.name==='test-content-access.json'||/\.sqlite(?:-|$)/.test(entry.name)||(entry.name.endsWith('.apk')||entry.name.endsWith('.sha256'))&&!installers.has(portable))continue;
      if(entry.isSymbolicLink())throw new Error(`新版本包含符号链接，拒绝复制：${path.join(rel,entry.name)}`);
      const next=path.join(rel,entry.name),full=path.join(dir,entry.name);
      if(protectedFiles.some(file=>next===file||next.startsWith(file+path.sep)))continue;
      if(entry.isDirectory())await walk(full,next);else if(entry.isFile())plan.push(next);
    }
  };
  await walk(source);
  const retirements=await retiredResources({source,target,protectedFiles});
  // Refuse symlinked target parents before any source writes, including existing files.
  for(const relative of plan) {
    let part=target;
    for(const segment of relative.split(path.sep)){
      part=path.join(part,segment);
      try{if((await fs.lstat(part)).isSymbolicLink())throw new Error(`目标含符号链接，拒绝覆盖：${relative}`);}
      catch(e){if(e.code!=='ENOENT')throw e;}
    }
  }
  const backup=path.join(target,'.backups',new Date().toISOString().replace(/[:.]/g,'-'));
  try{if((await fs.lstat(path.dirname(backup))).isSymbolicLink())throw new Error('备份目录不能是符号链接');}
  catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.mkdir(backup,{recursive:true,mode:0o700});
  const privateDirectories=[...new Set(protectedDirectories)].filter((dir,index,dirs)=>!dirs.some((other,i)=>i!==index&&dir.startsWith(other+path.sep)));
  const backupFiles=[...privateDirectories,'.env','.env.local','mobile/android/.signing',...protectedFiles.filter(file=>!privateDirectories.some(dir=>file===dir||file.startsWith(dir+path.sep)))];
  for(const relative of [...new Set(backupFiles)]) {
    const full=path.join(target,relative);
    try{await fs.lstat(full);}catch(e){if(e.code==='ENOENT')continue;throw e;}
    await fs.cp(full,path.join(backup,relative),{recursive:true,errorOnExist:true,force:false,dereference:false});
  }
  // External state is untouched by source copying; back up its selected files as well.
  const externalDir=settings.SP_STATE_DIR ? path.resolve(target,settings.SP_STATE_DIR) : null;
  const externalFiles={
    testAccess:externalDir&&path.join(externalDir,'test-content-access.json'),
    accounts:settings.SP_AUTH_USERS_FILE ? path.resolve(target,settings.SP_AUTH_USERS_FILE) : externalDir&&path.join(externalDir,'auth-users.json'),
    ranked:settings.SP_RANKED_FILE === ':memory:' ? null : settings.SP_RANKED_FILE ? path.resolve(target,settings.SP_RANKED_FILE) : externalDir&&path.join(externalDir,'ranked.sqlite')
  };
  for(const [label,file] of Object.entries(externalFiles))if(file&&!contains(target,file)) {
    for(const suffix of label==='ranked'?['','-wal','-shm']:['']) {
      try{await fs.lstat(file+suffix);}catch(e){if(e.code==='ENOENT')continue;throw e;}
      await fs.cp(file+suffix,path.join(backup,'external',label+suffix),{errorOnExist:true,force:false,dereference:false});
    }
  }
  await fs.writeFile(path.join(backup,'update.json'),JSON.stringify({from:to.version,to:from.version,createdAt:new Date().toISOString(),files:plan.length},null,2),{flag:'wx',mode:0o600});
  for(const f of retirements){const saved=path.join(backup,'retired-resources',f.relative);await fs.mkdir(path.dirname(saved),{recursive:true});await fs.copyFile(f.full,saved);}
  for(const relative of plan){const destination=path.join(target,relative);await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(path.join(source,relative),destination);}
  const retired=[];
  for(const f of retirements)if(await fileHash(f.full)===f.sha256){await fs.unlink(f.full);retired.push(f.path);}
  return {backup,files:plan.length,version:from.version,retiredResources:retired};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2),opts={source:root};
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--stopped')opts.stopped=true;
    else if(['--source','--target'].includes(args[i])&&args[i+1])opts[args[i].slice(2)]=path.resolve(args[++i]);
    else throw new Error('用法：node tools/update-project.mjs --target <现有部署目录> [--source <新版本目录>] --stopped');
  }
  if(!opts.target)throw new Error('必须指定现有部署目录 --target');
  const result=await updateProject(opts);
  console.log(`源码已更新至 ${result.version}，共 ${result.files} 个文件；已备份并清理 ${result.retiredResources.length} 个已退出的原版资源。账号、数据库、配置和签名保持原位。\n更新前备份：${result.backup}\n请在部署目录执行 npm ci，再使用原配置启动服务器。`);
}
