import {precise,referenceFor,priceDistribution,stockPath,position,settlePosition,publicReturns} from '../../shared/stock-market.js';
import {ERR,PHASE} from '../../shared/constants.js';
import {MASTERY_ITEM_ID,PRTS_ITEM_ID} from '../../shared/skill-mastery.js';
import {INVESTMENT_RULES,money,retrievalQuote,financingQuote,accountDistribution,calibrateProgression,progressionChances,progressionReward} from '../../shared/investment-math.js';
import {selectStocks,simulatedOpen,stockEvent,shareSnapshot} from '../../shared/investment-stocks.js';
const FIRST=INVESTMENT_RULES.firstRound;
const fail=detail=>({error:ERR.BAD_TARGET,detail});
export const investmentEndRound=m=>m.gd.bossRound;
export const investmentEnabled=m=>(m.data.lateInvestment||m.data.config?.productContent?.lateInvestment)?.enabled===true&&m.gd.bossRound>22;
const active=m=>m.order.filter(p=>p.alive&&p.investment?.active&&!p.investment.closed);
function state(ps){return ps.investment||(ps.investment={active:false,closed:false,principal:0,value:0,rewardId:null,rewardTier:0,actedRound:0,added:0,last:null,granted:false});}
function changed(m){for(const ps of m.order)ps.dirty();}
function hasArchive(ps){return !!(ps.prtsArchiveUsed||ps.investment?.prtsEverWon||ps.investment?.prtsWon||[...ps.hand,...ps.temp].some(v=>v?.id===PRTS_ITEM_ID));}
function awardArchive(ps,source){if(hasArchive(ps))return false;const s=state(ps);s.prtsWon=true;s.prtsEverWon=true;s.prtsSource=source;s.prtsUnlocked=true;return true;}
function market(m){return m.investmentMarket||(m.investmentMarket={out:0,opening:0,memory:0,pending:null,stocks:Object.create(null),lastAllocations:Object.create(null),lastTotal:0});}
function openMarket(m){
 const mm=market(m),rng=m.rngInvestmentMarket;
 if(m.round>=FIRST&&m.round<investmentEndRound(m)&&mm.eventRound!==m.round){
  if(!Object.keys(mm.stocks).length){const definitions=selectStocks(rng),history=simulatedOpen(definitions,rng);definitions.forEach((v,i)=>mm.stocks[v.id]={...v,history:[history[i]]});}
  mm.eventRound=m.round;const stocks=Object.values(mm.stocks);mm.event=stockEvent(stocks,m.round,investmentEndRound(m),m.rngInvestmentEvent);
  if(mm.event.id==='archive')mm.archiveOffers=[...(mm.archiveOffers||[]).filter(v=>v.investRound>=m.round),{announcedRound:m.round,investRound:m.round+1,settleRound:m.round+2,targetId:'stock_rhodes',threshold:.30,chance:.325}];
  mm.archiveOffers=(mm.archiveOffers||[]).filter(v=>v.investRound>=m.round);
  const marketSignal=m.rngInvestmentSignal()*.12-.06,sectorSignals=Object.fromEntries(['trade','industry','science'].map(k=>[k,m.rngInvestmentSignal()*.08-.04]));
  for(const stock of stocks)stock.reference=referenceFor(stock,{marketSignal,sectorSignal:sectorSignals[stock.sector],individual:m.rngInvestmentSignal()*.16-.08,eventShift:mm.event.targetId===stock.id||mm.event.id==='tight'?mm.event.shift||0:0});
  mm.shares=shareSnapshot(stocks,mm.lastAllocations,mm.lastTotal);
 }
 if(!mm.returns){mm.returns=publicReturns(m.order,m.round);mm.returnRound=m.round;}
 return mm;
}
function allocations(m){
 const result=Object.create(null);
 for(const ps of active(m)){const s=ps.investment;if(s.actedRound!==m.round)continue;const id=s.targetId;result[id]=money((result[id]||0)+s.value);}
 return result;
}
export function claimInvestmentReward(ps){
 const s=ps.investment;if(!s?.closed)return false;
 let received=false;
 for(const [id,key]of [[s.rewardId,'granted'],[s.prtsWon?PRTS_ITEM_ID:null,'prtsGranted']]){
  if(!id||s[key])continue;
  if(key==='prtsGranted'&&(ps.prtsArchiveUsed||[...ps.hand,...ps.temp].some(v=>v?.id===PRTS_ITEM_ID))){s[key]=true;continue;}
  if(!(ps.hand.some(p=>!p)||ps.temp.some(p=>!p)||ps.completesItemMerge(id)))continue;
  s[key]=true;
  try{const item=ps.acquireItem(id,{source:'investment',requirePool:false,displayed:true});if(!item){s[key]=false;continue;}item.meta={...item.meta,investmentReward:true};received=true;}catch(e){s[key]=false;throw e;}
 }
 return received;
}
export function cashOut(ps,{defer=false}={}){
 const s=ps.investment;if(!s?.active||s.closed)return false;
 market(ps.m).out+=s.value;
 const payout=Math.floor(s.value);s.active=false;s.closed=true;s.received=payout;s.value=0;
 if(defer)ps.pendingFunds+=payout;else ps.addFunds(payout,{reason:'investment'});
 if(!defer)claimInvestmentReward(ps);
 changed(ps.m);return true;
}
export function investmentIntent(m,ps,msg){
 const gate=ps._gate();if(gate)return gate;
 if(!investmentEnabled(m))return fail('本模式没有完整的远行投资回合');
 if(m.round<FIRST)return fail('远行投资在第13回合开放');
 const s=state(ps);
 if(msg.action==='claim')return claimInvestmentReward(ps)?{ok:true}:fail('没有待领取装备，或整备区已满');
 if(msg.action==='collect'){
  if(s.active&&s.actedRound===m.round)return fail('本轮投资已锁定，请等待下一回合结算');
  if(s.financingPending)return fail('本轮融资已锁定，请等待下一回合结算');
  if(s.retrievalPending)return fail('本轮已付费检索，请等待下一回合结算');
  return cashOut(ps)?{ok:true}:fail('没有可领取的投资');
 }
 if(msg.action==='retrieve'){
  if(!s.active||s.closed||s.rewardId!==MASTERY_ITEM_ID||hasArchive(ps)||s.retrievalPending||(s.retrievalUsed||0)>=3||s.actedRound!==m.round||m.round>=investmentEndRound(m))return fail('当前不能进行PRTS检索');
  const kind=msg.kind||'normal';if(!['normal','deep'].includes(kind))return fail('检索方式无效');
  const quote=retrievalQuote(s.value,s.retrievalUsed||0,kind);
  if(money(s.value-quote.fee)<5)return fail('支付检索费后至少保留5金币');
  s.value=precise(s.value-quote.fee);s.retrievalUsed=(s.retrievalUsed||0)+1;s.retrievalFees=(s.retrievalFees||0)+quote.fee;
  s.retrievalPending={round:m.round,kind,...quote};s.position=position(s.value,market(m).stocks[s.targetId].history.at(-1).close);changed(m);return {ok:true};
 }
 if(msg.action!=='invest'||m.round>=investmentEndRound(m)||s.closed||s.actedRound===m.round)return fail('本回合不能投资或已经加注');
 if(!Number.isSafeInteger(ps.funds)||ps.funds<0||s.value+ps.funds<=0)return fail('没有可投入资金');
 const style=msg.style||'normal';if(!['normal','leveraged'].includes(style))return fail('投资方式无效');
 const mm=openMarket(m),targetId=msg.targetId??Object.keys(mm.stocks)[0],target=mm.stocks[targetId];
 if(!target)return fail('该股票不在本局市场中');
 const collateral=precise(s.value+ps.funds);
 if(style==='leveraged'){
  if(s.financingDisabled)return fail('本局曾触发强平，融资杠杆已禁用');
  if(s.prtsUnlocked||s.rewardId===MASTERY_ITEM_ID||hasArchive(ps)||s.retrievalUsed)return fail('PRTS检索已解锁，本局不再允许融资');
  if(collateral<20)return fail('融资投资至少需要20金币自有投资资产');
 }
 openMarket(m);
 s.financingPending=style==='leveraged'?{round:m.round,...financingQuote(collateral)}:null;
 s.style=style;s.targetId=targetId;
 const amount=ps.funds;ps.funds=0;s.principal=money(s.principal+amount);s.value=collateral;
 s.active=true;s.actedRound=m.round;s.added=amount;s.committedEquity=collateral;s.position=position(collateral,target.history.at(-1).close,s.financingPending);changed(m);return {ok:true};
}
export function investmentView(ps){
 const m=ps.m;if(!investmentEnabled(m)||m.round<FIRST)return null;
 const mm=openMarket(m),s=ps.investment,used=s?.retrievalUsed||0,archiveOwned=hasArchive(ps);
 const retrieval={used,fees:s?.retrievalFees||0,won:archiveOwned,pending:s?.retrievalPending?{...s.retrievalPending}:null,
  quotes:{normal:retrievalQuote(s?.value||0,used,'normal'),deep:retrievalQuote(s?.value||0,used,'deep')},
  canRequest:!!s?.active&&!s?.closed&&s?.rewardId===MASTERY_ITEM_ID&&!archiveOwned&&!s?.retrievalPending&&used<3&&s?.actedRound===m.round&&m.round<investmentEndRound(m)&&m.phase===PHASE.PREP&&!ps.ready};
 return {active:!!s?.active,closed:!!s?.closed,principal:s?.principal||0,value:s?.value||0,rewardId:s?.rewardId||null,
  firstRound:FIRST,round:m.round,noticeKey:`${m.roomCode}:${m.battlePrefix}:${ps.playerId}`,style:s?.style||'normal',event:{...mm.event},retrieval,
  targetId:s?.targetId||Object.keys(mm.stocks)[0],holdingTargetId:s?.actedRound===m.round?s.targetId:null,position:s?.position?{...s.position}:null,selfPlayerId:ps.playerId,playerReturns:(mm.returns||[]).map(v=>({...v})),archiveOffers:archiveOwned?[]:(mm.archiveOffers||[]).map(v=>({...v})),
  liquidated:!!s?.liquidated,financing:{pending:s?.financingPending?{...s.financingPending}:null,quote:financingQuote((s?.value||0)+(s?.actedRound===m.round?0:ps.funds)),disabledByLiquidation:!!s?.financingDisabled,blocked:!!(s?.financingDisabled||s?.prtsUnlocked||s?.rewardId===MASTERY_ITEM_ID||archiveOwned||s?.retrievalUsed),fees:s?.financingFees||0},
  received:s?.received||0,rewardTier:s?.rewardTier||0,rewardPending:!!s?.closed&&((!!s.rewardId&&!s.granted)||(!!s.prtsWon&&!s.prtsGranted)),acted:s?.actedRound===m.round,last:s?.last?{...s.last}:null,
  endRound:investmentEndRound(m),
  stocks:Object.values(mm.stocks).map(stock=>({id:stock.id,name:stock.name,shortName:stock.shortName,trait:stock.trait,volatility:stock.volatility,trend:stock.trend,tradable:true,reference:stock.reference,
   share:mm.shares?.[stock.id]??null,history:stock.history.map(({round,open,close,high,low,rate,initial,simulated,share})=>({round,open,close,high,low,rate,initial,simulated,share}))})),
  canInvest:m.phase===PHASE.PREP&&!ps.ready&&ps.alive&&m.round<investmentEndRound(m)&&!s?.closed&&s?.actedRound!==m.round&&((s?.value||0)+ps.funds)>0};
}
export function freezeInvestment(m){
 if(!investmentEnabled(m)||m.round<FIRST||m.round>=investmentEndRound(m))return;
 const mm=openMarket(m);if(mm.pending?.round===m.round)return;
 // Only this round's confirmed orders enter the market; otherwise the account simply holds cash.
 const allocation=allocations(m),total=Object.values(allocation).reduce((sum,v)=>sum+v,0),M=active(m).filter(p=>p.investment.actedRound===m.round).reduce((sum,p)=>sum+p.investment.principal,0),securities=[];
 for(const stock of Object.values(mm.stocks)){
  const capital=allocation[stock.id]||0,affected=mm.event.targetId===stock.id||mm.event.id==='tight',event=affected?mm.event.id:'normal';
  const d=priceDistribution(stock,{capital,total,previousCapital:mm.lastAllocations[stock.id]||0,previousTotal:mm.lastTotal,eventScale:affected?mm.event.scale||1:1});
  securities.push({id:stock.id,d,reference:stock.reference,capital,event});
 }
 const players=active(m).filter(p=>p.investment.actedRound===m.round).map(p=>{
  const s=p.investment,security=securities.find(v=>v.id===s.targetId),sd=security.d;
  // Compare settlement with the amount actually invested after this round's PRTS purchase.
  const retrievalFee=s.retrievalPending?.round===m.round?s.retrievalPending.fee:0;
  const equity=s.committedEquity==null?s.value:precise(s.committedEquity-retrievalFee),orderPosition=position(s.value,mm.stocks[s.targetId].history.at(-1).close,s.financingPending);s.position=orderPosition;
  return {playerId:p.playerId,targetId:s.targetId,equity,position:orderPosition,event:security.event,d:{...accountDistribution({value:equity,principal:s.principal,market:M},sd,s.financingPending),shareBased:true,budget:s.value},security:sd,retrieval:s.retrievalPending?{...s.retrievalPending}:null,
   archive:!hasArchive(p)?mm.archiveOffers?.find(v=>v.investRound===m.round&&v.targetId===s.targetId):null};
 });
 const top=players.slice().sort((a,b)=>b.d.principal-a.d.principal||m.players.get(a.playerId).seat-m.players.get(b.playerId).seat)[0];
 const calibration=top?calibrateProgression(top.d,top.security,investmentEndRound(m)-FIRST):{coefficient:0,ordinaryFactor:1};
 mm.pending={round:m.round,...calibration,players,securities};mm.opening=M;mm.out=0;changed(m);
}
export function settleInvestment(m){
 if(!investmentEnabled(m)||m.round<FIRST)return;
 const mm=market(m),pending=mm.pending;
 if(pending&&pending.round<m.round){
  mm.pending=null;const candles=new Map();
  for(const security of pending.securities){
   const stock=mm.stocks[security.id],candle=stockPath(stock.history.at(-1).close,security.d,m.rngInvestment(),m.rngInvestmentMarket);candles.set(security.id,candle);
   stock.history.push({round:m.round,...candle,reference:security.reference,share:null});
  }
  for(const entry of pending.players){
   const ps=m.players.get(entry.playerId),s=ps?.investment;if(!ps?.alive||!s?.active||s.closed)continue;
   const candle=candles.get(entry.targetId),rate=candle.rate,result=settlePosition(entry,candle);s.position=null;
   s.value=result.value;s.last={round:m.round,targetId:entry.targetId,rate,...result,equipment:null};
   if(entry.d.financing){s.financingPending=null;s.financingFees=(s.financingFees||0)+entry.d.financing.fee;s.style='normal';}
   if(result.liquidated){s.liquidated=true;s.financingDisabled=true;s.active=true;s.closed=false;s.received=0;s.retrievalPending=null;ps.dirty();continue;}
   if(result.gain>0&&s.rewardId!==MASTERY_ITEM_ID){
    const chances=progressionChances(result.gain,entry.d.market,pending.coefficient,pending.ordinaryFactor,entry.event),roll=m.rngInvestment();
    const tier=progressionReward(s.rewardTier,roll<chances.mastery,roll>=chances.mastery&&roll<chances.mastery+chances.ordinary);
    // Catalog selection deliberately ignores the shared item-copy inventory.
    const pool=m.gd.shopItemsByTier[tier]||[],id=tier===7?MASTERY_ITEM_ID:tier>s.rewardTier&&pool.length?pool[Math.min(pool.length-1,Math.floor(m.rngInvestment()*pool.length))]:null;
    if(id&&tier>s.rewardTier){s.rewardId=id;s.rewardTier=tier;s.last.equipment=id;if(id===MASTERY_ITEM_ID)s.prtsUnlocked=true;}
   }
   if(entry.retrieval&&s.retrievalPending?.round===pending.round){s.retrievalPending=null;const won=!hasArchive(ps)&&m.rngInvestment()<entry.retrieval.chance;if(won)awardArchive(ps,'retrieval');s.last.retrieval={...entry.retrieval,won};}
   if(entry.archive&&!hasArchive(ps)&&candle.close+1e-8>=candle.open*(1+entry.archive.threshold)&&result.gain>0){const won=m.rngInvestment()<entry.archive.chance;if(won)awardArchive(ps,'rhodes');s.last.archive={won,chance:entry.archive.chance};}
   if(result.change<0&&s.value<s.principal&&s.rewardId&&s.rewardId!==MASTERY_ITEM_ID&&m.rngInvestment()<(s.principal-s.value)/s.principal){s.rewardId=null;s.rewardTier=0;s.last.equipmentLost=true;}
   ps.dirty();
  }
  const marked=Object.create(null);
  for(const entry of pending.players){const ps=m.players.get(entry.playerId),s=ps?.investment;if(!ps?.alive||!s?.active||s.closed)continue;marked[entry.targetId]=money((marked[entry.targetId]||0)+s.value);}
  mm.lastAllocations=marked;mm.lastTotal=money(Object.values(marked).reduce((sum,v)=>sum+v,0));
  const shares=shareSnapshot(Object.values(mm.stocks),marked,mm.lastTotal);for(const stock of Object.values(mm.stocks))stock.history.at(-1).share=shares[stock.id];
 }
 openMarket(m);
 if(m.round>=investmentEndRound(m))for(const ps of active(m))cashOut(ps);
 for(const ps of m.order)if(ps.alive&&ps.investment?.closed)claimInvestmentReward(ps);
 if(mm.returnRound!==m.round){mm.returns=publicReturns(m.order,m.round);mm.returnRound=m.round;}
 changed(m);
}
