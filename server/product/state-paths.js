// Private deployment state is separate from source code and generated game-rule data/.
import path from 'node:path';
import { lstatSync } from 'node:fs';
import fs from 'node:fs/promises';
import { parseEnv } from 'node:util';
const exists = file => { try { lstatSync(file); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };

export function resolveStatePaths(root, env = process.env) {
  const legacyDir = path.join(root, 'config'), defaultDir = path.join(root, 'storage');
  const hasState = dir => ['auth-users.json', 'ranked.sqlite', 'ranked.sqlite-wal', 'ranked.sqlite-shm'].some(file => exists(path.join(dir, file)));
  const legacy = !env.SP_STATE_DIR && hasState(legacyDir);
  if (legacy && hasState(defaultDir) && !env.SP_AUTH_USERS_FILE && !env.SP_RANKED_FILE) {
    throw new Error('config 和 storage 都包含持久化数据，请明确设置 SP_STATE_DIR，拒绝猜测或覆盖。');
  }
  const directory = path.resolve(root, env.SP_STATE_DIR || (legacy ? legacyDir : defaultDir));
  return { directory, legacy: directory === legacyDir,
    usersFile: path.resolve(root, env.SP_AUTH_USERS_FILE || path.join(directory, 'auth-users.json')),
    rankedFile: env.SP_RANKED_FILE === ':memory:' ? ':memory:' : path.resolve(root, env.SP_RANKED_FILE || path.join(directory, 'ranked.sqlite')) };
}

export function assertStateFiles(root, paths, env = process.env) {
  if (paths.rankedFile !== ':memory:' && !exists(paths.rankedFile) && (exists(paths.rankedFile + '-wal') || exists(paths.rankedFile + '-shm'))) {
    throw new Error('排位数据库主文件缺失但存在 WAL / SHM，拒绝新建空数据库，请恢复完整文件。');
  }
  if (paths.rankedFile !== ':memory:' && (exists(paths.rankedFile) || exists(paths.rankedFile + '-wal')) && !exists(paths.usersFile)) {
    throw new Error('已有排位数据库但缺少对应账号文件，拒绝新建默认账号。请恢复同一套 auth-users.json。');
  }
  if (env.SP_STATE_DIR && !env.SP_AUTH_USERS_FILE && !exists(paths.usersFile)
      && exists(path.join(root, 'config', 'auth-users.json')) && !paths.legacy) {
    throw new Error('新数据目录尚未迁移旧账号，请先停服并运行 tools/migrate-state.mjs，拒绝初始化空账号。');
  }
}

export async function deploymentSettings(root, overrides = process.env) {
  const settings = {};
  for (const file of ['.env', '.env.local', 'config/server.env']) {
    try { Object.assign(settings, parseEnv(await fs.readFile(path.join(root, file), 'utf8'))); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  for (const key of ['SP_STATE_DIR', 'SP_AUTH_USERS_FILE', 'SP_RANKED_FILE']) if (overrides[key]) settings[key] = overrides[key];
  return settings;
}
