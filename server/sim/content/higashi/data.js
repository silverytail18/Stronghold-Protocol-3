import {markProductContent} from '../../../../shared/product-content.js';
import {OVERLAY} from './records.js';
const ASSETS={chars:{},enemies:{},tokens:{},skills:{},skillsById:{},modules:{},items:{},bonds:{},bands:{}};
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
import {CORE,NINJA,BATCH,DEFEND,MARKET,SEAL,TALISMAN,CORE_DESCRIPTION,NINJA_DESCRIPTION} from '../../../../shared/higashi-rules.js';
export {CORE,NINJA,BATCH,DEFEND,MARKET,SEAL,TALISMAN};
export const NEW=Object.values(OVERLAY.chess).filter(c=>!c.isGolden).map(c=>c.chessId);
export const OLD=['chess_char_1_18_a','chess_char_2_11_a','chess_char_4_17_a'];
const growthText={黑角:'阻挡并承受被挡者攻击累计6秒，＋2／3。',缠丸:'S1有效自治疗累计基础生命20%，＋2／3。',宴:'首次落地技能原生伤敌且存活6秒，＋2／3，一场一次。',风丸:'本体与纸偶各原生伤敌，＋2／3，一場一次。',白雪:'S2伤害3名不同敌人，＋2／3。',绮良:'零挡下持续原生伤敌累计8秒，＋2／3。',赤冬:'S2原生抵挡盾实际抵挡后本人有效攻击，＋3／4。',吉星:'S2循环完成且至少一种控制生效，＋2／3。',星熊:'S2原生反伤5次，＋2／3。',遥:'浮泡有效庇护3次或有效治疗基础生命20%，＋2／3。',斩业星熊:'原生反伤／飞盾伤敌共5次，＋2／3。'};
const bond=(id,name,core,thresholds,desc)=>({bondId:id,name,identifier:core?14001:14002,isCore:core,bondType:'REGULAR',bondOrder:140,iconId:'icon_'+id,activeCount:thresholds[0],thresholds,countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:!core,acceptLayers:core,weight:0,bb:{banWeight:0},desc,descRaw:desc,effectDesc:desc,effectDescRaw:desc,buffs:[],members:[],visibleMembers:[],expansionBatch:BATCH,effectLayerCap:core?999:0});
const descriptions={seal:'攻击力＋20%／35%。与变形同构体同时佩戴获得东国身份。东国激活且成功架势后，4秒内下一次有效原生攻击／治疗自身回2／3SP；生成CD8秒，不储存、尊重SP锁。',talisman:'攻击力＋15%／25%，不要求任何盟约。每3次有效原生攻击／治疗获得基础生命8%／12%的屏障，持续4秒，生成CD8秒；CD中不计数，多目标／多段只计一次。'};
export const ITEMS={};
for(const [key,name,t,atk] of [[SEAL,'町奉行印笼',3,[.2,.35]],[TALISMAN,'折返护符',4,[.15,.25]]])for(const golden of [false,true]){
const id=key+(golden?'_b':'_a');ITEMS[id]={id,itemId:id,baseId:key+'_a',goldenId:key+'_b',isGolden:golden,name,tier:t,itemType:'EQUIP',visible:true,hideInShop:false,shopExcluded:false,mergeable:true,shopSortId:140,price:golden?5:2,sellPrice:1,upgradeNum:golden?0:2,upgradeChessId:golden?null:key+'_b',iconId:key,desc:descriptions[key===SEAL?'seal':'talisman'],descRaw:descriptions[key===SEAL?'seal':'talisman'],buffs:[{key:'attr_common_global_buff',bb:{atk:atk[golden?1:0]},bbStr:{key:'attr_common_global_buff'}}],params:{atk:atk[golden?1:0],...(key===SEAL?{sp:golden?3:2}:{shieldRatio:golden?.12:.08})},canGiveBond:false,...(key===SEAL?{giveBondId:CORE}:{}),expansionBatch:BATCH};}
const band=(id,name,hp,desc)=>({bandId:id,sortId:140,name,iconId:id===DEFEND?'char_136_hsguma':'char_4199_makiri',modeTypeList:['LOCAL','SINGLE','MULTI'],totalHp:hp,effectId:id,effectName:name,desc,descRaw:desc,buffs:[],params:{},bondIds:[CORE],requiresAvailableBond:{bondId:CORE,count:3,rejectRandomBan:true},expansionBatch:BATCH});
export function applyHigashi(data){
 markProductContent(data,"higashi-expansion-v1");
 if(data.bonds?.[CORE]){if(data.bonds[CORE].expansionBatch!==BATCH)throw Error('Higashi core collision');return data;}
 for(const key of ['chess','garrisons','tokens']){data[key]||={};for(const [id,rec]of Object.entries(OVERLAY[key])){if(data[key][id]&&data[key][id].expansionBatch!==BATCH)throw Error('Higashi collision '+id);data[key][id]=structuredClone(rec);}}
 data.bonds||={};data.bonds[CORE]=bond(CORE,'东国',true,[3,6,9],CORE_DESCRIPTION);data.bonds[NINJA]=bond(NINJA,'忍术策应',false,[2,4],NINJA_DESCRIPTION);
 setTestBondDescription(data.bonds[CORE],'higashi');setTestBondDescription(data.bonds[NINJA],'higashiNinja');
 data.bonds[CORE].detailSections=[
 {title:'守线与身份',text:'仅天然或合法转职的真实东国干员享受生命、阻挡防御、架势和自主斩击。三／六／九人生命+20%／25%／35%，合格近战阻挡+1／1／2；实际阻挡至少一名存活敌人时，固定防御+25／35／55，物法直接减伤8%／10%／15%。空挡立即移除，不随阻挡数量倍增；零挡、浮空、禁挡与赤冬S1保持。架势冷却6秒、持续3秒，物法直接减伤23%／27%／33%；与阻挡减伤取较高值，守土额外5个百分点及1秒。修习不增加生命；盟约不提供自然回复。'},
 {title:'自主拔刀与剑风',text:'开战刀势100，最早1.2秒拔刀，最短间隔8／7／6秒。有效接敌每秒+4／5／6，有效原生攻击或治疗每同名每秒+4、团队8；架势+6、影袭+4，全部来源每秒上限14。底伤B=350+4L+0.010max(0,L−200)²，伤害(B+当前攻击)×85%／100%／110%，无视20%／20%／30%防御。当前攻击范围与身周一格独立索敌、可对空，主目标全额、周围最多两名半额；九人一闪后0.8秒自动80%法术归鞘，无目标保留3秒。剑风本人共享周期2.2／1.8／1.5秒，范围并集2.5格，目标2／3／4，预留对空1／2／2，余位优先被挡或接近终点者；攻击系数100%／120%／140%＋20%B法术。无需主动攻击，不递归供给、装备或成长。'},
 {title:'见切与连太刀',text:'身份成员修习超过200层后逐步获得攻速，700层时三／六／九人分别+20／55／70，之后封顶；调和不享。六人解锁见切，本方首个有效原生攻击命中的存活敌人为目标，后续实际命中该目标才叠加；精英／首领优先接替较低级目标，其他敌人不打断当前围攻。每同名每0.5秒最多一次、同次攻击多段不重复；每次+1切，异名交替额外+1，本方每秒共最多4切，最多12切。每切使本方身份干员对该目标的后续原生直接攻击伤害额外+5%／6%（六／九人，最高60%／72%），不作用于一闪、归鞘、剑风、奥义、忍术、装备、纸偶、反伤、持续或溅射。4秒未有效进攻后每秒掉1切，目标死亡清零；完全归零后可切换同级目标。满12切且近4秒至少两名异名成员参与，参与围攻的存活成员进入4秒连太刀：攻速+40／50，对该目标原生物理攻击额外无视25%／30%防御，本方共享CD12秒。满切不消耗，可继续围攻等待下一次连太刀。只修改原生攻击，不生成独立伤害，不追加供给、奥义或修习。联防继承连太刀剩余与冷却、同名0.5秒间隔，见切不转移到新战场的同编号敌人。'},
 {title:'白夜·一文字',text:'六人解锁独立0—100奥义，开战0。一轮拔刀至少两名异名成员实际伤敌+20（归鞘不重复），成功架势+3、团队该来源每秒最多9，有效接敌每秒+2；空场不充能。蓄满有5名敌人、精英／首领或距终点3格内敌人立即施放，零散合法敌人最多等待3秒，无合法目标保持满值，至少一名可行动身份成员才可施放。六／九人间隔18／16秒，冷却时可充能。施放快照层数和本方攻击最高六名异名存活身份成员（同名取最高），0.35秒后命中当前场上合法地空敌人，真实伤害2.6B+0.5A6／3B+0.6A6，额外附带各敌人命中前当前生命5%的真实伤害，对首领也生效；共享首领读取命中时即时血池生命，与基础真伤合并为同一伤害包结算。命中眩晕1秒并减速60%持续3秒，均走正常状态接口、不强制穿透免疫或抵抗，保留首领原限伤；本方身份成员获得8%／12%当前最大生命屏障，4秒。无治疗、无额外生命，无递归充能；不暂停战斗。'},
 {title:'修习与联防',text:'休整6／12／14层；普通战天然成员首次有效原生伤敌、治疗或实际承压，普通／精锐+2／3（同名一次）。个人每场6／8封顶、团队20／32／36；每2次架势+1，档位上限4／6／6；有效异名拔刀每轮+2，上限6／8／10；表现合计10／14／16。新来源理论单回合上限36／58／66，星熊原成长另计，最终999层。R20约700仅为设计目标，尚未实测。联防继承刀势、奥义、冷却、待命中奥义与屏障，不重复开局或成长；下一普通战重置。'}];
 for(const base of OLD)for(const id of [base,base.replace(/_a$/,'_b')]){const c=data.chess[id];if(!c)throw Error('Missing baseline '+id);c.bonds=[...new Set([...c.bonds,CORE,...(base==='chess_char_4_17_a'?[]:[NINJA])])];}
 for(const c of Object.values(data.chess))if(c.expansionBatch===BATCH){if(c.higashiElitePreparation)for(const key of ['desc','descRaw'])c.trait[key]+='；精锐整备（同人规则）：基础生命、攻击、防御各增加20%';for(const sk of c.skills||[])if(sk.skillId==='skchr_hsgma2_3')for(const key of ['desc','descRaw'])sk[key]+='（自动战斗适配：32秒结束后进入11秒终段并强制退出）';}
 for(const c of Object.values(data.chess))if(c.bonds?.includes(CORE)){
 const gid='higashi_growth_'+c.chessId;data.garrisons[gid]={garrisonId:gid,name:'东国修习',eventType:'IN_BATTLE',effectKey:'higashi_growth',desc:(growthText[c.name]||'')+' 首次有效原生伤敌／治疗／承压额外＋2／3。普通／精锐每场6／8层，同名共享，团队20／32／36层；只记普通战原生事件。',bb:{},owners:[c.chessId],expansionBatch:BATCH};
 c.garrisonIds=[...(c.garrisonIds||[]).filter(g=>!g.startsWith('higashi_growth_')),gid];}
 data.items={...data.items,...structuredClone(ITEMS)};
 data.bands={...data.bands,[DEFEND]:band(DEFEND,'守土之约',30,'架势减伤额外提高5个百分点、持续时间延长1秒；保留本档完整开战阵势。'),[MARKET]:band(MARKET,'町巷联络',26,'商店首次达2／4级，各获得一次最高2／4阶未持有天然东国免费三选一；第一次优先补缺少的阻挡或对空岗位；机会保留，领取重查共享库存。')};
 for(const b of Object.values(data.bonds)){const cs=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(b.bondId));b.members=cs.map(c=>c.chessId);b.visibleMembers=cs.filter(c=>c.visible).map(c=>c.chessId);}
 data.assets||={};for(const [key,val]of Object.entries(ASSETS))data.assets[key]={...(data.assets[key]||{}),...structuredClone(val)};
 data.assets.bonds={...data.assets.bonds,[CORE]:null,[NINJA]:null};data.assets.items={...data.assets.items,[SEAL]:null,[TALISMAN]:null};
 data.assets.bands={...data.assets.bands,[DEFEND]:data.assets.chars?.char_136_hsguma?.avatar,[MARKET]:data.assets.bands?.band_makiri||null};
 return data;
}
export const buildHigashiData=base=>applyHigashi(structuredClone(base));
