import { html } from './components.js';
import { rankOf } from '../../../shared/ranked.js';
import { appArtUrl } from '../appResources.js';
export const RANK_ICONS = ['bronze','silver','gold','platinum','diamond','master','legend'];
export function RankBadge({ rank, points, large = false }) {
  if (!rank && points == null) return null;
  const r = rankOf(Number.isFinite(points) ? points : Number(rank?.points) || 0);
  return html`<span class=${`rank-badge rank-badge--${RANK_ICONS[r.tier]}${large ? ' rank-badge--large' : ''}`} title=${`${r.label} · ${r.points} 分`}>
    <img src=${appArtUrl(`/icons/ranks/${RANK_ICONS[r.tier]}.svg`)} alt=${r.label} width="32" height="32" />
    ${r.division ? html`<small aria-hidden="true">${r.division}</small>` : null}
  </span>`;
}
