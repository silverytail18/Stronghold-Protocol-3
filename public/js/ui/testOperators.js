import {useState} from '../../vendor/hooks.module.js';
import {html,Button,Modal} from './components.js';
import {UnitThumb} from './gameComponents.js';
import {actions} from './gameActions.js';
/** Permission and availability come exclusively from the owner's server-private view. */
export function TestOperators({state}){
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[choices,setChoices]=useState({});
  if(!state||state.claimed)return null;
  const rows=state.catalog||[],selections=rows.filter(r=>Object.hasOwn(choices,r.baseId)).map(r=>({baseId:r.baseId,elite:choices[r.baseId]}));
  const claim=async()=>{if(busy||!selections.length)return;setBusy(true);try{if(await actions.testOperators(selections))setOpen(false);}finally{setBusy(false);}};
  const toggle=async()=>{if(busy)return;setBusy(true);try{if(await actions.testOperatorsEnabled(!state.enabled))setOpen(false);}finally{setBusy(false);}};
  const select=(id,elite)=>setChoices({...choices,[id]:elite});
  const clear=id=>{const next={...choices};delete next[id];setChoices(next);};
  const cell=(row,elite)=>html`<td><label class=${`test-operators-option ${Object.hasOwn(choices,row.baseId)&&choices[row.baseId]===elite?'is-selected':''}`}>
    <input type="radio" name=${`test-op-${row.baseId}`} data-operator=${row.baseId} data-elite=${String(elite)} checked=${Object.hasOwn(choices,row.baseId)&&choices[row.baseId]===elite} disabled=${busy||!state.available} onChange=${()=>select(row.baseId,elite)} aria-label=${`${row.name} ${elite?'精锐':'普通'}`} />
    <${UnitThumb} id=${elite?row.eliteId:row.normalId} golden=${elite} size="sm" showTier=${false} /><span>${elite?'精锐':'普通'}</span>
  </label></td>`;
  return html`<div class="test-operators-controls" style="display:flex;flex-direction:column;gap:.04rem">
    <${Button} class="test-operators-enable" variant=${state.enabled?'ice':'secondary'} size="sm" aria-pressed=${!!state.enabled}
      disabled=${!state.canToggle||busy} onClick=${toggle}>快捷领取：${state.enabled?'开':'关'}<//>
    ${state.enabled?html`<${Button} class="test-operators" variant="ice" size="sm" disabled=${!state.available||busy} onClick=${()=>{setChoices({});setOpen(true);}}>领取测试干员<//>`:null}
    </div>
    <${Modal} open=${open} onClose=${()=>!busy&&setOpen(false)} title="测试干员领取" micro="ADMIN TEST" width="7.4rem"
      actions=${html`<${Button} variant="secondary" disabled=${busy} onClick=${()=>setOpen(false)}>取消<//>
        <${Button} class="test-operators-confirm" variant="primary" loading=${busy} disabled=${busy||!state.available||!selections.length} onClick=${claim}>确定发放${selections.length?`（${selections.length}名）`:''}<//>`}>
      <p>每名干员选择普通、精锐或不领取，选好后统一发放。每局只能确认一次，请在整备区空出${selections.length||'相应数量的'}个位置。</p>
      <div class="test-operators-table-scroll"><table class="test-operators-table"><thead><tr><th scope="col">干员</th><th scope="col">普通</th><th scope="col">精锐</th><th scope="col">不领取</th></tr></thead>
        <tbody>${rows.map(row=>html`<tr key=${row.baseId}><th scope="row">${row.name}</th>${cell(row,false)}${cell(row,true)}<td><button type="button" class="test-operators-clear" disabled=${busy||!Object.hasOwn(choices,row.baseId)} onClick=${()=>clear(row.baseId)}>取消选择</button></td></tr>`)}</tbody>
      </table></div>
      <p>仅第一回合休整期开放。位置不足时整次不发放，可腾出位置后重新确认。</p>
      <p>测试副本不消耗共享库存，不能出售或参与普通合成；可以正常部署和装备。出战与排位计分沿用本局规则。</p>
    <//>`;
}
