// Match-scoped garrison replacements. Personal combat values never read covenant values.
export const KAZDEL_TRAIT_VERSION=3;
export const TRAIT_RULES=Object.freeze({block:[1,1,1],pressureProtection:[0,0,0],vignaAspd:8,hodrerDef:60,hibiscHealing:.1,flameDamage:.08,logosDamage:.08,wisdelShockDamage:.1,meteoDef:65,wSlow:.15,mudrockProtection:.05,warfarinHealing:.05,kingDef:40});
export const KAZDEL_NATIVE_TRAITS={
 chess_kz_vigna_a:['vigna','接敌先锋','阻挡敌人时，自身攻击速度+8。'],
 chess_kz_hibisc_a:['hibisc','战地续命','自身治疗量+10%。'],
 chess_kz_flameb_a:['flameb','近身血战','普通攻击自身阻挡的敌人时，伤害加成+8%。'],
 chess_kz_hodrer_a:['hodrer','守线重刃','阻挡敌人时，自身防御力+60。'],
 chess_kz_meteo_a:['meteo','血线破甲','攻击被友方干员阻挡的敌人时，使其防御力-65，持续3秒（同名效果不叠加）。'],
 chess_kz_cqbw_a:['w','爆破迟滞','爆炸命中的敌人移动速度-15%，持续1.5秒（同一目标冷却4秒，同名共享）。'],
 chess_kz_logos_a:['logos','战线判辞','对被友方干员阻挡的敌人，法术伤害加成+8%。'],
 chess_kz_wisdel_a:['wisdel','余震压制','自身原生余震的物理伤害加成+10%；不影响主攻击、残影爆炸或魂灵之影。'],
 chess_char_4_18_a:['mudrock','魂垒积累','原生护盾破裂后，自身受到的物理伤害降低5%，持续3秒（减伤效果冷却6秒）。'],
 chess_char_5_07_a:['surtr','灼魂积累','本场首次部署时额外获得2点技力。'],
 chess_char_4_26_a:['warfarin','战地血援','治疗半血以下目标时，治疗量+5%。'],
 chess_char_4_25_a:['king','余火守护','身前一格友方干员防御力+40（同名效果不叠加）。'],
};
export const personalBase=c=>String(c?.productSourceId||c?.baseId||c?.chessId||c?.id||'').replace(/_b$/,'_a');
export function kazdelTraitFor(c){const v=KAZDEL_NATIVE_TRAITS[personalBase(c)];return v?{id:v[0],name:v[1],desc:v[2],native:true}:null;}
export const GROWTH_KEYS=['attacks','blockedAttacks','blastHits','explosions','artsAttacks','skillStarts','shieldBreaks','lowHeals','healAmount','healSeconds','blockedSeconds','firstDeploy','legacyPoints'];
export function personalGrowthPoints(c,v){
 const t=kazdelTraitFor(c);if(!t)return null;const g=v.growth||{},n=k=>Math.max(0,Number.isFinite(g[k])?g[k]:0),f=v.golden?2:1;
 let count=0;switch(t.id){
 case 'vigna':count=Math.floor(n('attacks')/3);break;
 case 'hibisc':count=Math.floor(n('healAmount')/Math.max(1,v.startHp*.2));break;
 case 'flameb':count=Math.floor(n('blockedAttacks')/2);break;
 case 'hodrer':count=Math.floor((n('blockedSeconds')+1e-8)/2);break;
 case 'meteo':count=Math.floor(n('blastHits')/3);break;
 case 'w':count=Math.floor(n('explosions')/2);break;
 case 'logos':count=Math.floor(n('artsAttacks')/3)+n('skillStarts');break;
 case 'wisdel':count=Math.floor(n('blastHits')/3);break;
 case 'mudrock':count=n('shieldBreaks');break;
 case 'surtr':count=2*Math.min(1,n('firstDeploy'))+Math.floor(n('artsAttacks')/3);break;
 case 'warfarin':count=Math.floor(n('lowHeals')/2);break;
 case 'king':count=Math.floor((n('healSeconds')+1e-8)/4);break;
 }
 return Math.min(v.golden?10:6,(v.participated?f:0)+count*f+n('legacyPoints'));
}
export function personalGarrisonText(c){
 const t=kazdelTraitFor(c);if(!t)return '';const f=c.isGolden?2:1,cap=c.isGolden?10:6;
 const conditions={vigna:'每进行3次有效普通攻击',hibisc:'实际治疗量每累计达到自身开战最大生命的20%',flameb:'每进行2次对自身阻挡敌人的有效攻击',hodrer:'每累计阻挡敌人2秒',meteo:'自身爆炸每累计有效命中敌人3次',w:'每进行2次有效爆炸攻击',logos:'每进行3次有效法术攻击或开启技能时',wisdel:'自身原生余震每累计有效命中敌人3次',mudrock:'原生护盾破裂时',warfarin:'每进行2次对半血以下友方干员的有效治疗',king:'自身范围治疗每累计有效恢复生命4秒'};
 if(t.id==='surtr')return `本场首次部署时使已激活的【卡兹戴尔】层数+${2*f}；每进行3次有效法术攻击，另使其层数+${f}（卡兹戴尔每场战斗至多${cap}层）。${t.desc}`;
 return `〈战斗中〉${conditions[t.id]}，使已激活的【卡兹戴尔】层数+${f}（每场战斗至多${cap}层）。${t.desc}`;
}
