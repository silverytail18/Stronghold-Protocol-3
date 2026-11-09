import {CORE,O,baseDamage,layers,ultimateHpRatio} from '../../../../shared/higashi-rules.js';
import {canTargetEnemy} from '../../targeting.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const family=u=>u.def?.baseId||u.defId;
// One meter per owner. Only the explicit draw/guard/engagement hooks can supply it.
export function installUltimate(b,{states,preview,time,identity,packet,engaged}){
 const own=s=>b.allyUnits.filter(u=>u.ownerId===s.pid&&identity(u)&&live(u));
 const acting=s=>own(s).filter(u=>u.canAct&&!u.s.flags.disarm);
 const targets=u=>b.enemies.filter(e=>live(e)&&!e.s.flags.invulnerable&&canTargetEnemy(u,e,{canHitFly:true}));
 const gain=(s,n)=>{if(!preview&&s?.tier>=2)s.ultimate=Math.min(O.cap,s.ultimate+n);};
 b.on('deploy',({unit:u,initial})=>{const s=states.get(u.ownerId),v=s?.units.get(String(u.uid));if(initial&&u.carry&&v?.ultimateShieldAmount>0&&v.ultimateShieldUntil>time(s))b.addBuff(u,{key:'hg:ultimateShield',shield:v.ultimateShieldAmount,duration:v.ultimateShieldUntil-time(s)});});
 function land(s,p){
  const u=own(s)[0]||b.allyUnits.find(u=>u.ownerId===s.pid&&identity(u));if(!u)return;
  const i=p.tier-2,amount=O.damageBaseRatios[i]*baseDamage(p.layers)+O.attackSumRatios[i]*p.attackSum;
  for(const e of targets(u)){
   b.fx('higashiUltimateHit',{src:u.id,id:e.id,x:e.x,y:e.y,playerId:s.pid,serial:p.serial});
   // Read impact-time HP for every legal target; bosses use their live shared pool.
   const ratio=ultimateHpRatio(e),hp=e.bossPool?.hp??e.hp,currentHp=Number.isFinite(hp)?Math.max(0,hp):0;
   packet(s,u,e,amount+currentHp*ratio,O.damageType,0,false,'none');
   if(live(e)){b.applyStatus(e,'slow',{value:O.slow,duration:O.slowDuration,source:u});b.applyStatus(e,'stun',{duration:O.stunDuration,source:u});}
  }
  for(const a of own(s)){
   const amount=a.s.maxHp*O.shieldRatios[i],old=a.findBuff('hg:ultimateShield');
   if(!old||old.shield<amount)b.addBuff(a,{key:'hg:ultimateShield',shield:amount,duration:O.shieldDuration});
  }
  s.metrics.ultimateHits++;
 }
 b.on('battleStart',()=>{if(preview)return;for(const s of states.values()){const p=s.ultimatePending,u=own(s)[0];if(p&&u)b.fx('higashiUltimate',{src:u.id,x:u.x,y:u.y,playerId:s.pid,level:p.tier,serial:p.serial,age:Math.max(0,O.hitDelay-(p.hitAt-time(s)))});}});
 b.on('tick',()=>{if(preview)return;for(const s of states.values()){
  if(s.tier<2)continue;const T=time(s),second=Math.floor(T+1e-7),active=acting(s),u=active[0];
  if(s.ultimatePending&&T+1e-7>=s.ultimatePending.hitAt){const p=s.ultimatePending;s.ultimatePending=null;land(s,p);}
  if(s.ultimateSecond!==second){s.ultimateSecond=second;if(engaged(s))gain(s,O.engagedGainPerSecond);}
  if(s.ultimate<O.cap){s.ultimateFullAt=null;continue;}
  if(s.ultimateFullAt===null)s.ultimateFullAt=T;
  if(!u||T+1e-7<s.ultimateReady||s.ultimatePending)continue;
  const legal=targets(u);if(!legal.length)continue;
  const urgent=legal.length>=5||legal.some(e=>e.isBoss||['ELITE','BOSS'].includes(e.def?.rank)||b.remainingDistance(e)<=3);
  if(!urgent&&T-s.ultimateFullAt<O.holdSeconds)continue;
  const names=new Map();for(const a of own(s))names.set(family(a),Math.max(names.get(family(a))||0,a.s.atk));
  const p={tier:s.tier,layers:layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L),attackSum:[...names.values()].sort((a,z)=>z-a).slice(0,6).reduce((a,z)=>a+z,0),hitAt:T+O.hitDelay,serial:++s.ultimateSerial};
  s.ultimate=0;s.ultimateFullAt=null;s.ultimateReady=T+O.cooldowns[s.tier-2];s.ultimatePending=p;s.metrics.ultimates++;
  b.fx('higashiUltimate',{src:u.id,x:u.x,y:u.y,playerId:s.pid,level:s.tier,serial:p.serial});
 }});
 return {gain,guard(s){if(preview||s.tier<2)return;const second=Math.floor(time(s)+1e-7);if(s.ultimateGuardSecond!==second){s.ultimateGuardSecond=second;s.ultimateGuardUsed=0;}const n=Math.max(0,Math.min(O.parryGain,O.parryGainCapPerSecond-s.ultimateGuardUsed));s.ultimateGuardUsed+=n;gain(s,n);}};
}
