import {useEffect,useState} from '../../vendor/hooks.module.js';
import {html,Button} from './components.js';
import {eventMusic} from '../productMusic.js';
import {useStore} from '../store.js';
import {MUSIC_CATALOG,musicTrack} from '../../../shared/music.js';
import {toastError} from './toasts.js';
import {t} from '../../../shared/i18n.js';
export function RuleMusicSettings(){
  const[,refresh]=useState(0),[track,setTrack]=useState(MUSIC_CATALOG[0].id);
  useEffect(()=>eventMusic.subscribe(()=>refresh(v=>v+1)),[]);
  const admin=useStore(s=>s.productAccount?.role==='admin'&&!s.room?.inMatch);
  return html`<section class="product-rule-music"><h3>${t('动感音乐')}</h3>
    <label>${t('动感音乐音量')} <input type="range" min="0" max="100" step="1" value=${Math.round(eventMusic.volume*100)} onInput=${e=>eventMusic.setVolume(Number(e.target.value)/100)}/><output>${Math.round(eventMusic.volume*100)}%</output></label>
    <p>${t('当前播放')}：${eventMusic.command?musicTrack(eventMusic.command.trackId)?.name:t('原版背景音乐')}</p>
    <div class="product-actions"><${Button} size="sm" variant="secondary" onClick=${()=>eventMusic.toggle()}>${eventMusic.enabled?t('关闭动感音乐'):t('开启动感音乐')}<//><${Button} size="sm" variant="ghost" disabled=${!eventMusic.command} onClick=${()=>eventMusic.stop()}>${t('跳过当前歌曲')}<//></div>
    ${admin?html`<label>${t('局外试听')}<select value=${track} onChange=${e=>setTrack(e.target.value)}>${MUSIC_CATALOG.map(row=>html`<option value=${row.id}>${row.name}</option>`)}</select><${Button} size="sm" onClick=${()=>eventMusic.preview(track).catch(toastError)}>${t('试听')}<//></label>`:null}
  </section>`;
}
