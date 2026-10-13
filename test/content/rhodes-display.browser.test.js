import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {startServer,ROOT} from '../../server/index.js';
import {getData} from '../../server/data.js';
import {buildRhodesMujicaData,RI,AMIYA,NEARL,DOLRIS,AMORIS} from '../../server/sim/content/rhodes-mujica/data.js';
import {buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {makeMatch,give} from '../match/harness.js';
import {appPage} from '../helpers/appPage.mjs';
import {engineeringDamage} from '../../shared/rhodes-engineering.js';
import {ENGINEERING_BALANCE as E} from '../../server/sim/content/rhodes-mujica/balance.js';
const executablePath=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
for(const bond of [RI,'snowfieldGuideShip'])test(`actual game screen requests ${bond} opening numbers without an operator card; changed inputs invalidate old responses`,async t=>{
 if(!existsSync(executablePath)){t.skip('Chromium required');return;}
 const pack=bond===RI?'rhodes-mujica-v1':'arknights-expansion-v1',raw=bond===RI?buildRhodesMujicaData(getData()):buildExpansionData(getData()),mh=makeMatch({data:raw,fake:false,mode:'solo',difficulty:'HARD'}).start();t.after(()=>mh.m.dispose());mh.toPrep(1);
 const m=mh.m,p=mh.ps('p_0'),native=name=>Object.values(raw.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
 p.bandId=null;p.board.clear();p.layers[bond]=300;
 const ids=bond===RI?[native('波登可'),native('休谟斯'),AMIYA,NEARL,DOLRIS,AMORIS]:['chess_char_1_02_a','chess_char_2_05_a','chess_char_3_20_a','chess_char_4_22_a'];
 for(const [i,id]of ids.entries())give(m,p,id,'board',[9+Math.floor(i/2),3+i%2]);p.recompute();m.unitStats(p,1);
 const payload={pub:m.publicView(),priv:p.privateView(),stats:mh.lastTo('p_0','m.unitStats')};
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage());await page.setViewport({width:1920,height:1080});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const head=readFileSync(path.join(ROOT,'public/index.html'),'utf8').split('</head>')[0];
 await page.setRequestInterception(true);page.on('request',r=>{
  if(new URL(r.url()).pathname!=='/dev/ri-current-game.html'){r.continue();return;}
  r.respond({status:200,contentType:'text/html',body:head+`</head><body><div id="app"></div><script type="module">
   import {h,render} from '/vendor/preact.module.js';import {GameScreen} from '/js/screens/game.js';import {store} from '/js/store.js';import {net} from '/js/net.js';import {data,setMatchContent} from '/js/data.js';
   await setMatchContent({batches:[{id:'${pack}'}]});await data.loadAll(['config','assets','chess','items','bonds','stages','bands','specials','enemies']);
   window.__requests=[];window.__delay=false;window.__held=[];window.__send=msg=>net._emit('m.unitStats',msg);
   net.request=async(type,args)=>{if(type==='g.unitStats'){__requests.push(args);const msg={...__payload.stats,seq:args.seq};if(__delay)__held.push(msg);else setTimeout(()=>__send(msg),20);}return {};};
   window.__mount=payload=>{window.__payload=payload;store.set({me:{playerId:'p_0',name:'测试'},room:{mode:'solo',inMatch:true},connection:{state:'open'},match:{...store.get().match,public:payload.pub,private:payload.priv}});render(h(GameScreen),document.getElementById('app'));};window.__ready=true;
  </script></body>`});
 });
 await page.goto(srv.url+'/dev/ri-current-game.html');await page.waitForFunction(()=>window.__ready);await page.evaluate(v=>__mount(v),payload);
 await page.waitForSelector(`.bslot[data-bond="${bond}"]`,{timeout:20000});await page.click(`.bslot[data-bond="${bond}"] .bond`);
 await page.waitForFunction(()=>document.querySelector('.bpop__sec--now')?.textContent.includes('开战预计')&&!document.querySelector('.bpop__sec--now').textContent.includes('待获取'),{timeout:10000});
 const first=await page.$eval('.bpop__sec--now',el=>el.textContent);assert.ok(first.includes(bond===RI?'半径0.8格':'周围半径1.2格'));assert.ok(!await page.$('.dpanel'));assert.equal(await page.evaluate(()=>__requests.length),1);
 if(bond===RI){const n=engineeringDamage(E,300,payload.stats.rhodes.atk,2);assert.ok(first.includes('攻击力+70%'));assert.ok(first.includes('物理 '+Math.round(n.fire)));assert.ok(first.includes('法术 '+Math.round(n.fire)));}
 if(bond!==RI){await page.click('.bpop__rules summary');const displayed=await page.$$eval('[data-bond-member-value]',els=>els.map(el=>({uid:Number(el.dataset.bondMemberValue),text:el.textContent})));const expected=payload.stats.units.filter(u=>raw.chess[u.defId]?.bonds?.includes(bond));assert.equal(displayed.length,4);for(const u of expected)assert.ok(displayed.find(r=>r.uid===u.uid)?.text.includes(String(Math.round(600+Math.min(u.atk*.15,180)))));}
 await new Promise(r=>setTimeout(r,750));assert.equal(await page.evaluate(()=>__requests.length),1,'refresh timer never polls opening stats');
 await page.evaluate(async()=>{const {store}=await import('/js/store.js');__delay=true;store.patch('match',{private:{...store.get().match.private,funds:999}});});
 await page.waitForFunction(()=>__held.length===1);await page.waitForFunction(()=>document.querySelector('.bpop__sec--now').textContent.includes('待获取'));
 await page.evaluate(async()=>{const {store}=await import('/js/store.js');store.patch('match',{private:{...store.get().match.private,funds:998}});});await page.waitForFunction(()=>__held.length===2);
 await page.evaluate(()=>__send(__held[0]));await new Promise(r=>setTimeout(r,350));assert.ok((await page.$eval('.bpop__sec--now',el=>el.textContent)).includes('待获取'));
 await page.evaluate(()=>__send(__held[1]));await page.waitForFunction(()=>!document.querySelector('.bpop__sec--now').textContent.includes('待获取'));
 const out=path.join(ROOT,'../reports/bond-descriptions-20261011/visuals');mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`actual-game-${bond}-current-values.png`)});
 assert.deepEqual(errors,[]);
});
