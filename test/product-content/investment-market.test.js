import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {TestContent} from '../../server/test-content.js';
import {makeMatch,giveItem} from '../match/harness.js';
import {PHASE} from '../../shared/constants.js';
import {MASTERY_ITEM_ID,PRTS_ITEM_ID} from '../../shared/skill-mastery.js';
import {STOCK_POOL,selectStocks,stockReference,stockEvent,shareSnapshot} from '../../shared/investment-stocks.js';
import {progressionReward,progressionChances,calibrateProgression,progressionForecast,securityDistribution,accountDistribution,securityReturn} from '../../shared/investment-math.js';
import {investmentIntent,investmentView,freezeInvestment,settleInvestment,claimInvestmentReward} from '../../server/match/investment.js';
const tc=new TestContent(),base=getData({log:{warn(){},error(){},info(){}}});
function fixture(n=24,humans=4){const data=tc.resolve({version:tc.version,ids:[`extended-rounds-${n}`,'genius-trader-v1']},{mode:'coop',difficulty:'NORMAL'},base).data,h=makeMatch({mode:'coop',humans,data}).start().toPrep(1),m=h.m;m.round=13;m.phase=PHASE.PREP;m.rngInvestmentMarket=()=>0;m.rngInvestmentSignal=()=>.5;m.rngInvestmentEvent=()=>0;for(const p of m.order){p.ready=false;p.funds=40;}return {m,ps:m.order};}
const view=p=>investmentView(p),invest=(m,p,id,style='normal')=>investmentIntent(m,p,{action:'invest',targetId:id||view(p).stocks[0].id,style});
function settle(m,rate=.5,roll=.9999,ordinary=false){freezeInvestment(m);if(ordinary){m.investmentMarket.pending.coefficient=0;m.investmentMarket.pending.ordinaryFactor=1;}for(const s of m.investmentMarket.pending.securities)s.d={...s.d,mu:Math.log(1+Math.max(-.35,Math.min(.35,rate))),scale:0};m.round++;m.rngInvestment=()=>roll;settleInvestment(m);for(const p of m.order)p.ready=false;}

function archiveFixture(){const f=fixture();f.m.rngInvestmentEvent=()=>.999;view(f.ps[0]);f.m.round=14;f.m.rngInvestmentEvent=()=>0;for(const p of f.ps)p.funds=40;return f;}
test('R13 isolation and four public securities even in solo; deterministic category sampling without replacement',()=>{
 assert.equal(STOCK_POOL.length,16);const {m,ps:[p]}=fixture(24,1);m.round=12;assert.equal(view(p),null);assert.equal(m.investmentMarket,undefined);assert.ok(investmentIntent(m,p,{action:'invest'}).error);m.round=13;
 const stocks=view(p).stocks;assert.equal(stocks.length,4);assert.equal(new Set(stocks.map(s=>s.id)).size,4);assert.ok(stocks.some(s=>s.id==='stock_rhodes'));
 const selected=selectStocks(()=>0);for(const sector of ['science','trade','industry'])assert.ok(selected.some(s=>s.sector===sector));
 const h=makeMatch({mode:'solo',data:base}).start().toPrep(1);h.m.round=13;assert.equal(view(h.m.order[0]),null);freezeInvestment(h.m);assert.equal(h.m.investmentMarket,undefined);
});
test('first simulated candle exists before buying; all clients share it and no account/reward is created',()=>{
 const {m,ps:[a,b]}=fixture(),v=view(a);assert.deepEqual(v.stocks,view(b).stocks);assert.equal(a.investment,undefined);assert.equal(a.funds,40);
 for(const s of v.stocks){assert.equal(s.history.length,1);const c=s.history[0];assert.ok(c.simulated&&c.initial);assert.ok(c.open>100&&c.close>0&&c.high>=Math.max(c.open,c.close)&&c.low<=Math.min(c.open,c.close));assert.equal(s.share,null);}
 assert.deepEqual(view(a).stocks,v.stocks);invest(m,a);assert.deepEqual(view(a).stocks,v.stocks);
});
test('private view contains no live market total, player owners, capital, holders, flows or distributions',()=>{
 const {m,ps:[a,b]}=fixture(),before=view(b);invest(m,a);const after=view(b);assert.deepEqual(after.stocks,before.stocks);assert.ok(!('market'in after));assert.ok(!('ownStockId'in after));
 for(const s of after.stocks)for(const key of ['capital','holders','flow','playerId','probability','coefficient'])assert.ok(!(key in s));
 assert.ok(!JSON.stringify(after.stocks).includes(a.playerId));
});
test('reference and prior-close shares remain fixed during prep, then update at settlement',()=>{
 const {m,ps:[a,b]}=fixture(),stocks=view(a).stocks;invest(m,a,stocks[0].id);invest(m,b,stocks[1].id);assert.deepEqual(view(a).stocks,stocks);settle(m);
 const next=view(a).stocks;assert.equal(next[0].share,.5);assert.equal(next[1].share,.5);const snapshot=structuredClone(next);a.funds=100;invest(m,a,stocks[2].id);assert.deepEqual(view(b).stocks,snapshot);
 assert.equal(Math.round(next.reduce((n,s)=>n+s.share,0)*1000),1000);
});
test('share rounding totals100%; zero denominator has no fake25% liquidity',()=>{
 const s=selectStocks(()=>0),a=Object.fromEntries(s.map(v=>[v.id,1]));a[s[0].id]=0;const shares=shareSnapshot(s,a,3);assert.equal(Object.values(shares).reduce((x,y)=>x+Math.round(y*1000),0),1000);assert.ok(Object.values(shareSnapshot(s,{},0)).every(v=>v===null));
});
test('unheld public stocks keep quoting, and player withdrawal or death cannot delist a stock',()=>{
 const {m,ps:[a,b]}=fixture(),stocks=view(a).stocks;invest(m,a);settle(m);assert.ok(view(b).stocks.every(s=>s.history.length===2));investmentIntent(m,a,{action:'collect'});a.alive=false;b.funds=10;assert.deepEqual(invest(m,b,stocks[0].id),{ok:true});assert.equal(view(b).stocks[0].tradable,true);
});
test('invalid player ID, duplicate order and unsupported old risk modes cannot move committed money',()=>{
 const {m,ps:[a]}=fixture();assert.ok(invest(m,a,a.playerId).error);assert.equal(a.funds,40);assert.ok(invest(m,a,undefined,'aggressive').error);invest(m,a);a.funds=9;assert.ok(invest(m,a).error);assert.equal(a.funds,9);assert.ok(investmentIntent(m,a,{action:'collect'}).error);
});
test('events retain15% total, archive needs Rhodes and enough future rounds; no per-view redraw',()=>{
 const stocks=selectStocks(()=>0);let count=0;for(let i=0;i<10000;i++)if(stockEvent(stocks,13,24,()=>((i+.5)/10000)).id!=='normal')count++;assert.equal(count,1500);
 assert.equal(stockEvent(stocks,13,24,()=>.999).id,'archive');assert.notEqual(stockEvent(stocks.filter(s=>s.id!=='stock_rhodes'),13,24,()=>.999).id,'archive');assert.notEqual(stockEvent(stocks,23,24,()=>.999).id,'archive');
 const {m,ps:[a,b]}=fixture();let calls=0;m.rngInvestmentEvent=()=>{calls++;return .999;};const e=view(a).event;view(b);view(a);assert.equal(e.id,'archive');assert.equal(calls,3);
});
test('ordinary progression always startsIII then exactlyone step per round; VI promotes to mastery',()=>{
 const {m,ps:[a]}=fixture();for(const tier of [3,4,5,6,7]){a.funds=40;invest(m,a);settle(m,1,0,true);assert.equal(a.investment.rewardTier,tier);}assert.equal(a.investment.rewardId,MASTERY_ITEM_ID);assert.equal(a.investment.prtsUnlocked,true);
 assert.equal(progressionReward(0,false,true),3);assert.equal(progressionReward(6,true,true),7);assert.equal(progressionReward(7,true,true),7);
});
test('supply improves ordinary hit probability but cannot jump tiers; direct mastery replaces any ordinary tier',()=>{
 for(const tier of [0,3,4,5,6])assert.equal(progressionReward(tier,false,true),tier===0?3:tier+1);
 const n=progressionChances(10,100,.1,.5),s=progressionChances(10,100,.1,.5,'supply');assert.equal(s.mastery,n.mastery);assert.equal(s.ordinary,Math.min(1-s.mastery,n.ordinary*1.6));
 const {m,ps:[a]}=fixture();invest(m,a);freezeInvestment(m);m.investmentMarket.pending.coefficient=1e6;for(const s of m.investmentMarket.pending.securities)s.d={...s.d,mu:Math.log(1.35),scale:0};m.round++;m.rngInvestment=()=>0;settleInvestment(m);assert.equal(a.investment.rewardTier,7);assert.equal(a.investment.rewardId,MASTERY_ITEM_ID);
});
test('Rhodes event is advertised one round ahead, threshold30% and32.5% award independent of mastery',()=>{
 const {m,ps:[a]}=archiveFixture();const offer=view(a).archiveOffers[0];assert.equal(offer.investRound,14);assert.equal(offer.settleRound,15);assert.equal(offer.chance,.325);invest(m,a,'stock_rhodes');settle(m,.30,.324999);assert.equal(a.investment.prtsWon,true);assert.equal(a.investment.prtsSource,'rhodes');assert.equal(a.investment.prtsEverWon,true);assert.equal(view(a).financing.blocked,true);
});
test('archive refuses below-threshold,32.5% boundary, wrong stock, announcement-round purchase and expired window',()=>{
 for(const [rate,roll,id]of [[.299,.0,'stock_rhodes'],[.3,.325,'stock_rhodes'],[1,0,'stock_penguin']]){const {m,ps:[a]}=archiveFixture();invest(m,a,id);settle(m,rate,roll);assert.ok(!a.investment.prtsWon);}
 const {m,ps:[a]}=fixture();m.rngInvestmentEvent=()=>.999;invest(m,a,'stock_rhodes');settle(m,1,0);assert.ok(!a.investment.prtsWon);m.round=16;view(a);a.funds=10;invest(m,a,'stock_rhodes');settle(m,1,0);assert.ok(!a.investment.prtsWon);
});
test('paid retrieval and Rhodes hit same settlement produce one archive; repeat settlement/claim cannot duplicate',()=>{
 const {m,ps:[a]}=archiveFixture();invest(m,a,'stock_rhodes');a.investment.rewardId=MASTERY_ITEM_ID;a.investment.rewardTier=7;assert.deepEqual(investmentIntent(m,a,{action:'retrieve',kind:'normal'}),{ok:true});settle(m,1,0);assert.equal(a.investment.prtsSource,'retrieval');assert.ok(!a.investment.last.archive);settleInvestment(m);investmentIntent(m,a,{action:'collect'});const count=()=>[...a.hand,...a.temp].filter(v=>v?.id===PRTS_ITEM_ID).length;assert.equal(count(),1);assert.ok(investmentIntent(m,a,{action:'claim'}).error);assert.equal(count(),1);
});
test('archive already won, externally held or used cannot win again or pay retrieval again',()=>{
 for(const mode of ['won','held','used']){const {m,ps:[a]}=archiveFixture();if(mode==='held')giveItem(m,a,PRTS_ITEM_ID);if(mode==='used')a.prtsArchiveUsed=true;invest(m,a,'stock_rhodes');if(mode==='won'){a.investment.prtsEverWon=true;a.investment.prtsWon=true;}a.investment.rewardId=MASTERY_ITEM_ID;a.investment.rewardTier=7;assert.ok(investmentIntent(m,a,{action:'retrieve'}).error);assert.deepEqual(view(a).archiveOffers,[]);settle(m,1,0);assert.ok(!a.investment.last.archive);}
});
test('all reward tiers and extraPRTS ignore depleted pool; full inventory defers both prizes exactlyonce',()=>{
 for(const tier of [3,4,5,6,7]){const {m,ps:[a]}=fixture();for(const e of m.pool.entries.values())e.left=0;const before=JSON.stringify([...m.pool.entries]);invest(m,a);a.investment.rewardTier=tier===3?0:tier-1;if(tier>3)a.investment.rewardId=m.gd.shopItemsByTier[tier-1][0];settle(m,1,0,true);assert.equal(a.investment.rewardTier,tier);investmentIntent(m,a,{action:'collect'});const item=[...a.hand,...a.temp].find(v=>v?.meta?.investmentReward);assert.ok(item);assert.equal(item.poolCopies,0);assert.equal(JSON.stringify([...m.pool.entries]),before);}
 const {m,ps:[a]}=archiveFixture();invest(m,a,'stock_rhodes');settle(m,1,0);const filler=m.gd.shopItemsByTier[3][0];a.hand=a.hand.map(()=>a.newPiece('item',filler));a.temp=a.temp.map(()=>a.newPiece('item',filler));investmentIntent(m,a,{action:'collect'});assert.equal(view(a).rewardPending,true);a.hand[0]=null;investmentIntent(m,a,{action:'claim'});a.hand[1]=null;investmentIntent(m,a,{action:'claim'});assert.equal(view(a).rewardPending,false);assert.equal([...a.hand,...a.temp].filter(v=>v?.id===PRTS_ITEM_ID).length,1);
});
test('investment equipment rewards ignore depleted shared item stock; fixed gift stays debt-free',()=>{
 for(const [id,debt] of [['chess_item_6_09_e_a',false],['chess_item_6_01_e_a',true]]){
  const {m,ps:[a,b]}=fixture(),cap=m.gd.itemPoolCopies(id);
  assert.ok(cap>0,id);
  for(let i=0;i<cap;i++)b.hand[i]=b.newPiece('item',id);
  assert.equal(m.itemPool.canGain(id),false,id);
  a.investment={active:false,closed:true,rewardId:id,rewardTier:6,granted:false};
  assert.equal(claimInvestmentReward(a),true,id);
  assert.ok([...a.hand,...a.temp].some(p=>p?.id===id),id);
  assert.equal(m.itemPool.debtOf(id),debt?1:0,id);
 }
});
test('both mastery routes are included in full-horizon50% calibration for11/17 opportunities',()=>{
 for(const n of [11,17])for(const financing of [null,{fee:2,line:12}]){const sd=securityDistribution({reference:.6,capital:40,total:120}),d=accountDistribution({value:40,principal:40,market:120},sd,financing),c=calibrateProgression(d,sd,n);assert.ok(Math.abs(c.expected-.5)<.002);assert.ok(c.ordinaryFactor<=1);assert.ok(Math.abs(progressionForecast(c.rates,n)-.5)<.002);}
});
test('PRTS claimed after external acquisition/use cannot create a duplicate; deferred prize is resolved',()=>{
 for(const used of [false,true]){const {m,ps:[a]}=archiveFixture();invest(m,a,'stock_rhodes');settle(m,1,0);assert.equal(a.investment.prtsWon,true);if(used)a.prtsArchiveUsed=true;else giveItem(m,a,PRTS_ITEM_ID);investmentIntent(m,a,{action:'collect'});assert.equal(a.investment.prtsGranted,true);assert.equal([...a.hand,...a.temp].filter(v=>v?.id===PRTS_ITEM_ID).length,used?0:1);assert.equal(view(a).rewardPending,false);}
});
test('same-round supply bonus cannot produce a second mastery or a second progression step',()=>{
 const {m,ps:[a]}=fixture();view(a);m.investmentMarket.event={id:'supply',targetId:'stock_penguin',shift:-.08,scale:1};invest(m,a,'stock_penguin');a.investment.rewardTier=6;a.investment.rewardId=m.gd.shopItemsByTier[6][0];settle(m,1,0,true);assert.equal(a.investment.rewardId,MASTERY_ITEM_ID);assert.equal(a.investment.rewardTier,7);investmentIntent(m,a,{action:'collect'});assert.equal([...a.hand,...a.temp].filter(v=>v?.id===MASTERY_ITEM_ID).length,1);
});
test('idle accounts skip returns, ordinary loss, mastery and PRTS; resume or cashout later, Boss still pays',()=>{
 for(const n of [24,30]){
  const {m,ps:[a,b]}=fixture(n);invest(m,a);settle(m,1,0,true);a.investment.prtsWon=true;a.investment.prtsEverWon=true;
  const before=JSON.stringify(a.investment),value=a.investment.value,funds=a.funds;
  for(let i=0;i<2;i++){b.funds=20;invest(m,b);freezeInvestment(m);assert.ok(!m.investmentMarket.pending.players.some(p=>p.playerId===a.playerId));assert.equal(m.investmentMarket.pending.players[0].d.market,b.investment.principal);m.round++;m.rngInvestment=()=>0;settleInvestment(m);assert.equal(JSON.stringify(a.investment),before);assert.equal(a.funds,funds);assert.equal(view(a).closed,false);}
  a.funds=10;assert.deepEqual(invest(m,a,'stock_rhodes'),{ok:true});assert.equal(a.investment.value,value+10);assert.equal(a.funds,0);settle(m,.1,.99);const payout=Math.floor(a.investment.value);m.round=n;settleInvestment(m);assert.equal(a.investment.closed,true);assert.equal(a.investment.received,payout);const received=a.funds;settleInvestment(m);assert.equal(a.funds,received);
 }
 const {m,ps:[a]}=fixture();invest(m,a);settle(m);freezeInvestment(m);m.round++;settleInvestment(m);assert.deepEqual(investmentIntent(m,a,{action:'collect'}),{ok:true});assert.equal(a.investment.closed,true);
});
