import {buildRecord,appendRecord,emptyStats,normalizeRecord} from '../../shared/stats.js';
import {referenceCatalog} from './reference-catalog.js';
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const safeData=value=>JSON.parse(JSON.stringify(value,(key,row)=>/^(?:password|passwordHash|token|sessionToken|cookie|authorization|secret|apiKey)$/i.test(key)?undefined:row));
const safeAccount=u=>({accountId:u.accountId,username:u.username,role:u.role,disabled:!!u.disabled,sponsor:!!u.sponsor,mustChangePassword:!!u.mustChangePassword,...(u.sponsorChange?{sponsorChange:u.sponsorChange}:{})});
export class PlayerData {
  constructor({auth,ranked,archive,loadouts}){Object.assign(this,{auth,ranked,archive,loadouts});}
  players(admin=false){
    this.ranked?.syncAccounts();
    return [...this.auth.users.values()].filter(u=>admin||!u.disabled).map(u=>{
      const profile=this.ranked?.one('SELECT public_no,nickname FROM accounts WHERE id=?',u.accountId);
      return {accountId:u.accountId,name:profile?.nickname||u.username,number:profile?.public_no||null,online:!u.disabled&&this.onlineStatus?.(u.accountId)===true,...(admin?{username:u.username}:{} )};
    });
  }
  view(accountId,admin=false){
    const user=[...this.auth.users.values()].find(u=>u.accountId===accountId&&(admin||!u.disabled));if(!user)fail(404,'玩家不存在');
    const archive=this.archive.achievements(accountId),cutoff=archive.clearedAt;let stats=emptyStats();
    const excluded=new Set(this.appeals?.excludedFor(accountId)||[]);
    const excludedKeys=new Set(this.appeals?.excludedKeysFor(accountId)||[]);
    const add=rec=>{if(rec&&!excluded.has(rec.id)&&!excludedKeys.has(rec.id)&&(!cutoff||rec.t>cutoff))stats=appendRecord(stats,rec).stats;};
    for(const rec of archive.records)add(normalizeRecord(rec));
    for(const row of archive.settlements)add(buildRecord(row.summary,{myId:row.myId,roomMode:row.mode,content:row.content,version:row.version,now:row.at}));
    const history=this.ranked?.all(`SELECT r.*,p.player_id FROM battle_records r JOIN record_members p ON p.record_id=r.id WHERE p.account_id=? ORDER BY r.started_at DESC ${admin?'':'LIMIT 1000'}`,accountId)||[];
    for(const row of history)if(row.status==='finished'&&row.summary&&!excluded.has(row.id)){
      const summary=JSON.parse(row.summary),content=summary.content;
      add(buildRecord(summary,{myId:row.player_id,roomMode:row.mode,content,version:summary.officialVersion,now:row.ended_at}));
    }
    const player=this.players(admin).find(p=>p.accountId===accountId);
    const catalog=referenceCatalog().values,labels=Object.fromEntries(['bands','bonds','chess'].map(kind=>[kind,Object.fromEntries(Object.entries(catalog[kind]).map(([id,r])=>[id,r.name||id]))]));
    return {player,labels,clearedAt:cutoff,records:stats.records,excludedRecords:[...excluded],excludedRecordKeys:[...excludedKeys],appeals:this.appeals?.listFor(accountId)?.appeals||[],...(admin?{management:safeData({account:safeAccount(user),loadout:this.loadouts.view(accountId),profile:this.ranked?.profile(accountId)||null,
      standings:this.ranked?.all('SELECT * FROM standings WHERE account_id=?',accountId)||[],ledger:this.ranked?.all('SELECT * FROM ledger WHERE account_id=? ORDER BY seq DESC',accountId)||[],
      rankingMatches:this.ranked?.all('SELECT m.*,p.player_id,p.nickname FROM matches m JOIN participants p ON p.match_id=m.id WHERE p.account_id=? ORDER BY m.started_at DESC',accountId)||[],
      locks:this.ranked?.all('SELECT * FROM locks WHERE account_id=?',accountId)||[],abandonments:this.ranked?.all('SELECT * FROM abandons WHERE account_id=?',accountId)||[],
      audit:this.ranked?.all('SELECT * FROM audit WHERE actor IN (?,?) OR target IN (?,?) ORDER BY created_at DESC',accountId,user.username,accountId,user.username)||[],
      feedback:this.archive.doc.feedback.filter(r=>r.accountId===accountId),
      battleRecords:history.map(({summary,...row})=>({...row,excluded:excluded.has(row.id),summary:summary?JSON.parse(summary):null})),archive})}:{})};
  }
  async handle(req,res,pathname){
    const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(body));};
    try{
      const admin=pathname==='/auth/admin/player-data',session=this.auth.session(req),actor=this.auth.authorize(session,admin);
      if(['GET','HEAD'].includes(req.method)){
        const id=new URL(req.url,'http://localhost').searchParams.get('accountId');send(200,id?this.view(id,admin):{players:this.players(admin)});return;
      }
      if(!admin||req.method!=='DELETE')fail(405,'方法不支持');
      if(!this.auth.sameOrigin(req))fail(403,'请求来源不允许');
      if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail(415,'请使用JSON请求');
      if(this.auth.accountLimiter.take(actor.username,this.auth.now()))fail(429,'操作过于频繁，请稍后重试');
      let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>2048)fail(413,'请求过大');chunks.push(c);}
      let body;try{body=JSON.parse(Buffer.concat(chunks));}catch{fail(400,'JSON无效');}
      const id=body?.accountId;if(![...this.auth.users.values()].some(u=>u.accountId===id))fail(404,'玩家不存在');
      const result=await this.archive.clearStatistics(id,()=>this.auth.authorize(session,true));
      this.ranked?.audit(actor.accountId,'statistics.clear',id,'管理员清空成就统计');send(200,result);
    }catch(error){send(error.status||500,{error:error.status?error.message:'玩家数据暂时无法读取'});}
  }
}
