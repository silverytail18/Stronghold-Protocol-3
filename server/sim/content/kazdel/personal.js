import {CORE} from './data.js';import {dirVec} from '../../dir.js';
import {nativeDamagePacket,nativeDamageBonus,flowPoints} from './rules.js';
import {TRAIT_RULES as R,kazdelTraitFor,personalGrowthPoints,personalBase} from '../../../../shared/kazdel-personal.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const info=u=>u?.kind==='op'&&u.def?.raw?.kazdelTrait?.native?kazdelTraitFor(u.def.raw):null;
const pressure=u=>live(u)&&u.blocking.some(e=>live(e)&&e.blockedBy===u);
const ground=u=>live(u)&&u.ground&&!u.isFlying&&!['liftoff','float','levitate','noBlock','sleep'].some(k=>u.s.flags[k]||u.profile?.[k]);
export function installTraits(b,states){
 if(!states.size&&!b.allyUnits.some(info))return null;
 const cooldowns=new Map(),deployed=new Set(),actions=new Map(),enemyCooldowns=new Map(),healTimes=new Map();let started=false;
 const key=u=>u.ownerId+':'+u.uid;
 const ready=(u,k,cd)=>{const id=key(u)+':'+k;if(b.time+1e-8<(cooldowns.get(id)||0))return false;cooldowns.set(id,b.time+cd);return true;};
 const buff=(u,key,mods,duration=.35)=>{const v=u.findBuff(key);if(v&&JSON.stringify(v.mods)===JSON.stringify(mods)){v.timeLeft=duration;return v;}return b.addBuff(u,{key,mods,duration,visible:true});};
 const record=u=>started?b.kazdel?.record(u):null;
 const points=(u,v)=>personalGrowthPoints(u.def.raw,v)??Math.min(v.golden?10:6,flowPoints(v.amount,v.startHp,v.golden,v.participated)+(v.growth?.legacyPoints||0));
 const grow=(u,k,n=1)=>{const v=record(u);if(!v)return;const before=points(u,v);v.growth||={};v.growth[k]=(v.growth[k]||0)+n;record(u);
  const earned=points(u,v)-before;if(earned>0){const ctx={playerId:u.ownerId,bondId:CORE,n:earned,reason:'garrison',source:u,tile:b._sourceTile(u)};b.emit('layerGain',ctx);v.growth.legacyPoints=(v.growth.legacyPoints||0)+Math.max(0,Math.floor(ctx.n-earned));record(u);}
 };
 const own=u=>!!info(u);
 for(const p of b.players){const a=p.input?.contentInfo?.kazdelFixedCarry;if(a?.round!==(p.input?.contentInfo?.round??b.round))continue;
  for(const uid of a.deployed||[])deployed.add(p.playerId+':'+uid);
  for(const v of a.cooldowns||[])cooldowns.set(p.playerId+':'+v.uid+':'+v.key,b.time+v.remaining);
  b.on('battleStart',()=>{for(const v of a.buffs||[]){const u=b.allyUnits.find(u=>u.ownerId===p.playerId&&u.uid===v.uid);if(info(u)?.id==='mudrock')buff(u,'kz:trait:mudrockProtection',{physTakenMul:.95},v.remaining);}});
 }
 const sync=u=>{
  if(u?.kind!=='op'||!live(u))return;
  const t=info(u),st=states.get(u.ownerId),isMelee=(u.def.raw?.position||u.def.position)==='MELEE';
  const common=st&&b.getPlayer(u.ownerId)?.bonds?.[CORE]?.active&&isMelee&&ground(u)?1:0;
  if(common)buff(u,'kz:trait:block',{blockCnt:1});else b.removeBuff(u,'kz:trait:block');
  if(t?.id==='vigna')buff(u,'kz:trait:vigna',{aspd:pressure(u)?R.vignaAspd:0});
  if(t?.id==='hodrer')buff(u,'kz:trait:hodrer',{defFlat:pressure(u)?R.hodrerDef:0});
  if(t||common){const v=record(u),points=v?personalGrowthPoints(u.def.raw,v):null;
   u.kazdelTraitState={name:t?.name||'近战补挡',desc:t?.desc||'',tier:st?.tier||0,baseBlock:u.base.blockCnt,commonBlock:common,traitBlock:0,skillBlock:u.s.blockCnt-u.base.blockCnt-common,currentBlock:ground(u)?u.s.blockCnt:0,reason:ground(u)?'':'当前无法地面阻挡',effects:[],growth:points??0,growthCap:v?.golden?10:6};
  }else delete u.kazdelTraitState;
 };
 const deploy=u=>{if(!started||info(u)?.id!=='surtr'||!live(u)||deployed.has(key(u)))return;deployed.add(key(u));u.skill?.gainSp(2,'kazdel:personal');grow(u,'firstDeploy');};
 b.on('deploy',({unit:u})=>{deploy(u);sync(u);});
 b.on('battleStart',()=>{started=true;for(const u of b.allyUnits){deploy(u);sync(u);}},{priority:2100});
 b.on('skillStart',({unit:u,reason})=>{if(reason!=='carry'&&info(u)?.id==='logos')grow(u,'skillStarts');sync(u);});
 b.on('skillEnd',({unit:u})=>sync(u));
 b.on('tick',({dt})=>{
  for(const u of b.allyUnits)if(live(u)){if(info(u)?.id==='hodrer'&&pressure(u))grow(u,'blockedSeconds',dt);sync(u);}
  const auras=new Map();for(const u of b.allyUnits)if(live(u)&&info(u)?.id==='king'){
   const [dy,dx]=dirVec(u.dir);for(const v of b.allyUnits)if(v.kind==='op'&&v!==u&&v.ownerId===u.ownerId&&live(v)&&Math.abs(v.x-u.x-dx)<.3&&Math.abs(v.y-u.y-dy)<.3)auras.set(v,R.kingDef);
  }for(const [u,n]of auras)buff(u,'kz:trait:kingDef',{defFlat:n});
  for(const [k,a]of actions)if(a.time+2<b.time)actions.delete(k);
 },{priority:900});
 b.on('hit',c=>{
  const u=c.source,t=info(u);if(!t||c.target?.side!=='enemy'||!nativeDamagePacket(c.dmg))return;
  const blocked=c.target.blockedBy?.kind==='op'&&live(c.target.blockedBy)&&c.target.blockedBy.ownerId===u.ownerId;
  const extra=t.id==='flameb'&&c.dmg.isAttack&&!c.dmg.isSkill&&c.target.blockedBy===u?R.flameDamage:t.id==='logos'&&c.dmg.type==='arts'&&blocked?R.logosDamage:0;
  const st=states.get(u.ownerId),bonus=st?nativeDamageBonus(st.tier,st.S):0;
  if(extra)c.dmg.mul*=(1+bonus+extra)/(1+bonus);
 },{priority:100});
 const resolved=c=>{
  const u=c.source,t=info(u),e=c.target;if(!t||!live(u)||e?.side!=='enemy'||!nativeDamagePacket(c.dmg)||!(c.dealt>0||c.absorbed>0))return;
  b.kazdel?.record(u,0,true);
  const id=c.dmg.attackId||'dot:'+Math.floor(b.time),k=key(u)+':'+id;
  let a=actions.get(k);if(!a){a={time:b.time,counts:new Set(),targets:new Set()};actions.set(k,a);}
  const once=(name,field)=>{if(a.counts.has(name))return;a.counts.add(name);grow(u,field);};
  if(c.dmg.isAttack&&!c.dmg.isSkill)once('attack','attacks');
  if(c.dmg.isAttack&&e.blockedBy===u)once('blocked','blockedAttacks');
  if(c.dmg.type==='arts')once('arts','artsAttacks');
  const explosion=['meteo','w'].includes(t.id)&&(c.dmg.isAttack||c.dmg.tags?.includes('kz:bomb'));
  if(explosion){once('explosion','explosions');if(!a.targets.has(e.id)){a.targets.add(e.id);grow(u,'blastHits');}}
  if(t.id==='meteo'&&live(e)&&e.blockedBy?.kind==='op'&&live(e.blockedBy)&&e.blockedBy.ownerId===u.ownerId)buff(e,'kz:trait:meteoDef',{defFlat:-R.meteoDef},3);
  if(t.id==='w'&&explosion&&live(e)&&!e.def.immune?.has('slow')){const ek=u.ownerId+':'+personalBase(u.def.raw)+':'+e.id;if(b.time+1e-8>=(enemyCooldowns.get(ek)||0)){enemyCooldowns.set(ek,b.time+4);b.applyStatus(e,'slow',{duration:1.5,value:R.wSlow,source:u});}}
 };
 b.on('damageResolved',resolved);b.on('damageAbsorbed',resolved);
 b.on('damageAbsorbed',c=>{const u=c.target;if(info(u)?.id!=='mudrock'||!c.shields?.some(v=>v.key==='mudrok:layers')||u.findBuff('mudrok:layers')?.shieldHits>0)return;
  grow(u,'shieldBreaks');if(ready(u,'mudrockShield',6))buff(u,'kz:trait:mudrockProtection',{physTakenMul:1-R.mudrockProtection},3);
 });
 b.on('heal',c=>{const t=info(c.source);if(!t||c.opts?.kazdel||c.opts?.revive||c.opts?.redistribution)return;
  if(t.id==='hibisc')c.amount*=1+R.hibiscHealing;
  if(t.id==='warfarin'&&c.target.hp<c.target.s.maxHp*.5)c.amount*=1+R.warfarinHealing;
 });
 b.on('healResolved',c=>{
  const u=c.source,t=info(u),v=c.target;if(!t||!(c.actual>0)||c.opts?.kazdel||c.opts?.revive||c.opts?.redistribution||v?.kind!=='op'||v.ownerId!==u.ownerId)return;
  b.kazdel?.record(u,0,true);grow(u,'healAmount',c.actual);
  if(t.id==='warfarin'&&v.hp-c.actual<v.s.maxHp*.5)grow(u,'lowHeals');
  if(t.id==='king'&&c.opts?.aura){const dt=1,k=key(u);if(healTimes.get(k)!==b.time){healTimes.set(k,b.time);grow(u,'healSeconds',dt);}}
 });
 // Route legacy grants and King's source-based bonus into the same deferred budget.
 const addLayers=b.addLayers.bind(b);b.addLayers=(pid,bond,n,reason='',opts={})=>{
  if(bond!==CORE||reason!=='garrison'||!states.has(pid))return addLayers(pid,bond,n,reason,opts);
  if(b.kind!=='normal'||!b.flags.layerGainsEnabled||!(n>0)||!Number.isFinite(n))return 0;
  const ctx={playerId:pid,bondId:bond,n,reason,source:opts.source||null,tile:opts.tile||b._sourceTile(opts.source)};b.emit('layerGain',ctx);
  const u=ctx.source,v=u&&record(u);if(!v)return 0;const before=points(u,v);
  v.growth||={};v.growth.legacyPoints=(v.growth.legacyPoints||0)+Math.max(0,Math.floor(ctx.n));record(u);
  return Math.max(0,points(u,v)-before);
 };
 const carry=pid=>({round:b.getPlayer(pid)?.input?.contentInfo?.round??b.round,deployed:b.allyUnits.filter(u=>u.ownerId===pid&&deployed.has(key(u))).map(u=>u.uid),cooldowns:b.allyUnits.filter(u=>u.ownerId===pid&&own(u)).flatMap(u=>{const t=cooldowns.get(key(u)+':mudrockShield');return t>b.time?[{uid:u.uid,key:'mudrockShield',remaining:t-b.time}]:[];}),buffs:b.allyUnits.filter(u=>u.ownerId===pid&&info(u)?.id==='mudrock').flatMap(u=>{const v=u.findBuff('kz:trait:mudrockProtection');return v?.timeLeft>0?[{uid:u.uid,remaining:v.timeLeft}]:[];})});
 b.on('battleEnd',({result})=>{for(const p of b.players)if(result.perPlayer[p.playerId])result.perPlayer[p.playerId].kazdelFixedCarry=carry(p.playerId);});
 return {sync,tick:()=>{for(const u of b.allyUnits)sync(u);},carry:st=>({}),fixedCarry:carry};
}
