import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {makeBattle,enemyRec} from '../helpers/battleHarness.js';
import {fireRainController} from '../../server/sim/content/ursus/talulah-s3.js';

function fixture(dir='RIGHT') {
  const raw=composeProductData(getData(),['ursus-expansion-v1']);
  raw.enemies.fx_dummy=enemyRec({key:'fx_dummy',hp:1e9,atk:0,speed:0});
  const h=makeBattle({data:new DataSource(raw,null),units:[{chessId:'chess_ursus_oxi_b',row:10,col:5,dir,skillIndex:2}],enemies:[],autoFinish:false,timeLimit:60,captureNoisy:true});
  h.step(1);const u=h.unit('chess_ursus_oxi_b');
  assert.equal(u.skill.activate('fx-test',{free:true}),true);
  return {h,u,b:h.b};
}
const signals=h=>h.events.filter(e=>e[0]==='fx'&&e[1]==='source-oxi-heatwave').map(e=>e[4]);

test('Talulah S3 emits independent original heatwaves in all four directions, updates are bounded and every lane stops',()=>{
  for(const dir of ['RIGHT','UP','LEFT','DOWN']){
    const {h,u}=fixture(dir);h.run(1);
    const waves=signals(h),born=waves.filter(e=>e.phase==='spawn');
    assert.ok(born.length>0,dir);assert.equal(new Set(born.map(e=>e.wave)).size,born.length);
    for(const e of born){assert.equal(e.src,u.id);assert.equal(e.dx,dir==='RIGHT'?1:dir==='LEFT'?-1:0);assert.equal(e.dy,dir==='UP'?1:dir==='DOWN'?-1:0);}
    u.skill.end('test');h.run(26);
    const end=signals(h);for(const e of born)assert.equal(end.filter(a=>a.wave===e.wave&&a.phase==='stop').length,1);
    assert.ok(end.length<born.length*270,'at most ten move events per second per lane');assert.deepEqual(h.b.errors,[]);
  }
});

test('heatwave ownership survives source death, overload widens lanes and a new cast never reuses a projectile identity',()=>{
  const {h,u,b}=fixture();h.step(1);const initial=signals(h).filter(e=>e.phase==='spawn');assert.ok(initial.length);
  const controller=fireRainController(b),p=u.mem.oxiChannel.p;
  u.mem.oxiChannel.start=b.time-30;u.mem.oxiChannel.next=b.time;h.step(1);
  const all=signals(h).filter(e=>e.phase==='spawn'),over=all.filter(e=>!initial.some(a=>a.wave===e.wave));assert.ok(over.length>=initial.length);
  u.skill.end('test');controller.start(u,p,40);u.skill.active=true;h.step(1);
  const births=signals(h).filter(e=>e.phase==='spawn');assert.equal(new Set(births.map(e=>e.wave)).size,births.length);
  b.kill(u);h.run(.3);assert.ok(signals(h).some(e=>e.phase==='move'&&births.some(a=>a.wave===e.wave)));
  h.run(26);for(const e of births)assert.equal(signals(h).filter(a=>a.wave===e.wave&&a.phase==='stop').length,1);assert.deepEqual(b.errors,[]);
});
