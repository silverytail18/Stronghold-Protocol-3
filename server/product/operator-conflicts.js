import {getVersionData} from '../data.js';
import {PRODUCT_OPERATOR_IDENTITIES} from '../../shared/product-operator-identities.js';

/** Only a version's real roster conflicts. A DIY/stand-in reference implementation is not a roster admission. */
export function operatorConflicts(packageId,version,{data=getVersionData(version),identities=PRODUCT_OPERATOR_IDENTITIES}={}){
  const roster=new Set(Object.values(data.chess||{}).filter(c=>c.visible&&!c.isDiy&&!c.isStandIn&&!c.standInFor&&!c.expansionBatch).map(c=>c.charId));
  return (identities[packageId]||[]).filter(c=>roster.has(c.charId)).map(c=>({...c}));
}
export function conflictReason(rows){return rows.length?'本体已包含干员：'+rows.map(c=>c.name||c.charId).join('、')+'；当前版本禁止启用此测试包':null;}
