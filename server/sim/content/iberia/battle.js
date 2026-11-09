import {positivePow as productMath_pow} from '../../productMath.js';
import {isLighthouse} from './lighthouse.js';
import {installTraits} from './traits.js';
import {isIberiaEnemy} from '../../../../shared/iberia-wire.js';
import {CORE,FIRE,LAMP,EYE,MARK,layers,attackBonus,healingBonus,sunlight,nativeBonus,nativeDamage,directDamage,explosion,bossTarget} from '../../../../shared/iberia-rules.js';
import {unitBonds,itemRecord,gainLayers,isMember} from '../support/index.js';
import {bodyInKeys} from '../../body.js';
import {canTargetEnemy} from '../../targeting.js';
const POOL_TICKETS=new WeakMap();
const phaseOf=e=>String(e.mem.ibPhase||0)+':'+String(e.mem.phase??e.mem.bossPhase??e.mem.ab?.phase??e.mem.ab?.form??'');
const live=u=>u?.alive&&u.deployed&&!u.removed&&!u.hidden;
const identity=u=>u?.kind==='op'&&!u.trait?.doll&&unitBonds(u).includes(CORE);
const family=u=>u.def.baseId||u.defId;
const nativeHeal=o=>!o?.element&&!o?.tags?.some(t=>/(?:^|:)(bond|item)(?::|$)/.test(t));
const offensive=u=>u.def.raw?.dmgType!=='heal'&&u.def.raw?.dmgType!=='none';
const equip=(u,key)=>(u.items||[]).map(id=>u.skill?.battle?.data?.raw?.items?.[id]||itemRecord(id)).filter(r=>r?.baseId===key+'_a').sort((a,b)=>Number(b.isGolden)-Number(a.isGolden))[0];
export function install(b){
 if(!b.data.raw?.bonds?.[CORE])return;
 const states=new Map(),tickets=new Map();let serial=0;
 for(const p of b.players){const c=p.input?.contentInfo?.iberiaCarry;
  states.set(p.playerId,{pid:p.playerId,tier:p.bonds?.[CORE]?.active?Math.min(3,p.bonds[CORE].tier||1):0,L:layers(p.bonds?.[CORE]?.layers),fuel:c?.fuel??12,sunPulseCount:c?.sunPulseCount??0,sunPulseAt:b.time+(c?.sunPulseRemaining??12),sunUntil:c?.sunRemaining?b.time+c.sunRemaining:0,sunPermanent:!!(p.bonds?.[CORE]?.active&&p.bonds[CORE].tier>=3&&c?.sunPermanent),windows:structuredClone(c?.windows||{}),marks:new Map(),lit:c?.lit||0,growthUsed:c?.growthUsed||0,traits:structuredClone(c?.traits||{}),fire:p.bandId===FIRE||p.input?.bandId===FIRE,credit:{side:'ally',ownerId:p.playerId,id:'iberia:'+p.playerId,stats:{dmg:0,kills:0,heal:0,taken:0,attacks:0}},metrics:{lights:0,explosions:0,judgments:0,damage:0}});
 }
 installTraits(b,states);
 const sun=s=>s.tier>=2&&(s.sunPermanent||s.sunUntil>b.time+1e-7);
 const active=u=>{const s=states.get(u?.ownerId);return s?.tier&&identity(u)?s:null;};
 const benefit=u=>{const s=states.get(u?.ownerId);return s?.tier&&u?.kind==='op'&&!u.trait?.doll&&isMember(b,u,CORE)?s:null;};
 const mark=(s,e)=>{let m=s.marks.get(e);if(!m){m={n:0,until:0,last:-Infinity,readyAt:0,groups:new Map()};s.marks.set(e,m);}if(m.n&&m.until<=b.time+1e-7)m.n=0;return m;};
 const growth=(s,n,reason)=>{const actual=gainLayers(b,{playerId:s.pid,bonds:CORE,n,reason:'iberia:'+reason});s.L=layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L);return actual;};
 const work=u=>{if(u?.kind==='token')u=u.ownerUnit;const s=active(u);if(!s||!live(u))return;const f=family(u);const w=s.windows[f]||={remaining:2,worked:false};w.worked=true;};
 const buff=u=>{const s=benefit(u);if(!s)return;const on=sun(s);const mods={atkPct:attackBonus(s.L)+(on?.2:0),aspd:on?20:0};b.addBuff(u,{key:'ib:core',mods,persist:true,allowDead:true});};
 const pointEffect=s=>{
  for(const u of b.allyUnits)if(live(u)&&u.ownerId===s.pid&&(benefit(u)||s.tier>=3&&isLighthouse(u))){u.skill?.gainSp([0,4,6,8][s.tier],'iberia:light');b.applyStatus(u,'resist',{duration:[0,6,8,12][s.tier],source:s.credit});if(benefit(u))buff(u);}
  b.fx('iberiaLight',{ownerId:s.pid,duration:s.sunPermanent?0:sunlight(s.tier)});
 };
 const light=s=>{s.fuel-=24;s.metrics.lights++;s.lit++;if(s.lit<=3)growth(s,2,'light');if(s.tier>=3){if(!s.sunPermanent)s.sunPulseAt=b.time+12;s.sunPermanent=true;s.sunUntil=0;}else s.sunUntil=Math.max(s.sunUntil,b.time+sunlight(s.tier));pointEffect(s);};
 const poolKey=e=>{let p=e.bossPool||e;const seen=new Set();while(p.pool&&!seen.has(p)){seen.add(p);p=p.pool;}return p;};
 const eligible=(s,e)=>sun(s)&&live(e)&&e.side==='enemy'&&e.hp>0&&e.hp<e.s.maxHp*(bossTarget(e)?.10:.20)&&mark(s,e).n>0&&!tickets.has(poolKey(e))&&!POOL_TICKETS.has(poolKey(e))&&!e.mem.ibStasis&&!e.s.flags.invulnerable&&canTargetEnemy(s.credit,e,{canHitFly:true})&&b.allyUnits.some(u=>live(u)&&u.ownerId===s.pid&&identity(u)&&offensive(u)&&bodyInKeys(e,u.rangeKeys));
 const release=e=>{if(!e.mem.ibStasis)return;delete e.mem.ibStasis;b.removeBuff(e,'ib:stasis');};
 const judge=(s,e)=>{if(e?.bossPool)b._syncBossHp(e);if(!eligible(s,e))return false;const isBoss=bossTarget(e),key=poolKey(e),seq=e.deploySeq,phase=phaseOf(e);
  const ticket={serial:++serial,ownerId:s.pid,e,key,seq,phase,boss:isBoss,...(isBoss?{bossDamage:Math.min(299999,Math.max(0,key.hp))}:{}),at:b.time+1};tickets.set(key,ticket);POOL_TICKETS.set(key,ticket);mark(s,e).n=0;s.metrics.judgments++;
  if(!isBoss){e.mem.ibStasis=true;b._unblock(e);for(const u of b.allyUnits){if(u.target===e)u.target=null;if(u.targetId===e.id)u.targetId=null;}b.addBuff(e,{key:'ib:stasis',flags:{untargetable:true,invulnerable:true,noMove:true,disarm:true,noSp:true,unblockable:true,noDisplace:true}});}
  b.fx('iberiaJudgment',{ownerId:s.pid,id:e.id,serial:ticket.serial,kind:'rune',duration:1,boss:isBoss});return true;
 };
 const sync=()=>{for(const s of states.values()){s.L=layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L);for(const u of b.allyUnits)if(u.ownerId===s.pid&&benefit(u))buff(u);}
  const any=[...states.values()].some(s=>sun(s));for(const e of b.enemies){if(!live(e)||e.mem.ibStasis)continue;if(any){const other=e.buffs.filter(v=>v.key!=='ib:sun'&&v.mods?.moveMul>=0&&v.mods.moveMul<1).reduce((n,v)=>n*productMath_pow(v.mods.moveMul,v.stacks||1),1);b.addBuff(e,{key:'ib:sun',mods:{moveMul:other>.7?.7/other:1},flags:{reveal:true},duration:.15});}else b.removeBuff(e,'ib:sun');}
 };
 b.on('battleStart',()=>{for(const u of b.allyUnits){const s=active(u);if(s){const f=family(u);s.windows[f]||={remaining:2,worked:false};}const lamp=equip(u,LAMP);if(lamp&&!u.mem.ibLampGranted){u.skill?.gainSp(lamp.isGolden?15:10,'item:iberia:lamp');u.mem.ibLampGranted=true;}}sync();},{priority:-2000});
 b.on('deploy',({unit:u,initial})=>{if(!initial&&active(u))buff(u);});
 b.on('hit',ctx=>{const {source:u,target:e,dmg}=ctx;
  if(e?.side==='ally'){const s=benefit(e);if(s?.tier>=3&&sun(s)&&!s.fire&&['phys','arts'].includes(dmg.type)&&ctx.credit?.side==='enemy')dmg.mul*=.85;return;}
  const s=benefit(u);if(!s||e?.side!=='enemy')return;
  const m=mark(s,e),direct=identity(u)&&directDamage(dmg),key=dmg.attackId?u.id+':'+dmg.attackId:null;
  let g=key&&m.groups.get(key);if(!g&&direct){g={n:m.n,done:false,t:b.time};if(key)m.groups.set(key,g);}
  if(identity(u)&&(nativeDamage(dmg)||dmg.tags?.includes('item')))dmg.mul*=1+MARK.perLayer*(g?g.n:m.n);
  if(nativeDamage(dmg)&&sun(s)){const eye=equip(u,EYE),set=eye&&equip(u,LAMP)?eye.isGolden?.25:.15:0;dmg.mul*=1+nativeBonus(s.tier)+set;if(s.fire){const p=s.tier>=3?.3:.2;dmg.defIgnorePct=1-(1-dmg.defIgnorePct)*(1-p);dmg.resIgnorePct=1-(1-dmg.resIgnorePct)*(1-p);}}
  dmg._ib={s,m,g:g||{n:m.n,done:false,t:b.time},direct};
 },{priority:-9000});
 b.on('hitResolved',({source:u,target:e,dmg})=>{const a=dmg._ib;if(!a?.direct||!live(e)||a.g.done)return;const{s,m,g}=a;g.done=true;
  if(g.n===MARK.cap&&m.n===MARK.cap&&m.readyAt<=b.time+1e-7){m.n=0;m.readyAt=b.time+MARK.cooldown;s.metrics.explosions++;dmg._ibExplosion={s,amount:explosion(u.s.atk,e.s.maxHp,bossTarget(e))};}
  else if(m.n<MARK.cap&&b.time-m.last>=MARK.interval-1e-7){m.n++;m.last=b.time;m.until=b.time+MARK.duration;}
 },{priority:-9000});
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{if(dealt>0&&e?.side==='enemy'&&nativeDamage(dmg))work(u);if(dmg?._ibExplosion&&live(e)){const{s,amount}=dmg._ibExplosion;const n=b.dealDamage(s.credit,e,{amount,type:'true',sourceless:true,canDodge:false,noSp:true,tags:['bond','ib:explosion']});s.metrics.damage+=n;if(live(e))b.applyStatus(e,'stun',{duration:.6,source:s.credit});b.fx('iberiaExplosion',{ownerId:s.pid,id:e.id,x:e.x,y:e.y});}});
 b.on('heal',ctx=>{const s=benefit(ctx.source);if(!s||!nativeHeal(ctx.opts))return;const regen=ctx.opts?.regen;if(!regen)ctx.amount*=1+healingBonus(s.L);if(sun(s)){const eye=equip(ctx.source,EYE),set=eye&&equip(ctx.source,LAMP)?eye.isGolden?.25:.15:0;ctx.amount*=1+nativeBonus(s.tier)+set;}});
 b.on('healResolved',({source,amount,actual,opts})=>{if((actual??amount)>0&&nativeHeal(opts))work(source);});
 b.on('statusApplied',({source,target})=>{if(target?.side==='enemy')work(source);});
 b.on('iberiaNativeWork',({unit})=>work(unit));
 b.on('tick',({dt})=>{
  // Release uses the battle clock, while every timer owned by a frozen enemy is paused.
  for(const[key,t]of tickets){if(b.time+1e-7<t.at)continue;const e=t.e;tickets.delete(key);if(POOL_TICKETS.get(key)===t)POOL_TICKETS.delete(key);release(e);
   if(!live(e)||e.deploySeq!==t.seq||phaseOf(e)!==t.phase){b.fx('iberiaJudgment',{ownerId:t.ownerId,id:e.id,serial:t.serial,kind:'cancel'});continue;}
   const s=states.get(t.ownerId),n=b.dealDamage(s.credit,e,{amount:t.boss?t.bossDamage:.20*e.s.maxHp,type:'true',sourceless:true,canDodge:false,noSp:true,tags:['bond','ib:judgment',...(t.boss?['ib:bossJudgment']:[])]});s.metrics.damage+=n;b.fx('iberiaJudgment',{ownerId:t.ownerId,id:e.id,serial:t.serial,kind:e.alive?'survived':'kill',amount:n});
  }
  sync();for(const u of b.allyUnits)if(live(u)&&identity(u)&&b.rangeChanged(u))b.refreshRange(u);
  for(const s of states.values()){if(!s.tier)continue;const families=new Set();for(const u of b.allyUnits)if(live(u)&&u.ownerId===s.pid&&identity(u))families.add(family(u));
   for(const f of families)s.windows[f]||={remaining:2,worked:false};
   for(const[f,w]of Object.entries(s.windows)){w.remaining-=dt;if(w.remaining<=1e-7){if(families.has(f)&&w.worked)s.fuel++;w.worked=false;w.remaining+=2;}}
   while(s.fuel>=24)light(s);
   if(s.tier>=3&&s.sunPermanent)while(s.sunPulseAt<=b.time+1e-7){pointEffect(s);s.sunPulseCount++;s.sunPulseAt+=12;}
   for(const[e,m]of s.marks){if(!live(e)){s.marks.delete(e);continue;}mark(s,e);for(const[k,g]of m.groups)if(b.time-g.t>8)m.groups.delete(k);judge(s,e);}
  }
 });
 const enemyCarry=e=>({version:1,instance:e.mem.ibInstance||`${b.round}:${b.fieldId||b.kind}:${e.sourcePlayerId||e.ownerId||''}:${e.spawnSeq}:${e.id}`.slice(0,64),hpRatio:Math.max(0,Math.min(1,e.hp/e.s.maxHp)),marks:[...states.values()].map(s=>{const m=mark(s,e);return[s.pid,m.n,Math.max(0,m.until-b.time),Math.max(0,m.readyAt-b.time),Math.max(0,MARK.interval-(b.time-m.last))];}).filter(m=>m[1]>0||m[3]>0),pending:(()=>{const t=tickets.get(poolKey(e));return t?{ownerId:t.ownerId,remaining:Math.max(0,t.at-b.time),boss:t.boss,...(t.boss?{bossDamage:t.bossDamage}:{})}:null;})()});
 b.on('enemySpawn',({enemy:e})=>{const c=e.mem.ibCarry;e.mem.ibInstance=c?.instance||`${b.round}:${b.fieldId||b.kind}:${e.sourcePlayerId||e.ownerId||''}:${e.spawnSeq}:${e.id}`.slice(0,64);if(!isIberiaEnemy(c))return;e.hp=e.s.maxHp*c.hpRatio;
  for(const[pid,n,remaining,cd,gate]of c.marks){const s=states.get(pid);if(!s)continue;const m=mark(s,e);Object.assign(m,{n,until:b.time+remaining,readyAt:b.time+cd,last:b.time-MARK.interval+gate});}
  if(c.pending&&states.has(c.pending.ownerId)){const key=poolKey(e);if(!tickets.has(key)){const t={serial:++serial,ownerId:c.pending.ownerId,e,key,seq:e.deploySeq,phase:phaseOf(e),boss:c.pending.boss,...(c.pending.boss?{bossDamage:c.pending.bossDamage??Math.min(299999,Math.max(0,key.hp))}:{}),at:b.time+c.pending.remaining};tickets.set(key,t);POOL_TICKETS.set(key,t);if(!t.boss){e.mem.ibStasis=true;b._unblock(e);b.addBuff(e,{key:'ib:stasis',flags:{untargetable:true,invulnerable:true,noMove:true,disarm:true,noSp:true,unblockable:true,noDisplace:true}});}}}
 },{priority:-10000});
 const carry=pid=>{const s=states.get(pid);if(!s)return null;return{version:1,fuel:s.fuel,sunRemaining:Math.max(0,s.sunUntil-b.time),sunPermanent:s.sunPermanent,sunPulseCount:s.sunPulseCount,sunPulseRemaining:s.sunPermanent?Math.max(0,s.sunPulseAt-b.time):12,windows:structuredClone(s.windows),lit:s.lit,growthUsed:s.growthUsed,traits:structuredClone(s.traits),native:Object.fromEntries(b.allyUnits.filter(u=>u.ownerId===pid&&u.kind==='op'&&u.uid!==null).map(u=>[String(u.uid),{thornsCasts:u.mem.ibThornsCasts||0,castSerial:u.mem.ibCastSerial||0}]))};};
 b.on('battleEnd',({result})=>{for(const[key,t]of tickets)if(POOL_TICKETS.get(key)===t)POOL_TICKETS.delete(key);for(const[pid,s]of states){const r=result.perPlayer?.[pid];if(r)r.iberia={version:1,metrics:{...s.metrics},carry:carry(pid)};}});
 b.iberia={states,tickets,identity,onPhase:params=>{const e=b.enemies.find(e=>e.id===params.id);if(e)e.mem.ibPhase=(e.mem.ibPhase||0)+1;},work,enemyCarry,mark:(pid,e)=>mark(states.get(pid),e),judge:(pid,e)=>judge(states.get(pid),e),light:pid=>light(states.get(pid)),carry,
  view:()=>[...states.values()].filter(s=>s.tier).map(s=>({playerId:s.pid,tier:s.tier,fire:s.fire,layers:s.L,fuel:s.fuel,sunRemaining:Math.max(0,s.sunUntil-b.time),sunPermanent:s.sunPermanent,sunPulseCount:s.sunPulseCount,sunPulseRemaining:s.sunPermanent?Math.max(0,s.sunPulseAt-b.time):12,marks:[...s.marks].filter(([e,m])=>live(e)&&m.n>0&&m.until>b.time).map(([e,m])=>[e.id,m.n,Math.max(0,m.until-b.time),Math.max(0,m.readyAt-b.time)]),pending:[...tickets.values()].filter(t=>t.ownerId===s.pid).map(t=>[t.e.id,Math.max(0,t.at-b.time),t.boss?1:0,t.serial]),metrics:{...s.metrics}}))};
}

