import {compactCoreStartupResult} from '../../../../shared/core-startup-wire.js';
export function sanitizeCoreStartupResult(input,p,gd){
 if(!gd?.raw?.bonds?.lateranoSupportShip&&!gd?.raw?.bonds?.knightPreparationShip)return {};
 const out=compactCoreStartupResult(p).coreStartupCarry,round=input?.contentInfo?.round;
 if(!out||out.round!==round)return {};
 const prev=input.contentInfo.coreStartupCarry;
 if(out.laterano){
  const b=input.bonds?.lateranoSupportShip,lat=input.bonds?.lateranoShip;
  if(!b?.active||b.count<4||!lat?.active||lat.count<6)delete out.laterano;
  else {out.laterano.startup=.4;out.laterano.used=Math.max(out.laterano.used,prev?.laterano?.used||0);}
 }
 if(out.knight){
  if(!input.bonds?.knightPreparationShip?.active||!input.bonds?.kazimierzShip?.active)delete out.knight;
  else {
   const own=new Set((input.units||[]).filter(u=>u.kind!=='token').map(u=>u.uid));
   out.knight.initialUids=[...new Set([...out.knight.initialUids,...(prev?.knight?.initialUids||[])])].filter(uid=>own.has(uid));
   out.knight.deploys=Math.max(out.knight.deploys,prev?.knight?.deploys||0);
  }
 }
 return out.laterano||out.knight?{coreStartupCarry:out}:{};
}
