import {markProductContent} from '../../../../shared/product-content.js';
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
export const KNIGHT='knightPreparationShip';
export const KNIGHT_MEMBERS=Object.freeze(['chess_char_1_19','chess_char_2_12','chess_char_2_18','chess_char_3_12','chess_char_3_17','chess_char_4_19','chess_char_4_20']);
export const KNIGHT_BALANCE=Object.freeze({perInitial:.05,slots:Object.freeze([3,8])});
export function applyKnight(data){
 markProductContent(data,"arknights-expansion-v1");
 const desc='2名不同骑士整备且至少3卡西米尔：本回合前3名本人真实干员初始部署，各额外贡献5个百分点攻击，最多15%。4名且至少6卡西米尔：名额提高至8，最多40%，替代15%额度。受益对象为本人卡西米尔核心受益成员，与原每次部署20%共享50%＋每层1个百分点上限。等待Cost须实际部署；再部署、召唤物、傀儡切换不追加补偿。普通战转联防继承本回合额度，不重复领取。不叠层。';
 const b=data.bonds[KNIGHT]={bondId:KNIGHT,name:'骑士整备',identifier:10014,isCore:false,bondType:'REGULAR',bondOrder:3,powerIdList:[],iconId:'icon_knightPreparationShip',activeCount:2,thresholds:[2,4],maxCount:null,thresholdTemplate:'count_threshold_upward',countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:true,weight:10,maxInactiveBondCount:-1,layerMilestones:[],desc,descRaw:desc,effectId:'exp_knight_preparation',effectName:'骑士整备',effectDesc:desc,effectDescRaw:desc,effectDescParams:[],bb:{banWeight:10,...KNIGHT_BALANCE},bbStr:{key:'exp_knight_preparation'},buffs:[],baseParams:[],perStackParams:[],expansionBatch:'arknights-expansion-v1'};
 setTestBondDescription(b,'knight',KNIGHT_BALANCE);
 b.acceptLayers=false;
 for(const base of KNIGHT_MEMBERS)for(const suffix of ['_a','_b']){const c=data.chess[base+suffix];if(c&&!c.bonds.includes(KNIGHT))c.bonds=[...c.bonds,KNIGHT];}
 const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(KNIGHT));
 b.members=members.map(c=>c.chessId);b.visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);
 data.assets||={};data.assets.bonds={...data.assets.bonds,[KNIGHT]:data.assets.bonds?.kazimierzShip};
 return data;
}
