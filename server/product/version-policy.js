// The original game's version IDs come from the pinned upstream registry, never from client input.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export class OfficialVersionPolicy {
  constructor({filename=null,catalog,initial,available=()=>true}) {
    if(!Array.isArray(catalog)||!catalog.length)throw Error('原游戏版本目录为空');
    this.filename=filename;this.catalog=catalog;this.available=available;this.queue=Promise.resolve();this.onChange=()=>{};
    this.doc={format:1,revision:0,enabled:[...initial.enabled],default:initial.default,audit:[]};
    this.validate(this.doc);
  }
  validate(doc) {
    if(doc?.format!==1||!Number.isSafeInteger(doc.revision)||doc.revision<0
      ||!Array.isArray(doc.enabled)||!doc.enabled.length||doc.enabled.length>this.catalog.length
      ||new Set(doc.enabled).size!==doc.enabled.length
      ||doc.enabled.some(id=>!this.catalog.some(v=>v.id===id))||!doc.enabled.includes(doc.default)
      ||!Array.isArray(doc.audit))throw Error('原游戏版本设置格式未知或不完整，拒绝覆盖');
  }
  static async load(options) {
    const policy=new OfficialVersionPolicy(options);
    if(options.filename)try{
      if((await fs.lstat(options.filename)).isSymbolicLink())throw Error('原游戏版本设置不能是符号链接');
      const bytes=await fs.readFile(options.filename);if(bytes.length>256*1024)throw Error('原游戏版本设置过大');
      const doc=JSON.parse(bytes);policy.validate(doc);policy.doc=doc;
    }catch(e){if(e.code!=='ENOENT')throw e;}
    return policy;
  }
  permits(id) {return this.doc.enabled.includes(id)&&this.available(id);}
  get defaultId() {return this.doc.default;}
  view() {
    return {revision:this.doc.revision,default:this.doc.default,
      versions:this.catalog.map(v=>({id:v.id,label:v.label,enabled:this.doc.enabled.includes(v.id),available:!!this.available(v.id)})),
      appliesTo:'new-rooms-and-version-proposals',existingRooms:'keep-selected-version'};
  }
  update(body,actor,authorize=()=>{}) {
    const job=this.queue.then(async()=>{
      authorize();
      if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['revision','enabled','default'].includes(k)))fail(400,'版本设置请求无效');
      if(body.revision!==this.doc.revision)fail(409,'版本设置已被修改，请刷新后重试');
      if(this.doc.revision===Number.MAX_SAFE_INTEGER)fail(409,'版本设置修订号已达上限');
      const candidate={...this.doc,revision:this.doc.revision+1,enabled:body.enabled,default:body.default};
      try{this.validate(candidate);}catch{fail(400,'至少开放一个已知版本，默认版本必须在开放列表中');}
      if(candidate.enabled.some(id=>!this.available(id)))fail(409,'所选版本的数据尚未就绪，不能开放');
      const at=new Date().toISOString();
      candidate.audit=[...this.doc.audit,{revision:candidate.revision,at,actor,enabled:[...candidate.enabled],default:candidate.default}].slice(-1000);
      if(this.filename){
        await fs.mkdir(path.dirname(this.filename),{recursive:true,mode:0o700});
        try{if((await fs.lstat(this.filename)).isSymbolicLink())throw Error('版本设置文件被替换为符号链接');}catch(e){if(e.code!=='ENOENT')throw e;}
        const temporary=this.filename+'.'+randomUUID()+'.tmp';
        try{await fs.writeFile(temporary,JSON.stringify(candidate,null,2)+'\n',{flag:'wx',mode:0o600});await fs.rename(temporary,this.filename);}finally{await fs.rm(temporary,{force:true});}
      }
      this.doc=structuredClone(candidate);this.onChange(this.view());return this.view();
    });
    this.queue=job.catch(()=>{});return job;
  }
  async handle(req,res,auth) {
    const send=(status,value)=>{const bytes=Buffer.from(JSON.stringify(value));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);};
    try{
      const session=auth.session(req),actor=auth.authorize(session,true);
      if(req.method==='GET'||req.method==='HEAD'){send(200,this.view());return;}
      if(req.method!=='PUT'){send(405,{error:'仅支持 GET、HEAD 和 PUT'});return;}
      if(!auth.sameOrigin(req))fail(403,'请求来源不允许');
      if((req.headers['content-type']||'').split(';')[0].trim().toLowerCase()!=='application/json')fail(415,'请使用 JSON 请求');
      const retry=auth.accountLimiter.take(actor.username,auth.now());if(retry)fail(429,'操作过于频繁，请稍后重试');
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>8192)fail(413,'请求过大');chunks.push(chunk);}
      let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail(400,'JSON 格式错误');}
      send(200,await this.update(body,actor.accountId,()=>auth.authorize(session,true)));
    }catch(e){send(e.status||500,{error:e.status?e.message:'版本设置保存失败，原设置保持'});}
  }
}
