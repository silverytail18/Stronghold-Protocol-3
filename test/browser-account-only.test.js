import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {existsSync} from 'node:fs';
import {startServer} from '../server/index.js';
import {hashPassword} from '../server/auth.js';
import {TestClient} from './helpers/wsClient.js';

const browserAgent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36';
const password='browser-policy-password';
async function fixture(t){
  const passwordHash=await hashPassword(password);
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,ranked:{filename:':memory:'},auth:{secureCookie:false,users:{version:1,users:[
    {username:'admin',passwordHash,role:'admin',mustChangePassword:false},
    {username:'player',passwordHash,role:'user',mustChangePassword:false},
  ]}}});t.after(()=>srv.close());return srv;
}
function request(srv,route,{method='GET',cookie,body,agent=browserAgent}={}){
  return new Promise((resolve,reject)=>{
    const req=http.request(srv.url,{path:route,method,headers:{Origin:srv.url,'User-Agent':agent,...cookie?{Cookie:cookie}:{},...body?{'Content-Type':'application/json'}:{}}},res=>{
      const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>{const bytes=Buffer.concat(chunks);let data;try{data=JSON.parse(bytes.toString());}catch{}
        resolve({status:res.statusCode,headers:res.headers,data,bytes,cookie:res.headers['set-cookie']?.[0].split(';')[0]});});
    });req.on('error',reject);req.end(body?JSON.stringify(body):undefined);
  });
}
test('Windows browsers can manage accounts but cannot receive game pages, fixed resources or game sockets',async t=>{
  const srv=await fixture(t);
  for(const username of ['admin','player']){
    const login=await request(srv,'/auth/login',{method:'POST',body:{username,password}});assert.equal(login.status,200);assert.equal(login.data.playAllowed,false);
    const {cookie}=login;const destination=username==='admin'?'/admin':'/account';
    for(const route of ['/','/index.html?room=ABCD','/login?next=%2F'])assert.equal((await request(srv,route,{cookie})).headers.location,destination);
    const page=await request(srv,destination,{cookie});assert.equal(page.status,200);assert.ok(!page.bytes.toString().includes('href="/"'));
    for(const route of ['/js/account.js','/js/ranked-admin.js','/js/adminTestControls.js','/css/account.css'])assert.equal((await request(srv,route,{cookie})).status,200);
    for(const route of ['/js/main.js','/css/app.css','/assets/models/unit.png','/assets/audio/bgm/act1.mp3','/media/bgm/act1','/fonts/fonts.css','/icons/ranks/bronze.svg','/data/chess.json','/data/assets.json','/shared/constants.js','/sim/Battle.js','/vendor/preact.module.js','/dev/game-mock.html','/app/resource-manifest','/app/resource-pack/'+ 'a'.repeat(64)+'.zip','/app-cache/'+ 'a'.repeat(64)+'/assets/x.png','/%61ssets/x.png','//assets/x.png','/assets/../index.html','/%69ndex.html','/js/%6dain.js','/js/login.js/../main.js']){
      const denied=await request(srv,route,{cookie});assert.equal(denied.status,403,route);assert.equal(denied.data.code,'APP_REQUIRED',route);assert.ok(denied.bytes.length<512);
      const head=await request(srv,route,{cookie,method:'HEAD'});assert.equal(head.status,403,route);assert.equal(head.bytes.length,0);
    }
    await assert.rejects(TestClient.connect(srv.url.replace('http:','ws:')+'/ws',{wsOptions:{headers:{'User-Agent':browserAgent,Cookie:cookie,Origin:srv.url}}}),/403/);
    assert.equal((await request(srv,'/auth/admin/users',{cookie})).status,username==='admin'?200:403);
  }
  const login=await request(srv,'/auth/login',{method:'POST',body:{username:'player',password}});
  const change=await request(srv,'/auth/password',{cookie:login.cookie,method:'POST',body:{currentPassword:password,newPassword:'changed-browser-password'}});assert.equal(change.status,200);
  assert.equal((await request(srv,'/auth/session',{cookie:login.cookie})).data.authenticated,false);
  assert.equal((await request(srv,'/auth/login',{method:'POST',body:{username:'player',password:'changed-browser-password'},agent:'StrongholdProtocolApp/1'})).status,200);
});
test('browsers cannot load the game even with authentication disabled',async t=>{
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  assert.equal((await request(srv,'/')).headers.location,'/downloads');
  assert.equal((await request(srv,'/login')).headers.location,'/downloads');
  assert.equal((await request(srv,'/data/config.json')).status,403);
  await assert.rejects(TestClient.connect(srv.url.replace('http:','ws:')+'/ws',{wsOptions:{headers:{'User-Agent':browserAgent}}}),/403/);
  assert.equal((await request(srv,'/',{agent:'StrongholdProtocolApp/1'})).status,200);
});
test('real Windows Chromium login/account navigation requests zero game resources and opens zero game sockets',async t=>{
  const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  if(!executablePath){t.skip('Chromium unavailable; HTTP/socket policy tests still run');return;}
  const srv=await fixture(t);const puppeteer=(await import('puppeteer-core')).default;
  const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-gpu']});t.after(()=>browser.close());
  const routes=[],errors=[];let upgrades=0;srv.server.on('request',req=>routes.push(req.url));srv.server.on('upgrade',()=>upgrades++);
  const page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(srv.url+'/?room=ABCD',{waitUntil:'networkidle0'});assert.equal(new URL(page.url()).pathname,'/login');
  await page.type('#username','admin');await page.type('#password',password);
  await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.click('#login-submit')]);
  assert.equal(new URL(page.url()).pathname,'/admin');await page.waitForFunction(()=>document.querySelector('#account-name').textContent.includes('admin'));
  await page.goto(srv.url+'/index.html?room=ABCD',{waitUntil:'networkidle0'});assert.equal(new URL(page.url()).pathname,'/admin');
  await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.click('a[href="/downloads"]')]);
  assert.equal(new URL(page.url()).pathname,'/downloads');
  assert.deepEqual(errors,[]);assert.equal(upgrades,0);
  assert.deepEqual(routes.filter(route=>/^\/(assets|fonts|icons|data|media|vendor|sim|shared|app-cache|app\/resource-)/.test(route)),[]);
  assert.ok(routes.includes('/js/account.js'));assert.ok(routes.includes('/css/account.css'));
  t.diagnostic('Real Windows browser: login → admin → root redirect → download page; 0 game resource requests, 0 WebSocket upgrades');
});
