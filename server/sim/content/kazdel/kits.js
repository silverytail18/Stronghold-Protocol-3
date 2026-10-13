import TIER1,{batMod} from '../kits/tier1.js';
import {beginAttack,endAttack} from '../rhodes-mujica/common.js';
import {frontOf} from '../../dir.js';
import {aggregateMods} from '../../buffs.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const talent=(c,i)=>c.talents?.filter(t=>t.index===i).at(-1)?.bb||{};
const range=(b,u,air=true)=>b.enemiesInKeys(u.rangeKeys,u,{canHitFly:air}).filter(e=>!e.s.flags.invulnerable);
const damage=(b,u,e,n,type='phys',tag='kz:skill',extra={})=>b.dealDamage(u,e,{amount:n,type,canDodge:false,tags:[tag],...extra});
const plain=s=>({kind:'duration',mods:{atkPct:s.bb.atk||0}});
const skillsOf=(c,fn)=>Object.fromEntries(c.skills.map(s=>[s.skillId,fn(s,s.bb)]));
const healOnHit=(b,u,p)=>{if(live(u))b.heal(u,u,u.s.maxHp*p,{self:true});};
const bomb=(b,u,pos,scale,stun,air=true)=>{const attackId=++b._attackSeq;for(const e of b.enemies.filter(e=>live(e)&&(!e.isFlying||air)&&Math.hypot(e.x-pos.x,e.y-pos.y)<=1.2)){damage(b,u,e,u.s.atk*scale,'phys','kz:bomb',{isSkill:true,attackId});b.applyStatus(e,'stun',{duration:stun,source:u});}b.fx('aoe',{x:pos.x,y:pos.y,id:u.id,r:1.2,skill:'kz:bomb'});};
function vigna(bb,c,d){const k=TIER1.chess_char_1_05_a(bb,c,d);k.skills=skillsOf(c,(s,p)=>({kind:'duration',mods:{atkPct:p.atk||0,batPct:batMod(p.base_attack_time,c)}}));return k;}
function hibisc(bb,c){return{skills:skillsOf(c,s=>({...plain(s),heal:true})),talents:[{install(b,u){b.addBuff(u,{key:'kz:hibisc:talent',mods:{atkPct:talent(c,0).atk||0},persist:true,allowDead:true});}}]};}
function flameb(bb,c){const t=talent(c,0),tr=c.trait?.bb||{};return{
 skills:skillsOf(c,(s,p)=>s.index===0?{kind:'instant',attack:{atkScale:p.atk_scale},onHit({battle:b,unit:u}){healOnHit(b,u,p.hp_ratio);}}:{kind:'toggle',mods:{atkPct:p.atk,aspd:p.attack_speed}}),
 talents:[{install(b,u){let kills=0,revived=false;b.on('deploy',({unit})=>{if(unit===u){kills=0;revived=false;b.removeBuff(u,'kz:flameb:growth');b.removeBuff(u,'kz:flameb:rebirth');}},{owner:u});b.on('kill',({killer,victim})=>{if(killer!==u||victim.side!=='enemy'||kills>=t.max_stack_cnt)return;kills++;b.addBuff(u,{key:'kz:flameb:growth',mods:{hpFlat:kills*t.max_hp},persist:true});},{owner:u});
  if(c.module?.active&&tr.value)b.on('fatal',ctx=>{if(ctx.unit!==u||ctx.prevented||revived)return;revived=true;ctx.prevented=true;b.addBuff(u,{key:'kz:flameb:rebirth',mods:{hpMul:1-tr.value,aspd:tr.attack_speed},persist:true});u.hp=u.s.maxHp;},{owner:u,priority:-50});}}]
};}
function meteo(bb,c){const t=talent(c,0),tr=c.trait?.bb||{};return{
 skills:skillsOf(c,(s,p)=>({kind:'instant',attack:{atkScale:p.atk_scale,splashRadius:s.index===0?2:1,splashScale:1,...(s.index===1?{onEachHit({battle:b,unit:u,target:e}){b.addBuff(e,{key:'kz:meteo:def',mods:{defFlat:p.def},duration:p.duration,source:u});}}:{})}})),
 talents:[{install(b,u){
  if(tr.def_penetrate_fixed)b.addBuff(u,{key:'kz:meteo:module',mods:{defIgnoreFlat:tr.def_penetrate_fixed},persist:true,allowDead:true});
  // Each profile belongs to one attack, including its delayed projectile and splash victims.
  b.on('beforeAttack',ctx=>{if(ctx.attacker!==u)return;if(ctx.profile===u.profile)u.profile={...u.profile};if(b.rng.chance(t.prob)){const pct=aggregateMods(u.buffs).add.atkPct||0;ctx.profile.atkScale=(ctx.profile.atkScale??1)*(1+t.atk/Math.max(.001,1+pct));}},{owner:u});
 }}]
};}
function cqbw(bb,c){const t=talent(c,0),t2=talent(c,1),tr=c.trait?.bb||{};return{
 skills:skillsOf(c,(s,p)=>s.index===0?{kind:'instant',attack:{atkScale:p.atk_scale,splashRadius:1.2,splashScale:1},onHit({battle:b,unit:u,target:e}){b.applyStatus(e,'stun',{duration:p.stun,source:u});}}:s.index===1?{kind:'instant',attack:{atkScale:0,projectile:'none'},onStart({battle:b,unit:u}){
  const cells=u.rangeKeys.map(k=>({r:Math.floor(k/21),c:k%21})).filter(v=>b.grid.canStand(v.r,v.c,{ranged:false})&&!b.unitAt(v.r,v.c));const pos=b.rng.pick(cells);if(!pos)return;const mines=u.mem.kzMines||=[];if(mines.some(m=>m.r===pos.r&&m.c===pos.c))return;mines.push({...pos,expires:b.time+120});b.fx('zone',{x:pos.c,y:pos.r,id:u.id,r:.6,dur:120,skill:'kz:mine'});
 }}:{kind:'instant',attack:{atkScale:0,projectile:'none'},onStart({battle:b,unit:u}){for(const e of range(b,u).sort((a,z)=>z.hp-a.hp||a.id-z.id).slice(0,p.max_target)){const pos={x:e.x,y:e.y};b.after(3,()=>bomb(b,u,live(e)?e:pos,p.atk_scale,p.stun),{owner:u});}}}),
 talents:[{install(b,u){b.on('tick',()=>{if(!live(u))return;if(b.time-u.deployedAt>=t.interval)b.addBuff(u,{key:'kz:w:ambush',mods:{dodgePhys:t.prob,dodgeArts:t.prob,taunt:t.taunt_level},duration:.15});const mines=u.mem.kzMines||[];u.mem.kzMines=mines.filter(m=>{if(m.expires<=b.time)return false;const trigger=b.enemies.find(e=>live(e)&&!e.isFlying&&Math.hypot(e.x-m.c,e.y-m.r)<=.6);if(trigger){const p=c.skills[1].bb;bomb(b,u,{x:m.c,y:m.r},p.atk_scale,p.stun,false);return false;}return true;});},{owner:u});
  b.on('hit',ctx=>{if(!live(u)||ctx.target.side!=='enemy'||ctx.dmg.type!=='phys')return;if(ctx.target.s.flags.stun&&range(b,u).includes(ctx.target))ctx.dmg.mul*=t2.damage_scale||1;if(ctx.source===u&&ctx.dmg.isAttack&&ctx.target.blockedBy&&tr.atk_scale)ctx.dmg.amount*=tr.atk_scale;},{owner:u});}}]
};}
function hodrer(bb,c){const t=talent(c,0),shelter=talent(c,1),tr=c.trait?.bb||{},sid=c.skill.skillId;return{
 skills:skillsOf(c,(s,p)=>s.index===0?{kind:'instant',attack:{atkScale:p.atk_scale},onHit({battle:b,unit:u}){healOnHit(b,u,p.hp_ratio);}}:s.index===1?{kind:'toggle',mods:{batPct:batMod(p.base_attack_time,c),blockCnt:p.block_cnt},onStart({unit:u}){u.mem.hodrerMode=true;},attack:{onHit({battle:b,unit:u,target:e}){b.applyStatus(e,'stun',{duration:p['attack@stun'],source:u});}}}:{kind:'duration',mods:{hpPct:p.max_hp,atkPct:p.atk},targeting:{rangeExtend:p.ability_range_forward_extend},onStart({unit:u}){u.mem.hodrerTick=0;u.mem.hodrerTouched=new Set();},onTick({battle:b,unit:u,dt}){u.mem.hodrerTick+=dt;if(u.mem.hodrerTick<1)return;u.mem.hodrerTick-=1;b.loseHp(u,p['attack@value'],{source:u});for(const id of u.mem.hodrerTouched||[]){const e=b.units.find(e=>e.id===id);if(live(e))damage(b,u,e,p['attack@damage'],'true','kz:hodrerDot');}},onHit({battle:b,unit:u,target:e}){healOnHit(b,u,p['attack@hp_ratio']);if(b.rng.chance(p['attack@buff_prob']))b.applyStatus(e,'stun',{duration:p['attack@stun'],source:u});}}),
 talents:[{install(b,u){if(sid==='skchr_hodrer_2')b.addBuff(u,{key:'kz:hodrer:passive2',mods:{atkPct:bb.atk},persist:true,allowDead:true});if(tr.heal_scale)b.addBuff(u,{key:'kz:hodrer:module',mods:{healingTakenMul:tr.heal_scale},persist:true,allowDead:true});
  b.on('hit',ctx=>{if(ctx.source===u&&ctx.dmg.isAttack)ctx.dmg.amount*=ctx.target.s.flags.stun||ctx.target.s.flags.bind?t.atk_scale:t.atk_scale_2;
   if(sid==='skchr_hodrer_3'&&u.skill?.active){const e=ctx.source===u?ctx.target:ctx.target===u?ctx.source:null;if(e?.side==='enemy')u.mem.hodrerTouched?.add(e.id);}
  },{owner:u});
  b.on('tick',()=>{if(!live(u))return;const [r,col]=frontOf(u.tileR,u.tileC,u.dir,-1);for(const a of b.allyUnits)if(live(a)&&(a===u||a.tileR===r&&a.tileC===col))b.addBuff(a,{key:'kz:hodrer:shelter',mods:{dmgTakenMul:1-(shelter.damage_resistance||0)},duration:.15});},{owner:u});}}]
};}
function logos(bb,c){const t=talent(c,0),t2=talent(c,1),ep=c.talents?.filter(t=>t.index===-1).reduce((n,t)=>Math.max(n,t.bb.ep_damage_ratio||0),0)||0;
 const reset=u=>{u.mem.logosLock=null;u.mem.logosTime=0;u.mem.logosTick=0;};
 const able=u=>live(u)&&u.canAct&&!u.s.flags.silence;
 const projectileKey=u=>'kzLogosSpeed:'+u.id;
 const restore=(q,u)=>{const speeds=q.data?.kzLogosSpeeds;if(!speeds||!(projectileKey(u) in speeds))return;delete speeds[projectileKey(u)];q.speed=Object.keys(speeds).length?q.data.kzLogosOriginalSpeed*.05:q.data.kzLogosOriginalSpeed;if(!Object.keys(speeds).length){delete q.data.kzLogosSpeeds;delete q.data.kzLogosOriginalSpeed;}};
 return{
 skills:skillsOf(c,(s,p)=>s.index===0?{kind:'toggle',mods:{atkPct:p.atk},targeting:{rangeGrid:s.rangeGrid},onTick({battle:b,unit:u}){if(!able(u))return;for(const e of range(b,u)){if(e.hp>=u.s.atk*p['attack@kill_atk_scale'])continue;const n=e.hp;damage(b,u,e,p['attack@kill_damage'],'arts','kz:logosExecute');if(!e.alive){const other=b.rng.pick(range(b,u).filter(v=>v!==e));if(other)damage(b,u,other,n,'arts','kz:logosEcho');}}}}:s.index===1?{
  kind:'duration',mods:{resFlat:p.magic_resistance},flags:{disarm:true},onStart({unit:u}){reset(u);},
  onTick({battle:b,unit:u,dt}){
   if(!able(u)){reset(u);return;}
   const list=range(b,u);if(!list.includes(u.mem.logosLock)){reset(u);u.mem.logosLock=list[0]||null;}
   const e=u.mem.logosLock;if(!e)return;u.mem.logosTime+=dt;u.mem.logosTick+=dt;
   b.addBuff(e,{key:'kz:logos:beamSlow',mods:{moveMul:1+p['attack@move_speed']*Math.min(p['attack@max_stack_cnt'],u.mem.logosTime/.5)},duration:.15});
   if(u.mem.logosTick+1e-8<p['attack@cooldown'])return;u.mem.logosTick-=p['attack@cooldown'];
   const targets=beginAttack(b,u,[e],true);if(!targets?.length)return;
   damage(b,u,targets[0],u.s.atk*u.s.atkScaleMul*(p['attack@atk_scale_base']+p['attack@atk_scale_delta']*Math.min(p['attack@max_stack_cnt'],Math.floor(u.mem.logosTime/.5))),'arts','kz:logosBeam',{isAttack:true,isSkill:true,attackId:u.mem.rmAttackId});
   endAttack(b,u,targets,true);
  }
 }:{kind:'duration',mods:{atkPct:p.atk},targeting:{rangeGrid:s.rangeGrid,maxTargets:p['attack@max_target']},onTick({battle:b,unit:u}){
  for(const q of b.projectiles.list){if(q.source?.side==='enemy'&&u.rangeKeys.includes(Math.round(q.y)*21+Math.round(q.x))){q.data||={};q.data.kzLogosOriginalSpeed??=q.speed;q.data.kzLogosSpeeds||={};q.data.kzLogosSpeeds[projectileKey(u)]=true;q.speed=q.data.kzLogosOriginalSpeed*p.projectile_move_scale;}else restore(q,u);}
 },onEnd({battle:b,unit:u,reason}){if(reason==='duration')b.projectiles.list=b.projectiles.list.filter(q=>q.source?.side!=='enemy'||!u.rangeKeys.includes(Math.round(q.y)*21+Math.round(q.x)));for(const q of b.projectiles.list)restore(q,u);}}),
 talents:[{install(b,u){let proc=false;
  b.on('attack',({attacker,targets})=>{if(attacker!==u||proc||!targets.length||!b.rng.chance(t.prob))return;proc=true;try{const es=range(b,u),count=t.emit_count||1;for(let n=0;n<count;n++){const e=b.rng.pick(es);if(!e)break;damage(b,u,e,u.s.atk*t.atk_scale,'arts','kz:logosTalent');b.applyStatus(e,'sluggish',{duration:t.sluggish,source:u});if(e.findBuff('apoptosisBurst')&&t.element_atk_scale)damage(b,u,e,u.s.atk*t.element_atk_scale,'elemental','kz:logosElement');}}finally{proc=false;}},{owner:u});
  b.on('hit',ctx=>{if(ctx.source!==u||ctx.target.side!=='enemy'||ctx.dmg.type!=='arts'||!ctx.dmg.isAttack)return;b.addBuff(ctx.target,{key:'kz:logos:res',mods:{resFlat:t2.magic_resistance},duration:t2.duration,source:u,data:{addition:t2.atk_addition}});},{owner:u});
  if(!b._kzLogosAddition){b._kzLogosAddition=true;b.on('damageMitigated',ctx=>{if(ctx.dmg.type==='arts'&&ctx.dmg.amount>0){const d=ctx.target.findBuff('kz:logos:res');if(d)ctx.amount+=d.data.addition||0;}});}
  b.on('damageResolved',ctx=>{if(ep>0&&ctx.credit===u&&ctx.dmg.type==='arts'&&ctx.dealt>0&&live(ctx.target))b.dealDamage(u,ctx.target,{amount:ctx.dealt*ep,type:'element',element:'apoptosis',canDodge:false,tags:['kz:logosModule']});},{owner:u});
  if(c.module?.active&&c.trait?.bb?.sp)b.on('attack',({attacker,targets})=>{if(attacker===u&&targets.some(e=>['ELITE','BOSS'].includes(e.def.rank)))u.skill.gainSp(c.trait.bb.sp,'kz:logos:module');},{owner:u});
 }}]
};}
export default {chess_kz_vigna_a:vigna,chess_kz_hibisc_a:hibisc,chess_kz_flameb_a:flameb,chess_kz_meteo_a:meteo,chess_kz_cqbw_a:cqbw,chess_kz_hodrer_a:hodrer,chess_kz_logos_a:logos};
