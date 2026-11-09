// Real product index → boot → main → active GameScreen → WebSocket → real Match.
// Only time/round progression and the native local-resource bridge are fixtures; intents and frames are real.
// SP_E2E=1 CHROME_PATH=... node --test test/ui/cyclops-live.e2e.test.js
import {describe, test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocket} from 'ws';
import {productFixture, login} from '../product/fixture.js';
import {startProductServer} from '../../server/product/game-server.js';
import {writeInitialPolicy} from '../../tools/client-resources.mjs';
import {Match} from '../../server/match/Match.js';
import {VirtualScheduler} from '../../server/match/scheduler.js';
import {validHostMessage} from '../../server/match/host/ipc.js';
import {cyclopsHexCard, cyclopsHexes, applyCyclopsHex} from '../../server/match/cyclops.js';
import {PHASE, PROTOCOL_VERSION} from '../../shared/constants.js';
import {DELAYS} from '../../server/match/match/common.js';
import {RESOURCE_CONTRACT, CLIENT_LINE, CLIENT_BUILD, RESOURCE_EPOCH} from '../../shared/client-resources.js';
import {AUDIO_EXTS} from '../../shared/media.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const enabled = process.env.SP_E2E === '1' && existsSync(chrome);
const resourceHash = '1'.repeat(64);
const capability = {contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH, build: CLIENT_BUILD, resourceHash};
const ua = `Fixture StrongholdProtocolApp/${RESOURCE_CONTRACT} Resources/${resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/${RESOURCE_EPOCH}`;
const quiet = {info() {}, debug() {}, warn() {}, error() {}};

class TimedMatch extends Match {
  constructor(opts) { super({...opts, scheduler: new VirtualScheduler({start: Date.now()}), clientCombat: false, botRehearsal: 0}); }
}

describe('舟铲铲实际客户端入口与服务端联通', {skip: !enabled && 'set SP_E2E=1 and install Chrome'}, () => {
  let f, server, browser, page, member, base, m, myId, otherId;
  const pageErrors = [], resourceFailures = [], intents = [], serverLogs = [];
  const request = (t, fields = {}) => page.evaluate((t, fields) => globalThis.__SP__.net.request(t, fields), t, fields);
  const refused = (t, fields) => page.evaluate(async (t, fields) => {
    try {await globalThis.__SP__.net.request(t, fields); return null;} catch (error) {return error.code;}
  }, t, fields);

  const snapshot = () => page.evaluate(() => globalThis.__SP__.store.get().match.private);
  async function shot(name) {
    // A present card is not proof its art renders. Check every visible icon has decoded real pixels.
    await page.waitForFunction(() => {
      const icons = [...document.querySelectorAll('.cyc-hex__icon, .cyc-draft-opt__avatar, .cyc-draft-opt__iicon')]
        .filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; });
      return icons.length > 0 && icons.every(el => {
        const img = el.querySelector('img');
        return img?.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      });
    }).catch(async error => {
      const icons = await page.$$eval('.cyc-hex__icon, .cyc-draft-opt__avatar, .cyc-draft-opt__iicon', els => els.map(el => ({
        html: el.innerHTML, rect: el.getBoundingClientRect().toJSON(),
        images: [...el.querySelectorAll('img')].map(img => ({src: img.currentSrc || img.src, complete: img.complete, width: img.naturalWidth})),
      })));
      const assetState = await page.evaluate(async () => {
        const {data} = await import('/js/data.js');
        const {effectIconUrl} = await import('/js/ui/assetUrls.js');
        const assets = data.get('assets');
        const raw = data.getRaw('assets');
        return {assetKeys: Object.keys(assets || {}), rawKeys: Object.keys(raw || {}), uiKeys: Object.keys(assets?.ui || {}).slice(0, 4),
          icon: effectIconUrl(assets, {iconKind: 'cyclops', iconId: 'cyclopsIcon/universal'}),
          contentId: data.contentId(), card: globalThis.__SP__.store.get().match.private?.cyclopsMine?.slots[0]};
      });
      throw new Error(name + ' image decoding failed: ' + JSON.stringify({icons, assetState}), {cause: error});
    });
    if (!process.env.SP_CYCLOPS_REPORT) return;
    await fs.mkdir(process.env.SP_CYCLOPS_REPORT, {recursive: true});
    await page.screenshot({path: path.join(process.env.SP_CYCLOPS_REPORT, name + '.png')});
  }
  async function tap(selector) {
    const el = await page.waitForSelector(selector);
    await el.scrollIntoView();
    assert.ok(await el.evaluate(e => {
      const r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return e.contains(hit);
    }), selector + ' is visible and receives pointer input');
    await el.click();
  }
  async function pick() {
    const priv = await snapshot();
    const slot = priv.cyclopsMine.slots.findIndex(card => card.id !== 'cyc_universal');
    assert.ok(slot >= 0);
    await tap(`.cyc-hex[data-slot="${slot}"]`);
    await page.waitForSelector(`.cyc-hex[data-slot="${slot}"].is-armed`);
    await tap(`.cyc-hex[data-slot="${slot}"]`);
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private?.cyclopsMine?.picked != null);
    return slot;
  }
  async function reload() {
    await page.reload({waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => globalThis.__SP__?.store.get().match.public?.phase && globalThis.__SP__.store.get().match.private);
    assert.equal(await page.evaluate(() => globalThis.__SP__.store.get().me.playerId), myId);
  }

  before(async () => {
    f = await productFixture();
    const directory = path.join(f.dir, 'resources');
    const policy = await writeInitialPolicy({format: 1, contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH,
      files: [{path: '/assets/a.bin', sha256: '2'.repeat(64), size: 1, mime: 'application/octet-stream'}]}, directory);
    await fs.writeFile(path.join(directory, 'client.json'), JSON.stringify({...policy, resourceHash}));
    server = await startProductServer({root: f.project, env: f.env, port: 0, host: '127.0.0.1', resourceDirectory: directory,
      publicKey: 'fixture', log: Object.fromEntries(Object.keys(quiet).map(level => [level, (...args) => serverLogs.push(args.map(String).join(' '))])), MatchClass: TimedMatch,
      matchHost: {matchModule: path.join(root, 'test/ui/fixtures/cyclops-round-host.js'), matchOptions: {clientCombat: false, botRehearsal: 0}}});
    base = `http://127.0.0.1:${server.port}`;
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch({executablePath: chrome, headless: true, args: ['--no-sandbox', '--force-device-scale-factor=1']});
    page = await browser.newPage();
    page.setDefaultTimeout(8000);
    await page.setViewport({width: 1440, height: 900});
    await page.setUserAgent(ua);
    page.on('pageerror', e => pageErrors.push(e.message));
    // Native clients provide these files from their signed local bundle. Serve the same local files, never the live server/state.
    await page.setRequestInterception(true);
    page.on('request', async req => {
      const u = new URL(req.url());
      const local = /^\/(?:assets|fonts|media|icons|fx)(?:\/|$)/.test(u.pathname) || /^\/data\/(?:assets|local-assets|local-fx)\.json$/.test(u.pathname);
      if (!local) return req.continue();
      let filename = path.resolve(root, u.pathname.startsWith('/data/') ? '.' + u.pathname : 'public' + u.pathname);
      if (u.pathname.startsWith('/media/')) {
        const stem = path.resolve(root, 'public/assets/audio/' + u.pathname.slice('/media/'.length));
        filename = AUDIO_EXTS.map(ext => stem + ext).find(candidate => existsSync(candidate)) || stem;
      }
      if (!filename.startsWith(root + path.sep)) {
        resourceFailures.push(u.pathname + ': outside fixture root');
        return req.abort();
      }
      try {
        const ext = path.extname(filename), mime = {'.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav'}[ext];
        await req.respond({status: 200, ...(mime ? {contentType: mime} : {}), body: await fs.readFile(filename)});
      } catch {
        resourceFailures.push(u.pathname);
        await req.respond({status: 404, body: ''});
      }
    });
    await page.evaluateOnNewDocument(cap => {
      window.SPAndroid = {request(raw) {
        const {id, method} = JSON.parse(raw);
        queueMicrotask(() => window.dispatchEvent(new MessageEvent('sp-native-response', {data: {id, result: method === 'status' ? cap : {ok: true}}})));
      }};
      localStorage.setItem('sp.name', '窗口验收');
      sessionStorage.setItem('sp.entered', '1');
    }, capability);
    const auth = await login(base, 'admin', {'User-Agent': ua});
    assert.equal(auth.status, 200);
    const eq = auth.cookie.indexOf('=');
    await browser.setCookie({name: auth.cookie.slice(0, eq), value: auth.cookie.slice(eq + 1), url: base});
    await page.goto(base + '/index.html?render=fallback', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => globalThis.__SP__?.store.get().me.playerId, {timeout: 30000});
    myId = await page.evaluate(() => globalThis.__SP__.store.get().me.playerId);
    await request('room.create', {mode: 'coop', difficulty: 'NORMAL', variant: 'entertainment_cyclops'});
    const room = [...server.lobby.rooms.values()][0];
    const second = await login(base, 'member', {'User-Agent': ua});
    member = new WebSocket(base.replace('http:', 'ws:') + '/ws', {headers: {Origin: base, Cookie: second.cookie, 'User-Agent': ua}});
    const replies = new Map(); let rid = 0;
    member.on('message', bytes => { const msg = JSON.parse(bytes); if (msg.rid) replies.get(msg.rid)?.(msg); });
    await new Promise((resolve, reject) => { member.once('open', resolve); member.once('error', reject); });
    const send = msg => new Promise((resolve, reject) => {
      const id = ++rid, timer = setTimeout(() => reject(Error('member request timeout: ' + msg.t)), 6000);
      replies.set(id, reply => {clearTimeout(timer); replies.delete(id); resolve(reply);});
      member.send(JSON.stringify({...msg, rid: id}));
    });
    const hello = await send({t: 'hello', name: '队友验收', version: PROTOCOL_VERSION});
    otherId = hello.playerId;
    assert.equal((await send({t: 'room.join', code: room.code})).t, 'ok');
    assert.equal((await send({t: 'room.ready', ready: true})).t, 'ok');
    await page.waitForFunction(() => globalThis.__SP__.store.get().room?.seats.filter(s => s?.playerId).length === 2);
    await request('room.start');
    m = room.match;
    assert.ok(m instanceof TimedMatch, 'uses real Match with only an injected clock');
    // Complete the real opening state machine with legal player intents, without simulating combat.
    for (const ps of m.order) m.handle(ps.playerId, {t: 'g.infoReady'});
    m.sched.advance(0);
    for (let step = 0; m.phase === PHASE.BAND_DRAFT && step < 8; step++) {
      const pid = m.draftTurn();
      m.handle(pid, {t: 'g.band', bandId: m.defaultBand(pid)});
      m.sched.advance(0);
    }
    m.sched.advance(DELAYS.ROUND_START); m.flush(true);
    await page.waitForSelector('.gm__hud');
    const handle = m.handle.bind(m);
    m.handle = (pid, msg) => {
      if (msg.t.startsWith('g.cyclops')) intents.push({pid, ...msg});
      const result = handle(pid, msg);
      // Production sends throttled public frames after 100 ms. The injected clock must tick too.
      m.sched.advance(DELAYS.PUBLIC_THROTTLE); m.flush();
      return result;
    };
  });

  after(async () => {
    if (process.env.SP_CYCLOPS_REPORT) {
      await fs.mkdir(process.env.SP_CYCLOPS_REPORT, {recursive: true});
      const state = await page?.evaluate(() => {
        const s = globalThis.__SP__?.store.get();
        return {room: s?.room?.code, phase: s?.match.public?.phase, round: s?.match.public?.round, result: s?.match.result, text: document.body.innerText.slice(-2500)};
      }).catch(() => null);
      await fs.writeFile(path.join(process.env.SP_CYCLOPS_REPORT, 'browser-diagnostics.json'), JSON.stringify({pageErrors, resourceFailures: [...new Set(resourceFailures)], intents, serverLogs, state}, null, 2));
    }
    member?.terminate();
    await browser?.close();
    await server?.close();
    await f?.close();
  });

  function round(r) {
    m.startRound(r);
    m.sched.advance(DELAYS.ROUND_START);
    m.flush(true);
    assert.equal(m.phase, PHASE.CYCLOPS_HEX);
  }

  const clock = () => page.$eval('.cycov [role="timer"]', el => Number(el.getAttribute('aria-label').match(/\d+/)?.[0]));
  const expectedClock = () => page.evaluate(() => {
    const s = globalThis.__SP__.store.get();
    return Math.max(0, Math.ceil((s.match.public.deadline - Date.now() - (s.clock.offset || 0)) / 1000));
  });
  async function assertClockVisible() {
    const state = await page.$eval('.cycov [role="timer"]', el => {
      const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const box = el.closest('.cycov__inner').getBoundingClientRect();
      return {inside: r.left >= box.left && r.right <= box.right + 1 && r.top >= box.top && r.bottom <= box.bottom + 1,
        inViewport: r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1,
        onTop: el.contains(hit)};
    });
    assert.deepEqual(state, {inside: true, inViewport: true, onTop: true});
  }

  test('第5回合：实际游戏页收到私有候选后显示三张银阶馈赠', async () => {
    round(5);
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private?.cyclopsMine?.slots.length === 3);
    await page.waitForSelector('.cycov[aria-label="独眼巨人的馈赠"]', {timeout: 4000});
    assert.equal(await page.$$eval('.cyc-hex', els => els.length), 3);
    assert.match(await page.$eval('.cycov__title', e => e.textContent), /银阶馈赠/);
    assert.equal(Object.hasOwn(m.publicView().cyclops.state[myId], 'slots'), false);
    await assertClockVisible();
    await shot('round5-desktop');
    assert.deepEqual(pageErrors, []);
  });

  test('馈赠窗口倒计时跟随服务器时钟，实时递减、末10秒警示、归零不代发选择', async () => {
    // This suite advances a virtual server scheduler during setup; compare to its published deadline,
    // rather than a fresh 35-second local timer or the unrelated real wall clock.
    const initial = await clock(); assert.ok(initial > 0); assert.ok(Math.abs(initial - await expectedClock()) <= 1);
    await page.waitForFunction(n => Number(document.querySelector('.cycov [role="timer"]')?.getAttribute('aria-label').match(/\d+/)?.[0]) < n, {}, initial);
    const originalOffset = await page.evaluate(() => globalThis.__SP__.store.get().clock.offset);
    try {
      await page.evaluate(() => {const s=globalThis.__SP__.store; s.set({clock: {...s.get().clock, offset: s.get().match.public.deadline-Date.now()-8000}});});
      await page.waitForSelector('.cycov .countdown.is-warn');
      assert.ok(await clock() <= 8);
      await page.evaluate(() => {const s=globalThis.__SP__.store; s.set({clock: {...s.get().clock, offset: s.get().match.public.deadline-Date.now()+1000}});});
      await page.waitForFunction(() => document.querySelector('.cycov [role="timer"]')?.getAttribute('aria-label') === '剩余0秒');
      assert.equal(m.cyclops.state.get(myId).picked, null);
      assert.equal(intents.filter(msg => msg.t === 'g.cyclopsHex').length, 0);
    } finally {
      await page.evaluate(offset => {const s=globalThis.__SP__.store; s.set({clock: {...s.get().clock, offset}});}, originalOffset);
    }
    await page.waitForFunction(() => !document.querySelector('.cycov .countdown.is-warn'));
  });

  test('三槽分别刷新一次：实际请求、私有回包、按钮消失且不误选卡', async () => {
    for (let slot = 0; slot < 3; slot++) {
      await tap(`.cyc-hex[data-slot="${slot}"] .cyc-hex__reroll`);
      await page.waitForFunction(slot => globalThis.__SP__.store.get().match.private.cyclopsMine.rerolls[slot] === false, {}, slot);
      const mine = (await snapshot()).cyclopsMine;
      assert.equal(mine.picked, null);
      assert.deepEqual(mine.slots, m.players.get(myId).privateView().cyclopsMine.slots);
      assert.equal(await page.$(`.cyc-hex[data-slot="${slot}"] .cyc-hex__reroll`), null);
    }
    assert.equal(intents.filter(msg => msg.t === 'g.cyclopsHexReroll').length, 3);
    assert.equal(intents.filter(msg => msg.t === 'g.cyclopsHex').length, 0);
    assert.equal(await refused('g.cyclopsHexReroll', {slot: 0}), 'ALREADY');
  });

  test('选择前刷新页面：正式重连先公开后私有，同一候选和已用刷新次数完整恢复', async () => {
    const before = (await snapshot()).cyclopsMine;
    const beforeTime = await clock();
    await reload();
    await page.waitForSelector('.cyc-hex');
    assert.deepEqual((await snapshot()).cyclopsMine, before);
    assert.equal(await page.$('.cyc-hex__reroll'), null);
    assert.ok(await clock() <= beforeTime, 'reloading never starts a fresh gift timer');
    await assertClockVisible();
  });

  test('两次点击确认：只领取一项、等待队友、重复请求拒绝，刷新后保留已选状态', async () => {
    const before = m.players.get(myId).cyclopsHexes?.length || 0;
    const slot = await pick();
    assert.equal(m.players.get(myId).cyclopsHexes.length, before + 1);
    assert.match(await page.$eval('.cycov__sub', e => e.textContent), /已完成选择，等待其他博士/);
    await assertClockVisible();
    await tap(`.cyc-hex[data-slot="${slot}"]`);
    assert.equal(intents.filter(msg => msg.t === 'g.cyclopsHex').length, 1);
    assert.equal(await refused('g.cyclopsHex', {slot}), 'ALREADY');
    await reload();
    await page.waitForFunction(() => document.querySelector('.cycov__sub')?.textContent.includes('已完成选择'));
    assert.equal((await snapshot()).cyclopsMine.picked, slot);
    assert.equal(m.players.get(myId).cyclopsHexes.length, before + 1);
    assert.equal(m.handle(otherId, {t: 'g.cyclopsHex', slot: 0}).ok, true);
    m.sched.advance(0); m.flush(true);
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'PREP' && !document.querySelector('.cycov'));
  });

  test('退出馈赠回到休整：真实商店显示经验，购买一次资金减2且经验加1', async () => {
    const ps = m.players.get(myId);
    ps.shop.level = 2; ps.shop.exp = 0; ps.funds = 20; ps.ready = false;
    m.markPrivate(ps); m.flush(true);
    const need = ps._cyclopsExpNeeded(2);
    await page.waitForFunction(need => document.querySelector('.lvcard')?.textContent.includes(`0/${need}`), {}, need);
    assert.match(await page.$eval('.lvcard', e => e.textContent), /购买经验/);
    await tap('.lvcard');
    await page.waitForSelector('.lvcard.is-armed');
    await tap('.lvcard');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.shopExp === 1);
    assert.equal(ps.funds, 18);
    assert.ok((await page.$eval('.lvcard', e => e.textContent)).includes(`1/${need}`));
  });

  test('保留18金币直接准备：实际按钮和空格均无剩余资金弹窗', async () => {
    const ps = m.players.get(myId);
    m.players.get(otherId).ready = false;
    assert.equal(ps.funds, 18);
    assert.ok(m.publicView().cyclopsBalance?.hash);
    await tap('.readybtn');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.ready === true);
    assert.equal(ps.ready, true);
    assert.equal(ps.funds, 18);
    assert.equal(await page.evaluate(() => document.body.textContent.includes('还有 18 资金未使用')), false);
    await tap('.readybtn');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.ready === false);
    await page.keyboard.press('Space');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.ready === true);
    assert.equal(ps.funds, 18);
    await tap('.readybtn');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.ready === false);
  });

  test('第10回合金阶窗口：手机横屏三卡可见可点，确认后转入十组选秀', async () => {
    round(10);
    await page.waitForSelector('.cycov__title--gold');
    assert.equal(await page.$$eval('.cyc-hex', els => els.length), 3);
    await page.setViewport({width: 844, height: 390});
    await shot('round10-mobile-landscape');
    await pick();
    m.players.get(myId).lp = 5; m.players.get(otherId).lp = 15;
    assert.equal(m.handle(otherId, {t: 'g.cyclopsHex', slot: 0}).ok, true);
    m.sched.advance(0); m.flush(true);
    assert.equal(m.phase, PHASE.CYCLOPS_DRAFT);
    await page.waitForSelector('.cycov--draft');
    assert.equal(await page.$$eval('.cyc-draft-opt', els => els.length), 10);
    assert.deepEqual((await snapshot()).cyclopsDraftMine, m._cyclopsDraftPoolOf(m.players.get(myId)));
    assert.equal(await page.$('.cyc-hex'), null);
    await shot('round10-draft-mobile');
  });

  test('选秀窗口显示全体共享阶段倒计时，滚动到底仍可见', async () => {
    assert.match(await page.$eval('.cycov__clockbar', e => e.textContent), /全体共享截止时间，换人不重置/);
    const left = await clock(); assert.ok(left > 0); assert.ok(Math.abs(left - await expectedClock()) <= 1);
    await page.$eval('.cycov__body', el => {el.scrollTop=el.scrollHeight;});
    await assertClockVisible();
    const before = m.deadline;
    await page.waitForFunction(n => Number(document.querySelector('.cycov [role="timer"]')?.getAttribute('aria-label').match(/\d+/)?.[0]) < n, {}, left);
    assert.equal(m.deadline, before);
    await shot('round10-draft-timer-scrolled');
  });

  test('选秀中刷新恢复十组候选：非当前玩家请求被拒，当前玩家双击领取干员装备', async () => {
    const mine = (await snapshot()).cyclopsDraftMine;
    const stageDeadline = m.deadline;
    assert.equal(m.cyclops.order[0], myId);
    assert.equal(m.handle(otherId, {t: 'g.cyclopsDraft', idx: 0}).error, 'NOT_YOUR_TURN');
    await reload();
    await page.waitForSelector('.cycov--draft');
    assert.deepEqual((await snapshot()).cyclopsDraftMine, mine);
    const ps = m.players.get(myId), before = ps.hand.filter(Boolean).length + ps.temp.filter(Boolean).length;
    await tap('.cyc-draft-opt');
    await page.waitForSelector('.cyc-draft-opt.is-armed');
    await tap('.cyc-draft-opt');
    await page.waitForFunction(() => document.querySelector('.cyc-draft-opt.is-taken'));
    assert.equal(m.cyclops.taken[`g:${mine.groupId}:0`], myId);
    assert.ok(ps.hand.filter(Boolean).length + ps.temp.filter(Boolean).length > before);
    assert.equal(await page.$$eval('.cyc-draft-opt:not([disabled])', els => els.length), 0);
    assert.match(await page.$eval('.cycov__sub', e => e.textContent), /等待/);
    assert.equal(m.deadline, stageDeadline, 'the next player shares the existing stage deadline');
    await assertClockVisible();
    await reload();
    await page.waitForSelector('.cyc-draft-opt.is-taken');
    assert.equal(await page.$$eval('.cyc-draft-opt:not([disabled])', els => els.length), 0);
    assert.equal(m.handle(otherId, {t: 'g.cyclopsDraft', idx: 0}).error, 'SOLD_OUT');
    assert.equal(m.handle(otherId, {t: 'g.cyclopsDraft', idx: 1}).ok, true);
    m.flush(true);
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'PREP' && !document.querySelector('.cycov'));
  });

  test('第15回合彩阶窗口：小手机横屏与桌面均能操作，阶段切换不保留旧选择框', async () => {
    round(15);
    await page.waitForSelector('.cycov__title--prismatic');
    assert.equal(await page.$$eval('.cyc-hex', els => els.length), 3);
    assert.equal(await page.$('.cyc-hex.is-armed'), null);
    for (const viewport of [{width: 667, height: 375}, {width: 390, height: 844}, {width: 1440, height: 900}]) {
      await page.setViewport(viewport);
      await tap('.cyc-hex[data-slot="1"]');
      await page.waitForSelector('.cyc-hex[data-slot="1"].is-armed');
      const bounds = await page.$eval('.cycov__inner', e => {const r = e.getBoundingClientRect(); return {x: r.x, right: r.right, y: r.y, bottom: r.bottom, w: innerWidth, h: innerHeight};});
      assert.ok(bounds.x >= 0 && bounds.right <= bounds.w + 1 && bounds.y >= 0 && bounds.bottom <= bounds.h + 1);
      await shot(`round15-${viewport.width}x${viewport.height}`);
      await tap('.cyc-hex[data-slot="2"]');
      await page.$eval('.cycov__body', el => {el.scrollTop=el.scrollHeight;});
      await assertClockVisible();
      await shot(`round15-timer-scrolled-${viewport.width}x${viewport.height}`);
    }
  });

  test('通用盟约三档：手机横竖屏与桌面实际点击选盟约，未选不提交，返回/重连/滚动与确认生效', async () => {
    for (const [r, quality, width, height] of [[5,'silver',667,375],[10,'gold',390,844],[15,'prismatic',1440,900]]) {
      round(r);
      const st = m.cyclops.state.get(myId);
      st.slots[0] = cyclopsHexCard(cyclopsHexes(m.data).find(h => h.id === 'cyc_universal'), quality);
      m.markPrivate(m.players.get(myId)); m.flush(true);
      await page.setViewport({width,height});
      await page.waitForFunction(q => globalThis.__SP__.store.get().match.private.cyclopsMine.slots[0].quality === q && globalThis.__SP__.store.get().match.private.cyclopsMine.slots[0].id === 'cyc_universal', {}, quality);
      const count = intents.filter(msg => msg.t === 'g.cyclopsHex').length;
      await tap('.cyc-hex[data-slot="0"]');
      await page.waitForSelector('.cyc-bond__confirm');
      assert.equal(await page.$eval('.cyc-bond__confirm', e => e.disabled), true);
      assert.equal(intents.filter(msg => msg.t === 'g.cyclopsHex').length, count);
      await tap('.cyc-bond__back');
      await tap('.cyc-hex[data-slot="0"]');
      await reload();
      await tap('.cyc-hex[data-slot="0"]');
      const bondId = await page.$$eval('.cyc-bond__option', els => els.at(-1).dataset.bondId);
      await tap(`.cyc-bond__option[data-bond-id="${bondId}"]`);
      assert.equal(await page.$eval(`.cyc-bond__option[data-bond-id="${bondId}"]`, e => e.getAttribute('aria-pressed')), 'true');
      await assertClockVisible();
      if (process.env.SP_CYCLOPS_REPORT) {
        await fs.mkdir(process.env.SP_CYCLOPS_REPORT, {recursive: true});
        await page.screenshot({path: path.join(process.env.SP_CYCLOPS_REPORT, `universal-${quality}-${width}x${height}.png`)});
      }
      await tap('.cyc-bond__confirm');
      await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.cyclopsMine.picked === 0);
      assert.equal(m.players.get(myId).cyclopsHexes.at(-1).bondId, bondId);
      assert.equal(m.players.get(myId).cyclopsHexes.at(-1).quality, quality);
      assert.equal(intents.filter(msg => msg.t === 'g.cyclopsHex').length, count + 1);
    }
  });

  test('其他玩家超时自动领取，实际公开帧关闭窗口并回休整；普通回合不弹海克斯', async () => {
    const before = m.players.get(otherId).cyclopsHexes.length;
    m.sched.advance(m.cyclops.deadline - m.sched.now()); m.flush(true);
    assert.equal(m.players.get(otherId).cyclopsHexes.length, before + 1);
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public.phase === 'PREP' && !document.querySelector('.cycov'));
    m.startRound(16); m.sched.advance(DELAYS.ROUND_START); m.flush(true);
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public.round === 16);
    assert.equal(await page.$('.cycov'), null);
    assert.deepEqual(m.sched.errors, []);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual([...new Set(resourceFailures)], []);
  });

  test('金阶赌徒实际入口：选择干员后确认才发送、装备返还、刷新保留已用次数', async () => {
    const ps=m.players.get(myId);
    ps.effects=ps.effects.filter(e=>e.data?.effectId!=='cyc_risk');
    applyCyclopsHex(m,ps,cyclopsHexCard(cyclopsHexes(m.data).find(h=>h.id==='cyc_risk'),'gold'));
    const id=[...ps.pool.entries.keys()].find(id=>ps.gd.tierOf(id)===2 && !ps.allChess().some(p=>p.id===id));
    const piece=ps.acquireChess(id),item=ps.acquireItem(ps.gd.shopItemsByTier[2][0]);
    ps._detach(ps.find(item.uid));piece.items.push(item);ps.recompute();m.flush(true);
    await page.setViewport({width:844,height:390});
    await page.waitForFunction(()=>globalThis.__SP__.store.get().match.private?.cyclopsRisk?.sacrifice?.candidates.length>0);
    const before=intents.filter(i=>i.t==='g.cyclopsRisk').length,funds=ps.funds;
    await page.waitForSelector('.cyc-risk__open:not([disabled])');
    await tap('.cyc-risk__open:not([disabled])');
    await page.waitForSelector('.cyc-risk__select').catch(async error => {
      const details = await page.evaluate(() => ({state:globalThis.__SP__.store.get().match,
        button:document.querySelector('.cyc-risk__open')?.outerHTML,dialogs:[...document.querySelectorAll('[role="dialog"]')].map(e=>e.outerHTML)}));
      throw new Error('Gold risk dialog failed: '+JSON.stringify(details),{cause:error});
    });
    await page.select('.cyc-risk__select',String(piece.uid));
    assert.ok(await page.$eval('.cyc-risk-dialog',e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
    assert.equal(intents.filter(i=>i.t==='g.cyclopsRisk').length,before);
    assert.ok(ps.find(piece.uid));
    if(process.env.SP_CYCLOPS_REPORT)await page.screenshot({path:path.join(process.env.SP_CYCLOPS_REPORT,'risk-sacrifice-mobile.png')});
    await tap('.cyc-risk__confirm');
    await page.waitForFunction(()=>globalThis.__SP__.store.get().match.private.cyclopsRisk.sacrifice.used);
    assert.equal(intents.filter(i=>i.t==='g.cyclopsRisk').length,before+1);
    assert.equal(ps.find(piece.uid),null);assert.ok(ps.find(item.uid));assert.equal(ps.funds,funds+Math.min(8,ps.gd.chessPrice(id)*2));
    await reload();await page.waitForSelector('.cyc-risk__open[disabled]');
    assert.equal((await snapshot()).cyclopsRisk.sacrifice.used,true);
    assert.equal(await refused('g.cyclopsRisk',{uid:piece.uid}),'BAD_TARGET');
  });

  test('彩阶赌徒实际入口：手机窗口确认扣血换金、重连不恢复次数、低血量禁用', async () => {
    const ps=m.players.get(myId);
    m.startRound(17);m.sched.advance(DELAYS.ROUND_START);
    ps.effects=ps.effects.filter(e=>e.data?.effectId!=='cyc_risk');ps.lp=30;
    applyCyclopsHex(m,ps,cyclopsHexCard(cyclopsHexes(m.data).find(h=>h.id==='cyc_risk'),'prismatic'));m.flush(true);
    await page.setViewport({width:390,height:844});
    await page.waitForFunction(()=>globalThis.__SP__.store.get().match.private?.cyclopsRisk?.blood?.remaining===3);
    const state=(await snapshot()).cyclopsRisk.blood,lp=ps.lp,funds=ps.funds;
    await tap('.cyc-risk__open');await tap('.cyc-risk__blood');
    assert.ok(await page.$eval('.cyc-risk-dialog',e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&Number.parseFloat(getComputedStyle(e).fontSize)>=14;}));
    assert.equal(ps.lp,lp);assert.equal(ps.funds,funds);
    if(process.env.SP_CYCLOPS_REPORT)await page.screenshot({path:path.join(process.env.SP_CYCLOPS_REPORT,'risk-blood-phone.png')});
    await tap('.cyc-risk__confirm');
    await page.waitForFunction(()=>globalThis.__SP__.store.get().match.private.cyclopsRisk.blood.remaining===2);
    assert.equal(ps.lp,lp-state.cost);assert.equal(ps.funds,funds+12);
    await reload();await page.waitForSelector('.cyc-risk__open[disabled]');
    assert.equal((await snapshot()).cyclopsRisk.blood.remaining,2);
    m.startRound(18);m.sched.advance(DELAYS.ROUND_START);ps.lp=4;ps.dirty();m.markPublic();m.flush(true);
    await page.waitForFunction(()=>globalThis.__SP__.store.get().match.private?.cyclopsRisk?.blood?.affordable===false);
    assert.ok(await page.$('.cyc-risk__open[disabled]'));assert.equal(await refused('g.cyclopsRisk'),'BAD_TARGET');
    assert.deepEqual(pageErrors,[]);
  });

  test('原版pro等六包合成：独立宿主经真实IPC/WS在产品页显示并完成5/10/15馈赠与选秀', async () => {
    const bandId = m.defaultBand(myId);
    await request('g.leave');
    await request('room.create', {mode: 'coop', difficulty: 'NORMAL', variant: 'entertainment_cyclops'});
    const room = [...server.lobby.rooms.values()].find(r => r.hostId === myId);
    const ids = ['arknights-expansion-v1', 'rhodes-mujica-v1', 'kazdel-expansion-v1', 'higashi-expansion-v1', 'ursus-expansion-v1', 'iberia-expansion-v1'];
    await request('room.setProductContent', {version: room.version, revision: server.product.contentCatalog.doc.revision, ids});
    await page.waitForFunction(() => globalThis.__SP__.data.get('config')?.productContent?.ids?.length === 6);
    // Reset the previous fixture match's accelerated clock/order baseline before a real-clock child match.
    // Otherwise directSnapshot correctly rejects the child's earlier serverNow as a stale snapshot.
    await page.reload({waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => globalThis.__SP__?.store.get().room?.content && globalThis.__SP__.data.get('config')?.productContent?.ids?.length === 6);
    await request('room.contentReady', {cs: room.content.cs, ok: true});
    await request('room.start');
    assert.equal(room.match.hosted, true);
    const host = room.match.host, onMessage = host.onMessage.bind(host);
    const hostState = {started: room.match.started, dead: host.dead, ready: host.ready};
    serverLogs.push('host initial ' + JSON.stringify(hostState));
    host.onMessage = msg => {
      if (['send', 'broadcast', 'failed'].includes(msg.type)) serverLogs.push('host frame ' + JSON.stringify({type: msg.type, t: msg.msg?.t, phase: msg.msg?.phase, playerId: msg.playerId, matchId: msg.matchId}));
      if (!validHostMessage(msg)) {
        const invalid = [];
        function check(v, key) {
          if (typeof v === 'undefined' || typeof v === 'number' && !Number.isFinite(v)) invalid.push(key + ':' + String(v));
          else if (v && typeof v === 'object') for (const [k, value] of Object.entries(v)) check(value, key + '.' + k);
        }
        check(msg, 'message'); serverLogs.push('invalid host frame: ' + msg.type + '/' + msg.msg?.t + ' ' + invalid.join(', '));
      }
      onMessage(msg);
    };
    const diagnostic = await room.match.diag();
    serverLogs.push('host diagnostic ' + JSON.stringify(diagnostic));
    serverLogs.push('routing ' + JSON.stringify({live: room.matchCtx.live, disposed: room.match.disposed, matchId: room.match.matchId, seats: room.seats.map(s => s?.playerId), myId, lastPublic: room.matchCtx.lastPublic?.slice(0, 180)}));
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'INFO_CHECK', {timeout: 8000});
    assert.deepEqual(await page.evaluate(() => globalThis.__SP__.store.get().match.public.cyclopsBalance), m.gd.cyclopsBalanceInfo,
      'worker receives the same profile and publishes the same frozen identity');
    await request('g.infoReady');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'BAND_DRAFT');
    await request('g.band', {bandId});
    for (const [r, quality] of [[5, 'silver'], [10, 'gold'], [15, 'prismatic']]) {
      await page.waitForFunction(r => globalThis.__SP__.store.get().match.public?.round === r && document.querySelector('.cyc-hex'), {timeout: 12000}, r);
      assert.equal(await page.$$eval(`.cyc-hex--${quality}`, els => els.length), 3);
      if (r === 5) {
        await tap('.cyc-hex[data-slot="0"] .cyc-hex__reroll');
        await page.waitForFunction(() => globalThis.__SP__.store.get().match.private.cyclopsMine.rerolls[0] === false);
        await reload();
        await page.waitForSelector('.cyc-hex');
        assert.equal((await snapshot()).cyclopsMine.rerolls[0], false);
        await shot('six-packs-worker-round5');
      }
      // A one-person gift finishes immediately, so wait on the request/next phase instead of the waiting panel.
      const slot = (await snapshot()).cyclopsMine.slots.findIndex(card => card.id !== 'cyc_universal');
      await tap(`.cyc-hex[data-slot="${slot}"]`);
      await page.waitForSelector(`.cyc-hex[data-slot="${slot}"].is-armed`);
      await tap(`.cyc-hex[data-slot="${slot}"]`);
      if (r === 10) {
        await page.waitForSelector('.cycov--draft');
        assert.equal(await page.$$eval('.cyc-draft-opt', els => els.length), 10);
        await reload();
        await page.waitForSelector('.cyc-draft-opt');
        await tap('.cyc-draft-opt');
        await page.waitForSelector('.cyc-draft-opt.is-armed');
        await tap('.cyc-draft-opt');
      }
    }
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'PREP' && !document.querySelector('.cycov'));
    const diag = await room.match.diag();
    assert.equal(diag.modeId, 'mode_cyclops');
    assert.equal(diag.errorCount, 0);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual([...new Set(resourceFailures)], []);
  });
});
