import {existsSync,mkdirSync} from 'node:fs';
import {startServer,ROOT} from '../server/index.js';
import {appPage} from '../test/helpers/appPage.mjs';
import puppeteer from 'puppeteer-core';
import path from 'node:path';
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false}),browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});
try{
 const page=await appPage(await browser.newPage());await page.setViewport({width:1280,height:720});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0');await page.waitForFunction(()=>__demo?.ready||__demo?.error);mkdirSync(path.join(ROOT,'../reports/rhodes-0.3.6/visuals'),{recursive:true});
 for(const tier of [2,3]){
  await page.evaluate(async tier=>{
   const{data,setMatchContent}=await import('/js/data.js');await setMatchContent({batches:[{id:'rhodes-mujica-v1'}]});const view=__demo.view;view.setStage(data.lookup('stages','act2autochess_m01'));
   const r=view.debug.fx.rhodesFire;if(!r.originalUpdate)r.originalUpdate=r.update.bind(r);r.update=r.originalUpdate;r.clear();
   r.salvo({tier,r:tier===3?1.5:1.2,t:tier===3?.3:.5,locks:[{x:6,y:9.5,type:'phys'},{x:8,y:9.5,type:'arts'},...(tier===3?[{x:7,y:11,type:'true'}]:[])]});r.originalUpdate(tier===3?.15:.25);r.update=()=>{};
  },tier);await new Promise(r=>setTimeout(r,120));await page.screenshot({path:path.join(ROOT,'../reports/rhodes-0.3.6/visuals/ri-'+(tier*3)+'-warning.png')});
  await page.evaluate(tier=>{const r=__demo.view.debug.fx.rhodesFire;r.clear();for(const e of [{x:6,y:9.5,type:'phys'},{x:8,y:9.5,type:'arts'},...(tier===3?[{x:7,y:11,type:'true'}]:[])])r.impact({...e,r:tier===3?1.5:1.2,tier});r.originalUpdate(.08);},tier);await new Promise(r=>setTimeout(r,100));await page.screenshot({path:path.join(ROOT,'../reports/rhodes-0.3.6/visuals/ri-'+(tier*3)+'-impact.png')});
 }
 if(errors.length)throw Error(errors.join('\n'));console.log('6/9 warnings and impacts captured without renderer errors');
}finally{await browser.close();await srv.close();}

