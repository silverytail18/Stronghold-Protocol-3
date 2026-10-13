import {applyKazdel} from '../kazdel/data.js';
// Configuration-only catalog. Never feed this into a Match, SharedPool or BattleSpec.
import {applyKjerag} from './kjerag-data.js';
import {PENGUIN_OVERLAY} from './penguin-records.js';
import {CLEMNT_OVERLAY} from './clemnt-records.js';
import {CLEMNT_ASSETS} from './clemnt-assets.js';
import {EXPANSION_OVERLAY} from './expansion-records.js';
import {PENGUIN_ASSETS} from './penguin-assets.js';
import {EXPANSION_ASSETS} from './expansion-assets.js';
import {readableContent} from './content-text.js';
import {applyRhine} from '../rhine/data.js';
import {applyRhodesMujica} from '../rhodes-mujica/data.js';
import {isMovedAngelina} from '../rhodes-mujica/moved-angelina.js';
export function buildLoadoutCatalog(base){
  const result=structuredClone({chess:base.chess||{},bonds:base.bonds||{},assets:base.assets||{}});
  for(const overlay of [PENGUIN_OVERLAY,EXPANSION_OVERLAY,CLEMNT_OVERLAY].map(readableContent)){
    for(const [id,record] of Object.entries(overlay.chess)){
      if(isMovedAngelina(record))continue;
      if(result.chess[id]&&result.chess[id].charId!==record.charId)throw Error('Loadout catalog ID collision: '+id);
      result.chess[id]={...structuredClone(record),expansionBatch:'arknights-expansion-v1'};
    }
    for(const [id,record] of Object.entries(overlay.bonds))result.bonds[id]=structuredClone(record);
  }
  for(const extra of [PENGUIN_ASSETS,EXPANSION_ASSETS,CLEMNT_ASSETS])for(const key of ['chars','bonds','skills','skillsById','modules']){
    result.assets[key]={...(result.assets[key]||{}),...structuredClone(extra[key]||{})};
  }
  // These memberships are for browsing/configuration only. Match still reads its own frozen rules.
  const memberships=[
    [PENGUIN_OVERLAY.oldMemberCharIds,'penguinShip'],
    [EXPANSION_OVERLAY.oldPenguinMembers,'penguinShip'],
    [EXPANSION_OVERLAY.oldSuiMembers,'suiShip'],
  ];
  for(const c of Object.values(result.chess))for(const [charIds,bondId]of memberships){
    if(charIds.includes(c.charId)&&!c.bonds.includes(bondId))c.bonds=[...c.bonds,bondId];
  }
  for(const b of Object.values(result.bonds)){
    const members=Object.values(result.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));
    b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);
  }
  applyKjerag(result);
  applyRhodesMujica(result);
  applyKazdel(result);
  applyRhine(result);
  return {chess:result.chess,bonds:result.bonds,assets:result.assets};
}
const catalogs=new WeakMap();
export function loadoutCatalogFor(base){if(!catalogs.has(base))catalogs.set(base,buildLoadoutCatalog(base));return catalogs.get(base);}
// A catalog preference cannot make a disabled operator part of the current match.
export function matchLoadout(entries,chess){return Object.fromEntries(Object.entries(entries||{}).filter(([id])=>Object.hasOwn(chess||{},id)));}
