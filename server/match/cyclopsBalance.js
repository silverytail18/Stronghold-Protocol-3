// The mode owns its balance profile; upstream enemy tables are not rewritten.
import { deepFreeze } from '../data.js';
import { canonicalJson } from '../../shared/plugins/identity.js';
import { sha256Hex } from '../../shared/sha256.js';

const DIFFICULTIES = ['FUNNY', 'NORMAL', 'HARD', 'ABYSS'];
function validScale(s) {
  return s && ['hp', 'speed', 'frequencyHp'].every(k => Number.isFinite(s[k]) && s[k] > 0)
    && Number.isFinite(s.atk) && s.atk >= 0;
}

/** Clone and freeze once at match creation. Partial legacy fixtures can omit the profile. */
export function snapshotCyclopsBalance(source) {
  if (source == null) return null;
  const profile = structuredClone(source);
  if (profile.schema !== 1 || typeof profile.revision !== 'string' || !profile.revision || profile.roundCount !== 21) {
    throw new Error('Invalid cyclops-balance schema/revision');
  }
  for (const diff of DIFFICULTIES) {
    const d = profile.difficulties?.[diff];
    if (!d || !(Number.isFinite(d.bossPoolMul) && d.bossPoolMul > 0) || !validScale(d.bossParts)) {
      throw new Error(`Invalid cyclops-balance ${diff} boss policy`);
    }
    for (let r = 1; r <= 21; r++) if (!validScale(d.rounds?.[r])) throw new Error(`Invalid cyclops-balance ${diff} R${r}`);
  }
  return deepFreeze({ profile, identity: { revision: profile.revision, hash: sha256Hex(canonicalJson(profile)) } });
}

/** supplyHpMul protects existing hit-count requirements as ordinary HP rises. */
export function cyclopsScale(snapshot, difficulty, round, part = false) {
  const d = snapshot.profile.difficulties[difficulty];
  const s = part ? d.bossParts : d.rounds[round];
  if (!s) return { hpMul: 1, atkMul: 1, speedMul: 1 };
  const supply = s.hp / s.frequencyHp;
  return { hpMul: s.hp, atkMul: s.atk, speedMul: s.speed, ...(supply !== 1 ? { supplyHpMul: supply } : {}) };
}
