// Reuse the server-synchronised HUD clock. This display never resolves a pick or starts a local turn timer.
import {html, Countdown} from './components.js';
import {t} from '../../../shared/i18n.js';

export function CyclopsChoiceTimer({deadline, draft = false}) {
  return html`<div class="cycov__clockbar">
    <div class="cycov__clocktext"><strong>${t(draft ? '征召阶段剩余时间' : '馈赠选择剩余时间')}</strong>
      <span>${t(draft ? '全体共享截止时间，换人不重置' : '选择完成后等待其他博士')}</span></div>
    <${Countdown} deadline=${deadline} label=${t('秒')} gauge=${false} class="cycov__countdown" />
  </div>`;
}
