// Rank milestone name cards. No new art: each card reuses an existing avatar frame/namecard look,
// and every card is unlocked permanently by the current or the recorded peak division.
import { isRankDivisionAtLeast } from './emi-ranks.js';

export const BASE_NAMECARDS = Object.freeze(['standard', 'covenant', 'night']);

// Ordered from the lowest milestone to the highest; the order is the picker order.
export const RANK_MILESTONE_CARDS = Object.freeze([
  Object.freeze({ id: 'milestone_gold', division: 'gold', label: '黄金纪念', frame: 'gold' }),
  Object.freeze({ id: 'milestone_platinum', division: 'platinum', label: '白金纪念', frame: 'silver' }),
  Object.freeze({ id: 'milestone_diamond', division: 'diamond', label: '钻石纪念', frame: 'mint' }),
  Object.freeze({ id: 'milestone_ascendant', division: 'ascendant', label: '超凡纪念', frame: 'rose' }),
  Object.freeze({ id: 'milestone_immortal', division: 'immortal', label: '神话纪念', frame: 'gold' }),
]);

const BY_ID = new Map(RANK_MILESTONE_CARDS.map((card) => [card.id, card]));

export const isMilestoneNameCard = (id) => BY_ID.has(id);
export const milestoneNameCard = (id) => BY_ID.get(id) || null;

/**
 * Permanent unlocks from the server-owned current rank and the recorded peak.
 * @param {{rank?: {division?: string|null}, peakRank?: {division?: string|null}}|null} profile
 * @returns {string[]}
 */
export function unlockedRankNameCards(profile) {
  if (!profile) return [];
  const current = profile.rank?.division || null;
  const peak = profile.peakRank?.division || null;
  return RANK_MILESTONE_CARDS
    .filter((card) => isRankDivisionAtLeast(current, card.division) || isRankDivisionAtLeast(peak, card.division))
    .map((card) => card.id);
}

/** A base card is always available; a milestone card only after it was earned. */
export function canUseNameCard(profile, id) {
  if (BASE_NAMECARDS.includes(id)) return true;
  return isMilestoneNameCard(id) && unlockedRankNameCards(profile).includes(id);
}
