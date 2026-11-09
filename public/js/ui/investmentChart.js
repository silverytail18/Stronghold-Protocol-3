import {useState,useLayoutEffect,useRef} from '../../vendor/hooks.module.js';
import {html} from './components.js';
const fmt=n=>Number(n||0).toLocaleString('zh-CN',{maximumFractionDigits:4}),signed=n=>(n>=0?'+':'')+fmt(n),share=n=>n===null||n===undefined?'—':fmt(n*100)+'%';
export function InvestmentChart({stocks=[],holdingTargetId,targetId,onTargetChange,canSelect=false,round,entryPrice,playerReturns=[],playerId}){
 const [mode,setMode]=useState('candles'),[selected,setSelected]=useState(targetId),[width,setWidth]=useState(600),[compact,setCompact]=useState(false),[cursor,setCursor]=useState(null),[offset,setOffset]=useState(0),[sort,setSort]=useState('reference');
 const ref=useRef(null);
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const update=()=>{setWidth(Math.max(240,Math.floor(el.clientWidth)-28));setCompact(globalThis.innerHeight<=520);};update();const observer=new ResizeObserver(update);observer.observe(el);globalThis.addEventListener('resize',update);return()=>{observer.disconnect();globalThis.removeEventListener('resize',update);};},[]);
 useLayoutEffect(()=>{setCursor(null);setOffset(0);},[selected,round]);
 useLayoutEffect(()=>{if(targetId)setSelected(targetId);},[targetId]);
 const pick=stocks.find(s=>s.id===selected)||stocks[0],all=pick?.history||[],count=compact||width<480?6:12,end=Math.max(1,all.length-offset),points=all.slice(Math.max(0,end-count),end),candle=points[cursor]||points.at(-1),close=candle?.close,rate=candle?.rate||0;
 const low=Math.min(...points.map(v=>v.low),Infinity),high=Math.max(...points.map(v=>v.high),0),span=Math.max(.0001,high-low),lo=Math.max(0,(Number.isFinite(low)?low:0)-span*.1),hi=Math.max(lo+.0001,high+span*.15);
 const w=width,h=compact?76:226,left=8,right=58,top=compact?6:18,priceBottom=h-22,step=(w-left-right)/Math.max(1,points.length),x=i=>left+(i+.5)*step,y=v=>priceBottom-(v-lo)/(hi-lo)*(priceBottom-top);
 const choose=id=>{if(canSelect){onTargetChange?.(id);setSelected(id);}};
 const totalReturn=s=>{const first=s.history?.[0]?.open,last=s.history?.at(-1)?.close;return first>0?last/first-1:0;};
 const sorted=[...stocks].sort((a,b)=>sort==='share'?(b.share||0)-(a.share||0):sort==='return'?totalReturn(b)-totalReturn(a):b.reference-a.reference);
 return html`<section class="stock-market stock-market--v5 stock-market--public" ref=${ref} data-testid="investment-market">
  <header class="stock-market__heading"><span>远行交易所<small>TERRA EXCHANGE · R${round}</small></span><nav aria-label="行情视图"><button type="button" data-market-view="candles" aria-pressed=${mode==='candles'} onClick=${()=>setMode('candles')}>K线</button><button type="button" data-market-view="board" aria-pressed=${mode==='board'} onClick=${()=>setMode('board')}>玩家收益</button></nav></header>
  ${mode==='candles'?html`<nav class="stock-market__tabs" aria-label="股票">${stocks.map(s=>html`<button type="button" title=${s.name} aria-pressed=${pick?.id===s.id} onClick=${()=>{setSelected(s.id);if(canSelect)onTargetChange?.(s.id);}}>${s.shortName||s.name}</button>`)}</nav>`:null}
  ${mode==='candles'?html`
   <div class="stock-market__toolbar"><strong>${pick?.name}</strong><button type="button" data-pick-stock=${pick?.id} disabled=${!canSelect} onClick=${()=>choose(pick.id)}>${targetId===pick?.id?'已选为投资股票':'选择此股票'}</button></div>
   <div class="stock-market__quote"><span class=${rate>=0?'stock-up':'stock-down'}><strong>${close===undefined?'—':fmt(close)}</strong> ${signed(rate*100)}%</span><span class="stock-market__reference">参考盈利率 <b>${Math.round((pick?.reference??.5)*100)}%</b><small>本轮固定</small></span></div>
   <div class="stock-market__public-stats"><span>上轮参与资金占比 <b>${share(pick?.share)}</b></span><span class="stock-market__trait">${pick?.trait}</span></div>
   <div class="stock-market__readout" aria-live="polite">${candle?`${candle.simulated?'开市前·模拟行情':'R'+candle.round}　开 ${fmt(candle.open)}　收 ${fmt(candle.close)}　${signed(rate*100)}%`:''}</div>
   <svg class="stock-market__chart" viewBox=${`0 0 ${w} ${h}`} role="img" aria-label="股票K线，横轴回合，纵轴价格；首根为开市前模拟行情，影线来自同一模拟价格路径">
    ${[0,1,2,3].map(i=>{const value=lo+(hi-lo)*i/3;return html`<g><line x1=${left} x2=${w-right} y1=${y(value)} y2=${y(value)} stroke="#c0d3d61a"/><text x=${w-right+7} y=${y(value)+4}>${value>=10000?(value/10000).toFixed(1)+'万':fmt(value)}</text></g>`;})}
    ${points.map((p,i)=>{const color=p.close>=p.open?'#f27d88':'#63ccb2',bw=Math.min(24,step*.55),label=p.simulated?'开市前':'R'+p.round;return html`<g>
     <line x1=${x(i)} x2=${x(i)} y1=${y(p.high)} y2=${y(p.low)} stroke=${color}/><rect x=${x(i)-bw/2} y=${Math.min(y(p.open),y(p.close))} width=${bw} height=${Math.max(1.5,Math.abs(y(p.open)-y(p.close)))} fill=${color}/>
     ${width>480||i%2===0?html`<text x=${x(i)} y=${h-6} text-anchor="middle">${label}</text>`:null}
     <rect class="stock-market__hit" x=${x(i)-step/2} y="0" width=${step} height=${priceBottom+3} fill="transparent" onPointerMove=${()=>setCursor(i)} onClick=${()=>setCursor(i)}><title>${label} 开${fmt(p.open)} 收${fmt(p.close)} 高${fmt(p.high)} 低${fmt(p.low)}</title></rect>
    </g>`;})}
    ${points.length?html`<polyline points=${points.map((p,i)=>{const n=all.indexOf(p),a=all.slice(Math.max(0,n-2),n+1);return `${x(i)},${y(a.reduce((sum,v)=>sum+v.close,0)/a.length)}`;}).join(' ')} stroke="#d9c088" stroke-width="1.3" fill="none" pointer-events="none"/>`:null}
    ${pick?.id===targetId&&entryPrice>=lo&&entryPrice<=hi?html`<g><line x1=${left} x2=${w-right} y1=${y(entryPrice)} y2=${y(entryPrice)} stroke="#e0c88d" stroke-dasharray="4 3"/><text x=${left+3} y=${y(entryPrice)-4}>本轮成本</text></g>`:null}
    ${cursor!==null&&points[cursor]?html`<line x1=${x(cursor)} x2=${x(cursor)} y1=${top} y2=${priceBottom} stroke="#b7c5cb88" stroke-dasharray="3 4" pointer-events="none"/>`:null}
   </svg>
   <footer><span>MA3 · 红涨绿跌 · 路径行情</span><span><button type="button" aria-label="查看更早行情" disabled=${end<=count} onClick=${()=>{setOffset(Math.min(Math.max(0,all.length-count),offset+count));setCursor(null);}}>更早</button><button type="button" disabled=${offset===0} onClick=${()=>{setOffset(0);setCursor(null);}}>最新</button></span></footer>
  `:html`
   <div class="stock-market__ranking-head"><span>本局玩家收益 · 结算后更新</span></div>
   <div class="stock-market__players" role="table" aria-label="玩家收益"><div class="stock-market__player-head" role="row"><span>玩家</span><span>累计投入</span><span>总收益率</span></div>${playerReturns.map(p=>html`<div role="row" class=${p.playerId===playerId?'is-self':''} data-player-return=${p.playerId}><span>${p.name}${p.playerId===playerId?' · 本人':''}<small>${!p.alive?'最后结算':p.closed?'已收手':''}</small></span><b>${fmt(p.principal)}</b><b class=${p.returnRate===null||p.returnRate===0?'':p.returnRate>0?'stock-up':'stock-down'}>${p.returnRate===null?'—':(p.returnRate>0?'+':'')+(p.returnRate*100).toFixed(2)+'%'}</b></div>`)}</div>
  `}
 </section>`;
}
