import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {startServer} from '../../server/index.js';
import {appPage} from '../helpers/appPage.mjs';
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';

test('real client water vortex keeps a transparent centre, coalesces ticks and renders over the board',{skip:!existsSync(chrome)},async t=>{
 const server=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>server.close());
 const browser=await(await import('puppeteer-core')).default.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});t.after(()=>browser.close());
 const page=await appPage(await browser.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:1280,height:720});
 await page.goto(server.url+'/dev/render-demo.html?scene=fx&paused=1&panel=0',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__demo?.ready||window.__demo?.error,{timeout:60000});
 const result=await page.evaluate(async()=>{
  const {waterVortexTextures}=await import('/js/render/waterVortex.js');
  const fx=window.__demo.view.debug.fx;fx.clear();
  const textures=waterVortexTextures(),body=textures.body.baseTexture.resource.source;
  const centre=Array.from(body.getContext('2d').getImageData(196,196,120,120).data);
  for(let i=0;i<240;i++){fx.simFx(i<30?'exp-clemnt-pod':'exp-clemnt-vortex',6+Math.min(2,i/15),10,{src:901,r:1.5,dur:.12});fx.update(.025);}
  const v=fx.waterVortices.views.get(901),q={x:v.root.x,y:v.root.y};
  const state={centreAlpha:Math.max(...centre.filter((_,i)=>i%4===3)),views:fx.waterVortices.views.size,particles:fx.parts.length,rootAlpha:v.root.alpha,normal:v.root.children.every(s=>s.blendMode===PIXI.BLEND_MODES.NORMAL),rotation:v.body.rotation};
  // Hold this one cosmetic view for a review screenshot; battle rules are never touched.
  fx.simFx('exp-clemnt-vortex',8,10,{src:901,r:1.5,dur:10});
  return {state,point:q,texture:body.toDataURL('image/png')};
 });
 assert.equal(result.state.centreAlpha,0);assert.equal(result.state.views,1);assert.equal(result.state.particles,0);
 assert.ok(result.state.rootAlpha<=.78);assert.ok(result.state.normal);assert.ok(result.state.rotation<0);
 const out=path.resolve('../reports');mkdirSync(out,{recursive:true});
 writeFileSync(path.join(out,'clemnt-water-texture-0.3.4.png'),Buffer.from(result.texture.split(',')[1],'base64'));
 await page.screenshot({path:path.join(out,'clemnt-water-board-0.3.4.png')});
 await page.screenshot({path:path.join(out,'clemnt-water-detail-0.3.4.png'),clip:{x:Math.max(0,Math.min(920,result.point.x-180)),y:Math.max(0,Math.min(400,result.point.y-160)),width:360,height:320}});
 const cleaned=await page.evaluate(()=>{const fx=window.__demo.view.debug.fx;fx.update(6);return fx.waterVortices.views.size;});
 assert.equal(cleaned,0);assert.deepEqual(errors,[]);
});
