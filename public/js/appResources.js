// App-only HTTP disk caching, compatible with a plain HTTP server. Browsers keep revalidation.
let current = null, pending = null;
const artPath = /^\/(assets|fonts|icons)\/[^?#]+\.(?:png|jpe?g|gif|webp|avif|svg|ico|skel|atlas|mp3|ogg|oga|opus|wav|m4a|aac|woff2?|otf|ttf|bin|obj|mtl|json|css|txt)$/i;
export function appArtUrl(url, state = current) {
  return state && /^[a-f0-9]{64}$/.test(state.art) && typeof url==='string' && artPath.test(url)
    ? `/app-cache/${state.art}${url}` : url;
}
export function appArtPaths(value, state = current) {
  if(!state)return value;
  if(typeof value==='string')return appArtUrl(value,state);
  if(Array.isArray(value))return value.map(v=>appArtPaths(v,state));
  if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,appArtPaths(v,state)]));
  return value;
}
async function check() {
  if(pending)return pending;
  pending=(async()=>{
    const response=await fetch('/app/resource-manifest',{credentials:'same-origin',cache:'no-store'});
    if(!response.ok)throw new Error('资源版本检查失败');
    const state=await response.json();
    if(state.version!==1 || !/^[a-f0-9]{64}$/.test(state.art) || !/^[a-f0-9]{64}$/.test(state.revision))throw new Error('资源版本信息无效');
    return state;
  })().finally(()=>{pending=null;});
  return pending;
}
export async function initAppResources() {
  try{current=await check();}
  catch(error){console.warn('[app-cache] 使用原有资源校验方式',error.message);current=null;}
  if(current && typeof current.installedPack==='string' && current.installedPack!==current.resourcePack?.version){
    location.reload();throw new Error('资源包已更新，正在准备本地数据。');
  }
}
// Manual App refresh also revalidates code and rule data when the art version is unchanged.
// Keep the running page's version until reload; never mix new art with old game data.
export async function refreshAppResources(store) {
  const assertIdle = () => {
    if (store.get().room?.inMatch) throw new Error('请在对局结束后回到大厅更新数据。');
  };
  assertIdle();
  try { await check(); }
  catch { throw new Error('无法读取服务器更新，请检查网络后点击重试。'); }
  // A match may have started while the version request was in flight.
  assertIdle();
  location.reload();
}
export function appendAppUpdateControl(panel, store) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '从服务器更新数据';
  button.title = '检查服务器版本并刷新游戏数据；保留登录和已有成绩';
  const status = document.createElement('span');
  status.className = 'auth-account__update-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = '正在检查更新…';
    status.hidden = false;
    status.textContent = '正在连接服务器，读取最新版本…';
    try { await refreshAppResources(store); }
    catch (error) {
      status.textContent = error.message;
      button.disabled = false;
      button.textContent = '从服务器更新数据';
    }
  });
  panel.append(button, status);
}
export async function ensureAppResourcesCurrent() {
  if(!current)return true;
  let latest;
  try{latest=await check();}
  catch{throw new Error('无法检查服务器资源版本，请检查网络后重试。');}
  if(latest.revision===current.revision && (typeof latest.installedPack!=='string' || latest.installedPack===latest.resourcePack?.version))return true;
  // Reload the whole page before sending an opening intent; refresh code, game data and art together.
  location.reload();
  return false;
}
export function installAppResourceGuard(net, store) {
  if(!current)return;
  const request=net.request.bind(net);
  net.request=async(t,...args)=>{
    if(['room.create','room.join','room.start'].includes(t) && !await ensureAppResourcesCurrent())throw new Error('服务器资源已更新，正在刷新，请重新进入模拟。');
    return request(t,...args);
  };
  const refresh=()=>{
    if(!document.hidden && !store.get().room?.inMatch)ensureAppResourcesCurrent().catch(()=>{});
  };
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',refresh);
}
