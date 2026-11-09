import {exp as productMath_exp} from '../../productMath.js';
// 5.4 combat additions. No data/config writes; this module is served to the browser unchanged.
import {CORE} from './data.js';
import {unitBonds} from '../support/index.js';
import {canTargetEnemy} from '../../targeting.js';
import {dirVec} from '../../dir.js';
import {hitRect} from '../../body.js';
import {aggregateMods} from '../../buffs.js';
import {storageCapacity,openingFire,generationBudget,generationRate,PERFORMANCE_CAP,
 NATIVE_FIRE_RATES,NATIVE_FIRE_BUDGET_SHARE,FOLLOW_UP_ARTS,FOLLOW_UP_INTERVAL,TRUE_ECHO_SCALE,
 OUTPUT_REFILL,HEAL_MARK_SECONDS,HEAL_MARK_WEIGHT,MELEE_COOLDOWNS,
 SWORD_RANGE,SWORD_SPEED,SWORD_WIDTH,RESONANCE_DURATION,RESONANCE_CD,NATURAL_SP_SCALE,SKILL_RECOVERY_MULTIPLIER,
 DECAY_GRACE,DECAY_RATE,ACTIVE_DECAY_RATE,ACTIVITY_SECONDS,ATTACK_FLOOR_RATES,waveCost,waveDamage,attackReserve,nativeDamagePacket,guardEnabled} from './rules.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const actual=u=>u?.kind==='op'&&unitBonds(u).includes(CORE);
const melee=u=>(u?.def?.position==='MELEE'||u?.def?.raw?.position==='MELEE')&&!u.isFlying&&!['liftoff','float','levitate'].some(k=>u.s?.flags?.[k]||u.profile?.[k]);
const native=c=>c.source?.kind==='op'&&c.target?.side==='enemy'&&nativeDamagePacket(c.dmg);
const key=u=>u.def?.baseId||u.defId;
export const permanentHp=u=>{
 const {add,mul}=aggregateMods((u.buffs||[]).filter(v=>!Number.isFinite(v.timeLeft)&&!v.key.startsWith('skill:')&&!v.tags?.includes('skill')));
 return Math.max(1,(u.base.maxHp+(add.hpFlat||0))*Math.max(0,1+(add.hpPct||0))*(mul.hpMul??1));
};

export function installMechanics(b,{states,core,M0,budget,debt,repay,hit,record,skillFlow}){
 const queued=new Map(),waves=[],pools=new WeakMap();let poolSeq=0;
 const enemyKey=e=>{if(!e.bossPool)return b.kind+':enemy:'+e.id;if(!pools.has(e.bossPool))pools.set(e.bossPool,++poolSeq);return b.kind+':pool:'+pools.get(e.bossPool);};
 let waveSeq=0;
 for(const st of states.values()){
  Object.assign(st,{K:2*st.C,K0:0,N:0,H:0,E:st.C,nativeGenerated:0,nativeSecondGenerated:0,lastActivity:-Infinity,lastWaveSpent:0,decayStart:null,
   resonanceUntil:0,resonanceReady:0,marks:new Map(),meleeReady:new Map(),followReady:new Map(),fireFloorReady:new Map(),used:new Map(),areaActions:new Set(),recoveries:[]});
  Object.assign(st.metrics,{followUp:0,wave:0,decayed:0,skillLoss:0,skillRecovery:0,meleeProcs:0,resonances:0});
  const carry=b.getPlayer(st.pid)?.input?.contentInfo?.kazdelCarry;
  if(!st.carried)continue;
  for(const k of ['K0','E','nativeGenerated','nativeSecondGenerated','lastWaveSpent'])if(Number.isFinite(carry?.[k]))st[k]=carry[k];
  st.lastActivity=b.time-ACTIVITY_SECONDS+(carry?.activityRemaining||0);
  st.decayStart=Number.isFinite(carry?.decayGraceRemaining)?b.time+carry.decayGraceRemaining:null;
  st.resonanceUntil=b.time+(carry?.resonanceRemaining||0);st.resonanceReady=b.time+(carry?.resonanceCooldown||0);
  for(const [name,map]of [['marks',st.marks],['meleeCooldowns',st.meleeReady],['followCooldowns',st.followReady],['fireFloorCooldowns',st.fireFloorReady]])
   for(const v of carry?.[name]||[])map.set(v.uid,b.time+v.remaining);
  st.recoveries=structuredClone(carry?.recoveries||[]);
 }
 const roster=(st,opening=false)=>{
  const names=new Map();
  for(const u of b.allyUnits)if(u.ownerId===st.pid&&actual(u)&&(opening?u.alive&&!u.removed:live(u))){
   const hp=permanentHp(u),v=names.get(key(u));if(!v||hp>v.hp)names.set(key(u),{u,hp});
  }
  return {N:names.size,H:[...names.values()].reduce((n,v)=>n+v.hp,0)};
 };
 const refresh=st=>{Object.assign(st,roster(st));st.K=storageCapacity(st.C,st.N,st.H);st.R=generationRate(st.tier,st.S,st.K);st.Q=Math.min(st.K,st.Q);};
 const reserve=st=>{
  const us=b.allyUnits.filter(u=>u.ownerId===st.pid&&core(u)&&live(u));
  if(!guardEnabled(st.tier)||!us.length||b.time+1e-8<st.guardReady)return 0;
  return attackReserve(st.tier,st.C,us.some(u=>u.hp<=.6*u.s.maxHp||debt(u)>=.25*st.C));
 };
 const addFire=(st,n,isNative=false)=>{
  n=Math.max(0,Math.min(n,budget(st),Math.max(0,st.K-st.Q),isNative?Math.max(0,NATIVE_FIRE_BUDGET_SHARE*st.R-st.nativeSecondGenerated):Infinity));
  st.Q+=n;st.generated+=n;st.secondGenerated+=n;if(isNative){st.nativeGenerated+=n;st.nativeSecondGenerated+=n;}return n;
 };
 const spend=(st,u,D0,isSkill,actionKey)=>{
  if(b.time+1e-8<(st.followReady.get(u.uid)||0))return 0;
  const mark=(st.marks.get(u.uid)||0)>b.time?HEAL_MARK_WEIGHT:1,cap=(isSkill?.4:.2)*st.C;
  const n=Math.floor(Math.max(0,Math.min(st.Q-reserve(st),st.E,(isSkill?.6:.3)*D0*mark,cap-(st.used.get(actionKey)||0))));
  if(n<1)return 0;
  st.Q-=n;st.E-=n;st.used.set(actionKey,(st.used.get(actionKey)||0)+n);st.followReady.set(u.uid,b.time+FOLLOW_UP_INTERVAL);
  if(mark>1)st.marks.delete(u.uid);st.metrics.release+=n;return n;
 };
 const valid=(u,e)=>live(e)&&!e.hidden&&canTargetEnemy(u,e,{canHitFly:true,groundOnly:false});
 const parts=(st,n,burst)=>burst?{arts:0,true:n*(FOLLOW_UP_ARTS[2]+TRUE_ECHO_SCALE)}:
  {arts:n*FOLLOW_UP_ARTS[st.tier-1],true:st.tier===3?n*TRUE_ECHO_SCALE:0};
 const applyParts=(st,u,e,p,tag,id)=>{
  let n=0;if(p.arts>0)n+=hit(st,e,p.arts,'arts',tag,id,u);if(p.true>0&&live(e))n+=hit(st,e,p.true,'true',tag,id,u);return n;
 };
 const bounds=(w,e)=>{
  const r=hitRect(e),pts=r?[[r.x0,r.y0],[r.x0,r.y1],[r.x1,r.y0],[r.x1,r.y1]]:[[e.x,e.y]];
  const f=pts.map(([x,y])=>(x-w.x)*w.dx+(y-w.y)*w.dy),s=pts.map(([x,y])=>(x-w.x)*-w.dy+(y-w.y)*w.dx);
  return {lo:Math.min(...f),hi:Math.max(...f),side0:Math.min(...s),side1:Math.max(...s)};
 };
 const sweep=(w,from,to)=>{
  const st=states.get(w.pid),u=b.allyUnits.find(v=>v.ownerId===w.pid&&v.uid===w.uid);
  if(!st||!u)return;
  for(const e of b.enemies){
   if(!valid(u,e))continue;const k=enemyKey(e);if(w.hit.has(k))continue;
   const z=bounds(w,e);if(z.hi<from-(w.sword?.15:.5)-1e-8||z.lo>to+(w.sword?.15:.5)+1e-8||z.side0>w.width/2||z.side1<-w.width/2)continue;
   w.hit.add(k);const p={arts:w.baseArts+w.parts.arts,true:w.baseTrue+w.parts.true};
   const beforeShield=(e.buffs||[]).reduce((n,v)=>n+(v.shield||0)+(v.shieldHits||0),0);
   const dealt=applyParts(st,u,e,p,w.sword?'kz:sword':'kz:vortex',w.id);st.metrics.wave+=dealt;
   const afterShield=(e.buffs||[]).reduce((n,v)=>n+(v.shield||0)+(v.shieldHits||0),0);
   if(dealt>0||afterShield<beforeShield)w.committed=true;
  }
 };
 const refund=w=>{if(!w.committed&&w.spent){const st=states.get(w.pid);st.Q=Math.min(st.K,st.Q+w.spent);st.E=Math.min(st.C,st.E+w.spent);st.metrics.release-=w.spent;if(st.lastWaveSpent===w.spent)st.lastWaveSpent=0;}};
 const launch=(st,u,a)=>{
  if(b.time+1e-8<(st.meleeReady.get(u.uid)||0)||st.areaActions.has(a.key))return;
  st.areaActions.add(a.key);st.meleeReady.set(u.uid,b.time+MELEE_COOLDOWNS[st.tier-1]);st.metrics.meleeProcs++;
  const sword=st.tier===3,[dy,dx]=dirVec(u.dir),x=u.x+dx,y=u.y+dy;
  if(!b.grid.inRect(Math.round(y),Math.round(x)))return;
  const cost=waveCost(st.tier,st.C),Q=a.fireSnapshot,n=Math.max(0,Math.min(cost,Q-reserve(st),st.Q-reserve(st),st.E));
  st.Q-=n;st.E-=n;st.metrics.release+=n;st.lastWaveSpent=n;
  const D=waveDamage(st.tier,b.getPlayer(st.pid)?.bonds?.[CORE]?.count||[3,6,9][st.tier-1],st.S,Q,cost>0?n/cost:0);
  let max=sword?SWORD_RANGE:0;
  for(let d=0;d<=max;d+=.05)if(!b.grid.inRect(Math.round(y+dy*d),Math.round(x+dx*d))){max=Math.max(0,d-.05);break;}
  const w={pid:st.pid,uid:u.uid,id:++b._attackSeq,seq:++waveSeq,x,y,dx,dy,max,sword,width:1,
   distance:0,baseArts:D.baseArts,baseTrue:D.baseTrue,parts:{arts:D.fireArts,true:D.fireTrue},spent:n,committed:false,hit:new Set()};
  b.fx(sword?'kz-blood-sword':'kz-blood-vortex',{x,y,dx,dy,width:1,distance:max,speed:SWORD_SPEED,t:sword?max/SWORD_SPEED:.45,src:u.id});
  if(sword){sweep(w,0,0);waves.push(w);}else{sweep(w,0,0);refund(w);}

 };
 const enqueue=c=>{
  if(!native(c)||!core(c.source))return;const u=c.source,st=states.get(u.ownerId);
  record(u,0,true);const id=c.dmg.attackId||'skill:'+Math.floor(b.time/FOLLOW_UP_INTERVAL),k=u.uid+':'+id;
  let a=queued.get(k);if(!a)queued.set(k,a={key:k,u,st,fireSnapshot:st.Q,effective:0,skill:!!c.dmg.isSkill,D0:0,targets:new Map(),packets:new Set(),attack:!!c.dmg.isAttack});
  a.effective+=Math.max(0,c.dealt||0)+Math.max(0,c.absorbed||0);a.skill||=!!c.dmg.isSkill;a.attack||=!!c.dmg.isAttack;st.lastActivity=b.time;
  if(!a.packets.has(c.dmg)){a.packets.add(c.dmg);a.D0+=Math.max(0,c.dmg.amount*c.dmg.mul);}
  const targetKey=enemyKey(c.target),v=a.targets.get(targetKey)||{enemy:c.target,weight:0};
  if(!a.targetPackets)a.targetPackets=new Set();
  if(!a.targetPackets.has(c.dmg)){v.weight+=Math.max(0,c.dmg.amount*c.dmg.mul);a.targetPackets.add(c.dmg);}
  a.targets.set(targetKey,v);
 };
 b.on('damageResolved',c=>{
  if(!native(c)||!core(c.source)||!(c.dealt>0))return;
  enqueue(c);
 });
 b.on('damageAbsorbed',c=>{if(c.absorbed>0)enqueue(c);});
 b.on('healResolved',c=>{
  if(!(c.actual>0)||!actual(c.source)||!core(c.target)||c.opts?.kazdel||c.opts?.revive||c.opts?.redistribution)return;
  record(c.source,0,true);states.get(c.target.ownerId).marks.set(c.target.uid,b.time+HEAL_MARK_SECONDS);
 });
 b.on('spGain',c=>{if(actual(c.unit)&&states.get(c.unit.ownerId)?.tier>=2&&['time','attack','hurt'].includes(c.reason))c.amount*=NATURAL_SP_SCALE;});
 b.on('skillStart',({unit:u,reason})=>{
  const st=states.get(u.ownerId);if(!st||!actual(u)||!live(u)||reason==='carry'||!b.started)return;
  const lost=Math.min(.1*u.hp,Math.max(0,u.hp-1));
  if(lost>0){skillFlow(()=>{u.hp-=lost;});st.metrics.skillLoss+=lost;st.recoveries.push({uid:u.uid,amount:SKILL_RECOVERY_MULTIPLIER*lost,remaining:1});}
  if(st.tier===3&&b.time+1e-8>=st.resonanceReady&&st.Q>=1.1*st.C){st.resonanceUntil=b.time+RESONANCE_DURATION;st.resonanceReady=b.time+RESONANCE_CD;st.metrics.resonances++;b.fx('kz-resonance',{x:u.x,y:u.y,id:u.id,t:RESONANCE_DURATION});}
 });
 b.on('battleStart',()=>{
  for(const st of states.values()){
   const r=roster(st,true);if(!st.carried||!(st.K0>0))st.K0=storageCapacity(st.C,r.N,r.H);
   st.B=generationBudget(st.tier,st.S,st.K0);refresh(st);
   if(!st.carried){st.Q=Math.min(st.K,openingFire(st.tier,st.C,r.H));st.generated=st.Q;}
  }
 },{priority:800});
 const flush=()=>{
  for(const a of queued.values()){
   const {st,u}=a;if(!st.N||!live(u))continue;
   let gain=a.effective*NATIVE_FIRE_RATES[st.tier-1];
   if(actual(u)&&a.attack&&!a.skill&&b.time+1e-8>=(st.fireFloorReady.get(u.uid)||0)){
    gain=Math.max(gain,st.K*ATTACK_FLOOR_RATES[st.tier-1]);st.fireFloorReady.set(u.uid,b.time+1);
   }
   addFire(st,gain,true);
   if(st.tier>=2&&actual(u)&&melee(u)&&a.attack&&!a.skill){launch(st,u,a);continue;}
   const es=[...a.targets.values()].filter(v=>valid(u,v.enemy));if(!es.length)continue;
   const n=spend(st,u,a.D0,a.skill,a.key);if(!n)continue;
   const p=parts(st,n,st.tier===3&&st.resonanceUntil>b.time);let dealt=0;
   const total=es.reduce((n,v)=>n+v.weight,0);let cancelled=0;
   for(const v of es){const share=total>0?v.weight/total:1/es.length,e=v.enemy,shield=(e.buffs||[]).reduce((x,f)=>x+(f.shield||0)+(f.shieldHits||0),0);
    const actual=applyParts(st,u,e,{arts:p.arts*share,true:p.true*share},'kz:followUp',++b._attackSeq);dealt+=actual;
    if(!(actual>0)&&(e.buffs||[]).reduce((x,f)=>x+(f.shield||0)+(f.shieldHits||0),0)>=shield)cancelled+=n*share;
   }
   if(cancelled>0){st.Q=Math.min(st.K,st.Q+cancelled);st.E=Math.min(st.C,st.E+cancelled);st.metrics.release-=cancelled;st.used.set(a.key,Math.max(0,(st.used.get(a.key)||0)-cancelled));}
   st.metrics.followUp+=dealt;
  }
  queued.clear();for(const st of states.values()){st.used.clear();st.areaActions.clear();}
 };
 const tick=dt=>{
  for(const st of states.values()){
   refresh(st);st.E=Math.min(st.C,st.E+st.C*(st.resonanceUntil>b.time?1:OUTPUT_REFILL[st.tier-1])*dt);
   for(const u of b.allyUnits)if(u.ownerId===st.pid&&core(u)&&live(u))record(u,dt,false);
   st.recoveries=st.recoveries.filter(r=>{
    const u=b.allyUnits.find(v=>v.ownerId===st.pid&&v.uid===r.uid);if(!live(u))return false;
    const d=Math.min(dt,r.remaining),n=r.amount*d/Math.max(1e-8,r.remaining);r.amount-=n;r.remaining-=d;
    // Covenant recovery is fixed healing; it neither generates fire nor earns life-flow growth.
    st.metrics.skillRecovery+=b.heal(u,u,n,{self:true,kazdel:true,kzSkillRecovery:true});return r.remaining>1e-8;
   });
   if(st.decayStart==null&&b.enemies.some(e=>live(e)&&!e.hidden))st.decayStart=b.time+DECAY_GRACE;
  }
  flush();
  for(let i=waves.length-1;i>=0;i--){const w=waves[i],next=Math.min(w.max,w.distance+SWORD_SPEED*dt);sweep(w,w.distance,next);w.distance=next;if(next>=w.max-1e-8){refund(w);waves.splice(i,1);}}
 };
 const decay=dt=>{for(const st of states.values())if(st.decayStart!=null&&b.time+1e-8>=st.decayStart){const loss=st.Q*(1-productMath_exp(-(b.time-st.lastActivity<=ACTIVITY_SECONDS?ACTIVE_DECAY_RATE:DECAY_RATE)*dt));st.Q-=loss;st.metrics.decayed+=loss;if(st.Q<1)st.Q=0;}};
 const snapshot=st=>{budget(st);const population=b.getPlayer(st.pid)?.bonds?.[CORE]?.count||[3,6,9][st.tier-1],cost=waveCost(st.tier,st.C),D=waveDamage(st.tier,population,st.S,st.Q,cost>0?Math.max(0,Math.min(cost,st.Q-reserve(st),st.E))/cost:0);return {population,waveArts:D.arts,waveTrue:D.true,lastWaveSpent:st.lastWaveSpent,generationPerSecond:st.R,generationAvailable:Math.max(0,st.R-st.secondGenerated),nativeGenerationAvailable:Math.max(0,NATIVE_FIRE_BUDGET_SHARE*st.R-st.nativeSecondGenerated),nativeSecondGenerated:st.nativeSecondGenerated,activityRemaining:Math.max(0,ACTIVITY_SECONDS-(b.time-st.lastActivity)),decayRate:st.decayStart!=null&&b.time>=st.decayStart?(b.time-st.lastActivity<=ACTIVITY_SECONDS?ACTIVE_DECAY_RATE:DECAY_RATE):0,capacity:st.K,reference:st.C,actualMembers:st.N,permanentHp:st.H,openingCapacity:st.K0,
  outputAllowance:st.E,nativeGenerated:st.nativeGenerated,attackAvailable:Math.max(0,st.Q-reserve(st)),guardEnabled:guardEnabled(st.tier),guardThreshold:guardEnabled(st.tier)?st.C:0,
  resonanceRemaining:Math.max(0,st.resonanceUntil-b.time),resonanceCooldown:Math.max(0,st.resonanceReady-b.time),
  decayGraceRemaining:st.decayStart==null?null:Math.max(0,st.decayStart-b.time),decayPerSecond:st.decayStart!=null&&b.time>=st.decayStart?st.Q*(b.time-st.lastActivity<=ACTIVITY_SECONDS?ACTIVE_DECAY_RATE:DECAY_RATE):0,
  meleeCooldowns:[...st.meleeReady].map(([uid,t])=>({uid,remaining:Math.max(0,t-b.time)}))};};
 const carry=st=>({...snapshot(st),fireFloorCooldowns:[...st.fireFloorReady].map(([uid,t])=>({uid,remaining:Math.max(0,t-b.time)})),K0:st.K0,E:st.E,marks:[...st.marks].map(([uid,t])=>({uid,remaining:Math.max(0,t-b.time)})),
  followCooldowns:[...st.followReady].map(([uid,t])=>({uid,remaining:Math.max(0,t-b.time)})),recoveries:structuredClone(st.recoveries),
  openingHp:b.allyUnits.filter(u=>u.ownerId===st.pid&&u.kind==='op').map(u=>({uid:u.uid,hp:M0.get(u.id)||u.s.maxHp})),
  waves:waves.filter(w=>w.pid===st.pid).map(w=>({...w,hit:[...w.hit]}))});
 b.on('battleStart',()=>{for(const st of states.values())if(st.carried){const c=b.getPlayer(st.pid)?.input?.contentInfo?.kazdelCarry;for(const w of c?.waves||[]){waves.push({...structuredClone(w),pid:st.pid,id:++b._attackSeq,hit:new Set(w.hit||[])});b.fx('kz-blood-sword',{x:w.x+w.dx*w.distance,y:w.y+w.dy*w.distance,dx:w.dx,dy:w.dy,width:w.width,distance:w.max-w.distance,speed:SWORD_SPEED,t:(w.max-w.distance)/SWORD_SPEED});}}});
 return {tick,decay,snapshot,carry,addFire,reserve,refresh};
}
