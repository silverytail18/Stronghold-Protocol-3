import {markProductContent} from '../../../../shared/product-content.js';
import {CLEMNT_OVERLAY} from './clemnt-records.js';
const CLEMNT_ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
export const CLEMNT='chess_exp_clemnt_a';
export function applyClemnt(data){
 markProductContent(data,"arknights-expansion-v1");
 const o=structuredClone(CLEMNT_OVERLAY);
 for(const key of ['chess','garrisons']){data[key]||={};for(const [id,r]of Object.entries(o[key])){
  if(data[key][id]&&data[key][id].expansionBatch!==o.id)throw Error('Clementia ID collision '+id);
  data[key][id]=r;
 }}
 data.assets||={};for(const [key,records]of Object.entries(CLEMNT_ASSETS))data.assets[key]={...data.assets[key],...structuredClone(records)};
 return data;
}
