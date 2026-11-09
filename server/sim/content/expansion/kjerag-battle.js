import {GUIDE} from './kjerag-data.js';
import {KJERAG_GUIDE as K,ICE_TAG} from './kjerag-balance.js';
import {canTargetEnemy} from '../../targeting.js';
import {bodyInKeys} from '../../body.js';
const EPS=1e-9,PROFILE={canHitFly:true};
const isMember=(u,pid)=>u?.kind==='op'&&u.ownerId===pid&&u.alive&&u.deployed&&u.def.bonds?.includes(GUIDE);
/** One scheduler per player; snapshot tier, live members/range, original status/damage pipelines. */
export function install(battle){
  if(!battle.allyUnits.some(u=>u.def.bonds?.includes(GUIDE)))return;
  const schedulers=battle.players.filter(p=>p.bonds?.[GUIDE]?.active).map(player=>({
    player,tier:player.bonds[GUIDE].tier,coldNext:null,coldLast:null,
    iceNext:null,iceLast:null,freezeRefund:0,usedAttacks:new Set(),
  }));
  if(!schedulers.length)return;
  const byPlayer=new Map(schedulers.map(s=>[s.player.playerId,s]));
  const members=s=>battle.allyUnits.filter(u=>isMember(u,s.player.playerId));
  battle.snowfieldGuideInfo=pid=>{
    const s=byPlayer.get(pid);if(!s)return null;
    return {live:true,tier:s.tier,layers:s.player.bonds[GUIDE].layers||0,
      coldRemaining:s.tier<2?null:s.coldNext===null?null:Math.max(0,s.coldNext-battle.time),
      iceRemaining:s.iceNext===null?0:Math.max(0,s.iceNext-battle.time),
      members:members(s).map(u=>({uid:u.uid,name:u.name,atk:Math.max(0,u._s?.atk??u.base.atk)}))};
  };
  // Freeze can occur immediately on spawn or after movement within the same tick: use live body geometry,
  // not the attack selector's spatial buckets (which are rebuilt once during the tick).
  const inRange=(s,target)=>members(s).some(u=>bodyInKeys(target,u.rangeKeySet||new Set(u.rangeKeys))&&canTargetEnemy(u,target,PROFILE));
  const canHit=(u,e)=>canTargetEnemy(u,e,PROFILE)&&!e.s.flags.invulnerable;
  battle.on('tick',()=>{
    for(const s of schedulers){
      if(s.tier<2)continue;
      if(s.coldNext!==null&&battle.time+EPS<s.coldNext)continue;
      const candidates=new Map();
      for(const u of members(s))for(const e of battle.enemiesInKeys(u.rangeKeys,u,PROFILE)){
        if(canHit(u,e)&&!e.s.flags.freeze&&!e.def.immune?.has('cold'))candidates.set(e.id,e);
      }
      if(!candidates.size)continue;
      if(s.coldNext===null)s.coldNext=battle.time+K.firstDelay;
      if(battle.time+EPS<s.coldNext)continue;
      let success=false;
      // Stable spawn order; overlapping members do not apply repeated cold in one pulse.
      for(const e of candidates.values())if(battle.applyStatus(e,'cold',{duration:K.coldDuration5,source:GUIDE})){
        success=true;battle.fx('snowfieldGuide',{x:e.x,y:e.y,id:e.id});
      }
      if(success){s.coldLast=battle.time;s.coldNext=battle.time+K.coldCooldown;}
    }
  });

  if(!schedulers.length)return;
  battle.on('statusApplied',({target,status,entered})=>{
    if(status!=='freeze'||entered!==true||target?.side!=='enemy')return;
    for(const s of schedulers){
      if(s.iceNext===null||battle.time+EPS>=s.iceNext||s.freezeRefund>=K.freezeRefundCap||!inRange(s,target))continue;
      const refund=Math.min(K.freezeRefund,K.freezeRefundCap-s.freezeRefund);
      s.freezeRefund+=refund;
      s.iceNext=Math.max(s.iceLast+K.iceMinimum,s.iceNext-refund);
    }
  });

  // Capture before hit riders can freeze the victim. A dodge/cancel/shield cannot consume the proc.
  // WeakMap avoids retaining failed damage instances for the whole battle.
  const pending=new WeakMap();
  battle.on('hit',({source,target,dmg})=>{
    pending.delete(dmg);
    const s=byPlayer.get(source?.ownerId);
    if(!s||!isMember(source,s.player.playerId)||target?.side!=='enemy'||!target.s.flags.freeze||
       !dmg.isAttack||dmg.isSplash||dmg.sourceless||dmg.tags?.some(t=>[ICE_TAG,'chain','dot','periodic','hpLoss'].includes(t)))return;
    pending.set(dmg,{s,source,target,x:target.x,y:target.y,amount:K.iceBase});
  },{priority:1000});
  battle.on('damageResolved',({dmg,dealt,target})=>{
    const hit=pending.get(dmg);pending.delete(dmg);
    if(!hit||hit.target!==target||!(dealt>0))return;
    const {s,source,x,y,amount}=hit;
    if((s.iceNext!==null&&battle.time+EPS<s.iceNext)||(dmg.attackId&&s.usedAttacks.has(dmg.attackId)))return;
    // Commit before secondary damage: reentrant hooks cannot trigger another ice burst.
    s.iceLast=battle.time;s.iceNext=battle.time+K.iceCooldown;s.freezeRefund=0;
    if(dmg.attackId)s.usedAttacks.add(dmg.attackId);
    if(s.tier>=2&&s.coldLast!==null&&battle.time+EPS<s.coldNext)s.coldNext=Math.max(s.coldLast+K.coldMinimum,s.coldNext-K.coldRefund);
    const radius=s.tier>=2?K.iceRadius5:K.iceRadius2;
    const splash=battle.enemiesInRadius(x,y,radius,true).filter(e=>e!==target&&canHit(source,e));
    battle.fx('snowfieldIceBurst',{x,y,r:radius,id:target.id});
    if(canHit(source,target))battle.dealDamage(source,target,{amount,type:'arts',tags:[ICE_TAG]});
    for(const e of splash)if(canHit(source,e))battle.dealDamage(source,e,{amount:amount*K.iceSplashRatio,type:'arts',isSplash:true,tags:[ICE_TAG]});
  });
}
export function registerMeta(reg){
  const sync=ctx=>ctx.syncKjeragRecruit();
  reg.band('band_exp_kjerag_recruit',{onPrepStart:sync,onLevelUp:sync,onGain:sync});
}
