import {kazdelTraitFor,personalGarrisonText} from '../../../../shared/kazdel-personal.js';
export function replacePersonalGarrisons(data){
 for(const c of Object.values(data.chess)){
  const t=kazdelTraitFor(c);if(!t||!c.bonds?.includes('kazdelShip'))continue;
  c.kazdelTrait=t;const gid=c.garrisonIds?.[0],old=data.garrisons[gid];
  // The configuration-only loadout catalog intentionally has no baseline garrison table.
  if(!old){if(gid&&!gid.startsWith('kz_'))continue;throw Error('Missing personal garrison '+c.chessId);}
  if(old.kazdelPersonal)continue;
  const fresh=gid.startsWith('kz_growth_'),id=fresh?gid:'kz_personal_'+c.chessId;
  const g=structuredClone(old),extra=personalGarrisonText(c),desc=fresh?extra:(old.desc||old.descRaw||'')+'\n'+extra;
  Object.assign(g,{garrisonId:id,name:t.name,desc,descRaw:desc,kazdelPersonal:true,owners:[c.chessId],expansionBatch:'kazdel-expansion-v1'});
  data.garrisons[id]=g;c.garrisonIds=[id,...c.garrisonIds.slice(1)];
 }
 return data;
}
