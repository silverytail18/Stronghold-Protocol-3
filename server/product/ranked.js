import { installRecords, recordMethods } from './records.js';
import { clearUnfinishedRecords } from './shutdown-records.js';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync, realpathSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { RANK_RULES, rankOf, rankedDifficultyAllowed, validateRankRules, rankedDelta } from './rank-rules.js';
import {rankedSummary} from '../../shared/ranked-summary.js';
import {unlockedRankNameCards} from '../../shared/nameCards.js';
import {installCompetitive} from './competitive.js';
import {competitive} from '../../shared/competitive.js';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const parse = value => value == null ? null : JSON.parse(value);
const seasonView = row => row ? { ...row, rules: parse(row.rules) } : null;
const send = (res, status, value) => {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
};

// Synchronous short transactions keep admission, account locks and score writes indivisible.
export class Ranked {
  constructor({ filename, auth, log = console, now = Date.now, maxMatches = 4, drainMs = 600000, servedRoots = [] }) {
    this.auth = auth; this.log = log; this.now = now;
    this.maxMatches = Number(maxMatches); this.drainMs = drainMs;
    if (!Number.isInteger(this.maxMatches) || this.maxMatches < 1 || this.maxMatches > 100) throw new Error('SP_RANKED_MAX_MATCHES 必须为 1–100');
    this.pending = new Map(); this.onSettled = () => {}; this.onVoid = () => {}; this.onSeason = () => {};
    if (filename !== ':memory:') {
      const full = path.resolve(filename);
      mkdirSync(path.dirname(full), { recursive: true, mode: 0o700 });
      const parent = realpathSync(path.dirname(full));
      const target = path.join(parent, path.basename(full));
      let actual = target;
      try { actual = realpathSync(target); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      for (const root of servedRoots) {
        let canonical; try { canonical = realpathSync(root); } catch { canonical = path.resolve(root); }
        const rel = path.relative(canonical, actual);
        if (!rel || !rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel)) throw new Error('排位数据库不能放在网页可访问目录中');
      }
      filename = actual;
    }
    this.db = new DatabaseSync(filename, { timeout: 5000 });
    try {
      const existingTables = this.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      if (existingTables.length) {
        if (!existingTables.some(t => t.name === 'metadata') || !['1','2'].includes(this.one('SELECT value FROM metadata WHERE key=?', 'schema')?.value)) throw new Error('排位数据库版本未知，拒绝覆盖已有数据');
      }
      this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA synchronous=FULL;');
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY, public_no INTEGER UNIQUE NOT NULL, nickname TEXT NOT NULL, visible INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS seasons(id TEXT PRIMARY KEY, number INTEGER UNIQUE NOT NULL, name TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('draft','active','closing','archived')),
          paused INTEGER NOT NULL DEFAULT 0, starts_at INTEGER, ends_at INTEGER, close_at INTEGER, next_id TEXT, rules TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
        CREATE UNIQUE INDEX IF NOT EXISTS one_current_season ON seasons((1)) WHERE state IN ('active','closing');
        CREATE TABLE IF NOT EXISTS standings(season_id TEXT NOT NULL REFERENCES seasons(id), account_id TEXT NOT NULL REFERENCES accounts(id),
          points INTEGER NOT NULL DEFAULT 0 CHECK(points>=0), peak INTEGER NOT NULL DEFAULT 0, games INTEGER NOT NULL DEFAULT 0, wins INTEGER NOT NULL DEFAULT 0,
          hidden INTEGER NOT NULL DEFAULT 0, achieved_at INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(season_id,account_id));
        CREATE TABLE IF NOT EXISTS matches(id TEXT PRIMARY KEY, season_id TEXT NOT NULL REFERENCES seasons(id), mode TEXT NOT NULL, difficulty TEXT NOT NULL, room_code TEXT NOT NULL,
          rules TEXT NOT NULL, started_at INTEGER NOT NULL, ended_at INTEGER, status TEXT NOT NULL CHECK(status IN ('running','pending','settled','void')),
          summary TEXT, void_reason TEXT);
        CREATE TABLE IF NOT EXISTS participants(match_id TEXT NOT NULL REFERENCES matches(id), account_id TEXT NOT NULL REFERENCES accounts(id), player_id TEXT NOT NULL,
          nickname TEXT NOT NULL, forfeit INTEGER NOT NULL DEFAULT 0, after_clear INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(match_id,account_id));
        CREATE TABLE IF NOT EXISTS locks(account_id TEXT PRIMARY KEY REFERENCES accounts(id), match_id TEXT NOT NULL REFERENCES matches(id));
        CREATE TABLE IF NOT EXISTS ledger(seq INTEGER PRIMARY KEY AUTOINCREMENT, match_id TEXT NOT NULL REFERENCES matches(id), account_id TEXT NOT NULL REFERENCES accounts(id),
          nominal INTEGER NOT NULL, before_points INTEGER NOT NULL, after_points INTEGER NOT NULL, victory INTEGER NOT NULL, hidden INTEGER NOT NULL, reason TEXT NOT NULL,
          created_at INTEGER NOT NULL, UNIQUE(match_id,account_id));
        CREATE TABLE IF NOT EXISTS abandons(match_id TEXT NOT NULL, account_id TEXT NOT NULL, created_at INTEGER NOT NULL, until_at INTEGER NOT NULL, PRIMARY KEY(match_id,account_id));
        CREATE TABLE IF NOT EXISTS audit(seq INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL);
        CREATE INDEX IF NOT EXISTS standings_board ON standings(season_id,points DESC,achieved_at);
        CREATE INDEX IF NOT EXISTS ledger_history ON ledger(account_id,seq DESC);
      `);
      const schema = this.one('SELECT value FROM metadata WHERE key=?', 'schema');
      if (schema && !['1','2'].includes(schema.value)) throw new Error('不支持此排位数据库版本');
      this.run('INSERT OR IGNORE INTO metadata VALUES(?,?)', 'schema', '1');
      this.syncAccounts();
      if (!this.one('SELECT id FROM seasons LIMIT 1')) {
        this.run('INSERT INTO seasons(id,number,name,state,starts_at,rules) VALUES(?,?,?,?,?,?)', randomUUID(), 1, 'S1 初始赛季', 'active', this.now(), JSON.stringify(RANK_RULES));
      }
      installRecords(this);
      installCompetitive(this);
      // A durable final result can be retried; missing new statistics remain pending, never become a guessed zero.
      for (const match of this.all("SELECT id,summary FROM matches WHERE status='pending'")) {
        try {this.settle(match.id,parse(match.summary));}catch(error){this.pending.set(match.id,parse(match.summary));this.log.error?.('[ranked] 结果等待恢复',error.message);}
      }
      for (const match of this.all("SELECT id FROM matches WHERE status='running'")) this.voidMatch(match.id, 'system', '服务器重启，对局没有可靠最终结果');
      if (filename !== ':memory:') { try { chmodSync(filename, 0o600); } catch { /* platform ACLs */ } }
    } catch (e) { this.db.close(); throw e; }
    this.timer = setInterval(() => this.tick(), 1000).unref();
  }
  one(sql, ...args) { return this.db.prepare(sql).get(...args); }
  all(sql, ...args) { return this.db.prepare(sql).all(...args); }
  run(sql, ...args) { return this.db.prepare(sql).run(...args); }
  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); this.db.exec('COMMIT'); return value; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  audit(actor, action, target, reason = '') { this.run('INSERT INTO audit(actor,action,target,reason,created_at) VALUES(?,?,?,?,?)', actor, action, target, reason, this.now()); }
  syncAccounts() {
    if (this.syncedUsers === this.auth.users) return;
    this.transaction(() => {
      this.run('UPDATE accounts SET visible=0');
      for (const user of this.auth.users.values()) {
        this.run(`INSERT INTO accounts(id,public_no,nickname,visible) VALUES(?,(SELECT COALESCE(MAX(public_no),0)+1 FROM accounts),?,?)
          ON CONFLICT(id) DO UPDATE SET visible=excluded.visible`, user.accountId, `博士 ${user.username === 'admin' ? '管理员' : ''}`.trim(), user.disabled ? 0 : 1);
      }
    });
    this.syncedUsers = this.auth.users;
  }
  current() { return seasonView(this.one("SELECT * FROM seasons WHERE state IN ('active','closing')")); }
  standing(accountId, seasonId) {
    const row = this.one('SELECT * FROM standings WHERE season_id=? AND account_id=?', seasonId, accountId)
      || { points: 0, peak: 0, games: 0, wins: 0, hidden: 0, achieved_at: 0 };
    return { ...row, rank: rankOf(row.points), peakRank: rankOf(row.peak) };
  }
  profile(accountId) {
    const season = this.current();
    const account = this.one('SELECT public_no,nickname FROM accounts WHERE id=?', accountId);
    const standing = season ? this.standing(accountId, season.id) : { points: 0, rank: rankOf(0), peakRank: rankOf(0), games: 0, wins: 0, hidden: 0 };
    // Historical coop abandon rows remain intact but no longer restrict admission.
    const cooldown = this.one("SELECT MAX(a.until_at) AS until_at FROM abandons a JOIN matches m ON m.id=a.match_id WHERE a.account_id=? AND m.mode='solo'", accountId)?.until_at || 0;
    const lock = this.one('SELECT match_id FROM locks WHERE account_id=?', accountId);
    const abandoned=season?this.one("SELECT COUNT(*) n FROM ledger l JOIN matches m ON m.id=l.match_id WHERE l.account_id=? AND m.season_id=? AND m.status='settled' AND l.reason='abandoned'",accountId,season.id).n:0;
    return { enabled: true, season, account, ...standing, unlockedNameCards: unlockedRankNameCards(standing), ...rankedSummary({...standing,abandoned}), cooldownUntil: cooldown, cooldowns: { solo: cooldown, coop: 0 }, activeMatch: lock?.match_id ?? null, pending: this.pending.size > 0,
      maxMatches: this.maxMatches, running: this.all("SELECT id FROM matches WHERE status IN ('running','pending')").length };
  }
  qualification(accountId, difficulty, allowLocked = false, mode = 'solo') {
    if (mode !== 'solo' && mode !== 'coop') fail(409, '不支持的排位模式');
    const user = [...this.auth.users.values()].find(user => user.accountId === accountId);
    if (!user || user.disabled || user.mustChangePassword) fail(403, '账号不能参加排位，请先登录并完成初始密码修改');
    const p = this.profile(accountId);
    if (!p.season || p.season.state !== 'active' || p.season.paused || p.season.ends_at && p.season.ends_at <= this.now()) fail(409, '当前赛季暂停或正在结束，请参加普通模拟');
    if (p.pending) fail(503, '有排位结算待恢复，暂时停止新排位');
    if (mode === 'solo' && p.cooldownUntil > this.now()) fail(409, `单人排位冷却中，请在 ${Math.ceil((p.cooldownUntil - this.now()) / 60000)} 分钟后再试；多人排位不受冷却限制`);
    if (!allowLocked && p.activeMatch) fail(409, '该账号已有进行中或待结算的排位，请恢复原对局');
    if (!rankedDifficultyAllowed(p.points, difficulty)) fail(409, p.points >= 1200 ? '钻石及以上须选择终极排位' : p.points >= 600 ? '黄金及以上须选择绝境或终极排位' : '标准模拟不开放排位');
    return p;
  }
  start({ mode, difficulty, roomCode, seats }) {
    return this.transaction(() => {
      if (mode !== 'solo' && mode !== 'coop' || seats.some(s => s.isBot) || mode === 'solo' && seats.length !== 1 || mode === 'coop' && (seats.length < 2 || seats.length > 4)) fail(409, '排位仅支持单人或 2–4 名真人同盟，不能添加 AI');
      if (new Set(seats.map(s => s.accountId)).size !== seats.length) fail(409, '同一个账号不能重复占座');
      for (const seat of seats) this.qualification(seat.accountId, difficulty, false, mode);
      if (this.all("SELECT id FROM matches WHERE status IN ('running','pending')").length >= this.maxMatches) fail(429, '排位运行数量已达服务器上限，请稍后开始');
      const season = this.current(), id = randomUUID();
      this.run('INSERT INTO matches(id,season_id,mode,difficulty,room_code,rules,started_at,status) VALUES(?,?,?,?,?,?,?,?)', id, season.id, mode, difficulty, roomCode, JSON.stringify(season.rules), this.now(), 'running');
      for (const s of seats) {
        this.run('INSERT INTO participants(match_id,account_id,player_id,nickname) VALUES(?,?,?,?)', id, s.accountId, s.playerId, s.name);
        this.run('INSERT INTO locks VALUES(?,?)', s.accountId, id);
        this.run('UPDATE accounts SET nickname=? WHERE id=?', s.name, s.accountId);
      }
      this.run('INSERT INTO battle_records(id,season_id,mode,difficulty,ranked,started_at) VALUES(?,?,?,?,1,?)', id, season.id, mode, difficulty, this.now());
      this.run('INSERT INTO record_members SELECT match_id,account_id,player_id,nickname FROM participants WHERE match_id=?', id);
      return { id, season };
    });
  }
  markLeave(matchId, accountId, afterClear = false) {
    this.transaction(() => {
      const participant = this.one('SELECT * FROM participants WHERE match_id=? AND account_id=?', matchId, accountId);
      if (!participant || participant.forfeit || participant.after_clear) return;
      this.run('UPDATE participants SET forfeit=?,after_clear=? WHERE match_id=? AND account_id=?', afterClear ? 0 : 1, afterClear ? 1 : 0, matchId, accountId);
      if (!afterClear && this.one('SELECT mode FROM matches WHERE id=?', matchId)?.mode === 'solo') {
        const count = this.one("SELECT COUNT(*) AS n FROM abandons a JOIN matches m ON m.id=a.match_id WHERE a.account_id=? AND a.created_at>? AND m.mode='solo'", accountId, this.now() - 86400000).n;
        this.run('INSERT OR IGNORE INTO abandons VALUES(?,?,?,?)', matchId, accountId, this.now(), this.now() + [5, 15, 30][Math.min(2, count)] * 60000);
      }
    });
  }
  finish(matchId, summary) {
    this.recordFinish(matchId, summary);
    this.pending.set(matchId, summary);
    try {
      const match = this.one('SELECT status FROM matches WHERE id=?', matchId);
      if (!match || match.status === 'void' || match.status === 'settled') { this.pending.delete(matchId); return; }
      this.run("UPDATE matches SET status='pending',summary=?,ended_at=? WHERE id=?", JSON.stringify(summary), this.now(), matchId);
      const entries = this.settle(matchId, summary);
      this.pending.delete(matchId);
      this.onSettled(matchId, entries);
    } catch (e) { this.log.error?.('[ranked] 结算待重试', e.message); }
  }
  settle(matchId, summary) {
    const match = this.one('SELECT * FROM matches WHERE id=?', matchId);
    if (!match || match.status === 'settled' || match.status === 'void') return [];
    if (!summary || summary.reason === 'error' || summary.errors > 0 || !Array.isArray(summary.players) || !summary.players.length) {
      this.voidMatch(matchId, 'system', '战斗或结算出现服务器错误'); return [];
    }
    return this.transaction(() => {
      const rules = parse(match.rules), entries = [];
      for (const p of this.all('SELECT * FROM participants WHERE match_id=?', matchId)) {
        const victory = !p.forfeit && (!!summary.victory || !!summary.rankMainCleared || !!p.after_clear);
        const hidden = victory && !!summary.hiddenCleared && !p.after_clear;
        const nominal = rankedDelta(rules, match.difficulty, match.mode, victory, hidden, !!p.forfeit, !!p.after_clear);
        const previous = this.standing(p.account_id, match.season_id), points = Math.max(0, previous.points + nominal);
        const reason = p.forfeit ? 'abandoned' : victory ? hidden ? 'hidden' : 'victory' : 'defeat';
        this.run(`INSERT INTO ledger(match_id,account_id,nominal,before_points,after_points,victory,hidden,reason,created_at) VALUES(?,?,?,?,?,?,?,?,?)`,
          matchId, p.account_id, nominal, previous.points, points, +victory, +hidden, reason, this.now());
        this.run(`INSERT INTO standings(season_id,account_id,points,peak,games,wins,hidden,achieved_at) VALUES(?,?,?,?,?,?,?,?)
          ON CONFLICT(season_id,account_id) DO UPDATE SET points=excluded.points,peak=excluded.peak,games=excluded.games,wins=excluded.wins,hidden=excluded.hidden,achieved_at=excluded.achieved_at`,
          match.season_id, p.account_id, points, Math.max(points, previous.peak), previous.games + 1, previous.wins + +victory, previous.hidden + +hidden,
          points === previous.points ? previous.achieved_at : this.now());
        entries.push({ accountId: p.account_id, matchId, seasonId: match.season_id, mode: match.mode, difficulty: match.difficulty, victory, hidden,
          nominal, before: previous.points, after: points, delta: points - previous.points, beforeRank: rankOf(previous.points), afterRank: rankOf(points), reason });
      }
      this.run("UPDATE matches SET status='settled' WHERE id=?", matchId);
      this.run('DELETE FROM locks WHERE match_id=?', matchId);
      return entries;
    });
  }
  voidMatch(matchId, actor, reason) {
    if (typeof reason !== 'string' || !reason.trim() || reason.length > 300) fail(400, '请填写撤销原因（1–300 字）');
    const match = this.one('SELECT * FROM matches WHERE id=?', matchId);
    if (!match) fail(404, '对局不存在');
    if (match.status === 'void') return;
    if (actor !== 'system' && match.status !== 'settled') fail(409, '进行中对局由赛季收尾流程处理，不能直接撤销');
    this.transaction(() => {
      const participants = this.all('SELECT account_id FROM participants WHERE match_id=?', matchId);
      if (match.status === 'settled' && participants.some(p => this.one('SELECT * FROM locks WHERE account_id=?', p.account_id))) fail(409, '相关账号有进行中的排位，请在对局结束后撤销');
      this.run("UPDATE matches SET status='void',void_reason=?,ended_at=COALESCE(ended_at,?) WHERE id=?", reason, this.now(), matchId);
      this.run('DELETE FROM locks WHERE match_id=?', matchId);
      this.run('DELETE FROM abandons WHERE match_id=?', matchId);
      if (match.status === 'settled') {
        for (const p of participants) {
          let points = 0, peak = 0, wins = 0, hidden = 0, achieved = 0;
          const rows = this.all(`SELECT l.* FROM ledger l JOIN matches m ON m.id=l.match_id WHERE l.account_id=? AND m.season_id=? AND m.status='settled' ORDER BY l.seq`, p.account_id, match.season_id);
          for (const l of rows) { const next = Math.max(0, points + l.nominal); if (next !== points) achieved = l.created_at; points = next; peak = Math.max(peak, points); wins += l.victory; hidden += l.hidden; }
          this.run('UPDATE standings SET points=?,peak=?,games=?,wins=?,hidden=?,achieved_at=? WHERE season_id=? AND account_id=?', points, peak, rows.length, wins, hidden, achieved, match.season_id, p.account_id);
        }
        this.run('UPDATE seasons SET revision=revision+1 WHERE id=?', match.season_id);
      }
      this.audit(actor, 'void-match', matchId, reason);
    });
    this.pending.delete(matchId);
    this.onVoid(matchId, reason);
  }
  createSeason({ name, endsAt = null, rules = RANK_RULES }, actor) {
    if (typeof name !== 'string' || !name.trim() || name.length > 80) fail(400, '赛季名称须为 1–80 字');
    if (endsAt != null && (!Number.isSafeInteger(endsAt) || endsAt <= this.now())) fail(400, '赛季结束时间必须在未来');
    let checked; try { checked = validateRankRules(rules); } catch (e) { fail(400, e.message); }
    return this.transaction(() => {
      const id = randomUUID(), number = this.one('SELECT COALESCE(MAX(number),0)+1 AS n FROM seasons').n;
      this.run('INSERT INTO seasons(id,number,name,state,ends_at,rules) VALUES(?,?,?,?,?,?)', id, number, name.trim(), 'draft', endsAt, JSON.stringify(checked));
      this.audit(actor, 'create-season', id);
      return seasonView(this.one('SELECT * FROM seasons WHERE id=?', id));
    });
  }
  rollover(nextId, actor) {
    const next = nextId ? this.one('SELECT * FROM seasons WHERE id=?', nextId) : null;
    if (nextId && (!next || next.state !== 'draft' || next.ends_at && next.ends_at <= this.now())) fail(409, '下一赛季必须是未过期草稿');
    const current = this.current();
    if (current?.state === 'closing') fail(409, '赛季已经进入收尾，请等待完成');
    this.transaction(() => {
      if (current) this.run("UPDATE seasons SET state='closing',close_at=?,next_id=? WHERE id=?", this.now() + this.drainMs, nextId || null, current.id);
      else if (next) this.run("UPDATE seasons SET state='active',starts_at=? WHERE id=?", this.now(), next.id);
      else fail(409, '没有可结束或开启的赛季');
      this.audit(actor, 'rollover', current?.id || next.id, nextId || '结束后等待新赛季');
    });
    this.onSeason(); this.tick();
  }
  saveDraft({id,name,endsAt=null,rules},actor) {
    if(typeof name!=='string'||!name.trim()||name.length>80)fail(400,'赛季名称须为 1–80 字');
    if(endsAt!=null&&(!Number.isSafeInteger(endsAt)||endsAt<=this.now()))fail(400,'赛季结束时间必须在未来');
    let checked;try{checked=validateRankRules(rules);}catch(e){fail(400,e.message);}
    return this.transaction(()=>{
      const row=this.one('SELECT * FROM seasons WHERE id=?',id);
      if(!row||row.state!=='draft')fail(409,'只能修改未开启的赛季草稿');
      this.run('UPDATE seasons SET name=?,ends_at=?,rules=?,revision=revision+1 WHERE id=?',name.trim(),endsAt,JSON.stringify(checked),id);
      this.audit(actor,'edit-season-draft',id);return seasonView(this.one('SELECT * FROM seasons WHERE id=?',id));
    });
  }
  pause(paused, actor) {
    if (typeof paused !== 'boolean') fail(400, '暂停状态无效');
    const current = this.current(); if (!current || current.state !== 'active') fail(409, '没有进行中的赛季');
    this.transaction(() => { this.run('UPDATE seasons SET paused=? WHERE id=?', +paused, current.id); this.audit(actor, paused ? 'pause' : 'resume', current.id); });
    this.onSeason();
  }
  settings({ name, endsAt, nextId }, actor) {
    const current = this.current(); if (!current || current.state !== 'active') fail(409, '只能修改进行中赛季的名称与结束计划');
    if (typeof name !== 'string' || !name.trim() || name.length > 80) fail(400, '赛季名称须为 1–80 字');
    if (endsAt != null && (!Number.isSafeInteger(endsAt) || endsAt <= this.now())) fail(400, '结束时间必须在未来');
    if (nextId) {
      const next = this.one("SELECT * FROM seasons WHERE id=? AND state='draft'", nextId);
      if (!next || next.ends_at && next.ends_at <= (endsAt || this.now())) fail(409, '下一赛季必须是到期开启时仍未结束的草稿');
    }
    this.transaction(() => { this.run('UPDATE seasons SET name=?,ends_at=?,next_id=? WHERE id=?', name.trim(), endsAt ?? null, nextId || null, current.id); this.audit(actor, 'season-settings', current.id, JSON.stringify({ name, endsAt, nextId })); });
    this.onSeason();
  }
  tick() {
    for (const [id, pending] of [...this.recordPending]) this.recordFinish(id, JSON.parse(pending.summary));
    try {
      for (const [id, summary] of [...this.pending]) this.finish(id, summary);
      let current = this.current();
      if (current?.state === 'active' && current.ends_at && current.ends_at <= this.now()) {
        this.rollover(current.next_id, 'system'); return;
      }
      if (current?.state !== 'closing') return;
      const remaining = this.all("SELECT id,status FROM matches WHERE season_id=? AND status IN ('running','pending')", current.id);
      if (!competitive(current.rules) && current.close_at <= this.now()) for (const m of remaining) if (m.status === 'running') this.voidMatch(m.id, 'system', '赛季切换，超过收尾时间');
      if (this.one("SELECT id FROM matches WHERE season_id=? AND status IN ('running','pending') LIMIT 1", current.id)) return;
      this.transaction(() => {
        this.run("UPDATE seasons SET state='archived',ends_at=?,paused=0 WHERE id=?", this.now(), current.id);
        if (current.next_id) {
          const next = this.one("SELECT * FROM seasons WHERE id=? AND state='draft'", current.next_id);
          if (next && (!next.ends_at || next.ends_at > this.now())) this.run("UPDATE seasons SET state='active',starts_at=? WHERE id=?", this.now(), next.id);
        }
        this.audit('system', 'archive-season', current.id);
      });
      this.onSeason();
    } catch (e) { this.log.error?.('[ranked] 赛季维护失败', e.message); }
  }
  leaderboard(seasonId, page = 0, {scope='ranked',query=''}={}) {
    const season = this.one("SELECT * FROM seasons WHERE id=? AND state<>'draft'", seasonId); if (!season) fail(404, '赛季不存在');
    if(!['ranked','all'].includes(scope)||typeof query!=='string'||query.length>80)fail(400,'玩家筛选参数无效');
    // Rank before search/pagination; unranked accounts have no rank or fabricated zero-point season record.
    const base=`WITH abandoned AS (
      SELECT l.account_id,COUNT(*) n FROM ledger l JOIN matches m ON m.id=l.match_id
      WHERE m.season_id=? AND m.status='settled' AND l.reason='abandoned' GROUP BY l.account_id
    ), players AS (
      SELECT a.id account_id,a.public_no,s.points,s.peak,COALESCE(s.games,0) games,COALESCE(s.wins,0) wins,COALESCE(s.hidden,0) hidden,
      COALESCE(ab.n,0) abandoned,s.account_id IS NOT NULL participated,
      CASE WHEN s.account_id IS NOT NULL THEN ROW_NUMBER() OVER(ORDER BY s.account_id IS NULL,s.points DESC,s.achieved_at,a.public_no) END position,
      COALESCE((SELECT p.nickname FROM participants p JOIN matches m ON m.id=p.match_id WHERE p.account_id=a.id AND m.season_id=? ORDER BY m.started_at DESC,m.id DESC LIMIT 1),a.nickname) nickname
      FROM accounts a LEFT JOIN standings s ON s.account_id=a.id AND s.season_id=? LEFT JOIN abandoned ab ON ab.account_id=a.id
      WHERE (a.visible=1 OR ?='archived' AND s.account_id IS NOT NULL)
    )`;
    const where=" WHERE (?='all' OR participated=1) AND (?='' OR instr(lower(nickname),lower(?))>0 OR CAST(public_no AS TEXT)=?)";
    const args=[seasonId,seasonId,seasonId,season.state,scope,query.trim(),query.trim(),query.trim()];
    const rows=this.all(base+' SELECT * FROM players'+where+' ORDER BY participated DESC,position,public_no LIMIT 50 OFFSET ?',...args,page*50);
    return {season:seasonView(season),page,scope,total:this.one(base+' SELECT COUNT(*) n FROM players'+where,...args).n,
      rows:rows.map(({account_id,abandoned,participated,...r})=>({...r,accountId:account_id,participated:!!participated,...rankedSummary({...r,abandoned}),
        sponsor:[...this.auth.users.values()].some(u=>u.accountId===account_id&&!u.disabled&&u.sponsor===true),online:!!this.onlineStatus?.(account_id),rank:participated?rankOf(r.points):null}))};
  }
  history(accountId, page = 0, mode = '') {
    if (mode && !['solo', 'coop'].includes(mode)) fail(400, '模式无效');
    const filter = mode ? ' AND m.mode=?' : '', args = mode ? [accountId, mode] : [accountId];
    return { page, rows: this.all(`SELECT l.match_id,l.nominal,l.before_points,l.after_points,l.victory,l.hidden,l.reason,l.created_at,m.mode,m.difficulty,m.status,m.void_reason,s.name AS season
      FROM ledger l JOIN matches m ON m.id=l.match_id JOIN seasons s ON s.id=m.season_id WHERE l.account_id=?${filter} ORDER BY l.seq DESC LIMIT 20 OFFSET ?`, ...args, page * 20),
      total: this.one(`SELECT COUNT(*) AS n FROM ledger l JOIN matches m ON m.id=l.match_id WHERE l.account_id=?${filter}`, ...args).n,
      invalid: this.all(`SELECT m.id AS match_id,m.mode,m.difficulty,m.void_reason,m.ended_at,s.name AS season FROM participants p JOIN matches m ON m.id=p.match_id JOIN seasons s ON s.id=m.season_id
        WHERE p.account_id=? AND m.status='void' AND NOT EXISTS(SELECT 1 FROM ledger l WHERE l.match_id=m.id AND l.account_id=p.account_id) ORDER BY m.ended_at DESC LIMIT 10`, accountId) };
  }
  admin() {
    return { current: this.current(), seasons: this.all('SELECT * FROM seasons ORDER BY number DESC').map(seasonView),
      running: this.all("SELECT id,season_id,mode,difficulty,started_at,status FROM matches WHERE status IN ('running','pending')"),
      recent: this.all('SELECT id,mode,difficulty,status,started_at,ended_at,void_reason FROM matches ORDER BY started_at DESC LIMIT 30'),
      audit: this.all('SELECT * FROM audit ORDER BY seq DESC LIMIT 30'), rules: RANK_RULES, maxMatches: this.maxMatches, pending: this.pending.size };
  }
  async handle(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost'), admin = url.pathname.startsWith('/auth/admin/ranked');
      const actor = this.auth.authorize(this.auth.session(req), admin);
      this.syncAccounts();
      if (req.method === 'GET') {
        let value; const page = Number(url.searchParams.get('page') || 0);
        if (!Number.isSafeInteger(page) || page < 0 || page > 100000) fail(400, '分页参数无效');
        if (url.pathname === '/ranked/profile') value = this.profile(actor.accountId);
        else if (url.pathname === '/ranked/seasons') value = { seasons: this.all("SELECT * FROM seasons WHERE state IN ('active','closing','archived') ORDER BY number DESC").map(seasonView) };
        else if (url.pathname === '/ranked/leaderboard') value = this.leaderboard(url.searchParams.get('season') || this.current()?.id || '', page,{scope:url.searchParams.get('scope')||'ranked',query:url.searchParams.get('q')||''});
        else if (url.pathname === '/ranked/history') value = this.history(actor.accountId, page, url.searchParams.get('mode') || '');
        else if (url.pathname === '/ranked/records') value = this.records(actor.accountId, { page, mode: url.searchParams.get('mode') || '', kind: url.searchParams.get('kind') || '' });
        else if (/^\/ranked\/records\/[a-zA-Z0-9-]+$/.test(url.pathname)) value = this.recordDetail(actor.accountId, url.pathname.split('/').pop());
        else if (url.pathname === '/auth/admin/ranked') value = this.admin();
        else fail(404, '排位接口不存在');
        send(res, 200, value); return;
      }
      if (!admin || req.method !== 'POST') fail(405, '接口不支持此方法');
      if (!this.auth.sameOrigin(req)) fail(403, '请从本服务器管理员网页操作');
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, '请提交 JSON');
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 16384) fail(413, '请求过大'); chunks.push(chunk); }
      let body; try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, 'JSON 无效'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, '请求无效');
      // Password reset/disable may have revoked the actor while the body was arriving.
      this.auth.authorize(this.auth.session(req), true);
      let value = { ok: true };
      if (url.pathname === '/auth/admin/ranked/seasons') value.season = this.createSeason(body, actor.username);
      else if (url.pathname === '/auth/admin/ranked/draft') value.season = this.saveDraft(body,actor.username);
      else if (url.pathname === '/auth/admin/ranked/rollover') this.rollover(body.nextId || null, actor.username);
      else if (url.pathname === '/auth/admin/ranked/pause') this.pause(body.paused, actor.username);
      else if (url.pathname === '/auth/admin/ranked/settings') this.settings(body, actor.username);
      else if (url.pathname === '/auth/admin/ranked/void') this.voidMatch(body.matchId, actor.username, body.reason);
      else if (url.pathname === '/auth/admin/ranked/placement') value.profile = this.directPlacement(body, actor.username);
      else if (url.pathname === '/auth/admin/ranked/upgrade') value.season = this.upgradeSeason(body, actor.username);
      else if (url.pathname === '/auth/admin/ranked/retry') {const match=this.one("SELECT * FROM matches WHERE id=? AND status='pending'",body.matchId);if(!match)fail(404,'没有待确认结果');this.finish(match.id,parse(match.summary));value.pending=this.pending.has(match.id);}
      else fail(404, '排位管理接口不存在');
      send(res, 200, value);
    } catch (e) { if (!e.status) this.log.error?.('[ranked] 接口失败', e.message); if (!res.headersSent) send(res, e.status || 503, { error: e.status ? e.message : '排位服务暂不可用，请检查数据库与日志' }); }
  }
  close({ clearUnfinished = false } = {}) {
    if (this.closed) return;
    clearInterval(this.timer);
    try {
      // Completed results are written first; a failed write must never turn into a deleted match.
      for (const [id, summary] of [...this.pending]) this.finish(id, summary);
      for (const row of this.all("SELECT m.id,COALESCE(m.summary,r.summary) AS summary FROM matches m LEFT JOIN battle_records r ON r.id=m.id WHERE m.status='running' AND COALESCE(m.summary,r.summary) IS NOT NULL")) this.finish(row.id, parse(row.summary));
      for (const row of this.all("SELECT id,summary FROM matches WHERE status='pending' AND summary IS NOT NULL")) this.finish(row.id, parse(row.summary));
      for (const [id, p] of [...this.recordPending]) this.recordFinish(id, JSON.parse(p.summary));
      if (clearUnfinished) {
        const removed = clearUnfinishedRecords(this.db, { pendingIds: [...this.pending.keys(), ...this.recordPending.keys()] });
        this.log.info?.(`[shutdown] 已清除未完成对局：排位 ${removed.matches} 条，履历 ${removed.records} 条`);
      }
      if (this.pending.size || this.recordPending.size) throw Error('仍有已完成结果未能写入，相关记录已保留，请查看停服错误日志');
    } finally {
      this.closed = true;
      this.db.close();
    }
  }
}
Object.assign(Ranked.prototype, recordMethods);
