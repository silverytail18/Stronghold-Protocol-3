import {markProductContent} from '../../../../shared/product-content.js';
import {PENGUIN_OVERLAY} from './penguin-records.js';
const PENGUIN_ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {readableContent} from './content-text.js';
export const CROISSANT='chess_exp_croissant_a';
export const SORA='chess_exp_sora_a';
export const PENGUIN='penguinShip';
/** Apply only to a caller-owned per-match data clone. Never changes the overlay or baseline. */
export function applyPenguin(data){
 markProductContent(data,"arknights-expansion-v1");
  const o=readableContent(PENGUIN_OVERLAY);
  for(const id of Object.keys(o.chess))if(data.chess[id]&&data.chess[id].charId!==o.chess[id].charId)throw new Error(`Content ID collision: ${id}`);
  Object.assign(data.chess,o.chess);Object.assign(data.garrisons,o.garrisons);Object.assign(data.bonds,o.bonds);
  data.assets ||= {};
  for(const key of ['chars','bonds','skills','skillsById','modules'])data.assets[key]={...(data.assets[key]||{}),...structuredClone(PENGUIN_ASSETS[key])};
  for(const c of Object.values(data.chess))if(o.oldMemberCharIds.includes(c.charId)&&!c.bonds.includes(PENGUIN))c.bonds=[...c.bonds,PENGUIN];
  for(const id of [PENGUIN,'steadShip','skillfulShip']){
    const b=data.bonds[id];
    const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(id));
    b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);
  }
  return data;
}
export const buildPenguinData=baseline=>applyPenguin(structuredClone(baseline));
