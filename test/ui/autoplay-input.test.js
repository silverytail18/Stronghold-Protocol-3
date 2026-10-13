import { test } from 'node:test';
import assert from 'node:assert/strict';
import { store, emptyMatch } from '../../public/js/store.js';
import { awayStore, autoplayActive, lockAutoplayInput } from '../../public/js/ui/autoplayState.js';
import { actions } from '../../public/js/ui/gameActions.js';
import { net } from '../../public/js/net.js';
import { PHASE } from '../../shared/constants.js';

test('autoplay rejects human intents, remains locked after a failed exit, and unlocks only after server confirmation', async () => {
  const original = net.request;
  const sent = [];
  store.set({ room: { inMatch: true }, match: { ...emptyMatch(), public: { phase: PHASE.PREP }, private: { autoplay: true } } });
  net.request = async (t, fields) => { sent.push([t, fields]); throw new Error('preview offline'); };
  try {
    for (const request of [() => actions.refresh(), () => actions.buy(0), () => actions.move(1, { area: 'hand', idx: 1 }), () => actions.ready(true), () => actions.pause(true), () => actions.chat('manual')]) {
      assert.equal(await request(), false);
    }
    assert.deepEqual(sent, [], 'locked intents cause no network or server work');
    assert.equal(await actions.autoplay(false), false);
    assert.equal(autoplayActive(), true, 'failed cancel keeps the input lock');
    net.request = async (t, fields) => { sent.push([t, fields]); return {}; };
    assert.equal(await actions.autoplay(false), true);
    assert.equal(autoplayActive(), true, 'ACK alone does not override private state');
    awayStore.set({ away: true });
    store.patch('match', { private: { autoplay: false } });
    assert.equal(awayStore.get().away, false, 'authoritative cancellation clears the local latch too');
    assert.equal(autoplayActive(), false);
    assert.equal(await actions.refresh(), true);
    assert.deepEqual(sent.map(([t]) => t), ['g.autoplay', 'g.autoplay', 'g.refresh']);
    store.patch('match', { private: { autoplay: true }, result: { victory: true } });
    assert.equal(autoplayActive(), false, 'result actions are never trapped by autoplay');
  } finally { net.request = original; awayStore.reset(); store.reset(); }
});

test('native capture lock blocks touch, pointer, keyboard and focused controls; exit and cleanup work', () => {
  const listeners = new Map();
  const target = {
    addEventListener: (name, fn, opts) => { assert.ok(opts === true || opts.capture); listeners.set(name, fn); },
    removeEventListener: (name, fn) => { assert.equal(listeners.get(name), fn); listeners.delete(name); },
  };
  let focusCount = 0, blurCount = 0;
  const exit = { closest: cls => cls === '.autoplay-exit', focus: () => focusCount++ };
  const control = { closest: () => null, blur: () => blurCount++ };
  const doc = { activeElement: control, querySelector: () => exit };
  const unlock = lockAutoplayInput(target, doc);
  const emit = (name, node, key) => {
    const event = { target: node, key, cancelable: true, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
    listeners.get(name)(event);
    return event;
  };
  for (const name of ['pointerdown', 'pointerup', 'pointermove', 'click', 'touchstart', 'touchmove', 'touchend', 'wheel', 'dragstart', 'drop']) {
    assert.equal(emit(name, control).stopped, true, name);
    assert.equal(emit(name, exit).stopped, false, `${name} exit works`);
  }
  for (const key of ['r', 'f', 'd', ' ', 'Enter', 'Escape']) assert.equal(emit('keydown', control, key).stopped, true, key);
  assert.equal(emit('keydown', exit, 'r').stopped, true);
  assert.equal(emit('keydown', exit, 'Enter').stopped, false);
  assert.equal(emit('keyup', exit, ' ').stopped, false);
  assert.equal(emit('keydown', control, 'Tab').prevented, true);
  emit('focusin', control);
  assert.equal(focusCount, 2);
  assert.equal(blurCount, 2);
  unlock();
  assert.equal(listeners.size, 0, 'no input blocker remains after cancelling or ending the match');
});
