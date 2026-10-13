// Read-only source verification; --update-proof only updates the independent delivery manifest.
import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
import {atlasInfo,normalizeAtlas} from './assets/atlas.mjs';
const root=path.resolve(import.meta.dirname,'..'),source=path.resolve(process.argv[2]),file=path.join(root,'docs/KAZDEL-ASSETS.json');
const proof=JSON.parse(await fs.readFile(file,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex'),gitSha=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
let normalizedCount=0;
for(const p of proof.proof){
 const delivered=await fs.readFile(path.join(root,'public',p.url));
 if(p.url.endsWith('.atlas')){
  // A partial-clone `git cat-file` could lazily fetch into the source repository. Read a plain cache
  // or fetch the pinned raw HTTP object into memory instead; never run a mutating source operation.
  let raw;try{const cached=await fs.readFile(path.join(source,'.cache/rhodes-band/art',p.remote));if(gitSha(cached)===p.gitBlob)raw=cached;}catch(e){if(e.code!=='ENOENT')throw e;}
  // The atlas transform only inserts/fixes page sizes and normalizes line endings/BOM.
  // Recover a source candidate locally only when BOTH original hashes match exactly.
  const text=delivered.toString(),variants=[text,text.replace(/^size:.*\n/gm,''),text.replace(/^size:.*$/gm,'size: 0,0')];
  for(const candidate of variants)for(const ending of ['\n','\r\n','\r'])for(const bom of ['', '\uFEFF']){
   const bytes=Buffer.from(bom+candidate.replace(/\r\n?|\n/g,ending));if(bytes.length===p.bytes&&gitSha(bytes)===p.gitBlob&&sha(bytes)===p.sha256)raw=bytes;
  }
  if(!raw){const response=await fetch(`https://raw.githubusercontent.com/fexli/ArknightsResource/${proof.commit}/${p.remote}`,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Pinned atlas HTTP '+response.status);raw=Buffer.from(await response.arrayBuffer());}
  if(gitSha(raw)!==p.gitBlob||sha(raw)!==p.sha256)throw Error('Original atlas provenance mismatch '+p.url);
  const sizes=new Map();for(const page of atlasInfo(raw.toString()).pages){const name=typeof page==='string'?page:page.name,b=await fs.readFile(path.join(root,'public',path.posix.dirname(p.url),name));sizes.set(name,{width:b.readUInt32BE(16),height:b.readUInt32BE(20)});}
  const n=normalizeAtlas(raw.toString(),{pageSize:name=>sizes.get(name)}),bytes=Buffer.from(typeof n==='string'?n:n.text);
  if(!bytes.equals(delivered))throw Error('Atlas normalization is not reproducible '+p.url);
  Object.assign(p,{deliveredSha256:sha(delivered),deliveredBytes:delivered.length,normalization:'tools/assets/atlas.mjs normalizeAtlas: explicit PNG page sizes and standard atlas fields'});normalizedCount++;
 }else if(sha(delivered)!==p.sha256||gitSha(delivered)!==p.gitBlob)throw Error('Original asset mismatch '+p.url);
}
if(process.argv.includes('--update-proof'))await fs.writeFile(file,JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({verified:proof.proof.length,normalizedAtlases:normalizedCount,sourceRepositoryReadOnly:true,deliveryProofUpdated:process.argv.includes('--update-proof')}));
