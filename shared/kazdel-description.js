import {TRAIT_RULES} from './kazdel-traits.js';
import {layers,nativeDamageBonus,deferRate,generationRate,curseBase,CURSE_FIRE_RATES,attackReserve,guardCooldown,PREP_GROWTH,PERFORMANCE_CAP,lifeFireRate,waveDamage,waveCost,NATIVE_FIRE_RATES,ATTACK_FLOOR_RATES,FOLLOW_UP_ARTS,TRUE_ECHO_SCALE} from './kazdel-rules.js';
const num=n=>Math.round(n).toLocaleString('zh-CN'),pct=n=>(100*n).toFixed(2).replace(/\.?0+$/,'')+'%',up=s=>'<@ba.vup>'+s+'</>';
export function kazdelCurrentEffect(bond,L,tier,context=null){
 L=layers(L);if(!(tier>=1))return `未激活：在场至少${bond.bondId==='bloodlineShip'?2:3}名成员后生效。`;
 if(bond.bondId==='bloodlineShip'){
  const i=tier>=2?1:0;
  return ['魂火转化额外+'+up(pct((i?.04:.02)+(i?.0003:.0002)*L))+'，总转化率最高60%。','原生受疗量+'+up(pct((i?.0002:.0001)*L))+'。',...(i?['成员从半血以下恢复至半血以上，获得'+up(num(200+4*L))+'护盾4秒；同名冷却10秒，每轮最多3次。']:[]),'休整+'+(i?4:2)+'层，普通战斗表现额外最多'+(i?16:8)+'层；新技能献血回血不加速血脉成长。'].join('\n');
 }
 const i=Math.min(3,tier)-1,C=1000+25*L,K=context?.capacity,Q=Number.isFinite(context?.soulFire)?context.soulFire:null,bl=context?.blood;
 const blood=bl?.active?(bl.tier>=2?.04+.0003*layers(bl.layers):.02+.0002*layers(bl.layers)):0;
 const rate=Number.isFinite(context?.generationRate)?context.generationRate:lifeFireRate(tier,L,blood),curse=curseBase(tier,L)+(Q==null?0:Q*CURSE_FIRE_RATES[i]);
 const cost=waveCost(tier,C),available=Number.isFinite(context?.attackAvailable)?context.attackAvailable:Math.max(0,(Q||0)-attackReserve(tier,C)),allowance=context?.outputAllowance??C;
 const D=waveDamage(tier,context?.population??context?.count??[3,6,9][i],L,Q||0,cost>0?Math.min(cost,available,allowance)/cost:0);
 const waveArts=context?.waveArts??D.arts,waveTrue=context?.waveTrue??D.true;
 return [
  '所有近战干员阻挡数'+up('+1')+'；遵守技能禁止阻挡与起飞规则。专属特质见干员详情，战斗效果为固定能力。',
  '成员生命+'+up(pct([.1,.15,.2][i]+.005*L))+'，原生伤害+'+up(pct(nativeDamageBonus(tier,L)))+'。',
  '魂火：'+(K?up(num(K))+'容量；':'容量随成员人数与常驻生命增加；')+(Q!=null?(context.live?'当前':'预计开战')+up(num(Q))+'。':'各档开战即有基础魂火。'),
  (tier>=2?'全队':'成员')+'实际生命变化的'+up(pct(rate))+'转为魂火；成员原生伤敌供火'+up(pct(NATIVE_FIRE_RATES[i]))+'，有效普攻每人每秒保底容量的'+up(pct(ATTACK_FLOOR_RATES[i]))+'，取较高值。'+(K?'每秒总量≤'+num(generationRate(tier,L,K))+'，攻击占35%。':'满池不扣额度，下一秒恢复额度。'),
  '成功开技扣当前生命'+up('10%')+'（最低1），随后'+up('1秒')+'恢复实际失血的'+up('2倍')+'；'+(tier>=2?'正常回技效率'+up('+20%')+'。':'也能供火。'),
  '其他原生攻击与技能消耗魂火追加法伤'+up(FOLLOW_UP_ARTS[i]+'倍魂火')+(tier>=3?'，另加'+up('1.25倍')+'真伤':'')+'；有效治疗使受疗成员4秒内下一次普通附燃支出提高50%。血卷、剑气使用下列独立公式。',
  ...(tier>=2?[tier>=3?'地面成员非技能普攻命中，在前方一格生成对空穿透剑气：'+up(num(waveArts))+'法伤＋'+up(num(waveTrue))+'真伤，宽'+up('1格')+'、'+up('1秒飞行5格')+'；每人冷却'+up('1秒')+'。':'地面成员非技能普攻命中，在前方'+up('1格')+'触发对空血卷：'+up(num(waveArts))+'法伤；每人冷却'+up('2秒')+'，合法转职同样生效。','每目标完整伤害随人数、层数、当前魂火增加；每波目标支出'+num(cost)+'魂火，魂火加成按实际支付比例降低，空击退火，0魂火仍有基础伤害。']:[]),
  ...(tier>=3?['魂火≥'+up(num(1.1*C))+'时成功开技进入'+up('6秒共鸣')+'，追加魂火伤害转为'+up((FOLLOW_UP_ARTS[2]+TRUE_ECHO_SCALE)+'倍真伤')+'、转伤额度恢复加快；冷却16秒。']:[]),
  '全图血咒：出现1秒后，每'+up('2秒')+'真伤一次；'+(Q==null?'基础':'当前')+'地面'+up(num(curse))+'、空中'+up(num(2*curse))+(Q==null?'，另加当前魂火的'+pct(CURSE_FIRE_RATES[i])+'。':'。'),
  '契伤：'+up(pct(deferRate(L)))+'敌人物法伤害延后6秒，个人容量'+up(num(C))+'；治疗盈余还债'+(tier>=2?'并接济邻近成员':'')+'。低血魂火救援：冷却'+[8,6,4][i]+'秒，最多'+[1,2,2][i]+'人从低于35%恢复至50%。',
  '共享拒死：魂火≥'+up(num(C))+'，消耗'+up(num(.5*C))+'免疫一次致死伤害；冷却'+(Q!=null&&Q>=C?guardCooldown(Q,C).toFixed(1):'5—10')+'秒。拒死就绪时伤敌预留'+num(attackReserve(tier,C))+'，危急预留'+num(1.1*C)+'。',
  '首名敌人出现8秒后，近5秒有有效攻击或生命流转时每秒衰减约'+up('0.5%')+'，闲置时'+up('1.5%')+'。休整+'+PREP_GROWTH[i]+'层、上轮普通战斗表现最多+'+PERFORMANCE_CAP[i]+'层；天然成员按各自特质记录成长，转职沿用生命流转；参战保底与其他卡兹戴尔特质奖励共用个人6/10层上限，同名取最高，下一休整结束到账。999封顶，层数只增加数值。',
 ].join('\n');
}
