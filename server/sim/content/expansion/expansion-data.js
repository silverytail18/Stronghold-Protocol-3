import {applyKjerag} from './kjerag-data.js';
import {applyPenguin} from './penguin-data.js';
import {applyClemnt} from './clemnt-data.js';
import {EXPANSION_OVERLAY} from './expansion-records.js';
import {EXPANSION_ASSETS} from './expansion-assets.js';
import {readableContent} from './content-text.js';
import {isMovedAngelina} from '../rhodes-mujica/moved-angelina.js';
export const NIAN='chess_exp_nian_a',LING='chess_exp_ling_a',SHU='chess_exp_shu_a',AGLNA2='chess_exp_aglna2_a',SUI='suiShip';
/** Only a caller-owned match copy may be passed; baseline tables and player storage are never modified. */
export function applyExpansion(data){
  applyPenguin(data);applyClemnt(data);const o=readableContent(EXPANSION_OVERLAY);
  for(const [id,c]of Object.entries(o.chess))if(isMovedAngelina(c)){delete o.chess[id];for(const gid of c.garrisonIds||[])delete o.garrisons[gid];}
  for(const key of ['chess','garrisons','tokens','bands','bonds']){data[key]||={};for(const [id,rec]of Object.entries(o[key])){if(data[key][id]&&data[key][id].expansionBatch!==o.id)throw new Error(`Expansion ID collision: ${id}`);rec.expansionBatch=o.id;data[key][id]=rec;}}
  for(const c of Object.values(data.chess)){
    for(const [ids,bond]of [[o.oldSuiMembers,SUI],[o.oldPenguinMembers,'penguinShip']])if(ids.includes(c.charId)&&!c.bonds.includes(bond))c.bonds=[...c.bonds,bond];
  }
  for(const b of Object.values(data.bonds)){const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);}
  for(const[key,val]of Object.entries(EXPANSION_ASSETS))data.assets[key]={...(data.assets[key]||{}),...structuredClone(val)};
  applyKjerag(data);
  return data;
}
export const buildExpansionData=base=>applyExpansion(structuredClone(base));
