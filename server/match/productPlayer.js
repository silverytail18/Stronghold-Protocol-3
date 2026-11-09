import {adminOperatorView} from './adminOperators.js';
import {ERR} from '../../shared/constants.js';
import {pieceBonds} from './bondsMeta.js';
import {syncIberiaLighthouse} from './iberia-lighthouse.js';
import {syncRhine,rhineView} from './productRhine.js';
import {pendingForPlayer} from '../sim/content/kazdel/meta.js';
import * as kz from '../sim/content/kazdel/recruit.js';
import * as kj from '../sim/content/expansion/kjerag-recruit.js';
import * as hi from '../sim/content/higashi/recruit.js';
import * as ur from '../sim/content/ursus/recruit.js';
import {investmentEnabled,investmentView} from './investment.js';
import {makeCtx} from './effectsMeta.js';
const OK={ok:true},fail=detail=>({error:ERR.BAD_TARGET,detail});
export const productEnabled=ps=>!!ps.gd.raw.config?.productContent?.ids?.length;
export function installProductPlayer(Player){
  Object.assign(Player.prototype,{
    ursusDomainView(){if(!this.bonds.ursusShip?.active)return null;const d=makeCtx(this.m,this,{kind:'global',key:'global:ursus-view'},'view').ursusDomain();return {playerId:this.playerId,tier:d.tier,layers:this.layers.ursusShip||0,area:d.area,cells:d.cells.map(({row,col,k})=>[row,col,k])};},
    kazdelPieceBonds(p){return pieceBonds(this.gd,p);},
    setKazdelDonation(){this.kazdelDonationIds=[];return fail('献血选择已移除');},
    openKazdelRecruit(round){const gate=this._gate();if(gate)return gate;return kz.openKazdelRecruit(this,round)?OK:fail('没有可打开的特蕾西娅招募');},
  });
  const wrap=(name,fn)=>{const original=Player.prototype[name];Player.prototype[name]=function(...args){return productEnabled(this)?fn.call(this,original.bind(this),...args):original.apply(this,args);};};
  wrap('recompute',function(original){const result=original();if(this._syncProduct)return result;this._syncProduct=true;try{syncIberiaLighthouse(this);kz.syncKazdelRecruit(this);syncRhine(this);hi.syncHigashiRecruit(this);ur.syncUrsusRecruit(this);}finally{this._syncProduct=false;}return result;});
  wrap('pickReward',function(original,idx){
    const gate=this._gate();if(gate)return gate;const offer=this.offers[0],slot=offer?.slots?.[idx];
    const kinds=[[ur.isUrsusRecruitOffer,ur.validUrsusChoice,ur.refreshUrsusRecruit,ur.claimUrsusRecruit],[hi.isHigashiRecruitOffer,hi.validHigashiChoice,hi.refreshHigashiRecruit,hi.claimHigashiRecruit],[kj.isKjeragRecruitOffer,kj.validRecruitChoice,kj.refreshKjeragRecruit,kj.claimKjeragRecruit],[kz.isKazdelRecruitOffer,kz.validKazdelChoice,kz.refreshKazdelRecruit,kz.claimKazdelRecruit]];
    const handler=offer&&kinds.find(([is])=>is(offer));
    if(handler&&slot&&!handler[1](this,offer,slot.id)){handler[2](this,offer);return{error:ERR.SOLD_OUT,detail:'候选已变化，招募机会保留'};}
    const prior=handler?{...this.counters}:null;if(handler&&slot)handler[3](this,offer);
    const result=original(idx);if(!result?.ok&&prior)this.counters=prior;
    if(result?.ok&&handler){kz.syncKazdelRecruit(this);kj.syncKjeragRecruit(this);hi.syncHigashiRecruit(this);ur.syncUrsusRecruit(this);}return result;
  });
  wrap('endPrep',function(original){kz.lockKazdelRecruit(this);return original();});
  wrap('privateView',function(original){const view=original(),offer=this.offers[0];if(kz.isKazdelRecruitOffer(offer)&&view.shop?.rewardOffer)view.shop.rewardOffer={...view.shop.rewardOffer,label:'共生之约',kazdelRound:offer.kazdelRound,kazdelMaxTier:offer.kazdelMaxTier,persistent:true};return{...view,ursusDomain:this.ursusDomainView(),adminOperators:adminOperatorView(this.m,this),...(this.gd.bond('kazdelShip')?{kazdelPendingGrowth:pendingForPlayer(this),kazdelRecruitPending:kz.kazdelRecruitPending(this)}:{}),...(this.gd.bond('rhineShip')?{rhine:rhineView(this)}:{}),...(investmentEnabled(this.m)?{investment:investmentView(this)}:{})};});
  wrap('battleInput',function(original,...args){const input=original(...args);if(args[0]?.carry){const prior=this.m.lastResults?.get(this.playerId);if(prior){for(const key of ['coreStartupCarry','rhodesCarry','kazdelCarry','kazdelFixedCarry'])if(prior[key])input[key]=structuredClone(prior[key]);for(const key of ['higashi','ursus','iberia'])if(prior[key]?.carry)input[key+'Carry']=structuredClone(prior[key].carry);for(const unit of input.units){const old=prior.unitsEnd?.find(u=>u.uid===unit.uid);if(old?.skillActive&&unit.carryState&&!unit.carryState.down)unit.carryState.skillActive=true;}}}for(const unit of input.units){const piece=this.find(unit.uid)?.piece;if(piece?.meta?.masterySkillId)unit.masterySkillId=piece.meta.masterySkillId;}return input;});
}
