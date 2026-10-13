const form = document.getElementById('login-form');
const button = document.getElementById('login-submit');
const error = document.getElementById('login-error');

// Restore only game or account pages, including room links. Never redirect to another host.
export function safeNext(value, app = false) {
  if (typeof value !== 'string' || /[\\\u0000-\u0020\u007f]/.test(value)) return '/';
  try {
    const url = new URL(value, 'https://local.invalid');
    const allowed = app ? ['/', '/index.html'] : ['/', '/index.html', '/admin', '/account'];
    if (url.origin !== 'https://local.invalid' || !allowed.includes(url.pathname)) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  button.disabled = true;
  button.textContent = '正在登录…';
  error.textContent = '';
  try {
    const response = await fetch('/auth/login', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.elements.username.value.trim(), password: form.elements.password.value }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || '登录失败，请重试');
    form.elements.password.value = '';
    const next = new URLSearchParams(location.search).get('next');
    const destination = body.app ? safeNext(next, true) : (body.role === 'admin' ? '/admin' : '/account');
    location.replace(destination);
  } catch (err) {
    error.textContent = err instanceof TypeError ? '网络连接失败，请稍后重试' : err.message;
  } finally { button.disabled = false; button.textContent = '登录并进入'; }
});

if (new URLSearchParams(location.search).get('passwordChanged') === '1') {
  document.getElementById('login-info').textContent = '密码已修改，请使用新密码重新登录。';
}
