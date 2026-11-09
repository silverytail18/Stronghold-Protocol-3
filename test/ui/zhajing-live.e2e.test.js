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
import {AUDIO_EXTS} from '../../shared/media.js';
import {Match} from '../../server/match/Match.js';
import {seedReleaseRead} from '../helpers/releaseNotes.js';
import {getZhajingData} from '../../server/modes/zhajing/Match.js';
import {makeBattle, enemyRec} from '../helpers/zhajingBattleHarness.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const enabled = process.env.SP_E2E === '1' && existsSync(chrome);
const resourceHash = '1'.repeat(64);
const capability = {contract: RESOURCE_CONTRACT, clientLine: CLIENT_LINE, epoch: RESOURCE_EPOCH, build: CLIENT_BUILD, resourceHash};
const ua = `Fixture StrongholdProtocolApp/${RESOURCE_CONTRACT} Resources/${resourceHash} ClientLine/${CLIENT_LINE} Build/${CLIENT_BUILD} Epoch/${RESOURCE_EPOCH}`;
const report = process.env.SP_ZHAJING_REPORT;

describe('炸惊正式页面真实点击与独立模拟', {skip: !enabled && 'set SP_E2E=1 with Chrome'}, () => {
  let f, server, browser, page, adminPage, base;
  const errors = [], failures = [];
  const request = (t, args = {}) => page.evaluate((t, args) => globalThis.__SP__.net.request(t, args), t, args);
  const tap = async (p, selector) => {
    const el = await p.waitForSelector(selector, {visible: true}); await el.scrollIntoView();
    await p.waitForFunction(e => {const r = e.getBoundingClientRect(); return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));}, {}, el);
    await el.click();
  };
  const screenshot = async name => {if (report) {await fs.mkdir(report, {recursive: true}); await page.screenshot({path: path.join(report, name + '.png')});}};
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
    page.on('console',msg=>{if(msg.type()==='error')console.log('CONSOLE',msg.text());});
    page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url());});
    await page.setViewport({width: 1440, height: 900}); await page.setUserAgent(ua);
    await page.setRequestInterception(true);
    page.on('request', async req => {
      const u = new URL(req.url());
      if (!/^\/(?:assets|fonts|media|icons|fx)(?:\/|$)/.test(u.pathname) && !/^\/data\/(?:assets|local-assets|local-fx)\.json$/.test(u.pathname)) return req.continue();
      const pathname = decodeURIComponent(u.pathname);
      let filename = path.resolve(root, pathname.startsWith('/data/') ? '.' + pathname : 'public' + pathname);
      if (u.pathname.startsWith('/media/')) {const stem = path.resolve(root, 'public/assets/audio/' + u.pathname.slice(7)); filename = AUDIO_EXTS.map(ext => stem + ext).find(p => existsSync(p)) || stem;}
      if (!filename.startsWith(root + path.sep)) {failures.push(u.pathname); return req.abort();}
      try {
        const mime = {'.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg'}[path.extname(filename)];
        await req.respond({status: 200, ...(mime ? {contentType: mime} : {}), body: await fs.readFile(filename)});
      } catch {if(pathname !== '/assets/local/map/autochess/tiles.json')failures.push(pathname); await req.respond({status: 404, body: ''});}
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
    try {await page.waitForSelector('[data-mode="gameplay-hall"]', {timeout: 30000});} catch(e) {console.log('BOOT', await page.evaluate(()=>({text:document.body.innerText.slice(-4000),sp:!!globalThis.__SP__}))); await screenshot('boot-failed');throw e;}
    await page.evaluate(async () => (await import('/js/ui/settings.js')).updateSettings({combatMetrics: true}));

  });
  after(async () => {
    if (report) {
      await fs.mkdir(report, {recursive: true});
      await fs.writeFile(path.join(report, 'browser-diagnostics.json'), JSON.stringify({errors, failures: [...new Set(failures)], policy: server?.product.modes.view()}, null, 2));
    }
    await browser?.close(); await server?.close(); await f?.close();
  });


  async function button(text) {
    const el = await page.waitForFunction(text => [...document.querySelectorAll('button')].find(e => e.textContent.trim().includes(text) && e.getBoundingClientRect().width && !e.disabled), {}, text);
    await el.asElement().scrollIntoView(); try {await page.waitForFunction(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));},{},el);} catch(error){console.log('BUTTON BLOCKED',text,await el.evaluate(e=>{const r=e.getBoundingClientRect();return {rect:r.toJSON(),at:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,400)};}));throw error;} await el.asElement().click();
  }
  test('大厅创建、简报、策略、惊变刷新确认、整备、锻造调配与重连', async () => {
    await tap(page, '[data-mode="gameplay-hall"]');
    await tap(page, '[data-gameplay="entertainment_zhajing"] footer button');
    await page.select('select[aria-label="炸惊模拟房间人数"]', '1');
    await button('创建房间'); await page.waitForSelector('.room-screen');
    await screenshot('room');
    await tap(page,'.rs-foot__right button');
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'INFO_CHECK');
    await screenshot('briefing');
    console.log('BRIEF BUTTONS', await page.$$eval('button', list => list.filter(e=>e.getBoundingClientRect().width).map(e=>e.textContent.trim()).slice(-18)));
    await request('g.zhajing', {intent: {t:'g.infoReady'}});
    await page.waitForFunction(() => globalThis.__SP__.store.get().match.public?.phase === 'BAND_DRAFT');
    const m=[...server.lobby.rooms.values()][0].match;
    await request('g.zhajing', {intent: {t:'g.band',bandId:m.defaultBand(m.order[0])}});
    await page.waitForSelector('[data-zj-card]',{timeout:30000});
    const cards=await page.$$eval('[data-zj-card]',list=>list.map(e=>e.textContent)); assert.equal(cards.length,3);
    for(const viewport of [{width:1440,height:900},{width:667,height:375},{width:390,height:844}]) {
      await page.setViewport(viewport);
      await tap(page,'[data-zj-card="0"]');
      await screenshot('draft-'+viewport.width+'x'+viewport.height);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      const btn=await page.waitForFunction(()=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='确认选择'));
      const r=await btn.asElement().boundingBox();assert.ok(r.y>=0&&r.y+r.height<=viewport.height+1,JSON.stringify(r));
    }
    await tap(page,'[data-zj-reroll="0"]');
    await page.waitForFunction(()=>document.querySelector('[data-zj-reroll="0"]')?.disabled);
    await tap(page,'[data-zj-card="0"]'); await button('确认选择');
    await page.waitForFunction(()=>globalThis.__SP__.store.get().match.public?.phase==='PREP');
    await page.setViewport({width:1440,height:900});
    await page.evaluate(() => {
      globalThis.__ZJ_EMOTES__ = [];
      globalThis.__SP__.net.on('m.emote', msg => globalThis.__ZJ_EMOTES__.push(msg));
    });
    await tap(page, '.match-chat__trigger');
    await page.type('textarea[aria-label="聊天内容"]', '炸惊局内真实聊天 <b>纯文本</b>');
    await tap(page, '.match-chat__panel form button[type="submit"]');
    await page.waitForFunction(() => globalThis.__SP__.store.get().chat.some(m => m.text.includes('真实聊天')));
    assert.equal(await page.$('.match-chat__messages b b'), null, '用户消息不能解释为HTML');
    await tap(page, '.match-chat__panel header button');
    await tap(page, '.ewheel__btn'); await tap(page, '.ewheel__item');
    await page.waitForFunction(() => globalThis.__ZJ_EMOTES__?.length > 0);
    assert.ok(m.chatMessages.some(msg => msg.text.includes('真实聊天')));
    m.order[0].grantForge(1); m.onReconnect(m.order[0].playerId);
    await button('锻造器 1'); await screenshot('forge'); await button('返回整备');
    await button('干员调配'); await screenshot('loadout'); await button('返回整备');
    console.log('BEFORE RELOAD',m.phase,m.order[0].ready);
    await page.reload({waitUntil:'domcontentloaded'}); await page.bringToFront();
    await page.waitForSelector('.zj-tools',{timeout:30000});
    await page.waitForFunction(() => globalThis.__SP__.store.get().chat.some(m => m.text.includes('真实聊天')));
    assert.equal(await page.evaluate(()=>globalThis.__SP__.store.get().match.public.phase),'PREP');
    const sim=await page.evaluate(async()=>{const {loadZhajingSim}=await import('/js/battle/zhajingSim.js');const x=await loadZhajingSim();return {chess:Object.keys(x.raw.chess).length,run:typeof x.spec.createBattleFromSpec};});
    assert.ok(sim.chess>100); await screenshot('prep-reconnected');
    assert.equal(sim.run,'function');
    assert.equal(await page.$$eval('.ff-slot[data-drop="hand"]', xs => xs.length),20);
    await page.goto(base + '/index.html?render=engine', {waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.__SP_VIEW__?.kind==='engine',{timeout:30000});
    const models = await page.evaluate(async()=>{
      const {assets}=await import('/js/assets.js'); const result=[];
      for(const id of ['char_4217_makoto','char_4218_aigis','char_4219_yukari','char_4220_kormr']) {
        for(const side of ['front','back']) {
          const entry=assets.spineEntry(id,{back:side==='back'});
          const skeleton=await assets.spine.acquire(entry);
          result.push({id,side,skel:entry.skel,bones:skeleton.bones.length}); assets.spine.release(entry);
        }
      }
      return result;
    });
    assert.equal(models.length,8);assert.ok(models.every(x=>x.bones>0));
    if(report)await fs.writeFile(path.join(report,'p3-models.json'),JSON.stringify(models,null,2));
    await screenshot('pixi-prep');
    const skin = 'char_1035_wisdel@game#9';
    let piece;
    m.guard(() => {
      const ps = m.order[0]; m.setSkins(ps.playerId, {'char:char_1035_wisdel': skin});
      piece = ps.acquireChess('chess_zj_37_a', {fromPool: false});
      let placed = false;
      for (let r = 9; r <= 12 && !placed; r++) for (let c = 2; c <= 10 && !placed; c++) placed = ps.move(piece.uid, {area: 'board', row: r, col: c}, 'RIGHT').ok === true;
      assert.ok(placed); m.markPrivate(ps); m.markPublic();
    });
    await page.waitForFunction(skin => globalThis.__SP__.store.get().match.private.board.some(p => p.skin === skin), {}, skin);
    await screenshot('skin-prep');
    await page.evaluate(()=>{
      const net=globalThis.__SP__.net,original=net.request.bind(net);
      globalThis.__ZJ_REPORTS__=[];
      net.request=async(...args)=>{const reply=await original(...args);if(args[0]==='b.result')globalThis.__ZJ_REPORTS__.push(reply);return reply;};
    });
    await request('g.zhajing',{intent:{t:'g.ready',ready:true}});
    await page.waitForFunction(()=>globalThis.__SP_RUNNER__?.currentBattle()?.time>0,{timeout:20000,polling:100});
    const battle = await page.evaluate(()=>({current:globalThis.__SP_RUNNER__.currentBattle(),stats:globalThis.__SP_RUNNER__.stats()}));
    assert.equal(battle.current.spec.modeId,'mode_single_zhajing');assert.equal(battle.stats.errors,0);
    await page.waitForFunction(() => globalThis.__SP_RUNNER__.combatMetrics().damage > 0, {timeout: 20000, polling: 100});
    assert.equal(await page.evaluate(uid => [...globalThis.__SP_RUNNER__._entries.values()].flatMap(e => e.battle?.allyUnits || []).find(u => u.uid === uid)?.skin, piece.uid), skin);
    await tap(page, '.gm__metrics'); await page.waitForSelector('.combat-metrics__row');
    await screenshot('combat-metrics'); await tap(page, '.combat-metrics__close');
    await screenshot('battle');
    // Exercise the normal timeout/report path with a controlled end event, without fabricating a result.
    await page.evaluate(()=>{const runner=globalThis.__SP_RUNNER__;for(const entry of runner._entries.values())runner.onEnd({battleId:entry.battleId,reason:'timeout'});});
    await page.waitForFunction(()=>globalThis.__ZJ_REPORTS__?.length>0,{timeout:15000});
    const replies=await page.evaluate(()=>globalThis.__ZJ_REPORTS__);
    assert.ok(replies.every(reply=>reply.t==='ok'),JSON.stringify(replies));
    assert.equal(await page.evaluate(()=>globalThis.__SP_RUNNER__.stats().errors),0);
    assert.deepEqual(errors,[]);assert.deepEqual([...new Set(failures)],[]);
  });

  test('真实S3信号在Chrome/Pixi绘制物法音符，移动不重生，原始与后备特效结束清理', async () => {
    const raw = getZhajingData().chess.chess_zj_oblvns_b;
    const h = makeBattle({modeId: 'mode_single_zhajing',
      defs: {chess: {[raw.chessId]: {...raw, skill: raw.skills.find(s => s.index === 2)}},
        enemies: {note_dummy: enemyRec({key: 'note_dummy', hp: 1e9, speed: 0})}},
      units: [{chessId: raw.chessId, row: 9, col: 6}],
      enemies: [{key: 'note_dummy', route: {motion: 'WALK', start: [9, 8], end: [9, 8], checkpoints: []}}],
      autoFinish: false, timeLimit: 100, flags: {startOpCooldown: 0}, captureNoisy: true});
    h.run(.1); const u = h.unit(raw.chessId); u.skill.addCharge(1); assert.ok(u.skill.activate('test'));
    let notes = [];
    for (let i = 0; i < 160 && notes.length < 4; i++) {
      h.step(); notes = h.eventsOf('fx').filter(e => e[1] === 'mujicaNote' && e[4].state === 'spawn' && e[4].projectile.includes('_s3_'));
    }
    assert.equal(notes.length, 4); h.run(.3);
    const ids = notes.map(e => e[4].noteId);
    const events = h.eventsOf('fx').filter(e => e[1] === 'mujicaNote' && ids.includes(e[4].noteId));
    const result = await page.evaluate(async events => {
      const d = globalThis.__SP_VIEW__.raw.debug, {app, wiring: w, ofx, fx} = d;
      app.stop(); w.clear(); ofx.clear(); fx.clear();
      ofx.setTier('full');
      const names = ['projectile_chr_oblvns_s3_phy', 'projectile_chr_oblvns_s3_mag'];
      const keys = names.flatMap(name => w.idx.projectiles[name].effects);
      await ofx.lib.preload(keys, {half: false});
      for (const e of events) { w.simFx(e[1], e[2], e[3], e[4]); ofx.update(.02); }
      for (let i = 0; i < 8; i++) ofx.update(.05);
      app.renderer.render(app.stage);
      const rows = [...w.product.moving.values()];
      const data = {roots: rows.length, distinct: new Set(rows.map(row => row.handle)).size,
        keys: rows.map(row => row.handle.key), loaded: rows.every(row => !!row.handle.effect), stats: ofx.stats()};
      globalThis.__ZJ_NOTE_EVENTS__ = events;
      return data;
    }, events);
    assert.equal(result.roots, 4); assert.equal(result.distinct, 4); assert.ok(result.loaded);
    assert.equal(new Set(result.keys).size, 2); assert.ok(result.stats.particles > 0); assert.ok(result.stats.draws > 0);
    await screenshot('sakiko-s3-original');
    const fallback = await page.evaluate(() => {
      const {app, wiring: w, ofx, fx} = globalThis.__SP_VIEW__.raw.debug;
      const events = globalThis.__ZJ_NOTE_EVENTS__, handles = [...w.product.moving.values()].map(row => row.handle);
      for (const e of events.filter(e => e[4].state === 'spawn')) w.simFx(e[1], e[2], e[3], {...e[4], state: 'end'});
      const cleared = w.product.moving.size === 0 && handles.every(handle => !!handle.stopped);
      ofx.setTier('off');
      for (const e of events) if (!w.simFx(e[1], e[2], e[3], e[4])) fx.simFx(e[1], e[2], e[3], e[4]);
      app.renderer.render(app.stage);
      return {cleared, rows: fx.mujicaNotes.rows.size, visible: [...fx.mujicaNotes.rows.values()].every(row => row.g.visible && row.g.parent && row.g.geometry.graphicsData.length > 0)};
    });
    assert.ok(fallback.cleared); assert.equal(fallback.rows, 4); assert.ok(fallback.visible);
    await screenshot('sakiko-s3-fallback');
    const clean = await page.evaluate(() => {
      const {fx} = globalThis.__SP_VIEW__.raw.debug;
      for (const e of globalThis.__ZJ_NOTE_EVENTS__.filter(e => e[4].state === 'spawn')) fx.simFx(e[1], e[2], e[3], {...e[4], state: 'end'});
      const ended = fx.mujicaNotes.rows.size;
      for (const e of globalThis.__ZJ_NOTE_EVENTS__.filter(e => e[4].state === 'spawn')) fx.simFx(e[1], e[2], e[3], e[4]);
      fx.clear(); return {ended, cleared: fx.mujicaNotes.rows.size};
    });
    assert.deepEqual(clean, {ended: 0, cleared: 0});
    if (report) await fs.writeFile(path.join(report, 'sakiko-s3-render.json'), JSON.stringify({result, fallback, clean, signalCount: events.length}, null, 2));
    assert.deepEqual(errors, []); assert.deepEqual([...new Set(failures)], []);
  });

  test('受控全员漏两怪13→11：正式结果框−2、单人无计时与有时限标签，不弹空联防', async () => {
    const m = [...server.lobby.rooms.values()][0].match, phases = [];
    m.guard(() => {
      m.setDeadline(0); m.round += 1; m.phase = 'COMBAT';
      for (const ps of m.order) {
        ps.lp = 13;
        m.lastResults.set(ps.playerId, {leaked: [{counted: true}, {counted: true}], perfect: false});
        m.markPrivate(ps);
      }
      for (const field of m.fields) field.live = false;
      m.setDeadline(20, () => {}); m.markPublic();
    });
    await page.waitForFunction(() => document.querySelector('.gtop__clock')?.textContent.includes('本阵地已结束'));
    await screenshot('battle-done-clock');
    const original = m.markPublic.bind(m);
    m.markPublic = (...args) => {phases.push(m.phase); return original(...args);};
    m.guard(() => m._afterCombat());
    await page.waitForFunction(() => document.querySelector('.rdialog__sub')?.textContent === '生命值减少 −2');
    assert.equal(m.order[0].lp, 11); assert.equal(m.phase, 'SETTLE'); assert.ok(!phases.includes('UNITE'));
    assert.equal(m.publicView().deadline, 0, '单人结算沿参考无倒计时');
    assert.equal(await page.$('.gtop__clock [role="timer"]'), null);
    // Exercise the timed SETTLE presentation separately; do not change solo rules to manufacture a countdown.
    m.guard(() => {m.setDeadline(3, () => {}); m.markPublic();});
    await page.waitForFunction(() => document.querySelector('.gtop__clock')?.textContent.includes('结算倒计时'));
    assert.equal(await page.$('.mpop--phase'), null);
    await screenshot('settle-minus-two');
    assert.deepEqual(errors, []); assert.deepEqual([...new Set(failures)], []);
  });
});
