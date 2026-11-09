import path from 'node:path';
import {deepFreeze} from './engine/server/data.js';
import { fileURLToPath } from 'node:url';
import { Match as GameplayMatch } from './engine/server/match/Match.js';
import { loadData, setModeData } from './engine/server/data.js';
import { validateC2S } from './engine/shared/protocol.js';
import { validateC2S as validateProductC2S } from '../../../shared/protocol.js';
import { chatText, CHAT_KEEP, CHAT_COOLDOWN_MS } from '../../../shared/chat.js';
import { EMOTES, EMOTE_COOLDOWN_MS } from '../../../shared/constants.js';
import { isGameEmoteId } from '../../../shared/chatStickers.js';
import { ZHAJING_VARIANT, ZHAJING_DIFFICULTY } from '../../../shared/zhajing-constants.js';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..', 'data/zhajing');
let modeData;
export function getZhajingData() {
  if (!modeData) { const original = loadData(dataDir);
    // Local adaptation: the reference omitted ZHAJING from its hidden-core allowlist.
    modeData = deepFreeze({...original, config: {...original.config, hiddenCore: {...original.config.hiddenCore, difficulties: [...new Set([...original.config.hiddenCore.difficulties, ZHAJING_DIFFICULTY])]}}});
    setModeData(modeData); }
  return modeData;
}

/** Adapt the shared character-key format to the embedded engine's skin lookup. */
export function projectZhajingSkins(skins, data = getZhajingData()) {
  const entries = skins && typeof skins === 'object' && !Array.isArray(skins) ? Object.entries(skins) : [];
  const projected = Object.assign(Object.create(null), Object.fromEntries(entries));
  const characters = new Map();
  for (const [key, skin] of entries) {
    if (!key.startsWith('char:') || key.length === 5 || typeof skin !== 'string' || !skin) continue;
    const charId = key.slice(5);
    characters.set(charId, skin);
    projected[charId] = skin;
  }
  for (const [key, record] of Object.entries(data?.chess || {})) {
    if (!record || record.isGolden || !characters.has(record.charId)) continue;
    const chessId = record.chessId || key;
    if (record.baseId && record.baseId !== chessId) continue;
    projected[chessId] = characters.get(record.charId);
  }
  return projected;
}

const ALLOWED = new Set(['g.infoReady', 'g.band', 'g.bandSkip', 'g.bandFocus', 'g.buy', 'g.refresh',
  'g.freeze', 'g.levelUp', 'g.sell', 'g.move', 'g.equip', 'g.art', 'g.destroy', 'g.reward', 'g.choice',
  'g.ready', 'g.chat', 'g.emote', 'g.watch', 'g.autoplay', 'g.pause', 'g.unitStats', 'g.spReroll', 'g.spWant',
  'g.specialRefresh', 'g.mysticRefresh', 'g.deathReturn', 'g.sellBanteng', 'g.cashCheque',
  'g.forgeTake', 'g.loadout']);

export class Match extends GameplayMatch {
  constructor(opts) {
    const data = getZhajingData();
    super({ ...opts, simPool: null, data, difficulty: ZHAJING_DIFFICULTY,
      seats: opts.seats?.map(seat => ({ ...seat, skins: projectZhajingSkins(seat.skins, data) })),
      modeId: opts.mode === 'solo' ? 'mode_single_zhajing' : 'mode_multi_zhajing' });
    // The reference constructor uses GEO.TEMP_SIZE (4), while rules/invariants use economy.tempSize (5).
    // Honour the data contract; the UI's extra coordinate remains reserved for future rules.
    for (const ps of this.order) ps.temp = Array.from({length: this.gd.tempSize}, (_, i) => ps.temp[i] || null);
    this.variant = ZHAJING_VARIANT;
    this.matchId = opts.matchId;
    this._persistRev = 1;
    for (const seat of opts.seats) {
      const ps = this.players.get(seat.playerId);
      if (ps) { ps.presentation = seat.presentation || null; ps.rank = seat.rank || null; }
    }
  }
  // Product communication uses the current catalog, while gameplay stays on the embedded protocol.
  _handle(ps, msg) {
    if (msg.t === 'g.chat') return this.chat(ps, msg.text);
    return super._handle(ps, msg);
  }
  chat(ps, value) {
    const text = chatText(value);
    if (!text) return {error: 'BAD_MSG'};
    const now = this.sched.now();
    if (now - (ps.lastChatAt ?? -Infinity) < CHAT_COOLDOWN_MS) return {error: 'RATE'};
    ps.lastChatAt = now;
    const presentation = this.playerPresentation?.(ps.playerId) || ps.presentation;
    const message = {seq: this.chatSeq = (this.chatSeq || 0) + 1, playerId: ps.playerId,
      name: ps.name, text, at: now, card: ps.card || presentation?.avatar || null,
      frame: presentation?.frame || null, namecard: presentation?.namecard || null,
      rank: presentation?.rank || ps.rank || null};
    this.chatMessages ??= [];
    this.chatMessages.push(message);
    if (this.chatMessages.length > CHAT_KEEP) this.chatMessages.shift();
    this.broadcast({t: 'm.chat', ...message});
    return {ok: true};
  }
  emote(ps, id) {
    const packOk = typeof this.isPackEmote === 'function' ? this.isPackEmote(id) : isGameEmoteId(id);
    if (!EMOTES.includes(id) && !packOk) return {error: 'BAD_MSG', detail: 'unknown emote'};
    const now = this.sched.now();
    if (now - ps.lastEmoteAt < EMOTE_COOLDOWN_MS) return {error: 'RATE'};
    ps.lastEmoteAt = now;
    this.broadcast({t: 'm.emote', playerId: ps.playerId, id});
    return {ok: true};
  }
  _resync(ps) {
    super._resync(ps);
    if (!this.ended) this.sendTo(ps.playerId, {t: 'm.chatHistory', messages: this.chatMessages || []});
  }
  startUnite(plans, round = 1, fieldPlans = null) {
    const fields = fieldPlans || (Array.isArray(plans) ? plans : [plans]);
    // This product mode has a single squad (1–4 humans). No helpers means no
    // battlefield or cross-squad relay, so do not publish a phantom UNITE phase.
    if (!fields.some(plan => plan?.helpers?.length)) return this.settle(null, null);
    return super.startUnite(plans, round, fieldPlans);
  }
  setSkins(playerId, skins) { return super.setSkins(playerId, projectZhajingSkins(skins)); }
  settle(plan, result) {
    const before = new Map(this.alivePlayers().map(ps => [ps.playerId, ps.lp]));
    super.settle(plan, result);
    this.roundOutcome = {round: this.round, losses: Object.fromEntries([...before].map(([id, lp]) =>
      [id, Math.max(0, lp - this.players.get(id).lp)]))};
    this.markPublic();
  }
  publicView() { return { ...super.publicView(), variant: ZHAJING_VARIANT, matchId: this.matchId,
    ...(this.phase === 'SETTLE' && this.roundOutcome?.round === this.round ? {roundOutcome: this.roundOutcome} : {}) }; }
  markPublic(...args) { this._persistRev = (this._persistRev || 0) + 1; return super.markPublic(...args); }
  markPrivate(...args) { this._persistRev = (this._persistRev || 0) + 1; return super.markPrivate(...args); }
  handle(playerId, frame) {
    let msg = frame;
    if (frame.t === 'g.zhajing') {
      msg = { ...frame.intent };
      if (!ALLOWED.has(msg.t)) return { error: 'BAD_MSG' };
      if (msg.t === 'g.watch') delete msg.viewOnly;
      const error = (msg.t === 'g.chat' || msg.t === 'g.emote' ? validateProductC2S : validateC2S)(msg);
      if (error) return { error: 'BAD_MSG', detail: error };
    }
    return super.handle(playerId, msg);
  }
  addObserver(id) { return this.addSpectator(id); }
  removeObserver(id) { return this.removeSpectator(id); }
  watchObserver(id, fieldId, targetId) {
    const spectator = this.spectators.get(id);
    if (!spectator) return { error: 'NOT_IN_ROOM' };
    return this.watch(spectator, fieldId, targetId);
  }
  captureRules() {
    const matchKeys = ['enemyJibian', 'enemyJibianCards', 'enemyJibianRoundsDone', 'enemyJibianDone',
      'hiddenJibian', '_hiddenJibianDone', 'jibianPlan', '_jibianSoloPick', '_jibianRewindRound'];
    const playerKeys = ['avatar', 'forge', 'greatSealUsed', 'bans', 'deniedBonds', 'bannedChess', 'banPick',
      'diyPicks', 'prepSnapshot', 'jibianConsumed', '_deathReturnRound', '_deathReturnLp'];
    return { version: 1, match: Object.fromEntries(matchKeys.filter(k => Object.hasOwn(this, k)).map(k => [k, this[k]])),
      players: this.order.map(ps => ({ playerId: ps.playerId,
        state: Object.fromEntries(playerKeys.filter(k => Object.hasOwn(ps, k)).map(k => [k, ps[k]])),
        pool: Object.fromEntries([...ps.pool().entries].map(([id, entry]) => [id, entry.left])),
      })) };
  }
  restoreRules(value) {
    if (value?.version !== 1) throw new Error('Unsupported 炸惊 checkpoint');
    Object.assign(this, value.match);
    for (const saved of value.players) {
      const ps = this.players.get(saved.playerId);
      if (!ps) throw new Error('Missing 炸惊 checkpoint seat');
      Object.assign(ps, saved.state);
      for (const [id, left] of Object.entries(saved.pool)) {
        const entry = ps.pool().entries.get(id); if (entry) entry.left = Math.min(entry.cap, left);
      }
    }
  }
  resumeRulePhase(phase, remaining) {
    if (phase === 'SP_DRAFT') {
      this.setDeadline(0);
      for (const draft of this.sp || []) if (draft) this.startSpTurn(draft);
    } else if (phase === 'ENEMY_JIBIAN') {
      this.setDeadline(Math.max(1, remaining / 1000), () => this.afterEnemyJibian());
    } else if (phase === 'HIDDEN_JIBIAN') {
      this.setDeadline(Math.max(1, remaining / 1000), () => this.enterPrep());
    }
    this.markPublic(); for (const ps of this.order) this.markPrivate(ps);
  }
}
