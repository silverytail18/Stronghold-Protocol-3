// A narrow asynchronous bridge; native hosts accept it only from the selected server origin.
import {t} from '/shared/i18n.js';
let sequence=0;
const pending=new Map();
const progressListeners=new Set();
function answer(event) {let reply=event.data;try{if(typeof reply==='string')reply=JSON.parse(reply);}catch{return;}
  if(reply?.type==='resource-progress'){
    if(typeof reply.label==='string'&&reply.label.length<=256&&Number.isFinite(reply.completed)&&Number.isFinite(reply.total))
      for(const listener of progressListeners)listener(reply);
    return;
  }
  const item=pending.get(reply?.id);if(!item)return;pending.delete(reply.id);clearTimeout(item.timer);if(reply.error)item.reject(Error(reply.error));else item.resolve(reply.result);}
export function onResourceProgress(listener){progressListeners.add(listener);return()=>progressListeners.delete(listener);}
window.chrome?.webview?.addEventListener('message',answer);
window.addEventListener('sp-native-response',answer);
export function nativeRequest(method) {
  return new Promise((resolve,reject)=>{
    const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error(t('客户端操作超时，请重试')));},30*60*1000);
    pending.set(id,{resolve,reject,timer});
    const message={id,method};
    if(window.SPAndroid?.request)window.SPAndroid.request(JSON.stringify(message));
    else if(window.chrome?.webview)window.chrome.webview.postMessage(message);
    else {clearTimeout(timer);pending.delete(id);reject(Error(t('请使用 Android 或 Windows 客户端')));}
  });
}
