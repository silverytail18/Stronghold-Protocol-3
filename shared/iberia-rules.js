// Experimental Iberia rules. Pure functions are shared by the simulation and UI.
export const CORE='iberiaShip',BATCH='iberia-expansion-v1',VERSION='iberia-test-5';
export const VOYAGE='band_iberia_voyage',FIRE='band_iberia_fire',LAMP='iberia_lamp',EYE='iberia_eye';
export const layers=n=>Math.max(0,Math.min(999,Math.trunc(Number.isFinite(n)?n:0)));
export const tier=n=>n>=9?3:n>=6?2:n>=3?1:0;
export const attackBonus=L=>.20+.004*layers(L);
export const healingBonus=L=>.12+.0008*layers(L);
export const MARK=Object.freeze({cap:5,interval:.6,duration:8,perLayer:.05,cooldown:3,bossCap:30000});
export const bossTarget=e=>!!(e?.isBoss||e?.def?.rank==='BOSS'||e?.bossPool||e?.mem?.storyBoss);
export const nativeDamage=d=>!!d&&!d.sourceless&&['phys','arts','true'].includes(d.type)&&!d.tags?.some(t=>/(?:^|:)(bond|item|reflect|hpLoss|aftershock)(?::|$)/.test(t)||/^(ib:|ur:|hg:)/.test(t));
export const directDamage=d=>nativeDamage(d)&&(d.isAttack||d.isSkill)&&!d.isPeriodic&&!d.tags?.some(t=>/(?:^|:)(dot|periodic|poison|burn|counter|alchemy|mySea)(?::|$)/.test(t));
export const explosion=(atk,hp,boss=false)=>Math.min(boss?MARK.bossCap:Infinity,180+1.2*Math.max(0,atk)+.025*Math.max(0,hp));
export const sunlight=t=>t>=3?12:t>=2?8:0;
export const nativeBonus=t=>t>=3?.50:t>=2?.30:0;
export const CORE_DETAILS='3／6／9名不同伊比利亚：身份成员攻击力提高20%＋每层0.4个百分点，治疗量提高12%＋每层0.08个百分点。每位不同真实成员每2秒以有效原生行为供灯1点（之眼不再额外缩短），初始12点，每24点点灯：回复4／6／8技力并获得6／8／12秒抵抗；6人进入8秒长明；9人首次点灯后长明持续至本战场结束，同回合联防继承，新正式回合重新点灯。九人长明期间每12秒额外获得一次点灯的技力与抵抗，不消耗灯火、不触发成长；九人获得独立灯塔，12技力为周围3×3格本人成员赋予一次次数盾；灯塔基础每秒1技力，附近有敌人再加1技力。长明原生伤害与生命恢复提高30%／50%，身份成员额外攻击20%、攻速20，全场敌人显形、减速30%；9人长明期间本人身份成员物法减伤15%。\n审判：原生直接命中每0.6秒至多加1层，8秒，最多5层；每层使敌人受到本人身份成员伤害提高5%，最多25%。先按旧层结算，满5层后的下次合格命中引爆并清层，真伤180＋1.2×当前攻击＋2.5%目标最大生命，Boss上限30000，眩晕0.6秒；每玩家每敌方实例引爆冷却3秒。\n长明判决：普通敌人HP严格低于20%、Boss严格低于10%、有本人审判、进入本人真实伊比利亚伤敌范围的敌人（含空中）预约判决并消费印记。普通敌人立即释放阻挡和索敌，静止1秒、模型深蓝且不可交互；随后20%最大生命真伤。Boss不静止，符文预告1秒后造成min(299999, 触发时当前生命)真实伤害。伤害走正常护盾、减免和保命；符文只在真实死亡时衔接击杀。\n休整3／6／9人获得2／4／6层；每正式回合前3次点灯各2层。';
const v=x=>'<@ba.vup>'+x+'</>';
const need=n=>'<在场<@autochess.dgreen>'+n+'</>名不同【伊比利亚】干员>';
export const CORE_DESCRIPTION=[
 need(3)+'【伊比利亚】干员攻击力与治疗量提高（受层数影响）。原生攻击或技能直接命中敌人时施加【审判】，每层使目标受到本人成员的伤害提高'+v('5%')+'，最多'+v('5层')+'；满层后下次直接命中引爆，造成真实伤害并眩晕。',
 '成员通过原生伤害、治疗等有效行动积蓄【灯火】，每'+v('24点')+'点灯，为成员回复'+v('4点技力')+'并赋予'+v('6秒抵抗')+'。',
 need(6)+'点灯回复提高至'+v('6点技力')+'，抵抗延长至'+v('8秒')+'，并开启'+v('8秒【长明】')+'：成员原生伤害与生命恢复提高'+v('30%')+'，额外获得'+v('20%攻击力、20攻击速度')+'；全场敌人显形、移动速度降低'+v('30%')+'。',
 '【长明】期间，本人成员伤敌范围内生命低于'+v('20%')+'且带有本人【审判】的普通敌人受到【判决】；首领触发线为'+v('10%')+'（可对空）。',
 need(9)+'点灯回复提高至'+v('8点技力')+'；抵抗延长至'+v('12秒')+'；首次点灯后【长明】持续至本战场结束'+'；期间每'+v('12秒')+'额外获得点灯的技力与抵抗；获得可部署【灯塔】，不占人口，12技力为周围3×3格成员提供1次次数盾'+'，原生伤害与恢复加成提高至'+v('50%')+'，成员受到的物理、法术伤害降低'+v('15%')+'。',
 '休整期结束获得'+v('2／4／6层')+'；每回合前'+v('3次')+'点灯各获得'+v('2层')+'。',
 '（九人长明同回合联防继承，新回合需重新点灯；详细结算见“触发与结算”）'
].join('\n');
export function currentEffect(L,t,context={}){
 const lines=['【伊比利亚】干员攻击力'+v('＋'+(attackBonus(L)*100).toFixed(1)+'%')+'，治疗量'+v('＋'+(healingBonus(L)*100).toFixed(1)+'%')+'。',
 '【审判】每层易伤'+v('5%')+'，最多'+v('5层／25%')+'，持续'+v('8秒')+'；满层后下次原生直接命中引爆。',
 '点灯：回复'+v([0,4,6,8][t]+'点技力')+'，赋予'+v([0,6,8,12][t]+'秒抵抗')+'。'];
 if(context.live===true&&Number.isFinite(context.fuel))lines[2]+=' 当前灯火：'+v(context.fuel+'/24')+'。';
 else lines[2]+=' 首战初始灯火'+v('12/24')+'；每名不同成员每2秒有效行动供灯1点。';
 if(t>=2){lines.push('【长明】'+v(t>=3?'本场持续':sunlight(t)+'秒')+'：原生伤害与恢复'+v('＋'+nativeBonus(t)*100+'%')+'，额外攻击力'+v('＋20%')+'、攻击速度'+v('＋20')+'；全场显形、减速30%。'+(context.fire?'审判之火：无视'+v((t>=3?30:20)+'%防御与法抗')+'。'+(t>=3?'放弃长明的15%物法减伤。':''):t>=3?'成员物法减伤'+v('15%')+'。':''));lines.push('【判决】本人成员伤敌范围内且有本人审判（含空中）：普通敌人生命低于20%，静止1秒后受到20%最大生命真实伤害；首领低于10%触发，不静止，1秒后造成min(299999, 触发时当前生命)真实伤害。');}
 else lines.push('在场6名不同成员后解锁【长明】与【判决】。');
 if(t>=3)lines[3]+=' 长明期间每12秒额外获得8技力、12秒抵抗，不消耗灯火、不触发成长。获得可部署【灯塔】：不占人口、不可被攻击；12技力为周围3×3格本人成员赋予1次次数盾。';
 if(context.live===true&&t>=2)lines[3]+=' '+(context.sunPermanent?'【长明】本场持续。'+(Number.isFinite(context.sunPulseRemaining)?'下次周期点灯'+v(context.sunPulseRemaining.toFixed(1)+'秒')+'。':''):context.sunRemaining>0?'【长明】剩余'+v(context.sunRemaining.toFixed(1)+'秒')+'。':'【长明】未开启。');
 lines.push('休整成长'+v('＋'+[0,2,4,6][t]+'层')+'；每回合前3次点灯各'+v('＋2层')+'。');return lines.join('\n');
}
