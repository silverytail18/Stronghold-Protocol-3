import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { EmotePacks } from '../../server/product/emote-packs.js';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z7ZkAAAAASUVORK5CYII=';
const GIF = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

async function tempPacks() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sp-emote-packs-'));
  const packs = await new EmotePacks({ directory, log: { warn() {}, info() {}, error() {} } }).load();
  return { directory, packs };
}

test('emote packs start with the 14 empty 四风 slots', async () => {
  const { directory, packs } = await tempPacks();
  try {
    const catalog = packs.catalog();
    assert.equal(catalog.slots.length, 14);
    assert.equal(catalog.packs.length, 0);
    assert.equal(catalog.slots[0].id, 'sifeng_win');
    assert.equal(packs.has('sifeng_win'), false);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('importing the sifeng pack fills fixed slots and validates image types', async () => {
  const { directory, packs } = await tempPacks();
  try {
    const pack = await packs.importPack({
      id: 'sifeng', label: '四风', group: 'personal',
      images: [
        { name: 'a.png', type: 'image/png', data: `data:image/png;base64,${PNG}` },
        { name: 'b.png', type: 'image/png', data: `data:image/png;base64,${PNG}` },
      ],
    });
    assert.equal(pack.stickers.length, 2);
    assert.equal(pack.stickers[0].id, 'sifeng_win');
    assert.equal(pack.stickers[1].id, 'sifeng_ice');
    assert.equal(packs.has('sifeng_win'), true);
    const catalog = packs.catalog();
    const stored = catalog.packs.find((entry) => entry.id === 'sifeng');
    assert.equal(stored.stickers.length, 2);
    assert.match(stored.stickers[0].src, /^\/chat-stickers\/file\/sifeng\//);
    await assert.rejects(() => packs.importPack({ id: 'bad', label: 'bad', group: 'personal', images: [{ data: 'data:image/svg+xml;base64,PHN2Zz4=' }] }), /不支持的图片格式/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('custom packs use stable ids, notify clients and can be deleted', async () => {
  const { directory, packs } = await tempPacks();
  try {
    let changes = 0;
    packs.onChange = () => { changes += 1; };
    await packs.importPack({ id: 'demo', label: '演示', group: 'covenant', images: [{ data: GIF }] });
    assert.equal(packs.has('pack.demo.0'), true);
    assert.equal(changes, 1);
    const stored = packs.catalog().packs[0];
    assert.equal(stored.group, 'covenant');
    assert.equal(stored.stickers[0].type, 'image/gif');
    assert.match(stored.stickers[0].src, /\.gif\?v=/);
    await packs.deletePack('demo');
    assert.equal(changes, 2);
    assert.equal(packs.has('pack.demo.0'), false);
    assert.equal(packs.catalog().packs.length, 0);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
