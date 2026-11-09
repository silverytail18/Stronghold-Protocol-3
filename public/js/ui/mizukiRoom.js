// Mode-specific control inside the shared upstream waiting room.
import { html } from './components.js';
import { MIZUKI_CAPACITIES } from '../../../shared/mizuki-constants.js';

export function MizukiCapacity({ room, disabled, onChange }) {
  return html`<label class="mz-room-capacity">房间人数 <select aria-label="调整水月房间人数" value=${room.capacity || room.seats.length} disabled=${disabled} onChange=${event => onChange(Number(event.target.value))}>
    ${MIZUKI_CAPACITIES.map(capacity => html`<option value=${capacity} disabled=${room.seats.slice(capacity).some(Boolean)}>${capacity} 人</option>`)}
  </select></label>`;
}

export function MizukiGrade({ value, onChange, disabled = false }) {
  return html`<label class="mz-home__grade">探索难度 <select aria-label="探索难度" value=${value} disabled=${disabled} onChange=${event => onChange(Number(event.target.value))}>
    ${Array.from({ length: 19 }, (_, grade) => html`<option value=${grade}>N${grade}</option>`)}
  </select></label>`;
}
