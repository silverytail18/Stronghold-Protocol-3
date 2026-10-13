import {useEffect,useRef,useState} from '../../vendor/hooks.module.js';
import {html,MicroLabel} from './components.js';
import {actions} from './gameActions.js';
import {PHASE} from '../../../shared/constants.js';
import {kazdelPanelPlacement} from './kazdelPanelLayout.js';
const combatPhases=new Set([PHASE.COMBAT,PHASE.UNITE,PHASE.FINAL_ASSAULT,PHASE.HIDDEN_CORE]);
const number=n=>Math.max(0,Math.floor(n||0)).toLocaleString('zh-CN');

export function KazdelDonationControls({priv,gd}){
 if(!('kazdelDonationIds' in (priv||{})))return null;
 const eligible=priv.kazdelDonationEligibleIds?new Set(priv.kazdelDonationEligibleIds):null;
 const candidates=[...new Map((priv.board||[]).filter(p=>p.kind==='chess').map(p=>{
  const c=gd.chess?.(p.id);if(!c)return[null,null];const items=(p.items||[]).map(it=>gd.item?.(it.id||it));
  const member=eligible?eligible.has(c.baseId):(c.bonds||[]).includes('kazdelShip')||items.some(it=>it?.canGiveBond)&&items.some(it=>it?.giveBondId==='kazdelShip');
  return member?[c.baseId,{id:c.baseId,name:c.name}]:[null,null];
 }).filter(([id])=>id)).values()];
 if(!candidates.length)return null;const chosen=priv.kazdelDonationIds||[];
 return html`<details class="kz-donation" data-testid="kazdel-donation"><summary>自愿献血 <b class="num">${chosen.length}/2</b></summary>
  <p>安全时，开战4秒后每8秒消耗10%开战生命，产生魂火。默认不献血。</p>
  ${candidates.map(c=>html`<label><input type="checkbox" checked=${chosen.includes(c.id)} disabled=${priv.ready||!chosen.includes(c.id)&&chosen.length>=2} onChange=${e=>actions.kazdelDonation(e.target.checked?[...chosen,c.id]:chosen.filter(id=>id!==c.id))}/> ${c.name}</label>`)}
 </details>`;
}

export function KazdelPanel({phase,hud,myId,blocked=false}){
 const resource=combatPhases.has(phase)?hud?.kazdel?.find(v=>v.playerId===myId):null;
 const ref=useRef(null),[position,setPosition]=useState(null);
 useEffect(()=>{
  if(!resource||blocked)return;const el=ref.current;if(!el)return;
  const frame=el.closest('.gm__hud')||document.body,observed=new WeakSet();let queued=0;
  const update=()=>{
   queued=0;const rect=frame.getBoundingClientRect(),box={left:rect.left,top:rect.top,width:rect.width||innerWidth,height:rect.height||innerHeight};
   const obstacles=[...document.querySelectorAll('.gm__effects,.dpbox,.gtop,.team,.shopbar,.shopbar-tab,.bpop,.dpanel,.edrawer,.modal,[role="tooltip"]')].filter(node=>node!==el&&!el.contains(node)).flatMap(node=>{
    if(resize&&!observed.has(node)){resize.observe(node);observed.add(node);}
    const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&r.width&&r.height?[r]:[];
   });
   const next=kazdelPanelPlacement(box,{width:el.offsetWidth,height:el.offsetHeight},obstacles);
   setPosition(prev=>prev?.left===next?.left&&prev?.top===next?.top?prev:next);
  };
  const schedule=()=>{if(!queued)queued=requestAnimationFrame(update);};
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;resize?.observe(frame);resize?.observe(el);
  const mutation=new MutationObserver(records=>{if(records.some(r=>r.target!==el&&!el.contains(r.target)))schedule();});mutation.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','style']});
  window.addEventListener('resize',schedule);frame.addEventListener('mouseover',schedule);frame.addEventListener('mouseout',schedule);schedule();
  return()=>{if(queued)cancelAnimationFrame(queued);resize?.disconnect();mutation.disconnect();window.removeEventListener('resize',schedule);frame.removeEventListener('mouseover',schedule);frame.removeEventListener('mouseout',schedule);};
 },[!!resource,blocked]);
 if(!resource||blocked)return null;
 const fill=Math.max(0,Math.min(1,resource.soulFire/Math.max(1,resource.capacity))),debt=(resource.debts||[]).reduce((n,v)=>n+v.amount,0);
 const guard=resource.guardRemaining>0?resource.guardRemaining.toFixed(1)+'秒':resource.soulFire>=(resource.guardThreshold||resource.reference||resource.capacity/2)?'就绪':'待魂火';
 const style=position?`left:${position.left}px;top:${position.top}px;`:'visibility:hidden;';
 return html`<aside ref=${ref} class=${`kz-telemetry brackets ${resource.resonanceRemaining>0?'is-prosperity':''}`} style=${style} data-testid="kazdel-resource" aria-label="魂契实时状态">
  <header><${MicroLabel}>SOUL PACT</${MicroLabel}><span>${resource.resonanceRemaining>0?'共鸣 · ':''}${resource.layers}层</span></header>
  <div class="kz-telemetry__fire"><span>魂火</span><b class="num">${number(resource.soulFire)}</b><small class="num">/ ${number(resource.capacity)}</small></div>
  <div class="kz-telemetry__bar" role="progressbar" aria-label="魂火储量" aria-valuemin="0" aria-valuemax=${resource.capacity} aria-valuenow=${resource.soulFire}><i style=${`width:${fill*100}%`} /></div>
  <div class="kz-telemetry__stats"><span>契伤<b class="num">${number(debt)}</b></span><span>共享拒死<b class="num">${guard}</b></span></div>
  <footer title=${`总供火上限 ${number(resource.generationPerSecond)}/秒；本秒攻击剩余额度 ${number(resource.nativeGenerationAvailable)}；可伤敌 ${number(resource.attackAvailable)}；上次血卷/剑气支出 ${number(resource.lastWaveSpent)}；本轮表现 +${resource.pendingGrowth||0}`} >本秒可供火 ${number(resource.generationAvailable)}<span>衰减 ${((resource.decayRate||0)*100).toFixed(1)}%/秒</span></footer>
  <footer>本次花火 ${number(resource.lastWaveSpent)}<span>表现 <b class="num">+${resource.pendingGrowth||0}</b></span></footer>
 </aside>`;
}
