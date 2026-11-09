import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FxWiring} from '../../public/js/render/vfx/wiring.js';
const index=JSON.parse(fs.readFileSync(new URL('../../public/assets/local/fx/index.json',import.meta.url)));
function setup(){
 const events=[],ofx={active:true,time:0,timers:[],lib:{has:key=>!!index.prefabs[key]},spawn:(key,place)=>events.push({key,place})};
 const w=new FxWiring(ofx);w.idx=index;w.skills.bindsReached=()=>false;
 w.playOn=(key)=>events.push({key,attached:true});
 const advance=time=>{ofx.time=time;const due=ofx.timers.filter(t=>t.at<=time);ofx.timers=ofx.timers.filter(t=>t.at>time);for(const t of due)t.fn();};
 return{w,ofx,events,advance};
}
for(const mode of ['default','s1','s2','s3'])test(`official Wisdel ${mode}: arrival then grounded stop blast at native delay, even after target disappears`,()=>{
 const{w,events,advance}=setup(),proj=index.projectiles['projectile_chr_wisdel_'+mode],at=[8,10,-0.4],target={id:2,z:0};
 assert.ok(proj.onStop.length);w._arrive(proj,target,at,null);
 assert.ok(!events.some(e=>proj.onStop.includes(e.key)),'not before stop');
 at[0]=100;target.x=100;target.destroyed=true;
 advance(0.14);assert.ok(!events.some(e=>proj.onStop.includes(e.key)));
 advance(0.15);const blasts=events.filter(e=>proj.onStop.includes(e.key));assert.equal(blasts.length,proj.onStop.length);
 for(const e of blasts){assert.deepEqual(e.place.pos,[8,10,0]);assert.equal(e.place.groundZ,0);}
 advance(1);assert.equal(events.filter(e=>proj.onStop.includes(e.key)).length,proj.onStop.length);
});
test('stop timers are removed on field clear; a skill-owned reached effect does not suppress its separate stop phase',()=>{
 const{w,events,advance}=setup(),proj=index.projectiles.projectile_chr_wisdel_s3;
 w.skills.bindsReached=()=>true;w._arrive(proj,{id:2,z:0},[8,10,-0.4],null,[],{});
 advance(0.15);assert.ok(events.some(e=>proj.onStop.includes(e.key)));
 const next=setup();next.w._arrive(proj,{id:2,z:0},[8,10,0],null);
 next.w.clear();next.advance(1);assert.ok(!next.events.some(e=>proj.onStop.includes(e.key)));
});
test('ordinary projectiles without stop effects retain only their existing hit/reached phases',()=>{
 const{w,events,ofx}=setup();w._arrive({onHit:['wisdel_attack_01_hit']},{id:2,z:0},[8,10,0],null);
 assert.deepEqual(events.map(e=>e.key),['wisdel_attack_01_hit']);assert.equal(ofx.timers.length,0);
});
test('Kazdel and DIY visual identity, including both skins, reuse the same native attack modes',()=>{
 for(const defId of ['chess_kz_wisdel_a','char_1035_wisdel'])for(const skin of [null,'char_1035_wisdel@sale#14','char_1035_wisdel@game#9']){
  const{w}=setup(),unit=w.unitOf({id:1,info:{spine:'char_1035_wisdel',defId,skin}});
  assert.strictEqual(unit.modes,index.units.char_1035_wisdel.modes);
 }
});
