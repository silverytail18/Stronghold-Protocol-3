import {markProductContent} from '../../../../shared/product-content.js';
const ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {applyTraits} from '../../../../shared/iberia-traits.js';
import {OVERLAY} from './records.js';
import {CORE,BATCH,VOYAGE,FIRE,LAMP,EYE,CORE_DESCRIPTION,CORE_DETAILS} from '../../../../shared/iberia-rules.js';
export {CORE,BATCH,VOYAGE,FIRE,LAMP,EYE};
export const NEW=Object.values(OVERLAY.chess).filter(c=>!c.isGolden).map(c=>c.chessId);
const plainDescription=CORE_DESCRIPTION.replace(/<[@$][A-Za-z0-9_.-]+>/g,'').replace(/<\/>/g,'');
export const ITEMS={};
for(const gold of [false,true])for(const[key,name,tier,price]of [[LAMP,'审判庭提灯',2,2],[EYE,'伊比利亚之眼',6,4]]){
 const id=key+(gold?'_b':'_a'),atk=key===EYE?(gold?.35:.20):0;
 const desc=key===LAMP?'首次部署初始技力＋10／15；可与变形同构体合成伊比利亚转职，单独装备不授予身份。':'攻击力＋20%／35%；伊比利亚供灯周期统一为2秒，本装备不再额外缩短，同名不叠加。';
 ITEMS[id]={id,itemId:id,baseId:key+'_a',goldenId:key+'_b',isGolden:gold,name,tier,itemType:'EQUIP',visible:true,hideInShop:gold,shopExcluded:gold,mergeable:true,shopSortId:160,price,sellPrice:1,upgradeNum:gold?0:2,upgradeChessId:gold?null:key+'_b',iconId:key,desc,descRaw:desc,buffs:atk?[{key:'attr_common_global_buff',bb:{atk},bbStr:{key:'attr_common_global_buff'}}]:[],params:{atk},canGiveBond:false,...(key===LAMP?{giveBondId:CORE}:{}),expansionBatch:BATCH};
}
const band=(id,name,hp,desc)=>({bandId:id,sortId:160,name,iconId:id,modeTypeList:['LOCAL','SINGLE','MULTI'],totalHp:hp,effectId:id,effectName:name,desc,descRaw:desc,buffs:[],params:{},bondIds:[CORE],requiresAvailableBond:{bondId:CORE,count:3,rejectRandomBan:true},expansionBatch:BATCH});
export function applyIberia(data){
 markProductContent(data,"iberia-expansion-v1");
 if(data.bonds?.[CORE])return data;
 for(const key of ['chess','garrisons','tokens']){data[key]||={};for(const[id,rec]of Object.entries(OVERLAY[key])){if(data[key][id])throw Error('Iberia collision '+id);data[key][id]=structuredClone(rec);}}
 data.bonds||={};data.bonds[CORE]={bondId:CORE,name:'伊比利亚',identifier:16001,isCore:true,bondType:'REGULAR',bondOrder:160,iconId:'icon_'+CORE,activeCount:3,thresholds:[3,6,9],countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:false,acceptLayers:true,weight:0,bb:{banWeight:0},desc:plainDescription,descRaw:CORE_DESCRIPTION,effectDesc:plainDescription,effectDescRaw:CORE_DESCRIPTION,buffs:[],members:[],visibleMembers:[],expansionBatch:BATCH,effectLayerCap:999,testDescription:{kind:'iberia'},detailSections:[{title:'触发与结算',text:CORE_DETAILS}]};
 for(const o of OVERLAY.oldMembers)for(const id of o.ids){const c=data.chess[id];if(!c)throw Error('Missing existing Iberia '+id);c.bonds=[...new Set([...c.bonds,...o.bonds])];}
 applyTraits(data);
 data.items={...data.items,...structuredClone(ITEMS)};
 data.bands={...data.bands,[VOYAGE]:band(VOYAGE,'返乡航线',28,'【集结 · 重返海岸】\n每回合首次主动刷新时，若商店尚无天然【伊比利亚】干员，优先补入1名合法成员。\n遵守商店等级、共享库存与禁用规则；商店已有成员时不额外补入，不额外增加刷新次数或商店格。\n以稳定招募完成队伍集结；不直接增加作战伤害。'),[FIRE]:band(FIRE,'审判之火',24,'【进攻 · 以守望换锋芒】\n在场6／9名不同【伊比利亚】干员时，【长明】期间成员原生物理、法术伤害无视目标20%／30%的防御与法术抗性。\n【攻守取舍】九人档不再获得【长明】提供的15%物理、法术减伤；其他来源的减伤保持。\n不提高真实伤害，不延长【长明】，不改变审判引爆与判决阈值。')};
 for(const b of Object.values(data.bonds)){const cs=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=cs.map(c=>c.chessId);b.visibleMembers=cs.filter(c=>c.visible).map(c=>c.chessId);}
 data.assets||={};for(const[k,v]of Object.entries(ASSETS))data.assets[k]={...data.assets[k],...structuredClone(v)};data.assets.bonds={...data.assets.bonds,[CORE]:null};data.assets.items={...data.assets.items,[LAMP]:null,[EYE]:null};data.assets.bands={...data.assets.bands,[VOYAGE]:null,[FIRE]:null};
 return data;
}
export const buildIberiaData=base=>applyIberia(structuredClone(base));
