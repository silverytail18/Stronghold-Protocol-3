import {absoluteRangeKeys,canTargetEnemy} from '../../targeting.js';
import {effectiveProfile} from '../../ai.js';
export const live=u=>!!u?.alive&&u.deployed&&!u.removed&&!u.hidden;
export const family=u=>u.def?.baseId??u.defId;
export const girls=(b,pid)=>b.allyUnits.filter(u=>u.kind==='op'&&u.ownerId===pid&&u.def?.bonds?.includes('girlbandShip'));
export const allies=(b,u,g=u.liveRangeGrid||u.rangeGrid)=>b.unitsInGrid(u,g,{side:'ally'}).filter(a=>live(a)&&a.kind!=='device');
export const enemies=(b,u,g=u.liveRangeGrid||u.rangeGrid,fly=u.profile.canHitFly)=>b.enemiesInKeys(absoluteRangeKeys(g,u.tileR,u.tileC,u.dir),u,{canHitFly:fly});
export const talent=(d,index)=>(d.raw?.talents||d.talents).filter(t=>t.index===index||t.talentIndex===index).at(-1)?.bb||{};
export const rand=(b,a)=>a.length?a[Math.floor(b.rng()*a.length)]:null;
export const hurt=(b,u,g)=>allies(b,u,g).filter(a=>a.hp<a.s.maxHp&&!a.s.flags.noHeal).sort((a,z)=>a.hpRatio-z.hpRatio||a.id-z.id);
export function direct(b,u,t,scale,type='phys',tags=[]){if(live(t))return b.dealDamage(u,t,{amount:u.s.atk*u.s.atkScaleMul*scale,type,isAttack:true,isSkill:!!u.skill?.active,tags:['rm:own',...tags],attackId:u.mem.rmAttackId||0});return 0;}
export function beginAttack(b,u,targets,isSkill){
 const ctx={attacker:u,targets,isSkill,profile:effectiveProfile(u)};b.emit('beforeAttack',ctx);
 if(!live(u)||(targets.length&&!ctx.targets?.length))return null;
 u.lastAttackAt=b.time;u.stats.attacks++;u.mem.rmAttackId=++b._attackSeq;
 return ctx.targets||[];
}
export function endAttack(b,u,targets,isSkill){b.emit('attack',{attacker:u,targets,isSkill});u.skill?.onAttackPerformed(targets,isSkill);}
export function stat(b,u,key,mods){b.addBuff(u,{key,mods,persist:true,allowDead:true});}
export function noteFx(b,u,t,type){b.fx('rm-note',{src:u.id,target:t?.id,x:u.x,y:u.y,type});}
export function legal(b,u,fly=true){return b.enemies.filter(e=>live(e)&&canTargetEnemy(u,e,{canHitFly:fly}));}
