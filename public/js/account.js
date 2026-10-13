import {renderAdminTestControls,readAdminTestControls} from './adminTestControls.js';
import { initRankedAdmin } from './ranked-admin.js';
const byId = (id) => document.getElementById(id);
let state;
let resetTarget;
let deleteTarget;
const login = (changed = false) => location.replace(`/login?next=${encodeURIComponent(location.pathname)}${changed ? '&passwordChanged=1' : ''}`);

function message(id, text, kind = '') {
  const element = byId(id);
  element.textContent = text;
  element.className = `message ${kind}`;
}

async function api(route, method = 'GET', body) {
  const response = await fetch(route, { method, credentials: 'same-origin', cache: 'no-store',
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  let result;
  try { result = await response.json(); } catch { throw new Error('账号服务暂时不可用，请稍后重试'); }
  if (!response.ok) {
    if (response.status === 401 && route !== '/auth/password') login();
    throw new Error(result.error || '操作失败，请重试');
  }
  return result;
}

function busy(form, value) {
  for (const button of form.querySelectorAll('button')) button.disabled = value;
}

function action(label, onClick, danger = false) {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = label; button.className = danger ? 'danger' : 'secondary';
  button.addEventListener('click', onClick);
  return button;
}

function badge(text, kind = '') {
  const element = document.createElement('span'); element.className = `badge ${kind}`; element.textContent = text; return element;
}

async function loadUsers() {
  const { users } = await api('/auth/admin/users');
  const list = byId('user-list');
  list.replaceChildren();
  byId('user-count').textContent = String(users.length);
  for (const user of users) {
    const row = document.createElement('tr');
    const name = document.createElement('td'); const role = document.createElement('td');
    const status = document.createElement('td'); const operations = document.createElement('td');
    const label = document.createElement('span'); label.className = 'user-name'; label.textContent = user.username; name.append(label);
    role.textContent = user.role === 'admin' ? '管理员' : '普通用户';
    status.append(badge(user.disabled ? '已禁用' : '已启用', user.disabled ? 'disabled' : ''));
    if (user.mustChangePassword) { status.append(document.createElement('br'), badge('待修改密码', 'initial')); }
    if (user.username === state.username) {
      const self = document.createElement('span'); self.textContent = '当前账号'; self.className = 'self-label'; name.append(self);
      operations.textContent = '使用修改密码表单';
    } else {
      const actions = document.createElement('div'); actions.className = 'row-actions';
      actions.append(action('重置密码', () => {
        resetTarget = user.username; byId('reset-password').reset(); message('reset-status', '');
        byId('reset-target').textContent = `账号：${user.username}`; byId('reset-dialog').showModal();
      }));
      actions.append(action(user.disabled ? '启用' : '禁用', async (event) => {
        const button = event.currentTarget; button.disabled = true;
        try { await api(`/auth/admin/users/${encodeURIComponent(user.username)}`, 'PATCH', { disabled: !user.disabled }); await loadUsers(); message('page-status', `账号 ${user.username} 已${user.disabled ? '启用' : '禁用'}`, 'success'); }
        catch (err) { message('page-status', err.message, 'error'); button.disabled = false; }
      }));
      actions.append(action(user.role === 'admin' ? '设为用户' : '设为管理员', async (event) => {
        const button = event.currentTarget; button.disabled = true;
        try { await api(`/auth/admin/users/${encodeURIComponent(user.username)}`, 'PATCH', { role: user.role === 'admin' ? 'user' : 'admin' }); await loadUsers(); message('page-status', `账号 ${user.username} 的角色已更新`, 'success'); }
        catch (err) { message('page-status', err.message, 'error'); button.disabled = false; }
      }));
      actions.append(action('删除', () => {
        deleteTarget = user.username; message('delete-status', '');
        byId('delete-target').textContent = `确定删除账号「${user.username}」？`; byId('delete-dialog').showModal();
      }, true));
      operations.append(actions);
    }
    row.append(name, role, status, operations); list.append(row);
  }
}

let testAccess;
function renderTestAccess(result) {
  testAccess=result;
  renderAdminTestControls(byId('admin-test-controls-list'),result.adminControls);
  const list=byId('test-access-list');list.replaceChildren();
  for(const item of result.items){
    const label=document.createElement('label');label.className='test-access-option';
    const input=document.createElement('input');input.type='checkbox';input.dataset.testId=item.id;input.checked=item.public;input.disabled=item.status!=='ready';
    const text=document.createElement('span'),name=document.createElement('strong'),description=document.createElement('span');
    name.textContent=(item.group?item.group+' · ':'')+item.name;description.textContent=item.description+(item.status==='ready'?'':'（尚不可启用）');
    text.append(name,description);label.append(input,text);list.append(label);
  }
}
async function loadTestAccess(){renderTestAccess(await api('/auth/admin/test-content'));message('test-access-status','已读取服务器开放设置。');}
byId('refresh-test-access').addEventListener('click',()=>loadTestAccess().catch(err=>message('test-access-status',err.message,'error')));
byId('test-access-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!testAccess)return;
  const form=event.currentTarget;busy(form,true);byId('refresh-test-access').disabled=true;
  const publicIds=[...form.querySelectorAll('input[data-test-id]:checked:not(:disabled)')].map(input=>input.dataset.testId);
  message('test-access-status','正在保存…');
  try{renderTestAccess(await api('/auth/admin/test-content','PUT',{revision:testAccess.revision,catalog:testAccess.catalog,publicIds,adminControls:readAdminTestControls(byId('admin-test-controls-list'))}));message('test-access-status','已保存；测试开放用于后续开局，管理员工具立即生效。','success');}
  catch(err){message('test-access-status',err.message,'error');}
  finally{busy(form,false);byId('refresh-test-access').disabled=false;}
});

byId('change-password').addEventListener('submit', async (event) => {
  event.preventDefault(); const form = event.currentTarget;
  if (form.elements.newPassword.value !== form.elements.confirmPassword.value) { message('password-status', '两次新密码不一致', 'error'); return; }
  busy(form, true); message('password-status', '正在保存…');
  try {
    await api('/auth/password', 'POST', { currentPassword: form.elements.currentPassword.value, newPassword: form.elements.newPassword.value });
    form.reset(); login(true);
  } catch (err) { message('password-status', err.message, 'error'); }
  finally { busy(form, false); }
});

byId('create-user').addEventListener('submit', async (event) => {
  event.preventDefault(); const form = event.currentTarget; const username = form.elements.username.value.trim();
  busy(form, true); message('create-status', '正在创建…');
  try {
    await api('/auth/admin/users', 'POST', { username, password: form.elements.password.value, role: form.elements.role.value });
    form.reset(); byId('create-panel').open = false; message('create-status', '');
    await loadUsers(); message('page-status', `账号 ${username} 已创建，首次登录需要修改密码`, 'success');
  } catch (err) { message('create-status', err.message, 'error'); }
  finally { busy(form, false); }
});

byId('reset-password').addEventListener('submit', async (event) => {
  event.preventDefault(); const form = event.currentTarget;
  if (form.elements.password.value !== form.elements.confirmPassword.value) { message('reset-status', '两次密码不一致', 'error'); return; }
  busy(form, true); message('reset-status', '正在重置…');
  try {
    await api(`/auth/admin/users/${encodeURIComponent(resetTarget)}`, 'PATCH', { password: form.elements.password.value });
    form.reset(); byId('reset-dialog').close(); await loadUsers(); message('page-status', `账号 ${resetTarget} 的密码已重置`, 'success');
  } catch (err) { message('reset-status', err.message, 'error'); }
  finally { busy(form, false); }
});

byId('delete-user').addEventListener('submit', async (event) => {
  event.preventDefault(); const form = event.currentTarget; busy(form, true); message('delete-status', '正在删除…');
  try {
    await api(`/auth/admin/users/${encodeURIComponent(deleteTarget)}`, 'DELETE');
    byId('delete-dialog').close(); await loadUsers(); message('page-status', `账号 ${deleteTarget} 已删除`, 'success');
  } catch (err) { message('delete-status', err.message, 'error'); }
  finally { busy(form, false); }
});

for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => byId(button.dataset.close).close());
byId('refresh-users').addEventListener('click', () => loadUsers().catch((err) => message('page-status', err.message, 'error')));
byId('logout').addEventListener('click', async () => {
  const button = byId('logout'); button.disabled = true;
  try { await api('/auth/logout', 'POST'); login(); }
  catch (err) { message('page-status', err.message, 'error'); button.disabled = false; }
});

async function init() {
  state = await api('/auth/session');
  if (!state.enabled || !state.authenticated) { login(); return; }
  byId('account-name').textContent = `${state.username} · ${state.role === 'admin' ? '管理员' : '普通用户'}`;
  byId('page-title').textContent = state.role === 'admin' ? '账号管理' : '我的账号';
  document.title = `${byId('page-title').textContent} · 卫戍协议：盟约`;
  byId('initial-notice').hidden = !state.mustChangePassword;
  document.querySelector('.layout').classList.toggle('single-account', state.mustChangePassword || state.role !== 'admin');
  message('page-status', state.mustChangePassword ? '请先完成密码修改。' : '');
  if (state.role === 'admin' && !state.mustChangePassword) { byId('users-section').hidden = false; byId('test-access-section').hidden=false; await loadUsers(); await loadTestAccess(); await initRankedAdmin(); }
  const check = async () => {
    try {
      const current = await api('/auth/session');
      if (!current.authenticated) login();
      else if (current.role !== state.role || current.mustChangePassword !== state.mustChangePassword) location.reload();
    } catch { /* keep the page during transient network failures */ }
  };
  window.addEventListener('focus', check);
  setInterval(check, 30_000);
}
init().catch((err) => message('page-status', err.message, 'error'));
