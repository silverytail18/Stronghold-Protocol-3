import { fitCamera, presetCamera } from './render/projection.js';
import { MIZUKI_GEO } from './mizukiPrep.js';

// Mizuki prep inserts two lower rows for the hand and temporary staging area.
// Frame their display-space bounds together with every shifted native map row.
export function mizukiPresetCamera(kind, viewport, options) {
  // RO2 maps have their own dimensions, including small maps whose bounds also
  // happen to match an ordinary Stronghold camera heuristic. Always fit that map.
  if (['normal', 'unite', 'boss', 'hidden'].includes(kind) && options?.rect) {
    return fitCamera(options.rect, viewport, { tilt: 30, dist: 18, margin: 0.35, headroom: 1.25, rows: 21, cols: 21 });
  }
  if (kind !== 'prep') return presetCamera(kind, viewport, options);
  const nativeRect = options?.nativeRect || options?.rect || { r0: 0, r1: 20, c0: 0, c1: 20 };
  const rect = { r0: MIZUKI_GEO.HAND_ROW, r1: nativeRect.r1, c0: Math.min(0, nativeRect.c0), c1: Math.max(9, nativeRect.c1) };
  // This mode has no shop. Use the measured collapsed HUD clearance instead of
  // reserving the ordinary open shop's large bottom band (especially on phones).
  const padding = { ...viewport?.padding };
  if (options?.hud) {
    padding.top = Math.max(padding.top || 0, options.hud.top || 0);
    padding.bottom = options.hud.bottom ?? padding.bottom;
  }
  return fitCamera(rect, { ...viewport, padding }, { tilt: 30, dist: 18, margin: 0.35, headroom: 1.25, rows: 21, cols: 21 });
}
