// Runtime personalized emote packs imported by an administrator.
// The static catalogue in shared/chatStickers.js is the source of the 14 四风 slots; this module
// only overlays uploaded images and extra packs on top of it, so the client never needs a server
// build to show the empty slots.
import { SIFENG_EMOTES } from '../../shared/chatStickers.js';
import { emoteInfo } from '../../shared/constants.js';

const listeners = new Set();
let state = {
  loaded: false,
  loading: null,
  revision: 0,
  slots: SIFENG_EMOTES,
  packs: [],
  byId: new Map(),
};

function publish(next) {
  state = next;
  for (const listener of listeners) {
    try { listener(state); } catch { /* a listener must never break the game */ }
  }
}

function build(catalog) {
  const packs = Array.isArray(catalog?.packs) ? catalog.packs : [];
  const byId = new Map();
  for (const pack of packs) {
    for (const sticker of pack.stickers || []) {
      if (!sticker?.id || !sticker?.src) continue;
      byId.set(sticker.id, { ...sticker, packId: pack.id, group: pack.group, packLabel: pack.label });
    }
  }
  return {
    loaded: true,
    loading: null,
    revision: Number.isSafeInteger(catalog?.revision) ? catalog.revision : 0,
    slots: Array.isArray(catalog?.slots) && catalog.slots.length ? catalog.slots : SIFENG_EMOTES,
    packs,
    byId,
  };
}

/**
 * Ask the browser to fetch each uploaded image once. The server serves them with a one-year
 * immutable cache and a revision in the URL, so later opens and remounts use the local cache.
 */
function preloadStickerImages(packs) {
  if (typeof Image !== 'function') return;
  for (const pack of packs) {
    for (const sticker of pack.stickers || []) {
      if (!sticker?.src) continue;
      const image = new Image();
      image.decoding = 'async';
      image.src = sticker.src;
    }
  }
}

/** Fetch the administrator-managed catalogue once; a failed fetch leaves the empty slots usable. */
export function loadChatStickerPacks(force = false) {
  if (!force && state.loaded) return Promise.resolve(state);
  if (!force && state.loading) return state.loading;
  const loading = fetch('/chat-stickers/catalog', { credentials: 'same-origin', cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw Error(`chat sticker catalogue ${response.status}`);
      return response.json();
    })
    .then((catalog) => {
      const next = build(catalog);
      publish(next);
      preloadStickerImages(next.packs);
      return state;
    })
    .catch((error) => {
      if (globalThis.console?.warn) globalThis.console.warn('[chat-stickers] catalogue unavailable', error?.message || error);
      publish({ ...state, loaded: true, loading: null });
      return state;
    });
  publish({ ...state, loading });
  return loading;
}

export function chatStickerState() {
  return state;
}

export function subscribeChatStickerPacks(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPackSticker(id) {
  return typeof id === 'string' ? state.byId.get(id) || null : null;
}

/** Label for an imported sticker or a still-empty 四风 slot. */
export function stickerLabel(id) {
  const imported = getPackSticker(id);
  if (imported?.label) return imported.label;
  return SIFENG_EMOTES.find((slot) => slot.id === id)?.label || null;
}

/** Label for an official emote, an imported sticker, or a still-empty 四风 slot. */
export function emoteLabel(id) {
  return emoteInfo(id)?.label || stickerLabel(id);
}

export function packStickers(packId) {
  return state.packs.find((pack) => pack.id === packId)?.stickers || [];
}

export function packsInGroup(group) {
  return state.packs.filter((pack) => pack.group === group);
}

/** Imported personalized stickers, in pack order. Nothing is reserved: an empty pack shows nothing. */
export function personalStickerEntries() {
  return packsInGroup('personal').flatMap((pack) => (pack.stickers || []).map((sticker) => ({ kind: 'sticker', id: sticker.id, label: sticker.label, sticker })));
}

/** The 卫戍协议 entries, if an administrator imported a covenant pack. */
export function covenantStickerEntries() {
  return packsInGroup('covenant').flatMap((pack) => (pack.stickers || []).map((sticker) => ({ kind: 'sticker', id: sticker.id, label: sticker.label, sticker })));
}
