import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ProductFx} from '../../public/js/render/vfx/productfx.js';
import {FxWiring} from '../../public/js/render/vfx/wiring.js';
import {getData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {makeBattle,enemyRec} from '../helpers/battleHarness.js';
import {emitNote,updateNotes} from '../../server/sim/content/rhodes-mujica/notes.js';
const idx=JSON.parse(fs.readFileSync(new URL('../../public/assets/local/fx/index.json',import.meta.url)));
function display(){
  const roots=[],hits=[],flights=[];const wiring={idx,ofx:{active:true,time:0,spawn(key,place,options){const h={key,place,options,alive:true,stop(){this.alive=false;}};roots.push(h);return h;}},playOn(key,point){hits.push({key,point});return{};},_fly(...args){flights.push(args);}};
  return {wiring,fx:new ProductFx(wiring),roots,hits,flights};
}
test('one complete original dragon root survives updates and turns, two sources stay independent, stop/seek clear roots',()=>{
  const h=display();for(let i=0;i<20;i++){h.wiring.ofx.time=i/10;h.fx.simFx('new-fire-dragon',3+i/10,5,{dragon:'owner1:1',dx:i<10?1:0,dy:i<10?0:1});}
  assert.equal(h.roots.length,1);assert.equal(h.roots[0].key,idx.projectiles.projectile_chr_chen3_s3.main);
  const f={anchor:[0,0,0],yaw:0};h.roots[0].options.track(f);assert.deepEqual(f.anchor,[-5.1,-4,0]);assert.equal(f.yaw,Math.PI/2);
  h.fx.simFx('new-fire-dragon',4,5,{dragon:'owner2:1',dx:-1});assert.equal(h.roots.length,2);
  h.fx.simFx('new-fire-dragon',4,5,{dragon:'owner1:1',phase:'stop'});assert.equal(h.roots[0].alive,false);assert.equal(h.roots[1].alive,true);
  h.fx.clear();assert.equal(h.roots[1].alive,false);assert.equal(h.fx.moving.size,0);
});
test('note ownership and collision target are explicit; heal and damage medical projectiles use distinct original roots',()=>{
  const h=display(),projectile='projectile_chr_oblvns';
  for(const src of [1,2])h.fx.simFx('source-oblvns-note',6,7,{src,note:1,phase:'spawn',projectile,dx:1});
  assert.equal(h.roots.length,2);h.fx.simFx('source-oblvns-note',7,7,{src:1,note:1,phase:'hit',projectile,target:99,dx:1});assert.equal(h.roots.length,2);
  h.fx.attack({}, {info:{side:'enemy'}},'product-kalts2',0);h.fx.attack({}, {info:{side:'ally'}},'product-kalts2',0);
  assert.equal(h.flights[0][0].main,idx.projectiles.projectile_chr_kalts2_s2_dmg.main);assert.equal(h.flights[1][0].main,idx.projectiles.projectile_chr_kalts2_s2_heal.main);
  assert.equal(h.fx.attack({}, {},'product-note',0),true);h.wiring.ofx.time=1;h.fx.tick();assert.equal(h.fx.moving.size,0);
});

test('炸惊祥子S3每颗音符只创建一个原始根，逐帧移动不重生；物法音符、不同施法者隔离且命中结束清理', () => {
  const h = display();
  for (const id of [7, 8]) for (const [noteId, type] of [['a', 'phy'], ['b', 'mag']]) {
    const projectile = 'projectile_chr_oblvns_s3_' + type;
    for (let i = 0; i < 20; i++) {
      h.wiring.ofx.time = i / 10;
      assert.equal(h.fx.simFx('mujicaNote', i / 10, 5, {id, noteId, projectile, state: i ? 'move' : 'spawn', tx: 10, ty: 5}), true);
    }
  }
  assert.equal(h.roots.length, 4); assert.equal(h.fx.moving.size, 4);
  assert.equal(h.roots[0].key, idx.projectiles.projectile_chr_oblvns_s3_phy.main);
  assert.equal(h.roots[1].key, idx.projectiles.projectile_chr_oblvns_s3_mag.main);
  h.fx.simFx('mujicaNote', 2, 5, {id: 7, noteId: 'a', state: 'hit', projectile: 'projectile_chr_oblvns_s3_phy'});
  assert.equal(h.roots.length, 4);
  assert.ok(h.hits.length > 0);
  h.fx.simFx('mujicaNote', 2, 5, {id: 7, noteId: 'a', state: 'end'});
  assert.equal(h.roots[0].alive, false); assert.equal(h.fx.moving.size, 3);
  const wiring = Object.create(FxWiring.prototype); Object.assign(wiring, {ofx: {active: true}, idx: {}});
  assert.equal(wiring.castStart({}, {}, 'product-note'), true, '不再调用普通技能弹道的起手绘制');
  h.fx.clear(); assert.ok(h.roots.every(root => !root.alive));
});
test('Rhodes legacy flight and impact are not swallowed or duplicated by the original operator FX bridge',()=>{
  const h=display();assert.equal(h.fx.simFx('rm-ri-salvo',0,0,{t:.4,locks:[{x:1,y:2,type:'phys'}]}),false);
  assert.equal(h.fx.simFx('rm-ri-impact',2,3,{}),false);assert.equal(h.flights.length,0);assert.equal(h.hits.length,0);
});

test('祥子所有音符形态预热，原始资源不可用时不吞后备绘制且允许重试', () => {
  const h = display();
  Object.assign(h.wiring, {unitKeyOf: () => 'char_4182_oblvns', unitOf: () => ({})});
  const keys = h.fx.keysFor([{}]);
  for (const p of ['projectile_chr_oblvns_s3_phy', 'projectile_chr_oblvns_s3_mag']) {
    assert.ok(idx.projectiles[p].effects.every(key => keys.has(key)));
  }
  const spawn = h.wiring.ofx.spawn;
  h.wiring.ofx.spawn = () => null;
  const event = {id: 1, noteId: '1', state: 'spawn', projectile: 'projectile_chr_oblvns_s3_phy'};
  assert.equal(h.fx.simFx('mujicaNote', 6, 9, event), false);
  assert.equal(h.fx.moving.size, 0);
  h.wiring.ofx.spawn = spawn;
  assert.equal(h.fx.simFx('mujicaNote', 7, 9, {...event, state: 'move'}), true);
  assert.equal(h.roots.length, 1);
});
test('Sakiko note cannot damage a friendly Kaltsit even when a stale target points at her',()=>{
  const raw=composeProductData(getData(),['rhodes-mujica-v1']);raw.enemies.note_dummy=enemyRec({key:'note_dummy',hp:1e7,speed:0,atk:0});
  const h=makeBattle({data:new DataSource(raw,null),units:[{chessId:'chess_rm_oblvns_a',row:10,col:4},{chessId:'chess_rm_kalts2_a',row:10,col:5}],enemies:[],autoFinish:false,captureNoisy:true});
  const u=h.unit('chess_rm_oblvns_a'),ally=h.unit('chess_rm_kalts2_a');h.step(1);u.mem.rmNotes=[];u.mem.rmNoteSeq=0;
  const hp=ally.hp,note=emitNote(h.b,u,ally,1,'arts');note.x=ally.x;note.y=ally.y;note.state='track';
  updateNotes(h.b,u,.4,new Set(u.rangeKeys));assert.equal(ally.hp,hp);assert.equal(note.hit.has(ally.id),false);assert.notEqual(note.target,ally);assert.deepEqual(h.b.errors,[]);
});
