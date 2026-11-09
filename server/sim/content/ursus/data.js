import {markProductContent} from '../../../../shared/product-content.js';
import {OVERLAY} from './records.js';
const ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {applyUrsusTraits} from './trait-data.js';
import {CORE,STUDENT,BATCH,MARKET,AID,BADGE,SURVEY,CORE_DESCRIPTION,STUDENT_DESCRIPTION,EXECUTION_DESCRIPTION,STUDENT_CHARS} from '../../../../shared/ursus-rules.js';
export {CORE,STUDENT,BATCH,MARKET,AID,BADGE,SURVEY};
export const NEW=Object.values(OVERLAY.chess).filter(c=>!c.isGolden).map(c=>c.chessId);
const bond=(id,name,core,thresholds,desc)=>({bondId:id,name,identifier:core?15001:15002,isCore:core,bondType:'REGULAR',bondOrder:150,iconId:'icon_'+id,activeCount:thresholds[0],thresholds,countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:!core,acceptLayers:core,weight:0,bb:{banWeight:0},desc,descRaw:desc,effectDesc:desc,effectDescRaw:desc,buffs:[],members:[],visibleMembers:[],expansionBatch:BATCH,effectLayerCap:core?999:0});
export const ITEMS={};
for(const [key,name,t,atk]of [[BADGE,'旧校徽',3,[.15,.25]],[SURVEY,'乌萨斯测绘仪',4,[.10,.20]]])for(const gold of [false,true]){
 const id=key+(gold?'_b':'_a'),desc=key===BADGE?'攻击力＋15%／25%；与变形同构体同时装备授予乌萨斯身份，不授学生身份。':'攻击力＋10%／20%；原生伤敌普攻前方延伸1格，同名扩距不叠加；不扩治疗或独立技能，不填盲区。';
 ITEMS[id]={id,itemId:id,baseId:key+'_a',goldenId:key+'_b',isGolden:gold,name,tier:t,itemType:'EQUIP',visible:true,hideInShop:gold,shopExcluded:gold,mergeable:true,shopSortId:150,price:gold?5:2,sellPrice:1,upgradeNum:gold?0:2,upgradeChessId:gold?null:key+'_b',iconId:key,desc,descRaw:desc,buffs:[{key:'attr_common_global_buff',bb:{atk:atk[gold?1:0]},bbStr:{key:'attr_common_global_buff'}}],params:{atk:atk[gold?1:0]},canGiveBond:false,...(key===BADGE?{giveBondId:CORE}:{}),expansionBatch:BATCH};
}
const band=(id,name,hp,desc)=>({bandId:id,sortId:150,name,iconId:id,modeTypeList:['LOCAL','SINGLE','MULTI'],totalHp:hp,effectId:id,effectName:name,desc,descRaw:desc,buffs:[],params:{},bondIds:[CORE],requiresAvailableBond:{bondId:CORE,count:3,rejectRandomBan:true},expansionBatch:BATCH});
export function applyUrsus(data){
 markProductContent(data,"ursus-expansion-v1");
 if(data.bonds?.[CORE]){if(data.bonds[CORE].expansionBatch!==BATCH)throw Error('Ursus core collision');return data;}
 for(const key of ['chess','garrisons','tokens']){data[key]||={};for(const[id,rec]of Object.entries(OVERLAY[key])){if(data[key][id])throw Error('Ursus record collision '+id);data[key][id]=structuredClone(rec);}}
 data.bonds||={};data.bonds[CORE]=bond(CORE,'乌萨斯',true,[3,6,8],CORE_DESCRIPTION);data.bonds[STUDENT]=bond(STUDENT,'学生自治团',false,[2,4],STUDENT_DESCRIPTION);
 data.bonds[CORE].testDescription={kind:'ursus'};data.bonds[STUDENT].testDescription={kind:'ursusStudent'};
 data.bonds[CORE].detailSections=[{title:'疆域与共享',text:'二重起共享普通攻击目标，近战成员可普通攻击共享国度内的空中敌人；二重及以上额外享受层数增伤、敌方减攻。五重获得原六重全部效果；六重使五重压制数值及额外增伤翻倍，替代五重数值，裁决冷却与返还额度不变。共享不改变干员原生攻击方式及独立技能范围，明确仅对地的攻击／独立技能仍按原规则处理；开战前按原生伤敌范围一次计重，本场地图锁定，阵亡、再部署、位移和技能范围变化均不重算；进入下一场战斗重新结算，多名玩家的国度分别计算。'},{title:'卫戍与攻坚',text:'六／八人档，本人真实乌萨斯最大生命提高30%／50%；位于本人一重及以上固定国度内时，受到的敌方物理、法术、真实及元素生命伤害降低15%／25%。对本人二重及以上国度内Boss的原生直接伤害额外提高50%／100%，不要求高重交叉。档位取高；装备转职同样适用，不强化队友或召唤物，不放大持续、反射、装备、盟约及裁决伤害。不减少自损、生命流失或元素损伤积累，沿用Boss无敌、减免、限伤及共享血池。'},{title:'八人开战护盾',text:'仅乌萨斯八人档：开战前国度地图确定及生命加成结算后，位于本人四重及以上格内的本人真实干员（含非乌萨斯、合法转职和医疗）获得当时当前生命值50%的普通护盾。按当前生命而非最大生命取值，每场一次，重复部署、移动进入高重格或重算属性均不补发；不发给召唤物、傀儡、其他玩家干员或开战已退场／倒地单位。护盾离开格子后仍保留，按正常伤害吸收规则消耗，阵亡／退场清除；进入下一战场按新地图和当时生命重新判断。'},{title:'层数与专属特质',text:'没有每回合固定层数或固定成员收入。新增干员专属作战事件可额外叠层，每名玩家每正式回合共用12层基础奖励上限；同名普通／精锐共用个人上限并继承至联防。早露、怒潮凛冬、塔露拉使用个人终端强化，不额外叠层。'},{title:'国度裁决',text:EXECUTION_DESCRIPTION}];
 for(const o of OVERLAY.oldMembers)for(const id of o.ids){const c=data.chess[id];if(!c)throw Error('Missing existing Ursus '+id);c.bonds=[...new Set([...c.bonds,...o.bonds])];}
 for(const c of Object.values(data.chess))if(STUDENT_CHARS.includes(c.charId)&&c.bonds?.includes(CORE))c.bonds=[...new Set([...c.bonds,STUDENT])];
 applyUrsusTraits(data);
 data.items={...data.items,...structuredClone(ITEMS)};
 data.bands={...data.bands,[MARKET]:band(MARKET,'共同点名',26,'调度中心首次达II／IV阶，各免费招募一名最高II／IV阶天然乌萨斯，最多三选一，优先未持有；机会保留、真实库存确认时扣除。'),[AID]:band(AID,'互助急救',30,'本人乌萨斯处于本人至少一重覆盖疆域时，受到原生治疗量＋12%；尊重禁疗，不扩治疗范围，不转护盾。')};
 for(const b of Object.values(data.bonds)){const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);}
 data.assets||={};for(const[k,v]of Object.entries(ASSETS))data.assets[k]={...data.assets[k],...structuredClone(v)};
 data.assets.bonds={...data.assets.bonds,[CORE]:null,[STUDENT]:null};
 data.assets.items={...data.assets.items,[BADGE]:null,[SURVEY]:null};
 data.assets.bands={...data.assets.bands,[MARKET]:data.assets.chars?.char_115_headbr?.avatar||null,[AID]:data.assets.chars?.char_4224_turdus?.avatar||null};
 return data;
}
export const buildUrsusData=base=>applyUrsus(structuredClone(base));
