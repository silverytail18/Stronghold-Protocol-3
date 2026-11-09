import {getVersionData} from '../data.js';
import {VERSIONS,DEFAULT_VERSION} from '../../shared/versions.js';
import {composeProductReferenceData} from './content-data.js';
import {withMasteryItem} from '../../shared/skill-mastery.js';
const IDS=['arknights-expansion-v1','rhodes-mujica-v1','kazdel-expansion-v1','rhine-lab-v1','higashi-expansion-v1','ursus-expansion-v1','iberia-expansion-v1'];
const cache=new Map();
export function referenceCatalog(version=DEFAULT_VERSION){
  if(!VERSIONS.some(v=>v.id===version))throw Object.assign(Error('游戏版本无效'),{status:400});
  if(!cache.has(version)){
    const data=withMasteryItem(composeProductReferenceData(getVersionData(version),IDS,{version,mode:'solo'}));
    cache.set(version,{version,revision:3,sourcePackages:IDS,values:Object.fromEntries(['chess','bonds','items','bands','tokens','garrisons','backups'].map(name=>[name,data[name]||{}]))});
  }
  return cache.get(version);
}
