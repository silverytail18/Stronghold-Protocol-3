import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TestContent} from '../../server/test-content.js';
import {getData} from '../../server/data.js';
import {makeMatch,give,giveItem,legalTileFor} from '../match/harness.js';
import {PHASE} from '../../shared/constants.js';
import {MASTERY_ITEM_ID,PRTS_ITEM_ID} from '../../shared/skill-mastery.js';
import {marketEvent,styledDistribution,equipmentChances,promoteSupplyTier,retrievalQuote,calibrateMastery,pnlAt,masteryProbability} from '../../shared/investment-math.js';
import {investmentIntent,investmentView,freezeInvestment,settleInvestment} from '../../server/match/investment.js';
import {validateC2S} from '../../shared/protocol.js';
import {publicReturns} from '../../shared/stock-market.js';
const data=getData({log:{warn(){},info(){},error(){}}}),tc=new TestContent(),room={mode:'solo',difficulty:'NORMAL'},menu=tc.menu(room);
const TRADER=tc.resolve({version:menu.version,ids:['extended-rounds-24','genius-trader-v1']},room,data).data;
function fixture(){const h=makeMatch({mode:'solo',data:TRADER}).start().toPrep(1),m=h.m,ps=m.order[0];m.round=13;m.phase=PHASE.PREP;ps.ready=false;m.rngInvestmentEvent=()=>0;m.rngInvestmentSignal=()=>.5;return {h,m,ps};}
function invested(value=100){const f=fixture();f.ps.funds=value;assert.deepEqual(investmentIntent(f.m,f.ps,{action:'invest',style:'normal'}),{ok:true});f.ps.investment.rewardId=MASTERY_ITEM_ID;f.ps.investment.rewardTier=7;return f;}
function next(f,u=.7,prize=.99){freezeInvestment(f.m);f.m.round++;let draws=0;f.m.rngInvestment=()=>draws++<4?u:prize;settleInvestment(f.m);f.ps.ready=false;return draws;}

test('market events use exact 85/8/7 intervals and are sampled once per round for all viewers',()=>{
 const counts={normal:0,supply:0,capital:0};for(let i=0;i<10000;i++)counts[marketEvent((i+.5)/10000)]++;
 assert.deepEqual(counts,{normal:8500,supply:800,capital:700});
 const f=fixture();let calls=0;f.m.rngInvestmentEvent=()=>{calls++;return .9;};
 assert.equal(investmentView(f.ps).event.id,'capital');investmentView(f.ps);freezeInvestment(f.m);assert.equal(calls,3);
 f.m.round++;settleInvestment(f.m);assert.equal(calls,6);
});
test('three risk tiers removed; own capital and optional financing are the only valid account modes',()=>{
 const {m,ps}=fixture();ps.funds=10;
 for(const style of ['steady','aggressive'])assert.ok(investmentIntent(m,ps,{action:'invest',style}).error);
 assert.equal(ps.funds,10);assert.deepEqual(investmentIntent(m,ps,{action:'invest'}),{ok:true});ps.funds=10;
 assert.ok(investmentIntent(m,ps,{action:'invest',style:'leveraged'}).error);assert.equal(ps.investment.style,'normal');
});
test('supply increases ordinary chances without boosting mastery and upgrades only normal tiers',()=>{
 for(const gain of [.1,1,10,100]){const a=equipmentChances(gain,100,.15),b=equipmentChances(gain,100,.15,'supply');assert.equal(a.mastery,b.mastery);assert.equal(b.ordinary,Math.min(1-b.mastery,a.ordinary*1.6));assert.ok(b.any<=1);}
 assert.equal(promoteSupplyTier(3,.49),3);assert.equal(promoteSupplyTier(3,.5),4);assert.equal(promoteSupplyTier(3,.9),5);assert.equal(promoteSupplyTier(5,.99),6);
});
test('full-horizon mastery calibrates to half for all styles and both events',()=>{
 for(const style of ['normal','leveraged'])for(const event of ['normal','supply','capital']){
  const d=styledDistribution({principal:40,value:40,market:120},style,event),c=calibrateMastery(d,7);let p=0;
  for(let i=0;i<2048;i++)p+=masteryProbability(pnlAt(d,(i+.5)/2048).gain,d.market,c.coefficient)/2048;
  assert.ok(Math.abs(1-(1-p)**7-.5)<.02,style+'/'+event);
 }
});
test('retrieval quotes ceil at 20%, floor10/cap20 then double for deep; shared three-attempt odds',()=>{
 for(const [v,fee]of [[20,10],[40,10],[80,16],[92,19],[120,20],[200,20]]){assert.equal(retrievalQuote(v).fee,fee);assert.equal(retrievalQuote(v,0,'deep').fee,fee*2);}
 for(let i=0;i<3;i++){assert.ok(Math.abs(retrievalQuote(100,i).chance-(.03+i*.01))<1e-12);assert.ok(Math.abs(retrievalQuote(100,i,'deep').chance-(.05+i*.01))<1e-12);}
});
test('paid request deducts account immediately, never principal/funds, refuses duplicate and pending cashout',()=>{
 const {m,ps}=invested(92);ps.funds=3;const before=JSON.stringify([...m.pool.entries]);
 assert.deepEqual(investmentIntent(m,ps,{action:'retrieve',kind:'deep'}),{ok:true});assert.equal(ps.investment.value,54);assert.equal(ps.investment.principal,92);assert.equal(ps.funds,3);assert.equal(ps.investment.retrievalUsed,1);
 assert.ok(investmentIntent(m,ps,{action:'retrieve',kind:'normal'}).error);assert.ok(investmentIntent(m,ps,{action:'collect'}).error);assert.equal(ps.investment.value,54);assert.equal(JSON.stringify([...m.pool.entries]),before);
});

test('PRTS fees stay deducted but do not count as trading losses in settlement or public returns',()=>{
  for(const kind of ['normal','deep'])for(const rate of [0,.25,-.25])for(const won of [false,true]){
    const {h,m,ps}=invested(100);ps.funds=3;
    const fee=retrievalQuote(100,0,kind).fee,budget=100-fee;
    assert.deepEqual(investmentIntent(m,ps,{action:'retrieve',kind}),{ok:true});
    assert.equal(ps.investment.value,budget);assert.equal(ps.investment.principal,100);assert.equal(ps.funds,3);
    assert.equal(publicReturns([ps],m.round)[0].returnRate,0);
    freezeInvestment(m);assert.equal(m.investmentMarket.pending.players[0].equity,budget);
    for(const s of m.investmentMarket.pending.securities)s.d={...s.d,mu:Math.log(1+rate),scale:0};
    m.round++;m.rngInvestment=()=>won?0:.99;settleInvestment(m);
    const expected=budget*(1+rate),gain=budget*rate;
    assert.ok(Math.abs(ps.investment.value-expected)<1e-6);
    assert.ok(Math.abs(ps.investment.last.change-gain)<1e-6);
    assert.ok(Math.abs(investmentView(ps).playerReturns.find(p=>p.playerId===ps.playerId).returnRate-gain/100)<1e-8);
    assert.equal(ps.investment.last.retrieval.won,won);
    const before=JSON.stringify(ps.investment);settleInvestment(m);assert.equal(JSON.stringify(ps.investment),before);
    assert.deepEqual(investmentIntent(m,ps,{action:'collect'}),{ok:true});
    assert.equal(ps.funds,3+Math.floor(expected));
    assert.ok(Math.abs(publicReturns([ps],m.round)[0].returnRate-(Math.floor(expected)+fee-100)/100)<1e-8);
    h.m.dispose();
  }
});

test('multiple PRTS purchases are excluded once each, including later rounds and cashout',()=>{
  const {h,m,ps}=invested(100);let fees=0;
  for(const kind of ['normal','deep','normal']){
    fees+=retrievalQuote(ps.investment.value,ps.investment.retrievalUsed||0,kind).fee;
    assert.deepEqual(investmentIntent(m,ps,{action:'retrieve',kind}),{ok:true});
    freezeInvestment(m);
    for(const s of m.investmentMarket.pending.securities)s.d={...s.d,mu:0,scale:0};
    m.round++;m.rngInvestment=()=>.99;settleInvestment(m);
    assert.ok(Math.abs(ps.investment.last.change)<1e-6);
    assert.ok(Math.abs(investmentView(ps).playerReturns.find(p=>p.playerId===ps.playerId).returnRate)<1e-8);
    ps.funds=5;assert.deepEqual(investmentIntent(m,ps,{action:'invest'}),{ok:true});
  }
  assert.equal(ps.investment.retrievalFees,fees);assert.equal(ps.investment.principal,115);
  // No new retrieval: old fees must not be subtracted from the next round's basis again.
  freezeInvestment(m);for(const s of m.investmentMarket.pending.securities)s.d={...s.d,mu:0,scale:0};
  m.round++;m.rngInvestment=()=>.99;settleInvestment(m);
  assert.ok(Math.abs(ps.investment.last.change)<1e-6);
  assert.deepEqual(investmentIntent(m,ps,{action:'collect'}),{ok:true});
  assert.equal(ps.funds,115-fees);assert.equal(publicReturns([ps],m.round)[0].returnRate,0);
  h.m.dispose();
});

test('legacy accounts without PRTS fees retain their returns and financing fees remain losses',()=>{
  const p={playerId:'legacy',name:'legacy',alive:true};
  assert.equal(publicReturns([p],14)[0].returnRate,null);
  p.investment={principal:100,value:98};assert.equal(publicReturns([p],14)[0].returnRate,-.02);
  p.investment={principal:100,value:78,retrievalFees:20,financingFees:2};assert.equal(publicReturns([p],14)[0].returnRate,-.02);
  p.investment.closed=true;p.investment.received=78;assert.equal(publicReturns([p],14)[0].returnRate,-.02);
});
test('no mastery, before all-in, insufficient remainder and fourth request cannot charge money',()=>{
 const f=fixture();f.ps.funds=9;assert.ok(investmentIntent(f.m,f.ps,{action:'retrieve'}).error);assert.equal(f.ps.funds,9);
 investmentIntent(f.m,f.ps,{action:'invest'});assert.ok(investmentIntent(f.m,f.ps,{action:'retrieve'}).error);
 f.ps.investment.rewardId=MASTERY_ITEM_ID;f.ps.investment.rewardTier=7;assert.ok(investmentIntent(f.m,f.ps,{action:'retrieve'}).error);assert.equal(f.ps.investment.value,9);
 f.ps.investment.value=100;f.ps.investment.retrievalUsed=3;assert.ok(investmentIntent(f.m,f.ps,{action:'retrieve',kind:'deep'}).error);assert.equal(f.ps.investment.value,100);
});
test('ordinary/deep share three requests; failures never refund and never auto-charge on subsequent investment',()=>{
 const f=invested(100);
 for(const kind of ['normal','deep','normal']){
  const quote=retrievalQuote(f.ps.investment.value,f.ps.investment.retrievalUsed||0,kind),before=f.ps.investment.value;
  assert.deepEqual(investmentIntent(f.m,f.ps,{action:'retrieve',kind}),{ok:true});assert.ok(Math.abs(f.ps.investment.value-(before-quote.fee))<1e-7);
  next(f,.7,.99);assert.equal(f.ps.investment.last.retrieval.won,false);assert.equal(f.ps.investment.retrievalPending,null);
  f.ps.funds=5;const value=f.ps.investment.value;investmentIntent(f.m,f.ps,{action:'invest'});assert.ok(Math.abs(f.ps.investment.value-(value+5))<1e-7);
 }
 assert.equal(f.ps.investment.retrievalUsed,3);assert.ok(investmentIntent(f.m,f.ps,{action:'retrieve',kind:'deep'}).error);
});
test('paid draw executes even after a bounded loss and locks extra PRTS independent of mastery; settlement is idempotent',()=>{
 const f=invested(30);investmentIntent(f.m,f.ps,{action:'retrieve',kind:'deep'});const draws=next(f,.000001,0);
 assert.equal(draws,5);assert.ok(f.ps.investment.value>0);assert.equal(f.ps.investment.prtsWon,true);assert.equal(f.ps.investment.rewardId,MASTERY_ITEM_ID);
 const last=JSON.stringify(f.ps.investment);settleInvestment(f.m);assert.equal(JSON.stringify(f.ps.investment),last);
 assert.deepEqual(investmentIntent(f.m,f.ps,{action:'collect'}),{ok:true});
 assert.equal(f.ps.hand.filter(p=>p?.id===PRTS_ITEM_ID).length,1);assert.equal(f.ps.hand.filter(p=>p?.id===MASTERY_ITEM_ID).length,1);
 assert.ok(investmentIntent(f.m,f.ps,{action:'claim'}).error);
});
test('two rewards with only one inventory slot retain the unclaimed extra archive and issue once later',()=>{
 const f=invested(30);f.ps.investment.prtsWon=true;
 const filler=Object.keys(TRADER.items).find(id=>id!==MASTERY_ITEM_ID&&id!==PRTS_ITEM_ID);
 for(let i=0;i<f.ps.hand.length;i++)f.ps.hand[i]=f.ps.newPiece('item',filler);
 for(let i=0;i<f.ps.temp.length;i++)f.ps.temp[i]=f.ps.newPiece('item',filler);f.ps.hand[0]=null;
 next(f,.7,.99);investmentIntent(f.m,f.ps,{action:'collect'});assert.equal(f.ps.investment.granted,true);assert.equal(f.ps.investment.prtsGranted,undefined);assert.equal(investmentView(f.ps).rewardPending,true);
 f.ps.hand[1]=null;assert.deepEqual(investmentIntent(f.m,f.ps,{action:'claim'}),{ok:true});assert.equal(f.ps.hand[1].id,PRTS_ITEM_ID);assert.equal(investmentView(f.ps).rewardPending,false);
});
test('PRTS consumes without equipment loss, unlocks real placement #10, refuses #11 and duplicate, persists after owner sold',()=>{
 const {m,ps}=fixture(),ids=m.gd.visibleChess.slice(0,12),units=[];
 for(let i=0;i<8;i++){const tile=legalTileFor(m,ps,ids[i]);units.push(give(m,ps,ids[i],'board',tile));}
 const extra=give(m,ps,ids[8]),tile=legalTileFor(m,ps,ids[8]);assert.ok(ps.move(extra.uid,{area:'board',row:tile[0],col:tile[1]}).error);
 const holder=units[0],item=giveItem(m,ps,PRTS_ITEM_ID);const eq=Object.keys(TRADER.items).filter(id=>TRADER.items[id].kind==='passive').slice(0,2);holder.items=eq.map(id=>ps.newPiece('item',id));const before=holder.items.map(p=>p.uid);
 assert.deepEqual(ps.equip(item.uid,holder.uid),{ok:true});assert.equal(ps.find(item.uid),null);assert.equal(ps.deployCap,10);assert.deepEqual(holder.items.map(p=>p.uid),before);
 assert.deepEqual(ps.move(extra.uid,{area:'board',row:tile[0],col:tile[1]}),{ok:true});
 const tenth=give(m,ps,ids[9]),t=legalTileFor(m,ps,ids[9]);assert.deepEqual(ps.move(tenth.uid,{area:'board',row:t[0],col:t[1]}),{ok:true});assert.equal(ps.deployCount,10);
 const eleventh=give(m,ps,ids[10]),t2=legalTileFor(m,ps,ids[10]);assert.ok(ps.move(eleventh.uid,{area:'board',row:t2[0],col:t2[1]}).error);
 const dup=giveItem(m,ps,PRTS_ITEM_ID);assert.ok(ps.equip(dup.uid,holder.uid).error);assert.ok(ps.find(dup.uid));ps.sell(holder.uid);assert.equal(ps.deployCap,10);ps.deployCapBonus=4;assert.equal(ps.deployCap,12);
});
test('wire rejects unsupported style and retrieval kind; unselected baseline contains no PRTS',()=>{
 assert.ok(validateC2S({t:'g.investment',action:'retrieve',kind:'free'}));assert.ok(validateC2S({t:'g.investment',action:'invest',style:'guaranteed'}));
 assert.equal(data.items[PRTS_ITEM_ID],undefined);assert.ok(!Object.values(fixture().m.gd.shopItemsByTier).flat().includes(PRTS_ITEM_ID));
});
