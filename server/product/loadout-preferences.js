// Private, account-owned preferences. These never enable operators in a match.
import fs from 'node:fs/promises';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {accountEntriesValid as isLoadoutEntries,accountByCharValid as byCharValid,accountOpsValid as opsValid,accountSkinsValid,entrySkins,withEntrySkins} from '../../shared/account-loadout.js';
const error=(message,status=400)=>Object.assign(new Error(message),{status});
const validRow=r=>r&&Number.isSafeInteger(r.revision)&&r.revision>=1&&isLoadoutEntries(r.entries)&&(r.byChar===undefined||byCharValid(r.byChar))&&(r.ops===undefined||opsValid(r.ops))&&(r.skins===undefined||accountSkinsValid(r.skins));
export class LoadoutPreferences{
 constructor(filename=null){this.filename=filename;this.accounts={};this.document={format:1,accounts:{}};this.queue=Promise.resolve();}
 static async load(filename,servedRoots=[]){
  const store=new LoadoutPreferences(filename);if(!filename)return store;
  let full=path.resolve(filename),ancestor=full,canonical;
  for(;;){try{canonical=await fs.realpath(ancestor);break;}catch(e){if(e.code!=='ENOENT')throw e;ancestor=path.dirname(ancestor);}}
  full=path.join(canonical,path.relative(ancestor,full));store.filename=full;
  for(const root of servedRoots){const served=await fs.realpath(root).catch(e=>{if(e.code==='ENOENT')return path.resolve(root);throw e;});const rel=path.relative(served,full);if(!rel||!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel))throw Error('干员调配存档必须位于私有持久化目录');}
  try{const b=await fs.readFile(filename);if(b.length>32*1024*1024)throw Error('干员调配存档过大，拒绝覆盖');const doc=JSON.parse(b);if(doc.format!==1||!doc.accounts||typeof doc.accounts!=='object'||Array.isArray(doc.accounts)||Object.entries(doc.accounts).some(([id,r])=>!id||id.length>128||!validRow(r)))throw Error('干员调配存档格式无效，拒绝覆盖');store.accounts=doc.accounts;store.document=doc;}catch(e){if(e.code!=='ENOENT')throw e;}return store;
 }
 view(accountId){const row=Object.hasOwn(this.accounts,accountId)?this.accounts[accountId]:null;return{enabled:true,accountId,revision:row?.revision||0,entries:structuredClone(row?.entries||{}),...(row?.byChar?{byChar:structuredClone(row.byChar)}:{}),...(row?.ops?{ops:structuredClone(row.ops)}:{}),...(row?.skins?{skins:structuredClone(row.skins)}:{})};}
 save(accountId,{revision,entries,byChar,ops,skins},authorize=()=>{}){const pending=this.queue.then(async()=>{
  authorize();if(!Number.isSafeInteger(revision)||revision<0||revision===Number.MAX_SAFE_INTEGER||!isLoadoutEntries(entries))throw error('干员调配存档格式无效');
  const current=this.view(accountId);if(revision!==current.revision)throw Object.assign(error('另一客户端已更新干员调配',409),{current});
  if(byChar!==undefined&&!byCharValid(byChar)||ops!==undefined&&!opsValid(ops))throw error('账号干员调配格式无效');
  if(skins!==undefined&&!accountSkinsValid(skins))throw error('账号干员皮肤格式无效');
  const next={...this.accounts,[accountId]:{...this.accounts[accountId],...(this.accounts[accountId]&&!this.accounts[accountId].legacyBeforeRebase?{legacyBeforeRebase:structuredClone(this.accounts[accountId])}:{}),revision:revision+1,entries:structuredClone(entries)}};
  const row=next[accountId];if(byChar!==undefined)row.byChar=structuredClone(byChar);if(ops!==undefined)row.ops=structuredClone(ops);
  row.skins=structuredClone(skins===undefined?entrySkins(entries):skins);row.entries=withEntrySkins(row.entries,row.skins);
  if(!isLoadoutEntries(row.entries))throw error('干员调配存档格式无效');
  if(current.revision)row.recentVersions=[{...current,at:Date.now()},...(this.accounts[accountId]?.recentVersions||[])].slice(0,3);
  if(this.filename){const text=JSON.stringify({...this.document,format:1,accounts:next})+'\n';if(Buffer.byteLength(text)>32*1024*1024)throw error('调配存档已满，请联系管理员',503);await fs.mkdir(path.dirname(this.filename),{recursive:true,mode:0o700});const temp=this.filename+'.'+randomUUID()+'.tmp';try{await fs.writeFile(temp,text,{flag:'wx',mode:0o600});await fs.rename(temp,this.filename);}finally{await fs.rm(temp,{force:true});}}
  this.accounts=next;this.document={...this.document,accounts:next};return this.view(accountId);
 });this.queue=pending.catch(()=>{});return pending;}
 async handle(req,res,auth){const json=(status,body)=>{const b=Buffer.from(JSON.stringify(body));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':b.length});res.end(req.method==='HEAD'?undefined:b);};try{
  if(!auth){json(200,{enabled:false});return;}const session=auth.session(req),actor=auth.authorize(session);const accountId=actor.accountId;
  if(req.method==='GET'||req.method==='HEAD'){json(200,this.view(accountId));return;}if(req.method!=='PUT')throw error('不支持的请求方法',405);
  if(!auth.sameOrigin(req))throw error('请求来源不允许',403);if((req.headers['content-type']||'').split(';')[0].trim()!=='application/json')throw error('请使用JSON请求',415);
  const retry=(auth.preferenceLimiter||auth.accountLimiter).take(actor.username,auth.now());if(retry){res.setHeader('Retry-After',String(retry));throw error('操作过于频繁，请稍后重试',429);}
  let size=0,chunks=[];for await(const c of req){size+=c.length;if(size>512*1024)throw error('请求过大',413);chunks.push(c);}let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw error('JSON格式错误');}if(!body||Object.keys(body).some(k=>!['accountId','revision','entries','byChar','ops','skins'].includes(k)))throw error('存档请求无效');if(body.accountId!==accountId)throw error('账号已切换，请重新同步调配',409);
  json(200,await this.save(accountId,body,()=>auth.authorize(session)));
 }catch(e){if(!e.status)throw e;json(e.status,{error:e.message,...(e.current?{current:e.current}:{})});}}
}
