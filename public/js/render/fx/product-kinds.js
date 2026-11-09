// Project-authored visuals, using the current renderer's primitives. These are not original-game prefabs.
export const PRODUCT_FX_KINDS = Object.freeze({
  'exp-sui': {a: 'blast', c: 0xe6c894, pt: true, r: 1.2},
  snowfieldGuide: {a: 'element', c: 0xa7e9ff},
  snowfieldIceBurst: {a: 'blast', c: 0xa7e9ff, pt: true},
  specialResearchAttack: {a: 'blast', c: 0x85c9ff, pt: true},
  specialResearchHeal: {a: 'blast', c: 0x96ffe4, pt: true},
  'kz-curse-mark': {a: 'reticle', c: 0xdb718e},
  'kz-resonance': {a: 'buff', c: 0xef799a},
  'kz-blood-vortex': {a: 'none'}, // KazdelBloodSystem, restored by explicit user request.
  'kz-blood-sword': {a: 'none'},
  'rm-ri-salvo': {a: 'none'}, // RhodesFireSystem owns flight and reticles; impact remains authoritative.
  higashiParry: {a: 'shield', c: 0xffe6b8},
  higashiRelease: {a: 'buff', c: 0xffd997},
  higashiSlash: {a: 'none'}, // HigashiBladeSystem draws the original project-authored ribbons.
  higashiReturn: {a: 'none'},
  higashiWind: {a: 'none'},
  higashiInsight: {a: 'none'},
  higashiNinja: {a: 'counter', c: 0xb8a3ed},
  higashiUltimate: {a: 'none'},
  higashiUltimateHit: {a: 'none'}, // The full-screen blade/fracture already owns this impact.
  harukaBubblePop: {a: 'blast', c: 0xc5a5ff, pt: true, r: .6},
  ursusExecution: {a: 'reticle', c: 0xffbe78},
  iberiaLight: {a: 'buff', c: 0xffe59a},
  iberiaJudgment: {a: 'none'}, // IberiaEffects follows snapshot pending judgments, not one-shot reticles.
  iberiaExplosion: {a: 'blast', c: 0xffdf8c},
  'rm-fever': {a: 'buff', c: 0xe5a2ff},
  'rm-fever-end': {a: 'none'},
  'rm-note': {a: 'none'}, // Legacy diagnostic signal; the authoritative note projectile owns the visual.
  'exp-seed-clear': {a: 'none'},
  'source-special-highland-tile': {a: 'zone', c: 0xc2b699, pt: true, r: .45, dur: .3},
});

const TEAM = new Map([
  ['rm-fever', 'girlbandShip'], ['higashiRelease', 'higashiShip'], ['iberiaLight', 'iberiaShip'],
]);

// Some sim signals deliberately contain only an owner or target ID. Battle.fx serializes absent x/y as 0,0.
// Resolve those IDs explicitly, never send their visuals to board origin or to another owner's units.
export function productFxPlacements(kind, x, y, extra, ctx) {
  if (!Object.hasOwn(PRODUCT_FX_KINDS, kind)) return null;
  const ex = extra || {}, team = TEAM.get(kind);
  if (team) {
    const owner = ex.playerId ?? ex.ownerId;
    if (owner == null) return [];
    return Array.from(ctx.views?.() || []).filter(v => v.info?.ownerId === owner && v.info?.kind === 'op'
      && v.alive !== false && !v.destroyed && ctx.lookupDef?.(v.info)?.bonds?.includes(team)).slice(0, 32)
      .map(v => ({x: v.x, y: v.y, ex: {...ex, id: v.id ?? v.info.id}}));
  }
  if (kind === 'ursusExecution' && ['cancel', 'refund'].includes(ex.kind)
    || kind === 'iberiaJudgment' && ex.kind === 'cancel') return [];
  const target = ex.id != null ? ctx.view?.(ex.id) : null;
  const spec = PRODUCT_FX_KINDS[kind];
  const at = target && !spec.pt ? {x: target.x, y: target.y} : {x, y};
  const event = {...ex};
  if (kind === 'ursusExecution') {
    event.visual = ex.kind === 'lock' ? 'reticle' : 'strike';
  } else if (kind === 'iberiaJudgment') event.visual = ex.kind === 'rune' ? 'reticle' : 'strike';
  return [{...at, ex: event}];
}
