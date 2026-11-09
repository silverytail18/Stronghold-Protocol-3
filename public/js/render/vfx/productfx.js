// Custom simulation signals use the current upstream particle runtime and its extracted projectile roles.
// Positions are authoritative simulation positions, never an inferred last attack target.
import {mountPoint} from './mounts.js';
export class ProductFx {
  constructor(wiring) { this.w = wiring; this.moving = new Map(); }

  keysFor(views) {
    const keys=new Set();
    // Custom controllers still use the original skill's projectile references. Include those roots before the first event.
    const present=new Set();
    for(const v of views){const id=this.w.unitKeyOf(v);if(id)present.add(id);const u=this.w.unitOf(v);for(const s of Object.values(u?.skills||{})){for(const name of s?.projectiles||[]){for(const k of this.w.idx.projectiles[name]?.effects||[])keys.add(k);}}}
    const bindings={char_1050_chen3:['projectile_chr_chen3_s3'],char_1043_leizi2:['projectile_char_leizi2_s3'],char_1052_kalts2:['projectile_chr_kalts2_s2_dmg','projectile_chr_kalts2_s2_heal'],char_4182_oblvns:['projectile_chr_oblvns','projectile_chr_oblvns_s2','projectile_chr_oblvns_s2_slow','projectile_chr_oblvns_s3_phy','projectile_chr_oblvns_s3_mag'],char_4247_oxi:['projectile_chr_oxi_s_3_heatwave']};
    for(const id of present)for(const p of bindings[id]||[])for(const k of this.w.idx.projectiles[p]?.effects||[])keys.add(k);
    return keys;
  }

  attack(src, target, kind, time) {
    if (kind === 'product-note') return true; // The simulation's note signals own every note and collision target.
    if (kind !== 'product-kalts2') return false;
    if (!target) return true;
    const p = this.w.idx.projectiles['projectile_chr_kalts2_s2_' + (target.info?.side === 'enemy' || target.side === 'enemy' ? 'dmg' : 'heal')];
    if (p) this.w._fly(p, src, target, 'heal', time, { dur: .25 });
    return !!p;
  }

  point(x, y) { return { x, y, z: 0, alive: true }; }

  at(keys, x, y) {
    let played = false;
    for (const key of keys || []) played = !!this.w.playOn(key, this.point(x, y), { important: true }) || played;
    return played;
  }

  move(id, projectile, e) {
    let row = this.moving.get(id);
    if (e.phase === 'stop') {
      row?.handle?.stop(); this.moving.delete(id); return true;
    }
    const p = this.w.idx.projectiles[projectile];
    if (!p?.main) return false;
    if (!row) {
      const source=this.w.view?.(e.src),pose=source&&this.w.pose(source);
      const mounted=pose&&Number.isInteger(e.mountPoint)?mountPoint(this.w.skinOf(this.w.unitOf(source)),e.mountPoint,pose):null;
      const offset=mounted?[mounted[0]-(source.x-10),mounted[1]-(source.y-9),mounted[2]]:[0,0,0];
      row = { x: e.x, y: e.y, dx: e.dx || 0, dy: e.dy || 0, at: this.w.ofx.time, handle: null, offset };
      this.moving.set(id, row);
      // One root per simulation projectile. Moving the root preserves world-space trail history.
      row.handle = this.w.ofx.spawn(p.main, { pos: [e.x - 10, e.y - 9, 0], yaw: Math.atan2(e.dy || 0, e.dx || 0) }, {
        important: true, loop: true, track: fx => {
          fx.anchor[0] = row.x - 10 + row.offset[0]; fx.anchor[1] = row.y - 9 + row.offset[1]; fx.anchor[2] = row.offset[2];
          fx.yaw = Math.atan2(row.dy, row.dx);
        },
      });
      // Missing resources must leave the procedural fallback in charge and allow a later retry.
      if (!row.handle) { this.moving.delete(id); return false; }
    }
    row.x = e.x; row.y = e.y; row.dx = e.dx || 0; row.dy = e.dy || 0; row.at = this.w.ofx.time;
    if (e.phase === 'hit') this.at(p.onHit, e.x, e.y);
    return true;
  }

  simFx(kind, x, y, e = {}) {
    if (!this.w.ofx.active) return false;
    if (kind === 'mujicaNote') {
      const id = 'zj-note:' + e.id + ':' + e.noteId;
      const previous = this.moving.get(id);
      return this.move(id, e.projectile, {...e, x, y,
        src: e.id, phase: e.state === 'end' ? 'stop' : e.state,
        dx: previous ? x - previous.x : (e.tx ?? x) - x,
        dy: previous ? y - previous.y : (e.ty ?? y) - y});
    }
    if (kind === 'new-fire-dragon') return this.move('dragon:' + e.dragon, 'projectile_chr_chen3_s3', { ...e, x, y });
    if (kind === 'new-fire-dragon-hit') return this.at(this.w.idx.projectiles.projectile_chr_chen3_s3?.onHit, x, y);
    if (kind === 'new-current') return this.move('current:' + e.flow, 'projectile_char_leizi2_s3', { ...e, x, y });
    if (kind === 'source-oxi-heatwave') return this.move('heatwave:' + e.wave, 'projectile_chr_oxi_s_3_heatwave', { ...e, x, y });
    if (kind === 'source-oxi-heatwave-hit') return this.at(['oxi_skill_03_hit_01'],x,y);
    if (kind === 'new-thunder') return this.at([e.source==='talent2'?'leizi2_talent_02_hit':e.source==='skchr_leizi2_1'?'leizi2_skill_01_hit':e.source==='skchr_leizi2_2'?'leizi2_skill_02_hit_attack':'leizi2_talent_02_hit_02'],x,y);
    if (kind === 'new-chen-cut') return this.at(['chen3_skill_02_hit_01'],x,y);
    if (kind === 'source-oblvns-note') return this.move('note:' + e.src + ':' + e.note, e.projectile, { ...e, x, y });
    if (kind === 'source-clemnt-talent') return this.at(['clemnt_talent_hit_01'],x,y);
    if (kind === 'source-clemnt-attack') return true; // normal atk event now owns cast, pose and hit.
    if (kind === 'source-clemnt-bombard') return this.at(['clemnt_skill_03_mark_all_01','clemnt_skill_03_range'],x,y);
    if (kind === 'source-clemnt-bombard-hit') return this.at(['clemnt_skill_03_hit_01'],x,y);
    if (kind === 'exp-clemnt-bombard') return true; // authoritative hit signal above owns the original hit.
    if (kind === 'rm-ri-salvo') {
      return false; // The user-approved pre-rebase RhodesFireSystem owns covenant missiles.
    }
    if (kind === 'rm-ri-impact') return false;
    if (kind === 'rm-ri-hit') return true; // one impact area already covers its damage targets.
    // S2's original projectile already owns its reached effect; suppress the second generic explosion.
    if (kind === 'rm-ri-heat') return true;
    return false;
  }

  tick() {
    for (const [id, row] of this.moving) {
      // Missing stop events (seek, removed owner, interrupted replay) cannot leave an immortal loop.
      if (this.w.ofx.time - row.at > .75 || row.handle?.alive === false) { row.handle?.stop(); this.moving.delete(id); }
    }
  }

  clear() { for (const row of this.moving.values()) row.handle?.stop(); this.moving.clear(); }
}
