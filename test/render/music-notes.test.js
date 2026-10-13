import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installFakePixi} from './fakepixi.js';
import {MusicNoteView,musicNoteTextures} from '../../public/js/render/musicNotes.js';

test('musical projectiles keep the glyph upright, follow world motion and reuse shared textures after cleanup',()=>{
 const fake=installFakePixi();
 try{
  let pan=0;
  const cam={project:(x,y,z)=>({x:x*30+pan,y:-y*30-z*10,s:30})};
  const options={height:.5,depth:10,ownerX:1,ownerY:1};
  const a=new MusicNoteView(fake.P),b=new MusicNoteView(fake.P);
  a.update([1,2,1,'phys'],cam,1/60,options);b.update([2,3,1,'phys'],cam,1/60,options);
  assert.equal(a.glyph.texture,b.glyph.texture);assert.equal(a.ribbon.texture,b.ribbon.texture);
  assert.equal(a.glyph.rotation,0);assert.equal(a.ribbon.rotation,0);
  const allocations=fake.canvases.length;
  // Panning the camera without moving the projectile must not change its travel direction.
  pan=100;a.update([1,2,1,'phys'],cam,1/60,options);
  assert.equal(a.root.x,160);assert.equal(a.ribbon.rotation,0);
  a.update([1,2,2,'phys'],cam,1,options);
  assert.equal(a.glyph.rotation,0);assert.equal(a.ribbon.rotation,-Math.PI/2);
  assert.equal(fake.canvases.length,allocations);
  const texture=a.glyph.texture;a.destroy();assert.ok(a.root.destroyed);
  assert.equal(texture.destroyed,false);assert.equal(texture.baseTexture.destroyed,false);
  b.update([2,3,2,'arts'],cam,1,options);
  assert.notEqual(b.glyph.texture,texture);assert.equal(b.glyph.texture,musicNoteTextures('arts').glyph);
  const arts=b.glyph.texture;b.destroy();assert.equal(arts.destroyed,false);
 }finally{fake.restore();}
});
