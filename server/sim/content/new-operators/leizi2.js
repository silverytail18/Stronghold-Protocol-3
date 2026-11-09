import {bodyInKeys} from '../../body.js';
import {dirVec} from '../../dir.js';
import {live,talent,specs,buff,foes,damage,eligible} from './common.js';
import {reinforcementOf,REINFORCEMENT as R} from './reinforcement.js';
function groundRange(b,u){const seen=new Set(),q=[[u.tileR,u.tileC,0]],out=[];while(q.length){const[r,c,n]=q.shift(),k=r*b.grid.cols+c;if(seen.has(k)||!b.grid.inRect(r,c)||!b.grid.isLow(r,c))continue;seen.add(k);out.push([r-u.tileR,c-u.tileC]);if(n<3)for(const[dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]])q.push([r+dr,c+dc,n+1]);}return out.map(([r,c])=>u.dir==='UP'?[-c,r]:u.dir==='LEFT'?[-r,-c]:u.dir==='DOWN'?[c,-r]:[r,c]);}
function thunder(b,u,k,scale,opening=false){
 const p=u.skill?.bb;if(u.skill?.active&&u.skill.id==='skchr_leizi2_2'){u.mem.newThunder=Math.min(p.thunder_max_stack_cnt,u.mem.newThunder+1);buff(b,u,'leiziThunder',{atkPct:u.mem.newThunder*p.thunder_atk},{source:u});}
 for(const e of b.enemies)if(eligible(u,e)&&bodyInKeys(e,[k])){damage(b,u,e,u.s.atk*scale,'arts','native:new:thunder');if(opening&&live(e))b.applyStatus(e,'tremble',{duration:talent(u.def.raw,1).not_combat||2,source:u});}
 b.fx('new-thunder',{x:k%b.grid.cols,y:Math.floor(k/b.grid.cols),id:u.id,src:u.id,source:opening?'talent2':u.skill?.active?u.skill.id:'talent1',t:.25});
}
function current(b,u,p,e){const serial=(u.mem.newCurrentSeq=(u.mem.newCurrentSeq||0)+1);const flows=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:e.x,y:e.y,dx,dy,left:3}));let age=0,clock=0,fxClock=0;
 const timer=b.every(1/30,()=>{age+=1/30;clock+=1/30;fxClock+=1/30;for(const f of flows){if(f.left<=0)continue;const step=Math.min(f.left,2/30),x=f.x+f.dx*step,y=f.y+f.dy*step,r=Math.round(y),c=Math.round(x);if(!b.grid.inRect(r,c)||!b.grid.isLow(r,c)||r===u.tileR&&c===u.tileC){f.dx=-f.dx;f.dy=-f.dy;}f.x+=f.dx*step;f.y+=f.dy*step;f.left-=step;}
  if(clock+1e-9>=.6){clock-=.6;const keys=new Set(flows.filter(f=>f.left>0).map(f=>Math.round(f.y)*b.grid.cols+Math.round(f.x)));for(const target of b.enemies)if(eligible(u,target)&&bodyInKeys(target,keys)){damage(b,u,target,u.s.atk*p['attack@atk_scale_current'],'arts','native:new:current');if(live(target)&&b.rng()<p.prob)b.applyStatus(target,'tremble',{duration:p.not_combat,source:u});}}
  if(fxClock+1e-9>=.1){fxClock=0;flows.forEach((f,i)=>b.fx('new-current',{src:u.id,flow:u.id+':'+serial+':'+i,age,phase:'move',x:f.x,y:f.y,dx:f.dx,dy:f.dy,t:.2}));}if(age>=1.5){flows.forEach((f,i)=>b.fx('new-current',{src:u.id,flow:u.id+':'+serial+':'+i,phase:'stop',x:f.x,y:f.y}));timer.cancel();}
 });
}
export function leizi2(bb,c){const reinforcement=reinforcementOf(c);return{...(reinforcement?{trait:{rampTime:(c.trait?.bb?.max_stack_cnt||40)/(1+R.leiziRampSpeed[reinforcement.i])}}:{}),skills:specs(c,(s,p)=>{
 if(s.index===0)return{kind:'instant',charges:3,trigger:'SEARCH',onStart({battle:b,unit:u}){u.mem.newRamp=u.trait.ramp;for(const e of foes(b,u,s.rangeGrid,false))damage(b,u,e,u.s.atk*p['attack@atk_scale_s1'],'phys','native:new:leiziS1');}};
 if(s.index===1)return{kind:'duration',trigger:'SEARCH',targeting:{rangeGrid:s.rangeGrid},attack:{maxTargets:p['attack@max_target_s2'],atkScale:p['attack@atk_scale_s2'],dmgType:'phys',canHitFly:false},onStart({battle:b,unit:u,skill}){u.mem.newThunder=0;skill.spec.targeting={rangeGrid:groundRange(b,u)};b._refreshRange(u);},onEnd({battle:b,unit:u}){b.removeBuff(u,'native:new:leiziThunder');u.mem.newThunder=0;}};
 return{kind:'duration',trigger:'SEARCH',targeting:{rangeGrid:s.rangeGrid},mods:{batPct:p.base_attack_time/c.stats.bat},attack:{dmgType:'phys',atkScale:p['attack@atk_scale_s3'],splashRadius:p['attack@range_radius'],splashScale:1,canHitFly:false,onSegmentHit({battle:b,unit:u,target:e,isSplash}){if(!isSplash&&e)current(b,u,p,e);}}};
 }),install(b,u){
  const t=talent(c,0);u.mem.newThunder=0;let saved=0;
  b.on('skillStart',({unit,skill})=>{if(unit!==u)return;saved=u.mem.newRamp??u.trait.ramp;if(t['atk_scale[skill_up]'])buff(b,u,'leiziNative',{atkScaleMul:t['atk_scale[skill_up]']},{source:u});if(c.talents.some(t=>t.index===1))for(const k of u.rangeKeys)if(b.grid.isLow(Math.floor(k/b.grid.cols),k%b.grid.cols))thunder(b,u,k,talent(c,1).atk_scale_t2||1,true);},{owner:u});
  b.on('skillEnd',({unit,skill})=>{if(unit!==u)return;b.removeBuff(u,'native:new:leiziNative');if(skill.id==='skchr_leizi2_1'&&skill.charges>0){u.trait.ramp=saved; b.addBuff(u,{key:'trait:libratorRamp',mods:{atkPct:saved}});}u.mem.newRamp=undefined;},{owner:u,priority:-1000});
  b.every(.05,()=>{if(!live(u))return;if(!u.skill.active){if(!u.findBuff('native:new:leiziFlight'))buff(b,u,'leiziFlight',{}, {flags:{liftoff:true},persist:true});}else b.removeBuff(u,'native:new:leiziFlight');},{owner:u});
  b.every(1,()=>{if(!live(u))return;for(const k of u.rangeKeys)if(b.rng()<.1)thunder(b,u,k,t.atk_scale_t||1);},{owner:u});
 }};}
