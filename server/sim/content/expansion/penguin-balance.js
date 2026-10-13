// Match-scoped values shared by mechanics and descriptions.
export const PENGUIN_BALANCE=Object.freeze({growth:Object.freeze([3,5]),atkFlat:Object.freeze([40,80]),defFlat:Object.freeze([60,100]),statPct:Object.freeze([0.05,0.10]),milestones:Object.freeze([12,30,50]),maxGearTier:4,croissantNormal:3,croissantElite:6,soraNormal:2,soraElite:4,bisonFirstSpend:8,bisonSecondSpend:18});
export const isPenguinCombatGear=it=>!!it&&it.itemType==='EQUIP'&&['passive','passive_counter','post_battle_transform'].includes(it.kind);
