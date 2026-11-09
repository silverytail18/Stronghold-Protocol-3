import { t, N_ } from '/shared/i18n.js';

export async function renderMizukiAdmin({ content, api, node, button, panel, status }) {
  const [state, control] = await Promise.all([api('/auth/admin/mizuki-status'), api('/auth/admin/mizuki-control')]);
  if (!content.isConnected) return;
  let busy = false;
  const refresh = () => renderMizukiAdmin({ content, api, node, button, panel, status }).catch(e => status(e.message, true));
  const accountName = id => control.accounts.find(a => a.accountId === id)?.username || id;
  const confirmation = (label, description, expected, request) => {
    if (busy) return;
    const reason = node('input', { required: 'required', maxlength: '200', 'aria-label': t('管理原因') });
    const confirm = node('input', { required: 'required', autocomplete: 'off', 'aria-label': t('确认目标') });
    const box = node('section', { class: 'panel', 'data-testid': 'mizuki-admin-confirm' }, node('h3', {}, t(label)),
      node('p', {}, description), node('p', {}, t('输入以下目标以确认：{target}', { target: expected })),
      node('label', { class: 'account-field' }, t('管理原因'), reason), node('label', { class: 'account-field' }, t('确认目标'), confirm));
    const submit = button(N_('确认执行'), async () => {
      if (busy || confirm.value !== expected || !reason.value.trim()) { status(t('请填写管理原因并准确输入确认目标'), true); return; }
      busy = true; box.querySelectorAll('button,input').forEach(e => e.disabled = true);
      try {
        await api('/auth/admin/mizuki-control', { method: 'POST', body: JSON.stringify({ ...request, confirm: confirm.value, reason: reason.value.trim() }) });
        status(t('水月管理操作已完成')); await refresh();
      } catch (error) { status(error.message, true); }
      finally { busy = false; if (box.isConnected) box.querySelectorAll('button,input').forEach(e => e.disabled = false); }
    }, true);
    box.append(submit, button('取消', () => { if (!busy) box.remove(); }));
    content.querySelector('[data-testid="mizuki-admin-confirm"]')?.remove();
    content.prepend(box); reason.focus();
  };
  const rooms = node('div', { class: 'account-records' });
  for (const room of control.rooms) {
    const names = room.participants.map(p => accountName(p.accountId)).join('、');
    rooms.append(node('article', {}, node('b', {}, room.code), node('p', {}, `${room.participants.length}/${room.capacity} · ${names}`),
      button('关闭房间并保留存档', () => confirmation('关闭房间并保留存档', t('将关闭该水月房间并停止探索进程，所有成员返回大厅。已保存进度保留；尚未生成检查点的开局会释放游玩状态。'), room.code,
        { action: 'closeRoom', roomCode: room.code, token: room.token, runId: room.runId }))));
  }
  if (!control.rooms.length) rooms.append(node('p', {}, t('当前没有水月房间')));
  const search = node('input', { class: 'account-input', type: 'search', 'aria-label': t('搜索水月玩家或探索'), placeholder: t('搜索水月玩家或探索') });
  const runs = node('div', { class: 'account-records' });
  for (const run of control.runs) {
    const names = run.participants.map(p => p.username).join('、');
    const article = node('article', { 'data-search': `${run.id} ${names}`.toLowerCase() }, node('b', {}, run.id),
      node('p', {}, `${run.status} · N${run.difficultyGrade || 0} · ${names}`), node('small', {}, new Date(run.updatedAt).toLocaleString()),
      node('p', {}, run.rulesVersion === state.rulesVersion ? t('规则版本匹配') : t('规则已变化：原存档需要原版本运行环境')),
      button('删除整次探索存档', () => confirmation('删除整次探索存档', t('将关闭关联房间，删除该次探索的全队存档、历史记录和游玩占用。受影响玩家：{players}。保留各玩家已累计的水月资料。', { players: names }), run.id,
        { action: 'deleteRun', runId: run.id, epoch: run.epoch })));
    runs.append(article);
  }
  if (!control.runs.length) runs.append(node('p', {}, t('尚无探索存档')));
  const accounts = node('div', { class: 'account-records' });
  for (const account of control.accounts) accounts.append(node('article', { 'data-search': `${account.username} ${account.accountId}`.toLowerCase() }, node('b', {}, account.username),
    node('p', {}, t('探索记录 {count} 条 · 活跃探索：{run}', { count: account.runCount, run: account.activeRunId || '—' })),
    button('重置玩家全部水月状态', () => confirmation('重置玩家全部水月状态', t('将删除此玩家的水月评分、细胞、投资和结局进度，清除全部相关探索及房间。共享探索也会删除，同局其他玩家累计资料保留。受影响玩家：{players}。', { players: account.affectedAccounts.map(p => p.username).join('、') || account.username }), account.username,
      { action: 'resetAccount', accountId: account.accountId, token: account.resetToken }))));
  search.addEventListener('input', () => { const value = search.value.trim().toLowerCase(); content.querySelectorAll('[data-search]').forEach(e => e.hidden = !e.dataset.search.includes(value)); });
  const audit = node('div', { class: 'account-records' });
  const actionNames = { closeRoom: t('关闭房间并保留存档'), deleteRun: t('删除整次探索存档'), resetAccount: t('重置玩家全部水月状态') };
  for (const entry of control.audit) audit.append(node('article', {}, node('b', {}, actionNames[entry.action] || entry.action), node('p', {}, `${accountName(entry.actor)} · ${entry.reason}`), node('small', {}, new Date(entry.at).toLocaleString())));
  content.replaceChildren(panel(N_('水月存档管理'), node('p', {}, t('资源：{ready} · 水月进程 {workers}', { ready: state.resourceReady ? t('已验签就绪') : t('尚未安装'), workers: state.workers })),
    node('p', {}, t('删除操作会立即生效并记录审计；多人探索以整局为单位管理。普通账号、排位和其他玩法不受影响。')),
    button('刷新', refresh), search), panel(N_('当前水月房间'), rooms), panel(N_('最近100条探索存档'), runs), panel(N_('玩家水月状态'), accounts), panel(N_('最近50条管理审计'), audit));
}
