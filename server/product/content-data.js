import {getData} from '../data.js';
import {TEST_CONTENT} from '../test-content.js';
import {DEFAULT_VERSION} from '../../shared/versions.js';
import {operatorConflicts,conflictReason} from './operator-conflicts.js';
import {applyContentEntries,resolveReferenceOperators,preferProductPresetsForDiy} from './content-operators.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
// Apply only fields the built-in overlay changes. Each official version keeps its own unmodified records and rules.
function patch(target,before,after){
  if(same(before,after))return target;
  if(!object(before)||!object(after))return structuredClone(after);
  const out=object(target)?{...target}:{};
  for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
    if(same(before[key],after[key]))continue;
    if(!Object.hasOwn(after,key))delete out[key];else out[key]=patch(out[key],before[key],after[key]);
  }
  return out;
}
function composeOverlay(base,ids,{version=DEFAULT_VERSION,mode='coop'}={},sources=null){
  const entries=TEST_CONTENT.filter(entry=>ids.includes(entry.id));
  if(entries.length!==ids.length)throw Error('未知测试包');
  if(version===DEFAULT_VERSION){const data=structuredClone(base);applyContentEntries(data,entries,mode,sources);data.config.productContent={...data.config.productContent,catalog:2,ids:entries.map(e=>e.id),...(data.lateInvestment?{lateInvestment:data.lateInvestment}:{})};return data;}
  const canonical=getData(),overlay=structuredClone(canonical);
  const canonicalSources=sources&&new Map();
  applyContentEntries(overlay,entries,mode,canonicalSources);
  const remap=new Map(),sourceOf=new Map();
  for(const [id,record]of Object.entries(canonical.chess)){
    const found=Object.entries(base.chess).find(([,r])=>r.charId===record.charId&&r.isGolden===record.isGolden&&r.visible===record.visible&&!r.isDiy);
    const mapped=found?.[0]||(!base.chess[id]?id:'chess_product_'+id.slice(6));remap.set(id,mapped);sourceOf.set(mapped,id);
  }
  const translate=value=>typeof value==='string'?remap.get(value)||value:Array.isArray(value)?value.map(translate):object(value)?Object.fromEntries(Object.entries(value).map(([key,v])=>[remap.get(key)||key,translate(v)])):value;
  const data=structuredClone(base);
  for(const table of Object.keys(overlay)){
    if(['assets','local-assets','local-fx','chess'].includes(table)||same(canonical[table],overlay[table]))continue;
    if(table==='tokens'){
      for(const[id,record]of Object.entries(overlay.tokens||{})){
        if(same(canonical.tokens?.[id],record))continue;
        const translated=translate(record),prior=data.tokens[id];
        data.tokens[id]=patch(prior,translate(canonical.tokens?.[id]),translated);
        if(prior?.variants&&translated.variants)data.tokens[id].variants={...prior.variants,...data.tokens[id].variants,...translated.variants};
      }
    }else data[table]=patch(data[table],translate(canonical[table]),translate(overlay[table]));
  }
  for(const [id,record]of Object.entries(overlay.chess)){
    const before=canonical.chess[id];if(same(before,record))continue;
    const actual=remap.get(id)||id,translated=translate(record);
    data.chess[actual]=data.chess[actual]?patch(data.chess[actual],before?translate(before):undefined,translated):structuredClone(translated);
    if(before){const rec=data.chess[actual];rec.productSourceId=String(before.baseId||id).replace(/_b$/,'_a');if(!base.chess[actual]){rec.kitRef=rec.productSourceId;rec.chessId=actual;rec.baseId=actual.replace(/_b$/,'_a');rec.goldenId=actual.replace(/_a$/,'_b');}}
  }
  // Imported later-period operators may reference official covenants absent from an earlier period.
  // Add only those referenced definitions; do not replace the earlier period's existing covenant rules.
  for(const record of Object.values(data.chess))for(const id of record.bonds||[])if(!data.bonds[id]){
    const bond=overlay.bonds[id]||canonical.bonds[id];
    if(!bond)throw Error('测试包引用未知盟约 '+id);
    data.bonds[id]=translate(bond);
  }
  // Visible membership lists are views of this actual roster, never dangling IDs of another period.
  for(const bond of Object.values(data.bonds)){const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(bond.bondId));bond.members=members.map(c=>c.chessId);bond.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);}
  data.assets=canonical.assets;
  data.config.productContent={catalog:2,ids:entries.map(e=>e.id),canonicalIds:Object.fromEntries(sourceOf),...(data.lateInvestment?{lateInvestment:data.lateInvestment}:{})};
  if(sources)for(const[id,packages]of canonicalSources)sources.set(remap.get(id)||id,packages);
  return data;
}

/** Playable compositions retain the reviewed admission boundary; a catalogue never certifies native kit reuse. */
export function composeProductData(base,ids,options={}){
  for(const id of ids){
    const reason=conflictReason(operatorConflicts(id,options.version||DEFAULT_VERSION,{data:base}));
    if(reason)throw Object.assign(Error(reason),{status:409});
  }
  return preferProductPresetsForDiy(base,composeOverlay(base,ids,options));
}

/** Full browsing catalogue, with one native-first loadout target per added official identity. */
export function composeProductReferenceData(base,ids,options={}){
  const sources=new Map(),data=composeOverlay(base,ids,options,sources);
  return resolveReferenceOperators(base,data,sources);
}
