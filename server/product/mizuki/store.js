// Product-owned Mizuki state. All economy, checkpoints and result grants commit
// in one database transaction; no nickname, device token or client balance is authoritative.
import { MIZUKI_RULES_HASH } from './compatibility.js';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mizukiBankAccount, MIZUKI_BANK_MAX_GOLD } from '../../modes/mizuki/Bank.js';
import { mizukiEndingUnlocksAfter } from '../../modes/mizuki/EndingProgression.js';
import { mizukiExplorationScoreBreakdown, cognitionEffects } from '../../modes/mizuki/Cognition.js';

export const MIZUKI_RULES_VERSION = 'emi-ac00de2-product-1:' + MIZUKI_RULES_HASH;
const encode = value => JSON.stringify(value);
const decode = value => value == null ? null : JSON.parse(value);
const integer = value => Number.isSafeInteger(value) && value >= 0;
const digest = value => createHash('sha256').update(encode(value)).digest('hex');
const fail = (message, code = 'BAD_TARGET') => { throw Object.assign(Error(message), { code }); };

export class MizukiStore {
  constructor(filename) {
    this.filename = filename;
    if (filename !== ':memory:') {
      fs.mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
      if (fs.existsSync(filename) && fs.lstatSync(filename).isSymbolicLink()) fail('水月存储不能为符号链接');
    }
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS profiles(account_id TEXT PRIMARY KEY,doc TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,status TEXT NOT NULL,rules TEXT NOT NULL,
        epoch INTEGER NOT NULL,seq INTEGER NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
        options TEXT NOT NULL,checkpoint TEXT,banks TEXT NOT NULL,summary TEXT);
      CREATE TABLE IF NOT EXISTS participants(run_id TEXT NOT NULL REFERENCES runs(id),account_id TEXT NOT NULL,
        player_id TEXT NOT NULL,seat INTEGER NOT NULL,PRIMARY KEY(run_id,account_id),UNIQUE(run_id,player_id));
      CREATE TABLE IF NOT EXISTS active_accounts(account_id TEXT PRIMARY KEY,run_id TEXT NOT NULL REFERENCES runs(id));
      CREATE TABLE IF NOT EXISTS ledger(run_id TEXT NOT NULL,seq INTEGER NOT NULL,epoch INTEGER NOT NULL,
        operation_key TEXT,command_hash TEXT,result TEXT NOT NULL,changes TEXT NOT NULL,created_at INTEGER NOT NULL,
        PRIMARY KEY(run_id,seq),UNIQUE(run_id,operation_key));
      CREATE TABLE IF NOT EXISTS results(run_id TEXT NOT NULL,account_id TEXT NOT NULL,doc TEXT NOT NULL,
        PRIMARY KEY(run_id,account_id));
      CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,kind TEXT NOT NULL,doc TEXT NOT NULL,delivered INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS admin_audit(id TEXT PRIMARY KEY,created_at INTEGER NOT NULL,doc TEXT NOT NULL);`);
    const schema = this.db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value;
    if (schema !== undefined && schema !== '1') { this.db.close(); fail('水月存档格式未知，拒绝覆盖'); }
    this.db.prepare("INSERT OR IGNORE INTO metadata VALUES('schema','1')").run();
  }

  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const answer = fn(); this.db.exec('COMMIT'); return answer; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }

  profile(accountId) {
    const row = this.db.prepare('SELECT doc FROM profiles WHERE account_id=?').get(accountId);
    return row ? decode(row.doc) : { version: 1, score: 0, cells: 0, bank: mizukiBankAccount(null), endingUnlocks: ['ro2_ending_1'], revision: 0 };
  }

  active(accountId) {
    const row = this.db.prepare('SELECT r.* FROM active_accounts a JOIN runs r ON r.id=a.run_id WHERE a.account_id=?').get(accountId);
    return row ? this.view(row) : null;
  }

  view(row) {
    return { id: row.id, status: row.status, rulesVersion: row.rules, epoch: row.epoch, seq: row.seq,
      createdAt: row.created_at, updatedAt: row.updated_at, options: decode(row.options), checkpoint: decode(row.checkpoint),
      banks: decode(row.banks), summary: decode(row.summary),
      participants: this.db.prepare('SELECT account_id accountId,player_id playerId,seat FROM participants WHERE run_id=? ORDER BY seat').all(row.id) };
  }

  get(runId) {
    const row = this.db.prepare('SELECT * FROM runs WHERE id=?').get(runId);
    return row ? this.view(row) : null;
  }

  begin(options, accounts) {
    const seats = options.seats;
    if (!Array.isArray(seats) || !seats.length || seats.length > 4 || seats.some(s => s.isBot || !accounts.get(s.playerId))
      || new Set(seats.map(s => accounts.get(s.playerId))).size !== seats.length) fail('水月需要一至四个独立真人账号');
    return this.transaction(() => {
      const id = randomUUID(), now = Date.now(), banks = {};
      for (const seat of seats) {
        const aid = accounts.get(seat.playerId);
        if (this.active(aid)) fail('成员有尚未结束的水月探索，请先继续或放弃');
        banks[seat.playerId] = this.profile(aid).bank;
      }
      const safeOptions = { ...options, matchId: id, cognitionPolicy: 'full', rulesVersion: MIZUKI_RULES_VERSION, resourceHash: this.resourceHash || null };
      this.db.prepare('INSERT INTO runs VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id, 'running', MIZUKI_RULES_VERSION, 1, 0, now, now, encode(safeOptions), null, encode(banks), null);
      for (const seat of seats) {
        const aid = accounts.get(seat.playerId);
        this.db.prepare('INSERT INTO participants VALUES(?,?,?,?)').run(id, aid, seat.playerId, seat.seat);
        this.db.prepare('INSERT INTO active_accounts VALUES(?,?)').run(aid, id);
      }
      return this.get(id);
    });
  }

  operation(runId, playerId, opId, command) {
    if (!opId) return null;
    const key = encode([playerId, opId]);
    const row = this.db.prepare('SELECT command_hash,result FROM ledger WHERE run_id=? AND operation_key=?').get(runId, key);
    if (!row) return null;
    if (row.command_hash !== digest(command)) fail('重复操作标识对应了不同指令');
    return decode(row.result);
  }

  commit(runId, packet) {
    return this.transaction(() => {
      const run = this.get(runId);
      if (!run || !['running', 'suspended'].includes(run.status) || run.epoch !== packet.epoch) fail('探索进程已失去操作资格');
      if (packet.seq !== run.seq + 1) fail('探索存档修订冲突');
      const cp = packet.checkpoint;
      if (!packet.summary && (!cp || cp.engine !== 'mizuki' || cp.matchId !== runId || cp.v !== 1)) fail('水月检查点无效');
      if (cp && (cp.seed !== run.options.seed || cp.matchNo !== run.options.matchNo
        || cp.roomCode !== run.options.roomCode || cp.mizuki?.difficultyGrade !== run.options.mizukiDifficultyGrade
        || cp.variant !== 'entertainment_mizuki' || cp.players?.length !== run.participants.length
        || run.participants.some(p => !cp.players.some(s => s.playerId === p.playerId && s.seat === p.seat)))) fail('水月检查点身份与冻结规则不符');
      const banks = {}, changes = [];
      for (const member of run.participants) {
        if (this.db.prepare('SELECT 1 FROM results WHERE run_id=? AND account_id=?').get(runId, member.accountId)) {
          banks[member.playerId] = run.banks[member.playerId]; continue;
        }
        const raw = packet.banks?.[member.playerId];
        if (!raw || !integer(raw.current) || raw.current > MIZUKI_BANK_MAX_GOLD || !integer(raw.record)
          || raw.record > MIZUKI_BANK_MAX_GOLD || raw.record < raw.current || !integer(raw.totalPut) || raw.totalPut < raw.record) fail('投资状态无效');
        banks[member.playerId] = mizukiBankAccount(raw);
        const profile = this.profile(member.accountId), before = profile.bank;
        if (raw.record < before.record || raw.totalPut < before.totalPut) fail('投资历史不能回退');
        if (encode(before) !== encode(banks[member.playerId])) {
          changes.push({ playerId: member.playerId, bankBefore: before, bankAfter: banks[member.playerId] });
          profile.bank = banks[member.playerId]; profile.revision++;
          this.saveProfile(member.accountId, profile);
        }
      }
      const op = packet.operation;
      if (op && !run.participants.some(p => p.playerId === op.playerId)) fail('探索操作者无效');
      const summary = packet.summary;
      if (summary && (summary.matchId !== runId || summary.variant !== 'entertainment_mizuki' || summary.ranked !== false)) fail('探索结算身份无效');
      this.db.prepare('INSERT INTO ledger VALUES(?,?,?,?,?,?,?,?)').run(runId, packet.seq, packet.epoch,
        op ? encode([op.playerId, op.opId]) : null, op ? digest(op.command) : null, encode(packet.result || { ok: true }), encode(changes), Date.now());
      if (summary) {
        for (const member of run.participants) {
          if (this.db.prepare('SELECT 1 FROM results WHERE run_id=? AND account_id=?').get(runId, member.accountId)) continue;
          const player = summary.players?.find(p => p.playerId === member.playerId);
          const score = player?.mizuki?.explorationScore ?? 0, cells = player?.mizuki?.cellPoints ?? 0;
          if (!integer(score) || !integer(cells)) fail('探索评分无效');
          const profile = this.profile(member.accountId);
          profile.score += score; profile.cells += cells; profile.revision++;
          if (player?.victory && summary.endingId) profile.endingUnlocks = mizukiEndingUnlocksAfter(profile.endingUnlocks, summary.endingId, run.options.mizukiDifficultyGrade || 0);
          this.saveProfile(member.accountId, profile);
          this.db.prepare('INSERT INTO results VALUES(?,?,?)').run(runId, member.accountId, encode({ ...summary, playerId: member.playerId, personal: player }));
        }
        this.db.prepare('DELETE FROM active_accounts WHERE run_id=?').run(runId);
        this.db.prepare('INSERT INTO outbox(id,kind,doc) VALUES(?,?,?)').run(runId + ':finished', 'mizuki.finished', encode({ runId }));
      }
      this.db.prepare('UPDATE runs SET status=?,seq=?,updated_at=?,checkpoint=?,banks=?,summary=? WHERE id=?').run(
        summary ? 'finished' : 'running', packet.seq, Date.now(), cp ? encode(cp) : run.checkpoint ? encode(run.checkpoint) : null, encode(banks), summary ? encode(summary) : null, runId);
      return { ok: true, seq: packet.seq };
    });
  }

  saveProfile(accountId, profile) {
    this.db.prepare('INSERT INTO profiles VALUES(?,?) ON CONFLICT(account_id) DO UPDATE SET doc=excluded.doc').run(accountId, encode(profile));
  }

  abandon(runId, accountId) {
    return this.transaction(() => {
      const run = this.active(accountId);
      if (!run || run.id !== runId || run.status !== 'suspended' || !run.checkpoint) fail('仅可放弃本人已挂起的探索');
      const member = run.participants.find(p => p.accountId === accountId);
      const player = run.checkpoint.players.find(p => p.playerId === member.playerId);
      const breakdown = mizukiExplorationScoreBreakdown(run.checkpoint.mizuki.explorationScores?.[member.playerId] || {}, run.options.mizukiDifficultyGrade);
      const score = breakdown.total, cells = Math.floor(score * cognitionEffects(run.checkpoint.mizuki.cognition).livingCellMultiplier);
      const profile = this.profile(accountId); profile.score += score; profile.cells += cells; profile.revision++;
      this.saveProfile(accountId, profile);
      player.left = true; player.ready = false;
      const summary = { matchId: runId, variant: 'entertainment_mizuki', ranked: false, victory: false,
        reason: 'abandoned_suspended', difficultyGrade: run.options.mizukiDifficultyGrade,
        playerId: member.playerId, personal: { playerId: member.playerId, name: player.name, left: true,
          mizuki: { explorationScore: score, cellPoints: cells, breakdown } } };
      this.db.prepare('INSERT INTO results VALUES(?,?,?)').run(runId, accountId, encode(summary));
      this.db.prepare('DELETE FROM active_accounts WHERE run_id=? AND account_id=?').run(runId, accountId);
      const remaining = this.db.prepare('SELECT COUNT(*) n FROM active_accounts WHERE run_id=?').get(runId).n;
      const seq = run.seq + 1;
      this.db.prepare('INSERT INTO ledger VALUES(?,?,?,?,?,?,?,?)').run(runId, seq, run.epoch + 1, null, null,
        encode({ ok: true }), encode([{ action: 'abandon_suspended', playerId: member.playerId, score, cells }]), Date.now());
      this.db.prepare('UPDATE runs SET status=?,epoch=epoch+1,seq=?,updated_at=?,checkpoint=?,summary=? WHERE id=?')
        .run(remaining ? 'suspended' : 'finished', seq, Date.now(), encode(run.checkpoint), remaining ? null : encode(summary), runId);
      return { ok: true };
    });
  }

  suspend(runId) {
    this.db.prepare("UPDATE runs SET status='suspended',updated_at=? WHERE id=? AND status='running'").run(Date.now(), runId);
  }

  claim(runId) {
    return this.transaction(() => {
      const run = this.get(runId);
      if (!run || run.status !== 'suspended' || !run.checkpoint || run.rulesVersion !== MIZUKI_RULES_VERSION) fail('此探索暂不可恢复');
      this.db.prepare("UPDATE runs SET epoch=epoch+1,status='running' WHERE id=?").run(runId);
      return this.get(runId);
    });
  }

  rebindAndClaim(runId, seats, accounts, roomCode, roomCapacity = null) {
    return this.transaction(() => {
      if (roomCapacity !== null && (!Number.isInteger(roomCapacity) || roomCapacity < 1 || roomCapacity > 4 || roomCapacity < seats.length)) fail('恢复房间人数无效');
      const run = this.get(runId);
      if (!run || run.status !== 'suspended' || !run.checkpoint || run.rulesVersion !== MIZUKI_RULES_VERSION) fail('此探索暂不可恢复');
      const remap = new Map(), nextSeats = [];
      for (const member of run.participants) {
        const saved = run.checkpoint.players.find(p => p.playerId === member.playerId);
        const seat = seats.find(s => accounts.get(s.playerId) === member.accountId);
        if (!seat && saved && !saved.left && saved.alive) fail('请等待所有尚未退出的原成员加入后继续');
        if (seat) remap.set(member.playerId, seat.playerId);
        nextSeats.push({ ...run.options.seats.find(s => s.playerId === member.playerId), ...(seat || {}),
          seat: member.seat, playerId: seat?.playerId || member.playerId, connected: !!seat, left: !!saved?.left });
      }
      if (seats.some(s => !run.participants.some(p => p.accountId === accounts.get(s.playerId)))) fail('恢复房间仅限原探索成员');
      const rewrite = value => {
        if (typeof value === 'string') {
          if (remap.has(value)) return remap.get(value);
          if (value.startsWith('n:') && remap.has(value.slice(2))) return 'n:' + remap.get(value.slice(2));
          if (value.startsWith('b:')) return 'b:' + value.slice(2).split(':').map(id => remap.get(id) || id).join(':');
          if (value.startsWith('["')) {
            try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return JSON.stringify(rewrite(parsed)); } catch { /* Other strings are opaque. */ }
          }
          return value;
        }
        if (Array.isArray(value)) return value.map(rewrite);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, v]) => [rewrite(key), rewrite(v)]));
        return value;
      };
      const cp = rewrite(run.checkpoint); cp.roomCode = roomCode;
      const banks = rewrite(run.banks), options = { ...rewrite(run.options), seats: nextSeats, roomCode,
        ...(roomCapacity !== null ? { roomCapacity } : {}) };
      this.db.prepare('DELETE FROM participants WHERE run_id=?').run(runId);
      for (const member of run.participants) this.db.prepare('INSERT INTO participants VALUES(?,?,?,?)').run(runId, member.accountId, remap.get(member.playerId) || member.playerId, member.seat);
      this.db.prepare("UPDATE runs SET epoch=epoch+1,status='running',options=?,checkpoint=?,banks=? WHERE id=?").run(encode(options), encode(cp), encode(banks), runId);
      return this.get(runId);
    });
  }

  cancelStart(runId) {
    this.transaction(() => {
      const run = this.get(runId);
      if (!run || run.seq !== 0) return;
      this.db.prepare('DELETE FROM active_accounts WHERE run_id=?').run(runId);
      this.db.prepare("UPDATE runs SET status='start_failed' WHERE id=?").run(runId);
    });
  }

  diagnostics() {
    return { schema:1, rulesVersion:MIZUKI_RULES_VERSION,
      counts:this.db.prepare('SELECT status,COUNT(*) AS count FROM runs GROUP BY status').all(),
      runs:this.db.prepare('SELECT id,status,rules AS rulesVersion,epoch,seq,created_at AS createdAt,updated_at AS updatedAt,LENGTH(checkpoint) AS checkpointBytes FROM runs ORDER BY updated_at DESC LIMIT 100').all() };
  }
  adminRuns(accountId = null) {
    const rows = accountId
      ? this.db.prepare('SELECT r.* FROM runs r JOIN participants p ON p.run_id=r.id WHERE p.account_id=? ORDER BY r.updated_at DESC').all(accountId)
      : this.db.prepare('SELECT * FROM runs ORDER BY updated_at DESC LIMIT 100').all();
    return rows.map(row => ({ id: row.id, status: row.status, epoch: row.epoch, seq: row.seq,
      updatedAt: row.updated_at, rulesVersion: row.rules, checkpointBytes: row.checkpoint?.length || 0,
      roomCode: decode(row.options).roomCode, difficultyGrade: decode(row.options).mizukiDifficultyGrade,
      participants: this.db.prepare('SELECT account_id accountId,player_id playerId FROM participants WHERE run_id=? ORDER BY seat').all(row.id) }));
  }
  adminAudit(detail) {
    const event = { ...detail, at: Date.now() };
    this.db.prepare('INSERT INTO admin_audit VALUES(?,?,?)').run(randomUUID(), event.at, encode(event));
  }
  adminDelete({ runIds, accountId = null, actor, reason, action }) {
    return this.transaction(() => {
      const affected = new Set();
      for (const id of runIds) {
        for (const member of this.get(id)?.participants || []) affected.add(member.accountId);
        this.db.prepare('DELETE FROM active_accounts WHERE run_id=?').run(id);
        this.db.prepare('DELETE FROM participants WHERE run_id=?').run(id);
        this.db.prepare('DELETE FROM ledger WHERE run_id=?').run(id);
        this.db.prepare('DELETE FROM results WHERE run_id=?').run(id);
        this.db.prepare('DELETE FROM outbox WHERE id=?').run(id + ':finished');
        this.db.prepare('DELETE FROM runs WHERE id=?').run(id);
      }
      if (accountId) {
        this.db.prepare('DELETE FROM active_accounts WHERE account_id=?').run(accountId);
        this.db.prepare('DELETE FROM results WHERE account_id=?').run(accountId);
        this.db.prepare('DELETE FROM profiles WHERE account_id=?').run(accountId);
        affected.add(accountId);
      }
      const result = { runIds, accountId, affectedAccounts: [...affected] };
      this.adminAudit({ actor, reason, action, ...result });
      return result;
    });
  }
  history(accountId) { return this.db.prepare('SELECT doc FROM results WHERE account_id=? ORDER BY rowid DESC LIMIT 50').all(accountId).map(r => decode(r.doc)); }
  close() { this.db.close(); }
}
