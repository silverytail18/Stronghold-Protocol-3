// Pure artillery damage curve, shared by simulation and the live bond description.
export function engineeringDamage(e,layers,atk,tier){
 const L=Math.min(999,Math.max(0,Number(layers)||0)),A=Math.max(0,Number(atk)||0),i=tier>=3?1:0;
 const excess=Math.max(0,L-e.rampStart),progress=Math.min(1,excess/(e.rampEnd-e.rampStart));
 const base=e.base+e.perLayer*L+e.layerRamp*excess*excess,atkScale=e.atkFloor+(e.atkScale[i]-e.atkFloor)*progress;
 return {base,atkScale,fire:base+atkScale*A};
}
