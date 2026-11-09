// Reuse this installation's art without importing its gameplay tables into the isolated mode.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'data', name + '.json'), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(root, 'data/zhajing', name + '.json'), JSON.stringify(value) + '\n');
const extra = read('zhajing/presentation-extra');
const assets = read('assets');
for (const [section, records] of Object.entries(extra.assets)) assets[section] = {...assets[section], ...records};
write('assets', assets);
const local = read('local-assets');
local.groups = {...local.groups, ...extra.local.groups};
local.chars = {...local.chars, ...extra.local.chars};
write('local-assets', local);
write('local-fx', read('local-fx'));
// Skins are presentation only. Keep the current installation's supported outfits.
write('skins', {version: 1, chars: Object.fromEntries(Object.entries(assets.chars).map(([id, char]) => [id, char.skins || {}]))});
console.log('炸惊展示索引已同步；独立规则数据保持不变。');
