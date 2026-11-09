import {isIberiaResult} from '../../../../shared/iberia-wire.js';
import {CORE,sunlight} from '../../../../shared/iberia-rules.js';
import {TRAITS} from '../../../../shared/iberia-traits.js';
// Client-run normal/unite results must preserve bounded same-round progress. These bounds check
// consistency with the actual lineup and elapsed time, rather than trusting client counters.
export function sanitizeIberiaResult(input,p,gd,time=0){
 if(!gd?.bond(CORE))return p?.iberia===undefined?{}:null;
 if(!input||!isIberiaResult(p?.iberia))return null;
 const r=structuredClone(p.iberia),c=r.carry,m=r.metrics,previous=input.contentInfo?.iberiaCarry||input.iberiaCarry;
 const units=(input.units||[]).filter(u=>u.kind!=='token'),families=new Set(units.map(u=>gd.baseIdOf(u.chessId)));
 const uids=new Set(units.map(u=>String(u.uid)));c.native=Object.fromEntries(Object.entries(c.native).filter(([uid])=>uids.has(uid)));
 r.carry.windows=Object.fromEntries(Object.entries(r.carry.windows).filter(([id])=>families.has(id)));
 const epsilon=.001,elapsed=Math.max(0,Number(time)||0),lit=previous?.lit||0,used=previous?.growthUsed||0;
 if(!Number.isInteger(c.fuel)||c.lit-lit!==m.lights||c.growthUsed<used)return null;
 let deltaUsed=0;
 const nativeFamilies=new Map();for(const u of units){const rec=gd.chess(u.chessId),key=rec?.charId?.split('_').at(-1);if(TRAITS[key]&&key!=='elysm')nativeFamilies.set(key,Math.max(nativeFamilies.get(key)||0,rec.isGolden?12:6));}
 for(const[key,f]of Object.entries(c.traits)){
  const old=previous?.traits?.[key],cap=nativeFamilies.get(key);if(!cap||f.used>cap||f.auxUsed>cap||f.progress>=TRAITS[key].threshold+epsilon||f.used<(old?.used||0)||f.auxUsed<(old?.auxUsed||0)||new Set(f.seen).size!==f.seen.length)return null;
  if(old?.seen?.some(id=>!f.seen.includes(id)))return null;deltaUsed+=f.used-(old?.used||0);
 }
 if(Object.keys(previous?.traits||{}).some(key=>!c.traits[key])||Math.abs(c.growthUsed-used-deltaUsed)>epsilon)return null;
 for(const[uid,v]of Object.entries(c.native)){const old=previous?.native?.[uid];if(v.thornsCasts<(old?.thornsCasts||0)||v.castSerial<(old?.castSerial||0)||v.castSerial>(old?.castSerial||0)+Math.ceil(elapsed*120)+10)return null;}
 if(Object.keys(previous?.native||{}).some(uid=>uids.has(uid)&&!c.native[uid]))return null;
 const active=input.bonds?.[CORE]?.active,level=active?input.bonds[CORE].tier:0;
 if(!active){if(m.lights||c.sunRemaining>epsilon||c.sunPermanent)return null;c.fuel=0;c.sunRemaining=0;c.windows={};return{iberia:r};}
 let supplyCap=0;for(const family of families){const period=2,first=previous?.windows?.[family]?.remaining??period;
  if(elapsed+epsilon>=first)supplyCap+=1+Math.floor((elapsed+epsilon-first)/period);
 }
 const supplied=c.fuel+m.lights*24-(previous?.fuel??12);if(supplied<0||supplied>supplyCap)return null;
 if(c.sunPermanent&&(level<3||!(previous?.sunPermanent||m.lights>0)||c.sunRemaining>epsilon))return null;
 if(level>=3&&(previous?.sunPermanent||m.lights>0)&&!c.sunPermanent)return null;
 const oldPulses=previous?.sunPulseCount??0,pulses=c.sunPulseCount??0,deltaPulses=pulses-oldPulses;
 if(deltaPulses<0||deltaPulses>Math.floor((elapsed+epsilon+12-(previous?.sunPulseRemaining??12))/12)||deltaPulses>0&&(!c.sunPermanent||level<3))return null;
 if(previous?.sunPermanent&&level>=3){const first=previous.sunPulseRemaining??12,expected=elapsed+epsilon<first?0:1+Math.floor((elapsed+epsilon-first)/12);if(deltaPulses!==expected||Math.abs((c.sunPulseRemaining??12)-Math.max(0,first-elapsed+12*expected))>.002)return null;}
 const sunMax=Math.max(0,(previous?.sunRemaining||0)-elapsed,m.lights?sunlight(level):0);if(c.sunRemaining>sunMax+epsilon)return null;
 return{iberia:r};
}
