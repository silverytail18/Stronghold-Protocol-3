// Shared runtime/text constants. Layers remain 0..999.
import {RHODES_FIXED_ATK,RHODES_REFERENCE_ATK} from '../../../../shared/rhodes-engineering.js';
export const RI_BALANCE=Object.freeze({atkBase:.20,atkPerLayer:.002,hpBase:.20,hpPerLayer:.002,growth:[0,2,7],professions:[3,4,5],composition:[1,2,4],openingSp:[12,16]});
export const ENGINEERING_BALANCE=Object.freeze({base:500,perLayer:2,baseCurve:'smooth-v6-intrinsic',referenceAtk:RHODES_REFERENCE_ATK,atkScale:RHODES_FIXED_ATK,openingDelay:2,interval:[4,2.5],fuse:[.5,.4],radius:[.8,1.2],reach:2,maxTargets:[3,Infinity],trueScale:.5,lockSlow:.5,growth:[2,2],cap:[24,30],angles:{phys:12,arts:18,true:6}});
export const TERMINAL='chess_rm_terminal_e';
export const FIRE_CONTROL_BALANCE=Object.freeze({markDuration:3,familyCooldown:6,middleCooldown:8,terminalCooldown:10,teamCooldown:2,stock:2,followInterval:1,followRounds:[2,1]});
export const PERSONAL_BALANCE=Object.freeze({amiyaDamage:[.20,.30],amiyaRes:[12,18],kroosStep:[.05,.07],kroosIgnore:[.35,.45],mortisDamage:[.20,.30],tmorisDamage:[.20,.30],tmorisSp:[3,5],tmorisCooldown:8,leadingStep:[.08,.12],monHealStep:[.06,.09],monFusionStep:[.10,.15],monCooldown:3});
export const TERMINAL_BALANCE=Object.freeze({atk:[.12,.20],openingSp:[10,15]});
export const OLD_RI_GROWTH=Object.freeze({prep:1,humus:[2,3],humusCap:[8,16]});
export const NEARL_BALANCE=Object.freeze({reduction:[.10,.15],seconds:8,growth:[2,4],cap:[10,20],reach:2,recent:2});
