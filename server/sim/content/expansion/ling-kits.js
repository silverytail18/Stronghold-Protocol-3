import {LING} from './expansion-data.js';
import {absoluteRangeKeys} from '../../targeting.js';
import {live,enemies,N4} from './operator-support.js';
export const LING_TOKENS=['token_10020_ling_soul1','token_10020_ling_soul2','token_10020_ling_soul3'];
export const ADVANCED='token_10020_ling_soul3_advanced';
const mine=(b,u)=>b.allyUnits.filter(t=>t.kind==='token'&&t.ownerUnit===u&&live(t)&&[...LING_TOKENS,ADVANCED].includes(t.defId));
const weight=t=>t.defId===ADVANCED?2:1;
const active=t=>live(t.ownerUnit)&&t.ownerUnit.skill?.active;
function stock(u,n){const cap=u.def.raw.module?.active?8:5;u.mem.expLingStock=Math.min(cap,Math.max(0,(u.mem.expLingStock||0)+n));}
function ling(bb,chess,def){
  const skills={};for(const s of chess.skills){const p=s.bb;
    if(s.index===0)skills[s.skillId]={kind:'duration',mods:{atkPct:p.atk,aspd:p.attack_speed},onStart({unit}){stock(unit,1);}};
    if(s.index===1)skills[s.skillId]={kind:'instant',charges:2,trigger:'NEVER',onStart({battle:b,unit:u}){
      for(const caster of [u,...mine(b,u)])for(const e of enemies(b,caster,null,true).slice(0,2)){b.dealDamage(caster,e,{amount:caster.s.atk*p.atk_scale,type:'arts',isSkill:true,tags:['exp:ling:s2']});if(e.alive)b.applyStatus(e,'bind',{duration:p['ling_s2_unmovable.duration'],source:caster});}
      for(const t of mine(b,u))if(t.hpRatio<0.5){stock(u,1);b.retreat(t,{reason:'exp:ling:recovered',permanent:true});}
    }};
    if(s.index===2)skills[s.skillId]={kind:'duration',mods:{atkPct:p.atk,defPct:p.def},onEnd({unit,reason}){if(reason==='duration')stock(unit,1);}};
  }
  return {skills,talents:[{install(b,u){
    b.on('deploy',({unit,initial})=>{if(unit!==u)return;u.mem.expLingStock=chess.module?.active?8:5;u.mem.expLingPlaced=0;u.mem.expLingStacks=0;b.removeBuff(u,'exp:ling:stacks');for(const t of b.allyUnits)if(t.ownerUnit===u&&t.uid!=null&&!t.alive){t.removed=false;t.mem.expLingJoined=null;t.mem.expLingReady=b.time;}},{owner:u,priority:20});
    b.on('death',({unit:t,reason})=>{
      if(t===u){for(const q of b.allyUnits.filter(q=>q.ownerUnit===u)){if(live(q))b.retreat(q,{reason:'exp:ling:ownerGone',permanent:true});q.removed=q.uid==null;q.mem.expLingJoined=null;q.mem.expLingReady=Infinity;}return;}
      if(t.ownerUnit!==u||![...LING_TOKENS,ADVANCED].includes(t.defId)||!live(u)||!['killed','exp:ling:absorbed','exp:ling:recovered'].includes(reason))return;
      u.skill?.gainSp(3,'exp:ling:tokenEnd');u.mem.expLingStacks=Math.min(5,(u.mem.expLingStacks||0)+1);b.addBuff(u,{key:'exp:ling:stacks',mods:{atkPct:0.03*u.mem.expLingStacks},source:u,tags:['talent']});
      if(t.defId===ADVANCED)for(const q of t.mem.expLingBases||[]){q.removed=false;q.mem.expLingJoined=null;q.mem.expLingReady=b.time+q.base.respawnTime;}
      // A placed base remains a reserved summon position. New stock + DP allow its redeployment.
      if(t.uid!=null&&reason!=='exp:ling:absorbed'){t.removed=false;t.mem.expLingReady=b.time+t.base.respawnTime;}
    },{owner:u,priority:10});
    b.on('deploy',({unit:t})=>{
      if(t.kind!=='token'||t.ownerUnit!==u||![...LING_TOKENS,ADVANCED].includes(t.defId))return;
      if(t.defId!==ADVANCED){if((u.mem.expLingStock||0)<=0){b.retreat(t,{reason:'exp:ling:noStock',permanent:true});return;}stock(u,-1);}
      const total=mine(b,u).reduce((n,q)=>n+weight(q),0);if(total>3){b.retreat(t,{reason:'exp:ling:overLimit',permanent:true});return;}
      if(t.defId===LING_TOKENS[2]){
        const other=mine(b,u).find(q=>q!==t&&q.defId===t.defId&&absoluteRangeKeys(q.rangeGrid,q.tileR,q.tileC,q.dir).includes(t.tileR*b.grid.cols+t.tileC));
        if(other){const r=other.tileR,c=other.tileC,dir=other.dir;b.retreat(t,{reason:'exp:ling:absorbed',permanent:true});b.retreat(other,{reason:'exp:ling:converted',permanent:true});
          const adv=b.spawnToken(u,ADVANCED,r,c,{dir,anySource:true});
          for(const q of [t,other]){q.removed=false;q.mem.expLingJoined=adv?.id||null;q.mem.expLingReady=b.time+q.base.respawnTime;}
          if(adv)adv.mem.expLingBases=[t,other];
        }
      }
    },{owner:u,priority:15});
    b.every(0.05,()=>{
      if(!live(u))return;const s=u.skill;
      if(s?.id==='skchr_ling_2'&&s.ready&&!s.opCooling&&[u,...mine(b,u)].some(c=>enemies(b,c,null,true).length))s.activate('exp:ling:engaged');
      for(const t of b.allyUnits)if(t.ownerUnit===u&&t.uid!=null&&!t.alive&&!t.removed&&!t.mem.expLingJoined&&b.time>=(t.mem.expLingReady??Infinity)&&(u.mem.expLingStock||0)>0&&mine(b,u).reduce((n,q)=>n+weight(q),0)<3){b.redeploy(t,{free:false,tile:[t.tileR,t.tileC]});}
      for(const t of mine(b,u)){
        if(s?.active&&s.id==='skchr_ling_1'){b.addBuff(t,{key:'exp:ling:s1',mods:{atkPct:s.bb.atk,aspd:s.bb.attack_speed},duration:0.1,source:u,tags:['skill']});t.profile.dmgType='arts';}
        else if(t.defId===LING_TOKENS[0])t.profile.dmgType='phys';
        if(s?.active&&s.id==='skchr_ling_3')b.addBuff(t,{key:'exp:ling:s3',mods:{atkPct:s.bb.atk,defPct:s.bb.def},duration:0.1,source:u,tags:['skill']});
      }
    },{owner:u});
    b.every(0.5,()=>{if(!live(u)||!u.skill?.active||u.skill.id!=='skchr_ling_3')return;for(const t of mine(b,u))for(const e of b.unitsInGrid(t,N4,{side:'enemy'}))if(!e.isFlying)b.dealDamage(t,e,{amount:u.s.atk*0.2,type:'arts',isSkill:true,tags:['exp:ling:s3Pulse']});},{owner:u});
  }}]};
}
function token(bb,raw,def){return {fromTokens:false,trait:{hitAllBlocked:def.id===LING_TOKENS[2]||def.id===ADVANCED,install(b,u){u.profile.hitAllBlocked=def.id===LING_TOKENS[2]||def.id===ADVANCED;}}};}
export const TOKEN_KITS=Object.fromEntries([...LING_TOKENS,ADVANCED].map(id=>[id,token]));
export default {[LING]:ling};
