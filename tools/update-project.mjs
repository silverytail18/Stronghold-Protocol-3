// Update a stopped installation from a verified source-only release; preserve every private state location.
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {randomUUID} from 'node:crypto';
import {settingsFor,inspectState,snapshotState,verifySnapshot} from '../server/product/retention.js';
import {hashFile} from './client-resources.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contains=(parent,child)=>{const relative=path.relative(parent,child);return !relative||relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative);};
const portable=value=>value.split(path.sep).join('/');
const valid=value=>typeof value==='string'&&value.length<1024&&!value.startsWith('/')&&!value.includes('\\')&&!value.split('/').some(part=>!part||part==='.'||part==='..');
const privatePath=value=>/^(?:config|storage|node_modules|\.git|\.cache|\.backups|\.codex|\.agents|client-updates\/blobs\/\.private)(?:\/|$)/.test(value)||value.startsWith('.env')||value.split('/').includes('.signing')||/\.(?:sqlite|sqlite-wal|sqlite-shm|p12|jks|keystore)$/.test(value);
async function noLinks(root,relative){let current=root;for(const part of relative.split('/')){current=path.join(current,part);try{if((await fs.lstat(current)).isSymbolicLink())throw Error('拒绝符号链接路径：'+relative);}catch(e){if(e.code!=='ENOENT')throw e;}}}
export async function updateProject({source=ROOT,target,stopped=false,env=process.env}) {
  if(!stopped)throw Error('请暂停新开局、等待已有对局与待结算完成并停止服务器，再使用 --stopped');
  source=await fs.realpath(source);target=await fs.realpath(target);if(contains(source,target)||contains(target,source))throw Error('发布目录和部署目录不能相同或互相包含');
  const before=JSON.parse(await fs.readFile(path.join(target,'package.json'),'utf8')),after=JSON.parse(await fs.readFile(path.join(source,'package.json'),'utf8'));
  if(!['stronghold-protocol-covenant','stronghold-protocol-alliance'].includes(before.name)||after.name!=='stronghold-protocol-alliance')throw Error('不是兼容的卫戍协议部署目录');
  const manifest=JSON.parse(await fs.readFile(path.join(source,'SERVER-RELEASE.json'),'utf8'));
  if(manifest.format!==1||manifest.version!==after.version||!Array.isArray(manifest.files)||!manifest.files.length)throw Error('服务器发布清单无效');
  const state=await inspectState({project:target,env});if(!state.ready)throw Error('旧服务还有运行、待结算记录或账号锁，请先由旧版本完成处理');
  const settings=await settingsFor(target,env),protectedPaths=['config','storage','mobile/.signing','mobile/android/.signing'];
  for(const key of ['SP_STATE_DIR','SP_AUTH_USERS_FILE','SP_RANKED_FILE']){const value=settings[key];if(!value||value===':memory:')continue;const full=path.resolve(target,value);if(contains(target,full)){const relative=portable(path.relative(target,full));if(!relative)throw Error('私有状态不能位于源码根目录');protectedPaths.push(relative);if(key==='SP_RANKED_FILE')protectedPaths.push(relative+'-wal',relative+'-shm');}}
  const protectedFile=value=>privatePath(value)||protectedPaths.some(item=>value===item||value.startsWith(item+'/'));
  const found=new Set();for(const row of manifest.files){if(!valid(row.path)||protectedFile(row.path)||found.has(row.path)||!Number.isSafeInteger(row.size)||row.size<0||!/^[a-f0-9]{64}$/.test(row.sha256))throw Error('发布路径或条目不合法');found.add(row.path);await noLinks(source,row.path);await noLinks(target,row.path);const filename=path.join(source,row.path);if((await fs.stat(filename)).size!==row.size||await hashFile(filename)!==row.sha256)throw Error('发布文件校验失败：'+row.path);}
  for(const name of ['package.json','package-lock.json','server/product/game-server.js','tools/update-project.mjs','mobile/resource-update-public.pem','client-updates/client.json'])if(!found.has(name))throw Error('发布缺少必要文件：'+name);
  // Managed runtime roots are replaced as a set. Other user files, installers, art and plugins stay on disk.
  const managed=['server','shared','public/js','public/css','public/product','data','tools'];const previous=[];
  async function walk(directory,relative){let entries;try{entries=await fs.readdir(directory,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}for(const entry of entries){const key=relative+'/'+entry.name;if(protectedFile(key))continue;if(entry.isSymbolicLink())throw Error('旧源码含符号链接：'+key);if(entry.isDirectory())await walk(path.join(directory,entry.name),key);else if(entry.isFile())previous.push(key);}}
  for(const name of managed){await noLinks(target,name);await walk(path.join(target,name),name);}
  const removals=previous.filter(name=>!found.has(name));const stamp=new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8),backup=path.join(target,'.backups','upstream-'+stamp);
  await noLinks(target,'.backups');await fs.mkdir(backup,{recursive:true,mode:0o700});
  const stateBackup=await snapshotState({project:target,output:path.join(backup,'private-state'),stopped:true,env});await verifySnapshot(stateBackup.output);
  // Back up every replaced and retired source file before writing any source change.
  const replaced=[];for(const name of new Set([...previous,...manifest.files.map(row=>row.path),'SERVER-RELEASE.json'])){let stat;try{stat=await fs.lstat(path.join(target,name));}catch(e){if(e.code==='ENOENT')continue;throw e;}if(!stat.isFile()||stat.isSymbolicLink())throw Error('目标不是普通文件：'+name);const saved=path.join(backup,'source',name);await fs.mkdir(path.dirname(saved),{recursive:true});await fs.copyFile(path.join(target,name),saved,1);replaced.push(name);}
  await fs.writeFile(path.join(backup,'update.json'),JSON.stringify({format:1,from:before.version,to:after.version,files:manifest.files.map(row=>row.path),replaced,removals},null,2),{flag:'wx'});
  try{
    for(const row of manifest.files){const filename=path.join(target,row.path);await fs.mkdir(path.dirname(filename),{recursive:true});const temporary=filename+'.update-'+stamp;await fs.copyFile(path.join(source,row.path),temporary,1);await fs.rename(temporary,filename);}
    for(const name of removals)await fs.unlink(path.join(target,name));
    await fs.copyFile(path.join(source,'SERVER-RELEASE.json'),path.join(target,'SERVER-RELEASE.json'));
    for(const row of manifest.files)if(await hashFile(path.join(target,row.path))!==row.sha256)throw Error('更新后校验失败：'+row.path);
  }catch(error){await fs.writeFile(path.join(backup,'FAILED.txt'),String(error)+'\n请保持停服，按update.json恢复source备份；真实状态未被源码更新覆盖。');throw Object.assign(Error('更新未完成，请保持停服并从已验证备份恢复：'+backup,{cause:error}),{backup});}
  return{backup,version:after.version,files:manifest.files.length,removed:removals.length,statePreserved:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const options={};for(let i=2;i<process.argv.length;i++){const value=process.argv[i];if(value==='--stopped')options.stopped=true;else if(['--source','--target'].includes(value)&&process.argv[i+1])options[value.slice(2)]=process.argv[++i];else throw Error('用法：node tools/update-project.mjs --source <解包目录> --target <已停服部署目录> --stopped');}if(!options.target)throw Error('必须明确部署目录');console.log(await updateProject(options));
}
