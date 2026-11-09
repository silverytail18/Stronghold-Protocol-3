import {studentQuantile,stockLogReturn} from './investment-math.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const precise=x=>Math.round(Math.max(0,Number.isFinite(x)?x:0)*1e8)/1e8;
export const stockDepth=Object.freeze({penguin:60,mountain:100,karlan:80,lungmen:120,victoria:110,swoma:100,rosebud:60,blacksteel:80,raythean:100,mieszko:60,shield:80,rim:80,rhodes:100,rhine:70,tower:70,volvort:60});
export function referenceFor(stock,{marketSignal,sectorSignal,individual,eventShift=0}){
 const open=stock.history.at(-1).close;stock.fundamental=precise(Math.max(.01,(stock.fundamental||open)*Math.exp(sectorSignal*.25+individual*.1875)));
 const trend=stock.trend*.03*clamp((stock.history.at(-1).rate||0)/.12,-1,1),valuation=clamp(.15*Math.log(stock.fundamental/open),-.05,.05);
 return clamp(.5+.35*((stock.reference??.5)-.5)+marketSignal+sectorSignal+individual+trend+valuation+eventShift,.3,.7);
}
export function priceDistribution(stock,{capital,total,previousCapital,previousTotal,eventScale=1}){
 const depth=(stockDepth[stock.id.replace('stock_','')]||80)+.5*previousTotal,flow=previousTotal>0?capital-previousCapital:0,p=clamp(stock.reference+.04*Math.tanh(flow/depth),.25,.75),scale=.06*stock.volatility*eventScale*(1+.35*Math.min(2,Math.abs(flow)/depth));
 return {logarithmic:true,probability:p,scale,mu:-scale*studentQuantile(1-p)};
}
export function stockPath(open,d,u,rng){
 open=Math.max(.01,open);const end=stockLogReturn(d.mu+d.scale*studentQuantile(u)),walk=[0];
 for(let j=1;j<=12;j++){const a=Math.max(1e-12,rng()),b=rng();walk.push(walk.at(-1)+Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b));}
 const nodes=[precise(open)];for(let j=1;j<=12;j++){const logMove=j===12?end:j/12*end+.35*d.scale*(walk[j]-j/12*walk[12]);nodes.push(precise(Math.max(.01,.5*open,open*Math.exp(logMove))));}
 const close=nodes.at(-1);return {open:precise(open),close,high:Math.max(...nodes),low:Math.min(...nodes),rate:close/open-1,nodes};
}
export function position(value,price,financing=null){const fee=financing?.fee||0,loan=financing?value:0;return {shares:(value+loan-fee)/price,entryPrice:price,loan,fee,line:financing?.line||0};}
export function settlePosition(order,candle){
 const p=order.position;let price=candle.close,liquidated=false;
 if(p.loan>0){const touch=candle.nodes.find(v=>p.shares*v-p.loan<=p.line);if(touch!==undefined){price=touch;liquidated=true;}}
 const value=precise(Math.max(0,p.shares*price-p.loan)),change=precise(value)-order.equity;
 return {value,gain:Math.max(0,change),change,liquidated,exitPrice:price,financingFee:p.fee};
}
export function publicReturns(players,round){return players.map(p=>{
  const s=p.investment,I=s?.principal||0,V=s?.closed?0:s?.position?Math.max(0,s.position.shares*s.position.entryPrice-s.position.loan):s?.value||0,W=s?.received||0;
  // Paid PRTS retrieval is a separate purchase, not a trading loss. Financing fees remain in returns.
  const retrievalFees=s?.retrievalFees||0;
  return {playerId:p.playerId,name:p.name,principal:I,returnRate:I>0?(V+W+retrievalFees-I)/I:null,closed:!!s?.closed,alive:!!p.alive,round};
});}
