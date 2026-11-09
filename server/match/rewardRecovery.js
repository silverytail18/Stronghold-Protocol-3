// Verify a reward by reading only its target after each synchronous layer grant.
export function grantLayersVerified(m, ps, bondId, n, opts, { source, hook }) {
  const before = Number(ps.layers?.[bondId] || 0);
  for (let attempt = 1; attempt <= 2; attempt++) {
    const receipt = { stage: 'unverified' };
    try { ps.addLayers(bondId, n, { ...opts, receipt }); } catch (error) {
      try {
        if (typeof m.dispatcher?._report === 'function') m.dispatcher._report('cyclops', `${source}:${hook}:attempt${attempt}`, error);
        else m.reportError?.(`${source}:${hook}:attempt${attempt}`, error);
      } catch { /* Reporting must not stop bounded recovery. */ }
    }
    const after = Number(ps.layers?.[bondId] || 0);
    if (after > before) return after - before;
    if (attempt === 1 && (receipt.stage === 'preflight' || (receipt.stage === 'unverified' && m.isCyclops))) continue;
    try {
      if (typeof m.toast === 'function') m.toast(ps, 'warn', '盟约层数奖励暂未到账，将在后续结算重试');
      else m.sendTo?.(ps.playerId, { t: 'm.toast', kind: 'warn', text: '盟约层数奖励暂未到账，将在后续结算重试' });
    } catch { /* Recovery feedback is best-effort. */ }
    return 0;
  }
  return 0;
}
