import {CLEMNT_OVERLAY} from './clemnt-records.js';
import {CLEMNT_ASSETS} from './clemnt-assets.js';
export const CLEMNT='chess_exp_clemnt_a';
export function applyClemnt(data){
 const o=structuredClone(CLEMNT_OVERLAY);
 for(const key of ['chess','garrisons']){data[key]||={};for(const [id,r]of Object.entries(o[key])){
  if(data[key][id]&&data[key][id].expansionBatch!==o.id)throw Error('Clementia ID collision '+id);
  data[key][id]=r;
 }}
 data.assets||={};for(const [key,records]of Object.entries(CLEMNT_ASSETS))data.assets[key]={...data.assets[key],...structuredClone(records)};
 return data;
}
