import { CHAT_KEEP } from '../../../shared/chat.js';

const inBattle = s => !!s.room?.inMatch && s.match?.public?.phase !== 'RESULT' && !s.match?.result;

// Result, room closure and new-match frames already exist. Reuse them to expire chat.
export function installChatSync(net, store, now = Date.now) {
  net.on('m.chat', msg => {
    if (!inBattle(store.get())) return;
    store.set(s => ({ chat: [...s.chat.filter(m => m.seq !== msg.seq).slice(-(CHAT_KEEP - 1)), { ...msg, receivedAt: now() }] }));
  });
  net.on('m.chatHistory', msg => {
    if (!inBattle(store.get())) return;
    store.set({ chat: (msg.messages || []).slice(-CHAT_KEEP).map(m => ({ ...m, receivedAt: 0 })) });
  });
  store.subscribe((s, prev) => {
    const newBattle = s.room?.inMatch && (!prev.room?.inMatch || s.room.code !== prev.room.code);
    if (s.chat.length && (newBattle || !inBattle(s))) store.set({ chat: [] });
  });
}
