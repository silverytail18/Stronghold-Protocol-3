import {markProductContent} from '../../../../shared/product-content.js';
// Match-scoped Rhine Lab overlay. Generated native records never replace formal data.
import {OVERLAY} from './records.js';
const ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {RHINE as CORE,RHINE_BATCH as BATCH,RHINE_SILENCE as SILENCE,RHINE_KRISTEN as KRISTEN,RHINE_CONTROLLER as CONTROLLER,RHINE_SAMPLER as SAMPLER,TECHNOLOGIES} from '../../../../shared/rhine.js';
import {RESEARCH,RESEARCH_ATTACK_RATIO,RESEARCH_HEAL_RATIO} from '../../../../shared/rhine-balance.js';
export {CORE,BATCH,SILENCE,KRISTEN,CONTROLLER,SAMPLER};
export const NEW=Object.values(OVERLAY.chess).filter(c=>!c.isGolden).map(c=>c.chessId);
const coreDesc='【莱茵生命】干员攻击力和生命值提升（受层数影响）；首次部署获得技力。\n<在场3名不同【莱茵生命】干员>开放科研，每50层获得1科技点，正常最多19点。\n<在场6名不同【莱茵生命】干员>开放进阶科技。\n<在场9名不同【莱茵生命】干员>开放数据广播与战斗访学。\n<在场10名不同【莱茵生命】干员>本局首次休整达成时额外获得1科技点。\n（科技仅本人莱茵身份受益；3/6人科技按原人数生效，更高科技解锁后6人生效；每场开战检查，战斗中资格固定）';
const bond={bondId:CORE,name:'莱茵生命',identifier:13001,isCore:true,bondType:'REGULAR',bondOrder:130,iconId:'icon_rhineShip',activeCount:3,thresholds:[3,6,9,10],countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:false,weight:0,bb:{banWeight:0},desc:coreDesc,descRaw:coreDesc,effectDesc:coreDesc,effectDescRaw:coreDesc,buffs:[],members:[],visibleMembers:[],expansionBatch:BATCH,rhineTechnologies:TECHNOLOGIES,testDescription:{kind:'rhine'},effectLayerCap:999,detailSections:[{title:'科研与区域',text:'研究单级、科技点总费用29。区域在休整二维地图互斥选择，战斗才生效；不足人数暂停但数据保留。基础攻击和生命为10%＋每层0.1个百分点。T01/T02按人数档位增强，不随层数增长。'}]};
const band=(id,name,hp,effect,desc)=>({bandId:id,sortId:130,name,iconId:id===SILENCE?'char_108_silent':'char_1092_krstn',modeTypeList:['LOCAL','SINGLE','MULTI'],totalHp:hp,effectId:id,effectName:effect,desc,descRaw:desc,buffs:[],params:{},bondIds:[CORE],requiresAvailableBond:{bondId:CORE,count:3},expansionBatch:BATCH});
export const ITEMS={};
for(const [key,name,tier]of [[CONTROLLER,'莱茵场域控制器',4],[SAMPLER,'实验采样器',3]])for(const golden of [false,true]){
 const id=key+(golden?'_b':'_a'),controller=key===CONTROLLER;
 const desc=controller?'莱茵身份干员每回合第一次受到敌方攻击前获得最大生命'+(golden?'25%':'10%')+'的屏障。与变形同构体同时装备时追加莱茵生命盟约。':'每回合使装备者所有已激活的自身盟约各增加1层；其中莱茵生命替换为'+(golden?'3':'2')+'层。';
 ITEMS[id]={id,itemId:id,baseId:key+'_a',goldenId:key+'_b',isGolden:golden,name,tier,itemType:'EQUIP',visible:true,hideInShop:false,shopExcluded:false,mergeable:true,shopSortId:130,price:golden?5:2,sellPrice:1,upgradeNum:2,upgradeChessId:golden?null:key+'_b',iconId:key,desc,descRaw:desc,buffs:[],canGiveBond:false,...(controller?{giveBondId:CORE}:{}),params:controller?{shieldRatio:golden?.25:.1}:{rhineLayers:golden?3:2},expansionBatch:BATCH};
}
const researchDescriptions={
'梅尔':'机械水獭累计3次有效伤敌或阻挡承压，＋1/2层，上限6/12。',
'星源':'原生攻击命中3名不同敌人，＋2/3层，上限6/9。',
'赫默':'对支援格真实成员累计300有效治疗，＋1/2层，上限4/8。',
'麦哲伦':'本体或无人机伤害/束缚3名不同敌人，＋2/4层，上限6/12。',
'星极':'每6次有效原生攻击，＋2/3层，上限6/9。',
'白面鸮':'支援格成员累计3次有效治疗行动，＋1/2层，上限4/8。',
'淬羽赫默':'有效原生治疗支援格生命低于40%的成员，＋2/3层，每目标两次、间隔6秒，上限6/9。',
'塞雷娅':'支援格真实阻挡并承受被阻挡敌人攻击8秒，＋2/3层，上限6/9。',
'伊芙利特':'一次原生攻击命中至少2敌人，＋2/3层，间隔6秒，上限6/9。',
'缪尔赛思':'本人和流形在不同有效区域各原生伤敌一次，＋4/6层，每回合一次。',
'溯光星源':'原生开技后首次有效攻击，＋3/5层，上限6/10。'
};
export function applyRhine(data){
 markProductContent(data,"rhine-lab-v1");
 const o=structuredClone(OVERLAY);data.assets||={};
 for(const key of ['chess','tokens','garrisons']){data[key]||={};for(const[id,r]of Object.entries(o[key])){if(data[key][id]&&data[key][id].expansionBatch!==BATCH)throw Error('Rhine ID collision '+id);data[key][id]=r;}}
 data.bonds||={};data.bonds[CORE]=structuredClone(bond);
 const researchDesc='（2）本人专项研究成员造成原生直接伤害时，以目标为中心对1格内敌人造成该次实际生命伤害'+(RESEARCH_ATTACK_RATIO*100)+'%的法术爆炸，减速50%持续1秒；有效治疗干员时，以受治疗者为中心对1格内敌人造成实际治疗量'+(RESEARCH_HEAL_RATIO*100)+'%的法术爆炸，晕眩0.5秒。\n两类冷却各10秒，本人所有成员共享，但攻击与治疗互不占用。\n（4）攻击冷却8秒，治疗冷却5秒。\n无独立叠层，数值随原生伤害／治疗成长；爆炸不递归，科技恢复不触发。';
 data.bonds[RESEARCH]={bondId:RESEARCH,name:'专项研究',identifier:13002,isCore:false,bondType:'REGULAR',bondOrder:131,iconId:'icon_specialResearchShip',activeCount:2,thresholds:[2,4],countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:true,weight:0,bb:{banWeight:0},desc:researchDesc,descRaw:researchDesc,effectDesc:researchDesc,effectDescRaw:researchDesc,buffs:[],members:[],visibleMembers:[],expansionBatch:BATCH};
 data.items={...data.items,...structuredClone(ITEMS)};
 data.bands={...data.bands,[SILENCE]:band(SILENCE,'赫默',29,'联合招募','第2、第3回合各随机获得1名当前可招募莱茵核心普通干员，不高于当时商店阶数；本局首次达成8莱茵人数额外获得1科技点。'),[KRISTEN]:band(KRISTEN,'克丽斯腾',26,'阶段成果','本局首次达成3、6、9莱茵人数时，分别额外获得1科技点。')};
 for(const base of o.oldMembers)for(const id of [base,base.replace(/_a$/,'_b')]){
  const c=data.chess[id];if(!c)throw Error('Missing Rhine member '+id);if(!c.bonds.includes(CORE))c.bonds=[...c.bonds,CORE];
 }
 for(const base of ['chess_rhine_halo_a','chess_char_6_16_a','chess_char_2_02_a','chess_rhine_slent2_a'])for(const id of [base,base.replace(/_a$/,'_b')])if(!data.chess[id].bonds.includes(RESEARCH))data.chess[id].bonds.push(RESEARCH);
 for(const c of Object.values(data.chess))if(c.visible&&c.bonds?.includes(CORE)){
  c.rhineResearch=researchDescriptions[c.name]||null;
  const gid='rhine_research_'+c.chessId;
  data.garrisons[gid]={garrisonId:gid,name:'科研记录',eventType:'IN_BATTLE',effectKey:'rhine_research',desc:(c.rhineResearch||'')+' 仅莱茵激活、原生事件计入，共享每回合20层额度。',bb:{},bbStr:{conditionkey:'character_target_inboard'},owners:[c.chessId],expansionBatch:BATCH};
  c.garrisonIds=[...(c.garrisonIds||[]).filter(id=>!id.startsWith('rhine_growth_')&&!id.startsWith('rhine_research_')),gid];
 }
 for(const b of Object.values(data.bonds)){const cs=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=cs.map(c=>c.chessId);b.visibleMembers=cs.filter(c=>c.visible).map(c=>c.chessId);}
 for(const [key,r]of Object.entries(ASSETS))data.assets[key]={...(data.assets[key]||{}),...structuredClone(r)};
 data.assets.bonds={...data.assets.bonds,[CORE]:null,[RESEARCH]:null};
 data.assets.items={...data.assets.items,[CONTROLLER]:null,[SAMPLER]:null};
 data.assets.bands={...data.assets.bands,[SILENCE]:data.assets.chars?.char_108_silent?.avatar,[KRISTEN]:null};
 return data;
}
export const buildRhineData=base=>applyRhine(structuredClone(base));
