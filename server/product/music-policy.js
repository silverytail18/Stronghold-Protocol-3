import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {MUSIC_CATALOG,validateMusicRules} from '../../shared/music.js';
const known=new Set(MUSIC_CATALOG.map(t=>t.id));
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
export class ProductMusicPolicy {
  constructor(directory){this.filename=path.join(directory,'music-rules.json');this.queue=Promise.resolve();this.doc={format:1,revision:0,rules:Object.fromEntries([...known].map(id=>[id,{enabled:true,probability:100}]))};}
  static async load(directory){const policy=new ProductMusicPolicy(directory);try{if((await fs.lstat(policy.filename)).isSymbolicLink())throw Error('音乐设置不能为链接');const bytes=await fs.readFile(policy.filename);if(bytes.length>256*1024)throw Error('音乐设置过大');const doc=JSON.parse(bytes);if(doc.format!==1||!Number.isSafeInteger(doc.revision)||doc.revision<0||!doc.rules||typeof doc.rules!=='object'||Array.isArray(doc.rules))throw Error('音乐设置格式未知，拒绝覆盖');const selected=Object.fromEntries(Object.entries(doc.rules).filter(([id])=>known.has(id)).map(([id,r])=>[id,{enabled:r.enabled,probability:r.probability}]));if(!validateMusicRules(selected))throw Error('音乐规则格式未知，拒绝覆盖');policy.doc=doc;}catch(error){if(error.code!=='ENOENT')throw error;}return policy;}
  frozen(){const rules=Object.fromEntries(Object.entries(this.doc.rules).filter(([id])=>known.has(id)).map(([id,r])=>[id,{enabled:r.enabled,probability:r.probability}]));for(const id of ['nan-wang-jin-xiao','cha-yi-bu','guan-yu-zhi-ge','tian-liang-yi-qian-shuo-zai-jian','gu-yong-zhe','pi-pa-qu','you-shan-lian'])if(!Object.hasOwn(rules,id))rules[id]={enabled:true,probability:100};return structuredClone(rules);}
  info(){return{revision:this.doc.revision,fingerprint:createHash('sha256').update(JSON.stringify(this.frozen())).digest('hex')};}
  view(){return{...this.info(),rules:this.frozen(),tracks:MUSIC_CATALOG};}
  async handle(req,res,auth){
    const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(body));};
    try{const session=auth.session(req),user=auth.authorize(session,true);if(['GET','HEAD'].includes(req.method)){send(200,this.view());return;}if(req.method!=='PUT')fail(405,'方法不支持');if(!auth.sameOrigin(req))fail(403,'请求来源不允许');if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail(415,'请使用JSON请求');if(auth.accountLimiter.take(user.username,auth.now()))fail(429,'操作过于频繁');let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16384)fail(413,'请求过大');chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks));if(!validateMusicRules(body.rules))fail(400,'音乐规则无效');
      const job=this.queue.then(async()=>{auth.authorize(session,true);if(body.revision!==this.doc.revision)fail(409,'设置已变化，请刷新');const next=structuredClone(this.doc);next.revision++;for(const[id,rule]of Object.entries(body.rules))next.rules[id]={...next.rules[id],...rule};await fs.mkdir(path.dirname(this.filename),{recursive:true,mode:0o700});const tmp=this.filename+'.'+randomUUID()+'.tmp';try{await fs.writeFile(tmp,JSON.stringify(next,null,2)+'\n',{flag:'wx',mode:0o600});await fs.rename(tmp,this.filename);}finally{await fs.rm(tmp,{force:true});}this.doc=next;});this.queue=job.catch(()=>{});await job;send(200,this.view());
    }catch(error){send(error.status||400,{error:error.status?error.message:'音乐设置无效或保存失败'});}
  }
}
