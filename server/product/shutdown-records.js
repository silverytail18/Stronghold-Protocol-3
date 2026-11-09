// Only unfinished, result-less records are removed. Finished results and pending settlements stay intact.
export function clearUnfinishedRecords(db, { pendingIds = [] } = {}) {
  const protectedIds = new Set(pendingIds);
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name));
  if (!tables.has('matches')) throw Error('未找到现有对局表，拒绝创建或重置数据库');
  const records = tables.has('battle_records'), ledger = tables.has('ledger');
  const completed = records ? " AND NOT EXISTS (SELECT 1 FROM battle_records r WHERE r.id=m.id AND (r.summary IS NOT NULL OR r.status='finished'))" : '';
  const scored = ledger ? ' AND NOT EXISTS (SELECT 1 FROM ledger l WHERE l.match_id=m.id)' : '';
  db.exec('BEGIN IMMEDIATE');
  try {
    const matches = db.prepare("SELECT m.id FROM matches m WHERE m.status='running' AND m.summary IS NULL" + completed + scored).all().filter(row => !protectedIds.has(row.id));
    const matchIds = new Set(matches.map(row => row.id));
    const histories = records ? db.prepare("SELECT r.id FROM battle_records r LEFT JOIN matches m ON m.id=r.id WHERE r.status='running' AND r.summary IS NULL AND (m.id IS NULL OR m.status='running' AND m.summary IS NULL)").all().filter(row => !protectedIds.has(row.id) && (!db.prepare('SELECT 1 FROM matches WHERE id=?').get(row.id) || matchIds.has(row.id))) : [];
    for (const row of histories) {
      if (tables.has('record_members')) db.prepare('DELETE FROM record_members WHERE record_id=?').run(row.id);
      db.prepare("DELETE FROM battle_records WHERE id=? AND status='running' AND summary IS NULL").run(row.id);
    }
    for (const row of matches) {
      for (const table of ['locks', 'abandons', 'participants']) if (tables.has(table)) db.prepare('DELETE FROM ' + table + ' WHERE match_id=?').run(row.id);
      db.prepare("DELETE FROM matches WHERE id=? AND status='running' AND summary IS NULL").run(row.id);
    }
    db.exec('COMMIT');
    return { matches: matches.length, records: histories.length };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
