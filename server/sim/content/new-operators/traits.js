import {reinforcementOf,REINFORCEMENT as R,nativeDamage,chenWindow} from './reinforcement.js';
import {live} from './common.js';
// Personal passives: independent of covenant population and layer-gain flags.
export function install(b){
 const own=u=>u?.kind==='op'?reinforcementOf(u.def?.raw):null;
 b.on('hit',({source:u,target:e,dmg:d})=>{
  const r=own(u);if(!r||e?.side!=='enemy'||!nativeDamage(d))return;
  if(r.key==='leizi2'&&d.tags?.some(t=>t==='native:new:thunder'||t==='native:new:current'))d.mul*=1+R.leiziLightning[r.i];
  if(r.key==='chen3'&&chenWindow(u))d.mul*=1+R.chenDamage[r.i];
 },{priority:-8000});
 b.on('hit',({source:e,target:u,dmg:d})=>{
  const r=own(u);if(r?.key!=='chen3'||!live(u)||!chenWindow(u)||e?.side!=='enemy'||!['phys','arts'].includes(d.type)||d.sourceless||d.isHpLoss||d.tags?.some(t=>typeof t==='string'&&/^(?:dot|periodic|hpLoss)(?::|$)/.test(t)))return;
  d.mul*=1-R.chenGuard[r.i];
 },{priority:-8000});
}
// Keep exports for the shared result pipeline; no old personal layer budget is accepted or forwarded.
export function registerMeta(reg){reg.global('new_operator_carry',{onBattleStart(ctx,ev){delete ev.input.newOperatorCarry;if(ev.input.contentInfo)delete ev.input.contentInfo.newOperatorCarry;}});}
export function sanitizeNewOperatorResult(input,p,gd){return p.newOperatorCarry===undefined?{}:null;}
