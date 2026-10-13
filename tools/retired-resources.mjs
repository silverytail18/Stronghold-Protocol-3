// Explicit retirement list: public art only, known content hashes, no directory pruning.
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fixedPath} from '../server/resource-policy.js';
const inside=(parent,file)=>{const rel=path.relative(parent,file);return !!rel&&!path.isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+path.sep);};
export async function fileHash(file){const h=createHash('sha256');for await(const b of createReadStream(file))h.update(b);return h.digest('hex');}
export async function retiredResources({source,target,protectedFiles=[]}){
  let spec;try{spec=JSON.parse(await fs.readFile(path.join(source,'tools/retired-resources.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return[];throw e;}
  if(spec.format!==1||!Array.isArray(spec.files)||spec.files.length>1000)throw new Error('退出资源清单格式无效');
  const result=[],seen=new Set();
  for(const f of spec.files){
    if(typeof f.path!=='string'||!/^public\/(assets|fonts|icons)\//.test(f.path)||!fixedPath(f.path.slice('public'.length))||!/^[a-f0-9]{64}$/.test(f.sha256)||seen.has(f.path))throw new Error('退出资源清单包含非法路径或哈希');
    seen.add(f.path);const relative=f.path.split('/').join(path.sep),full=path.resolve(target,relative),newFile=path.resolve(source,relative);
    if(!inside(path.join(target,'public'),full)||!inside(path.join(source,'public'),newFile))throw new Error('退出资源路径越界');
    if(protectedFiles.some(p=>relative===p||relative.startsWith(p+path.sep)))continue;
    // A future release may bring the same path back. Its source file always wins.
    try{await fs.lstat(newFile);continue;}catch(e){if(e.code!=='ENOENT')throw e;}
    let part=target,stat;
    for(const segment of relative.split(path.sep)){part=path.join(part,segment);try{stat=await fs.lstat(part);if(stat.isSymbolicLink())throw new Error('退出资源目标含符号链接，拒绝更新：'+f.path);}catch(e){if(e.code==='ENOENT'){stat=null;break;}throw e;}}
    if(stat?.isFile()&&await fileHash(full)===f.sha256)result.push({...f,relative,full});
  }
  return result;
}
