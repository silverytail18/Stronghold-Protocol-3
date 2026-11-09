import { test } from 'node:test';
import assert from 'node:assert/strict';
import { V79Fx } from '../../public/js/render/vfx/v79fx.js';
import { FxWiring } from '../../public/js/render/vfx/wiring.js';

function fixture() {
  const talulah = { id: 1, x: 4, y: 10, alive: true, destroyed: false, info: { charId: 'char_4247_oxi' } };
  const enemy = { id: 2, x: 5, y: 10, alive: true, destroyed: false };
  const played = [];
  const stopped = [];
  const views = new Map([[1, talulah], [2, enemy]]);
  const w = {
    ofx: { active: true, ready: async () => true, time: 0, timers: [] },
    unitKeyOf: () => 'char_4247_oxi',
    view: id => views.get(id) || null,
    effectKey: key => key,
    playOn(key, view, opts) {
      const handle = { key, view, opts, alive: true, stop() { this.alive = false; stopped.push(key); } };
      played.push(handle);
      return handle;
    },
  };
  return { vfx: new V79Fx(w), talulah, enemy, played, stopped };
}

test('Talulah S2 guard and counter signals play their V79 effects on the operator and chosen enemy', () => {
  const { vfx, talulah, enemy, played } = fixture();
  const wiring = Object.create(FxWiring.prototype);
  Object.assign(wiring, { idx: {}, v79: vfx });
  assert.deepEqual(vfx.keys([talulah]), ['oxi_buff_01', 'oxi_skill_02_buff_02', 'oxi_skill_02_hit_01', 'oxi_skill_03_trail_01', 'oxi_skill_03_hit_01']);
  assert.equal(wiring.simFx('oxiGuard', talulah.x, talulah.y, { id: talulah.id, dur: 1.3 }), true);
  assert.equal(wiring.simFx('oxiCounter', enemy.x, enemy.y, { id: talulah.id, target: enemy.id }), true);
  assert.equal(played[0].key, 'oxi_skill_02_buff_02');
  assert.equal(played[0].view, talulah);
  assert.equal(played[0].opts.follow, true);
  assert.equal(played[1].key, 'oxi_skill_02_hit_01');
  assert.equal(played[1].view, enemy);
});
