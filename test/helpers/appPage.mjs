import {APP_USER_AGENT} from '../../server/app-client.js';

// Game renderer/E2E tests simulate the WebView client. Browser-only policy is tested separately.
export async function appPage(page) {
  await page.setUserAgent((await page.browser().userAgent())+' '+APP_USER_AGENT);
  const emulate=page.emulate.bind(page);
  page.emulate=device=>emulate({...device,userAgent:(device.userAgent||'')+' '+APP_USER_AGENT});
  return page;
}
