// Personal combat garrisons; values are separate from the pinned original skill/module records.
export const REINFORCEMENT=Object.freeze({
 leiziRampSpeed:Object.freeze([.25,.5]),leiziLightning:Object.freeze([.15,.25]),
 chenDamage:Object.freeze([.12,.2]),chenGuard:Object.freeze([.1,.15]),
});
export function reinforcementOf(c){const key=c?.baseId==='chess_exp_leizi2_a'?'leizi2':c?.baseId==='chess_exp_chen3_a'?'chen3':null;return key&&c.garrisonIds?.includes('newop_'+key+(c.isGolden?'_b':'_a'))?{key,i:+!!c.isGolden}:null;}
export const chenWindow=u=>!!u?.skill?.active||!!u?.findBuff('native:new:chenAfter');
// Equipment/bond packets credited to this operator must never borrow the trait.
export const nativeDamage=d=>!!d&&!d.sourceless&&!d.isHpLoss&&!d.tags?.some(t=>typeof t==='string'&&/^(?:bond|item|dot|periodic|hpLoss|chain|aftershock|exp:sui|exp:kjerag:ice|hg:)(?::|$)/.test(t))&&(d.isAttack||d.tags?.includes('native:new'));
export function reinforcementText(key,elite){const i=+!!elite,p=REINFORCEMENT;
 return key==='leizi2'?'本人非技能期间蓄力速度提高'+p.leiziRampSpeed[i]*100+'%，蓄力上限仍为攻击力＋200%；原生落雷与电流伤害提高'+p.leiziLightning[i]*100+'%。仅强化本人，不再提供炎的个人叠层奖励。'
 :'本人技能期间及二技能后续增益期间，原生伤害提高'+p.chenDamage[i]*100+'%，受到敌方直接物理、法术伤害降低'+p.chenGuard[i]*100+'%。仅强化本人，不再提供炎的个人叠层奖励；火龙转向、独立部件碰撞与首领限伤保持。';
}
