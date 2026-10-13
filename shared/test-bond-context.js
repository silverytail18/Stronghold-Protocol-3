// Read-only contexts. No stepping, RNG, lazy attribute recomputation, or new network requests.
export function battleTestBondContext(b,ownerId,bondId){
 if(!b)return null;
 if(bondId==='snowfieldGuideShip')return b.snowfieldGuideInfo?.(ownerId)||null;
 if(bondId==='girlbandShip')return b.girlbandInfo?.(ownerId)||null;
 if(bondId==='rhineShip'){
  const s=b.rhine?.states?.get(ownerId);if(!s)return null;
  return {live:true,count:s.count,tier:[3,6,9,10].filter(n=>s.count>=n).length,layers:b.getPlayer(ownerId)?.bonds?.rhineShip?.layers??s.layers,research:s.researchIds||[],active:s.active,visitorUid:s.visitorUid};
 }
 return null;
}
export function penguinSupplyContext(priv){
 if(!priv||!Array.isArray(priv.effects))return null;
 const row=priv.effects.find(e=>e.id==='exp:penguin:supply');
 return {claimed:Number.isInteger(row?.counter)?row.counter:0};
}
export function snowOpeningContext(stats,lookup){
 if(!stats)return null;
 const units=stats instanceof Map?[...stats.values()]:stats;
 return {live:false,members:units.filter(u=>u.alive!==false&&lookup(u.defId)?.bonds?.includes('snowfieldGuideShip')).map(u=>({uid:u.uid,name:lookup(u.defId).name,atk:u.atk}))};
}
