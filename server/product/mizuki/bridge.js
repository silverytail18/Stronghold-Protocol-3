import { randomInt } from 'node:crypto';
import { MIZUKI_VARIANT, MIZUKI_CAPACITIES } from '../../../shared/mizuki-constants.js';
import { DEFAULT_VERSION } from '../../../shared/versions.js';
import { MizukiHosts } from './hosts.js';
import { attachMizukiAdminRuntime } from './admin.js';

const fail = detail => ({ error: 'BAD_TARGET', detail });
export function attachMizukiProduct({ lobby, registry, product }) {
  const store = product.mizuki;
  if (!store) return;
  const hosts = new MizukiHosts({ store, log: lobby.log,
    otherWorkers: () => (lobby.hosts?.stats().workers || 0) + (lobby.versionHosts?.stats().workers || 0) });
  lobby.mizukiHosts = hosts; product.mizukiHosts = hosts;
  attachMizukiAdminRuntime({ lobby, registry, product });
  lobby.hosts?.setExternalWorkers(() => hosts.hosts.size + (lobby.versionHosts?.stats().workers || 0));
  lobby.versionHosts?.setExternalWorkers(() => hosts.hosts.size + (lobby.hosts?.stats().workers || 0));
  product.mizukiResuming = new Set();
  const wrap = (name, handler) => { const original = lobby[name].bind(lobby); lobby[name] = (...args) => handler(original, ...args); };
  const originalCreate = lobby.create.bind(lobby);
  wrap('create', (original, session, msg) => {
    if (msg.variant === MIZUKI_VARIANT) {
      if (!product.mizukiResourceReady) return fail('水月资源尚未完成客户端分发，请等待更新');
      if (store.active(session.accountId)) return fail('你有尚未结束的水月探索，请使用继续探索');
    }
    return original(session, msg);
  });
  wrap('join', (original, session, msg) => {
    const room = lobby.getRoom(msg.code);
    if (room?.variant === MIZUKI_VARIANT) {
      const active = store.active(session.accountId);
      if (room.mizukiResumeRunId) {
        if (!active || active.id !== room.mizukiResumeRunId) return fail('恢复房间仅限原探索成员');
      } else if (active) return fail('请先结束你当前的水月探索');
    }
    return original(session, msg);
  });
  wrap('handleMessage', (original, session, msg, context) => {
    if (!product.gameplayUserFor(session)) return fail('请重新登录');
    const room = lobby.roomOf(session);
    if (msg.t === 'room.mizukiAbandon') {
      try { return store.abandon(msg.runId, session.accountId); } catch (error) { return fail(error.message); }
    }
    if (msg.t === 'room.mizukiResume') {
      if (!product.mizukiResourceReady) return fail('请先更新水月客户端资源');
      const run = store.active(session.accountId);
      if (run && run.options.resourceHash !== (product.mizukiResourceHash || null)) return fail('此探索的资源版本与服务器不同，请联系管理员保留对应版本');
      if (!run || run.id !== msg.runId || run.status !== 'suspended') return fail('没有可以恢复的水月探索');
      const existing = [...lobby.rooms.values()].find(r => r.mizukiResumeRunId === run.id);
      if (existing) return lobby.join(session, { code: existing.code });
      product.mizukiResuming.add(session);
      let result;
      try { result = originalCreate(session, { mode: 'coop', difficulty: 'NORMAL', version: DEFAULT_VERSION, variant: MIZUKI_VARIANT, mizukiDifficultyGrade: run.options.mizukiDifficultyGrade, capacity: run.options.roomCapacity || 4 }); }
      finally { product.mizukiResuming.delete(session); }
      if (!result?.error) { const created = lobby.roomOf(session); created.mizukiResumeRunId = run.id; lobby.broadcastState(created); }
      return result;
    }
    if (room?.variant === MIZUKI_VARIANT) {
      if (msg.t === 'room.setCapacity') {
        if (room.match || room.hostId !== session.playerId || !room.seats.some(s => s?.playerId === session.playerId)) return fail('仅房主可在探索开局前调整房间人数');
        if (!MIZUKI_CAPACITIES.includes(msg.capacity)) return fail('水月房间人数应为 1–4 人');
        if (room.seats.slice(msg.capacity).some(Boolean)) return fail('请先清空超出新人数上限的席位，不会自动移出成员');
        if (room.mizukiResumeRunId) {
          const run = store.get(room.mizukiResumeRunId);
          if (!run?.checkpoint) return fail('原探索记录暂不可用');
          const required = run.participants.filter(member => run.checkpoint.players.some(player => player.playerId === member.playerId && player.alive && !player.left)).length;
          if (msg.capacity < required) return fail(`原探索仍需 ${required} 位成员归队，人数上限不能小于该人数`);
        }
        if (msg.capacity === room.seats.length) return { ok: true };
        lobby.dropReplay(room, session.playerId);
        room.seats = Array.from({ length: msg.capacity }, (_, index) => room.seats[index] || null);
        room.capacity = msg.capacity;
        for (const seat of room.seats) if (seat && seat.playerId !== room.hostId) seat.ready = false;
        lobby.broadcastState(room); return { ok: true };
      }
      if (msg.t === 'room.mizukiDifficulty') {
        if (room.match || room.mizukiResumeRunId || room.hostId !== session.playerId || !room.seats.some(s => s?.playerId === session.playerId)) return fail('仅房主可在新探索开局前设置难度');
        room.mizukiDifficultyGrade = msg.grade;
        for (const seat of room.seats) if (seat && seat.playerId !== room.hostId) seat.ready = false;
        lobby.broadcastState(room); return { ok: true };
      }
      if (['room.setRanked', 'room.setVersion', 'room.setMode', 'room.setPlugins', 'room.setProductContent', 'room.setDifficulty', 'room.setAiTakeover', 'room.setAiPicksLast'].includes(msg.t)) return fail('水月使用独立规则，请在探索界面设置');
    }
    return original(session, msg, context);
  });
  wrap('startMatch', (original, room, key) => {
    if (room.variant !== MIZUKI_VARIANT) return original(room, key);
    if (!product.mizukiResourceReady) return fail('水月资源尚未完成客户端分发');
    if (room.match) return fail('探索已经开始');
    const seats = room.seats.filter(Boolean);
    if (seats.length !== room.seats.length) return fail(`水月房间需要满员后开始（${seats.length}/${room.seats.length}），请等待成员加入或调整房间人数`);
    if (seats.some(s => s.connected === false)) return fail('请等待所有水月成员连接后开始');
    if (seats.some(s => s.isBot || !product.gameplayUserFor(registry.byId(s.playerId)))) return fail('成员账号状态已变化，请重新登录');
    if (seats.some(s => s.playerId !== room.hostId && !s.ready)) return fail('请等待所有成员准备');
    const accounts = new Map(seats.map(s => [s.playerId, registry.byId(s.playerId)?.accountId]));
    let run;
    try {
      if (room.mizukiResumeRunId) {
        const previous = store.get(room.mizukiResumeRunId);
        if (previous?.options.resourceHash !== (product.mizukiResourceHash || null)) return fail('原探索资源版本不匹配，请联系管理员');
        run = store.rebindAndClaim(room.mizukiResumeRunId, seats, accounts, room.code, room.seats.length);
      }
      else run = store.begin({ seats, seed: randomInt(1, 0xffffffff), matchNo: room.matchCount + 1,
        roomCapacity: room.seats.length, endingUnlocks: store.profile(accounts.get(room.hostId)).endingUnlocks, roomCode: room.code, mode: 'coop', difficulty: 'NORMAL', mizukiDifficultyGrade: room.mizukiDifficultyGrade }, accounts);
      room.productMizukiOptions = { mizukiRun: run, matchId: run.id, seed: run.options.seed, matchNo: run.options.matchNo,
        mizukiDifficultyGrade: run.options.mizukiDifficultyGrade, endingUnlocks: run.options.endingUnlocks,
        ...(run.checkpoint ? { seats: run.options.seats } : {}) };
      const answer = original(room, key);
      if (answer?.error) { if (run.seq === 0) store.cancelStart(run.id); else store.suspend(run.id); }
      return answer;
    } catch (error) {
      if (run) { if (run.seq === 0) store.cancelStart(run.id); else store.suspend(run.id); }
      return fail(error.message);
    }
  });
}
