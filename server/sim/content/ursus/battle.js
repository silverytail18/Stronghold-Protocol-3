import {CORE,STUDENT,AID,SURVEY,EXECUTION,OPENING_SHIELD,layers,depthCap,effects,territory,damageMultiplier,attackReduction,originalDirect,refundExecution,bossTarget,lateBonuses} from '../../../../shared/ursus-rules.js';
import {unitBonds,itemRecord} from '../support/index.js';
import {bodyKeys} from '../../body.js';
import {canTargetEnemy,absoluteRangeKeys} from '../../targeting.js';
import {GEO} from '../../../../shared/constants.js';
import {installTraits} from './traits.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const identity=u=>u?.kind==='op'&&unitBonds(u).includes(CORE)&&!u.trait?.doll;
const offensive=u=>u.def.raw?.profession!=='MEDIC'&&u.def.raw?.dmgType!=='none'&&(u.def.raw?.dmgType!=='heal'||u.def.raw?.subProfessionId==='guardian');
const family=u=>u.def.baseId||u.defId;
const empty=()=>({cells:[],counts:new Map(),union:new Set(),shared:new Set(),empowered:new Set(),area:0,families:0});
export function install(b){
 if(!b.data.raw?.bonds?.[CORE])return;
 const states=new Map(),preview=!!b.opts?.preview||b.flags?.preview===true||b.players.some(p=>p.input?.contentInfo?.ursusPreview);
 for(const p of b.players){const active=p.bonds?.[CORE],carry=p.input?.contentInfo?.ursusCarry;
  states.set(p.playerId,{pid:p.playerId,tier:active?.active?Math.min(3,active.tier||1):0,L:layers(active?.layers||0),offset:carry?.elapsed||0,readyAt:carry?.readyAt||0,refundUsed:carry?.refundUsed||0,serial:carry?.serial||0,pending:null,retryAt:0,domain:empty(),signature:'',aid:p.bandId===AID||p.input?.bandId===AID,student:p.bonds?.[STUDENT]?.active?Math.min(2,p.bonds[STUDENT].tier||1):0,metrics:{casts:0,hits:0,kills:0,trueDamage:0,refund:0},credit:{side:'ally',ownerId:p.playerId,id:'ursus:'+p.playerId,stats:{dmg:0,kills:0,heal:0,taken:0,attacks:0}}});
 }
 for(const s of states.values()){const input=b.getPlayer(s.pid)?.input?.contentInfo?.ursusCarry;s.traits=input?.traits?structuredClone(input.traits):{teamUsed:0,families:{}};}
 installTraits(b,states);
 // Geometry is locked once before combat. Later range refreshes cannot invalidate that map.
 const invalidate=()=>{};
 const time=s=>b.time+s.offset;
 const validCell=(r,c)=>b.grid.inRect(r,c)&&b.grid.tile(r,c).pass!=='NONE';
 const refresh=s=>{
  if(!s.tier){s.domain=empty();return s.domain;}
  if(s.locked)return s.domain;
  const sources=[];
  for(const u of b.allyUnits){if(u.ownerId!==s.pid||u.removed||!identity(u)||!offensive(u))continue;
   // Starting formation, permanent module/equipment range only; carried active skills do not redraw territory.
   const keys=absoluteRangeKeys(u.rangeGrid,u.homeR,u.homeC,u.dir,u.s.baseRangeExtend);
   sources.push({family:family(u),cells:keys.map(k=>[Math.floor(k/GEO.COLS),k%GEO.COLS]),keys});
  }
  const sig=s.tier+'|'+sources.map(u=>u.family+':'+u.keys.join(',')).join(';');
  if(sig!==s.signature){s.signature=sig;s.domain=territory(sources,s.tier,{validCell});}
  return s.domain;
 };
 const depth=(s,e)=>{const d=refresh(s);let K=0;for(const k of bodyKeys(e))K=Math.max(K,d.counts.get(k)||0);return Math.min(K,depthCap(s.tier));};
 // Air permission belongs to the owner's shared cells, never to the unit's global profile.
 const sharedProfile=(u,prof)=>{
  const s=states.get(u?.ownerId);
  if(!s?.tier||!live(u)||!identity(u)||!offensive(u)||u.def.position!=='MELEE'||!prof||prof.canHitFly||prof.groundOnly||prof.heal||prof.dmgType==='heal'||prof.noAttack||u.skill?.active&&u.skill.spec.allowSharedRange===false)return prof;
  return {...prof,canHitFly:true};
 };
 const syncEnemy=e=>{
  let atk=0,slow=0,haste=0,def=0,res=0,reveal=false;
  for(const s of states.values()){if(!s.tier)continue;const k=depth(s,e),f=effects(k,s.tier);if(k>=2)atk=Math.max(atk,attackReduction(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L));if(f){slow=Math.max(slow,f.slow);haste=Math.max(haste,f.haste);def=Math.max(def,f.def);res=Math.max(res,f.res);reveal||=f.reveal;}}
  const sig=[atk,slow,haste,def,res,+reveal].join('|');if(e.mem.ursusDomain===sig)return;e.mem.ursusDomain=sig;
  b.removeBuff(e,'ur:territory');if(atk||slow||haste||def||res||reveal)b.addBuff(e,{key:'ur:territory',mods:{atkPct:-atk,moveMul:1-slow,aspd:-haste,defPct:-def,resFlat:-res},flags:reveal?{reveal:true}:null});
 };
 const sync=()=>{for(const s of states.values())refresh(s);for(const e of b.enemies)if(live(e))syncEnemy(e);};
 const emit=(s,kind,e,extra={})=>b.fx('ursusExecution',{ownerId:s.pid,serial:++s.serial,kind,id:e?.id??null,x:e?.x??0,y:e?.y??0,...extra});
 const eligible=(s,e)=>s.tier>=3&&live(e)&&e.kind==='enemy'&&e.hp>0&&!bossTarget(e)&&!e.s.flags.invulnerable&&depth(s,e)>=EXECUTION.depth&&canTargetEnemy(s.credit,e,{canHitFly:true});
 const choose=s=>b.enemies.filter(e=>eligible(s,e)).sort((a,z)=>z.hp-a.hp||a.id-z.id)[0];
 const sourceMods=u=>{const gear=(u.items||[]).map(id=>u.skill?.battle?.data?.raw?.items?.[id]||itemRecord(id)).some(r=>r?.baseId===SURVEY+'_a');if(gear&&offensive(u))b.addBuff(u,{key:'ur:survey',mods:{rangeExtend:1},persist:true});};
 const fortify=u=>{const s=states.get(u?.ownerId),hp=lateBonuses(s?.tier).hp;if(hp&&identity(u))b.addBuff(u,{key:'ur:fortitude',mods:{hpPct:hp},persist:true,allowDead:true});};
 b.on('battleStart',()=>{
  for(const u of b.allyUnits){sourceMods(u);fortify(u);const s=states.get(u.ownerId);if(s?.student&&u.kind==='op'&&unitBonds(u).includes(STUDENT))b.addBuff(u,{key:'ur:student',mods:{hpPct:s.student>=2?.30:.15},persist:true});}
  for(const s of states.values()){refresh(s);s.locked=true;}sync();
 },{priority:-1000});
 // After opening HP modifiers and the fixed map, sample current HP once for each eligible real operator.
 b.on('battleStart',()=>{
  for(const s of states.values()){
   if(s.tier!==OPENING_SHIELD.tier||s.openingShieldGranted)continue;
   s.openingShieldGranted=true;
   for(const u of b.allyUnits){
    if(u.ownerId!==s.pid||u.kind!=='op'||u.trait?.doll||!live(u)||depth(s,u)<OPENING_SHIELD.depth)continue;
    void u.s; // Resolve lazy max-HP modifiers before sampling current HP, including carried HP ratios.
    const amount=Math.max(0,u.hp)*OPENING_SHIELD.ratio;
    if(amount>0)b.addBuff(u,{key:'ur:openingShield',shield:amount,visible:true,persist:false});
   }
  }
 },{priority:-10000});
 b.on('deploy',({unit:u})=>{if(u.kind!=='op')return;sourceMods(u);fortify(u);const s=states.get(u.ownerId);if(s?.student&&unitBonds(u).includes(STUDENT))b.addBuff(u,{key:'ur:student',mods:{hpPct:s.student>=2?.30:.15},persist:true});});
 b.on('hit',ctx=>{
  const {source:u,target:e,dmg}=ctx;
  if(e?.side==='ally'){
   const s=states.get(e.ownerId),guard=lateBonuses(s?.tier).guard;
   if(guard&&identity(e)&&(u?.side==='enemy'||ctx.credit?.side==='enemy')&&['phys','arts','true','elemental'].includes(dmg.type)&&depth(s,e)>=1)dmg.mul*=1-guard;
   return;
  }
  if(e?.side!=='enemy')return;syncEnemy(e);
  const s=states.get(u?.ownerId);if(!s?.tier||!identity(u)||!originalDirect(dmg))return;
  const k=depth(s,e);if(k>=2)dmg.mul*=damageMultiplier(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L)*(effects(k,s.tier)?.extra||1)*(bossTarget(e)?1+lateBonuses(s.tier).boss:1);
 },{priority:-500});
 b.on('hitResolved',({source:u,target:e,dmg})=>{
  if(preview||u?.kind!=='op'||e?.side!=='enemy'||!originalDirect(dmg))return;const s=states.get(u.ownerId);
  if(!s||s.tier<3||depth(s,e)<EXECUTION.depth)return;const delta=refundExecution(s,time(s));if(delta){s.metrics.refund+=delta;emit(s,'refund',e,{amount:delta});}
 });
 b.on('heal',ctx=>{const s=states.get(ctx.target?.ownerId);if(!s?.tier||!s.aid||!identity(ctx.target)||ctx.opts?.regen||ctx.opts?.element)return;
  if(ctx.source?.kind!=='op'||ctx.opts?.tags?.some(t=>/^(bond|item)/.test(t)))return;
  if(bodyKeys(ctx.target).some(k=>refresh(s).union.has(k)))ctx.amount*=1.12;
 });
 b.on('tick',()=>{
  sync();if(preview)return;
  for(const s of states.values()){if(s.tier<3)continue;const T=time(s);
   if(s.pending&&T+1e-7>=s.pending.resolveAt){const e=b.enemies.find(e=>e.id===s.pending.targetId);s.pending=null;
    if(!e||!eligible(s,e)||!Number.isFinite(e.s.maxHp)||e.s.maxHp<=0){emit(s,'cancel',e);s.retryAt=T+EXECUTION.retry;continue;}
    s.readyAt=T+EXECUTION.cooldown;s.refundUsed=0;s.metrics.casts++;
    const n=b.dealDamage(s.credit,e,{amount:e.s.maxHp*EXECUTION.maxHpRatio,type:'true',canDodge:false,sourceless:true,noSp:true,tags:['bond','ur:execution']});
    s.metrics.hits++;s.metrics.trueDamage+=n;if(!e.alive)s.metrics.kills++;
    emit(s,e.alive?'survived':'execute',e,{amount:n});
   }
   if(!s.pending&&T+1e-7>=s.readyAt&&T+1e-7>=s.retryAt){const e=choose(s);if(e){s.pending={targetId:e.id,resolveAt:T+EXECUTION.windup};emit(s,'lock',e,{duration:EXECUTION.windup});}}
  }
 });
 const carry=s=>({version:1,elapsed:time(s),readyAt:s.readyAt,refundUsed:s.refundUsed,serial:s.serial,native:b.ursusNativeCarry?.(s.pid)||{},traits:b.ursusTraitCarry(s.pid)});
 b.on('battleEnd',({result})=>{for(const[pid,s]of states){const p=result.perPlayer?.[pid];if(p)p.ursus={version:1,metrics:{...s.metrics},carry:carry(s)};}});
 b.ursus={states,invalidate,depth:(pid,e)=>{const s=states.get(pid);return s?depth(s,e):0;},sharedKeys:u=>{const s=states.get(u?.ownerId);if(!s?.tier||!identity(u)||!offensive(u))return null;sync();return refresh(s).shared;},
  sharedProfile,
  canHitAir:(u,e,prof)=>{const s=states.get(u?.ownerId);return !!s&&sharedProfile(u,prof)!==prof&&depth(s,e)>=2;},
  sharedTrigger:(u,sk)=>{const s=states.get(u.ownerId);if(!s?.tier||!identity(u)||!offensive(u)||sk.healSkill||sk.triggerGrid||sk.spec?.allowSharedRange===false)return false;return !!(sk.spec?.attack||sk.spec?.sharedAttackTrigger||sk.spec?.mods&&!sk.spec?.onStart);},
  carry:pid=>{const s=states.get(pid);return s?carry(s):null;},
  view:()=>[...states.values()].filter(s=>s.tier).map(s=>({playerId:s.pid,tier:s.tier,layers:layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L),area:s.domain.area,sharedArea:s.domain.empowered.size,cells:s.domain.cells.map(({row,col,k})=>[row,col,k]),cooldown:Math.max(0,s.readyAt-time(s)),refundUsed:s.refundUsed,traitLayers:s.traits.teamUsed,lockedTarget:s.pending?.targetId??null,resolveIn:s.pending?Math.max(0,s.pending.resolveAt-time(s)):0,metrics:{...s.metrics}}))};
}
