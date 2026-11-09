// Built-in, audited product content. No external scripts or old FX runtime is loaded.
import PENGUIN from './expansion/penguin-kits.js';import NIAN from './expansion/nian-shu-kits.js';import CLEMNT from './expansion/clemnt-kits.js';
import LING,{TOKEN_KITS as LING_TOKENS} from './expansion/ling-kits.js';
import UPSTREAM_AGLNA from './kits/ops/op-aglna2.js';
import RHODES from './rhodes-mujica/kits.js';import RHINE,{TOKEN_KITS as RHINE_TOKENS} from './rhine/kits.js';
import KAZDEL from './kazdel/kits.js';import HIGASHI from './higashi/kits.js';import URSUS from './ursus/kits.js';import IBERIA from './iberia/kits.js';
import NEW,{TOKEN_KITS as NEW_TOKENS} from './new-operators/kits.js';
import {lighthouseKit} from './iberia/lighthouse.js';import {LIGHTHOUSE} from '../../../shared/iberia-lighthouse.js';
import * as PENGUIN_BATTLE from './expansion/penguin-battle.js';import * as SUI from './expansion/sui-battle.js';import * as KJERAG from './expansion/kjerag-battle.js';
import * as RHODES_BATTLE from './rhodes-mujica/battle.js';import * as RHINE_BATTLE from './rhine/battle.js';import * as KAZDEL_BATTLE from './kazdel/battle.js';
import * as HIGASHI_BATTLE from './higashi/battle.js';import * as URSUS_BATTLE from './ursus/battle.js';import * as IBERIA_BATTLE from './iberia/battle.js';import * as NEW_BATTLE from './new-operators/traits.js';
import {registerMeta as registerPenguinMeta} from './expansion/penguin-meta.js';import {registerMeta as registerProMeta} from './expansion/expansion-meta.js';
import {registerMeta as registerRhodesMeta} from './rhodes-mujica/meta.js';import {registerMeta as registerKazdelMeta} from './kazdel/meta.js';
import {registerMeta as registerRhineMeta} from './rhine/meta.js';import {registerMeta as registerHigashiMeta} from './higashi/meta.js';import {registerMeta as registerUrsusMeta} from './ursus/meta.js';import {registerMeta as registerIberiaMeta} from './iberia/meta.js';

const PRO='arknights-expansion-v1',RI='rhodes-mujica-v1';
// The pro roster is custom, but this operator's skill/talent/marker behavior is the upstream implementation.
const AGLNA={chess_exp_aglna2_a:UPSTREAM_AGLNA.char_1015_aglna2};
const enabled=(raw,ids)=>ids.some(id=>raw?.config?.productContent?.ids?.includes(id));
const KITS={...PENGUIN,...NIAN,...CLEMNT,...LING,...AGLNA,...RHODES,...RHINE,...KAZDEL,...HIGASHI,...URSUS,...IBERIA,...NEW};
export const PRODUCT_KITS=Object.freeze(KITS);
export function productKitOf(def){
  if(!(def?.raw?.expansionBatch||def?.expansionBatch))return undefined;
  return KITS[def.baseId]||KITS[def.id]||KITS[String(def.id||'').replace(/_b$/,'_a')];
}
export function productTokenKit(def,raw){
  if(enabled(raw,[PRO])&&LING_TOKENS[def.id])return LING_TOKENS[def.id];
  if(enabled(raw,['rhine-lab-v1'])&&RHINE_TOKENS[def.id])return RHINE_TOKENS[def.id];
  if(enabled(raw,[RI])&&NEW_TOKENS[def.id])return NEW_TOKENS[def.id];
  if(enabled(raw,['iberia-expansion-v1'])&&def.id===LIGHTHOUSE)return()=>lighthouseKit();
  return undefined;
}
const moduleFor=(ids,module)=>({install(battle){if(enabled(battle.data.raw,ids))module.install?.(battle);}});
export const PRODUCT_MODULES=[
  ['product:penguin',moduleFor([PRO],PENGUIN_BATTLE)],['product:sui',moduleFor([PRO],SUI)],['product:kjerag',moduleFor([PRO],KJERAG)],
  ['product:rhodes',moduleFor([RI],RHODES_BATTLE)],['product:rhine',moduleFor(['rhine-lab-v1'],RHINE_BATTLE)],['product:kazdel',moduleFor(['kazdel-expansion-v1'],KAZDEL_BATTLE)],
  ['product:higashi',moduleFor(['higashi-expansion-v1'],HIGASHI_BATTLE)],['product:ursus',moduleFor(['ursus-expansion-v1'],URSUS_BATTLE)],['product:iberia',moduleFor(['iberia-expansion-v1'],IBERIA_BATTLE)],['product:new-operators',moduleFor([PRO,RI],NEW_BATTLE)],
];
function scoped(registry,ids){
  const facade=Object.create(registry);
  facade.register=(key,spec)=>{
    const previous=registry.get(key)||{},current=typeof spec==='function'?{run:spec}:spec;
    const merged={...previous,...current};
    for(const name of new Set([...Object.keys(previous),...Object.keys(current)]))if(typeof current[name]==='function'||typeof previous[name]==='function')merged[name]=function(ctx,...args){return(enabled(ctx?.gd?.raw,ids)?current[name]:previous[name])?.call(this,ctx,...args);};
    registry.register(key,merged);return facade;
  };
  return facade;
}
export function registerProductMetaBefore(registry){
  registerPenguinMeta(scoped(registry,[PRO]));registerProMeta(scoped(registry,[PRO]));registerRhodesMeta(scoped(registry,[RI]));registerKazdelMeta(scoped(registry,['kazdel-expansion-v1']));
}
export function registerProductMetaAfter(registry){
  KJERAG.registerMeta(scoped(registry,[PRO]));
  registerRhineMeta(scoped(registry,['rhine-lab-v1']));registerHigashiMeta(scoped(registry,['higashi-expansion-v1']));registerUrsusMeta(scoped(registry,['ursus-expansion-v1']));registerIberiaMeta(scoped(registry,['iberia-expansion-v1']));
}
