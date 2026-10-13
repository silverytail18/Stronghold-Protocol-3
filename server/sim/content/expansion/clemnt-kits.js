import {CLEMNT} from './clemnt-data.js';
import {live,enemies} from './operator-support.js';
import {dirVec} from '../../dir.js';
import {hasHp,burstLocked,elementBurst} from '../../damage.js';
import {canTargetEnemy} from '../../targeting.js';
import {gainLayers} from '../support/index.js';
const legal=(b,u)=>b.enemies.filter(e=>live(e)&&canTargetEnemy(u,e,{canHitFly:false}));
const crosses=(b,r,c)=>b.enemies.filter(e=>live(e)&&!e.isFlying&&Math.abs(Math.round(e.y)-r)+Math.abs(Math.round(e.x)-c)<=1&&!e.s.flags.untargetable);
// Original S2 directly adds fixed gauge values. It deliberately bypasses resistance/multipliers/elementHit.
export function addVortexErosion(b,u,e,n=200){
 if(!live(e)||!hasHp(e)||e.s.flags.invulnerable||e.s.flags.sleep||burstLocked(e))return 0;
 e.elem.erosion=Math.min(e.gaugeMax,e.elem.erosion+n);u.stats.elem=(u.stats.elem||0)+n;b._ev(['dmg',e.id,n,'erosion']);
 if(e.elem.erosion>=e.gaugeMax)elementBurst(b,u,e,'erosion');return n;
}
function openPod(b,u,s){const [dr,dc]=dirVec(u.dir);u.mem.clemntPod={x:u.x,y:u.y,dx:dc,dy:dr,distance:0,stopped:false,pulse:0,seq:u.deploySeq};u.mem.clemntNext=0;b.addBuff(u,{key:'exp:clemnt:podDisarm',flags:{disarm:true},duration:10});}
function tickPod(b,u,s,dt){
 const pod=u.mem.clemntPod;if(!pod||pod.seq!==u.deploySeq)return;
 if(!pod.stopped){
  const d=Math.min(2*dt,3-pod.distance),x=pod.x+pod.dx*d,y=pod.y+pod.dy*d;
  const aheadX=x+pod.dx*.4,aheadY=y+pod.dy*.4,r=Math.round(aheadY),c=Math.round(aheadX),tile=b.grid.tile(r,c);
  const pass=b.grid.inRect(r,c)&&b.grid.groundPassable(r,c)&&tile?.key!=='tile_hole'&&tile?.special!=='HOLE';
  if(pass){
   let mass=0,count=0;const es=legal(b,u).filter(e=>Math.abs(e.x-pod.x)<=1.5&&Math.abs(e.y-pod.y)<=1.5&&!e.s.flags.noDisplace&&!e.def.staticBody&&!e.def.immune?.has('teleport')).sort((a,z)=>Math.hypot(a.x-pod.x,a.y-pod.y)-Math.hypot(z.x-pod.x,z.y-pod.y)||a.id-z.id);
   for(const e of es){const weight=Math.max(0,e.s.massLevel);if(count>=s.bb['attack@max_passenger_cnt'])break;if(mass+weight>s.bb['attack@max_passenger_mass'])continue;const nx=e.x+pod.dx*d,ny=e.y+pod.dy*d;if(!b.grid.groundPassable(Math.round(ny),Math.round(nx)))continue;b._unblock(e);e.x=nx;e.y=ny;if(e.route)e.route.pts=null;b._enemiesDirty=true;mass+=weight;count++;}
   pod.x=x;pod.y=y;pod.distance+=d;
  }
  if(!pass||pod.distance>=3-1e-9){pod.stopped=true;b.removeBuff(u,'exp:clemnt:podDisarm');}
 }
 b.fx(pod.stopped?'exp-clemnt-vortex':'exp-clemnt-pod',{x:pod.x,y:pod.y,r:1.5,src:u.id,dur:.12});
 if(!pod.stopped)return;
 // The pod transports ground enemies and the enhanced attack remains ground-only.
 // Its stopped vortex is a separate radius-1.5 area effect which can hit airborne enemies.
 const area=b.foesInRadius(pod.x,pod.y,1.5).filter(e=>live(e)&&canTargetEnemy(u,e,{canHitFly:true}));
 for(const e of area)b.addBuff(e,{key:'exp:clemnt:vortexSlow',duration:.12,mods:{moveMul:1+s.bb['attack@move_speed']},source:u});
 pod.pulse+=dt;while(pod.pulse>=1-1e-9){pod.pulse-=1;for(const e of area){addVortexErosion(b,u,e,s.bb['attack@water_element']);if(live(e))b.dealDamage(u,e,{amount:u.s.atk*u.s.atkScaleMul*s.bb['attack@physical_atk_scale'],type:'phys',isSkill:true,tags:['exp:clemnt:vortex']});}}
}
function bombard(b,u,s,e){
 const r=Math.round(e.y),c=Math.round(e.x),key=r*b.grid.cols+c,scale=u.s.atk*u.s.atkScaleMul,p={...s.bb};
 u.mem.clemntBombTiles.set(key,b.time+p.projectile_life_time);u.mem.clemntMarks.delete(e.id);
 s.ammoLeft--;b.emit('ammoUsed',{unit:u,left:s.ammoLeft,skill:s});
 // Projectiles already fired finish even if the skill ends or the operator is defeated.
 for(let i=0;i<3;i++)b.after(.5+i,()=>{for(const target of crosses(b,r,c)){
  b.dealDamage(u,target,{amount:scale*p.s3_atk_scale,type:'phys',isSkill:true,tags:['exp:clemnt:bombard']});
  if(live(target))b.dealDamage(u,target,{amount:scale*p.ep_damage_scale,type:'elemental',element:'erosion',isSkill:true,tags:['exp:clemnt:bombard']});
 }b.fx('exp-clemnt-bombard',{x:c,y:r,r:1.5,src:u.id});});
 if(s.ammoLeft<=0)s.end('ammo');
}
function clemnt(bb,chess,def){
 const skills={};for(const s of chess.skills){const p=s.bb;
  if(s.index===0)skills[s.skillId]={kind:'instant',attack:{atkScale:p.atk_scale,onEachHit({battle,unit,target,dealt}){if(dealt>0&&live(target))battle.dealDamage(unit,target,{amount:dealt*p.ep_damage_ratio,type:'element',element:'erosion',tags:['exp:clemnt:s1']});}}};
  if(s.index===1)skills[s.skillId]={kind:'duration',trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid},mods:{aspd:p.attack_speed},targeting:{rangeGrid:s.rangeGrid},attack:{noAttack:true},onStart({battle,unit,skill}){openPod(battle,unit,skill);},onEnd({battle,unit}){unit.mem.clemntPod=null;battle.removeBuff(unit,'exp:clemnt:podDisarm');},onTick({battle,unit,skill,dt}){if(!live(unit))return;tickPod(battle,unit,skill,dt);if(!unit.canAct||unit.s.flags.disarm||battle.time<unit.mem.clemntNext)return;const e=enemies(battle,unit,s.rangeGrid,false)[0];if(!e)return;const targets=legal(battle,unit).filter(a=>a===e||Math.hypot(a.x-e.x,a.y-e.y)<=1.5).sort((a,z)=>(a===e?-1:z===e?1:a.id-z.id)).slice(0,p['attack@max_target']);const ctx={attacker:unit,targets,isSkill:true,profile:unit.profile};battle.emit('beforeAttack',ctx);if(!live(unit)||!ctx.targets?.length)return;unit.lastAttackAt=battle.time;unit.stats.attacks++;unit.mem.clemntNext=battle.time+Math.max(.1,unit.s.bat*100/unit.s.aspd);const attackId=++battle._attackSeq;for(const target of ctx.targets)if(live(target))battle.dealDamage(unit,target,{amount:unit.s.atk*unit.s.atkScaleMul*p['attack@aoe_atk_scale'],type:'phys',isAttack:true,isSkill:true,attackId,tags:['exp:clemnt:s2Attack']});battle.emit('attack',{attacker:unit,targets:ctx.targets,isSkill:true});skill.onAttackPerformed(ctx.targets,true);}};
  if(s.index===2)skills[s.skillId]={kind:'ammo',ammo:p.trigger_time,trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid},targeting:{rangeGrid:s.rangeGrid,maxTargets:p['attack@max_target']},attack:{atkScale:p['attack@atk_scale'],onEachHit({battle,unit,target,dealt}){if(dealt>0&&live(target))battle.dealDamage(unit,target,{amount:dealt*p['attack@ep_damage_ratio'],type:'element',element:'erosion',tags:['exp:clemnt:s3Attack']});}},onAttack(ctx){ctx.noAmmo=true;},onStart({unit}){unit.mem.clemntMarks=new Map();unit.mem.clemntBombTiles=new Map();},onEnd({unit}){unit.mem.clemntMarks?.clear();},onTick({battle,unit,skill}){if(!live(unit)||!unit.canAct||unit.s.flags.disarm)return;const es=legal(battle,unit).filter(e=>(unit.mem.clemntMarks.get(e.id)||0)>battle.time&&(unit.mem.clemntBombTiles.get(Math.round(e.y)*battle.grid.cols+Math.round(e.x))||0)<=battle.time).sort((a,z)=>Math.hypot(a.x-unit.x,a.y-unit.y)-Math.hypot(z.x-unit.x,z.y-unit.y)||a.id-z.id);if(es.length)bombard(battle,unit,skill,es[0]);}};
 }
 return {skills,talents:[{install(b,u){
  const t0=chess.talents.find(t=>t.index===0)?.bb||{},t1=chess.talents.find(t=>t.index===1)?.bb||{};
  b.on('hit',({source,target,dmg})=>{if(source===u&&target?.side==='enemy'&&dmg.type==='phys'&&b.rng()<(target.s.def<target.base.def?t0.prob_special:t0.prob_normal))dmg.amount*=t0.t1_atk_scale;
   if(target===u&&source&&['phys','arts'].includes(dmg.type)){const [dr,dc]=dirVec(u.dir);if((source.x-u.x)*dc+(source.y-u.y)*dr>0)dmg.mul*=1-(source.def?.tags?.includes('seamonster')?t1.damage_resistance_seamonster:t1.damage_resistance_normal);}
  },{owner:u});
  b.on('elementBurst',({source,target,element})=>{if(element!=='erosion'||target.side!=='enemy')return;
   if(live(u)&&u.skill.active&&u.skill.id==='skchr_clemnt_3'&&!target.isFlying)u.mem.clemntMarks.set(target.id,b.time+u.skill.bb.ep_break_duration);
   if(source!==u)return;b._clemntGrowth||=new Map();const n=b._clemntGrowth.get(u.ownerId)||0;if(n>=3)return;b._clemntGrowth.set(u.ownerId,n+1);const factor=chess.isGolden?2:1;for(const [bond,count]of [['egirShip',2*factor],['swiftShip',factor]])gainLayers(b,{playerId:u.ownerId,bonds:[bond],n:count,requireActive:true,source:u,reason:'garrison'});
  },{owner:u});
 }}]};
}
export default {[CLEMNT]:clemnt};
