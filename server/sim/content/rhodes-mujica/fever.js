import {girls,live,family} from './common.js';
const teams=new WeakMap();
export function state(b,pid){let m=teams.get(b);if(!m){m=new Map();teams.set(b,m);}if(!m.has(pid))m.set(pid,{heat:0,until:0,encoreUntil:0,pre:new Set(),next:new Map(),fatal:new Set()});return m.get(pid);}
export const inFever=(b,pid)=>state(b,pid).until>b.time+1e-9;
export function gainFever(b,u,n){if(!live(u)||!(n>0))return 0;const s=state(b,u.ownerId);if(inFever(b,u.ownerId))return 0;const tier=b.getPlayer(u.ownerId)?.bonds?.girlbandShip?.tier||0,v=n*(tier>=2?1.3:1);s.heat=Math.min(450,s.heat+v);return v;}
export function startFever(b,pid){const s=state(b,pid);if(s.heat<450||inFever(b,pid))return false;s.heat=0;s.until=b.time+20;s.pre=new Set();s.next.clear();s.fatal.clear();for(const u of girls(b,pid)){if(!live(u))continue;if(u.skill?.active&&u.skill.isTimed&&u.skill.kind!=='toggle'){s.pre.add(u.id);u.mem.rmFeverPauseUntil=s.until;}u.mem.rmFeverUntil=s.until;}b.fx('rm-fever',{playerId:pid,until:s.until});return true;}
function finish(b,pid,s){const until=s.until;s.until=0;const tier=b.getPlayer(pid)?.bonds?.girlbandShip?.tier||0;if(tier>=2)s.encoreUntil=b.time+6;for(const u of girls(b,pid)){u.mem.rmFeverUntil=0;u.mem.rmFeverPauseUntil=0;if(u.skill?.active&&u.skill.isTimed&&u.skill.kind!=='toggle'&&!s.pre.has(u.id))u.skill.end('rm:feverEnd');if(s.fatal.has(u.id)&&live(u))b.retreat(u,{reason:'rm:feverFatal'});}s.pre.clear();s.fatal.clear();b.fx('rm-fever-end',{playerId:pid,until,encoreUntil:s.encoreUntil});}
export function install(b){
 const pids=[...new Set(b.allyUnits.filter(u=>u.def?.bonds?.includes('girlbandShip')).map(u=>u.ownerId))];if(!pids.length)return;
 b.girlbandInfo=pid=>{
  if(!pids.includes(pid))return null;
  const s=teams.get(b)?.get(pid),bond=b.getPlayer(pid)?.bonds?.girlbandShip;
  if(!bond?.active)return null;
  return {live:true,tier:bond.tier,layers:bond.layers||0,heat:s?.heat||0,
   feverRemaining:Math.max(0,(s?.until||0)-b.time),encoreRemaining:Math.max(0,(s?.encoreUntil||0)-b.time)};
 };
 b.on('skillStart',({unit,reason})=>{if(!unit.def?.bonds?.includes('girlbandShip')||reason==='rm:fever'||reason==='carry')return;startFever(b,unit.ownerId);});
 b.on('fatal',ctx=>{const u=ctx.unit;if(!u.def?.bonds?.includes('girlbandShip')||!inFever(b,u.ownerId))return;const sk= girls(b,u.ownerId).find(a=>live(a)&&a.skill?.id==='skchr_oblvns_3'&&a.skill.active);if(!sk)return;ctx.prevented=true;u.hp=1;state(b,u.ownerId).fatal.add(u.id);},{priority:1000});
 b.every(.05,()=>{for(const pid of pids){const s=state(b,pid);if(s.until&&b.time>=s.until-1e-9){finish(b,pid,s);continue;}for(const u of girls(b,pid)){
  u.mem.rmFeverHeat=s.heat;u.mem.rmFeverUntil=s.until;u.mem.rmEncoreUntil=s.encoreUntil;
  if(!inFever(b,pid)||!live(u)||!u.canAct||u.s.flags.silence||u.trait.doll)continue;
  const sk=u.skill;if(!sk||sk.active||sk.pending||sk.chant||sk.kind==='toggle'||sk.id==='skchr_oblvns_2')continue;
  const next=s.next.get(u.id)||0;if(b.time<next)continue;
  // Instant skills use one real action opportunity, never recursively spam in a single simulation tick.
  const interval=Math.max(.1,u.s.bat*100/Math.max(1,u.s.aspd));s.next.set(u.id,b.time+interval);sk.activate('rm:fever',{free:true});
 }}});
}
