import {nativeRequest} from './native.js';
import {t} from '/shared/i18n.js';
import {clientCompatibility} from '../shared/client-resources.js';
try {
  const capability=await nativeRequest('status');
  const response=await fetch('/product/client.json',{cache:'no-store'});if(!response.ok)throw Error(t('无法获取客户端兼容信息'));
  const policy=await response.json();
  if(clientCompatibility(policy,capability)!=='ready'){location.replace('/product/login.html');}
  else {
    await nativeRequest('enter');
    document.documentElement.classList.add('sp-native-client');
    // Old service workers belong to the previous engine and must not shadow authenticated routes.
    for(const registration of await navigator.serviceWorker?.getRegistrations?.()||[])await registration.unregister();
    if(window.caches)for(const key of await caches.keys())await caches.delete(key);
    await import('/js/main.js');
  }
} catch(error) {const node=document.getElementById('boot-err');if(node)node.textContent=error.message;}
