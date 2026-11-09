// Source: Emi ac00de2 server/match/unite.js. Mode-local until shared rescue contracts converge.
import { uniteLpExempt } from '../../../shared/uniteBilling.js';
export function uniteRemainingLeaks(plan, result) {
  const bySource = new Map(), byMods = new Map();
  const keyOf = (entry) => JSON.stringify([entry.sourcePlayerId, entry.enemyKey, entry.tag ?? null]);
  const queue = (map, key) => {
    if (!map.has(key)) map.set(key, { rows: [], cursor: 0 });
    return map.get(key);
  };
  const take = (q) => {
    if (!q) return null;
    while (q.cursor < q.rows.length && q.rows[q.cursor].used) q.cursor++;
    const row = q.rows[q.cursor++] || null;
    if (row) row.used = true;
    return row?.leak || null;
  };
  for (const leak of plan.leaked) {
    const key = keyOf(leak), row = { leak, used: false };
    queue(bySource, key).rows.push(row);
    if (!byMods.has(key)) byMods.set(key, new Map());
    queue(byMods.get(key), JSON.stringify(leak.mods)).rows.push(row);
  }
  const sources = new Set(plan.leakers.map((p) => p.playerId));
  const out = [];
  const add = (entry) => {
    if (!entry || entry.counted === false || uniteLpExempt(entry) || !sources.has(entry.sourcePlayerId) || !entry.enemyKey) return;
    const key = keyOf(entry);
    const prior = (entry.mods == null ? null : take(byMods.get(key)?.get(JSON.stringify(entry.mods)))) || take(bySource.get(key));
    out.push({ enemyKey: entry.enemyKey, sourcePlayerId: entry.sourcePlayerId, tag: entry.tag ?? null,
      mods: entry.mods ?? prior?.mods ?? null, lpr: entry.lpr ?? prior?.lpr ?? 1,
      rankedHpRatio: entry.rankedHpRatio ?? prior?.rankedHpRatio ?? 0, bounty: prior?.bounty ?? null });
  };
  for (const entry of result.unspawned || []) add(entry);
  for (const pp of Object.values(result.perPlayer || {})) for (const entry of pp?.leaked || []) if (entry?.counted !== false && !entry?.uniteRuntime) add(entry);
  return out;
}
