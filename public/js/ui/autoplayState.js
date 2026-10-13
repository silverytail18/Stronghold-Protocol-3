// Own-seat input lock. Battle rendering and b.* reports keep running while the bot plays.
import { store, createStore } from '../store.js';
import { PHASE } from '../../../shared/constants.js';

export const awayStore = createStore({ away: false });
export const awayEnds = (s, prev) => (!!prev?.match?.public && !s?.match?.public) || (!!s?.match?.result && !prev?.match?.result);
store.subscribe((s, prev) => {
  if (awayStore.get().away && (awayEnds(s, prev) || (prev?.match?.private?.autoplay && s?.match?.private?.autoplay === false))) {
    awayStore.set({ away: false });
  }
});

export function autoplayActive(s = store.get(), away = awayStore.get().away) {
  return !!s.match?.public && !s.match.result && s.match.public.phase !== PHASE.RESULT &&
    (!s.room || s.room.inMatch !== false) && !!(away || s.match.private?.autoplay);
}

/** Capture native events before canvas, buttons and window shortcuts can receive them. */
export function lockAutoplayInput(target, doc) {
  const isExit = e => !!e.target?.closest?.('.autoplay-exit');
  const stop = e => { if (e.cancelable) e.preventDefault(); e.stopImmediatePropagation(); };
  const pointer = e => { if (!isExit(e)) stop(e); };
  // Tab stays on the sole enabled control. Enter/Space are allowed only on that control.
  const key = e => {
    if (e.key === 'Tab') { stop(e); doc.querySelector('.autoplay-exit')?.focus(); }
    else if (!isExit(e) || !['Enter', ' '].includes(e.key)) stop(e);
  };
  const focus = e => {
    if (!isExit(e)) { e.target?.blur?.(); doc.querySelector('.autoplay-exit')?.focus(); }
  };
  const events = ['pointerdown', 'pointerup', 'pointermove', 'pointercancel', 'click', 'dblclick', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'wheel', 'dragstart', 'drop'];
  const opts = { capture: true, passive: false };
  for (const name of events) target.addEventListener(name, pointer, opts);
  for (const name of ['keydown', 'keyup']) target.addEventListener(name, key, true);
  target.addEventListener('focusin', focus, true);
  doc.activeElement?.blur?.();
  return () => {
    for (const name of events) target.removeEventListener(name, pointer, opts);
    for (const name of ['keydown', 'keyup']) target.removeEventListener(name, key, true);
    target.removeEventListener('focusin', focus, true);
  };
}
