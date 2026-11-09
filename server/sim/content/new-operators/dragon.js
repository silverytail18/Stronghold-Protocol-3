import {bodyInRadius} from '../../body.js';
import {dirVec} from '../../dir.js';
import {eligible,damage} from './common.js';
export const DRAGON=Object.freeze({speed:1.5,radius:1.3,wallDistance:.25,lifetime:20});
// The engine displays the global pool as a leader's HP. Native percentage damage instead reads
// that entity's ordinary scaled HP at the same life ratio; it never takes 6% of the whole pool per part.
export function dragonCurrentHp(e){if(!e.bossPool)return Math.max(0,e.hp);const ratio=e.s.maxHp>0?Math.max(0,Math.min(1,e.hp/e.s.maxHp)):0,scale=Number.isFinite(e.mods?.hpMul)&&e.mods.hpMul>0?e.mods.hpMul:1,ordinary=Math.max(1,e.def.maxHp*scale)*(e.base.maxHp>0?e.s.maxHp/e.base.maxHp:1);return ordinary*ratio;}
// A segment owns a collision set. Turning starts a NEW segment, including while still overlapping a huge body.
// Never deduplicate by shared boss pool/root: each physical part is an independently collidable enemy.
export function createDragon(u,p,serial=1){const[dr,dc]=dirVec(u.dir);return{id:'chen3:'+u.id+':'+serial,x:u.x,y:u.y,dx:dc,dy:dr,age:0,segment:0,seen:new Set(),floor:u.s.atk*p.projectile_min_atk_scale,ratio:p.hp_ratio,turns:0,fxAt:0};}
const wall=(b,x,y)=>{const r=Math.round(y),c=Math.round(x);if(!b.grid.inRect(r,c))return true;const t=b.grid.tile(r,c);return t.height==='HIGH'||['start','end'].includes(t.special);};
export function stepDragon(b,u,d,dt){
 d.age+=dt;if(d.age>DRAGON.lifetime){b.fx('new-fire-dragon',{src:u.id,dragon:d.id,phase:'stop',x:d.x,y:d.y});return false;}
 let distance=DRAGON.speed*dt;
 while(distance>1e-9){const step=Math.min(.05,distance);let turned=0;
  while(wall(b,d.x+d.dx*(step+DRAGON.wallDistance),d.y+d.dy*(step+DRAGON.wallDistance))&&turned<4){[d.dx,d.dy]=[d.dy,-d.dx];turned++;}
  if(turned===4)break; // Completely sealed tile: do not manufacture stationary turn hits.
  if(turned){d.segment+=turned;d.turns+=turned;d.seen.clear();}
  d.x+=d.dx*step;d.y+=d.dy*step;distance-=step;
  for(const e of b.enemies)if(eligible(u,e)&&!d.seen.has(e.id)&&bodyInRadius(e,d.x,d.y,DRAGON.radius)){
   d.seen.add(e.id);damage(b,u,e,Math.max(dragonCurrentHp(e)*d.ratio,d.floor),'arts','native:new:dragon',{attackId:0});b.fx('new-fire-dragon-hit',{src:u.id,target:e.id,x:e.x,y:e.y});
  }
 }
 if(d.age+1e-9>=d.fxAt){d.fxAt=d.age+.1;b.fx('new-fire-dragon',{src:u.id,dragon:d.id,phase:'move',age:d.age,x:d.x,y:d.y,dx:d.dx,dy:d.dy,turns:d.turns,t:.25});}
 return true;
}
export function launchDragon(b,u,p){const d=createDragon(u,p,u.skill.activations);(b.newFireDragons??=[]).push(d);const timer=b.every(1/30,()=>{if(!stepDragon(b,u,d,1/30)){timer.cancel();b.newFireDragons=b.newFireDragons.filter(x=>x!==d);}});return d;}
