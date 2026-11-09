export const TRAITS=Object.freeze({
 elysm:{name:'归乡旗语',threshold:1,description:'休整结束，场上至少2名不同伊比利亚远程干员时，伊比利亚与远见各＋1／2层；每次休整一次。'},
 highmo:{name:'潮痕自持',threshold:6,description:'每6次原生有效自恢复动作，伊比利亚＋2／4层。'},
 bluep:{name:'蓝色试剂',threshold:6,aux:'preciShip',description:'每6名不同敌人实际受到本人毒伤，伊比利亚与精准各＋2／4层。'},
 rosesa:{name:'盐漠行医',threshold:6,aux:'deputShip',description:'每6次对友方干员的原生有效治疗，伊比利亚与助力各＋2／4层。'},
 glacus:{name:'电磁航标',threshold:6,aux:'arcaneShip',description:'原生技能累计有效命中6名不同敌人，伊比利亚与奥术各＋2／4层。'},
 toledo:{name:'传说作证',threshold:6,description:'本人范围内至少一名被阻挡且受本人原生削弱的敌人，累计有效6秒，伊比利亚＋2／4层。'},
 hbound:{name:'礁下刻度',threshold:8,aux:'swiftShip',description:'炼金区域对重型地面敌人每累计8次有效伤害，伊比利亚与迅捷各＋2／4层。'},
 thorns:{name:'故土锋芒',threshold:12,aux:'skillfulShip',description:'每12次有效原生攻击动作（含S2反击），伊比利亚与灵巧各＋2／4层。'},
 irene:{name:'审判手记',threshold:1,aux:'swiftShip',description:'一次原生技能至少实际伤害1名敌人，伊比利亚与迅捷各＋2／4层。'}
});
export const traitId=(key,gold)=>'iberia_trait_'+key+(gold?'_b':'_a');
export function applyTraits(data){for(const[key,t]of Object.entries(TRAITS))for(const gold of[false,true]){const id='chess_iberia_'+key+(gold?'_b':'_a'),gid=traitId(key,gold),desc=t.description+(key==='elysm'?'':' 同名普通／精锐每正式回合共享基础6／12层上限；新增战斗特质的伊比利亚基础奖励全队共用24层上限，其他盟约不占该额度，联防继承。仅激活归属获得层数。');data.chess[id].garrisonIds.push(gid);data.garrisons[gid]={garrisonId:gid,name:t.name,desc,descRaw:desc,eventType:key==='elysm'?'PREPARATION_END':'IN_BATTLE',eventTypeDesc:'专属成长',eventTypeIcon:'icon_battle',effectType:'IBERIA_UNIQUE',effectKey:'iberia_trait_'+key,bb:{},bbStr:{},owners:[id],expansionBatch:'iberia-expansion-v1'};}}
