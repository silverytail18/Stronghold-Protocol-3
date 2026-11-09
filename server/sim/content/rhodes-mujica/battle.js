import * as S from '../support/index.js';
import {RI,GIRL} from './data.js';
import {state,inFever,install as installFever} from './fever.js';
import {RI_BALANCE as R} from './balance.js';
import {RHODES_ITEMS} from './content-text.js';
import {installEngineering,riMember,livingRhodes} from './engineering.js';
import {installPersonal} from './personal.js';
const ownDmg=d=>d&&!d.sourceless&&(!d.tags?.some(t=>t==='item'||t==='bond'||t.startsWith('item:')||t.startsWith('bond:')||t.startsWith('exp:sui')));
export function install(b){
 installFever(b);
 const hasRI=b.players.some(p=>p.bonds?.[RI]?.active),hasGirl=b.players.some(p=>p.bonds?.[GIRL]?.active),hasClosure=b.players.some(p=>p.bandId==='band_rm_closure');
 if(!hasRI&&!hasGirl&&!hasClosure)return;
 const started=new Set(),sync=()=>{for(const p of b.players){const st=p.bonds?.[RI];if(!st?.active)continue;const L=st.layers||0;for(const u of b.allyUnits)if(u.kind==='op'&&u.ownerId===p.playerId&&riMember(b,u))b.addBuff(u,{key:'rm:ri:stats',mods:{atkPct:R.atkBase+R.atkPerLayer*L,hpPct:R.hpBase+R.hpPerLayer*L},persist:true,allowDead:true});}};
 if(hasRI){sync();b.on('battleStart',sync);b.on('layerGain',()=>b.after(0,sync),{priority:-110});}
 if(hasGirl)b.on('deploy',({unit:u,initial})=>{const st=b.getPlayer(u.ownerId)?.bonds?.[GIRL];if(!st?.active||!u.def?.bonds?.includes(GIRL)||started.has(u.id))return;started.add(u.id);if(initial&&u.carry)return;u.skill?.gainSp(st.tier>=2?15:10,'rm:opening');});
 if(hasRI){const supplied=new Set();b.on('deploy',({unit:u,initial})=>{
  if(!initial||u.carry||u.kind!=='op'||S.tierOf(u)>3||!b.getPlayer(u.ownerId)?.bonds?.[RI]?.active||!riMember(b,u)||supplied.has(u.id))return;
  supplied.add(u.id);const girl=b.getPlayer(u.ownerId)?.bonds?.[GIRL];
  let already=girl?.active&&u.def.bonds.includes(GIRL)?girl.tier>=2?15:10:0;
  for(const id of new Set(S.itemsOf(u)))already+=RHODES_ITEMS[id]?.params.openingSp||0;
  u.skill?.gainSp(Math.max(0,R.openingSp[S.isElite(u)?1:0]-already),'rm:ri:opening');
 },{priority:-1000});}
 const coef=u=>{const st=b.getPlayer(u?.ownerId)?.bonds?.[GIRL];if(!st?.active||!u.def?.bonds?.includes(GIRL))return 1;if(st.tier<2)return 1.15;const s=state(b,u.ownerId);return inFever(b,u.ownerId)||s.encoreUntil>b.time?1.4:1.2;};
 b.on('hit',({source:u,target,dmg:d})=>{if(!u||u.side===target.side||!ownDmg(d))return;if(['phys','arts'].includes(d.type)){d.mul*=coef(u);if(hasClosure&&b.getPlayer(u.ownerId)?.bandId==='band_rm_closure'&&u.kind==='op'&&S.itemsOf(u).length>=2)d.mul*=1.12;}},{priority:-9000});
 if(hasClosure)b.on('hit',({target:u,dmg})=>{if(u.kind==='op'&&b.getPlayer(u.ownerId)?.bandId==='band_rm_closure'&&S.itemsOf(u).length>=1&&['phys','arts'].includes(dmg.type))dmg.mul*=.9;});
 if(hasGirl)b.on('heal',ctx=>{if(ctx.source&&!ctx.opts?.regen&&!ctx.opts?.aura)ctx.amount*=coef(ctx.source);});

 if(hasRI){const fire=installEngineering(b);installPersonal(b,fire);b.rhodesInfo=pid=>{const st=b.getPlayer(pid)?.bonds?.[RI];if(!st?.active)return null;const t=fire.get(pid);return{atk:livingRhodes(b,pid).reduce((n,u)=>n+Math.max(0,u._s?.atk??u.base.atk),0),layers:st.layers||0,tier:st.tier,live:true,...(t?{commands:t.commands,commandCooldown:Math.max(0,t.teamReady-b.time),followRemaining:t.chain?.remaining||0,personal:b.rhodesPersonal.view(pid)}: {})};};}
}
