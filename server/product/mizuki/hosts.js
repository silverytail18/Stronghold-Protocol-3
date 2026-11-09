// Trusted mode transport; uses the same bounded match frames and MatchProxy
// lifecycle as content hosts. Persistent state stays in the parent process.
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { msg } from '../../../shared/i18n.js';
import { MatchProxy, wireOptions } from '../../match/host/proxy.js';
import { boundedJson, HOST_IPC_LIMITS } from '../../match/host/ipc.js';

class MizukiProxy extends MatchProxy {
  start() { if (!this.started) { this.started = true; this.host.start(); } }
  handle(playerId, message) {
    // Deduplication and dispatch are one ordered operation, including requests
    // arriving in the same event-loop turn before the first durable reply.
    const next = (this.commandTail || Promise.resolve()).then(() => this._handle(playerId, message));
    this.commandTail = next.catch(() => {});
    return next;
  }
  _handle(playerId, message) {
    if (message.t === 'g.mizuki.difficulty') return Promise.resolve({ error: 'BAD_TARGET', detail: '探索难度已在房间开局时锁定' });
    if (message.t === 'g.mizuki.importDungeon' || message.t === 'g.mizuki.archive' || message.t.startsWith('b.')) return Promise.resolve({ error: 'BAD_MSG' });
    const opId = message.opId || randomUUID();
    const command = { ...message, opId }; delete command.rid;
    try {
      const previous = this.host.store.operation(this.matchId, playerId, opId, command);
      if (previous) return Promise.resolve(previous);
    } catch (error) { return Promise.resolve({ error: 'BAD_TARGET', detail: error.message }); }
    return this._request('handle', [playerId, { ...message, opId }]);
  }
  _post(message) {
    if (message.type === 'call' && message.method === 'handle') {
      const [playerId, raw] = message.args, command = { ...raw }; delete command.rid;
      message.operation = { playerId, opId: raw.opId, command };
    }
    super._post(message);
  }
  setHost(playerId) { this._notify('setHost', [playerId]); }
  setSkins(playerId, skins) { return this._request('setSkins', [playerId, skins]); }
}

export class MizukiHosts {
  constructor({ store, log = console, maxWorkers = 4, otherWorkers = () => 0 }) {
    this.store = store; this.log = log; this.maxWorkers = maxWorkers; this.otherWorkers = otherWorkers;
    this.hosts = new Set(); this.stopping = false;
  }
  create(opts) {
    if (this.stopping || this.hosts.size + this.otherWorkers() >= this.maxWorkers) throw Object.assign(Error('水月模拟容量已满，请稍后开始'), { code: 'PLUGIN_BUSY' });
    const run = opts.mizukiRun;
    if (!run || run.options.matchId !== opts.matchId) throw Error('水月探索身份无效');
    const child = fork(fileURLToPath(new URL('./entry.js', import.meta.url)), [], {
      serialization: 'advanced', windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'ipc'], execArgv: ['--max-old-space-size=768'],
    });
    let lastBeat = Date.now(), closed = false;
    const host = { kind: 'mizuki', store: this.store, child,
      post: message => { if (child.connected) child.send(message); },
      start: () => child.send({ type: 'init', epoch: run.epoch, seq: run.seq, banks: run.banks,
        checkpoint: run.checkpoint, data: opts.data,
        opts: { ...wireOptions(opts), hostId: opts.hostId, matchId: run.id, mizukiDifficultyGrade: opts.mizukiDifficultyGrade,
          endingUnlocks: opts.endingUnlocks } }),
      forget: () => { closed = true; clearInterval(watch); this.hosts.delete(host); if (child.connected) child.disconnect(); },
    };
    const proxy = new MizukiProxy({ host, matchId: run.id, opts, log: this.log }); host.proxy = proxy;
    host.terminate = () => {
      closed = true; clearInterval(watch); this.hosts.delete(host);
      proxy._settle({ error: 'BAD_TARGET', detail: '管理员已关闭此水月探索' });
      proxy.dispose();
      child.kill();
    };
    const failed = error => {
      if (closed) return;
      closed = true; clearInterval(watch); this.hosts.delete(host);
      if (this.store.get(run.id)?.seq === 0) this.store.cancelStart(run.id); else this.store.suspend(run.id);
      this.log.error?.('[mizuki-host]', error);
      proxy._settle({ error: 'INTERNAL', detail: '探索暂时中断，已保存的进度可恢复' });
      opts.broadcast({ t: 'm.toast', ...msg('探索暂时中断，已保存的进度可恢复') });
      // This is an interruption, never a victory/result grant.
      proxy._end({ variant: 'entertainment_mizuki', ranked: false, reason: 'mizuki-suspended', players: [] });
      child.kill();
    };
    const watch = setInterval(() => { if (Date.now() - lastBeat > 10000) failed('watchdog'); }, 1000); watch.unref();
    child.stderr.on('data', bytes => this.log.warn?.('[mizuki-worker]', String(bytes).slice(0, 4000)));
    child.on('error', failed);
    child.on('exit', (code, signal) => { if (!closed) failed(`worker exit ${code ?? signal}`); });
    child.on('message', message => {
      if (closed) return;
      if (message?.type === 'hb') { lastBeat = Date.now(); return; }
      if (message?.type === 'log') { this.log[message.level]?.('[mizuki]', message.text); return; }
      if (message?.type === 'failed') { failed(message.error); return; }
      if (message?.type === 'commit') {
        try {
          if (!boundedJson(message, HOST_IPC_LIMITS.message)) throw Error('水月存档消息过大或无效');
          const answer = this.store.commit(run.id, message);
          child.send({ type: 'ack', id: message.id, ...answer });
        } catch (error) { child.send({ type: 'ack', id: message.id, error: error.message }); }
        return;
      }
      proxy.deliver({ ...message, matchId: run.id });
    });
    this.hosts.add(host);
    return proxy;
  }
  async suspendAll() {
    this.stopping = true;
    await Promise.all([...this.hosts].map(async host => {
      await host.proxy._request('suspend', []);
      this.store.suspend(host.proxy.matchId);
    }));
  }
  terminate(runId) {
    for (const host of [...this.hosts]) if (host.proxy.matchId === runId) host.terminate();
  }
  close() { for (const host of [...this.hosts]) host.proxy.dispose(); }
}
