import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {effectIconUrl, chessAvatarUrl} from '../../public/js/ui/assetUrls.js';

const assets = JSON.parse(fs.readFileSync(new URL('../../data/assets.json', import.meta.url)));
const gifts = JSON.parse(fs.readFileSync(new URL('../../data/cyclops.json', import.meta.url))).hexes;

test('全部48个馈赠品质组合可解析为当前客户端实际持有的本地素材', () => {
  const icons = new Set();
  for (const card of gifts) for (const quality of ['silver', 'gold', 'prismatic']) {
    const url = effectIconUrl(assets, {iconKind: 'cyclops', iconId: card.logo, data: {quality}});
    assert.match(url, /^\/assets\//, card.id + '/' + quality);
    assert.ok(fs.statSync(new URL('../../public' + url, import.meta.url)).size > 0, url);
    icons.add(url);
  }
  assert.ok(icons.size >= 12, 'bond families and generic gifts retain distinct official art');
});

test('参考仓库的品质专用素材若已进入资源清单则优先使用，不拼接不存在的资源路径', () => {
  assert.equal(effectIconUrl({ui: {'cyclopsIcon/economy_gold': '/assets/quality.svg'}}, {iconKind: 'cyclops', iconId: 'cyclopsIcon/economy', data: {quality: 'gold'}}), '/assets/quality.svg');
  assert.equal(effectIconUrl(null, {iconKind: 'cyclops', iconId: 'cyclopsIcon/missing', data: {quality: 'gold'}}), null);
});

test('选秀头像使用干员素材身份及精锐头像，不依赖charId必须直接命中', () => {
  const m = {chars: {source: {avatar: '/base.png', avatarE2: '/elite.png'}}};
  assert.equal(chessAvatarUrl(m, {charId: 'custom', assets: {avatar: 'source_2'}, isGolden: true}), '/elite.png');
});
