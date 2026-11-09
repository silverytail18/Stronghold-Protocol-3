import { MIZUKI_VARIANT } from '../../shared/mizuki-constants.js';
import { fxForm } from '../../shared/protocol.js';

const same = (left, right) => left != null && right != null && String(left) === String(right);

/** m.field is the ordinary reliable map/unit metadata channel. */
export function mergeMizukiFieldData(previous, field) {
  if (!previous || !same(previous.fieldId, field?.fieldId) || !same(previous.battleId, field?.battleId)) return field;
  return { ...previous, ...field };
}

export function mizukiFieldMetadata(message) {
  if (message?.t !== 'm.field' || !message.battleId || !message.fieldId) return null;
  const { t, stage, geometry, battleId, ...meta } = message;
  return { fieldId: message.fieldId, battleId, meta,
    ...(stage ? { stage } : {}), ...(geometry ? { geometry } : {}) };
}

export function mergeMizukiField(current, message) {
  const metadata = mizukiFieldMetadata(message);
  if (!metadata || current?.variant !== MIZUKI_VARIANT || !Array.isArray(current.mizuki?.fields)) return current;
  const fields = current.mizuki.fields, index = fields.findIndex(field => same(field.fieldId, metadata.fieldId) && same(field.battleId, metadata.battleId));
  if (index < 0) return current;
  const next = fields.slice(); next[index] = mergeMizukiFieldData(fields[index], metadata);
  return { ...current, mizuki: { ...current.mizuki, fields: next } };
}

export function mergeMizukiFieldEvents(field, message) {
  if (!same(field?.fieldId, message?.fieldId) || !same(field?.battleId, message?.battleId) || !field.meta) return field;
  const events = message.ev || message.events || [];
  const byId = new Map((field.meta.units || []).map(unit => [String(unit.id), unit]));
  let changed = false;
  for (const event of events) {
    if (!Array.isArray(event)) continue;
    if (event[0] === 'spawn' && event[1]?.id != null) { byId.set(String(event[1].id), event[1]); changed = true; }
    const form = fxForm(event), id = event[4]?.id, unit = byId.get(String(id));
    if (form !== undefined && unit) { byId.set(String(id), { ...unit, form }); changed = true; }
  }
  if (!changed) return field;
  return { ...field, meta: { ...field.meta, units: [...byId.values()] } };
}

export function mergeMizukiEvents(current, message) {
  if (current?.variant !== MIZUKI_VARIANT || !Array.isArray(current.mizuki?.fields)) return current;
  let changed = false;
  const fields = current.mizuki.fields.map(field => {
    const next = mergeMizukiFieldEvents(field, message); changed ||= next !== field; return next;
  });
  return changed ? { ...current, mizuki: { ...current.mizuki, fields } } : current;
}

/** Keep live combat at the snapshot cadence without retransmitting the whole run. */
export function mergeMizukiSnapshot(current, message) {
  if (current?.variant !== MIZUKI_VARIANT || !Array.isArray(current.mizuki?.fields)
    || message?.t !== 'b.snap' || !Number.isFinite(message.time)) return current;
  const fields = current.mizuki.fields;
  const index = fields.findIndex(field => same(field.fieldId, message.fieldId) && same(field.battleId, message.battleId));
  if (index < 0 || (!fields[index].__overview && Number(fields[index].t) >= message.time)) return current;
  const { t, rid, time, ...snapshot } = message;
  const next = fields.slice();
  next[index] = { ...fields[index], ...snapshot, t: time };
  delete next[index].__overview;
  return { ...current, mizuki: { ...current.mizuki, fields: next } };
}

/** Periodic public frames omit reliable metadata; retain it only within the same battle. */
export function mergeMizukiPublic(previous, current) {
  if (current?.variant !== MIZUKI_VARIANT || previous?.variant !== MIZUKI_VARIANT || !Array.isArray(current.mizuki?.fields)) return current;
  return { ...current, mizuki: { ...current.mizuki, fields: current.mizuki.fields.map(field =>
    mergeMizukiFieldData(previous.mizuki?.fields?.find(old => same(old.fieldId, field.fieldId) && same(old.battleId, field.battleId)), field)) } };
}
