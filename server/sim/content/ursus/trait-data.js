import {markProductContent} from '../../../../shared/product-content.js';
import {URSUS_TRAITS,traitId,traitDescription} from '../../../../shared/ursus-traits.js';
export function applyUrsusTraits(data){
 markProductContent(data,"ursus-expansion-v1");
 data.garrisons||={};
 for(const t of Object.values(URSUS_TRAITS))for(const elite of [false,true]){const uid=traitId(t.key,elite),id='chess_ursus_'+t.key+(elite?'_b':'_a'),c=data.chess[id];if(!c)throw Error('Missing Ursus trait owner '+id);
  c.garrisonIds=[...new Set([...(c.garrisonIds||[]),uid])];
  data.garrisons[uid]={garrisonId:uid,name:t.name,desc:traitDescription(t,elite),descRaw:traitDescription(t,elite),eventType:'IN_BATTLE',eventTypeDesc:t.event==='terminal'?'终端强化':'专属成长',eventTypeIcon:'icon_battle',effectType:'URSUS_UNIQUE',effectKey:'ursus_trait_'+t.key,battleRuneKey:null,bb:{},bbStr:{conditionkey:'character_target_inboard'},owners:[id],expansionBatch:'ursus-expansion-v1'};
 }
}
