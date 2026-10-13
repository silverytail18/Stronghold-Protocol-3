export const CHAT_MAX_LENGTH = 200;
export const CHAT_KEEP = 50;
export const CHAT_COOLDOWN_MS = 2000;
export const CHAT_BUBBLE_MS = 6000;
export function chatText(value) {
  if (typeof value !== 'string' || value.length > CHAT_MAX_LENGTH * 2) return null;
  const text = value.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
  return text && Array.from(text).length <= CHAT_MAX_LENGTH ? text : null;
}
