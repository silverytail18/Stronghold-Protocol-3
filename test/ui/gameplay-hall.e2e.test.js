// Formal product index and browser account admin, isolated state and native resource fixture.
import {describe, test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {productFixture, login} from '../product/fixture.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {RESOURCE_CONTRACT, CLIENT_LINE, CLIENT_BUILD, RESOURCE_EPOCH} from '../../shared/client-resources.js';
import {CYCLOPS_VARIANT} from '../../shared/constants.js';
import {AUDIO_EXTS} from '../../shared/media.js';
import {Match} from '../../server/match/Match.js';
import {seedReleaseRead} from '../helpers/releaseNotes.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const enabled = process.env.SP_E2E === '1' && existsSync(chrome);
const resourceHash = '1'.repeat(64);
const capability = {contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH, build: CLIENT_BUILD, resourceHash};
const ua = `Fixture StrongholdProtocolApp/${RESOURCE_CONTRACT} Resources/${resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/${RESOURCE_EPOCH}`;
const report = process.env.SP_HALL_REPORT;

describe('玩法大厅与浏览器管理员开放管理：正式页面联通', {skip: !enabled && 'set SP_E2E=1 with Chrome'}, () => {
  let f, server, browser, page, adminPage, base, failCatalog = false;
  const errors = [], failures = [];
  const request = (t, args = {}) => page.evaluate((t, args) => globalThis.__SP__.net.request(t, args), t, args);
  const tap = async (p, selector) => {
    const el = await p.waitForSelector(selector, {visible: true}); await el.scrollIntoView();
    await p.waitForFunction(e => {const r = e.getBoundingClientRect(); return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));}, {}, el);
    await el.click();
  };
  const screenshot = async name => {if (report) {await fs.mkdir(report, {recursive: true}); await page.screenshot({path: path.join(report, name + '.png')});}};
  async function setOpen(on) {
    const revision = server.product.modes.doc.revision;
    const check = '[data-mode-toggle="' + CYCLOPS_VARIANT + '"]';
    if (await adminPage.$eval(check, el => el.checked) !== on) await tap(adminPage, check);
    const saved = adminPage.waitForResponse(response => response.url().endsWith('/auth/admin/gameplay-modes') && response.request().method() === 'PUT');
    await tap(adminPage, '[data-action="save-gameplay-modes"]');
    assert.equal((await saved).status(), 200);
    await adminPage.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('玩法开放设置已保存'));
    assert.equal(server.product.modes.doc.revision, revision + 1);
    assert.equal(server.product.modes.permits(CYCLOPS_VARIANT), on);
    await adminPage.waitForSelector(check);
  }
  before(async () => {
    f = await productFixture();
    const directory = path.join(f.dir, 'resources');
    const policy = await writeInitialPolicy({format: 1, contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH,
      files: [{path: '/assets/a.bin', sha256: '2'.repeat(64), size: 1, mime: 'application/octet-stream'}]}, directory);
    await fs.writeFile(path.join(directory, 'client.json'), JSON.stringify({...policy, resourceHash}));
    server = await startProductServer({root: f.project, env: f.env, port: 0, host: '127.0.0.1', resourceDirectory: directory,
      publicKey: 'fixture', MatchClass: Match, log: {info() {}, debug() {}, warn() {}, error() {}}});
    base = `http://127.0.0.1:${server.port}`;
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch({executablePath: chrome, headless: true, args: ['--no-sandbox', '--force-device-scale-factor=1']});
    const gameContext = await browser.createBrowserContext(), adminContext = await browser.createBrowserContext();
    page = await gameContext.newPage(); adminPage = await adminContext.newPage();
    for (const p of [page, adminPage]) {p.setDefaultTimeout(8000); p.on('pageerror', error => errors.push(error.message));}
    await page.setViewport({width: 1440, height: 900}); await page.setUserAgent(ua);
    await page.setRequestInterception(true);
    page.on('request', async req => {
      const u = new URL(req.url());
      if (u.pathname === '/product/modes' && failCatalog) return req.respond({status: 503, contentType: 'application/json', body: JSON.stringify({error: '读取玩法失败，请重试'})});
      if (!/^\/(?:assets|fonts|media|icons|fx)(?:\/|$)/.test(u.pathname) && !/^\/data\/(?:assets|local-assets|local-fx)\.json$/.test(u.pathname)) return req.continue();
      let filename = path.resolve(root, u.pathname.startsWith('/data/') ? '.' + u.pathname : 'public' + u.pathname);
      if (u.pathname.startsWith('/media/')) {const stem = path.resolve(root, 'public/assets/audio/' + u.pathname.slice(7)); filename = AUDIO_EXTS.map(ext => stem + ext).find(p => existsSync(p)) || stem;}
      if (!filename.startsWith(root + path.sep)) {failures.push(u.pathname); return req.abort();}
      try {
        const mime = {'.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg'}[path.extname(filename)];
        await req.respond({status: 200, ...(mime ? {contentType: mime} : {}), body: await fs.readFile(filename)});
      } catch {failures.push(u.pathname); await req.respond({status: 404, body: ''});}
    });
    await page.evaluateOnNewDocument(cap => {
      window.SPAndroid = {request(raw) {const {id, method} = JSON.parse(raw); queueMicrotask(() => window.dispatchEvent(new MessageEvent('sp-native-response', {data: {id, result: method === 'status' ? cap : {ok: true}}})));}};
      localStorage.setItem('sp.name', '玩法大厅验收'); sessionStorage.setItem('sp.entered', '1');
    }, capability);
    await seedReleaseRead(page);
    const member = await login(base, 'member', {'User-Agent': ua}), admin = await login(base);
    for (const [context, auth] of [[gameContext, member], [adminContext, admin]]) {
      const eq = auth.cookie.indexOf('='); await context.setCookie({name: auth.cookie.slice(0, eq), value: auth.cookie.slice(eq + 1), url: base});
    }
    await page.goto(base + '/index.html?render=fallback', {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('[data-mode="gameplay-hall"]', {timeout: 30000});
    await adminPage.goto(base + '/account', {waitUntil: 'domcontentloaded'});
    await tap(adminPage, '[data-account-tab="modes"]');
    await adminPage.waitForSelector('[data-mode-toggle]');
  });
  after(async () => {
    if (report) {
      await fs.mkdir(report, {recursive: true});
      await fs.writeFile(path.join(report, 'browser-diagnostics.json'), JSON.stringify({errors, failures: [...new Set(failures)], policy: server?.product.modes.view()}, null, 2));
    }
    await browser?.close(); await server?.close(); await f?.close();
  });

  test('主界面只保留玩法大厅入口，目录显示舟铲铲规则，手机与桌面可浏览和操作', async () => {
    assert.equal(await page.$('[data-mode="' + CYCLOPS_VARIANT + '"]'), null);
    await screenshot('main-desktop');
    await tap(page, '[data-mode="gameplay-hall"]');
    await page.waitForSelector('.gameplay-card.is-open');
    assert.match(await page.$eval('.gameplay-card', el => el.textContent), /21 回合/);
    for (const viewport of [{width: 1440, height: 900}, {width: 844, height: 390}, {width: 667, height: 375}, {width: 390, height: 844}]) {
      await page.setViewport(viewport);
      await page.waitForFunction(({width, height}) => {
        const r = document.querySelector('.gameplay-hall')?.getBoundingClientRect();
        return innerWidth === width && innerHeight === height && r && r.left >= -1 && r.top >= -1 && r.right <= width + 1 && r.bottom <= height + 1;
      }, {}, viewport);
      const box = await page.$eval('.gameplay-hall', el => el.getBoundingClientRect().toJSON());
      assert.ok(box.left >= -1 && box.top >= -1 && box.right <= viewport.width + 1 && box.bottom <= viewport.height + 1, JSON.stringify({viewport, box}));
      await page.$eval('.gameplay-card footer button', el => el.scrollIntoView({block: 'nearest'}));
      assert.equal(await page.$eval('.gameplay-card footer button', el => el.disabled), false);
      assert.ok(await page.$eval('.gameplay-card', el => parseFloat(getComputedStyle(el).fontSize) >= 14), 'the gameplay rules remain readable on a phone');
      assert.ok(await page.$eval('.gameplay-card footer button', el => el.getBoundingClientRect().height >= 44), 'the mode button keeps its touch target');
      await screenshot(`hall-${viewport.width}x${viewport.height}`);
    }
    await page.setViewport({width: 1440, height: 900});
    await tap(page, '.gameplay-card footer button');
    await page.waitForSelector('.proto');
    assert.match(await page.$eval('.proto-title__mode', el => el.textContent), /舟铲铲/);
    await tap(page, '.proto-back'); await page.waitForSelector('.gameplay-hall');
    await page.keyboard.press('Escape'); await page.waitForSelector('.gameplay-hall', {hidden: true});
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.mode), 'gameplay-hall');
  });

  test('玩法目录读取失败时显示可重试提示且不开放入口，重试后恢复', async () => {
    failCatalog = true;
    await tap(page, '[data-mode="gameplay-hall"]');
    await page.waitForSelector('.gameplay-hall__notice');
    assert.equal(await page.$('.gameplay-card'), null);
    failCatalog = false;
    await tap(page, '.gameplay-hall__refresh'); await page.waitForSelector('.gameplay-card.is-open');
    await page.keyboard.press('Escape'); await page.waitForSelector('.gameplay-hall', {hidden: true});
  });

  test('管理员真实点击关闭并保存，已打开的创建窗口也不能绕过；大厅显示未开放，后台刷新保留状态', async () => {
    await tap(page, '[data-mode="gameplay-hall"]'); await page.waitForSelector('.gameplay-card.is-open');
    await tap(page, '.gameplay-card footer button'); await page.waitForSelector('.proto');
    await setOpen(false);
    if (report) await adminPage.screenshot({path: path.join(report, 'admin-closed.png'), fullPage: true});
    await tap(page, '.proto-start');
    await page.waitForFunction(() => document.body.textContent.includes('暂未开放，请等待管理员开放'));
    assert.equal(server.lobby.rooms.size, 0);
    await tap(page, '.proto-back'); await page.waitForSelector('.gameplay-card.is-closed');
    assert.equal(await page.$eval('.gameplay-card footer button', el => el.disabled), true);
    await screenshot('hall-closed');
    await adminPage.reload({waitUntil: 'domcontentloaded'});
    await tap(adminPage, '[data-account-tab="modes"]');
    await adminPage.waitForSelector('[data-mode-toggle]');
    assert.equal(await adminPage.$eval('[data-mode-toggle]', el => el.checked), false);
  });

  test('重新开放后经大厅创建真实舟铲铲；关闭阻止旧房开局，重新开放可开始，进行中关闭与重连不受影响', async () => {
    await setOpen(true);
    await tap(page, '.gameplay-hall__refresh');
    await page.waitForSelector('.gameplay-card.is-open');
    await tap(page, '.gameplay-card footer button'); await page.waitForSelector('.proto');
    await tap(page, '.proto-start'); await page.waitForSelector('.room-screen');
    const room = [...server.lobby.rooms.values()][0]; assert.equal(room.variant, CYCLOPS_VARIANT);
    await setOpen(false);
    const refused = await page.evaluate(async () => {try {await globalThis.__SP__.net.request('room.start'); return null;} catch (error) {return error.detail || error.message;}});
    assert.match(refused, /暂未开放/); assert.equal(room.match, null);
    await setOpen(true); await request('room.start');
    await page.waitForFunction(() => globalThis.__SP__?.store.get().match.public?.phase === 'INFO_CHECK');
    const match = room.match; assert.ok(match instanceof Match); assert.equal(match.isCyclops, true);
    await setOpen(false); assert.equal(room.match, match);
    await page.reload({waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => globalThis.__SP__?.store.get().match.public?.phase === 'INFO_CHECK');
    assert.equal(room.match, match);
    assert.deepEqual(errors, []); assert.deepEqual([...new Set(failures)], []);
  });
});
