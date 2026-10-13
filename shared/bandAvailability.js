/** New opt-in restrictions only; existing strategies retain their established eligibility. */
export function bandAvailable(band,chess,disabled=[],banned=[]){
  const rule=band?.requiresAvailableBond;if(!rule)return true;
  const off=new Set(disabled),ban=new Set(banned);if(off.has(rule.bondId))return false;
  const ids=new Set(Object.values(chess||{}).filter(c=>c.visible&&!c.isGolden&&!c.isDiy&&!c.isHidden&&Number.isInteger(c.tier)&&c.bonds?.includes(rule.bondId)&&!ban.has(c.baseId||c.chessId)).map(c=>c.baseId||c.chessId));
  return ids.size>=rule.count;
}
