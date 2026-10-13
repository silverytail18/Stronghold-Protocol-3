export function encyclopediaEntries(catalog,tab,query=''){
 const rows=Object.values(catalog?.[tab]||{}).filter(r=>tab==='bonds'||!r.isGolden);
 const key=String(query).trim().toLowerCase();
 return rows.filter(r=>!key||[r.name,r.desc,catalog?.batches?.[tab]?.[r.bondId||r.id]].join(' ').toLowerCase().includes(key)).sort((a,b)=>(tab==='items'?(a.tier||0)-(b.tier||0):(a.isCore===b.isCore?0:a.isCore?-1:1))||(a.identifier||0)-(b.identifier||0)||String(a.name).localeCompare(String(b.name),'zh-CN'));
}
// A single player-facing trait may be split into several independent runtime effects.
// Deduplicate only the browsing text; never merge or delete combat records.
export function encyclopediaTraits(chess,garrisons){
 const seen=new Set(),rows=[];
 for(const id of chess?.garrisonIds||[]){const r=garrisons?.[id];if(!r)continue;
  const text=String(r.descRaw||r.desc||'').replace(/^(?:\s*【\d+】)+/,'').trim();
  const plain=text.replace(/<[@$#][^<>]*>|<\/>/g,'').replace(/\s+/g,'');
  if(!plain||seen.has(plain))continue;seen.add(plain);rows.push({...r,descRaw:text,desc:text,plain});
 }
 return rows.filter(r=>!rows.some(other=>other!==r&&other.plain.length>r.plain.length&&(other.plain===r.plain+'。'||other.plain.startsWith(r.plain+'，')||other.plain.startsWith(r.plain+'；')||other.plain.startsWith(r.plain+'。'))));
}
