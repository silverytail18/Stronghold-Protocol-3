import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {PRODUCT_CONTENT,PRODUCT_CONTENT_REVISION,CYCLOPS_CONTENT_IDS} from '../../shared/product-content.js';
import {VERSIONS,DEFAULT_VERSION} from '../../shared/versions.js';
import {operatorConflicts,conflictReason} from './operator-conflicts.js';

const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const clone=value=>structuredClone(value);
export class ProductContentPolicy {
  constructor(directory,{catalog=PRODUCT_CONTENT}={}){
    this.directory=directory;this.catalog=catalog;this.filename=path.join(directory,'product-content-policy.json');this.queue=Promise.resolve();
    this.doc={format:1,revision:0,items:Object.fromEntries(catalog.map(item=>[item.id,{public:false,versions:[DEFAULT_VERSION]}])),adminControls:{testOperatorGrant:false},audit:[]};
  }
  validate(doc){
    if(doc?.format!==1||!Number.isSafeInteger(doc.revision)||doc.revision<0||!doc.items||typeof doc.items!=='object'||Array.isArray(doc.items)||!Array.isArray(doc.audit))throw Error('测试包开放设置格式未知，拒绝覆盖');
    for(const item of this.catalog){const rule=doc.items[item.id];if(!rule||typeof rule.public!=='boolean'||!Array.isArray(rule.versions)||new Set(rule.versions).size!==rule.versions.length||rule.versions.some(id=>!VERSIONS.some(v=>v.id===id)))throw Error('测试包适用版本设置无效，拒绝覆盖');}
  }
  static async load(directory,options){
    const result=new ProductContentPolicy(directory,options);
    try{if((await fs.lstat(result.filename)).isSymbolicLink())throw Error('测试包设置不能为符号链接');const bytes=await fs.readFile(result.filename);if(bytes.length>256*1024)throw Error('测试包设置过大');const doc=JSON.parse(bytes);result.validate(doc);result.doc=doc;}
    catch(error){if(error.code!=='ENOENT')throw error;
      // Inherit old access once, retaining the legacy file and its unknown IDs unchanged.
      try{const legacy=JSON.parse(await fs.readFile(path.join(directory,'test-content-access.json'),'utf8'));for(const item of result.catalog)result.doc.items[item.id].public=legacy.publicIds?.includes(item.id)===true;if(typeof legacy.adminControls?.testOperatorGrant==='boolean')result.doc.adminControls.testOperatorGrant=legacy.adminControls.testOperatorGrant;}catch(e){if(e.code!=='ENOENT')throw e;}
    }
    return result;
  }
  view({version=DEFAULT_VERSION,admin=false,mode='coop',difficulty='NORMAL',variant=null}={}){
    return{revision:this.doc.revision,catalog:PRODUCT_CONTENT_REVISION,version,versions:VERSIONS.map(({id,label})=>({id,label})),
      items:this.catalog.map(item=>{
        const rule=this.doc.items[item.id],conflicts=operatorConflicts(item.id,version);
        const reason=(variant==='entertainment_zhajing'?'炸惊模拟使用独立棋库，不支持测试包':null)||conflictReason(conflicts)||(item.status!=='ready'?'内容迁移中，暂不可用':!rule.versions.includes(version)?'此测试包不适用于当前游戏版本':!admin&&!rule.public?'管理员尚未开放此测试包':variant==='entertainment_cyclops'&&!CYCLOPS_CONTENT_IDS.includes(item.id)?'此测试包尚未适配舟铲铲':item.modes&&!item.modes.includes(mode)?'当前模拟方式不支持此测试包':item.difficulties&&!item.difficulties.includes(difficulty)?'当前难度不支持此测试包':null);
        return{...clone(item),ranked:true,public:rule.public,versions:[...rule.versions],operatorConflicts:conflicts,versionConflicts:Object.fromEntries(VERSIONS.map(v=>[v.id,operatorConflicts(item.id,v.id)])),enabled:reason===null,reason};
      }),retired:['iberia'],music:{status:'ready',enabled:!!this.music,revision:this.music?.info().revision??0}};
  }
  resolve(ids,context={}){
    if(!Array.isArray(ids)||ids.length>this.catalog.length||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'))fail(400,'测试包选择无效');
    const view=this.view(context),selected=new Set(ids),items=view.items.filter(item=>selected.has(item.id));
    if(items.length!==ids.length)fail(400,'未知测试包');
    for(const item of items){if(!item.enabled)fail(403,item.reason);if(item.conflicts?.some(id=>selected.has(id)))fail(400,'测试包互相冲突');if(item.requires?.some(id=>!selected.has(id)))fail(400,'测试包缺少依赖');if(item.requiresAny?.length&&!item.requiresAny.some(id=>selected.has(id)))fail(400,'天才交易员需要24或30回合扩展');}
    return items.map(({id})=>id);
  }
  freeze(version,ids=[],context={}){
    const selected=this.resolve(ids,{...context,version});
    return Object.freeze({catalogRevision:PRODUCT_CONTENT_REVISION,policyRevision:this.doc.revision,officialVersion:version,...(context.variant?{variant:context.variant}:{}),custom:Object.freeze(selected),music:this.music?Object.freeze(this.music.info()):false});
  }
  async adminView(){
    const preserved=[];
    for(const name of ['test-content-access.json','content-packs.json','music-rules.json']){
      try{const bytes=await fs.readFile(path.join(this.directory,name));preserved.push({file:name,present:true,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
      catch(e){if(e.code!=='ENOENT')throw e;preserved.push({file:name,present:false});}
    }
    return{...this.view({admin:true}),adminControls:{testOperatorGrant:this.doc.adminControls?.testOperatorGrant===true},preserved};
  }
  update(body,actor,authorize=()=>{}){
    const job=this.queue.then(async()=>{
      authorize();if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!['revision','items','adminControls'].includes(key))||!Array.isArray(body.items)||(!body.items.length&&!body.adminControls)||body.items.length>this.catalog.length)fail(400,'测试包设置请求无效');
      if(body.revision!==this.doc.revision)fail(409,'测试包设置已变化，请刷新');
      const next=clone(this.doc),seen=new Set();
      if(body.adminControls!==undefined){if(!body.adminControls||typeof body.adminControls!=='object'||Array.isArray(body.adminControls)||Object.entries(body.adminControls).some(([k,v])=>k!=='testOperatorGrant'||typeof v!=='boolean'))fail(400,'管理员工具设置无效');next.adminControls={...next.adminControls,...body.adminControls};}
      for(const item of body.items){if(!item||Object.keys(item).some(key=>!['id','public','versions'].includes(key))||seen.has(item.id)||!this.catalog.some(row=>row.id===item.id))fail(400,'测试包设置包含未知或重复项目');seen.add(item.id);next.items[item.id]={...next.items[item.id],public:item.public,versions:clone(item.versions)};}
      next.revision++;try{this.validate(next);}catch{fail(400,'适用游戏版本必须来自四个已知版本且不能重复');}
      for(const item of body.items)for(const version of item.versions){const reason=conflictReason(operatorConflicts(item.id,version));if(reason)fail(409,reason);}
      next.audit=[...next.audit,{revision:next.revision,actor,at:new Date().toISOString(),items:clone(body.items)}].slice(-1000);
      await fs.mkdir(this.directory,{recursive:true,mode:0o700});try{if((await fs.lstat(this.filename)).isSymbolicLink())throw Error('测试包设置路径被替换');}catch(e){if(e.code!=='ENOENT')throw e;}
      const temporary=this.filename+'.'+randomUUID()+'.tmp';try{await fs.writeFile(temporary,JSON.stringify(next,null,2)+'\n',{flag:'wx',mode:0o600});await fs.rename(temporary,this.filename);}finally{await fs.rm(temporary,{force:true});}
      this.doc=next;this.onChange?.();return this.adminView();
    });this.queue=job.catch(()=>{});return job;
  }
  async handle(req,res,auth){
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
    try{const session=auth.session(req),actor=auth.authorize(session,true);if(['GET','HEAD'].includes(req.method)){send(200,await this.adminView());return;}if(req.method!=='PUT'){send(405,{error:'仅支持GET、HEAD、PUT'});return;}if(!auth.sameOrigin(req))fail(403,'请求来源不允许');if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail(415,'请使用JSON请求');if(auth.accountLimiter.take(actor.username,auth.now()))fail(429,'操作过于频繁');let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>32768)fail(413,'请求过大');chunks.push(chunk);}let body;try{body=JSON.parse(Buffer.concat(chunks));}catch{fail(400,'JSON格式错误');}send(200,await this.update(body,actor.accountId,()=>auth.authorize(session,true)));}
    catch(error){send(error.status||500,{error:error.status?error.message:'测试包设置保存失败，原配置保持'});}
  }
}
