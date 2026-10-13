import {aggregateMods} from '../../buffs.js';
import {absoluteRangeKeys} from '../../targeting.js';
import {frontOf,dirVec} from '../../dir.js';
import {AMIYA,DOLRIS,AMORIS,MORTIS,TMORIS,OBLVNS,KALTS2} from './data.js';
import {live,family,girls,allies,enemies,talent,rand,hurt,direct,stat,beginAttack,endAttack} from './common.js';
import {gainFever,inFever,state} from './fever.js';
import {emitNote,updateNotes} from './notes.js';
import {kalts2} from './kalts2.js';
import {nearl} from './nearl.js';
import {NEARL} from './data.js';
import {ASSETS} from './assets.js';
const tag='rm:own',interval=u=>Math.max(.1,u.s.bat*100/Math.max(1,u.s.aspd));
const attackEvent=endAttack;
function inspire(b,a,source,atk,def=0){
 if(!live(a)||a.mem.noInspire)return;
 for(const [kind,value]of [['atk',atk],['def',def]]){if(!(value>0))continue;const key=kind==='atk'?'inspire':'inspire:def',cur=a.findBuff(key);if(cur?.data?.src!==source.id&&cur?.data?.val>value&&cur.timeLeft>.1)continue;const {add,mul}=aggregateMods(a.buffs.filter(v=>v.key!==key)),f=Math.max(0,1+(add[kind+'Pct']||0))*(mul[kind+'Mul']||1);b.addBuff(a,{key,mods:{[kind+'Flat']:value/Math.max(1e-6,f)},duration:.15,source,data:{src:source.id,val:value}});}
}
function supportSkills(chess){return Object.fromEntries(chess.skills.map(s=>[s.skillId,{kind:'duration',targeting:s.rangeGrid?{rangeGrid:s.rangeGrid}:undefined,trigger:'SEARCH'}]));}
function amiya(bb,chess,def){const skills={};for(const s of chess.skills){const p=s.bb;if(s.index===0)skills[s.skillId]={kind:'duration',mods:{aspd:p.attack_speed}};if(s.index===1)skills[s.skillId]={kind:'duration',trigger:'SP_FULL',attack:{hits:p['attack@times'],atkScale:p['attack@atk_scale'],randomHits:true},onEnd({battle,unit,reason}){if(reason==='duration')battle.applyStatus(unit,'stun',{duration:p.stun,source:unit});}};if(s.index===2)skills[s.skillId]={kind:'duration',mods:{atkPct:p.atk,hpPct:p.max_hp},targeting:{rangeGrid:s.rangeGrid},attack:{dmgType:'true'},onEnd({battle,unit,reason}){if(reason!=='death')battle.retreat(unit,{reason:'rm:amiya:chimera'});}};}
 return{skills,talents:[{install(b,u){const t=talent(def,0);b.on('attack',({attacker,targets})=>{if(attacker===u&&targets.some(v=>v.side==='enemy'))u.skill.gainSp(t['amiya_t_1[atk].sp']||0,'rm:amiya:talent');},{owner:u});b.on('kill',({killer,victim})=>{if(killer===u&&victim.side==='enemy')u.skill.gainSp(t['amiya_t_1[kill].sp']||0,'rm:amiya:kill');},{owner:u});if(chess.module?.active)b.on('attack',({attacker,targets})=>{if(attacker===u&&targets.some(v=>['ELITE','BOSS'].includes(v.def?.rank)))u.skill.gainSp(1,'rm:amiya:module');},{owner:u});}}]};}
function dolris(bb,chess,def){
 const skills=supportSkills(chess),t0=talent(def,0),t1=talent(def,1);
 for(const s of chess.skills){skills[s.skillId].trigger='NEVER';if(s.index===1)skills[s.skillId].onStart=({unit})=>{unit.mem.rmPulse=0;};}
 return{skills,talents:[{install(b,u){u.mem.noInspire=true;u.profile.auraRatio=0;u.profile.noAttack=true;u.mem.rmHealClock=0;
  b.every(.05,()=>{if(!live(u))return;const sk=u.skill,active=sk.active,p=sk.bb,s2=active&&sk.id==='skchr_dolris_2',as=allies(b,u);
   if(chess.module?.active&&as.filter(a=>a.kind==='op'&&a!==u).length>=2&&!active)b.addBuff(u,{key:'rm:dolris:module',mods:{atkMul:1.08},duration:.1});
   if(!s2)for(const a of as)b.addBuff(a,{key:`rm:dolris:regen:${u.id}`,mods:{hpRegen:u.s.atk*.1},duration:.1,source:u});
   if(active){for(const a of as)if(a!==u)inspire(b,a,u,u.s.atk*p['attack@atk'],s2?0:u.s.atk*p['attack@def']);}
   if(!active&&u.canAct){u.mem.rmHealClock+=.05;if(u.mem.rmHealClock>=t0['attack@heal_cd']){u.mem.rmHealClock=0;const a=hurt(b,u)[0];if(a)b.heal(u,a,u.s.atk*t0['attack@heal_scale']);}}
   if(s2&&u.canAct){u.mem.rmPulse+=.05;if(u.mem.rmPulse+1e-9>=p.interval){u.mem.rmPulse-=p.interval;const e=rand(b,enemies(b,u,u.liveRangeGrid,true));if(e)b.dealDamage(u,e,{amount:u.s.atk*p['attack@atk_scale'],type:'arts',isSkill:true,tags:[tag]});const hs=hurt(b,u),a=hs.find(a=>a.def.baseId===OBLVNS)||hs[0];if(a)b.heal(u,a,u.s.atk*p['attack@heal_scale']);}}
   if(!active&&sk.ready&&!sk.opCooling&&u.canAct&&(hurt(b,u).length||enemies(b,u,u.rangeGrid,true).length))sk.activate('rm:dolris:engaged');
  },{owner:u});
  b.on('heal',({source,target,amount,opts})=>{if(source===u&&amount>0&&!opts?.regen&&!opts?.aura&&target.ownerId===u.ownerId&&target.def?.bonds?.includes('girlbandShip'))gainFever(b,u,t1.normal_cnt);},{owner:u});
  b.on('damaged',({target,dmg})=>{if(!live(u)||!live(target)||!u.skill.active||u.skill.id!=='skchr_dolris_1'||!dmg||!allies(b,u).includes(target))return;b.heal(u,target,u.skill.bb['attack@heal_value_s1']);},{owner:u});
  b.on('attack',({attacker,targets})=>{if(!live(u)||!girls(b,u.ownerId).includes(attacker)||!allies(b,u).includes(attacker))return;for(const e of targets)if(e.side==='enemy'&&live(e))b.dealDamage(u,e,{amount:u.s.atk*t1.atk_scale,type:'arts',tags:[tag,'rm:dolris:rider']});},{owner:u});
 }}]};
}
function amoris(bb,chess,def){const skills=supportSkills(chess),t0=talent(def,0),t1=talent(def,1);return{skills,talents:[{install(b,u){u.profile.noAttack=true;u.mem.rmNextAttack=0;
 b.every(.05,()=>{if(!live(u)||!u.canAct||u.s.flags.disarm||b.time<u.mem.rmNextAttack)return;u.skill.onAboutToAttack();u.mem.rmNextAttack=b.time+interval(u);const active=u.skill.active,p=u.skill.bb,es=enemies(b,u,u.liveRangeGrid,false),targets=beginAttack(b,u,es.slice(0,1),active);if(!targets)return;const first=u.blocking.find(live)||targets[0];
  const s2=active&&u.skill.id==='skchr_amoris_2',hits=active?(s2?8:3):1;
  const frames=ASSETS.chars[def.charId]?.spine.front.hits[active?(s2?'Skill_2':'Skill_1'):'Attack']||[0];
  for(let i=0;i<hits;i++)b.after((frames[i]||0)*interval(u)/def.stats.bat,()=>{if(!live(u)||!u.canAct)return;const e=s2?rand(b,es.filter(live)):first,scale=active?(i===0||s2&&i===4?p['attack@atk_scale_heavy']:p['attack@atk_scale_light']):1;
   const [row,col]=frontOf(u.tileR,u.tileC,u.dir),x=e?.x??col,y=e?.y??row,r=active&&!s2&&i===0?1.5:1;if(!b.grid.inRect(Math.round(y),Math.round(x)))return;
   const area=b.foesInRadius(x,y,r).filter(a=>a!==e&&!a.isFlying&&!a.s.flags.untargetable);
   const splashScale=chess.module?.active&&area.length+(e?1:0)>=3?1.15:1;
   if(e)direct(b,u,e,scale*splashScale,'phys');
   for(const a of area)direct(b,u,a,scale*.5*splashScale,'phys',['rm:amoris:splash']);
  },{owner:u});attackEvent(b,u,first?[first]:[],active);
 },{owner:u});
 b.every(t1.interval||1,()=>{if(live(u))gainFever(b,u,t1.cnt||3);},{owner:u});
 b.every(.05,()=>{if(live(u))for(const a of girls(b,u.ownerId))if(live(a))b.addBuff(a,{key:'rm:amoris:atk',mods:{atkPct:t1.atk||0},duration:.1,source:u});},{owner:u});
 b.on('hit',({source,target,dmg})=>{if(source!==u||!live(target)||dmg.type==='element'||b.rng()>=t0.prob)return;b.applyStatus(target,'fragile',{duration:t0['weak[limit]'],value:t0.damage_scale-1,source:u});},{owner:u});
 }}]};}
function mortis(bb,chess,def){const t0=talent(def,0),t1=talent(def,1),skills={};for(const s of chess.skills){const p=s.bb;skills[s.skillId]=s.index===0?{kind:'duration',mods:{defPct:p.def,blockCnt:p.block_cnt,taunt:p.taunt_level},trigger:'TAKE_DAMAGE'}:{kind:'duration',mods:{batPct:p.base_attack_time/def.stats.bat},targeting:{rangeGrid:s.rangeGrid},attack:{dmgType:'arts',hits:3,atkScale:p['attack@atk_scale'],randomHits:true,onSegmentHit({battle,unit,target}){if(target?.side==='enemy')battle.dealDamage(unit,unit,{amount:p.value,type:'arts',tags:['rm:mortis:self']});}}};}
 return{skills,talents:[{install(b,u){
 b.on('damageMitigated',ctx=>{if(ctx.target!==u||!['phys','arts'].includes(ctx.dmg.type)||!(ctx.amount>0))return;const p=t0.damage_resistance||.3,amount=ctx.amount*p*t0.dark_damage_mul_factor;ctx.amount*=1-p;b.dealDamage(u,u,{amount,type:'element',element:'apoptosis',tags:['rm:mortis:conversion']});},{owner:u});
 b.on('damaged',({target})=>{if(target===u)gainFever(b,u,t1.cnt);},{owner:u});
 b.on('fatal',ctx=>{if(ctx.unit!==u||ctx.prevented||u.trait.doll)return;ctx.prevented=true;u.trait.doll=true;const s1=u.skill.active&&u.skill.id==='skchr_mortis_1';u.mem.rmMortisS1=s1;
  b.addBuff(u,{key:'rm:mortis:doll',duration:20,mods:{hpMul:chess.module?.active?1.2:1,defPct:t0.def,blockCnt:s1?0:-99},flags:{disarm:true},visible:true,onExpire(){u.trait.doll=false;u.mem.rmMortisS1=false;u.markDirty();u.hp=u.s.maxHp;if(u.skill.active&&u.skill.id==='skchr_mortis_1')u.skill.end('rm:dollReturn');b.fx('swap',{id:u.id,x:u.x,y:u.y});}});u.markDirty();u.hp=u.s.maxHp;if(s1)u.skill.timeLeft=Infinity;else if(u.skill.active)u.skill.end('rm:doll');b.releaseBlocked(u);b.fx('substitute',{id:u.id,x:u.x,y:u.y});
 },{owner:u,priority:100});
 b.on('attack',({attacker})=>{if(!live(u)||!u.trait.doll||!girls(b,u.ownerId).includes(attacker)||b.rng()>=t0.prob)return;const buff=u.findBuff('rm:mortis:doll');if(buff)buff.timeLeft=Math.max(.001,buff.timeLeft-t0.delta_time);},{owner:u});
 b.every(.05,()=>{if(!live(u))return;for(const a of girls(b,u.ownerId))if(live(a))b.addBuff(a,{key:'rm:mortis:hp',mods:{hpPct:t1.max_hp},duration:.1,source:u});},{owner:u});
 }}]};}
function tmoris(bb,chess,def){const t0=talent(def,0),t1=talent(def,1),skills={};const expanded=def.raw.talents.find(t=>t.index===0)?.rangeGrid||def.rangeGrid;
 const cast=(b,u,p)=>{const targets=enemies(b,u,expanded,false),frames=ASSETS.chars[def.charId]?.spine.front.hits.Skill_1||[.367,.5,.633,.767,.9];for(let i=0;i<p.times;i++)b.after(frames[i],()=>{if(live(u)&&u.canAct)for(const e of targets)if(live(e))b.dealDamage(u,e,{amount:u.s.atk*p.atk_scale,type:'arts',isSkill:true,tags:[tag,'rm:tmoris:s1']});},{owner:u});};
 for(const s of chess.skills){const p=s.bb;skills[s.skillId]=s.index===0?{kind:'duration',duration:2.1,charges:2,targeting:{rangeGrid:expanded},flags:{disarm:true},onStart({battle,unit}){cast(battle,unit,p);}}:{kind:'duration',targeting:{rangeGrid:expanded},flags:{disarm:true},onStart({battle,unit}){unit.mem.rmTmorisPulse=0;for(const e of enemies(battle,unit,expanded,false))battle.applyStatus(e,'fear',{duration:p.fear,source:unit});},onTick({battle,unit,dt}){unit.mem.rmTmorisPulse+=dt;while(unit.mem.rmTmorisPulse+1e-9>=p['attack@interval']){unit.mem.rmTmorisPulse-=p['attack@interval'];for(const e of enemies(battle,unit,expanded,false))battle.dealDamage(unit,e,{amount:unit.s.atk*p['attack@atk_scale'],type:'arts',isSkill:true,tags:[tag]});}}};}
 return{skills,talents:[{install(b,u){if(chess.module?.active)stat(b,u,'rm:tmoris:dodge',{dodgePhys:.15,dodgeArts:.15});
 b.on('hit',({source,target,dmg})=>{if(source!==u||!live(target)||dmg.type==='element')return;const scale=u.skill.active&&u.skill.id==='skchr_tmoris_2'?u.skill.bb.talent_scale:1;if(b.rng()<t0.prob*scale)b.applyStatus(target,'sluggish',{duration:t0.sluggish,source:u});},{owner:u});
 b.on('statusApplied',({source,status})=>{if(source===u&&['sluggish','fear'].includes(status))gainFever(b,u,t1.cnt);},{owner:u});
 b.on('hit',({source,target,dmg})=>{if(!live(u)||!girls(b,u.ownerId).includes(source)||!['phys','arts','true'].includes(dmg.type))return;if(target.findBuff('sluggish')||target.s.flags.fear)dmg.mul*=t1.damage_scale;},{owner:u});
 b.on('skillStart',({unit})=>{if(unit===u||!live(u)||u.skill.id!=='skchr_tmoris_1'||!girls(b,u.ownerId).includes(unit))return;cast(b,u,u.skill.bb);},{owner:u});
 }}]};}
function oblvns(bb,chess,def){const t0=talent(def,0),t1=talent(def,1),skills={};for(const s of chess.skills){const p=s.bb;
 if(s.index===0)skills[s.skillId]={kind:'instant',charges:2,trigger:'NEVER',onStart({battle,unit}){const e=enemies(battle,unit)[0];for(let i=1;i<=8;i++)emitNote(battle,unit,e,p[i===1?'atk_scale':`atk_scale_${i}`],'arts');}};
 if(s.index===1)skills[s.skillId]={kind:'instant',trigger:'NEVER',onStart({battle,unit}){if(!inFever(battle,unit.ownerId)&&state(battle,unit.ownerId).heat<450)unit.mem.rmOrgan=!unit.mem.rmOrgan;}};
 if(s.index===2)skills[s.skillId]={kind:'duration',mods:{aspd:p['attack@attack_speed']},targeting:{rangeGrid:s.rangeGrid}};
 }
 return{skills,talents:[{install(b,u){u.profile.noAttack=true;u.mem.rmNotes=[];u.mem.rmNoteSeq=0;u.mem.rmNextAttack=0;u.mem.rmOrgan=false;
 b.on('retreat',({unit})=>{if(unit===u)u.mem.rmNotes=u.mem.rmNotes.filter(n=>n.state==='track');},{owner:u});
 b.every(.05,()=>{if(!live(u)){updateNotes(b,u,.05,new Set());return;}const sk=u.skill,fever=inFever(b,u.ownerId),active=sk.active,own=absoluteRangeKeys(u.liveRangeGrid,u.tileR,u.tileC,u.dir),keys=new Set(own);
  if(t1.enable)for(const a of girls(b,u.ownerId))if(a!==u&&live(a)&&a.baseRangeKeys.some(k=>u.baseRangeKeys.includes(k)))for(const k of a.baseRangeKeys)keys.add(k);b.setExtraRange(u,[...keys].filter(k=>!own.includes(k)));
  if(sk.id==='skchr_oblvns_2'){b.addBuff(u,{key:'rm:oblvns:tone',mods:u.mem.rmOrgan?{aspd:sk.bb['attack@attack_speed']}:{atkPct:sk.bb['attack@atk']}});}
  if(sk.id==='skchr_oblvns_1'&&sk.charges>=2&&!sk.active&&u.canAct)sk.activate('rm:oblvns:full');
  if(sk.id==='skchr_oblvns_2'&&sk.ready&&!sk.opCooling&&!fever&&u.canAct&&enemies(b,u).length)sk.activate('rm:oblvns:toggle');
  if(u.canAct&&!u.s.flags.disarm&&b.time>=u.mem.rmNextAttack){sk.onAboutToAttack();u.mem.rmNextAttack=b.time+interval(u);const es=b.enemiesInKeys(u.rangeKeys,u,{canHitFly:true}),targets=beginAttack(b,u,es.slice(0,1),sk.active),first=targets?.[0];
   if(targets){if(sk.active&&sk.id==='skchr_oblvns_3'){const ph=es.slice().sort((a,z)=>z.s.res-a.s.res||a.id-z.id)[0],ar=es.slice().sort((a,z)=>z.s.def-a.s.def||a.id-z.id)[0];for(let i=0;i<2;i++){emitNote(b,u,ph,sk.bb['attack@atk_scale'],'phys','piano');emitNote(b,u,ar,sk.bb['attack@atk_scale'],'arts','organ');}}
   else {const tone=sk.id==='skchr_oblvns_2',n=tone&&fever?2:1;for(let i=0;i<n;i++)emitNote(b,u,first,1,tone&&u.mem.rmOrgan?'arts':'phys',tone?(u.mem.rmOrgan?'organ':'piano'):'normal');}
   attackEvent(b,u,targets,sk.active);}
  }
  updateNotes(b,u,.05,keys);
  const count=Math.min(t0.max_cnt,u.mem.rmNotes.length);u.mem.rmNoteCount=count;
  for(const a of girls(b,u.ownerId))if(live(a))b.addBuff(a,{key:'rm:oblvns:ignore',mods:{defIgnorePct:count*t0.def_penetrate_ratio,resIgnorePct:count*t0.magic_resist_penetrate_ratio},duration:.1,source:u});
  for(const a of allies(b,u))if(a.kind==='op')b.addBuff(a,{key:'rm:oblvns:aspd',mods:{aspd:t1.attack_speed},duration:.1,source:u});
  if(chess.module?.active&&enemies(b,u).length>=2)b.addBuff(u,{key:'rm:oblvns:module',mods:{aspd:12},duration:.1});
 },{owner:u});
 b.on('hit',({source,target})=>{if(source===u&&target.side==='enemy')gainFever(b,u,t1.cnt);},{owner:u});
 }}]};}
export default {[AMIYA]:amiya,[DOLRIS]:dolris,[AMORIS]:amoris,[MORTIS]:mortis,[TMORIS]:tmoris,[OBLVNS]:oblvns,[KALTS2]:kalts2,[NEARL]:nearl};
