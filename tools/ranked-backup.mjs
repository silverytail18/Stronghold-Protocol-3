// Online SQLite backup includes committed WAL data. Existing destinations are never overwritten.
import { DatabaseSync, backup } from 'node:sqlite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveStatePaths, deploymentSettings } from '../server/state-paths.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!['--source', '--output'].includes(args[i]) || !args[i+1]) throw new Error('用法：npm run ranked:backup -- [--source 数据库] [--output 新备份文件]');
  options[args[i]] = args[i+1];
}
const paths = resolveStatePaths(root, await deploymentSettings(root));
const source = path.resolve(options['--source'] || paths.rankedFile);
let output = path.resolve(options['--output'] || path.join(paths.directory, 'backups', `ranked-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`));
await fs.mkdir(path.dirname(output), { recursive: true, mode: 0o700 });
output = path.join(await fs.realpath(path.dirname(output)), path.basename(output));
for (const folder of ['public', 'assets', 'data', 'shared', 'vendor']) {
  let served; try { served = await fs.realpath(path.join(root, folder)); } catch { served = path.join(root, folder); }
  const relative = path.relative(served, output);
  if (!relative || !relative.startsWith('..'+path.sep) && relative !== '..' && !path.isAbsolute(relative)) throw new Error('备份不能存入网页可访问目录');
}
const db = new DatabaseSync(source, { readOnly: true });
try {
  if (db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value !== '1') throw new Error('源文件不是受支持的排位数据库');
  const reserved = await fs.open(output, 'wx', 0o600); await reserved.close();
  await backup(db, output);
  const copy = new DatabaseSync(output, { readOnly: true });
  try {
    if (copy.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('备份完整性校验失败');
  } finally { copy.close(); }
  console.log(`排位数据库备份完成并通过完整性校验：${output}\n请同时保留同一套账号文件：${paths.usersFile}`);
} finally { db.close(); }
