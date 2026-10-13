import { useEffect, useState } from '../../vendor/hooks.module.js';
import { html, Button, Modal } from './components.js';
import { UnitThumb, BandIcon } from './gameComponents.js';
import { RankBadge } from './rankBadge.js';
import { useStore } from '../store.js';
import { rankApi } from './ranked.js';
import { DIFFICULTY_NAMES } from '../../../shared/constants.js';
import {appArtPaths} from '../appResources.js';
import { data, useData } from '../data.js';

const when = at => at ? new Date(at).toLocaleString() : '尚未结束';
const duration = r => r.ended_at ? `${Math.floor((r.ended_at - r.started_at) / 60000)} 分 ${Math.floor((r.ended_at - r.started_at) / 1000) % 60} 秒` : '进行中';
const outcome = r => r.ranked_status === 'void' || r.status === 'interrupted' ? '无效 / 中断' : r.status === 'running' ? '进行中' : r.score_reason === 'abandoned' ? '主动放弃' : r.victory ? '胜利' : '失败';
const STAT_NAMES = { dmgDealt: '造成伤害', kills: '击败敌人', leaks: '漏过敌人', gold: '花费资金', refreshes: '刷新次数', merges: '合成次数', itemsEquipped: '装备次数', bossDamage: '首领伤害', activatedLayers: '激活层数', lpLost: '损失生命', perfectRounds: '完美回合' };

export function MatchRecordsButton() {
  const enabled = useStore(s => s.ranked?.enabled);
  const [open, setOpen] = useState(false);
  return enabled ? html`<${Button} variant="secondary" size="sm" class="lobby-records" onClick=${() => setOpen(true)}>对局记录<//><${MatchRecords} open=${open} onClose=${() => setOpen(false)} />` : null;
}
export function MatchRecords({ open, onClose }) {
  const seasonId = useStore(s => s.ranked?.season?.id);
  const [mode, setMode] = useState(''), [kind, setKind] = useState(''), [page, setPage] = useState(0);
  const [value, setValue] = useState(null), [id, setId] = useState(null), [detail, setDetail] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setPage(0); setId(null); } }, [open, seasonId]);
  useEffect(() => {
    if (!open) return;
    let live = true; setBusy(true); setError(''); setValue(null);
    rankApi(`/ranked/records?page=${page}&mode=${mode}&kind=${kind}`).then(v => { if (live) setValue(v); }).catch(e => { if (live) setError(e.message); }).finally(() => { if (live) setBusy(false); });
    return () => { live = false; };
  }, [open, page, mode, kind, seasonId]);
  useEffect(() => {
    setDetail(null); if (!open || !id) return;
    let live = true; setError('');
    rankApi(`/ranked/records/${encodeURIComponent(id)}`).then(v => { if (live) setDetail(v); }).catch(e => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [open, id]);
  return html`<${Modal} open=${open} onClose=${onClose} title="对局记录" micro="BATTLE RECORD · ACCOUNT" class="records-modal" width="min(760px, calc(100vw - 32px))" actions=${html`<${Button} variant="secondary" onClick=${onClose}>返回模拟<//>`}>
    <div class="records"><header><b>${value?.season?.name || '本赛季'}</b><span>我的对局 · 与账号绑定 · ${value?.total ?? '…'} 场</span></header>
    ${id ? html`<button class="records__back" onClick=${() => { setId(null); setError(''); }}>‹ 返回本赛季列表</button>` : html`<div class="records__filters"><label>模拟方式 <select value=${mode} onChange=${e => { setMode(e.target.value); setPage(0); }}><option value="">全部</option><option value="solo">单人</option><option value="coop">同盟</option></select></label><label>赛制 <select value=${kind} onChange=${e => { setKind(e.target.value); setPage(0); }}><option value="">全部</option><option value="ranked">排位赛</option><option value="normal">普通赛</option></select></label></div>`}
    ${error ? html`<p role="alert" class="t-orange">${error}</p>` : null}
    ${id ? detail ? html`<${RecordDetail} record=${detail} />` : !error ? html`<p>正在读取对局详情…</p>` : null : busy ? html`<p>正在读取战绩…</p>` : html`<div class="records__list">${value?.rows?.map(r => html`<button key=${r.id} class=${`records__row ${r.victory ? 'is-victory' : ''}`} onClick=${() => setId(r.id)}>
      <b>${outcome(r)}</b><div><strong>${r.mode === 'coop' ? '同盟' : '单人'} · ${DIFFICULTY_NAMES[r.difficulty]} <small>${r.ranked ? '排位赛' : '普通赛'}</small></strong><span>${when(r.started_at)} · ${duration(r)} · ${r.roundsPassed} 回合${r.hidden ? ' · 隐秘核心通关' : ''}</span></div>
      <span class="records__delta">${r.ranked_status === 'void' || r.status === 'interrupted' ? '不计分' : r.after_points != null ? `${r.after_points - r.before_points >= 0 ? '+' : ''}${r.after_points - r.before_points} 分` : r.ranked ? '待结算' : '查看详情'} ›</span></button>`)}${!value?.rows?.length ? html`<p class="t-lo">本赛季还没有符合筛选条件的对局。完成模拟后可在这里查看阵容和作战数据。</p>` : null}</div>`}
    ${!id && value ? html`<div class="rank-pagination"><button disabled=${page === 0 || busy} onClick=${() => setPage(p => p - 1)}>上一页</button><span>第 ${page + 1} 页 · ${value.total} 场</span><button disabled=${(page + 1) * 20 >= value.total || busy} onClick=${() => setPage(p => p + 1)}>下一页</button></div>` : null}</div>
  <//>`;
}
export function RecordDetail({ record: r }) {
  const ready=useData('chess','items','bands','bonds','config','assets','garrisons');
  const [catalog,setCatalog]=useState(null),[catalogError,setCatalogError]=useState('');
  useEffect(()=>{if(!ready)return;let live=true;setCatalog(null);setCatalogError('');const base=Object.fromEntries(['chess','items','bands','bonds','assets','garrisons'].map(k=>[k,data.baseline(k)]));import('/sim/content/expansion/record-catalog.js').then(({buildRecordCatalog})=>{if(live)setCatalog(appArtPaths(buildRecordCatalog(base,r.summary?.content)));}).catch(e=>{if(live)setCatalogError(e.message);});return()=>{live=false;};},[ready,r]);
  if(catalogError)return html`<p role="alert">对局内容载入失败：${catalogError}</p>`;
  if(!catalog)return html`<p>正在载入对局内容…</p>`;
  const lookup=(kind,id)=>catalog[kind]?.[id];
  const s = r.summary, ranking = r.ranking;
  const players = [...(s?.players || [])].sort((a,b) => +(b.playerId === r.player_id) - +(a.playerId === r.player_id));
  return html`<section class="record-detail"><div class="record-detail__meta"><b>${r.mode === 'coop' ? '同盟' : '单人'} · ${DIFFICULTY_NAMES[r.difficulty]} · ${r.ranked ? '排位赛' : '普通赛'}</b><span>${when(r.started_at)} · ${duration(r)}</span><span>主线 ${s?.roundsPassed || 0} 回合 · ${s?.hiddenCleared ? '隐秘核心通关' : '未通关隐秘核心'}</span></div>
    ${s?.testRules?.batches?.length?html`<p class="t-lo">测试内容：${s.testRules.batches.map(b=>b.name||b.id).join(' · ')}</p>`:null}
    ${ranking ? html`<div class="record-detail__score">${ranking.status === 'void' ? `本局不计分：${ranking.void_reason}` : ranking.after_points != null ? html`<${RankBadge} points=${ranking.after_points} large=${true} /><b>${ranking.victory ? '胜利' : ranking.reason === 'abandoned' ? '主动放弃' : '失败'} · ${ranking.after_points - ranking.before_points >= 0 ? '+' : ''}${ranking.after_points - ranking.before_points} 分</b><span>${ranking.before_points} → ${ranking.after_points}</span>` : '积分结算中'}</div>` : html`<p>${r.status === 'interrupted' ? '对局中断，没有可靠最终结果' : r.status === 'running' ? '对局尚在进行' : s?.victory ? '团队胜利' : '团队失败'}</p>`}
    ${players.map(p => html`<article class=${`record-player${p.playerId === r.player_id ? ' is-self' : ''}`} key=${p.playerId}><header><${BandIcon} manifest=${catalog.assets} record=${lookup('bands',p.bandId)} bandId=${p.bandId} size="sm" /><${RankBadge} rank=${p.rank} /><b>${p.name}</b><small>${p.playerId === r.player_id ? '你' : p.isBot ? 'AI' : '同盟队友'}${p.left ? ' · 已离开' : ''} · 剩余生命 ${p.lp ?? 0}</small></header>
      <p class="t-lo">策略：${lookup('bands',p.bandId)?.name||p.bandId||'未选择'}</p>
      <div class="record-player__lineup">${p.lineup?.map((u,i) => html`<div key=${i} title=${lookup('chess', u.id)?.name || u.id}><${UnitThumb} manifest=${catalog.assets} record=${lookup('chess',u.id)} id=${u.id} golden=${u.golden} tier=${u.tier} size="sm" /><span>${lookup('chess', u.id)?.name || u.id}</span><small>${(u.items || []).map(id => lookup('items', id)?.name || id).join(' / ') || '无装备'}</small></div>`)}</div>
      <dl class="record-player__stats">${Object.entries(STAT_NAMES).map(([key,label]) => html`<div key=${key}><dt>${label}</dt><dd>${Math.round(Number(p.stats?.[key]) || 0).toLocaleString()}</dd></div>`)}</dl>
      ${p.bonds?.length ? html`<p class="t-lo">羁绊：${p.bonds.map(b => `${b.name || lookup('bonds', b.bondId)?.name || b.bondId || b.id || '未知羁绊'}${b.layers ? `（${b.layers}层）` : ''}`).join(' · ')}</p>` : null}${p.title ? html`<p class="t-mint">作战称号：${p.title.name || p.title.text || data.get('config')?.titles?.find(t => t.id === (p.title.id || p.title))?.name || p.title.id || (typeof p.title === 'string' ? p.title : '作战记录')}</p>` : null}
    </article>`)}</section>`;
}
