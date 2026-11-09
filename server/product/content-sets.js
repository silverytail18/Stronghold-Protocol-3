// Audited built-in overlays use upstream content identities, download verification and isolated match hosts.
import {createHash} from 'node:crypto';
import {getData,deepFreeze} from '../data.js';
import {DEFAULT_VERSION} from '../../shared/versions.js';
import {TEST_CONTENT} from '../test-content.js';
import {contentHashOf} from '../../shared/plugins/identity.js';
import {composeProductData} from './content-data.js';
const sha=body=>createHash('sha256').update(body).digest('hex');
export function attachProductContent({lobby,contents,content,versions,product}){
  const sets=new Map(),held=new Map();
  const lookup=cs=>{const key=String(cs),set=sets.get(key.slice(0,16));return set&&(key.length===16||key===set.cs)?set:undefined;};
  const bridge=(name,fn)=>{const original=contents[name]?.bind(contents);contents[name]=(...args)=>fn(original,...args);};
  bridge('get',(old,cs)=>lookup(cs)||old?.(cs));
  bridge('dataOf',(old,cs)=>lookup(cs)?.data||old?.(cs));
  bridge('kittedOf',(old,cs)=>lookup(cs)?.kitted||old?.(cs));
  bridge('dataBytes',(old,cs)=>lookup(cs)?.bodies||old?.(cs));
  bridge('file',(old,key,rel)=>lookup(key)?.served.get(rel)||old?.(key,rel));
  bridge('hold',(old,cs)=>{if(lookup(cs))held.set(cs,(held.get(cs)||0)+1);else old?.(cs);});
  bridge('release',(old,cs)=>{if(!lookup(cs))return old?.(cs);const n=(held.get(cs)||0)-1;if(n>0)held.set(cs,n);else held.delete(cs);});
  product.contentSets={sets,held};
  product.installContent=(room,ids)=>{
    const version=room.version||DEFAULT_VERSION;
    let next=lobby.baseContent(version);
    if(ids.length){
      const selected=TEST_CONTENT.filter(entry=>ids.includes(entry.id));
      if(selected.length!==ids.length)throw Error('测试包运行实现不存在');
      const base=version==='act2autochess'?getData():versions.data(version);
      if(!base)throw Error('游戏版本数据不可用');
      const key=JSON.stringify([version,ids,room.mode]);
      let set=[...sets.values()].find(s=>s.key===key);
      if(!set){
        if(held.size-(held.get(room.content?.cs)===1?1:0)>=4)throw Error('不同测试包组合的运行房间已满，请稍后重试');
        const data=composeProductData(base,ids,{version,mode:room.mode});
        data.assets=getData().assets;
        data.config.productContent={...data.config.productContent,catalog:2,ids:[...ids],...(data.lateInvestment?{lateInvestment:data.lateInvestment}:{})};
        const bodies={},hashes={};
        for(const name of Object.keys(content.data)){
          const body=Buffer.from(JSON.stringify(data[name]??{}));bodies[name]=body;hashes[name]=sha(body);
        }
        const plugins=selected.map(({id,version})=>({id,version,files:{}}));
        const hashInput={app:content.app,sim:content.sim,data:hashes,plugins,settings:{product:{version,ids:[...ids],mode:room.mode}}};
        const cs=contentHashOf(hashInput),short=cs.slice(0,16),served=new Map();
        const index={v:1,cs,vanilla:false,app:content.app,sim:content.sim,simFiles:content.simFiles,plugins,settings:hashInput.settings,version,data:{}};
        for(const [name,body]of Object.entries(bodies)){
          const f={body,sha256:hashes[name],type:'application/json; charset=utf-8'};
          served.set('data/'+name+'.json',f);index.data[name]={url:`/cs/${short}/data/${name}.json`,sha256:f.sha256,bytes:body.length};
        }
        // Presentation is shared by every room and embedded in the full native client.
        served.set('index.json',{body:Buffer.from(JSON.stringify(index)),sha256:null,type:'application/json; charset=utf-8'});
        set={key,cs,hashInput,data:deepFreeze(data),bodies,served,plugins:[],scripts:[],offers:[],bounds:null,kitted:null};
        sets.set(short,set);
        for(const [id,s]of sets)if(sets.size>12&&!held.has(s.cs)&&s!==set)sets.delete(id);
      }
      next=Object.freeze({cs:set.cs,vanilla:false,version,plugins:Object.freeze(selected.map(({id,version})=>Object.freeze({id,version,class:'content',hash:set.cs.slice(0,16)}))),warnings:[],bytes:0,dataBytes:Object.values(set.bodies).reduce((n,b)=>n+b.length,0),modes:[]});
    }
    if(next?.cs===room.content?.cs)return;
    const before=room.content;room.content=next;lobby.holdContent(next);lobby.releaseContent(before);
    room.pluginsChanged=null;room.pluginNoticeKeys={};room.replay=null;
    for(const seat of [...room.seats,...room.spectators])if(seat&&!seat.isBot){seat.content=null;seat.consentCs=null;if(seat.playerId!==room.hostId)seat.ready=false;seat.loadoutCs=null;seat.notOwnedCs=null;seat.diyCs=null;}
  };
}
