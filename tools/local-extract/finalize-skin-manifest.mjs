// Refresh manifest metadata after a targeted extraction; no downloads or full resource hashing.
import fs from 'node:fs';
import path from 'node:path';
import {contentHash} from '../assets/manifest.mjs';
const root=path.resolve(process.argv[2]),file=path.join(root,'data/assets.json');
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const {version,hash,generator,stats,...body}=manifest;
void version;void hash;void generator;void stats;
const refs=new Set();
function scan(value){
 if(typeof value==='string'&&value.startsWith('/assets/'))refs.add(value);
 else if(value&&typeof value==='object')Object.values(value).forEach(scan);
}
scan(body);
manifest.hash=contentHash(body);
manifest.stats.files=refs.size;
manifest.stats.bytes=[...refs].reduce((sum,url)=>sum+fs.statSync(path.join(root,'public',url)).size,0);
fs.writeFileSync(file,JSON.stringify(manifest)+'\n');
