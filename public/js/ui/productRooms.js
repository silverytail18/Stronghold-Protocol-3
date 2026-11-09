import {h} from '../../vendor/preact.module.js';
import {useState} from '../../vendor/hooks.module.js';
import {Button} from './components.js';
import {net} from '../net.js';
import {toastError} from './toasts.js';
import {t} from '../../../shared/i18n.js';
import {CommunityLauncher} from './community.js';
export function RankedRoomToggle({room,isHost,busy}) {
  const [pending,setPending]=useState(false);
  return h('div',{class:'emi-launchers'},
    h(Button,{size:'sm',variant:room.ranked?'primary':'secondary',disabled:!isHost||busy||pending||room.inMatch,onClick:async()=>{setPending(true);try{await net.request('room.setRanked',{on:!room.ranked});}catch(error){toastError(error);}finally{setPending(false);}}},t(room.ranked?'排位模拟':'普通模拟')),
    h(CommunityLauncher,{page:'players'}));
}
export function ProductRoomList(){return h(CommunityLauncher,{page:'rooms'});}
