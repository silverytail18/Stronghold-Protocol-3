import {NIAN,SHU,SUI} from './expansion-data.js';
import {live,family,N4,inGrid,enemies,ownOps,injured,physicalArtsShelter,teleportEnemy} from './operator-support.js';
const state=new WeakMap();
function nian(bb,chess,def){
  const skills={};for(const s of chess.skills){const p=s.bb;
    if(s.index===0)skills[s.skillId]={kind:'duration',mods:{atkPct:p.atk,defPct:p.def},attack:{dmgType:'arts'}};
    if(s.index===1)skills[s.skillId]={kind:'duration',mods:{defPct:p.def,blockCnt:p.block_cnt},attack:{noAttack:true}};
    if(s.index===2)skills[s.skillId]={kind:'duration',mods:{atkPct:p['nian_s_3[self].atk']},onTick({battle,unit}){for(const a of inGrid(battle,unit,s.rangeGrid,'ally'))if(a!==unit&&a.kind!=='device'){
      battle.applyStrongest(a,'exp:nian:iron',{value:p['nian_s_3[ally].def'],duration:0.15,mods:v=>({defPct:v,blockCnt:1}),source:unit});battle.applyStatus(a,'resist',{value:0.5,duration:0.15,source:unit});
    }}};
  }
  return {skills,talents:[{install(b,u){
    let st=state.get(b);if(!st){st={nianTeams:new Set()};state.set(b,st);}if(!st.nianTeams.has(u.ownerId)){
      st.nianTeams.add(u.ownerId);for(const a of b.allyUnits)if(a.kind==='op'&&a.ownerId===u.ownerId&&a.def?.profession==='TANK')b.addBuff(a,{key:'exp:nian:teamHP',mods:{hpPct:0.16},persist:true,allowDead:true,tags:['talent']});
    }
    b.on('deploy',({unit})=>{if(unit===u)b.addBuff(u,{key:'exp:nian:shield',shieldHits:3,source:u,visible:true,tags:['talent']});},{owner:u});
    b.on('damaged',({source,target,dmg})=>{if(target!==u||!u.skill?.active||u.skill.id!=='skchr_nian_2'||source?.side!=='enemy'||!dmg?.isAttack||!source.alive)return;
      b.dealDamage(u,source,{amount:u.s.atk*u.skill.bb.atk_scale,type:'arts',tags:['exp:nian:counter']});if(source.alive)b.applyStatus(source,'silence',{duration:3,source:u});
    },{owner:u});
    if(chess.module?.active&&chess.module.id==='uniequip_002_nian')b.every(0.05,()=>{if(live(u)&&u.blocking.length)b.addBuff(u,{key:'exp:nian:module',mods:{defPct:0.2},duration:0.1,source:u});},{owner:u});
  }}]};
}
function shu(bb,chess,def){
  const skills={};for(const s of chess.skills){const p=s.bb;
    if(s.index===0)skills[s.skillId]={kind:'instant',heal:true,charges:s.maxChargeTime,trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid,allies:true,hpAtMost:0.5},targeting:{rangeGrid:s.rangeGrid},attack:{dmgType:'heal',heal:{mode:'single',hpAtMost:0.5},healScale:p.heal_scale,projectile:'none'}};
    if(s.index===1)skills[s.skillId]={kind:'duration',heal:true,trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid,allies:true},mods:{atkPct:p.atk,blockCnt:1,batPct:2.6/def.stats.bat-1},targeting:{rangeGrid:s.rangeGrid,maxTargets:2},attack:{dmgType:'heal',heal:{mode:'single'},projectile:'none',maxTargets:2}};
    if(s.index===2)skills[s.skillId]={kind:'duration',trigger:'NEVER',mods:{atkPct:p.atk},targeting:{rangeGrid:s.rangeGrid},onStart({unit}){unit.mem.expShuMarks=new Map();},onEnd({unit}){unit.mem.expShuMarks?.clear();unit.profile.dmgType='phys';unit.profile.heal=null;},onAttack({battle,unit,targets}){if(targets?.[0]?.side!=='enemy')return;const a=injured(battle,unit,s.rangeGrid)[0];if(a)battle.heal(unit,a,unit.s.atk);}};
  }
  return {skills,talents:[{install(b,u){
    const seeds=new Set();u.mem.expSeeds=seeds;u.mem.expShuMarks=new Map();
    const seed=(target)=>{if(target.kind!=='op'||target.ownerId!==u.ownerId)return;for(const[dr,dc]of N4){const r=target.tileR+dr,c=target.tileC+dc;if(b.grid.inRect(r,c)){const key=r*b.grid.cols+c;if(!seeds.has(key)){seeds.add(key);b.fx('exp-seed',{x:c,y:r,src:u.id});}}}};
    // Full tile refresh keeps the zone visible after watching/reconnecting, without changing combat or RNG.
    b.every(1,()=>{if(live(u)&&seeds.size)b.fx('exp-shu-seeds',{src:u.id,tiles:[...seeds].map(k=>[Math.floor(k/b.grid.cols),k%b.grid.cols]),dur:1.25});},{owner:u});
    b.on('healResolved',({source,target,actual,opts})=>{if(source===u&&actual>0&&!opts?.regen&&!opts?.aura)seed(target);},{owner:u});
    if(chess.module?.active)b.on('heal',ctx=>{if(ctx.source===u&&ctx.target.hpRatio<0.5)ctx.amount*=1.15;},{owner:u});
    b.on('death',({unit})=>{if(unit===u){seeds.clear();u.mem.expShuMarks.clear();b.fx('exp-seed-clear',{src:u.id});}},{owner:u});
    const team=b.allyUnits.filter(a=>a.kind==='op'&&a.ownerId===u.ownerId),four=new Set(team.filter(a=>a.def?.bonds?.includes(SUI)).map(family)).size>=4;
    // The four-Sui condition is a battle-roster snapshot; duplicate Shu never compounds it.
    if(four){for(const a of team)b.addBuff(a,{key:'exp:shu:fourSui',mods:{atkPct:0.12},persist:true,allowDead:true,tags:['talent']});
      if(!b._expShuSpTeams)b._expShuSpTeams=new Set();if(!b._expShuSpTeams.has(u.ownerId)){b._expShuSpTeams.add(u.ownerId);b.every(4,()=>{for(const a of team)if(live(a))a.skill?.gainSp(1,'exp:shu:fourSui');});}
    }
    b.every(0.05,()=>{
      if(!live(u))return;const ops=ownOps(b,u),profs=new Map();for(const a of ops)profs.set(a.def.profession,(profs.get(a.def.profession)||0)+1);
      const hp=profs.size>=3,aspd=[...profs.values()].some(n=>n>=3),s=u.skill,active=s?.active&&s.id==='skchr_shu_3';
      for(const a of ops){if(hp)b.addBuff(a,{key:'exp:shu:profHP',mods:{hpPct:0.12},duration:0.1,source:u});if(aspd)b.addBuff(a,{key:'exp:shu:profASPD',mods:{aspd:12},duration:0.1,source:u});}
      const scale=s?.active&&s.id==='skchr_shu_2'?s.bb.extra_extend_scale:1;
      for(const a of b.allyUnits)if(live(a)&&a.ownerId===u.ownerId&&a.kind!=='device'&&seeds.has(a.tileR*b.grid.cols+a.tileC)){
        b.applyStrongest(a,'exp:shu:seedRegen',{value:70*scale,duration:0.1,mods:v=>({hpRegen:v}),source:u});physicalArtsShelter(b,a,'exp:shu:seedShelter',0.1*scale,u,0.1);
      }
      if(s?.id==='skchr_shu_3'&&s.ready&&!s.active&&!s.opCooling&&(enemies(b,u,s.def.rangeGrid||chess.skills[2].rangeGrid).length||injured(b,u,chess.skills[2].rangeGrid).some(a=>a.hpRatio<1)))s.activate('exp:shu:engaged');
      if(!active){if(s?.id==='skchr_shu_3')u.profile.dmgType='phys';return;}
      const grid=chess.skills[2].rangeGrid;
      const hasGround=b.enemies.some(e=>live(e)&&!e.isFlying&&seeds.has(Math.round(e.y)*b.grid.cols+Math.round(e.x)));
      if(hasGround)for(const a of inGrid(b,u,grid,'ally'))if(a.kind!=='device')b.addBuff(a,{key:'exp:shu:s3Support',mods:{atkPct:s.bb.e_atk,aspd:s.bb.e_attack_speed},duration:0.1,source:u,tags:['skill']});
      const marks=u.mem.expShuMarks;
      for(const e of b.enemies){if(!live(e)||e.isFlying)continue;const r=Math.round(e.y),c=Math.round(e.x),key=r*b.grid.cols+c;let mark=marks.get(e.id);
        if(!mark&&seeds.has(key)){mark={r,c,last:key};marks.set(e.id,mark);}
        if(mark&&key!==mark.last){mark.last=key;if(Math.abs(r-mark.r)+Math.abs(c-mark.c)>=s.bb.max_distance)teleportEnemy(b,e,mark.r,mark.c,u);}
      }
      // S3 attacks enemies and heals on each attack; without enemies the same attack loop becomes a heal attack.
      if(enemies(b,u,grid).length){u.profile.dmgType='phys';u.profile.heal=null;}else{u.profile.dmgType='heal';u.profile.heal={mode:'single'};}
    },{owner:u});
  }}]};
}
export default {[NIAN]:nian,[SHU]:shu};
