import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {startServer,ROOT} from '../server/index.js';
import {appPage} from './helpers/appPage.mjs';

test('Clementia ordinary and elite Front/Back models read actual Windows cache without in-match resource downloads',async t=>{
  const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  if(!executablePath){t.skip('Chromium required for rendered scene checks');return;}
  const folder=await fs.mkdtemp(path.join(ROOT,'.cache','resource-scenes-'));let srv,child,browser;
  const localReads=[],misses=[],errors=[];
  t.after(async()=>{
    if(errors.length||misses.length)console.error('Scene failures',JSON.stringify({errors,misses}));
    await browser?.close();
    if(child&&child.exitCode==null){const stopped=new Promise(resolve=>child.once('exit',resolve));child.stdin.end();child.kill();await stopped;}
    await srv?.close();await fs.rm(folder,{recursive:true,force:true});
  });
  const output=path.join(folder,'runner'),env={...process.env,DOTNET_CLI_HOME:path.join(ROOT,'.cache/dotnet'),NUGET_PACKAGES:path.join(ROOT,'.cache/nuget'),DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
  const built=spawnSync('dotnet',['build',path.join(ROOT,'test/resource-scenes/CacheBridge.csproj'),'-c','Release','-o',output],{env,encoding:'utf8',windowsHide:true});assert.equal(built.status,0,built.stdout+built.stderr);
  srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});
  const serverRoutes=[];srv.server.on('request',req=>serverRoutes.push(req.url));
  child=spawn('dotnet',[path.join(output,'CacheBridge.dll'),srv.url+'/',path.join(folder,'cache'),path.join(ROOT,'mobile/full-dist/stronghold-windows-full')],{env,windowsHide:true});
  let seq=0,stderr='';child.stderr.on('data',b=>stderr+=b);const pending=new Map();
  let readyResolve,readyReject;const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
  createInterface({input:child.stdout}).on('line',line=>{const reply=JSON.parse(line);if(reply.ready)readyResolve(reply);else{const p=pending.get(reply.id);pending.delete(reply.id);p?.resolve(reply);}});
  child.on('error',readyReject);child.on('exit',code=>{const error=new Error('Cache bridge exited '+code+' '+stderr);readyReject(error);for(const p of pending.values())p.reject(error);});
  await ready;
  console.log('Native resource cache ready');
  // An older full installer legitimately updates missing content during Prepare, before a game exists.
  const preparationRoutes=serverRoutes.splice(0);
  const local=(route,head=false)=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});child.stdin.write(JSON.stringify({id,route,head})+'\n');});
  // Verify new skins were prepared globally before enabling any match batch.
  const audit=JSON.parse(await fs.readFile(path.join(ROOT,'tools/assets/expansion-skins-audit.json'),'utf8'));
  const skinPaths=new Set();for(const s of audit.added){skinPaths.add(s.avatar);skinPaths.add(s.portrait);Object.values(s.spine).flat().forEach(p=>skinPaths.add(p));for(const token of s.tokens)token.spine.forEach(p=>skinPaths.add(p));}
  const preloadedExpansionFiles=[];
  for(const p of skinPaths){const route='/assets/skins/'+p,response=await local(route,true);assert.equal(response.status,200,route);preloadedExpansionFiles.push(route);}
  assert.equal(preloadedExpansionFiles.length,96);
  const puppeteer=(await import('puppeteer-core')).default;
  browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--autoplay-policy=no-user-gesture-required']});
  const page=await appPage(await browser.newPage());await page.setViewport({width:1280,height:720});await page.setCacheEnabled(false);
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});let scene='boot';
  await page.setRequestInterception(true);
  page.on('request',async request=>{
    try{
      const target=new URL(request.url());
      // Optional external fonts must not keep the asset/cache test waiting on an unavailable network.
      if(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(target.href)){await request.respond({status:200,contentType:'text/css',body:''});return;}
      if(target.origin!==srv.url){await request.continue();return;}
      const route=target.pathname+target.search;
      if(/^\/(?:assets|fonts|icons|data|media|app-cache)\//.test(target.pathname)||target.pathname==='/app/resource-manifest'){
        const response=await local(route,request.method()==='HEAD');const body=Buffer.from(response.body,'base64');
        if(response.status!==200)misses.push({scene,route,error:body.toString()});
        else localReads.push({scene,route,bytes:body.length});
        await request.respond({status:response.status,headers:{'Content-Type':response.mime,'Cache-Control':'no-store','X-Stronghold-Resource':'local'},body});return;
      }
      if(target.pathname==='/dev/game-mock.html'){
        let html=await fs.readFile(path.join(ROOT,'public/dev/game-mock.html'),'utf8');
        html=html.replace('<script type="module" src="/dev/game-mock.js"></script>','<script type="module">import {initAppResources} from "/js/appResources.js"; await initAppResources(); await import("/dev/game-mock.js");</script>');
        await request.respond({status:200,contentType:'text/html',body:html});return;
      }
      await request.continue();
    }catch(error){errors.push(error.message);try{await request.abort();}catch{}}
  });
  const settle=async()=>{
    // This check concerns native fixed-resource reads. A live mock keeps unrelated network/audio
    // activity running; wait for its cache bridge and actual Spine loader instead of all networking.
    const deadline=Date.now()+30000;let idleSince=0;
    while(Date.now()<deadline){if(pending.size)idleSince=0;else if(!idleSince)idleSince=Date.now();else if(Date.now()-idleSince>=1200)break;await new Promise(r=>setTimeout(r,100));}
    assert.equal(pending.size,0,'native fixed-resource responses settled: '+scene);
    await page.waitForFunction(()=>{const s=globalThis.__SP_VIEW__?.raw?.stats?.().spine;return s&&s.loading===0&&s.active===0&&s.queued===0;},{timeout:30000});
  };
  await page.goto(srv.url+'/dev/game-mock.html?phase=PREP&shot=1',{waitUntil:'domcontentloaded'});
  console.log('Game harness loaded');
  await page.waitForFunction(()=>globalThis.__MOCK__&&globalThis.__SP_VIEW__,{timeout:45000});await settle();
  assert.equal(await page.evaluate(()=>__SP_VIEW__.kind),'engine','real WebGL renderer required');
  await page.mouse.click(2,2);await settle(); // Unlock Web Audio through an actual user gesture.
  scene='clemnt-prep';
  await page.evaluate(async()=>{const {setMatchContent}=await import('/js/data.js');await setMatchContent({batches:[{id:'arknights-expansion-v1'}]});__MOCK__.setPhase('PREP');__MOCK__.mutate(s=>{s.priv.board=[{uid:9001,kind:'chess',id:'chess_exp_clemnt_a',items:[],row:10,col:4,dir:'RIGHT'},{uid:9002,kind:'chess',id:'chess_exp_clemnt_b',items:[],row:11,col:5,dir:'UP'}];});const {net}=await import('/js/net.js');await net.request('g.watch',{fieldId:'n:p1'});});
  await page.waitForFunction(()=>{const views=[...__SP_VIEW__.raw.debug.views.values()];return views.some(v=>v.info?.defId==='chess_exp_clemnt_a'&&v.spineReady)&&views.some(v=>v.info?.defId==='chess_exp_clemnt_b'&&v.spineReady&&v.entryBack);},{timeout:30000});await settle();
  await page.screenshot({path:path.join(ROOT,'../reports/clemnt-native-prep.png')});
  const fixedServerRoutes=serverRoutes.filter(route=>/^\/(?:assets|fonts|icons|data|media|app-cache)\//.test(route)||/^\/app\/resource-(?:file|pack|catalog)\//.test(route));
  assert.deepEqual(fixedServerRoutes,[]);assert.deepEqual(misses,[]);assert.deepEqual(errors,[]);
  for(const side of ['front','back'])assert.ok(localReads.some(r=>r.route.includes('/assets/spine/op/char_4231_clemnt/'+side+'/')));
  await fs.writeFile(path.join(ROOT,'../reports/clemnt-native-resource-results.json'),JSON.stringify({serverFixedBytes:0,localReads,misses,errors},null,2));
});
