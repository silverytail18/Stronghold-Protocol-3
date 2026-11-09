import {html} from './components.js';
import {t} from '../../../shared/i18n.js';
const number=v=>Math.max(0,Number.isFinite(v)?v:0);
const integer=v=>Math.floor(number(v)).toLocaleString();
const seconds=v=>number(v).toFixed(1)+'s';
export function covenantResource(bondId,hud,ownerId,priv=null){
  const key={kazdelShip:'kazdel',higashiShip:'higashi',iberiaShip:'iberia',ursusShip:'ursus'}[bondId];
  if(!key)return null;
  const live=hud?.[key]?.find(row=>row.playerId===ownerId);
  const state=live||(key==='ursus'&&priv?.playerId===ownerId?priv.ursusDomain:null);
  return state?{panel:key,state}:null;
}
function Gauge({name,value,max=100}){
  const n=number(value),cap=Math.max(1,number(max));
  return html`<div class="covenant-resource-gauge"><label>${name}<b>${integer(n)} / ${integer(cap)}</b></label><progress aria-label=${name} value=${Math.min(n,cap)} max=${cap}/></div>`;
}
function Row({label,value}){return html`<div><dt>${label}</dt><dd>${value}</dd></div>`;}
// Values come only from the displayed field's snapshot. No independent wall-clock timer or client resource model.
export function CovenantResources({panel,state}){
  if(!state)return null;
  const row=(label,value)=>html`<${Row} label=${label} value=${value}/>`;
  if(panel==='kazdel'){
    const guard=!state.guardEnabled?t('九人解锁'):state.guardRemaining>0?seconds(state.guardRemaining):state.soulFire>=state.guardThreshold?t('就绪'):t('待魂火');
    return html`<section class="covenant-resources" data-testid="kazdel-resource"><h3>${t('魂契实时状态')} · ${integer(state.layers)} ${t('层')}</h3>
      <${Gauge} name=${t('魂火')} value=${state.soulFire} max=${state.capacity}/><dl>
      ${row(t('契伤'),integer((state.debts||[]).reduce((sum,r)=>sum+number(r.amount),0)))}${row(t('共享拒死'),guard)}
      ${row(t('本秒可供火'),integer(state.generationAvailable))}${row(t('原生供火余额'),integer(state.nativeGenerationAvailable))}
      ${row(t('血卷／剑气冷却'),seconds(state.releaseRemaining))}${row(t('共鸣剩余'),seconds(state.resonanceRemaining))}
      ${row(t('本次花火'),integer(state.lastWaveSpent))}${row(t('本轮成长'),`+${integer(state.pendingGrowth)}`)}</dl></section>`;
  }
  if(panel==='higashi'){
    const windows=(state.windows||[]).filter(r=>r.remaining>0),left=windows.reduce((sum,r)=>sum+number(r.left),0);
    return html`<section class="covenant-resources" data-testid="higashi-resource"><h3>${t('东国实时状态')} · ${integer(state.layers)} ${t('层')}</h3>
      <${Gauge} name=${t('刀势')} value=${state.stance}/>${state.tier>=2?html`<${Gauge} name=${t('奥义')} value=${state.ultimate}/>`:html`<p>${t('奥义六人解锁')}</p>`}
      <dl>${row(t('拔刀冷却'),seconds(state.cooldown))}${row(t('待发斩击'),integer(left))}
      ${row(t('架势就绪'),`${integer(state.guards?.ready)} / ${integer(state.guards?.total)}`)}
      ${row(t('奥义状态'),state.ultimateCasting?t('蓄势中'):state.ultimateCooldown>0?seconds(state.ultimateCooldown):t('就绪'))}
      ${state.duel?row(t('见切'),`${integer(state.duel.cuts)} / ${integer(state.duel.cap)}`):null}
      ${state.duel?row(t('连太刀剩余'),seconds(state.duel.combo)):null}</dl></section>`;
  }
  if(panel==='iberia')return html`<section class="covenant-resources" data-testid="iberia-lighthouse"><h3>${t('伊比利亚守望灯塔')} · ${integer(state.layers)} ${t('层')}</h3>
    <${Gauge} name=${t('灯火')} value=${state.fuel} max=${24}/><dl>
    ${row(t('长明'),state.sunPermanent?t('本场持续'):state.sunRemaining>0?seconds(state.sunRemaining):t('未开启'))}
    ${row(t('已点灯次数'),integer(state.metrics?.lights))}${row(t('审判标记'),integer(state.marks?.length))}
    ${row(t('待决审判'),integer(state.pending?.length))}${row(t('长明脉冲倒计时'),seconds(state.sunPulseRemaining))}</dl></section>`;
  if(panel==='ursus')return html`<section class="covenant-resources" data-testid="ursus-resource"><h3>${t('乌萨斯国度')} · ${integer(state.layers)} ${t('层')}</h3><dl>
    ${row(t('覆盖格数'),integer(state.area))}${row(t('最高国度重数'),integer(Math.max(0,...(state.cells||[]).map(c=>c[2]))))}
    ${'cooldown' in state?row(t('处决冷却'),seconds(state.cooldown)):null}
    ${'resolveIn' in state?row(t('处决蓄势剩余'),seconds(state.resolveIn)):null}
    ${state.metrics?row(t('本场处决次数'),integer(state.metrics.casts)):null}
    ${state.metrics?row(t('本场处决击杀'),integer(state.metrics.kills)):null}</dl><p>${t('地图数字表示国度重数，战斗开始后固定，本场不会随阵亡或移动重新计算。')}</p></section>`;
  return null;
}
