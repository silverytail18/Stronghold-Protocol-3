import test from 'node:test';
import assert from 'node:assert/strict';
import {getVersionData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {makeMatch} from '../match/harness.js';
import {freezeInvestment} from '../../server/match/investment.js';

for (const rounds of [24,30]) for (const mode of ['solo','coop']) {
  test(`${mode} ${rounds} rounds: an existing investor can ready without a new order or cash`, () => {
    const data=composeProductData(getVersionData('act2autochess'),['extended-rounds-'+rounds,'genius-trader-v1'],{version:'act2autochess',mode});
    const h=makeMatch({data,mode,humans:mode==='solo'?1:2,fake:true}).start().toPrep(13);
    try {
      const p=h.ps('p_0');p.funds=100;
      assert.equal(h.m.handle(p.playerId,{t:'g.investment',action:'invest',style:'normal'}).ok,true);
      h.toPrep(14);p.ready=false;p.funds=0;
      const value=p.investment.value,reward=p.investment.rewardId;
      assert.equal(h.m.handle(p.playerId,{t:'g.ready',ready:true}).ok,true);
      assert.equal(p.investment.actedRound,13);
      assert.equal(p.investment.value,value);
      assert.equal(p.investment.rewardId,reward);
      assert.equal(p.funds,0);
      freezeInvestment(h.m);
      assert.ok(!h.m.investmentMarket.pending.players.some(row=>row.playerId===p.playerId));
    } finally {h.m.dispose();}
  });
}
