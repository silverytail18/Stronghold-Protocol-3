// Ranked rules are public; identity, qualification and settlement remain server-owned.
export const RANK_TIERS = ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '传奇'];
export const RANK_RULES = Object.freeze({ NORMAL: Object.freeze({ win: 30, loss: 20, hidden: 4 }),
  HARD: Object.freeze({ win: 40, loss: 25, hidden: 8 }), ABYSS: Object.freeze({ win: 60, loss: 30, hidden: 12 }) });
export function rankOf(points = 0) {
  points = Math.max(0, Math.trunc(points));
  const tier = Math.min(6, Math.floor(points / 300));
  const division = tier === 6 ? '' : ['III', 'II', 'I'][Math.floor(points % 300 / 100)];
  return { tier, division, label: `${RANK_TIERS[tier]}${division ? ' ' + division : ''}`, points,
    next: tier === 6 ? null : Math.floor(points / 100 + 1) * 100 };
}
export function rankedDifficultyAllowed(points, difficulty) {
  return Object.hasOwn(RANK_RULES, difficulty) && (difficulty !== 'NORMAL' || points < 600) && (difficulty !== 'HARD' || points < 1200);
}
export function validateRankRules(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !Object.hasOwn(RANK_RULES, k))) throw new Error('排位规则格式无效');
  const out = {};
  for (const difficulty of Object.keys(RANK_RULES)) {
    const rule = input[difficulty];
    if (!rule || !Number.isInteger(rule.win) || rule.win < 2 || rule.win > 1000 || rule.win % 2
      || !Number.isInteger(rule.hidden) || rule.hidden < 0 || rule.hidden > 1000 || rule.hidden % 2
      || !Number.isInteger(rule.loss) || rule.loss < 1 || rule.loss > 1000) throw new Error('胜利分必须是正偶数，隐秘核心奖励必须是非负偶数，失败分须为 1–1000');
    out[difficulty] = { win: rule.win, loss: rule.loss, hidden: rule.hidden };
  }
  return out;
}
export function rankedDelta(rules, difficulty, mode, victory, hiddenCleared, forfeit = false, afterClear = false) {
  const rule = rules[difficulty];
  if (forfeit || !victory && !afterClear) return -rule.loss;
  return (rule.win + (hiddenCleared && !afterClear ? rule.hidden : 0)) / (mode === 'coop' ? 2 : 1);
}
