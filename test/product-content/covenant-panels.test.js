import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {makeBattle} from '../helpers/battleHarness.js';
import {snapHud} from '../../public/js/ui/gameLogic/format.js';
import {covenantResource} from '../../public/js/ui/covenantResources.js';
import {makeMatch} from '../match/harness.js';
import {THERESA} from '../../server/sim/content/kazdel/data.js';
import {isKazdelRecruitOffer} from '../../server/sim/content/kazdel/recruit.js';
test('current battle snapshots and HUD preserve all three live covenant resources, including JSON wire roundtrip',()=>{
  const raw=composeProductData(getData(),['kazdel-expansion-v1','higashi-expansion-v1','iberia-expansion-v1']);
  const h=makeBattle({defs:raw,units:[],bonds:{kazdelShip:{active:true,tier:3,count:9,layers:100},higashiShip:{active:true,tier:2,count:6,layers:100},iberiaShip:{active:true,tier:2,count:6,layers:100}},autoFinish:false});
  h.step(2);const snap=JSON.parse(JSON.stringify(h.snapshot())),hud=snapHud(snap);
  for(const key of ['kazdel','higashi','iberia']){
    assert.ok(Array.isArray(snap[key]),key);assert.equal(snap[key][0].playerId,'p1');assert.deepEqual(hud[key],snap[key]);
  }
  assert.deepEqual(h.b.errors,[]);
  const ordinary=snapHud({killed:0,total:2});assert.ok(!('kazdel' in ordinary));assert.ok(!('higashi' in ordinary));assert.ok(!('iberia' in ordinary));
});
test('bond detail uses only the requested owner, keeps Rhine separate, and clears live resources with the snapshot',()=>{
  const a={playerId:'p1',stance:12},b={playerId:'p2',stance:68};
  assert.equal(covenantResource('higashiShip',{higashi:[a,b]},'p2').state,b);
  assert.equal(covenantResource('higashiShip',{higashi:[a]},'p2'),null);
  assert.equal(covenantResource('higashiShip',snapHud({killed:0}),'p1'),null);
  assert.equal(covenantResource('rhineShip',{rhine:[a]},'p1'),null);
  assert.ok(covenantResource('ursusShip',null,'p1',{playerId:'p1',ursusDomain:{area:3}}));
  assert.equal(covenantResource('ursusShip',null,'p2',{playerId:'p1',ursusDomain:{area:3}}),null);
});
test('Theresa rewards appear automatically in the ordinary shop, freeze their tier and retain queued rounds through reconnect',()=>{
  const raw=composeProductData(getData(),['kazdel-expansion-v1']),h=makeMatch({data:raw,mode:'solo',fake:true}).start().toPrep(1),p=h.ps('p_0');
  try{
    p.bandId=THERESA;p.recompute();h.toPrep(3);let offer=p.offers.find(isKazdelRecruitOffer);
    assert.ok(offer,'no separate open intent');assert.equal(offer.kazdelRound,3);assert.ok(offer.slots.every(s=>s.price===0));
    assert.equal(p.privateView().shop.rewardOffer.kazdelRound,3);
    assert.equal(p.privateView().shop.rewardOffer.persistent,true);
    const tier=offer.kazdelMaxTier,choices=offer.slots.map(s=>s.id);p.shop.level=6;p.recompute();h.m.onReconnect('p_0');
    offer=p.offers.find(isKazdelRecruitOffer);assert.equal(offer.kazdelMaxTier,tier);assert.deepEqual(offer.slots.map(s=>s.id),choices);
    h.toPrep(5);offer=p.offers.find(isKazdelRecruitOffer);assert.equal(offer.kazdelRound,3);
    assert.equal(p.pickReward(0).ok,true);offer=p.offers.find(isKazdelRecruitOffer);assert.equal(offer.kazdelRound,5);
    assert.equal(p.pickReward(0).ok,true);p.recompute();assert.ok(!p.offers.some(isKazdelRecruitOffer));
    const v=p.privateView();assert.ok(!('kazdelDonationIds' in v));assert.ok(!('kazdelDonationEligibleIds' in v));
    assert.equal(p.setKazdelDonation(['chess_kz_vigna_a']).error,'BAD_TARGET');
  }finally{h.m.dispose();}
});
test('legacy selected donors and carried donation timers cannot cause hidden HP loss after removing donation',()=>{
  const raw=composeProductData(getData(),['kazdel-expansion-v1']),h=makeBattle({defs:raw,players:[{playerId:'p1',seat:0,side:'L',colOffset:0,
    units:[{uid:1,chessId:'chess_kz_vigna_a',row:10,col:4}],bonds:{kazdelShip:{active:true,tier:1,count:3,layers:0}},
    contentInfo:{kazdelDonationIds:['chess_kz_vigna_a'],kazdelCarry:{donations:[{id:'chess_kz_vigna_a',remaining:0}]}}}],enemies:[{key:'enemy_1045_hammer_2',pos:[10,6],mods:{atk:0}}],autoFinish:false});
  const calls=[],lose=h.b.loseHp.bind(h.b);h.b.loseHp=(u,n,o)=>{calls.push(o);return lose(u,n,o);};h.run(4.2);
  assert.ok(!calls.some(o=>o?.tags?.includes('kz:donation')));assert.deepEqual(h.b.errors,[]);
});
