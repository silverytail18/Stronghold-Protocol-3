import {useEffect,useReducer} from '../../vendor/hooks.module.js';
import {data as runtimeData,buildIndex} from '../data.js';
import {store} from '../store.js';
import {shownVersion,DEFAULT_VERSION} from '../versions.js';
import {cosmetics} from '../cosmetics.js';
const catalogs=new Map(),pending=new Map(),listeners=new Set();
let referenceAssets=null,assetsPending=null;
async function localReferenceAssets(){
  if(referenceAssets)return referenceAssets;
  if(!assetsPending)assetsPending=(async()=>{try{const r=await fetch('/data/assets.json');if(r.ok)referenceAssets=await r.json();}catch{/* Keep the catalogue usable while the local store retries. */}finally{assetsPending=null;}return referenceAssets;})();
  return assetsPending;
}
const indexes=new WeakMap();
const indexOf=(name,value)=>{let idx=indexes.get(value);if(!idx){idx=buildIndex(name,value);indexes.set(value,idx);}return idx;};
const version=()=>shownVersion(store.get())||DEFAULT_VERSION;
const reference=()=>!store.get().room?.inMatch?catalogs.get(version()):null;
export const referenceData=new Proxy(runtimeData,{get(target,key){
  if(key==='get')return name=>name==='assets'&&reference()&&referenceAssets?cosmetics.apply(referenceAssets):reference()?.values[name]??target.get(name);
  if(key==='lookup')return(name,id)=>{const value=reference()?.values[name];return value?indexOf(name,value).get(String(id))||null:target.lookup(name,id);};
  if(key==='list')return name=>{const value=reference()?.values[name];return value?[...indexOf(name,value).values()]:target.list(name);};
  if(key==='contentId')return()=>{const ref=reference();return target.contentId()+(ref?':reference:'+ref.version+':'+ref.revision:'');};
  return target[key];
}});
async function load(id=version(),force=false){
  if(catalogs.has(id))return;if(pending.has(id))return pending.get(id);if(!force&&store.get().room?.inMatch)return;
  const promise=(async()=>{try{const r=await fetch('/product/catalog?version='+encodeURIComponent(id));if(!r.ok)throw Error('Content catalogue unavailable');const c=await r.json();if(c.version!==id||!c.values)throw Error('Content catalogue mismatch');await localReferenceAssets();catalogs.set(id,c);if(typeof globalThis.CustomEvent==='function')globalThis.dispatchEvent?.(new CustomEvent('product:catalog-ready'));for(const fn of listeners)fn();}catch(error){console.warn('[catalog]',error.message);}finally{pending.delete(id);}})();
  pending.set(id,promise);return promise;
}
export function useReferenceCatalog(){const[,render]=useReducer(x=>x+1,0);useEffect(()=>{const fn=()=>{void load();render();};listeners.add(fn);void load();const off=store.subscribe(()=>{void load();});return()=>{listeners.delete(fn);off();};},[]);return reference();}
export async function ensureReferenceCatalog(id=version()){await load(id,true);return catalogs.get(id)||null;}
