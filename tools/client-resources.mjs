// Full resources are embedded in installers. Only signed differences go in the server release.
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash, generateKeyPairSync, sign} from 'node:crypto';
import {validateResourceManifest, CLIENT_LINE, RESOURCE_EPOCH, RESOURCE_CONTRACT, CLIENT_BUILD} from '../shared/client-resources.js';
import {digest} from '../server/product/resource-updates.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const MIME={'.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.m4a':'audio/mp4','.aac':'audio/aac','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.json':'application/json','.atlas':'text/plain; charset=utf-8','.obj':'text/plain; charset=utf-8'};
export async function hashFile(filename) {const hash=createHash('sha256');for await(const chunk of createReadStream(filename))hash.update(chunk);return hash.digest('hex');}
export async function resourceManifest(root=ROOT) {
  const files=[];
  async function walk(directory,prefix) {
    for(const entry of await fs.readdir(directory,{withFileTypes:true})) {
      const filename=path.join(directory,entry.name),url=prefix+'/'+entry.name;
      if(entry.isSymbolicLink())throw Error('Resource symlink rejected: '+url);
      if(entry.isDirectory())await walk(filename,url);
      else if(entry.isFile()){const stat=await fs.stat(filename);files.push({path:url,sha256:await hashFile(filename),size:stat.size,mime:MIME[path.extname(filename).toLowerCase()]||'application/octet-stream'});}
    }
  }
  for(const mount of ['assets','fonts','icons'])await walk(path.join(root,'public',mount),'/'+mount);
  for(const name of ['assets','local-assets','local-fx']) {
    const filename=path.join(root,'data',name+'.json'),bytes=await fs.readFile(filename);
    files.push({path:'/data/'+name+'.json',sha256:digest(bytes),size:bytes.length,mime:'application/json'});
  }
  files.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  const doc=validateResourceManifest({format:1,contract:RESOURCE_CONTRACT,clientLine:CLIENT_LINE,epoch:RESOURCE_EPOCH,files});
  const found=new Set(files.map(file=>file.path));
  function check(value) {if(typeof value==='string'&&/^\/(assets|fonts|icons)\//.test(value)&&!found.has(value))throw Error('Missing referenced resource: '+value);if(value&&typeof value==='object')Object.values(value).forEach(check);}
  for(const name of ['assets','local-assets','local-fx'])check(JSON.parse(await fs.readFile(path.join(root,'data',name+'.json'),'utf8')));
  if(!files.some(f=>f.path.startsWith('/assets/spine/'))&&!files.some(f=>f.path.includes('/spine/')))throw Error('No Spine resources');
  return doc;
}
export async function initializeUpdateKey(root=ROOT) {
  const filename=path.join(root,'mobile','.signing','resource-update-private.pem'),publicFile=path.join(root,'mobile','resource-update-public.pem');
  try {await fs.access(filename);await fs.access(publicFile);return {filename,publicFile};}catch(e){if(e.code!=='ENOENT')throw e;}
  // Never replace either half of an existing identity.
  for(const file of [filename,publicFile]){try{await fs.access(file);throw Error('Incomplete resource update signing identity');}catch(e){if(e.code!=='ENOENT')throw e;}}
  const pair=generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
  await fs.mkdir(path.dirname(filename),{recursive:true});await fs.writeFile(filename,pair.privateKey,{flag:'wx',mode:0o600});await fs.writeFile(publicFile,pair.publicKey,{flag:'wx'});
  return {filename,publicFile};
}
export async function writeInitialPolicy(manifest,directory) {
  validateResourceManifest(manifest);await fs.mkdir(directory,{recursive:true});
  const descriptor={format:1,contract:manifest.contract,clientLine:manifest.clientLine,epoch:manifest.epoch,minBuild:CLIENT_BUILD,resourceHash:digest(Buffer.from(JSON.stringify(manifest))),updates:[]};
  await fs.writeFile(path.join(directory,'client.json'),JSON.stringify(descriptor,null,2)+'\n',{flag:'wx'});return descriptor;
}
export async function writeSignedInventory({manifest,directory,privateKey}) {
  validateResourceManifest(manifest);
  const hash=digest(Buffer.from(JSON.stringify(manifest)));
  const payload=Buffer.from(JSON.stringify({format:1,from:hash,to:hash,manifestBase64:Buffer.from(JSON.stringify(manifest)).toString('base64'),blobs:[]}));
  const envelope=Buffer.from(JSON.stringify({algorithm:'RSA-SHA256',payload:payload.toString('base64'),signature:sign('RSA-SHA256',payload,privateKey).toString('base64')}));
  const id=digest(envelope);
  await fs.mkdir(path.join(directory,'inventories'),{recursive:true});
  await fs.writeFile(path.join(directory,'inventories',id+'.json'),envelope,{flag:'wx'});
  return id;
}
export async function buildResourcePatch({from,to,sourceRoot,directory,privateKey}) {
  validateResourceManifest(from);validateResourceManifest(to);
  if(from.contract!==to.contract||from.clientLine!==to.clientLine||from.epoch!==to.epoch)throw Error('Major resource change requires a new full client');
  const fromHash=digest(Buffer.from(JSON.stringify(from))),toHash=digest(Buffer.from(JSON.stringify(to)));
  if(fromHash===toHash)throw Error('No resource changes');
  const previous=new Set(from.files.map(file=>file.sha256));
  const changed=new Map(to.files.filter(file=>!previous.has(file.sha256)).map(file=>[file.sha256,file]));
  await fs.mkdir(path.join(directory,'blobs'),{recursive:true});await fs.mkdir(path.join(directory,'manifests'),{recursive:true});
  for(const [sha,file] of changed) {
    const source=path.join(sourceRoot,file.path.startsWith('/data/')?'':'public',file.path);
    if(await hashFile(source)!==sha||(await fs.stat(source)).size!==file.size)throw Error('Resource changed during patch build');
    const destination=path.join(directory,'blobs',sha);
    try{await fs.copyFile(source,destination,1);}catch(e){if(e.code!=='EEXIST'||await hashFile(destination)!==sha)throw e;}
  }
  const payload=Buffer.from(JSON.stringify({format:1,from:fromHash,to:toHash,manifestBase64:Buffer.from(JSON.stringify(to)).toString('base64'),blobs:[...changed.keys()].sort()}));
  const envelope=Buffer.from(JSON.stringify({algorithm:'RSA-SHA256',payload:payload.toString('base64'),signature:sign('RSA-SHA256',payload,privateKey).toString('base64')}));
  const id=digest(envelope);await fs.writeFile(path.join(directory,'manifests',id+'.json'),envelope,{flag:'wx'});
  return {id,from:fromHash,to:toHash,files:changed.size,bytes:[...changed.values()].reduce((sum,file)=>sum+file.size,0)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [command,...args]=process.argv.slice(2);
  if(command==='manifest') {const manifest=await resourceManifest();await fs.writeFile(args[0]||path.join(ROOT,'mobile/resources.json'),JSON.stringify(manifest));console.log(JSON.stringify({files:manifest.files.length,hash:digest(Buffer.from(JSON.stringify(manifest)))}));}
  else if(command==='key') console.log(await initializeUpdateKey());
  else if(command==='patch') {
    if(args.length!==4)throw Error('Usage: patch <old-manifest> <new-manifest> <output-dir> <private-key>');
    console.log(await buildResourcePatch({from:JSON.parse(await fs.readFile(args[0],'utf8')),to:JSON.parse(await fs.readFile(args[1],'utf8')),sourceRoot:ROOT,directory:args[2],privateKey:await fs.readFile(args[3])}));
  } else throw Error('Usage: node tools/client-resources.mjs manifest|key|patch');
}
