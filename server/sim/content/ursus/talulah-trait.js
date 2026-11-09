import {URSUS_TRAITS,OXI_BURN_RATIO,traitId} from '../../../../shared/ursus-traits.js';
const variants=Object.freeze([0,1].map(i=>Object.freeze({damage:URSUS_TRAITS.oxi.amount[i],burn:OXI_BURN_RATIO[i]})));

// Identity belongs to the operator, independently of her current/granted covenants.
export function talulahTrait(u,battle){
 if(u?.kind!=='op'||u.trait?.doll||u.def.raw?.charId!=='char_4247_oxi')return null;
 if(!(battle?.ursus?.states?.get(u.ownerId)?.tier>0))return null;
 const quality=u.def.raw.isGolden?1:0;
 return u.def.raw.garrisonIds?.includes(traitId('oxi',!!quality))
  ?variants[quality]:null;
}

// Include native ground fire, but never equipment/covenant damage or sourceless bursts.
export function nativeTalulahDamage(d){
 return !!d&&!d.sourceless&&['arts','elemental'].includes(d.type)
  &&!d.tags?.some(t=>/(?:^|:)(item|bond|burst|reflect|hpLoss)(?::|$)/.test(t)||/^(ur:|hg:)/.test(t))
  &&(d.isAttack||d.tags?.includes('native:ursus')&&d.tags?.some(t=>t.startsWith('oxi:')));
}
