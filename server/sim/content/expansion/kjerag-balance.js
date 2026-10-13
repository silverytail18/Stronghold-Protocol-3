/** Shared by match copies, browser replay and player-facing text; no layer scaling. */
export const KJERAG_GUIDE = Object.freeze({
  firstDelay: 2,
  coldCooldown: 12,
  coldMinimum: 10,
  coldDuration2: 2,
  coldDuration4: 3,
  iceBase: 600,
  iceAtkRatio: 0.15,
  iceAtkCap: 180,
  iceRadius: 1.2,
  iceSplashRatio: 0.5,
  iceCooldown: 14,
  iceMinimum: 10,
  freezeRefund: 0.5,
  freezeRefundCap: 4,
  coldRefund: 1,
});
export const ICE_TAG = 'exp:kjerag:ice';
export function guideDescription(){
  const k=KJERAG_GUIDE;
  return `2名：首个有效敌人出现${k.firstDelay}秒后，对本人存活在场雪境向导攻击范围内所有有效敌人施加${k.coldDuration2}秒寒冷；4名：寒冷持续${k.coldDuration4}秒，并解锁冰爆。寒冷成功投放后共享冷却${k.coldCooldown}秒，没有有效目标时等待，不储存次数，重叠范围对同一敌人每轮仅施加一次。寒冷不选择已冻结、不可选中、未揭示隐匿、睡眠、无敌或免疫寒冷的敌人，可对空。重复寒冷沿用原冻结与谢拉格成长。\n4名冰爆：成员攻击命中结算前已冻结的敌人并实际扣除生命时，造成${k.iceBase}＋当前攻击力×${k.iceAtkRatio*100}%（属性部分最多${k.iceAtkCap}）的法术伤害；主目标全额，周围${k.iceRadius}格其他有效敌人各受${k.iceSplashRatio*100}%基础冰爆伤害，再各自结算法抗与增减伤。致命攻击仍在命中位置冰爆，不再伤害已死亡主目标。普通攻击及技能强化攻击可触发，独立技能、持续伤害、溅射、连锁和冰爆自身不触发；同次攻击最多一次。冰爆归属触发成员，不复制本次攻击或技能倍率，不额外施加寒冷／冻结或直接增加层数。\n每名博士冰爆共享冷却${k.iceCooldown}秒。冷却期间，本人存活成员范围内每次敌人新进入冻结返还${k.freezeRefund}秒，单轮最多${k.freezeRefundCap}秒，最短间隔${k.iceMinimum}秒；刷新已有冻结不算，首次或已就绪时不储存返还。每次冰爆返还本人正在冷却的寒冷${k.coldRefund}秒，寒冷间隔最短${k.coldMinimum}秒；首次投放等待不返还。人数按开战快照，阵亡不降档但不提供范围；层数不改变效果。`;
}
