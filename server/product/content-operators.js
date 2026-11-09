// Built-in content adapter. Keep upstream chess/charId/loadout formats and plugin namespace rules unchanged.
// A reference catalogue is not a playable content set: unresolved native-kit/trait conflicts still block admission.
const visibleNormal = c => c && !c.isGolden && !c.isDiy && !c.isStandIn && !c.standInFor
  && c.visible !== false && !c.isHidden && (!c.baseId || c.baseId === c.chessId);
const union = (...lists) => [...new Set(lists.flatMap(list => list || []))];

/**
 * A selected package's preset is authoritative for this match. Restore upstream's "outside the preset pool"
 * DIY invariant on the caller-owned content clone; retain unit forms, slot definitions and saved user picks.
 */
export function preferProductPresetsForDiy(base, data) {
  const diy = data.backups?.diy;
  if (!diy) return data;
  const presetChars = new Set(Object.values(data.chess).filter(c => visibleNormal(c)
    && (c.expansionBatch || !visibleNormal(base.chess[c.chessId]))).map(c => c.charId));
  if (!presetChars.size) return data;
  if (Array.isArray(diy.ownedPool)) diy.ownedPool = diy.ownedPool.filter(id => !presetChars.has(id));
  for (const [tier, ids] of Object.entries(diy.prototypes || {})) {
    if (Array.isArray(ids)) diy.prototypes[tier] = ids.filter(id => !presetChars.has(id));
  }
  return data;
}

/** Capture provenance from the actual package operations, rather than a second manually maintained roster. */
export function applyContentEntries(data, entries, mode, sources = null) {
  for (const entry of entries) {
    const before = sources && new Map(Object.entries(data.chess).map(([id, row]) => [id, JSON.stringify(row)]));
    entry.apply(data, {mode});
    if (sources) for (const [id, row] of Object.entries(data.chess)) {
      if (before.get(id) !== JSON.stringify(row)) sources.set(id, union(sources.get(id), [entry.id]));
    }
  }
}

/** Translate exact record references only; never rewrite substrings, official identities or persisted settings. */
export function translateContentReferences(value, aliases, path = []) {
  if (typeof value === 'string') return aliases.get(value) || value;
  if (Array.isArray(value)) return value.map((item, i) => translateContentReferences(item, aliases, [...path, i]));
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    const target = aliases.get(key) || key;
    // A native summon variant belongs to the native owner's form. Do not replace it with a package clone's stats.
    if (target !== key && Object.hasOwn(value, target) && path[0] === 'tokens' && path.at(-1) === 'variants') continue;
    const translated = translateContentReferences(item, aliases, [...path, key]);
    if (Object.hasOwn(out, target) && JSON.stringify(out[target]) !== JSON.stringify(translated)) {
      throw Error('测试包引用映射冲突：' + [...path, target].join('.'));
    }
    out[target] = translated;
  }
  return out;
}

/**
 * Native-first browsing projection. Do not use it to certify a new version's gameplay compatibility.
 * Real base records stay intact; only package-added duplicates are removed from the caller-owned catalogue.
 */
export function resolveReferenceOperators(base, data, sources) {
  const nativeByChar = new Map();
  for (const c of Object.values(base.chess)) if (visibleNormal(c) && !c.expansionBatch) {
    const rows = nativeByChar.get(c.charId) || [];
    rows.push(c); nativeByChar.set(c.charId, rows);
  }
  const aliases = new Map(), reused = new Map();
  for (const c of Object.values(data.chess)) {
    if (!visibleNormal(c) || base.chess[c.chessId]) continue;
    const natives = nativeByChar.get(c.charId);
    if (!natives?.length) continue;
    // Multiple native forms are legitimate upstream data, not something a package may collapse arbitrarily.
    if (natives.length !== 1) throw Error('测试包干员存在多个本体配置，需明确适配：' + c.charId);
    const native = natives[0];
    const elite = data.chess[c.goldenId], nativeElite = base.chess[native.goldenId];
    if (!elite?.isGolden || elite.charId !== c.charId || !nativeElite?.isGolden || nativeElite.charId !== c.charId) {
      throw Error('测试包干员普通／精锐引用不完整：' + c.charId);
    }
    for (const [record, target] of [[c, native], [elite, nativeElite]]) {
      if (record.chessId === target.chessId) continue;
      aliases.set(record.chessId, target.chessId);
      const additions = reused.get(target.chessId) || [];
      additions.push(record); reused.set(target.chessId, additions);
    }
  }
  if (aliases.size) {
    for (const name of ['config', 'bonds', 'garrisons', 'tokens', 'items', 'bands', 'backups']) {
      if (data[name]) data[name] = translateContentReferences(data[name], aliases, [name]);
    }
    data.chess = Object.fromEntries(Object.entries(data.chess).filter(([id]) => !aliases.has(id))
      .map(([id, c]) => [id, translateContentReferences(c, aliases)]));
  }
  for (const [id, additions] of reused) {
    const current = data.chess[id], native = base.chess[id];
    // Show native skill/module/stat choices; include package covenant/trait descriptions for browsing only.
    data.chess[id] = {...current, ...structuredClone(native),
      bonds: union(current.bonds, ...additions.map(c => c.bonds)),
      garrisonIds: union(current.garrisonIds, ...additions.map(c => c.garrisonIds))};
  }
  const resolvedSources = new Map();
  for (const [id, packages] of sources) {
    const target = aliases.get(id) || id;
    resolvedSources.set(target, union(resolvedSources.get(target), packages));
  }
  for (const [id, packages] of resolvedSources) {
    const c = data.chess[id];
    if (!c) continue;
    c.productSourcePackages = packages;
    // Imported official records absent from this period are provided by the package, not by this period's base.
    if (!base.chess[id]) c.expansionBatch = packages[0];
  }
  // Same upstream membership rule as reconcilePluginBonds; these historical built-ins predate bond_x namespaces.
  for (const bond of Object.values(data.bonds)) {
    if (!bond.bondId) continue;
    const members = Object.values(data.chess).filter(c => !c.isGolden && c.bonds?.includes(bond.bondId));
    bond.members = members.map(c => c.chessId);
    bond.visibleMembers = members.filter(c => c.visible).map(c => c.chessId);
  }
  return data;
}
