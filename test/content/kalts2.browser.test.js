import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {startServer} from '../../server/index.js';
import {appPage} from '../helpers/appPage.mjs';
import {getData} from '../../server/data.js';
import {buildRhodesMujicaData,KALTS2} from '../../server/sim/content/rhodes-mujica/data.js';
import {buildBattleSpec,createBattleFromSpec} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';

test('both Kaltsit grades get identical real deputy effects in the browser and Node',{skip:!existsSync(chrome)},async t=>{
 const raw=buildRhodesMujicaData(getData()),specs=[];
 for(const suffix of ['a','b'])specs.push(buildBattleSpec({battleId:'qa.deput.'+suffix,fieldId:'n:p1',kind:'normal',seed:11,modeId:'mode_single_hard',round:8,stageId:'act2autochess_m01',timeLimit:120,players:[{playerId:'p1',seat:0,side:'L',colOffset:0,units:[{chessId:KALTS2.replace(/_a$/,'_'+suffix),uid:1,kind:'chess',row:10,col:4,skillIndex:1,moduleId:'none'}],bonds:{deputShip:{active:true,tier:1,count:2,layers:4}},playerEffects:[]}],spawns:[],routes:[],flags:{startOpCooldown:0}}));
 const expected=specs.map(spec=>{const b=createBattleFromSpec(spec,new DataSource(raw,null),{quiet:true});b.autoFinish=false;b.step();const u=b.allyUnits[0];return {bonds:u.def.bonds,def:u.s.def,redeploy:u.findBuff('bond:deputShip').mods.redeployMul,errors:b.errors};});
 const server=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>server.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(server.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error,{timeout:60000});
 const actual=await page.evaluate(async specs=>{
  const {setMatchContent}=await import('/js/data.js'),{loadBrowserSim}=await import('/js/battle/runner.js');
  const rules={batches:[{id:'rhodes-mujica-v1'}]};await setMatchContent(rules);const {spec:S,ds}=await loadBrowserSim({testRules:rules});
  return specs.map(spec=>{const b=S.createBattleFromSpec(spec,ds,{quiet:true});b.autoFinish=false;b.step();const u=b.allyUnits[0];return {bonds:u.def.bonds,def:u.s.def,redeploy:u.findBuff('bond:deputShip').mods.redeployMul,errors:b.errors};});
 },specs);
 assert.deepEqual(actual,expected);assert.ok(actual.every(r=>r.redeploy===.7&&r.bonds.includes('deputShip')));assert.deepEqual(errors,[]);
});
