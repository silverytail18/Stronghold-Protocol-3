// Current PC client: EmitDirectionalMapEdgeProjectileVolley (RVA1170370),
// MapEdgeLaneResolver (8d6010/8d6450), OxiFireRainSlotManager (8527f0).
import {hitRect,bodyInRadius} from '../../body.js';
import {canTargetEnemy} from '../../targeting.js';
const live=u=>!!u?.alive&&u.deployed&&!u.removed;
const eligible=(u,e)=>live(e)&&e.side==='enemy'&&canTargetEnemy(u,e,{canHitFly:true});
// The active combat rect is the project's map-layer scope. An internal void
// is not its outer edge: independent lanes can cross holes and obstacles.
const valid=(b,r,c)=>b.grid.inRect(r,c)&&b.grid.tile(r,c).height!=='NONE'&&b.grid.tile(r,c).key!=='tile_forbidden';
export function fireRainLanes(b,u,half,p){
 const horizontal=u.dir==='RIGHT'||u.dir==='LEFT',sign=u.dir==='LEFT'||u.dir==='DOWN'?-1:1;
 const row=u.tileR,col=u.tileC;
 if(!valid(b,row,col))return[];
 const rect=b.grid.rect,available=[];
 for(let cross=horizontal?rect.r0:rect.c0;cross<=(horizontal?rect.r1:rect.c1);cross++){
  let first=null,last=null;
  for(let axis=horizontal?rect.c0:rect.r0;axis<=(horizontal?rect.c1:rect.r1);axis++)if(valid(b,horizontal?cross:axis,horizontal?axis:cross)){first??=axis;last=axis;}
  if(first!==null)available.push({cross,first,last});
 }
 const center=available.findIndex(l=>l.cross===(horizontal?row:col));
 if(center<0)return[];
 const width=Math.min(2*half+1,available.length),start=Math.max(0,Math.min(center-half,available.length-width));
 const origin=horizontal?col:row,maxBack=p.wave_max_back_distance??11;
 return available.slice(start,start+width).map(({cross,first,last})=>({horizontal,sign,cross,
  pos:sign>0?Math.max(first,origin-maxBack):Math.min(last,origin+maxBack),
  end:(sign>0?last:first)+sign*p.wave_exit_distance}));
}
// Earliest swept circle/rectangle contact, including huge Boss occupied area.
export function waveContact(w,e,previous,next){
 const rect=hitRect(e),axis=w.horizontal?e.x:e.y,cross=w.horizontal?e.y:e.x;
 const a=w.horizontal?(rect?.x0??axis):(rect?.y0??axis),z=w.horizontal?(rect?.x1??axis):(rect?.y1??axis);
 const lo=w.horizontal?(rect?.y0??cross):(rect?.x0??cross),hi=w.horizontal?(rect?.y1??cross):(rect?.x1??cross);
 const d=Math.max(lo-w.cross,w.cross-hi,0),radius=w.p.projectile_range;
 if(d>radius)return null;const reach=Math.sqrt(Math.max(0,radius*radius-d*d));
 const first=w.sign>0?a-reach:z+reach,last=w.sign>0?z+reach:a-reach;
 if(w.sign*(last-previous)<-1e-9||w.sign*(first-next)>1e-9)return null;
 return Math.max(0,w.sign*(first-previous));
}
export function fireRainController(b){
 if(b.oxiFireRain)return b.oxiFireRain;
 const actors=new Map(),queue=[];
 const signal=(u,w,phase)=>b.fx('source-oxi-heatwave',{src:u.id,wave:w.fxId,phase,x:w.horizontal?w.pos:w.cross,y:w.horizontal?w.cross:w.pos,dx:w.horizontal?w.sign:0,dy:w.horizontal?0:w.sign,time:b.time});
 const active=entry=>live(entry.u)&&entry.u.skill?.active&&entry.u.skill.id==='skchr_oxi_3'&&entry.u.mem.oxiChannel===entry.channel;
 const release=entry=>{const i=queue.indexOf(entry);if(i>=0)queue.splice(i,1);};
 const prune=()=>{for(let i=queue.length-1;i>=0;i--)if(!active(queue[i]))queue.splice(i,1);};
 const api={actors,start(u,p,duration){
  prune();const channel={start:b.time,next:b.time,over:false,wave:0,duration,p,serial:u.mem.oxiFxSerial=(u.mem.oxiFxSerial||0)+1};
  u.mem.oxiChannel=channel;const entry={u,channel,key:u.ownerId};actors.set(u.id,entry);queue.push(entry);
 },end(u){const entry=actors.get(u.id);if(entry)release(entry);u.mem.oxiChannel=null;},
 tick(u,p,s){
  const entry=actors.get(u.id),st=u.mem.oxiChannel;if(!entry||!st)return;
  const flags=u.s.flags;
  if(flags.stun||flags.freeze||flags.sleep){s.end('oxi:interrupted');return;}
  const over=b.time-st.start>=st.duration/2-1e-9;
  if(over&&!st.over){st.over=true;st.next=b.time;}
  if(b.time+1e-9<st.next)return;
  st.next+=over?p.overload_interval:p.normal_interval;
  prune();if(queue.find(a=>a.key===entry.key)!==entry||!u.canAct)return;
  // This skill's own disarm flag only stops normal attacks. Other disarm
  // sources suppress this trigger without releasing its registered slot.
  if(u.buffs.some(v=>v.flags?.disarm&&v.key!==s._buffKey))return;
  const seen=new Set(),wave=++st.wave;
  const lanes=fireRainLanes(b,u,over?p.overload_half_width:p.normal_half_width,p);
  for(const [index,lane] of lanes.entries()){
   const w={...lane,seen,wave,p,atk:u.s.atk,bornAt:b.time,owner:u,expires:b.time+25,fxId:u.id+':'+st.serial+':'+wave+':'+index,fxAt:b.time};
   u.mem.oxiWaves.push(w);signal(u,w,'spawn');
  }
  b.emit('oxiFireRainWave',{unit:u,over,wave,lanes:lanes.map(l=>({...l})),time:b.time});
 }};
 b.oxiFireRain=api;
 // Battle-owned: projectiles are not managed by their source in the original
 // prefab (_stopWhenSourceInvalid=0); retiring an operator must not drop them.
 b.on('tick',({dt})=>{
  prune();
  for(const entry of actors.values()){
   const u=entry.u;
   for(const w of u.mem.oxiWaves||[]){
    const previous=w.pos,next=w.pos+w.sign*w.p.wave_speed*dt;
    const hit=b.enemies.map(e=>({e,d:eligible(u,e)?waveContact(w,e,previous,next):null})).filter(a=>a.d!==null).sort((a,z)=>a.d-z.d||a.e.id-z.e.id)[0];
    w.pos=next;
    if(hit){w.done=true;const pivot=hit.e;
     for(const e of b.enemies)if((e===pivot||bodyInRadius(e,pivot.x,pivot.y,w.p.range_radius))&&eligible(u,e)){
      const repeat=w.seen.has(e.id),type=e.buffs.some(v=>v.key==='burnBurst')?'elemental':'arts';
      b.dealDamage(u,e,{amount:w.atk*w.p.heatwave_atk_scale*(repeat?w.p.same_wave_repeat_damage_scale:1),type,isSkill:true,canDodge:false,tags:['native:ursus','oxi:heatwave']});
      w.seen.add(e.id);
     }
     b.emit('oxiFireRainEnd',{unit:u,projectile:w,reason:'hit',target:pivot,x:pivot.x,y:pivot.y,time:b.time});
     b.fx('source-oxi-heatwave-hit',{src:u.id,wave:w.fxId,id:pivot.id,x:pivot.x,y:pivot.y});
    }
    if(w.sign*(w.pos-w.end)>=0||b.time>=w.expires){
     if(!w.done)b.emit('oxiFireRainEnd',{unit:u,projectile:w,reason:b.time>=w.expires?'expired':'exit',x:w.horizontal?w.pos:w.cross,y:w.horizontal?w.cross:w.pos,time:b.time});
     w.done=true;
    }
   }
   for(const w of u.mem.oxiWaves||[])if(w.done)signal(u,w,'stop');else if(b.time-w.fxAt>=.1-1e-9){w.fxAt=b.time;signal(u,w,'move');}
   u.mem.oxiWaves=(u.mem.oxiWaves||[]).filter(w=>!w.done);
  }
 });
 return api;
}
export const fireRainSkill=(s,p)=>({kind:'duration',duration:s.duration,trigger:'SEARCH',allowSharedRange:false,flags:{disarm:true},mods:{atkPct:p.atk},
 onStart({battle:b,unit:u}){fireRainController(b).start(u,p,s.duration);},
 onEnd({battle:b,unit:u}){fireRainController(b).end(u);},
 onTick({battle:b,unit:u,skill}){fireRainController(b).tick(u,p,skill);}
});
