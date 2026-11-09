import {hypot as productMath_hypot} from '../../detmath.js';
import {bodyInKeys} from '../../body.js';
import {beginAttack,endAttack} from '../rhodes-mujica/common.js';
import {live,talent,specs,buff,foes,damage,interval,skillGuard} from './common.js';
export const RECONSTRUCT='token_10050_monstr_prosts';
const mine=(b,u)=>b.allyUnits.find(a=>a.defId===RECONSTRUCT&&a.ownerUnit===u&&live(a));
const allies=(b,u)=>b.allyUnits.filter(a=>live(a)&&a.side===u.side&&a.kind!=='device'&&(a===u||!a.s.flags.noHeal&&!a.profile?.noHeal));
function boost(b,u,a){const t=talent(u.def.raw,1),scale=u.skill?.active&&u.skill.id==='skchr_monstr_2'?u.skill.bb.talent_scale:1;for(const x of new Set([u,a]))b.applyStrongest(x,'native:new:monstrAS',{value:(t.attack_speed||0)*scale,duration:t.buff_duration||10,source:u,mods:v=>({aspd:v})});}
export function monChain(b,u,main,{scale=1,extra=0,secondary=false}={}){
 if(!live(main))return 0;const token=mine(b,u),visited=new Set(),healed=[],chain=[];let current=main,prev=u,remaining=3+extra,amount=u.s.atk*scale,total=0,freeAfter=0,tokenExtra=false;
 const t=talent(u.def.raw,0),falloff=u.profile.heal?.falloff??.25;
 while(current&&remaining>0&&visited.size<8){visited.add(current.id);chain.push(current.id);remaining--;const n=b.heal(u,current,amount,{nativeAction:true,nativeMonstr:true,secondary,ignoreNoHeal:current===token});if(n>0){total+=n;healed.push(current.id);}boost(b,u,current);b._ev(['atk',prev.id,current.id,'nativeMonstrChain']);
  const fromToken=current===token;if(fromToken&&!tokenExtra){remaining++;tokenExtra=true;freeAfter=t['attack@chain.extra_cnt']||0;}else if(freeAfter>0)freeAfter--;else amount*=1-falloff;
  prev=current;current=[...allies(b,u),...(token?[token]:[])].filter(a=>!visited.has(a.id)&&productMath_hypot(a.x-prev.x,a.y-prev.y)<=1.7).sort((a,z)=>a.hpRatio-z.hpRatio||z.deploySeq-a.deploySeq)[0];
 }
 b.emit('healChainResolved',{source:u,healed,chain,actual:total,nativeMonstr:true,secondary});
 if(!secondary&&main===token&&u.skill.active&&u.skill.id==='skchr_monstr_2')monChain(b,u,token,{secondary:true});
 return total;
}
function reserve(b,u){b._movementHomes??=new Map();u.mem.newMonHome=[u.tileR,u.tileC];b._movementHomes.set(u.tileR*b.grid.cols+u.tileC,u);}
function returnHome(b,u){const home=u.mem.newMonHome;if(!home)return;const key=home[0]*b.grid.cols+home[1];if(b._movementHomes?.get(key)===u)b._movementHomes.delete(key);if(live(u)&&!b.relocate(u,...home))b.retreat(u,{reason:'new:monReturnBlocked'});u.mem.newMonHome=null;}
function autoToken(b,u){if(mine(b,u)||u.skill?.active&&u.skill.id==='skchr_monstr_3'||b.time<(u.mem.newMonReady||0))return;
 const existing=b.allyUnits.find(a=>a.ownerUnit===u&&a.defId===RECONSTRUCT&&a.uid!=null);if(existing){if(!existing.alive&&!existing.removed&&b.time-existing.deathAt>=15)b.redeploy(existing,{free:false,tile:[existing.tileR,existing.tileC]});return;}
 const cells=u.rangeKeys.map(k=>[Math.floor(k/b.grid.cols),k%b.grid.cols]).filter(([r,c])=>b.grid.inRect(r,c)&&b.grid.isLow(r,c)&&b.grid.groundPassable(r,c)&&!b._occ[r*b.grid.cols+c]?.alive&&!b.downOn(r,c)&&!b._movementHomes?.has(r*b.grid.cols+c));
 cells.sort((a,z)=>{const near=([r,c])=>b.enemies.filter(live).reduce((n,e)=>Math.min(n,productMath_hypot(e.x-c,e.y-r)),100);return near(a)-near(z)||a[0]-z[0]||a[1]-z[1];});
 const p=b.getPlayer(u.ownerId);if(!cells.length||p.dp<3)return;const token=b.spawnToken(u,RECONSTRUCT,...cells[0],{anySource:true});if(token){b.addDp(u.ownerId,-3);u.mem.newMonReady=b.time+15;}
}
export function monstr(bb,c){return{skills:specs(c,(s,p)=>{
 if(s.index===0)return{kind:'instant',heal:true,attack:{dmgType:'heal',atkScale:p.heal_scale}};
 if(s.index===1)return{kind:'duration',heal:true,trigger:'NEVER'};
 return{kind:'duration',heal:false,trigger:'NEVER',targeting:{rangeGrid:s.rangeGrid},mods:{atkPct:p.atk,hpFlat:p.max_hp,blockCnt:p.block_cnt,batPct:p.base_attack_time/c.stats.bat},onStart({battle:b,unit:u}){const token=mine(b,u);if(!token)return;reserve(b,u);const at=[token.tileR,token.tileC];b.retreat(token,{reason:'new:monMerge',permanent:true});u.mem.newMonMerged=token;u.profile.heal=null;u.profile.dmgType='true';u.profile.attackKind='melee';b.relocate(u,...at);},onEnd({battle:b,unit:u}){const ratio=Math.max(1,u.hp)/u.s.maxHp,fatal=u.mem.newMonFatal;u.mem.newMonFatal=false;u.profile.heal=structuredClone(u.mem.newMonHeal);u.profile.dmgType='heal';u.profile.attackKind='ranged';returnHome(b,u);u.mem.newMonReady=b.time+15;b.after(0,()=>{if(live(u))u.hp=fatal?1:Math.max(1,Math.min(u.s.maxHp,ratio*u.s.maxHp));});}};
 }),install(b,u){u.profile.noAttack=true;u.mem.newMonHeal=structuredClone(u.profile.heal);let next=0,drain=0;
  b.on('heal',ctx=>{const token=ctx.target;if(token?.defId===RECONSTRUCT&&token.ownerUnit===u&&ctx.source!==u&&ctx.source!==token)ctx.amount=0;},{owner:u,priority:1000});
  b.on('death',({unit,reason})=>{if(unit===u){returnHome(b,u);for(const a of b.allyUnits)if(a.ownerUnit===u&&live(a))b.retreat(a,{reason:'new:monOwnerGone',permanent:true});}else if(unit.ownerUnit===u&&unit.defId===RECONSTRUCT){
   // A placed token retains its board identity and owned drain timer while awaiting its native redeploy.
   // This runs before Battle queues removed units for hook disposal; automatic temporary tokens remain disposable.
   if(unit.uid!=null){unit.removed=false;unit.respawnAt=Infinity;}
   if(reason!=='new:monMerge')u.mem.newMonReady=b.time+15;
  }},{owner:u});
  b.on('fatal',ctx=>{if(ctx.unit===u&&u.skill?.active&&u.skill.id==='skchr_monstr_3'&&!ctx.prevented){ctx.prevented=true;u.mem.newMonFatal=true;u.hp=1;u.skill.end('new:monFatal');buff(b,u,'monReturnProtection',{}, {duration:1,flags:{undying:true},source:u});}},{owner:u,priority:100});
  skillGuard(u,()=>u.skill.id==='skchr_monstr_1'||!!mine(b,u));
  b.every(.05,()=>{if(!live(u))return;autoToken(b,u);const sk=u.skill,token=mine(b,u),melting=sk.active&&sk.id==='skchr_monstr_3';
   if(token){for(const a of b.allyUnits)if(live(a)&&a.side===u.side&&productMath_hypot(a.x-token.x,a.y-token.y)<=1.5)b.applyStrongest(a,'native:new:monstrATK',{value:talent(c,0).atk||0,duration:.15,source:u,mods:v=>({atkPct:v})});}
   if(melting){drain+=.05;while(drain>=1){drain--;b.loseHp(u,sk.bb.damage_per_second,{source:u,tags:['native:new:monDrain']});}if(!live(u)||!sk.active)return;}
   else if(sk.ready&&!sk.opCooling&&!u.s.flags.silence){if(sk.id==='skchr_monstr_2'&&token)sk.activate('new:overload');if(sk.id==='skchr_monstr_3'&&token&&b.enemies.some(e=>live(e)&&productMath_hypot(e.x-token.x,e.y-token.y)<2.5))sk.activate('new:meltdown');}
   if(!u.canAct||u.s.flags.disarm||b.time+1e-9<next)return;
   if(sk.active&&sk.id==='skchr_monstr_3'){const targets=b.blockedTargets(u,{canHitFly:false});if(!targets.length)return;const actual=beginAttack(b,u,targets,true);if(!actual?.length)return;next=b.time+interval(u);for(const e of actual){damage(b,u,e,u.s.atk,'true','native:new:monAttack',{isAttack:true,attackId:u.mem.rmAttackId});b._ev(['atk',u.id,e.id,'melee']);}b.heal(u,u,u.s.atk*sk.bb['attack@heal_scale'],{nativeSelfHeal:true,nativeMonstr:true});boost(b,u,u);endAttack(b,u,actual,true);
   }else{const choices=[...allies(b,u),...(token?[token]:[])].filter(a=>bodyInKeys(a,u.rangeKeySet||new Set(u.rangeKeys))&&a.hp<a.s.maxHp).sort((a,z)=>a.hpRatio-z.hpRatio||z.deploySeq-a.deploySeq),main=sk.active&&sk.id==='skchr_monstr_2'&&token?token:choices[0];if(!main)return;sk.onAboutToAttack();const active=sk.active,actual=beginAttack(b,u,[main],active);if(!actual?.length)return;next=b.time+interval(u);const s1=sk.active&&sk.id==='skchr_monstr_1';monChain(b,u,main,{scale:s1?sk.bb.heal_scale:1,extra:s1?1:0});endAttack(b,u,[main],active);}
  },{owner:u});
 }};}
export function reconstruct(){return{install(b,u){u.profile.noAttack=true;u.profile.noHeal=true;b.every(1,()=>{if(live(u))b.loseHp(u,80,{source:u,tags:['native:new:reconstructDrain']});},{owner:u});}};}
