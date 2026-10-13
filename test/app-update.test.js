import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refreshAppResources, appendAppUpdateControl, initAppResources, appArtUrl } from '../public/js/appResources.js';
import { initAuth } from '../public/js/auth.js';

const manifest = { version: 1, art: 'a'.repeat(64), revision: 'b'.repeat(64) };
function environment(t) {
  const keys = ['fetch', 'location', 'document', 'window'];
  const originals = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const requests = [], panels = [];
  let reloads = 0, response = manifest, fail = false;
  function element(tag) {
    return { tag, children: [], listeners: {}, attributes: {}, hidden: false, disabled: false,
      append(...children) { this.children.push(...children); },
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(event, handler) { this.listeners[event] = handler; } };
  }
  globalThis.document = { createElement: element, body: { append(panel) { panels.push(panel); } }, addEventListener() {} };
  globalThis.window = { addEventListener() {} };
  globalThis.location = { reload() { reloads++; } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (fail) throw new Error('offline');
    return { ok: true, json: async () => response };
  };
  t.after(() => keys.forEach((key, i) => originals[i] ? Object.defineProperty(globalThis, key, originals[i]) : delete globalThis[key]));
  return { requests, panels, element, get reloads() { return reloads; },
    set response(value) { response = value; }, set fail(value) { fail = value; } };
}

test('manual App update refreshes even the same version, reads without cache and retains account/game state', async t => {
  const env = environment(t);
  await initAppResources();
  const state = { room: null, me: { accountId: 'persistent-id' }, ranked: { points: 300, games: 12 } };
  const before = structuredClone(state);
  await refreshAppResources({ get: () => state });
  assert.equal(env.reloads, 1);
  assert.deepEqual(state, before);
  assert.equal(env.requests.at(-1).url, '/app/resource-manifest');
  assert.equal(env.requests.at(-1).options.cache, 'no-store');
  assert.equal(env.requests.at(-1).options.credentials, 'same-origin');
  env.response = { ...manifest, art: 'c'.repeat(64), revision: 'd'.repeat(64) };
  await refreshAppResources({ get: () => state });
  assert.equal(env.reloads, 2);
  assert.equal(appArtUrl('/icons/ranks/bronze.svg'), `/app-cache/${manifest.art}/icons/ranks/bronze.svg`, 'active page must not mix new art with old rule data');
});

test('manual update does not reload or request data during a match, including a match started mid-request', async t => {
  const env = environment(t), state = { room: { inMatch: true } }, store = { get: () => state };
  await assert.rejects(refreshAppResources(store), /对局结束/);
  assert.equal(env.requests.length, 0);
  state.room = null;
  let release;
  globalThis.fetch = () => new Promise(resolve => { release = resolve; });
  const pending = refreshAppResources(store);
  state.room = { inMatch: true };
  release({ ok: true, json: async () => manifest });
  await assert.rejects(pending, /对局结束/);
  assert.equal(env.reloads, 0);
});

test('App update button prevents duplicate submissions, shows connection errors and supports retry', async t => {
  const env = environment(t), panel = env.element('aside');
  appendAppUpdateControl(panel, { get: () => ({ room: null }) });
  const [button, status] = panel.children;
  assert.equal(status.attributes.role, 'status');
  env.fail = true;
  const failed = button.listeners.click();
  assert.equal(button.disabled, true);
  await button.listeners.click();
  await failed;
  assert.equal(env.requests.length, 1);
  assert.match(status.textContent, /检查网络.*重试/);
  assert.equal(button.disabled, false);
  assert.equal(status.hidden, false);
  assert.equal(env.reloads, 0);
  env.fail = false;
  await button.listeners.click();
  assert.equal(env.reloads, 1);
});

test('refresh refuses invalid server versions rather than reloading a partially updated page', async t => {
  const env = environment(t);
  env.response = { ...manifest, art: 'not-a-version' };
  await assert.rejects(refreshAppResources({ get: () => ({ room: null }) }), /无法读取服务器更新/);
  assert.equal(env.reloads, 0);
});

test('update entry is App-only, present without authentication too, and hidden outside title/lobby', async t => {
  const env = environment(t), net = { on() {} };
  let route = 'lobby', notify;
  const store = { get: () => ({}), subscribe(handler) { notify = handler; } };
  for (const enabled of [true, false]) {
    globalThis.fetch = async url => ({ ok: true, json: async () => url === '/auth/session'
      ? { enabled, authenticated: true, app: true, username: 'tester', role: 'user' } : manifest });
    await initAuth(net, store, () => route);
    const panel = env.panels.at(-1);
    assert.ok(panel.children.some(child => child.textContent === '从服务器更新数据'));
    assert.equal(panel.hidden, false);
    route = 'result'; notify(); assert.equal(panel.hidden, true);
    route = 'lobby'; notify(); assert.equal(panel.hidden, false);
  }
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ enabled: true, authenticated: true, app: false, username: 'tester', role: 'user' }) });
  await initAuth(net, store, () => route);
  assert.ok(!env.panels.at(-1).children.some(child => child.textContent === '从服务器更新数据'));
});
