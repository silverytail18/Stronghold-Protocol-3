import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {startServer,ROOT} from '../../server/index.js';
import {getData} from '../../server/data.js';
import {buildRhineData} from '../../server/sim/content/rhine/data.js';
import {ensure} from '../../server/sim/content/rhine/state.js';
import {makeMatch} from '../match/harness.js';
import {RHINE,TECHNOLOGIES} from '../../shared/rhine.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
import {appPage} from '../helpers/appPage.mjs';

test('Rhine browser: scrollable tree, real 2D selector, colored field marks, Spine and deterministic browser sim',async t=>{
  const executablePath=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
  assert.ok(existsSync(executablePath),'Chromium is required for this acceptance check');
  const raw=buildRhineData(getData()),h=makeMatch({data:raw,mode:'solo',fake:true}).start();
  t.after(()=>h.m.dispose());h.toPrep(1);const p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];
  const cells=[...p.deployMap().keys()].map(k=>k.split(',').map(Number));
  for(const [i,id]of ['chess_rhine_halo_a','chess_rhine_astesi_a','chess_rhine_otter_a','chess_rhine_mgllan_a','chess_rhine_slent2_b','chess_rhine_ifrit_b'].entries())p.board.set(cells[i].join(','),p.newPiece('chess',id));
  p.layers[RHINE]=999;p.recompute();const st=ensure(p);st.research=TECHNOLOGIES.filter(t=>!['T03','T13','T11','T16'].includes(t.id)).map(t=>t.id);
  // The six-member fixture spends exactly 19 points. Two inactive colors are included only for palette QA.
  st.positions={T01:[cells[0],cells[6]],T02:[cells[1]],T03:[cells[2]],T04:[cells[3],cells[7]],T06:[cells[4]],T13:[cells[5]]};
  const priv=p.privateView(),stageId=h.m.stageId,rules={batches:[{id:'rhine-lab-v1'}]};
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  await fs.mkdir(path.join(ROOT,'.cache'),{recursive:true});
  const userDataDir=await fs.mkdtemp(path.join(ROOT,'.cache/rhine-browser-'));
  const browser=await (await import('puppeteer-core')).default.launch({executablePath,userDataDir,headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});t.after(()=>browser.close());
  const page=await appPage(await browser.newPage()),errors=[];
  page.on('pageerror',e=>{errors.push(e.stack||e.message);});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.setViewport({width:1280,height:720});await page.setRequestInterception(true);
  page.on('request',async req=>{
    if(new URL(req.url()).pathname!=='/dev/rhine-qa.html'){await req.continue();return;}
    await req.respond({status:200,contentType:'text/html',body:`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><link rel="stylesheet" href="/css/theme.css"><link rel="stylesheet" href="/css/components.css"><link rel="stylesheet" href="/css/rhine.css"><link rel="stylesheet" href="/css/ranked.css"><link rel="stylesheet" href="/css/social.css"><link rel="stylesheet" href="/css/screens/game-panels.css"><link rel="stylesheet" href="/css/screens/result.css"><link rel="stylesheet" href="/css/screens/game.css"><link rel="stylesheet" href="/css/screens/title.css"><link rel="stylesheet" href="/css/screens/lobby.css"><link rel="stylesheet" href="/css/encyclopedia.css"><link rel="stylesheet" href="/css/screens/guide.css"><link rel="stylesheet" href="/css/devices.css"><style>html{font-size:100px}body{margin:0;background:#101918}#field{position:absolute;inset:0}#flat{position:absolute;inset:0;display:none}</style><div id="field"></div><div id="flat"></div><div id="panel"></div><script type="module">
      import {render,h} from '/vendor/preact.module.js';import {TitleScreen} from '/js/screens/title.js';import {LobbyScreen} from '/js/screens/lobby.js';import {store} from '/js/store.js';import {RhinePanel} from '/js/ui/rhinePanel.js';import {RecordDetail} from '/js/ui/matchRecords.js';import {Modal} from '/js/ui/components.js';import {BondPopupBody} from '/js/ui/bondStrip.js';import {EncyclopediaHost,encyclopediaStore} from '/js/ui/encyclopedia.js';import {data,setMatchContent} from '/js/data.js';import {net} from '/js/net.js';import {createFieldView} from '/js/render/app.js';import {createFallbackView} from '/js/ui/fallbackField.js';import {loadBrowserSim} from '/js/battle/runner.js';
      await data.loadAll('config','assets','chess','bonds','items','tokens','local','stages','bands','garrisons');await setMatchContent(${JSON.stringify(rules)});
      window.__record=record=>render(h(Modal,{open:true,title:'对局记录',class:'records-modal',width:'min(760px, calc(100vw - 32px))'},h(RecordDetail,{record})),document.getElementById('panel'));window.__bond=props=>render(h(BondPopupBody,props),document.getElementById('panel'));window.__encyclopedia=()=>{render(h(EncyclopediaHost),document.getElementById('panel'));encyclopediaStore.set({open:true});};window.__title=()=>render(h(TitleScreen),document.getElementById('panel'));window.__lobby=()=>{store.set({room:null,connection:{status:'offline'},session:{entered:true},me:{playerId:'p1',name:'版本验收'}});render(h(LobbyScreen),document.getElementById('panel'));};window.__calls=[];net.request=async(type,fields)=>{__calls.push({type,fields});return {};};
      window.__show=priv=>render(h(RhinePanel,{priv,phase:'PREP',gd:{chess:id=>data.lookup('chess',id)}}),document.getElementById('panel'));
      window.__view=await createFieldView(document.getElementById('field'),{data,board:'2d'});__view.setStage(data.lookup('stages',${JSON.stringify(stageId)}));__view.setCamera('prep');
      window.__flat=createFallbackView(document.getElementById('flat'),{data});__flat.setStage(data.lookup('stages',${JSON.stringify(stageId)}));
      window.__sim=await loadBrowserSim({testRules:${JSON.stringify(rules)}});window.__data=data;window.__content=setMatchContent;window.__ready=true;
    </script></html>`});
  });
  await page.goto(srv.url+'/dev/rhine-qa.html',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__ready,{timeout:60000});
  await page.evaluate(priv=>{__show(priv);__view.setPrep(priv);__flat.setPrep(priv);},priv);
  await page.waitForFunction(()=>__view.stats().spine.ready>=6,{timeout:60000});
  const out=path.join(ROOT,'../reports/rhine-0.5.3/screenshots');await fs.mkdir(out,{recursive:true});
  await page.screenshot({path:path.join(out,'rhine-field-desktop.png')});
  const fieldMarks=await page.evaluate(()=>{__view.highlightTiles([[10,5]],'range');__view.highlightTiles(null);return{marks:__view.debug.tiles.rhineHighlights.map(m=>m.style.color),ordinary:__view.debug.tiles.highlights.size,spine:__view.stats().spine};});
  assert.equal(fieldMarks.marks.length,8);assert.equal(new Set(fieldMarks.marks).size,6);assert.equal(fieldMarks.ordinary,0);assert.equal(fieldMarks.spine.failed,0);
  await page.click('[data-testid="rhine-entry"]');await page.waitForSelector('[data-testid="rhine-tree"]');
  assert.equal(await page.$$eval('[data-tech]',xs=>xs.length),14);assert.equal(await page.$$eval('.rhine-tree-lines path',xs=>xs.length),15);
  assert.ok(await page.$eval('.rhine-tree-scroll',el=>el.scrollHeight>el.clientHeight));
  for(const id of ['T03','T13']){const label=await page.$eval('[data-tech="'+id+'"] .rhine-tech__require',el=>el.textContent);assert.ok(label.includes('解锁9人')&&label.includes('生效6人')&&label.includes('3科技点'),label);assert.equal(await page.$eval('[data-tech="'+id+'"] footer button',el=>el.disabled),true,'six members cannot research '+id);}
  for(const [id,n]of [['T01',3],['T07',6]])assert.ok((await page.$eval('[data-tech="'+id+'"] .rhine-tech__require',el=>el.textContent)).includes('生效'+n+'人'));

  await page.screenshot({path:path.join(out,'rhine-tree-desktop.png')});
  await page.$eval('.rhine-tree-scroll',el=>{el.scrollTop=el.scrollHeight;});assert.ok(await page.$eval('[data-tech="T03"]',el=>el.getBoundingClientRect().top<innerHeight));
  await page.click('[data-tech="T04"] footer button');await page.waitForSelector('[data-testid="rhine-map"]');
  assert.equal(await page.$$eval('.rhine-cell',xs=>xs.length),36);assert.equal(await page.$$eval('.rhine-map .rhine-cell__mark',xs=>xs.length),8);
  assert.equal(await page.$eval(`[data-position="${cells[0]}"]`,el=>el.disabled),true);
  await page.click(`[data-position="${cells[3]}"]`);await page.click(`[data-position="${cells[7]}"]`);
  const free=priv.rhine.grid.find(cell=>cell.legal&&!Object.values(st.positions).flat().some(q=>q.join(',')===cell.position.join(','))).position;
  await page.click(`[data-position="${free}"]`);await page.screenshot({path:path.join(out,'rhine-selector-desktop.png')});
  await page.$$eval('.rhine-select footer button',xs=>xs.find(b=>b.textContent==='确认位置').click());
  await page.waitForFunction(()=>__calls.length>0);assert.deepEqual(await page.evaluate(()=>__calls.at(-1)),{type:'g.rhinePositions',fields:{id:'T04',positions:[free]}});
  for(const [width,height]of [[844,390],[568,320]]){await page.setViewport({width,height});await page.screenshot({path:path.join(out,`rhine-tree-${width}.png`)});const r=await page.$eval('.rhine-panel',el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom};});assert.ok(r.left>=0&&r.right<=width&&r.top>=0&&r.bottom<=height,JSON.stringify(r));}
  await page.click('[aria-label="关闭科技菜单"]');await page.setViewport({width:1280,height:720});
  await page.evaluate(()=>{document.getElementById('flat').style.display='block';__flat.highlightTiles(null);});
  await page.waitForFunction(()=>document.querySelectorAll('.ff-tile .rhine-cell__mark').length===8);await page.screenshot({path:path.join(out,'rhine-field-fallback.png')});
  const marks=Object.entries(st.positions).flatMap(([id,tiles])=>tiles.map(([row,col])=>({id,row,col,playerId:p.playerId})));
  await page.evaluate(marks=>{__flat.enterBattle({fieldId:'qa'});__flat.pushSnapshot({fieldId:'qa',units:[],rhine:marks});__flat.highlightTiles(null);},marks);
  await page.waitForFunction(()=>document.querySelectorAll('.ff-tile .rhine-cell__mark').length===8);
  const spec=buildBattleSpec({kind:'normal',seed:31,stageId,modeId:'mode_single_normal',round:8,timeLimit:20,players:[{playerId:'p1',units:[{uid:1,chessId:'chess_rhine_ifrit_b',row:10,col:3,dir:'RIGHT',skillIndex:1},{uid:2,chessId:'chess_char_1_01_a',rhineIdentity:true,row:11,col:3,dir:'RIGHT'}],bonds:{rhineShip:{active:true,count:6,tier:2,layers:600}},contentInfo:{rhine:{count:6,layers:600,active:['T04','T01','T02','T07','T12','T13'],positions:{T01:[[10,3]],T02:[[11,4]],T04:[[10,5]],T13:[[11,3]]}}}}],spawns:[{key:Object.keys(raw.enemies)[0],time:0,pos:[10,5]}]});
  const server=createBattleFromSpec(spec,new DataSource(raw,null),{quiet:true});server.runToEnd(25);assert.deepEqual(server.errors,[]);
  const browserResult=await page.evaluate(spec=>{const b=__sim.spec.createBattleFromSpec(spec,__sim.ds,{quiet:true});b.runToEnd(25);return{hash:__sim.spec.resultDigest(b.result()).hash,errors:b.errors};},spec);
  assert.deepEqual(browserResult.errors,[]);assert.equal(browserResult.hash,resultDigest(server.result()).hash);
  await page.evaluate(()=>__content(null));assert.equal(await page.evaluate(()=>!!__data.lookup('bonds','rhineShip')),false);assert.deepEqual(errors,[]);
  await page.evaluate(()=>{document.getElementById('field').style.display='none';document.getElementById('flat').style.display='none';document.documentElement.style.fontSize='clamp(40px, min(calc(100vw / 19.2), calc(100vh / 10.8)), 240px)';});
  for(const screen of ['title','lobby'])for(const [width,height]of [[1280,720],[844,390],[568,320]]){
    await page.setViewport({width,height,isMobile:width<1000,hasTouch:width<1000});await page.waitForFunction(()=>window.__ready&&window.__title&&window.__lobby);
    await page.evaluate(screen=>{document.getElementById('field').style.display='none';document.getElementById('flat').style.display='none';document.documentElement.style.fontSize='clamp(40px, min(calc(100vw / 19.2), calc(100vh / 10.8)), 240px)';screen==='title'?__title():__lobby();},screen);
    if(screen==='lobby'){
      await page.waitForSelector('.lobby-screen .topbar');assert.equal(await page.$$eval('[data-testid="main-version"]',xs=>xs.length),0);
      const padding=await page.$eval('.topbar__right',el=>parseFloat(getComputedStyle(el).paddingTop));assert.equal(padding,0);
      await page.screenshot({path:path.join(out,'lobby-restored-'+width+'.png')});continue;
    }
    await page.waitForSelector('[data-testid="main-version"]');
    const label=await page.$eval('[data-testid="main-version"]',el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{text:el.textContent,left:r.left,top:r.top,right:r.right,bottom:r.bottom,font:parseFloat(getComputedStyle(el).fontSize),clickable:hit===el||el.contains(hit)};});
    assert.equal(label.text,'v0.5.3');assert.ok(label.left>width/2&&label.right<=width&&label.top>=0&&label.bottom<height/2&&label.font<=12&&label.clickable,JSON.stringify({screen,width,label}));
    await page.screenshot({path:path.join(out,screen+'-version-'+width+'.png')});
    if(width<1000)await page.tap('[data-testid="main-version"]');else await page.click('[data-testid="main-version"]');await page.waitForSelector('[data-testid="release-summary"]');assert.equal(await page.$eval('[data-testid="release-summary"]',el=>el.textContent),'莱茵科技调整与研究席强化');
    await page.screenshot({path:path.join(out,screen+'-release-'+width+'.png')});
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('[data-testid="release-summary"]'));
  }
  assert.deepEqual(errors,[]);
  await page.evaluate(async()=>{await __content({batches:[{id:'rhine-lab-v1'}]});__bond({bondId:'rhineShip',entry:{count:9,tier:3,active:true,layers:600},priv:{board:[]},bondContext:{live:true,count:9,tier:3,layers:600,research:['T04','T01','T02','T09','T08','T10','T07','T12','T13'],active:['T04','T01','T02','T09','T08','T10','T07','T12','T13'],visitorUid:2}});});
  await page.waitForSelector('.bpop__sec--now');const effect=await page.$eval('.bpop__sec--now',el=>el.textContent);assert.ok(effect.includes('1320')&&effect.includes('格内合计+40%')&&effect.includes('研究席内莱茵成员额外增伤+20%、减伤24%'));await page.screenshot({path:path.join(out,'rhine-bond-values.png')});await page.evaluate(async()=>{await __content(null);});
  await page.evaluate(()=>__encyclopedia());await page.waitForSelector('[data-entry-id="rhineShip"] [data-member-id]');
  await page.type('input[aria-label="搜索百科"]','莱茵生命');await page.waitForFunction(()=>document.querySelectorAll('[data-entry-id]').length===2);
  const encyclopedia=await page.$eval('[data-entry-id="rhineShip"]',el=>{el.querySelector('details:last-of-type').open=true;return el.textContent;});assert.ok(encyclopedia.includes('20层'));assert.ok(encyclopedia.includes('机械水獭累计'));await page.screenshot({path:path.join(out,'rhine-encyclopedia.png')});
  const record={mode:'solo',difficulty:'ABYSS',ranked:0,status:'finished',player_id:'p1',started_at:1,ended_at:60001,summary:{victory:false,roundsPassed:14,players:[{playerId:'p1',name:'记录验收',bandId:'band_rhine_joint',lp:0,lineup:[{id:'chess_rhine_halo_a',items:['rhine_sampler_a']}],bonds:[{bondId:'rhineShip',layers:300}],stats:{}}]}};
  await page.evaluate(record=>__record(record),record);await page.waitForSelector('.record-player__lineup img');await page.waitForFunction(()=>{const img=document.querySelector('.record-player__lineup img');return img?.complete&&img.naturalWidth>0;});
  const recordText=await page.$eval('.record-detail',el=>el.textContent);for(const name of ['星源','实验采样器','赫默','莱茵生命'])assert.ok(recordText.includes(name),name);assert.ok(!recordText.includes('chess_rhine_halo_a'));assert.equal(await page.$eval('.record-player__lineup img',el=>el.complete&&el.naturalWidth>0),true);await page.screenshot({path:path.join(out,'test-content-record.png')});assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(ROOT,'../reports/rhine-0.5.3/browser-rhine.json'),JSON.stringify({passed:true,fixture:'19-point six-member UI; inactive T03/T13 marks included for palette QA only',marks:fieldMarks,tree:{nodes:14,edges:15,rows:6},viewports:[[1280,720],[844,390],[568,320]],browserHash:browserResult.hash,serverHash:resultDigest(server.result()).hash,errors},null,2));
});
