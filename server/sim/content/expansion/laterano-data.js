import {markProductContent} from '../../../../shared/product-content.js';
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
export const LATERANO_SUPPORT='lateranoSupportShip';
export const LATERANO_SUPPORT_NAMES=Object.freeze(['隐现','送葬人','能天使','空弦','信仰搅拌机','莫斯提马']);
export const LATERANO_SUPPORT_BALANCE=Object.freeze({nonAmmoAtk:.10,startup:.40});
export function applyLateranoSupport(data){
 markProductContent(data,"arknights-expansion-v1");
 const desc='2名不同铳械协同且至少3拉特兰激活：本人拉特兰核心受益真实干员，当前所选原生技能不是弹药技能时攻击+10%。4名且至少6拉特兰激活：保留两人效果，全体本人拉特兰核心受益真实干员获得40%启动攻击补偿，与真实弹药消耗4%/次共享200%上限；消耗40次达到上限，不另加成240%。合法调和与装备转职可受益，无需受益者拥有本附加。普通战转联防继承已消耗状态，不重复发放，再部署不重领，下回合重置。不叠层，不直接给召唤物或队友。';
 const b=data.bonds[LATERANO_SUPPORT]={bondId:LATERANO_SUPPORT,name:'铳械协同',identifier:10015,isCore:false,bondType:'REGULAR',bondOrder:4,powerIdList:[],iconId:'icon_lateranoSupportShip',activeCount:2,thresholds:[2,4],maxCount:null,thresholdTemplate:'count_threshold_upward',countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:true,acceptLayers:false,weight:10,maxInactiveBondCount:-1,layerMilestones:[],desc,descRaw:desc,effectId:'exp_laterano_support',effectName:'铳械协同',effectDesc:desc,effectDescRaw:desc,effectDescParams:[],bb:{banWeight:10,...LATERANO_SUPPORT_BALANCE},bbStr:{key:'exp_laterano_support'},buffs:[],baseParams:[],perStackParams:[],expansionBatch:'arknights-expansion-v1'};
 setTestBondDescription(b,'laterano',LATERANO_SUPPORT_BALANCE);
 for(const c of Object.values(data.chess))if(LATERANO_SUPPORT_NAMES.includes(c.name)&&!c.bonds.includes(LATERANO_SUPPORT))c.bonds=[...c.bonds,LATERANO_SUPPORT];
 const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(LATERANO_SUPPORT));b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);
 data.assets||={};data.assets.bonds={...data.assets.bonds,[LATERANO_SUPPORT]:data.assets.bonds?.lateranoShip};return data;
}
