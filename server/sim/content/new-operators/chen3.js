import {hypot as productMath_hypot} from '../../detmath.js';
import {weaknessRetype} from '../items/battle.js';
import {live,talent,specs,buff,foes,damage,skillGuard} from './common.js';
import {launchDragon} from './dragon.js';
export function chen3(bb,c){return{skills:specs(c,(s,p)=>{
 if(s.index===0)return{kind:'duration',mods:{atkPct:p.atk},attack:{hits:2,onSegmentHit({battle:b,unit:u,target:e}){if(live(e))b.applyStatus(e,'silence',{duration:Math.max(.05,u.skill.timeLeft),source:u});}}};
 if(s.index===1)return{kind:'duration',trigger:'SEARCH',flags:{disarm:true,untargetable:true},onStart({battle:b,unit:u,skill}){
  const st={remaining:10,target:foes(b,u)[0],home:[u.tileR,u.tileC],serial:skill.activations};u.mem.newChenCut=st;
  const cut=()=>{if(!live(u)||u.mem.newChenCut!==st||!skill.active)return;
   if(!live(st.target))st.target=foes(b,u).sort((a,z)=>productMath_hypot(a.x-(st.lastX??u.x),a.y-(st.lastY??u.y))-productMath_hypot(z.x-(st.lastX??u.x),z.y-(st.lastY??u.y))||a.id-z.id)[0];
   const e=st.target;if(!e){skill.end('new:noTarget');return;}st.lastX=e.x;st.lastY=e.y;
   damage(b,u,e,u.s.atk*p.atk_scale,'arts','native:new:chenCut');b.fx('new-chen-cut',{x:e.x,y:e.y,id:u.id,t:.2});st.remaining--;if(!e.alive)st.remaining++;
   if(st.remaining>0)b.after(.2,cut,{owner:u});else skill.end('new:cutDone');
  };skill.timeLeft=Infinity;b.after(0,cut,{owner:u});
 },onEnd({battle:b,unit:u,reason}){const st=u.mem.newChenCut;if(!st)return;u.mem.newChenCut=null;
  if(reason!=='death'&&live(u)){const r=Math.round(st.lastY),col=Math.round(st.lastX);if(live(st.target)&&b.grid.inRect(r,col)&&b.grid.isLow(r,col)&&b.grid.groundPassable(r,col))b.relocate(u,r,col);
   buff(b,u,'chenAfter',{atkPct:p['chen3_s2[respawn_buff].atk'],dodgePhys:p['chen3_s2[respawn_buff].prob'],dodgeArts:p['chen3_s2[respawn_buff].prob']},{duration:s.duration,source:u});b.fx('source-buff',{id:u.id,src:u.id,x:u.x,y:u.y,template:'chen3_s2[respawn_buff]',event:13,duration:s.duration});}
 }};
 return{kind:'duration',targeting:{rangeGrid:s.rangeGrid},attack:{maxTargets:p['attack@max_target'],hits:3,atkScale:p['attack@atk_scale'],dmgType:'arts',canHitFly:false},onStart({battle:b,unit:u}){launchDragon(b,u,p);}};
 }),install(b,u){
  const t=talent(c,0),heal=talent(c,1);buff(b,u,'chenBase',{atkPct:t.atk||0,aspd:t.attack_speed||0},{persist:true});
  b.on('hit',ctx=>{if(ctx.source===u&&ctx.target.side==='enemy')weaknessRetype(ctx.dmg,u,ctx.target);},{owner:u,priority:5});
  let cleanAt=b.time,readyAt=b.time+(heal.stack_time||7);b.on('damageResolved',({target,dealt})=>{if(target===u&&dealt>0){cleanAt=b.time;readyAt=b.time+(heal.stack_time||7);}},{owner:u});
  b.every(.1,()=>{if(!live(u))return;if(b.time+1e-9>=readyAt&&b.time-cleanAt+1e-9>=(heal.stack_time||7)){
   readyAt=b.time+(heal.stack_time||7);const lo=heal.heal_atk_scale_min||30,hi=heal.heal_atk_scale_max||161,scale=(lo+Math.floor(b.rng()*(hi-lo)))/100;
   b.heal(u,u,u.s.atk*scale,{nativeSelfHeal:true});buff(b,u,'chenDodge',{}, {persist:true,data:{ready:true}});b.fx('source-buff',{id:u.id,src:u.id,x:u.x,y:u.y,template:'chen3_t2[timer]',event:2});
  }
  if(c.module?.active&&!u.blocking.length)buff(b,u,'chenModule',{aspd:8},{duration:.15});
  },{owner:u});
  b.on('hit',ctx=>{if(ctx.target!==u||!['phys','arts'].includes(ctx.dmg.type)||!u.findBuff('native:new:chenDodge'))return;b.removeBuff(u,'native:new:chenDodge');b.fx('source-buff-end',{id:u.id,x:u.x,y:u.y,buffKey:'chen3_t2[evade]'});ctx.dmg.cancel=true;},{owner:u,priority:-900});
  skillGuard(u,()=>u.skill.id!=='skchr_chen3_2'||foes(b,u).length>0);
 }};}
