import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {startServer,ROOT} from '../server/index.js';
import {appPage} from './helpers/appPage.mjs';

test('rendered teammate watching, combat watching, final boss and hidden boss read fixed resources through the real Windows cache without server downloads',async t=>{
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
  scene='skins-prep';
  const skinFixture=await page.evaluate(async()=>{
    const {data}=await import('/js/data.js');
    const [skinId,skin]=Object.entries(data.get('assets').skinModels).find(([,s])=>s.charId==='char_391_rosmon'&&s.portraitKind==='illustration'&&s.spine?.back);
    const chess=data.list('chess').find(c=>!c.isGolden&&c.visible&&c.charId===skin.charId);
    __MOCK__.mutate(s=>{s.priv.board[0]={...s.priv.board[0],id:chess.chessId,skinId,dir:'UP'};});
    return {skinId,chessId:chess.chessId};
  });
  await page.waitForFunction(id=>[...__SP_VIEW__.raw.debug.views.values()].some(v=>v.info?.spine===id&&v.spineReady&&v.entryBack),{timeout:30000},skinFixture.skinId);await settle();
  await page.screenshot({path:path.join(ROOT,'.cache/resource-scene-skin-back.png')});
  // Capture combat metadata so this mock can replay the server's watch resync.
  // Its existing g.watch handler changes fieldId but omits current-unit spawn frames.
  await page.evaluate(async()=>{
    const {net}=await import('/js/net.js');const emit=net._emit.bind(net);
    globalThis.__RESOURCE_SCENE_FRAMES__={units:new Map(),snap:null};
    net._emit=(type,frame)=>{
      const frames=globalThis.__RESOURCE_SCENE_FRAMES__;
      if(type==='b.ev')for(const [event,info] of frame.ev||[])if(event==='spawn')frames.units.set(info.id,info);
      if(type==='b.snap')frames.snap=frame;
      return emit(type,frame);
    };
  });
  scene='teammate-prep';
  const teammateTitle=await page.evaluate(()=>[...document.querySelectorAll('.team__btn')].find(el=>el.title.includes('Doctor·B'))?.title);
  assert.ok(teammateTitle,'teammate avatar exists');await page.click('.team__btn[title="'+teammateTitle+'"]');
  console.log('Teammate avatar selected');
  if(await page.$('.team__ob'))await page.click('.team__ob');
  await page.waitForFunction(()=>__MOCK__.store.get().match.field?.fieldId==='n:p3');console.log('Teammate field selected');await settle();console.log('Teammate assets settled');
  await page.waitForFunction(()=>[...(__SP_VIEW__.raw?.debug?.views?.values()||[])].some(v=>v.info?.ownerId==='p3'&&v.spineReady),{timeout:30000});
  await page.evaluate(async fixture=>{
    const {net}=await import('/js/net.js');const field=__MOCK__.store.get().match.field;let changed=false;
    const units=field.units.map(u=>{if(!changed&&u.kind==='op'){changed=true;return {...u,defId:fixture.chessId,spine:fixture.skinId,avatar:fixture.skinId,skinId:fixture.skinId,dir:'RIGHT'};}return u;});
    const frame={...field,t:'m.field',units};net._emit('m.field',frame);
    __MOCK__.store.set(s=>({match:{...s.match,field:frame}}));
  },skinFixture);
  await page.waitForFunction(id=>[...__SP_VIEW__.raw.debug.views.values()].some(v=>v.info?.ownerId==='p3'&&v.info?.spine===id&&v.spineReady),{timeout:30000},skinFixture.skinId);await settle();
  scene='combat-watch';
  await page.evaluate(async()=>{__MOCK__.setPhase('COMBAT');const {net}=await import('/js/net.js');await net.request('g.watch',{fieldId:'n:p3'});});
  await page.waitForFunction(()=>__MOCK__.store.get().match.public.phase==='COMBAT'&&__MOCK__.store.get().match.field?.fieldId==='n:p3');await settle();
  for(const phase of ['FINAL_ASSAULT','HIDDEN_CORE']){
    scene=phase;await page.evaluate(phase=>{__RESOURCE_SCENE_FRAMES__.units.clear();__RESOURCE_SCENE_FRAMES__.snap=null;__MOCK__.setPhase(phase);},phase);
    await page.waitForFunction(phase=>__MOCK__.store.get().match.public.phase===phase,{},phase);await settle();
    // Enemies arrive through b.ev spawn frames, rather than the initial field.units roster.
    await page.waitForFunction(()=>[...(__SP_VIEW__.raw?.debug?.views?.values()||[])].some(v=>v.info?.boss&&v.spineReady),{timeout:30000});
    const boss=await page.evaluate(async()=>({boss:[...__SP_VIEW__.raw.debug.views.values()].find(v=>v.info?.boss)?.info.defId,kind:__MOCK__.store.get().match.field.kind,stats:__SP_VIEW__.raw.stats(),bgm:(await import('/js/audio.js')).audio.bgm?.key}));
    assert.ok(boss.boss,'Boss Spine actor is present in '+phase);assert.ok(boss.stats.spine.ready>0||boss.stats.spine.count>0||boss.stats.spine.entries>0,'Spine data is cached');t.diagnostic(phase+' '+JSON.stringify(boss));
    await page.screenshot({path:path.join(ROOT,'.cache','resource-scene-'+phase.toLowerCase()+'.png')});
  }
  scene='boss-watch';
  await page.evaluate(async()=>{__MOCK__.mutate(s=>{s.pub.players.find(p=>p.playerId==='p1').alive=false;s.priv.alive=false;});const {net}=await import('/js/net.js');await net.request('g.watch',{fieldId:'b2'});});
  await page.waitForFunction(()=>__MOCK__.store.get().match.field?.fieldId==='b2');await settle();
  await page.evaluate(async()=>{
    const {net}=await import('/js/net.js');const {units,snap}=__RESOURCE_SCENE_FRAMES__;
    const ev=snap.units.map(unit=>units.get(unit[0])).filter(Boolean).map(info=>['spawn',{...info,ownerId:'p3'}]);
    net._emit('b.ev',{t:'b.ev',fieldId:'b2',gt:snap.gt,ev});
    net._emit('b.snap',{...snap,fieldId:'b2'});
  });
  await page.waitForFunction(()=>[...(__SP_VIEW__.raw?.debug?.views?.values()||[])].some(v=>v.info?.boss&&v.spineReady),{timeout:30000});
  scene='new-content-prep';
  // Start a separate prep fixture for the next match's content; the mock does not implement
  // a real RESULT → lobby → new match transition after its boss/watch replay.
  await page.goto(srv.url+'/dev/game-mock.html?phase=PREP&shot=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.__MOCK__&&globalThis.__SP_VIEW__,{timeout:45000});await settle();
  await page.evaluate(async()=>{
    const {setMatchContent}=await import('/js/data.js');
    await setMatchContent({batches:[{id:'arknights-expansion-v1'},{id:'rhodes-mujica-v1'}]});
    __MOCK__.setPhase('PREP');
    __MOCK__.mutate(s=>{
      s.pub.players.find(p=>p.playerId==='p1').alive=true;s.priv.alive=true;
      const skins=['char_2014_nian_nian_4','char_2023_ling_nian_12','char_2025_shu_nian_11','char_201_moeshd_summer_4','char_101_sora_epoque_17',null];
      s.priv.board=['nian','ling','shu','croissant','sora','aglna2','clemnt'].map((name,i)=>({uid:8100+i,kind:'chess',id:`chess_exp_${name}_a`,skinId:skins[i],items:[],row:10+(i%2),col:3+i,dir:'RIGHT'}));
      s.priv.board.push({uid:8200,kind:'token',id:'token_10020_ling_soul3_advanced',skinId:'token_10020_ling_soul3_nian_12_advanced',ownerUid:8101,count:1,row:12,col:5,dir:'RIGHT'});
    });
    const {net}=await import('/js/net.js');await net.request('g.watch',{fieldId:'n:p1'});
  });
  await page.waitForFunction(()=>{
    const ids=new Set([...__SP_VIEW__.raw.debug.views.values()].filter(v=>v.spineReady).map(v=>v.info?.defId));
    return ['nian','ling','shu','croissant','sora','aglna2','clemnt'].every(n=>ids.has(`chess_exp_${n}_a`))&&ids.has('token_10020_ling_soul3_advanced');
  },{timeout:30000}).catch(async e=>{console.error('New prep model state',await page.evaluate(()=>({views:[...__SP_VIEW__.raw.debug.views.values()].map(v=>({id:v.info?.defId,ready:v.spineReady})),stats:__SP_VIEW__.raw.stats()})));throw e;});await settle();
  await page.screenshot({path:path.join(ROOT,'.cache/resource-scene-sui-penguin.png')});
  assert.deepEqual(misses,[],'scene resource paths all hit the native cache');assert.deepEqual(errors,[]);
  const fixedServerRoutes=serverRoutes.filter(route=>/^\/(?:assets|fonts|icons|data|media|app-cache)\//.test(route)||/^\/app\/resource-(?:file|pack|catalog)\//.test(route));
  assert.deepEqual(fixedServerRoutes,[],'the game server received no fixed-resource downloads');
  assert.ok(localReads.some(r=>r.scene==='teammate-prep'&&/\.(?:skel|atlas|png)(?:\?|$)/.test(r.route)),'new teammate models were requested locally');
  assert.ok(localReads.some(r=>r.scene==='skins-prep'&&r.route.includes('/assets/skins/')&&r.route.includes('/Back/')),'selected skin Back model was read locally');
  assert.ok(localReads.some(r=>r.scene==='teammate-prep'&&r.route.includes('/assets/skins/')&&r.route.includes('/Front/')),'selected teammate skin Front model was read locally');
  for(const phase of ['FINAL_ASSAULT','HIDDEN_CORE'])assert.ok(localReads.some(r=>r.scene===phase&&/\.(?:skel|atlas)(?:\?|$)/.test(r.route)),'Boss Spine resources loaded locally in '+phase);
  assert.ok(localReads.some(r=>r.scene==='new-content-prep'&&r.route.includes('/assets/skins/')&&r.route.includes('char_2025_shu_nian_11')),'Shu skin reads native cache');
  assert.ok(localReads.some(r=>r.scene==='new-content-prep'&&r.route.includes('/assets/spine/op/char_1015_aglna2/')),'Aglna model reads native cache');
  const report={preparationRoutes,preloadedExpansionFiles,serverFixedRequests:fixedServerRoutes,serverFixedBytes:0,localReads,misses,errors};
  await fs.writeFile(path.join(ROOT,'.cache/resource-scene-results.json'),JSON.stringify(report,null,2));
  for(const name of ['boot','skins-prep','teammate-prep','combat-watch','FINAL_ASSAULT','HIDDEN_CORE','boss-watch','new-content-prep'])t.diagnostic(name+': '+localReads.filter(r=>r.scene===name).length+' native local reads; 0 server fixed-resource bytes');
});
