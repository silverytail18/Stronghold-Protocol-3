import {test} from 'node:test';import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';import {buildKazdelData,CORE,BLOOD} from '../../server/sim/content/kazdel/data.js';
import {formatBondEffect} from '../../public/js/ui/richText.js';import {kazdelPanelPlacement} from '../../public/js/ui/kazdelPanelLayout.js';
const raw=buildKazdelData(getData());
test('concise native-style summaries retain tier identity and inactive panels promise no bonuses',()=>{
 assert.ok(raw.bonds[CORE].desc.length<300);assert.ok(raw.bonds[BLOOD].desc.length<160);
 assert.match(formatBondEffect(raw.bonds[CORE],999,0),/未激活/);assert.doesNotMatch(formatBondEffect(raw.bonds[CORE],999,0),/519|599/);
 const text=formatBondEffect(raw.bonds[CORE],0,1);for(const value of ['10%','8秒','500','5—10秒'])assert.ok(text.includes(value),value);
});
test('999-layer current panel resolves actual HP, native damage, budgets, echoes, blood healing and live curse',()=>{
 const text=formatBondEffect(raw.bonds[CORE],999,3,{soulFire:51950,generationRate:.6,capacity:60000,openingCapacity:60000,budget:193820,live:true});
 for(const value of ['519.5%','539.5%','51,950','10,800','45%','60,000','1,655','3,310','5.0秒','5格','1秒'])assert.ok(text.includes(value),value);
 const blood=formatBondEffect(raw.bonds[BLOOD],999,2);for(const value of ['33.97%','19.98%','4,196'])assert.ok(blood.includes(value),value);
 assert.match(formatBondEffect(raw.bonds[CORE],10000,3),/519.5%/);
});
test('telemetry uses right middle and avoids real buff, shop and detail rectangles on desktop and phone',()=>{
 for(const [width,height]of [[1280,720],[844,390],[568,320]]){
  const frame={left:0,top:0,width,height},size={width:168,height:145},obstacles=[{left:width-55,right:width,top:80,bottom:height},{left:0,right:width,top:height-45,bottom:height}];
  const p=kazdelPanelPlacement(frame,size,obstacles);assert.ok(p);assert.ok(p.left+168<width-55);assert.ok(p.top>0&&p.top+145<height-45);assert.ok(p.left>width*.4);
 }
 assert.equal(kazdelPanelPlacement({left:0,top:0,width:568,height:320},{width:168,height:145},[{left:0,top:0,right:568,bottom:320}]),null);
});
