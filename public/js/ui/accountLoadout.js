import {loadPref,savePref} from '../store.js';
import {loadoutStore,migrateSettings,refreshViews} from './loadoutSync.js';
import {charKeyMap,entriesToChar,toStored} from './loadoutModel.js';
import {skinsStore,setSkins,SKINS_KEY} from './skins.js';
import {accountChoices,accountOps,accountSkins,entrySkins} from '../../../shared/account-loadout.js';
import {ensureReferenceCatalog} from './referenceCatalog.js';
import {toastError} from './toasts.js';
import {t} from '../../../shared/i18n.js';
const clone=value=>structuredClone(value),key=id=>'loadout.account.'+id,fields=['byChar','ops','skins'];
const empty=()=>({byChar:{},ops:{},skins:{}});
let owner=null,generation=0,ready=false,applying=false,base=empty(),observed='',timer=null,focusTimer=null,queue=Promise.resolve();
const canonical=value=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const same=(a,b)=>canonical(a)===canonical(b);
const normalise=value=>({byChar:accountChoices(value?.byChar),ops:accountOps(value?.ops),skins:accountSkins(value?.skins)});
const snapshot=()=>normalise({...loadoutStore.get(),skins:skinsStore.get()[SKINS_KEY]});
function changes(before,next,current){const out=clone(current||{});for(const id of new Set([...Object.keys(before||{}),...Object.keys(next||{})]))if(!same(before?.[id],next?.[id])){if(Object.hasOwn(next||{},id))out[id]=clone(next[id]);else delete out[id];}return out;}
function choiceChanges(before,next,current){
  const out=clone(current||{});
  for(const id of new Set([...Object.keys(before||{}),...Object.keys(next||{})])){
    if(same(before?.[id],next?.[id]))continue;
    const row=changes(before?.[id],next?.[id],out[id]);
    if(Object.keys(row).length)out[id]=row;else delete out[id];
  }return out;
}
const merge=(before,next,current)=>Object.fromEntries(fields.map(f=>[f,(f==='skins'?changes:choiceChanges)(before[f],next[f],current[f])]));
const valid=(id,gen)=>owner===id&&generation===gen;
async function request(method='GET',body,isValid=()=>true){
  for(let attempt=0;;attempt++){
    if(!isValid())throw Object.assign(Error('account changed'),{cancelled:true});
    const text=body?JSON.stringify(body):null;
    const response=await fetch('/product/loadout',{method,cache:'no-store',...(text?{headers:{'Content-Type':'application/json'},body:text,keepalive:text.length<60000}:{})}),value=await response.json();
    if(response.ok)return value;
    if(response.status===429&&attempt<2){await new Promise(resolve=>setTimeout(resolve,Math.min(60,Math.max(1,Number(response.headers.get('Retry-After'))||2))*1000));continue;}
    throw Object.assign(Error(value.error),{status:response.status});
  }
}
function retainLegacyCache(id,value){
  if(!value)return;
  try{const recovery=key(id)+'.legacy';if(loadPref(recovery,null)===null)savePref(recovery,value);}catch{/* Recovery must not prevent loading the authoritative account. */}
}
function cache(dirty){if(!owner)return;try{savePref(key(owner),{snapshot:snapshot(),base:clone(base),dirty});savePref('loadout.accountOwner',owner);savePref('loadout',toStored(loadoutStore.get().byChar,loadoutStore.get().ops));}catch{/* The server copy remains usable without local storage. */}}
function apply(value){applying=true;try{const clean=normalise(value);loadoutStore.set({byChar:clean.byChar,ops:clean.ops,entries:{}});setSkins(clean.skins);refreshViews();observed=canonical(snapshot());}finally{applying=false;}}
async function legacyCloud(cloud){
  let byChar=cloud.byChar;
  if(!byChar){
    const entries=Object.fromEntries(Object.entries(cloud.entries).filter(([id])=>!id.startsWith('char_')));
    let migrated={};
    if(Object.keys(entries).length){const catalogue=await ensureReferenceCatalog('act2autochess');if(!catalogue)throw Error(t('调配目录暂时无法读取，未覆盖账号数据'));const map=charKeyMap(Object.values(catalogue.values.chess));migrated=entriesToChar(entries,id=>map.toChar.get(id),id=>map.toChar.has(id));}
    byChar={...migrated,...accountChoices(cloud.entries)};
  }
  return normalise({byChar,ops:cloud.ops,skins:cloud.skins??entrySkins(cloud.entries)});
}
export async function bindAccountLoadout(account){
  if(!account?.accountId){if(owner)unbindAccountLoadout();return;}
  const id=account.accountId,gen=++generation,previousOwner=loadPref('loadout.accountOwner',null),stored=loadPref(key(id),null);
  ready=false;owner=id;clearTimeout(timer);clearTimeout(focusTimer);await migrateSettings();
  if(!valid(id,gen))return;
  const legacy=previousOwner===null||previousOwner===id?snapshot():empty();
  const cloud=await request('GET',undefined,()=>valid(id,gen));if(!valid(id,gen)||cloud.accountId!==id)return;
  const remote=await legacyCloud(cloud);if(!valid(id,gen))return;
  base=clone(remote);let next=remote;
  if(stored?.dirty&&stored.base&&stored.snapshot){
    retainLegacyCache(id,stored);
    const before=normalise(stored.base),pending=normalise(stored.snapshot);
    // Pre-unification cache records did not own skins. They cannot erase server-side choices.
    if(!Object.hasOwn(stored.snapshot,'skins'))pending.skins=before.skins=remote.skins;
    next=merge(before,pending,remote);
  }else{
    if(!cloud.byChar)next={...next,byChar:{...legacy.byChar,...remote.byChar},ops:{...legacy.ops,...remote.ops}};
    if(cloud.skins===undefined&&!Object.keys(entrySkins(cloud.entries)).length)next={...next,skins:legacy.skins};
  }
  apply(next);ready=true;cache(!same(next,base));
  if(!cloud.byChar||cloud.skins===undefined||!same(next,base))await flushAccountLoadout({initialize:true});
}
export function unbindAccountLoadout(){
  if(owner&&ready)cache(!same(snapshot(),base));
  ready=false;owner=null;generation++;clearTimeout(timer);clearTimeout(focusTimer);base=empty();apply(empty());
}
export async function flushAccountLoadout({initialize=false}={}){
  clearTimeout(timer);const id=owner,gen=generation;
  const job=queue.catch(()=>{}).then(async()=>{
    if(!ready||!valid(id,gen))return;
    const next=snapshot(),prior=clone(base);if(!initialize&&same(prior,next))return;
    for(let attempt=0;attempt<3;attempt++){
      const cloud=await request('GET',undefined,()=>valid(id,gen));if(!valid(id,gen)||cloud.accountId!==id)return;
      const remote=await legacyCloud(cloud),merged=merge(prior,next,remote);
      try{
        const saved=await request('PUT',{accountId:id,revision:cloud.revision,entries:cloud.entries,...merged},()=>valid(id,gen));
        if(!valid(id,gen))return;
        const authoritative=await legacyCloud(saved),current=snapshot();base=authoritative;
        apply(merge(next,current,authoritative));cache(!same(snapshot(),base));return;
      }catch(error){if(error.status!==409||attempt===2)throw error;}
    }
  });queue=job.catch(()=>{});return job;
}
export async function refreshAccountLoadout(){
  await flushAccountLoadout();const id=owner,gen=generation;
  const job=queue.catch(()=>{}).then(async()=>{
    if(!ready||!valid(id,gen))return;
    const cloud=await request('GET',undefined,()=>valid(id,gen));if(!valid(id,gen)||cloud.accountId!==id)return;
    const remote=await legacyCloud(cloud),next=merge(base,snapshot(),remote);base=remote;apply(next);cache(!same(next,base));
  });queue=job.catch(()=>{});return job;
}
const reportError=error=>{if(!error.cancelled)toastError(error);};
function edited(){
  if(!ready||applying||!owner||loadoutStore.get().byChar===null)return;
  const next=canonical(snapshot());if(next===observed)return;observed=next;cache(true);clearTimeout(timer);timer=setTimeout(()=>{flushAccountLoadout().catch(reportError);},500);
}
loadoutStore.subscribe((s,prev)=>{edited();if(ready&&prev.open&&!s.open)void flushAccountLoadout().catch(reportError);});
skinsStore.subscribe(edited);
function foreground(){
  if(!ready||!owner||globalThis.document?.visibilityState==='hidden')return;
  clearTimeout(focusTimer);focusTimer=setTimeout(()=>{refreshAccountLoadout().catch(reportError);},200);
}
globalThis.addEventListener?.('focus',foreground);
globalThis.addEventListener?.('online',foreground);
globalThis.document?.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){if(ready)void flushAccountLoadout().catch(reportError);}else foreground();});
