// Build a Linux source release without deployment state, signing keys or full installers.
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {CLIENT_DOWNLOADS} from '../server/client-downloads.js';
import {deploymentSettings} from '../server/state-paths.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceDirs=['server','shared','public','data','resource-packs','tools','scripts','docs','test','mobile'];
const rootFiles=['package.json','package-lock.json','README.md','AGENTS.md','CHANGELOG.md','LICENSE','NOTICE.md','THIRD-PARTY-NOTICES.md','.gitignore','.gitattributes'];
const installers=new Set([...CLIENT_DOWNLOADS.keys(),...[...CLIENT_DOWNLOADS.keys()].map(file=>file+'.sha256')].map(file=>'mobile/dist/'+file));
const excludedDirs=new Set(['config','storage','node_modules','.git','.cache','.backups','.agents','.signing','.gradle','build','bin','obj','out']);
const inside=(parent,file)=>{const rel=path.relative(parent,file);return !rel||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));};

export async function releaseFiles(source=root,settings){
  source=await fs.realpath(source);settings??=await deploymentSettings(source);
  const privatePaths=[];
  for(const key of ['SP_STATE_DIR','SP_AUTH_USERS_FILE','SP_RANKED_FILE'])if(settings[key]&&settings[key]!==':memory:'){
    const full=path.resolve(source,settings[key]);
    if(inside(source,full)){const rel=path.relative(source,full).replaceAll('\\','/');if(!rel)throw new Error('持久化目录不能是源码根目录');privatePaths.push(rel);if(key==='SP_RANKED_FILE')privatePaths.push(rel+'-wal',rel+'-shm');}
  }
  const files=[];
  let activePacks=null;
  try {
    const current=JSON.parse(await fs.readFile(path.join(source,'resource-packs/current.json'),'utf8'));
    if(/^[a-f0-9]{64}$/.test(current.version)&&/^[a-f0-9]{64}$/.test(current.archive?.sha256))activePacks=new Set(['current.json',current.version+'.json',current.archive.sha256+'.zip']);
  } catch { /* Older source fixtures may have no resource descriptor. */ }
  const visit=async rel=>{
    const name=path.posix.basename(rel);
    if(activePacks&&rel.startsWith('resource-packs/')&&!activePacks.has(name))return;
    if(privatePaths.some(file=>rel===file||rel.startsWith(file+'/')))return;
    if(excludedDirs.has(name)||name.startsWith('.codex')||name.startsWith('.env')||name.startsWith('.')&&!rootFiles.includes(rel))return;
    if(rel==='mobile/full-dist'||rel.startsWith('mobile/full-dist/'))return;
    if(rel==='mobile/offline-dist'||rel.startsWith('mobile/offline-dist/'))return;
    if(rel.startsWith('mobile/dist/')&&!installers.has(rel))return;
    if(['server.env','auth-users.json','test-content-access.json','credentials.json','local.properties','service.env.cmd'].includes(name)||/\.(?:sqlite|db)(?:-|$)|\.(?:p12|pfx|jks|keystore|log|tmp)$/.test(name))return;
    if(/\.(?:apk|sha256)$/.test(name)&&!installers.has(rel))return;
    const full=path.join(source,rel);let stat;try{stat=await fs.lstat(full);}catch(e){if(e.code==='ENOENT')return;throw e;}
    if(stat.isSymbolicLink())throw new Error('发布文件不能包含符号链接：'+rel);
    if(stat.isDirectory())for(const item of await fs.readdir(full))await visit(rel+'/'+item);
    else if(stat.isFile())files.push(rel);
  };
  for(const rel of [...rootFiles,...sourceDirs])await visit(rel);
  return files.sort();
}

async function hashFile(file){const hash=createHash('sha256');for await(const b of createReadStream(file))hash.update(b);return hash.digest('hex');}
async function run(cmd,args){await new Promise((resolve,reject)=>{const child=spawn(cmd,args,{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(cmd+' exited '+code)));});}

export async function buildServerRelease({source=root,output}={}){
  source=await fs.realpath(source);if(!output)throw new Error('请指定 --output <服务器发布包.tar.gz>');output=path.resolve(output);
  if(inside(source,output))throw new Error('发布包应输出到项目目录以外，避免重复打包');
  for(const file of [output,output+'.sha256',output+'.manifest.json']){try{await fs.access(file);throw new Error('输出已存在，拒绝覆盖：'+file);}catch(e){if(e.code!=='ENOENT')throw e;}}
  const files=await releaseFiles(source);
  for(const required of ['package.json','package-lock.json','server/index.js','public/vendor/preact.module.js','resource-packs/current.json',...installers])if(!files.includes(required))throw new Error('发布所需文件缺失：'+required);
  const current=JSON.parse(await fs.readFile(path.join(source,'resource-packs/current.json'),'utf8'));
  for(const required of ['resource-packs/'+current.version+'.json','resource-packs/'+current.archive.sha256+'.zip'])if(!files.includes(required))throw new Error('资源包文件缺失：'+required);
  await fs.mkdir(path.dirname(output),{recursive:true});const stage=await fs.mkdtemp(path.join(path.dirname(output),'.server-release-'));const folder=path.join(stage,'w3-release');await fs.mkdir(folder);
  try{
    let cursor=0;const manifest=[];
    await Promise.all(Array.from({length:12},async()=>{while(cursor<files.length){const relative=files[cursor++],full=path.join(source,relative),target=path.join(folder,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(full,target);const stat=await fs.stat(target);manifest.push({path:relative,bytes:stat.size,sha256:await hashFile(target)});}}));
    manifest.sort((a,b)=>a.path.localeCompare(b.path,'en'));
    const info={version:JSON.parse(await fs.readFile(path.join(source,'package.json'),'utf8')).version,kind:'linux-source-light-clients',files:manifest,resourceVersion:current.version};
    await fs.writeFile(path.join(folder,'RELEASE-MANIFEST.json'),JSON.stringify(info,null,2)+'\n');
    console.log('已准备 '+files.length+' 个公开源码、运行资源及轻量客户端文件；开始压缩…');
    const partial=output+'.partial';try{await fs.access(partial);throw new Error('存在未完成发布包，请检查：'+partial);}catch(e){if(e.code!=='ENOENT')throw e;}
    await run('tar',['-czf',partial,'-C',stage,'w3-release']);await fs.rename(partial,output);
    const hash=await hashFile(output);await fs.writeFile(output+'.sha256',hash+'  '+path.basename(output)+'\n',{flag:'wx'});
    await fs.writeFile(output+'.manifest.json',JSON.stringify(info,null,2)+'\n',{flag:'wx'});
    return{output,sha256:hash,bytes:(await fs.stat(output)).size,files:files.length,resourceVersion:current.version};
  }finally{if(inside(path.dirname(output),stage)&&path.basename(stage).startsWith('.server-release-'))await fs.rm(stage,{recursive:true,force:true});}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--output')throw new Error('用法：node tools/build-server-release.mjs --output <项目外的发布包.tar.gz>');
  console.log(JSON.stringify(await buildServerRelease({output:args[1]}),null,2));
}
