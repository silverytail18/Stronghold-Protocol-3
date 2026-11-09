// Executable contract oracle for both native resource stores; not served to the browser.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {decodeSignedManifest,digest} from '../server/product/resource-updates.js';
import {validateResourceManifest} from '../shared/client-resources.js';
export async function applyResourceUpdate({directory,current,envelope,publicKey,download,inMatch=false,commit=async()=>{}}) {
  if(inMatch)throw Error('Resource updates cannot activate during a match');
  const doc=decodeSignedManifest(envelope,publicKey);
  const old=validateResourceManifest(current),from=digest(Buffer.from(JSON.stringify(old)));
  if(doc.from!==from||doc.manifest.contract!==old.contract||doc.manifest.clientLine!==old.clientLine||doc.manifest.epoch!==old.epoch)throw Error('A new installer is required');
  const allowed=new Set(doc.blobs);
  if(!Array.isArray(doc.blobs)||allowed.size!==doc.blobs.length)throw Error('Invalid changed blob list');
  const previous=new Set(old.files.map(file=>file.sha256));
  if(doc.manifest.files.some(file=>!previous.has(file.sha256)&&!allowed.has(file.sha256)))throw Error('Incomplete patch');
  const blobs=path.join(directory,'blobs');await fs.mkdir(blobs,{recursive:true});
  for(const file of doc.manifest.files) {
    const destination=path.join(blobs,file.sha256);let valid=false;
    try{const bytes=await fs.readFile(destination);valid=bytes.length===file.size&&digest(bytes)===file.sha256;}catch(e){if(e.code!=='ENOENT')throw e;}
    if(valid)continue;
    if(!allowed.has(file.sha256))throw Error('Installed resources are damaged; reinstall client');
    const bytes=await download(file.sha256,file.size);
    if(bytes.length!==file.size||digest(bytes)!==file.sha256)throw Error('Downloaded resource digest mismatch');
    const temporary=destination+'.'+randomUUID()+'.tmp';
    try{await fs.writeFile(temporary,bytes,{flag:'wx'});await fs.rename(temporary,destination);}finally{await fs.rm(temporary,{force:true});}
  }
  const manifest=Buffer.from(JSON.stringify(doc.manifest)),generations=path.join(directory,'generations');await fs.mkdir(generations,{recursive:true});
  await fs.writeFile(path.join(generations,doc.to+'.json'),manifest);
  await commit(); // Host re-checks that no match started while the update was downloading.
  const pointer=path.join(directory,'active.json'),temporary=pointer+'.'+randomUUID()+'.tmp';
  try{await fs.writeFile(temporary,JSON.stringify({format:1,current:doc.to,previous:from}),{flag:'wx'});await fs.rename(temporary,pointer);}finally{await fs.rm(temporary,{force:true});}
  return {manifest:doc.manifest,resourceHash:doc.to};
}
