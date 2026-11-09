// Mode-local resource closure through the current asset resolvers.
import { chessAvatarUrl, chessPortraitUrl, skillIconUrl } from './ui/assetUrls.js';
export function spineResourceUrls(entry) {
  if (!entry?.skel) return [];
  return [...new Set([entry.skel, entry.atlas || entry.skel.replace(/\.skel$/, '.atlas'),
    ...(entry.textures?.length ? entry.textures : [entry.skel.replace(/\.skel$/, '.png')])])];
}
export function collectMatchResourceUrls(assets, source, match) {
  const urls = new Set(), list = value => Array.isArray(value) ? value : [];
  const add = url => { if (typeof url === 'string' && url.startsWith('/')) urls.add(url); };
  const addModel = (id, skin) => {
    for (const back of [false, true]) {
      const seen = new Set();
      let entry = assets.spineEntry(id, { back, skin });
      while (entry && !seen.has(entry)) {
        seen.add(entry); spineResourceUrls(entry).forEach(add); entry = entry.fallback;
      }
    }
  };
  for (const piece of [...list(match?.private?.hand), ...list(match?.field?.units)]) {
    const id = piece.id || piece.defId;
    const rec = source.lookup(piece.kind === 'token' || piece.isToken ? 'tokens' : 'chess', id);
    if (rec) {
      add(chessAvatarUrl(assets.manifest, rec, { skin: piece.skin }));
      add(chessPortraitUrl(assets.manifest, rec, piece.skin));
      add(skillIconUrl(assets.manifest, rec));
    }
    add(assets.picture(piece.avatar || rec?.assets?.avatar || rec?.charId || id, { skin: piece.skin }));
    addModel(piece.spine || rec?.assets?.spine || rec?.charId || id, piece.skin);
    for (const item of list(piece.items)) add(assets.itemIcon(source.lookup('items', typeof item === 'string' ? item : item.id) || item));
  }
  for (const enemy of list(match?.private?.nextEnemies)) {
    if (!enemy?.enemyKey) continue;
    const rec = source.lookup('enemies', enemy.enemyKey);
    add(assets.enemyIcon(enemy.enemyKey)); addModel(rec?.spine || enemy.enemyKey);
  }
  return [...urls];
}
