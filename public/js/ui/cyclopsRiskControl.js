// Mode-only active gift controls, shared by both GameScreen entry points through ShopBar.
import { useEffect, useLayoutEffect, useRef, useState } from '../../vendor/hooks.module.js';
import { render } from '../../vendor/preact.module.js';
import { html, Modal, Button } from './components.js';
import { data } from '../data.js';
import { t } from '../../../shared/i18n.js';

// The scaled shop is not a viewport containing block: mount its modal at body level.
function RiskDialogPortal({ children }) {
  const root = useRef(null);
  useLayoutEffect(() => {
    const node = document.createElement('div');
    document.body.appendChild(node); root.current = node;
    return () => { render(null, node); node.remove(); root.current = null; };
  }, []);
  useLayoutEffect(() => { if (root.current) render(children, root.current); });
  return null;
}

export function CyclopsRiskControl({ priv, editable, onRisk }) {
  const [open, setOpen] = useState(false), [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const state = priv?.cyclopsRisk;
  useEffect(() => { setOpen(false); setChoice(''); }, [state?.round, editable]);
  if (!state || !onRisk) return null;
  const sacrifice = state.sacrifice, blood = state.blood;
  const canSacrifice = editable && sacrifice && !sacrifice.used && sacrifice.candidates.length > 0;
  const canBlood = editable && blood && !blood.used && blood.remaining > 0 && blood.affordable;
  const unit = sacrifice?.candidates.find(p => String(p.uid) === choice);
  const selected = choice === 'blood' ? canBlood : canSacrifice && unit;
  const submit = async () => {
    if (!selected || pending.current) return;
    pending.current = true; setBusy(true);
    try { if (await onRisk(choice === 'blood' ? null : unit.uid)) { setOpen(false); setChoice(''); } }
    finally { pending.current = false; setBusy(false); }
  };
  return html`<span class="cyc-risk">
    <button type="button" class="toolbtn toolbtn--amber cyc-risk__open" disabled=${!canSacrifice && !canBlood}
      onClick=${() => { setChoice(''); setOpen(true); }}>${t('赌徒行动')}</button>
    <${RiskDialogPortal}><${Modal} open=${open && editable} class="cyc-risk-dialog" title=${t('赌徒行动')} width="min(540px, 94vw)" onClose=${() => setOpen(false)}
      actions=${html`<${Button} onClick=${() => setOpen(false)}>${t('取消')}<//>
        <${Button} class="cyc-risk__confirm" variant="primary" disabled=${!selected || busy} onClick=${submit}>${t('确认执行')}<//>`}>
      <p>${t('每种行动每回合限一次，确认后立即生效。')}</p>
      ${sacrifice ? html`<label class="cyc-risk__field">${t('牺牲干员（装备返还）')}
        <select class="cyc-risk__select" disabled=${!canSacrifice || busy} value=${choice} onChange=${e => setChoice(e.currentTarget.value)}>
          <option value="">${t('选择要牺牲的干员')}</option>
          ${sacrifice.candidates.map(p => html`<option key=${p.uid} value=${String(p.uid)}>${t('{name} · 编号 {uid} · 获得 {gain} 金币', {name: data.lookup('chess', p.id)?.name || p.id, uid: p.uid, gain: p.gain})}</option>`)}
        </select><small>${t('可用至第 {round} 回合', {round: sacrifice.until})}${sacrifice.used ? t(' · 本回合已使用') : ''}</small>
      </label>` : null}
      ${blood ? html`<div class="cyc-risk__field"><button type="button" class="toolbtn cyc-risk__blood" aria-pressed=${choice === 'blood'} disabled=${!canBlood || busy} onClick=${() => setChoice('blood')}>
        ${t('消耗 {cost} 生命，获得 {gain} 金币', {cost: blood.cost, gain: blood.gain})}</button>
        <small>${t('整局剩余 {n} 次', {n: blood.remaining})}${blood.used ? t(' · 本回合已使用') : ''}</small></div>` : null}
      <p role="status">${selected ? choice === 'blood'
        ? t('确认将扣除 {cost} 生命。', {cost: blood.cost})
        : t('确认将移除所选干员，获得 {gain} 金币。', {gain: unit.gain}) : t('请先选择行动，再点击确认执行。')}</p>
    <//><//>
  </span>`;
}
