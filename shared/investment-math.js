// Direct coin P&L distribution (Student t, 3 degrees of freedom), not fixed outcome tiers.
export const INVESTMENT_RULES=Object.freeze({firstRound:13,settlement:'boss-prep',version:6,
 baseDrift:.5,flowDrift:2,baseScale:3,ownScale:1.5,marketScale:.5,memoryScale:.15,maxChange:10000});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const money=n=>Math.round(Math.max(0,Number.isFinite(n)?n:0)*100)/100;
export function studentCDF(x){if(x===Infinity)return 1;if(x===-Infinity)return 0;return clamp(.5+(Math.atan(x/Math.sqrt(3))+x*Math.sqrt(3)/(x*x+3))/Math.PI,0,1);}
export function studentQuantile(p){
 p=clamp(p,1e-8,1-1e-8);let lo=-1000,hi=1000;
 for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(studentCDF(mid)<p)lo=mid;else hi=mid;}return (lo+hi)/2;
}
export function distribution({principal,value,market,flow=0,memory=0}){
 const mu=INVESTMENT_RULES.baseDrift+INVESTMENT_RULES.flowDrift*clamp(flow,-1,1);
 const scale=(3+1.5*Math.sqrt(Math.max(0,principal))+.5*Math.sqrt(Math.max(0,market)))*(1+.15*clamp(memory,0,3));
 return {value:money(value),principal:money(principal),market:money(market),mu,scale};
}
export function pnlAt(d,u){
 const raw=clamp(d.mu+d.scale*studentQuantile(u),-INVESTMENT_RULES.maxChange,INVESTMENT_RULES.maxChange);
 const value=money(Math.min(1000000,Math.max(0,d.value+raw)));
 if(d.financing){const liquidated=value<=d.financing.line,final=liquidated?0:value;return {value:final,gain:money(Math.max(0,final-d.value)),change:Math.round((final-d.value)*100)/100,liquidated,financingFee:d.financing.fee};}
 return {value,gain:money(Math.max(0,value-d.value)),change:Math.round((value-d.value)*100)/100};
}
export function anyEquipment(gain,market){return gain>0&&market>0?-Math.expm1(-16*gain/market):0;}
export function masteryProbability(gain,market,c){return anyEquipment(gain,market)*Math.min(1,c*Math.sqrt(4*gain/market));}
const SAMPLES=128;
export function calibrateMastery(d,rounds=5){
 const target=1-Math.pow(.5,1/Math.max(1,rounds)),gains=Array.from({length:SAMPLES},(_,i)=>pnlAt(d,(i+.5)/SAMPLES).gain);
 const expectation=c=>gains.reduce((sum,g)=>sum+masteryProbability(g,d.market,c),0)/SAMPLES;
 let lo=0,hi=1000000;for(let i=0;i<36;i++){const mid=(lo+hi)/2;if(expectation(mid)<target)lo=mid;else hi=mid;}
 const coefficient=(lo+hi)/2;return {coefficient,expected:expectation(coefficient),target};
}
export function distributionView(d,c){
 const cdf=change=>studentCDF((change-d.mu)/d.scale);
 const positive=1-cdf(.005),zero=cdf((d.financing?.line||0)-d.value+.005);
 let equipment=0,mastery=0;
 for(let i=0;i<SAMPLES;i++){const g=pnlAt(d,(i+.5)/SAMPLES).gain;equipment+=anyEquipment(g,d.market)/SAMPLES;mastery+=masteryProbability(g,d.market,c)/SAMPLES;}
 return {profit:positive,zero,loss:Math.max(0,cdf(-.005)-zero),flat:Math.max(0,1-positive-zero-Math.max(0,cdf(-.005)-zero)),
  gain10:1-cdf(10),gain30:1-cdf(30),gain80:1-cdf(80),equipment,mastery,
  low:pnlAt(d,.1).change,median:pnlAt(d,.5).change,high:pnlAt(d,.9).change};
}
export function ordinaryTier(x,u){
 const weights=x<.1?[.60,.30,.09,.01]:x<.25?[.25,.45,.25,.05]:x<.5?[0,.35,.45,.20]:[0,.10,.40,.50];
 let sum=0;for(let i=0;i<4;i++){sum+=weights[i];if(u<sum)return i+3;}return 6;
}

// Financing is an account overlay, not a different security or a risk tier.
export const INVESTMENT_STYLES=Object.freeze({normal:{name:'自有资金',scale:1},leveraged:{name:'融资杠杆',scale:1,leverage:2}});
export const financingQuote=value=>({collateral:money(value),loan:money(value),fee:Math.max(2,Math.ceil(money(value)*.02)),line:money(value*.3),leverage:2});
export const MARKET_EVENTS=Object.freeze({normal:{name:'常态市场',scale:1,shift:0},supply:{name:'补给订单',scale:1,shift:-.3},capital:{name:'资本涌入',scale:1.3,shift:0}});
export function marketEvent(u){return u<.85?'normal':u<.93?'supply':'capital';}
export function styledDistribution(input,style='normal',event='normal'){
 const d=distribution(input),s=INVESTMENT_STYLES[style]||INVESTMENT_STYLES.normal,e=MARKET_EVENTS[event]||MARKET_EVENTS.normal;
 d.scale*=s.scale*e.scale;d.mu+=e.shift*d.scale;
 if(style==='leveraged'){d.financing=financingQuote(input.value);d.mu=2*d.mu-d.financing.fee;d.scale*=2;}
 return d;
}
export function equipmentChances(gain,market,c,event='normal'){
 const a=anyEquipment(gain,market),mastery=masteryProbability(gain,market,c);
 const ordinary=Math.min(1-mastery,Math.max(0,a-mastery)*(event==='supply'?1.6:1));
 return {mastery,ordinary,any:mastery+ordinary};
}
export const promoteSupplyTier=(tier,u)=>Math.min(6,tier+(u<.5?0:u<.9?1:2));
export function retrievalQuote(value,used=0,kind='normal'){
 const base=Math.min(20,Math.max(10,Math.ceil(money(value)*.20)));
 return {fee:base*(kind==='deep'?2:1),chance:(kind==='deep'?.05:.03)+used*.01};
}

export function marketPressure({reference,capital,total,previousCapital=0,previousTotal=0,event='normal'}){
 const share=total>0?capital/total:0;
 const marketShift=previousTotal>0?.05*clamp((total-previousTotal)/previousTotal,-1,1):0;
 const flow=previousTotal>0?clamp((capital-previousCapital)/Math.max(20,previousCapital),-1,1):0;
 const flowShift=flow*(flow>=0?.12:.15);
 const crowd=share<=.25?0:share<=.4?(share-.25)/.15*.06:share<=.6?.06+(share-.4)/.2*.09:.15+Math.min(1,(share-.6)/.4)*.07;
 const volatility=share<=.25?1:share<=.4?1+(share-.25)/.15*.15:share<=.6?1.15+(share-.4)/.2*.25:1.4+Math.min(1,(share-.6)/.4)*.3;
 const eventShift=event==='supply'?-.08:0;
 return {share,flow:money(capital)-money(previousCapital),marketShift,flowShift,crowd,volatility,
  probability:clamp(reference+marketShift+flowShift-crowd+eventShift,.15,.85)};
}

// The same continuous Student-t draw provides sign, magnitude and ruin. No extra ruin roll.
export function securityDistribution({reference,capital,total,previousCapital=0,previousTotal=0,event='normal',memory=0}){
 const pressure=marketPressure({reference,capital,total,previousCapital,previousTotal,event});
 const scale=(.16+.30/Math.sqrt(Math.max(1,capital/10))+.06*Math.sqrt(Math.max(0,total)/100))
  *(1+.15*clamp(memory,0,3))*pressure.volatility*(event==='capital'?1.3:1);
 return {...pressure,mu:-scale*studentQuantile(1-pressure.probability),scale};
}
// One monotone draw: no extra jackpot roll. Positive log tails decay smoothly.
export function stockLogReturn(raw){
 const shoulder=Math.log(1.35),tail=.20;
 return raw>shoulder?shoulder+tail*Math.log1p((raw-shoulder)/tail):Math.max(Math.log(.5),raw);
}
export function securityReturn(d,u){return d.logarithmic?Math.expm1(stockLogReturn(d.mu+d.scale*studentQuantile(u))):clamp(d.mu+d.scale*studentQuantile(u),-1,20);}
export function accountDistribution({value,principal,market},security,financing=null){
 const d={value:money(value),principal:money(principal),market:money(market),mu:security.mu*value,scale:security.scale*value};
 if(financing){d.financing={...financing};d.mu=2*d.mu-financing.fee;d.scale*=2;}
 return d;
}
export function accountAtReturn(d,rate){
 const raw=d.shareBased?((d.budget??d.value)+(d.financing?d.value:0)-(d.financing?.fee||0))*(1+rate)-(d.financing?d.value:0)-d.value:d.value*rate*(d.financing?2:1)-(d.financing?.fee||0);
 const value=money(Math.min(1000000,Math.max(0,d.value+raw)));
 const liquidated=!!d.financing&&value<=d.financing.line,final=liquidated&&!d.shareBased?0:value;
 return {value:final,gain:money(Math.max(0,final-d.value)),change:Math.round((final-d.value)*100)/100,
  ...(d.financing?{liquidated,financingFee:d.financing.fee}:{})};
}
// Calibration must use the actual bounded security return, including the financing boundary.
export function calibrateAccountMastery(d,security,rounds){
 const target=1-Math.pow(.5,1/Math.max(1,rounds));
 const gains=Array.from({length:SAMPLES},(_,i)=>accountAtReturn(d,securityReturn(security,(i+.5)/SAMPLES)).gain);
 const expectation=c=>gains.reduce((sum,g)=>sum+masteryProbability(g,d.market,c),0)/SAMPLES;
 let lo=0,hi=1e6;for(let i=0;i<36;i++){const mid=(lo+hi)/2;if(expectation(mid)<target)lo=mid;else hi=mid;}
 return {coefficient:(lo+hi)/2,target,expected:expectation((lo+hi)/2)};
}

// Reward progression: one ordinary hit is one step; direct mastery has priority.
export function progressionReward(tier,direct,ordinary){
 if(tier===7||direct)return 7;
 return ordinary?(tier>=3?Math.min(7,tier+1):3):tier;
}
export function progressionChances(gain,market,coefficient,ordinaryFactor=1,event='normal'){
 const mastery=masteryProbability(gain,market,coefficient),any=anyEquipment(gain,market);
 return {mastery,ordinary:Math.min(1-mastery,Math.max(0,any-mastery)*ordinaryFactor*(event==='supply'?1.6:1))};
}
export function progressionForecast(rates,rounds){
 let states=[1,0,0,0,0,0];
 for(let n=0;n<rounds;n++){
  const next=[0,0,0,0,0,states[5]];
  for(let i=0;i<5;i++){const mass=states[i];next[5]+=mass*rates.mastery;next[Math.min(5,i+1)]+=mass*rates.ordinary;next[i]+=mass*Math.max(0,1-rates.mastery-rates.ordinary);}
  states=next;
 }
 return states[5];
}
export function calibrateProgression(d,security,rounds){
 const gains=Array.from({length:256},(_,i)=>Math.max(0,accountAtReturn(d,securityReturn(security,(i+.5)/256)).gain));
 const rates=(coefficient,factor)=>gains.reduce((sum,g)=>{const normal=progressionChances(g,d.market,coefficient,factor),supply=progressionChances(g,d.market,coefficient,factor,'supply');sum.mastery+=normal.mastery/256;sum.ordinary+=(normal.ordinary*.96+supply.ordinary*.04)/256;return sum;},{mastery:0,ordinary:0});
 // Reserve space for direct mastery: ladder alone targets at most25% over the full horizon.
 let ordinaryFactor=1;
 if(progressionForecast(rates(0,1),rounds)>.25){let lo=0,hi=1;for(let n=0;n<32;n++){const mid=(lo+hi)/2;if(progressionForecast(rates(0,mid),rounds)<.25)lo=mid;else hi=mid;}ordinaryFactor=(lo+hi)/2;}
 let lo=0,hi=1e6;
 for(let n=0;n<40;n++){const mid=(lo+hi)/2;if(progressionForecast(rates(mid,ordinaryFactor),rounds)<.5)lo=mid;else hi=mid;}
 const coefficient=(lo+hi)/2,r=rates(coefficient,ordinaryFactor);return {coefficient,ordinaryFactor,rates:r,expected:progressionForecast(r,rounds)};
}
