import fs from 'node:fs/promises';import path from 'node:path';import {randomUUID} from 'node:crypto';
const exists=async file=>{try{await fs.access(file);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const same=(a,b)=>process.platform==='win32'?a.toLowerCase()===b.toLowerCase():a===b;
/** Private deployment anchor, excluded from releases. A wrong path or missing known file must not open an empty account store. */
export async function statePin(root,paths,{generation,ranked=true}={}){
  const filename=path.join(root,'config','state-location.json');let prior=null;
  try{if((await fs.lstat(filename)).isSymbolicLink())throw Error('持久化路径锚点不能为链接');prior=JSON.parse(await fs.readFile(filename,'utf8'));if(prior.format!==1||!prior.paths||!Array.isArray(prior.required))throw Error('持久化路径锚点格式无效');}catch(e){if(e.code!=='ENOENT')throw e;}
  if(prior){
    for(const key of ['directory','usersFile','rankedFile'])if(!same(path.resolve(root,prior.paths[key]),path.resolve(paths[key])))throw Error('实际数据路径与本服已固定路径不一致：'+key+'。拒绝切换到空存档，请核对原server.env。');
    for(const file of prior.required)if(!await exists(path.resolve(root,file)))throw Error('此前存在的持久化文件已缺失：'+path.basename(file)+'。拒绝初始化空数据。');
  }
  if(generation&&ranked&&!await exists(paths.rankedFile))throw Error('服务器已有运行记录但排位/历史数据库缺失，拒绝创建空库。请核对原数据目录。');
  const portable=file=>{const rel=path.relative(root,file);return rel&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel)?rel.split(path.sep).join('/'):file;};
  return {filename,async save(){
    const files=[paths.usersFile,...(ranked?[paths.rankedFile]:[]),...['operator-loadouts.json','account-archive.json'].map(f=>path.join(paths.directory,f))],required=new Set(prior?.required||[]);
    for(const file of files)if(await exists(file))required.add(portable(file));
    const doc={format:1,paths:Object.fromEntries(['directory','usersFile','rankedFile'].map(k=>[k,portable(paths[k])])),required:[...required].sort()};
    if(JSON.stringify(doc)===JSON.stringify(prior))return;
    await fs.mkdir(path.dirname(filename),{recursive:true,mode:0o700});const temp=filename+'.'+randomUUID()+'.tmp';try{await fs.writeFile(temp,JSON.stringify(doc,null,2)+'\n',{flag:'wx',mode:0o600});await fs.rename(temp,filename);prior=doc;}finally{await fs.rm(temp,{force:true});}
  }};
}
