import {useEffect,useState} from '../../vendor/hooks.module.js';
import {html,Button,Modal} from './components.js';
import {useStore} from '../store.js';
import {net} from '../net.js';
import {toastError} from './toasts.js';
import {TECHNOLOGIES,qualifies} from '../../../shared/rhine.js';
import {PHASE} from '../../../shared/constants.js';
import {t} from '../../../shared/i18n.js';
import {RuleMusicSettings} from './ruleMusicSettings.js';
export function ProductGameplay(){
  const state=useStore(s=>s),pub=state.match?.public,priv=state.match?.private;
  const [panel,setPanel]=useState('all'),[open,setOpen]=useState(false),[pending,setPending]=useState(false),[region,setRegion]=useState(null);
  useEffect(()=>{setRegion(null);},[pub?.round,priv?.playerId,state.me?.playerId]);
  const editable=pub?.phase===PHASE.PREP&&priv?.alive!==false&&!priv?.ready&&!priv?.autoplay;
  const send=async(type,args={})=>{setPending(true);try{await net.request(type,args);}catch(error){toastError(error);}finally{setPending(false);}};
  const rhine=priv?.rhine;
  if(!priv)return null;const entries=[...(rhine?[['rhine',t('莱茵科技')]]:[]),...(pub?.musicMode==='coop'?[['music',t('规则音乐')]]:[])];if(!entries.length)return null;
  return html`<div class="product-panel-entries">${entries.map(([id,label])=>html`<${Button} size="sm" variant="secondary" onClick=${()=>{setPanel(id);setOpen(true);}}>${label}<//>`)}</div>
    ${open?html`<${Modal} open=${true} title=${entries.find(([id])=>id===panel)?.[1]||t('定制玩法')} micro="CONTENT" width="min(900px,94vw)" onClose=${()=>setOpen(false)} actions=${html`<${Button} onClick=${()=>setOpen(false)}>${t('关闭')}<//>`}>
      <div class="product-gameplay">
      ${rhine&&panel==='rhine'?html`<section><header class="emi-research-head"><small>RHINE / RESEARCH</small><h3>${t('莱茵研究')} · ${rhine.availablePoints}/${rhine.totalPoints}</h3><progress max=${Math.max(1,rhine.totalPoints)} value=${rhine.availablePoints}/></header><p>${t('在场人数')} ${rhine.count} · ${t('科技点')} ${rhine.availablePoints}</p>
        <div class="product-tech-list">${TECHNOLOGIES.map(tech=>{const studied=rhine.research.includes(tech.id),active=rhine.active.includes(tech.id);return html`<article key=${tech.id} class=${studied?'is-studied':''}><strong>${t(tech.name)} ${studied?(active?'✓':'—'):''}</strong><p>${t(tech.effect)}</p><small>${t('人数')} ${tech.count} · ${t('消耗')} ${tech.cost} · ${tech.pre.map(id=>t(TECHNOLOGIES.find(x=>x.id===id)?.name||id)).join(' / ')}</small><div class="product-actions">
          ${!studied?html`<${Button} size="sm" disabled=${pending||!editable||rhine.count<tech.count||rhine.availablePoints<tech.cost||!tech.pre.every(id=>qualifies(id,rhine.research,rhine.count))} onClick=${()=>send('g.rhineResearch',{id:tech.id})}>${t('研究')}<//>`:tech.region?html`<${Button} size="sm" variant="secondary" disabled=${!editable||pending||!active} onClick=${()=>setRegion(region===tech.id?null:tech.id)}>${t('设置区域')} · ${(rhine.positions[tech.id]||[]).map(p=>p.join(',')).join(' / ')}<//>`:null}
        </div>${region===tech.id?html`<p>${t('点击格子切换所选位置，再次点击可移除。')}</p><div class="product-region-grid">${rhine.grid.map(cell=>{const positions=rhine.positions[tech.id]||[],selected=positions.some(p=>p[0]===cell.position[0]&&p[1]===cell.position[1]),occupied=Object.entries(rhine.positions).some(([id,ps])=>id!==tech.id&&ps.some(p=>p[0]===cell.position[0]&&p[1]===cell.position[1])),max=['T01','T02','T04'].includes(tech.id)&&qualifies('T09',rhine.research,rhine.count)?2:1;return html`<button type="button" class=${selected?'is-selected':''} disabled=${pending||!editable||!cell.legalFor.includes(tech.id)||occupied||!selected&&positions.length>=max} onClick=${()=>send('g.rhinePositions',{id:tech.id,positions:selected?positions.filter(p=>p[0]!==cell.position[0]||p[1]!==cell.position[1]):[...positions,cell.position]})}>${cell.position.join(',')}</button>`;})}</div><${Button} size="sm" variant="ghost" disabled=${pending||!editable} onClick=${()=>send('g.rhinePositions',{id:tech.id,positions:[]})}>${t('清空区域')}<//>`:null}</article>`;})}</div>
        <${Button} variant="secondary" disabled=${pending||!editable||rhine.respecUsed} onClick=${()=>send('g.rhineReset')}>${t('重置研究（每局一次）')}<//></section>`:null}
      ${panel==='music'?html`<${RuleMusicSettings}/>`:null}
      </div>
    <//>`:null}`;
}
