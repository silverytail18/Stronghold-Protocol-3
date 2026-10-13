// Carry can only name the player's own input instances that wore the controller.
import {RHINE_CONTROLLER} from '../../../../shared/rhine.js';
export function sanitizeRhineResult(input,p,gd){
 if(!input?.contentInfo?.rhine||!p?.rhineCarry)return {};
 const eligible=new Set((input.units||[]).filter(u=>u.kind!=='token'&&(u.items||[]).some(id=>gd?.item?.(id)?.baseId===RHINE_CONTROLLER+'_a')).map(u=>u.uid));
 const used=(Array.isArray(p.rhineCarry.controllerUsed)?p.rhineCarry.controllerUsed:[]).filter(uid=>eligible.has(uid));
 return {rhineCarry:{controllerUsed:[...new Set(used)]}};
}
