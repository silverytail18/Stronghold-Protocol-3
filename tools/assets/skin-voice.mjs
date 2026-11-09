// Targeted skin voice extraction/mounting. Base voice planning remains upstream's indexVoice.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {VOICE_SLOTS, VOICE_BATTLE_SLOTS, VOICE_DIRS} from './audio.mjs';
import {contentHash} from './manifest.mjs';
import {safeName} from './sources.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const LANGS = {CN_MANDARIN: ['cn', 'voice'], JP: ['jp', 'voiceJp'], EN: ['en', 'voiceEn'], KR: ['kr', 'voiceKr']};
const FIELDS = new Set(['voice', 'voiceJp', 'voiceEn', 'voiceKr', 'voiceNative']);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));

export function planSkinVoices(skinTable, charword, assets) {
  const wanted = new Map();
  for (const [charId, char] of Object.entries(assets.chars || {})) {
    for (const skinId of Object.keys(char.skins || {})) {
      const skin = skinTable.charSkins?.[skinId];
      if (!skin?.voiceId || skin.charId !== charId) continue;
      const voiceId = skin.voiceId;
      if (!wanted.has(voiceId)) wanted.set(voiceId, []);
      wanted.get(voiceId).push({charId, skinId});
    }
  }
  const banks = [];
  for (const [voiceId, outfits] of wanted) {
    const slots = {}, seen = new Set();
    const words = Object.values(charword.charWords || {}).filter(e => e.wordKey === voiceId)
      .sort((a, b) => a.voiceIndex - b.voiceIndex);
    for (const word of words) {
      const slot = VOICE_SLOTS[word.placeType];
      if (!VOICE_BATTLE_SLOTS.includes(slot) || !/^CN_\d+$/.test(word.voiceId)) continue;
      if (!outfits.some(o => o.charId === word.charId)) throw Error('Skin voice owner mismatch: ' + voiceId);
      if (word.voiceAsset !== `${voiceId}/${word.voiceId}`) throw Error('Unexpected skin voice asset: ' + word.voiceAsset);
      if (seen.has(word.voiceId)) continue;
      seen.add(word.voiceId);
      (slots[slot] ||= []).push(word.voiceId);
    }
    if (!Object.keys(slots).length) throw Error('No skin battle voice rows: ' + voiceId);
    for (const [type, rec] of Object.entries(charword.voiceLangDict?.[voiceId]?.dict || {})) {
      const lang = LANGS[type] || (charword.voiceLangTypeDict?.[type]?.groupType === 'CUSTOM' ? ['native', 'voiceNative'] : null);
      if (!lang) continue;
      const [language, field] = lang, wordKey = rec.wordkey;
      if (!/^[A-Za-z0-9_#-]+$/.test(wordKey)) throw Error('Unsafe voice word key: ' + wordKey);
      const directory = language === 'native' ? 'voice_custom' : VOICE_DIRS[language];
      const bankKey = safeName(wordKey).toLowerCase() + '-' + sha(wordKey).slice(0, 8);
      banks.push({voiceId, wordKey, language, languageType: type, field, directory, outfits, slots,
        outputDir: `skins/voice/${language}/${bankKey}`});
    }
  }
  return {format: 1, banks};
}

// Mount only verified files, and re-read manifests at commit time to preserve other candidate work.
export function mountSkinVoices(root, extraction) {
  const localFile = path.join(root, 'data/local-assets.json'), assetFile = path.join(root, 'data/assets.json');
  const local = read(localFile), assets = read(assetFile), mounts = [];
  for (const bank of extraction.banks) {
    if (!FIELDS.has(bank.field)) throw Error('Unknown skin voice field');
    const byName = new Map();
    for (const clip of bank.clips || []) {
      if (!/^\/assets\/local\/skins\/voice\/[a-z0-9_/-]+\.mp3$/.test(clip.url)) throw Error('Unsafe skin voice URL');
      const bytes = fs.readFileSync(path.join(root, 'public', clip.url));
      if (bytes.length !== clip.size || sha(bytes) !== clip.sha256 || !(clip.decodedSeconds > 0)) throw Error('Unverified skin voice: ' + clip.url);
      byName.set(clip.name, clip.url);
      const group = path.posix.dirname(clip.url).slice('/assets/local/'.length);
      (local.groups[group] ||= {})[path.posix.basename(clip.url)] = {path: clip.url, kind: 'AudioClip'};
    }
    const slots = {};
    for (const [slot, names] of Object.entries(bank.slots)) {
      const urls = names.map(name => byName.get(name)).filter(Boolean);
      if (urls.length) slots[slot] = urls;
    }
    if (!Object.keys(slots).length) continue;
    for (const {charId, skinId} of bank.outfits) {
      const target = assets.chars?.[charId]?.skins?.[skinId], source = local.chars?.[charId]?.skins?.[skinId];
      if (!target || !source || source.voiceId !== bank.voiceId || target.voiceId !== bank.voiceId) throw Error('Skin manifest identity changed: ' + skinId);
      source[bank.field] = {...source[bank.field], ...slots};
      target[bank.field] = structuredClone(source[bank.field]);
      mounts.push({charId, skinId, field: bank.field, slots: Object.keys(slots).length, files: Object.values(slots).flat().length});
    }
  }
  const {version, hash, generator, stats, ...body} = assets;
  void version; void hash; void generator; void stats;
  const urls = new Set();
  const scan = value => {
    if (typeof value === 'string' && value.startsWith('/assets/')) urls.add(value);
    else if (value && typeof value === 'object') Object.values(value).forEach(scan);
  };
  scan(body);
  assets.hash = contentHash(body);
  assets.stats.files = urls.size;
  assets.stats.bytes = [...urls].reduce((sum, url) => sum + fs.statSync(path.join(root, 'public', url)).size, 0);
  fs.writeFileSync(localFile, JSON.stringify(local) + '\n');
  fs.writeFileSync(assetFile, JSON.stringify(assets) + '\n');
  return {mounts, assetHash: assets.hash};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, input, output] = process.argv.slice(2);
  let result;
  if (command === 'plan') {
    result = planSkinVoices(read(input), read(path.join(ROOT, '.cache/gamedata/excel/charword_table.json')), read(path.join(ROOT, 'data/assets.json')));
    result.sources = [input, path.join(ROOT, '.cache/gamedata/excel/charword_table.json')].map(file => ({file, sha256: sha(fs.readFileSync(file))}));
  } else if (command === 'mount') result = mountSkinVoices(ROOT, read(input));
  else throw Error('Usage: node tools/assets/skin-voice.mjs plan <skin_table.json> <output> | mount <extraction.json> <output>');
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({banks: result.banks?.length, mounts: result.mounts?.length, assetHash: result.assetHash}));
}
