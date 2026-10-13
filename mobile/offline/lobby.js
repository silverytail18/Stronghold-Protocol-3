import {useState} from '/vendor/hooks.module.js';
import {html,Button} from '/js/ui/components.js';
import {GuideButton} from '/js/ui/guide.js';
import {LoadoutButton} from '/js/screens/loadout.js';
import {DIFFICULTIES,DIFFICULTY_NAMES,DIFFICULTY_COLORS} from '/shared/constants.js';
import {net} from '/js/net.js';
import {toastError} from '/js/ui/toasts.js';
import {useStore} from '/js/store.js';
import {difficultyInfo} from '/js/screens/lobby.js';
export const rememberRoom=()=>{};
export const parseRoomParam=()=>null;
export function LobbyScreen() {
  const [difficulty,setDifficulty]=useState('NORMAL'),[busy,setBusy]=useState(false);
  const online=useStore(s=>s.connection.status==='online');
  const start=async()=>{setBusy(true);try{await net.request('room.create',{mode:'solo',difficulty,ranked:false});}catch(error){toastError(error);}finally{setBusy(false);}};
  return html`<main class="offline-lobby">
    <header><div><p class="t-lo">OFFLINE · SINGLE PLAYER</p><h1>独立模拟 · 单机版</h1><p>资源与游戏规则均已内置，断网即可游玩。当前测试内容全部开放。</p></div>
      <div class="offline-actions"><${GuideButton}/><${LoadoutButton}/></div></header>
    <section class="offline-difficulties">${DIFFICULTIES.map(key=>{
      const info=difficultyInfo('solo',key);
      return html`<button type="button" key=${key} class=${`offline-difficulty ${difficulty===key?'is-selected':''}`} style=${`--difficulty-color:${DIFFICULTY_COLORS[key]}`} onClick=${()=>setDifficulty(key)}>
        <strong>${DIFFICULTY_NAMES[key]}</strong><span>${info.desc}</span><small>${info.rounds} 回合${info.hidden?' · 可触发隐藏关':''}</small><small>${info.stageNote}</small>
      </button>`;
    })}</section>
    <p class="t-lo">进入准备界面后，通过“测试内容”按钮选择 20／24／30 回合、商店扩展及内容测试包。标准模拟保持原回合数。联机库存项目仅适用于多人模式。</p>
    <${Button} variant="primary" disabled=${busy||!online} onClick=${start}>${busy?'正在准备…':online?'进入单人准备':'正在启动本地引擎…'}<//>
    <p class="t-lo offline-note">单机版不登录账号、不参与云端排位。本局进度保存在内存中；切到后台自动暂停，结束应用进程或重新加载将结束本局。调配、皮肤与设置保存在本机。</p>
  </main>`;
}
