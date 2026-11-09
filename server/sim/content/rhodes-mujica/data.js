import {markProductContent} from '../../../../shared/product-content.js';
import {applyNewOperators} from '../new-operators/data.js';
import {OVERLAY} from './records.js';
const ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {readableRhodes} from './content-text.js';

import {applyOldRhodesGrowth} from './old-growth.js';

import {applyPersonalRecords} from './personal-text.js';
export const RI='rhodesShip',GIRL='girlbandShip',BATCH='rhodes-mujica-v1';
export const AMIYA='chess_rm_amiya_a',DOLRIS='chess_rm_dolris_a',AMORIS='chess_rm_amoris_a',MORTIS='chess_rm_mortis_a',TMORIS='chess_rm_tmoris_a',OBLVNS='chess_rm_oblvns_a';
export const MONSTR='chess_rm_monstr_a';
export const KALTS2='chess_rm_kalts2_a',NEARL='chess_rm_nearl_a';
export const GIRLS=[DOLRIS,AMORIS,MORTIS,TMORIS,OBLVNS],NEW=[AMIYA,...GIRLS,KALTS2,NEARL,MONSTR];
export function applyRhodesMujica(data){
 markProductContent(data,"rhodes-mujica-v1");
 const assets=structuredClone(ASSETS),o=readableRhodes(OVERLAY);
 data.assets||={};
 for(const key of ['chess','items','bonds','bands','garrisons','tokens']){data[key]||={};for(const[id,r]of Object.entries(o[key])){if(data[key][id]&&data[key][id].expansionBatch!==BATCH)throw Error('Rhodes/Mujica ID collision '+id);data[key][id]=r;}}
 for(const c of Object.values(data.chess))if(o.oldMembers.includes(c.name)&&!c.bonds.includes(RI)){
  if(c.bonds.length!==1)throw Error('Old member no longer single-bond: '+c.chessId);c.bonds=[...c.bonds,RI];
 }
 applyNewOperators(data,BATCH);
 applyOldRhodesGrowth(data);
 applyPersonalRecords(data);
 for(const b of Object.values(data.bonds)){const m=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds.includes(b.bondId));b.members=m.map(c=>c.chessId);b.visibleMembers=m.filter(c=>c.visible).map(c=>c.chessId);}
 for(const[key,r]of Object.entries(assets))data.assets[key]={...(data.assets[key]||{}),...structuredClone(r)};
 data.assets.items={...(data.assets.items||{}),rm_terminal:null};
 return data;
}
export const buildRhodesMujicaData=base=>applyRhodesMujica(structuredClone(base));
