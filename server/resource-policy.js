// Only public game content can enter a resource pack. Never walk a state/config directory.
import path from 'node:path';
export const FIXED_DATA = new Set(['assets','local-assets','bands','bonds','bosses','chess','choices','config','effects','emotes','enemies','factions','garrisons','items','stages','tokens','tuning','waves'].map(n=>`/data/${n}.json`));
export const FIXED_EXTENSIONS = new Set(['.png','.jpg','.jpeg','.gif','.webp','.avif','.svg','.ico','.skel','.atlas','.mp3','.ogg','.oga','.opus','.wav','.m4a','.aac','.woff','.woff2','.otf','.ttf','.bin','.obj','.mtl','.json','.css','.txt']);
export function fixedPath(url) {
  if(typeof url!=='string' || url.includes('%') || url.includes('\\') || url.includes('?') || url.includes('#') || url.split('/').slice(1).some(s=>!s || s.startsWith('.')))return false;
  return FIXED_DATA.has(url) || /^\/(assets|fonts|icons)\//.test(url) && FIXED_EXTENSIONS.has(path.posix.extname(url).toLowerCase());
}
export function resourceMime(url) {
  return ({'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.oga':'audio/ogg','.opus':'audio/ogg','.wav':'audio/wav','.m4a':'audio/mp4','.aac':'audio/aac','.woff':'font/woff','.woff2':'font/woff2','.otf':'font/otf','.ttf':'font/ttf','.json':'application/json','.css':'text/css','.atlas':'text/plain','.obj':'text/plain','.mtl':'text/plain','.txt':'text/plain'})[path.posix.extname(url).toLowerCase()] || 'application/octet-stream';
}
