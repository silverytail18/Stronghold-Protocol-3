import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {startServer} from '../../server/index.js';
import {appPage} from '../helpers/appPage.mjs';
import {getData} from '../../server/data.js';
import {buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {GUIDE,RECRUIT} from '../../server/sim/content/expansion/kjerag-data.js';
import {buildBattleSpec,createBattleFromSpec} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
import {enemyRec} from '../helpers/battleHarness.js';
import {makeMatch} from '../match/harness.js';
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
test('Kjerag full-range cold / ice damage and browser overlay replay both tiers identically to server; disabled batch resets',{skip:!existsSync(chrome)},async t=>{
 const raw=buildExpansionData(getData()),enemy=enemyRec({key:'guide_browser',hp:1e7,atk:0,speed:0});raw.enemies[enemy.key]=enemy;
 const specs=[1,2].map(tier=>buildBattleSpec({battleId:'qa.kjerag.'+tier,fieldId:'n:p1',kind:'normal',seed:777,modeId:'mode_single_hard',round:8,stageId:'act2autochess_m01',timeLimit:60,players:[{playerId:'p1',seat:0,side:'L',colOffset:0,units:['chess_char_1_02_a','chess_char_2_05_a','chess_char_3_20_a','chess_char_4_22_a'].map((chessId,i)=>({chessId,uid:i+1,kind:'chess',row:9+i,col:4,dir:'RIGHT'})),bonds:{[GUIDE]:{active:true,tier,layers:0,count:tier*2}},playerEffects:[]}],spawns:[],routes:[],flags:{startOpCooldown:0}}));
 const simulate=b=>{b.autoFinish=false;const statuses=[],iceHits=[];b.on('statusApplied',e=>{if(e.source===GUIDE)statuses.push({time:b.time,id:e.target.id,status:e.status,duration:e.duration,entered:e.entered});});b.on('damageResolved',c=>{if(c.dmg.tags.includes('exp:kjerag:ice'))iceHits.push({time:b.time,id:c.target.id,source:c.source?.id,amount:c.dmg.amount,dealt:c.dealt,splash:c.dmg.isSplash});});b.step();const main=b.spawnEnemy(enemy.key,{pos:[10,5]});b.spawnEnemy(enemy.key,{pos:[11,5]});b.applyStatus(main,'freeze',{duration:3});b.dealDamage(b.allyUnits[2],main,{amount:1,type:'true',isAttack:true,isSkill:true,attackId:++b._attackSeq});for(let i=0;i<450;i++)b.step();return {statuses,iceHits,hp:b.enemies.map(e=>e.hp),errors:b.errors};};
 const expected=specs.map(s=>simulate(createBattleFromSpec(s,new DataSource(raw,null),{quiet:true})));assert.ok(expected.every(x=>x.statuses.length>0));assert.equal(expected[0].iceHits.length,0);assert.ok(expected[1].iceHits.length>=2);assert.equal(expected[1].iceHits[0].amount,expected[1].iceHits[1].amount*2);
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());const browser=await(await import('puppeteer-core')).default.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error,{timeout:60000});
 const actual=await page.evaluate(async({specs,enemy,GUIDE,RECRUIT})=>{
  const {setMatchContent,data}=await import('/js/data.js'),{loadBrowserSim}=await import('/js/battle/runner.js'),{DataSource}=await import('/sim/simdata.js'),{bandAvailable}=await import('/shared/bandAvailability.js');
  const rules={batches:[{id:'arknights-expansion-v1'}]};await setMatchContent(rules);const member=data.lookup('chess','chess_char_1_02_a'),band=data.lookup('bands',RECRUIT);const catalog={member:member.bonds.includes(GUIDE),hp:band.totalHp,disabled:bandAvailable(band,data.get('chess'),['kjeragShip'])};
  const {spec:S,ds}=await loadBrowserSim({testRules:rules}),source=new DataSource({...ds.raw,enemies:{...ds.raw.enemies,[enemy.key]:enemy}},ds.fallback),results=[];
  for(const spec of specs){const b=S.createBattleFromSpec(spec,source,{quiet:true});b.autoFinish=false;const statuses=[],iceHits=[];b.on('statusApplied',e=>{if(e.source===GUIDE)statuses.push({time:b.time,id:e.target.id,status:e.status,duration:e.duration,entered:e.entered});});b.on('damageResolved',c=>{if(c.dmg.tags.includes('exp:kjerag:ice'))iceHits.push({time:b.time,id:c.target.id,source:c.source?.id,amount:c.dmg.amount,dealt:c.dealt,splash:c.dmg.isSplash});});b.step();const main=b.spawnEnemy(enemy.key,{pos:[10,5]});b.spawnEnemy(enemy.key,{pos:[11,5]});b.applyStatus(main,'freeze',{duration:3});b.dealDamage(b.allyUnits[2],main,{amount:1,type:'true',isAttack:true,isSkill:true,attackId:++b._attackSeq});for(let i=0;i<450;i++)b.step();results.push({statuses,iceHits,hp:b.enemies.map(e=>e.hp),errors:b.errors});}
  await setMatchContent(null);return {results,catalog,reset:!data.lookup('bands',RECRUIT)&&!data.lookup('bonds',GUIDE)&&!data.lookup('chess','chess_char_1_02_a').bonds.includes(GUIDE)};
 },{specs,enemy,GUIDE,RECRUIT});
 assert.deepEqual(actual.results,expected);assert.deepEqual(actual.catalog,{member:true,hp:24,disabled:false});assert.equal(actual.reset,true);
 const draft=makeMatch({data:raw,mode:'solo',fake:true}).start();draft.m.handle('p_0',{t:'g.infoReady'});draft.sched.advance(1);draft.m.disabledBonds=[];draft.m.staticInactiveBonds=[];draft.m.bannedChess=[];const pub=draft.m.publicView();draft.m.dispose();
 await page.evaluate(async pub=>{const {setMatchContent}=await import('/js/data.js'),{store}=await import('/js/store.js'),{h,render}=await import('/vendor/preact.module.js'),{BandDraftScreen}=await import('/js/screens/bandDraft.js');await setMatchContent({batches:[{id:'arknights-expansion-v1'}]});store.set({me:{playerId:'p_0',name:'验证'},room:{mode:'solo'},match:{public:pub,private:null}});const root=document.createElement('div');root.id='kjerag-draft-qa';document.body.append(root);render(h(BandDraftScreen),root);},pub);
 await page.waitForSelector(`[data-band="${RECRUIT}"]`);assert.equal(await page.$eval(`[data-band="${RECRUIT}"] .dband__lp`,e=>e.textContent.trim()),'24');
 await page.evaluate(()=>{window.__kjeragDisable=import('/js/store.js').then(({store})=>store.patch('match',{public:{...store.get().match.public,disabledBonds:['kjeragShip']}}));});await page.waitForFunction(id=>!document.querySelector(`[data-band="${id}"]`),{},RECRUIT);assert.ok(await page.$('[data-band="band_sciurus"]'));
 const out=path.resolve('../reports/kjerag-ice-0.3.9');mkdirSync(out,{recursive:true});
 await page.setViewport({width:1280,height:720});
 const visual=await page.evaluate(async()=>{document.querySelector('#kjerag-draft-qa').remove();const {fxSpec}=await import('/js/render/fx.js');const fx=window.__demo.view.debug.fx;fx.clear();fx.simFx('snowfieldIceBurst',6,10,{r:1.2});fx.update(.08);return {spec:fxSpec('snowfieldIceBurst'),parts:fx.parts.length};});
 assert.equal(visual.spec.a,'blast');assert.equal(visual.spec.r,1.2);assert.ok(visual.parts>0);await page.screenshot({path:path.join(out,'ice-board.png')});
 // Use the actual main screen for responsive layout; the render demo keeps a fixed board-only scale.
 await page.goto(srv.url,{waitUntil:'domcontentloaded'});await page.waitForSelector('.title-library');await page.click('.title-library button');
 await page.waitForSelector(`[data-entry-id="${GUIDE}"]`);await page.type('[aria-label="搜索百科"]','雪境向导');
 await page.waitForFunction(()=>document.querySelectorAll('.encyclopedia__list article').length===1);
 const guideText=await page.$eval(`[data-entry-id="${GUIDE}"]`,e=>e.textContent);for(const fragment of ['所有有效敌人','冷却12秒','600','当前攻击力×15%','最多180','1.2格','50%','冷却14秒','0.5秒','最多4秒','最短10秒'])assert.ok(guideText.includes(fragment),fragment);
 await page.screenshot({path:path.join(out,'guide-desktop.png')});await page.setViewport({width:568,height:320,isMobile:true,hasTouch:true});
 await page.waitForSelector('.title-library');await page.click('.title-library button');await page.waitForSelector(`[data-entry-id="${GUIDE}"]`);await page.type('[aria-label="搜索百科"]','雪境向导');await page.waitForFunction(()=>document.querySelectorAll('.encyclopedia__list article').length===1);
 await page.screenshot({path:path.join(out,'guide-narrow.png')});const rect=await page.$eval('.encyclopedia',e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight};});assert.ok(rect.left>=0&&rect.right<=rect.width&&rect.top>=0&&rect.bottom<=rect.height,JSON.stringify(rect));
 assert.deepEqual(errors,[]);
});
