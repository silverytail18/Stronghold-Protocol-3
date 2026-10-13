// Cosmetic records live in the existing fixed asset manifest; combat data remains unchanged.
const indexes=new WeakMap();
export const SKIN_ID=/^[A-Za-z0-9_\-.:]{1,64}$/;
export function skinRecord(manifest,id,charId=null) {
  const models=manifest?.skinModels;
  if(typeof id!=='string'||!SKIN_ID.test(id)||!models||!Object.hasOwn(models,id))return null;
  const s=models[id];
  return s&&(!charId||s.charId===charId)?s:null;
}
export function skinsFor(manifest,charId) {
  if(!manifest||typeof manifest!=='object'||!charId)return [];
  let index=indexes.get(manifest);
  if(!index){
    index=new Map();
    for(const [id,s] of Object.entries(manifest.skinModels||{})){
      if(!SKIN_ID.test(id)||!s?.charId||!s.avatar||!s.portrait||!s.spine?.front||(!s.spine?.back&&!(s.frontOnly===true&&s.charId==='char_4184_dolris')))continue;
      if(!index.has(s.charId))index.set(s.charId,[]);
      index.get(s.charId).push({id,...s});
    }
    for(const list of index.values())list.sort((a,b)=>(a.sort??0)-(b.sort??0)||a.id.localeCompare(b.id));
    indexes.set(manifest,index);
  }
  return index.get(charId)||[];
}
export const skinIds=(manifest,chess)=>skinsFor(manifest,chess?.charId).map(s=>s.id);
export function selectedSkin(loadout,chess,manifest) {
  const entry=loadout?.[chess?.baseId||chess?.chessId];
  return skinRecord(manifest,entry?.skin,chess?.charId)?.charId ? entry.skin : null;
}
