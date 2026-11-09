import { t, N_ } from '/shared/i18n.js';

export async function renderAppealAdmin({ content, api, node, button, panel, status }) {
  const data = await api('/auth/admin/match-appeals');
  const list = node('div', { class: 'appeal-admin-list' });
  if (!data.appeals.length) list.append(node('p', {}, t('暂无申诉')));
  for (const appeal of data.appeals) {
    const pending = appeal.status === 'pending';
    const decide = async (action) => {
      const note = pending && action === 'reject' ? (globalThis.prompt?.(t('驳回原因（可选）')) || '') : '';
      try {
        await api(`/auth/admin/match-appeals/${encodeURIComponent(appeal.id)}`, {
          method: 'POST',
          body: JSON.stringify({ action, note }),
        });
        status(t('申诉已处理'));
        await renderAppealAdmin({ content, api, node, button, panel, status });
      } catch (error) { status(error.message, true); }
    };
    list.append(node('article', { class: `appeal-admin-card is-${appeal.status}` },
      node('header', null,
        node('div', null,
          node('b', null, appeal.nickname || appeal.account_id),
          node('small', null, `#${appeal.public_no || '—'} · ${appeal.mode || '—'} · ${appeal.difficulty || '—'} · ${appeal.record_id}`)),
        node('span', { class: 'appeal-admin-state' }, t(appeal.status === 'pending' ? '待处理' : appeal.status === 'approved' ? '已通过' : '已驳回'))),
      node('p', { class: 'appeal-admin-reason' }, appeal.reason),
      node('footer', null,
        node('small', null, new Date(appeal.created_at).toLocaleString()),
        pending ? node('div', { class: 'account-actions' },
          button(t('通过'), () => decide('approve'), true),
          button(t('驳回'), () => decide('reject'))) : null)));
  }
  content.replaceChildren(panel(N_('对局申诉'), node('p', { class: 'emote-admin-hint' }, t('通过后，该局只从该玩家的统计中排除，对局记录仍保留。')), list));
}
