import { useEffect, useState } from '../../vendor/hooks.module.js';
import { html, Button, Modal } from './components.js';
import { store, useStore } from '../store.js';
import { net } from '../net.js';
import { rankOf, RANK_RULES, rankedDifficultyAllowed } from '../../../shared/ranked.js';
import { DIFFICULTY_NAMES } from '../../../shared/constants.js';
import { RankBadge } from './rankBadge.js';

export async function rankApi(url, body) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '读取排位数据失败');
  return result;
}
let installed = false;
export function installRankedSync() {
  if (installed) return; installed = true;
  let reading = false, profileRevision = 0;
  const refresh = async () => {
    if (reading) return; reading = true;
    const revision = profileRevision;
    try { const profile = await rankApi('/ranked/profile'); if (revision === profileRevision) store.set({ ranked: profile }); }
    catch (e) { if (!store.get().ranked) store.set({ ranked: { enabled: false, error: e.message } }); }
    finally { reading = false; }
  };
  net.on('welcome', refresh);
  net.on('rank.profile', ({ t, ...profile }) => { profileRevision++; store.set({ ranked: profile }); });
  net.on('rank.result', ({ t, ...result }) => {
    store.set({ rankedResult: result });
    const current = store.get().match.result;
    if (current?.ranking?.matchId === result.matchId) store.patch('match', { result: { ...current, ranking: result } });
    refresh();
  });
  window.addEventListener('focus', refresh);
  setInterval(() => { if (!document.hidden && !store.get().room?.inMatch) refresh(); }, 15000);
}

export function RankedSelector({ mode, difficulty, checked = false, onChange, room = false, disabled = false }) {
  const profile = useStore(s => s.ranked);
  const [open, setOpen] = useState(false);
  const rank = profile?.rank || rankOf(0), season = profile?.season;
  const rule = (season?.rules || RANK_RULES)[difficulty];
  const reason = !profile ? '正在读取段位…' : !profile.enabled ? profile.error || '排位未启用'
    : !season ? '等待新赛季开启' : season.state !== 'active' ? '赛季收尾中，暂停新排位' : season.paused ? '管理员已暂停新排位'
    : profile.pending ? '排位结算待恢复' : mode !== 'coop' && profile.cooldownUntil > Date.now() ? `单人排位冷却：${Math.ceil((profile.cooldownUntil - Date.now()) / 60000)} 分钟；仍可参加多人排位`
    : !rankedDifficultyAllowed(rank.points, difficulty) ? difficulty === 'FUNNY' ? '标准模拟不计排位' : rank.points >= 1200 ? '钻石及以上须选择终极' : '黄金及以上须选择绝境或终极' : '';
  return html`<div class=${`rank-select${checked ? ' is-ranked' : ''}`}><div class="rank-select__top">
    <label class="rank-select__check"><input type="checkbox" checked=${checked} disabled=${disabled || !onChange || !!reason && !checked} onChange=${e => onChange?.(e.target.checked)} /><span>${room ? '本房间排位赛' : '开启排位赛'}</span></label>
    <button type="button" class="rank-select__badge" onClick=${() => setOpen(true)} aria-label="查看段位、排行榜和排位规则">${rank.label} · ${rank.points} 分 ⓘ</button></div>
    <div class="rank-select__meta"><span>RANKED · ${season?.name || '统一段位'}</span><span>${rank.next ? `距 ${rankOf(rank.next).label}：${rank.next - rank.points} 分` : '传奇 · 挑战赛季总榜'}</span></div>
    <p class="rank-select__hint">${reason || `${mode === 'coop' ? '同盟全员' : '单人'}胜利 +${rule.win / (mode === 'coop' ? 2 : 1)} / 失败 −${rule.loss}${mode === 'coop' ? ' · 仅限 2–4 名真人' : ''}`}</p>
    <${RankedPanel} open=${open} onClose=${() => setOpen(false)} />
  </div>`;
}

function RankedPanel({ open, onClose }) {
  const profile = useStore(s => s.ranked);
  const [tab, setTab] = useState('board'), [seasons, setSeasons] = useState([]), [seasonId, setSeasonId] = useState('');
  const [mode, setMode] = useState(''), [page, setPage] = useState(0), [data, setData] = useState(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open || !profile?.enabled) return;
    let live = true;
    rankApi('/ranked/seasons').then(result => { if (live) { setSeasons(result.seasons); setSeasonId(id => id || result.seasons[0]?.id || ''); } }).catch(e => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [open, profile?.season?.id]);
  useEffect(() => {
    if (!open || tab === 'rules' || !profile?.enabled || tab === 'board' && !seasonId) return;
    let live = true; setBusy(true); setError(''); setData(null);
    rankApi(tab === 'board' ? `/ranked/leaderboard?season=${encodeURIComponent(seasonId)}&page=${page}` : `/ranked/history?mode=${mode}&page=${page}`)
      .then(value => { if (live) setData(value); }).catch(e => { if (live) setError(e.message); }).finally(() => { if (live) setBusy(false); });
    return () => { live = false; };
  }, [open, tab, seasonId, mode, page]);
  const switchTab = value => { setTab(value); setPage(0); setData(null); setError(''); };
  return html`<${Modal} open=${open} onClose=${onClose} title="排位中心" micro="RANKED · SEASON RECORD" tone="gold" width="9.5rem" actions=${html`<${Button} variant="secondary" onClick=${onClose}>返回模拟<//>`}>
    <div class="rank-center"><div class="rank-center__summary"><b><${RankBadge} rank=${profile?.rank} />${profile?.rank?.label || '青铜 III'}</b><span>${profile?.points || 0} 分 · 赛季最高 ${profile?.peakRank?.label || '青铜 III'}</span><span>${profile?.games || 0} 场 / ${profile?.wins || 0} 胜 · 单人同盟共用段位</span></div>
    <nav class="rank-tabs" aria-label="排位中心"><button class=${tab === 'board' ? 'active' : ''} onClick=${() => switchTab('board')}>赛季总榜</button><button class=${tab === 'history' ? 'active' : ''} onClick=${() => switchTab('history')}>我的战绩</button><button class=${tab === 'rules' ? 'active' : ''} onClick=${() => switchTab('rules')}>排位规则</button></nav>
    ${tab === 'board' ? html`<label class="rank-filter">查看赛季<select value=${seasonId} onChange=${e => { setSeasonId(e.target.value); setPage(0); }}>${seasons.map(s => html`<option key=${s.id} value=${s.id}>${s.name}${s.state === 'archived' ? ' · 已归档' : ' · 当前'}</option>`)}</select></label>` : null}
    ${tab === 'history' ? html`<label class="rank-filter">对局类型<select value=${mode} onChange=${e => { setMode(e.target.value); setPage(0); }}><option value="">全部</option><option value="solo">单人</option><option value="coop">同盟</option></select></label>` : null}
    ${error ? html`<p class="t-orange" role="alert">${error}</p>` : null}${busy ? html`<p class="t-lo">正在读取…</p>` : null}
    ${tab === 'board' && !busy && data ? html`<div class="rank-table-scroll"><table class="rank-table"><thead><tr><th>名次</th><th>博士</th><th>段位</th><th>积分</th><th>胜场 / 场次</th></tr></thead><tbody>${data.rows.map(r => html`<tr key=${r.public_no}><td>${r.position}</td><td>${r.nickname}<small>#${r.public_no}</small></td><td>${r.rank.label}</td><td>${r.points}</td><td>${r.wins} / ${r.games}</td></tr>`)}</tbody></table>${!data.rows.length ? html`<p class="t-lo">暂无成绩，完成第一场有效排位后即可上榜。</p>` : null}</div>` : null}
    ${tab === 'history' && !busy && data ? html`<div class="rank-history">${data.rows.map(r => html`<article key=${r.match_id} class="rank-history__row"><div><b>${r.status === 'void' ? '已撤销' : r.reason === 'abandoned' ? '主动放弃' : r.victory ? '胜利' : '失败'}</b><span>${r.mode === 'coop' ? '同盟' : '单人'} · ${DIFFICULTY_NAMES[r.difficulty]} · ${r.season}</span><small>${new Date(r.created_at).toLocaleString()}${r.hidden ? ' · 隐秘核心通关' : ''}${r.void_reason ? ` · ${r.void_reason}` : ''}</small></div><div><b>${r.status === 'void' ? '无效' : `${r.after_points - r.before_points >= 0 ? '+' : ''}${r.after_points - r.before_points}`}</b><small>${r.before_points} → ${r.after_points}${r.after_points === 0 && r.nominal < 0 ? ' · 积分下限' : ''}</small></div></article>`)}${!data.rows.length ? html`<p class="t-lo">暂无已结算战绩。</p>` : null}${data.invalid?.map(r => html`<p key=${r.match_id} class="t-lo">无效对局 · ${r.season} · ${r.void_reason}（不计分）</p>`)}</div>` : null}
    ${tab === 'rules' ? html`<div class="rank-rules"><p>每个新赛季从青铜 III、0 分开始。单人和同盟共用一个段位，无定级赛。</p><div class="rank-table-scroll"><table class="rank-table"><thead><tr><th>难度</th><th>单人胜利</th><th>同盟每人</th><th>失败每人</th></tr></thead><tbody>${Object.entries(profile?.season?.rules || RANK_RULES).map(([difficulty, r]) => html`<tr key=${difficulty}><td>${DIFFICULTY_NAMES[difficulty]}</td><td>+${r.win}（核心 +${r.hidden}）</td><td>+${r.win / 2}（核心 +${r.hidden / 2}）</td><td>−${r.loss}</td></tr>`)}</tbody></table></div><p>主线第 14 回合通关视为胜利；隐秘核心失败保留主线胜利分。同盟按团队结果结算，正常淘汰者仍可获得团队胜利分。</p><p>600 分起须挑战绝境或终极；1200 分起须挑战终极。同盟按队伍最高积分选择难度，开局合格即可获得完整胜利分。</p><p>同盟仅限 2–4 名真人，排位禁用 AI 队友，普通玩家不可使用 AI 托管。失败固定扣分，积分最低为 0。</p><p>主线前主动放弃按失败扣分，不领取团队奖励；单人排位在 24 小时内放弃 1 / 2 / 3 次以上，分别冷却 5 / 15 / 30 分钟；多人排位不设置冷却，单人冷却期间仍可参加多人排位。正常淘汰后离开不算放弃。</p><p>断线可在 10 分钟内重连；服务器中断或赛季收尾超时的无效对局不计分。历史战绩与旧赛季段位保留。</p></div>` : null}
    ${tab !== 'rules' && data ? html`<div class="rank-pagination"><button disabled=${page === 0 || busy} onClick=${() => setPage(p => p - 1)}>上一页</button><span>第 ${page + 1} 页 · ${data.total} 条</span><button disabled=${(page + 1) * (tab === 'board' ? 50 : 20) >= data.total || busy} onClick=${() => setPage(p => p + 1)}>下一页</button></div>` : null}
    </div><//>`;
}

export function RankedSettlement({ ranking }) {
  if (!ranking) return null;
  return html`<section class="rank-settlement" aria-label="排位积分结算"><span class="rank-settlement__label">RANKED · ${ranking.seasonName || '赛季排位'}</span>
    ${ranking.pending ? html`<b>排位结算中…</b><p>提交成功后刷新积分，请勿重复开局。</p>` : ranking.void ? html`<b>本局不计分</b><p>${ranking.reason}</p>` : html`<div class="rank-settlement__score"><b class=${ranking.delta >= 0 ? 't-mint' : 't-orange'}>${ranking.delta >= 0 ? '+' : ''}${ranking.delta} 分</b><span>${ranking.before} → ${ranking.after}</span></div><p>${ranking.beforeRank?.label} → <strong>${ranking.afterRank?.label}</strong>${ranking.hidden ? ' · 含隐秘核心奖励' : ''}${ranking.after === 0 && ranking.nominal < 0 ? ` · 已达积分下限（标准扣分 ${-ranking.nominal}）` : ''}</p>`}</section>`;
}
