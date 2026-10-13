// Reuse the pinned original records/kit/assets; availability belongs exclusively to the RI batch.
import {EXPANSION_OVERLAY} from '../expansion/expansion-records.js';
import {EXPANSION_ASSETS} from '../expansion/expansion-assets.js';
import {readableContent} from '../expansion/content-text.js';
const SOURCE=readableContent(EXPANSION_OVERLAY);
export const ANGELINA='chess_exp_aglna2_a';
export const isMovedAngelina=c=>c?.charId==='char_1015_aglna2';
export function moveAngelina(overlay,assets){
 for(const [id,c]of Object.entries(SOURCE.chess))if(isMovedAngelina(c)){
  overlay.chess[id]={...structuredClone(c),expansionBatch:overlay.id,bonds:[...c.bonds]};
  for(const gid of c.garrisonIds||[])overlay.garrisons[gid]={...structuredClone(SOURCE.garrisons[gid]),expansionBatch:overlay.id};
  for(const s of c.skills){assets.skills[s.iconId]=EXPANSION_ASSETS.skills[s.iconId];assets.skillsById[s.skillId]=EXPANSION_ASSETS.skillsById[s.skillId];}
  for(const m of c.modules||[])assets.modules[m.uniEquipId]=EXPANSION_ASSETS.modules[m.uniEquipId];
 }
 assets.chars.char_1015_aglna2=structuredClone(EXPANSION_ASSETS.chars.char_1015_aglna2);
 return overlay;
}
