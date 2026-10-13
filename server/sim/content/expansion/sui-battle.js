import {SUI} from './expansion-data.js';
import {canTargetEnemy,sortEnemyTargets} from '../../targeting.js';
import {aggregateMods} from '../../buffs.js';
import {Unit} from '../../units.js';
const live=u=>u?.alive&&u.deployed&&!u.hidden&&!u.removed;
export function install(battle){
  if(!battle.players.some(p=>p.bonds?.[SUI]?.active))return;
  const states=new Map(),snapshots=new Map(),origins=new Map();
  battle.on('battleStart',()=>{for(const u of battle.allyUnits)if(u.kind==='op'&&u.def?.bonds?.includes(SUI)){
    const {add,mul}=aggregateMods(u.buffs.filter(b=>!b.tags?.includes('skill')));
    snapshots.set(u.id,(u.base.atk+(add.atkFlat||0))*Math.max(0,1+(add.atkPct||0))*(mul.atkMul||1));
  }});
  function participate(source,target){
    if(source?.kind==='token')source=source.ownerUnit;
    if(!live(source)||source.kind!=='op'||!source.def?.bonds?.includes(SUI))return;
    const player=battle.getPlayer(source.ownerId),bond=player?.bonds?.[SUI];if(!bond?.active)return;
    let st=states.get(source.ownerId);if(!st){st={parts:new Map(),until:-Infinity};states.set(source.ownerId,st);}
    if(battle.time<st.until)return;
    for(const[id,entry]of st.parts)if(battle.time-entry.time>3||!live(entry.unit))st.parts.delete(id);
    st.parts.set(source.def.baseId,{time:battle.time,unit:source,atk:snapshots.get(source.id)??source.base.atk});
    if(st.parts.size<2)return;
    const participants=[...st.parts.values()].slice(-2),units=participants.map(p=>p.unit);
    const profile={canHitFly:units.some(u=>u.profile.canHitFly),hitSleep:false};
    const enemies=battle.enemies.filter(e=>live(e)&&units.some(u=>canTargetEnemy(u,e,u.profile)&&(u.rangeKeys.includes(Math.round(e.y)*battle.grid.cols+Math.round(e.x))||u.blocking.includes(e))));
    if(!enemies.length)return;
    sortEnemyTargets(battle,source,enemies);
    const main=enemies.find(e=>units.some(u=>u.blocking.includes(e)))||enemies[0];
    const A=participants.reduce((sum,p)=>sum+p.atk,0)/2,L=Math.min(80,Math.max(0,bond.layers||0)),four=bond.tier>=2;
    st.parts.clear();st.until=battle.time+8;
    let origin=origins.get(source.ownerId);if(!origin){origin=new Unit({id:`exp:sui:${source.ownerId}`,kind:'bond',side:'ally',ownerId:source.ownerId,base:{maxHp:1,atk:0}});origin.deployed=true;origin.alive=true;origins.set(source.ownerId,origin);}
    const deal=(e,amount,type)=>battle.dealDamage(origin,e,{amount,type,isSkill:false,tags:['exp:sui:combo']});
    deal(main,A*(2.2+0.015*L),'arts');if(four&&main.alive)deal(main,A*(1.2+0.01*L),'phys');
    const rest=battle.enemies.filter(e=>e!==main&&live(e)&&canTargetEnemy(origin,e,profile)&&Math.hypot(e.x-main.x,e.y-main.y)<=1.2);sortEnemyTargets(battle,source,rest);for(const e of rest.slice(0,four?4:2))deal(e,A*(2.2+0.015*L)*0.6,'arts');
    battle.fx('exp-sui',{x:main.x,y:main.y,owner:source.ownerId,participants:2,atk:A,layers:L});
  }
  battle.on('damageResolved',({source,target,dmg,dealt})=>{if(dealt>0&&(dmg?.isAttack||dmg?.isSkill)&&!dmg.sourceless&&!dmg.tags?.some(t=>/combo|counter|reflect/.test(t)))participate(source,target);});
  battle.on('healResolved',({source,target,actual,opts})=>{if(actual>0&&!opts?.regen&&!opts?.aura&&!opts?.silent)participate(source,target);});
}
