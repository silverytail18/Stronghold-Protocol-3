import {randomUUID} from 'node:crypto';
import {COMPETITIVE_RULES,competitive,emptyCompetitive,calculateCompetitive,competitiveView} from '../../shared/competitive.js';
import {RANK_INACTIVITY_MS} from '../../shared/emi-ranks.js';
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const decode=value=>value?JSON.parse(value):null;
const reasonOf=value=>{if(typeof value!=='string'||!value.trim()||value.length>300)fail(400,'请填写原因（1–300字）');return value.trim();};
const checkedRules=value=>{if(!competitive(value)||Object.keys(value).some(k=>!Object.hasOwn(COMPETITIVE_RULES,k))||Object.keys(COMPETITIVE_RULES).some(k=>value[k]!==COMPETITIVE_RULES[k]))fail(400,'新排位必须使用已发布的Emi规则版本');return {...COMPETITIVE_RULES};};

// Explicit local adapter; old tables remain readable until the administrator retires the old season.
export function installCompetitive(rank) {
  rank.db.exec([
    'CREATE TABLE IF NOT EXISTS competitive_profiles(season_id TEXT NOT NULL REFERENCES seasons(id),account_id TEXT NOT NULL REFERENCES accounts(id),state TEXT NOT NULL,PRIMARY KEY(season_id,account_id));',
    'CREATE TABLE IF NOT EXISTS competitive_events(seq INTEGER PRIMARY KEY AUTOINCREMENT,season_id TEXT NOT NULL REFERENCES seasons(id),account_id TEXT NOT NULL REFERENCES accounts(id),match_id TEXT,kind TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL,UNIQUE(match_id,account_id));',
    'CREATE TABLE IF NOT EXISTS competitive_receipts(match_id TEXT NOT NULL REFERENCES matches(id),account_id TEXT NOT NULL REFERENCES accounts(id),receipt TEXT NOT NULL,PRIMARY KEY(match_id,account_id));'
  ].join('\n'));
  rank.run("UPDATE metadata SET value='2' WHERE key='schema'");
  rank.competitiveState=(accountId,seasonId)=>({...emptyCompetitive(),...decode(rank.one('SELECT state FROM competitive_profiles WHERE season_id=? AND account_id=?',seasonId,accountId)?.state)});
  rank.saveCompetitive=(accountId,seasonId,state)=>{
    rank.run('INSERT INTO competitive_profiles VALUES(?,?,?) ON CONFLICT(season_id,account_id) DO UPDATE SET state=excluded.state',seasonId,accountId,JSON.stringify(state));
    rank.run('INSERT INTO standings(season_id,account_id,points,peak,games,wins,hidden,achieved_at) VALUES(?,?,?,?,?,?,0,?) ON CONFLICT(season_id,account_id) DO UPDATE SET points=excluded.points,peak=MAX(standings.peak,excluded.peak),games=excluded.games,wins=excluded.wins,achieved_at=excluded.achieved_at',seasonId,accountId,state.points,state.points,state.games,state.wins,state.lastActive);
  };
  rank.competitivePosition=(accountId,seasonId,asOf=rank.now())=>{
    const list=rank.all('SELECT account_id,state FROM competitive_profiles WHERE season_id=?',seasonId).map(x=>({...JSON.parse(x.state),id:x.account_id}))
      .filter(s=>s.placementDone&&s.points>=2100&&asOf-s.lastScoredAt<RANK_INACTIVITY_MS)
      .sort((a,b)=>b.points-a.points||b.lastActive-a.lastActive||a.id.localeCompare(b.id));
    const index=list.findIndex(x=>x.id===accountId);if(index<0)return null;
    const me=list[index];return list.findIndex(x=>x.points===me.points&&x.lastActive===me.lastActive)+1;
  };
  const oldProfile=rank.profile.bind(rank);
  rank.profile=(accountId)=>{
    const view={...oldProfile(accountId),cooldownUntil:0,cooldowns:{solo:0,coop:0}};
    if(!competitive(view.season?.rules))return view;
    const state=rank.competitiveState(accountId,view.season.id);
    return {...view,...competitiveView(state,rank.competitivePosition(accountId,view.season.id),rank.now()),rules:COMPETITIVE_RULES,rankPyramid:state.pyramid};
  };
  const oldQualification=rank.qualification.bind(rank);
  rank.qualification=(accountId,difficulty,allowLocked=false,mode='solo')=>{
    if(!competitive(rank.current()?.rules))return oldQualification(accountId,difficulty,allowLocked,mode);
    const user=[...rank.auth.users.values()].find(x=>x.accountId===accountId);
    if(!user||user.disabled||user.mustChangePassword)fail(403,'请先完成账号登录和初始密码修改');
    if(!['NORMAL','HARD','ABYSS'].includes(difficulty)||!['solo','coop'].includes(mode))fail(409,'排位需要险境、绝境或终极');
    const p=rank.profile(accountId);
    if(p.season.state!=='active'||p.season.paused||p.season.ends_at&&p.season.ends_at<=rank.now())fail(409,'赛季暂停或收尾中，请参加普通模拟');
    if(p.pending)fail(503,'有结算待恢复，请稍后再开排位');
    if(!allowLocked&&p.activeMatch)fail(409,'请先恢复当前排位');
    return p;
  };
  const oldLeave=rank.markLeave.bind(rank);
  rank.markLeave=(...args)=>{oldLeave(...args);rank.run('DELETE FROM abandons WHERE match_id=? AND account_id=?',args[0],args[1]);};
  const oldSettle=rank.settle.bind(rank);
  rank.settle=(id,summary)=>{
    const match=rank.one('SELECT * FROM matches WHERE id=?',id);
    if(!competitive(decode(match?.rules)))return oldSettle(id,summary);
    if(!match||['settled','void'].includes(match.status))return [];
    if(!summary||summary.errors>0||summary.reason==='error')return oldSettle(id,{reason:'error'});
    const seats=rank.all('SELECT * FROM participants WHERE match_id=?',id);
    const inputs=seats.map(p=>{
      const row=summary.players?.find(x=>x.playerId===p.player_id),stats=row?.competitiveStats||row?.stats;
      const names=['survivalRounds','rankedDamage','bossDamage','rankedPerfectRounds','activatedLayers','assists'];
      if(summary.competitiveStatsVersion!==1||!stats||names.some(k=>!Number.isFinite(stats[k])||stats[k]<0)||stats.valid===false)fail(503,'个人表现统计待确认，结果保留且不会按零分结算');
      return {p,input:{difficulty:match.difficulty,mode:match.mode,startingParticipantCount:seats.length,win:!p.forfeit&&!!(summary.victory||summary.rankMainCleared||p.after_clear),alive:!!p.after_clear||row.alive!==false&&!p.forfeit,roundsPassed:row.roundsPassed||0,survivalRounds:stats.survivalRounds,rankedDamage:stats.rankedDamage,bossDamage:stats.bossDamage,rankedPerfectRounds:stats.rankedPerfectRounds,layers:stats.activatedLayers,assists:stats.assists}};
    });
    return rank.transaction(()=>{
      const now=rank.now(),entries=[];
      for(const {p,input} of inputs) {
        const previous=rank.competitiveState(p.account_id,match.season_id),{state,receipt}=calculateCompetitive(previous,input,now);
        const reason=p.forfeit?'abandoned':input.win?'victory':'defeat';
        const entry={...receipt,accountId:p.account_id,matchId:id,seasonId:match.season_id,mode:match.mode,difficulty:match.difficulty,victory:input.win,hidden:!!summary.hiddenCleared&&!p.forfeit,nominal:receipt.totalDelta,delta:receipt.totalDelta,reason,beforeRank:receipt.rankBefore,afterRank:receipt.rankAfter};
        rank.saveCompetitive(p.account_id,match.season_id,state);
        rank.run('INSERT INTO ledger(match_id,account_id,nominal,before_points,after_points,victory,hidden,reason,created_at) VALUES(?,?,?,?,?,?,?,?,?)',id,p.account_id,entry.nominal,entry.before,entry.after,+entry.victory,+entry.hidden,reason,now);
        rank.run('INSERT INTO competitive_events(season_id,account_id,match_id,kind,payload,created_at) VALUES(?,?,?,?,?,?)',match.season_id,p.account_id,id,'match',JSON.stringify(input),now);
        entries.push(entry);
      }
      for(const entry of entries) {
        const state=rank.competitiveState(entry.accountId,match.season_id);
        const view=competitiveView(state,rank.competitivePosition(entry.accountId,match.season_id),now);
        Object.assign(entry,{afterRank:view.rank,iconAfter:view.rank.icon,tierAfter:view.rank.label,inactive:view.inactive,globalRank:view.globalRank});
        rank.run('INSERT INTO competitive_receipts VALUES(?,?,?)',id,entry.accountId,JSON.stringify(entry));
      }
      const record={...summary,players:summary.players.map(row=>({...row,rank:entries.find(e=>seats.find(p=>p.player_id===row.playerId)?.account_id===e.accountId)||null}))};
      rank.run('UPDATE battle_records SET summary=? WHERE id=?',JSON.stringify(record),id);
      rank.run("UPDATE matches SET status='settled',summary=? WHERE id=?",JSON.stringify(record),id);
      rank.run('DELETE FROM locks WHERE match_id=?',id);
      return entries;
    });
  };
  const oldBoard=rank.leaderboard.bind(rank);
  rank.leaderboard=(seasonId,page=0,{scope='ranked',query=''}={})=>{
    const season=rank.one("SELECT * FROM seasons WHERE id=? AND state<>'draft'",seasonId);
    if(!competitive(decode(season?.rules)))return oldBoard(seasonId,page,{scope,query});
    const asOf=season.state==='archived'?season.ends_at:rank.now();
    if(!['ranked','all'].includes(scope)||typeof query!=='string'||query.length>80)fail(400,'榜单筛选无效');
    const all=rank.all('SELECT id,public_no,nickname FROM accounts WHERE visible=1').map(a=>{
      const state=rank.competitiveState(a.id,seasonId),view=competitiveView(state,rank.competitivePosition(a.id,seasonId,asOf),asOf);
      return {...view,accountId:a.id,public_no:a.public_no,nickname:a.nickname,participated:state.games>0||state.placementDone,online:!!rank.onlineStatus?.(a.id)};
    }).sort((a,b)=>Number(b.placementDone)-Number(a.placementDone)||Number(a.inactive)-Number(b.inactive)||b.points-a.points||b.lastActive-a.lastActive||a.public_no-b.public_no);
    let count=0,position=0,previous=null;
    const rows=all.map(row=>{if(!row.placementDone||row.inactive)return {...row,position:null};count++;if(!previous||previous.points!==row.points||previous.lastActive!==row.lastActive)position=count;previous=row;return {...row,position};})
      .filter(row=>(scope==='all'||row.participated)&&(!query||row.nickname.toLowerCase().includes(query.toLowerCase())||String(row.public_no)===query));
    return {season:{...season,rules:decode(season.rules)},page,scope,total:rows.length,rows:rows.slice(page*50,page*50+50)};
  };
  const oldCreate=rank.createSeason.bind(rank),oldDraft=rank.saveDraft.bind(rank);
  rank.createSeason=(body,actor)=>{
    if(!competitive(body.rules))return oldCreate(body,actor);
    const rules=checkedRules(body.rules);
    if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80)fail(400,'赛季名称须为1–80字');
    const endsAt=body.endsAt??null;if(endsAt!==null&&(!Number.isSafeInteger(endsAt)||endsAt<=rank.now()))fail(400,'结束时间必须在未来');
    const id=randomUUID();
    return rank.transaction(()=>{rank.run('INSERT INTO seasons(id,number,name,state,ends_at,rules) VALUES(?,?,?,?,?,?)',id,rank.one('SELECT COALESCE(MAX(number),0)+1 n FROM seasons').n,body.name.trim(),'draft',endsAt,JSON.stringify(rules));rank.audit(actor,'create-season',id);return {...rank.one('SELECT * FROM seasons WHERE id=?',id),rules};});
  };
  rank.saveDraft=(body,actor)=>{
    if(!competitive(body.rules))return oldDraft(body,actor);
    checkedRules(body.rules);
    if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80)fail(400,'赛季名称须为1–80字');
    if(!rank.one("SELECT id FROM seasons WHERE id=? AND state='draft'",body.id))fail(409,'仅可修改草稿');
    rank.run('UPDATE seasons SET name=?,rules=?,revision=revision+1 WHERE id=?',body.name.trim(),JSON.stringify(body.rules),body.id);
    rank.audit(actor,'edit-season-draft',body.id);return {...rank.one('SELECT * FROM seasons WHERE id=?',body.id),rules:body.rules};
  };
  rank.directPlacement=({accountId,points,reason},actor)=>{
    reason=reasonOf(reason);rank.syncAccounts();
    const season=rank.current();if(!competitive(season?.rules)||season.state!=='active')fail(409,'请先开启新规则赛季');
    if(!rank.one('SELECT id FROM accounts WHERE id=? AND visible=1',accountId))fail(404,'账号不存在');
    if(!Number.isSafeInteger(points)||points<0||points>1_000_000)fail(400,'定级总分须为0至1000000的整数');
    if(rank.one('SELECT * FROM locks WHERE account_id=?',accountId))fail(409,'该账号有未结束或待结算排位');
    return rank.transaction(()=>{
      const state=rank.competitiveState(accountId,season.id),before=state.points;
      Object.assign(state,{points,placementDone:true,placementPlayed:3,placementScore:points,lastActive:rank.now(),lastScoredAt:rank.now(),streak:0});
      rank.saveCompetitive(accountId,season.id,state);
      rank.run("INSERT INTO competitive_events(season_id,account_id,kind,payload,created_at) VALUES(?,?,'placement',?,?)",season.id,accountId,JSON.stringify({points,reason,actor}),rank.now());
      rank.audit(actor,'direct-placement',accountId,JSON.stringify({seasonId:season.id,before,after:points,reason}));
      return rank.profile(accountId);
    });
  };
  rank.upgradeSeason=({name,reason,confirm},actor)=>{
    reason=reasonOf(reason);
    if(!rank.one("SELECT id FROM seasons WHERE json_extract(rules,'$.kind') IS NULL LIMIT 1"))fail(409,'旧规则赛季已经清理，请使用正常赛季收尾功能');
    if(confirm!=='保留对局并清理旧赛季')fail(400,'请确认仅保留历史对局，移除旧赛季积分与榜单');
    if(typeof name!=='string'||!name.trim()||name.length>80)fail(400,'请填写新赛季名称');
    if(rank.one("SELECT id FROM matches WHERE status IN ('running','pending') LIMIT 1")||rank.pending.size)fail(409,'请先处理进行中局和可靠待结算结果');
    return rank.transaction(()=>{
      const legacyIds=rank.all("SELECT id FROM seasons WHERE json_extract(rules,'$.kind') IS NULL").map(s=>s.id);
      const number=rank.one('SELECT COALESCE(MAX(number),0)+1 n FROM seasons').n,id=randomUUID();
      const legacyRecords=rank.all("SELECT r.id,r.summary FROM battle_records r LEFT JOIN seasons s ON s.id=r.season_id WHERE r.season_id IS NULL OR json_extract(s.rules,'$.kind') IS NULL");
      for(const record of legacyRecords) {
        const summary=decode(record.summary);
        if(summary){delete summary.legacyScoreReceipts;delete summary.rankMainCleared;delete summary.productRanked;delete summary.competitivePending;delete summary.productRecordId;delete summary.rank;delete summary.ranked;if(summary.players)summary.players=summary.players.map(({rank,...player})=>player);}
        rank.run('UPDATE battle_records SET ranked=0,summary=? WHERE id=?',summary?JSON.stringify(summary):null,record.id);
      }
      for(const seasonId of legacyIds){
        rank.run('UPDATE battle_records SET season_id=NULL WHERE season_id=?',seasonId);
        for(const table of ['competitive_receipts','ledger','locks','abandons','participants'])rank.run('DELETE FROM '+table+' WHERE match_id IN (SELECT id FROM matches WHERE season_id=?)',seasonId);
        for(const table of ['competitive_events','competitive_profiles','matches','standings'])rank.run('DELETE FROM '+table+' WHERE season_id=?',seasonId);
        rank.run('UPDATE seasons SET next_id=NULL WHERE next_id=?',seasonId);
        rank.run('DELETE FROM seasons WHERE id=?',seasonId);
      }
      // Later archived Emi seasons are regular history and never belong to this one-time legacy cleanup.
      const existing=rank.current();
      if(!existing)rank.run("INSERT INTO seasons(id,number,name,state,starts_at,rules) VALUES(?,?,?,'active',?,?)",id,number,name.trim(),rank.now(),JSON.stringify(COMPETITIVE_RULES));
      rank.audit(actor,'upgrade-and-retire-legacy-seasons',existing?.id||id,JSON.stringify({reason,removed:legacyIds}));
      return existing||{id,number,name:name.trim(),rules:COMPETITIVE_RULES};
    });
  };
  const oldAdmin=rank.admin.bind(rank);
  const oldVoid=rank.voidMatch.bind(rank);
  rank.voidMatch=(id,actor,reason)=>{
    const match=rank.one('SELECT * FROM matches WHERE id=?',id);
    if(!competitive(decode(match?.rules)))return oldVoid(id,actor,reason);
    reason=reasonOf(reason);if(match.status==='void')return;
    if(actor!=='system'&&match.status!=='settled')fail(409,'只能作废已结算对局');
    const players=rank.all('SELECT account_id FROM participants WHERE match_id=?',id);
    if(players.some(p=>rank.one('SELECT match_id FROM locks WHERE account_id=? AND match_id<>?',p.account_id,id)))fail(409,'相关玩家有进行中的排位');
    rank.transaction(()=>{
      rank.run("UPDATE matches SET status='void',void_reason=? WHERE id=?",reason,id);
      rank.run('DELETE FROM locks WHERE match_id=?',id);
      for(const p of players) {
        let state=emptyCompetitive(),peak=0;
        for(const event of rank.all('SELECT * FROM competitive_events WHERE account_id=? AND season_id=? ORDER BY seq',p.account_id,match.season_id)) {
          const input=decode(event.payload);
          if(event.kind==='placement'){Object.assign(state,{points:input.points,placementScore:input.points,placementPlayed:3,placementDone:true,lastActive:event.created_at,lastScoredAt:event.created_at,streak:0});peak=Math.max(peak,state.points);continue;}
          if(rank.one('SELECT status FROM matches WHERE id=?',event.match_id)?.status!=='settled')continue;
          const result=calculateCompetitive(state,input,event.created_at);state=result.state;peak=Math.max(peak,state.points);
          rank.run('UPDATE ledger SET nominal=?,before_points=?,after_points=? WHERE match_id=? AND account_id=?',result.receipt.totalDelta,result.receipt.before,result.receipt.after,event.match_id,p.account_id);
          const old=decode(rank.one('SELECT receipt FROM competitive_receipts WHERE match_id=? AND account_id=?',event.match_id,p.account_id)?.receipt);
          const receipt={...old,...result.receipt,corrected:true,originalReceipt:old?.originalReceipt||old};
          rank.run('UPDATE competitive_receipts SET receipt=? WHERE match_id=? AND account_id=?',JSON.stringify(receipt),event.match_id,p.account_id);
          const member=rank.one('SELECT player_id FROM participants WHERE match_id=? AND account_id=?',event.match_id,p.account_id);
          for(const table of ['matches','battle_records']){const stored=decode(rank.one('SELECT summary FROM '+table+' WHERE id=?',event.match_id)?.summary);if(stored?.players){stored.players=stored.players.map(row=>row.playerId===member.player_id?{...row,rank:receipt}:row);rank.run('UPDATE '+table+' SET summary=? WHERE id=?',JSON.stringify(stored),event.match_id);}}
        }
        rank.saveCompetitive(p.account_id,match.season_id,state);
        rank.run('UPDATE standings SET peak=? WHERE season_id=? AND account_id=?',peak,match.season_id,p.account_id);
      }
      rank.audit(actor,'void-competitive-match',id,reason);
    });
    rank.pending.delete(id);rank.onVoid(id,reason);
  };
  rank.admin=()=>({...oldAdmin(),competitiveRules:COMPETITIVE_RULES,migrationPreview:{records:rank.one("SELECT COUNT(*) n FROM battle_records r JOIN seasons s ON s.id=r.season_id WHERE json_extract(s.rules,'$.kind') IS NULL").n,standings:rank.one("SELECT COUNT(*) n FROM standings r JOIN seasons s ON s.id=r.season_id WHERE json_extract(s.rules,'$.kind') IS NULL").n,legacySeasons:rank.one("SELECT COUNT(*) n FROM seasons WHERE json_extract(rules,'$.kind') IS NULL").n},players:rank.all('SELECT id,public_no,nickname FROM accounts WHERE visible=1'),directPlacements:rank.all("SELECT * FROM audit WHERE action='direct-placement' ORDER BY seq DESC LIMIT 30")});
}
