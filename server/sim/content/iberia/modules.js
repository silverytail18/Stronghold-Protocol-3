import {frontOf} from '../../dir.js';
import {canTargetEnemy} from '../../targeting.js';
import {bodyInKeys} from '../../body.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
export function installNativeModule(b,u,c){
 const id=c.module?.id;if(!id)return;const tb=c.trait?.bb||{},hidden=Object.assign({},...(c.talents||[]).filter(t=>t.hidden&&t.fromModule).map(t=>t.bb));
 if(tb.def_penetrate_fixed)b.addBuff(u,{key:'native:ib:module:pen',mods:{defIgnoreFlat:tb.def_penetrate_fixed},persist:true,allowDead:true});
 if(id==='uniequip_002_whispr'){b.addBuff(u,{key:'native:ib:module:taunt',mods:{taunt:tb.taunt_level||-1},persist:true,allowDead:true});b.on('deploy',({unit:a})=>{if(a===u)b.applyStatus(u,'resist',{duration:Infinity,source:u});},{owner:u});}
 b.on('tick',()=>{if(!live(u))return;const enemies=b.enemies.filter(e=>live(e)&&bodyInKeys(e,u.rangeKeys)&&canTargetEnemy(u,e,{canHitFly:true}));let aspd=0,sp=0;
  if(id==='uniequip_002_elysm'&&u.skill?.active){const[r,c]=frontOf(u.tileR,u.tileC,u.dir),a=b.allyUnits.find(a=>live(a)&&a.kind==='op'&&a.tileR===r&&a.tileC===c);if(a)b.addBuff(a,{key:'native:ib:module:bearerfront',mods:{blockCnt:tb.block_cnt||1},duration:.15});}
  if(id==='uniequip_002_bluep'&&enemies.some(e=>!e.isFlying))aspd=hidden.attack_speed||8;
  if(id==='uniequip_002_glacus'&&enemies.length)sp=hidden.sp_recovery_per_sec||.2;
  if(id==='uniequip_002_toledo'&&enemies.some(e=>e.isBoss||e.def?.rank==='ELITE'||e.def?.rank==='BOSS'))sp=hidden.sp_recovery_per_sec||.25;
  if(id==='uniequip_002_hbound'&&u.mem.ibZones?.length)sp=hidden.sp_recovery_per_sec||.1;
  b.addBuff(u,{key:'native:ib:module:conditional',mods:{aspd,spRecoveryFlat:sp},duration:.15});
 },{owner:u});
 b.on('hit',({source,target,dmg})=>{if(source!==u)return;if(id==='uniequip_003_irene'&&dmg.isSkill&&!dmg.tags.includes('dot'))dmg.mul*=tb.damage_scale||1.1;},{owner:u});
 b.on('hitResolved',({source,target,dmg})=>{if(source!==u||!live(target)||dmg.tags?.includes('native:ib:module'))return;
  if(id==='uniequip_002_thorns'&&dmg.isAttack)b.dealDamage(u,target,{amount:u.s.atk*(tb.atk_scale_m||.1),type:'arts',isAttack:true,isSkill:dmg.isSkill,attackId:dmg.attackId,tags:['native:ib:module']});
 },{owner:u});
 b.on('damageResolved',({source,target,dmg,dealt})=>{if(source!==u||!(dealt>0)||!live(target)||dmg.type==='element'||dmg.type==='elemental'||dmg.tags?.some(t=>/^(item|bond|ib:)/.test(t)))return;if(id==='uniequip_003_thorns')b.dealDamage(u,target,{amount:dealt*(tb.ep_damage_ratio||.1),type:'element',element:'neural',tags:['native:ib:module']});},{owner:u});
 let refund=false;b.on('kill',({killer,victim})=>{if(killer===u&&victim?.isFlying&&u.skill?.active&&id==='uniequip_003_irene')refund=true;},{owner:u});
 b.on('skillEnd',({unit:a})=>{if(a===u&&refund){refund=false;const amount=Object.assign({},...(c.talents||[]).map(t=>t.bb)).sp||6;b.after(.001,()=>{if(live(u))u.skill?.gainSp(amount,'native:module');},{owner:u});}},{owner:u});
 // IS-only module bonuses deliberately retain their original environment restriction.
}
