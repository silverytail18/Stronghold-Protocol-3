import {nativeRequest,onResourceProgress} from './native.js';
import {clientCompatibility} from '../shared/client-resources.js';
import {t,N_} from '/shared/i18n.js';
// Run from the real server origin: opaque native data documents cannot manage service workers.
try{for(const registration of await navigator.serviceWorker?.getRegistrations?.()||[])await registration.unregister();if(window.caches)for(const key of await caches.keys())await caches.delete(key);}catch{/* Insecure HTTP origins have no service-worker storage. */}
const STATIC=[N_('卫戍协议：盟约'),N_('账号登录'),N_('登录后检查本地资源与兼容更新。'),N_('账号'),N_('密码'),N_('登录并进入'),N_('继续进入'),N_('账号与管理员设置请使用浏览器的账号页面。大版本更新需要安装新客户端。')];
for(const element of document.querySelectorAll('h1,h2,label,button,p'))for(const child of element.childNodes)if(child.nodeType===Node.TEXT_NODE&&STATIC.includes(child.textContent.trim()))child.textContent=t(child.textContent.trim());
const form=document.querySelector('#login'),resume=document.querySelector('#resume'),status=document.querySelector('#status');
const initialPassword=document.querySelector('#initial-password');
function changeInitial(){form.hidden=true;resume.hidden=true;initialPassword.hidden=false;status.textContent=t('请先修改初始密码');}
initialPassword.addEventListener('submit',event=>{event.preventDefault();run(async()=>{
  const fields=new FormData(initialPassword);
  if(fields.get('newPassword')!==fields.get('confirmPassword'))throw Error(t('两次输入的新密码不一致'));
  const response=await fetch('/auth/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:fields.get('currentPassword'),newPassword:fields.get('newPassword')})});
  const body=await response.json();if(!response.ok)throw Error(body.error);
  initialPassword.reset();initialPassword.hidden=true;form.hidden=false;status.textContent=t('密码已修改，请重新登录');
});});
const resource=document.querySelector('#resource-state'),bar=document.querySelector('#resource-progress'),fill=document.querySelector('#resource-fill'),percent=document.querySelector('#resource-percent'),count=document.querySelector('#resource-count');
const RESOURCE_LABELS=[N_('校验本地资源'),N_('校验已更新资源'),N_('检查兼容更新'),N_('核验与更新资源'),N_('下载兼容更新'),N_('资源已就绪')];
bar.setAttribute('aria-label',t('资源校验'));
let busy=false,preparing=false;
function progress(label,completed=-1,total=0){
  status.textContent=label;resource.classList.remove('is-error');resource.setAttribute('aria-busy','true');bar.hidden=false;
  const known=Number.isFinite(total)&&total>0&&Number.isFinite(completed)&&completed>=0;
  bar.classList.toggle('is-indeterminate',!known);
  if(known){const value=Math.max(0,Math.min(100,completed/total*100));fill.style.width=value+'%';bar.setAttribute('aria-valuenow',String(Math.floor(value)));bar.setAttribute('aria-valuetext',`${Math.min(completed,total).toLocaleString()} / ${total.toLocaleString()}`);percent.textContent=Math.floor(value)+'%';count.textContent=`${Math.min(completed,total).toLocaleString()} / ${total.toLocaleString()}`;}
  else{bar.removeAttribute('aria-valuenow');bar.removeAttribute('aria-valuetext');fill.style.removeProperty('width');percent.textContent='';count.textContent='';}
}
onResourceProgress(value=>{if(preparing)progress(RESOURCE_LABELS.includes(value.label)?t(value.label):value.label,value.completed,value.total);});
async function enter() {
  preparing=true;progress(t('正在校验客户端本地资源与更新…'));
  try{
    const result=await nativeRequest('prepare');
    if(result.action==='installer')throw Error(t('服务器已升级到新的大版本或资源代际，请下载并安装新的完整客户端后游玩。'));
    if(result.action!=='ready')throw Error(t('客户端资源尚未就绪'));
    progress(t('资源已就绪'),1,1);location.replace('/');
  }finally{preparing=false;}
}
async function run(fn) {if(busy)return;busy=true;form.querySelector('button').disabled=true;resume.disabled=true;try{await fn();}catch(error){status.textContent=error.message;resource.classList.add('is-error');resource.setAttribute('aria-busy','false');bar.hidden=true;percent.textContent='';count.textContent='';}finally{busy=false;form.querySelector('button').disabled=false;resume.disabled=false;}}
form.addEventListener('submit',event=>{event.preventDefault();run(async()=>{
  const fields=new FormData(form),response=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fields.get('username'),password:fields.get('password'),remember:fields.get('remember')==='on'})});
  const body=await response.json();if(!response.ok)throw Error(body.error||t('登录失败'));form.querySelector('[name=password]').value='';if(body.mustChangePassword){changeInitial();return;}form.hidden=true;resume.hidden=false;await enter();
});});
resume.addEventListener('click',()=>run(enter));
await run(async()=>{
  const own=await nativeRequest('status'),response=await fetch('/product/client.json',{cache:'no-store'}),policy=await response.json();
  if(clientCompatibility(policy,own)==='installer')throw Error(t('此客户端与服务器大版本不兼容，请安装新的完整客户端。'));
  const session=await (await fetch('/auth/session',{cache:'no-store'})).json();
  if(session.authenticated){if(session.mustChangePassword){changeInitial();return;}form.hidden=true;resume.hidden=false;await enter();}else{status.textContent=t('请登录账号。');bar.hidden=true;resource.setAttribute('aria-busy','false');}
});
