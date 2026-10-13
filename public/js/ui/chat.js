import { useEffect, useRef, useState } from '../../vendor/hooks.module.js';
import { html, Button } from './components.js';
import { GIcon } from './gameComponents.js';
import { RankBadge } from './rankBadge.js';
import { useStore } from '../store.js';
import { chatText, CHAT_MAX_LENGTH, CHAT_COOLDOWN_MS, CHAT_BUBBLE_MS } from '../../../shared/chat.js';
import { actions } from './gameActions.js';

let lastSent = -Infinity;
export function ChatBubble({ message }) {
  const remaining = useRef(Math.max(0, CHAT_BUBBLE_MS - (Date.now() - message.receivedAt))).current;
  return html`<div class="team__chat" title=${message.text} aria-live="polite" style=${`--chat-exit-delay:${Math.max(0, remaining - 180)}ms`}><span>${message.text}</span></div>`;
}

export function ChatPanel({ open, onToggle, disabled = false }) {
  const messages = useStore(s => s.chat);
  const myId = useStore(s => s.me.playerId);
  const [draft, setDraft] = useState(''), [busy, setBusy] = useState(false), [now, setNow] = useState(Date.now());
  const [present, setPresent] = useState(open);
  const list = useRef(null), input = useRef(null);
  const pinned = useRef(true), wasOpen = useRef(false);
  useEffect(() => {
    if (open && list.current) {
      if (!wasOpen.current) { pinned.current = true; list.current.scrollTop = list.current.scrollHeight; }
      else if (pinned.current) list.current.scrollTo({ top: list.current.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    wasOpen.current = open;
  }, [open, messages]);
  useEffect(() => { if (open) { input.current?.focus(); setNow(Date.now()); } }, [open]);
  useEffect(() => {
    if (open) { setPresent(true); return; }
    input.current?.blur();
    if (!present) return;
    const timer = setTimeout(() => setPresent(false), 140);
    return () => clearTimeout(timer);
  }, [open, present]);
  // Tick only during the two-second send cooldown, never while the panel is idle.
  useEffect(() => {
    if (!open || now >= lastSent + CHAT_COOLDOWN_MS) return;
    const timer = setTimeout(() => setNow(Date.now()), 250);
    return () => clearTimeout(timer);
  }, [open, now]);
  const length = Array.from(draft).length, cooldown = Math.max(0, Math.ceil((lastSent + CHAT_COOLDOWN_MS - now) / 1000));
  const send = async () => {
    const text = chatText(draft);
    if (!text || disabled || busy || Date.now() < lastSent + CHAT_COOLDOWN_MS) return;
    setBusy(true);
    try { if (await actions.chat(text)) { lastSent = Date.now(); setNow(lastSent); setDraft(''); input.current?.focus(); } }
    finally { setBusy(false); }
  };
  return html`<div class="match-chat">
    <button type="button" class="emote-wheel__trigger" title="局内文字聊天" aria-label="局内文字聊天" aria-expanded=${String(open)} onClick=${() => onToggle(!open)}><${GIcon} name="emote" /><span>聊天</span></button>
    ${open || present ? html`<section class=${`match-chat__panel${open ? '' : ' is-closing'}`} aria-label="局内聊天" aria-hidden=${open ? undefined : 'true'} onPointerDown=${e => e.stopPropagation()}>
      <header><b>局内频道</b><small>最近 ${messages.length} 条 · 仅本局成员</small><button aria-label="关闭聊天" onClick=${() => onToggle(false)}>×</button></header>
      <div class="match-chat__messages" ref=${list} role="log" aria-live="polite" onScroll=${e => { const el = e.currentTarget; pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 36; }}>${messages.length ? messages.map(m => html`<article key=${m.seq} class=${`${m.playerId === myId ? 'is-self' : ''}${m.receivedAt > 0 && Date.now() - m.receivedAt < 400 ? ' is-new' : ''}`}>
        <div><${RankBadge} rank=${m.rank} /><b>${m.name}</b><small>${m.playerId === myId ? '你 · ' : ''}${new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div><p>${m.text}</p></article>`) : html`<p class="t-lo">发送文字，与同盟队友交流战术。</p>`}</div>
      <form onSubmit=${e => { e.preventDefault(); send(); }}><textarea ref=${input} value=${draft} maxLength="400" rows="2" aria-label="聊天内容" placeholder="输入聊天内容（最多 200 字）" onInput=${e => setDraft(e.target.value)} onKeyDown=${e => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } }} />
        <div><small class=${length > CHAT_MAX_LENGTH ? 't-orange' : 't-lo'}>${length} / ${CHAT_MAX_LENGTH}</small><${Button} size="sm" variant="primary" loading=${busy} disabled=${disabled || cooldown > 0 || !chatText(draft)} type="submit">${disabled ? '连接已断开' : cooldown ? `${cooldown} 秒` : '发送'}<//></div></form>
    </section>` : null}
  </div>`;
}
