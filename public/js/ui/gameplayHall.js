import {useEffect, useState} from '../../vendor/hooks.module.js';
import {html, Modal, Button, Icon, MicroLabel} from './components.js';
import {t} from '../../../shared/i18n.js';
import {productMode} from '../../../shared/product-modes.js';

/** Server-driven hall; a mode must be registered locally and open on the server before selection. */
export function GameplayHall({onClose, onSelect, online}) {
  const [catalog, setCatalog] = useState(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let current = true, pending = false;
    const refresh = async () => {
      if (pending) return; pending = true;
      try {
        const response = await fetch('/product/modes', {cache: 'no-store', signal: controller.signal});
        const value = await response.json();
        if (!response.ok) throw Error(value.error || t('读取玩法失败，请重试'));
        if (!Array.isArray(value.modes)) throw Error(t('读取玩法失败，请重试'));
        if (current) {setCatalog(value); setError('');}
      } catch (failure) {if (current && failure.name !== 'AbortError') setError(failure.message);}
      finally {pending = false;}
    };
    refresh();
    const timer = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {current = false; controller.abort(); clearInterval(timer); window.removeEventListener('focus', refresh);};
  }, [reload]);
  return html`<${Modal} open=${true} title=${t('玩法大厅')} micro="GAMEPLAY HALL" onClose=${onClose}
    class="gameplay-hall" width="min(1080px,96vw)" actions=${html`<${Button} class="gameplay-hall__refresh" variant="secondary" onClick=${() => setReload(value => value + 1)}>${t('刷新玩法')}<//><${Button} onClick=${onClose}>${t('返回主界面')}<//>`}>
    <p class="gameplay-hall__intro">${t('在这里选择独立玩法，查看规则与开放状态。')}</p>
    ${error ? html`<p class="gameplay-hall__notice" role="alert">${error}</p>` : null}
    ${!catalog && !error ? html`<p role="status">${t('正在读取玩法…')}</p>` : null}
    <div class="gameplay-hall__grid">
      ${(catalog?.modes || []).filter(mode => productMode(mode.id)).map(mode => html`<article key=${mode.id} class=${`gameplay-card ${mode.enabled ? 'is-open' : 'is-closed'}`} data-gameplay=${mode.id}>
        <header class="gameplay-card__head"><span class="gameplay-card__icon"><${Icon} name=${mode.icon}/></span><div><${MicroLabel}>${mode.english}<//><h3>${t(mode.name)}</h3></div>
          <span class="gameplay-card__status">${t(mode.enabled ? '已开放' : '未开放')}</span></header>
        <p>${t(mode.description)}</p><p class="gameplay-card__players">${t('1–{n} 名真人博士', {n: mode.players})}</p>
        <ul>${mode.rules.map(rule => html`<li>${t(rule)}</li>`)}</ul>
        <footer>${!mode.enabled ? html`<p>${t('管理员暂未开放此玩法')}</p>` : null}
          <${Button} disabled=${!mode.enabled || !online || !!error} onClick=${() => onSelect(mode.id)}>${t(mode.enabled ? '选择玩法' : '暂未开放')}<//></footer>
      </article>`)}
    </div>
    ${catalog?.modes?.length === 0 ? html`<p>${t('暂无可用玩法')}</p>` : null}
  <//>`;
}
