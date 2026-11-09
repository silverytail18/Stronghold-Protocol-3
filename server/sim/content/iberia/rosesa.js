import {bodyInKeys} from '../../body.js';
const live=u=>u?.alive&&u.deployed&&!u.removed&&!u.hidden;
export function rosesaKit(bb,c){
 const talent=Object.assign({},...(c.talents||[]).filter(t=>t.index===0).map(t=>t.bb));
 return{skills:Object.fromEntries((c.skills||[]).map(s=>[s.skillId,s.index===0?{kind:'instant',heal:true,attack:{healScale:s.bb.heal_scale}}:{kind:'duration',heal:true,mods:{batPct:s.bb.base_attack_time/c.stats.bat},onStart({battle:b,unit:u}){b.fx('saltWard',{id:u.id,x:u.x,y:u.y});}}])),
 install(b,u){
  const moduleRange=(c.talents||[]).find(t=>t.hidden&&t.fromModule&&t.rangeGrid)?.rangeGrid;if(moduleRange){u.rangeGrid=moduleRange;b.refreshRange(u);}
  b.addBuff(u,{key:'native:ib:rosesa:talent',mods:{atkPct:talent.atk||-.05},persist:true,allowDead:true});
  b.on('tick',()=>{if(!live(u))return;for(const a of b.allyUnits)if(live(a)&&a.kind==='op'&&bodyInKeys(a,u.rangeKeys)){
   const ratio=talent.heal_scale||1.15,old=a.findBuff('native:ib:rosesa:received');if(!old||old.mods.healingTakenMul<=ratio)b.addBuff(a,{key:'native:ib:rosesa:received',mods:{healingTakenMul:ratio},duration:.15});
  }},{owner:u});
  b.on('hit',ctx=>{const a=ctx.target;if(!live(u)||!u.skill?.active||u.skill.id!=='skchr_rosesa_2'||a?.side!=='ally'||a.kind!=='op'||!['phys','arts'].includes(ctx.dmg.type)||!bodyInKeys(a,u.rangeKeys))return;
   const ratio=u.skill.bb['attack@damage_scale']??.7,old=ctx.dmg._ibRosesa;if(old&&old.ratio<=ratio)return;
   ctx.dmg.mul*=ratio/(old?.ratio??1);ctx.dmg._ibRosesa={ratio,duration:u.skill.bb['attack@final_duration']||5,interval:u.skill.bb['attack@interval']||1};
  },{owner:u,priority:-5});
  b.on('damageResolved',ctx=>{const d=ctx.dmg?._ibRosesa;if(!d||d.done||!(ctx.dealt>0)||!live(ctx.target))return;d.done=true;
   const total=ctx.dealt*(1-d.ratio)/d.ratio,ticks=Math.max(1,Math.round(d.duration/d.interval)),source=ctx.source?.side==='enemy'?ctx.source:null;
   b.addBuff(ctx.target,{key:'native:ib:rosesa:debt',refresh:'independent',maxStacks:1000,duration:d.duration+1e-6,interval:d.interval,onTick({unit:a}){b.loseHp(a,total/ticks,{source});}});
  },{owner:u});
 }};
}
