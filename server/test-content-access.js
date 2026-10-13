// Deployment settings, separate from accounts, ranked records and per-match rules.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {validAdminControls,adminControlView,adminControlEnabled,ADMIN_TEST_CONTROLS} from './admin-test-controls.js';
const invalid=(message,status=400)=>Object.assign(new Error(message),{status});
const validIds=ids=>Array.isArray(ids)&&ids.length<=1000&&ids.every(id=>typeof id==='string'&&/^[a-z0-9-]{1,100}$/.test(id))&&new Set(ids).size===ids.length;
export class TestContentAccess {
  constructor({filename=null}={}) {this.filename=filename;this.revision=0;this.publicIds=[];this.adminControls={};this.queue=Promise.resolve();}
  static async load(filename,servedRoots=[]) {
    const store=new TestContentAccess({filename});if(!filename)return store;
    let resolved=path.resolve(filename);
    try{resolved=await fs.realpath(filename);}catch(e){if(e.code!=='ENOENT')throw e;try{resolved=path.join(await fs.realpath(path.dirname(filename)),path.basename(filename));}catch(e){if(e.code!=='ENOENT')throw e;}}
    for(const root of servedRoots){const rel=path.relative(path.resolve(root),resolved);if(!rel||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel)))throw new Error('测试开放设置必须位于私有持久化目录');}
    try{
      const bytes=await fs.readFile(filename);if(bytes.length>16384)throw new Error('测试开放设置文件过大');
      const data=JSON.parse(bytes.toString('utf8'));
      if(data.format!==1||!Number.isSafeInteger(data.revision)||data.revision<0||!validIds(data.publicIds))throw new Error('测试开放设置文件格式无效，拒绝覆盖');
      if(data.adminControls!==undefined&&!validAdminControls(data.adminControls))throw new Error('管理员测试工具设置格式无效，拒绝覆盖');
      store.revision=data.revision;store.publicIds=data.publicIds;store.adminControls=data.adminControls??{};
    }catch(e){if(e.code!=='ENOENT')throw e;}
    return store;
  }
  update({revision,catalog,publicIds,adminControls},content,authorize=()=>{}) {
    const pending=this.queue.then(async()=>{
      authorize();
      if(adminControls!==undefined&&(!validAdminControls(adminControls)||Object.keys(adminControls).some(id=>!ADMIN_TEST_CONTROLS.some(item=>item.id===id))))throw invalid('管理员测试工具设置无效');
      if(revision!==this.revision||catalog!==content.version)throw invalid('开放设置或测试目录已变化，请刷新后重新选择',409);
      if(!validIds(publicIds)||publicIds.some(id=>!content.entries.some(e=>e.id===id&&e.status==='ready'&&typeof e.apply==='function')))throw invalid('开放项目包含未知或尚未实现的测试内容');
      const selected=new Set(publicIds);
      for(const id of selected)if((content.entries.find(e=>e.id===id).requires||[]).some(dep=>!selected.has(dep)))throw invalid('请同时开放所选项目的必要依赖');
      const next={format:1,revision:this.revision+1,publicIds:content.entries.filter(e=>selected.has(e.id)).map(e=>e.id),adminControls:{...this.adminControls,...adminControls}};
      if(this.filename){
        await fs.mkdir(path.dirname(this.filename),{recursive:true,mode:0o700});
        const temporary=this.filename+'.'+randomUUID()+'.tmp';
        try{await fs.writeFile(temporary,JSON.stringify(next,null,2)+'\n',{flag:'wx',mode:0o600});await fs.rename(temporary,this.filename);}
        finally{await fs.rm(temporary,{force:true});}
      }
      this.revision=next.revision;this.publicIds=next.publicIds;this.adminControls=next.adminControls;
    });this.queue=pending.catch(()=>{});return pending;
  }
  adminEnabled(id){return adminControlEnabled(this.adminControls,id);}
  view(content){return {revision:this.revision,catalog:content.version,adminControls:adminControlView(this.adminControls),items:content.entries.map(({id,name,description,status,group})=>({id,name,description,status,group,public:this.publicIds.includes(id)}))};}
  async handle(req,res,{auth,content,onChange}) {
    const json=(status,body,extra={})=>{const bytes=Buffer.from(JSON.stringify(body));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':bytes.length,'Cache-Control':'no-store',...extra});res.end(req.method==='HEAD'?undefined:bytes);};
    try{
      if(!auth)throw invalid('账号服务未启用',503);
      const session=auth.session(req);auth.authorize(session,true);
      if(req.method==='GET'||req.method==='HEAD'){json(200,this.view(content()));return;}
      if(req.method!=='PUT'){json(405,{error:'不支持的请求方法'},{Allow:'GET, HEAD, PUT'});return;}
      if(!auth.sameOrigin(req))throw invalid('请求来源不允许',403);
      const actor=auth.authorize(session,true),retry=auth.accountLimiter.take(actor.username,auth.now());
      if(retry){json(429,{error:'操作过于频繁，请稍后重试'},{'Retry-After':String(retry)});return;}
      if((req.headers['content-type']||'').split(';')[0].trim().toLowerCase()!=='application/json')throw invalid('请使用JSON请求',415);
      let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16384)throw invalid('请求过大',413);chunks.push(chunk);}
      let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw invalid('JSON格式错误');}
      if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['revision','catalog','publicIds','adminControls'].includes(k)))throw invalid('开放设置请求无效');
      await this.update(body,content(),()=>auth.authorize(session,true));onChange();json(200,this.view(content()));
    }catch(e){if(!e.status)throw e;json(e.status,{error:e.message});}
  }
}
