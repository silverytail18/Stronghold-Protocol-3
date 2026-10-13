import {startServer} from '../server/index.js';
import {appPage} from '../test/helpers/appPage.mjs';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
try{const page=await appPage(await browser.newPage());await page.goto(srv.url+'/dev/render-demo.html?scene=prep&paused=1&panel=0');await page.waitForFunction(()=>__demo.ready||__demo.error);
 const result=await page.evaluate(async()=>{const {setMatchContent,data}=await import('/js/data.js'),{assets}=await import('/js/assets.js'),{SpineActor}=await import('/js/render/spine.js');await setMatchContent({batches:[{id:'rhodes-mujica-v1'}]});assets.seed(data.get('assets'));
 const app=new PIXI.Application({width:1000,height:700,backgroundColor:0x303447,antialias:true});document.body.replaceChildren(app.view);window.diag={app,actors:[]};
 const out=[];for(const [i,id]of ['char_4183_mortis_avemujica_1','char_4183_mortis','char_002_amiya','char_1052_kalts2'].entries()){const entry=assets.spineEntry(id),sd=await assets.spine.acquire(entry),a=new SpineActor(sd,entry);a.spine.position.set(140+i*240,430);a.spine.scale.set(.65);app.stage.addChild(a.spine);a.update(.5);diag.actors.push(a);
  out.push({id,clipped:a.clipped,slots:a.spine.skeleton.slots.map(s=>({name:s.data.name,attachment:s.attachment?.name,type:s.attachment?.type,blend:s.data.blendMode,color:s.color})).filter(s=>s.blend||s.type===6)});
 }return out;});console.log(JSON.stringify(result));await fs.mkdir('../reports/screens',{recursive:true});await page.screenshot({path:'../reports/screens/ri-model-diagnosis.png'});
 await page.evaluate(()=>{for(const a of diag.actors){a.setSkillIndex(1);a.setSkill(true);a.update(.7);a.attack(1);a.update(.5);}});await page.screenshot({path:'../reports/screens/ri-model-skills.png'});
}finally{await browser.close();await srv.close();}
