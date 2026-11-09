import {cos as productMath_cos,sin as productMath_sin,hypot as productMath_hypot} from '../../detmath.js';
import {positivePow as productMath_pow} from '../../productMath.js';
// Native note states and numeric motion parameters, with collision quantized to the sim's 0.05 s tick.
import {dirVec} from '../../dir.js';
import {canTargetEnemy} from '../../targeting.js';
import {live} from './common.js';
// Original projectile keys are visual metadata only. In particular S1 has eight
// distinct note bodies; neither damage type nor the current mode can recover
// this identity later, after a toggle, skill end, or client reconnect.
export function sourceNoteProjectile(u,target,mode='normal'){
 const sk=u.skill;
 if(sk.active&&sk.id==='skchr_oblvns_1'){
  if(u.mem.rmFxS1Activation!==sk.activations||!Number.isInteger(u.mem.rmFxS1Ordinal)){u.mem.rmFxS1Activation=sk.activations;u.mem.rmFxS1Ordinal=0;}
  return 'projectile_chr_oblvns_s1_'+((u.mem.rmFxS1Ordinal++%8)+1);
 }
 if(sk.active&&sk.id==='skchr_oblvns_3')return 'projectile_chr_oblvns_s3_'+(mode==='piano'?'phy':'mag');
 if(mode==='piano')return 'projectile_chr_oblvns_s2'+(target?'':'_t');
 if(mode==='organ')return 'projectile_chr_oblvns_s2_slow'+(target?'':'_t');
 return target?'projectile_chr_oblvns':'projectile_chr_oblvns_talent';
}
function noteFx(b,u,n,phase,target=null){b.fx('source-oblvns-note',{src:u.id,note:n.id,phase,projectile:n.sourceProjectileKey,mountPoint:n.sourceMountPoint,combat:n.sourceCombat,x:n.x,y:n.y,dx:n.dx,dy:n.dy,state:n.state,age:n.age,target:target?.id??null,time:b.time});}
export function emitNote(b,u,target,scale,type,mode='normal') {
 const [dy,dx]=dirVec(u.dir),angle=(b.rng()*2-1)*20*Math.PI/180,c=productMath_cos(angle),s=productMath_sin(angle);
 const piano=mode==='piano',organ=mode==='organ',tone=piano||organ;
 const sk=u.skill,remote=!u.blocking.some(live),full=u.def.raw.module?.active&&(u.def.raw.module.level>=2)&&(sk.active||sk.id==='skchr_oblvns_2');
 const note={id:++u.mem.rmNoteSeq,x:u.x,y:u.y,dx:dx*c-dy*s,dy:dx*s+dy*c,originX:u.x,originY:u.y,target,
  state:'free',age:0,clock:0,hit:new Set(),outside:0,hitLeft:0,piano,
  minFree:tone?.4:.1,update:piano?.2:.4,radius:piano?.8:1,
  freeSpeed:piano?1.9:organ?.7:target?2:1.3,amplitude:piano?.4:organ?.15:target?0:.3,
  speed:piano?3.5:organ?1:2,turn:piano?.5:organ?1/12:target?1/6:7/30,
  amount:u.s.atk*u.s.atkScaleMul*scale*(remote&&!full?.8:1),type,isSkill:sk.active||tone,attackId:u.mem.rmAttackId||0,
  riCycle:sk.active&&sk.id==='skchr_oblvns_1'?'skill:'+sk.activations:'attack:'+(u.mem.rmAttackId||0),riRetargeted:false};
 note.sourceProjectileKey=sourceNoteProjectile(u,target,mode);
 note.sourceMountPoint=note.sourceProjectileKey==='projectile_chr_oblvns'||note.sourceProjectileKey==='projectile_chr_oblvns_talent'||!target&&sk.id!=='skchr_oblvns_3'?9:2;
 note.sourceCombat=!remote;
 note.sourceSkillIndex=sk.active||tone?Number(sk.id?.at(-1)||0)-1:-1;
 u.mem.rmNotes.push(note);noteFx(b,u,note,'spawn',target);return note;
}
export function updateNotes(b,u,dt,keys) {
 const legal=t=>live(t)&&t.side==='enemy'&&canTargetEnemy(u,t,{canHitFly:true});
 for(const n of u.mem.rmNotes){
  n.age+=dt;n.clock+=dt;
  if(n.clock+1e-9>=n.update&&n.state!=='hit'){
   n.clock=0;
   if(n.target&&!n.target.alive&&!n.hit.size&&!n.riRetargeted&&b.rhodesPersonal?.retargetAllowed(u)){
    n.riRetargeted=true;n.target=b.enemiesInKeys([...keys],u,{canHitFly:true}).filter(legal).sort((a,z)=>productMath_hypot(a.x-n.x,a.y-n.y)-productMath_hypot(z.x-n.x,z.y-n.y)||a.id-z.id)[0]||null;
   }
   if(!legal(n.target))n.target=null;
   if(!n.target)n.target=b.foesInRadius(n.x,n.y,n.radius).filter(legal).sort((a,z)=>productMath_hypot(a.x-n.x,a.y-n.y)-productMath_hypot(z.x-n.x,z.y-n.y)||a.id-z.id)[0]||null;
   if(n.target&&n.age>=n.minFree)n.state='track';else n.state='free';
  }
  if(n.state==='track'&&legal(n.target)){
   const dx=n.target.x-n.x,dy=n.target.y-n.y,len=productMath_hypot(dx,dy)||1,w=1-productMath_pow(1-n.turn,dt*30);
   n.dx=n.dx*(1-w)+dx/len*w;n.dy=n.dy*(1-w)+dy/len*w;const norm=productMath_hypot(n.dx,n.dy)||1;n.dx/=norm;n.dy/=norm;
  }
  const speed=n.state==='track'?n.speed:n.state==='hit'?3:n.freeSpeed;
  const oldX=n.x,oldY=n.y;n.x+=n.dx*speed*dt;n.y+=n.dy*speed*dt;
  if(n.state==='free'&&n.amplitude){const wave=n.amplitude*(productMath_sin(n.age*4)-productMath_sin((n.age-dt)*4));n.x-=n.dy*wave;n.y+=n.dx*wave;}
  const victims=n.state==='hit'?b.foesInRadius(n.x,n.y,.8).filter(legal):legal(n.target)?[n.target]:[];
  for(const e of victims){
   const vx=n.x-oldX,vy=n.y-oldY,len2=vx*vx+vy*vy,along=len2?Math.max(0,Math.min(1,((e.x-oldX)*vx+(e.y-oldY)*vy)/len2)):0;
   if(n.hit.has(e.id)||n.state!=='hit'&&productMath_hypot(oldX+vx*along-e.x,oldY+vy*along-e.y)>.25)continue;
   n.hit.add(e.id);b.dealDamage(u,e,{amount:n.amount,type:n.type,isAttack:true,isSkill:n.isSkill,tags:['rm:own','rm:note','rm:cycle:'+n.riCycle],attackId:n.attackId});
   noteFx(b,u,n,'hit',e);
   if(n.state!=='hit'){n.state='hit';n.hitLeft=n.piano?.5:0;n.target=null;}
  }
  if(n.state==='hit')n.hitLeft-=dt;
  const k=Math.round(n.y)*b.grid.cols+Math.round(n.x);n.outside=keys.has(k)||legal(n.target)?0:n.outside+dt;
  if(n.age+1e-9>=(n.fxAt||0)){n.fxAt=n.age+.1;noteFx(b,u,n,'move',n.target);}
 }
 u.mem.rmNotes=u.mem.rmNotes.filter(n=>{const keep=(n.state!=='hit'||n.hitLeft>0)&&n.outside<1&&b.grid.inRect(Math.round(n.y),Math.round(n.x));if(!keep)noteFx(b,u,n,'stop');return keep;});
}
