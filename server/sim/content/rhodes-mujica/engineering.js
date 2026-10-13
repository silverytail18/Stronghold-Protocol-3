// Independent mixed artillery: one owner, one snapshot and one growth award per salvo.
import {engineeringDamage} from '../../../../shared/rhodes-engineering.js';
import * as S from '../support/index.js';
import {remainingDistance} from '../../ai.js';
import {canTargetEnemy} from '../../targeting.js';
import {RI} from './data.js';
import {live} from './common.js';
import {ENGINEERING_BALANCE as E} from './balance.js';
export const riMember=(b,u)=>S.unitBonds(u).includes(RI)||(S.unitBonds(u).includes('maniShip')&&b.getPlayer(u.ownerId)?.bonds?.maniShip?.active);
export const livingRhodes=(b,pid)=>b.allyUnits.filter(u=>u.kind==='op'&&u.ownerId===pid&&live(u)&&riMember(b,u));
export function engineeringNumbers(layers,atk,tier){const i=tier>=3?1:0,{fire}=engineeringDamage(E,layers,atk,tier);return{atk,phys:fire,arts:fire,true:i?fire*E.trueScale:0,interval:E.interval[i],fuse:E.fuse[i],radius:E.radius[i]};}
const state=(b,pid)=>b.getPlayer(pid)?.bonds?.[RI];
const selectable=e=>live(e)&&canTargetEnemy(null,e,{canHitFly:true});
export function installEngineering(b){
 const teams=new Map();
 for(const p of b.players)if(p.bonds?.[RI]?.active&&p.bonds[RI].tier>=2){const pid=p.playerId;
  const credit={id:'rm:engineering:'+pid,kind:'bond',side:'ally',ownerId:pid,def:{bonds:[]},stats:{dmg:0,kills:0,elem:0}};
  teams.set(pid,{credit,firstAt:null,nextAt:0,seq:0});
 }
 const candidates=ops=>{const found=new Map();for(const u of ops)for(const e of b.foesInRadius(u.x,u.y,E.reach))if(selectable(e))found.set(e.id,e);
  const blocked=new Set(ops.flatMap(u=>(u.blocking||[]).map(e=>e.id)));
  return[...found.values()].sort((a,z)=>Number(blocked.has(z.id))-Number(blocked.has(a.id))||remainingDistance(b,a)-remainingDistance(b,z)||a.id-z.id);
 };
 b.every(.1,()=>{for(const[pid,team]of teams){const st=state(b,pid),ops=livingRhodes(b,pid);if(!ops.length||!st?.active||st.tier<2)continue;
  const targets=candidates(ops);if(!targets.length)continue;if(team.firstAt===null)team.firstAt=b.time+E.openingDelay;
  if(b.time+1e-9<Math.max(team.firstAt,team.nextAt))continue;
  const i=st.tier>=3?1:0,L=st.layers||0,A=ops.reduce((n,u)=>n+Math.max(0,u.s.atk),0),numbers=engineeringNumbers(L,A,st.tier);
  const types=i?['phys','arts','true']:['phys','arts'],assigned=new Map(),salvo=++team.seq,locks=[];
  const blocked=new Set(ops.flatMap(u=>(u.blocking||[]).map(e=>e.id)));
  for(const type of types){const min=Math.min(...targets.map(e=>assigned.get(e.id)||0));const pool=targets.filter(e=>(assigned.get(e.id)||0)===min);
   const score=e=>type==='phys'?e.s.def:type==='arts'?e.s.res:-(e.s.def+e.s.res*40);
   pool.sort((a,z)=>Number(blocked.has(z.id))-Number(blocked.has(a.id))||remainingDistance(b,a)-remainingDistance(b,z)||score(a)-score(z)||a.id-z.id);
   const target=pool[0];assigned.set(target.id,(assigned.get(target.id)||0)+1);locks.push({target,type,x:target.x,y:target.y});
  }
  for(const target of new Set(locks.map(v=>v.target)))b.applyStatus(target,'slow',{value:E.lockSlow,duration:numbers.fuse,source:team.credit,ignoreSelect:true});
  b.fx('rm-ri-salvo',{playerId:pid,salvo,tier:st.tier,t:numbers.fuse,r:numbers.radius,locks:locks.map(v=>({x:v.x,y:v.y,type:v.type,target:v.target.id,angle:E.angles[v.type]}))});
  b.after(numbers.fuse,()=>{if(!state(b,pid)?.active||state(b,pid).tier<2||!livingRhodes(b,pid).length)return;
   let effective=false;const feedback=new Map();
   for(const lock of locks){const {x,y,type,target}=lock;
    const hits=b.foesInRadius(x,y,numbers.radius).filter(selectable).sort((a,z)=>Number(z.id===target.id)-Number(a.id===target.id)||Math.hypot(a.x-x,a.y-y)-Math.hypot(z.x-x,z.y-y)||a.id-z.id).slice(0,E.maxTargets[i]);
    b.fx('rm-ri-impact',{x,y,r:numbers.radius,playerId:pid,salvo,tier:st.tier,type});
    for(const e of hits){let absorbed=0;const off=b.on('damageAbsorbed',c=>{if(c.target===e&&c.credit===team.credit)absorbed+=c.absorbed;});
     const dealt=b.dealDamage(team.credit,e,{amount:numbers[type],type,sourceless:true,isSplash:true,canDodge:type!=='true',tags:['bond:rhodes:engineering']});b.off(off);
     if(dealt>0||absorbed>0){effective=true;feedback.set(e.id,{id:e.id,x:e.x,y:e.y,type});}
    }
   }
   for(const hit of feedback.values())b.fx('rm-ri-hit',hit);
   if(effective)S.gainLayers(b,{playerId:pid,bonds:RI,n:E.growth[i],cap:E.cap[i],capKey:'rm:engineering:'+pid,reason:'rm:engineering'});
  });team.nextAt=b.time+numbers.interval;
 }});
 return teams;
}

