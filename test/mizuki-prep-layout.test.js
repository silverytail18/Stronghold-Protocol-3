import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mizukiPrepStage, mizukiPrepViewRect, mizukiPrepTarget, MIZUKI_GEO, MIZUKI_PREP_AREA, mizukiPrepViewState, mizukiHandTile, mizukiTempTile } from '../public/js/mizukiPrep.js';
import { mizukiPresetCamera } from '../public/js/mizukiProjection.js';
import { pieceTile, tileSlot } from '../public/js/mizukiNativeDrag.js';
import { hudPadding } from '../public/js/ui/fieldHost.js';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('Mizuki prep reserves its own two rows below the complete shifted native map', () => {
  const sourceRows = Array.from({ length: 19 }, (_, row) => String(row).padEnd(21, 'x'));
  const source = { id: 'native-map', rows: sourceRows, tiles: {}, originalSize: [19, 21] };
  const stage = mizukiPrepStage(source, { r0: 0, r1: 18, c0: 0, c1: 20 });

  assert.equal(stage.rows.length, 21);
  assert.equal(stage.rows[0], 'a'.repeat(10) + '#'.repeat(11));
  assert.equal(stage.rows[1], '#'.repeat(4) + 'A'.repeat(5) + '#'.repeat(12));
  for (let row = 0; row < sourceRows.length; row++) assert.equal(stage.rows[row + 2], sourceRows[row]);
  assert.deepEqual(mizukiHandTile(9), { row: 0, col: 9 });
  assert.deepEqual(mizukiTempTile(0), { row: 1, col: 4 });
  assert.deepEqual(mizukiTempTile(4), { row: 1, col: 8 });
  assert.deepEqual(pieceTile({ area: 'hand', idx: 3 }), { row: 0, col: 3 });
  assert.deepEqual(pieceTile({ area: 'temp', idx: 2 }), { row: 1, col: 6 });
  assert.deepEqual(tileSlot({ row: 0, col: 3 }), { area: 'hand', idx: 3 });
  assert.deepEqual(tileSlot({ row: 1, col: 6 }), { area: 'temp', idx: 2 });
  assert.deepEqual(tileSlot({ row: 20, col: 20 }), { area: 'board', row: 20, col: 20 });
  assert.deepEqual(MIZUKI_GEO.FIELD, { r0: 2, r1: 20, c0: 0, c1: 20 });
  assert.deepEqual(MIZUKI_PREP_AREA, [{ r0: 0, r1: 20, c0: 0, c1: 20 }]);
  assert.deepEqual(mizukiPrepViewState({ area: [], band: [6, 18], field: [6, 18], pen: true }), {
    area: MIZUKI_PREP_AREA, band: [0, 20], field: [0, 20], pen: false, leader: false,
  });
  assert.deepEqual(mizukiPrepViewRect({ r0: 0, r1: 18, c0: 0, c1: 20 }), { r0: 0, r1: 20, c0: 0, c1: 20 });
  assert.deepEqual(mizukiPrepTarget({ area: 'board', row: 20, col: 20 }), { area: 'board', row: 18, col: 20 });
});

test('Mizuki prep camera frames hand, staging row, and top native row at desktop and landscape phone sizes', () => {
  const oldDocument = globalThis.document, oldGetComputedStyle = globalThis.getComputedStyle;
  globalThis.document = { documentElement: {}, querySelector: () => null };
  globalThis.getComputedStyle = () => ({ fontSize: '16px' });
  try {
    for (const [width, height] of [[1440, 900], [844, 390], [756, 366]]) {
      const padding = hudPadding('prep', { width, height });
      const camera = mizukiPresetCamera('prep', { width, height, padding }, {
        nativeRect: { r0: 0, r1: 20, c0: 0, c1: 20 },
      });
      for (const row of [0, 1, 2, 20]) for (const col of [0, 20]) for (const z of [0, 1.25]) {
        const point = camera.project(col, row, z);
        assert.ok(point.x >= padding.left - 0.1 && point.x <= width - padding.right + 0.1, `${width}x${height}: x ${point.x}`);
        assert.ok(point.y >= padding.top - 0.1 && point.y <= height - padding.bottom + 0.1, `${width}x${height}: y ${point.y}`);
      }
    }
  } finally {
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
    if (oldGetComputedStyle === undefined) delete globalThis.getComputedStyle; else globalThis.getComputedStyle = oldGetComputedStyle;
  }
});

test('small and large Mizuki maps fit their own bounds and retain every bench slot', () => {
  const small = mizukiPrepViewRect({ r0: 0, r1: 5, c0: 0, c1: 8 });
  const wide = mizukiPrepViewRect({ r0: 0, r1: 12, c0: 0, c1: 16 });
  assert.deepEqual(small, { r0: 0, r1: 7, c0: 0, c1: 9 });
  assert.deepEqual(wide, { r0: 0, r1: 14, c0: 0, c1: 16 });
  for (const [width, height] of [[1440, 900], [844, 390], [756, 366]]) {
    const padding = { top: 92, bottom: 128, left: 90, right: 40 }, hud = { top: 96, bottom: 52 };
    const viewport = { width, height, padding };
    const smallCam = mizukiPresetCamera('prep', viewport, { nativeRect: small, hud });
    const wideCam = mizukiPresetCamera('prep', viewport, { nativeRect: wide, hud });
    assert.ok(smallCam.scale > wideCam.scale * 1.2, 'small maps must appear larger than wide maps');
    const oldCam = mizukiPresetCamera('prep', viewport, { nativeRect: { ...small, c1: 20 } });
    assert.ok(smallCam.scale > oldCam.scale * 1.2, 'unused columns and absent shop must not shrink the map');
    for (const rect of [small, wide]) {
      const cam = mizukiPresetCamera('prep', viewport, { nativeRect: rect, hud });
      for (const row of [rect.r0 - .5, rect.r1 + .5]) for (const col of [rect.c0 - .5, rect.c1 + .5]) for (const z of [0, 1.25]) {
        const p = cam.project(col, row, z);
        assert.ok(p.x >= padding.left && p.x <= width - padding.right);
        assert.ok(p.y >= hud.top && p.y <= height - hud.bottom);
      }
    }
    for (const kind of ['normal', 'unite', 'boss', 'hidden']) {
      const rect = { r0: 0, r1: 5, c0: 0, c1: 8 };
      const cam = mizukiPresetCamera(kind, viewport, { rect, side: 'R', half: true });
      for (const row of [0, 5]) for (const col of [0, 8]) {
        const p = cam.project(col, row, 0);
        assert.ok(p.x >= padding.left && p.x <= width - padding.right, kind);
        assert.ok(p.y >= padding.top && p.y <= height - padding.bottom, kind);
      }
    }
  }
});

test('generated Mizuki renderer uses 21-row tile and 3D grids plus Mizuki-specific hand positions', () => {
  const app = read('../public/js/mizukiNativeApp.js');
  const drag = read('../public/js/mizukiNativeDrag.js');
  const tiles = read('../public/js/mizukiNativeTiles.js');
  const layout = read('../public/js/mizukiBoard3dLayout.js');
  const scene = read('../public/js/mizukiBoard3dScene.js');
  assert.match(app, /TileField \} from '\.\/mizukiNativeTiles\.js'/);
  assert.match(app, /BoardScene \} from '\.\/mizukiBoard3dScene\.js'/);
  assert.match(app, /tiles\.levels, stageRec\?\.rows\?\.length \|\| 19, 21/);
  assert.match(drag, /mizukiHandTile as handTile/);
  assert.match(drag, /mizukiTempTile as tempTile/);
  assert.match(tiles, /const ROWS = 21, COLS = 21;/);
  assert.match(app, /tiles\.setView\(\[0, 20\], camRect\(\), \[0, 20\]\)/);
  assert.match(app, /mizukiBoardArea\(viewKind\(camKind, camOpts\)\)/);
  assert.match(app, /mizukiPrepViewState\(restView\(kind\)\)/);
  assert.match(app, /normRect\(camOpts\.rect, stageRec\?\.rows\?\.length \|\| 19, 21\)/);
  assert.match(layout, /export const ROWS = 21;/);
  assert.match(scene, /mizukiBoard3dLayout\.js/);
});
