// Bounded match-only carry for the controller's once-per-round attack shield.
export function compactRhineResult(result) {
  if (!result?.rhineCarry) return {};
  const used = result.rhineCarry.controllerUsed;
  return {rhineCarry: {controllerUsed: [...new Set((Array.isArray(used) ? used : [])
    .filter(uid => Number.isInteger(uid) && uid > 0 && uid <= 2 ** 31))].slice(0, 64)}};
}
