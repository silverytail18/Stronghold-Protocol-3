import {hypot as productMath_hypot} from '../../detmath.js';
// Main and follow-up shells share one snapshot, owner and growth award.
import {engineeringDamage} from '../../../../shared/rhodes-engineering.js';
import {isRhodesCarry} from '../../../../shared/rhodes-wire.js';
import * as S from '../support/index.js';
import {remainingDistance,effectiveProfile} from '../../ai.js';
import {canTargetEnemy} from '../../targeting.js';
import {RI,AMORIS,KALTS2,DOLRIS,TMORIS,MONSTR} from './data.js';
import {live} from './common.js';
import {ENGINEERING_BALANCE as E,FIRE_CONTROL_BALANCE as F} from './balance.js';
export const riMember=(b,u)=>S.unitBonds(u).includes(RI)||(S.unitBonds(u).includes('maniShip')&&b.getPlayer(u.ownerId)?.bonds?.maniShip?.active);
export const livingRhodes=(b,pid)=>b.allyUnits.filter(u=>u.kind==='op'&&u.ownerId===pid&&live(u)&&riMember(b,u));
export function engineeringNumbers(layers,atk,tier){const i=tier>=3?1:0,{fire}=engineeringDamage(E,layers,atk,tier);return{atk,phys:fire,arts:fire,true:i?fire*E.trueScale:0,interval:E.interval[i],fuse:E.fuse[i],radius:E.radius[i]};}
const state=(b,pid)=>b.getPlayer(pid)?.bonds?.[RI];
const selectable=e=>live(e)&&canTargetEnemy(null,e,{canHitFly:true});
const independent=t=>typeof t==='string'&&(t==='item'||t==='bond'||t.startsWith('item:')||t.startsWith('bond:')||t.startsWith('exp:sui')||t==='exp:kjerag:ice');
export const rhodesNativeDamage=d=>d&&!d.sourceless&&!d.tags?.some(t=>t==='hpLoss'||independent(t));
export const rhodesFamilyCooldown=u=>S.tierOf(u)<=3?F.familyCooldown:S.tierOf(u)<=5?F.middleCooldown:F.terminalCooldown;
export function rhodesCanEngage(b,u,e){
 if(!live(u)||!selectable(e))return false;
 if(e.blockedBy===u&&(u.blocking||[]).includes(e))return true;
 let p=effectiveProfile(u);const id=S.baseChessId(u);
 if(id===MONSTR)return false; // Native fusion attacks blocked foes only; healing is not engagement.
 const middleSkill=id===TMORIS&&u.skill?.active;
 let disarmed=u.s.flags.disarm;
 if(middleSkill&&u.findBuff(u.skill._buffKey)?.flags?.disarm)disarmed=u.buffs.some(v=>v.key!==u.skill._buffKey&&v.flags?.disarm);
 // These native kits run their own attack loops; noAttack only disables the generic loop.
 if(u.mem.rmNextAttack!==undefined)p={...p,noAttack:false,...(id===AMORIS?{canHitFly:false}: {})};
 if((id===KALTS2&&u.skill?.id==='skchr_kalts2_2'||id===DOLRIS&&u.skill?.id==='skchr_dolris_2')&&u.skill?.active)p={...p,noAttack:false,heal:null,dmgType:'arts',canHitFly:true};
 if(middleSkill)p={...p,noAttack:false,heal:null,dmgType:'arts',canHitFly:false,groundOnly:true};
 if(!p||p.heal||p.dmgType==='heal'||p.noAttack||p.noAttackUnlessSkill&&!u.skill?.active||disarmed||p.canAttack&&!p.canAttack(b,u))return false;
 return canTargetEnemy(u,e,p)&&(!p.targetFilter||p.targetFilter(e))&&S.inRange(u,e);
}
export function installEngineering(b){
 const teams=new Map(),eps=1e-6,roundOf=p=>p.input?.contentInfo?.round??b.round??0;
 for(const p of b.players)if(p.bonds?.[RI]?.active&&p.bonds[RI].tier>=2){
  const pid=p.playerId,a=p.input?.contentInfo?.rhodesCarry??p.input?.rhodesCarry;
  const carry=isRhodesCarry(a)&&a.round===roundOf(p)?a:null;
  const credit={id:'rm:engineering:'+pid,kind:'bond',side:'ally',ownerId:pid,def:{bonds:[]},stats:{dmg:0,kills:0,elem:0}};
  teams.set(pid,{credit,firstAt:carry?.openingCooldown==null?null:b.time+carry.openingCooldown,nextAt:b.time+(carry?.mainCooldown||0),seq:carry?.serial||0,
   commands:carry?.commands||0,gained:carry?.gained||0,spent:carry?.spent||0,offset:carry?.elapsed||0,teamReady:b.time+(carry?.teamCooldown||0),
   families:new Map((carry?.families||[]).map(v=>[v.family,b.time+v.remaining])),marks:new Map(),chain:null});
  if(carry)S.battleStore(b,'support:layerCaps',()=>new Map()).set('rm:engineering:'+pid+'|'+RI,carry.growthUsed);
 }
 const member=u=>u?.kind==='op'&&u.uid!=null&&!u.trait?.doll&&live(u)&&riMember(b,u)&&state(b,u.ownerId)?.active&&state(b,u.ownerId).tier>=2;
 const supply=u=>{const t=teams.get(u?.ownerId);if(!t||!member(u))return;
  const family=S.baseChessId(u);if(t.commands>=F.stock||b.time+eps<t.teamReady||b.time+eps<(t.families.get(family)||0))return;
  t.commands++;t.gained++;t.teamReady=b.time+F.teamCooldown;t.families.set(family,b.time+rhodesFamilyCooldown(u));
 };
 const mark=(t,e)=>{if(!selectable(e))return;
  const old=t.marks.get(e.id);t.marks.set(e.id,{target:e,until:b.time+F.markDuration});
  if(!old||old.until-b.time<F.markDuration-1)b.fx('rm-ri-calibration',{id:e.id,x:e.x,y:e.y,t:1});
  if(t.marks.size>128)t.marks.delete(t.marks.keys().next().value);
 };
 const evidence=({source:u,credit,target:e,dmg,...v})=>{
  if(!member(u)||credit&&credit!==u||!rhodesNativeDamage(dmg)||e?.side===u.side||!((v.dealt||0)>0||(v.absorbed||0)>0))return;
  const t=teams.get(u.ownerId);if(!t)return;supply(u);mark(t,e);
 };
 b.on('damageResolved',evidence);b.on('damageAbsorbed',evidence);
 b.on('healResolved',({source:u,target,actual,opts={}})=>{
  if(actual>0&&member(u)&&target?.kind==='op'&&target.ownerId===u.ownerId&&!opts.regen&&!opts.aura&&!opts.item&&!opts.bond&&!opts.kazdel&&!opts.tags?.some(independent))supply(u);
 });
 const engaged=(ops,e)=>ops.some(u=>rhodesCanEngage(b,u,e));
 const candidates=(ops,t)=>{const found=new Map();
  for(const u of ops)for(const e of b.foesInRadius(u.x,u.y,E.reach))if(selectable(e))found.set(e.id,e);
  for(const[id,m]of t.marks){if(m.until<=b.time||!selectable(m.target)){t.marks.delete(id);continue;}if(engaged(ops,m.target))found.set(id,m.target);}
  return [...found.values()];
 };
 const launch=(pid,t,c,targets,followUp)=>{
  const ops=livingRhodes(b,pid),blocked=new Set(ops.flatMap(u=>(u.blocking||[]).map(e=>e.id))),preferred=new Set(c.targets?.map(e=>e.id)||[]);
  const {numbers:n,tier,index:i}=c,types=followUp?['phys','arts']:i?['phys','arts','true']:['phys','arts'],assigned=new Map(),salvo=++t.seq,locks=[];
  for(const type of types){const min=Math.min(...targets.map(e=>assigned.get(e.id)||0)),pool=targets.filter(e=>(assigned.get(e.id)||0)===min);
   const score=e=>type==='phys'?-Math.max(n.phys-e.s.def,n.phys*.05):type==='arts'?-Math.max(n.arts*(1-Math.max(0,e.s.res)/100),n.arts*.05):-(e.s.def+e.s.res*40);
   const urgency=e=>{const d=remainingDistance(b,e);return d<=2?0:d<=5?1:2;};
   pool.sort((a,z)=>Number(preferred.has(z.id))-Number(preferred.has(a.id))||Number(blocked.has(z.id))-Number(blocked.has(a.id))||urgency(a)-urgency(z)||score(a)-score(z)||remainingDistance(b,a)-remainingDistance(b,z)||a.id-z.id);
   const target=pool[0];assigned.set(target.id,(assigned.get(target.id)||0)+1);locks.push({target,type,x:target.x,y:target.y});
  }
  c.ready=false;c.due=b.time+F.followInterval;
  for(const target of new Set(locks.map(v=>v.target)))b.applyStatus(target,'slow',{value:E.lockSlow,duration:n.fuse,source:t.credit,ignoreSelect:true});
  b.fx('rm-ri-salvo',{playerId:pid,salvo,tier,followUp,t:n.fuse,r:n.radius,locks:locks.map(v=>({x:v.x,y:v.y,type:v.type,target:v.target.id,angle:E.angles[v.type]}))});
  b.after(n.fuse,()=>{if(!state(b,pid)?.active||state(b,pid).tier<2||!livingRhodes(b,pid).length)return;
   let effective=false;const feedback=new Map(),primary=new Set();
   for(const {x,y,type,target}of locks){
    const hits=b.foesInRadius(x,y,n.radius).filter(selectable).sort((a,z)=>Number(z.id===target.id)-Number(a.id===target.id)||productMath_hypot(a.x-x,a.y-y)-productMath_hypot(z.x-x,z.y-y)||a.id-z.id).slice(0,E.maxTargets[i]);
    b.fx('rm-ri-impact',{x,y,r:n.radius,playerId:pid,salvo,tier,type});
    for(const e of hits){let absorbed=0;const off=b.on('damageAbsorbed',v=>{if(v.target===e&&v.credit===t.credit)absorbed+=v.absorbed;});
     const dealt=b.dealDamage(t.credit,e,{amount:n[type],type,sourceless:true,isSplash:true,canDodge:type!=='true',tags:['bond:rhodes:engineering']});b.off(off);
     if(dealt>0||absorbed>0){effective=true;feedback.set(e.id,{id:e.id,x:e.x,y:e.y,type});if(e===target)primary.add(e);}
    }
   }
   for(const hit of feedback.values())b.fx('rm-ri-hit',hit);
   if(effective&&!c.growthAwarded){c.growthAwarded=true;S.gainLayers(b,{playerId:pid,bonds:RI,n:E.growth[i],cap:E.cap[i],capKey:'rm:engineering:'+pid,reason:'rm:engineering'});}
   c.primaryConnected ||= primary.size>0;c.targets=[...primary].filter(selectable);c.ready=true;
  });
 };
 b.every(.1,()=>{for(const[pid,t]of teams){const st=state(b,pid),ops=livingRhodes(b,pid);if(!ops.length||!st?.active||st.tier<2){t.chain=null;continue;}
  const c=t.chain;
  if(c&&b.time+eps>=t.nextAt)t.chain=null;
  else if(c?.ready&&c.remaining>0&&b.time+eps>=c.due){
   c.targets=c.targets.filter(e=>selectable(e)&&engaged(ops,e));
   if(!c.targets.length&&c.primaryConnected)c.targets=[...t.marks.values()].filter(m=>m.until>b.time&&selectable(m.target)&&engaged(ops,m.target)).map(m=>m.target);
   if(!c.targets.length)t.chain=null;
   else if(t.commands>0&&b.time+c.numbers.fuse<t.nextAt-eps){
    const targets=candidates(ops,t).filter(e=>engaged(ops,e));
    for(const e of c.targets)if(!targets.includes(e))targets.push(e);
    t.commands--;t.spent++;c.remaining--;launch(pid,t,c,targets,F.followRounds[c.index]-c.remaining);
   }
  }
  if(t.firstAt!==null&&b.time+eps<Math.max(t.firstAt,t.nextAt))continue;
  const targets=candidates(ops,t);if(!targets.length)continue;
  if(t.firstAt===null)t.firstAt=b.time+E.openingDelay;
  if(b.time+eps<Math.max(t.firstAt,t.nextAt))continue;
  const i=st.tier>=3?1:0,numbers=engineeringNumbers(st.layers||0,ops.reduce((n,u)=>n+Math.max(0,u.s.atk),0),st.tier);
  t.chain={numbers,tier:st.tier,index:i,remaining:F.followRounds[i],targets:[],growthAwarded:false};t.nextAt=b.time+numbers.interval;
  launch(pid,t,t.chain,targets,0);
 }});
 b.on('battleEnd',({result})=>{for(const[pid,t]of teams){const p=b.getPlayer(pid),pp=result.perPlayer[pid];if(!pp)continue;
  const left=(at,max)=>Math.min(max,Math.max(0,at-b.time));
  pp.rhodesCarry={version:2,round:roundOf(p),elapsed:t.offset+b.time,commands:t.commands,gained:t.gained,spent:t.spent,
   teamCooldown:left(t.teamReady,F.teamCooldown),families:[...t.families].filter(([,at])=>at>b.time).map(([family,at])=>({family,remaining:left(at,F.terminalCooldown)})),
   mainCooldown:left(t.nextAt,4),openingCooldown:t.firstAt===null?null:left(t.firstAt,E.openingDelay),serial:t.seq,growthUsed:S.layersUsed(b,'rm:engineering:'+pid,RI),...b.rhodesPersonal?.carry(pid)};
 }});
 return teams;
}
