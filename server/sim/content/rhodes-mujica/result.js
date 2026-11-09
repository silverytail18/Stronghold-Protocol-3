import {compactRhodesResult,isRhodesCarry} from '../../../../shared/rhodes-wire.js';
import {PERSONAL_FAMILIES} from './personal.js';
import {MONSTR,TMORIS,OBLVNS,MORTIS} from './data.js';
// Results are untrusted: bound supply by elapsed time and by this player's actual low-tier families.
export function sanitizeRhodesResult(input,p,time,gd,round=0){
 const st=input?.bonds?.rhodesShip,a=p?.rhodesCarry;
 if(!st?.active||st.tier<2)return a===undefined?{}:null;
 if(!isRhodesCarry(a)||a.round!==(input.contentInfo?.round??round))return null;
 const prev=input.contentInfo?.rhodesCarry??input.rhodesCarry;
 const elapsed=(prev?.elapsed||0)+time;
 // BattleResult.time is rounded to milliseconds; carry timers retain simulation precision.
 const epsilon=.001;
 if(Math.abs(a.elapsed-elapsed)>epsilon||a.growthUsed>(st.tier>=3?30:24))return null;
 if(prev&&(a.gained<prev.gained||a.spent<prev.spent||a.growthUsed<prev.growthUsed||a.serial<prev.serial))return null;
 const gained=a.gained-(prev?.gained||0),spent=a.spent-(prev?.spent||0);
 const first=prev?.teamCooldown||0;
 if(gained>Math.max(0,Math.floor((time-first+epsilon)/2)+1)||spent>2*(a.serial-(prev?.serial||0)))return null;
 const allowed=new Map(),personal=new Map();for(const u of input.units||[]){
  if(u.kind==='token')continue;const r=gd?.chess?.(u.chessId);if(!r)continue;
  // Membership grants are checked in battle; here only the bounded original board families are accepted.
  const family=String(r.productSourceId??r.baseId??r.chessId??u.chessId).replace(/_b$/,'_a');allowed.set(family,r.tier<=3?6:r.tier<=5?8:10);
  if(PERSONAL_FAMILIES.includes(family))personal.set(u.uid,family);
 }
 if(a.families.some(v=>!allowed.has(v.family)||v.remaining>allowed.get(v.family)))return null;
 for(const v of prev?.families||[]){const min=Math.max(0,v.remaining-time);if(min>epsilon&&!a.families.some(z=>z.family===v.family&&z.remaining+epsilon>=min))return null;}
 if(a.teamCooldown+epsilon<Math.max(0,(prev?.teamCooldown||0)-time)||a.mainCooldown+epsilon<Math.max(0,(prev?.mainCooldown||0)-time))return null;
 if(a.personal.some(v=>personal.get(v.uid)!==v.family
  ||v.family!==OBLVNS&&(v.leading!==0||v.leadRemaining!==0)
  ||v.family!==MORTIS&&v.mortisRemaining!==0
  ||v.family!==MONSTR&&(v.charges!==0||v.fusion!==0)
  ||v.family!==TMORIS&&(v.refundArmed||v.refundEffective)
  ||v.refundEffective&&!v.refundArmed))return null;
 for(const v of a.personal){const end=p.unitsEnd?.find(u=>u.uid===v.uid);if((v.fusion>0||v.refundArmed)&&(!end?.alive||!end.skillActive))return null;}
 if(a.personalCooldowns.some(v=>!allowed.has(v.family)||v.family!==MONSTR&&v.family!==TMORIS||v.remaining>(v.family===MONSTR?3:8)))return null;
 for(const v of prev?.personalCooldowns||[]){const min=Math.max(0,v.remaining-time);if(min>epsilon&&!a.personalCooldowns.some(z=>z.family===v.family&&z.remaining+epsilon>=min))return null;}
 return compactRhodesResult(p);
}
