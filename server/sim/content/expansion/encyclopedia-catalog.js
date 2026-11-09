import {applyIberia} from '../iberia/data.js';
import {applyUrsus} from '../ursus/data.js';
import {applyHigashi} from '../higashi/data.js';
import {applyKazdel} from '../kazdel/data.js';
import {applyRhine} from '../rhine/data.js';
// Read-only browsing catalog. Never pass it into match/simulation or data.setOverlay.
import {buildLoadoutCatalog} from './loadout-catalog.js';
import {buildExpansionData} from './expansion-data.js';
import {applyRhodesMujica} from '../rhodes-mujica/data.js';
export function buildEncyclopediaCatalog(base){
 const result=buildLoadoutCatalog(base);
 const details=applyIberia(applyUrsus(applyHigashi(applyRhine(applyKazdel(applyRhodesMujica(buildExpansionData({...base,garrisons:base.garrisons||{},tokens:{},bands:{}})))))));
 result.items=details.items;result.garrisons=details.garrisons;
 const baseBonds=base.bonds||{},baseItems=base.items||{};
 result.batches={bonds:{},items:{}};
 const batchName=id=>id==='iberia-expansion-v1'?'伊比利亚':id==='ursus-expansion-v1'?'乌萨斯':id==='higashi-expansion-v1'?'东国':id==='rhine-lab-v1'?'莱茵生命':id==='kazdel-expansion-v1'?'卡兹戴尔':id==='rhodes-mujica-v1'?'罗德岛与乐队':'原版pro';
 for(const id of Object.keys(result.bonds))if(!baseBonds[id])result.batches.bonds[id]=batchName(details.bonds[id]?.expansionBatch);
 for(const id of Object.keys(result.items))if(!baseItems[id])result.batches.items[id]=batchName(details.items[id].expansionBatch);
 return result;
}
export {encyclopediaEntries} from '../../../../shared/encyclopedia.js';
