import test from 'node:test';
import assert from 'node:assert/strict';
import { canUseNameCard, RANK_MILESTONE_CARDS, unlockedRankNameCards } from '../../shared/nameCards.js';

test('rank milestone cards unlock from the current or the recorded peak division', () => {
  assert.deepEqual(unlockedRankNameCards({ rank: { division: 'silver' }, peakRank: { division: 'silver' } }), []);
  assert.deepEqual(unlockedRankNameCards({ rank: { division: 'gold' }, peakRank: { division: 'gold' } }), ['milestone_gold']);
  assert.deepEqual(unlockedRankNameCards({ rank: { division: 'silver' }, peakRank: { division: 'diamond' } }),
    ['milestone_gold', 'milestone_platinum', 'milestone_diamond']);
  assert.equal(unlockedRankNameCards(null).length, 0);
  assert.equal(RANK_MILESTONE_CARDS.length, 5);
});

test('base cards stay available and milestone cards need the unlock', () => {
  const profile = { rank: { division: 'platinum' }, peakRank: { division: 'platinum' } };
  assert.equal(canUseNameCard(profile, 'standard'), true);
  assert.equal(canUseNameCard(profile, 'covenant'), true);
  assert.equal(canUseNameCard(profile, 'night'), true);
  assert.equal(canUseNameCard(profile, 'milestone_gold'), true);
  assert.equal(canUseNameCard(profile, 'milestone_platinum'), true);
  assert.equal(canUseNameCard(profile, 'milestone_diamond'), false);
  assert.equal(canUseNameCard({}, 'milestone_gold'), false);
});
