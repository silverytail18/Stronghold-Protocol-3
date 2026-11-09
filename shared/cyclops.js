import { CYCLOPS_MAX_SEATS, CYCLOPS_PHASE, CYCLOPS_VARIANT } from './constants.js';

export const CYCLOPS_RULE_VERSION = 1;
export const CYCLOPS_LAST_NORMAL_ROUND = 20;
export const CYCLOPS_BOSS_ROUND = 21;
export const CYCLOPS_BONUS_ROUNDS = Object.freeze([4, 8, 12, 16]);
export const CYCLOPS_HEX_QUALITIES = Object.freeze(['silver', 'gold', 'prismatic']);
export const CYCLOPS_HEX_ROUNDS = Object.freeze([5, 10, 15]);
export const CYCLOPS_INTEREST_PER = 10;
export const CYCLOPS_INTEREST_RATE = 1;
export const CYCLOPS_INTEREST_CAP = 5;
export const CYCLOPS_DRAFT_CHOICES = 10;
export const CYCLOPS_HEX_TURN_SECONDS = 35;

export function isCyclopsVariant(variant) { return variant === CYCLOPS_VARIANT; }
export function isCyclopsBonusRound(round) { return CYCLOPS_BONUS_ROUNDS.includes(round); }
export function isCyclopsHexRound(round) { return CYCLOPS_HEX_ROUNDS.includes(round); }
export function cyclopsHexQuality(round) {
  const index = CYCLOPS_HEX_ROUNDS.indexOf(round);
  return index < 0 ? null : CYCLOPS_HEX_QUALITIES[index];
}
export function cyclopsInterest(funds) {
  if (!Number.isFinite(funds) || funds <= 0) return 0;
  return Math.min(CYCLOPS_INTEREST_CAP, Math.floor(funds / CYCLOPS_INTEREST_PER) * CYCLOPS_INTEREST_RATE);
}
export function cyclopsGroupSizes(players) {
  if (!Number.isInteger(players) || players < 1 || players > CYCLOPS_MAX_SEATS) throw new RangeError('invalid cyclops player count');
  return players <= 4 ? [players] : [4, players - 4];
}
export function cyclopsGroups(seats) {
  if (!Array.isArray(seats) || seats.length < 1 || seats.length > CYCLOPS_MAX_SEATS) throw new RangeError('invalid cyclops seats');
  const ordered = [...seats].sort((a, b) => a.seat - b.seat);
  const sizes = cyclopsGroupSizes(ordered.length);
  let offset = 0;
  return sizes.map((size, i) => ({ id: `g${i + 1}`, playerIds: ordered.slice(offset, offset += size).map((seat) => seat.playerId) }));
}
export function cyclopsDraftOrder(players) {
  return [...players].sort((a, b) => (a.lp ?? Infinity) - (b.lp ?? Infinity) || a.seat - b.seat).map((p) => p.playerId);
}
export function cyclopsTimeoutPick(slots, seedIndex = 0) {
  const available = Array.isArray(slots) ? slots.map((slot, index) => slot ? index : -1).filter((index) => index >= 0) : [];
  return available.length ? available[Math.abs(seedIndex) % available.length] : null;
}
export function cyclopsPhaseForRound(round) {
  return isCyclopsHexRound(round) ? CYCLOPS_PHASE.HEX : null;
}
