// Chrome shared by every in-match screen: the step header of the pre-game screens (exit + ping +
// difficulty | "1/2 确认本局信息" | countdown) and the exit flow (confirm with 暂离 / 放弃, AI 托管 overlay).
//
// 暂离: turns on AI 托管 (g.autoplay on) so the seat keeps playing; the header's 退出托管 turns it
// off. 放弃模拟: g.leave then room.leave (the platform treats it as a quit), back to the lobby.

import { useState, useLayoutEffect } from '../../vendor/hooks.module.js';
import { html, Button, Modal, PingPill, DifficultyTag, Countdown, MicroLabel } from './components.js';
import { actions } from './gameActions.js';
import { toastError } from './toasts.js';
import { net } from '../net.js';
import { store, useStore, shallowEqual, emptyMatch } from '../store.js';
import { awayStore, autoplayActive, lockAutoplayInput } from './autoplayState.js';
export { awayStore, awayEnds } from './autoplayState.js';
import { GuideButton } from './guide.js';

/**
 * Exit dialog lines. 放弃模拟 (g.leave → room.leave) ends the run on the server as 'abandoned' and returns to the
 * lobby straight away — no settlement screen follows, so the solo text must not promise one.
 */
export const EXIT_TEXT = Object.freeze({
  soloRest: '独立模拟的休整期没有时间限制，你可以随时继续。',
  soloQuit: '放弃模拟将立即结束本局并返回大厅，本局进度不会保留，也不会进行结算。',
});

/**
 * Leave the match for good (g.leave → room.leave), then drop local room/match state.
 * @returns {Promise<void>}
 */
export async function quitMatch() {
  try {
    try { await net.request('g.leave', {}); } catch (err) {
      if (err?.code !== 'NOT_IN_ROOM' && err?.code !== 'WRONG_PHASE' && err?.code !== 'OFFLINE') throw err;
    }
    try { await net.request('room.leave', {}); } catch (err) { if (err?.code !== 'NOT_IN_ROOM' && err?.code !== 'OFFLINE') throw err; }
  } catch (err) {
    toastError(err);
  } finally {
    store.set({ room: null, match: emptyMatch() });
  }
}

/**
 * Exit confirmation modal.
 * @param {{ open: boolean, onClose: Function, solo: boolean, onAway?: Function }} props
 */
export function ExitModal({ open, onClose, solo, onAway }) {
  const ranked = useStore(s => !!s.match.public?.ranked);
  const canAutoplay = useStore(s => s.match.private?.canAutoplay === true);
  const showAutoplay = (!solo && !ranked) || (ranked && canAutoplay);
  const [busy, setBusy] = useState(null);
  const quit = async () => {
    setBusy('quit');
    await quitMatch();
    setBusy(null);
    onClose();
  };
  const away = async () => {
    setBusy('away');
    const ok = await actions.autoplay(true);
    setBusy(null);
    onClose();
    if (ok && autoplayActive(store.get(), true)) { awayStore.set({ away: true }); onAway?.(); }
  };
  return html`<${Modal} open=${open} onClose=${onClose} tone="red" title="离开模拟" micro="LEAVE SIMULATION" width="6.8rem"
    actions=${html`
      <${Button} variant="secondary" onClick=${onClose}>取消<//>
      ${showAutoplay ? html`<${Button} variant="ice" icon="robot" loading=${busy === 'away'} onClick=${away}>暂离（AI 托管）<//>` : null}
      <${Button} variant="danger" icon="exit" loading=${busy === 'quit'} onClick=${quit}>放弃模拟<//>`}>
    <div class="exitm">
      ${ranked && showAutoplay ? html`<p><b class="t-ice">AI 托管</b>：代为操作你的席位，点击右上角「退出托管」可随时接管。托管按钮和状态仅你可见。</p>` : null}
      ${ranked ? html`<p>排位主线前主动放弃按本难度失败扣分，不能领取团队胜利分。${solo ? '单人放弃会进入单人排位冷却，仍可参加多人排位。' : '多人排位不设置冷却。'}正常淘汰后离开不算放弃。</p><p class="t-lo">断线可在 10 分钟内重连。主线已通关后退出保留主线胜利分。</p>` : solo
        ? html`<p>${EXIT_TEXT.soloRest}</p><p class="t-lo">${EXIT_TEXT.soloQuit}</p>`
        : html`<p><b class="t-ice">暂离</b>：由 AI 托管你的席位（自动部署、准备与选择），随时可以返回。</p>
               <p><b class="t-red">放弃模拟</b>：离开后无法返回本局，你的干员将回到共享卡池。</p>`}
    </div>
  <//>`;
}

/** Transparent input shield and the sole control, placed immediately before the header countdown. */
export function AwayOverlay({ onBack = () => {} }) {
  const away = useStore(s => s.away, Object.is, awayStore);
  const active = useStore(s => autoplayActive(s, away));
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => active ? lockAutoplayInput(window, document) : undefined, [active]);
  if (!active) return null;
  return html`<div class="autoplay-shield" aria-hidden="true"></div>
    <${Button} variant="ice" icon="robot" class="autoplay-exit" loading=${busy}
      onClick=${async () => { if (busy) return; setBusy(true); const ok = await actions.autoplay(false); setBusy(false); if (ok) { awayStore.set({ away: false }); onBack(); } }}>退出托管<//>`;
}

/**
 * Pre-game step header.
 * @param {{ step: number, of: number, title: string, micro: string, pub: any, total?: number|null, onExit: Function }} props
 */
export function StepHeader({ step, of, title, micro, pub, total, onExit }) {
  const conn = useStore((s) => s.connection, shallowEqual);
  return html`<header class="stephead">
    <div class="stephead__left">
      <${Button} variant="danger" size="lg" square=${true} icon="exit" onClick=${onExit} aria-label="离开" title="离开" />
      <div class="stephead__meta">
        <${PingPill} ms=${conn.ping} online=${conn.status === 'online'} />
        ${pub?.difficulty ? html`<${DifficultyTag} difficulty=${pub.difficulty} />` : null}
      </div>
    </div>
    <div class="stephead__center">
      <${MicroLabel} tone="mint">${micro}</${MicroLabel}>
      <h1 class="stephead__title"><b class="num">${step}</b><span class="num stephead__of">/${of}</span>${title}</h1>
    </div>
    <div class="stephead__right">
      <${GuideButton} class="stephead__guide" variant="secondary" />
      <${AwayOverlay} />
      <${Countdown} deadline=${pub?.deadline} total=${total ?? undefined} size="md" />
    </div>
  </header>`;
}

