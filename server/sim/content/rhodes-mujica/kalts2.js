import {absoluteRangeKeys,sortEnemyTargets} from '../../targeting.js';
import {live,allies,enemies,hurt,talent,stat,beginAttack,endAttack} from './common.js';
import {riMember} from './engineering.js';

const interval=u=>Math.max(.1,u.s.bat*100/Math.max(1,u.s.aspd));
function medicalEnemies(b,u,grid=u.liveRangeGrid){
 const targets=enemies(b,u,grid,true);
 for(const e of b.blockedTargets(u,{canHitFly:true}))if(!targets.includes(e))targets.push(e);
 return sortEnemyTargets(b,u,targets);
}
function medicalTargets(b,u){
 const s=u.skill;
 if(s.active&&s.id==='skchr_kalts2_2'){
  const es=medicalEnemies(b,u);return es.length?es.slice(0,1):hurt(b,u).slice(0,1);
 }
 return hurt(b,u).slice(0,s.active&&s.id==='skchr_kalts2_3'?2:1);
}
function returnTrip(b,u){
 for(const [a,at]of u.mem.rmKaltsTrip||[]){if(live(a))b.relocate(a,...at);const k=at[0]*b.grid.cols+at[1];if(b._movementHomes?.get(k)===a)b._movementHomes.delete(k);}
 u.mem.rmKaltsTrip=[];
}
function anchorTrip(b,u){
 returnTrip(b,u);const grid=u.liveRangeGrid,initial=allies(b,u,grid),base=b.allyUnits.filter(a=>live(a)&&a.kind==='op'&&a.ownerId===u.ownerId),score=(r,c)=>{
  const keys=new Set(absoluteRangeKeys(grid,r,c,u.dir));
  return base.filter(a=>a!==u&&keys.has(a.tileR*b.grid.cols+a.tileC)).reduce((n,a)=>n+1+(1-a.hpRatio)*3,0);
 };
 const current=score(u.tileR,u.tileC),options=absoluteRangeKeys(grid,u.tileR,u.tileC,u.dir).map(k=>[Math.floor(k/b.grid.cols),k%b.grid.cols]);
 options.sort((a,z)=>score(...z)-score(...a)||Math.abs(a[0]-u.tileR)+Math.abs(a[1]-u.tileC)-Math.abs(z[0]-u.tileR)-Math.abs(z[1]-u.tileC)||a[0]-z[0]||a[1]-z[1]);
 const travel=(a,r,c)=>{const at=[a.tileR,a.tileC];if(!b.grid.canStand(r,c,{ranged:a.def.attackKind==='ranged'})||!b.relocate(a,r,c))return false;b._movementHomes??=new Map();b._movementHomes.set(at[0]*b.grid.cols+at[1],a);u.mem.rmKaltsTrip.push([a,at]);b.fx('exp-aglna-move',{src:a.id,x:c,y:r});return true;};
 for(const at of options)if(score(...at)>current&&travel(u,...at))break;
 // Automatic tactical anchors: bring up to two wounded, unblocked allies into the new treatment field.
 const wounded=initial.filter(a=>a!==u&&a.kind==='op'&&a.ownerId===u.ownerId&&a.hpRatio<.8&&!a.blocking.length).sort((a,z)=>a.hpRatio-z.hpRatio||a.id-z.id).slice(0,2);
 for(const a of wounded){const at=absoluteRangeKeys(grid,u.tileR,u.tileC,u.dir).map(k=>[Math.floor(k/b.grid.cols),k%b.grid.cols]).filter(p=>Math.abs(p[0]-u.tileR)+Math.abs(p[1]-u.tileC)>0).sort((p,z)=>Math.abs(p[0]-a.tileR)+Math.abs(p[1]-a.tileC)-Math.abs(z[0]-a.tileR)-Math.abs(z[1]-a.tileC)||p[0]-z[0]||p[1]-z[1]);for(const p of at)if((p[0]!==a.tileR||p[1]!==a.tileC)&&travel(a,...p))break;}
}
export function kalts2(bb,chess,def){
 const skills={};for(const s of chess.skills){const p=s.bb;
  if(s.index===0)skills[s.skillId]={kind:'duration',heal:true,mods:{atkPct:p.atk,aspd:p.attack_speed}};
  // This hybrid skill needs enemy OR injured-ally selection on its expanded grid.
  // Generic SEARCH on a heal skill only sees injured allies; use the kit's own guarded search below.
  if(s.index===1)skills[s.skillId]={kind:'ammo',ammo:p['attack@trigger_time'],heal:true,trigger:'NEVER',mods:{atkPct:p.atk},targeting:{rangeGrid:s.rangeGrid}};
  if(s.index===2)skills[s.skillId]={kind:'duration',heal:true,mods:{atkPct:p.atk,batPct:p.base_attack_time/def.stats.bat},onStart({battle,unit}){anchorTrip(battle,unit);},onEnd({battle,unit}){returnTrip(battle,unit);}};
 }
 return {skills,talents:[{install(b,u){
  const t0=talent(def,0),t1=talent(def,1);stat(b,u,'rm:kalts2:watch',{hpPct:t0.max_hp,defPct:t0.def,blockCnt:t0.block_cnt});
  b.addBuff(u,{key:'rm:kalts2:flight',persist:true,allowDead:true,flags:{liftoff:true,blockFly:true}});u.mem.rmBlockRadiusScale=t0.block_radius_scale||0;
  u.profile.noAttack=true;u.mem.rmKaltsNext=0;u.mem.rmKaltsTrip=[];let entered=new Set();
  b.on('retreat',({unit})=>{if(unit===u)returnTrip(b,u);},{owner:u});b.on('death',({unit})=>{if(unit===u)returnTrip(b,u);},{owner:u});
  b.every(.05,()=>{
   if(!live(u)){entered=new Set();return;}
   const sk=u.skill,p=sk.bb,as=allies(b,u);
   const next=new Set(as.filter(a=>a!==u&&a.kind==='op').map(a=>a.id));
   if(t1.hp_recovery_per_sec)for(const a of as)if(a!==u&&a.kind==='op'&&!entered.has(a.id)){
    b.addBuff(a,{key:'rm:kalts2:barrier',shieldHits:1});b.addBuff(a,{key:'rm:kalts2:regen',duration:t1.buff_duration,mods:{hpRegen:t1.hp_recovery_per_sec*(riMember(b,a)?t1.rhodes_bonus:1)},source:u});
   }entered=next;
   if(sk.active&&sk.id==='skchr_kalts2_1')for(const a of b.allyUnits)if(a!==u&&a.kind==='op'&&a.ownerId===u.ownerId&&live(a)&&a.s.flags.liftoff)b.addBuff(a,{key:'rm:kalts2:blockradius',duration:.1,data:{scale:p['attack@block_radius_scale']}});
   if(!u.canAct||u.s.flags.disarm)return;
   if(sk.id==='skchr_kalts2_2'&&!sk.active&&sk.ready&&!sk.opCooling&&!u.s.flags.silence){
    const grid=sk.spec.targeting.rangeGrid;
    if(medicalEnemies(b,u,grid).length||hurt(b,u,grid).length)sk.activate('rm:kalts2:search');
   }
   if(b.time+1e-9<u.mem.rmKaltsNext)return;
   if(!medicalTargets(b,u).length)return;sk.onAboutToAttack();
   // Starting S3 can move the healer and S2 expands the grid; always select on the resulting range.
   const active2=sk.active&&sk.id==='skchr_kalts2_2',targets=medicalTargets(b,u);
   if(!targets.length)return;const actual=beginAttack(b,u,targets,sk.active);if(!actual?.length)return;u.mem.rmKaltsNext=b.time+interval(u);
   const amount=u.s.atk,params={...sk.bb},isSkill=sk.active,attackId=u.mem.rmAttackId;
   for(const target of actual){b.fx('heal',{src:u.id,target:target.id,x:target.x,y:target.y});
    if(active2){const x=target.x,y=target.y;b.after(.25,()=>{if(!live(u))return;
     const damage=()=>{for(const e of b.foesInRadius(x,y,1.5))if(live(e)){b.dealDamage(u,e,{amount:amount*params['attack@atk_scale'],type:'true',isAttack:true,isSkill:true,isSplash:true,tags:['rm:own','rm:kalts2:s2'],attackId});if(target.side==='enemy')b.applyStatus(e,'sluggish',{duration:params['attack@sluggish'],source:u});}};
     const heal=()=>{for(const a of b.allyUnits)if(live(a)&&a.kind==='op'&&Math.hypot(a.x-x,a.y-y)<=1.5)b.heal(u,a,amount*params['attack@heal_scale'],{ignoreNoHeal:true});};
     if(target.side==='enemy'){damage();heal();}else{heal();damage();}b.fx('rm-ri-heat',{x,y,r:1.5});
    });}else b.heal(u,target,amount,{isAttack:true,isSkill,ignoreNoHeal:true});
   }endAttack(b,u,actual,isSkill);
  },{owner:u});
 }}]};
}
