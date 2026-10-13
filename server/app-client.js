// Client feature policy. Account and administrator authorization remains enforced by auth.js.
import path from 'node:path';
export const APP_USER_AGENT = 'StrongholdProtocolApp/1';
export const isAppRequest = (req) => /(?:^|\s)StrongholdProtocolApp\/1(?:\s|$)/.test(req.headers['user-agent'] || '');
// Browsers can fetch only the account UI. This allowlist also blocks direct game asset URLs.
export const BROWSER_STATIC = new Set(['/js/login.js', '/css/login.css', '/js/account.js', '/js/ranked-admin.js', '/js/adminTestControls.js', '/css/account.css']);
export function isMobileBrowser(req) {
  if (isAppRequest(req)) return false;
  return req.headers['sec-ch-ua-mobile'] === '?1' || /Android|iPhone|iPad|iPod|Mobile|Windows Phone|HarmonyOS/i.test(req.headers['user-agent'] || '');
}
export function isAccountResource(pathname) {
  let normalized;
  try { normalized = path.posix.normalize(decodeURIComponent(pathname).replaceAll('\\', '/')).toLowerCase().replace(/\/$/, ''); }
  catch { return true; }
  return ['/admin', '/account', '/account.html', '/js/account.js', '/js/ranked-admin.js', '/js/admintestcontrols.js', '/css/account.css', '/auth/password'].includes(normalized)
    || normalized.startsWith('/auth/admin/');
}
