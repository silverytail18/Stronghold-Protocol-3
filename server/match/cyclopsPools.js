// Fixed opening groups: elimination never transfers stock between groups.
import { cyclopsGroups } from '../../shared/cyclops.js';
import { SharedPool } from './pool.js';

export function createCyclopsPoolGroups(gd, seats, banned = []) {
  return cyclopsGroups(seats).map(group => ({ ...group, pool: new SharedPool(gd, { banned }) }));
}

export function playerPoolGroup(ps) {
  return ps.m.isCyclops ? ps.m.poolGroups?.find(group => group.playerIds.includes(ps.playerId)) : null;
}
