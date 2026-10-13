import {html,Button,Modal} from './components.js';

export function testSelectionKey(room,playerId,online=true){
  return JSON.stringify([room?.code,room?.hostId,room?.difficulty,!!room?.ranked,room?.testMenu?.version,playerId,online]);
}
export function toggleTestSelection(items,current,id){
  const chosen=new Set(current),item=items.find(item=>item.id===id);
  if(!item?.enabled)return current;
  if(chosen.has(id))chosen.delete(id);
  else{
    const visiting=new Set();
    const add=key=>{
      const entry=items.find(item=>item.id===key);if(!entry?.enabled||visiting.has(key))throw new Error('测试依赖不可用');
      visiting.add(key);for(const dependency of entry.requires||[])add(dependency);visiting.delete(key);
      for(const old of [...chosen])if((entry.conflicts||[]).includes(old)||(items.find(item=>item.id===old)?.conflicts||[]).includes(key))chosen.delete(old);
      chosen.add(key);
    };add(id);
  }
  let changed=true;while(changed){changed=false;for(const key of [...chosen])if((items.find(item=>item.id===key)?.requires||[]).some(dep=>!chosen.has(dep))){chosen.delete(key);changed=true;}}
  return items.filter(item=>chosen.has(item.id)).map(item=>item.id);
}
export function TestContentDialog({open,menu,selected,onToggle,onClear,onClose}){
  return html`<${Modal} open=${open} title="测试内容" micro="TEST CONTENT" class="room-tests-modal" onClose=${onClose}
      actions=${html`<${Button} variant="secondary" onClick=${onClear}>全部关闭<//><${Button} variant="primary" data-autofocus onClick=${onClose}>保存选择<//>`}>
    <p>选择只保存在当前房间的本机界面。点击“开始模拟”后，服务器才会校验并为本局启用；离开房间、换房主或断线后清除。</p>
    <p class="t-lo">可分别启用多个兼容内容；本局全员共用，排位按现有规则正常结算。</p>
    <p class="t-lo">20／24／30 回合只能选一项；4＋6与5＋8开局禁用也只能选一项，且仅非标准模式可用。两组可以组合；联机库存项目只对多人房间开放。</p>
    ${!(menu?.items||[]).some(item=>item.enabled)?html`<p class="room-tests-empty" role="status">当前暂无已开放且适用于本模式的测试内容。</p>`:null}
    <div class="room-tests-list">${(menu?.items||[]).map(item=>html`<label key=${item.id} class=${`room-test-option${item.enabled?'':' is-unavailable'}`}>
      <input type="checkbox" data-test-id=${item.id} checked=${selected.includes(item.id)} disabled=${!item.enabled} onChange=${()=>onToggle(item.id)} />
      <span><strong>${item.group?`${item.group} · `:''}${item.name}</strong><span>${item.description}</span>${item.reason?html`<small>${item.reason}</small>`:null}</span>
    </label>`)}</div>
  <//>`;
}
