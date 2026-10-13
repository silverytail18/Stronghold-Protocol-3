// Two independent cooldowns are shared by all members of one player's add-on covenant.
import {RESEARCH,RESEARCH_ATTACK_RATIO,RESEARCH_HEAL_RATIO,RESEARCH_RADIUS,researchCooldowns} from '../../../../shared/rhine-balance.js';
import {nativePacket} from '../../../../shared/rhine.js';
import {unitBonds} from '../support/index.js';
import {canTargetEnemy} from '../../targeting.js';
const member=u=>u?.side==='ally'&&u.kind==='op'&&unitBonds(u).includes(RESEARCH);
const owner=u=>member(u)?u:u?.kind==='token'&&member(u.ownerUnit)?u.ownerUnit:null;
export function install(b){
 const states=new Map();
 for(const p of b.players){const bond=p.bonds?.[RESEARCH];if(bond?.active&&!p.input?.contentInfo?.rhine?.preview)states.set(p.playerId,{count:bond.count,nextAttack:0,nextHeal:0,credit:{side:'ally',ownerId:p.playerId,id:'specialResearch:'+p.playerId,stats:{dmg:0,kills:0,heal:0,taken:0,attacks:0}}});}
 if(!states.size||b.flags?.preview)return;
 const explode=(s,x,y,amount,heal)=>{
  const hits=b.enemiesInRadius(x,y,RESEARCH_RADIUS,true).filter(e=>canTargetEnemy(null,e,{canHitFly:true}));
  if(!hits.length)return false;
  b.fx(heal?'specialResearchHeal':'specialResearchAttack',{x,y,r:RESEARCH_RADIUS});
  // Set the cooldown before damage hooks run; secondary packets can never retrigger either path.
  const cds=researchCooldowns(s.count);if(heal)s.nextHeal=b.time+cds.heal;else s.nextAttack=b.time+cds.attack;
  for(const e of hits){b.dealDamage(s.credit,e,{amount,type:'arts',canDodge:false,sourceless:true,noSp:true,tags:['bond','specialResearch:explosion']});
   if(e.alive){if(heal)b.applyStatus(e,'stun',{duration:.5});else b.addBuff(e,{key:'specialResearch:slow',duration:1,mods:{moveMul:.5}});}
  }
  return true;
 };
 b.on('damageResolved',({source,target,dmg,dealt})=>{
  const op=owner(source);if(!op||target?.side!=='enemy'||!(dealt>0)||!nativePacket(dmg))return;
  const s=states.get(op.ownerId);if(!s||b.time+1e-8<s.nextAttack)return;
  explode(s,target.x,target.y,dealt*RESEARCH_ATTACK_RATIO,false);
 });
 b.on('healResolved',({source,target,actual,opts})=>{
  const op=owner(source);if(!op||target?.side!=='ally'||target.kind!=='op'||!(actual>0)||opts?.rhine)return;
  const s=states.get(op.ownerId);if(!s||b.time+1e-8<s.nextHeal)return;
  explode(s,target.x,target.y,actual*RESEARCH_HEAL_RATIO,true);
 });
 b.specialResearch={states};
}
