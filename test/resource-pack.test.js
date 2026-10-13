import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {inflateRawSync} from 'node:zlib';
import {spawnSync,spawn} from 'node:child_process';
import {buildResourcePack,writeResourceZip} from '../tools/build-resource-pack.mjs';
import {sha256} from '../server/resource-packs.js';
import {fixedPath} from '../server/resource-policy.js';
import {startServer,ROOT} from '../server/index.js';
import {hashPassword} from '../server/auth.js';
import {downloadName} from '../server/client-downloads.js';

async function fixture(t){
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'sp-resource-pack-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  for(const dir of ['public/assets/board','public/fonts','public/icons','data','shared','server/sim','config','storage','mobile/android/.signing'])await fs.mkdir(path.join(root,dir),{recursive:true});
  await fs.writeFile(path.join(root,'public/index.html'),'<html>game</html>');
  await fs.writeFile(path.join(root,'public/assets/board/test.png'),Buffer.alloc(20000,42));
  await fs.writeFile(path.join(root,'public/assets/board/test.obj'),'v 0 0 0');
  await fs.writeFile(path.join(root,'public/assets/board/tiles.json'),'{}');
  await fs.writeFile(path.join(root,'public/fonts/fonts.css'),'@font-face{}');
  await fs.writeFile(path.join(root,'public/assets/board/测试 space.png'),'encoded-image');
  await fs.mkdir(path.join(root,'public/assets/audio/bgm'),{recursive:true});
  await fs.writeFile(path.join(root,'public/assets/audio/bgm/test.mp3'),'audio');
  await fs.writeFile(path.join(root,'public/assets/board/test.atlas'),'test.png');
  await fs.writeFile(path.join(root,'public/assets/board/test.skel'),'spine');
  await fs.writeFile(path.join(root,'public/fonts/test.woff2'),'font');
  await fs.writeFile(path.join(root,'data/chess.json'),'{}');
  await fs.writeFile(path.join(root,'data/assets.json'),JSON.stringify({art:'/assets/board/test.png'}));
  for(const file of ['config/server.env','storage/auth-users.json','storage/ranked.sqlite','data/auth-users.json','mobile/android/.signing/release.p12','public/assets/.secret.json'])await fs.writeFile(path.join(root,file),'PRIVATE-MUST-NOT-BE-PACKED');
  return {root,output:path.join(root,'resource-packs'),image:path.join(root,'public/assets/board/test.png')};
}
function unzip(buf){const result=new Map();let i=0;while(buf.readUInt32LE(i)===0x04034b50){const method=buf.readUInt16LE(i+8),size=buf.readUInt32LE(i+18),raw=buf.readUInt32LE(i+22),nl=buf.readUInt16LE(i+26),extra=buf.readUInt16LE(i+28),name=buf.subarray(i+30,i+30+nl).toString();const start=i+30+nl+extra,body=buf.subarray(start,start+size),bytes=method===8?inflateRawSync(body):body;assert.equal(bytes.length,raw);result.set(name,bytes);i=start+size;}return result;}
async function catalog(f,pack){return JSON.parse(await fs.readFile(path.join(f.output,pack.version+'.json')));}
test('resource pack contains only allowed fixed content, is deterministic and updates content hashes independently',async t=>{
  const f=await fixture(t),first=await buildResourcePack(f),doc=await catalog(f,first);
  assert.equal(doc.files.length,11);assert.ok(doc.files.some(x=>x.path.endsWith('.obj')));assert.ok(doc.files.every(x=>fixedPath(x.path)));
  const entries=unzip(await fs.readFile(path.join(f.output,first.archive.sha256+'.zip')));assert.equal(entries.size,new Set(doc.files.map(f=>f.hash)).size+1);
  for(const entry of doc.files)assert.equal(sha256(entries.get('files/'+entry.hash)),entry.hash);
  assert.ok(![...entries.values()].some(b=>b.toString().includes('PRIVATE-MUST-NOT-BE-PACKED')));
  assert.deepEqual(await buildResourcePack(f),first);
  await fs.writeFile(f.image,Buffer.alloc(20000,43));const next=await buildResourcePack(f),changed=await catalog(f,next);assert.notEqual(next.version,first.version);
  const differences=changed.files.filter(x=>doc.files.find(y=>y.path===x.path).hash!==x.hash);assert.deepEqual(differences.map(x=>x.path),['/assets/board/test.png']);
  await fs.unlink(f.image);await assert.rejects(buildResourcePack(f),/缺少.*拒绝/);
});
test('resource HTTP routes keep authentication, enforce content hashes, support ranges and refuse stale catalogs',async t=>{
  const f=await fixture(t),pack=await buildResourcePack(f);const passwordHash=await hashPassword('resource-test-password');
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,publicDir:path.join(f.root,'public'),dataDir:path.join(f.root,'data'),sharedDir:path.join(f.root,'shared'),resourcePacksDir:f.output,auth:{secureCookie:false,users:{version:1,users:[{username:'tester',passwordHash,role:'admin',mustChangePassword:false}]}},ranked:false});t.after(()=>srv.close());
  const ua='StrongholdProtocolApp/1';const logged=await fetch(srv.url+'/auth/login',{method:'POST',headers:{Origin:srv.url,'User-Agent':ua,'Content-Type':'application/json'},body:JSON.stringify({username:'tester',password:'resource-test-password'})});assert.equal(logged.status,200);await logged.arrayBuffer();const Cookie=logged.headers.get('set-cookie').split(';')[0];
  const get=(route,headers={})=>fetch(srv.url+route,{headers:{'User-Agent':ua,Cookie,...headers},redirect:'manual'});
  const state=await (await get('/app/resource-manifest')).json();assert.equal(state.resourcePack.version,pack.version);
  const doc=await (await get(pack.catalog.url)).json();assert.equal(doc.version,pack.version);
  assert.equal((await fetch(srv.url+pack.catalog.url,{headers:{'User-Agent':ua}})).status,401);
  assert.equal((await get(pack.catalog.url,{'User-Agent':'Mozilla/5.0'})).status,403);
  const range=await get(pack.archive.url,{Range:'bytes=0-31'});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,32);
  const item=doc.files.find(x=>x.path==='/assets/board/test.png');const content=await get('/app/resource-file/'+item.hash);assert.equal(content.status,200);assert.equal(sha256(Buffer.from(await content.arrayBuffer())),item.hash);
  await fs.writeFile(f.image,Buffer.alloc(20000,43));assert.equal((await get('/app/resource-file/'+item.hash)).status,409);
  assert.equal((await (await get('/app/resource-manifest')).json()).resourcePack,null);
  assert.equal((await get(pack.catalog.url)).status,409);
  for(const route of ['/app/resource-file/../storage/auth-users.json','/app/resource-file/'+sha256('PRIVATE-MUST-NOT-BE-PACKED')])assert.notEqual((await get(route)).status,200);
  const page=await fetch(srv.url+'/downloads');assert.equal(page.status,200);assert.match(await page.text(),/客户端下载|下载客户端/);
  for(const name of ['../mobile/android/.signing/release.p12','credentials.json','stronghold-protocol.apk/../secret','.env'])assert.equal(downloadName('/downloads/'+name),null);
});
test('Android blob store validates archives, rejects traversal/tampering and preserves existing content on failure',async t=>{
  const compiler=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin','javac'):'javac',java=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin','java'):'java';
  const f=await fixture(t),pack=await buildResourcePack(f),doc=await catalog(f,pack);const classes=path.join(f.root,'classes');await fs.mkdir(classes);
  const compiled=spawnSync(compiler,['-encoding','UTF-8','-d',classes,path.join(ROOT,'mobile/android/app/src/main/java/io/stronghold/protocol/BlobStore.java'),path.join(ROOT,'mobile/android/tests/BlobStoreTest.java')],{encoding:'utf8',windowsHide:true});assert.equal(compiled.status,0,compiled.stderr);
  const spec=path.join(f.root,'spec.txt');await fs.writeFile(spec,doc.files.map(f=>`${f.hash} ${f.size}`).join('\n'));
  const bad=path.join(f.root,'bad.zip');await writeResourceZip(bad,[['../escape',async()=>Buffer.from('bad')]]);
  const run=spawnSync(java,['-cp',classes,'io.stronghold.protocol.BlobStoreTest',path.join(f.output,pack.archive.sha256+'.zip'),spec,path.join(f.root,'blobs'),bad],{encoding:'utf8',windowsHide:true});assert.equal(run.status,0,run.stderr);assert.match(run.stdout,/checks passed/);t.diagnostic(run.stdout.trim());
});
test('Windows cache preloads once, sends no fixed files on repeat, downloads only changed/corrupt blobs and uses bundled art without network downloads',async t=>{
  const f=await fixture(t),first=await buildResourcePack(f);const output=path.join(f.root,'runner');
  const env={...process.env,DOTNET_CLI_HOME:path.join(ROOT,'.cache/dotnet'),NUGET_PACKAGES:path.join(ROOT,'.cache/nuget'),DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
  const built=spawnSync('dotnet',['build',path.join(ROOT,'test/windows-cache/CacheCheck.csproj'),'-c','Release','-o',output],{encoding:'utf8',env,windowsHide:true});assert.equal(built.status,0,built.stdout+built.stderr);
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,publicDir:path.join(f.root,'public'),dataDir:path.join(f.root,'data'),sharedDir:path.join(f.root,'shared'),resourcePacksDir:f.output,auth:false,ranked:false});t.after(()=>srv.close());
  let routes=[],ranges=[];srv.server.on('request',req=>{routes.push(req.url);if(req.headers.range)ranges.push(req.headers.range);});
  const run=(cache,bundle='')=>new Promise((resolve,reject)=>{const child=spawn('dotnet',[path.join(output,'CacheCheck.dll'),srv.url+'/',cache,bundle],{env,windowsHide:true});let log='';child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);child.on('error',reject);child.on('close',code=>code===0?resolve(log):reject(new Error(log)));});
  const count=type=>routes.filter(r=>r.startsWith('/app/resource-'+type+'/')).length;
  const local=path.join(f.root,'windows-cache');await run(local);assert.equal(count('pack'),1);assert.equal(count('catalog'),1);assert.equal(count('file'),0);
  routes=[];await run(local);assert.equal(count('pack')+count('catalog')+count('file'),0);
  assert.ok(routes.every(r=>r==='/app/resource-manifest'),'all encoded/relative/versioned/audio/HEAD resource reads stayed local');
  await fs.writeFile(path.join(f.root,'shared/constants.js'),'export const APP_VERSION="new-code-version";');
  routes=[];await run(local);assert.equal(count('pack')+count('catalog')+count('file'),0,'code-only release does not redownload fixed resources');
  await fs.writeFile(f.image,Buffer.alloc(20000,43));const next=await buildResourcePack(f);routes=[];await run(local);assert.equal(count('pack'),0);assert.equal(count('file'),1);assert.equal(count('catalog'),1);
  const doc=await catalog(f,next),image=doc.files.find(x=>x.path.endsWith('test.png'));await fs.writeFile(path.join(local,'files',image.hash),Buffer.alloc(image.size,99));routes=[];await run(local);assert.equal(count('file'),1);assert.equal(count('pack')+count('catalog'),0);
  const bundle=path.join(f.root,'bundle');await fs.mkdir(bundle);await fs.copyFile(path.join(f.output,next.version+'.json'),path.join(bundle,'resource-catalog.json'));await fs.copyFile(path.join(f.output,next.archive.sha256+'.zip'),path.join(bundle,'resource-pack.zip'));
  routes=[];await run(path.join(f.root,'prebundled'),bundle);assert.equal(count('pack')+count('catalog')+count('file'),0);
  const resumed=path.join(f.root,'resumed');await fs.mkdir(resumed);const zip=await fs.readFile(path.join(f.output,next.archive.sha256+'.zip')),prefix=zip.subarray(0,Math.floor(zip.length/3));await fs.writeFile(path.join(resumed,next.archive.sha256+'.download'),prefix);
  routes=[];ranges=[];await run(resumed);assert.deepEqual(ranges,[`bytes=${prefix.length}-`]);assert.equal(count('pack'),1);
  const partial=path.join(f.root,'partial-cache');await fs.mkdir(path.join(partial,'files'),{recursive:true});
  await fs.copyFile(path.join(local,'files',image.hash),path.join(partial,'files',image.hash));await fs.writeFile(path.join(partial,next.archive.sha256+'.download'),prefix);
  routes=[];ranges=[];await run(partial);assert.equal(count('pack'),0);assert.equal(ranges.length,0);
  assert.equal(count('file'),new Set(doc.files.map(f=>f.hash)).size-1);
  assert.ok(!routes.includes('/app/resource-file/'+image.hash),'correctly downloaded image is never requested again, even with a leftover partial ZIP');
  const rollback=path.join(f.root,'rollback');await fs.mkdir(rollback);const index=path.join(rollback,sha256(srv.url+'/')+'.json'),sentinel='existing-index-must-survive';await fs.writeFile(index,sentinel);await fs.writeFile(path.join(rollback,next.archive.sha256+'.download'),Buffer.alloc(prefix.length,0));
  await assert.rejects(run(rollback),/数据包校验失败/);assert.equal(await fs.readFile(index,'utf8'),sentinel);
  // Verify every real project resource using the cache implementation shipped in Windows.
  const actual=JSON.parse(await fs.readFile(path.join(ROOT,'resource-packs/current.json'),'utf8'));
  const real=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>real.close());
  const realRoutes=[];real.server.on('request',req=>realRoutes.push(req.url));
  const realBundle=path.join(f.root,'real-bundle');await fs.mkdir(realBundle);
  await fs.copyFile(path.join(ROOT,'resource-packs',actual.version+'.json'),path.join(realBundle,'resource-catalog.json'));
  await fs.copyFile(path.join(ROOT,'resource-packs',actual.archive.sha256+'.zip'),path.join(realBundle,'resource-pack.zip'));
  const realLog=await new Promise((resolve,reject)=>{
    const child=spawn('dotnet',[path.join(output,'CacheCheck.dll'),real.url+'/',path.join(f.root,'real-cache'),realBundle],{env,windowsHide:true});let log='';
    child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);child.on('error',reject);child.on('close',code=>code===0?resolve(log):reject(new Error(log)));
  });
  assert.ok(realRoutes.every(r=>r==='/app/resource-manifest'),JSON.stringify(realRoutes));assert.equal(realRoutes.length,2);
  t.diagnostic(realLog.trim()+'; server transferred 0 fixed-resource bytes');
  t.diagnostic('Real Windows cache HTTP checks: first=one ZIP; unchanged=zero fixed files; update/corruption=one blob; prebundled=zero downloads');
});
