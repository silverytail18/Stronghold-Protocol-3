// Rank milestone name cards: permanent, local "seen" bookkeeping for the unlock notice.
// The server publishes `unlockedNameCards` on the rank profile; this module only decides whether
// the current browser has already shown the notice for that account.
import { RANK_MILESTONE_CARDS } from '../../../shared/nameCards.js';
import { loadPref, savePref } from '../store.js';

const milestone = new Map(RANK_MILESTONE_CARDS.map((card) => [card.id, card]));
const seenKey = (accountId) => `rankNameCards.seen.${accountId}`;

export function rankNameCardLabel(id) {
  return milestone.get(id)?.label || id;
}

/**
 * Return the milestone cards this account has not seen yet, and remember every owned card.
 * @param {string} accountId
 * @param {string[]} unlocked
 * @returns {string[]}
 */
export function takeNewRankNameCards(accountId, unlocked) {
  if (!/^[a-f0-9-]{36}$/i.test(accountId || '') || !Array.isArray(unlocked)) return [];
  const owned = [...new Set(unlocked.filter((id) => milestone.has(id)))];
  if (!owned.length) return [];
  const previous = loadPref(seenKey(accountId), []);
  const known = new Set(Array.isArray(previous) ? previous.filter((id) => milestone.has(id)) : []);
  const newly = owned.filter((id) => !known.has(id));
  if (newly.length) savePref(seenKey(accountId), [...new Set([...known, ...owned])]);
  return newly;
}
