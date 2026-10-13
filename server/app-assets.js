import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { APP_VERSION } from '../shared/constants.js';
import { fixedPath, FIXED_EXTENSIONS } from './resource-policy.js';

export const ART_ROOTS = ['assets', 'fonts', 'icons'];
const ART_EXTS = FIXED_EXTENSIONS;
export function isArtPath(url) {
  return /^\/(assets|fonts|icons)\//.test(url) && ART_EXTS.has(path.posix.extname(url).toLowerCase());
}
const stamp = s => `${s.size}:${s.mtimeMs}:${s.ctimeMs}`;

// Hash only changed files, never during a frame/timer. Manifest checks are coalesced.
export class AppAssets {
  constructor({publicDir, dataDir, sharedDir, simDir}) {
    this.publicDir = publicDir;
    this.roots = [
      ...ART_ROOTS.map(name => ({dir:path.join(publicDir,name),url:`/${name}`,art:true})),
      ...['js','css','vendor'].map(name=>({dir:path.join(publicDir,name),url:`/${name}`,art:false})),
      {dir:dataDir,url:'/data',art:false},{dir:sharedDir,url:'/shared',art:false},{dir:simDir,url:'/sim',art:false},
    ];
    this.hashes = new Map(); this.pending = null; this.snapshot = null;
  }
  async manifest() {
    if (this.pending) return this.pending;
    this.pending = this.scan().finally(()=>{this.pending=null;});
    return this.pending;
  }
  async contentTag(full,stat) {
    const fingerprint=stamp(stat),cached=this.hashes.get(full);
    if(cached?.fingerprint===fingerprint)return cached.hash;
    const hash=createHash('sha256');for await(const chunk of fs.createReadStream(full))hash.update(chunk);
    const value=hash.digest('hex');
    if(stamp(await fsp.stat(full))!==fingerprint)throw new Error('资源正在更新，请稍后重试');
    this.hashes.set(full,{fingerprint,hash:value});return value;
  }
  async scan() {
    const art = createHash('sha256'), all = createHash('sha256').update(APP_VERSION);
    const files = new Map(), fixed = new Map(), seen = new Set();
    const walk = async (dir,url,isArt) => {
      let entries;
      try { entries = await fsp.readdir(dir,{withFileTypes:true}); }
      catch(e) { if(e.code==='ENOENT')return; throw e; }
      entries.sort((a,b)=>a.name.localeCompare(b.name,'en'));
      for(const entry of entries) {
        if(entry.name.startsWith('.') || entry.isSymbolicLink())continue;
        const full=path.join(dir,entry.name), fileUrl=`${url}/${entry.name}`;
        if(entry.isDirectory()){await walk(full,fileUrl,isArt);continue;}
        if(!entry.isFile() || isArt && !isArtPath(fileUrl) && !fileUrl.endsWith('.css'))continue;
        const stat=await fsp.stat(full), fingerprint=stamp(stat);
        seen.add(full);
        let cached=this.hashes.get(full);
        if(!cached || cached.fingerprint!==fingerprint) {
          const hash=createHash('sha256');
          for await(const chunk of fs.createReadStream(full))hash.update(chunk);
          const after=await fsp.stat(full);
          if(stamp(after)!==fingerprint)throw new Error('资源正在更新，请稍后重试');
          cached={fingerprint,hash:hash.digest('hex')};this.hashes.set(full,cached);
        }
        all.update(fileUrl+'\0'+cached.hash+'\n');
        if(fixedPath(fileUrl))fixed.set(fileUrl,{hash:cached.hash,size:stat.size,full});
        if(isArt && isArtPath(fileUrl)){art.update(fileUrl+'\0'+cached.hash+'\n');files.set(fileUrl,fingerprint);}
      }
    };
    for(const root of this.roots)await walk(root.dir,root.url,root.art);
    for(const key of this.hashes.keys())if(!seen.has(key))this.hashes.delete(key);
    this.snapshot={art:art.digest('hex'),revision:all.digest('hex'),files,fixed};
    return {version:1,art:this.snapshot.art,revision:this.snapshot.revision,app:APP_VERSION};
  }
  resolve(url) {
    const match=/^\/app-cache\/([a-f0-9]{64})(\/.*)$/.exec(url);
    if(!match)return null;
    let pathname;
    try{pathname=decodeURIComponent(match[2]);}catch{return null;}
    if(!isArtPath(pathname))return null;
    return {version:match[1],pathname};
  }
  async fresh(url,version) {
    if(!this.snapshot)await this.manifest();
    if(version!==this.snapshot.art)return false;
    const expected=this.snapshot.files.get(url);
    if(!expected)return false;
    const parts=url.slice(1).split('/');
    if(parts.some(s=>s==='.'||s==='..'||s.startsWith('.')||s.includes('\\')))return false;
    try{return stamp(await fsp.stat(path.join(this.publicDir,...parts)))===expected;}
    catch{return false;}
  }
  css(text,pathname) {
    const version=this.snapshot?.art;
    if(!version)return text;
    return text.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g,(original,quote,value)=>{
      try {
        const url=new URL(value,`http://app.invalid${pathname}`);
        if(url.origin!=='http://app.invalid'||!isArtPath(url.pathname))return original;
        return `url("/app-cache/${version}${url.pathname}${url.search}${url.hash}")`;
      }catch{return original;}
    });
  }
}
