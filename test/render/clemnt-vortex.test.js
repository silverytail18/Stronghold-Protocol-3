import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {installFakePixi,fakeViewCtx} from './fakepixi.js';
import {presetCamera} from '../../public/js/render/projection.js';
let fake,FX;
before(async()=>{fake=installFakePixi();FX=await import('../../public/js/render/fx.js');});
after(()=>fake.restore());
function makeFx(ts=2){
 const ctx=fakeViewCtx(fake.P);
 return new FX.FxSystem({...ctx,cam:()=>presetCamera('normal',{width:1280,height:720}),timeScale:()=>ts,view:()=>null,screenSize:()=>({width:1280,height:720}),fieldTop:()=>100});
}
test('moving pod and stopped vortex refresh one normal-blend view without explosion stacking',()=>{
 const fx=makeFx();
 for(let i=0;i<500;i++){
  const kind=i<30?'exp-clemnt-pod':'exp-clemnt-vortex';
  fx.simFx(kind,5+Math.min(3,i/10),10,{src:1,r:1.5,dur:.12});fx.update(.025);
  assert.equal(fx.waterVortices.views.size,1);assert.equal(fx.parts.length,0);assert.equal(fx.rings.length,0);
 }
 const v=fx.waterVortices.views.get(1);
 assert.equal(v.x,8);assert.ok(v.root.alpha>0&&v.root.alpha<=.78);
 assert.ok(v.root.children.every(s=>s.blendMode===fake.P.BLEND_MODES.NORMAL));
 const textures=v.root.children.map(s=>s.texture),allocations=fake.canvases.length;
 fx.simFx('exp-clemnt-vortex',7,10,{src:2,r:1.5,dur:.12});fx.update(.025);
 assert.equal(fx.waterVortices.views.size,2);assert.equal(fake.canvases.length,allocations);
 fx.update(.2);assert.equal(fx.waterVortices.views.size,0);assert.ok(v.root.destroyed);
 assert.ok(textures.every(t=>!t.destroyed&&!t.baseTexture.destroyed));fx.destroy();
});
test('water views are capped, cleared with the battle and honor pause and accelerated clocks',()=>{
 const fx=makeFx();for(let i=0;i<40;i++)fx.simFx('exp-clemnt-vortex',5,10,{src:i,r:1.5,dur:.12});
 assert.equal(fx.waterVortices.views.size,16);
 fx.update(0);assert.equal(fx.waterVortices.views.size,16);
 const roots=[...fx.waterVortices.views.values()].map(v=>v.root);fx.clear();
 assert.equal(fx.waterVortices.views.size,0);assert.ok(roots.every(r=>r.destroyed));fx.destroy();
 const fast=makeFx(4);fast.simFx('exp-clemnt-vortex',5,10,{src:1,r:1.5,dur:.12});fast.update(.07);
 assert.equal(fast.waterVortices.views.size,0);fast.destroy();
});
