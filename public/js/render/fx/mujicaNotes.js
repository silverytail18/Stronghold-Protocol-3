// Minimal note markers when original particle effects are disabled or unavailable.
// One object per simulation note; movement updates never create extra bursts.
export class MujicaNoteSystem {
  constructor(system) { this.system = system; this.rows = new Map(); }
  remove(key) {
    const row = this.rows.get(key);
    row?.g.destroy(); this.rows.delete(key);
  }
  event(x, y, e = {}) {
    const key = e.id + ':' + e.noteId;
    if (e.state === 'end') { this.remove(key); return; }
    let row = this.rows.get(key);
    if (!row) {
      const g = new this.system.P.Graphics();
      const color = e.kind === 'piano' ? 0x85cbff : 0xd5a2ff;
      g.lineStyle(2, color, 1); g.beginFill(color, .9);
      g.drawEllipse(-3, 2, 3, 2); g.endFill();
      g.moveTo(0, 2); g.lineTo(0, -9); g.lineTo(6, -11); g.lineTo(6, -3);
      (this.system.ctx.layers.vfxOver || this.system.ctx.layers.fxNormal).addChild(g);
      row = {g, x, y, at: this.system.time}; this.rows.set(key, row);
    }
    Object.assign(row, {x, y, at: this.system.time});
    this.place(row);
  }
  place(row) {
    const point = this.system._point(row.x, row.y);
    row.g.position.set(point.x, point.y - 12);
  }
  update() {
    for (const [key, row] of this.rows) {
      if (this.system.time - row.at > .75) this.remove(key);
      else this.place(row);
    }
  }
  clear() { for (const key of this.rows.keys()) this.remove(key); }
}
