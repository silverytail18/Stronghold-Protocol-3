import {useState,useEffect} from '../../vendor/hooks.module.js';
import {html,Button,Modal,Spinner} from './components.js';
import {net} from '../net.js';
import {toastError} from './toasts.js';
import {t} from '../../../shared/i18n.js';
import {DEFAULT_VERSION} from '../../../shared/versions.js';
export function ProductContentPicker({room,isHost,busy}){
  const version=room.version||DEFAULT_VERSION;
  const [open,setOpen]=useState(false),[menu,setMenu]=useState(null),[ids,setIds]=useState([]),[saving,setSaving]=useState(false);
  useEffect(()=>{setMenu(null);setOpen(false);setIds(room.productContent?.ids||[]);},[room.version]);
  useEffect(()=>{if(!open)return;let live=true;setMenu(null);setIds(room.productContent?.ids||[]);
    const query=new URLSearchParams({version,mode:room.mode,difficulty:room.difficulty,ranked:String(!!room.ranked),...(room.variant?{variant:room.variant}:{})});
    fetch('/product/content?'+query,{cache:'no-store'}).then(async response=>{const body=await response.json();if(!response.ok)throw Error(body.error);if(live)setMenu(body);}).catch(error=>{toastError(error);if(live)setOpen(false);});return()=>{live=false;};
  },[open,room.version,room.mode,room.difficulty,room.ranked]);
  const save=async()=>{setSaving(true);try{await net.request('room.setProductContent',{version,revision:menu.revision,ids});setOpen(false);}catch(error){toastError(error);}finally{setSaving(false);}};
  const allowedByDependencies=(item,selected)=>!(item.requires?.some(id=>!selected.includes(id))||item.requiresAny?.length&&!item.requiresAny.some(id=>selected.includes(id)));
  const toggle=id=>setIds(previous=>{
    let next=previous.includes(id)?previous.filter(v=>v!==id):[...previous.filter(v=>!menu.items.find(i=>i.id===id)?.conflicts?.includes(v)),id];
    for(let pass=0;pass<menu.items.length;pass++){const filtered=next.filter(key=>allowedByDependencies(menu.items.find(i=>i.id===key)||{},next));if(filtered.length===next.length)break;next=filtered;}
    return next;
  });
  return html`<${Button} size="sm" variant="secondary" disabled=${!!busy||room.inMatch} onClick=${()=>setOpen(true)}>${t('测试包')} · ${room.productContent?.ids?.length||0}<//>
    ${open?html`<${Modal} open=${true} title=${t('测试包')} micro="TEST CONTENT" onClose=${()=>setOpen(false)} width="min(9rem,100%)"
      actions=${html`<${Button} variant="ghost" onClick=${()=>setOpen(false)}>${t('关闭')}<//>${isHost?html`<${Button} variant="secondary" disabled=${saving} onClick=${()=>setIds([])}>${t('清空选择')}<//><${Button} disabled=${!menu||saving} onClick=${save}>${t('应用选择')}<//>`:null}`}>
      <p class="t-dim">${t('测试包仅在管理员指定的游戏版本开放。切换游戏版本会清空全部测试包，需要重新选择。')}</p>
      ${!menu?html`<${Spinner}/>`:html`<div class="product-content-list">${menu.items.map(item=>html`<label key=${item.id} class="product-content-row">
        <input type="checkbox" checked=${ids.includes(item.id)} disabled=${!isHost||saving||(!item.enabled||!allowedByDependencies(item,ids))&&!ids.includes(item.id)} onChange=${()=>toggle(item.id)} />
        <span><strong>${t(item.name)}</strong><small class="t-dim">${!allowedByDependencies(item,ids)?t('请先选择24或30回合扩展'):item.reason?t(item.reason):t(item.description||'')}</small></span>
      </label>`)}</div>`}
    <//>`:null}`;
}
