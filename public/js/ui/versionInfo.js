// Shared entry for the title screen and the lobby, including sessions that skip the title.
import {Fragment} from '../../vendor/preact.module.js';
import {useState} from '../../vendor/hooks.module.js';
import {APP_VERSION,RELEASE_SUMMARY} from '../../../shared/constants.js';
import {html,Button,Modal} from './components.js';
export function VersionInfo(){
 const [open,setOpen]=useState(false);
 return html`<${Fragment}>
  <button type="button" class="main-version version-entry" data-testid="main-version" aria-label=${`查看版本 v${APP_VERSION} 更新简介`} onClick=${()=>setOpen(true)}>v${APP_VERSION}</button>
  <${Modal} open=${open} title=${`v${APP_VERSION} · 更新简介`} class="version-modal" onClose=${()=>setOpen(false)} actions=${html`<${Button} onClick=${()=>setOpen(false)}>关闭<//>`}>
   <p data-testid="release-summary">${RELEASE_SUMMARY}</p>
  <//>
 <//>`;
}
