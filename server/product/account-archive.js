import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isAlternateGameplay} from '../../shared/stats.js';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const copy=x=>structuredClone(x);
const MAX_RECORDS=1000;

/** Private account achievements and administrator inbox. Never grants rank, currency or gameplay access. */
export class AccountArchive {
  constructor(filename){this.filename=filename;this.doc={format:1,accounts:{},feedback:[]};this.queue=Promise.resolve();}
  static async load(directory){
    const store=new AccountArchive(path.join(directory,'account-archive.json'));
    try{
      if((await fs.lstat(store.filename)).isSymbolicLink())throw Error('账号归档不能为链接');
      const bytes=await fs.readFile(store.filename);if(bytes.length>64*1024*1024)throw Error('账号归档超过限制');
      const doc=JSON.parse(bytes);if(doc.format!==1||!obj(doc.accounts)||!Array.isArray(doc.feedback))throw Error('账号归档格式未知');
      store.doc=doc;
    }catch(error){if(error.code!=='ENOENT')throw error;}
    return store;
  }
  edit(change,authorize=()=>{}){
    const job=this.queue.then(async()=>{
      authorize();const next=copy(this.doc),result=change(next);
      const text=JSON.stringify(next)+'\n';if(Buffer.byteLength(text)>64*1024*1024)fail('账号归档已满，请联系服务器管理员',503);
      await fs.mkdir(path.dirname(this.filename),{recursive:true,mode:0o700});
      const tmp=this.filename+'.'+randomUUID()+'.tmp';
      try{await fs.writeFile(tmp,text,{flag:'wx',mode:0o600});await fs.rename(tmp,this.filename);}finally{await fs.rm(tmp,{force:true});}
      this.doc=next;return result;
    });this.queue=job.catch(()=>{});return job;
  }
  achievements(accountId){
    const row=this.doc.accounts[accountId]||{};
    return{accountId,revision:row.revision||0,clearedAt:row.clearedAt||0,records:copy((row.records||[]).filter(r=>!isAlternateGameplay(r))),settlements:copy((row.settlements||[]).filter(r=>!isAlternateGameplay(r)&&!isAlternateGameplay(r.summary))),legacyImported:!!row.legacyImported};
  }
  importAchievements(accountId,body,authorize){
    if(body.clear===true)fail('只有管理员可以在管理界面清空指定玩家的统计',403);
    if(body.accountId!==accountId)fail('账号已切换，请重新读取',409);
    if(!Number.isSafeInteger(body.revision)||!Array.isArray(body.records)||body.records.length>MAX_RECORDS)fail('成就数据无效');
    const records=body.records.filter(r=>obj(r)&&r.test!==true&&typeof r.id==='string'&&r.id.length<=160&&typeof r.selfId==='string'&&Array.isArray(r.players)&&r.players.length<=8);
    if(records.length!==body.records.length||JSON.stringify(records).length>1500000)fail('成就数据无效');
    return this.edit(next=>{
      const row=next.accounts[accountId]||={revision:0,records:[],settlements:[]};
      if(body.revision!==row.revision)fail('成就已在另一设备更新，请重新读取',409);
      const map=new Map((row.records||[]).filter(r=>!isAlternateGameplay(r)).map(r=>[r.id,r]));for(const rec of records)if(!isAlternateGameplay(rec)&&(!row.clearedAt||rec.t>row.clearedAt)&&!map.has(rec.id))map.set(rec.id,copy(rec));
      row.records=[...map.values()].sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,MAX_RECORDS);row.revision++;row.legacyImported=true;
      return{revision:row.revision};
    },authorize);
  }
  recordSettlement({id,accounts,summary,version,content,mode,variant,at=Date.now()}){
    if(!id||!obj(summary)||summary.test===true||isAlternateGameplay({variant})||isAlternateGameplay(summary)||!Array.isArray(summary.players))return Promise.resolve();
    return this.edit(next=>{
      for(const[playerId,accountId]of accounts){
        if(!summary.players.some(p=>p.playerId===playerId))continue;
        const row=next.accounts[accountId]||={revision:0,records:[],settlements:[]};row.settlements||=[];
        if(at<=(row.clearedAt||0)||row.settlements.some(s=>s.id===id))continue;
        row.settlements.push({id,at,myId:playerId,version,content:copy(content||null),mode,summary:copy(summary)});
        row.settlements.sort((a,b)=>b.at-a.at);row.settlements=row.settlements.slice(0,MAX_RECORDS);row.revision++;
      }
    });
  }
  clearStatistics(accountId,authorize){
    return this.edit(next=>{const row=next.accounts[accountId]||={revision:0};row.records=[];row.settlements=[];row.clearedAt=Date.now();row.revision++;return this.achievementsFrom(row,accountId);},authorize);
  }
  achievementsFrom(row,accountId){return {accountId,revision:row.revision,clearedAt:row.clearedAt};}
  async handle(req,res,pathname,auth){
    const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(body));};
    try{
      const admin=pathname==='/auth/admin/feedback',session=auth.session(req),user=auth.authorize(session,admin);
      if(['GET','HEAD'].includes(req.method)){
        if(!admin&&pathname!=='/product/achievements')fail('方法不支持',405);
        const own=admin?null:this.achievements(user.accountId);
        send(200,admin?{reports:copy(this.doc.feedback).reverse()}:{...own,...(this.publicRecords?{records:this.publicRecords(user.accountId)}:{})});return;
      }
      if(!auth.sameOrigin(req))fail('请求来源不允许',403);
      if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail('请使用JSON请求',415);
      const limiter=pathname==='/product/achievements'?(auth.preferenceLimiter||auth.accountLimiter):auth.accountLimiter;
      if(limiter.take(user.username,auth.now()))fail('操作过于频繁，请稍后重试',429);
      let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>2*1024*1024)fail('请求过大',413);chunks.push(chunk);}
      let body;try{body=JSON.parse(Buffer.concat(chunks));}catch{fail('JSON无效');}if(!obj(body))fail('请求无效');
      const authorize=()=>auth.authorize(session,admin);
      if(pathname==='/product/achievements'&&req.method==='PUT'){send(200,await this.importAchievements(user.accountId,body,authorize));return;}
      if(pathname==='/product/feedback'&&req.method==='POST'){
        if(typeof body.message!=='string'||!body.message.trim()||body.message.length>4000||typeof body.diagnostics!=='string'||body.diagnostics.length>300000)fail('请填写问题描述，诊断信息不能超过限制');
        const record={id:randomUUID(),at:Date.now(),accountId:user.accountId,username:user.username,message:body.message.trim(),diagnostics:body.diagnostics,status:'new'};
        await this.edit(next=>{next.feedback.push(record);if(next.feedback.length>5000)fail('反馈收件箱已满，请联系管理员');},authorize);
        send(201,{id:record.id,at:record.at});return;
      }
      if(admin&&req.method==='PATCH'){
        if(!['new','reviewing','resolved'].includes(body.status))fail('反馈状态无效');
        await this.edit(next=>{const r=next.feedback.find(x=>x.id===body.id);if(!r)fail('反馈不存在',404);r.status=body.status;r.updatedAt=Date.now();},authorize);send(200,{ok:true});return;
      }
      fail('方法不支持',405);
    }catch(error){send(error.status||400,{error:error.status?error.message:'请求无法保存，请稍后重试'});}
  }
}
