// A player-owned structure without an operator summoner; it never counts as a bond member or population.
export const LIGHTHOUSE='token_iberia_lighthouse';
export const LIGHTHOUSE_RANGE=Object.freeze(Array.from({length:9},(_,i)=>Object.freeze([Math.floor(i/3)-1,i%3-1])));
export const LIGHTHOUSE_RECORD=Object.freeze({tokenId:LIGHTHOUSE,name:'灯塔',kind:'summon',position:'ALL',placeable:true,deployLimit:1,owners:[],
 desc:'场上伊比利亚盟约人数达到9时获得一座，低于9时消失。占用部署格，不占在场人口，无召唤者，不攻击或阻挡，不受攻击。技能消耗12技力，为自身周围3×3格内的本人伊比利亚干员各赋予1次伤害抵挡，同来源不叠加。基础每秒回复1技力；周围3×3格有敌人时每秒额外回复1技力。可接受伊比利亚点灯的技力回复。',
 attackKind:'none',dmgType:'none',untargetable:true,abnormal:['healFree','isolated'],rangeGrid:LIGHTHOUSE_RANGE,
 stats:{maxHp:1,atk:0,def:0,res:0,blockCnt:0,cost:0,respawnTime:0,interval:1,spRecovery:1},
 skill:{skillId:'iberia_lighthouse_ward',name:'守望之光',desc:'消耗12技力，为自身周围3×3格的本人伊比利亚干员各赋予1次次数盾，同来源不叠加。基础每秒1技力；范围内有敌人时每秒额外1技力；可接受点灯技力。',level:1,skillType:'AUTO',spType:'INCREASE_WITH_TIME',spCost:12,initSp:0,maxChargeTime:1,increment:1,duration:0,bb:{},trigger:{rule:'NEVER'}},
 assets:{avatar:LIGHTHOUSE,spine:LIGHTHOUSE}});
