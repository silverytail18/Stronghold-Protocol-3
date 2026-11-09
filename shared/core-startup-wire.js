// Bounded per-round state for the two expansion startup effects.
const bounded=(n,max)=>Number.isFinite(n)?Math.min(max,Math.max(0,Math.floor(n))):0;
export function compactCoreStartupResult(p){
 const a=p?.coreStartupCarry;if(!a||typeof a!=='object')return {};
 const out={round:bounded(a.round,100)};
 if(a.laterano)out.laterano={used:bounded(a.laterano.used,50),startup:Math.min(.4,Math.max(0,Number(a.laterano.startup)||0))};
 if(a.knight)out.knight={deploys:bounded(a.knight.deploys,100),initialUids:[...new Set((Array.isArray(a.knight.initialUids)?a.knight.initialUids:[]).filter(v=>Number.isInteger(v)&&v>0))].slice(0,32)};
 return {coreStartupCarry:out};
}
