// The private account archive spans game versions; room-specific eligibility is checked separately.
import {isPotential,isCultivate} from './potential.js';
export const ACCOUNT_LOADOUT_LIMIT=1000;
const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_\-.:]{1,64}$/.test(v);
const charId=v=>id(v)&&v.startsWith('char_');
const opsId=v=>typeof v==='string'&&/^char_[A-Za-z0-9_]{1,60}$/.test(v);
const skill=v=>Number.isInteger(v)&&v>=0&&v<=9;
const skinId=v=>typeof v==='string'&&/^[A-Za-z0-9_@#+.:-]{1,128}$/.test(v);
export const accountEntriesValid=value=>object(value)&&Object.keys(value).length<=ACCOUNT_LOADOUT_LIMIT&&Object.entries(value).every(([key,row])=>id(key)&&object(row)&&Object.keys(row).length>0&&Object.keys(row).every(k=>['skill','module','skin'].includes(k))&&(row.skill===undefined||skill(row.skill))&&(row.module===undefined||id(row.module))&&(row.skin===undefined||skinId(row.skin)));
export const accountByCharValid=value=>accountEntriesValid(value)&&Object.entries(value).every(([key,row])=>charId(key)&&!('skin'in row));
export const accountOpsValid=value=>object(value)&&Object.keys(value).length<=ACCOUNT_LOADOUT_LIMIT&&Object.entries(value).every(([key,row])=>opsId(key)&&object(row)&&Object.keys(row).every(k=>['potential','cultivate'].includes(k))&&(row.potential===undefined||isPotential(row.potential))&&(row.cultivate===undefined||isCultivate(row.cultivate)));
export const accountSkinsValid=value=>object(value)&&Object.keys(value).length<=ACCOUNT_LOADOUT_LIMIT&&Object.entries(value).every(([key,value])=>charId(key)&&skinId(value));

// Older local caches may contain full resolved choices (module:null), skin fields or empty rows.
// Recover valid fields individually instead of submitting a poisoned whole-account payload.
export function accountChoices(value){
  const out={};for(const[key,row]of Object.entries(object(value)?value:{})){
    if(Object.keys(out).length>=ACCOUNT_LOADOUT_LIMIT)break;if(!charId(key)||!object(row))continue;
    const next={};if(skill(row.skill))next.skill=row.skill;if(id(row.module))next.module=row.module;
    if(Object.keys(next).length)out[key]=next;
  }return out;
}
export function accountOps(value){
  const out={};for(const[key,row]of Object.entries(object(value)?value:{})){
    if(Object.keys(out).length>=ACCOUNT_LOADOUT_LIMIT)break;if(!opsId(key)||!object(row))continue;
    const next={};if(isPotential(row.potential))next.potential=row.potential;if(isCultivate(row.cultivate))next.cultivate=row.cultivate;
    if(Object.keys(next).length)out[key]=next;
  }return out;
}
export function accountSkins(value){
  return Object.fromEntries(Object.entries(object(value)?value:{}).filter(([key,value])=>charId(key)&&skinId(value)).slice(0,ACCOUNT_LOADOUT_LIMIT));
}
export const entrySkins=entries=>accountSkins(Object.fromEntries(Object.entries(entries||{}).filter(([,row])=>object(row)&&row.skin).map(([key,row])=>[key,row.skin])));
export function withEntrySkins(entries,skins){
  const out=structuredClone(entries);
  for(const[key,row]of Object.entries(out))if(charId(key)){delete row.skin;if(!Object.keys(row).length)delete out[key];}
  for(const[key,skin]of Object.entries(skins))out[key]={...out[key],skin};
  return out;
}
