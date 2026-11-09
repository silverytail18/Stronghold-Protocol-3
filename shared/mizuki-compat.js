// Mode-local compatibility helpers from Emi ac00de2. Ordinary rules are unchanged.
export const canStackBond = bondId => bondId !== 'soloShip';
export function clearNonStackingBondLayers(layers) {
  if (layers && Object.hasOwn(layers, 'soloShip')) delete layers.soloShip;
  return layers;
}
export function deployWithinOwnerRange(tokenRec) {
  if (!tokenRec || typeof tokenRec !== 'object') return false;
  return String(tokenRec.descRaw ?? tokenRec.desc ?? '').includes('只能部署在召唤者攻击范围内');
}
