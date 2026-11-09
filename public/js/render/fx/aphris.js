// 谬因's path beams. Official AphrisEffectEmitter line prefabs have no live particles and require path-driven mesh
// placement. This procedural path keeps the official hit/start/skill effects in wiring; it does not claim shader parity.
import { bodyZ, SHOT_HEIGHT } from './camera.js';

const PULSE = 0.45;
const MAX_PATH = 400;

export class AphrisBeamSystem {
  constructor(ctx) {
    this.ctx = ctx;
    this.rows = new Map();
    this.time = 0;
    this.g = new ctx.P.Graphics();
    this.g.blendMode = ctx.P.BLEND_MODES.ADD;
    ctx.layers.fxAdd.addChild(this.g);
  }

  /** Snapshot state, on the displayed game clock: reconnects and watched fields need no earlier fx event. */
  set(rows, time) {
    this.rows.clear();
    this.time = time;
    if (!Number.isFinite(time) || !Array.isArray(rows)) return;
    for (const r of rows) {
      if (!r || !Number.isFinite(r.id) || ![0, 2, 3].includes(r.mode) || !Number.isFinite(r.at)
        || !Array.isArray(r.path) || r.path.length < 1 || r.path.length > MAX_PATH
        || !r.path.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))) continue;
      this.rows.set(r.id, r);
    }
  }

  has(id) { return this.rows.has(id); }

  clear() { this.rows.clear(); this.g.clear(); }

  destroy() { this.clear(); this.g.destroy(); }

  update() {
    const g = this.g;
    g.clear();
    const cam = this.ctx.cam();
    for (const r of this.rows.values()) {
      const v = this.ctx.view(r.id);
      if (!v || v.alive === false || v.destroyed || v.culled || v.container?.visible === false) continue;
      const age = this.time - r.at;
      if (r.at < 0 || age < 0 || (r.mode !== 2 && age >= PULSE)) continue;
      const fade = r.mode === 2 ? Math.min(1, age / 0.08 + 0.2) : 1 - age / PULSE;
      const pulse = r.mode === 2 ? 0.88 + 0.12 * Math.sin(age * 24) : 1;
      const points = r.path.map(([row, col], i) => {
        // Official emitter: waypointUseFixedHeight=1, waypointFixedHeight=0.65. Source leaves her hands.
        const z = i === 0 ? bodyZ(cam, v, SHOT_HEIGHT.launch) : (this.ctx.heightAt(row, col) || 0) + 0.65;
        return cam.project(i === 0 ? v.x : col, i === 0 ? v.y : row, z, {});
      });
      // [ASSUMED] Cyan body/white core and these widths approximate the official teal path materials.
      const scale = points[0].s;
      const width = r.mode === 2 ? 0.13 : r.mode === 3 ? 0.1 : 0.065;
      for (let pass = 0; pass < 3; pass++) {
        g.lineStyle(Math.max(1, scale * width * [2.8, 1, 0.25][pass]),
          [0x167e94, 0x55efdc, 0xe3fff7][pass], [0.22, 0.75, 0.95][pass] * fade * pulse);
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
      }
      // Light the source, turns and endpoint once per path, rather than once per enemy hit.
      g.lineStyle(0);
      for (const p of points) {
        g.beginFill(0x55efdc, 0.2 * fade).drawCircle(p.x, p.y, Math.max(2, p.s * width)).endFill();
        g.beginFill(0xe3fff7, 0.85 * fade).drawCircle(p.x, p.y, Math.max(1.5, p.s * width * 0.25)).endFill();
      }
    }
  }
}
