import {useEffect,useReducer} from '../../vendor/hooks.module.js';
import {data} from '../data.js';
import {appArtPaths} from '../appResources.js';
let catalog=null,pending=null,inputs=null;
const listeners=new Set(),notify=()=>{for(const fn of listeners)fn();};
export const getLoadoutCatalog=()=>catalog;
export async function loadLoadoutCatalog(){
  if(pending)return pending;
  pending=(async()=>{
    await data.loadAll('chess','bonds','assets');
    const base=Object.fromEntries(['chess','bonds','assets'].map(key=>[key,data.baseline(key)]));
    if(!base.chess||!base.bonds||!base.assets)throw Error('干员调配目录尚未载入，请重新打开客户端');
    if(inputs&&Object.keys(base).every(key=>inputs[key]===base[key]))return catalog;
    const {buildLoadoutCatalog}=await import('/sim/content/expansion/loadout-catalog.js');
    catalog=appArtPaths(buildLoadoutCatalog(base));inputs=base;notify();return catalog;
  })();
  try{return await pending;}finally{pending=null;}
}
export function useLoadoutCatalog(){
  const [,render]=useReducer(n=>n+1,0);
  useEffect(()=>{
    let live=true;const update=()=>{if(live)render();};listeners.add(update);
    // The first load can finish between render and this effect subscribing. Cached loads must also refresh this view.
    const load=()=>{void loadLoadoutCatalog().then(update).catch(error=>{console.warn('[loadout catalog]',error.message);update();});};
    const off=data.subscribe(name=>{if(['chess','bonds','assets'].includes(name))load();});load();
    return()=>{live=false;listeners.delete(update);off();};
  },[]);
  return catalog;
}
