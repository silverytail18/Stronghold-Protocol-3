// Read-only validation; never constructs MizukiStore or upgrades a database.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
export function mizukiDatabaseInfo(filename, accountIds) {
  const db = new DatabaseSync(filename, { readOnly: true });
  const fail = text => { throw Error('水月存档：' + text); };
  try {
    db.exec('BEGIN');
    if (db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value !== '1') fail('未知格式');
    if (db.prepare('PRAGMA integrity_check').get()?.integrity_check !== 'ok'
      || db.prepare('PRAGMA foreign_key_check').all().length) fail('数据库完整性错误');
    const tables = {};
    const hasAudit = !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_audit'").get();
    for (const table of ['metadata', 'profiles', 'runs', 'participants', 'active_accounts', 'ledger', 'results', 'outbox', ...(hasAudit ? ['admin_audit'] : [])]) {
      const hash = createHash('sha256'); let rows = 0;
      const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
      if (!columns.length) fail('缺少表 ' + table);
      for (const row of db.prepare(`SELECT * FROM ${table} ORDER BY ${columns.join(',')}`).iterate()) {
        hash.update(JSON.stringify(row) + '\n'); rows++;
      }
      tables[table] = { rows, sha256: hash.digest('hex') };
    }
    for (const { account_id } of db.prepare('SELECT account_id FROM active_accounts').all())
      if (!accountIds.has(account_id)) fail('探索账号与账号文件未配对');
    if (db.prepare(`SELECT 1 FROM active_accounts a JOIN runs r ON r.id=a.run_id
      WHERE r.status NOT IN ('running','suspended') OR NOT EXISTS
      (SELECT 1 FROM participants p WHERE p.run_id=a.run_id AND p.account_id=a.account_id) LIMIT 1`).get()) fail('活动锁不一致');
    if (db.prepare(`SELECT 1 FROM participants p JOIN runs r ON r.id=p.run_id
      WHERE r.status IN ('running','suspended') AND NOT EXISTS
      (SELECT 1 FROM active_accounts a WHERE a.run_id=p.run_id AND a.account_id=p.account_id)
      AND NOT EXISTS (SELECT 1 FROM results s WHERE s.run_id=p.run_id AND s.account_id=p.account_id) LIMIT 1`).get()) fail('活动探索缺少账号锁');
    for (const run of db.prepare('SELECT id,seq,epoch,status FROM runs').iterate()) {
      const ledger = db.prepare('SELECT COUNT(*) n,MAX(seq) seq FROM ledger WHERE run_id=?').get(run.id);
      if (ledger.n !== run.seq || (ledger.seq || 0) !== run.seq) fail('探索账本修订不连续');
      if (db.prepare('SELECT 1 FROM ledger WHERE run_id=? AND epoch>? LIMIT 1').get(run.id, run.epoch)) fail('探索租约损坏');
    }
    const running = db.prepare("SELECT COUNT(*) n FROM runs WHERE status='running'").get().n;
    const suspended = db.prepare("SELECT COUNT(*) n FROM runs WHERE status='suspended'").get().n;
    return { schema: 1, tables, running, suspended, ready: running === 0 };
  } finally { db.close(); }
}
