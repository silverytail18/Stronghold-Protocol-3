import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {startServer,ROOT} from '../../server/index.js';
import {TestContent} from '../../server/test-content.js';
import {GameData} from '../../server/match/gamedata.js';
import {DATA} from '../match/harness.js';
import {appPage} from '../helpers/appPage.mjs';

test('production menu combines independent tests, round choices exclude each other, and the sixth shop card works on small screens',async t=>{
  const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  if(!executablePath){t.skip('Chromium required');return;}
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  const puppeteer=(await import('puppeteer-core')).default,browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
  const page=await appPage(await browser.newPage());await page.setViewport({width:1280,height:720});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setRequestInterception(true);page.on('request',async req=>{
    if(new URL(req.url()).pathname!=='/dev/test-batches-ui.html'){await req.continue();return;}
    await req.respond({status:200,contentType:'text/html',body:`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><link rel="stylesheet" href="/fonts/fonts.css"><link rel="stylesheet" href="/css/theme.css"><link rel="stylesheet" href="/css/components.css"><link rel="stylesheet" href="/css/screens/room.css"><link rel="stylesheet" href="/css/screens/game-shop.css"><link rel="stylesheet" href="/css/devices.css"><div id="app"></div><script type="module">
    import {render,h,Fragment} from '/vendor/preact.module.js';import {UiHosts} from '/js/ui/components.js';import {RoomScreen} from '/js/screens/room.js';import {ShopBar} from '/js/ui/shopBar.js';import {store} from '/js/store.js';import {net} from '/js/net.js';import {data} from '/js/data.js';
    await data.loadAll('config','assets','chess','bonds','items','local');window.__calls=[];net.request=async(type,fields)=>{__calls.push({type,fields});return {};};
    window.__room=room=>{store.set({room,me:{playerId:'p1'},connection:{status:'online'}});render(h(Fragment,null,h(RoomScreen),h(UiHosts)),document.getElementById('app'));};
    window.__shop=priv=>render(h(ShopBar,{priv,editable:true,collapsed:false,onCollapse:()=>{},onBuy:idx=>__calls.push({type:'buy',idx}),onLevel:()=>{},onRefresh:()=>__calls.push({type:'refresh'}),onFreeze:()=>__calls.push({type:'freeze'}),onDetail:()=>{},onDetailClose:()=>{}}),document.getElementById('app'));window.__ready=true;
    </script></html>`});
  });
  await page.goto(srv.url+'/dev/test-batches-ui.html',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__ready);
  const content=new TestContent(),room={code:'TEST',hostId:'p1',mode:'coop',difficulty:'HARD',seats:[{seat:0,playerId:'p1',name:'管理员',connected:true}],testMenu:content.menu({mode:'coop',difficulty:'HARD'})};
  await page.evaluate(r=>__room(r),room);await page.click('.room-tests');await page.waitForSelector('.room-tests-modal');
  assert.equal(await page.$$eval('.room-test-option input',xs=>xs.length),content.entries.length);
  for(const id of ['extended-rounds-20','extended-rounds-24','extended-rounds-30','shop-extra-slot','coop-pool-150','strategy-confirm-order'])await page.click(`.room-test-option input[data-test-id="${id}"]`);
  assert.deepEqual(await page.$$eval('.room-test-option input:checked',xs=>xs.map(x=>x.dataset.testId)),['extended-rounds-30','shop-extra-slot','coop-pool-150','strategy-confirm-order']);
  assert.deepEqual(await page.evaluate(()=>__calls),[]);
  await page.screenshot({path:path.join(ROOT,'.cache/test-batches-menu-desktop.png')});
  await page.setViewport({width:844,height:390,isMobile:true,hasTouch:true});
  await page.waitForFunction(()=>window.__ready);await page.evaluate(r=>__room(r),room);await page.click('.room-tests');await page.waitForSelector('.room-tests-modal');
  for(const id of ['extended-rounds-30','shop-extra-slot','coop-pool-150','strategy-confirm-order'])await page.click(`.room-test-option input[data-test-id="${id}"]`);
  const modal=await page.$eval('.room-tests-modal',el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,right:r.right,left:r.left,scroll:el.scrollHeight};});assert.ok(modal.left>=0&&modal.right<=844&&modal.top>=0&&modal.bottom<=390);
  await page.screenshot({path:path.join(ROOT,'.cache/test-batches-menu-mobile.png')});
  await page.click('.room-tests-modal .btn--primary');await page.click('.room-bar__right .btn--xl');
  assert.deepEqual(await page.evaluate(()=>__calls.find(c=>c.type==='room.start').fields.tests.ids),['extended-rounds-30','shop-extra-slot','coop-pool-150','strategy-confirm-order']);
  await page.evaluate(r=>__room(r),{...room,code:'STND',difficulty:'FUNNY',testMenu:content.menu({mode:'coop',difficulty:'FUNNY'})});await page.click('.room-tests');await page.waitForSelector('.room-tests-modal');
  assert.deepEqual(await page.$$eval('.room-test-option input',xs=>xs.map(x=>x.disabled)),[true,true,true,false,false,false,true,true,false,false,false,false]);
  await page.click('.room-tests-modal .btn--primary');
  const gd=new GameData(DATA,'mode_multi_normal'),id=gd.visibleChess.find(id=>gd.tierOf(id)===1),item=gd.shopItemsByTier[1][0];
  const priv={funds:12,hand:Array(10).fill(null),deployCount:0,deployCap:8,ready:false,shop:{level:6,maxLevel:6,upgradePrice:0,refreshPrice:1,slots:[...Array.from({length:6},()=>({kind:'chess',id,price:2})),{kind:'item',id:item,price:2}]}};
  await page.evaluate(p=>{__calls.length=0;__shop(p);},priv);await page.waitForSelector('.shopbar.is-expanded');
  for(const [width,height]of [[844,390],[568,320]]){
    await page.setViewport({width,height,isMobile:true,hasTouch:true});
    await page.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelector('.shopbar')).maxWidth)<=innerWidth,{timeout:3000});
    const rect=await page.$eval('.shopbar__row',el=>{const r=el.getBoundingClientRect(),p=el.parentElement,cs=getComputedStyle(p);return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,innerWidth:innerWidth,parentWidth:p.getBoundingClientRect().width,max:cs.maxWidth,sa:getComputedStyle(document.documentElement).getPropertyValue('--sa-l'),content:el.scrollWidth,client:el.clientWidth};});assert.ok(rect.left>=0&&rect.right<=width&&rect.top>=0&&rect.bottom<=height,JSON.stringify({width,rect}));
    assert.equal(await page.$$eval('.shopbar__cards .scard',xs=>xs.length),6);
    const sixth=(await page.$$('.shopbar__cards .scard'))[5];await sixth.click();await sixth.click();assert.equal(await page.evaluate(()=>__calls.filter(c=>c.type==='buy').at(-1).idx),5);
    await page.screenshot({path:path.join(ROOT,`.cache/test-batches-shop-${width}.png`)});
  }
  await page.click('.toolbtn--amber');await page.click('.toolbtn--ice');assert.ok((await page.evaluate(()=>__calls)).some(c=>c.type==='refresh'));assert.ok((await page.evaluate(()=>__calls)).some(c=>c.type==='freeze'));assert.deepEqual(errors,[]);
});
