import {useEffect, useState} from '../../vendor/hooks.module.js';
import {html, Modal, Button} from './components.js';
import {RichText} from './gameComponents.js';
import {Countdown} from './components.js';
import {resolveSpCard} from './choiceOverlay.js';
import {act} from './gameActions.js';

/** Personal cards and deadlines come from m.private; never show another player's hand. */
export function ZhajingDraft({pub, priv, myId, sp, onPick, busyIdx}) {
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(null);
  const local = priv?.sp;
  const signature = local?.cards?.map(card => card.id).join('|');
  useEffect(() => setSelected(null), [signature, pub.round, local?.family]);
  if (!sp || !local) return null;
  const done = sp.pickOf.has(myId) || local.done;
  const mine = sp.turnPid === myId;
  const busy = busyIdx != null || refreshing != null;
  const canPick = !done && mine && !busy;
  const chosen = sp.cards.find(card => card.idx === selected && !card.takenBy);
  const choose = index => { if (canPick) { setSelected(null); onPick(index); } };
  const reroll = async index => {
    if (!canPick) return;
    setSelected(null); setRefreshing(index);
    try { await act('g.spReroll', {idx: index}); } finally { setRefreshing(null); }
  };
  return html`<${Modal} open=${true} class="zj-draft" title=${local.name || '惊变阶段'} onClose=${() => {}} width="min(1120px,96vw)"
    actions=${html`<span role="status">${done ? '已完成选择，等待队友' : mine ? '选择卡牌后确认' : '等待队友选择'}</span>
      ${!local.untimed && !done && local.turnDeadline > 0 ? html`<${Countdown} deadline=${local.turnDeadline} total=${local.turnSeconds || undefined} />` : null}
      <${Button} disabled=${!canPick || !chosen} onClick=${() => chosen && choose(chosen.idx)}>确认选择<//>`}>
    <p>${local.family === 'jibian' ? '每人独立三选一；每个选项本阶段可刷新一次。' : local.desc || '选择本次补给或挑战。'}</p>
    <div class="zj-card-grid">${sp.cards.map(card => {
      const rec = resolveSpCard(card, sp.family);
      return html`<article key=${card.idx} class=${`zj-draft-card ${selected === card.idx ? 'is-selected' : ''}`}>
        <button type="button" class="zj-draft-card__pick" data-zj-card=${card.idx} aria-pressed=${selected === card.idx} disabled=${!canPick || !!card.takenBy}
          onClick=${() => setSelected(card.idx)}><b>${rec.name}</b><${RichText} text=${rec.desc}/>
          ${card.rarity ? html`<small>${({normal:'普通',rare:'稀有',epic:'史诗',legend:'传说',hidden:'隐秘'})[card.rarity] || card.rarity}</small>` : null}
          ${card.bonds?.map(bond => html`<small>${bond.name} ${bond.have || 0}/${bond.need || bond.tiers?.[0] || ''}</small>`)}</button>
        ${local.family === 'jibian' ? html`<${Button} size="sm" variant="secondary" data-zj-reroll=${card.idx} disabled=${!canPick || card.rerolled} onClick=${() => reroll(card.idx)}>${card.rerolled ? '已刷新' : refreshing === card.idx ? '正在刷新…' : '刷新此选项'}<//>` : null}
      </article>`;
    })}</div>
  <//>`;
}
