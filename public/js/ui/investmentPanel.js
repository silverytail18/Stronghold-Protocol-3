import {useState,useEffect,useLayoutEffect} from '../../vendor/hooks.module.js';
import {html,Modal,Button} from './components.js';
import {act} from './gameActions.js';
import {PHASE} from '../../../shared/constants.js';
import {data} from '../data.js';
import {itemIconUrl} from './assetUrls.js';
import {InvestmentChart} from './investmentChart.js';
import {INVESTMENT_RULES} from '../../../shared/investment-math.js';
import {PRTS_ICON,MASTERY_ITEM_ID} from '../../../shared/skill-mastery.js';
const fmt=n=>Number(n||0).toLocaleString('zh-CN',{maximumFractionDigits:2});
const shownUnlocks=new Set();
export function InvestmentUnlockNotice({priv,phase}){
 const s=priv?.investment,key=s?.noticeKey,[visible,setVisible]=useState(false);
 useEffect(()=>{
  if(!key||s?.round!==INVESTMENT_RULES.firstRound||!priv?.alive||![PHASE.ROUND_START,PHASE.PREP].includes(phase))return;
  let seen=shownUnlocks.has(key);try{seen||=sessionStorage.getItem('investment-notice:'+key)==='1';}catch{}
  if(seen)return;shownUnlocks.add(key);try{sessionStorage.setItem('investment-notice:'+key,'1');}catch{}
  setVisible(true);
 },[key,s?.round,phase]);
 useEffect(()=>{if(!visible)return;const timer=setTimeout(()=>setVisible(false),4200);return()=>clearTimeout(timer);},[visible]);
 useEffect(()=>{if(s?.round!==INVESTMENT_RULES.firstRound||!priv?.alive||![PHASE.ROUND_START,PHASE.PREP].includes(phase))setVisible(false);},[s?.round,phase,priv?.alive]);
 return visible?html`<aside class="investment-unlock" role="status" aria-live="polite" data-testid="investment-unlock"><span class="investment-unlock__mark" aria-hidden="true">↗</span><div><small>GENIUS TRADER · R${INVESTMENT_RULES.firstRound}</small><strong>远行投资已开放</strong><span>结算：R${s.endRound} · Boss休整</span></div><button type="button" aria-label="关闭投资提醒" onClick=${()=>setVisible(false)}>×</button></aside>`:null;
}
export function InvestmentPanel({priv,phase}){
 const s=priv?.investment,[open,setOpen]=useState(false),[confirm,setConfirm]=useState(null),[busy,setBusy]=useState(false),[style,setStyle]=useState(s?.style||'normal'),[targetId,setTargetId]=useState(s?.targetId||s?.stocks?.[0]?.id);
 useLayoutEffect(()=>{setConfirm(null);if(phase!==PHASE.PREP)setOpen(false);},[phase,s?.closed]);
 useLayoutEffect(()=>{setConfirm(null);setStyle(s?.acted?s.style:'normal');setTargetId(s?.targetId||s?.stocks?.[0]?.id);},[s?.round]);
 const canFinance=!!s?.canInvest&&!s?.financing?.blocked&&(s?.financing?.quote?.collateral||0)>=20;
 useEffect(()=>{if(!canFinance)setStyle('normal');},[canFinance]);
 if(!s||!priv?.alive||phase!==PHASE.PREP)return null;
 const editable=!priv.ready&&!busy;
 // A checkbox is an unsubmitted draft. Never restore it as a locked server order.
 const close=()=>{setOpen(false);setConfirm(null);setStyle('normal');};
 const show=()=>{setConfirm(null);setStyle('normal');setTargetId(s.targetId||s.stocks?.[0]?.id);setOpen(true);};
 const submit=async action=>{if(busy)return;setBusy(true);try{const fields=action==='invest'?{action,style,targetId}:action==='normal'||action==='deep'?{action:'retrieve',kind:action}:{action};if(await act('g.investment',fields,{sfx:'confirm'}))setConfirm(null);}finally{setBusy(false);}};
 const target=s.stocks?.find(v=>v.id===targetId),holding=s.stocks?.find(v=>v.id===s.holdingTargetId);
 const reward=s.rewardId?data.lookup('items',s.rewardId):null;
 const r=s.retrieval,quote=confirm==='normal'||confirm==='deep'?r?.quotes?.[confirm]:null;
 const footer=html`<div class="investment-footer">
  ${confirm?html`<div class="investment-confirm" role="alert"><p>${confirm==='invest'?`确认投资「${target?.name||'我的标的'}」，追加全部 ${priv.funds} 金币？现有投资一并转入，本轮锁定且结算前不能收手。参考概率固定，后续资金选择仍会改变实际机会。${style==='leveraged'?`两倍敞口，融资费 ${s.financing.quote.fee} 金币；权益触及 ${s.financing.quote.line} 金币触发强平，本局禁用融资，按剩余权益结算并保留已锁定装备；之后可用自有金币重新投资。`: ''}`:quote?`确认${confirm==='deep'?'深度':'普通'}检索？立即扣除投资资产 ${quote.fee} 金币，成功率 ${(100*quote.chance).toFixed(0)}%，失败不退款；下轮结算前不能收手。`:'确认领取当前收益？本局将无法再次投资。'}</p><${Button} disabled=${!editable} onClick=${()=>submit(confirm)}>确认<//><${Button} disabled=${busy} onClick=${()=>setConfirm(null)}>取消<//></div>`:html`<div class="investment-actions">
   ${s.canInvest?html`<${Button} data-investment-action="invest" variant="primary" disabled=${!editable||!target?.tradable} onClick=${()=>setConfirm('invest')}>投资本股 · 全部金币<//>`:null}
   ${s.active?html`<${Button} data-investment-action="collect" disabled=${!editable||s.acted||!!r?.pending||!!s.financing?.pending} onClick=${()=>setConfirm('collect')}>收手并领取<//>`:null}
   ${s.rewardPending?html`<${Button} data-investment-action="claim" disabled=${!editable} onClick=${()=>submit('claim')}>领取暂存装备<//>`:null}
  </div>`}
 </div>`;
 return html`<button class="gm__gear investment-entry" type="button" onClick=${show} title="远行投资">远行${s.rewardId?' ◆':''}</button>
 <${Modal} open=${open} title=${html`<span>远行投资</span><button type="button" class="investment-close" aria-label="关闭远行投资" onClick=${close}><span aria-hidden="true">×</span></button>`} micro="EXPEDITION INVESTMENT" class="investment-modal" width="min(720px,94vw)" actions=${footer} onClose=${close}>
  <section class="investment-content" data-testid="investment-panel">
   <div class=${`investment-event investment-event--${s.event?.id||'normal'}`}><span>本轮市场</span><b>${s.event?.name||'常态市场'}</b>${s.event?.detail?html`<small>${s.event.targetName} · ${s.event.detail}</small>`:null}</div>
   <${InvestmentChart} stocks=${s.stocks||[]} holdingTargetId=${s.holdingTargetId} targetId=${targetId} round=${s.round} entryPrice=${s.position?.entryPrice} playerReturns=${s.playerReturns||[]} playerId=${s.selfPlayerId} canSelect=${editable&&s.canInvest&&!confirm} onTargetChange=${setTargetId}/>
   <div class="investment-target"><label>投资标的 <select aria-label="投资标的" value=${targetId||''} disabled=${!editable||!s.canInvest||!!confirm} onChange=${e=>setTargetId(e.currentTarget.value)}>${(s.stocks||[]).map(v=>html`<option value=${v.id} disabled=${!v.tradable}>${v.name}${!v.tradable?' · 停牌':''}</option>`)}</select></label><span>${s.acted?'本轮已锁定':holding?`当前持仓：${holding.name}`:'尚未持仓'}</span></div>
   ${(s.archiveOffers||[]).map(v=>html`<p class="investment-archive-event">科研协作 · R${v.investRound}投资罗德岛制药，股价涨幅≥30%且本人盈利，32.5%获得额外PRTS（本局限一份）</p>`)}
   <div class="investment-values"><span>累计投入<b>${fmt(s.principal)}</b></span><span>${s.closed?'已领取金币':'当前可领取'}<b>${fmt(s.closed?s.received:Math.floor(s.value))}</b></span><span>可用金币<b>${fmt(priv.funds)}</b></span></div>
   ${s.position?html`<p class="investment-position">本轮股份 ${Number(s.position.shares).toFixed(3)} · 成交基准 ${Number(s.position.entryPrice).toFixed(4)}${s.position.loan?` · 借款 ${fmt(s.position.loan)}`:''}</p>`:null}
   ${s.financing?.pending?html`<p class="investment-financing">融资中 · 2倍敞口 · 融资费 ${s.financing.pending.fee} 金币 · 强平线 ${s.financing.pending.line}</p>`:null}
   ${s.last?html`<p role="status">第${s.last.round}回合结算：${s.last.change>=0?'+':''}${fmt(s.last.change)}金币${s.last.liquidated?' · 已强平，剩余权益已保留，已锁定装备不丢失':''}${s.last.equipmentLost?(s.last.liquidated?' · 投资装备已作废':' · 普通装备已损失'):''}</p>`:null}
   ${reward?html`<div class="investment-reward"><img src=${itemIconUrl(data.get('assets'),reward)} alt=""/><span>${s.rewardTier===7?'已锁定':'保留装备'}：<b>${reward.name}</b></span></div>`:html`<p>保留装备：暂无</p>`}
   ${!s.closed&&!s.acted?html`<label class="investment-leverage"><input type="checkbox" data-style="leveraged" checked=${style==='leveraged'&&canFinance} disabled=${!editable||!canFinance||!!confirm} onChange=${e=>setStyle(e.currentTarget.checked?'leveraged':'normal')}/><span>融资杠杆 ×2 <small>${s.financing?.blocked?(s.financing.disabledByLiquidation?'曾触发强平 · 本局不可融资':'PRTS已解锁 · 本局不可融资'):`费用 ${s.financing?.quote?.fee||2} · 强平线 ${fmt(s.financing?.quote?.line)}`}</small></span></label>`:null}
   ${s.acted?html`<p class="investment-order-status" role="status">本轮${s.financing?.pending?'融资':''}投资已确认 · 下回合结算后可继续投资${s.financing?.pending?'，融资不会自动续借':''}</p>`:null}
   ${s.active&&!s.closed&&!s.acted?html`<p class="investment-idle-warning" role="status">本轮未投资，保留上轮结算资金；当前无股票持仓。</p>`:null}
   ${s.retrieval?.won&&s.rewardId!==MASTERY_ITEM_ID?html`<div class="investment-reward"><img src=${PRTS_ICON} alt=""/><b>PRTS档案 · 已锁定 · 本局不再获取</b></div>`:null}
   ${s.rewardId===MASTERY_ITEM_ID?html`<section class="investment-retrieval" aria-label="PRTS检索"><header><span>PRTS档案检索</span><b>${r?.won?'已锁定':r?.pending?'检索中':`${r?.used||0} / 3`}</b></header>
    ${r?.won?html`<div class="investment-reward"><img src=${PRTS_ICON} alt=""/><b>PRTS档案 · 额外奖励</b></div>`:r?.pending?html`<p>${r.pending.kind==='deep'?'深度':'普通'}检索 · 已支付 ${fmt(r.pending.fee)} 金币 · 下轮揭晓</p>`:r?.used>=3?html`<p>本局检索次数已用尽</p>`:html`<div class="investment-retrieval__options">${[['normal','普通检索'],['deep','深度检索']].map(([id,label])=>html`<button type="button" data-retrieval=${id} disabled=${!editable||!r?.canRequest||s.value-(r?.quotes?.[id]?.fee||0)<5} onClick=${()=>setConfirm(id)}><b>${label}</b><span>${fmt(r?.quotes?.[id]?.fee)} 金币</span></button>`)}</div>`}
   </section>`:null}
   <p class="investment-deadline">结算：R${s.endRound} · Boss休整</p>
   ${s.closed?html`<p>本局投资已结束${s.rewardPending?' · 装备待领取':''}</p>`:null}
  </section>
 <//>`;
}
