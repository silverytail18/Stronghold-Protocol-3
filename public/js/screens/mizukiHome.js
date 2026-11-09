// Product entry and exploration profile. The waiting room reuses the shared RoomScreen.
import { html, Modal, Button, Icon } from '../ui/components.js';
import { useEffect, useRef, useState } from '../../vendor/hooks.module.js';
import { net } from '../net.js';
import { MIZUKI_VARIANT } from '../../../shared/mizuki-constants.js';
import { MizukiSetup } from '../ui/mizukiSetup.js';
import { DEFAULT_VERSION } from '../../../shared/versions.js';

function MizukiSetupFrame({ title, en, modeName, onBack, children }) {
 return html`<${Modal} open=${true} class="proto mz-setup-modal" veilClass="proto-veil" onClose=${onBack}>
 <div class="proto__body" style="--d-color:#8bc9ff"><div class="proto__bg" aria-hidden="true"></div>
 <header class="proto-top"><button class="proto-back" aria-label="返回玩法大厅" onClick=${onBack}><${Icon} name="chevronLeft"/><span class="proto-back__home"><${Icon} name="rook"/></span></button>
 <div class="proto-title"><h2 class="modal__title">${title}</h2><span class="proto-title__mode">${modeName}<i>${en}</i></span></div></header>${children}</div><//>`;
}

export function MizukiHome({ onClose, online }) {
  const [info, setInfo] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [grade, setGrade] = useState(0);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [history,setHistory] = useState(null);
  const [details,setDetails] = useState(false), [capacity,setCapacity] = useState(4);
  const pending = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/product/mizuki/profile', { cache: 'no-store', signal: controller.signal }).then(async response => {
      const value = await response.json(); if (!response.ok) throw Error(value.error || '探索资料暂时不可用'); setInfo(value);
    }).catch(failure => { if (failure.name !== 'AbortError') setError(failure.message); });
    return () => controller.abort();
  }, []);
  const run = async command => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await command(); onClose(); } catch (failure) { setError(failure.message); }
    finally { pending.current = false; setBusy(false); }
  };
  return html`<div class="mz-entry-host"><${MizukiSetup} Frame=${MizukiSetupFrame} onBack=${onClose} online=${online && !!info?.resourceReady && !info?.active} busy=${busy ? 'create' : null} grade=${grade} onGrade=${setGrade} capacity=${capacity} onCapacity=${setCapacity}
    onCreate=${() => run(() => net.request('room.create', { mode:'coop', difficulty:'NORMAL', version:DEFAULT_VERSION, variant:MIZUKI_VARIANT, mizukiDifficultyGrade:grade, capacity }))}
    extra=${html`<div class="mz-setup-status"><button type="button" class="mz-profile-open" onClick=${()=>setDetails(true)}>${info?.active ? '继续探索 / 查看存档' : '探索记录与恢复说明'}</button>${error ? html`<p role="alert">${error}</p>` : null}${info && !info.resourceReady ? html`<p>探索素材尚未就绪，请先安装水月资源更新。</p>` : null}</div>`}/>
  ${details ? html`<${Modal} open=${true} class="mz-home-modal" onClose=${()=>setDetails(false)} title="水月与深蓝之树" micro="MIZUKI & CAERULA ARBOR" width="min(1000px,96vw)" actions=${html`<${Button} onClick=${()=>setDetails(false)}>返回难度选择<//>`}>
    <section class="mz-home">
      <div class="mz-home__ocean"><span>INTO THE BLUE</span><h2>向深蓝，再进一步。</h2><p>与一至四位博士共同探索，在分岔航线中收集藏品、招募干员，迎接海潮深处的结局。</p></div>
      <div class="mz-home__content">
        <p>备战阶段布阵，作战自动进行。途中可分队探索、会合与联防；本玩法使用独立记录。</p>
        <dl class="mz-home__stats"><div><dt>深海细胞</dt><dd>${info?.profile?.cells ?? '—'}</dd></div><div><dt>探索评分</dt><dd>${info?.profile?.score ?? '—'}</dd></div><div><dt>认知塑造</dt><dd>全部启用</dd></div><div><dt>投资余额</dt><dd>${info?.profile?.bank?.current ?? '—'}</dd></div></dl>
        ${info && !info.resourceReady ? html`<p class="mz-home__error" role="status">探索素材尚未就绪，请等待管理员安装水月资源更新后再下潜。</p>` : null}
        ${error ? html`<p role="alert" class="mz-home__error">${error}</p>` : null}
        ${info?.active ? html`<div class="mz-home__continue"><h3>未完成的探索 · N${info.active.difficultyGrade}</h3><p>${info.active.status === 'suspended' ? '进度已保存，邀请原成员后可继续。战斗中的进度会回到该场备战阶段。' : '探索仍在进行，可通过大厅的进行中房间返回。'}</p>
          <${Button} disabled=${busy || !online || !info.resourceReady || info.active.status !== 'suspended'} loading=${busy} onClick=${() => run(() => net.request('room.mizukiResume', { runId: info.active.id }))}>继续探索<//>
          <${Button} variant="secondary" disabled=${busy || !online || info.active.status !== 'suspended'} onClick=${() => setConfirmAbandon(true)}>放弃并结算<//>
          ${confirmAbandon ? html`<div role="alert"><p>仅结束你本人的探索参与，结算已完成节点的评分。其他原成员仍可继续，此操作无法撤销。</p><${Button} variant="danger" disabled=${busy} onClick=${() => run(() => net.request('room.mizukiAbandon', {runId:info.active.id}))}>确认放弃<//><${Button} variant="secondary" onClick=${() => setConfirmAbandon(false)}>返回<//></div>` : null}</div>`
          : null}
        <details class="mz-home__help"><summary>探索规则与恢复说明</summary><p>备战时选择编队并安排位置和朝向，全队准备后自动作战。招募消耗希望，航线与事件由队伍选择；首领阶段需要会合。探索评分、深海细胞及投资独立记录，不计入排位。</p><p>认知效果在本局全部启用，累计细胞按实际探索结算。中断的战斗恢复到该场备战；已经提交的支援干预会按原记录重放。</p></details>
        <details class="mz-home__help" onToggle=${event=>{if(event.currentTarget.open&&history===null)fetch('/product/mizuki/history',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('探索记录暂不可用');return r.json();}).then(v=>setHistory(v.records||[])).catch(e=>setError(e.message));}}><summary>最近探索记录</summary>
          ${history===null?html`<p>展开后读取记录。</p>`:!history.length?html`<p>尚无已结算的探索。</p>`:history.map(record=>html`<article><b>${record.victory?'探索完成':'探索结束'}</b><p>节点 ${record.completedNodes??0} · 评分 ${record.personal?.mizuki?.explorationScore??0} · 细胞 ${record.personal?.mizuki?.cellPoints??0}</p></article>`)}
        </details>
      </div>
    </section>
  <//>` : null}</div>`;
}

