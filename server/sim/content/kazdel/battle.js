import {personalGrowthPoints} from '../../../../shared/kazdel-personal.js';
import {installTraits} from './traits.js';
import {CORE,BLOOD,HODRER,FLAG,BANDAGE,NEW,ITEMS} from './data.js';
import {canTargetEnemy} from '../../targeting.js';
import {effectiveProfile} from '../../ai.js';
import {bodyInKeys} from '../../body.js';
import {itemRecord,isMember,unitBonds,inRange} from '../support/index.js';
import {installMechanics,permanentHp} from './mechanics.js';
import {lifeFireRate,bloodFlowPoints,PERFORMANCE_CAP,generationBudget,curseDamage,CURSE_INTERVAL,guardCooldown,layers,nativeDamageBonus,nativeDamagePacket,resourceDamageScale,deferRate,flowPoints} from './rules.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const base=u=>u.def?.baseId||u.defId;
const dist=(a,c)=>Math.hypot(a.x-c.x,a.y-c.y);
const item=(b,u,key)=>u.items?.map(id=>ITEMS[id]||itemRecord(id)).filter(Boolean).filter(r=>r.baseId===key+'_a'||r.itemId?.startsWith(key+'_')).sort((a,c)=>Number(c.isGolden)-Number(a.isGolden))[0];
export function install(b){
 const states=new Map();let suspended=0,growthSuspended=0,bloodGrowthSuspended=0,observing=false;
 for(const p of b.players){const st=p.bonds?.[CORE];if(!st?.active)continue;
  const S=layers(st.layers),tier=Math.min(3,st.tier||1),bl=p.bonds?.[BLOOD],T=bl?.active?layers(bl.layers):0;
  const blood=bl?.active?(bl.tier>=2?.04+.0003*T:.02+.0002*T):0;
  states.set(p.playerId,{pid:p.playerId,S,tier,T,bloodTier:bl?.active?bl.tier:0,C:1000+25*S,B:generationBudget(tier,S),R:400+5*S,rate:lifeFireRate(tier,S,blood),defer:deferRate(S),Q:0,generated:0,second:-1,secondGenerated:0,guardReady:0,releaseReady:0,donations:new Map(),bloodProcs:new Map(),flow:{},metrics:{guards:0,curse:0,release:0,rescue:0,deferred:0,repaid:0}});
 }
 const traits=installTraits(b,states);b.kazdelFixed=traits;
 if(!states.size&&!b.players.some(p=>p.bandId===HODRER||p.bonds?.[BLOOD]?.active)&&!b.allyUnits.some(u=>u.items?.some(id=>ITEMS[id])))return;
 const member=u=>u?.kind==='op'&&isMember(b,u,CORE);
 const core=u=>states.get(u?.ownerId)&&member(u);
 const contributors=u=>u?.kind==='op'&&states.get(u.ownerId)&&(states.get(u.ownerId).tier>=2||member(u));
 const debts=new Map(),M0=new Map();
 const debt=u=>(debts.get(u.id)||[]).reduce((n,v)=>n+v.amount,0);
 const budget=st=>{const n=Math.floor(b.time+(st.offset||0)+1e-8);if(st.second!==n){st.second=n;st.secondGenerated=0;st.nativeSecondGenerated=0;}return Math.max(0,st.R-st.secondGenerated);};
 const capacity=u=>{const st=states.get(u.ownerId),flag=item(b,u,FLAG);return st.C+(flag?.params?.debtCapacity||0);};
 const charge=(u,amount)=>{const st=states.get(u.ownerId);if(!st||!contributors(u)||!(amount>0))return 0;st.lastActivity=b.time;const n=Math.min(amount*st.rate,budget(st),Math.max(0,(st.K||2*st.C)-st.Q));st.generated+=n;st.secondGenerated+=n;st.Q+=n;return n;};
 const bloodShield=(u,before,after)=>{const st=states.get(u.ownerId);if(!st||st.bloodTier<2||before>=u.s.maxHp*.5||after<u.s.maxHp*.5||!live(u))return;const id=base(u),r=st.bloodProcs.get(id)||{ready:0,n:0};if(b.time+1e-8<r.ready||r.n>=3)return;r.ready=b.time+10;r.n++;st.bloodProcs.set(id,r);b.addBuff(u,{key:'kz:bloodShield',shield:200+4*st.T,duration:4,visible:true});};
 const record=(u,dt=0,effective=false)=>{
  const st=states.get(u.ownerId);if(!st||!core(u)||b.kind!=='normal')return null;
  const f=st.flow[base(u)]||={tier:st.tier,blood:unitBonds(u).includes(BLOOD),units:{},points:0,bloodPoints:0};
  const v=f.units[u.uid]||={amount:0,bloodAmount:0,startHp:M0.get(u.id)||u.s.maxHp,golden:!!(u.def.golden||u.def.raw?.isGolden),seconds:0,effective:false,participated:false};
  v.seconds=(v.seconds||0)+dt;v.effective=!!v.effective||effective;v.participated=v.seconds>=8-1e-8||v.effective||!!v.shortClear;
  f.points=Math.max(...Object.values(f.units).map(x=>(personalGrowthPoints(u.def.raw,x)??Math.min(x.golden?10:6,flowPoints(x.amount,x.startHp,x.golden,x.participated)+(x.growth?.legacyPoints||0)))));
  f.bloodPoints=Math.max(...Object.values(f.units).map(x=>bloodFlowPoints(x.bloodAmount||0,x.startHp,x.golden)));return v;
 };
 const skillFlow=fn=>{bloodGrowthSuspended++;try{return fn();}finally{bloodGrowthSuspended--;}};
 const flow=(u,before,after,wasDeployed=false)=>{if(suspended||!observing||!b.started||b.finished||u.kind!=='op'||!u.deployed&&!wasDeployed||u.removed&&!wasDeployed||!Number.isFinite(before)||!Number.isFinite(after))return;const delta=Math.abs(after-before);if(!(delta>0))return;
  const st=states.get(u.ownerId);if(st){if(!growthSuspended&&core(u)&&b.kind==='normal'){
   const v=record(u);v.amount+=delta;if(!bloodGrowthSuspended)v.bloodAmount+=delta;record(u);
  }charge(u,delta);bloodShield(u,before,after);}
 };
 const attach=u=>{if(u.kind!=='op'||u._kzObserved)return;let hp=u.hp;Object.defineProperty(u,'hp',{enumerable:true,configurable:true,get(){return hp;},set(v){const old=hp;hp=v;flow(u,old,v);}});const recalc=u._recalc.bind(u);u._recalc=()=>suspend(recalc);u._kzObserved=true;};
 const suspend=fn=>{suspended++;try{return fn();}finally{suspended--;}};
 const repay=(u,n)=>{let used=0;const a=debts.get(u.id)||[];for(const v of a){const take=Math.min(n-used,v.amount);v.amount-=take;used+=take;if(used>=n)break;}debts.set(u.id,a.filter(v=>v.amount>1e-8));if(states.has(u.ownerId))states.get(u.ownerId).metrics.repaid+=used;return used;};
 const nativeFloor=u=>u.mem?.ember===true||u.s.flags.invulnerable;
 const guard=(u,amount,dmg,source)=>{const st=states.get(u.ownerId);if(!core(u)||st.Q+1e-8<st.C||b.time+1e-8<st.guardReady||amount<u.hp||dmg?.tags?.includes('hpLoss')&&!dmg.tags.includes('kz:debt')||source===u)return false;const cooldown=guardCooldown(st.Q,st.C);st.Q-=.5*st.C;st.guardReady=b.time+cooldown;st.metrics.guards++;b.fx('shield',{id:u.id,x:u.x,y:u.y,src:'kz:fatalGuard'});return true;};
 b.kazdel={states,debts,member,charge,debt,repay,suspend,flow,record,skillFlow,
  damage(source,u,amount,dmg,apply){
   if(!states.has(u.ownerId)||u.kind!=='op')return apply(amount);
   const before=u.hp,wasDeployed=u.deployed;let floorHp=1,floored=false,result=0;
   return suspend(()=>{try{
    // Original fatal handlers have first refusal, including Surtr's native withdrawal timer.
    if(amount>=u.hp&&b._hooks.fatal){u.hp=0;const f={unit:u,source:dmg?.sourceless?null:source,credit:source,dmg,amount,prevented:false};b.emit('fatal',f);u._kzFatalProbed=true;
     if(f.prevented&&u.alive){floored=true;floorHp=Math.max(1,u.hp);amount=Math.max(0,before-floorHp);}else if(u.alive)u.hp=before;
    }
    if(!u.alive)return 0;
    let deferred=0;const st=states.get(u.ownerId);
    if(core(u)&&!floored&&!nativeFloor(u)&&source?.side==='enemy'&&['phys','arts'].includes(dmg?.type)&&!dmg.tags?.includes('hpLoss'))deferred=Math.min(amount*st.defer,Math.max(0,capacity(u)-debt(u)));
    const immediate=amount-deferred;
    if(!floored&&guard(u,immediate,dmg,source)){u.hp=before;return 0;}
    // A prevented original lethal packet must leave the original floor, never its transient zero HP.
    u.hp=floored&&floorHp>before?floorHp:before;
    if(deferred>0){const a=debts.get(u.id)||[];a.push({amount:deferred,due:b.time+6});debts.set(u.id,a);st.metrics.deferred+=deferred;}
    result=apply(immediate);return result;
   }finally{delete u._kzFatalProbed;const after=u.hp,rebirth=floored&&after>before;suspended--;if(rebirth)growthSuspended++;try{flow(u,before,after,wasDeployed);}finally{if(rebirth)growthSuspended--;suspended++;}}});
  },
  surplus(source,u,n,opts){if(!core(u)||!(n>0)||opts?.kazdel&&!opts?.kzSkillRecovery)return;const st=states.get(u.ownerId);n-=repay(u,n);if(st.tier<2||n<=0)return;const peers=b.allyUnits.filter(v=>v!==u&&v.ownerId===u.ownerId&&core(v)&&live(v)&&dist(v,u)<=2&&debt(v)>0&&b.allySelectable(v,source)&&(!v.s.flags.noHeal&&!v.profile?.noHeal||source===v||opts?.ignoreNoHeal)).sort((a,c)=>debt(c)-debt(a)||a.id-c.id).slice(0,st.tier>=3?2:1);for(const v of peers){n-=repay(v,n);if(n<=0)break;}},
 };
 for(const st of states.values()){
  const input=b.getPlayer(st.pid)?.input,carry=input?.contentInfo?.kazdelCarry;
  if(carry?.round!==(input?.contentInfo?.round??b.round))continue;
  st.carried=true;st.offset=carry.time||0;for(const key of ['Q','generated','second','secondGenerated'])if(Number.isFinite(carry[key]))st[key]=carry[key];st.guardReady=carry.guardRemaining||0;st.releaseReady=carry.releaseRemaining||0;st.flow=structuredClone(carry.flow||{});
  for(const v of carry.donations||[])st.donations.set(v.id,v.remaining);for(const v of carry.bloodProcs||[])st.bloodProcs.set(v.id,{ready:v.remaining,n:v.n});
  for(const v of carry.debts||[]){const u=b.allyUnits.find(u=>u.ownerId===st.pid&&u.uid===v.uid);if(!u)continue;const a=debts.get(u.id)||[];a.push({amount:v.amount,due:v.remaining});debts.set(u.id,a);}
 }
 const snapshot=b.snapshot.bind(b);b.snapshot=()=>({...snapshot(),kazdel:[...states.values()].map(st=>({playerId:st.pid,tier:st.tier,generationRate:st.rate,releaseRemaining:Math.max(0,st.releaseReady-b.time),layers:st.S,hpBonus:[.1,.15,.2][st.tier-1]+.005*st.S,nativeDamageBonus:nativeDamageBonus(st.tier,st.S),pendingGrowth:Math.min(PERFORMANCE_CAP[st.tier-1],Object.values(st.flow).reduce((n,f)=>n+f.points,0)),soulFire:st.Q,generated:st.generated,budget:st.B,guardRemaining:Math.max(0,st.guardReady-b.time),debts:b.allyUnits.filter(u=>u.ownerId===st.pid&&debt(u)>0).map(u=>({uid:u.uid,amount:debt(u)})),...mechanics.snapshot(st)}))});
 // All real combat HP writes count; creation and removal bookkeeping are excluded.
 for(const u of b.allyUnits)attach(u);
 for(const method of ['_deploy','retreat','kill']){const original=b[method];if(typeof original==='function')b[method]=function(...args){const u=args[0],before=u?.hp,hadDeploy=u?.deploySeq>0,outer=suspended;const result=suspend(()=>original.apply(this,args));if(!outer&&b.started&&hadDeploy&&u?.kind==='op'&&live(u)&&method!=='retreat'&&(method!=='_deploy'||!args[1]?.initial)){growthSuspended++;try{flow(u,before,u.hp);}finally{growthSuspended--;}}return result;};}
 b.on('battleStart',()=>{for(const u of b.allyUnits){attach(u);if(core(u))b.addBuff(u,{key:'kz:hp',mods:{hpPct:[.1,.15,.2][states.get(u.ownerId).tier-1]+.005*states.get(u.ownerId).S},persist:true,allowDead:true});const bandage=item(b,u,BANDAGE);if(bandage)b.addBuff(u,{key:'kz:bandageHp',mods:{hpFlat:bandage.params.hpFlat},persist:true,allowDead:true});suspend(()=>{void u.s;});M0.set(u.id,states.get(u.ownerId)?.carried?(b.getPlayer(u.ownerId)?.input?.contentInfo?.kazdelCarry?.openingHp?.find(v=>v.uid===u.uid)?.hp||permanentHp(u)):permanentHp(u));}},{priority:1000});
 b.on('deploy',({unit:u})=>{attach(u);if(!M0.has(u.id))M0.set(u.id,u.s.maxHp);});
 b.on('battleStart',()=>{observing=true;},{priority:2000});

 b.on('hit',ctx=>{if(ctx.source?.kind!=='op'||ctx.target.side!=='enemy'||!core(ctx.source)||!nativeDamagePacket(ctx.dmg))return;const st=states.get(ctx.source.ownerId);ctx.dmg.mul*=1+nativeDamageBonus(st.tier,st.S);});
 b.on('heal',ctx=>{if(ctx.target.kind!=='op'||ctx.opts?.kazdel||ctx.opts?.revive||ctx.opts?.redistribution)return;const p=b.getPlayer(ctx.target.ownerId),r=item(b,ctx.target,BANDAGE),bl=p.bonds?.[BLOOD];const bloodHealing=bl?.active?layers(bl.layers)*(bl.tier>=2?.0002:.0001):0;ctx.amount*=1+(p?.bandId===HODRER?.15:0)+(r?.params?.recoveryBonus||0)+bloodHealing;});
 const heal=b.heal.bind(b);b.heal=(source,u,n,opts={})=>{const excluded=opts.kazdel&&!opts.kzSkillRecovery||opts.revive||opts.redistribution; if(excluded)growthSuspended++;try{return heal(source,u,n,opts);}finally{if(excluded)growthSuspended--;}};
 // A full-HP member with pending debt remains a legal native healing target. No-heal/isolated rules still apply.
 const injured=b.injuredAlliesInKeys.bind(b);b.injuredAlliesInKeys=(keys,healer,includeElement=false)=>{
  const out=injured(keys,healer,includeElement),set=new Set(keys||[]);
  for(const u of b.allyUnits)if(core(u)&&live(u)&&!u.hidden&&debt(u)>0&&set.has(u.tileR*21+u.tileC)&&b.allySelectable(u,healer)&&(u===healer||!u.s.flags.noHeal&&!u.profile?.noHeal)&&!out.includes(u))out.push(u);
  return out.sort((a,c)=>a.hpRatio-c.hpRatio||a.deploySeq-c.deploySeq);
 };
 const legal=(u,e)=>{const p=effectiveProfile(u);return live(u)&&live(e)&&!e.s.flags.invulnerable&&u.canAct&&!u.s.flags.disarm&&!p.heal&&!p.noAttack&&(!p.noAttackUnlessSkill||u.skill?.active)&&canTargetEnemy(u,e,p)&&(u.blocking.includes(e)||bodyInKeys(e,new Set(u.rangeKeys)));};
 const enemies=()=>b.enemies.filter(e=>live(e)&&!e.hidden);
 const credit=pid=>({side:'ally',ownerId:pid,stats:{dmg:0,kills:0,heal:0},id:'kz:'+pid});
 const hit=(st,target,n,type,tag,attackId=0,caster=null)=>b.dealDamage(caster||credit(st.pid),target,{amount:n,type,canDodge:false,sourceless:true,noSp:true,attackId,tags:['bond',`bond:${CORE}`,tag]});
 const curseAge=new Map();
 const curse=()=>{
  const groups=new Map();for(const e of enemies()){const k=e.bossPool||e;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e);}
  for(const [key,targets] of groups){let clock=curseAge.get(key);if(clock==null){clock={ageReady:b.time+1,next:0};curseAge.set(key,clock);}if(b.time+1e-8<clock.ageReady||b.time+1e-8<clock.next)continue;
   const eligible=[...states.values()].filter(st=>b.allyUnits.some(u=>u.ownerId===st.pid&&live(u)&&unitBonds(u).includes(CORE)));
   const best=eligible.sort((a,c)=>curseDamage(c.tier,c.S,c.Q,c.K)-curseDamage(a.tier,a.S,a.Q,a.K)||String(a.pid).localeCompare(String(c.pid)))[0];if(!best)continue;
   clock.next=b.time+CURSE_INTERVAL;const e=targets[0],n=curseDamage(best.tier,best.S,best.Q,best.K)*(e.isFlying?2:1);const dealt=hit(best,e,n,'true','kz:curse');best.metrics.curse+=dealt;if(dealt>0)b.fx('kz-curse-mark',{id:e.id,x:e.x,y:e.y,t:.5});
  }
 };
 const rescue=(st,us)=>{let left=Math.min(st.Q,1.25*st.C),spent=0,restored=0;const selected=us.filter(u=>u.hp<u.s.maxHp*.35).sort((a,c)=>a.hp/a.s.maxHp-c.hp/c.s.maxHp||a.id-c.id).slice(0,st.tier===1?1:2);
  for(const u of selected){const n=Math.min(left,u.s.maxHp*.5-u.hp);if(n<=0)continue;st.Q-=n;left-=n;spent+=n;restored+=b.heal(null,u,n,{self:true,kazdel:true});}
  for(const u of selected){const n=repay(u,left);left-=n;spent+=n;st.Q-=n;}
  if(st.tier===3&&restored>0){const pool=enemies().filter(e=>us.some(u=>legal(u,e)));const nearest=e=>Math.min(...selected.map(u=>dist(u,e)));const e=pool.sort((a,c)=>Number(selected.some(u=>u.blocking.includes(c)))-Number(selected.some(u=>u.blocking.includes(a)))||nearest(a)-nearest(c)||a.id-c.id)[0];if(e)hit(st,e,.5*restored*resourceDamageScale(st.tier,st.S),'true','kz:rescueEcho',++b._attackSeq);}
  st.metrics.rescue+=restored;return spent;
 };
 const release=st=>{
  if(b.time+1e-8<st.releaseReady||st.Q<1)return;
  const us=b.allyUnits.filter(u=>u.ownerId===st.pid&&core(u)&&live(u));const spent=rescue(st,us);
  if(spent){st.releaseReady=b.time+[8,6,4][st.tier-1];st.metrics.release+=spent;}
 };
 const donate=st=>{const chosen=b.getPlayer(st.pid)?.input?.contentInfo?.kazdelDonationIds||[];if(!chosen.length||b.time<4)return;
  const seen=new Set();for(const u of b.allyUnits){if(u.ownerId!==st.pid||!core(u)||!live(u)||!chosen.includes(base(u))||seen.has(base(u))||seen.size>=2)continue;seen.add(base(u));if(b.time<(st.donations.get(base(u))||4))continue;
   const n=.1*(M0.get(u.id)||u.s.maxHp),gain=n*st.rate;if(u.hp<u.s.maxHp*.65||u.hp-n<u.s.maxHp*.4||!enemies().some(e=>legal(u,e))||budget(st)+1e-8<gain||st.K-st.Q+1e-8<gain)continue;
   st.donations.set(base(u),b.time+8);b.loseHp(u,n,{source:u,tags:['kz:donation']});
  }
 };
 const mechanics=installMechanics(b,{states,core,M0,budget,debt,repay,hit,record,skillFlow});b.kazdel.mechanics=mechanics;b.kazdel.traits=traits;
 b.on('tick',({dt})=>{if(b.finished)return;for(const [id,a]of debts){const u=b.units.find(u=>u.id===id);if(!u||!live(u)){debts.delete(id);continue;}const due=a.filter(v=>v.due<=b.time+1e-8),pending=a.filter(v=>v.due>b.time+1e-8);debts.set(id,pending);for(const v of due){if(!live(u))break;b.loseHp(u,v.amount,{source:null,tags:['kz:debt']});}}
  for(const st of states.values())mechanics.refresh(st);curse();for(const st of states.values()){donate(st);release(st);}mechanics.tick(dt);mechanics.decay(dt);
 },{priority:1000});
 b.on('battleEnd',({result})=>{if(b.reason==='cleared'&&b.time<8){for(const u of b.allyUnits)if(live(u)&&core(u)){const v=record(u);if(v&&v.seconds>=1){v.shortClear=true;record(u);}}}for(const st of states.values()){const pp=result.perPlayer[st.pid];if(pp){pp.kazdelFlow=b.kind==='normal'?structuredClone(st.flow):{};pp.kazdelMetrics=structuredClone(st.metrics);pp.kazdelCarry={round:b.getPlayer(st.pid).input.contentInfo?.round??b.round,time:(st.offset||0)+b.time,Q:st.Q,generated:st.generated,second:st.second,secondGenerated:st.secondGenerated,guardRemaining:Math.max(0,st.guardReady-b.time),releaseRemaining:Math.max(0,st.releaseReady-b.time),flow:structuredClone(st.flow),...mechanics.carry(st),traits:traits?.carry(st),donations:[...st.donations].map(([id,t])=>({id,remaining:Math.max(0,t-b.time)})),bloodProcs:[...st.bloodProcs].map(([id,v])=>({id,n:v.n,remaining:Math.max(0,v.ready-b.time)})),debts:b.allyUnits.filter(u=>u.ownerId===st.pid).flatMap(u=>(debts.get(u.id)||[]).map(v=>({uid:u.uid,amount:v.amount,remaining:Math.max(0,v.due-b.time)})))};}}});
}
