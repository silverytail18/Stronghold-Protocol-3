import {hypot as productMath_hypot} from '../../detmath.js';
import {physicalArtsShelter} from '../expansion/operator-support.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
/** Attribute changes already live in the selected record. This implements its conditional module traits. */
export function installNativeModule(b,u,c){
 const tb=c.trait?.bb||{},id=c.module?.id||'',key='native:ursus:module';
 if(tb.attack_speed)b.addBuff(u,{key,mods:{aspd:tb.attack_speed},persist:true,allowDead:true});
 if(tb.magic_resist_penetrate_fixed)b.addBuff(u,{key:key+':penetration',mods:{resIgnoreFlat:tb.magic_resist_penetrate_fixed},persist:true,allowDead:true});
 if(tb.taunt_level)b.addBuff(u,{key:key+':taunt',mods:{taunt:tb.taunt_level},persist:true,allowDead:true});
 if(id==='uniequip_002_headbr')b.on('tick',()=>{if(live(u)&&u.blocking.length)b.addBuff(u,{key,mods:{atkPct:tb.atk||0,defPct:tb.def||0},duration:.15});},{owner:u});
 if(id==='uniequip_002_leto'){const t=c.talents.find(t=>t.bb?.cnt)?.bb||{};b.on('tick',()=>{if(live(u)&&b.enemiesInKeys(u.rangeKeys,u,u.profile).length>=(t.cnt||2))b.addBuff(u,{key,mods:{aspd:t.attack_speed||12},duration:.15});},{owner:u});}
 if(id==='uniequip_002_poca'){const t=c.talents.find(t=>t.bb?.atk_scale)?.bb||{};b.on('hit',({source,target,dmg})=>{if(source===u&&target.s.massLevel>=(t.value||3))dmg.amount*=t.atk_scale||1.15;},{owner:u,priority:-10});}
 if(id==='uniequip_003_poca')b.on('hit',({source,target,dmg})=>{if(source===u){const dist=productMath_hypot(target.x-u.x,target.y-u.y);dmg.mul*=1+(tb.damage_scale||.12)*Math.max(0,Math.min(1,(dist-(tb.min_dist||1))/((tb.max_dist||4.5)-(tb.min_dist||1))));}},{owner:u});
 if(id==='uniequip_002_helage'){const t=c.talents.find(t=>t.bb?.damage_resistance)?.bb||{};b.on('tick',()=>{if(live(u)&&u.hpRatio<(t.hp_ratio||.5))physicalArtsShelter(b,u,key,t.damage_resistance||.25,u);},{owner:u});}
 if(id==='uniequip_003_helage'){b.on('deploy',({unit:a,initial})=>{if(a===u&&!initial)u.mem.urNative.revived=false;},{owner:u});b.on('fatal',ctx=>{if(ctx.unit!==u||ctx.prevented||u.mem.urNative.revived)return;u.mem.urNative.revived=true;ctx.prevented=true;u.hp=u.s.maxHp*(tb.hp_ratio||.3);b.fx('undying',{id:u.id,x:u.x,y:u.y});},{owner:u,priority:50});}
 if(id==='uniequip_002_headb2')b.on('beforeAttack',ctx=>{if(ctx.attacker!==u)return;const target=ctx.targets[0];if(target&&b.enemiesInRadius(target.x,target.y,u.profile.splashRadius||1,true).length>=(tb.cnt||3))ctx.ursusProfile={...ctx.profile,atkScale:(ctx.profile.atkScale||1)*(tb.atk_scale_e||1.15)};},{owner:u,priority:100});
}
