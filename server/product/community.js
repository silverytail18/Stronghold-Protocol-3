import {randomUUID} from 'node:crypto';
import {referenceCatalog} from './reference-catalog.js';
import {ROOM_CARD_EXTRAS} from '../../shared/room-card-extras.js';
import {BASE_NAMECARDS, canUseNameCard} from '../../shared/nameCards.js';
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const decode=value=>value?JSON.parse(value):{};
const safeText=(value,max)=>typeof value==='string'&&Array.from(value).length<=max&&!/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/.test(value);
export class Community {
  constructor({ranked,auth,playerData}) {
    Object.assign(this,{ranked,auth,playerData});this.presence=()=>null;this.rooms=()=>[];
    ranked.db.exec('CREATE TABLE IF NOT EXISTS player_presentation(account_id TEXT PRIMARY KEY REFERENCES accounts(id),revision INTEGER NOT NULL,body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS friend_invites(id TEXT PRIMARY KEY,sender TEXT NOT NULL,target TEXT NOT NULL,room_code TEXT NOT NULL,room_created INTEGER NOT NULL,expires INTEGER NOT NULL,reserved INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS favorite_players(owner TEXT NOT NULL,target TEXT NOT NULL,PRIMARY KEY(owner,target)); CREATE TABLE IF NOT EXISTS invite_mutes(owner TEXT PRIMARY KEY,until_at INTEGER NOT NULL)');
  }
  presentation(id) {
    const account=this.ranked.one('SELECT nickname,public_no FROM accounts WHERE id=?',id);
    const stored=this.ranked.one('SELECT * FROM player_presentation WHERE account_id=?',id);
    return {nickname:account?.nickname||'',number:account?.public_no||null,avatar:'',frame:'mint',namecard:'standard',motto:'',...decode(stored?.body),revision:stored?.revision||0};
  }
  directory(owner) {
    return this.playerData.players().map(p=>({...p,...this.presentation(p.accountId),rank:this.ranked.profile(p.accountId),presence:this.presence(p.accountId),favorite:!!this.ranked.one('SELECT 1 FROM favorite_players WHERE owner=? AND target=?',owner,p.accountId)}));
  }
  async handle(req,res) {
    const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(body));};
    try {
      const session=this.auth.session(req),actor=this.auth.authorize(session);this.ranked.syncAccounts();
      const url=new URL(req.url,'http://localhost'),id=actor.accountId;
      if(req.method==='GET') {
        if(url.pathname==='/community/invites'){send(200,{invites:this.invites(id)});return;}
        if(url.pathname==='/community/me'){send(200,{presentation:this.presentation(id),rank:this.ranked.profile(id)});return;}
        if(url.pathname==='/community/players'){send(200,{players:this.directory(id),invites:this.invites(id)});return;}
        if(url.pathname==='/community/profile') {
          const target=url.searchParams.get('accountId')||id;
          const page=Number(url.searchParams.get('page')||0),kind=url.searchParams.get('kind')||'',mode=url.searchParams.get('mode')||'';
          if(!Number.isSafeInteger(page)||page<0||page>100000)fail(400,'页码无效');
          const player=this.playerData.players().find(p=>p.accountId===target);if(!player)fail(404,'玩家不存在');
          send(200,{player,presentation:this.presentation(target),rank:this.ranked.profile(target),history:this.ranked.records(target,{page,kind,mode})});return;
        }
        if(url.pathname==='/community/record') {
          const target=url.searchParams.get('accountId')||id;
          if(!this.playerData.players().some(p=>p.accountId===target))fail(404,'玩家不存在');
          const detail=this.ranked.recordDetail(target,url.searchParams.get('id'));
          send(200,detail);return;
        }
        fail(404,'页面不存在');
      }
      if(req.method!=='POST'||!this.auth.sameOrigin(req))fail(403,'请求来源不允许');
      if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))fail(415,'请使用JSON');
      if(this.auth.preferenceLimiter.take(id,this.auth.now()))fail(429,'操作过于频繁');
      const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>8192)fail(413,'请求过大');chunks.push(c);}
      let body;try{body=JSON.parse(Buffer.concat(chunks));}catch{fail(400,'请求格式无效');}
      this.auth.authorize(session);
      if(url.pathname==='/community/mute'){if(typeof body.enabled!=='boolean')fail(400,'静音状态无效');this.ranked.run('INSERT INTO invite_mutes VALUES(?,?) ON CONFLICT(owner) DO UPDATE SET until_at=excluded.until_at',id,body.enabled?Date.now()+3600000:0);send(200,{ok:true});return;}
      if(url.pathname==='/community/presentation') {
        const old=this.presentation(id);
        const rankProfile=this.ranked.profile(id);
        if(body.revision!==old.revision)fail(409,'资料已更新，请刷新后保存');
        if(!safeText(body.nickname,12)||!body.nickname.trim())fail(400,'昵称需为 1–12 个字符');
        if(!safeText(body.motto||'',60)||!['mint','gold','silver','rose'].includes(body.frame)||typeof body.avatar!=='string'||body.avatar&&!/^char_[A-Za-z0-9_]{1,60}$/.test(body.avatar))fail(400,'展示资料格式无效');
        if(!BASE_NAMECARDS.includes(body.namecard)&&!canUseNameCard(rankProfile,body.namecard))fail(400,'名片主题未解锁');
        if(body.avatar){const values=referenceCatalog().values;if(!Object.values(values.chess).some(c=>c.charId===body.avatar&&!c.isDiy&&c.visible!==false)&&!values.backups.diy?.ownedPool?.includes(body.avatar)&&!ROOM_CARD_EXTRAS.some(c=>c.charId===body.avatar))fail(400,'名片形象不存在');}
        const next={nickname:body.nickname.trim(),motto:(body.motto||'').trim(),frame:body.frame,namecard:body.namecard,avatar:body.avatar};
        this.ranked.transaction(()=>{this.ranked.run('INSERT INTO player_presentation VALUES(?,?,?) ON CONFLICT(account_id) DO UPDATE SET revision=excluded.revision,body=excluded.body',id,old.revision+1,JSON.stringify(next));this.ranked.run('UPDATE accounts SET nickname=? WHERE id=?',next.nickname,id);});
        this.onPresentation?.(id,next);send(200,{presentation:this.presentation(id)});return;
      }
      if(url.pathname==='/community/favorite') {
        if(!this.playerData.players().some(p=>p.accountId===body.target)||body.target===id||typeof body.enabled!=='boolean')fail(400,'目标玩家无效');
        this.ranked.run(body.enabled?'INSERT OR IGNORE INTO favorite_players VALUES(?,?)':'DELETE FROM favorite_players WHERE owner=? AND target=?',id,body.target);send(200,{ok:true});return;
      }
      if(url.pathname==='/community/invite') {
        const room=this.presence(id);if(!room||room.inMatch||room.mode!=='coop'||!room.canJoin)fail(409,'请在有空位且未开局的合作房间邀请');
        if(!this.playerData.players().some(p=>p.accountId===body.target)||body.target===id)fail(404,'目标玩家不存在');
        if(this.ranked.one('SELECT id FROM friend_invites WHERE sender=? AND target=? AND expires>?',id,body.target,Date.now()))fail(409,'邀请已发送，请等待处理');
        const active=this.ranked.one('SELECT COUNT(*) n FROM friend_invites WHERE sender=? AND expires>?',id,Date.now()).n;if(active>=10)fail(429,'未处理邀请过多');
        this.ranked.run('INSERT INTO friend_invites VALUES(?,?,?,?,?,?,0)',randomUUID(),id,body.target,room.code,room.createdAt,Date.now()+120000);
        send(200,{ok:true});return;
      }
      if(url.pathname==='/community/respond') {
        const invitation=this.invites(id).find(x=>x.id===body.id);if(!invitation)fail(404,'邀请已失效');
        if(body.action==='reserve'){this.ranked.run('UPDATE friend_invites SET reserved=1,expires=? WHERE id=?',Date.now()+7200000,body.id);send(200,{reserved:true});return;}
        if(body.action==='ignore'){this.ranked.run('DELETE FROM friend_invites WHERE id=?',body.id);send(200,{ok:true});return;}
        if(body.action!=='accept')fail(400,'操作无效');
        const own=this.presence(id);if(own?.inMatch)fail(409,'请先完成当前对局，或选择预约');
        send(200,{code:invitation.room_code});return;
      }
      fail(404,'操作不存在');
    } catch(error) {send(error.status||503,{error:error.status?error.message:'资料服务暂不可用'});}
  }
  invites(id) {
    this.ranked.run('DELETE FROM friend_invites WHERE expires<=?',Date.now());
    if(this.ranked.one('SELECT until_at FROM invite_mutes WHERE owner=?',id)?.until_at>Date.now())return [];
    const rooms=this.rooms();
    const rows=this.ranked.all('SELECT * FROM friend_invites WHERE target=? AND expires>?',id,Date.now());
    return rows.filter(row=>rooms.some(room=>room.code===row.room_code&&room.createdAt===row.room_created&&!room.inMatch&&room.canJoin)).map(row=>({...row,senderName:this.presentation(row.sender).nickname}));
  }
}
