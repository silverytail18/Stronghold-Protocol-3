import {OfflineRuntime} from './runtime.js';
import {setData,deepFreeze} from './engine/server/data.js';
const names=['config','chess','bonds','garrisons','items','bands','effects','choices','enemies','factions','waves','stages','bosses','tokens','assets'];
try {
  const data=deepFreeze(Object.fromEntries(await Promise.all(names.map(async name=>{
    const response=await fetch('/data/'+name+'.json');
    if(!response.ok)throw new Error('本地数据缺失：'+name);
    return [name,await response.json()];
  }))));
  setData(data);
  const runtime=new OfflineRuntime(data,message=>postMessage({message}));
  onmessage=event=>{if(event.data.suspend)runtime.suspend();else runtime.receive(event.data.message);};
  postMessage({ready:true});
} catch(error) {postMessage({fatal:error.message});}
