import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {startServer} from '../../server/index.js';
import {appPage} from '../helpers/appPage.mjs';
import {getData} from '../../server/data.js';
import {buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {buildRhodesMujicaData} from '../../server/sim/content/rhodes-mujica/data.js';
import {buildBattleSpec,createBattleFromSpec} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
import {enemyRec} from '../helpers/battleHarness.js';
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
function replay(b,kind){
 b.autoFinish=false;b.step();const u=b.allyUnits[0];
 u.skill.addCharge(1);
 if(kind==='clemnt'){u.skill.activate('test');for(let i=0;i<60;i++)b.step();}
 const pod=u.mem.clemntPod,e=b.spawnEnemy('qa_air_target',{pos:kind==='kalts'?[10,6]:[pod.y,pod.x+.2]});
 for(let i=0;i<50;i++)b.step();
 return {hp:e.hp,damage:u.stats.dmg,erosion:e.elem.erosion,casts:u.skill.activations,ammo:u.skill.ammoLeft,slow:!!e.findBuff('exp:clemnt:vortexSlow'),errors:b.errors};
}
test('enemy-only Kalts2 auto S2 and Clementia air vortex replay identically in actual browser and Node, both grades',{skip:!existsSync(chrome)},async t=>{
 const enemy=enemyRec({key:'qa_air_target',motion:'FLY',hp:1e7,def:400,res:100,atk:0,speed:0}),raw=buildRhodesMujicaData(buildExpansionData(getData()));raw.enemies[enemy.key]=enemy;
 const scenarios=[];for(const kind of ['kalts','clemnt'])for(const suffix of ['a','b'])scenarios.push({kind,spec:buildBattleSpec({battleId:`qa.targeting.${kind}.${suffix}`,fieldId:'n:p1',kind:'normal',seed:101,modeId:'mode_single_hard',round:8,stageId:'act2autochess_m01',timeLimit:120,players:[{playerId:'p1',seat:0,side:'L',colOffset:0,units:[{chessId:`chess_${kind==='kalts'?'rm_kalts2':'exp_clemnt'}_${suffix}`,uid:1,kind:'chess',row:10,col:4,dir:'RIGHT',skillIndex:1,moduleId:'none'}],bonds:{},playerEffects:[]}],spawns:[],routes:[],flags:{startOpCooldown:0}})});
 const expected=scenarios.map(({kind,spec})=>replay(createBattleFromSpec(spec,new DataSource(raw,null),{quiet:true}),kind));
 for(const [i,r]of expected.entries()){assert.ok(r.damage>0,JSON.stringify({kind:scenarios[i].kind,...r}));assert.ok(r.casts>=1);assert.deepEqual(r.errors,[]);}assert.ok(expected.slice(2).every(r=>r.erosion>0&&r.slow));
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error,{timeout:60000});
 const actual=await page.evaluate(async({scenarios,enemy,replaySource})=>{
  const {setMatchContent}=await import('/js/data.js'),{loadBrowserSim}=await import('/js/battle/runner.js'),{DataSource}=await import('/sim/simdata.js');
  const rules={batches:[{id:'arknights-expansion-v1'},{id:'rhodes-mujica-v1'}]};await setMatchContent(rules);const {spec:S,ds}=await loadBrowserSim({testRules:rules});
  const source=new DataSource({...ds.raw,enemies:{...ds.raw.enemies,[enemy.key]:enemy}},ds.fallback),run=(0,eval)('('+replaySource+')');
  return scenarios.map(({kind,spec})=>run(S.createBattleFromSpec(spec,source,{quiet:true}),kind));
 },{scenarios,enemy,replaySource:replay.toString()});
 assert.deepEqual(actual,expected);assert.deepEqual(errors,[]);
});
