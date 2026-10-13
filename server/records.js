import { randomUUID } from 'node:crypto';

// Account membership is captured at admission, never accepted from a submitted result.
export function installRecords(rank) {
  rank.recordPending = new Map();
  rank.db.exec(`
    CREATE TABLE IF NOT EXISTS battle_records(id TEXT PRIMARY KEY,season_id TEXT REFERENCES seasons(id),mode TEXT NOT NULL,
      difficulty TEXT NOT NULL,ranked INTEGER NOT NULL,started_at INTEGER NOT NULL,ended_at INTEGER,
      status TEXT NOT NULL DEFAULT 'running',summary TEXT);
    CREATE TABLE IF NOT EXISTS record_members(record_id TEXT NOT NULL REFERENCES battle_records(id),account_id TEXT NOT NULL REFERENCES accounts(id),
      player_id TEXT NOT NULL,nickname TEXT NOT NULL,PRIMARY KEY(record_id,account_id));
    CREATE INDEX IF NOT EXISTS record_owner ON record_members(account_id,record_id);
    CREATE INDEX IF NOT EXISTS records_season ON battle_records(season_id,started_at DESC);
  `);
  rank.transaction(() => {
    rank.run(`INSERT OR IGNORE INTO battle_records SELECT id,season_id,mode,difficulty,1,started_at,ended_at,
      CASE WHEN status IN ('settled','pending') THEN 'finished' WHEN status='void' THEN 'interrupted' ELSE 'running' END,summary FROM matches`);
    rank.run('INSERT OR IGNORE INTO record_members SELECT match_id,account_id,player_id,nickname FROM participants');
    rank.run("UPDATE battle_records SET status='interrupted',ended_at=? WHERE status='running'", rank.now());
  });
}
export const recordMethods = {
  recordStart({ id = randomUUID(), ranked = false, mode, difficulty, seats }) {
    this.syncAccounts();
    const season = ranked ? this.one('SELECT season_id FROM matches WHERE id=?', id)?.season_id : this.current()?.id;
    this.transaction(() => {
      this.run('INSERT OR IGNORE INTO battle_records(id,season_id,mode,difficulty,ranked,started_at) VALUES(?,?,?,?,?,?)', id, season || null, mode, difficulty, +ranked, this.now());
      for (const s of seats) if (!s.isBot && s.accountId && this.one('SELECT id FROM accounts WHERE id=?', s.accountId))
        this.run('INSERT OR IGNORE INTO record_members VALUES(?,?,?,?)', id, s.accountId, s.playerId, s.name);
    });
    return id;
  },
  recordFinish(id, summary) {
    if (!id) return;
    // Private identifiers are never persisted in the shareable battle snapshot.
    const safe = { ...summary, players: (summary?.players || []).map(({ accountId, passwordHash, token, ...p }) => p) };
    const pending = this.recordPending.get(id) || { summary: JSON.stringify(safe), at: this.now() };
    this.recordPending.set(id, pending);
    try {
      this.run("UPDATE battle_records SET ended_at=?,status=?,summary=? WHERE id=? AND status='running'", pending.at,
        !summary || summary.reason === 'error' || summary.errors > 0 ? 'interrupted' : 'finished', pending.summary, id);
      this.recordPending.delete(id);
    } catch (e) { this.log.error?.('[records] 记录待重试', e.message); }
  },
  recordInterrupt(id) { if (id) this.run("UPDATE battle_records SET status='interrupted',ended_at=? WHERE id=? AND status='running'", this.now(), id); },
  records(accountId, { page = 0, mode = '', kind = '' } = {}) {
    if (!['','solo','coop'].includes(mode) || !['','ranked','normal'].includes(kind)) throw Object.assign(new Error('对局筛选参数无效'), { status: 400 });
    const season = this.current() || this.one("SELECT * FROM seasons WHERE state='archived' ORDER BY number DESC LIMIT 1");
    if (!season) return { season: null, total: 0, rows: [], page };
    const where = 'p.account_id=? AND r.season_id=?' + (mode ? ' AND r.mode=?' : '') + (kind ? ' AND r.ranked=?' : '');
    const args = [accountId, season.id, ...(mode ? [mode] : []), ...(kind ? [+(kind === 'ranked')] : [])];
    const total = this.one(`SELECT COUNT(*) n FROM battle_records r JOIN record_members p ON p.record_id=r.id WHERE ${where}`, ...args).n;
    const rows = this.all(`SELECT r.*,p.player_id,p.nickname,m.status ranked_status,m.void_reason,l.before_points,l.after_points,l.reason score_reason,l.victory score_victory
      FROM battle_records r JOIN record_members p ON p.record_id=r.id LEFT JOIN matches m ON m.id=r.id
      LEFT JOIN ledger l ON l.match_id=r.id AND l.account_id=p.account_id WHERE ${where} ORDER BY r.started_at DESC,r.id DESC LIMIT 20 OFFSET ?`, ...args, page * 20)
      .map(({ summary, ...r }) => { const s = summary ? JSON.parse(summary) : null; const me = s?.players?.find(p => p.playerId === r.player_id);
        return { ...r, victory: r.score_victory == null ? !!s?.victory : !!r.score_victory, hidden: !!s?.hiddenCleared,
          roundsPassed: s?.roundsPassed ?? 0, player: me ? { name: me.name, bandId: me.bandId, stats: me.stats, lp: me.lp } : null }; });
    return { season: { id: season.id, name: season.name, state: season.state }, total, page, rows };
  },
  recordDetail(accountId, id) {
    const row = this.one(`SELECT r.*,p.player_id FROM battle_records r JOIN record_members p ON p.record_id=r.id WHERE r.id=? AND p.account_id=?`, id, accountId);
    if (!row) throw Object.assign(new Error('对局不存在或不属于当前账号'), { status: 404 });
    const summary = row.summary ? JSON.parse(row.summary) : null;
    if (summary?.players) summary.players = summary.players.map(({ accountId, token, passwordHash, ...p }) => p);
    const ranking = row.ranked ? this.one(`SELECT m.status,m.void_reason,l.nominal,l.before_points,l.after_points,l.reason,l.victory,l.hidden
      FROM matches m LEFT JOIN ledger l ON l.match_id=m.id AND l.account_id=? WHERE m.id=?`, accountId, id) : null;
    return { ...row, summary, ranking, season: this.one('SELECT name,number FROM seasons WHERE id=?', row.season_id) };
  },
};
