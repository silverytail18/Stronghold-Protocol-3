import {TRAITS} from '../../../../shared/iberia-traits.js';
import {CORE,nativeDamage,directDamage} from '../../../../shared/iberia-rules.js';
import {gainLayers} from '../support/index.js';
import {bodyInKeys} from '../../body.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
export function installTraits(b,states){
 // Every operator's skillStart contributes to this carry, including mixed-lineup and original operators.
 // Restore once before kits/deployment; redeployment must keep the counters accumulated in this battle.
 for(const u of b.allyUnits){
  const carry=u.kind==='op'&&u.player?.input?.contentInfo?.iberiaCarry?.native?.[String(u.uid)];
  if(carry){u.mem.ibThornsCasts=carry.thornsCasts||0;u.mem.ibCastSerial=carry.castSerial||0;}
 }
 const keyOf=u=>u?.kind==='op'&&!u.trait?.doll&&u.def.raw?.charId?.split('_').at(-1);
 const grow=(u,n=1,unique=null,gate=null)=>{const key=keyOf(u),t=TRAITS[key],s=states.get(u?.ownerId);if(!t||key==='elysm'||!s||!(n>0)||!b.flags.layerGainsEnabled||b.opts.preview)return;
  const f=s.traits[key]||={progress:0,used:0,auxUsed:0,seen:[],lastGate:null};if(unique!==null){if(f.seen.includes(unique))return;f.seen.push(unique);}if(gate!==null){if(f.lastGate===gate)return;f.lastGate=gate;}
  f.progress+=n;const quality=u.def.raw.isGolden?1:0,cap=quality?12:6,amount=quality?4:2;
  while(f.progress>=t.threshold-1e-7){f.progress-=t.threshold;const ask=Math.max(0,Math.min(amount,cap-f.used,24-s.growthUsed)),actual=ask?gainLayers(b,{playerId:s.pid,bonds:CORE,n:ask,source:u,reason:'iberia:trait:'+key}):0;const used=Math.min(ask,actual);f.used+=used;s.growthUsed+=used;
   if(t.aux&&f.auxUsed<cap){const added=gainLayers(b,{playerId:s.pid,bonds:t.aux,n:Math.min(amount,cap-f.auxUsed),source:u,reason:'iberia:trait:'+key});f.auxUsed+=Math.min(Math.min(amount,cap-f.auxUsed),added);}
  }
 };
 b.on('healResolved',({source:u,target,actual,opts})=>{if(!(actual>0)||opts?.tags?.some(t=>/^(bond|item|ib:)/.test(t)))return;const key=keyOf(u);if(key==='highmo'&&target===u)grow(u,1,null,Math.floor(b.time*30+1e-6));if(key==='rosesa'&&target?.kind==='op')grow(u,1,null,opts.regen?Math.floor(b.time):Math.floor(b.time*30+1e-6));});
 b.on('nativeActionResolved',a=>{if(keyOf(a.attacker)==='thorns'&&a.actualDamage>0)grow(a.attacker);});
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{if(!(dealt>0)||!nativeDamage(dmg)||e?.side!=='enemy')return;const key=keyOf(u),unique=e.mem.ibInstance||String(e.spawnSeq)+':'+String(e.id),cast=u?.mem?.ibCastSerial??0;
  if(key==='bluep'&&dmg.tags.includes('poison'))grow(u,1,unique);
  if(key==='glacus'&&dmg.isSkill&&directDamage(dmg))grow(u,1,unique);
  if(key==='hbound'&&dmg.tags.includes('alchemist')&&e.s.massLevel>=3&&!e.isFlying)grow(u,1,null,Math.floor(b.time));
  if(key==='irene'&&dmg.isSkill&&directDamage(dmg))grow(u,1,null,cast);
  if(key==='thorns'&&dmg.tags.includes('counter'))grow(u,1,null,dmg.attackId);
 });
 b.on('skillStart',({unit:u,reason})=>{if(u?.kind==='op'&&reason!=='carry')u.mem.ibCastSerial=(u.mem.ibCastSerial||0)+1;});
 b.on('tick',({dt})=>{for(const u of b.allyUnits)if(live(u)&&keyOf(u)==='toledo'&&b.enemies.some(e=>live(e)&&e.blockedBy&&bodyInKeys(e,u.rangeKeys)&&e.buffs.some(v=>v.key==='native:iberia:toledo:'+u.id)))grow(u,dt);});
}
