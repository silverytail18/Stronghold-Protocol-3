import test from 'node:test';
import assert from 'node:assert/strict';
import { loadChatStickerPacks, personalStickerEntries, covenantStickerEntries } from '../../public/js/chatStickerPacks.js';

test('personal emotes show only imported stickers, never reserved slots', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      format: 1,
      revision: 2,
      slots: Array.from({ length: 14 }, (_, slot) => ({ id: `sifeng_${slot}`, label: `slot ${slot}`, slot })),
      packs: [
        { id: 'sifeng', label: '四风', group: 'personal', stickers: [
          { id: 'sifeng_win', label: '会赢的', slot: 0, src: '/chat-stickers/file/sifeng/0.png?v=1' },
          { id: 'sifeng_ice', label: '冰冰冰', slot: 1, src: '/chat-stickers/file/sifeng/1.png?v=1' },
        ] },
        { id: 'demo', label: '演示', group: 'covenant', stickers: [
          { id: 'pack.demo.0', label: '演示 1', slot: 0, src: '/chat-stickers/file/demo/0.png?v=1' },
        ] },
      ],
    }),
  });
  try {
    await loadChatStickerPacks(true);
    assert.deepEqual(personalStickerEntries().map((entry) => entry.id), ['sifeng_win', 'sifeng_ice']);
    assert.deepEqual(covenantStickerEntries().map((entry) => entry.id), ['pack.demo.0']);
  } finally { globalThis.fetch = originalFetch; }
});
