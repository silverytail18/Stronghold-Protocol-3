import {markProductContent} from '../../../../shared/product-content.js';
import {PERSONAL_BALANCE as P} from './balance.js';
const percent=n=>Math.round(n*10000)/100;
const definitions={
 chess_rm_amiya_a:['amiya','精神共鸣',i=>'技能期间对敌方的原生伤害+'+percent(P.amiyaDamage[i])+'%；原生法伤命中标定敌人时忽略'+P.amiyaRes[i]+'点法抗，同类穿透取高。保留原技能代价。'],
 chess_char_4_06_a:['kroos','持续校射',i=>'完整原生物理攻击有效命中同一敌人积累专注，每层原生物伤+'+percent(P.kroosStep[i])+'%，最多4层；满层忽略'+percent(P.kroosIgnore[i])+'%防御，同类穿透取高。换目标最多保留2层，停手4秒清空。'],
 chess_rm_mortis_a:['mortis','承痛反奏',i=>'受到敌方有效伤害或护盾吸收后，对敌方的原生物法伤害+'+percent(P.mortisDamage[i])+'%，持续4秒。本体／替身切换保留剩余时间，自伤不触发。'],
 chess_rm_tmoris_a:['tmoris','回响协奏',i=>'对标定敌人的原生技能伤害+'+percent(P.tmorisDamage[i])+'%；正常付费开技且有效造成伤害后，自然结束时额外获得'+P.tmorisSp[i]+'SP，同名8秒冷却；免费开技不返还，继承不重复生成资格。'],
 chess_rm_oblvns_a:['oblvns','持续领奏',i=>'每个有效原生音符攻击周期积累1层领奏，最多3层，每层本人原生音符伤害+'+percent(P.leadingStep[i])+'%；停手4秒后每秒掉1层。满层时，尚未命中音符可在旧目标死亡后于本人当前合法范围重选一次，不复制音符或增加命中次数。'],
 chess_rm_monstr_a:['monstr','修复蓄能',i=>'每次完整原生治疗实际治疗另一名本人真实干员，积蓄1点，最多3点、同名3秒冷却；每点直接治疗+'+percent(P.monHealStep[i])+'%。三技能消耗蓄能，每点提高本次本人原生真伤'+percent(P.monFusionStep[i])+'%。不计自身／重构体／召唤物／过量治疗，主附链共享一次判定。']
};
export function applyPersonalRecords(data){
 markProductContent(data,"rhodes-mujica-v1");
 for(const c of Object.values(data.chess)){const family=String(c.baseId??c.chessId).replace(/_b$/,'_a'),d=definitions[family];if(!d||!c.bonds?.includes('rhodesShip'))continue;
  const obsolete=c.garrisonIds.filter(id=>id.startsWith('rm_growth_')||id.startsWith('newop_monstr_'));for(const id of obsolete)delete data.garrisons[id];c.garrisonIds=c.garrisonIds.filter(id=>!obsolete.includes(id));
  const i=+c.isGolden,id='rm_personal_'+d[0]+'_'+(i?'b':'a'),desc='【'+d[1]+'】本人6罗德岛激活时：'+d[2](i)+' 仅强化本人，不改变原生面板或炮火伤害；不再附带罗德岛个人叠层特质。';
  data.garrisons[id]={garrisonId:id,name:d[1],desc,descRaw:desc,eventType:'IN_BATTLE',eventTypeDesc:'专属强化',eventTypeIcon:'icon_battle',effectType:'RI_PERSONAL',effectKey:'rm_personal',expansionBatch:'rhodes-mujica-v1',owners:[c.chessId],bb:{},bbStr:{}};
  if(!c.garrisonIds.includes(id))c.garrisonIds=[...c.garrisonIds,id];
 }
 return data;
}
