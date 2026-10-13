import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {buildResourcePack} from '../tools/build-resource-pack.mjs';
import {sha256} from '../server/resource-packs.js';
import {updateProject} from '../tools/update-project.mjs';
import {checkResourcePack} from '../tools/check-resource-pack.mjs';
import {startServer} from '../server/index.js';
const retired='public/assets/rhine/char/avatar/char_4048_doroth.png';
const old=Buffer.from('old published Dorothy art');
async function fixture(t){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-update-resources-')),source=path.join(dir,'source'),target=path.join(dir,'target');
 t.after(()=>{assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));assert.ok(path.basename(dir).startsWith('sp-update-resources-'));return fs.rm(dir,{recursive:true,force:true});});
 for(const root of [source,target]){for(const folder of ['tools','public/assets/rhine/char/avatar','config'])await fs.mkdir(path.join(root,folder),{recursive:true});await fs.writeFile(path.join(root,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:root===source?'0.5.1':'0.5.0'}));await fs.writeFile(path.join(root,'public/assets/rhine/current.svg'),'<svg>current art</svg>');}
 await fs.writeFile(path.join(target,retired),old);await fs.writeFile(path.join(target,'config/accounts.custom.json'),'private accounts');
 await fs.writeFile(path.join(source,'tools/retired-resources.json'),JSON.stringify({format:1,files:[{path:retired,sha256:sha256(old)}]}));
 await buildResourcePack({root:target});await buildResourcePack({root:source});return{source,target};
}
test('copy-only updates reproduce App missing-pack error; hash-scoped retirement fixes it and backs up old art',async t=>{
 const {source,target}=await fixture(t);
 await fs.cp(path.join(source,'resource-packs'),path.join(target,'resource-packs'),{recursive:true});
 const broken=await checkResourcePack(target);assert.equal(broken.status,'stale');assert.equal(broken.extraCount,1);assert.deepEqual(broken.extra,['/assets/rhine/char/avatar/char_4048_doroth.png']);
 const updated=await updateProject({source,target,stopped:true});assert.deepEqual(updated.retiredResources,[retired]);
 assert.deepEqual(await fs.readFile(path.join(updated.backup,'retired-resources',retired)),old);await assert.rejects(fs.access(path.join(target,retired)),{code:'ENOENT'});
 assert.equal(await fs.readFile(path.join(target,'config/accounts.custom.json'),'utf8'),'private accounts');assert.equal((await checkResourcePack(target)).status,'ready');
 const again=await updateProject({source,target,stopped:true});assert.deepEqual(again.retiredResources,[]);assert.equal((await checkResourcePack(target)).status,'ready');
});
test('retirement preserves changed and unlisted files; source may reintroduce a retired path',async t=>{
 const {source,target}=await fixture(t),unknown=path.join(target,'public/assets/rhine/custom.svg');
 await fs.writeFile(path.join(target,retired),'locally changed');await fs.writeFile(unknown,'custom art');
 let updated=await updateProject({source,target,stopped:true});assert.deepEqual(updated.retiredResources,[]);assert.equal(await fs.readFile(path.join(target,retired),'utf8'),'locally changed');assert.equal(await fs.readFile(unknown,'utf8'),'custom art');
 await fs.writeFile(path.join(source,retired),'reintroduced official file');updated=await updateProject({source,target,stopped:true});assert.deepEqual(updated.retiredResources,[]);assert.equal(await fs.readFile(path.join(target,retired),'utf8'),'reintroduced official file');
});
test('retirement rejects private/traversal paths before update writes and protects a custom state directory',async t=>{
 const {source,target}=await fixture(t),spec=path.join(source,'tools/retired-resources.json'),before=await fs.readFile(path.join(target,'package.json'));
 for(const bad of ['config/accounts.custom.json','public/assets/../../config/accounts.custom.json','public/assets/../outside.png']){await fs.writeFile(spec,JSON.stringify({format:1,files:[{path:bad,sha256:sha256(old)}]}));await assert.rejects(updateProject({source,target,stopped:true}),/非法路径|越界/);assert.deepEqual(await fs.readFile(path.join(target,'package.json')),before);}
 await fs.writeFile(spec,JSON.stringify({format:1,files:[{path:retired,sha256:sha256(old)}]}));await fs.writeFile(path.join(target,'config/server.env'),'SP_STATE_DIR=public/assets/rhine/char/avatar\n');const result=await updateProject({source,target,stopped:true});assert.deepEqual(result.retiredResources,[]);assert.deepEqual(await fs.readFile(path.join(target,retired)),old);
});
test('diagnostic distinguishes missing descriptor and missing ZIP from stale content',async t=>{
 const {source}=await fixture(t);const d=JSON.parse(await fs.readFile(path.join(source,'resource-packs/current.json')));await fs.unlink(path.join(source,'resource-packs',d.archive.sha256+'.zip'));assert.equal((await checkResourcePack(source)).status,'missing-archive');await fs.unlink(path.join(source,'resource-packs/current.json'));assert.equal((await checkResourcePack(source)).status,'missing');
});
test('real App manifest returns null for leftover art and a usable pack after the stopped update',async t=>{
 const {source,target}=await fixture(t);await fs.cp(path.join(source,'resource-packs'),path.join(target,'resource-packs'),{recursive:true});
 const opts={port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false,publicDir:path.join(target,'public'),dataDir:path.join(target,'data'),sharedDir:path.join(target,'shared'),resourcePacksDir:path.join(target,'resource-packs')};
 let server=await startServer(opts);t.after(async()=>{await server?.close();});
 const manifest=async()=>{const r=await fetch(server.url+'/app/resource-manifest',{headers:{'User-Agent':'StrongholdProtocolApp/1'}});assert.equal(r.status,200);return r.json();};
 assert.equal((await manifest()).resourcePack,null);await server.close();server=null;
 await updateProject({source,target,stopped:true});server=await startServer(opts);const ready=await manifest();assert.ok(ready.resourcePack?.version);assert.equal(ready.resourcePack.fileCount,1);
});
test('retired asset parent symlink is rejected before source writes',async t=>{
 const {source,target}=await fixture(t),parent=path.join(target,'public/assets/rhine/char/avatar'),outside=path.join(path.dirname(target),'outside');
 const fixtureRoot=path.resolve(path.dirname(target));for(const p of [parent,path.join(outside,'saved')])assert.ok(path.resolve(p).startsWith(fixtureRoot+path.sep));
 await fs.mkdir(outside);await fs.rename(parent,path.join(outside,'saved'));await fs.symlink(path.join(outside,'saved'),parent,'junction');
 const before=await fs.readFile(path.join(target,'package.json'));await assert.rejects(updateProject({source,target,stopped:true}),/符号链接/);assert.deepEqual(await fs.readFile(path.join(target,'package.json')),before);assert.deepEqual(await fs.readFile(path.join(outside,'saved/char_4048_doroth.png')),old);
});
