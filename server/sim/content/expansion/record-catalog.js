// History-only fallback for records created before display snapshots were saved.
import {buildExpansionData} from './expansion-data.js';
import {applyRhodesMujica} from '../rhodes-mujica/data.js';
import {applyKazdel} from '../kazdel/data.js';
import {applyRhine} from '../rhine/data.js';
import {recordCatalog} from '../../../../shared/record-content.js';
export function buildRecordCatalog(base,snapshot=null){
 const result=applyRhine(applyKazdel(applyRhodesMujica(buildExpansionData({...base,garrisons:base.garrisons||{},tokens:{}}))));
 return recordCatalog({chess:result.chess,bonds:result.bonds,items:result.items,bands:result.bands,assets:result.assets},snapshot);
}
