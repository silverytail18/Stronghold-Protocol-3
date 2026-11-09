import {C,CORE,baseDamage,releaseDamage,layers} from '../../../../shared/higashi-rules.js';
import {effectiveProfile} from '../../ai.js';
import {canTargetEnemy,sortEnemyTargets} from '../../targeting.js';
import {bodyInKeys,bodyTileReach,bodyDist} from '../../body.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const family=u=>u.def?.baseId||u.defId;
const acting=u=>live(u)&&u.canAct&&!u.s.flags.disarm;
const legal=(u,e)=>live(e)&&!e.s.flags.invulnerable&&canTargetEnemy(u,e,{canHitFly:true});
export const actuallyBlocking=u=>live(u)&&u.blocking?.some(e=>live(e)&&e.blockedBy===u);

// Bond attacks have their own local range and can hit air. Native attack profiles remain untouched.
export function slashCandidates(b,u,wind=false){
 const keys=new Set(u.rangeKeys||[]);
 return b.enemies.filter(e=>legal(u,e)&&(bodyInKeys(e,keys)||(wind?bodyDist(e,u.x,u.y)<=C.windRadius+1e-9:bodyTileReach(e,u.tileR,u.tileC)<=1)));
}
export function installCombat(b,{states,preview,time,identity,U,supply,packet,ultimate}){
 const buff=(u,key,mods)=>{const old=u.findBuff(key);if(old&&JSON.stringify(old.mods)===JSON.stringify(mods))return;b.addBuff(u,{key,mods,persist:true,allowDead:true});};
 const sync=()=>{for(const u of b.allyUnits){if(u.kind!=='op')continue;const s=states.get(u.ownerId);
  if(!s?.tier||!identity(u)){for(const k of ['hg:survival','hg:block','hg:blockDefense'])b.removeBuff(u,k);continue;}
  buff(u,'hg:survival',{hpPct:C.hpBonuses[s.tier-1]});
  const ground=live(u)&&u.ground&&!u.isFlying&&!['liftoff','float','levitate','noBlock','sleep'].some(k=>u.s.flags[k]||u.profile?.[k]);
  const zeroSkill=u.skill?.active&&u.skill.id==='skchr_akafyu_1';
  const block=ground&&(u.def.raw?.position||u.def.position)==='MELEE'&&u.base.blockCnt>0&&!zeroSkill;
  if(block)buff(u,'hg:block',{blockCnt:C.blockBonuses[s.tier-1]});else b.removeBuff(u,'hg:block');
  if(block&&actuallyBlocking(u))buff(u,'hg:blockDefense',{defFlat:C.blockingDefenses[s.tier-1]});else b.removeBuff(u,'hg:blockDefense');
 }};
 sync();for(const event of ['battleStart','deploy','skillStart','skillEnd','blocked','death','retreat'])b.on(event,sync);
 // Removing the final blocked enemy must remove conditional defense in the same simulation step.
 for(const key of ['_unblock','releaseBlocked'])if(typeof b[key]==='function'){const original=b[key];b[key]=function(...args){const value=original.apply(this,args);sync();return value;};}
 const attackers=s=>b.allyUnits.filter(u=>u.ownerId===s.pid&&identity(u)&&acting(u));
 const slasher=u=>{const p=effectiveProfile(u);return !p.heal&&!p.noAttack&&(!p.noAttackUnlessSkill||u.skill?.active)&&['phys','arts','true'].includes(p.dmgType);};
 function strike(s,u,v,T){
  if(!v.releaseLeft||T<v.releaseNext||T>v.releaseUntil||!slasher(u))return;
  const e=sortEnemyTargets(b,u,slashCandidates(b,u))[0];if(!e)return;
  const returning=s.tier>=3&&v.releaseLeft===1,kind=returning?'higashiReturn':'higashiSlash',type=returning?'arts':'phys';
  const amount=releaseDamage(v.releaseLayers,u.s.atk,returning)*C.releaseScales[s.tier-1],ignore=returning?0:s.tier>=3?C.defIgnore9:C.defIgnore6;
  const nearby=b.enemiesInRadius(e.x,e.y,1,true).filter(z=>z!==e&&legal(u,z)).sort((a,z)=>a.id-z.id).slice(0,2);
  let effective=packet(s,u,e,amount,type,ignore,false,'none')>0;
  for(const z of nearby)effective=packet(s,u,z,amount*.5,type,ignore,false,'none')>0||effective;
  b.fx(kind,{src:u.id,id:e.id,x:e.x,y:e.y,fromX:u.x,fromY:u.y,air:!!e.isFlying});
  v.releaseLeft--;v.releaseNext=T+C.returnMinimumInterval;v.releaseUntil=T+C.window;s.metrics.spent++;
  if(effective&&!returning){const ids=s.releaseUsers.get(v.releaseSerial)||new Set(),before=ids.size;ids.add(family(u));s.releaseUsers.set(v.releaseSerial,ids);if(before<2&&ids.size===2){s.metrics.effectiveReleases++;ultimate.gain(s,20);}}
 }
 b.on('tick',()=>{
  sync();if(preview)return;
  for(const s of states.values()){
   if(!s.tier)continue;const T=time(s),i=s.tier-1,own=attackers(s),engaged=own.some(u=>slashCandidates(b,u).length);
   const second=Math.floor(T+1e-7);if(s.passiveSecond!==second){s.passiveSecond=second;if(engaged)supply(s,C.passiveGains[i],'passive');}
   if(T-s.lastEvent>=C.idleAfter&&s.decayBucket!==second){s.decayBucket=second;s.Q=Math.max(0,s.Q-C.idleDecayPerSecond);}
   if(s.Q>=C.stanceCap&&T+1e-7>=s.releaseReady&&own.some(u=>slasher(u)&&slashCandidates(b,u).length)){
    s.Q=0;s.releaseReady=T+C.releaseCooldowns[i];s.serial++;s.metrics.releases++;s.L=layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L);
    s.releaseUsers.clear();for(const u of own.filter(slasher)){const v=U(u);s.metrics.expired+=v.releaseLeft;Object.assign(v,{releaseUntil:T+C.window,releaseLayers:s.L,releaseLeft:s.tier>=3?2:1,releaseNext:T,releaseSerial:s.serial});s.metrics.granted+=v.releaseLeft;}
    b.fx('higashiRelease',{playerId:s.pid,level:s.tier});
   }
   for(const u of own)strike(s,u,U(u),T);
   if(T+1e-7<s.windReady)continue;
   const coverage=new Map(own.map(u=>[u,slashCandidates(b,u,true)])),covered=new Set([...coverage.values()].flat());
   const ranked=[...covered].sort((a,z)=>Number(!!z.blockedBy)-Number(!!a.blockedBy)||b.remainingDistance(a)-b.remainingDistance(z)||a.id-z.id),air=ranked.filter(e=>e.isFlying).slice(0,C.windAirReservations[i]);
   const targets=[...air,...ranked.filter(e=>!air.includes(e))].slice(0,C.windTargets[i]);
   if(!targets.length)continue;s.windReady=T+C.windIntervals[i];s.metrics.windVolleys++;
   for(const e of targets){const u=own.filter(u=>coverage.get(u).includes(e)).sort((a,z)=>z.s.atk-a.s.atk||a.id-z.id)[0];if(!u)continue;
    packet(s,u,e,C.windAtkRatios[i]*u.s.atk+C.windBaseRatio*baseDamage(s.L),'arts',0,false,'none');s.metrics.windTargets++;
    b.fx('higashiWind',{src:u.id,id:e.id,x:e.x,y:e.y,fromX:u.x,fromY:u.y,air:!!e.isFlying});
   }
  }
 });
}
