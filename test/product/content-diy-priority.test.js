import test from 'node:test';
import assert from 'node:assert/strict';
import {getData, getVersionData} from '../../server/data.js';
import {composeProductData, composeProductReferenceData} from '../../server/product/content-data.js';
import {preferProductPresetsForDiy} from '../../server/product/content-operators.js';
import {PRODUCT_OPERATOR_IDENTITIES} from '../../shared/product-operator-identities.js';
import {operatorConflicts} from '../../server/product/operator-conflicts.js';
import {VERSIONS} from '../../shared/versions.js';
import {checkDiyPicks} from '../../shared/protocol.js';
import {KITTED_CHARS} from '../../server/sim/content/kits/index.js';
import {defaultPick, pickOptions} from '../../public/js/ui/diyModel.js';
import {makeMatch} from '../match/harness.js';

const PRO = 'arknights-expansion-v1', SLOT = 'chess_char_6_diy1_a', OTHER = 'chess_char_6_diy2_a';
const LING = 'char_2023_ling', WISDEL = 'char_1035_wisdel';

test('selected package presets override overlapping DIY candidates; non-overlaps and native data stay intact', () => {
  const base = getData(), before = JSON.stringify(base.backups);
  const data = composeProductData(base, [PRO]);
  const candidates = pickOptions(SLOT, {}, data, KITTED_CHARS).map(c => c.charId);
  assert.ok(!candidates.includes(LING));
  assert.ok(candidates.includes(WISDEL));
  assert.ok(data.chess.chess_exp_ling_a.bonds.includes('suiShip'));
  assert.ok(data.chess.chess_exp_ling_a.garrisonIds.length);
  assert.deepEqual(data.backups.units, base.backups.units);
  assert.deepEqual(data.backups.diy.slots, base.backups.diy.slots);
  assert.deepEqual(data.backups.diy.operators, base.backups.diy.operators);
  assert.equal(JSON.stringify(base.backups), before);
});

test('saved and resubmitted picks are excluded only from this match; disabling the package restores their eligibility', () => {
  const base = getData(), saved = {[SLOT]: defaultPick(LING, SLOT, base), [OTHER]: defaultPick(WISDEL, OTHER, base)};
  const before = JSON.stringify(saved), active = composeProductData(base, [PRO]);
  for (let i = 0; i < 2; i++) {
    const result = checkDiyPicks(saved, {data: active, kitted: KITTED_CHARS});
    assert.equal(result.dropped, 1);
    assert.deepEqual(Object.keys(result.picks), [OTHER]);
  }
  const off = composeProductData(base, []);
  assert.equal(checkDiyPicks(saved, {data: off, kitted: KITTED_CHARS}).dropped, 0);
  assert.equal(JSON.stringify(saved), before);
});

test('actual Match preparation cancels stale DIY admission and stock without changing the saved selection', () => {
  const base = getData(), saved = {[SLOT]: defaultPick(LING, SLOT, base), [OTHER]: defaultPick(WISDEL, OTHER, base)};
  const before = JSON.stringify(saved), data = composeProductData(base, [PRO]);
  const h = makeMatch({data, mode: 'solo', fake: true, seats: [
    {seat: 0, playerId: 'p_0', name: 'Fixture', isBot: false, connected: true, diy: saved},
  ]}).start().toPrep(1);
  try {
    const p = h.ps('p_0');
    assert.equal(p.diy[SLOT], undefined);
    assert.equal(p.diy[OTHER].charId, WISDEL);
    assert.equal(p.diyStock.has(SLOT), false);
    assert.equal(p.diyStock.has(OTHER), true);
    assert.equal(p.gd.chess('chess_exp_ling_a').charId, LING);
    assert.ok(p.gd.chess('chess_exp_ling_a').bonds.includes('suiShip'));
    assert.deepEqual(h.logs.error, []);
  } finally { h.m.dispose(); }
  assert.equal(JSON.stringify(saved), before);
});

test('all admitted package sets across four periods keep presets outside both DIY candidate pools', () => {
  for (const version of VERSIONS) {
    const base = getVersionData(version.id), ids = Object.keys(PRODUCT_OPERATOR_IDENTITIES)
      .filter(id => !operatorConflicts(id, version.id).length);
    const data = composeProductData(base, ids, {version: version.id});
    const presets = Object.values(data.chess).filter(c => c.visible && !c.isHidden && !c.isGolden && !c.isDiy
      && (c.expansionBatch || !base.chess[c.chessId]?.visible));
    const pool = new Set([...(data.backups.diy.ownedPool || []), ...Object.values(data.backups.diy.prototypes).flat()]);
    for (const c of presets) assert.ok(!pool.has(c.charId), version.id + '/' + c.name);
    assert.ok(pool.has(WISDEL));
  }
});

test('unselected packages and full browsing catalogues do not remove legal DIY choices', () => {
  const base = getData(), other = composeProductData(base, ['ursus-expansion-v1']);
  assert.ok(other.backups.diy.ownedPool.includes(LING));
  const ref = composeProductReferenceData(base, [PRO]);
  assert.ok(ref.backups.diy.ownedPool.includes(LING));
  assert.deepEqual(composeProductData(base, ['shop-extra-slot']).backups, base.backups);
});

test('overlapping prototype picks are cancelled too; unit forms and locked selections are retained', () => {
  const base = {chess: {}, backups: {}}, data = {chess: {x: {
    chessId: 'x', baseId: 'x', charId: 'char_fixture', visible: true, expansionBatch: 'fixture',
  }}, backups: {diy: {ownedPool: ['char_fixture', 'other'], prototypes: {5: ['char_fixture', 'reserve']},
    locked: {5: {char_fixture: {skillIndex: 0}}}}}};
  preferProductPresetsForDiy(base, data);
  assert.deepEqual(data.backups.diy.ownedPool, ['other']);
  assert.deepEqual(data.backups.diy.prototypes[5], ['reserve']);
  assert.ok(data.backups.diy.locked[5].char_fixture);
});
