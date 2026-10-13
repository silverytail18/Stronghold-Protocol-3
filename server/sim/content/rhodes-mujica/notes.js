// Native note states and numeric motion parameters, with collision quantized to the sim's 0.05 s tick.
import {dirVec} from '../../dir.js';
import {canTargetEnemy} from '../../targeting.js';
import {live} from './common.js';
export function emitNote(b,u,target,scale,type,mode='normal') {
 const [dy,dx]=dirVec(u.dir),angle=(b.rng()*2-1)*20*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 const piano=mode==='piano',organ=mode==='organ',tone=piano||organ;
 const sk=u.skill,remote=!u.blocking.some(live),full=u.def.raw.module?.active&&(u.def.raw.module.level>=2)&&(sk.active||sk.id==='skchr_oblvns_2');
 const note={id:++u.mem.rmNoteSeq,x:u.x,y:u.y,dx:dx*c-dy*s,dy:dx*s+dy*c,originX:u.x,originY:u.y,target,
  state:'free',age:0,clock:0,hit:new Set(),outside:0,hitLeft:0,piano,
  minFree:tone?.4:.1,update:piano?.2:.4,radius:piano?.8:1,
  freeSpeed:piano?1.9:organ?.7:target?2:1.3,amplitude:piano?.4:organ?.15:target?0:.3,
  speed:piano?3.5:organ?1:2,turn:piano?.5:organ?1/12:target?1/6:7/30,
  amount:u.s.atk*u.s.atkScaleMul*scale*(remote&&!full?.8:1),type,isSkill:sk.active||tone,attackId:u.mem.rmAttackId||0};
 u.mem.rmNotes.push(note);return note;
}
export function updateNotes(b,u,dt,keys) {
 const legal=t=>live(t)&&canTargetEnemy(u,t,{canHitFly:true});
 for(const n of u.mem.rmNotes){
  n.age+=dt;n.clock+=dt;
  if(n.clock+1e-9>=n.update&&n.state!=='hit'){
   n.clock=0;if(!legal(n.target))n.target=null;
   if(!n.target)n.target=b.foesInRadius(n.x,n.y,n.radius).filter(legal).sort((a,z)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(z.x-n.x,z.y-n.y)||a.id-z.id)[0]||null;
   if(n.target&&n.age>=n.minFree)n.state='track';else n.state='free';
  }
  if(n.state==='track'&&legal(n.target)){
   const dx=n.target.x-n.x,dy=n.target.y-n.y,len=Math.hypot(dx,dy)||1,w=1-Math.pow(1-n.turn,dt*30);
   n.dx=n.dx*(1-w)+dx/len*w;n.dy=n.dy*(1-w)+dy/len*w;const norm=Math.hypot(n.dx,n.dy)||1;n.dx/=norm;n.dy/=norm;
  }
  const speed=n.state==='track'?n.speed:n.state==='hit'?3:n.freeSpeed;
  const oldX=n.x,oldY=n.y;n.x+=n.dx*speed*dt;n.y+=n.dy*speed*dt;
  if(n.state==='free'&&n.amplitude){const wave=n.amplitude*(Math.sin(n.age*4)-Math.sin((n.age-dt)*4));n.x-=n.dy*wave;n.y+=n.dx*wave;}
  const victims=n.state==='hit'?b.foesInRadius(n.x,n.y,.8).filter(legal):legal(n.target)?[n.target]:[];
  for(const e of victims){
   const vx=n.x-oldX,vy=n.y-oldY,len2=vx*vx+vy*vy,along=len2?Math.max(0,Math.min(1,((e.x-oldX)*vx+(e.y-oldY)*vy)/len2)):0;
   if(n.hit.has(e.id)||n.state!=='hit'&&Math.hypot(oldX+vx*along-e.x,oldY+vy*along-e.y)>.25)continue;
   n.hit.add(e.id);b.dealDamage(u,e,{amount:n.amount,type:n.type,isAttack:true,isSkill:n.isSkill,tags:['rm:own','rm:note'],attackId:n.attackId});
   if(n.state!=='hit'){n.state='hit';n.hitLeft=n.piano?.5:0;n.target=null;}
  }
  if(n.state==='hit')n.hitLeft-=dt;
  const k=Math.round(n.y)*b.grid.cols+Math.round(n.x);n.outside=keys.has(k)||legal(n.target)?0:n.outside+dt;
 }
 u.mem.rmNotes=u.mem.rmNotes.filter(n=>(n.state!=='hit'||n.hitLeft>0)&&n.outside<1&&b.grid.inRect(Math.round(n.y),Math.round(n.x)));
}
