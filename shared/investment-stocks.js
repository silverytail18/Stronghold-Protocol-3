// Public securities use original Terra organization names; market traits are game design.
export const STOCK_POOL=Object.freeze([
 ['rhodes','罗德岛制药','science',.90,-1,'回归 · 常态振幅较小'],
 ['rhine','莱茵生命','science',1.20,0,'研发消息敏感 · 高振幅'],
 ['tower','塔山生物科技','science',1.15,0,'研发消息敏感'],
 ['volvort','沃尔沃特科钦斯基','science',1.25,1,'趋势延续 · 高振幅'],
 ['penguin','企鹅物流','trade',1.10,1,'轻微趋势延续'],
 ['mountain','峯驰物流','trade',.90,1,'路线敏感 · 振幅较小'],
 ['karlan','喀兰贸易','trade',1.05,1,'轻微趋势延续'],
 ['lungmen','龙门银行','trade',.85,-1,'轻微回归 · 振幅较小'],
 ['victoria','维多利亚银行','trade',.95,-1,'轻微回归'],
 ['swoma','斯沃玛食品','trade',.85,-1,'轻微回归 · 振幅较小'],
 ['rosebud','玫瑰报业','trade',1.10,-1,'轻微回归'],
 ['blacksteel','黑钢国际','industry',1.05,0,'补给订单敏感'],
 ['raythean','雷神工业','industry',1.15,1,'订单敏感 · 趋势延续'],
 ['mieszko','梅什科集团','industry',1.25,-1,'高振幅 · 轻微回归'],
 ['shield','辉煌盾工业','industry',1.05,0,'补给订单敏感'],
 ['rim','雷姆必拓矿业公司','industry',1.20,1,'路线敏感 · 趋势延续'],
].map(([id,name,sector,volatility,trend,trait])=>Object.freeze({id:'stock_'+id,name,shortName:id==='volvort'?'沃尔沃特':name,sector,volatility,trend,trait})));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rounded=n=>Math.round(n*100)/100;
export function selectStocks(rng){
 const remaining=[...STOCK_POOL],result=[];
 const pick=list=>{const stock=list[Math.min(list.length-1,Math.floor(rng()*list.length))];remaining.splice(remaining.indexOf(stock),1);result.push(stock);};
 for(const sector of ['trade','industry','science'])pick(remaining.filter(s=>s.sector===sector));pick(remaining);return result;
}
export function simulatedOpen(stocks,rng){
 const weights=stocks.map(()=>.8+.4*rng()),sum=weights.reduce((a,b)=>a+b,0);
 return stocks.map((s,i)=>{const open=rounded(1000*weights[i]/sum),rate=(rng()<.5?-1:1)*Math.min(.15,(.02+.10*rng())*s.volatility),close=rounded(open*(1+rate));
  return {round:12,initial:true,simulated:true,open,close,index:close,rate,high:rounded(Math.max(open,close)*(1+(.01+.03*rng())*s.volatility)),low:rounded(Math.min(open,close)*(1-(.01+.03*rng())*s.volatility)),share:null};});
}
export function stockReference(stock,rng,eventShift=0){
 const previous=stock.reference??.5,rate=stock.history?.at(-1)?.rate||0;
 return clamp(.5+.4*(previous-.5)+(rng()*.36-.18)+stock.trend*.03*clamp(rate/.2,-1,1)+eventShift,.3,.7);
}
export const STOCK_EVENTS=Object.freeze({normal:{name:'常态市场'},supply:{name:'补给订单'},capital:{name:'资本涌入'},research:{name:'研发披露'},route:{name:'路线变动'},tight:{name:'流动性收紧'},archive:{name:'科研协作'}});
export function stockEvent(stocks,round,endRound,rng){
 const draw=rng();if(draw<.85)return {id:'normal',name:STOCK_EVENTS.normal.name};
 const candidates=[['supply',4,stocks.filter(s=>s.sector==='trade'||s.sector==='industry')],['capital',3,stocks],['research',2,stocks.filter(s=>s.sector==='science')],['route',2,stocks.filter(s=>s.sector==='trade'||s.id==='stock_rim')],['tight',2,stocks],['archive',2,round+1<endRound?stocks.filter(s=>s.id==='stock_rhodes'):[]]].filter(v=>v[2].length);
 let n=(draw-.85)/.15*candidates.reduce((a,b)=>a+b[1],0),chosen=candidates.at(-1);
 for(const c of candidates){n-=c[1];if(n<0){chosen=c;break;}}
 const [id,,targets]=chosen,target=targets[Math.min(targets.length-1,Math.floor(rng()*targets.length))],positive=rng()<.5;
 return {id,name:STOCK_EVENTS[id].name,targetId:id==='tight'?null:target.id,targetName:id==='tight'?'全部股票':target.name,positive,
  shift:id==='supply'?-.08:id==='capital'?.03:id==='research'?(positive?.08:-.08):id==='route'?(positive?.06:-.06):id==='tight'?-.04:0,
  scale:id==='capital'?1.3:id==='research'?1.15:id==='route'?(positive?.95:1.15):id==='tight'?1.15:1,
  detail:id==='supply'?'亏损风险↑ · 普通装备获取率×1.60（每轮最多升一阶）':id==='capital'?'参考盈利率↑ · 涨跌振幅×1.30':id==='research'?(positive?'研究进展 · 参考↑ · 振幅×1.15':'研发延期 · 参考↓ · 振幅×1.15'):id==='route'?(positive?'路线通航 · 参考↑':'路线受阻 · 参考↓ · 振幅↑'):id==='tight'?'参考盈利率↓ · 涨跌振幅×1.15':`R${round+1}投资罗德岛制药 · 股价涨幅≥30%且本人盈利 · 32.5%额外PRTS`};
}
export function shareSnapshot(stocks,allocations,total){
 if(!(total>0))return Object.fromEntries(stocks.map(s=>[s.id,null]));
 const entries=stocks.map((s,i)=>{const exact=1000*(allocations[s.id]||0)/total;return {id:s.id,n:Math.floor(exact),rem:exact-Math.floor(exact),i};});
 let extra=1000-entries.reduce((sum,v)=>sum+v.n,0);for(const e of [...entries].sort((a,b)=>b.rem-a.rem||a.i-b.i)){if(extra--<=0)break;e.n++;}
 return Object.fromEntries(entries.map(e=>[e.id,e.n/1000]));
}
