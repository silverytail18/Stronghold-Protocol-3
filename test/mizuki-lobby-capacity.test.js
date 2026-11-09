import test from 'node:test';
import assert from 'node:assert/strict';
import { Lobby } from '../server/lobby.js';
import { SessionRegistry } from '../server/net.js';
import { DATA } from './match/harness.js';
import { validateC2S } from '../shared/protocol.js';
import { MIZUKI_VARIANT } from '../shared/mizuki-constants.js';
import { attachMizukiProduct } from '../server/product/mizuki/bridge.js';

test('Mizuki N0–N18 setup creates exactly 1–4 seats and refuses overflow joins', t => {
  const registry = new SessionRegistry();
  const lobby = new Lobby({ registry, getData: () => DATA, log: { info() {}, warn() {}, error() {}, debug() {} } });
  t.after(() => lobby.shutdown());
  for (const capacity of [1, 2, 3, 4]) {
    const host = registry.create('Host ' + capacity);
    const msg = { t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, mizukiDifficultyGrade: 18, capacity };
    assert.equal(validateC2S(msg), null);
    assert.equal(lobby.create(host, msg).error, undefined);
    const room = lobby.roomOf(host);
    assert.equal(room.seats.length, capacity);
    assert.equal(room.mizukiDifficultyGrade, 18);
    for (let n = 1; n < capacity; n++) assert.equal(lobby.join(registry.create('Guest ' + n), { code: room.code }).error, undefined);
    assert.ok(lobby.join(registry.create('Overflow'), { code: room.code }).error);
  }
  for (const capacity of [0, 5, 1.5]) {
    assert.ok(validateC2S({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity }));
    assert.ok(lobby.create(registry.create('Invalid'), { mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity }).error);
  }
  assert.equal(validateC2S({ t: 'room.create', mode: 'coop', difficulty: 'NORMAL', capacity: 2 }), 'unexpected capacity');
  const normal = registry.create('Normal');
  lobby.create(normal, { mode: 'coop', difficulty: 'NORMAL' });
  assert.equal(lobby.roomOf(normal).seats.length, 4);
});

test('Mizuki host can resize waiting rooms without evicting seats, bypassing authority or losing resume members', t => {
  const registry = new SessionRegistry();
  const lobby = new Lobby({ registry, getData: () => DATA, log: { info() {}, warn() {}, error() {}, debug() {} } });
  const saved = { participants: [{ playerId: 'original1' }, { playerId: 'original2' }],
    checkpoint: { players: [{ playerId: 'original1', alive: true }, { playerId: 'original2', alive: true }] } };
  attachMizukiProduct({ lobby, registry, product: { mizuki: { active: () => null, get: () => saved },
    mizukiResourceReady: true, gameplayUserFor: () => ({}) } });
  t.after(() => { lobby.mizukiHosts.close(); lobby.shutdown(); });
  const host = registry.create('Resize host'), guest = registry.create('Resize guest');
  assert.equal(lobby.create(host, { mode: 'coop', difficulty: 'NORMAL', variant: MIZUKI_VARIANT, capacity: 2 }).error, undefined);
  const room = lobby.roomOf(host), hostSeat = room.seats[0];
  lobby.join(guest, { code: room.code });
  const guestSeat = room.seats[1];
  const change = (session, capacity) => lobby.handleMessage(session, { t: 'room.setCapacity', capacity });
  assert.equal(validateC2S({ t: 'room.setCapacity', capacity: 4 }), null);
  for (const capacity of [0, 5, 1.5, '2']) {
    assert.ok(validateC2S({ t: 'room.setCapacity', capacity }));
    assert.ok(change(host, capacity).error);
  }
  assert.ok(change(guest, 4).error);
  assert.ok(change(host, 1).error);
  guestSeat.ready = true;
  assert.equal(change(host, 2).ok, true);
  assert.equal(guestSeat.ready, true, 'no-op preserves readiness');
  assert.equal(change(host, 4).ok, true);
  assert.equal(room.capacity, 4);
  assert.equal(room.seats.length, 4);
  assert.equal(room.seats[0], hostSeat);
  assert.equal(room.seats[1], guestSeat);
  assert.equal(guestSeat.ready, false, 'changed capacity requires the guest to ready again');
  assert.equal(change(host, 2).ok, true);
  assert.equal(room.toState().capacity, 2);
  lobby.leave(guest);
  room.mizukiResumeRunId = 'fixture-restore';
  assert.ok(change(host, 1).error, 'reserve enough places for original members still to rejoin');
  assert.equal(change(host, 3).ok, true);
  room.match = {};
  assert.ok(change(host, 4).error, 'capacity cannot rewrite a running exploration');
  room.match = null;
  const normal = registry.create('Normal host');
  lobby.create(normal, { mode: 'coop', difficulty: 'NORMAL' });
  assert.ok(change(normal, 2).error);
  assert.equal(lobby.roomOf(normal).seats.length, 4);
});
