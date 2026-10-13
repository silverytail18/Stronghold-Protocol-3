import {absoluteRangeKeys,canTargetEnemy,sortEnemyTargets} from '../../targeting.js';
export const live=u=>u?.alive&&u.deployed&&!u.removed&&!u.hidden;
export const family=u=>u?.def?.baseId||u?.defId;
export const N4=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
export function inGrid(b,u,grid,side){return b.unitsInGrid(u,grid||u.liveRangeGrid||u.rangeGrid,{side});}
export function enemies(b,u,grid,canFly=u.profile.canHitFly){const es=b.enemiesInKeys(absoluteRangeKeys(grid||u.rangeGrid,u.tileR,u.tileC,u.dir),u,{canHitFly:canFly});return sortEnemyTargets(b,u,es);}
export function ownOps(b,u){return b.allyUnits.filter(a=>live(a)&&a.kind==='op'&&a.ownerId===u.ownerId);}
export function injured(b,u,grid){return inGrid(b,u,grid,'ally').filter(a=>a.kind!=='device'&&!(a!==u&&(a.s.flags.noHeal||a.profile?.noHeal))).sort((a,c)=>a.hpRatio-c.hpRatio||a.deploySeq-c.deploySeq);}
export function physicalArtsShelter(b,target,key,value,source,duration=0.15){
  b.applyStrongest(target,key,{value,duration,source,mods:v=>({physTakenMul:1-v,artsTakenMul:1-v})});
}
export function teleportEnemy(b,e,r,c,source){
  if(!live(e)||e.side!=='enemy'||e.isBoss||e.s.flags.noDisplace||e.def?.staticBody||e.def?.immune?.has('teleport')||e.def?.raw?.teleportImmune||!b.grid.inRect(r,c)||!b.grid.groundPassable(r,c))return false;
  b._unblock(e);e.x=c;e.y=r;if(e.route)e.route.pts=null;b._enemiesDirty=true;b.fx('teleport',{x:c,y:r,id:e.id,src:source.id});return true;
}
export function groundbind(b,source,e,duration){
  if(!live(e)||!e.isFlying||e.def?.immune?.has('groundBound')||e.def?.raw?.groundBoundImmune)return false;
  if(e.s.massLevel>3)duration/=2;
  b._unblock(e);b.addBuff(e,{key:'exp:groundbind',status:'groundbind',duration,mods:{moveMul:0},flags:{noMove:true},visible:true,source});
  const tile=b.grid.tile(Math.round(e.y),Math.round(e.x));if(tile?.key==='tile_hole'||tile?.special==='HOLE')b.kill(e,source);
  return true;
}
