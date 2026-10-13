// Read-only audit of the original checkout. Writes the baseline only in this copy.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const original = path.join(path.dirname(root), 'Stronghold-Protocol');
const manifest = path.join(root, '.cache', 'original-sha256.json');
const hashes = {};
async function walk(dir, relative = '') {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (['.git', '.cache', 'node_modules'].includes(entry.name)) continue;
    const rel = path.join(relative, entry.name);
    if (entry.isDirectory()) await walk(path.join(dir, entry.name), rel);
    else if (entry.isFile()) hashes[rel] = createHash('sha256').update(await fs.readFile(path.join(dir, entry.name))).digest('hex');
  }
}
await walk(original);
if (process.argv.includes('--baseline')) {
  await fs.mkdir(path.dirname(manifest), { recursive: true });
  await fs.writeFile(manifest, JSON.stringify(hashes));
  console.log(`已记录原项目 ${Object.keys(hashes).length} 个文件的 SHA-256（不含 Git、缓存及依赖目录）`);
} else {
  const previous = JSON.parse(await fs.readFile(manifest, 'utf8'));
  const changed = [...new Set([...Object.keys(previous), ...Object.keys(hashes)])].filter(key => hashes[key] !== previous[key]);
  if (changed.length) { console.error('原项目文件发生变化：', changed); process.exitCode = 1; }
  else console.log(`原项目 ${Object.keys(hashes).length} 个文件全部保持不变`);
}
