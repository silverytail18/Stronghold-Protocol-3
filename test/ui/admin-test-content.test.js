import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {startServer,ROOT} from '../../server/index.js';
import {appPage} from '../helpers/appPage.mjs';
import {testSelectionKey,toggleTestSelection} from '../../public/js/ui/testContent.js';

test('test selections follow dependencies and conflicts, and cannot survive a room, host or connection change',()=>{
  const items=[{id:'a',enabled:true},{id:'b',enabled:true,requires:['a']},{id:'c',enabled:true,conflicts:['a']},{id:'draft',enabled:false}];
  assert.deepEqual(toggleTestSelection(items,[],'b'),['a','b']);assert.deepEqual(toggleTestSelection(items,['a','b'],'a'),[]);assert.deepEqual(toggleTestSelection(items,['a','b'],'c'),['c']);assert.deepEqual(toggleTestSelection(items,[],'draft'),[]);
  const room={code:'ABCD',hostId:'p1',difficulty:'NORMAL',testMenu:{version:'1'}};
  for(const next of [{...room,code:'EFGH'},{...room,hostId:'p2'},{...room,difficulty:'FUNNY'},{...room,ranked:true}])assert.notEqual(testSelectionKey(room,'p1'),testSelectionKey(next,'p1'));
  assert.notEqual(testSelectionKey(room,'p1'),testSelectionKey(room,'p1',false));
});

test('real room UI places the admin button beside the guide, submits selections only at start, and clears on leave or host changes',async t=>{
  const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);if(!executablePath){t.skip('Chromium required');return;}
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  const puppeteer=(await import('puppeteer-core')).default,browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
  const page=await appPage(await browser.newPage());await page.setViewport({width:1280,height:720});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setRequestInterception(true);page.on('request',async req=>{
    if(new URL(req.url()).pathname!=='/dev/admin-room-test.html'){await req.continue();return;}
    await req.respond({status:200,contentType:'text/html',body:`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><link rel="stylesheet" href="/fonts/fonts.css"><link rel="stylesheet" href="/css/theme.css"><link rel="stylesheet" href="/css/components.css"><link rel="stylesheet" href="/css/screens/room.css"><link rel="stylesheet" href="/css/ranked.css"><link rel="stylesheet" href="/css/devices.css"><div id="app"></div><script type="module">
      import {render,h,Fragment} from '/vendor/preact.module.js';import {UiHosts} from '/js/ui/components.js';import {RoomScreen} from '/js/screens/room.js';import {store} from '/js/store.js';import {net} from '/js/net.js';import {data} from '/js/data.js';
      await Promise.all(['config','assets'].map(name=>data.load(name)));window.__calls=[];net.request=async(type,fields)=>{__calls.push({type,fields:structuredClone(fields)});return {};};
      window.__room={code:'ABCD',hostId:'p1',mode:'solo',difficulty:'NORMAL',seats:[{seat:0,playerId:'p1',name:'测试管理员',connected:true}],testMenu:{version:'fixture-menu',items:[{id:'a',name:'测试 A',description:'独立功能 A',enabled:true},{id:'b',name:'测试 B',description:'独立功能 B',enabled:true}]}};
      window.__setRoom=room=>store.set({room,session:{entered:true},me:{playerId:'p1',name:'测试管理员'},connection:{status:'online',ping:25}});__setRoom(__room);render(h(Fragment,null,h(RoomScreen),h(UiHosts)),document.getElementById('app'));window.__ready=true;
    </script></html>`});
  });
  await page.goto(srv.url+'/dev/admin-room-test.html',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__ready);
  const positions=await page.evaluate(()=>({guide:document.querySelector('.room-guide').getBoundingClientRect().right,test:document.querySelector('.room-tests').getBoundingClientRect().left}));assert.ok(positions.test>=positions.guide,'test button is right of guide');
  await page.click('.room-tests');await page.waitForSelector('.room-tests-modal');await page.click('.room-test-option:nth-child(1) input');await page.click('.room-test-option:nth-child(2) input');assert.deepEqual(await page.evaluate(()=>__calls),[]);
  await page.screenshot({path:path.join(ROOT,'.cache/admin-tests-desktop.png')});await page.click('.room-tests-modal .btn--primary');await page.click('.room-bar__right .btn--xl');await page.waitForFunction(()=>__calls.some(c=>c.type==='room.start'));
  assert.deepEqual(await page.evaluate(()=>__calls.find(c=>c.type==='room.start').fields.tests.ids),['a','b']);
  await page.evaluate(()=>{__calls.length=0;__setRoom({...__room,hostId:'p2',mode:'coop',seats:[...__room.seats,{seat:1,playerId:'p2',name:'普通房主',connected:true}]});});await page.waitForFunction(()=>document.querySelector('.room-tests')?.disabled);assert.equal(await page.$('.room-tests-modal'),null);
  await page.evaluate(()=>__setRoom({...__room,code:'NEW1'}));await page.waitForFunction(()=>!document.querySelector('.room-tests')?.disabled);await page.click('.room-bar__right .btn--xl');await page.waitForFunction(()=>__calls.length>0);assert.deepEqual(await page.evaluate(()=>__calls.find(c=>c.type==='room.start').fields.tests.ids),[]);
  await page.evaluate(()=>{__calls.length=0;__setRoom({...__room,code:'NEW2'});});await page.click('.room-tests');await page.waitForSelector('.room-tests-modal');await page.click('.room-test-option:nth-child(1) input');await page.click('.room-tests-modal .btn--primary');await page.click('button[aria-label="离开同盟"]');await page.waitForFunction(()=>__calls.some(c=>c.type==='room.leave'));assert.ok(!(await page.evaluate(()=>__calls)).some(c=>c.type==='room.start'));
  await page.evaluate(()=>{__calls.length=0;__setRoom({...__room,code:'NEW3'});});await page.waitForSelector('.room-tests');await page.click('.room-bar__right .btn--xl');await page.waitForFunction(()=>__calls.length>0);assert.deepEqual(await page.evaluate(()=>__calls.find(c=>c.type==='room.start').fields.tests.ids),[]);
  await page.setViewport({width:844,height:390,isMobile:true,hasTouch:true,deviceScaleFactor:1});await page.click('.room-tests');await page.waitForSelector('.room-tests-modal');await page.screenshot({path:path.join(ROOT,'.cache/admin-tests-mobile.png')});
  const box=await page.$eval('.room-tests-modal',el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};});assert.ok(box.left>=0&&box.right<=844&&box.top>=0&&box.bottom<=390,'dialog fits phone landscape');
  await page.click('.room-tests-modal .btn--primary');await page.evaluate(()=>{__calls.length=0;const {testMenu,...room}=__room;__setRoom({...room,code:'USER',mode:'coop',seats:[...room.seats,{seat:1,playerId:'p2',name:'管理员成员',ready:true,connected:true}]});});await page.waitForFunction(()=>!document.querySelector('.room-tests'));await page.click('.room-bar__right .btn--xl');await page.waitForFunction(()=>__calls.length>0);assert.deepEqual(await page.evaluate(()=>__calls.find(c=>c.type==='room.start').fields),{});assert.deepEqual(errors,[]);
});
