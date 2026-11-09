import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {TestContent} from '../../server/test-content.js';
import {makeMatch} from '../match/harness.js';
import {PHASE} from '../../shared/constants.js';
import {MASTERY_ITEM_ID,PRTS_ITEM_ID} from '../../shared/skill-mastery.js';
import {financingQuote,styledDistribution,pnlAt,distributionView} from '../../shared/investment-math.js';
import {investmentIntent,investmentView,freezeInvestment,settleInvestment,claimInvestmentReward} from '../../server/match/investment.js';
const tc=new TestContent(),room={mode:'solo',difficulty:'NORMAL'},base=getData({log:{warn(){},info(){},error(){}}}),data=tc.resolve({version:tc.version,ids:['extended-rounds-24','genius-trader-v1']},room,base).data;
function fixture(){const h=makeMatch({mode:'solo',data}).start().toPrep(1),m=h.m,ps=m.order[0];m.round=13;m.phase=PHASE.PREP;m.rngInvestmentEvent=()=>0;m.rngInvestmentSignal=()=>.5;ps.ready=false;ps.funds=60;return {m,ps};}
function round(f,u=.5,other=.99999){freezeInvestment(f.m);f.m.round++;let n=0;f.m.rngInvestment=()=>n++<4?u:other;settleInvestment(f.m);return n;}
test('2x financing uses own equity, 2% minimum2 fee and 30% liquidation line',()=>{
 assert.deepEqual(financingQuote(60),{collateral:60,loan:60,fee:2,line:18,leverage:2});assert.equal(financingQuote(201).fee,5);
 const input={principal:60,value:60,market:120},plain=styledDistribution(input),d=styledDistribution(input,'leveraged');
 assert.equal(d.scale,plain.scale*2);assert.equal(d.mu,plain.mu*2-2);
 assert.equal(pnlAt({...d,mu:28,scale:1e-9},.5).value,88);assert.equal(pnlAt({...d,mu:-22,scale:1e-9},.5).value,38);
 assert.equal(pnlAt({...d,mu:-42,scale:1e-9},.5).value,0);assert.equal(pnlAt({...d,mu:-41.99,scale:1e-9},.5).liquidated,false);
});
test('financing requires20 own assets; rejects before mutation, never mints loan into market or funds',()=>{
 const f=fixture();f.ps.funds=19;assert.ok(investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'}).error);assert.equal(f.ps.funds,19);assert.equal(f.ps.investment.principal,0);
 f.ps.funds=20;assert.deepEqual(investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'}),{ok:true});assert.equal(f.ps.funds,0);assert.equal(f.ps.investment.value,20);assert.equal(f.ps.investment.principal,20);
 freezeInvestment(f.m);const d=f.m.investmentMarket.pending.players[0].d;assert.equal(d.market,20);assert.equal(d.financing.loan,20);assert.ok(investmentIntent(f.m,f.ps,{action:'collect'}).error);
});
test('PRTS unlocked through mastery or permanent flag forbids new financing and preserves money',()=>{
 for(const lock of ['reward','flag','won','used']){
  const f=fixture();investmentIntent(f.m,f.ps,{action:'invest'});f.m.round++;f.ps.funds=12;
  if(lock==='reward')f.ps.investment.rewardId=MASTERY_ITEM_ID;if(lock==='flag')f.ps.investment.prtsUnlocked=true;if(lock==='won')f.ps.investment.prtsWon=true;if(lock==='used')f.ps.investment.retrievalUsed=1;
  assert.equal(investmentView(f.ps).financing.blocked,true);const before=JSON.stringify(f.ps.investment);
  assert.ok(investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'}).error);assert.equal(f.ps.funds,12);assert.equal(JSON.stringify(f.ps.investment),before);
 }
});
test('financing settles fee once, expires after one round and does not auto-renew',()=>{
 const f=fixture();investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'});round(f,.7);
 assert.equal(f.ps.investment.financingFees,2);assert.equal(f.ps.investment.financingPending,null);assert.equal(f.ps.investment.style,'normal');
 const value=f.ps.investment.value;settleInvestment(f.m);assert.equal(f.ps.investment.value,value);assert.equal(f.ps.investment.financingFees,2);
 f.ps.funds=5;investmentIntent(f.m,f.ps,{action:'invest'});freezeInvestment(f.m);assert.equal(f.m.investmentMarket.pending.players[0].d.financing,undefined);
});
test('liquidation uses one P&L draw, returns residual equity, permanently disables financing, preserves retained rewards and allows cash-only reentry',()=>{
 const f=fixture();investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'});
 const ordinary=Object.keys(data.items).find(id=>data.items[id].tier===6&&data.items[id].itemType==='EQUIP');f.ps.investment.rewardId=ordinary;f.ps.investment.rewardTier=6;
 // Corrupt-state defence: even an unexpected extra prize cannot escape liquidation.
 f.ps.investment.prtsWon=true;const draws=round(f,.000001);
 assert.equal(draws,4);assert.equal(f.ps.investment.liquidated,true);assert.ok(f.ps.investment.value>0);const residual=f.ps.investment.value;assert.equal(f.ps.investment.closed,false);assert.equal(f.ps.investment.active,true);
 assert.equal(f.ps.investment.rewardId,ordinary);assert.equal(f.ps.investment.prtsWon,true);assert.equal(claimInvestmentReward(f.ps),false);
 f.ps.funds=100;assert.equal(investmentView(f.ps).financing.blocked,true);assert.ok(investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'}).error);assert.equal(f.ps.funds,100);assert.deepEqual(investmentIntent(f.m,f.ps,{action:'invest'}),{ok:true});assert.ok(Math.abs(f.ps.investment.value-(100+residual))<1e-7);assert.equal(f.ps.investment.financingPending,null);assert.ok(investmentIntent(f.m,f.ps,{action:'claim'}).error);
 f.m.round=24;settleInvestment(f.m);assert.ok([...f.ps.hand,...f.ps.temp].some(p=>p?.id===ordinary));assert.ok([...f.ps.hand,...f.ps.temp].some(p=>p?.id===PRTS_ITEM_ID));assert.equal(f.ps.funds,Math.floor(100+residual));
});
test('mastery gained from financed profit immediately locks future financing, but remains claimable after successful repayment',()=>{
 const f=fixture();investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'});round(f,.95,0);
 assert.equal(f.ps.investment.rewardId,MASTERY_ITEM_ID);assert.equal(f.ps.investment.prtsUnlocked,true);f.ps.funds=5;
 assert.ok(investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'}).error);assert.deepEqual(investmentIntent(f.m,f.ps,{action:'collect'}),{ok:true});assert.ok(f.ps.hand.some(p=>p?.id===MASTERY_ITEM_ID));
});
test('published liquidation probability includes margin call boundary rather than an independent random event',()=>{
 const d=styledDistribution({principal:60,value:60,market:120},'leveraged');let zero=0;for(let i=0;i<4096;i++)if(pnlAt(d,(i+.5)/4096).value===0)zero++;
 const p=distributionView(d,0);assert.ok(Math.abs(p.zero-zero/4096)<.001);assert.ok(Math.abs(p.zero+p.loss+p.profit+p.flat-1)<1e-9);
});

test('after liquidation cash-only investments can earn and claim new rewards; financing stays disabled',()=>{
 const f=fixture();investmentIntent(f.m,f.ps,{action:'invest',style:'leveraged'});round(f,.000001);assert.equal(f.ps.investment.closed,false);f.ps.funds=30;assert.deepEqual(investmentIntent(f.m,f.ps,{action:'invest'}),{ok:true});freezeInvestment(f.m);const pending=f.m.investmentMarket.pending;pending.coefficient=1e6;for(const s of pending.securities)s.d={...s.d,mu:1,scale:0};f.m.round++;f.m.rngInvestment=()=>0;settleInvestment(f.m);assert.equal(f.ps.investment.rewardId,MASTERY_ITEM_ID);assert.equal(investmentView(f.ps).financing.disabledByLiquidation,true);assert.deepEqual(investmentIntent(f.m,f.ps,{action:'collect'}),{ok:true});assert.equal(f.ps.hand.filter(p=>p?.id===MASTERY_ITEM_ID).length,1);assert.equal(claimInvestmentReward(f.ps),false);
});
