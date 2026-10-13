import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {startServer,ROOT} from '../../server/index.js';
import {appPage} from '../helpers/appPage.mjs';
import {buildBattleSpec} from '../../server/sim/spec.js';
import {createBattleFromSpec} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
import {buildRhodesMujicaData} from '../../server/sim/content/rhodes-mujica/data.js';
import {enemyRec} from '../helpers/battleHarness.js';
import {NEW,RI,GIRL,OBLVNS,MORTIS} from '../../server/sim/content/rhodes-mujica/data.js';
import {getData} from '../../server/data.js';
import {buildLoadoutCatalog} from '../../server/sim/content/expansion/loadout-catalog.js';
const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
test('real client engineering replay matches Node damage and renders artillery without cooperative shields',async t=>{
 if(!executablePath){t.skip('Chromium required');return;}
 const raw=buildRhodesMujicaData(getData()),native=name=>Object.values(raw.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
 const ids=[native('波登可'),native('休谟斯'),'chess_rm_amiya_a','chess_rm_dolris_a','chess_rm_amoris_a','chess_rm_nearl_a'];
 const enemy=enemyRec({key:'enemy_r5_engineering',hp:1e7,speed:0,atk:0});raw.enemies[enemy.key]=enemy;
 const spec=buildBattleSpec({battleId:'qa.rm.engineering',fieldId:'n:p1',kind:'normal',seed:173,modeId:'mode_single_hard',round:8,stageId:'act2autochess_m01',timeLimit:180,
  players:[{playerId:'p1',seat:0,side:'L',colOffset:0,units:ids.map((chessId,i)=>({chessId,uid:i+1,kind:'chess',row:9+Math.floor(i/2),col:3+i%2,dir:'RIGHT'})),bonds:{[RI]:{active:true,tier:2,layers:800,count:6}},playerEffects:[]}],spawns:[],routes:[],flags:{startOpCooldown:0}});
 const b=createBattleFromSpec(spec,new DataSource(raw,null),{quiet:true}),expected=[];b.autoFinish=false;
 b.on('damageResolved',c=>{if(c.dmg?.tags?.includes('bond:rhodes:engineering'))expected.push({amount:c.dmg.amount,type:c.dmg.type,dealt:c.dealt,owner:c.credit.ownerId});});
 b.step();for(const u of b.allyUnits)b.addBuff(u,{key:'qa:noattack',flags:{disarm:true}});
 b.spawnEnemy(enemy.key,{pos:[10,5]});for(const i of [5,2,3])b.emit('skillStart',{unit:b.allyUnits.find(u=>u.def.baseId===ids[i]),reason:'test'});
 for(let i=0;i<210;i++)b.step();assert.deepEqual(b.errors,[]);
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0');await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error);
 const result=await page.evaluate(async({spec,enemy,ids})=>{
  const {setMatchContent,data}=await import('/js/data.js'),{loadBrowserSim}=await import('/js/battle/runner.js');
  const rules={batches:[{id:'rhodes-mujica-v1'}]};await setMatchContent(rules);const {spec:S,ds}=await loadBrowserSim({testRules:rules});
  const {DataSource}=await import('/sim/simdata.js'),{fxSpec}=await import('/js/render/fx.js');
  const source=new DataSource({...ds.raw,enemies:{...ds.raw.enemies,[enemy.key]:enemy}},ds.fallback),b=S.createBattleFromSpec(spec,source,{quiet:true});b.autoFinish=false;
  const shots=[],kinds=new Set();b.on('damageResolved',c=>{if(c.dmg?.tags?.includes('bond:rhodes:engineering'))shots.push({amount:c.dmg.amount,type:c.dmg.type,dealt:c.dealt,owner:c.credit.ownerId});});
  b.step();for(const u of b.allyUnits)b.addBuff(u,{key:'qa:noattack',flags:{disarm:true}});
  const view=__demo.view;view.setStage(data.lookup('stages',spec.stageId));view.enterBattle(b.fieldMeta());view.setLocalFeed({on:true,speed:1});
  b.spawnEnemy(enemy.key,{pos:[10,5]});for(const i of [5,2,3])b.emit('skillStart',{unit:b.allyUnits.find(u=>u.def.baseId===ids[i]),reason:'test'});
  for(let i=0;i<210;i++){
   b.step();const ev=b.drainEvents();for(const e of ev)if(e[0]==='fx'&&e[1].startsWith('rm-ri-')){kinds.add(e[1]);}
   view.pushEvents({fieldId:b.fieldId,gt:b.time,ev});view.pushSnapshot(b.snapshot());await new Promise(r=>requestAnimationFrame(r));
  }
  return{shots,kinds:[...kinds],removedShield:b.allyUnits.some(u=>!!u.findBuff('rm:ri:shield')),supportGrowth:b.getPlayer('p1').bonds.rhodesShip.layers-800,errors:b.errors};
 },{spec,enemy,ids});
 assert.equal(result.removedShield,false);assert.equal(result.supportGrowth,4);assert.deepEqual(result.shots,expected);assert.ok(expected.some(s=>s.type==='phys')&&expected.some(s=>s.type==='arts'));
 for(const kind of ['rm-ri-salvo','rm-ri-impact','rm-ri-hit'])assert.ok(result.kinds.includes(kind),kind);
 assert.deepEqual(result.errors,[]);assert.deepEqual(errors,[]);
 mkdirSync(path.join(ROOT,'../reports/screens'),{recursive:true});await page.screenshot({path:path.join(ROOT,'../reports/screens/rhodes-engineering-r5.png')});
});
test('real client preserves every baseline equipment name/icon across RI, mixed, Sui and formal rule switches',async t=>{
 if(!executablePath){t.skip('Chromium required');return;}
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0');await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error);
 const result=await page.evaluate(async()=>{
  const {data,setMatchContent}=await import('/js/data.js'),{itemIconUrl}=await import('/js/ui/assetUrls.js');
  await setMatchContent(null);await data.loadAll(['items','assets']);
  const baseline=structuredClone(data.baseline('items')),manifest=data.baseline('assets'),checks=[];
  for(const ids of [['rhodes-mujica-v1'],['arknights-expansion-v1','rhodes-mujica-v1'],['arknights-expansion-v1'],[]]){
   await setMatchContent({batches:ids.map(id=>({id}))});
   for(const [id,rec]of Object.entries(baseline)){
    const current=data.lookup('items',id),oldIcon=itemIconUrl(manifest,rec),icon=itemIconUrl(data.get('assets'),current);
    if(JSON.stringify(current)!==JSON.stringify(rec)||!current?.name||!oldIcon||icon!==oldIcon)throw Error('Equipment metadata changed: '+ids.join('+')+' '+id);
   }
   const terminal=Object.values(data.get('items')).filter(i=>i.expansionBatch==='rhodes-mujica-v1');
   if(terminal.length!==(ids.includes('rhodes-mujica-v1')?2:0)||terminal.some(i=>!i.name||!itemIconUrl(data.get('assets'),i)))throw Error('Wrong terminal overlay');
   checks.push({ids,count:Object.keys(baseline).length,terminal:terminal.length});
  }
  // The client simulator must read added native traits from the match table too.
  const rules={batches:[{id:'rhodes-mujica-v1'}]};await setMatchContent(rules);
  const {loadBrowserSim}=await import('/js/battle/runner.js'),{spec:S,ds}=await loadBrowserSim({testRules:rules});
  const native=name=>Object.values(data.get('chess')).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
  const units=[{chessId:native('华法琳'),uid:101,row:10,col:3,dir:'RIGHT'},{chessId:'chess_rm_amiya_a',uid:102,row:10,col:4,dir:'RIGHT'},{chessId:native('百炼嘉维尔'),uid:103,row:11,col:4,dir:'RIGHT'}];
  const b=S.createBattleFromSpec({battleId:'qa.rm.native',fieldId:'n:p1',kind:'normal',seed:173,modeId:'mode_single_hard',round:8,stageId:'act2autochess_m01',timeLimit:180,players:[{playerId:'p1',seat:0,side:'L',colOffset:0,units,bonds:{rhodesShip:{active:true,tier:1,layers:0}},playerEffects:[]}],spawns:[],routes:[],flags:{startOpCooldown:0}},ds,{quiet:true});
  b.autoFinish=false;b.step();const a=b.allyUnits.find(u=>u.def.baseId==='chess_rm_amiya_a'),g=b.allyUnits.find(u=>u.def.raw.name==='百炼嘉维尔');
  for(let i=0;i<3;i++){b.emit('skillStart',{unit:a,reason:'test'});b.emit('skillStart',{unit:g,reason:'test'});}
  if(b.getPlayer('p1').bonds.rhodesShip.layers!==3||b.errors.length)throw Error('Client native RI growth mismatch');
  await setMatchContent(null);
  // Draw the exact procedural textures used by the renderer, enlarged only for visual inspection.
  const {musicNoteTextures}=await import('/js/render/musicNotes.js');
  const canvas=document.createElement('canvas');canvas.id='note-preview';canvas.width=900;canvas.height=300;
  const c=canvas.getContext('2d');c.fillStyle='#141928';c.fillRect(0,0,900,300);
  for(const [type,x,y]of [['phys',310,115],['arts',690,195]]){
   const tex=musicNoteTextures(type);c.drawImage(tex.ribbon.baseTexture.resource.source,x-280,y-35,280,70);c.drawImage(tex.glyph.baseTexture.resource.source,x-55,y-67,110,134);
  }
  document.body.replaceChildren(canvas);return checks;
 });
 assert.equal(result.length,4);assert.ok(result.every(v=>v.count>30));assert.deepEqual(errors,[]);
 mkdirSync(path.join(ROOT,'../reports/screens'),{recursive:true});
 await(await page.$('#note-preview')).screenshot({path:path.join(ROOT,'../reports/screens/rhodes-band-notes-r3.png')});
});
test('Real browser loads only the selected RI rules, renders all nine native models, Fever, notes and doll state',async t=>{
 if(!executablePath){t.skip('Chromium required');return;}
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
 const puppeteer=(await import('puppeteer-core')).default,browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1280,height:720});
 await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0');await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error);assert.equal(await page.evaluate(()=>__demo.error||null),null);
 const spec=buildBattleSpec({battleId:'qa.rm',fieldId:'n:p1',kind:'normal',seed:173,modeId:'mode_single_hard',round:8,stageId:'act2autochess_m01',timeLimit:400,
  players:[{playerId:'p1',seat:0,side:'L',colOffset:0,units:NEW.map((chessId,i)=>({chessId,uid:i+1,kind:'chess',row:9+Math.floor(i/4),col:3+i%4,dir:i===2?'UP':'RIGHT'})),bonds:{[RI]:{active:true,tier:2,layers:30},[GIRL]:{active:true,tier:2,layers:0}},playerEffects:[]}],spawns:[],routes:[],flags:{startOpCooldown:0}});
 const result=await page.evaluate(async spec=>{
  const {setMatchContent,data}=await import('/js/data.js'),{loadBrowserSim}=await import('/js/battle/runner.js');
  const rules={batches:[{id:'rhodes-mujica-v1'}]};await setMatchContent(rules);for(const key of ['fang','beagle'])for(const suffix of ['a','b'])if(data.lookup('chess',`chess_rm_${key}_${suffix}`))throw Error('Retired operator still present');if(!data.lookup('chess','chess_rm_oblvns_a'))throw Error('Client catalog did not apply RI');
  const {spec:S,ds}=await loadBrowserSim({testRules:rules}),{state}=await import('/sim/content/rhodes-mujica/fever.js');
  const b=S.createBattleFromSpec(spec,ds,{quiet:true}),view=__demo.view;b.autoFinish=false;b.step();view.setStage(data.lookup('stages',spec.stageId));view.enterBattle(b.fieldMeta());view.setLocalFeed({on:true,speed:1});
  const push=()=>{view.pushEvents({fieldId:b.fieldId,gt:b.time,ev:b.drainEvents()});view.pushSnapshot(b.snapshot());};
  for(let i=0;i<12;i++)b.step();push();await new Promise(r=>setTimeout(r,2500));
  const m=b.allyUnits.find(u=>u.def.baseId==='chess_rm_mortis_a'),s=b.allyUnits.find(u=>u.def.baseId==='chess_rm_oblvns_a');m.skill.gainSp(999);m.skill.activate('test');b.dealDamage(null,m,{amount:1e7,type:'true'});b.dealDamage(null,m,{amount:1e7,type:'true'});state(b,'p1').heat=450;s.skill.gainSp(999);s.skill.activate('test');
  for(let i=0;i<60;i++){b.step();if(i%3===2){push();await new Promise(r=>requestAnimationFrame(r));}}
  await new Promise(r=>setTimeout(r,700));push();await new Promise(r=>setTimeout(r,400));
  const models=[...view.debug.views.values()].filter(v=>v.info.kind==='op').map(v=>({name:v.info.name,spine:v.info.spine,model:!!v.spineReady,form:v.form,fever:!!v.rm?.until,rm:v.rm,notes:v.rmNoteSprites.size}));
  const result={models,errors:b.errors,missingFormal:false};await setMatchContent(null);result.missingFormal=!data.lookup('chess','chess_rm_oblvns_a');const formal=await loadBrowserSim();result.formalAbsent=!formal.ds.rawChess('chess_rm_oblvns_a');return result;
 },spec);
 mkdirSync(path.join(ROOT,'../reports/screens'),{recursive:true});await page.screenshot({path:path.join(ROOT,'../reports/screens/rhodes-mujica-desktop.png')});
 // Narrow viewport reflow, keeping the same loaded App page and live native renderer.
 await page.setViewport({width:412,height:915});await new Promise(r=>setTimeout(r,600));
 assert.ok(await page.evaluate(()=>__demo.view.debug.views.size===9));
 await page.screenshot({path:path.join(ROOT,'../reports/screens/rhodes-mujica-mobile.png')});
 assert.deepEqual(result.errors,[]);assert.deepEqual(errors,[]);assert.equal(result.models.length,9);assert.ok(result.models.every(v=>v.model),JSON.stringify(result.models));assert.ok(result.models.some(v=>v.form==='rm:doll'),JSON.stringify(result.models));assert.ok(result.models.some(v=>v.fever));assert.ok(result.models.some(v=>v.notes>0));assert.ok(result.missingFormal&&result.formalAbsent);
 // Render all 21 published skins of both batches, including the original front-only Dolris battle model.
 const catalog=buildLoadoutCatalog(getData()),skinIds=catalog.assets.skinSource.rhodesBand.skins.filter(id=>Object.values(catalog.chess).some(c=>!c.isGolden&&c.charId===catalog.assets.skinModels[id].charId));
 const skinned={...spec,battleId:'qa.rm.skins',players:[{...spec.players[0],bonds:{},units:skinIds.map((skinId,i)=>{
  const charId=catalog.assets.skinModels[skinId].charId,c=Object.values(catalog.chess).find(c=>!c.isGolden&&c.charId===charId);
  return{chessId:c.chessId,skinId,uid:100+i,kind:'chess',row:9+Math.floor(i/8),col:2+i%8,dir:i%2?'UP':'RIGHT'};
 })}]};
 const rendered=await page.evaluate(async spec=>{
  const {setMatchContent,data}=await import('/js/data.js'),{loadBrowserSim}=await import('/js/battle/runner.js'),rules={batches:[{id:'arknights-expansion-v1'},{id:'rhodes-mujica-v1'}]};
  await setMatchContent(rules);const {spec:S,ds}=await loadBrowserSim({testRules:rules}),b=S.createBattleFromSpec(spec,ds,{quiet:true}),view=__demo.view;
  b.autoFinish=false;b.step();view.setStage(data.lookup('stages',spec.stageId));view.enterBattle(b.fieldMeta());
  view.pushEvents({fieldId:b.fieldId,gt:b.time,ev:b.drainEvents()});view.pushSnapshot(b.snapshot());
  await new Promise(r=>setTimeout(r,3500));return{errors:b.errors,models:[...view.debug.views.values()].map(v=>({spine:v.info.spine,ready:!!v.spineReady}))};
 },skinned);
 assert.deepEqual(rendered.errors,[]);assert.deepEqual(errors,[]);assert.equal(rendered.models.length,skinIds.length);
 assert.deepEqual(rendered.models.map(v=>v.spine).sort(),skinIds.slice().sort());assert.ok(rendered.models.every(v=>v.ready),JSON.stringify(rendered.models));
 const modelsChecked=await page.evaluate(()=>{
  const views=[...__demo.view.debug.views.values()],m=views.find(v=>v.info.spine.startsWith('char_4183_mortis_'));
  if(!m?.actor)throw Error('Mortis skin model missing');m.ctx.clipAllowed=()=>false;m.update(.1,m.ctx.cam(),1);
  if(!m.actor.clipOn)throw Error('Required weapon clipping disabled under budget');
  m.actor.setSkillIndex(1);m.setForm('rm:doll');if(m.actor.roles.idle!=='Doll_Idle')throw Error('Skin doll mapping missed');m.setForm(null);
  if(m.actor.roles.skill.loop!=='Skill_2')throw Error('Doll return lost selected skill');
  let amiya=0;for(const v of views)if(v.info.spine.startsWith('char_002_amiya')){for(let i=0;i<3;i++){v.actor.setSkill(false);v.actor.setSkillIndex(i);v.actor.setSkill(true);v.actor.update(2);v.actor.attack(1);if(v.actor.current!==['Attack','Skill','Skill_2'][i])throw Error('Amiya clip mismatch '+v.info.spine);}amiya++;}return{mortis:true,amiya};
 });assert.ok(modelsChecked.mortis&&modelsChecked.amiya>=3);
 await page.setViewport({width:1280,height:720});
 await page.screenshot({path:path.join(ROOT,'../reports/screens/rhodes-band-new-skins.png')});
});
