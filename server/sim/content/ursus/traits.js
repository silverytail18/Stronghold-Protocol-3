import {CORE,STUDENT_CHARS,originalDirect} from '../../../../shared/ursus-rules.js';
import {URSUS_TRAITS,TRAIT_TEAM_CAP,traitId} from '../../../../shared/ursus-traits.js';
import {gainLayers} from '../support/index.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const keyOf=u=>u?.def.raw?.charId?.split('_').at(-1);
export function installTraits(b,states){
 const preview=!!b.opts?.preview||b.players.some(p=>p.input?.contentInfo?.ursusPreview);
 const definition=u=>{if(u?.kind!=='op'||u.trait?.doll)return null;const key=keyOf(u),t=URSUS_TRAITS[key];return t&&u.def.raw.garrisonIds?.includes(traitId(key,!!u.def.raw.isGolden))?t:null;};
 const grow=(u,event,n=1)=>{
  const t=definition(u),s=states.get(u?.ownerId);if(preview||!t||t.event!==event||!s?.tier||!(n>0)||!b.flags.layerGainsEnabled)return;
  const state=s.traits,quality=u.def.raw.isGolden?1:0,f=state.families[t.key]||={used:0,cap:0,progress:0};f.cap=Math.max(f.cap,t.cap[quality]);
  if(state.teamUsed>=TRAIT_TEAM_CAP||f.used>=f.cap)return;f.progress+=n;
  while(f.progress+1e-8>=t.threshold){f.progress=Math.max(0,f.progress-t.threshold);const requested=Math.min(t.amount[quality],f.cap-f.used,TRAIT_TEAM_CAP-state.teamUsed);if(requested<=0)break;
   const actual=gainLayers(b,{playerId:s.pid,bonds:CORE,n:requested,source:u,reason:'ursus:trait:'+t.key});const used=Math.min(requested,actual);if(used>0){f.used+=used;state.teamUsed+=used;}
   if(f.used>=f.cap||state.teamUsed>=TRAIT_TEAM_CAP){f.progress=0;break;}
  }
 };
 b.on('nativeActionResolved',a=>{const u=a.attacker;if(!(a.actualDamage>0)||u?.kind!=='op'||a.profile?.heal||a.profile?.tags?.some(t=>/^(bond|item|dot)/.test(t)))return;
  grow(u,'attack');if(a.isSkill)grow(u,'skillAttack');if(new Set(a.hitTargets.filter(e=>e.side==='enemy').map(e=>e.id)).size>=2)grow(u,'multi');
 });
 b.on('skillStart',({unit:u,skill,reason,free})=>{if(free||reason==='carry'||!skill||skill.kind==='passive'||!(skill.spCost>0))return;grow(u,'skill');if(b.allyUnits.some(a=>a!==u&&a.ownerId===u.ownerId&&live(a)&&a.kind==='op'&&STUDENT_CHARS.includes(a.def.raw?.charId)))grow(u,'studentSkill');});
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{if(!(dealt>0)||e.side!=='enemy'||e.alive||!originalDirect(dmg))return;grow(u,'kills');});
 b.on('healChainResolved',({source:u,healed})=>{const own=new Set((healed||[]).filter(id=>b.allyUnits.some(a=>a.id===id&&a.kind==='op'&&a.ownerId===u?.ownerId)));if(own.size>=3)grow(u,'chainHeal');},{priority:500});
 b.on('healResolved',({source:u,target,actual,opts})=>{if(u===target&&actual>0&&opts?.nativeSelfHeal)grow(u,'selfHeal',actual/u.s.maxHp);});
 // Generic direct-hit terminals; Talulah's arts/elemental/ground-fire trait lives in her native kit.
 b.on('hit',({source:u,target:e,dmg})=>{const t=definition(u);if(t?.event!=='terminal'||e?.side!=='enemy'||!originalDirect(dmg))return;const bonus=t.amount[u.def.raw.isGolden?1:0];
  if(t.key==='poca'&&e.s.massLevel>=3)dmg.mul*=1+bonus;
  if(t.key==='headb2'&&dmg.tags?.includes('splash')&&!dmg.tags?.includes('native:ursus:highland'))dmg.mul*=1+bonus;
 });
 b.ursusTraitCarry=pid=>structuredClone(states.get(pid)?.traits||{teamUsed:0,families:{}});
}
