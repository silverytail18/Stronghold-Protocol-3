import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {startServer,ROOT} from '../../server/index.js';
import {TestContent} from '../../server/test-content.js';
import {GameData} from '../../server/match/gamedata.js';
import {setupMatchWaves,buildNormalWave,buildBossWave} from '../../server/match/waves.js';
import {createRng} from '../../server/sim/rng.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../../server/sim/spec.js';
import {DataSource} from '../../server/sim/simdata.js';
import {DATA,makeMatch,give,legalTileFor} from './harness.js';
import {appPage} from '../helpers/appPage.mjs';
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
test('actual browser sim plays 30-round final ordinary, main and hidden BattleSpecs identically to the server',async t=>{
 if(!existsSync(chrome)){t.skip('Chrome required');return;}
 const tc=new TestContent(),resolved=tc.resolve({version:tc.version,ids:['extended-rounds-30']},{mode:'coop',difficulty:'ABYSS'},DATA);
 const gd=new GameData(resolved.data,'mode_multi_abyss'),setup=setupMatchWaves(gd,createRng(88));
 const h=makeMatch({data:resolved.data,difficulty:'ABYSS',humans:2,fake:true}).start();t.after(()=>h.m.dispose());h.toPrep(1);h.setStage(setup.stageId);
 for(const p of h.m.order)for(const id of gd.visibleChess.filter(id=>gd.tierOf(id)===6&&!h.m.bannedChess.includes(id)).slice(0,4)){
  const golden=gd.goldenIdOf(id),tile=legalTileFor(h.m,p,golden);if(tile)give(h.m,p,golden,'board',tile);
 }
 const specs=[29,30,31].map(r=>{
  const boss=r>=30,id=r===31?setup.hiddenBossId:setup.bossId,pool=gd.bossPoolHp(id,2),wave=boss?buildBossWave(gd,createRng(2),setup.factions,r,{bossId:id,solo:false}):buildNormalWave(gd,createRng(2),setup.factions,r);
  return buildBattleSpec({battleId:'qa.round-ext.'+r,fieldId:'b1',kind:r===31?'hidden':boss?'boss':'normal',seed:222,modeId:gd.modeId,round:r,stageId:setup.stageId,timeLimit:gd.combatTimeLimit(r),
   players:h.m.order.map((p,i)=>({...p.battleInput(),side:i?'R':'L',seat:i,colOffset:i&&!boss?10:0})),spawns:wave.spawns,routes:wave.routes,enemyOverrides:wave.overrides,
   flags:{layerGainsEnabled:!boss,...gd.dp},...(boss?{bossId:id,boss:{poolHp:pool,poolMax:pool}}:{})});
 });
 const expected=specs.map(s=>{const b=createBattleFromSpec(s,new DataSource(resolved.data,null),{quiet:true,recordEvents:false});const result=b.runToEnd(500);assert.equal(b.errorCount,0);return resultDigest(result).hash;});
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));const head=readFileSync(path.join(ROOT,'public/index.html'),'utf8').split('</head>')[0];
 await page.setRequestInterception(true);page.on('request',r=>{if(new URL(r.url()).pathname!=='/dev/round-extension-v2.html'){r.continue();return;}r.respond({status:200,contentType:'text/html',body:head+'</head><body></body>'});});
 await page.goto(srv.url+'/dev/round-extension-v2.html');
 const actual=await page.evaluate(async({specs,rules})=>{const {loadBrowserSim}=await import('/js/battle/runner.js');const {spec:S,ds}=await loadBrowserSim({testRules:rules});return specs.map(s=>{const b=S.createBattleFromSpec(s,ds,{quiet:true,recordEvents:false});const result=b.runToEnd(500);return {hash:S.resultDigest(result).hash,errors:b.errors};});},{specs,rules:resolved.manifest});
 assert.deepEqual(actual.map(v=>v.hash),expected);assert.ok(actual.every(v=>v.errors.length===0));assert.deepEqual(errors,[]);
});
