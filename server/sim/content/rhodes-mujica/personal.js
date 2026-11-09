// Match-local combat traits. Native source records and global ATK are never changed.
import * as S from '../support/index.js';
import {RI,AMIYA,MORTIS,TMORIS,OBLVNS,MONSTR} from './data.js';
import {live} from './common.js';
import {riMember,rhodesNativeDamage} from './engineering.js';
import {PERSONAL_BALANCE as P} from './balance.js';
import {isRhodesCarry} from '../../../../shared/rhodes-wire.js';
export const KROOS='chess_char_4_06_a';
export const PERSONAL_FAMILIES=Object.freeze([AMIYA,KROOS,MORTIS,TMORIS,OBLVNS,MONSTR]);
export function installPersonal(b,fire){
 const teams=new Map();
 for(const p of b.players){if(!p.bonds?.[RI]?.active||p.bonds[RI].tier<2)continue;
  const a=p.input?.contentInfo?.rhodesCarry??p.input?.rhodesCarry,carry=isRhodesCarry(a)&&a.round===(p.input?.contentInfo?.round??b.round)?a:null;
  const t={units:new Map(),cooldowns:new Map((carry?.personalCooldowns||[]).map(v=>[v.family,b.time+v.remaining]))};teams.set(p.playerId,t);
  for(const u of b.allyUnits){const family=S.baseChessId(u);if(u.kind!=='op'||u.ownerId!==p.playerId||!Number.isSafeInteger(u.uid)||!PERSONAL_FAMILIES.includes(family)||!riMember(b,u))continue;
   const old=carry?.personal.find(v=>v.uid===u.uid&&v.family===family);
   t.units.set(u.uid,{unit:u,family,focus:0,focusTarget:null,focusAt:0,leading:old?.leading||0,nextDrop:b.time+(old?.leadRemaining||0),mortisUntil:b.time+(old?.mortisRemaining||0),charges:old?.charges||0,fusion:old?.fusion||0,
    refundArmed:old?.refundArmed||false,refundEffective:old?.refundEffective||false,healPending:false,snapshots:new Map()});
  }
 }
 const state=u=>teams.get(u?.ownerId)?.units.get(u?.uid);
 const eligible=u=>u?.kind==='op'&&live(u)&&b.getPlayer(u.ownerId)?.bonds?.[RI]?.active&&b.getPlayer(u.ownerId).bonds[RI].tier>=2&&riMember(b,u);
 const marked=(u,e)=>{const m=fire.get(u.ownerId)?.marks.get(e.id);return !!m&&m.until>b.time;};
 const native=(u,e,d,credit)=>eligible(u)&&e?.side==='enemy'&&rhodesNativeDamage(d)&&(!credit||credit===u);
 const cycle=(s,d)=>{
  const key=d.tags?.find(v=>v.startsWith('rm:cycle:'))||'attack:'+d.attackId;
  let snap=s.snapshots.get(key);if(!snap){snap={focus:s.focus,leading:s.leading,target:null,awarded:false};s.snapshots.set(key,snap);if(s.snapshots.size>64)s.snapshots.delete(s.snapshots.keys().next().value);}return snap;
 };
 const ignore=(u,d,key,value)=>{d[key]=Math.max(d[key]||0,value-(u.s[key]||0));};
 b.on('hit',({source:u,target:e,dmg:d})=>{const s=state(u);if(!s||!native(u,e,d))return;const i=+S.isElite(u);
  if(s.family===AMIYA&&d.isSkill&&u.skill?.active){d.mul*=1+P.amiyaDamage[i];if(d.type==='arts'&&marked(u,e))ignore(u,d,'resIgnoreFlat',P.amiyaRes[i]);}
  if(s.family===KROOS&&d.isAttack&&!d.isSplash&&d.type==='phys'){
   const snap=cycle(s,d);if(snap.target===null){snap.target=e.id;snap.focus=s.focusTarget===e.id?s.focus:Math.min(2,s.focus);}
   d.mul*=1+snap.focus*P.kroosStep[i];if(snap.focus>=4)ignore(u,d,'defIgnorePct',P.kroosIgnore[i]);
  }
  if(s.family===MORTIS&&b.time<s.mortisUntil&&['phys','arts'].includes(d.type))d.mul*=1+P.mortisDamage[i];
  if(s.family===TMORIS&&d.isSkill&&marked(u,e))d.mul*=1+P.tmorisDamage[i];
  if(s.family===OBLVNS&&d.tags?.includes('rm:note'))d.mul*=1+cycle(s,d).leading*P.leadingStep[i];
  if(s.family===MONSTR&&u.skill?.active&&u.skill.id==='skchr_monstr_3'&&d.type==='true')d.mul*=1+s.fusion*P.monFusionStep[i];
 },{priority:-8000});
 const evidence=({source:u,credit,target:e,dmg:d,...v})=>{if(!((v.dealt||0)>0||(v.absorbed||0)>0))return;
  const victim=state(e);if(victim?.family===MORTIS&&eligible(e)&&u?.side==='enemy'&&rhodesNativeDamage(d))victim.mortisUntil=b.time+4;
  const s=state(u);if(!s||!native(u,e,d,credit))return;
  if(s.family===KROOS&&d.isAttack&&!d.isSplash&&d.type==='phys'){const snap=cycle(s,d);if(!snap.awarded){snap.awarded=true;s.focus=Math.min(4,snap.focus+1);s.focusTarget=e.id;s.focusAt=b.time;}}
  if(s.family===OBLVNS&&d.tags?.includes('rm:note')){const snap=cycle(s,d);if(!snap.awarded){snap.awarded=true;s.leading=Math.min(3,s.leading+1);}s.nextDrop=b.time+4;}
  if(s.family===TMORIS&&s.refundArmed&&u.skill?.active&&d.isSkill)s.refundEffective=true;
 };
 b.on('damageResolved',evidence);b.on('damageAbsorbed',evidence);
 b.on('heal',ctx=>{const s=state(ctx.source);if(s?.family===MONSTR&&eligible(ctx.source)&&ctx.opts?.nativeMonstr&&!(ctx.source.skill?.active&&ctx.source.skill.id==='skchr_monstr_3'))ctx.amount*=1+s.charges*P.monHealStep[+S.isElite(ctx.source)];});
 b.on('healResolved',({source:u,target,actual,opts})=>{const s=state(u);if(s?.family===MONSTR&&eligible(u)&&!(u.skill?.active&&u.skill.id==='skchr_monstr_3')&&actual>0&&opts?.nativeMonstr&&!opts.secondary&&!opts.nativeSelfHeal&&target!==u&&target?.kind==='op'&&target.ownerId===u.ownerId&&Number.isSafeInteger(target.uid)&&target.uid>0)s.healPending=true;});
 b.on('healChainResolved',({source:u})=>{const s=state(u);if(s?.family!==MONSTR)return;const pending=s.healPending;s.healPending=false;const t=teams.get(u.ownerId);if(pending&&eligible(u)&&b.time+1e-6>=(t.cooldowns.get(MONSTR)||0)&&s.charges<3){s.charges++;t.cooldowns.set(MONSTR,b.time+P.monCooldown);}});
 b.on('skillStart',({unit:u,reason,free})=>{const s=state(u);if(!s||!eligible(u))return;
  if(reason==='carry')return;
  if(s.family===TMORIS){s.refundArmed=!free&&u.skill.spCost>0;s.refundEffective=false;}
  if(s.family===MONSTR&&u.skill.id==='skchr_monstr_3'){s.fusion=s.charges;s.charges=0;}
 });
 b.on('skillEnd',({unit:u,reason})=>{const s=state(u);if(!s)return;
  if(s.family===MONSTR)s.fusion=0;
  if(s.family!==TMORIS)return;
  const refund=s.refundArmed&&s.refundEffective;s.refundArmed=false;s.refundEffective=false;
  const t=teams.get(u.ownerId);if(refund&&eligible(u)&&['duration','instant'].includes(reason)&&b.time+1e-6>=(t.cooldowns.get(TMORIS)||0)){t.cooldowns.set(TMORIS,b.time+P.tmorisCooldown);u.skill.gainSp(P.tmorisSp[+S.isElite(u)],'rm:personal:refund');}
 });
 b.on('deploy',({unit:u})=>{const s=state(u);if(!s)return;
  // Personal phase bonuses follow the native state actually restored by deployment.
  if(s.family===MONSTR&&!(u.skill?.active&&u.skill.id==='skchr_monstr_3'))s.fusion=0;
  if(s.family===TMORIS&&!u.skill?.active){s.refundArmed=false;s.refundEffective=false;}
 });
 b.every(.1,()=>{for(const t of teams.values())for(const s of t.units.values()){
  if(b.time-s.focusAt>=4){s.focus=0;s.focusTarget=null;}
  while(s.leading>0&&b.time+1e-6>=s.nextDrop){s.leading--;s.nextDrop+=1;}
 }});
 const remaining=(at,max)=>Math.min(max,Math.max(0,at-b.time));
 b.rhodesPersonal={
  retargetAllowed:u=>eligible(u)&&(state(u)?.leading||0)>=3,
  view:pid=>[...(teams.get(pid)?.units.values()||[])].filter(s=>live(s.unit)).map(s=>({uid:s.unit.uid,family:s.family,name:s.unit.def.name,focus:s.focus,leading:s.leading,charges:s.charges,fusion:s.fusion})),
  carry:pid=>{const t=teams.get(pid);return{personal:[...(t?.units.values()||[])].map(s=>({uid:s.unit.uid,family:s.family,leading:s.leading,leadRemaining:s.leading?remaining(s.nextDrop,4):0,mortisRemaining:remaining(s.mortisUntil,4),charges:s.charges,fusion:s.fusion,refundArmed:s.refundArmed,refundEffective:s.refundEffective})),personalCooldowns:[...(t?.cooldowns||[])].filter(([,at])=>at>b.time).map(([family,at])=>({family,remaining:remaining(at,8)}))};}
 };
 return b.rhodesPersonal;
}
