import {t, N_} from '/shared/i18n.js';

export async function renderModeAdmin({content, api, node, button, panel, status}) {
  const policy = await api('/auth/admin/gameplay-modes');
  if (!content.isConnected) return;
  const checks = new Map(), list = node('div', {class: 'gameplay-admin-list'});
  for (const mode of policy.modes) {
    const check = node('input', {type: 'checkbox', checked: mode.enabled, 'data-mode-toggle': mode.id});
    checks.set(mode.id, check);
    list.append(node('section', {class: 'gameplay-admin-card'},
      node('label', {class: 'gameplay-admin-toggle'}, check, node('strong', {}, t(mode.name)), node('span', {class: 'account-badge'}, mode.enabled ? t('已开放') : t('未开放'))),
      node('p', {}, t(mode.description)), node('ul', {}, mode.rules.map(rule => node('li', {}, t(rule))))));
  }
  const save = button(N_('保存玩法开放设置'), async () => {
    save.disabled = true; for (const check of checks.values()) check.disabled = true;
    try {
      await api('/auth/admin/gameplay-modes', {method: 'PUT', body: JSON.stringify({revision: policy.revision, modes: [...checks].map(([id, check]) => ({id, enabled: check.checked}))})});
      status(t('玩法开放设置已保存'));
      await renderModeAdmin({content, api, node, button, panel, status});
    } catch (error) {status(error.message, true);}
    finally {save.disabled = false; for (const check of checks.values()) check.disabled = false;}
  }, true);
  save.dataset.action = 'save-gameplay-modes';
  content.replaceChildren(panel(N_('玩法开放'),
    node('p', {}, t('在玩法大厅中管理独立玩法。关闭后禁止创建、加入待开局房间和开始新对局；进行中的对局与原成员重连不受影响。')),
    list, node('div', {class: 'account-actions'}, save, button(N_('刷新'), () => renderModeAdmin({content, api, node, button, panel, status}).catch(error => status(error.message, true))))));
}
