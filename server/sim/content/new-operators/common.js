import {absoluteRangeKeys,canTargetEnemy,sortEnemyTargets} from '../../targeting.js';
export const live=u=>!!u?.alive&&u.deployed&&!u.removed&&!u.hidden;
export const talent=(c,i)=>c.talents?.filter(t=>t.index===i||t.talentIndex===i).at(-1)?.bb||{};
export const specs=(c,f)=>Object.fromEntries(c.skills.map(s=>[s.skillId,f(s,s.bb)]));
export const buff=(b,u,key,mods,extra={})=>b.addBuff(u,{key:'native:new:'+key,mods,...extra});
export const foes=(b,u,grid=u.liveRangeGrid,fly=true)=>sortEnemyTargets(b,u,b.enemiesInKeys(absoluteRangeKeys(grid||u.rangeGrid,u.tileR,u.tileC,u.dir),u,{canHitFly:fly}));
export const eligible=(u,e,fly=true)=>live(e)&&e.side==='enemy'&&canTargetEnemy(u,e,{canHitFly:fly});
export const damage=(b,u,e,amount,type='arts',tag='skill',extra={})=>eligible(u,e)?b.dealDamage(u,e,{amount,type,isSkill:true,tags:['native:new',tag],...extra}):0;
export const interval=u=>Math.max(.1,u.s.bat*100/Math.max(1,u.s.aspd));
export function skillGuard(u,test){const activate=u.skill.activate.bind(u.skill);u.skill.activate=(reason,opts)=>test()?activate(reason,opts):false;}
