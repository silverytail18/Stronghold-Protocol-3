// char_4247_oxi: original level4/7 blackboards plus the approved personal terminal; no module or layer growth.
import {canTargetEnemy} from '../../targeting.js';
import {hypot} from '../../detmath.js';
import {bodyInKeys} from '../../body.js';
import {fireRainSkill,fireRainController} from './talulah-s3.js';
import {physicalArtsShelter} from '../expansion/operator-support.js';
import {talulahTrait,nativeTalulahDamage} from './talulah-trait.js';
const live=u=>!!u?.alive&&u.deployed&&!u.removed;
const valid=(u,e,fly=true,ignoreStealth=false)=>live(e)&&e.side==='enemy'&&canTargetEnemy(u,e,{canHitFly:fly,ignoreStealth});
const talent=(c,i)=>c.talents?.filter(t=>t.index===i).at(-1)?.bb||{};
const packet=(b,u,e,amount,type='arts',tag='skill',ignoreStealth=false)=>valid(u,e,true,ignoreStealth)?b.dealDamage(u,e,{amount,type,isSkill:true,canDodge:false,tags:['native:ursus','oxi:'+tag,...(tag==='footprint'?['dot']:[])]}):0;
const buff=(b,u,key,mods,extra={})=>b.addBuff(u,{key:'native:oxi:'+key,mods,...extra});
function retaliate(b,u,p,center){
 const origin=center&&Number.isFinite(center.x)&&Number.isFinite(center.y)?center:u;
 const duration=p.skill_duration||1.3;
 u.mem.oxiShelterUntil=b.time+duration;
 b.emit('oxiSkillCast',{unit:u,target:center||null,index:1,duration,time:b.time});
 b.fx('oxiGuard',{x:u.x,y:u.y,id:u.id,dur:duration});
 b.fx('oxiCounter',{x:origin.x,y:origin.y,id:u.id,target:center?.id??null});
 let dealt=0;
 for(const e of b.enemiesInRadius(origin.x,origin.y,p.ability_range_radius??1,true))if(valid(u,e,true,true))dealt+=packet(b,u,e,u.s.atk*(p.retaliate_atk_scale||1.7),'arts','counter',true);
 if(dealt>0)b.heal(u,u,dealt*(p.heal_ratio??.05),{nativeSelfHeal:true,self:true});
 const stacks=u.mem.oxiStacks;
 stacks.push(b.time+(p.stack_duration||5));
 while(stacks.length>(p.max_stack_cnt||5))stacks.shift();
 buff(b,u,'counter',{atkPct:(p.atk||0)*stacks.length,defPct:(p.def||0)*stacks.length},{duration:p.stack_duration||5});
}
export function talulah(bb,c){return {skills:Object.fromEntries(c.skills.map(s=>{const p=s.bb;
 if(s.index===0)return[s.skillId,{kind:'instant',trigger:'DEFAULT',allowSharedRange:false,onStart({battle:b,unit:u}){
  const e=b.enemiesInKeys(u.rangeKeys,u,{canHitFly:false})[0];if(!e)return;
  b.emit('oxiSkillCast',{unit:u,target:e,index:0,time:b.time});
  const keys=[Math.round(e.y)*21+Math.round(e.x)];for(const a of b.enemies)if(valid(u,a,false)&&bodyInKeys(a,keys)){packet(b,u,a,u.s.atk*p.atk_scale);if(live(a))b.applyStatus(a,'fear',{duration:p.fear,source:u});}
 }}];
 if(s.index===1)return[s.skillId,{kind:'instant',trigger:'NEVER',charges:s.maxChargeTime,allowSharedRange:false,onStart({battle:b,unit:u}){
  const e=u.mem.oxiAttacker;u.mem.oxiS2Infinite=!!talulahTrait(u,b);retaliate(b,u,p,e);
 }}];
 return[s.skillId,fireRainSkill(s,p)];
 })),install(b,u){
 const t=talent(c,0),f=talent(c,1);let arcane=0,lastAttack=b.time,nextArcane=b.time+(t.arcane_idle_delay||3),footTick=0;
 fireRainController(b);
 u.mem.oxiStacks=[];u.mem.oxiWaves=[];u.mem.oxiFields=new Map();u.mem.oxiTracks=new Map();u.mem.oxiS2Infinite=false;
 const observeArcane=()=>b.emit('oxiArcaneState',{unit:u,value:arcane,max:t.arcane_max||0,step:t.arcane_step||0});
 observeArcane();
 b.on('hit',({source,target,dmg})=>{if(source!==u||target.side!=='enemy')return;
  if((dmg.type==='arts'||dmg.type==='elemental')&&!dmg.tags?.includes('burst'))dmg.mul*=1+arcane;
  const trait=talulahTrait(u,b);if(trait&&nativeTalulahDamage(dmg))dmg.mul*=1+trait.damage;
 },{owner:u});
 b.on('attack',({attacker})=>{if(attacker!==u)return;lastAttack=b.time;nextArcane=b.time+(t.arcane_idle_delay||3);arcane=Math.max(0,arcane-(t.arcane_step||0));observeArcane();},{owner:u});
 b.on('damageResolved',({source,target,dmg,dealt})=>{
  if(source===u&&dealt>0&&live(target)&&target.side==='enemy'&&dmg?.type==='arts'&&!dmg.tags?.some(x=>x==='bond'||x==='item'||x==='burst')){
   const trait=talulahTrait(u,b),ratio=trait&&nativeTalulahDamage(dmg)?trait.burn:t.ep_damage_ratio||0;
   b.dealDamage(u,target,{amount:dealt*ratio,type:'element',element:'burn',tags:['native:ursus','oxi:talent']});
  }
 },{owner:u});
 const nearestEnemy=()=>{let best=null,bestDistance=Infinity;for(const e of b.enemies){if(!valid(u,e,true,true))continue;const d=hypot(e.x-u.x,e.y-u.y);if(d<bestDistance){best=e;bestDistance=d;}}return best;};
 const receive=(source,credit,sourceLessHpLoss=false)=>{
  if(!live(u)||u.skill?.id!=='skchr_oxi_2')return;
  const center=source?.side==='enemy'?source:sourceLessHpLoss?nearestEnemy():credit?.side==='enemy'?credit:nearestEnemy();
  if(talulahTrait(u,b)&&u.mem.oxiS2Infinite){retaliate(b,u,u.skill.bb||{},center);return;}
  if(!u.skill.ready)return;
  u.mem.oxiAttacker=center;u.skill.activate('oxi:counter');
 };
 b.on('hitResolved',({source,credit,target})=>{if(target===u)receive(source,credit);},{owner:u});
 b.on('beforeHpLoss',ctx=>{if(ctx.target===u&&ctx.kind==='hpLoss'&&ctx.amount>0)receive(ctx.source,ctx.credit,ctx.source==null);},{owner:u});
 b.on('elementBurst',({target,element})=>{if(live(u)&&f.max_count&&element==='burn'&&target.side==='enemy')u.mem.oxiTracks.set(target.id,{target,until:b.time+5});},{owner:u});
 b.on('beforeAttack',ctx=>{if(ctx.attacker===u&&u.mem.oxiStacks.length&&u.skill?.id==='skchr_oxi_2')ctx.ursusProfile={...ctx.profile,maxTargets:Math.max(1,u.blocking.length),targetFilter:e=>u.blocking.includes(e)};},{owner:u,priority:100});
 b.on('tick',({dt})=>{
  if(!live(u)){u.mem.oxiFields.clear();u.mem.oxiTracks.clear();u.mem.oxiStacks.length=0;u.mem.oxiS2Infinite=false;return;}
  if(b.time-lastAttack>=(t.arcane_idle_delay||3)&&b.time+1e-9>=nextArcane){const n=1+Math.floor((b.time-nextArcane)/(t.arcane_step_interval||.5));arcane=Math.min(t.arcane_max||0,arcane+n*(t.arcane_step||0));nextArcane+=n*(t.arcane_step_interval||.5);observeArcane();}
  const p=u.skill?.bb||{},stacks=u.mem.oxiStacks,old=stacks.length;u.mem.oxiStacks=stacks.filter(v=>v>b.time);
  if(old!==u.mem.oxiStacks.length){b.removeBuff(u,'native:oxi:counter');if(u.mem.oxiStacks.length)buff(b,u,'counter',{atkPct:p.atk*u.mem.oxiStacks.length,defPct:p.def*u.mem.oxiStacks.length},{duration:Math.max(...u.mem.oxiStacks)-b.time});}
  if(u.mem.oxiShelterUntil>b.time){const elapsed=p.skill_duration-(u.mem.oxiShelterUntil-b.time),v=p.damage_resistance*Math.max(0,1-Math.max(0,elapsed-p.shelter_hold_duration)/(p.skill_duration-p.shelter_hold_duration));physicalArtsShelter(b,u,'native:oxi:shelter',v,u,.05);}
  for(const [id,tr]of u.mem.oxiTracks){if(!live(tr.target)||tr.until<=b.time){u.mem.oxiTracks.delete(id);continue;}const r=Math.round(tr.target.y),col=Math.round(tr.target.x),key=r*21+col;
   if(!tr.target.isFlying&&b.grid.groundPassable(r,col)&&!u.mem.oxiFields.has(key)){if(u.mem.oxiFields.size>=f.max_count)u.mem.oxiFields.delete(u.mem.oxiFields.keys().next().value);u.mem.oxiFields.set(key,{until:b.time+f.field_duration,r,col});}}
  footTick+=dt;const ticks=Math.floor((footTick+1e-9)/(f.field_interval||.3));if(ticks)footTick-=ticks*(f.field_interval||.3);
  for(const [key,field]of u.mem.oxiFields){if(field.until<=b.time){u.mem.oxiFields.delete(key);continue;}if(ticks)for(const e of b.enemies)if(valid(u,e,false)&&bodyInKeys(e,[key]))packet(b,u,e,u.s.atk*f.field_atk_scale*ticks,'arts','footprint');}
 },{owner:u});
 }};}
