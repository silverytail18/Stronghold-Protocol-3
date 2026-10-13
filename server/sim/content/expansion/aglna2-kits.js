// New-content kit only. Ground/air route motion is never rewritten by lift-off.
import {AGLNA2} from './expansion-data.js';
import {absoluteRangeKeys,canTargetEnemy,sortEnemyTargets} from '../../targeting.js';
import {DIR_VEC} from '../../dir.js';
import {live,enemies,ownOps,groundbind} from './operator-support.js';
function gravityWave(b,u,p){
  const [dr,dc]=DIR_VEC[u.dir],r=u.tileR,c=u.tileC,started=b.time,seen=new Set();
  // Original data: 3-wide, 1.3-thick rectangle, speed 6, at most four tiles forward.
  const timer=b.every(0.05,()=>{
    const travel=Math.min(4,(b.time-started)*6);
    for(const e of b.enemies){if(!live(e)||seen.has(e.id))continue;
      const along=(e.y-r)*dr+(e.x-c)*dc,across=(e.y-r)*dc-(e.x-c)*dr;
      if(along < -0.65 || along > travel+0.65 || Math.abs(across)>1.5)continue;
      seen.add(e.id);if(e.isFlying)groundbind(b,u,e,p.buff_duration_ground_bound);else b.applyStatus(e,'levitate',{duration:p.buff_duration_levitate,source:u});
    }
    if(travel>=4)timer.cancel();
  });
  b.fx('exp-gravity-wave',{x:c,y:r,dir:u.dir});
}
function flightStart(b,u){b.releaseBlocked(u);b._refreshRange(u);}
function flightEnd(b,u){b.releaseBlocked(u);}
function moveInFlight(b,u,r,c){
  const skill=u.skill;if(!live(u)||!skill?.active||skill.id!=='skchr_aglna2_3'||u.blocking.length)return false;
  if(!b.relocate(u,r,c))return false;
  b.fx('exp-aglna-move',{x:c,y:r,src:u.id});return true;
}
function beginFlightTrip(b,u){
  u.mem.expAglnaOrigin=[u.tileR,u.tileC];u.mem.expAglnaNextMove=0;
  // Reserve the return tile without leaving a ghost occupant/blocker there.
  b._movementHomes??=new Map();b._movementHomes.set(u.tileR*b.grid.cols+u.tileC,u);
  flightStart(b,u);
}
function endFlightTrip(b,u){
  const at=u.mem.expAglnaOrigin;
  flightEnd(b,u);
  if(at&&live(u))b.relocate(u,at[0],at[1]);
  if(at&&b._movementHomes?.get(at[0]*b.grid.cols+at[1])===u)b._movementHomes.delete(at[0]*b.grid.cols+at[1]);
  u.mem.expAglnaOrigin=null;
}
function aglna(bb,chess,def){
  const skills={};for(const s of chess.skills){const p=s.bb;
    if(s.index===0)skills[s.skillId]={kind:'duration',spType:'none',trigger:'NEVER',mods:{atkPct:p.atk},flags:{liftoff:true},targeting:{rangeGrid:s.rangeGrid,maxTargets:p['attack@max_target']},onStart({battle,unit}){flightStart(battle,unit);},onEnd({battle,unit}){flightEnd(battle,unit);}};
    if(s.index===1)skills[s.skillId]={kind:'duration',trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid},chantDuration:p.chant_duration,mods:{atkPct:p.atk,batPct:(def.stats.bat+p.base_attack_time)/def.stats.bat-1},flags:{liftoff:true},targeting:{rangeGrid:s.rangeGrid,maxTargets:p['attack@max_target']},attack:{dmgType:'arts'},
      onChantStart({battle,unit}){gravityWave(battle,unit,p);battle.fx('exp-chant',{src:unit.id,duration:p.chant_duration});},
      onStart({battle:b,unit:u}){flightStart(b,u);
        // Prototype's slide lasts 1s (takeoff begin .333s + four tiles / speed 6).
        // Logical centre is fixed. Protection is scoped to this slide, not the whole 22s skill.
        b.addBuff(u,{key:'exp:aglna:slide',duration:1,flags:{invulnerable:true,untargetable:true,noBlock:true,disarm:true},source:u});
        u.mem.expAglnaProtectedUntil=b.time+1;
      },onEnd({battle,unit}){flightEnd(battle,unit);battle.removeBuff(unit,'exp:aglna:slide');unit.mem.expAglnaProtectedUntil=0;}};
    if(s.index===2){const extended=[...s.rangeGrid];for(const dr of [-1,0,1])for(const dc of [-1,0,1])if(!extended.some(x=>x[0]===dr&&x[1]===dc))extended.push([dr,dc]);
      skills[s.skillId]={kind:'ammo',ammo:p['attack@trigger_time'],flags:{liftoff:true},mods:{atkPct:p.atk},targeting:{rangeGrid:extended,maxTargets:3},attack:{dmgType:'phys',atkScale:p['attack@atk_scale']},
        onStart({battle,unit}){beginFlightTrip(battle,unit);},
        onEnd({battle,unit}){endFlightTrip(battle,unit);},
        onAttack({battle:b,unit:u,targets}){
          const extra=enemies(b,u,extended,true).find(e=>e.isFlying&&!targets.includes(e));
          if(extra)b.dealDamage(u,extra,{amount:u.s.atk*p['attack@atk_scale'],type:'phys',isAttack:true,isSkill:true,tags:['exp:aglna:extraAir']});
          for(const e of [...targets,...(extra?[extra]:[])])if(e?.alive&&e.isFlying)b.applyStatus(e,'slow',{value:-p.move_speed,duration:u.s.interval+0.1,source:u});
        }};
    }
  }
  return {skills,talents:[{install(b,u){
    const t1=def.talents[0].bb,t2=def.talents[1].bb;
    b.on('deploy',({unit})=>{if(unit!==u)return;const s=u.skill;
      if(s?.id==='skchr_aglna2_1')s.activate('deployment',{free:true});
    },{owner:u,priority:10000});
    b.on('damageResolved',({source,target,dmg})=>{if(source!==u||target.side!=='enemy'||!target.alive||!dmg?.isAttack||dmg.tags?.includes('exp:aglna:talent'))return;
      const scale=target.s.massLevel<=t1.mass_level?t1.atk_scale_hi:t1.atk_scale_lo;
      b.dealDamage(u,target,{amount:u.s.atk*scale,type:'arts',tags:['exp:aglna:talent']});
    },{owner:u});
    b.on('hit',ctx=>{if(ctx.target===u&&u.skill?.active&&u.skill.id==='skchr_aglna2_3'&&ctx.source?.isFlying)ctx.dmg.mul*=1-u.skill.bb.damage_resistance;},{owner:u});
    b.on('beforeStatus',ctx=>{if(ctx.target===u&&b.time<(u.mem.expAglnaProtectedUntil||0)&&['stun','freeze','sleep'].includes(ctx.status))ctx.cancel=true;},{owner:u,priority:10000});
    b.every(0.05,()=>{if(!live(u))return;
      if(u.s.flags.liftoff){for(const e of b.enemiesInKeys(u.rangeKeys,u,{canHitFly:true}))b.addBuff(e,{key:'exp:aglna:weightless',mods:{massFlat:-1},duration:0.1,source:u});}
      for(const a of ownOps(b,u))if(a.s.flags.liftoff)b.addBuff(a,{key:'exp:aglna:skyDance',mods:{atkPct:t2.atk,hpRegenRatio:a.blocking.length?t2.hp_recovery_per_sec_by_max_hp_ratio:0},duration:0.1,source:u});
      if(u.skill?.active&&u.skill.id==='skchr_aglna2_3'&&!u.blocking.length&&b.time>=(u.mem.expAglnaNextMove||0)){
        const range=chess.skills[2].rangeGrid;
        const candidates=enemies(b,u,range,true).filter(e=>e.isFlying&&!e.blockedBy&&!e.s.flags.unblockable&&!e.s.flags.noBlock&&b.grid.blockable(Math.round(e.y),Math.round(e.x)));
        const target=sortEnemyTargets(b,u,candidates)[0];if(target){u.mem.expAglnaNextMove=b.time+3;moveInFlight(b,u,Math.round(target.y),Math.round(target.x));}
      }
    },{owner:u});
  }}]};
}
export default {[AGLNA2]:aglna};
