import {KJERAG_GUIDE,guideDescription} from './kjerag-balance.js';
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
export const GUIDE='snowfieldGuideShip', RECRUIT='band_exp_kjerag_recruit';
export const GUIDE_MEMBERS=['chess_char_1_02','chess_char_2_05','chess_char_3_11','chess_char_3_20','chess_char_4_22','chess_char_5_14'];
const recruitDesc='【山路招募】调度中心首次升至3级、4级时，各获得一次免费招募：从最多3名未持有的谢拉格普通干员中选择1名。两次候选分别最高3阶、4阶，延后领取不提升阶数；作战区、手牌和暂存区均算持有，精锐与普通同名。机会跨回合保留，候选不预占库存，领取时再次校验。谢拉格被禁用或可获取天然成员不足3名时，本策略不进入候选。';
const guideDesc=guideDescription();
/** Only caller-owned copies: no baseline files, skills, stats or persistent state are changed. */
export function applyKjerag(data){
  data.bands||={};data.assets||={};
  data.bands[RECRUIT]={bandId:RECRUIT,sortId:31,name:'山路招募',iconId:'icon_kjerag_recruit',modeTypeList:['SINGLE','MULTI'],totalHp:24,effectId:'exp_kjerag_recruit',effectName:'山路招募',desc:recruitDesc,descRaw:recruitDesc,buffs:[],params:{},bondIds:['kjeragShip'],requiresAvailableBond:{bondId:'kjeragShip',count:3},expansionBatch:'arknights-expansion-v1'};
  data.bonds[GUIDE]={bondId:GUIDE,name:'雪境向导',identifier:10013,isCore:false,bondType:'REGULAR',bondOrder:2,powerIdList:[],iconId:'icon_snowfieldGuideShip',activeCount:2,thresholds:[2,4],maxCount:null,thresholdTemplate:'count_threshold_upward',countMode:'BOARD',countsHand:false,countsGoldenOnly:false,activeType:'BATTLE',isActiveInDeck:false,noStack:true,weight:10,maxInactiveBondCount:-1,layerMilestones:[],desc:guideDesc,descRaw:guideDesc,effectId:'exp_snowfield_guide',effectName:'雪境向导',effectDesc:guideDesc,effectDescRaw:guideDesc,effectDescParams:[],bb:{banWeight:10,...KJERAG_GUIDE},bbStr:{key:'exp_snowfield_guide'},buffs:[],baseParams:[],perStackParams:[],expansionBatch:'arknights-expansion-v1'};
  setTestBondDescription(data.bonds[GUIDE],'snow',KJERAG_GUIDE);
  // Explicit normal/elite IDs; hidden forms keep their original membership and availability.
  for(const base of GUIDE_MEMBERS)for(const suffix of ['_a','_b']){const c=data.chess[base+suffix];if(c&&!c.bonds.includes(GUIDE))c.bonds=[...c.bonds,GUIDE];}
  const members=Object.values(data.chess).filter(c=>!c.isGolden&&c.bonds?.includes(GUIDE));
  data.bonds[GUIDE].members=members.map(c=>c.chessId);data.bonds[GUIDE].visibleMembers=members.filter(c=>c.visible).map(c=>c.chessId);
  data.assets.bonds={...data.assets.bonds,[GUIDE]:data.assets.bonds?.kjeragShip};
  data.assets.bands={...data.assets.bands,[RECRUIT]:data.assets.bonds?.kjeragShip};
  return data;
}
