import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fixedPath} from './resource-policy.js';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const packVersion = catalog => sha256(JSON.stringify({format:1,art:catalog.art,files:catalog.files}));
const hash = v => typeof v==='string' && /^[a-f0-9]{64}$/.test(v);
export function validateCatalog(catalog) {
  if(catalog?.format!==1 || !hash(catalog.version) || !hash(catalog.art) || !Array.isArray(catalog.files) || catalog.files.length>50000)throw new Error('资源包清单格式无效');
  const paths=new Set();
  for(const f of catalog.files){
    if(!fixedPath(f.path) || paths.has(f.path) || !hash(f.hash) || !Number.isSafeInteger(f.size) || f.size<=0 || f.size>256*1024*1024 || typeof f.mime!=='string' || /[\r\n]/.test(f.mime))throw new Error('资源包包含无效文件');
    paths.add(f.path);
  }
  if(packVersion(catalog)!==catalog.version)throw new Error('资源包版本校验失败');
  return catalog;
}
// Artifacts are built offline. Requests never generate archives or write player state.
export class ResourcePacks {
  constructor(directory){this.directory=directory;this.loaded=null;}
  async current(snapshot) {
    let text;try{text=await fs.readFile(path.join(this.directory,'current.json'),'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}
    if(this.loaded?.text!==text){
      const descriptor=JSON.parse(text);
      if(descriptor.format!==1 || !hash(descriptor.version) || !hash(descriptor.catalog?.sha256) || !hash(descriptor.archive?.sha256))throw new Error('资源包描述无效');
      const bytes=await fs.readFile(path.join(this.directory,descriptor.version+'.json'));
      if(sha256(bytes)!==descriptor.catalog.sha256)throw new Error('资源包清单损坏');
      const catalog=validateCatalog(JSON.parse(bytes));
      if(catalog.version!==descriptor.version || catalog.art!==descriptor.art || descriptor.catalog.url!==`/app/resource-catalog/${catalog.version}.json` || descriptor.archive.url!==`/app/resource-pack/${descriptor.archive.sha256}.zip`)throw new Error('资源包描述不匹配');
      this.loaded={text,descriptor,catalog,bytes,byHash:new Map(catalog.files.map(f=>[f.hash,f]))};
    }
    const {catalog,descriptor}=this.loaded;
    if(snapshot.art!==catalog.art || snapshot.fixed.size!==catalog.files.length || catalog.files.some(f=>snapshot.fixed.get(f.path)?.hash!==f.hash))return null;
    return descriptor;
  }
  async resolve(route,snapshot) {
    if(!await this.current(snapshot))return null;
    const {descriptor,catalog,byHash}=this.loaded;
    if(route===descriptor.catalog.url)return {full:path.join(this.directory,catalog.version+'.json'),hash:descriptor.catalog.sha256,mime:'application/json'};
    if(route===descriptor.archive.url)return {full:path.join(this.directory,descriptor.archive.sha256+'.zip'),hash:descriptor.archive.sha256,mime:'application/zip'};
    const match=/^\/app\/resource-file\/([a-f0-9]{64})$/.exec(route),file=match&&byHash.get(match[1]);
    return file ? {...snapshot.fixed.get(file.path),mime:file.mime} : null;
  }
}
