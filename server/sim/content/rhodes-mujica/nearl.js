import {hypot as productMath_hypot} from '../../detmath.js';
import * as S from '../support/index.js';
import {live,talent} from './common.js';
import {riMember,livingRhodes} from './engineering.js';
import {NEARL_BALANCE as N} from './balance.js';
const RI='rhodesShip',ID='chess_rm_nearl_a';
export function nearl(bb,chess,def){
 const skills={};for(const s of chess.skills){const p=s.bb;
  if(s.index===0)skills[s.skillId]={kind:'instant',heal:true,charges:s.maxChargeTime,trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid,allies:true,hpAtMost:.5},targeting:{rangeGrid:s.rangeGrid},attack:{dmgType:'heal',heal:{mode:'single',hpAtMost:.5},healScale:p.heal_scale,projectile:'none'}};
  else skills[s.skillId]={kind:'duration',trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid,allies:true,hpAtMost:.999},mods:{atkPct:p.atk,batPct:p.base_attack_time},targeting:{rangeGrid:s.rangeGrid},attack:{dmgType:'heal',heal:{mode:'single'},projectile:'none'}};
 }
 return{skills,talents:[{install(b,u){
  const active=()=>live(u)&&b.getPlayer(u.ownerId)?.bonds?.[RI]?.active&&riMember(b,u)&&(u.blocking||[]).some(live)&&livingRhodes(b,u.ownerId).some(a=>a!==u&&productMath_hypot(a.x-u.x,a.y-u.y)<=N.reach);
  const i=chess.isGolden?1:0;u.mem.rmNearlLast=-Infinity;
  const pressure=({source,target,dmg,dealt,absorbed})=>{if(target===u&&source?.side==='enemy'&&(u.blocking||[]).includes(source)&&active()&&(dealt>0||absorbed>0)&&!dmg?.tags?.includes('hpLoss'))u.mem.rmNearlLast=b.time;};
  b.on('damageResolved',pressure,{owner:u});b.on('damageAbsorbed',pressure,{owner:u});
  b.on('hit',({source,target,dmg})=>{if(target===u&&source?.side==='enemy'&&(u.blocking||[]).includes(source)&&['phys','arts'].includes(dmg.type)&&active())dmg.mul*=1-N.reduction[i];},{owner:u});
  b.every(.1,()=>{if(!active()||b.time-u.mem.rmNearlLast>N.recent)return;
   const peers=livingRhodes(b,u.ownerId).filter(a=>a.def?.baseId===ID);
   peers.sort((a,z)=>Number(S.isElite(z))-Number(S.isElite(a))||a.id-z.id);if(peers[0]!==u)return;
   const progress=S.battleStore(b,'rm:nearl:pressure',()=>new Map()),key=u.ownerId;let t=(progress.get(key)||0)+.1;
   if(t+1e-9>=N.seconds){t-=N.seconds;S.gainLayers(b,{playerId:key,bonds:RI,n:N.growth[i],source:u,reason:'rm:nearl',cap:N.cap[i],capKey:'rm:nearl:'+key});}progress.set(key,t);
  },{owner:u});
  b.on('heal',ctx=>{if(!live(u)||!ctx.source||ctx.source.ownerId!==u.ownerId)return;
   const peers=b.allyUnits.filter(a=>live(a)&&a.ownerId===u.ownerId&&a.def?.baseId===ID),top=peers.sort((a,z)=>(talent(z.def,0).heal_scale||1)-(talent(a.def,0).heal_scale||1)||Number(S.isElite(z))-Number(S.isElite(a))||a.id-z.id)[0];
   if(top!==u)return;const scale=talent(def,0).heal_scale||1;if(chess.status.phase>=2||ctx.source===u)ctx.amount*=scale;
  },{owner:u});
  b.on('heal',ctx=>{if(ctx.source===u&&chess.module?.active&&ctx.target.hpRatio<.5)ctx.amount*=1.15;},{owner:u});
 }}]};
}
