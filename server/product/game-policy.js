// Resource access and native capability are product policy; account authorization is always separate.
import path from 'node:path';
export const RESOURCE_CONTRACT=2;
export function normalizedPath(url){
  const raw=String(url||'/').split('?')[0];
  if(raw.length>4096)throw Error('long path');
  const decoded=decodeURIComponent(raw);
  if(/[\0\\]/.test(decoded)||/%[0-9a-f]{2}/i.test(decoded)||decoded.split('/').some(s=>s==='..'||s==='.')||!decoded.startsWith('/'))throw Error('invalid path');
  return path.posix.normalize(decoded);
}
export function clientResourceHash(req){return /(?:^|\s)StrongholdProtocolApp\/2\s+Resources\/([a-f0-9]{64})(?:\s|$)/.exec(req.headers['user-agent']||'')?.[1]||null;}
export function nativeCompatible(req,hash){return !!hash&&clientResourceHash(req)===hash;}
export const ACCOUNT_FILES=new Map([
  ['/css/community.css',['public/css/community.css','text/css; charset=utf-8']],
  ['/account',['public/product/account.html','text/html; charset=utf-8']],
  ['/account.html',['public/product/account.html','text/html; charset=utf-8']],
  ['/product/player-stats.js',['public/product/player-stats.js','text/javascript; charset=utf-8']],
  ['/shared/stats.js',['shared/stats.js','text/javascript; charset=utf-8']],
  ['/shared/player-name.js',['shared/player-name.js','text/javascript; charset=utf-8']],
  ['/shared/constants.js',['shared/constants.js','text/javascript; charset=utf-8']],
  ['/shared/versions.js',['shared/versions.js','text/javascript; charset=utf-8']],
  ['/product/account.js',['public/product/account.js','text/javascript; charset=utf-8']],
  ['/product/content-admin.js',['public/product/content-admin.js','text/javascript; charset=utf-8']],
  ['/product/mizuki-admin.js',['public/product/mizuki-admin.js','text/javascript; charset=utf-8']],
  ['/product/mode-admin.js',['public/product/mode-admin.js','text/javascript; charset=utf-8']],
  ['/product/music-admin.js',['public/product/music-admin.js','text/javascript; charset=utf-8']],
  ['/product/feedback-admin.js',['public/product/feedback-admin.js','text/javascript; charset=utf-8']],
  ['/product/emote-admin.js',['public/product/emote-admin.js','text/javascript; charset=utf-8']],
  ['/product/appeal-admin.js',['public/product/appeal-admin.js','text/javascript; charset=utf-8']],
  ['/product/ranked-admin.js',['public/product/ranked-admin.js','text/javascript; charset=utf-8']],
  ['/product/account.css',['public/product/account.css','text/css; charset=utf-8']],
  ['/css/theme.css',['public/css/theme.css','text/css; charset=utf-8']],
  ['/css/components.css',['public/css/components.css','text/css; charset=utf-8']],
  ['/shared/i18n.js',['shared/i18n.js','text/javascript; charset=utf-8']],
  ['/shared/i18nPacks.js',['shared/i18nPacks.js','text/javascript; charset=utf-8']],
]);
export function isFixedResource(p){
  return /^\/(?:assets|fonts|media|icons|downloads|resource-packs|mobile|fx|fx-packs|p|vs)(?:\/|$)/i.test(p)
    || /^\/data\/(?:assets|local-assets|local-fx)\.json$/i.test(p)
    || /\.(?:apk|zip|gz|png|jpe?g|webp|gif|avif|ico|svg|mp3|ogg|wav|m4a|aac|mp4|webm|skel|atlas|obj|bin|woff2?|ttf|otf)(?:$|\/)/i.test(p)
    || /^\/(?:studio|x|dev)(?:\/|$)/i.test(p);
}
