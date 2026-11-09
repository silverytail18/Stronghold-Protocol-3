import {markProductContent} from '../../../../shared/product-content.js';
import {OVERLAY} from './records.js';
const ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {reinforcementText} from './reinforcement.js';
export const IDS=Object.freeze({leizi2:'chess_exp_leizi2_a',chen3:'chess_exp_chen3_a',monstr:'chess_rm_monstr_a'});
export const TRAITS=Object.freeze({leizi2:{name:'雷律成章'},chen3:{name:'巡狩有成'}});
export function applyNewOperators(data,batch){
 markProductContent(data,batch);
 data.chess||={};data.garrisons||={};data.tokens||={};data.assets||={};const selected=Object.values(OVERLAY.chess).filter(c=>c.expansionBatch===batch),charIds=new Set(selected.map(c=>c.charId));
 for(const raw of selected){const c=structuredClone(raw),key=Object.keys(IDS).find(k=>IDS[k]===c.baseId),t=TRAITS[key],gid='newop_'+key+(c.isGolden?'_b':'_a');if(data.chess[c.chessId]&&data.chess[c.chessId].charId!==c.charId)throw Error('New operator collision '+c.chessId);
  c.garrisonIds=t?[gid]:[];data.chess[c.chessId]=c;if(t){const desc=reinforcementText(key,c.isGolden);data.garrisons[gid]={garrisonId:gid,name:t.name,desc,descRaw:desc,eventType:'IN_BATTLE',eventTypeDesc:'专属强化',eventTypeIcon:'icon_battle',effectType:'NEW_OPERATOR_REINFORCEMENT',effectKey:'newop_'+key,owners:[c.chessId],bb:{},bbStr:{},expansionBatch:batch};}
 }
 if(batch==='rhodes-mujica-v1')for(const[id,t]of Object.entries(OVERLAY.tokens))data.tokens[id]=structuredClone(t);
 const keys={chars:charIds,skills:new Set(selected.flatMap(c=>c.skills.map(s=>s.skillId))),skillsById:new Set(selected.flatMap(c=>c.skills.map(s=>s.skillId))),modules:new Set(selected.flatMap(c=>(c.modules||[]).map(m=>m.uniEquipId))),tokens:new Set(batch==='rhodes-mujica-v1'?Object.keys(OVERLAY.tokens):[])};
 for(const[key,ids]of Object.entries(keys))for(const id of ids)if(ASSETS[key]?.[id]){data.assets[key]||={};data.assets[key][id]=structuredClone(ASSETS[key][id]);}
 for(const b of Object.values(data.bonds||{})){const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);}
 return data;
}
