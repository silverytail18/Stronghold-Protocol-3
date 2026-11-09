// Player appeals against a settled match record. An administrator can approve one, and the match
// is then left out of that player's statistics while the history row remains visible.
import { randomUUID } from 'node:crypto';
import { buildRecord } from '../../shared/stats.js';

const fail = (status, message) => { throw Object.assign(Error(message), { status }); };
const text = (value, max) => typeof value === 'string' && Array.from(value.trim()).length <= max
  && !/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/.test(value);

export class MatchAppeals {
  constructor({ ranked, log = console }) {
    this.ranked = ranked;
    this.log = log;
    ranked.db.exec(`
      CREATE TABLE IF NOT EXISTS match_appeals(
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        record_key TEXT NOT NULL,
        account_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        decided_at INTEGER,
        decided_by TEXT,
        note TEXT,
        UNIQUE(record_key, account_id)
      );
      CREATE TABLE IF NOT EXISTS record_exclusions(
        account_id TEXT NOT NULL,
        record_id TEXT NOT NULL,
        record_key TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY(account_id, record_id)
      );
      CREATE INDEX IF NOT EXISTS match_appeals_status ON match_appeals(status, created_at DESC);
    `);
  }

  isMember(accountId, recordId) {
    return !!this.ranked.one('SELECT 1 ok FROM record_members WHERE record_id=? AND account_id=?', recordId, accountId);
  }

  excludedFor(accountId) {
    return this.ranked.all('SELECT record_id FROM record_exclusions WHERE account_id=?', accountId).map((row) => row.record_id);
  }

  excludedKeysFor(accountId) {
    return this.ranked.all('SELECT record_key FROM record_exclusions WHERE account_id=?', accountId).map((row) => row.record_key);
  }

  listFor(accountId) {
    return {
      appeals: this.ranked.all('SELECT * FROM match_appeals WHERE account_id=? ORDER BY created_at DESC', accountId),
      excluded: this.excludedFor(accountId),
      excludedKeys: this.excludedKeysFor(accountId),
    };
  }

  /** The local stats id is a synthetic r1.* key; map it to the server battle_records id. */
  recordIdForKey(accountId, recordKey) {
    const rows = this.ranked.all(`SELECT r.*,p.player_id FROM battle_records r
      JOIN record_members p ON p.record_id=r.id
      WHERE p.account_id=? AND r.status='finished' ORDER BY r.started_at DESC`, accountId);
    for (const row of rows) if (row.id === recordKey) return row.id;
    for (const row of rows) {
      if (!row.summary) continue;
      try {
        const summary = JSON.parse(row.summary);
        const record = buildRecord(summary, {
          myId: row.player_id, roomMode: row.mode, content: summary.content,
          version: summary.officialVersion, now: row.ended_at,
        });
        if (record.id === recordKey) return row.id;
      } catch { /* a broken old summary cannot match */ }
    }
    return null;
  }

  submit(accountId, recordKey, reason) {
    if (typeof recordKey !== 'string' || !/^(?:r1\.[a-z0-9]+|[A-Za-z0-9_-]{1,80})$/.test(recordKey)) fail(400, '对局编号无效');
    if (!text(reason, 500)) fail(400, '申诉原因需为 1–500 个字符');
    const recordId = this.recordIdForKey(accountId, recordKey);
    if (!recordId) fail(404, '对局记录不存在');
    if (!this.isMember(accountId, recordId)) fail(403, '你不在这局对局中');
    if (this.ranked.one('SELECT 1 ok FROM record_exclusions WHERE account_id=? AND record_key=?', accountId, recordKey)) {
      fail(409, '该局已不计入统计');
    }
    const existing = this.ranked.one('SELECT * FROM match_appeals WHERE record_key=? AND account_id=?', recordKey, accountId);
    if (existing?.status === 'approved') fail(409, '该局已不计入统计');
    const id = existing?.id || randomUUID();
    this.ranked.run(`INSERT INTO match_appeals(id,record_id,record_key,account_id,reason,status,created_at,decided_at,decided_by,note)
      VALUES(?,?,?,?,?, 'pending', ?, NULL, NULL, NULL)
      ON CONFLICT(record_key,account_id) DO UPDATE SET record_id=excluded.record_id,reason=excluded.reason,status='pending',
        created_at=excluded.created_at,decided_at=NULL,decided_by=NULL,note=NULL`,
      id, recordId, recordKey, accountId, reason.trim(), Date.now());
    return this.ranked.one('SELECT * FROM match_appeals WHERE id=?', id);
  }

  listAdmin() {
    return {
      appeals: this.ranked.all(`SELECT a.*, ac.nickname, ac.public_no, r.mode, r.difficulty, r.started_at, r.ended_at
        FROM match_appeals a
        JOIN accounts ac ON ac.id=a.account_id
        LEFT JOIN battle_records r ON r.id=a.record_id
        ORDER BY CASE a.status WHEN 'pending' THEN 0 ELSE 1 END, a.created_at DESC`),
    };
  }

  decide(appealId, action, adminId, note = '') {
    if (action !== 'approve' && action !== 'reject') fail(400, '操作无效');
    if (note && !text(note, 200)) fail(400, '备注过长');
    const appeal = this.ranked.one('SELECT * FROM match_appeals WHERE id=?', appealId);
    if (!appeal) fail(404, '申诉不存在');
    if (appeal.status !== 'pending') fail(409, '该申诉已处理');
    const status = action === 'approve' ? 'approved' : 'rejected';
    this.ranked.transaction(() => {
      if (status === 'approved') {
        this.ranked.run('INSERT OR IGNORE INTO record_exclusions(account_id,record_id,record_key,created_at) VALUES(?,?,?,?)',
          appeal.account_id, appeal.record_id, appeal.record_key, Date.now());
      }
      this.ranked.run('UPDATE match_appeals SET status=?,decided_at=?,decided_by=?,note=? WHERE id=?',
        status, Date.now(), adminId, note || null, appealId);
    });
    return this.ranked.one('SELECT * FROM match_appeals WHERE id=?', appealId);
  }

  async handle(req, res, pathname, auth) {
    const send = (status, body) => {
      const bytes = Buffer.from(JSON.stringify(body));
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': bytes.length });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    };
    try {
      const session = auth.session(req);
      const actor = auth.authorize(session);
      if (pathname === '/product/match-appeals') {
        if (!['GET', 'HEAD'].includes(req.method)) { send(405, { error: 'Method not allowed' }); return; }
        send(200, this.listFor(actor.accountId));
        return;
      }
      if (pathname === '/product/match-appeal') {
        if (req.method !== 'POST') { send(405, { error: 'Method not allowed' }); return; }
        if (!auth.sameOrigin(req)) { send(403, { error: '请求来源不允许' }); return; }
        if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) { send(415, { error: '请使用 JSON' }); return; }
        const body = await readJson(req, 16 * 1024);
        send(200, { ok: true, appeal: this.submit(actor.accountId, body.recordId, body.reason) });
        return;
      }
      if (pathname === '/auth/admin/match-appeals') {
        auth.authorize(session, true);
        if (!['GET', 'HEAD'].includes(req.method)) { send(405, { error: 'Method not allowed' }); return; }
        send(200, this.listAdmin());
        return;
      }
      if (pathname.startsWith('/auth/admin/match-appeals/')) {
        auth.authorize(session, true);
        if (req.method !== 'POST') { send(405, { error: 'Method not allowed' }); return; }
        if (!auth.sameOrigin(req)) { send(403, { error: '请求来源不允许' }); return; }
        if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) { send(415, { error: '请使用 JSON' }); return; }
        let id;
        try { id = decodeURIComponent(pathname.slice('/auth/admin/match-appeals/'.length)); } catch { send(400, { error: '路径无效' }); return; }
        const body = await readJson(req, 16 * 1024);
        const appeal = this.decide(id, body.action, actor.accountId, body.note || '');
        this.log.info?.(`[appeals] ${actor.username} ${body.action} ${appeal.id}`);
        send(200, { ok: true, appeal });
        return;
      }
      send(404, { error: '接口不存在' });
    } catch (error) {
      if (!error.status) this.log.error?.('[appeals]', error.message);
      if (!res.headersSent) send(error.status || 500, { error: error.status ? error.message : '申诉服务不可用' });
      else res.destroy();
    }
  }
}

async function readJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) fail(413, '请求过大');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, '请求格式无效'); }
}
