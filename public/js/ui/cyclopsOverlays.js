// Shared mode UI at the active game entry. Keep phase gating, private state and intents together
// so upstream game-screen changes do not require copying the mode's dialogs into the screen.
import {html} from './components.js';
import {PHASE} from '../../../shared/constants.js';
import {act} from './gameActions.js';
import {CyclopsHexOverlay} from './cyclopsHexOverlay.js';
import {CyclopsDraftOverlay} from './cyclopsDraftOverlay.js';

export function CyclopsOverlays({pub, priv, myId, players, spectator}) {
  if (spectator || priv?.alive === false || !pub?.cyclops) return null;
  if (pub.phase === PHASE.CYCLOPS_HEX && priv?.cyclopsMine) {
    const ownView = {...pub, cyclops: {...pub.cyclops, state: {[myId]: priv.cyclopsMine}}};
    return html`<${CyclopsHexOverlay} key=${pub.round} pub=${ownView} myId=${myId}
      onPick=${(slot, bondId) => act('g.cyclopsHex', {slot, ...(bondId ? {bondId} : {})})}
      onReroll=${slot => act('g.cyclopsHexReroll', {slot})} />`;
  }
  if (pub.phase === PHASE.CYCLOPS_DRAFT && priv?.cyclopsDraftMine) {
    return html`<${CyclopsDraftOverlay} key=${pub.round} pub=${pub} priv=${priv} myId=${myId} players=${players}
      onPick=${idx => act('g.cyclopsDraft', {idx})} />`;
  }
  return null;
}
