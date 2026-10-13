// Match-local native additions; original traits and grants remain intact.
import {OLD_RI_GROWTH as G} from './balance.js';
const names={波登可:'podenco',休谟斯:'humus'},RI='rhodesShip',batch='rhodes-mujica-v1';
export function applyOldRhodesGrowth(data){
 for(const c of Object.values(data.chess)){const key=names[c.name];if(!key||!c.bonds.includes(RI))continue;
  const i=+c.isGolden,v=i?2:1,suffix=i?'b':'a',id='rm_old_'+key+'_'+suffix;
  const g={garrisonId:id,expansionBatch:batch,name:'罗德岛行动积累',owners:[],bb:{},bbStr:{}};
  if(key==='podenco')Object.assign(g,{eventType:'SERVER_PREP_FIN',effectKey:'rm_growth_podenco',desc:'休整结束，本人在作战区且罗德岛激活时，额外使罗德岛+'+G.prep*v+'层；同名每轮只取最高精锐档。原有特质保留。',bbStr:{conditionkey:'character_target_inboard'}});
  else Object.assign(g,{eventType:'IN_BATTLE',effectType:'ADD_BOND',effectKey:'act1autochess_gar_event_selfkillenemy',desc:'每个人击倒2名敌人，已激活罗德岛+'+G.humus[i]+'层；每场至多'+G.humusCap[i]+'层，同名共享。工程炮击不算个人击倒，原有特质保留。',bb:{bond_add_count:G.humus[i],max_add_count_per_battle:G.humusCap[i],check_cnt:2},bbStr:{bond_type:'bond_by_id',bond_id:RI,bond_add_type:'by_count'}});
  g.owners=[...new Set([...(data.garrisons[id]?.owners||[]),c.chessId])];data.garrisons[id]=g;
  if(!c.garrisonIds.includes(id))c.garrisonIds=[...c.garrisonIds,id];
 }return data;
}

