import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {generateKeyPairSync} from 'node:crypto';
import {digest,decodeSignedManifest,loadResourceUpdates,capability} from '../../server/product/resource-updates.js';
import {clientCompatibility,resourcePath,validateResourceManifest} from '../../shared/client-resources.js';
import {buildResourcePatch,writeInitialPolicy,writeSignedInventory} from '../../tools/client-resources.mjs';
import {applyResourceUpdate} from '../../mobile/resource-store.mjs';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const entry=(url,bytes)=>({path:url,sha256:digest(Buffer.from(bytes)),size:Buffer.byteLength(bytes),mime:'application/octet-stream'});
const manifest=files=>({format:1,contract:2,clientLine:'0.9',epoch:1,files:files.sort((a,b)=>a.path<b.path?-1:1)});
const hash=doc=>digest(Buffer.from(JSON.stringify(doc)));
async function fixture(t) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'sp-update-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const from=manifest([entry('/assets/keep.bin','keep'),entry('/assets/old.bin','old')]);
  const to=manifest([entry('/assets/keep.bin','keep'),entry('/assets/new.bin','new')]);
  const directory=path.join(root,'updates'),store=path.join(root,'installed');
  await fs.mkdir(path.join(root,'public/assets'),{recursive:true});await fs.writeFile(path.join(root,'public/assets/new.bin'),'new');
  const patch=await buildResourcePatch({from,to,sourceRoot:root,directory,privateKey});
  const envelope=JSON.parse(await fs.readFile(path.join(directory,'manifests',patch.id+'.json'),'utf8'));
  const descriptor=await writeInitialPolicy(to,directory);descriptor.updates=[patch];await fs.writeFile(path.join(directory,'client.json'),JSON.stringify(descriptor));
  await fs.mkdir(path.join(store,'blobs'),{recursive:true});
  for(const value of ['keep','old'])await fs.writeFile(path.join(store,'blobs',digest(Buffer.from(value))),value);
  const download=sha=>fs.readFile(path.join(directory,'blobs',sha));
  return {root,from,to,directory,store,patch,envelope,descriptor,download};
}
test('minor resource patch downloads only changes, applies deletions and atomically retains rollback generation',async t=>{
  const f=await fixture(t);assert.equal(f.patch.files,1);assert.equal(f.patch.bytes,3);
  const downloads=[];const result=await applyResourceUpdate({directory:f.store,current:f.from,envelope:f.envelope,publicKey,download:sha=>{downloads.push(sha);return f.download(sha);}});
  assert.equal(result.resourceHash,hash(f.to));assert.deepEqual(downloads,[entry('/assets/new.bin','new').sha256]);
  assert(!result.manifest.files.some(file=>file.path==='/assets/old.bin'));
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.store,'active.json'))),{format:1,current:hash(f.to),previous:hash(f.from)});
  assert.equal((await loadResourceUpdates({directory:f.directory,publicKey})).descriptor.updates.length,1);
});
test('tampered update and wrong signing key are rejected',async t=>{
  const f=await fixture(t),other=generateKeyPairSync('rsa',{modulusLength:2048});
  assert.throws(()=>decodeSignedManifest({...f.envelope,payload:Buffer.from('{}').toString('base64')},publicKey),/signature/);
  assert.throws(()=>decodeSignedManifest(f.envelope,other.publicKey),/signature/);
});
test('corrupt or interrupted download never changes active generation',async t=>{
  const f=await fixture(t);for(const download of [async()=>Buffer.from('bad'),async()=>{throw Error('network failed');}]) {
    await assert.rejects(applyResourceUpdate({directory:f.store,current:f.from,envelope:f.envelope,publicKey,download}));
    await assert.rejects(fs.access(path.join(f.store,'active.json')),{code:'ENOENT'});
  }
  await applyResourceUpdate({directory:f.store,current:f.from,envelope:f.envelope,publicKey,download:f.download});
});
test('major client line, resource epoch, contract and minimum build require installer',()=>{
  const cap={contract:2,clientLine:'0.9',epoch:1,build:43,resourceHash:'a'.repeat(64)};
  const d={...cap,minBuild:43,updates:[]};assert.equal(clientCompatibility(d,cap),'ready');
  for(const delta of [{clientLine:'0.10'},{epoch:2},{contract:3},{minBuild:44}])assert.equal(clientCompatibility({...d,...delta},cap),'installer');
  assert.equal(clientCompatibility({...d,resourceHash:'b'.repeat(64)},cap),'installer');
  assert.equal(clientCompatibility({...d,resourceHash:'b'.repeat(64),updates:[{from:cap.resourceHash,to:'b'.repeat(64)}]},cap),'patch');
});
test('patch cannot cross client lines or apply against another installed generation',async t=>{
  const f=await fixture(t);
  await assert.rejects(buildResourcePatch({from:f.from,to:{...f.to,epoch:2},sourceRoot:f.root,directory:f.directory,privateKey}),/new full client/);
  await assert.rejects(applyResourceUpdate({directory:f.store,current:f.to,envelope:f.envelope,publicKey,download:f.download}),/installer/);
});
test('updates cannot activate in battle, or when host loses its update lock',async t=>{
  const f=await fixture(t);
  await assert.rejects(applyResourceUpdate({directory:f.store,current:f.from,envelope:f.envelope,publicKey,download:f.download,inMatch:true}),/during a match/);
  await assert.rejects(applyResourceUpdate({directory:f.store,current:f.from,envelope:f.envelope,publicKey,download:f.download,commit:async()=>{throw Error('match started');}}),/match started/);
  await assert.rejects(fs.access(path.join(f.store,'active.json')),{code:'ENOENT'});
});
test('damaged unchanged installed resource requests reinstall instead of scatter asset fallback',async t=>{
  const f=await fixture(t);await fs.writeFile(path.join(f.store,'blobs',entry('/assets/keep.bin','keep').sha256),'corrupt');
  await assert.rejects(applyResourceUpdate({directory:f.store,current:f.from,envelope:f.envelope,publicKey,download:f.download}),/reinstall/);
});
test('server rejects corrupt patch at startup',async t=>{
  const f=await fixture(t);await fs.writeFile(path.join(f.directory,'blobs',entry('/assets/new.bin','new').sha256),'bad');
  await assert.rejects(loadResourceUpdates({directory:f.directory,publicKey}),/digest/);
});
test('resource paths exclude private data, runtime code, traversal and duplicate entries',()=>{
  assert(resourcePath('/assets/local/fx/tex/a.webp'));assert(resourcePath('/data/assets.json'));
  for(const url of ['/assets/../config/a','/assets//a','/assets/%2e%2e/a','/assets/a\\b','/server/a.js','/data/chess.json','/config/server.env','/auth/users.json'])assert(!resourcePath(url),url);
  const file=entry('/assets/a.bin','a');assert.throws(()=>validateResourceManifest(manifest([file,file])));
});
test('capability includes explicit client line, build and epoch',()=>{
  const req={headers:{'user-agent':'WebView StrongholdProtocolApp/2 Resources/'+'a'.repeat(64)+' ClientLine/0.9 Build/43 Epoch/1'}};
  assert.equal(capability(req).build,43);assert.equal(capability({headers:{'user-agent':'StrongholdProtocolApp/1'}}),null);
});
test('baseline resource policy never publishes the full resource archive',async t=>{
  const f=await fixture(t),initial=path.join(f.root,'initial');await writeInitialPolicy(f.from,initial);
  assert.deepEqual(await fs.readdir(initial),['client.json']);const descriptor=JSON.parse(await fs.readFile(path.join(initial,'client.json')));assert.deepEqual(descriptor.updates,[]);assert(!JSON.stringify(descriptor).includes('.zip'));
});
test('full installer signed inventory exposes verified target without serving blobs',async t=>{
  const f=await fixture(t),directory=path.join(f.root,'full');
  const policy=await writeInitialPolicy(f.to,directory);
  policy.inventory=await writeSignedInventory({manifest:f.to,directory,privateKey});
  await fs.writeFile(path.join(directory,'client.json'),JSON.stringify(policy));
  const loaded=await loadResourceUpdates({directory,publicKey});
  assert.deepEqual(loaded.targetManifest,f.to);
  assert.deepEqual(loaded.descriptor.updates,[]);
  assert.deepEqual((await fs.readdir(directory)).sort(),['client.json','inventories']);
  const response={writeHead(status){this.status=status;},end(){}};
  await loaded.route({method:'GET',headers:{'user-agent':`StrongholdProtocolApp/2 Resources/${hash(f.to)} ClientLine/0.9 Build/999 Epoch/1`}},response,'/client-updates/inventories/'+policy.inventory+'.json',{});
  assert.equal(response.status,409);
});
test('full installer inventory rejects tampering, wrong target and wrong line',async t=>{
  const f=await fixture(t),directory=path.join(f.root,'full');
  const policy=await writeInitialPolicy(f.to,directory);
  policy.inventory=await writeSignedInventory({manifest:f.to,directory,privateKey});
  const save=()=>fs.writeFile(path.join(directory,'client.json'),JSON.stringify(policy));
  await save();
  const other=generateKeyPairSync('rsa',{modulusLength:2048});
  await assert.rejects(loadResourceUpdates({directory,publicKey:other.publicKey}),/signature/);
  policy.resourceHash=hash(f.from);await save();
  await assert.rejects(loadResourceUpdates({directory,publicKey}),/compatibility/);
  policy.resourceHash=hash(f.to);policy.clientLine='1.2';await save();
  await assert.rejects(loadResourceUpdates({directory,publicKey}),/compatibility/);
  policy.clientLine=f.to.clientLine;await save();
  await fs.appendFile(path.join(directory,'inventories',policy.inventory+'.json'),' ');
  await assert.rejects(loadResourceUpdates({directory,publicKey}),/digest/);
});
