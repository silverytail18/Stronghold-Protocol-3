import test from 'node:test';import assert from 'node:assert/strict';
import {makeMatch} from '../match/harness.js';import {getData} from '../../server/data.js';import {composeProductData} from '../../server/product/content-data.js';
import {RECRUIT} from '../../server/sim/content/expansion/kjerag-data.js';
test('mountain recruitment actual level-up hooks create and claim two free, tier-limited, unowned offers only once',()=>{
  const h=makeMatch({data:composeProductData(getData(),['arknights-expansion-v1']),fake:true}).start().toPrep(1),p=h.ps('p_0');
  try{
    p.bandId=RECRUIT;p.shop.level=2;p.funds=1000;
    for(const tier of [3,4]){
      assert.equal(p.levelUp().ok,true);const offer=p.offers[0];assert.equal(offer.source,RECRUIT);assert.equal(offer.recruitTier,tier);assert.ok(offer.slots.length>0&&offer.slots.length<=3);
      for(const slot of offer.slots){assert.equal(slot.price,0);assert.ok(p.gd.chess(slot.id).tier<=tier);assert.ok(p.gd.chess(slot.id).bonds.includes('kjeragShip'));assert.ok(!p.hand.some(piece=>piece&&p.gd.baseIdOf(piece.id)===slot.id));}
      const funds=p.funds,selected=offer.slots[0].id;assert.equal(p.pickReward(0).ok,true);assert.equal(p.funds,funds);assert.ok(p.hand.some(piece=>piece&&p.gd.baseIdOf(piece.id)===selected));assert.equal(p.counters['exp:kjerag:recruit:'+tier+':claimed'],1);
    }
    p.levelUp();h.m.dispatch(p,'onPrepStart',{});assert.equal(p.offers.filter(o=>o.source===RECRUIT).length,0);assert.deepEqual(h.logs.error,[]);
  }finally{h.m.dispose();}
});
