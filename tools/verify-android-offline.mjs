// Verify the actual signed APK, not a separate development/mock build.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {inflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import http from 'node:http';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const buildReport=JSON.parse(await fs.readFile(path.join(root,'mobile/offline-dist/offline-build-report.json'),'utf8'));
assert.ok(Number.isSafeInteger(buildReport.versionCode)&&buildReport.versionCode>0);
const output=path.join(root,'.cache/offline-verification-'+buildReport.versionCode);await fs.mkdir(output,{recursive:true});
const apk=await fs.readFile(path.join(root,'mobile/offline-dist/stronghold-protocol-offline.apk'));
const entries=new Map();let eocd=apk.length-22;
while(eocd>=Math.max(0,apk.length-65557)&&apk.readUInt32LE(eocd)!==0x06054b50)eocd--;
assert.ok(eocd>=0,'APK ZIP footer');
let cursor=apk.readUInt32LE(eocd+16),count=apk.readUInt16LE(eocd+10);
for(let i=0;i<count;i++) {
  assert.equal(apk.readUInt32LE(cursor),0x02014b50);
  const nameLength=apk.readUInt16LE(cursor+28),extra=apk.readUInt16LE(cursor+30),comment=apk.readUInt16LE(cursor+32);
  const name=apk.subarray(cursor+46,cursor+46+nameLength).toString();
  entries.set(name,{method:apk.readUInt16LE(cursor+10),size:apk.readUInt32LE(cursor+20),offset:apk.readUInt32LE(cursor+42)});
  cursor+=46+nameLength+extra+comment;
}
function read(name){const entry=entries.get(name);if(!entry)return null;const o=entry.offset,start=o+30+apk.readUInt16LE(o+26)+apk.readUInt16LE(o+28);const data=apk.subarray(start,start+entry.size);return entry.method===8?inflateRawSync(data):data;}
const inventory=JSON.parse(read('assets/web/offline-build.json')).files;
assert.equal(JSON.parse(read('assets/web/offline-build.json')).version,JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version);
const report={apkSHA256:createHash('sha256').update(apk).digest('hex'),checkedFiles:inventory.length,checks:[],runs:[]};
assert.equal(report.apkSHA256,buildReport.sha256,'APK matches delivered build report');
report.version=buildReport.version;report.versionCode=buildReport.versionCode;
for(const file of inventory){const bytes=read('assets/web/'+file.path);assert.ok(bytes,'APK resource '+file.path);assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
assert.ok(![...entries.keys()].some(p=>/auth-users|credentials\.json|server\.env|\.p12$|ranked\.sqlite|(^|\/)storage\//.test(p)));
report.checks.push('Every bundled web file matches its inventory SHA-256; no player/config/signing files in APK');
let currentModules=0;
for(const file of inventory.filter(f=>f.path.startsWith('offline/engine/')&&f.path.endsWith('.js'))){
  const source=file.path.slice('offline/engine/'.length);
  if(['server/data.js','server/sim/nodeData.js','server/test-content.js'].includes(source))continue;
  assert.deepEqual(read('assets/web/'+file.path),await fs.readFile(path.join(root,source)),source+' matches current project');currentModules++;
}
report.currentModules=currentModules;
report.checks.push('Bundled battle, match and shared modules match current project byte for byte, except explicit offline data/hash adapters');
assert.ok(![...entries.keys()].some(name=>name.includes('\\')),'APK names use canonical slashes');
const javaTests=path.join(output,'java');await fs.mkdir(javaTests,{recursive:true});
await fs.writeFile(path.join(javaTests,'OfflinePolicyTest.java'),`import io.stronghold.protocol.offline.AssetPolicy;
public class OfflinePolicyTest {
  static void check(boolean value){if(!value)throw new AssertionError("Offline asset policy");}
  public static void main(String[] args){
    String origin=AssetPolicy.ORIGIN;
    check("assets/web/index.html".equals(AssetPolicy.entry(origin+"/")));
    check("assets/web/data.js".equals(AssetPolicy.entry(origin+"/data.js")));
    check("assets/web/assets/a.png".equals(AssetPolicy.entry(origin+"/assets/a.png?v=1")));
    for(String url:new String[]{"https://example.com/assets/a.png",origin+"/auth/session",origin+"/account.html",origin+"/config/server.env",origin+"/storage/auth-users.json",origin+"/assets/../data/config.json",origin+"/assets/%2e%2e/data/config.json",origin+"/assets/a%2fb.png",origin+"/assets/a%5cb.png",origin+"/assets/.secret",origin+":443/assets/a.png","file:///assets/a.png"})check(AssetPolicy.entry(url)==null);
    check("text/javascript".equals(AssetPolicy.mime("worker.js")));check("application/octet-stream".equals(AssetPolicy.mime("model.skel")));
    long[] r=AssetPolicy.range("bytes=2-5",10);check(r[0]==2&&r[1]==5);
    r=AssetPolicy.range("bytes=-3",10);check(r[0]==7&&r[1]==9);
    r=AssetPolicy.range("bytes=7-",10);check(r[0]==7&&r[1]==9);
    check(AssetPolicy.range("bytes=10-",10)==null);check(AssetPolicy.range("bytes=6-2",10)==null);check(AssetPolicy.range("bytes=0-1,3-5",10)==null);
    System.out.println("Native origin, traversal, MIME and audio range policy passed");
  }
}`);
const javaBin=path.join(process.env.JAVA_HOME||'C:/Program Files/Java/jdk-21','bin');
const nativeSource=path.join(root,'mobile/android-offline/app/src/main/java/io/stronghold/protocol/offline/AssetPolicy.java');
for(const [name,args] of [['javac',['-encoding','UTF-8','-d',javaTests,nativeSource,path.join(javaTests,'OfflinePolicyTest.java')]],['java',['-cp',javaTests,'OfflinePolicyTest']]]){
  const executed=spawnSync(path.join(javaBin,name+(process.platform==='win32'?'.exe':'')),args,{encoding:'utf8',windowsHide:true});assert.equal(executed.status,0,executed.stderr||executed.error?.message);
}
report.checks.push('Native asset policy allows only APK origin and public local paths; rejects traversal/accounts/external URLs, validates audio byte ranges');
const moduleDir=path.join(output,'modules');
for(const file of inventory.filter(f=>f.path.startsWith('offline/')&&f.path.endsWith('.js'))){const dest=path.join(moduleDir,file.path);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,read('assets/web/'+file.path));}
const module=relative=>import(pathToFileURL(path.join(moduleDir,'offline',relative)));
const {sha256}=await module('hash.js');
for(const value of ['','abc','单机：岁与企鹅 🐧','x'.repeat(1000000),JSON.stringify({甲:'乙',test:true})])assert.equal(sha256(value),createHash('sha256').update(value).digest('hex'));
const names=['config','chess','bonds','garrisons','items','bands','effects','choices','enemies','factions','waves','stages','bosses','tokens','assets'];
const data=Object.fromEntries(names.map(name=>[name,JSON.parse(read('assets/web/data/'+name+'.json'))]));
const {setData,deepFreeze}=await module('engine/server/data.js');setData(deepFreeze(data));
// Exercise the new engineering rules against the signed APK's exact engine/data. Only the
// assertion harness comes from test/, never replacement game modules or development JSON.
for(const relative of ['test/helpers/battleHarness.js','test/content/rhodes-engineering.test.js']){
  const source=(await fs.readFile(path.join(root,relative),'utf8')).replaceAll("'../../server/","'../../offline/engine/server/").replaceAll("'../../shared/","'../../offline/engine/shared/");
  const dest=path.join(moduleDir,relative);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,source);
}
const richText=path.join(moduleDir,'public/js/ui/richText.js');await fs.mkdir(path.dirname(richText),{recursive:true});await fs.writeFile(richText,read('assets/web/js/ui/richText.js'));
await fs.writeFile(path.join(moduleDir,'apk-data.json'),JSON.stringify(data));
const setup=path.join(moduleDir,'init-apk-data.mjs');
await fs.writeFile(setup,"import fs from 'node:fs';\nimport {setData,deepFreeze} from './offline/engine/server/data.js';\nsetData(deepFreeze(JSON.parse(fs.readFileSync(new URL('./apk-data.json',import.meta.url),'utf8'))));\n");
const engineering=spawnSync(process.execPath,['--import',setup,'--test',path.join(moduleDir,'test/content/rhodes-engineering.test.js')],{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
await fs.writeFile(path.join(output,'apk-engineering-tests.log'),engineering.stdout+'\n'+engineering.stderr);
assert.equal(engineering.status,0,engineering.stdout+'\n'+engineering.stderr);
report.engineeringTests=Number(engineering.stdout.match(/(?:^|\n)(?:#|ℹ)\s+tests\s+(\d+)/)?.[1]);
assert.ok(report.engineeringTests>0);
report.checks.push('Engineering regression assertions run against actual APK: autonomous fire, six/nine groups, three-profession followup, deployment SP and numeric panels');
const {OfflineRuntime}=await module('runtime.js');
const {VirtualScheduler}=await module('engine/server/match/scheduler.js');
const {TestContent:OnlineCatalog}=await import('../server/test-content.js');
report.testContent=new OnlineCatalog().entries.map(({id,version})=>({id,version}));
const isolated=new OfflineRuntime(data,()=>{});assert.equal(isolated.catalog.version,new OnlineCatalog().version);
for(const ids of [['shop-extra-slot','arknights-expansion-v1','rhodes-mujica-v1'],...[16,18,20,24].map(n=>[`extended-rounds-${n}`])]){
  const room={mode:'solo',difficulty:'NORMAL'},selection={version:isolated.catalog.version,ids};
  assert.deepEqual(isolated.catalog.resolve(selection,room,data,{admin:true}).manifest,new OnlineCatalog().resolve(selection,room,data,{admin:true}).manifest);
}
report.checks.push('Browser SHA-256 and test fingerprints match online rule engine exactly');
let frames=[],rid=1;
const solo=new OfflineRuntime(data,m=>frames.push(m));
const send=(t,fields={})=>solo.receive({t,rid:rid++,...fields});
send('hello',{name:'离线验证'});send('room.create',{mode:'coop',difficulty:'NORMAL'});assert.equal(solo.room,null);
send('room.create',{mode:'solo',difficulty:'NORMAL',ranked:true});assert.equal(solo.room,null);
send('room.create',{mode:'solo',difficulty:'NORMAL'});
const expectedIds=[...[16,18,20,24].map(n=>`extended-rounds-${n}`),'shop-extra-slot','coop-pool-150','arknights-expansion-v1','rhodes-mujica-v1'];
assert.deepEqual(solo.catalog.menu(solo.room).items.map(x=>x.id),expectedIds);assert.equal(solo.catalog.menu(solo.room).items.find(x=>x.id==='coop-pool-150').enabled,false);
send('room.loadout',{entries:{chess_exp_aglna2_a:{skill:2,module:'none'},chess_rm_oblvns_a:{skill:2,module:'none'}}});
assert.equal(solo.loadout.chess_rm_oblvns_a.skill,2,'Expanded preferences accepted before choosing test packs');
assert.equal(solo.loadout.chess_exp_aglna2_a.skill,2);
send('room.start',{tests:{version:solo.catalog.version,ids:['extended-rounds-16','extended-rounds-18']}});assert.equal(solo.match,null);
send('room.setDifficulty',{difficulty:'FUNNY'});
send('room.start',{tests:{version:solo.catalog.version,ids:['extended-rounds-18']}});assert.equal(solo.match,null);
send('room.setDifficulty',{difficulty:'NORMAL'});
send('room.start',{tests:{version:solo.catalog.version,ids:['shop-extra-slot','arknights-expansion-v1','extended-rounds-16']}});
assert.equal(solo.match.gd.lastRound,16);assert.ok(solo.match.canTestOperators(solo.playerId));
assert.ok(!Object.hasOwn(solo.match.order[0].loadout,'chess_rm_oblvns_a'));
assert.ok(!Object.hasOwn(solo.match.data.chess,'chess_exp_aglna2_a'),'Saved preferences cannot enable Rhodes content');
assert.equal(solo.loadout.chess_rm_oblvns_a.skill,2,'Preferences retained for next game');
send('g.infoReady');
for(let i=0;i<10&&solo.match.phase!=='PREP';i++){
  if(solo.match.phase==='BAND_DRAFT')send('g.band',{bandId:solo.match.defaultBand(solo.playerId)});
  await new Promise(r=>setTimeout(r,150));
}
// Phase timers are real in this smoke check; remaining behavior is covered in virtual time below.
solo.dispose();
report.checks.push('Solo-only enforcement, ranked rejection, incompatible tests rejected, all catalog permissions exposed');
const simSource=(await fs.readFile(path.join(root,'test/match/simClient.js'),'utf8')).replaceAll("'../../server/sim/","'../../offline/engine/server/sim/").replaceAll("'../../shared/","'../../offline/engine/shared/");
const simPath=path.join(moduleDir,'test/match/simClient.js');await fs.mkdir(path.dirname(simPath),{recursive:true});await fs.writeFile(simPath,simSource);
const {SimClient}=await import(pathToFileURL(simPath));
for(const [difficulty,ids] of [['FUNNY',[]],['NORMAL',[]],['HARD',[]],['ABYSS',[]],['NORMAL',['extended-rounds-16','shop-extra-slot','arknights-expansion-v1']],['ABYSS',['extended-rounds-18','shop-extra-slot','arknights-expansion-v1']],['ABYSS',['extended-rounds-20','shop-extra-slot','arknights-expansion-v1','rhodes-mujica-v1']],['ABYSS',['extended-rounds-24','shop-extra-slot','arknights-expansion-v1','rhodes-mujica-v1']],['FUNNY',['shop-extra-slot','rhodes-mujica-v1']]]){
  const sched=new VirtualScheduler();let client,lastPublic,result,errors=[],battleKinds=new Set();
  const runtime=new OfflineRuntime(data,msg=>{if(msg.t==='error')errors.push(msg);if(msg.t==='m.public')lastPublic=msg;if(msg.t==='m.result')result=msg;if(msg.t==='b.start')battleKinds.add(msg.spec.kind);client?.onMessage(msg);},{scheduler:sched,now:()=>sched.now(),seed:23,botRehearsal:0});
  runtime.receive({t:'hello',name:'验证博士'});runtime.receive({t:'room.create',mode:'solo',difficulty});
  client=new SimClient(runtime.playerId,{send:msg=>runtime.receive(msg),setTimeout:(f,t)=>sched.setTimeout(f,t),clearTimeout:h=>sched.clearTimeout(h),pace:'instant'});
  runtime.receive({t:'room.start',tests:{version:runtime.catalog.version,ids}});client.o.ds=runtime.match.ds;
  runtime.receive({t:'g.autoplay',on:true});let boosted=false,pauseChecked=false;
  for(let i=0;i<1000000&&!runtime.ended;i++){
    if(!boosted&&runtime.match.phase==='PREP'){runtime.match.order[0].lp=4000;boosted=true;}
    if(!pauseChecked&&runtime.match.phase==='COMBAT'){
      runtime.suspend();assert.equal(runtime.match.paused,true);runtime.receive({t:'g.pause',on:false});assert.equal(runtime.match.paused,false);pauseChecked=true;
    }
    if(!sched.runNext())break;
  }
  assert.ok(runtime.ended,`${difficulty} didn't finish (${runtime.match.phase} R${runtime.match.round})`);
  assert.ok(result);assert.equal(runtime.match.errorCount,0,JSON.stringify(runtime.match.errors));assert.deepEqual(sched.errors,[]);assert.deepEqual(errors,[]);
  assert.equal(runtime.match.simErrors,0,'Simulation handler errors');assert.equal(runtime.match.dispatcher.errors,0,'Meta handler errors');
  assert.equal(runtime.match.verifyStats.rejected,0);assert.equal(runtime.match.verifyStats.takeovers,0);
  assert.ok(battleKinds.has('boss'),'Actual final-assault battle simulated');
  assert.equal(lastPublic.phase,'RESULT');
  report.runs.push({difficulty,tests:ids,lastRound:runtime.match.gd.lastRound,reachedRound:runtime.match.round,victory:result.victory,battleKinds:[...battleKinds],battleReports:client.log.filter(m=>m.t==='b.result').length,engineErrors:runtime.match.errorCount});
  runtime.leave();assert.equal(runtime.room,null);client.close();runtime.dispose();
}
report.checks.push('Nine full real-simulation matches reach results; four difficulties, 16/18/20/24 extensions and both content packs, boss, pause and zero takeovers/errors');
const forbidden=[],missing=[],requests=[],upgrades=[];
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  requests.push(pathname);
  const name=pathname==='/'?'index.html':decodeURIComponent(pathname).slice(1);
  const bytes=read('assets/web/'+name);
  if(!bytes){missing.push(pathname);res.writeHead(404);res.end();return;}
  const ext=path.extname(name),mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.woff2':'font/woff2','.atlas':'text/plain'}[ext]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime,'Content-Length':bytes.length,'Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-src 'none'"});res.end(bytes);
});
server.on('upgrade',req=>{upgrades.push(req.url);req.socket.destroy();});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let debugPage;
const pageErrors=[],consoleErrors=[],webSockets=[];
try{
  const page=await browser.newPage();debugPage=page;await page.setViewport({width:1280,height:720,isMobile:true,hasTouch:true});
  page.on('pageerror',e=>pageErrors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
  const cdp=await page.createCDPSession();await cdp.send('Network.enable');cdp.on('Network.webSocketCreated',e=>webSockets.push(e.url));
  // CSP matches the native shell. Observe requests without Puppeteer Fetch interception, which
  // can stall module-Worker dependency requests before their target is attached.
  page.on('request',req=>{if(!req.url().startsWith(origin)&&!req.url().startsWith('data:')&&!req.url().startsWith('blob:'))forbidden.push(req.url());});
  await page.goto(origin,{waitUntil:'networkidle0',timeout:60000});
  await page.waitForFunction(()=>window.__SP__?.net.status==='online',{timeout:30000});
  assert.ok((await page.$eval('body',e=>e.innerText)).includes('独立模拟 · 单机版'));
  await page.screenshot({path:path.join(output,'offline-lobby.png')});
  await page.click('[data-testid="loadout-open"]');
  await page.waitForSelector('.lo-grid [data-chess="chess_rm_oblvns_a"]',{timeout:15000});
  const preferences=await page.evaluate(async()=>{
    const {getLoadoutCatalog}=await import('/js/ui/loadoutCatalog.js');const catalog=getLoadoutCatalog();
    const {skinIds}=await import('/shared/skins.js');
    const skin=skinIds(catalog.assets,catalog.chess.chess_exp_shu_a)[0];if(!skin)throw Error('Missing Shu skin');
    const {setEntries,closeLoadout}=await import('/js/ui/loadoutSync.js');
    setEntries({chess_exp_shu_a:{skill:2,module:'none',skin},chess_rm_oblvns_a:{skill:2,module:'none'}});closeLoadout();
    return {skin,roster:Object.keys(catalog.chess).length};
  });
  await page.waitForFunction(async()=>{const {loadoutStore}=await import('/js/ui/loadoutSync.js');return loadoutStore.get().sync==='synced';},{timeout:15000});
  await page.evaluate(()=>__SP__.net.request('room.create',{mode:'solo',difficulty:'NORMAL',ranked:false}));
  await page.waitForSelector('.room-tests',{timeout:10000});
  // Click the real test-content button and inspect the real modal, then start using its protocol.
  const testButton=await page.evaluateHandle(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('测试内容')));
  await testButton.asElement().click();
  await page.waitForSelector('.room-tests-list');
  assert.equal(await page.$$eval('.room-tests-list input',xs=>xs.length),8);
  const menu=await page.evaluate(()=>__SP__.store.get().room.testMenu);
  await page.evaluate(async menu=>{await __SP__.net.request('room.start',{tests:{version:menu.version,ids:['extended-rounds-24','shop-extra-slot','arknights-expansion-v1','rhodes-mujica-v1']}});},menu);
  await page.waitForFunction(()=>__SP__.store.get().match.public?.phase==='INFO_CHECK',{timeout:15000});
  await page.evaluate(()=>__SP__.net.request('g.infoReady'));
  await page.waitForFunction(()=>__SP__.store.get().match.public?.phase==='BAND_DRAFT',{timeout:15000});
  await page.waitForSelector('.draft-detail button');
  const confirmButton=await page.evaluateHandle(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('确认选择')));
  await confirmButton.asElement().click();
  await page.waitForFunction(()=>__SP__.store.get().match.public?.phase==='PREP',{timeout:15000});
  const first=await page.evaluate(()=>({pub:__SP__.store.get().match.public,priv:__SP__.store.get().match.private}));
  assert.equal(first.pub.testRules.batches.length,4);assert.ok(first.priv.testOperators.canToggle);
  assert.equal(first.priv.testOperators.catalog.length,7);assert.equal(first.priv.testOperators.enabled,false);
  assert.equal(first.priv.loadout.chess_exp_shu_a.skin,preferences.skin);assert.equal(first.priv.loadout.chess_rm_oblvns_a.skill,2);
  await page.click('.test-operators-enable');await page.waitForSelector('.test-operators');await page.click('.test-operators');
  await page.waitForSelector('input[data-operator="chess_rm_oblvns_a"][data-elite="true"]');
  await page.click('input[data-operator="chess_exp_shu_a"][data-elite="false"]');
  await page.click('input[data-operator="chess_rm_oblvns_a"][data-elite="true"]');
  await page.click('.test-operators-confirm');
  await page.waitForFunction(()=>__SP__.store.get().match.private.testOperators?.claimed===true);
  const deployed=await page.evaluate(async()=>{
    const {placementContext,boardTargets}=await import('/js/ui/gameLogic.js');
    const {makeLookups}=await import('/js/ui/gameComponents.js');
    const gd=makeLookups();
    const uids=__SP__.store.get().match.private.hand.filter(p=>p?.testOperator).map(p=>p.uid);
    for(const uid of uids){
      const s=__SP__.store.get(),ctx=placementContext({priv:s.match.private,stage:gd.stage(s.match.public.stageId),editable:true,getChess:gd.chess,getToken:gd.token,getItem:gd.item,getEffect:gd.effect});
      const tile=boardTargets(ctx,uid).legal.find(([r,c])=>!ctx.boardAt.has(`${r},${c}`));
      if(!tile)throw new Error('No legal tile for test unit');
      await __SP__.net.request('g.move',{uid,to:{area:'board',row:tile[0],col:tile[1]},dir:'RIGHT'});
    }
    return __SP__.store.get().match.private.board.length;
  });
  assert.equal(deployed,2,'Expansion operators deployed through actual local engine');
  await page.screenshot({path:path.join(output,'offline-prep.png')});
  await page.evaluate(()=>__SP__.net.request('g.ready',{ready:true}));
  await page.waitForFunction(()=>__SP__.store.get().match.public?.phase==='COMBAT',{timeout:15000});
  await new Promise(r=>setTimeout(r,5000));
  await page.screenshot({path:path.join(output,'offline-combat.png')});
  await page.evaluate(()=>window.__SP_OFFLINE_SUSPEND__());
  await page.waitForFunction(()=>__SP__.store.get().match.public?.paused===true,{timeout:10000});
  await page.evaluate(()=>__SP__.net.request('g.pause',{on:false}));
  await page.waitForFunction(()=>__SP__.store.get().match.public?.round===2,{timeout:90000});
  assert.deepEqual(forbidden,[]);assert.deepEqual(upgrades,[]);assert.deepEqual(webSockets,[]);
  assert.ok(!requests.some(p=>/^\/(auth|ranked|ws|app\/resource|account)/.test(p)));
  assert.deepEqual(pageErrors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(missing,[]);
  report.browser={localRequests:requests.length,externalRequests:forbidden,webSockets,missing,pageErrors,consoleErrors,preferences,roundReached:await page.evaluate(()=>__SP__.store.get().match.public?.round)};
  report.checks.push('Touch viewport: actual APK Worker, expanded loadout and saved skin, eight test entries, mixed-tier grant UI, both packs combat, background pause and R2; zero external/account/rank/WebSocket requests');
}catch(error){
  const state=await debugPage?.evaluate(()=>({text:document.body.innerText.slice(0,5000),state:window.__SP__?.store.get()})).catch(()=>null);
  await debugPage?.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
  console.error(JSON.stringify({message:error.message,pageErrors,consoleErrors,missing,forbidden,requests:requests.slice(-100),workers:debugPage?.workers().map(w=>w.url()),state},null,2));
  await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({report,pageErrors,consoleErrors,missing,forbidden,requests,state},null,2));throw error;
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
await fs.writeFile(path.join(output,'verification.json'),JSON.stringify(report,null,2));
await fs.writeFile(path.join(root,'mobile/offline-dist/offline-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
