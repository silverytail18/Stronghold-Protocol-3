import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const commit='17759cc8cdf37388414145d16262a3a06f3ab25e',id='char_4231_clemnt';
const out={repository:'Kengxxiao/ArknightsGameData',verifiedCommit:commit,generatorCommit:'e8588a82074bf695aa3849959037dd2de7e6e5cf',files:[]};
for(const name of ['character','skill','uniequip','skin']){
 const suffix='/zh_CN/gamedata/excel/'+name+'_table.json',urls=['https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/'+commit+suffix,'https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData@'+commit+suffix];
 let bytes,url;for(let i=0;i<4;i++){try{url=urls[i%2];const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);bytes=Buffer.from(await r.arrayBuffer());break;}catch(e){if(i===3)throw e;}}
 const j=JSON.parse(bytes),old=JSON.parse(await fs.readFile('.cache/rhodes-revision/gamedata/'+name+'_table.json','utf8'));
 const pick=o=>name==='character'?o[id]:name==='skill'?Object.fromEntries([1,2,3].map(n=>['skchr_clemnt_'+n,o['skchr_clemnt_'+n]])):Object.values(name==='uniequip'?o.equipDict:o.charSkins).filter(v=>v.charId===id);
 if(JSON.stringify(pick(j))!==JSON.stringify(pick(old)))throw Error('Original record changed: '+name);
 out.files.push({name,url,sha256:createHash('sha256').update(bytes).digest('hex'),record:pick(j)});console.log(name+' verified');
}
await fs.writeFile('docs/CLEMNT-SOURCES.json',JSON.stringify(out,null,2)+'\n');
