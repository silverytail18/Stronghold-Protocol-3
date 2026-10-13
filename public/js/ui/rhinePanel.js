import {useState,useEffect} from '../../vendor/hooks.module.js';
import {html} from './components.js';
import {act} from './gameActions.js';
import {TECHNOLOGIES,TECH_ROWS,TECH_BY_ID,qualifies,activationCount,positionKey} from '../../../shared/rhine.js';
import {RHINE_COLORS,rhineMarks} from '../../../shared/rhine-visual.js';
import {PHASE} from '../../../shared/constants.js';
export function RhinePanel({priv,phase,gd,blocked=false}){
 const [open,setOpen]=useState(false),[select,setSelect]=useState(null),[draft,setDraft]=useState([]),[busy,setBusy]=useState(false),[reset,setReset]=useState(false);
 const s=priv?.rhine;
 useEffect(()=>{if(!s?.enabled){setSelect(null);setDraft([]);}},[s?.enabled]);
 if(!s)return null;
 const editable=phase===PHASE.PREP&&!priv.ready&&!priv.autoplay&&s.enabled&&!busy;
 const request=async(t,fields)=>{setBusy(true);try{return await act(t,fields,{sfx:'confirm'});}finally{setBusy(false);}};
 const pick=id=>{setSelect(id);setDraft((s.positions[id]||[]).map(p=>[...p]));};
 const marks=rhineMarks(s.positions),max=select&&['T01','T02','T04'].includes(select)&&qualifies('T09',s.research,s.count)?2:1;
 const canTile=cell=>{const p=cell.position,other=marks.find(m=>positionKey([m.row,m.col])===positionKey(p)&&m.id!==select);return (cell.legalFor?cell.legalFor.includes(select):cell.legal)&&!other&&(select!=='T13'||cell.deployable);};
 const choose=cell=>{if(!editable||!canTile(cell))return;const key=positionKey(cell.position);setDraft(old=>old.some(p=>positionKey(p)===key)?old.filter(p=>positionKey(p)!==key):old.length<max?[...old,cell.position]:max===1?[cell.position]:old);};
 const confirmed=async()=>{if(await request('g.rhinePositions',{id:select,positions:draft}))setSelect(null);};
 if(!open)return s.enabled&&!blocked?html`<button class="rhine-entry" data-testid="rhine-entry" onClick=${()=>setOpen(true)}>莱茵科技 <b>${s.availablePoints}</b>点</button>`:null;
 return html`<div class="rhine-shade" role="dialog" aria-modal="true" aria-label="莱茵生命科技树" data-testid="rhine-panel">
  <section class="rhine-panel">
   <header><div><small>RHINE LAB</small><h2>莱茵生命 · 科技树</h2></div><button aria-label="关闭科技菜单" onClick=${()=>{setOpen(false);setSelect(null);setReset(false);}}>关闭</button></header>
   <div class="rhine-summary"><b>${s.layers}/999层</b><b>可用 ${s.availablePoints} / 总计 ${s.totalPoints}点</b><span>莱茵 ${s.count}人</span></div>
   <p class="rhine-rule">${s.enabled?'仅莱茵身份干员受益。3/6人科技按原人数生效；更高科技解锁后6人生效。每场开战重查人数与前置，战斗中资格固定；区域仅战斗生效。':'休整作战区少于3人：科技暂停，研究与选格数据保留。'} 正常点数${s.normalPoints}/19；十人奖励${s.tenPoint}；策略奖励${s.strategyPoints}。</p>
   ${select?html`<section class="rhine-select"><h3>${select} ${TECH_BY_ID[select].name} · 选择位置 ${draft.length}/${max}</h3><p>每格最多归属一个科技。点击已选格取消；${select==='T13'?'研究席可选任意合法部署格；开战自动授予本场身份。':'可选道路和部署格。'}图中上方为战场上方。</p>
    <div class="rhine-map" data-testid="rhine-map">${s.grid.map(cell=>{const key=positionKey(cell.position),m=marks.find(m=>positionKey([m.row,m.col])===key),selected=draft.some(p=>positionKey(p)===key),piece=(priv.board||[]).find(p=>p.row===cell.position[0]&&p.col===cell.position[1]);return html`<button data-position=${key} class=${`rhine-cell ${cell.height==='HIGH'?'is-high':''} ${selected?'is-selected':''}`} style=${`--rhine-color:${selected?RHINE_COLORS[select]:m?.color||'#719080'}`} disabled=${!editable||!canTile(cell)} aria-pressed=${selected} title=${`${key} ${cell.deployable?'部署格':'道路/不可部署'} ${m?m.id+' '+TECH_BY_ID[m.id].name:''}`} onClick=${()=>choose(cell)}>${(selected||m)&&html`<i class="rhine-cell__mark" aria-hidden="true"/>`}<span>${piece?gd.chess(piece.id)?.name||'召唤物':''}</span><small>${selected?select:m?.id||''}</small></button>`;})}</div>
    <div class="rhine-legend">${Object.entries(RHINE_COLORS).map(([id,color])=>html`<span style=${`--rhine-color:${color}`}><i/>${id} ${TECH_BY_ID[id].name}</span>`)}</div>
    <footer><button disabled=${busy} onClick=${()=>setSelect(null)}>返回科技树</button><button disabled=${!editable} onClick=${()=>setDraft([])}>清空本科技位置</button><button disabled=${!editable} onClick=${confirmed}>确认位置</button></footer>
   </section>`:html`<div class="rhine-tree-scroll" data-testid="rhine-tree"><div class="rhine-tree">
    <svg class="rhine-tree-lines" viewBox="0 0 900 1296" preserveAspectRatio="none" aria-hidden="true">${TECHNOLOGIES.flatMap(t=>t.pre.map(pre=>{const row=TECH_ROWS[t.layer-1],prow=TECH_ROWS[TECH_BY_ID[pre].layer-1],x=(row.indexOf(t.id)+.5)*900/row.length,px=(prow.indexOf(pre)+.5)*900/prow.length,y=(t.layer-1)*216,py=(TECH_BY_ID[pre].layer-1)*216+195;return html`<path d=${`M${px} ${py} L${px} ${py+10} L${x} ${y-8} L${x} ${y}`} class=${s.research.includes(pre)?'is-active':''}/>`;}))}</svg>
    ${TECH_ROWS.map((row,i)=>html`<div class="rhine-tree-row" style=${`--rhine-columns:${row.length}`} aria-label=${`科技第${i+1}层`}>${row.map(id=>{const t=TECH_BY_ID[id],owned=s.research.includes(id),usable=s.active.includes(id),allowed=editable&&!owned&&s.count>=t.count&&t.pre.every(p=>qualifies(p,s.research,s.count))&&s.availablePoints>=t.cost;return html`<article class=${`rhine-tech ${owned?'is-owned':''} ${owned&&!usable?'is-paused':''}`} style=${`--rhine-color:${RHINE_COLORS[id]||'#a6c8b5'}`} data-tech=${id}>
     <h3><span>${id}</span> ${t.name}</h3><div class="rhine-tech__require">解锁${t.count}人 · 生效${activationCount(t)}人 · ${t.cost}科技点</div><p>${t.effect}</p><small>前置：${t.pre.length?t.pre.join(' ＋ '):'无'}</small><footer>${owned?html`<b>${usable?'已研究':'已研究 · 暂停'}</b>`:html`<button disabled=${!allowed} onClick=${()=>request('g.rhineResearch',{id})}>研究 ${t.cost}点</button>`}${t.region&&owned&&html`<button disabled=${!editable||!usable} onClick=${()=>pick(id)}>选择位置</button>`}</footer>
    </article>`;})}</div>`)}
   </div></div>`}
   <footer class="rhine-bottom">${reset?html`<span>返还全部已投入点数，清除科技与选格；层数和已领奖励保留。<button disabled=${!editable} onClick=${async()=>{if(await request('g.rhineReset',{}))setReset(false);}}>确认重置</button><button onClick=${()=>setReset(false)}>取消</button></span>`:html`<button disabled=${!editable||s.respecUsed||!s.research.length} onClick=${()=>setReset(true)}>${s.respecUsed?'本局重置已用':'重置研究（本局一次）'}</button>`}<span>颜色表示科技类型，淡色标志表示所选格。</span></footer>
  </section>
 </div>`;
}
