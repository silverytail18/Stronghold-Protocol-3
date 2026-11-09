import {useState} from '../../vendor/hooks.module.js';
import {html,Button} from './components.js';import {t} from '../../../shared/i18n.js';
import {Modal} from './components.js';
import {useStore} from '../store.js';
import {act} from './gameActions.js';
export function AdminOperatorTools(){
  const tools=useStore(s=>s.match?.private?.adminOperators),[open,setOpen]=useState(false),[pending,setPending]=useState(false);
  if(!tools)return null;
  const send=async(type,args)=>{setPending(true);try{await act(type,args);}finally{setPending(false);}};
  return html`<button type="button" class="gm__gear investment-entry" onClick=${()=>setOpen(true)} title=${t('管理员测试领取')}>${t('测试领取')}</button><${Modal} open=${open} title=${t('管理员测试领取')} width="min(720px,94vw)" onClose=${()=>setOpen(false)} actions=${html`<${Button} onClick=${()=>setOpen(false)}>${t('关闭')}<//>`}><${AdminOperators} tools=${tools} pending=${pending} send=${send}/><//>`;
}
export function AdminOperators({tools,pending,send}){
  const [selected,setSelected]=useState({});if(!tools)return null;
  return html`<section><h3>${t('管理员测试领取')}</h3><p>${t('仅第一回合休整期向本人发放，普通与精锐每名选一种；本局仅可领取一次。')}</p>
    ${tools.available===false?html`<p role="status">${t('请先在账号后台的测试包设置中允许管理员测试领取。')}</p>`:null}
    ${!tools.catalog.length?html`<p role="status">${t('本局没有可领取的测试包干员。')}</p>`:null}
    <label><input type="checkbox" checked=${tools.enabled} disabled=${pending||!tools.canToggle} onChange=${e=>send('g.adminOperatorsEnabled',{enabled:e.target.checked})}/>${t('开启本人快捷领取')}</label>
    ${tools.enabled&&!tools.claimed?html`<div class="product-admin-operators">${tools.catalog.map(c=>html`<label><span>${c.name}</span><select value=${selected[c.baseId]||''} disabled=${pending||!tools.canToggle} onChange=${e=>setSelected({...selected,[c.baseId]:e.target.value})}><option value="">${t('不领取')}</option><option value="normal">${t('普通')}</option><option value="elite">${t('精锐')}</option></select></label>`)}</div><${Button} disabled=${pending||!tools.canToggle||!Object.values(selected).some(Boolean)} onClick=${()=>send('g.adminOperatorsClaim',{selections:Object.entries(selected).filter(([,v])=>v).map(([baseId,v])=>({baseId,elite:v==='elite'}))})}>${t('领取所选干员')}<//>`:null}
    ${tools.claimed?html`<p>${t('本局已领取')}</p>`:null}
  </section>`;
}
