// Round counters and chart adapted from Emi to the current modal contract.
import { t as trA } from '../../shared/i18n.js';
import { useState, useRef, useEffect, useLayoutEffect } from '../vendor/hooks.module.js';
import { html, Modal } from './ui/components.js';
import { UnitThumb } from './ui/gameComponents.js';
import { battleRunner } from './battle/runner.js';

export function RoundDamageModal({ open, onClose, round, ownerIds, getRows = null, Thumb = UnitThumb }) {
  const [sample, setSample] = useState({ round: null, owners: '', rows: [] });
  const panelRef = useRef(null), closeRef = useRef(onClose), rowsRef = useRef(getRows);
  closeRef.current = onClose;
  rowsRef.current = getRows;
  const owners = ownerIds ? JSON.stringify(ownerIds) : '';
  useEffect(() => {
    if (!open) return;
    const ids = owners ? JSON.parse(owners) : null;
    const refresh = () => setSample({ round, owners,
      rows: (rowsRef.current ? rowsRef.current(round, ids) : battleRunner?.roundDamage(round, ids)) || [] });
    refresh();
    const timer = setInterval(refresh, 200);
    return () => clearInterval(timer);
  }, [open, round, owners]);
  useLayoutEffect(() => {
    if (!open) return;
    const outside = (e) => {
      const panel = panelRef.current;
      if (!panel || panel.contains(e.target) || e.target.closest?.('.gm__damage')) return;
      closeRef.current?.();
    };
    const escape = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault(); e.stopImmediatePropagation(); closeRef.current?.();
    };
    window.addEventListener('pointerdown', outside, true);
    window.addEventListener('keydown', escape, true);
    return () => { window.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', escape, true); };
  }, [open]);
  const rows = sample.round === round && sample.owners === owners ? sample.rows : [];
  const scale = Math.max(1, ...rows.map((r) => r.total));
  const number = (n) => Math.round(n).toLocaleString('zh-CN');
  if (!open) return null;
  return html`<${Modal} open=${open} onClose=${onClose} title=${trA("伤害统计")} width="8rem"><aside ref=${panelRef} class="dpanel brackets round-damage" role="dialog" aria-label=${trA("本回合伤害统计")}>
    <header class="sp-detail-head"><span>${trA("伤害统计")} · ${round || 0}</span></header>
    <div class="dpanel__scroll" tabindex="0">
    <div class="round-damage__legend">
      <span><i class="round-damage__phys"></i>${trA("物理")}</span>
      <span><i class="round-damage__arts"></i>${trA("法术")}</span>
      <span><i class="round-damage__other"></i>${trA("元素及其他")}</span>
    </div>
    <p class="round-damage__note" title=${trA("含本回合联防、所属召唤物；元素损伤与元素伤害均计入灰色部分。换回合清零。")}>${trA("含召唤物 · 换回合清零")}</p>
    <div class="round-damage__heading"><span>${trA("干员")}</span><span>${trA("伤害构成")}</span><span>${trA("总伤害")}</span></div>
    ${rows.length ? rows.map((r) => html`<div key=${r.key} class="round-damage__row">
      <${Thumb} kind=${r.kind} id=${r.id} rec=${r.rec} skin=${r.skin} size="sm" showTier=${false} title=${r.name} />
      <div class="round-damage__chart">
        <span class="round-damage__name">${r.name}</span>
        <div class="round-damage__track" role="img" aria-label=${`${r.name}：物理 ${number(r.phys)}，法术 ${number(r.arts)}，元素及其他 ${number(r.other)}，总伤害 ${number(r.total)}`}>
          <div class="round-damage__bar" style=${`width:${r.total / scale * 100}%`}>
            <i class="round-damage__phys" style=${`flex:${r.phys} 1 0%`} title=${`${trA("物理")} ${number(r.phys)}`}></i>
            <i class="round-damage__arts" style=${`flex:${r.arts} 1 0%`} title=${`${trA("法术")} ${number(r.arts)}`}></i>
            <i class="round-damage__other" style=${`flex:${r.other} 1 0%`} title=${`${trA("元素及其他")} ${number(r.other)}`}></i>
          </div>
        </div>
      </div>
      <span class="round-damage__total num">${number(r.total)}</span>
    </div>`) : html`<p class="round-damage__empty">${trA("本回合暂无战斗伤害记录")}</p>`}
    </div>
  </aside><//>`;
}

