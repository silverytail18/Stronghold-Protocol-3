// Trusted, single-run child. Commands and scheduler callbacks share one serial
// queue. Visible acknowledgements follow the parent's durable transaction.
import { setData } from '../../data.js';
import { RealScheduler } from '../../match/scheduler.js';
import { validateC2S } from '../../../shared/protocol.js';

let match, scheduler, options, tail = Promise.resolve(), seq = 0, transactionId = 0;
let frames = [], dirty = false, finalSummary = null, dead = false;
const pending = new Map();
const post = message => { if (process.connected) process.send(message); };
const safe = value => JSON.parse(JSON.stringify(value));
const beat = setInterval(() => post({ type: 'hb' }), 1000);
beat.unref();
process.on('disconnect', () => process.exit(0));

function enqueue(fn, replyId, operation = null) {
  tail = tail.then(async () => {
    if (dead) return;
    frames = []; dirty = false; finalSummary = null;
    let result;
    try {
      result = await fn() || { ok: true };
      if (dirty || operation || finalSummary) {
        const id = ++transactionId;
        const checkpoint = match.exportCheckpoint();
        const banks = Object.fromEntries(match.bankAccounts);
        const packet = { type: 'commit', id, epoch: options.epoch, seq: seq + 1, checkpoint, banks,
          summary: finalSummary, operation, result: safe(result) };
        const ack = new Promise((resolve, reject) => {
          const timer = setTimeout(() => { pending.delete(id); reject(Error('水月存储确认超时')); }, 10000);
          pending.set(id, { resolve, reject, timer });
        });
        post(packet);
        await ack;
        seq++;
      }
      for (const frame of frames) post(frame);
      if (replyId) post({ type: 'reply', id: replyId, result: safe(result) });
    } catch (error) {
      dead = true; scheduler?.dispose(); match?.dispose();
      post({ type: 'failed', error: String(error?.stack || error).slice(0, 3500) });
    }
  });
}

class SerialScheduler extends RealScheduler {
  _wrap(fn) { return () => enqueue(fn); }
  setInterval(fn, ms) {
    if (this.disposed) return null;
    const handle = { active: true, timer: null };
    const arm = () => {
      if (!handle.active || this.disposed) return;
      handle.timer = setTimeout(() => enqueue(async () => { if (handle.active) await fn(); arm(); }), Math.max(1, ms));
      handle.timer.unref();
    };
    this._intervals.add(handle); arm(); return handle;
  }
  clearInterval(handle) { if (!handle) return; handle.active = false; clearTimeout(handle.timer); this._intervals.delete(handle); }
  dispose() { for (const handle of [...this._intervals]) this.clearInterval(handle); super.dispose(); }
}

async function boot(message) {
  options = message;
  seq = message.seq;
  setData(message.data);
  const { MizukiMatch } = await import('../../modes/mizuki/Match.js');
  scheduler = new SerialScheduler();
  match = new MizukiMatch({ ...message.opts, data: message.data, scheduler,
    bankAccounts: message.banks,
    send: (playerId, msg) => { frames.push({ type: 'send', playerId, msg: safe(msg) }); return true; },
    broadcast: msg => frames.push({ type: 'broadcast', msg: safe(msg) }),
    onCheckpoint: () => { dirty = true; },
    onBankAccountUpdate: () => { dirty = true; return true; },
    onEnd: summary => { finalSummary = safe(summary); frames.push({ type: 'end', summary: finalSummary }); },
    log: Object.fromEntries(['info', 'warn', 'error', 'debug'].map(level => [level, (...args) => post({ type: 'log', level, text: args.map(v => String(v?.stack || v)).join(' ').slice(0, 4000) })])),
  });
  enqueue(() => {
    if (message.checkpoint) {
      if (!match.restoreCheckpoint(message.checkpoint)) throw Error('水月检查点不能在此规则版本恢复');
    } else match.start();
    return { ok: true };
  });
}

process.on('message', message => {
  if (message.type === 'ack') {
    const job = pending.get(message.id);
    if (!job) return;
    pending.delete(message.id); clearTimeout(job.timer);
    if (message.error) job.reject(Error(message.error)); else job.resolve(message);
    return;
  }
  if (message.type === 'init' && !options) { boot(message).catch(error => post({ type: 'failed', error: String(error.stack || error) })); return; }
  if (message.type === 'dispose') { tail.finally(() => { scheduler?.dispose(); match?.dispose(); process.exit(0); }); return; }
  if (message.type !== 'call' || !options) return;
  enqueue(() => {
    const { method, args = [] } = message;
    if (method === 'diag') return { phase: match.phase, ended: match.ended, revision: match.revision,
      fields: [...match.fields.keys()], players: match.order.map(p => ({ playerId: p.playerId, ready: p.ready, alive: p.alive })) };
    if (method === 'suspend') { scheduler.dispose(); dirty = true; return { ok: true }; }
    if (method === 'handle') {
      const msg = args[1];
      if (validateC2S(msg) || ['g.mizuki.importDungeon', 'g.mizuki.archive'].includes(msg.t) || msg.t.startsWith('b.')) return { error: 'BAD_MSG' };
      return match.handle(args[0], msg);
    }
    const mapped = ({ addSpectator: 'addObserver', removeSpectator: 'removeObserver' })[method] || method;
    if (['onDisconnect', 'onReconnect', 'onLeave', 'setHost', 'setSkins', 'setLoadout', 'addObserver', 'removeObserver'].includes(mapped)) {
      if (typeof match[mapped] === 'function') return match[mapped](...args);
      if (mapped === 'setLoadout') return { error: 'ROOM_STARTED' };
      return { ok: true };
    }
    return { error: 'BAD_MSG' };
  }, message.id, message.operation || null);
});
