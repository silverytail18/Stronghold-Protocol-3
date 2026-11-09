import {createRng} from '../sim/rng.js';
import {randomInt} from 'node:crypto';
import {PHASE,ERR} from '../../shared/constants.js';
import {investmentIntent,freezeInvestment,settleInvestment} from './investment.js';
import {rhineIntent} from './productRhine.js';
import {settlePenguinSupply} from '../sim/content/expansion/penguin-meta.js';
import {makeCtx} from './effectsMeta.js';
export function installProductMatch(Match){
  Match.prototype.setProductAdminContext=function(context){this.productAdminContext=context;for(const p of this.order)this.markPrivate(p);this.flush(true);};
  const wrap=(name,fn)=>{const original=Match.prototype[name];Match.prototype[name]=function(...args){return this.data.config?.productContent?.ids?.length?fn.call(this,original.bind(this),...args):original.apply(this,args);};};
  wrap('_handle',function(original,ps,msg){
    if(msg.t==='g.infoReady'&&this.phase===PHASE.INFO_CHECK&&!this.setupVote&&(msg.setupRevision??0)===this.setupRevision&&!ps.botControlled&&!ps.infoReady){this.infoReadyOrder||=[];this.infoReadyOrder.push(ps.playerId);}
    if(msg.t==='g.investment')return investmentIntent(this,ps,msg);
    if(['g.rhineResearch','g.rhinePositions','g.rhineHire','g.rhineReset'].includes(msg.t))return rhineIntent(ps,msg);
    if(msg.t==='g.kazdelDonation')return ps.setKazdelDonation(msg.ids);
    if(msg.t==='g.kazdelRecruit')return ps.openKazdelRecruit(msg.round);
    return original(ps,msg);
  });
  wrap('enterInfoCheck',function(original,...args){this.infoReadyOrder=[];return original(...args);});
  wrap('enterBandDraft',function(original,...args){
    if(!this.isSolo&&this.data.config.bandDraft?.confirmationOrder){const first=[...(this.infoReadyOrder||[])],seen=new Set(first);this._productDraftOrder=[...first,...this.order.filter(p=>!p.botControlled&&!seen.has(p.playerId)).map(p=>p.playerId),...this.order.filter(p=>p.botControlled).map(p=>p.playerId)];}
    return original(...args);
  });
  wrap('humansFirst',function(original,ids){if(this._productDraftOrder&&this.phase===PHASE.BAND_DRAFT){const order=this._productDraftOrder;this._productDraftOrder=null;return order;}return original(ids);});
  wrap('_startRoundAfterOffers',function(original,...args){
    if(!this.rngInvestment){for(const key of ['rngInvestment','rngInvestmentEvent','rngInvestmentMarket','rngInvestmentSignal'])this[key]=createRng(randomInt(1,0x100000000));}
    const result=original(...args);settleInvestment(this);return result;
  });
  wrap('enterPrep',function(original,...args){for(const ps of this.alivePlayers())settlePenguinSupply(makeCtx(this,ps,{kind:'global',key:'global:penguin_supply'},'onPrepStart'));return original(...args);});
  wrap('endPrep',function(original,...args){if(this.phase===PHASE.PREP)freezeInvestment(this);return original(...args);});
}
