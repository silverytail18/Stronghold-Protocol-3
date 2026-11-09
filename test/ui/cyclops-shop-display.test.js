import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('shop level card uses the private Cyclops XP contract and preserves standard upgrade rendering', () => {
  const src = readFileSync(join(ROOT, 'public/js/ui/shopBar.js'), 'utf8');
  assert.match(src, /expMode=\$\{Number\.isFinite\(priv\?\.shopExp\) && Number\.isFinite\(priv\?\.expNeeded\)\}/);
  assert.match(src, /const badge = expMode && !max && exp != null && need != null \? `\$\{exp\}\/\$\{need\}` : null/);
  assert.match(src, /expMode \? \(armed \? t\('确认购买'\) : t\('购买经验'\)\)/);
  assert.match(src, /badge \?\? price/);
  assert.match(src, /升级调度中心（\{price\} 资金）/);
});
