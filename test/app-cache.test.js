import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {startServer,ROOT} from '../server/index.js';
import {hashPassword} from '../server/auth.js';
import {APP_USER_AGENT,isMobileBrowser} from '../server/app-client.js';
import {appArtUrl,appArtPaths,initAppResources,installAppResourceGuard} from '../public/js/appResources.js';
import {validSpine,localSpineEntry} from '../public/js/assets.js';
import {mediaUrl} from '../public/js/media.js';
import {TestClient} from './helpers/wsClient.js';

const mobile='Mozilla/5.0 (Linux; Android 15) Chrome/130.0 Mobile Safari/537.36';
const app=mobile+' '+APP_USER_AGENT,desktop='Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const password='keep123';let passwordHash;
before(async()=>{passwordHash=await hashPassword(password);});
function request(srv,url,{ua=app,cookie,headers={},method='GET',body}={}) {
  return new Promise((resolve,reject)=>{
    const req=http.request(srv.url,{path:url,method,headers:{Origin:srv.url,'User-Agent':ua,...cookie?{Cookie:cookie}:{},...body?{'Content-Type':'application/json'}:{},...headers}},res=>{
      const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>{
        const bytes=Buffer.concat(chunks),text=bytes.toString();let data;try{data=JSON.parse(text);}catch{}
        resolve({status:res.statusCode,headers:res.headers,text,bytes,data,cookie:res.headers['set-cookie']?.[0].split(';')[0]});
      });
    });req.on('error',reject);req.end(body?JSON.stringify(body):undefined);
  });
}
async function fixture(t) {
  const dir=await fs.mkdtemp(path.join(ROOT,'.cache','app-assets-test-'));
  const publicDir=path.join(dir,'public');
  await fs.mkdir(path.join(publicDir,'assets','models'),{recursive:true});await fs.mkdir(path.join(publicDir,'fonts'),{recursive:true});
  await fs.mkdir(path.join(publicDir,'css'),{recursive:true});await fs.mkdir(path.join(publicDir,'js'),{recursive:true});
  await fs.writeFile(path.join(publicDir,'index.html'),'<html>game</html>');
  await fs.writeFile(path.join(publicDir,'assets','models','unit.png'),'before');
  await fs.writeFile(path.join(publicDir,'assets','models','unit.skel'),'skeleton');
  await fs.writeFile(path.join(publicDir,'assets','models','unit.atlas'),'unit.png');
  await fs.writeFile(path.join(publicDir,'fonts','test.woff2'),'font');
  await fs.writeFile(path.join(publicDir,'fonts','fonts.css'),'@font-face{font-family:test;src:url(test.woff2)}');
  await fs.writeFile(path.join(publicDir,'css','test.css'),'.test{background:url(/assets/models/unit.png)}');
  await fs.writeFile(path.join(publicDir,'js','test.js'),'export const test=1;');
  const users=['admin','player'].map((username,i)=>({username,accountId:randomUUID(),passwordHash,role:i?'user':'admin',disabled:false,mustChangePassword:false}));
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,publicDir,auth:{users:{version:1,users},secureCookie:false},ranked:{filename:':memory:'}});
  t.after(async()=>{await srv.close();await fs.rm(dir,{recursive:true,force:true});});
  const logged=await request(srv,'/auth/login',{method:'POST',body:{username:'player',password}});
  return {srv,dir,publicDir,cookie:logged.cookie,users};
}
test('App art is immutable, App code/data revalidate, and browsers cannot fetch game resources',async t=>{
  const {srv,cookie}=await fixture(t);
  const manifest=await request(srv,'/app/resource-manifest',{cookie});assert.equal(manifest.status,200);assert.equal(manifest.headers['cache-control'],'no-store');
  const url=`/app-cache/${manifest.data.art}/assets/models/unit.png`;
  const cached=await request(srv,url,{cookie});assert.equal(cached.status,200);assert.equal(cached.text,'before');assert.equal(cached.headers['cache-control'],'private, max-age=31536000, immutable');
  const same=await request(srv,url,{cookie,headers:{'If-None-Match':cached.headers.etag}});assert.equal(same.status,304);assert.equal(same.bytes.length,0);
  for(const ua of [app,desktop,mobile]) {
    for(const route of ['/assets/models/unit.png','/js/test.js','/data/chess.json']) {
      const response=await request(srv,route,{cookie,ua});assert.equal(response.status,ua===app?200:403);if(ua===app)assert.equal(response.headers['cache-control'],'private, no-cache');
    }
    assert.equal((await request(srv,'/auth/session',{cookie,ua})).headers['cache-control'],'no-store');
  }
  assert.equal((await request(srv,url,{ua:desktop,cookie})).status,403);
  assert.equal((await request(srv,url)).status,401,'cached route cannot bypass authorization');
  assert.equal((await request(srv,'/app/resource-manifest',{ua:desktop,cookie})).status,403);
});
test('art replacement changes cache URL even with same size/mtime; code-only update preserves art cache and changes page revision',async t=>{
  const {srv,publicDir,cookie}=await fixture(t);
  const first=(await request(srv,'/app/resource-manifest',{cookie})).data;
  const png=path.join(publicDir,'assets/models/unit.png'),stat=await fs.stat(png);
  await fs.writeFile(png,'after!');await fs.utimes(png,stat.atime,stat.mtime);
  const stale=await request(srv,`/app-cache/${first.art}/assets/models/unit.png`,{cookie});assert.equal(stale.status,307);assert.equal(stale.headers['cache-control'],'no-store');
  const second=(await request(srv,'/app/resource-manifest',{cookie})).data;assert.notEqual(second.art,first.art);assert.notEqual(second.revision,first.revision);
  assert.equal((await request(srv,`/app-cache/${second.art}/assets/models/unit.png`,{cookie})).text,'after!');
  assert.equal((await request(srv,`/app-cache/${first.art}/assets/models/unit.png`,{cookie})).status,307);
  await fs.writeFile(path.join(publicDir,'js/test.js'),'export const test=2;');
  const third=(await request(srv,'/app/resource-manifest',{cookie})).data;
  assert.equal(third.art,second.art);assert.notEqual(third.revision,second.revision);
  await fs.unlink(png);
  const removed=(await request(srv,'/app/resource-manifest',{cookie})).data;assert.notEqual(removed.art,third.art);
});
test('App CSS versions relative fonts and absolute images; browsers cannot fetch game CSS',async t=>{
  const {srv,cookie}=await fixture(t);const manifest=(await request(srv,'/app/resource-manifest',{cookie})).data;
  const css=await request(srv,'/css/test.css',{cookie});assert.ok(css.text.includes(`/app-cache/${manifest.art}/assets/models/unit.png`));assert.equal(css.headers['cache-control'],'private, no-cache');
  assert.match(css.headers.vary,/User-Agent/);
  assert.ok((await request(srv,'/fonts/fonts.css',{cookie})).text.includes(`/app-cache/${manifest.art}/fonts/test.woff2`));
  assert.equal((await request(srv,'/css/test.css',{cookie,ua:desktop})).status,403);
  const forbidden=['/auth/admin/users','/data/chess.json','/js/account.js','/assets/%2e%2e/fonts/test.woff2','/assets/.secret.png'];
  for(const route of forbidden)assert.equal((await request(srv,`/app-cache/${manifest.art}${route}`,{cookie})).status,404,route);
});
test('App code/data validators and compressed cache detect replacements with unchanged size and modification time',async t=>{
  const {srv,publicDir,cookie}=await fixture(t),file=path.join(publicDir,'js/test.js');
  const old='export const test=1;'+ ' '.repeat(700),next='export const test=2;'+ ' '.repeat(700);
  await fs.writeFile(file,old);await request(srv,'/app/resource-manifest',{cookie});
  const first=await request(srv,'/js/test.js',{cookie,headers:{'Accept-Encoding':'gzip'}});
  assert.equal(gunzipSync(first.bytes).toString(),old);
  const stat=await fs.stat(file);await fs.writeFile(file,next);await fs.utimes(file,stat.atime,stat.mtime);
  const second=await request(srv,'/js/test.js',{cookie,headers:{'Accept-Encoding':'gzip','If-None-Match':first.headers.etag}});
  assert.equal(second.status,200);assert.notEqual(second.headers.etag,first.headers.etag);
  assert.equal(gunzipSync(second.bytes).toString(),next);assert.equal(second.headers['cache-control'],'private, no-cache');
});
test('versioned art keeps Spine atlas/texture relative paths and audio functional; normal browser URLs remain unchanged',()=>{
  const state={art:'a'.repeat(64)},input={skel:'/assets/models/unit.skel',atlas:'/assets/models/unit.atlas',textures:['/assets/models/unit.png'],anims:{idle:'Idle'}};
  const versioned=appArtPaths(input,state);assert.ok(validSpine(versioned));
  assert.equal(new URL('unit.png','http://app.invalid'+versioned.atlas).pathname,versioned.textures[0]);
  assert.equal(versioned.skel.replace(/\.skel$/,'.atlas'),versioned.atlas);
  const local={groups:{test:{sk:{path:versioned.skel},at:{path:versioned.atlas},png:{path:versioned.textures[0]}}}};
  assert.ok(localSpineEntry({group:'test',skel:'sk',atlas:'at',textures:['png'],anims:{idle:'Idle'}},local,null));
  const sound=appArtUrl('/assets/audio/test.mp3',state);assert.equal(mediaUrl(sound),sound);
  assert.equal(appArtPaths(input,null),input);assert.equal(appArtUrl('https://cdn.invalid/x.png',state),'https://cdn.invalid/x.png');
});
test('all browsers keep account functions but only native Apps can start games',async t=>{
  const {srv,cookie}=await fixture(t);
  for(const ua of [desktop,mobile,'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)']) {
    const login=await request(srv,'/auth/login',{ua,method:'POST',body:{username:'player',password}});
    assert.equal(login.status,200);assert.equal(login.data.playAllowed,false);
    const root=await request(srv,'/',{ua,cookie:login.cookie});assert.equal(root.status,302);assert.equal(root.headers.location,'/account');
    assert.equal((await request(srv,'/account',{ua,cookie:login.cookie})).status,200);
    await assert.rejects(TestClient.connect(srv.url.replace('http:','ws:')+'/ws',{wsOptions:{headers:{'User-Agent':ua,Cookie:login.cookie,Origin:srv.url}}}),/403/);
  }
  const admin=await request(srv,'/auth/login',{ua:mobile,method:'POST',body:{username:'admin',password}});
  assert.equal((await request(srv,'/',{ua:mobile,cookie:admin.cookie})).headers.location,'/admin');
  assert.equal((await request(srv,'/auth/admin/users',{ua:mobile,cookie:admin.cookie})).status,200);
  for(const ua of [app,desktop+' '+APP_USER_AGENT]) {
    assert.equal((await request(srv,'/',{ua,cookie})).status,200);
    const client=await TestClient.connect(srv.url.replace('http:','ws:')+'/ws',{wsOptions:{headers:{'User-Agent':ua,Cookie:cookie,Origin:srv.url}}});t.after(()=>client.close());
    await client.hello('允许游玩');assert.equal((await client.request({t:'room.create',mode:'solo',difficulty:'NORMAL'})).t,'ok');
    assert.equal((await client.request({t:'room.start'})).t,'ok');await client.request({t:'g.leave'});await client.close();
  }
  assert.equal((await request(srv,'/auth/password',{ua:mobile,cookie,method:'POST',body:{currentPassword:password,newPassword:'new123'}})).status,200);
  assert.equal((await request(srv,'/auth/login',{ua:mobile,method:'POST',body:{username:'player',password:'new123'}})).status,200);
  assert.equal(isMobileBrowser({headers:{'user-agent':desktop,'sec-ch-ua-mobile':'?1'}}),true);
  assert.equal(isMobileBrowser({headers:{'user-agent':app,'sec-ch-ua-mobile':'?1'}}),false);
});
test('App guard reloads before an opening request when server resources change, and coalesces checks',async()=>{
  const oldFetch=globalThis.fetch,oldLocation=globalThis.location,oldDocument=globalThis.document,oldWindow=globalThis.window;
  const first={version:1,art:'a'.repeat(64),revision:'b'.repeat(64)},second={...first,revision:'c'.repeat(64)};
  let latest=first,requests=0,reloads=0,sent=0;
  globalThis.fetch=async()=>{requests++;return {ok:true,json:async()=>latest};};
  globalThis.location={reload(){reloads++;}};globalThis.document={hidden:false,addEventListener(){}};globalThis.window={addEventListener(){}};
  try {
    await initAppResources();const net={request:async()=>{sent++;return 'ok';}};installAppResourceGuard(net,{get:()=>({room:null})});
    assert.equal(await net.request('room.create'), 'ok');assert.equal(sent,1);
    latest=second;await assert.rejects(net.request('room.start'),/资源已更新/);assert.equal(sent,1);assert.equal(reloads,1);
    const n=requests;await Promise.allSettled([net.request('room.create'),net.request('room.join')]);assert.equal(requests,n+1);
    globalThis.fetch=async()=>{throw new Error('offline');};await assert.rejects(net.request('room.start'),/无法检查/);assert.equal(sent,1);
    await initAppResources();assert.equal(appArtUrl('/assets/x.png'),'/assets/x.png');
  } finally {globalThis.fetch=oldFetch;globalThis.location=oldLocation;globalThis.document=oldDocument;globalThis.window=oldWindow;}
});
