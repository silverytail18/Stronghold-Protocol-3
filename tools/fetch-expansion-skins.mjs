// Download exact, pinned expansion artwork; never executes upstream code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Downloader} from './assets/downloader.mjs';
import {fetchSkins} from './fetch-skins.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=JSON.parse(await fs.readFile(path.join(root,'tools/assets/skins-source.json'),'utf8'));
const audit=JSON.parse(await fs.readFile(path.join(root,'tools/assets/expansion-skins-audit.json'),'utf8'));
if(source.repository!=='https://github.com/fexli/ArknightsResource'||audit.commit!==source.commit||!/^[a-f0-9]{40}$/.test(source.commit))throw Error('Invalid pinned source');
const paths=new Set();
for(const s of audit.added){paths.add(s.avatar);paths.add(s.portrait);for(const files of Object.values(s.spine))files.forEach(p=>paths.add(p));for(const t of s.tokens)t.spine.forEach(p=>paths.add(p));}
const jobs=[];
for(const p of paths){
  if(!/^(avatar|charpor|charpack|spine)\/[A-Za-z0-9_./-]+$/.test(p)||p.split('/').some(x=>x==='..'||x==='.')||!source.files[p])throw Error('Unsafe/unpinned path: '+p);
  jobs.push({rel:'skins/'+p,urls:[`https://raw.githubusercontent.com/fexli/ArknightsResource/${source.commit}/${p.split('/').map(encodeURIComponent).join('/')}`],kind:path.extname(p).slice(1),bytes:source.files[p].bytes});
}
const downloader=new Downloader({root:path.join(root,'public/assets'),ledgerPath:path.join(root,'.cache/skins/expansion-ledger.json'),concurrency:6,retries:3,timeoutMs:30000});
const results=await downloader.run(jobs,'expansion skins');
for(const [p,r] of results)if(r.status==='error'||r.status==='miss')throw Error(p+': '+r.error);
for(const p of paths){
  const buf=await fs.readFile(path.join(root,'public/assets/skins',p));
  const hash=createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');
  // Repeated runs may encounter an atlas normalised by the existing Spine pipeline.
  if(hash!==source.files[p].sha){
    if(!p.endsWith('.atlas'))throw Error('Git blob checksum mismatch: '+p);
    const r=await downloader.fetchWithRetries(jobs.find(j=>j.rel==='skins/'+p).urls[0],'atlas');
    if(!r.buf||createHash('sha1').update(`blob ${r.buf.length}\0`).update(r.buf).digest('hex')!==source.files[p].sha)throw Error('Git atlas checksum mismatch: '+p);
    await fs.writeFile(path.join(root,'public/assets/skins',p),r.buf);
  }
}
console.log('Verified '+paths.size+' pinned expansion files');
await fetchSkins({root,offline:true});
