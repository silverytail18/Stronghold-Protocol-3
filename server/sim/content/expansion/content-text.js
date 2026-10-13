import {PENGUIN_BALANCE as P} from './penguin-balance.js';
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
const number=v=>String(Math.round(v*10000)/10000);
export function resolveContentText(text,values={}){
  return String(text).replace(/\{([^{}:]+)(?::([^{}]+))?\}/g,(raw,key,fmt)=>{
    const negative=key.startsWith('-'),v=values[negative?key.slice(1):key];
    if(v==null)return raw;
    if(typeof v==='string')return v;
    const n=Number(v)*(negative?-1:1);if(!Number.isFinite(n))return raw;
    return number(fmt?.includes('%')?n*100:n)+(fmt?.includes('%')?'%':'');
  }).replace(/\\n/g,'\n');
}
/** Resolve trusted named blackboard fields, including nested traits/modules, without evaluating expressions. */
export function readableContent(overlay){
  const o=structuredClone(overlay);
  for(const id of ['suiShip','penguinShip'])if(o.bonds?.[id]){
    o.bonds[id].weight=10;o.bonds[id].bb={...o.bonds[id].bb,banWeight:10};
  }
  function walk(v,parent={}){
    if(!v||typeof v!=='object')return;
    const values={...parent,...(v.bb||{}),...(v.bbStr||{})};
    for(const [key,x]of Object.entries(v)){
      if(typeof x==='string'&&/^(desc|descRaw|moduleDesc|moduleDescRaw)$/.test(key)){
        v[key]=resolveContentText(x,values);
        if(/\{[^{}]+\}/.test(v[key]))throw Error('Unresolved content description: '+v[key]);
      }else if(x&&typeof x==='object'&&!['bb','bbStr'].includes(key))walk(x,values);
    }
  }
  walk(o);
  const penguin=o.bonds?.penguinShip;
  if(penguin){
    penguin.bb={banWeight:10};
    penguin.layerMilestones=[...P.milestones];
    penguin.desc='2名不同企鹅物流干员：休整期结束时增加3层；本队携带持续战斗装备的干员固定攻击力+40、防御力+60，攻击力与防御力各+5%。\n4名：每回合成长改为5层；固定攻击力+80、防御力+100，攻击力与防御力各+10%。四人档替换两人档，每名干员只生效一次，不随层数放大，不覆盖队友、召唤物或装置。\n累计12、30、50层各获得一次免费随机装备，每局最多三件。开始休整时按当前层数和人数立即发放，每次最多一件；2—3人普通、4人进阶。候选为本局商店可获得且不高于当前商店等级的1—4阶持续战斗装备，不含消耗品。';
    penguin.descRaw=penguin.desc;
    penguin.effectDescRaw=penguin.desc;
    penguin.effectDesc=penguin.desc;
    penguin.effectDescParams=[];
    delete penguin.effectLayerCap;
    for(const [id,g]of Object.entries(o.garrisons||{})){
      if(id.startsWith('c1_croissant_growth'))g.desc=`休整期结束时，可颂在作战区、企鹅物流已激活，且本队至少一名企鹅物流成员携带装备，企鹅物流增加${id.endsWith('_b')?P.croissantElite:P.croissantNormal}层。同一干员的普通与精锐合计每回合只结算一次，按精锐数值结算。`;
      if(id.startsWith('c1_sora_growth'))g.desc=`休整期结束时，空在作战区、企鹅物流已激活，且有另一名不同的企鹅物流干员，企鹅物流增加${id.endsWith('_b')?P.soraElite:P.soraNormal}层。上下左右相邻有另一名灵巧干员且灵巧已激活时，灵巧增加${id.endsWith('_b')?2:1}层。同一干员每回合只结算一次。`;
    }
  }
  const sui=o.bonds?.suiShip;
  if(sui){
    sui.desc='3秒内，两名不同的岁干员通过有效攻击或直接治疗参与合击，合击后冷却8秒。合击以两名参与者开战时、不计技能增益的攻击力平均值计算：主目标受到220%的法术伤害，每层增加1.5个百分点，最多计算80层，最高340%；附近至多2名敌人受到该法术伤害的60%。4名岁干员时，主目标还受到120%的物理伤害，每层增加1个百分点，最高200%，附近法术伤害目标上限提高至4名。召唤物归属于持有者，不能算作额外干员；治疗光环不触发合击。';
    sui.bb={...sui.bb,artsBase:2.2,artsPerLayer:0.015,physicalBase:1.2,physicalPerLayer:0.01};sui.effectLayerCap=80;
    sui.effectDescRaw='两名不同岁干员在3秒内参与合击，冷却8秒。主目标受到参与者开战时、不计技能增益的平均攻击力{0:0.0%}的法术伤害；4名时额外造成{1:0.0%}的物理伤害。附近目标受到该法术伤害的60%，最多命中2名（4名岁时为4名）。最多计算80层。';
    sui.effectDescParams=[{index:0,base:'artsBase',perStack:'artsPerLayer',format:'0.0%'},{index:1,base:'physicalBase',perStack:'physicalPerLayer',format:'0.0%'}];
  }
  for(const [id,g]of Object.entries(o.garrisons||{})){
    const elite=id.endsWith('_b');
    if(id.startsWith('exp_nian_growth'))g.desc=`年在作战区时，本回合完成真实的精锐合成，获得成长资格。休整期结束时，岁已激活则增加${elite?6:3}层；岁未激活而坚守已激活时，坚守增加${elite?4:2}层。每回合只结算一次。`;
    if(id.startsWith('exp_ling_growth'))g.desc=`休整期结束时，令在作战区且岁已激活，每有一名其他不同的岁干员，岁增加${elite?2:1}层，每回合最多增加${elite?8:4}层。同名副本不重复计数，每回合只结算一次。`;
    if(id.startsWith('exp_shu_growth'))g.desc=`休整期结束时，黍在作战区。本队有至少三种不同职业且岁已激活时，岁增加${elite?4:2}层；本队有至少三名不同重装干员且坚守已激活时，坚守增加${elite?2:1}层。两项条件可分别结算，每回合各一次。`;
    if(id.startsWith('exp_aglna2_growth'))g.desc=`休整期结束时，予愿安洁莉娜在作战区。本队至少三名不同叙拉古干员分属至少三种职业、且叙拉古已激活时，叙拉古增加${elite?4:2}层；上下左右相邻有另一名灵巧干员、且灵巧已激活时，灵巧增加${elite?2:1}层。两项条件可分别结算，每回合各一次。`;
    if(g.desc!==undefined)g.descRaw=g.desc;
  }
  const bison=o.bands?.band_exp_bison;
  if(bison)bison.desc=bison.descRaw=`购买、刷新或升级商店的累计支出达到${P.bisonFirstSpend}资金、商店达到2级时，获得普通可颂；累计支出达到${P.bisonSecondSpend}资金、商店达到3级时，获得普通空。两项奖励各一次，从共享库存领取；对应干员缺货时改为同等级范围内的其他企鹅物流干员，仍无法领取时获得1次免费刷新。`;
  for(const c of Object.values(o.chess||{})){
    if(c.charId==='char_1015_aglna2')for(const s of new Set([c.skill,...c.skills]))if(s?.skillId==='skchr_aglna2_3')s.desc=s.descRaw=s.desc+'\n移动不算重新部署，不恢复生命、不重置弹药或攻击间隔。技能期间持续保持起飞状态；技能结束时解除起飞并立即返回本次技能开始前的位置。';
  }
  setTestBondDescription(o.bonds?.suiShip,'sui');
  setTestBondDescription(o.bonds?.penguinShip,'penguin',P);
  return o;
}
