import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYCLOPS_BOSS_ROUND, CYCLOPS_LAST_NORMAL_ROUND,
  cyclopsDraftOrder, cyclopsGroupSizes, cyclopsGroups, cyclopsHexQuality,
  cyclopsInterest, cyclopsTimeoutPick, isCyclopsBonusRound,
} from '../shared/cyclops.js';
import { PHASE, CYCLOPS_MAX_SEATS, CYCLOPS_PHASE, CYCLOPS_VARIANT } from '../shared/constants.js';
import { validateC2S } from '../shared/protocol.js';

test('Cyclops rules keep the 1–8 seat pool split independent from standard seats', () => {
  assert.equal(CYCLOPS_MAX_SEATS, 8);
  assert.deepEqual(cyclopsGroupSizes(1), [1]);
  assert.deepEqual(cyclopsGroupSizes(4), [4]);
  assert.deepEqual(cyclopsGroupSizes(5), [4, 1]);
  assert.deepEqual(cyclopsGroupSizes(8), [4, 4]);
  assert.throws(() => cyclopsGroupSizes(9), RangeError);
  const groups = cyclopsGroups(Array.from({ length: 5 }, (_, seat) => ({ seat, playerId: `p${seat}` })));
  assert.deepEqual(groups, [{ id: 'g1', playerIds: ['p0', 'p1', 'p2', 'p3'] }, { id: 'g2', playerIds: ['p4'] }]);
  assert.equal(CYCLOPS_VARIANT, 'entertainment_cyclops');
});

test('Cyclops progression constants and deterministic helper rules match the design', () => {
  assert.equal(CYCLOPS_LAST_NORMAL_ROUND, 20);
  assert.equal(CYCLOPS_BOSS_ROUND, 21);
  assert.deepEqual([4, 8, 12, 16].map(isCyclopsBonusRound), [true, true, true, true]);
  assert.deepEqual([5, 10, 15].map(cyclopsHexQuality), ['silver', 'gold', 'prismatic']);
  assert.equal(cyclopsHexQuality(4), null);
  assert.deepEqual(cyclopsDraftOrder([{ playerId: 'b', lp: 8, seat: 0 }, { playerId: 'a', lp: 8, seat: 1 }, { playerId: 'c', lp: 2, seat: 2 }]), ['c', 'b', 'a']);
  assert.equal(cyclopsInterest(9), 0);
  assert.equal(cyclopsInterest(59), 5);
  assert.equal(cyclopsInterest(1000), 5);
  assert.equal(cyclopsTimeoutPick([null, { id: 'a' }, { id: 'b' }], 1), 2);
  assert.equal(cyclopsTimeoutPick([null, null]), null);
  assert.equal(PHASE.CYCLOPS_HEX, CYCLOPS_PHASE.HEX);
  assert.equal(PHASE.CYCLOPS_DRAFT, CYCLOPS_PHASE.DRAFT);
});

test('Cyclops room and decision messages are structurally bounded', () => {
  assert.equal(validateC2S({ t: 'room.create', mode: 'coop', variant: CYCLOPS_VARIANT }), null);
  assert.ok(validateC2S({ t: 'room.create', mode: 'coop', variant: 'unknown' }));
  assert.equal(validateC2S({ t: 'g.cyclopsHex', slot: 2 }), null);
  assert.equal(validateC2S({ t: 'g.cyclopsHexReroll', slot: 3 }), 'bad field slot');
  assert.equal(validateC2S({ t: 'g.cyclopsDraft', idx: 9 }), null);
  assert.equal(validateC2S({ t: 'g.cyclopsDraft', idx: 10 }), 'bad field idx');
});
