import { createHash, randomUUID } from 'node:crypto';
import { MIZUKI_VARIANT } from '../../../shared/mizuki-constants.js';
import { isAppRequest } from '../app-client.js';

const fail = (status, message) => { throw Object.assign(Error(message), { status }); };
const token = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function attachMizukiAdminRuntime({ lobby, registry, product }) {
  const identities = new WeakMap();
  const identity = room => { if (!identities.has(room)) identities.set(room, randomUUID()); return identities.get(room); };
  const runId = room => room.match?.matchId || room.mizukiResumeRunId || room.productMizukiOptions?.mizukiRun?.id || null;
  const rooms = () => [...lobby.rooms.values()].filter(room => room.variant === MIZUKI_VARIANT);
  product.mizukiAdminRuntime = {
    rooms: () => rooms().map(room => ({ code: room.code, token: identity(room), runId: runId(room),
      inMatch: !!room.match, capacity: room.seats.length,
      participants: room.seats.filter(Boolean).map(seat => ({ playerId: seat.playerId, accountId: registry.byId(seat.playerId)?.accountId || null })) })),
    close({ roomTokens = [], runIds = [] }) {
      const targets = rooms().filter(room => roomTokens.includes(identity(room)) || runIds.includes(runId(room)));
      const stop = new Set([...runIds, ...targets.map(runId).filter(Boolean)]);
      for (const id of stop) product.mizukiHosts.terminate(id);
      for (const room of targets) {
        for (const seat of room.seats.filter(Boolean)) {
          const session = registry.byId(seat.playerId);
          if (session?.pendingResult?.matchId && stop.has(session.pendingResult.matchId)) session.pendingResult = null;
        }
        lobby.disposeRoom(room, 'mizuki-admin');
      }
      return targets.map(room => room.code);
    },
  };
}

export class MizukiAdmin {
  constructor(product) { this.product = product; }
  accountIds() {
    const { mizuki, auth } = this.product;
    return [...new Set([...auth.users.values()].map(u => u.accountId).concat(
      mizuki.db.prepare('SELECT account_id FROM profiles UNION SELECT account_id FROM participants UNION SELECT account_id FROM active_accounts').all().map(r => r.account_id)))];
  }
  user(id) { const u = [...this.product.auth.users.values()].find(user => user.accountId === id); return { accountId: id, username: u?.username || id, deletedAccount: !u }; }
  plan(accountId) {
    const runs = this.product.mizuki.adminRuns(accountId);
    const rooms = this.product.mizukiAdminRuntime?.rooms().filter(room => room.participants.some(p => p.accountId === accountId) || runs.some(r => r.id === room.runId)) || [];
    return { runs, rooms, token: token([accountId, runs.map(r => [r.id, r.epoch]), rooms.map(r => r.token)]) };
  }
  view(accountId = null) {
    const { mizuki } = this.product;
    return { runs: mizuki.adminRuns(accountId).map(r => ({ ...r, participants: r.participants.map(p => ({ ...p, ...this.user(p.accountId) })) })),
      rooms: this.product.mizukiAdminRuntime?.rooms() || [],
      accounts: this.accountIds().filter(id => !accountId || id === accountId).map(id => {
        const plan = this.plan(id);
        return { ...this.user(id), profile: mizuki.profile(id), activeRunId: mizuki.active(id)?.id || null,
          runCount: plan.runs.length, resetToken: plan.token, affectedAccounts: [...new Set([...plan.runs, ...plan.rooms].flatMap(r => r.participants.map(p => p.accountId)).filter(Boolean))].map(a => this.user(a)) };
      }), audit: mizuki.db.prepare('SELECT doc FROM admin_audit ORDER BY created_at DESC,rowid DESC LIMIT 50').all().map(r => JSON.parse(r.doc)) };
  }
  execute(body, actor) {
    if (!body || !['closeRoom', 'deleteRun', 'resetAccount'].includes(body.action) || typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 200) fail(400, '请选择管理操作并填写原因（1–200字）');
    const { mizuki, mizukiAdminRuntime: runtime } = this.product;
    const reason = body.reason.trim();
    if (body.action === 'closeRoom') {
      if (typeof body.roomCode !== 'string' || typeof body.token !== 'string') fail(400, '房间管理目标无效');
      const room = runtime?.rooms().find(r => r.code === body.roomCode && r.token === body.token);
      if (!room || body.runId !== room.runId || body.confirm !== room.code) fail(409, '房间已变化或确认房间码不符，请刷新');
      // Revoke first, then stop callbacks before disposing the lobby room.
      if (room.runId) mizuki.transaction(() => {
        const run = mizuki.get(room.runId);
        if (run && ['running', 'suspended'].includes(run.status)) {
          mizuki.db.prepare("UPDATE runs SET epoch=epoch+1,status='suspended',updated_at=? WHERE id=?").run(Date.now(), run.id);
          if (run.seq === 0) {
            mizuki.db.prepare('DELETE FROM active_accounts WHERE run_id=?').run(run.id);
            mizuki.db.prepare("UPDATE runs SET status='start_failed' WHERE id=?").run(run.id);
          }
        }
        mizuki.adminAudit({ actor, action: body.action, reason, roomCode: room.code, runId: room.runId });
      });
      else mizuki.adminAudit({ actor, action: body.action, reason, roomCode: room.code });
      return { closedRooms: runtime.close({ roomTokens: [room.token] }) };
    }
    if (body.action === 'deleteRun') {
      if (typeof body.runId !== 'string' || !Number.isSafeInteger(body.epoch)) fail(400, '探索管理目标无效');
      const run = mizuki.get(body.runId);
      if (!run || run.epoch !== body.epoch || body.confirm !== run.id) fail(409, '探索已变化或确认探索编号不符，请刷新');
      const result = mizuki.adminDelete({ runIds: [run.id], actor, reason, action: body.action });
      runtime?.close({ runIds: [run.id] });
      return result;
    }
    if (typeof body.accountId !== 'string' || !this.accountIds().includes(body.accountId)) fail(404, '水月玩家不存在');
    const plan = this.plan(body.accountId);
    if (body.token !== plan.token || body.confirm !== this.user(body.accountId).username) fail(409, '玩家探索或房间已变化，或确认账号不符，请刷新');
    const runIds = plan.runs.map(r => r.id);
    const result = mizuki.adminDelete({ runIds, accountId: body.accountId, actor, reason, action: body.action });
    runtime?.close({ runIds, roomTokens: plan.rooms.map(r => r.token) });
    return result;
  }
  async handle(req, res) {
    const send = (status, value) => { const bytes = Buffer.from(JSON.stringify(value)); res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': bytes.length }); res.end(req.method === 'HEAD' ? undefined : bytes); };
    try {
      const { auth } = this.product, session = auth.session(req);
      auth.authorize(session, true);
      if (isAppRequest(req)) fail(403, '请使用浏览器管理水月存档');
      if (['GET', 'HEAD'].includes(req.method)) {
        const accountId = new URL(req.url, 'http://local').searchParams.get('accountId');
        send(200, this.view(accountId)); return;
      }
      if (req.method !== 'POST') fail(405, '仅支持 GET、HEAD 和 POST');
      if (!auth.sameOrigin(req)) fail(403, '请求来源不允许');
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, '请使用 JSON 请求');
      let size = 0; const chunks = [];
      for await (const chunk of req) { size += chunk.length; if (size > 8192) fail(413, '请求过大'); chunks.push(chunk); }
      let body; try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, 'JSON 格式错误'); }
      const actor = auth.authorize(session, true);
      if (auth.accountLimiter.take(actor.username, auth.now())) fail(429, '操作过于频繁，请稍后重试');
      send(200, this.execute(body, actor.accountId));
    } catch (error) { send(error.status || 500, { error: error.status ? error.message : '水月管理操作失败，请刷新核对当前状态' }); }
  }
}
