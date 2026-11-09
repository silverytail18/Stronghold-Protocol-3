import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PRODUCT_FX_KINDS,productFxPlacements} from '../../public/js/render/fx/product-kinds.js';
import {fxSpec} from '../../public/js/render/fx/kinds.js';
import {ProductFx} from '../../public/js/render/vfx/productfx.js';
import {FxSim} from '../../public/js/render/fx/simfx.js';

const idx=JSON.parse(fs.readFileSync(new URL('../../public/assets/local/fx/index.json',import.meta.url)));
test('Rhodes covenant uses the approved legacy controller in both official-FX modes without another original projectile',()=>{
  const calls=[],fx={rhodes:{salvo:e=>calls.push(e)}};
  const event={t:.5,r:1.2,locks:[{x:5,y:10,type:'phys'}]};
  FxSim.prototype.simFx.call(fx,'rm-ri-salvo',0,0,event);
  assert.equal(calls[0],event);
  for(const active of [false,true])assert.equal(new ProductFx({idx,ofx:{active}}).simFx('rm-ri-salvo',0,0,event),false);
});
test('owner-only covenant signals stay on their own live members, target-only judgment stays on the victim',()=>{
  const vs=[{id:1,x:4,y:10,alive:true,info:{ownerId:'p1',kind:'op',defId:'a'}},
    {id:2,x:6,y:10,alive:true,info:{ownerId:'p2',kind:'op',defId:'a'}},
    {id:3,x:7,y:10,alive:true,info:{ownerId:'p1',kind:'token',defId:'a'}}];
  const ctx={views:()=>vs,lookupDef:()=>({bonds:['girlbandShip','iberiaShip','higashiShip']}),view:id=>vs.find(v=>v.id===id)};
  for(const [kind,key]of [['rm-fever','playerId'],['higashiRelease','playerId'],['iberiaLight','ownerId']]){
    assert.deepEqual(productFxPlacements(kind,0,0,{[key]:'p1'},ctx).map(v=>[v.x,v.y,v.ex.id]),[[4,10,1]]);
    assert.deepEqual(productFxPlacements(kind,0,0,{[key]:'gone'},ctx),[]);
  }
  const at=productFxPlacements('iberiaJudgment',0,0,{id:2,kind:'rune'},ctx)[0];
  assert.deepEqual([at.x,at.y],[6,10]);
  assert.deepEqual(productFxPlacements('iberiaJudgment',0,0,{id:2,kind:'cancel'},ctx),[]);
  assert.deepEqual(productFxPlacements('ursusExecution',0,0,{id:2,kind:'refund'},ctx),[]);
});
test('explicit covenant mappings avoid keyword guesses and distinguish telegraph from committed hit',()=>{
  for(const kind of Object.keys(PRODUCT_FX_KINDS))assert.notEqual(fxSpec(kind).a,'generic',kind);
  assert.equal(fxSpec('ursusExecution',{visual:'strike'}).a,'strike');
  assert.equal(fxSpec('specialResearchHeal').a,'blast','healing trigger deals an explosion, not a healing cross');
  assert.equal(fxSpec('higashiUltimateHit').a,'none','dedicated full-screen ultimate owns its impact');
});
test('both blood effects forward exact authoritative position and trajectory to the restored controller',()=>{
  const calls=[],fx={blood:{emit:(...args)=>calls.push(args)}};
  for(const kind of ['kz-blood-sword','kz-blood-vortex']){
    FxSim.prototype.simFx.call(fx,kind,4,10,{dx:1,dy:0,distance:3,speed:6,t:.5});
    assert.deepEqual(calls.at(-1),[kind,{x:4,y:10,dx:1,dy:0,distance:3,speed:6,t:.5}]);
  }
});
