// Immutable, display-only records. Never use a browsing catalog as match rules.
const copyFields=(rec,fields)=>Object.fromEntries(fields.filter(k=>rec?.[k]!==undefined).map(k=>[k,structuredClone(rec[k])]));
export function snapshotRecordContent(data={},players=[],testRules=null){
 const result={format:1,chess:{},items:{},bands:{},bonds:{},assets:{chars:{},items:{},bands:{},bonds:{}},batches:structuredClone(testRules?.batches||[])};
 for(const p of players){
  const band=data.bands?.[p.bandId];if(band){result.bands[p.bandId]=copyFields(band,['bandId','name']);result.assets.bands[p.bandId]=data.assets?.bands?.[p.bandId];}
  for(const u of p.lineup||[]){const c=data.chess?.[u.id];if(c){result.chess[u.id]=copyFields(c,['chessId','name','tier','charId','isGolden','assets']);for(const key of new Set([c.charId,c.assets?.avatar,c.assets?.avatar?.replace(/_2$/,'')].filter(Boolean)))if(data.assets?.chars?.[key])result.assets.chars[key]=copyFields(data.assets.chars[key],['avatar','avatarE2']);}
   for(const id of u.items||[]){const it=data.items?.[id];if(it){result.items[id]=copyFields(it,['id','name','tier','iconId','trapId','isGolden']);const key=it.iconId||it.trapId;if(data.assets?.items?.[key])result.assets.items[key]=data.assets.items[key];}}
  }
  for(const b of p.bonds||[]){const id=b.bondId,rec=data.bonds?.[id];if(rec){result.bonds[id]=copyFields(rec,['bondId','name']);result.assets.bonds[id]=data.assets?.bonds?.[id];}}
 }
 return result;
}
export function recordCatalog(catalog,snapshot){
 if(snapshot?.format!==1)return catalog;
 const out={...catalog};for(const k of ['chess','items','bands','bonds'])out[k]={...catalog[k],...snapshot[k]};
 out.assets={...catalog.assets};for(const k of ['chars','items','bands','bonds'])out.assets[k]={...catalog.assets?.[k],...snapshot.assets?.[k]};return out;
}
