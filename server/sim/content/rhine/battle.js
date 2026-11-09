// Battle effects use the immutable prep roster snapshot; never count living operators.
import {RHINE,RHINE_CONTROLLER,baseBonus,growthRegion,nativePacket,adjacent} from '../../../../shared/rhine.js';
import {ITEMS} from './data.js';
import {unitBonds} from '../support/index.js';
import {canTargetEnemy,tileKeyOf} from '../../targeting.js';
import {bodyInKeys} from '../../body.js';
import {calibration,adaptation,PULSE,pulseDamage,MARK,SCAN,BROADCAST,REPAIR,PARALLEL,EMERGENCY,structureDefIgnore,structureResIgnore,JOINT_DAMAGE} from '../../../../shared/rhine-balance.js';
import {install as installSpecialResearch} from './research.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const member=u=>u?.kind==='op'&&unitBonds(u).includes(RHINE);
export function install(b){
 installSpecialResearch(b);
 const states=new Map();
 for(const p of b.players){const input=p.input?.contentInfo?.rhine;if(!input)continue;
  const keys=id=>(input.positions?.[id]||[]).map(pos=>{const [r,c]=b.mapTile(p,...pos);return r*21+c;});
  const credit={side:'ally',ownerId:p.playerId,id:'rhine:'+p.playerId,stats:{dmg:0,kills:0,heal:0,taken:0,attacks:0}};
  states.set(p.playerId,{...input,keys,credit,scanUntil:0,nextScan:SCAN.first,nextPulse:PULSE.first,marks:new Map(),controllerUsed:new Set(input.controllerUsed||[]),emergency:new Set(),opening:new Set(),casts:new Set(),parallelUsed:false,immunity:new Map(),broadcast:new Map(),research:{},growth:0,regionEarned:false});
 }
 if(!states.size)return;
 const st=u=>states.get(u?.ownerId),active=(s,id)=>!s?.preview&&s?.active.includes(id),units=s=>b.allyUnits.filter(u=>u.ownerId===s.credit.ownerId&&member(u)&&live(u));
 const inRegion=(s,u,id)=>s.keys(id).includes(tileKeyOf(u));
 // The research seat inherits local damage/protection only; it is not another T01/T02 selected cell.
 const inEnhancedRegion=(s,u,id)=>inRegion(s,u,id)||(active(s,'T13')&&inRegion(s,u,'T13'));
 const enemies=()=>b.enemies.filter(e=>e.alive&&e.deployed&&!e.hidden);
 const legal=e=>canTargetEnemy(null,e,{canHitFly:true});
 const marked=(s,e)=>active(s,'T04')&&(s.scanUntil>b.time||(s.marks.get(e.id)||0)>b.time||bodyInKeys(e,s.keys('T04')));
 const layer=s=>b.getPlayer(s.credit.ownerId)?.bonds?.[RHINE]?.layers||s.layers;
 const joint=s=>active(s,'T10')&&(s.positions.T01||[]).some(p=>(s.positions.T04||[]).some(q=>adjacent(p,q)));
 const syncBase=()=>{for(const u of b.allyUnits){const s=st(u);if(!s||s.count<3||!member(u))continue;const L=b.getPlayer(u.ownerId)?.bonds?.[RHINE]?.layers||s.layers;
  b.addBuff(u,{key:'rhine:stats',mods:{atkPct:baseBonus(L),hpPct:baseBonus(L)},persist:true,allowDead:true});
 }};
 const shield=(u,amount,duration=Infinity)=>{const old=u.findBuff('rhine:environment');if(old?.shield>=amount)return;const left=Math.max(duration,old?.timeLeft||0);b.addBuff(u,{key:'rhine:environment',shield:Math.max(amount,old?.shield||0),duration:left});};
 const grow=(s,n,reason)=>{if(!s.preview&&s.count>=3&&b.kind==='normal'&&n>0)return b.addLayers(s.credit.ownerId,RHINE,n,reason,{source:'rhine:'+reason});return 0;};
 const regionEvent=(s,source,target)=>{
  if(!s||s.regionEarned||s.preview||s.count<3)return;
  const usable=['T01','T02','T03','T04','T06'].filter(id=>active(s,id));
  if(usable.some(id=>inRegion(s,source,id)||target?.side==='enemy'&&bodyInKeys(target,s.keys(id))||target?.side==='ally'&&inRegion(s,target,id))){s.regionEarned=true;grow(s,growthRegion(s.count),'region');}
 };
 const hitTech=(s,e,n,type)=>b.dealDamage(s.credit,e,{amount:n,type,canDodge:false,sourceless:true,noSp:true,tags:['bond','rhine:technology']});
 const refreshRegions=()=>{
  for(const s of states.values()){
   if(s.preview)continue;
   if(active(s,'T12')&&s.keys('T04').length&&b.time+1e-8>=s.nextScan){s.nextScan+=SCAN.interval;s.scanUntil=b.time+SCAN.duration;}
   for(const e of enemies()){
    const inside=active(s,'T04')&&bodyInKeys(e,s.keys('T04'));
    const k='rhine:mark:'+s.credit.ownerId;
    if(inside)s.marks.set(e.id,b.time+MARK.linger);
    if(marked(s,e))b.addBuff(e,{key:k,duration:.15,flags:{reveal:true}});
    else b.removeBuff(e,k);
   }
   // Remove the prior gift from the donor calculation, so repeated ticks cannot amplify it.
   const own=units(s);for(const u of own)b.removeBuff(u,'rhine:broadcast');
   const donors=active(s,'T03')?own.filter(u=>inRegion(s,u,'T03')):[];
   const values=donors.map(u=>({u,value:Math.max(0,u.s.atk)*BROADCAST.ratio})).sort((a,c)=>c.value-a.value||a.u.id-c.u.id),donor=values[0];
   for(const u of b.allyUnits.filter(u=>u.ownerId===s.credit.ownerId&&member(u))){const n=donor&&live(u)&&donor.u!==u?donor.value:0;
    const raw=u.base.atk+u.buffs.reduce((n,v)=>n+(v.mods?.atkFlat||0),0),factor=raw>0?u.s.atk/raw:1;
    if(n>0)b.addBuff(u,{key:'rhine:broadcast',mods:{atkFlat:n/Math.max(.001,factor)},duration:.15});else b.removeBuff(u,'rhine:broadcast');s.broadcast.set(u.id,n);
    if(donor&&live(u))b.addBuff(u,{key:'rhine:broadcastSpeed',mods:{aspd:BROADCAST.aspd},duration:.15});else b.removeBuff(u,'rhine:broadcastSpeed');
   }
  }
  // Marks retain per-player ownership; same-named movement reduction never multiplies across a boss pair.
  for(const e of enemies()){
   const slowed=[...states.values()].some(s=>active(s,'T04')&&bodyInKeys(e,s.keys('T04')));
   if(slowed)b.addBuff(e,{key:'rhine:regionSlow',duration:.15,mods:{moveMul:1-MARK.slow}});else b.removeBuff(e,'rhine:regionSlow');
  }
 };
 syncBase();b.on('battleStart',()=>{syncBase();refreshRegions();});b.on('layerGain',()=>b.after(0,syncBase),{priority:-110});
 b.on('deploy',({unit:u,initial})=>{const s=st(u);if(!s||s.count<3||!member(u)||s.opening.has(u.uid))return;s.opening.add(u.uid);if(initial&&u.carry)return;u.skill?.gainSp(s.count>=10?10:s.count>=9?9:s.count>=6?6:3,'rhine:opening');});
 b.on('hit',({source:u,target:e,dmg})=>{
  const s=st(u);if(!s||!live(u)||!member(u)||e.side!=='enemy'||!nativePacket(dmg))return;
  let bonus=active(s,'T01')?calibration(layer(s),s.count,inEnhancedRegion(s,u,'T01')):0;
  if(joint(s)&&['phys','arts'].includes(dmg.type)&&marked(s,e))bonus+=JOINT_DAMAGE;
  dmg.mul*=1+bonus;
  if(active(s,'T16')&&marked(s,e)){
   if(dmg.type==='phys'&&e.s.def>0)dmg.defIgnorePct+=structureDefIgnore(e.s.def)/e.s.def;
   if(dmg.type==='arts')dmg.resIgnoreFlat+=structureResIgnore(e.s.res);
  }
 },{priority:-8500});
 b.on('damageMitigated',ctx=>{const u=ctx.target,s=st(u);if(!s||!member(u)||ctx.source?.side!=='enemy'||!(ctx.amount>0))return;
  if(active(s,'T02')&&['phys','arts','true','elemental'].includes(ctx.dmg.type)&&!ctx.dmg.tags?.includes('hpLoss'))ctx.amount*=1-adaptation(layer(s),s.count,inEnhancedRegion(s,u,'T02'));
  const gear=(u.items||[]).map(id=>ITEMS[id]).filter(r=>r?.baseId===RHINE_CONTROLLER+'_a').sort((a,c)=>Number(c.isGolden)-Number(a.isGolden))[0];
  if(!s.preview&&gear&&ctx.dmg.isAttack&&!s.controllerUsed.has(u.uid)){s.controllerUsed.add(u.uid);shield(u,u.s.maxHp*gear.params.shieldRatio);}
 },{priority:-8500});
 const rescue=u=>{const s=st(u);s.emergency.add(u.uid);b.addBuff(u,{key:'rhine:emergencyInvulnerable',flags:{invulnerable:true},duration:EMERGENCY.invulnerableDuration});b.removeStatus(u,'stun');b.removeStatus(u,'freeze');s.immunity.set(u.uid,b.time+EMERGENCY.immuneDuration);b.heal(null,u,u.s.maxHp*EMERGENCY.heal,{rhine:true});shield(u,u.s.maxHp*EMERGENCY.shield,EMERGENCY.shieldDuration);};
 b.on('fatal',ctx=>{const u=ctx.unit,s=st(u);if(ctx.prevented||!s||!active(s,'T11')||!member(u)||!live(u)||(ctx.source||ctx.credit)?.side!=='enemy'||ctx.dmg?.tags?.includes('hpLoss')||s.emergency.has(u.uid))return;ctx.prevented=true;u.hp=Math.min(1,u.s.maxHp);rescue(u);},{priority:-500});
 b.on('damaged',({source,target:u,amount})=>{const s=st(u);if(!s||!active(s,'T11')||!member(u)||!live(u)||source?.side!=='enemy'||amount<=0||u.hp>u.s.maxHp*EMERGENCY.hpThreshold||s.emergency.has(u.uid))return;rescue(u);});
 b.on('beforeStatus',ctx=>{const s=st(ctx.target);if(s&&member(ctx.target)&&(s.immunity.get(ctx.target.uid)||0)>b.time&&['stun','freeze'].includes(ctx.status))ctx.cancel=true;});
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{
  const s=st(u);if(!s||!member(u)||e.side!=='enemy'||!(dealt>0)||!nativePacket(dmg))return;
  regionEvent(s,u,e);
  if(joint(s)&&inRegion(s,u,'T01')&&e.alive)s.marks.set(e.id,b.time+MARK.linger);
  if(marked(s,e)&&e.alive&&legal(e))hitTech(s,e,dealt*MARK.trueRatio,'true');
 });
 b.on('skillStart',({unit:u})=>{const s=st(u);if(!s||!member(u)||!live(u))return;
  if(active(s,'T08')){s.casts.add(u.def.baseId||u.defId);if(s.casts.size>=PARALLEL.casters&&!s.parallelUsed){s.parallelUsed=true;for(const a of units(s))a.skill?.gainSp(PARALLEL.bonusSp,'rhine:parallel');}}
 });
 b.on('tick',({dt})=>{
  refreshRegions();
  for(const s of states.values()){
   if(s.preview)continue;
   for(const u of units(s)){
    if(active(s,'T08')&&u.skill?.spType==='time')u.skill.gainSp(PARALLEL.recovery*dt,'rhine:parallelRecovery');
    if(active(s,'T06'))b.heal(null,u,u.s.maxHp*(inRegion(s,u,'T06')?REPAIR.inside:REPAIR.outside)*dt,{regen:true,rhine:true});
   }
   if(active(s,'T07')&&s.keys('T04').length&&b.time+1e-8>=s.nextPulse){s.nextPulse+=PULSE.interval;
    const L=b.getPlayer(s.credit.ownerId)?.bonds?.[RHINE]?.layers||s.layers;
    const hits=enemies().filter(e=>bodyInKeys(e,s.keys('T04'))&&legal(e)).sort((a,c)=>c.s.maxHp-a.s.maxHp||a.id-c.id).slice(0,joint(s)?PULSE.jointTargets:PULSE.targets);
    for(const e of hits){hitTech(s,e,pulseDamage(L),'phys');if(e.alive&&joint(s))b.applyStatus(e,'sluggish',{duration:PULSE.pause});}
   }
  }
 });
 b.rhine={states,member,inRegion,grow,regionEvent};
 const nativeOwner=u=>member(u)?u:u?.kind==='token'&&member(u.ownerUnit)&&u.ownerUnit.def.raw?.rhineResearch?u.ownerUnit:null;
 const regionDamage=(source,target,dmg,n)=>{if(!(n>0)||!nativePacket(dmg))return;const owner=nativeOwner(source);if(owner&&target.side==='enemy')regionEvent(st(owner),source,target);const defending=nativeOwner(target);if(defending&&source?.side==='enemy')regionEvent(st(defending),target,source);};
 b.on('damageResolved',({source,target,dmg,dealt})=>regionDamage(source,target,dmg,dealt));
 b.on('damageAbsorbed',({source,target,dmg,absorbed})=>regionDamage(source,target,dmg,absorbed));
 installResearch(b);
 b.on('battleEnd',({result})=>{for(const s of states.values())if(result.perPlayer[s.credit.ownerId])result.perPlayer[s.credit.ownerId].rhineCarry={controllerUsed:[...s.controllerUsed]};});
}

function installResearch(b){
 const {states,member,inRegion,grow,regionEvent}=b.rhine;
 const record=u=>{
  const owner=u?.kind==='token'?u.ownerUnit:u,s=states.get(owner?.ownerId);if(!s||s.preview||s.count<3||!member(owner)||!owner.def.raw?.rhineResearch)return null;
  const id=owner.def.baseId||owner.defId,name=owner.def.name,r=s.research[id]||=( {name,earned:0,actions:new Set(),enemies:new Set(),regions:new Set(),heal:0,count:0,ready:0,targets:new Map(),armed:false,blocked:0} );
  return {u:owner,s,r,gold:!!owner.def.raw?.isGolden,eliteCap:b.allyUnits.some(a=>a.ownerId===owner.ownerId&&(a.def.baseId||a.defId)===id&&a.def.raw?.isGolden)};
 };
 const grant=(v,n,cap)=>{const upper={'梅尔':12,'星源':9,'赫默':8,'麦哲伦':12,'星极':9,'白面鸮':8,'淬羽赫默':9,'塞雷娅':9,'伊芙利特':9,'缪尔赛思':6,'溯光星源':10};const allowed=Math.max(0,Math.min(n,(v.eliteCap?upper[v.r.name]:cap)-v.r.earned,20-v.s.growth));if(allowed){v.r.earned+=allowed;v.s.growth+=allowed;grow(v.s,allowed,'research');}};
 const batch=(v,n,step,gain,cap)=>{v.r.count+=n;while(v.r.count>=step){v.r.count-=step;grant(v,gain,cap);}};
 const support=(s,u)=>['T01','T02','T03','T06'].some(id=>s.active.includes(id)&&inRegion(s,u,id));
 const newEnemies=(v,e,gain,cap)=>{if(v.r.enemies.has(e.id))return;v.r.enemies.add(e.id);batch(v,1,3,gain,cap);};
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{if(e.side!=='enemy'||dealt<=0||!nativePacket(dmg))return;const v=record(u);if(!v)return;const {r,gold,s}=v;
  const key=u.id+':'+(dmg.attackId??u.stats.attacks);
  switch(r.name){
   case '梅尔':if(u.kind==='token'&&!r.actions.has(key)){r.actions.add(key);batch(v,1,3,gold?2:1,gold?12:6);}break;
   case '星源':newEnemies(v,e,gold?3:2,gold?9:6);break;
   case '麦哲伦':newEnemies(v,e,gold?4:2,gold?12:6);break;
   case '星极':if(!r.actions.has(key)){r.actions.add(key);batch(v,1,6,gold?3:2,gold?9:6);}break;
   case '伊芙利特':{r.groups||=new Map();const targets=r.groups.get(key)||new Set();targets.add(e.id);r.groups.set(key,targets);if(targets.size>=2&&!r.actions.has(key)&&b.time>=r.ready){r.actions.add(key);r.ready=b.time+6;grant(v,gold?3:2,gold?9:6);}break;}
   case '缪尔赛思':{r.flowRegions||=new Set();const regions=u.kind==='token'?r.flowRegions:r.regions;for(const id of ['T01','T02','T03','T04','T06'])if(s.active.includes(id)&&inRegion(s,u,id))regions.add(id);if(!r.granted&&[...r.regions].some(id=>[...r.flowRegions].some(other=>id!==other))){r.granted=true;grant(v,gold?6:4,gold?6:4);}break;}
   case '溯光星源':if(r.armed){r.armed=false;grant(v,gold?5:3,gold?10:6);}break;
  }
 });
 b.on('statusApplied',({source:u,target:e,status})=>{if(e.side!=='enemy'||status!=='bind')return;const v=record(u);if(v&&v.r.name==='麦哲伦'&&u.kind==='token')newEnemies(v,e,v.gold?4:2,v.gold?12:6);});
 b.on('healResolved',({source:u,target,actual,opts})=>{if(actual<=0||opts?.rhine||opts?.regen||opts?.aura)return;const v=record(u);if(!v||!member(target)||target.ownerId!==v.u.ownerId||!support(v.s,target))return;const {r,gold}=v;regionEvent(v.s,v.u,target);
  if(r.name==='赫默')batch(v,actual,300,gold?2:1,gold?8:4);
  if(r.name==='白面鸮'){const key=u.id+':'+u.stats.attacks;if(!r.actions.has(key)){r.actions.add(key);batch(v,1,3,gold?2:1,gold?8:4);}}
  if(r.name==='淬羽赫默'&&target.hp-actual<target.s.maxHp*.4){const last=r.targets.get(target.uid)||{n:0,ready:0};if(last.n<2&&b.time>=last.ready){r.targets.set(target.uid,{n:last.n+1,ready:b.time+6});grant(v,gold?3:2,gold?9:6);}}
 });
 b.on('damageResolved',({source,target:u,dealt})=>{if(source?.side!=='enemy'||dealt<=0||source.blockedBy!==u)return;const v=record(u);if(v?.r.name==='梅尔'&&u.kind==='token')batch(v,1,3,v.gold?2:1,v.gold?12:6);if(v?.r.name==='塞雷娅')v.r.pressureAt=b.time;});
 b.on('skillStart',({unit:u})=>{const v=record(u);if(v?.r.name==='溯光星源')v.r.armed=true;});
 b.on('tick',({dt})=>{for(const u of b.allyUnits.filter(u=>u.kind==='op'&&live(u))){const v=record(u);if(v?.r.name==='塞雷娅'&&u.blocking?.length&&support(v.s,u)&&b.time-(v.r.pressureAt??-Infinity)<=2){v.r.blocked+=dt;while(v.r.blocked>=8){v.r.blocked-=8;grant(v,v.gold?3:2,v.gold?9:6);}}}});
}
