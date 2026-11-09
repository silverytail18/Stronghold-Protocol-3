// The entertainment engine has its own modules and data singleton.
import {SIM_DATA_FILES} from './simLoader.js';
let pending;
export function loadZhajingSim() {
 return pending ||= (async()=>{
  const base='/zhajing/server/sim/';
  const [spec,simdata,support]=await Promise.all([import(base+'spec.js'),import(base+'simdata.js'),import(base+'content/support/index.js')]);
  const raw={};
  await Promise.all([...SIM_DATA_FILES,'config','jibianBonds','zjDefaultLoadout'].map(async name=>{const res=await fetch('/data/zhajing/'+name+'.json',{cache:'no-cache'});if(!res.ok)throw Error('炸惊数据加载失败：'+name);raw[name]=await res.json();}));
  const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};freeze(raw);
  simdata.setSimData(raw);support.setGameData?.(raw);
  return {spec,ds:new simdata.DataSource(raw,null),cs:null,raw};
 })().catch(error=>{pending=null;throw error;});
}
