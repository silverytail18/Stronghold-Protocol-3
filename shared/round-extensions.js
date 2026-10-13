// Match-scoped extension rules. The unchanged baseline R13 is the anchor in every mode.
export const ROUND_EXTENSION_TOTALS = Object.freeze([20,24,30]);
export const SINGLE_STEPS = Object.freeze([0,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6]);
export const MULTI_HP_STEPS = SINGLE_STEPS;
export const MULTI_ATK_STEPS = Object.freeze([0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5]);
export const EXTENSION_SOURCES = Object.freeze([13,13,12,13,12,13,13,12,13,13,12,13,13,12,13,13]);
export const EXTENSION_PROFILES = Object.freeze(['transition','pressure','focus','pressure','focus','consolidate','pressure','focus','consolidate','pressure','focus','consolidate','pressure','focus','consolidate','pressure']);
export const EXTENSION_FLY = Object.freeze([false,null,true,false,null,null,false,true,null,false,true,null,false,true,null,null]);
export const EXTENSION_BOSSES = Object.freeze({
  20:Object.freeze({main:1.30,hidden:1.25,escort:1.20,attack:1.05}),
  24:Object.freeze({main:1.50,hidden:1.40,escort:1.35,attack:1.10}),
  30:Object.freeze({main:1.80,hidden:1.65,escort:1.50,attack:1.15}),
});
export function extensionMultipliers(type,index){
  if(!Number.isInteger(index)||index<0||index>=SINGLE_STEPS.length)throw new RangeError('扩展回合索引无效');
  const kHp=SINGLE_STEPS[index],kAtk=type==='SINGLE'?kHp:MULTI_ATK_STEPS[index];
  return {hp:1.2**kHp,atk:1.1**kAtk,kHp,kAtk};
}
