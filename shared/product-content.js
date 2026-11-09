import {N_} from './i18n.js';
// Stable built-in IDs; runtime rules and metadata are version-scoped by the server.
export const PRODUCT_CONTENT_REVISION=2;
// Content packs with operator identities/bonds have been adapted for the isolated Cyclops variant.
// Round/economy/UI experiments remain on their original modes; Rhine stays explicitly out of scope.
export const CYCLOPS_CONTENT_IDS=Object.freeze([
  'arknights-expansion-v1','rhodes-mujica-v1','kazdel-expansion-v1',
  'higashi-expansion-v1','ursus-expansion-v1','iberia-expansion-v1',
]);
export function markProductContent(data,id){
  data.config||={};const prior=data.config.productContent||{};
  data.config.productContent={...prior,catalog:PRODUCT_CONTENT_REVISION,ids:[...new Set([...(prior.ids||[]),id])]};
  return data;
}
export const PRODUCT_CONTENT=Object.freeze([
  {
    "id": "extended-rounds-20",
    "version": "test-3",
    "name": "20 回合扩展",
    "group": "回合扩展",
    "description": "非标准：每两轮递进的阶梯成长；R16补给，最终攻势20、隐藏21。R19末轮普通波次HP173%、攻击133%（相对本模式原R13）；主线／隐藏血池130%／125%，护卫HP120%、攻击105%。扩展只能选一项。",
    "status": "ready",
    "clientVersion": 1,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS"
    ],
    "conflicts": [
      "extended-rounds-24",
      "extended-rounds-30"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "extended-rounds-24",
    "version": "test-3",
    "name": "24 回合扩展",
    "group": "回合扩展",
    "description": "非标准：每两轮递进并交替补给／战术；R16、22补给，R20战术，最终攻势24、隐藏25。R23末轮普通波次HP249%、攻击161%（相对本模式原R13）；主线／隐藏血池150%／140%，护卫HP135%、攻击110%。扩展只能选一项。",
    "status": "ready",
    "clientVersion": 1,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS"
    ],
    "conflicts": [
      "extended-rounds-20",
      "extended-rounds-30"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "extended-rounds-30",
    "version": "test-2",
    "name": "30 回合扩展",
    "group": "回合扩展",
    "description": "非标准：每两轮递进的长线阶梯成长；R16、24补给，R20、28战术，最终攻势30、隐藏31。R29末轮普通波次HP430%、攻击214%（相对本模式原R13）；主线／隐藏血池180%／165%，护卫HP150%、攻击115%。平台期适应，两轮以上不连续同势力，扩展只能选一项。",
    "status": "ready",
    "clientVersion": 1,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS"
    ],
    "conflicts": [
      "extended-rounds-20",
      "extended-rounds-24"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "genius-trader-v1",
    "version": "trader-test-8",
    "name": "天才交易员",
    "group": "后期成长",
    "description": "需24或30回合扩展。R13起从16个泰拉名称分类随机开放4支公共股票，采用连续正价格／12段路径K线、股份计价与玩家收益页；固定参考30%—70%和收盘资金占比，资金流与拥挤影响实际涨跌。普通奖励从III阶起、每轮最多升一阶到专精，保留直接专精；2倍融资、15%事件及罗德岛科研协作32.5%额外PRTS，档案本局限一份。融资按路径强平，返剩余权益并保留装备；未投入仅保留现金，Boss休整结算，奖励不受装备池数量限制。",
    "status": "ready",
    "clientVersion": 84,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS"
    ],
    "requiresAny": [
      "extended-rounds-24",
      "extended-rounds-30"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "shop-extra-slot",
    "version": "test-1",
    "name": "商店增加一个角色格",
    "group": "体验优化",
    "description": "所有商店等级增加一个角色格，道具格、刷新费用与抽取方式保持。",
    "status": "ready",
    "clientVersion": 1,
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "coop-pool-150",
    "version": "test-1",
    "name": "联机角色库存增加50%",
    "group": "体验优化",
    "description": "仅多人：所有可入池角色副本×1.5向上取整；各阶18/21/27/24/12/8，缪尔赛思6。",
    "status": "ready",
    "clientVersion": 1,
    "modes": [
      "coop"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "strategy-confirm-order",
    "version": "test-1",
    "name": "策略按就绪顺序选择",
    "group": "体验优化",
    "description": "仅多人：按服务器首次收到有效就绪确认的顺序选择策略；未确认玩家、AI和托管玩家补在后面。未启用时沿用随机排序，跳过仍移至末尾。",
    "status": "ready",
    "clientVersion": 1,
    "modes": [
      "coop"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "opening-bans-4-6",
    "version": "test-1",
    "name": "开局禁用：4核心＋6附加",
    "group": "卡池优化",
    "description": "非标准：本局随机禁用4个核心盟约、6个附加盟约，替代原3＋4。只调整数量，沿用现有候选、等概率抽样和全归属禁用角色入池规则。与5＋8互斥。",
    "status": "ready",
    "clientVersion": 1,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS"
    ],
    "conflicts": [
      "opening-bans-5-8"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "opening-bans-5-8",
    "version": "test-1",
    "name": "开局禁用：5核心＋8附加",
    "group": "卡池优化",
    "description": "非标准：本局随机禁用5个核心盟约、8个附加盟约，替代原3＋4。只调整数量，沿用现有候选、等概率抽样和全归属禁用角色入池规则。与4＋6互斥。",
    "status": "ready",
    "clientVersion": 1,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS"
    ],
    "conflicts": [
      "opening-bans-4-6"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "arknights-expansion-v1",
    "version": "expansion-test-18",
    "name": "原版pro",
    "group": "内容拓展",
    "description": "予愿安洁莉娜普通／精锐形态现归属本包。新增5阶司霆惊蛰与6阶赤刃明霄陈，完整原作技能、模组与专属强化：惊蛰加快蓄力并强化落雷／电流，陈强化技能伤害及物法承伤，不再提供个人炎叠层奖励。原岁与企鹅更名。雪境向导2／5人，五人冰爆固定500点法术基础伤害、不含攻击力加成；寒冷基础冷却30秒、返还后最短20秒，冰爆冷却16秒／最短12秒。六名新干员、岁、原企鹅物流、雪境向导、骑士整备与铳械协同五附加盟约、四项策略；企鹅物流恢复原六成员、携带持续战斗装备的本人真实干员攻防加成与12/30/50三次装备补给、3/5基础成长。铳械协同六成员：隐现、送葬人、能天使、空弦、信仰搅拌机、莫斯提马；2人且3拉特兰，非弹药技能的本人拉特兰核心受益真实干员攻击+10%；4人且6拉特兰，全体核心受益真实干员40%启动攻击，与弹药消耗共享200%上限。骑士整备保留初始部署15%/40%补偿。两新附加不叠层，普通战转联防继承，均按正常权重10参与禁用。",
    "status": "ready",
    "clientVersion": 80,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "rhodes-mujica-v1",
    "version": "ri-mujica-test-20",
    "name": "罗德岛与乐队",
    "group": "内容拓展",
    "description": "14名天然罗德岛，含Mon3tr与五名少女乐队。攻血20%＋每层0.2个百分点与原成长保持。炮火攻击力供给全程固定6人8%／9人12%，中段供给成长按参考攻击力8000转为分档基础伤害，0层500、999层30110／33790，不新增炮火穿透。主炮4秒／2.5秒、半径0.8／1.2、真弹50%保持；全阶原生参战供令，同名低／中／高阶6／8／10秒、全队2秒、存2枚。6人最多两轮物法追射、9人最多一轮，旧目标死亡可接续受牵制标定敌人，整链最多一次成长。6人起阿米娅、寒芒克洛丝、若叶睦、八幡海铃、丰川祥子及Mon3tr新增本人原生作战强化，替代本人罗德岛叠层特质，状态与冷却按本回合联防框架继承；原作技能／模组、其他成员成长、正常禁用与管理员规则保持。",
    "status": "ready",
    "clientVersion": 72,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "kazdel-expansion-v1",
    "version": "kazdel-test-15",
    "name": "卡兹戴尔 · 魂契",
    "group": "内容拓展",
    "description": "新增6阶维什戴尔，复用上游三技能与魂灵之影实现。魂契3/6/9、血脉2/4；原生增伤及中期成长曲线保持。3/6/9生命每层增加0.15/0.2/0.25个百分点；开技仍失去当前生命10%，1秒恢复失血1.2倍；盟约恢复不再供火或增加生命流转层数，正常受伤和原生治疗保持。共享拒死仅9人生效、消耗门槛75%、固定冷却12秒；低血救援遵守目标外部禁疗，不浪费魂火与名额。保留原11名干员的固定特质与成长，新增维什戴尔【精准】及【余震压制】；开战魂火、契伤、救援与上一版血咒/血卷/3格对空剑气和共鸣。",
    "status": "ready",
    "clientVersion": 81,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "rhine-lab-v1",
    "version": "rhine-test-6",
    "name": "莱茵生命",
    "group": "内容拓展",
    "description": "T03当前攻击分享40%，T16按抗性连续增加破甲；启用本包时，仅多人共享角色池的缪尔赛思额外增加2份副本；与库存增加50%组合时先扩容再额外加2。莱茵3/6/9/10；攻血10%＋每层0.1%，仅真实莱茵成员。科研最高999，每50层1科技点，正常最多19点；十人及两策略独立奖励。14项单级科技，六层可滚动科技树、互斥二维选格、彩色科技格标志；休整判人数，3/6人科技按原人数生效，高于6人科技解锁后6人生效，开战固定科技资格。六名新干员、五种旧形态、两装备两策略；专项研究2/4，攻击与治疗两种爆炸共用各自独立冷却；固定人数档科技，格内物理脉冲、每场临时访学及研究席增伤／减伤与无敌救援；显示和记录修复，移除多萝西。",
    "status": "ready",
    "clientVersion": 33,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "higashi-expansion-v1",
    "version": "higashi-test-11",
    "name": "东国",
    "group": "内容拓展",
    "description": "11天然成员（8新＋3旧）、东国3/6/9、忍术策应2/4；六人强化原生攻速、单体见切与协同连太刀；六人解锁奥义，真伤＋各目标5%命中前当前生命（对首领也生效）、1秒眩晕及碎屏刀光；保留地空剑风、九人归鞘和白纸刀录；两装备保持。按用户要求未进行伤害或强度测试。",
    "status": "ready",
    "clientVersion": 77,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "ursus-expansion-v1",
    "version": "ursus-test-11",
    "name": "乌萨斯",
    "group": "内容拓展",
    "description": "3／5／8人开放3／4／6重国度；开战前按原生伤敌范围及异名确定本场国度，战斗中固定；二重共享与近战普攻对空，二重基础增伤50%＋每层0.4个百分点、敌攻降低20%—60%；二重缓行、三重减攻速及显影、四重破甲、五重裁决、六重专属压制与额外增伤翻倍。五／八人增血30%／50%、域内减伤15%／25%、对二重以上Boss原生直伤额外50%／100%。八人开战时，四重以上格内本人真实干员获得当前生命50%护盾，每场一次。每回合只按覆盖格获层。11名新干员（含六阶塔露拉）、古米与折桠追加归属、学生自治团2／4、两策略与两装备。默认私有。",
    "status": "ready",
    "clientVersion": 88,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  },
  {
    "id": "iberia-expansion-v1",
    "version": "iberia-test-5",
    "name": "伊比利亚",
    "group": "内容拓展",
    "description": "3／6／9供灯、五层审判与蓝色花瓣、长明和符文判决；每名干员供灯周期2秒。五阶瑰盐替换絮雨，旅骨改迅捷；九人常驻长明每12秒额外点灯，并获得无主灯塔：不可被攻击，12技力为周围3×3格本人成员提供一次次数盾，基础1技力／秒，近敌额外1技力／秒。9名新干员、3名旧成员、两策略两装备。支持排位；排位普通战／联防由客户端计算，Boss／隐秘核心由服务器统一计算并协调共享判决。",
    "status": "ready",
    "clientVersion": 71,
    "difficulties": [
      "NORMAL",
      "HARD",
      "ABYSS",
      "FUNNY"
    ],
    "enabled": true,
    "capability": "builtin-content-v2"
  }
].map(item=>Object.freeze(item)));
