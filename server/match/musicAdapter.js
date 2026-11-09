import {MatchMusic} from './music.js';
import {battleMusicCandidates,settlementMusicCandidates,damageMusicCandidates,hiddenCoreMusicCandidates,musicTrack} from '../../shared/music.js';
export class MusicAdapter {
  constructor(m){this.m=m;this.id=`${m.roomCode}:${m.seed}:${m.opts.matchNo||1}`;this.pending=[];this.acquired=new Map();this.streak=new Map();this.winStreak=new Map();this.engine=new MatchMusic({matchId:this.id,mode:m.mode,rules:m.opts.musicRules||{},send:msg=>this.pending.push(msg)});}
  batch(key,c,options){this.engine.batch(key,this.m.round,c,options);}
  observe(){if(this.m.round<1)return;for(const p of this.m.order)this.engine.observeLife(p.playerId,this.m.round,p.lp);}
  round(){this.observe();const c=this.engine.roundCandidates(this.m.round);c.push(...hiddenCoreMusicCandidates({mode:this.m.mode,round:this.m.round,hiddenRound:this.m.gd.hiddenRound,players:this.m.order}));const alive=this.m.alivePlayers().filter(p=>!p.isBot);if(this.m.round===this.m.gd.bossRound||this.m.round===this.m.gd.hiddenRound){for(const p of alive){if(p.lp<5)c.push({playerId:p.playerId,trackId:'ba-qian-li'});if(p.lp>20)c.push({playerId:p.playerId,trackId:'ci-jiu-men'});if(alive.length&&alive.every(p=>p.lp<10))c.push({playerId:p.playerId,trackId:'zhen-ying-xiong'});}}this.batch(`round:${this.m.round}`,c,{includeDeferred:true});}
  obtained(p,id){const name=this.m.gd.chess(id)?.name;if(name){if(!this.acquired.has(p.playerId))this.acquired.set(p.playerId,new Set());this.acquired.get(p.playerId).add(name.replace(/精锐/g,''));}}
  battle(){const pairs=[['egirShip','克莱门莎'],['rhodesShip','丰川祥子'],['lateranoShip','新约能天使'],['victoriaShip','烛煌'],['kjeragShip','圣聆初雪']];
    const players=this.m.order.map(p=>{const bonds=Object.entries(p.bonds||{}).map(([id,b])=>({...b,core:!!this.m.gd.bond(id)?.isCore,dayan:id==='yanShip'}));const owned=[...p.board.values(),...p.hand,...p.temp].filter(Boolean).map(x=>this.m.gd.chess(x.id)?.name?.replace(/精锐/g,''));
      const hit=pairs.some(([id,name])=>p.bonds?.[id]?.active&&this.acquired.get(p.playerId)?.has(name)&&owned.includes(name));return {playerId:p.playerId,alive:p.alive,left:p.left,isBot:p.isBot,lp:p.lp,bonds,acquiredWithActiveBond:hit};});
    this.coreFive=new Map(players.map(p=>[p.playerId,p.bonds.some(b=>b.core&&b.active&&b.count===5)]));this.coreFiveRound=this.m.round;
    this.batch(`battle:${this.m.round}`,battleMusicCandidates({round:this.m.round,players}),{battle:true});this.acquired.clear();}
  settle(rows){this.observe();const c=[];let humanDeath=false;for(const r of rows){const p=r.ps;if(p.isBot||p.left)continue;const previous=this.winStreak.get(p.playerId);if(previous?.round!==this.m.round){const count=r.won?(previous?.round===this.m.round-1?previous.count+1:1):0;this.winStreak.set(p.playerId,{round:this.m.round,count});if(count===10)c.push({playerId:p.playerId,trackId:'pi-pa-qu'});}const n=r.counted>0?(this.streak.get(p.playerId)||0)+1:0;this.streak.set(p.playerId,n);c.push(...settlementMusicCandidates({players:[{playerId:p.playerId,lp:p.lp,leaks:r.counted,lossStreak:n,rescueResolved:true,rescuedByTeammates:r.saved}]}));if(p.lp<=0){humanDeath=true;c.push(...this.engine.death(p.playerId,this.m.round));if(this.coreFiveRound===this.m.round&&this.coreFive?.get(p.playerId))for(const trackId of ['cha-yi-bu','tian-liang-yi-qian-shuo-zai-jian'])c.push({playerId:p.playerId,trackId});}}const survivors=this.m.order.filter(p=>!p.isBot&&!p.left&&p.alive&&p.lp>0);if(humanDeath&&survivors.length===1)c.push({playerId:survivors[0].playerId,trackId:'gu-yong-zhe'});this.engine.defer(`settle:${this.m.round}`,this.m.round+1,c);}
  result(field,res){
    if(this.m.mode!=='coop'||!field||!res?.perPlayer)return;
    const round=field.spec?.round??field.battle?.round;
    if(round!==undefined&&round!==this.m.round)return;
    if(this.damageRound!==this.m.round){this.damageRound=this.m.round;this.damage=new Map();this.damageFields=new WeakSet();this.damageBatch=0;}
    if(this.damageFields.has(field))return;
    this.damageFields.add(field);
    const players=[];
    for(const pid of field.players||[]){
      const p=this.m.players.get(pid);if(!p||p.left||p.isBot)continue;
      const board=new Set([...p.board.values()].filter(u=>u.kind==='chess').map(u=>u.uid)),phase=new Map();
      for(const u of res.perPlayer[pid]?.unitStats||[]){
        if(u?.kind!=='op'||!Number.isInteger(u.uid)||!board.has(u.uid)||!this.m.gd.chess(u.defId)||!Number.isFinite(u.dmg)||u.dmg<0)continue;
        phase.set(u.uid,Math.max(phase.get(u.uid)||0,u.dmg));
      }
      if(!this.damage.has(pid))this.damage.set(pid,new Map());const totals=this.damage.get(pid);
      for(const[uid,n]of phase)totals.set(uid,(totals.get(uid)||0)+n);
      players.push({playerId:pid,operatorDamage:[...totals.values()]});
    }
    this.engine.defer(`damage:${this.m.round}:${++this.damageBatch}`,this.m.round+1,damageMusicCandidates({players}));
  }
  drain(){
    for(const msg of this.pending.splice(0)){
      this.m.broadcast(msg);
      const player=this.m.players.get(msg.triggerPlayerId),track=musicTrack(msg.trackId);
      if(track)this.m.broadcast({t:'m.ticker',text:`${player?.name||'全体玩家'}为大家点播《${track.name}》`,id:null,type:'MUSIC',priority:18,playerId:player?.playerId||null});
    }
  }
}
