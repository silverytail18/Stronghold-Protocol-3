import test from 'node:test';
import assert from 'node:assert/strict';
import { Net } from '../public/js/net.js';
import { requestId } from '../public/js/requestId.js';
import { validateC2S } from '../shared/protocol.js';

test('requestId falls back when randomUUID is unavailable', () => {
  const source = { getRandomValues(bytes) { bytes.fill(7); return bytes; } };
  const id = requestId(source);
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(requestId({}), /^op-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
});

test('Mizuki commands send successfully when browser crypto has no randomUUID', async () => {
  const net = new Net();
  net.status = 'online';
  let sent;
  net._sendRaw = message => { sent = message; return true; };
  const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues(bytes) { bytes.fill(7); return bytes; } } });
    const pending = net.request('g.mizuki.squad', { squadId: 'rogue_2_band_1' });
    Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
    assert.equal(validateC2S(sent), null);
    assert.equal(sent.t, 'g.mizuki.squad');
    assert.equal(sent.squadId, 'rogue_2_band_1');
    assert.match(sent.opId, /^[A-Za-z0-9_\-.:]+$/);
    net._onMessage(JSON.stringify({ t: 'ok', rid: sent.rid }));
    assert.equal((await pending).t, 'ok');
  } finally {
    Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
    net.close();
  }
});
