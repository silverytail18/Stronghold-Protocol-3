import test from 'node:test';
import assert from 'node:assert/strict';
import {isAlternateGameplay, buildRecord, buildQuitRecord, normalizeRecord, emptyStats, appendRecord,
  migrateStats, mergeStats, aggregateStats, countsTowardStats, highestBondRecord, achievementRecords,
  strategyBadgeIds, createLiveMatch, observeMatch, recordToResult, loadStats, saveStats, recordResult} from '../../shared/stats.js';
import {productFixture, login} from './fixture.js';

const modes = [
  {variant: 'entertainment_mizuki', modeId: 'mode_mizuki', difficulty: 'NORMAL'},
  {variant: 'entertainment_zhajing', modeId: 'mode_single_zhajing', difficulty: 'ZHAJING'},
  {variant: 'entertainment_cyclops', modeId: 'mode_cyclops', difficulty: 'NORMAL'},
];
const summary = (extra = {}) => ({victory: true, modeId: 'mode_multi_normal', difficulty: 'NORMAL', seed: 123,
  roundsPassed: 14, hiddenReached: true, hiddenCleared: true, durationMs: 1000,
  players: [{playerId: 'self', alive: true, victory: true, roundsPassed: 14, reward: 100,
    trophies: 20, bandId: 'band_test', bonds: [{bondId: 'test', active: true, layers: 9}], stats: {gold: 99, kills: 88}}], ...extra});
const ctx = {myId: 'self', roomMode: 'coop', now: 1000};

for (const mode of modes) test(`${mode.variant}: new results, quits, legacy imports and every aggregate stay excluded`, () => {
  const normal = buildRecord(summary(), ctx);
  const raw = {...normal, ...mode, id: mode.variant};
  assert.equal(isAlternateGameplay(raw), true);
  assert.equal(buildRecord(summary(mode), ctx), null);
  assert.equal(buildRecord(summary(), {...ctx, variant: mode.variant}), null, 'room context also rejects markerless results');
  assert.equal(normalizeRecord(raw), null);
  const {variant: _variant, ...legacy} = raw;
  assert.equal(normalizeRecord(legacy), null, 'old schemas discarded variant but retained modeId');
  assert.equal(appendRecord(emptyStats(), raw).added, false);
  assert.deepEqual(migrateStats({v: 3, records: [raw, legacy, normal]}).stats.records.map(r => r.id), [normal.id]);
  assert.deepEqual(mergeStats({records: [raw]}, {records: [legacy, normal]}).records.map(r => r.id), [normal.id]);
  assert.equal(countsTowardStats(raw), false);
  for (const modded of [false, true]) {
    assert.deepEqual(aggregateStats([raw, normal], {modded}), aggregateStats([normal], {modded}));
    assert.deepEqual(achievementRecords([raw, normal], modded), [normal]);
  }
  assert.equal(highestBondRecord([raw]), null);
  assert.deepEqual(strategyBadgeIds([raw], {band_test: {bandId: 'band_test', victorCount: 1}}), []);
  assert.equal(recordToResult(raw), null);
  const state = {me: {playerId: 'self'}, room: {mode: 'coop', variant: mode.variant},
    match: {public: {...summary(mode), phase: 'SETTLE', round: 5}}};
  const live = createLiveMatch(); observeMatch(live, state, 100);
  assert.equal(buildQuitRecord(state, {live, now: 1000}), null);
  delete state.match.public.variant; state.match.public.modeId = 'mode_multi_normal';
  assert.equal(buildQuitRecord(state, {live, now: 1000}), null, 'room marker covers incomplete public frames');
});

test('legacy Zhajing difficulty, coop Zhajing and future hall variants excluded; original/plugin/cosmetic rules retained', () => {
  for (const marker of [{difficulty: 'ZHAJING'}, {modeId: 'mode_multi_zhajing'}, {variant: 'entertainment_future'}]) {
    assert.equal(buildRecord(summary(marker), ctx), null);
  }
  const normal = buildRecord(summary(), ctx);
  const cosmetic = buildRecord(summary(), {...ctx, content: {vanilla: true, vs: 'a'.repeat(64)}});
  const plugin = buildRecord(summary(), {...ctx, content: {cs: 'a'.repeat(64), plugins: ['test@1']}});
  assert.ok(normal && cosmetic && plugin);
  assert.equal(aggregateStats([plugin], {modded: true}).count, 1);
  assert.equal(aggregateStats([plugin], {modded: false}).count, 0);
  assert.equal(aggregateStats([normal, cosmetic]).count, 2);
});

test('authority archive and real account/player-stat APIs exclude new and old alternate records without changing history/rank', async t => {
  const f = await productFixture(); t.after(() => f.close());
  const server = await f.start(), archive = server.product.archive, id = f.users[1].accountId;
  const beforeLedger = server.product.ranked.all('SELECT * FROM ledger');
  const beforeHistory = server.product.ranked.all('SELECT * FROM battle_records');
  const normal = buildRecord(summary(), ctx);
  const accounts = new Map([['self', id]]);
  for (const mode of modes) {
    await archive.recordSettlement({id: mode.variant, accounts, summary: summary(mode)});
    await archive.recordSettlement({id: mode.variant + '-context', accounts, variant: mode.variant, summary: summary()});
  }
  assert.equal(archive.achievements(id).revision, 0);
  await archive.importAchievements(id, {accountId: id, revision: 0, records: [normal, ...modes.map(m => ({...normal, ...m, id: m.variant}))]});
  assert.deepEqual(archive.achievements(id).records.map(r => r.id), [normal.id]);
  // Seed only the isolated fixture archive with records written by older builds.
  archive.doc.accounts[id].records.push(...modes.map(m => ({...normal, ...m, id: m.variant})));
  archive.doc.accounts[id].settlements = modes.map(m => ({id: m.variant, myId: 'self', at: 1000, summary: summary(m)}));
  await archive.recordSettlement({id: 'normal', accounts, summary: summary(), at: 2000});
  const member = await login(server.url, 'member');
  const get = async endpoint => {const r = await fetch(server.url + endpoint, {headers: {Cookie: member.cookie}}); assert.equal(r.status, 200); return r.json();};
  const cloud = await get('/product/achievements');
  assert.ok(cloud.records.some(r => r.id === normal.id));
  assert.ok(cloud.records.every(r => !isAlternateGameplay(r)), 'normal server battle history is merged but alternate records stay excluded');
  assert.deepEqual(cloud.settlements.map(r => r.id), ['normal']);
  const view = await get('/auth/player-stats?accountId=' + id);
  assert.ok(view.records.length > 0);
  assert.ok(view.records.every(r => !isAlternateGameplay(r)));
  assert.deepEqual(server.product.ranked.all('SELECT * FROM ledger'), beforeLedger);
  assert.deepEqual(server.product.ranked.all('SELECT * FROM battle_records'), beforeHistory);
});

test('old local cache reload and new result recording cannot reintroduce alternate settlements', t => {
  const previous = globalThis.localStorage, values = new Map();
  globalThis.localStorage = {getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k)};
  t.after(() => {if (previous === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous;});
  const normal = buildRecord(summary(), ctx);
  values.set('sp.pref.stats', JSON.stringify({v: 3, records: [normal, ...modes.map(m => ({...normal, ...m, id: m.variant}))]}));
  assert.deepEqual(loadStats().records.map(r => r.id), [normal.id]);
  for (const mode of modes) assert.equal(recordResult(summary(mode), ctx), null);
  assert.equal(saveStats({v: 3, records: [normal, ...modes.map(m => ({...normal, ...m, id: m.variant}))]}), true);
  assert.deepEqual(JSON.parse(values.get('sp.pref.stats')).records.map(r => r.id), [normal.id]);
});
