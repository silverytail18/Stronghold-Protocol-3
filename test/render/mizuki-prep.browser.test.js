import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'test/e2e/out');
const CHROME = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const enabled = process.env.MIZUKI_RENDER_E2E === '1' && existsSync(CHROME) && existsSync(path.join(ROOT, 'public/assets'));

test('Mizuki preparation shows the complete field and its lower prep rows in browser', {
  skip: enabled ? false : 'set MIZUKI_RENDER_E2E=1 (needs Chrome and local assets)', timeout: 120000,
}, async () => {
  const puppeteer = (await import('puppeteer-core')).default;
  const { startServer } = await import('../../server/index.js');
  const srv = await startServer({ port: 0, host: '127.0.0.1', quiet: true });
  let browser;
  try {
    await srv.assetIndex?.whenReady();
    browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run', '--no-sandbox'] });
    mkdirSync(OUT, { recursive: true });

    for (const [label, width, height] of [['desktop', 1440, 900], ['phone-landscape', 844, 390]]) {
      const page = await browser.newPage();
      const problems = [];
      page.on('console', message => { if (message.type() === 'error') problems.push(message.text()); });
      page.on('pageerror', error => problems.push(error.message));
      page.on('response', response => { if (response.status() >= 400) problems.push(`HTTP ${response.status()} ${response.url()}`); });
      await page.setRequestInterception(true);
      page.on('request', request => request.url().endsWith('/dev/render-demo.js')
        ? request.respond({ status: 200, contentType: 'text/javascript', body: 'window.__demo = { ready: true };' })
        : request.continue());
      await page.setViewport({ width, height });
      await page.goto(`http://127.0.0.1:${srv.port}/dev/render-demo.html?scene=prep&panel=0&quality=low`, {
        waitUntil: 'domcontentloaded', timeout: 15000,
      });
      await page.evaluate(() => document.getElementById('panel')?.classList.add('is-hidden'));
      const geometry = await page.evaluate(async () => {
        const [{ createFieldView }, prep] = await Promise.all([
          import('/js/mizukiNativeApp.js'), import('/js/mizukiPrep.js'),
        ]);
        const assets = {
          ready: async () => null, local: async () => null, spineEntry: () => null,
          ui: () => null, image: async () => null, itemIcon: () => null, bondIcon: () => null,
          onChange: () => () => {}, loaded: true, manifest: {},
        };
        const view = await createFieldView(document.querySelector('#field'), {
          assets, settings: { quality: 'low', damageNumbers: false }, board: '2d',
          padding: { top: 24, right: 24, bottom: 64, left: 24 },
        });
        await view.setBoardMode?.('2d');
        const source = { id: 'synthetic-mizuki-map', rows: Array(19).fill('r'.repeat(21)), tiles: {}, originalSize: [19, 21] };
        const rect = { r0: 0, r1: 18, c0: 0, c1: 20 };
        const stage = prep.mizukiPrepStage(source, rect);
        const nativeRect = prep.mizukiPrepViewRect(rect);
        view.setStage(stage);
        view.setCamera('prep', { rect: nativeRect, nativeRect, fit: true, instant: true, shop: false });
        view.setPrep({ hand: [], temp: [], board: [] });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const host = document.querySelector('#field').getBoundingClientRect();
        const tiles = view.debug.tiles;
        const result = {
          host: { width: host.width, height: host.height },
          fieldTop: view.tileScreen(2, 10), fieldBottom: view.tileScreen(20, 10),
          handTile: view.tileScreen(0, 0), tempTile: view.tileScreen(1, 4),
          rows: tiles.grid.length, band: tiles.band, field: tiles.field,
          drawnTop: tiles.grid[2][10].drawn, drawnBottom: tiles.grid[20][10].drawn,
        };
        window.__mizukiPrepView = view;
        return result;
      });
      assert.equal(geometry.rows, 21, `${label}: rendered map includes row 20`);
      assert.deepEqual(geometry.band, [0, 20], `${label}: all shifted map rows are drawn`);
      assert.deepEqual(geometry.field, [0, 20], `${label}: all shifted map rows stay active`);
      assert.equal(geometry.drawnTop, true, `${label}: top native map row is drawn`);
      assert.equal(geometry.drawnBottom, true, `${label}: bottom native map row is drawn`);
      const withinHost = tile => tile && tile.poly.every(([x, y]) => x >= 0 && x <= geometry.host.width && y >= 0 && y <= geometry.host.height);
      assert.ok(withinHost(geometry.fieldTop), `${label}: map top row is visible`);
      assert.ok(withinHost(geometry.fieldBottom), `${label}: map bottom row is visible`);
      assert.ok(geometry.handTile && geometry.handTile.y >= 0 && geometry.handTile.y <= geometry.host.height, `${label}: hand row is visible`);
      assert.ok(geometry.tempTile && geometry.tempTile.y >= 0 && geometry.tempTile.y <= geometry.host.height, `${label}: temp row is visible`);
      await page.screenshot({ path: path.join(OUT, `mizuki-prep-${label}.png`) });
      assert.deepEqual(problems, [], `${label}: browser errors`);
      await page.close();
    }
  } finally {
    await browser?.close();
    await srv.close();
  }
});
