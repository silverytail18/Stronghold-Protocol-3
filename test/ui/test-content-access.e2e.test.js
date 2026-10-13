import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {ROOT,startServer} from '../../server/index.js';
import {hashPassword} from '../../server/auth.js';
import {TestClient} from '../helpers/wsClient.js';
import {appPage} from '../helpers/appPage.mjs';

class StartedMatch{
  constructor(opts){this.opts=opts;this.testRules=opts.testRules;this.players=new Map(opts.seats.map(s=>[s.playerId,{...s,alive:true}]));}
  start(){this.opts.broadcast({t:'m.public',phase:'INFO_CHECK',round:0,testRules:this.testRules});}
  handle(){return{ok:true};}onReconnect(){}onDisconnect(){}onLeave(){}dispose(){}
}
test('real public menu stays disabled for a member, unlocks after actual host departure and submits only at start',async t=>{
  const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  if(!executablePath){t.skip('Chromium required');return;}
  const dir=await fs.mkdtemp(path.join(ROOT,'.cache','test-access-ui-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const password='public-test-content-password',passwordHash=await hashPassword(password),users=['admin','player'].map((username,i)=>({username,passwordHash,accountId:randomUUID(),role:i===0?'admin':'user',mustChangePassword:false}));
  const filename=path.join(dir,'test-content-access.json');
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,MatchClass:StartedMatch,ranked:false,testContentAccessFile:filename,auth:{secureCookie:false,users:{version:1,users}}});t.after(()=>srv.close());
  const browser=await (await import('puppeteer-core')).default.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
  const page=await browser.newPage();await page.setViewport({width:1100,height:800});const errors=[],fixedRequests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^\/(?:assets|fonts|icons|data|vendor|shared|sim)\//.test(new URL(r.url()).pathname))fixedRequests.push(r.url());});
  await page.goto(srv.url+'/login');
  const loginStatus=await page.evaluate(async password=>{const r=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password})});return r.status;},password);assert.equal(loginStatus,200);
  await page.goto(srv.url+'/admin');await page.waitForSelector('#test-access-section:not([hidden]) input');
  assert.equal(await page.$$eval('#test-access-list input',xs=>xs.length),12);assert.equal(await page.$$eval('#test-access-list input:checked',xs=>xs.length),0);
  assert.equal(await page.$eval('[data-admin-control="testOperatorGrant"]',e=>e.checked),false);await page.click('[data-admin-control="testOperatorGrant"]');
  for(const id of ['extended-rounds-20','extended-rounds-24','shop-extra-slot','opening-bans-4-6','opening-bans-5-8'])await page.click(`#test-access-list input[data-test-id="${id}"]`);
  await page.click('#test-access-form button[type="submit"]');await page.waitForFunction(()=>document.querySelector('#test-access-status').classList.contains('success'));
  assert.deepEqual(JSON.parse(await fs.readFile(filename,'utf8')).publicIds,['extended-rounds-20','extended-rounds-24','shop-extra-slot','opening-bans-4-6','opening-bans-5-8']);
  await page.reload();await page.waitForFunction(()=>document.querySelectorAll('#test-access-list input:checked').length===5);
  assert.equal(await page.$eval('[data-admin-control="testOperatorGrant"]',e=>e.checked),true);assert.equal(JSON.parse(await fs.readFile(filename,'utf8')).adminControls.testOperatorGrant,true);
  await page.screenshot({path:path.join(ROOT,'.cache/test-content-access-admin.png'),fullPage:true});assert.deepEqual(fixedRequests,[]);
  const response=await fetch(srv.url+'/auth/login',{method:'POST',headers:{Origin:srv.url,'Content-Type':'application/json','User-Agent':'StrongholdProtocolApp/1'},body:JSON.stringify({username:'player',password})});const cookie=response.headers.get('set-cookie').split(';')[0];await response.arrayBuffer();
  const client=await TestClient.connect(srv.url.replace('http','ws')+'/ws',{wsOptions:{headers:{Cookie:cookie,Origin:srv.url}}});t.after(()=>client.close());const hello=await client.hello('普通房主',undefined,{testContentVersion:1});
  const adminCookie=(await page.cookies()).find(c=>c.name==='sp_auth');
  const host=await TestClient.connect(srv.url.replace('http','ws')+'/ws',{wsOptions:{headers:{Cookie:`sp_auth=${adminCookie.value}`,Origin:srv.url}}});t.after(()=>host.close());await host.hello('原房主',undefined,{testContentVersion:1});
  await host.request({t:'room.create',mode:'coop',difficulty:'NORMAL'});const created=await host.waitFor('room.state');await client.request({t:'room.join',code:created.code});let room=await client.waitFor('room.state');assert.deepEqual(room.testMenu.items.map(i=>i.id),['extended-rounds-20','extended-rounds-24','shop-extra-slot','opening-bans-4-6','opening-bans-5-8']);
  const game=await appPage(await browser.newPage());await game.setViewport({width:844,height:390});game.on('pageerror',e=>errors.push(e.message));
  const calls=[];await game.exposeFunction('__request',async(type,fields)=>{calls.push({type,fields});return client.request({t:type,...fields});});
  await game.setRequestInterception(true);game.on('request',async req=>{
    if(new URL(req.url()).pathname!=='/dev/public-room-test.html'){await req.continue();return;}
    await req.respond({status:200,contentType:'text/html',body:`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><link rel="stylesheet" href="/css/theme.css"><link rel="stylesheet" href="/css/components.css"><link rel="stylesheet" href="/css/screens/room.css"><link rel="stylesheet" href="/css/devices.css"><div id="app"></div><script type="module">
      import {h,render,Fragment} from '/vendor/preact.module.js';import {UiHosts} from '/js/ui/components.js';import {RoomScreen} from '/js/screens/room.js';import {store} from '/js/store.js';import {net} from '/js/net.js';import {data} from '/js/data.js';
      await Promise.all(['config','assets'].map(n=>data.load(n)));net.request=(type,fields)=>window.__request(type,fields);
      window.__render=(room,playerId)=>{store.set({room,me:{playerId},session:{entered:true},connection:{status:'online'}});render(h(Fragment,null,h(RoomScreen),h(UiHosts)),document.getElementById('app'));};window.__ready=true;
    </script></html>`});
  });
  await game.goto(srv.url+'/dev/public-room-test.html');await game.waitForFunction(()=>window.__ready);await game.evaluate((room,id)=>__render(room,id),room,hello.playerId);
  await game.waitForFunction(()=>document.querySelector('.room-tests')?.disabled);assert.equal(await game.$('.room-tests-modal'),null);
  await game.$eval('.room-tests',el=>el.click());assert.equal(await game.$('.room-tests-modal'),null);
  assert.equal((await client.request({t:'room.start',tests:{version:room.testMenu.version,ids:['extended-rounds-24']}})).code,'NOT_HOST');
  await host.request({t:'room.leave'});room=await client.waitFor('room.state',s=>s.hostId===hello.playerId);await game.evaluate((room,id)=>__render(room,id),room,hello.playerId);
  await game.waitForFunction(()=>document.querySelector('.room-tests')&&!document.querySelector('.room-tests').disabled);
  await game.click('.room-tests');await game.waitForSelector('.room-tests-modal');assert.equal(await game.$$eval('.room-test-option input',xs=>xs.length),5);
  assert.equal(await game.$$eval('.room-test-option input:checked',xs=>xs.length),0);
  for(const id of ['extended-rounds-20','extended-rounds-24','shop-extra-slot','opening-bans-4-6','opening-bans-5-8'])await game.click(`.room-test-option input[data-test-id="${id}"]`);
  assert.equal(await game.$eval('input[data-test-id="opening-bans-4-6"]',e=>e.checked),false);
  assert.equal(await game.$eval('input[data-test-id="opening-bans-5-8"]',e=>e.checked),true);
  assert.equal((await client.request({t:'room.start',tests:{version:room.testMenu.version,ids:['opening-bans-4-6','opening-bans-5-8']}})).t,'error');
  assert.equal(srv.lobby.rooms.get(room.code).match,null);
  assert.equal(calls.length,0);await game.screenshot({path:path.join(ROOT,'.cache/test-content-access-player.png')});
  await game.click('.room-tests-modal .btn--primary');assert.equal(calls.length,0);await game.click('.room-bar__right .btn--xl');await client.waitFor('m.public');
  assert.deepEqual(calls.find(c=>c.type==='room.start').fields.tests.ids,['extended-rounds-24','shop-extra-slot','opening-bans-5-8']);assert.equal(srv.lobby.rooms.get(room.code).match.opts.data.config.modes.mode_multi_normal.bossRound,24);
  assert.deepEqual(srv.lobby.rooms.get(room.code).match.opts.data.config.bans.NORMAL,{core:5,addon:8});
  assert.deepEqual(errors,[]);
});
