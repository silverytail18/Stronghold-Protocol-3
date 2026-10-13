// Offline account administration. Passwords are read without echo and never passed as command arguments.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword, validUsername, validateUsers, writeUserStore } from '../server/auth.js';
import { resolveStatePaths, deploymentSettings, assertStateFiles } from '../server/state-paths.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const settings = await deploymentSettings(root), paths = resolveStatePaths(root, settings);
assertStateFiles(root, paths, settings);
const filename = paths.usersFile;

async function secret(prompt) {
  if (!process.stdin.isTTY) throw new Error('请在交互终端运行，密码不会回显');
  process.stdout.write(prompt);
  const input = process.stdin;
  input.setRawMode(true);
  input.resume();
  input.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const done = (err) => {
      input.off('data', onData); input.setRawMode(false); input.pause(); process.stdout.write('\n');
      if (err) reject(err); else resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\u0003') { done(new Error('已取消')); return; }
        if (char === '\r' || char === '\n') { done(); return; }
        if (char === '\b' || char === '\u007f') value = [...value].slice(0, -1).join('');
        else if (char >= ' ') value += char;
      }
    };
    input.on('data', onData);
  });
}

async function main() {
  const [command, username, ...extra] = process.argv.slice(2);
  if (!['add', 'remove', 'list'].includes(command) || extra.length || (command !== 'list' && !validUsername(username))) {
    throw new Error('用法：npm run auth:user -- add <账号> | remove <账号> | list\n账号限 1–64 个字母、数字、下划线、点或短横线。add 可创建账号或重置密码。');
  }
  let config;
  try {
    config = JSON.parse(await fs.readFile(filename, 'utf8'));
    config.users = [...validateUsers(config).values()];
  }
  catch (e) {
    if (e.code !== 'ENOENT' || command !== 'add') throw e;
    config = { version: 1, users: [] };
  }
  if (command === 'list') {
    console.log(config.users.map((u) => `${u.username}\t${u.role === 'admin' ? '管理员' : '普通用户'}\t${u.disabled ? '已禁用' : '已启用'}`).join('\n')); return;
  }
  if (command === 'add') {
    const password = await secret('输入密码（至少 6 个字符，不回显）：');
    const confirmation = await secret('再次输入密码：');
    if (password !== confirmation) throw new Error('两次密码不一致');
    const passwordHash = await hashPassword(password);
    const previous = config.users.find((u) => u.username === username);
    const role = previous?.role ?? (config.users.length ? 'user' : 'admin');
    config.users = config.users.filter((u) => u.username !== username);
    config.users.push({ username, passwordHash, role, ...(previous?.accountId ? { accountId: previous.accountId } : {}), disabled: false, mustChangePassword: false });
  } else {
    if (!config.users.some((u) => u.username === username)) throw new Error('账号不存在');
    if (config.users.length === 1) throw new Error('不能删除最后一个账号，请先添加其他账号');
    config.users = config.users.filter((u) => u.username !== username);
  }
  const users = validateUsers(config);
  await fs.mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  await writeUserStore(filename, users);
  console.log(`账号文件已更新：${filename}\n请重启服务器，使账号变更生效并撤销现有登录会话。`);
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; });
