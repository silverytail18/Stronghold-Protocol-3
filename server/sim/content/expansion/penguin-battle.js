import {PENGUIN} from './penguin-data.js';
import {PENGUIN_BALANCE as P,isPenguinCombatGear} from './penguin-balance.js';
import {itemRecord,passiveBuff} from '../support/index.js';
export function install(battle){
  if(!battle.players.some(p=>p.bonds?.[PENGUIN]?.active))return;
  const apply=u=>{
    const state=battle.getPlayer(u?.ownerId)?.bonds?.[PENGUIN];
    if(u?.kind!=='op'||!state?.active||!u.items?.some(id=>isPenguinCombatGear(itemRecord(id))))return;
    const i=state.tier>=2?1:0;
    passiveBuff(battle,u,'exp:penguin:armed',{atkFlat:P.atkFlat[i],defFlat:P.defFlat[i],atkPct:P.statPct[i],defPct:P.statPct[i]});
  };
  battle.on('battleStart',()=>battle.allyUnits.forEach(apply));
  battle.on('deploy',({unit})=>apply(unit));
}
