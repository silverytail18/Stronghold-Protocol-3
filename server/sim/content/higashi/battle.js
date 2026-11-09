import {installCombat,actuallyBlocking,slashCandidates} from './combat.js';
import {installUltimate} from './ultimate.js';
import {installDuel} from './duel.js';
import {CORE,NINJA,DEFEND,SEAL,TALISMAN,C,N,G,layers,stats,releaseDamage,baseHp,realIdentity} from '../../../../shared/higashi-rules.js';
import {unitBonds,isMember,itemRecord} from '../support/index.js';
import {effectiveProfile} from '../../ai.js';
import {canTargetEnemy} from '../../targeting.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const family=u=>u.def?.baseId||u.defId;
const gear=(u,key)=>(u.items||[]).map(id=>u.skill?.battle?.data?.raw?.items?.[id]||itemRecord(id)).filter(r=>r?.baseId===key+'_a').sort((a,b)=>Number(b.isGolden)-Number(a.isGolden))[0];
const native=d=>!d?.sourceless&&!d?.tags?.some(t=>/^(hg:|bond|item|hpLoss)/.test(t));
const fresh=()=>({parryReady:0,markReady:0,markUntil:0,releaseUntil:0,releaseLayers:0,releaseLeft:0,releaseNext:0,releaseSerial:0,sealReady:0,sealUntil:0,shieldReady:0,shieldCount:0,firstDeploy:false});
export function install(b){
 const states=new Map(),preview=!!b.opts?.preview||b.flags?.preview===true||b.players.some(p=>p.input?.contentInfo?.higashiPreview);
 for(const p of b.players){const st=p.bonds?.[CORE],carry=p.input?.contentInfo?.higashiCarry;
  const defend=p.bandId===DEFEND||p.input?.bandId===DEFEND;
  states.set(p.playerId,{pid:p.playerId,tier:st?.active?Math.min(3,st.tier||1):0,L:layers(st?.layers||0),ninja:p.bonds?.[NINJA]?.active?Math.min(2,p.bonds[NINJA].tier||1):0,defend,offset:carry?.elapsed||0,Q:carry?.Q??(st?.active?C.startingStances[Math.min(3,st.tier||1)-1]:0),releaseReady:carry?.releaseReady??C.releaseEarliest,windReady:carry?.windReady??(st?.active?C.windIntervals[Math.min(3,st.tier||1)-1]:0),passiveSecond:carry?.passiveSecond??Math.floor(carry?.elapsed||0),lastEvent:carry?.lastEvent||0,lastNinja:carry?.lastNinja??-10,bucket:carry?.bucket??-1,bucketUsed:carry?.bucketUsed||0,attackUsed:carry?.attackUsed||0,attackNames:new Set(carry?.attackNames||[]),decayBucket:carry?.decayBucket??-1,serial:carry?.serial||0,units:new Map(Object.entries(carry?.units||{})),families:new Map(Object.entries(carry?.families||{})),ultimate:carry?.ultimate??0,ultimateReady:carry?.ultimateReady??0,ultimateFullAt:carry?.ultimateFullAt??null,ultimateSecond:carry?.ultimateSecond??Math.floor(carry?.elapsed||0),ultimateGuardSecond:carry?.ultimateGuardSecond??-1,ultimateGuardUsed:carry?.ultimateGuardUsed??0,ultimateSerial:carry?.ultimateSerial??0,ultimatePending:carry?.ultimatePending??null,duelBurstReady:carry?.duelBurstReady??0,growth:{},metrics:{parries:0,releases:0,effectiveReleases:0,granted:0,spent:0,expired:0,physical:0,arts:0,trueDamage:0,ninjaDamage:0,attackSupply:0,parrySupply:0,ninjaSupply:0,passiveSupply:0,windVolleys:0,windTargets:0,shields:0,sealSp:0,ultimates:0,ultimateHits:0,insightHits:0,duelBursts:0},releaseUsers:new Map(Object.entries(carry?.releaseUsers||{}).map(([serial,ids])=>[+serial,new Set(ids)])),credit:{side:'ally',ownerId:p.playerId,id:'higashi:'+p.playerId,stats:{dmg:0,kills:0,heal:0,taken:0,attacks:0}}});
 }
 if(!b.players.some(p=>p.bonds?.[CORE]||p.bonds?.[NINJA])&&!b.allyUnits.some(u=>gear(u,SEAL)||gear(u,TALISMAN)))return;
 const state=u=>states.get(u?.ownerId),time=s=>b.time+s.offset;
 const identity=u=>realIdentity(u,unitBonds(u));
 const U=u=>{const s=state(u);if(!s)return null;const k=String(u.uid??u.id);if(!s.units.has(k))s.units.set(k,fresh());return s.units.get(k);};
 const F=u=>{const s=state(u),id=family(u);if(!s.families.has(id))s.families.set(id,{parryReady:0,markReady:0,sealReady:0});return s.families.get(id);};
 const supply=(s,n,reason,name=null)=>{if(preview||!s.tier)return;const T=time(s),bucket=Math.floor(T+1e-7);if(s.bucket!==bucket){s.bucket=bucket;s.bucketUsed=0;s.attackUsed=0;s.attackNames.clear();}
  if(reason==='attack'){if(s.attackNames.has(name))return;s.attackNames.add(name);n=Math.min(n,C.nativeAttackGainCapPerSecond-s.attackUsed);}
  n=Math.max(0,Math.min(n,C.allSourceGainCapPerSecond-s.bucketUsed));s.bucketUsed+=n;if(reason==='attack')s.attackUsed+=n;s.Q=Math.min(100,s.Q+n);s.lastEvent=T;s.metrics[reason+'Supply']+=n;
 };
 const evidence=(u)=>{const s=state(u);if(!s?.tier||!identity(u)||!u.def.raw?.bonds?.includes(CORE)||b.kind!=='normal'||preview)return null;const id=family(u);const f=s.growth[id]||={name:u.name,cap:u.def.golden?8:6,points:0,actions:0,heal:0,seconds:0,targets:[],nativeHits:0,condition:false,guardSeconds:0,selfHit:false,tokenHit:false};f.cap=Math.max(f.cap,u.def.golden?8:6);return f;};
 const earn=(u,n)=>{const f=evidence(u);if(f)f.points=Math.min(f.cap,f.points+n);};
 const participate=u=>{const f=evidence(u);if(f&&!f.participated){f.participated=true;earn(u,u.def.golden?3:2);}};
 const expire=(u,v,T)=>{if(v.releaseLeft&&T>v.releaseUntil){state(u).metrics.expired+=v.releaseLeft;v.releaseLeft=0;}if(T>v.markUntil)v.markUntil=0;if(T>v.sealUntil)v.sealUntil=0;};
 const packet=(s,u,e,n,type,ignore=0,ninja=false,fxKind=null)=>{if(!e?.alive)return 0;const dealt=b.dealDamage(s.credit,e,{amount:n,type,defIgnorePct:ignore,canDodge:false,sourceless:true,noSp:true,tags:['bond','hg:'+type]});s.metrics[ninja?'ninjaDamage':type==='phys'?'physical':type==='true'?'trueDamage':'arts']+=dealt;if(fxKind!=='none')b.fx(fxKind||(ninja?'higashiNinja':type==='arts'?'higashiReturn':'higashiSlash'),{src:u.id,id:e.id,x:e.x,y:e.y,type});return dealt;};
 const ultimate=installUltimate(b,{states,preview,time,identity,packet,engaged:s=>b.allyUnits.some(u=>u.ownerId===s.pid&&identity(u)&&live(u)&&u.canAct&&!u.s.flags.disarm&&slashCandidates(b,u).length)});
 const duel=installDuel(b,{states,preview,time,identity,F});
 const sync=()=>{for(const u of b.allyUnits){const s=state(u);if(s?.tier&&u.kind==='op'&&isMember(b,u,CORE))b.addBuff(u,{key:'hg:stats',mods:stats(b.getPlayer(u.ownerId)?.bonds?.[CORE]?.layers??s.L),persist:true,allowDead:true});}};
 sync();b.on('battleStart',sync);b.on('layerGain',()=>b.after(0,sync));
 b.on('skillStart',({unit:u,reason,free})=>{const s=state(u);if(!preview&&u.kind==='op'&&s?.ninja&&!u.trait?.doll&&unitBonds(u).includes(NINJA)&&reason!=='carry'&&!free&&u.skill?.kind!=='passive')F(u).markReady=time(s);});
 b.on('deploy',({unit:u,initial})=>{if(u.kind!=='op')return;const v=U(u);if(!v)return;const first=!v.firstDeploy;if(first)v.firstSeq=u.deploySeq;v.firstDeploy=true;if(initial&&u.carry&&u.skill?.active&&Number.isFinite(v.skillLeft)){u.skill.timeLeft=Math.max(.001,v.skillLeft);for(const key of ['native:akafuyu:shield',u.skill._buffKey]){const buff=u.findBuff(key);if(buff)buff.timeLeft=u.skill.timeLeft;}}if(initial&&u.carry&&v.shieldAmount>0&&v.shieldUntil>time(state(u)))b.addBuff(u,{key:'hg:talisman',shield:v.shieldAmount,duration:v.shieldUntil-time(state(u))});});
 b.on('damageMitigated',ctx=>{const u=ctx.target,s=state(u);if(preview||!s?.tier||!identity(u)||!live(u)||ctx.source?.side!=='enemy'||!(ctx.amount>0)||ctx.dmg.tags?.some(t=>['dot','periodic'].includes(t))||!['phys','arts'].includes(ctx.dmg.type)||!native(ctx.dmg))return;
  if(u.buffs.some(v=>v.shieldHits>0)||u.s.flags.invulnerable)return;
  const f=F(u),T=time(s),blocked=actuallyBlocking(u);let activated=false;
  if(T+1e-7>=(f.guardUntil||0)&&T+1e-7>=f.parryReady){f.parryReady=T+C.parryCooldown;f.guardUntil=T+C.parryDuration+(s.defend?1:0);activated=true;s.metrics.parries++;s.lastEvent=T;supply(s,C.parryGain,'parry');ultimate.guard(s);b.fx('higashiParry',{src:u.id,x:u.x,y:u.y});}
  const guard=T+1e-7<(f.guardUntil||0)?C.parryReductions[s.tier-1]+(s.defend?.05:0):0;
  ctx.amount*=1-Math.max(guard,blocked?C.blockingReductions[s.tier-1]:0);
  if(blocked)participate(u);if(!activated)return;
  const seal=gear(u,SEAL),v=U(u);if(seal&&T+1e-7>=f.sealReady){f.sealReady=T+8;v.sealUntil=T+4;}
 },{priority:-9000});
 b.on('nativeActionResolved',ev=>{const u=ev.attacker;if(u?.kind!=='op'||!live(u)||preview)return;const s=state(u),v=U(u);if(!s||!v)return;const T=time(s);expire(u,v,T);
  const attack=ev.actualDamage>0,heal=ev.actualHeal>0;if(!attack&&!heal)return;
  if((attack||heal)&&identity(u)&&s.tier){supply(s,C.nativeAttackGain,'attack',family(u));participate(u);}
  if(attack&&identity(u)&&s.tier){const f=evidence(u);if(f){f.selfHit=true;
   if(u.name==='宴'&&u.skill?.id==='skchr_utage_2'&&u.deploySeq===v.firstSeq&&b.time-u.deployedAt>=6&&!f.condition){f.condition=true;earn(u,u.def.golden?3:2);}
   if(u.name==='赤冬'&&u.mem.hgNative?.shieldUsed){u.mem.hgNative.shieldUsed=false;earn(u,u.def.golden?4:3);}
  }}
  const seal=gear(u,SEAL);if(seal&&identity(u)&&s.tier&&v.sealUntil>=T&&v.sealUntil>0){v.sealUntil=0;const sk=u.skill;if(sk&&!sk.noSkill){const before=sk.sp+sk.charges*sk.spCost;sk.gainSp(seal.params.sp,'hg:seal');s.metrics.sealSp+=Math.max(0,sk.sp+sk.charges*sk.spCost-before);}}
  const talisman=gear(u,TALISMAN);if(talisman&&T+1e-7>=v.shieldReady){v.shieldCount++;if(v.shieldCount>=3){v.shieldCount=0;v.shieldReady=T+8;const amount=baseHp(u)*talisman.params.shieldRatio,old=u.findBuff('hg:talisman');if(!old||old.shield<amount)b.addBuff(u,{key:'hg:talisman',shield:amount,duration:4});s.metrics.shields++;}}
  if(!attack||u.trait?.doll)return;
  const hitTargets=(ev.hitTargets||[]).filter(e=>e.side==='enemy'),legal=hitTargets.filter(e=>live(e)&&canTargetEnemy(u,e,effectiveProfile(u))).sort((a,z)=>hitTargets.indexOf(a)-hitTargets.indexOf(z)||a.id-z.id),select=()=>legal.find(live),e=select();
  // Consume a lethal native action too; never retarget outside that same action.
  const f=F(u);if(s.ninja&&unitBonds(u).includes(NINJA)&&T+1e-7>=f.markReady&&e){
   f.markReady=T+N.markCooldowns[s.ninja-1];const targets=[e,...(s.ninja>=2?b.enemiesInRadius(e.x,e.y,N.splashRadius,true).filter(z=>z!==e&&live(z)&&canTargetEnemy(u,z,effectiveProfile(u))).sort((a,z)=>a.id-z.id).slice(0,N.splashMax):[])];let effective=false;
   for(const [i,z]of targets.entries()){const dealt=packet(s,u,z,u.s.atk*N.damageRatios[s.ninja-1]*(i?N.splashRatio:1),'arts',0,true);if(dealt>0){effective=true;b.applyStrongest(z,'hg:ninjaSlow',{value:N.slows[s.ninja-1],duration:N.slowDurations[s.ninja-1],source:u,mods:v=>({moveMul:1-v})});}}
   if(effective&&T-s.lastNinja>=3){s.lastNinja=T;supply(s,4,'ninja');}
  }
 });
 b.on('healResolved',({source:u,actual,opts})=>{if(!live(u)||u.kind!=='op'||!(actual>0)||!native({tags:opts?.tags})||opts?.regen||opts?.kazdel)return;const f=evidence(u);if(!f)return;participate(u);
  if(u.name==='缠丸'&&u.skill?.id==='skcom_heal_self[2]'){f.heal+=actual;while(f.heal>=baseHp(u)*.2){f.heal-=baseHp(u)*.2;earn(u,u.def.golden?3:2);}}
  if(u.name==='遥'&&!opts?.tags?.includes('native:haruka:bubble')){f.heal+=actual;while(f.heal>=baseHp(u)*.2){f.heal-=baseHp(u)*.2;earn(u,u.def.golden?3:2);}}
 });
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{if(!(dealt>0)||!u||!native(dmg))return;const own=u.kind==='token'?u.ownerUnit:u,f=evidence(own);if(!f)return;participate(own);
  if(own.name==='风丸'){if(u.kind==='token')f.tokenHit=true;else f.selfHit=true;if(f.selfHit&&f.tokenHit&&!f.condition){f.condition=true;earn(own,own.def.golden?3:2);}}
  if(u.name==='白雪'&&u.skill?.id==='skchr_yuki_2'&&u.skill.active&&!f.targets.includes(e.id)){f.targets.push(e.id);if(f.targets.length%3===0)earn(u,u.def.golden?3:2);}
  if(u.name==='星熊'&&dmg.tags?.includes('counter')){f.nativeHits++;if(f.nativeHits%5===0)earn(u,u.def.golden?3:2);}
  if(u.name==='斩业星熊'&&dmg.tags?.includes('native:hg:counter')){f.nativeHits++;if(f.nativeHits%5===0)earn(u,u.def.golden?3:2);}
  if(u.name==='绮良')u.mem.hgLastNative=T(sFor(u));
 });
 // Kept as functions for native kit evidence without accepting arbitrary layer grants.
 function sFor(u){return state(u);}function T(s){return time(s);}
 const growNative=(u,kind)=>{if(!evidence(u))return;if(kind==='bubble'){const f=evidence(u);f.nativeHits++;if(f.nativeHits%3===0)earn(u,u.def.golden?3:2);}if(kind==='control')earn(u,u.def.golden?3:2);};
 b.on('tick',({dt})=>{for(const s of states.values()){
  const T=time(s);for(const u of b.allyUnits.filter(u=>u.ownerId===s.pid&&u.kind==='op')){const v=U(u);expire(u,v,T);const f=evidence(u);if(!f||!live(u))continue;
   if(u.name==='黑角'&&u.blocking.some(e=>e.alive)&&T-(u.mem.hgLastBlockedHit??-Infinity)<=2){f.guardSeconds+=dt;while(f.guardSeconds>=6){f.guardSeconds-=6;earn(u,u.def.golden?3:2);}}
   if(u.name==='绮良'&&T-(u.mem.hgLastNative??-Infinity)<=1.2&&u.s.blockCnt===0){f.seconds+=dt;while(f.seconds>=8){f.seconds-=8;earn(u,u.def.golden?3:2);}}
   if(u.name==='宴'&&u.skill?.id==='skchr_utage_2'&&u.deploySeq===v.firstSeq&&f.selfHit&&!f.condition&&b.time-u.deployedAt>=6){f.condition=true;earn(u,u.def.golden?3:2);}
  }

 }});
 installCombat(b,{states,preview,time,identity,U,supply,packet,ultimate});
 b.on('damaged',({source,target:u,amount})=>{if(u.name==='黑角'&&amount>0&&source?.blockedBy===u)u.mem.hgLastBlockedHit=time(state(u));});
 b.on('death',({unit:u})=>{if(u.kind!=='op')return;const v=U(u);if(v){state(u).metrics.expired+=v.releaseLeft;v.releaseLeft=0;v.markUntil=v.sealUntil=0;v.shieldCount=0;}});
 const carry=s=>({version:4,elapsed:time(s),Q:s.Q,duelBurstReady:s.duelBurstReady,ultimate:s.ultimate,ultimateReady:s.ultimateReady,ultimateFullAt:s.ultimateFullAt,ultimateSecond:s.ultimateSecond,ultimateGuardSecond:s.ultimateGuardSecond,ultimateGuardUsed:s.ultimateGuardUsed,ultimateSerial:s.ultimateSerial,ultimatePending:s.ultimatePending,bucket:s.bucket,bucketUsed:s.bucketUsed,attackUsed:s.attackUsed,attackNames:[...s.attackNames],decayBucket:s.decayBucket,releaseReady:s.releaseReady,windReady:s.windReady,passiveSecond:s.passiveSecond,lastEvent:s.lastEvent,lastNinja:s.lastNinja,serial:s.serial,releaseUsers:Object.fromEntries([...s.releaseUsers].map(([serial,ids])=>[serial,[...ids]])),units:Object.fromEntries([...s.units].map(([uid,v])=>{const u=b.allyUnits.find(u=>u.ownerId===s.pid&&String(u.uid)===uid&&u.kind==='op');const shield=u?.findBuff('hg:talisman'),ultShield=u?.findBuff('hg:ultimateShield');return[uid,{...v,ultimateShieldAmount:ultShield?.shield||0,ultimateShieldUntil:ultShield?time(s)+ultShield.timeLeft:0,shieldAmount:shield?.shield||0,shieldUntil:shield?time(s)+shield.timeLeft:0,skillLeft:Math.min(1e9,u?.skill?.timeLeft||0)}];})),families:Object.fromEntries(s.families),native:b.higashiNativeCarry?.(s.pid)||{}});
 b.on('battleEnd',({result})=>{for(const [pid,s]of states){const p=result.perPlayer?.[pid];if(!p)continue;
  const personal=Object.values(s.growth).reduce((n,f)=>n+f.points,0),performance=b.kind==='normal'&&!preview?Math.min(G.parryCapsByTier[s.tier-1]||0,Math.floor(s.metrics.parries/G.parriesPerLayer))+Math.min(G.releaseCapsByTier[s.tier-1]||0,s.metrics.effectiveReleases*G.layersPerEffectiveRelease):0;
  p.higashi={version:4,personal:Math.min(G.teamPersonalCapsByTier[s.tier-1]||0,personal),performance:Math.min(G.performanceCapsByTier[s.tier-1]||0,performance),points:Object.fromEntries(Object.entries(s.growth).map(([id,f])=>[id,f.points])),metrics:{...s.metrics},carry:carry(s)};
 }});
 const currentMembers=pid=>b.allyUnits.filter(u=>u.ownerId===pid&&live(u)&&identity(u));
 b.higashi={states,duelView:pid=>{const s=states.get(pid);return s?duel.view(s):null;},currentMembers,clock:pid=>time(states.get(pid)||{offset:0}),nativeEvidence:growNative,carry,view:()=>[...states.values()].filter(s=>s.tier).map(s=>{
  const own=currentMembers(s.pid),ready=new Set(own.filter(u=>(s.families.get(family(u))?.parryReady||0)<=time(s)).map(family)),total=new Set(own.map(family)).size;
  return{playerId:s.pid,layers:layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L),tier:s.tier,stance:s.Q,duel:duel.view(s),ultimate:s.ultimate,ultimateCooldown:Math.max(0,s.ultimateReady-time(s)),ultimateCasting:!!s.ultimatePending,cooldown:Math.max(0,s.releaseReady-time(s)),guards:{ready:ready.size,total},...stats(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L),metrics:{...s.metrics},windows:[...s.units].filter(([,v])=>v.releaseLeft&&v.releaseUntil>time(s)).map(([uid,v])=>({uid:+uid,left:v.releaseLeft,remaining:Math.max(0,v.releaseUntil-time(s))}))};
 })};
}
