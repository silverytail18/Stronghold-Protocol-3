import {KAZDEL_TRAIT_VERSION,kazdelTraitFor} from '../../../../shared/kazdel-traits.js';
import {replacePersonalGarrisons} from './personal-data.js';
import {OVERLAY} from './records.js';
import {ASSETS} from './assets.js';
export const CORE='kazdelShip',BLOOD='bloodlineShip',BATCH='kazdel-expansion-v1';
export const THERESA='band_kazdel_theresa',HODRER='band_general_hodrer_fieldcare';
export const FLAG='kazdel_memory_standard',BANDAGE='field_medic_bandage';
export const NEW=Object.values(OVERLAY.chess).filter(c=>!c.isGolden).map(c=>c.chessId);
const coreDesc='魂契999层，仅增数值；人数解锁机制。\n（3）所有近战干员阻挡数+1；开战魂火与动态容量；开技失去当前生命10%（最低1），1秒恢复双倍。\n（6）回技+20%；非技能普攻触发前方一格对空血卷，个人CD2秒；法伤800+120×人数+2G+魂火5%。\n（9）改为一格宽对空剑气，1秒飞5格、个人CD1秒；法伤1250+160×人数+3G+魂火6%，另加30%真伤；开技共鸣。\nG=层数+0.9×层数×(1-层数/999)；魂火按支付比例转伤。全图血咒每2秒、空中双倍；保留契伤、拒死、救援与自然衰减。';
const bloodDesc='全队魂火转化与原生受疗随血脉层数提升。\n（2）休整+2层。\n（4）休整+4层；半血以下恢复到半血以上时获得短时护盾，同名共享冷却与次数。\n天然血脉成员的上一普通轮表现提供额外成长，最多999层。';
const bond=(id,name,core,thresholds,desc)=>({bondId:id,name,kazdel:true,identifier:core?12001:12002,isCore:core,bondType:'REGULAR',bondOrder:120,iconId:'icon_'+id,activeCount:thresholds[0],thresholds,countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:!core,weight:0,bb:{banWeight:0},desc,descRaw:desc,effectDesc:desc,effectDescRaw:desc,buffs:[],members:[],visibleMembers:[],expansionBatch:BATCH});
const band=(id,name,hp,desc,exclusive)=>({bandId:id,sortId:120,name,iconId:exclusive?'char_4488_talr':'char_4088_hodrer',modeTypeList:['LOCAL','SINGLE','MULTI'],totalHp:hp,effectId:id,effectName:exclusive?'共生之约':'浴血而行',desc,descRaw:desc,buffs:[],params:{},bondIds:exclusive?[CORE]:[],...(exclusive?{requiresAvailableBond:{bondId:CORE,count:3}}:{}),expansionBatch:BATCH});
export const ITEMS={};
for(const [key,name,tier,desc] of [[FLAG,'卡兹戴尔旧旗',4,'与变形同构体同时装备，使携带者拥有卡兹戴尔身份。卡兹戴尔激活时，自身契伤容量+200／350；有效转职按成员计入魂火容量；装备不另加固定魂火容量、血咒基准或拒死阈值。'],[BANDAGE,'战地绷带',3,'携带者最大生命+200／350；受到原生治疗、自疗、再生的恢复量+10%／15%，与赫德雷策略加算。魂契救援、复活、血量重分配不受此加成。']])for(const golden of [false,true]){
 const id=key+(golden?'_b':'_a');ITEMS[id]={id,itemId:id,baseId:key+'_a',goldenId:key+'_b',isGolden:golden,name,tier,itemType:'EQUIP',visible:true,hideInShop:false,shopExcluded:false,mergeable:true,shopSortId:120,price:2,sellPrice:1,upgradeNum:2,upgradeChessId:golden?null:key+'_b',iconId:key,desc,descRaw:desc,buffs:[],canGiveBond:false,...(key===FLAG?{giveBondId:CORE}:{}),params:key===FLAG?{debtCapacity:golden?350:200}:{hpFlat:golden?350:200,recoveryBonus:golden?.15:.1},expansionBatch:BATCH};
}
export function applyKazdel(data){
 const o=structuredClone(OVERLAY);o.bonds={[CORE]:bond(CORE,'卡兹戴尔',true,[3,6,9],coreDesc),[BLOOD]:bond(BLOOD,'血脉',false,[2,4],bloodDesc)};
 o.bonds[CORE].kazdelTraits=KAZDEL_TRAIT_VERSION;
 o.items=structuredClone(ITEMS);o.bands={
 [THERESA]:band(THERESA,'特蕾西娅',26,'第3、5回合各开放一次招募，无需盟约人数：从随机最多3名天然卡兹戴尔普通干员中，免费永久获得1名。可以先升级商店，打开招募时锁定最高等阶；本回合未打开则按休整结束时锁定。首轮不赠送干员；无库存或手牌满时保留机会，延后领取不提高等阶。',true),
 [HODRER]:band(HODRER,'赫德雷',28,'全队真实干员受到原生治疗、自疗与再生的恢复量+15%。保留原有受疗限制，不影响魂契救援、复活、血量重分配和最大生命变化。',false)};
 for(const table of ['chess','bonds','items','bands','garrisons','tokens']){data[table]||={};for(const [id,r]of Object.entries(o[table])){if(data[table][id]&&data[table][id].expansionBatch!==BATCH)throw Error('Kazdel ID collision '+id);data[table][id]=r;}}
 for(const base of o.oldMembers)for(const id of [base,base.replace(/_a$/,'_b')]){const c=data.chess[id];if(!c)throw Error('Missing existing Kazdel member '+id);if(!c.bonds.includes(CORE))c.bonds=[...c.bonds,CORE];if(base==='chess_char_4_26_a'&&!c.bonds.includes(BLOOD))c.bonds=[...c.bonds,BLOOD];}
 for(const b of Object.values(data.bonds)){const m=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=m.map(c=>c.chessId);b.visibleMembers=m.filter(c=>c.visible).map(c=>c.chessId);}
 replacePersonalGarrisons(data);
 data.assets||={};
 for(const [key,r]of Object.entries(ASSETS))data.assets[key]={...(data.assets[key]||{}),...structuredClone(r)};
 data.assets.bonds={...data.assets.bonds,[CORE]:data.assets.bonds?.emptyShip,[BLOOD]:data.assets.bonds?.miraShip};
 data.assets.bands={...data.assets.bands,[THERESA]:data.assets.chars?.char_4134_cetsyr?.avatar,[HODRER]:data.assets.chars?.char_4088_hodrer?.avatar};
 data.assets.items={...data.assets.items,[FLAG]:data.assets.bonds?.emptyShip,[BANDAGE]:data.assets.bonds?.miraShip};
 return data;
}
export const buildKazdelData=base=>applyKazdel(structuredClone(base));
