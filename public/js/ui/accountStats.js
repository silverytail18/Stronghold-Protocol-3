import {bindStatsAccount,loadStats,saveStats,emptyStats,appendRecord,buildRecord,migrateStats} from './stats.js';
import {toastError} from './toasts.js';
import {t} from '../../../shared/i18n.js';
let accountId=null,revision=0,applying=false,timer=null,pending=Promise.resolve(),generation=0;
async function api(method='GET',body){
  const res=await fetch('/product/achievements',{method,cache:'no-store',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
  const json=await res.json();if(!res.ok)throw Object.assign(Error(json.error||t('成就同步失败')),{status:res.status});return json;
}
export async function syncAccountStats(account){
  if(!account?.accountId)return;
  const id=account.accountId;if(accountId!==id){generation++;clearTimeout(timer);}accountId=id;const gen=generation;bindStatsAccount(id);
  const cloud=await api();if(accountId!==id||generation!==gen||cloud.accountId!==id)return;
  revision=cloud.revision;let stats=emptyStats();
  for(const record of [...cloud.records,...loadStats().records.filter(r=>r.t>cloud.clearedAt)])stats=appendRecord(stats,record).stats;
  for(const row of cloud.settlements){const record=buildRecord(row.summary,{myId:row.myId,roomMode:row.mode,content:row.content,version:row.version,now:row.at});if(record)stats=appendRecord(stats,record).stats;}
  applying=true;try{saveStats(stats);}finally{applying=false;}
}
async function push(){
  if(!accountId)return;const id=accountId,gen=generation,records=loadStats().records;
  try{const result=await api('PUT',{accountId:id,revision,records});if(id===accountId)revision=result.revision;}
  catch(error){if(id!==accountId||gen!==generation)return;if(error.status===409){await syncAccountStats({accountId:id});if(id!==accountId||gen!==generation)return;const result=await api('PUT',{accountId:id,revision,records});if(id===accountId&&gen===generation)revision=result.revision;}else throw error;}
}
globalThis.addEventListener?.('product:stats-saved',()=>{if(applying||!accountId)return;clearTimeout(timer);timer=setTimeout(()=>{pending=pending.then(push).catch(toastError);},500);});
export async function importLegacyAccountStats(){
  if(!accountId)throw Error(t('请先登录'));
  const raw=globalThis.localStorage?.getItem('sp.pref.stats');if(!raw)return 0;
  const old=migrateStats(JSON.parse(raw));if(old.newer)throw Error(t('旧记录格式较新，无法导入'));
  const current=loadStats();let merged=current;for(const rec of old.stats.records)merged=appendRecord(merged,rec).stats;
  applying=true;try{saveStats(merged);}finally{applying=false;}
  await push();return merged.records.length-current.records.length;
}
