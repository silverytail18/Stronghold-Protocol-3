import {MusicAdapter} from './musicAdapter.js';
import {uniteSurvivors} from './unite.js';
import {PHASE} from '../../shared/constants.js';
export function initializeProductMusic(match,opts){if(opts.musicRules)match.productMusic=new MusicAdapter(match);}
export function installProductMusic(Match){
  const wrap=(name,fn)=>{const original=Match.prototype[name];Match.prototype[name]=function(...args){return this.productMusic?fn.call(this,original.bind(this),...args):original.apply(this,args);};};
  wrap('dispatch',function(original,ps,hook,event,...args){if(hook==='onGain'&&event.kind==='chess')this.productMusic.obtained(ps,event.piece.id);if(hook==='onLevelUp'&&!ps.isBot&&!ps.left&&this.round===7&&event.level===6)this.productMusic.batch('upgrade:'+ps.playerId,[{playerId:ps.playerId,trackId:'peng-you-de-jiu'}]);return original(ps,hook,event,...args);});
  wrap('_startRoundAfterOffers',function(original,...args){const result=original(...args);this.productMusic.round();return result;});
  for(const method of ['startCombat','startFinalAssault'])wrap(method,function(original,...args){this.productMusic.battle();return original(...args);});
  wrap('_collectSimErrors',function(original,field,result){this.productMusic.result(field,result);if(this.phase===PHASE.COMBAT){if(this.productMusic.normalResultRound!==this.round){this.productMusic.normalResultRound=this.round;this.productMusic.normalResults=new Map();}for(const id of field.players||[])this.productMusic.normalResults.set(id,result&&!result.synthetic?result.perPlayer?.[id]:null);}return original(field,result);});
  wrap('settle',function(original,plan,result){const alive=this.alivePlayers().map(ps=>{const r=this.productMusic.normalResultRound===this.round?this.productMusic.normalResults?.get(ps.playerId):null;return {ps,counted:(this.lastResults.get(ps.playerId)?.leaked||[]).filter(l=>l.counted!==false).length,won:!!(r&&!r.synthetic&&r.perfect!==false&&!(r.leaked||[]).some(l=>l&&l.counted!==false)&&!(Number(r.leaderLpLoss)>0))};});const survivors=plan&&result&&!result.synthetic?uniteSurvivors(plan,result):null;for(const row of alive)row.saved=!!(row.counted>0&&survivors&&plan.leakers.includes(row.ps)&&(survivors.get(row.ps.playerId)||0)===0&&plan.helpers.some(h=>h!==row.ps));const answer=original(plan,result);this.productMusic.settle(alive);return answer;});
  wrap('flush',function(original,...args){this.productMusic.observe();const result=original(this.productMusic.pending.length?true:args[0]);this.productMusic.drain();return result;});
  wrap('publicView',function(original){return{...original(),musicMatchId:this.productMusic.id,musicMode:this.mode};});
}
