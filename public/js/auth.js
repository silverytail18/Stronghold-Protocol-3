// HTTP auth is independent of the game's nickname and reconnect token.
import { initAppResources, appendAppUpdateControl } from './appResources.js';
function mountPanel(panel, store, selectRoute) {
  document.body.append(panel);
  const update = () => { panel.hidden = !['title', 'lobby'].includes(selectRoute(store.get())); };
  store.subscribe(update);
  update();
}
export async function initAuth(net, store, selectRoute) {
  const response = await fetch('/auth/session', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new Error('无法检查登录状态');
  const state = await response.json();
  if (!state.enabled) {
    if (state.app) {
      await initAppResources();
      const panel = document.createElement('aside');
      panel.className = 'auth-account';
      appendAppUpdateControl(panel, store);
      mountPanel(panel, store, selectRoute);
    }
    return true;
  }
  const login = () => {
    net.close();
    location.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
  };
  if (!state.authenticated) { login(); return false; }
  if(state.playAllowed===false){net.close();location.replace(state.role==='admin'?'/admin':'/account');return false;}
  if (state.mustChangePassword) {
    net.close();
    if (state.app) login();
    else location.replace(state.role === 'admin' ? '/admin' : '/account');
    return false;
  }

  if(state.app)await initAppResources();
  const panel = document.createElement('aside');
  panel.className = 'auth-account';
  const name = document.createElement('span');
  name.textContent = `账号：${state.username}`;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '退出登录';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const result = await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!result.ok) throw new Error('退出失败');
      login();
    } catch { button.textContent = '退出失败，点击重试'; button.disabled = false; }
  });
  panel.append(name);
  if (state.app) appendAppUpdateControl(panel, store);
  if (!state.app) {
    const manage = document.createElement('a');
    manage.href = state.role === 'admin' ? '/admin' : '/account';
    manage.textContent = state.role === 'admin' ? '账号管理' : '修改密码';
    panel.append(manage);
  }
  panel.append(button);
  mountPanel(panel, store, selectRoute);

  let checking = false;
  const check = async () => {
    if (checking) return;
    checking = true;
    try {
      const result = await fetch('/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      if (result.ok && !(await result.json()).authenticated) login();
    } catch { /* transient connection failures are handled by the game */ }
    finally { checking = false; }
  };
  net.on('auth-required', login);
  net.on('status', (snapshot) => { if (['closed', 'reconnecting'].includes(snapshot.status)) check(); });
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  return true;
}
