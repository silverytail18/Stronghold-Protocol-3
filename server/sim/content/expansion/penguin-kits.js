import {aggregateMods} from '../../buffs.js';
import {absoluteRangeKeys,canTargetEnemy} from '../../targeting.js';
import {CROISSANT,SORA} from './penguin-data.js';
const live=u=>u?.alive&&u.deployed&&!u.removed&&!u.hidden;
const N4=[[1,0],[-1,0],[0,1],[0,-1]];
function inspire(battle,target,val,source){
  if(!live(target)||target.mem.noInspire||!(val>0))return;
  const key='inspire',cur=target.findBuff(key);
  if(cur?.data&&cur.data.src!==source.id&&cur.data.val>val&&cur.timeLeft>0.1)return;
  const {add,mul}=aggregateMods(target.buffs.filter(b=>b.key!==key));
  const factor=Math.max(0,1+(add.atkPct||0))*(mul.atkMul||1);
  battle.addBuff(target,{key,mods:{atkFlat:factor>1e-6?val/factor:val},duration:0.15,refresh:'replace',source,visible:true,data:{src:source.id,val}});
}
function croissant(bb,chess,def){
  const self=def.talents[0]?.bb?.['moeshd_t_1[self].prob']||0;
  const aura=def.talents[0]?.bb?.['moeshd_t_1[aura].prob']||0;
  const make=s=>s.skillId==='skchr_moeshd_1'?{kind:'duration',mods:{defPct:s.bb.def},trigger:'SP_FULL'}:{
    kind:'instant',
    onStart({battle,unit}){
      const keys=absoluteRangeKeys(s.rangeGrid,unit.tileR,unit.tileC,unit.dir);
      for(const enemy of battle.enemiesInKeys(keys,unit,{canHitFly:false})){
        battle.dealDamage(unit,enemy,{amount:unit.s.atk*s.bb.atk_scale,type:'phys',isSkill:true,tags:['c1:croissant:hammer']});
        if(enemy.alive){battle.push(enemy,s.bb.force,{from:unit});battle.applyStatus(enemy,'stun',{duration:s.bb.stun,source:unit});}
      }
    }
  };
  return {skills:Object.fromEntries(chess.skills.map(s=>[s.skillId,make(s)])),talents:[{install(battle,unit){
    battle.every(0.05,()=>{
      if(!live(unit))return;
      const scale=unit.skill?.active&&unit.skill.id==='skchr_moeshd_1'?unit.skill.bb.talent_scale:1;
      for(const ally of battle.allyUnits){
        if(!live(ally)||ally.side!==unit.side||ally.kind==='device'||!battle.allySelectable(ally,unit))continue;
        const distance=Math.abs(ally.tileR-unit.tileR)+Math.abs(ally.tileC-unit.tileC);
        if(ally!==unit&&distance!==1)continue;
        const prob=(ally===unit?self:aura)*scale;
        battle.applyStrongest(ally,'c1:croissant:field',{value:prob,duration:0.15,mods:v=>({dodgePhys:v,dodgeArts:v}),source:unit});
      }
    },{owner:unit,immediate:true});
  }}]};
}
function sora(bb,chess,def){
  const make=s=>s.skillId==='skchr_sora_1'?{
    kind:'duration',targeting:{rangeGrid:s.rangeGrid},trigger:{rule:'SKILL_RANGE',grid:s.rangeGrid},
    onStart({battle,unit}){for(const enemy of battle.unitsInGrid(unit,s.rangeGrid)){if(canTargetEnemy(unit,enemy,{canHitFly:true}))battle.applyStatus(enemy,'sleep',{duration:s.duration,source:unit});}},
    onTick({battle,unit,skill}){for(const enemy of battle.unitsInGrid(unit,s.rangeGrid)){if(enemy.alive&&!enemy.s.flags.sleep&&canTargetEnemy(unit,enemy,{canHitFly:true}))battle.applyStatus(enemy,'sleep',{duration:Math.max(0.01,skill.timeLeft),source:unit});}}
  }:{kind:'duration',trigger:'NEVER'};
  return {trait:{noAttack:true,install(battle,unit){unit.mem.noInspire=true;}},skills:Object.fromEntries(chess.skills.map(s=>[s.skillId,make(s)])),talents:[{install(battle,unit){
    const encore=def.talents.find(t=>t.index===0)?.bb||{prob:0.5,sp:0.5};
    // The module's ATK increase is multiplicative and explicitly not affected by skill percentages.
    const mod=chess.module?.active&&chess.module.id==='uniequip_002_sora';
    const update=()=>{
      if(!live(unit))return;
      const allies=battle.alliesInGrid(unit);
      // Sora S2's original inspire explicitly ignores isolation. Only this new kit opts into that selector.
      const inspireAllies=battle.unitsInGrid(unit,unit.liveRangeGrid||unit.rangeGrid,{side:'ally'}).filter(a=>a.kind!=='device');
      if(mod){const yes=allies.filter(a=>a!==unit&&a.kind==='op').length>=2; if(yes)battle.addBuff(unit,{key:'c1:sora:module',mods:{atkMul:1.08}});else battle.removeBuff(unit,'c1:sora:module');}
      if(unit.skill?.active&&unit.skill.id==='skchr_sora_2')for(const ally of inspireAllies)if(ally!==unit)inspire(battle,ally,unit.s.atk*unit.skill.bb.atk,unit);
      if(unit.canAct&&unit.skill?.id==='skchr_sora_2'&&unit.skill.ready&&!unit.skill.active&&!unit.skill.opCooling){
        const engaged=inspireAllies.some(a=>a!==unit&&!a.mem.noInspire&&(a.blocking.length||battle.enemiesInKeys(a.rangeKeys,a,a.profile).length));
        if(engaged)unit.skill.activate('c1:sora:engaged');
      }
    };
    battle.every(0.05,update,{owner:unit,immediate:true});
    battle.every(0.05,()=>{
      if(!unit.canAct)return;
      const ratio=unit.skill?.active&&unit.skill.id==='skchr_sora_1'?unit.skill.bb['attack@atk_to_hp_recovery_ratio']:0.1;
      for(const ally of battle.alliesInGrid(unit))battle.addBuff(ally,{key:`c1:sora:regen:${unit.id}`,mods:{hpRegen:unit.s.atk*ratio},duration:0.1,source:unit});
    },{owner:unit});
    battle.on('skillEnd',({unit:ended,reason})=>{if(ended!==unit||reason!=='duration')return;if(battle.rng()<encore.prob)unit.skill.gainSp(unit.skill.spCost*encore.sp,'c1:sora:encore');},{owner:unit});
  }}]};
}
export default {[CROISSANT]:croissant,[SORA]:sora};
