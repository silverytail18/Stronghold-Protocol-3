import {randomInt} from 'node:crypto';
import {musicTrack,validateMusicRules} from '../../shared/music.js';

/** Per-match arbitration. No battle RNG, playback clock, timers, or progress synchronization. */
export class MatchMusic {
  constructor({matchId,mode,rules={},send=()=>{},random=()=>randomInt(0,0x1000000)/0x1000000}) {
    if(!validateMusicRules(rules))throw new TypeError('Invalid music rules');
    this.matchId=matchId;this.mode=mode;this.rules=structuredClone(rules);this.send=send;this.random=random;
    this.triggered=new Map();this.batches=new Set();this.sequence=0;this.delayed=new Map();this.history=new Map();
  }
  used(playerId,trackId){return this.triggered.get(playerId)?.has(trackId)===true;}
  consume(playerId,trackId){if(!this.triggered.has(playerId))this.triggered.set(playerId,new Set());this.triggered.get(playerId).add(trackId);}
  consumeCandidates(candidates) {
    const pool=new Map();
    for(const c of candidates){
      if(typeof c.playerId!=='string'||!musicTrack(c.trackId)||this.used(c.playerId,c.trackId))continue;
      this.consume(c.playerId,c.trackId);
      // One lottery entry per song; retain its first qualifying player for the announcement.
      if(!pool.has(c.trackId))pool.set(c.trackId,c.playerId);
    }
    return pool;
  }
  // Conditions are consumed at settlement; only the playback lottery waits for the next round.
  defer(batchId,round,candidates) {
    if(this.mode!=='coop'||this.batches.has(batchId))return;
    this.batches.add(batchId);
    const pool=this.consumeCandidates(candidates);
    if(!pool.size)return;
    if(!this.delayed.has(round))this.delayed.set(round,new Map());
    for(const [id,playerId] of pool)if(!this.delayed.get(round).has(id))this.delayed.get(round).set(id,playerId);
  }
  batch(batchId,round,candidates,{includeDeferred=false,battle=false}={}) {
    if(this.mode!=='coop'||this.batches.has(batchId))return null;
    this.batches.add(batchId);
    const pool=this.consumeCandidates(candidates);
    if(includeDeferred)for(const [target,tracks] of this.delayed){
      if(target>round)continue;
      this.delayed.delete(target);
      if(target===round)for(const [id,playerId] of tracks)if(!pool.has(id))pool.set(id,playerId);
    }
    // Consume all qualifying players before filtering or random selection, even if nobody hears it.
    let eligible=[...pool.keys()].filter(id=>{const r=this.rules[id];return r?.enabled&&r.probability>0&&(r.probability===100||this.random()*100<r.probability);});
    if(!eligible.length)return null;
    const highest=Math.max(...eligible.map(id=>this.rules[id].probability));
    eligible=eligible.filter(id=>this.rules[id].probability===highest);
    const trackId=eligible[Math.min(eligible.length-1,Math.floor(this.random()*eligible.length))];
    const msg={t:'m.musicPlay',matchId:this.matchId,sequence:++this.sequence,trackId,source:'rule',scopeRoundId:round,endRoundId:round+(battle?1:0),triggerPlayerId:pool.get(trackId)};
    this.send(msg);return msg;
  }
  observeLife(playerId,round,lp){
    let h=this.history.get(playerId);if(!h){h={earlyMin:Infinity};this.history.set(playerId,h);}
    if(round<=10)h.earlyMin=Math.min(h.earlyMin,lp);
  }
  death(playerId,round){
    const out=[{playerId,trackId:'yu-ai'},{playerId,trackId:'guan-yu-zhi-ge'}];
    if(round>10&&Number.isFinite(this.history.get(playerId)?.earlyMin)&&this.history.get(playerId).earlyMin>=20)out.push({playerId,trackId:'pi-pa-xing'});
    return out;
  }
  roundCandidates(round){
    return round===1?[{playerId:'$room',trackId:'xin-zheng-cheng'}]:[];
  }
}
