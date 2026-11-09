import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {planSkinVoices, mountSkinVoices} from '../tools/assets/skin-voice.mjs';
import {mergeLocalOperatorFallbacks} from '../tools/assets/product-content.mjs';

test('skin voice planning shares banks, follows placeType, and only plans registered dubs', () => {
  const table = {charSkins: {red: {charId: 'char_a', voiceId: 'char_a#1'}, blue: {charId: 'char_a', voiceId: 'char_a#1'}, plain: {charId: 'char_a', voiceId: null}}};
  const words = {charWords: {
    first: {wordKey: 'char_a#1', charId: 'char_a', voiceId: 'CN_022', voiceAsset: 'char_a#1/CN_022', voiceIndex: 22, placeType: 'BATTLE_SELECT'},
    second: {wordKey: 'char_a#1', charId: 'char_a', voiceId: 'CN_021', voiceAsset: 'char_a#1/CN_021', voiceIndex: 21, placeType: 'BATTLE_SELECT'},
    assistant: {wordKey: 'char_a#1', charId: 'char_a', voiceId: 'CN_001', voiceAsset: 'char_a#1/CN_001', voiceIndex: 1, placeType: 'HOME_SHOW'},
  }, voiceLangDict: {'char_a#1': {dict: {CN_MANDARIN: {wordkey: 'char_a#1'}, JP: {wordkey: 'char_a#1'}}}}};
  const assets = {chars: {char_a: {skins: {red: {}, blue: {}, plain: {}}}}};
  const plan = planSkinVoices(table, words, assets);
  assert.deepEqual(plan.banks.map(b => b.language), ['cn', 'jp']);
  assert.equal(plan.banks[0].outfits.length, 2);
  assert.deepEqual(plan.banks[0].slots, {select: ['CN_021', 'CN_022']});
  assert.ok(!plan.banks[0].outputDir.includes('#'));
  words.voiceLangDict['char_a#1'].dict.JP.wordkey = '../escape';
  assert.throws(() => planSkinVoices(table, words, assets), /Unsafe/);
});

test('verified mount preserves other records and survives upstream local-skin merge; corrupt files never commit', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-skin-voice-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const url = '/assets/local/skins/voice/jp/bank/cn_021.mp3', bytes = Buffer.from('verified media fixture');
  fs.mkdirSync(path.dirname(path.join(root, 'public', url)), {recursive: true});
  fs.writeFileSync(path.join(root, 'public', url), bytes);
  fs.mkdirSync(path.join(root, 'data'));
  const skin = {name: 'saved name', voiceId: 'bank', avatar: url};
  const assets = {chars: {char_a: {skins: {red: skin, plain: {name: 'plain'}}}}, audio: {voiceJp: {char_a: {select: ['/base.mp3']}}}, stats: {}};
  fs.writeFileSync(path.join(root, 'data/assets.json'), JSON.stringify(assets));
  fs.writeFileSync(path.join(root, 'data/local-assets.json'), JSON.stringify({groups: {}, chars: {char_a: {skins: {red: skin}}}}));
  const clip = {name: 'CN_021', url, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), decodedSeconds: 1};
  const extraction = {banks: [{voiceId: 'bank', field: 'voiceJp', outfits: [{charId: 'char_a', skinId: 'red'}], slots: {select: ['CN_021'], place: ['CN_023']}, clips: [clip]}]};
  const result = mountSkinVoices(root, extraction);
  assert.equal(result.mounts.length, 1);
  const mounted = JSON.parse(fs.readFileSync(path.join(root, 'data/assets.json')));
  assert.deepEqual(mounted.audio, assets.audio);
  assert.deepEqual(mounted.chars.char_a.skins.plain, {name: 'plain'});
  assert.deepEqual(mounted.chars.char_a.skins.red.voiceJp, {select: [url]});
  const rebuilt = {chars: {char_a: {}}}, files = new Set();
  mergeLocalOperatorFallbacks(root, rebuilt, files);
  assert.deepEqual(rebuilt.chars.char_a.skins.red.voiceJp, {select: [url]});
  assert.ok(files.has(url.slice('/assets/'.length)));
  const before = fs.readFileSync(path.join(root, 'data/assets.json'));
  fs.appendFileSync(path.join(root, 'public', url), 'corrupt');
  assert.throws(() => mountSkinVoices(root, extraction), /Unverified/);
  assert.deepEqual(fs.readFileSync(path.join(root, 'data/assets.json')), before);
});
