import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {AudioManager, voiceLine, skinVoiceAudio, VOICE_TREES, audio, installAudio} from '../../public/js/audio.js';
import {operatorVoiceOptions} from '../../public/js/ui/operatorVoice.js';
import {readAssetOverlay} from '../../shared/plugins/visual.js';
import {schemaValidator} from '../helpers/jsonSchema.js';

const ID = 'char_fixture';
const base = {voice: {[ID]: {start: '/base/cn_001.mp3', select: '/base/cn_021.mp3', place: '/base/cn_023.mp3'}}};
const outfit = {voice: {select: '/skin/cn_021.mp3'}, voiceJp: {select: '/skin-jp/cn_021.mp3'}};
function manager(manifest) {
  const a = new AudioManager({getManifest: () => manifest});
  a.ctx = {}; a.voiceGain = {};
  a._playVoice = (url, token, volume, fallback) => a.played.push({url, fallback});
  a.played = []; return a;
}

test('PR734 six-argument voiceLine preserves defaults and uses outfit lines per slot', () => {
  assert.equal(voiceLine(base, ID, 'select', 'cn', () => 0, outfit.voice).url, '/skin/cn_021.mp3');
  assert.equal(voiceLine(base, ID, 'place', 'cn', () => 0, outfit.voice).url, '/base/cn_023.mp3');
  assert.deepEqual(voiceLine(base, ID, 'select', 'cn', () => 0, {select: []}), voiceLine(base, ID, 'select', 'cn', () => 0));
  assert.deepEqual(voiceLine(base, ID, 'select'), {url: '/base/cn_021.mp3', fallback: null});
});

test('every existing dub accepts optional outfit slots without forcing CN or mutating the manifest', () => {
  const all = structuredClone(base), skin = structuredClone(outfit);
  for (const tree of Object.values(VOICE_TREES)) {
    all[tree] = {[ID]: {select: '/base-' + tree + '/cn_021.mp3', place: '/base-' + tree + '/cn_023.mp3'}};
    skin[tree] = {select: '/skin-' + tree + '/cn_021.mp3'};
  }
  const before = JSON.stringify(all), merged = skinVoiceAudio(all, ID, skin);
  for (const [lang, tree] of Object.entries(VOICE_TREES)) {
    assert.equal(voiceLine(merged, ID, 'select', lang).url, '/skin-' + tree + '/cn_021.mp3');
    assert.equal(voiceLine(merged, ID, 'place', lang).url, '/base-' + tree + '/cn_023.mp3');
    assert.equal(voiceLine(merged, ID, 'select', lang).fallback, '/skin/cn_021.mp3');
  }
  assert.equal(JSON.stringify(all), before);
  assert.equal(skinVoiceAudio(all, ID, null), all);
});

test('JP-only outfit can play and preview when no CN or base JP bank exists', () => {
  const skin = {voiceJp: {select: '/jp-only/cn_021.mp3'}}, manifest = {audio: {}, chars: {[ID]: {skins: {jpOnly: skin}}}};
  const a = manager(manifest); a.setVoiceLang('jp');
  assert.equal(a.voice(ID, 'select', {skinKey: 'jpOnly'}), true);
  assert.equal(a.played[0].url, '/jp-only/cn_021.mp3');
  assert.equal(a.previewVoice(ID, 'jp', {skinKey: 'jpOnly'}), true);
  assert.equal(a.played[1].url, '/jp-only/cn_021.mp3');
  assert.ok(operatorVoiceOptions(skinVoiceAudio({}, ID, skin), ID, '').some(o => o.value === 'jp' && !o.unavailable));
  a.volumes.muted = true;
  assert.equal(a.voice(ID, 'select', {skinKey: 'jpOnly'}), false);
  a.volumes.muted = false; a.volumes.voice = 0;
  assert.equal(a.previewVoice(ID, 'jp', {skinKey: 'jpOnly'}), false);
});

test('same operator on two seats resolves each owner separately, including default and reconnect updates', () => {
  const a = manager({audio: base, chars: {[ID]: {skins: {red: outfit, blue: {voice: {select: '/blue/cn_021.mp3'}}}}}});
  a.setSkins([{playerId: 'p1', skins: {[ID]: 'red'}}, {playerId: 'p2', skins: {[ID]: 'blue'}}]);
  a._track({id: 1, ownerId: 'p1', kind: 'op', side: 'ally', voice: ID});
  a._track({id: 2, ownerId: 'p2', kind: 'op', side: 'ally', voice: ID});
  for (const [id, expected] of [[1, '/skin/cn_021.mp3'], [2, '/blue/cn_021.mp3']]) {
    a.voiceGate.reset(); assert.ok(a.voice(ID, 'select', {unitKey: id})); assert.equal(a.played.at(-1).url, expected);
  }
  a.setSkins([{playerId: 'p1', skins: {}}, {playerId: 'p2', skins: {[ID]: 'blue'}}]);
  assert.equal(a.skinKeyFor(ID, 'p1'), null);
  a.voiceGate.reset(); a.voice(ID, 'select', {unitKey: 1});
  assert.equal(a.played.at(-1).url, '/base/cn_021.mp3');
  assert.equal(a.voiceOutfit(ID, {ownerId: 'unknown'}), null);
  assert.equal(a.voiceOutfit(ID, {unitKey: 2, skinKey: null}), null);
});

test('deployment/start and skill events pass owner context to outfit playback', () => {
  const slots = {start: '/skin/start.mp3', place: '/skin/place.mp3', skill1: '/skin/skill.mp3'};
  const a = manager({audio: base, chars: {[ID]: {skins: {event: {voice: slots}}}}});
  a.setSkins([{playerId: 'p1', skins: {[ID]: 'event'}}]);
  a._track({id: 1, ownerId: 'p1', kind: 'op', side: 'ally', voice: ID, spine: ID, skillIndex: 0});
  a.handleBattleEvents([['deploy', 1]]);
  assert.equal(a.played.at(-1)?.url, '/skin/start.mp3');
  a.voiceGate.reset(); a.handleBattleEvents([['skill', 1, 1]]);
  assert.equal(a.played.at(-1)?.url, '/skin/skill.mp3');
});

test('plugin schema and runtime accept all five outfit voice trees, and reject invalid slot names', () => {
  const schema = schemaValidator(fileURLToPath(new URL('../../schemas/', import.meta.url)));
  const voices = Object.fromEntries(['voice', ...Object.values(VOICE_TREES)].map(tree => [tree, {select: 'voice/select.mp3'}]));
  const overlay = {chars: {[ID]: {skins: {sample: voices}}}};
  const context = {vanilla: {chars: {[ID]: {}}}, permissions: ['assets.add', 'assets.override'], has: p => p === 'voice/select.mp3'};
  assert.deepEqual(schema.validate('overlay.schema.json', overlay), []);
  const result = readAssetOverlay(overlay, context);
  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.warnings, []);
  const bad = structuredClone(overlay); bad.chars[ID].skins.sample.voiceJp['invalid/name'] = 'voice/select.mp3';
  assert.ok(schema.validate('overlay.schema.json', bad).length);
  const checked = readAssetOverlay(bad, context);
  assert.ok(checked.problems.length || checked.warnings.length);
});

test('public player state drives outfit ownership before any renderer and updates within the same phase', () => {
  let callback;
  const state = {match: {public: {phase: 'PREP', players: [{playerId: 'p1', skins: {[ID]: 'red'}}]}}};
  const bgm = audio.playBgm;
  audio.playBgm = () => {};
  try {
    installAudio({getManifest: () => null, getState: () => state, selectRoute: () => 'game',
      subscribe: fn => { callback = fn; return () => {}; }});
    assert.equal(audio.skinKeyFor(ID, 'p1'), 'red');
    const next = {match: {public: {...state.match.public, players: [{playerId: 'p1', skins: {[ID]: 'blue'}}]}}};
    callback(next, state);
    assert.equal(audio.skinKeyFor(ID, 'p1'), 'blue');
    callback({match: null}, next);
    assert.equal(audio.skinKeyFor(ID, 'p1'), null);
  } finally { audio.playBgm = bgm; audio.setSkins([]); }
});
