// Browser-only administration. All permissions and rule constraints are enforced again by the server.
const byId = id => document.getElementById(id);
async function api(url, body) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || '赛季操作失败'); return data;
}
const element = (tag, text, cls) => { const node = document.createElement(tag); if (text != null) node.textContent = text; if (cls) node.className = cls; return node; };
const stateNames = { draft: '草稿', active: '进行中', closing: '收尾中', archived: '已归档' };
const difficulties = { NORMAL: '险境', HARD: '绝境', ABYSS: '终极' };
let state, busy = false, timer;
function status(text = '', error = false) { const node = byId('season-status'); node.textContent = text; node.className = `message${error ? ' error' : ''}`; }
async function action(work) {
  if (busy) return; busy = true;
  const buttons = [...byId('seasons-section').querySelectorAll('button')]; buttons.forEach(b => { b.disabled = true; });
  try { await work(); status('操作已保存。'); await refresh(); }
  catch (e) { status(e.message, true); }
  finally { busy = false; buttons.filter(b => b.isConnected).forEach(b => { b.disabled = false; }); renderControls(); }
}
function renderControls() {
  const current = state?.current;
  const paused = byId('pause-ranked');
  paused.disabled = busy || !current || current.state !== 'active';
  paused.textContent = current?.paused ? '恢复新排位' : '暂停新排位';
  byId('rollover-submit').disabled = busy || current?.state === 'closing';
  byId('settings-submit').disabled = busy || !current || current.state !== 'active';
}
async function refresh() {
  state = await api('/auth/admin/ranked');
  const current = state.current;
  byId('season-current').textContent = current ? `${current.name} · ${stateNames[current.state]}${current.paused ? ' · 新排位暂停' : ''}` : '当前没有开放赛季';
  byId('season-summary').textContent = `${state.running.length} 场进行中 / 待结算 · 并发上限 ${state.maxMatches}${current?.ends_at ? ` · 结束时间 ${new Date(current.ends_at).toLocaleString()}` : ''}${current?.close_at ? ` · 收尾截止 ${new Date(current.close_at).toLocaleString()}` : ''}`;
  byId('season-rules').textContent = current ? Object.entries(current.rules).map(([key, r]) => `${difficulties[key]}：单人 +${r.win} / 同盟 +${r.win / 2} / 失败 −${r.loss}；核心 +${r.hidden} / +${r.hidden / 2}`).join('；') : '新赛季全员青铜 III、0 分；单人和同盟共用段位。';
  const selected = byId('next-season').value;
  const options = [element('option', current ? '结束后等待新赛季（暂不开启）' : '请选择要开启的赛季')]; options[0].value = '';
  for (const season of state.seasons.filter(s => s.state === 'draft')) { const option = element('option', `S${season.number} · ${season.name}`); option.value = season.id; options.push(option); }
  byId('next-season').replaceChildren(...options);
  if (options.some(o => o.value === selected)) byId('next-season').value = selected;
  if (!byId('season-settings').contains(document.activeElement)) {
    byId('current-season-name').value = current?.name || '';
    const date = current?.ends_at ? new Date(current.ends_at) : null;
    byId('current-season-end').value = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
    const scheduled = [element('option', '到期后等待新赛季')]; scheduled[0].value = '';
    for (const s of state.seasons.filter(s => s.state === 'draft')) { const option = element('option', s.name); option.value = s.id; scheduled.push(option); }
    byId('scheduled-season').replaceChildren(...scheduled); byId('scheduled-season').value = current?.next_id || '';
  }
  const rows = state.seasons.map(s => {
    const row = element('tr'); row.append(element('td', `S${s.number} · ${s.name}`), element('td', stateNames[s.state]), element('td', s.starts_at ? new Date(s.starts_at).toLocaleString() : '尚未开始'), element('td', s.ends_at ? new Date(s.ends_at).toLocaleString() : '手动结束'), element('td', `修订 ${s.revision}`)); return row;
  }); byId('season-list').replaceChildren(...rows);
  byId('season-matches').replaceChildren(...state.recent.map(m => {
    const row = element('tr'), operations = element('td');
    row.append(element('td', `${m.id.slice(0, 8)} · ${m.mode === 'coop' ? '同盟' : '单人'} · ${difficulties[m.difficulty]}`), element('td', { running: '进行中', pending: '待结算', settled: '已结算', void: '无效' }[m.status]), element('td', m.void_reason || new Date(m.started_at).toLocaleString()));
    if (m.status === 'settled') {
      const button = element('button', '撤销结算', 'danger'); button.type = 'button';
      button.addEventListener('click', () => {
        const reason = window.prompt(`撤销对局 ${m.id} 的原因（成绩将按剩余有效战绩重新计算）：`);
        if (!reason?.trim()) return;
        action(() => api('/auth/admin/ranked/void', { matchId: m.id, reason: reason.trim() }));
      }); operations.append(button);
    } row.append(operations); return row;
  }));
  byId('season-audit').replaceChildren(...state.audit.map(a => element('li', `${new Date(a.created_at).toLocaleString()} · ${a.actor} · ${a.action} · ${a.target}${a.reason ? ' · ' + a.reason : ''}`)));
  renderControls();
}
export async function initRankedAdmin() {
  byId('seasons-section').hidden = false;
  const fields = byId('create-season-rules');
  const defaults = { NORMAL: { win: 30, loss: 20, hidden: 4 }, HARD: { win: 40, loss: 25, hidden: 8 }, ABYSS: { win: 60, loss: 30, hidden: 12 } };
  for (const [key, r] of Object.entries(defaults)) {
    const group = element('fieldset'); group.append(element('legend', difficulties[key]));
    for (const [name, label] of [['win', '单人胜利分（同盟自动减半）'], ['loss', '失败扣分（单人与同盟相同）'], ['hidden', '单人核心奖励（同盟自动减半）']]) {
      const wrapper = element('label', label), input = element('input'); input.type = 'number'; input.id = `season-${key}-${name}`;
      input.min = name === 'hidden' ? '0' : name === 'win' ? '2' : '1'; input.max = '1000'; input.step = name === 'loss' ? '1' : '2'; input.value = r[name]; input.required = true; wrapper.append(input); group.append(wrapper);
    } fields.append(group);
  }
  byId('refresh-seasons').addEventListener('click', () => action(() => refresh()));
  byId('pause-ranked').addEventListener('click', () => action(() => api('/auth/admin/ranked/pause', { paused: !state.current.paused })));
  byId('season-settings').addEventListener('submit', event => {
    event.preventDefault(); const date = byId('current-season-end').value;
    action(() => api('/auth/admin/ranked/settings', { name: byId('current-season-name').value.trim(), endsAt: date ? new Date(date).getTime() : null, nextId: byId('scheduled-season').value || null }));
  });
  byId('create-season').addEventListener('submit', event => {
    event.preventDefault(); const rules = {};
    for (const key of Object.keys(defaults)) rules[key] = Object.fromEntries(['win', 'loss', 'hidden'].map(name => [name, Number(byId(`season-${key}-${name}`).value)]));
    const date = byId('season-end').value;
    action(async () => {
      const result = await api('/auth/admin/ranked/seasons', { name: byId('season-name').value.trim(), endsAt: date ? new Date(date).getTime() : null, rules });
      byId('season-name').value = ''; byId('season-end').value = ''; await refresh(); byId('next-season').value = result.season.id;
    });
  });
  byId('rollover-season').addEventListener('submit', event => {
    event.preventDefault(); const nextId = byId('next-season').value || null;
    if (!state.current && !nextId) { status('请先创建并选择下一赛季。', true); return; }
    const label = nextId ? state.seasons.find(s => s.id === nextId)?.name : '等待新赛季开启';
    if (!window.confirm(`确认${state.current ? '结束当前赛季，最多等待 10 分钟收尾，然后' : ''}开启“${label}”？新赛季所有账号从青铜 III、0 分开始，旧赛季历史保留。`)) return;
    action(() => api('/auth/admin/ranked/rollover', { nextId }));
  });
  try { await refresh(); } catch (e) { status(e.message, true); }
  timer = setInterval(() => { if (!busy && !document.hidden) refresh().catch(e => status(e.message, true)); }, 10000);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
}
