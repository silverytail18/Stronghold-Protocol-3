import test from 'node:test';
import assert from 'node:assert/strict';
import {getData, getVersionData} from '../../server/data.js';
import {VERSIONS} from '../../shared/versions.js';
import {composeProductData, composeProductReferenceData} from '../../server/product/content-data.js';
import {referenceCatalog} from '../../server/product/reference-catalog.js';
import {resolveReferenceOperators, translateContentReferences} from '../../server/product/content-operators.js';
import {rosterOf, charKeyMap, entriesView, rebaseByChar} from '../../public/js/ui/loadoutModel.js';
import {matchesSource} from '../../public/js/ui/contentSource.js';

const PRO = 'arknights-expansion-v1', URSUS = 'ursus-expansion-v1';
const OXI = 'char_4247_oxi';
const nativeFields = ['charId', 'tier', 'price', 'status', 'skill', 'skills', 'module', 'modules',
  'stats', 'statsBase', 'trait', 'traitBase', 'talents', 'talentsBase'];

test('all four reference catalogues contain one visible loadout target per operator without changing base data', () => {
  for (const version of VERSIONS) {
    const base = getVersionData(version.id), before = JSON.stringify(base.chess);
    const ref = referenceCatalog(version.id), rows = rosterOf(Object.values(ref.values.chess));
    assert.equal(new Set(rows.map(c => c.charId)).size, rows.length, version.id);
    assert.equal(ref.revision, 3);
    assert.equal(ref.values.assets, undefined);
    assert.equal(JSON.stringify(base.chess), before);
    for (const bond of Object.values(ref.values.bonds)) if (bond.bondId) {
      for (const id of bond.members || []) assert.ok(ref.values.chess[id], bond.bondId + '/' + id);
    }
  }
});

test('existing first-period overlaps keep native skill/module/stat choices and resolve trait owners', () => {
  const base = getVersionData('act1autochess'), ref = referenceCatalog('act1autochess').values;
  for (const charId of ['char_290_vigna', 'char_135_halo', 'char_1031_slent2', 'char_134_ifrit', 'char_4163_rosesa']) {
    const native = Object.values(base.chess).find(c => c.visible && !c.isGolden && !c.isDiy && c.charId === charId);
    const row = ref.chess[native.chessId];
    for (const field of nativeFields) assert.deepEqual(row[field], native[field], native.name + '/' + field);
    assert.equal(row.expansionBatch, undefined);
    assert.ok(row.productSourcePackages?.length);
  }
  assert.ok(!ref.chess.chess_kz_vigna_a);
  assert.ok(!ref.chess.chess_rhine_slent2_a);
  const native = Object.values(base.chess).find(c => c.visible && !c.isGolden && c.charId === 'char_1031_slent2');
  const token = ref.tokens.token_10029_slent2_protrb;
  assert.deepEqual(token.variants[native.chessId], base.tokens.token_10029_slent2_protrb.variants[native.chessId]);
  assert.ok(!token.variants.chess_rhine_slent2_a);
  for (const row of Object.values(ref.garrisons)) {
    assert.ok(!(row.owners || []).includes('chess_kz_vigna_a'));
    assert.ok(!(row.owners || []).includes('chess_rhine_slent2_a'));
  }
});

test('hypothetical future Talulah uses the same upstream byChar choice, with no speculative gameplay admission', () => {
  const old = composeProductData(getData(), [URSUS]), base = structuredClone(getData());
  for (const suffix of ['a', 'b']) {
    const row = structuredClone(old.chess['chess_ursus_oxi_' + suffix]);
    row.chessId = 'chess_fixture_future_oxi_' + suffix;
    row.baseId = 'chess_fixture_future_oxi_a'; row.goldenId = 'chess_fixture_future_oxi_b';
    row.stats.atk += 37;
    delete row.expansionBatch;
    base.chess[row.chessId] = row;
  }
  const before = JSON.stringify(base.chess), ref = composeProductReferenceData(base, [URSUS]);
  const rows = rosterOf(Object.values(ref.chess)).filter(c => c.charId === OXI);
  assert.deepEqual(rows.map(c => c.chessId), ['chess_fixture_future_oxi_a']);
  for (const field of nativeFields) assert.deepEqual(rows[0][field], base.chess.chess_fixture_future_oxi_a[field]);
  assert.ok(!ref.chess.chess_ursus_oxi_a);
  const oldMap = charKeyMap(Object.values(old.chess));
  const byChar = rebaseByChar({}, {}, {chess_ursus_oxi_a: {skill: 2, module: 'none'}}, id => oldMap.toChar.get(id));
  const expected = {'chess_fixture_future_oxi_a': {skill: 2, module: 'none'}};
  assert.deepEqual(entriesView(byChar, charKeyMap(Object.values(ref.chess))), expected);
  assert.deepEqual(entriesView(byChar, charKeyMap(Object.values(base.chess))), expected);
  assert.deepEqual(byChar, {[OXI]: {skill: 2, module: 'none'}});
  assert.throws(() => composeProductData(base, [URSUS]), /本体已包含干员/);
  assert.equal(JSON.stringify(base.chess), before);
});

test('package provenance covers legacy penguin aliases and cross-version imports without changing official identity', () => {
  const current = referenceCatalog().values.chess;
  for (const id of ['chess_exp_croissant_a', 'chess_exp_sora_a']) assert.ok(matchesSource(current[id], PRO));
  const early = referenceCatalog('act1autochess').values.chess;
  const imported = Object.values(early).find(c => c.name === '波登可' && !c.isGolden);
  assert.equal(matchesSource(imported, 'official'), false);
  assert.equal(matchesSource(imported, 'rhodes-mujica-v1'), true);
  const vigna = early.chess_char_1_05_a;
  assert.equal(matchesSource(vigna, 'official'), true);
  assert.equal(matchesSource(vigna, 'kazdel-expansion-v1'), true);
  assert.equal(matchesSource({expansionBatch: 'penguin-v1'}, PRO), true);
});

test('native multiple forms are preserved; ambiguous package reuse fails instead of picking insertion order', () => {
  const row = id => ({chessId: id, baseId: id, charId: 'char_fixture', visible: true, bonds: []});
  const base = {chess: {one: row('one'), two: row('two')}, bonds: {}};
  const unchanged = structuredClone(base);
  resolveReferenceOperators(base, unchanged, new Map());
  assert.deepEqual(unchanged, base);
  const data = structuredClone(base); data.chess.extra = row('extra');
  assert.throws(() => resolveReferenceOperators(base, data, new Map()), /多个本体配置/);
});

test('reference aliases never silently overwrite unrelated records or rewrite embedded identifiers', () => {
  const aliases = new Map([['old', 'native']]);
  assert.deepEqual(translateContentReferences({owner: 'old', embedded: 'old_suffix'}, aliases),
    {owner: 'native', embedded: 'old_suffix'});
  assert.throws(() => translateContentReferences({old: {x: 1}, native: {x: 2}}, aliases), /映射冲突/);
});

test('DIY candidates stay in the upstream self-selection path, without being promoted to preset chess', () => {
  for (const version of VERSIONS) {
    const ref = referenceCatalog(version.id).values;
    assert.ok(ref.backups.diy.ownedPool.includes('char_1035_wisdel'));
    assert.ok(!rosterOf(Object.values(ref.chess)).some(c => c.charId === 'char_1035_wisdel'));
  }
});
