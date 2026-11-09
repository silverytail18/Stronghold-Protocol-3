import {PARAMETERS} from './higashi-parameters.js';
export const CORE='higashiShip',NINJA='higashiNinjutsuShip',BATCH='higashi-expansion-v1';
export const DEFEND='band_higashi_defend',MARKET='band_higashi_market',SEAL='higashi_seal',TALISMAN='higashi_talisman';
export const C=Object.freeze(PARAMETERS.core),N=Object.freeze(PARAMETERS.addon),G=Object.freeze(PARAMETERS.growth),O=Object.freeze(PARAMETERS.ultimate),D=Object.freeze(PARAMETERS.duel);
// Every legal enemy, including bosses, receives the same current-HP bonus ratio.
export const ultimateHpRatio=()=>O.currentHpRatio;
export const layers=x=>Math.max(0,Math.min(999,Math.trunc(Number.isFinite(x)?x:0)));
export const tier=n=>n>=9?3:n>=6?2:n>=3?1:0;
export const stats=L=>({atkPct:(C.atkBasePercent+C.atkPercentPerLayer*layers(L))/100,defPct:(C.defBasePercent+C.defPercentPerLayer*layers(L))/100});
export const lateHaste=(L,t)=>Math.max(0,Math.min(1,(layers(L)-D.hasteStarts)/(D.hasteFull-D.hasteStarts)))*(D.lateHaste[t-1]||0);
export const baseDamage=L=>C.damageBase+C.damageLinearPerLayer*layers(L)+C.damageQuadratic*Math.max(0,layers(L)-C.damageCurveStarts)**2;
export const releaseDamage=(L,A,returning=false)=>(baseDamage(L)+C.damageCurrentAtkRatio*Math.max(0,Number.isFinite(A)?A:0))*(returning?C.returnArtsRatio:1);
export const originalAttack=d=>!!d?.isAttack&&!d.sourceless&&!d.isSplash&&!d.tags?.some(t=>/^(bond|item|dot|periodic|chain|aftershock|hpLoss|hg:)/.test(t));
export const realIdentity=(u,bonds)=>u?.kind==='op'&&bonds.includes(CORE)&&!u.trait?.doll;
export const normalGrowth=kind=>kind==='normal';
export const baseHp=u=>Math.max(1,u.def?.raw?.higashiBaseHp||u.def?.raw?.stats?.maxHp||u.base.maxHp);
const percent=n=>Math.round(n*1000)/10;
const v=x=>'<@ba.vup>'+x+'</>',need=(n,name)=>'<在场<@autochess.dgreen>'+n+'</>名不同【'+name+'】干员>';
export const CORE_DESCRIPTION='【东国】干员攻击力和防御力提升'+v('（受修习层数影响）')+'。身份成员最大生命提升'+v('20%')+'，可阻挡地面近战阻挡数'+v('＋1')+'；实际阻挡时额外防御'+v('25')+'、物法直接伤害减免'+v('8%')+'\n受到直接物理或法术伤害时进入'+v('3秒架势')+'，减伤'+v('23%')+'，同名冷却'+v('6秒')+'。积蓄刀势自动释放可对空的'+v('范围一闪')+'；周期发动'+v('破空剑风')+'，优先留位对空并清扫地面敌人\n'+need(6,'东国')+'生命提升至'+v('25%')+'，阻挡防御／减伤至'+v('35／10%')+'，架势减伤至'+v('27%')+'；一闪恢复标准威力，剑风最多'+v('3名')+'并预留'+v('2名对空')+'。解锁'+v('见切与连太刀')+'，持续原生攻击同一目标逐次增伤、异名交替加速叠层；解锁奥义'+v('白夜·一文字')+'，蓄满后全场真伤斩击，额外附带各敌人命中前'+v('5%当前生命')+'伤害（对首领也生效）、'+v('1秒眩晕')+'与减速，并为身份成员赋予屏障\n'+need(9,'东国')+'生命提升至'+v('35%')+'、额外阻挡至'+v('＋2')+'，阻挡防御／减伤至'+v('55／15%')+'，架势减伤至'+v('33%')+'；一闪后'+v('0.8秒')+'自动'+v('80%法术归鞘')+'，一闪、剑风、奥义与原生围攻进一步强化\n（休整修习'+v('6／12／14层')+'；200—700层渐增攻速，最高'+v('20／55／70')+'；两种减伤取高，调和仅享攻防，无层数生命或盟约自然回复）';
export const NINJA_DESCRIPTION='【忍术策应】干员有效原生攻击命中后追加'+v('80%攻击力')+'法术影袭，使目标减速'+v('35%')+'、持续'+v('2秒')+'；同名冷却'+v('5秒')+'\n'+need(4,'忍术策应')+'影袭伤害提高至'+v('120%攻击力')+'，减速'+v('40%')+'、持续'+v('2.5秒')+'，冷却缩短至'+v('4秒')+'；周围最多两名敌人受到半额伤害与减速\n（首次部署或正常开技即就绪；盟约、装备及影袭自身不触发）';
export function higashiCurrentEffect(L,tier,context={}){
 const i=Math.max(0,Math.min(2,tier-1)),s=stats(L),defend=context.defend,pct=n=>(n*100).toFixed(1).replace(/\.0$/,'')+'%',members=Array.isArray(context.members)?context.members:[];
 const amounts=members.map(m=>releaseDamage(m.releaseLayers??L,m.atk)*C.releaseScales[i]),range=amounts.length?Math.round(Math.min(...amounts))+(Math.max(...amounts)-Math.min(...amounts)>=1?'—'+Math.round(Math.max(...amounts)):''):null;
 const out=['攻击力+'+v(pct(s.atkPct))+'，防御力+'+v(pct(s.defPct))+'；身份成员生命+'+v(pct(C.hpBonuses[i]))+'，符合条件近战阻挡+'+v(C.blockBonuses[i])+'；身份成员当前攻速+'+v(lateHaste(L,tier).toFixed(1).replace(/\.0$/,''))+'。','实际阻挡时额外防御+'+v(C.blockingDefenses[i])+'、物法直接减伤'+v(pct(C.blockingReductions[i]))+'；架势减伤'+v(pct(C.parryReductions[i]+(defend?.05:0)))+'、持续'+v((C.parryDuration+(defend?1:0))+'秒')+'，冷却'+v('6秒')+'，两者取较高值。',
 (context.live?'当前':'开战预计')+'一闪：'+(range?v(range):v(Math.round(baseDamage(L)*C.releaseScales[i]))+'＋'+v(C.damageCurrentAtkRatio*C.releaseScales[i]*100+'%当前攻击力'))+'物理伤害，无视'+v((tier>=3?C.defIgnore9:C.defIgnore6)*100+'%防御')+'；主目标全额、周围最多两名半额，均可对空（减伤前）。'+(tier>=3?' '+v('0.8秒')+'后自动'+v('80%法术归鞘')+'。':''),
 '破空剑风：每'+v(C.windIntervals[i]+'秒')+'攻击最多'+v(C.windTargets[i]+'名')+'地面或飞行敌人，预留对空；各造成'+v(C.windAtkRatios[i]*100+'%当前攻击力')+'＋'+v(Math.round(C.windBaseRatio*baseDamage(L)))+'法术伤害。'];
 if(tier>=2){const j=tier-2;out.push('奥义'+v('白夜·一文字')+'：'+(context.live?v(Math.floor(context.ultimate||0)+'/100')+'；':'')+'全场可选敌人受'+v(Math.round(O.damageBaseRatios[j]*baseDamage(L)))+'＋'+v(O.attackSumRatios[j]*100+'%本方六名异名成员攻击总和')+'＋'+v(O.currentHpRatio*100+'%目标命中前当前生命')+'真实伤害（对首领也生效），眩晕'+v(O.stunDuration+'秒')+'，减速'+v('60%／3秒')+'；身份成员屏障'+v(O.shieldRatios[j]*100+'%生命／4秒')+'，最短间隔'+v(O.cooldowns[j]+'秒')+'。');}
 out.push((context.live?'刀势'+v(Math.floor(context.stance||0)+'/100')+'；'+(context.cooldown>0?'拔刀冷却'+v(context.cooldown.toFixed(1)+'秒'):'等待有效目标'):'开战刀势'+v('100/100')+'，有效接敌每秒+'+v(C.passiveGains[i])+'，拔刀最短间隔'+v(C.releaseCooldowns[i]+'秒'))+'；休整修习'+v('+'+G.restByTier[i]+'层')+'。'+(tier>=2?' 见切'+v((context.duel?.cuts||0)+'/12')+'，对该目标原生攻击伤害最高+'+v(D.damagePerCut[i]*1200+'%')+'；满层异名协同连太刀'+v('4秒')+'，攻速+'+v(D.comboHaste[i])+'，对该目标物理原生攻击额外无视'+v(D.comboDefIgnore[i]*100+'%防御')+'。':''));return out.join('\n');
}
