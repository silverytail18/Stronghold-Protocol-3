// Water-mode presentation lifetime is independent from the ordinary match router.
import { html } from '../ui/components.js';
import { useState } from '../../vendor/hooks.module.js';
import { useStore } from '../store.js';
import { MizukiScreen } from './mizuki.js';
import { MizukiExitControls } from './mizukiExit.js';
import { MizukiBattleOutcome } from './mizukiOutcome.js';
import { PersistentMizukiBattleHost } from './mizukiBattle.js';
import { mizukiBattlePresentation } from '../mizukiBattlePresentation.js';
import { useMizukiModeAudio } from '../mizukiAudio.js';
import { ChatPanel } from '../ui/emiChat.js';
export function MizukiGameScreen() {
  useMizukiModeAudio();
  const battlefield = useStore(state => !!state.props, Object.is, mizukiBattlePresentation);
  const online = useStore(s => s.connection.status === 'online');
  const spectator = useStore(s => s.spectator);
  const result = useStore(s => s.match.result);
  const [chatOpen, setChatOpen] = useState(false);
  return html`<div data-mz-exploration-host style=${battlefield ? {visibility:'hidden'} : undefined} inert=${battlefield || undefined}><${MizukiScreen}/></div>
    <${PersistentMizukiBattleHost}/><${MizukiExitControls}/><${MizukiBattleOutcome}/>
    ${!spectator && !result ? html`<div class="mz-product-chat"><${ChatPanel} open=${chatOpen} onToggle=${setChatOpen} disabled=${!online}/></div>` : null}`;
}
