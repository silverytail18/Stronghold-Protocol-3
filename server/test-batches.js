// Per-match overlays only. Never edit the generated baseline or any player storage.
import {ROUND_EXTENSION_TOTALS,EXTENSION_SOURCES,EXTENSION_PROFILES,EXTENSION_FLY,EXTENSION_BOSSES,EXTENSION_DECISIONS,extensionMultipliers} from '../shared/round-extensions.js';
import {modeIdFor} from '../shared/constants.js';
const DIFFICULTIES = ['NORMAL', 'HARD', 'ABYSS'];
const rounded = n => Math.round(n * 1e6) / 1e6;
export function strategyConfirmOrder(data) {
  data.config.bandDraft ||= {};
  data.config.bandDraft.confirmationOrder = true;
}
// Counts replace this match's configuration. Sampling and all-bonds pool filtering stay unchanged.
export function openingBans(data, core, addon) {
  if (!((core === 4 && addon === 6) || (core === 5 && addon === 8))) throw new Error('不支持的开局禁用数量');
  data.config.bans ||= {};
  for (const difficulty of DIFFICULTIES) {
    data.config.bans[difficulty] = {...data.config.bans[difficulty], core, addon};
  }
}
// Preserve routes and enemy counts; stagger platform/focus actions instead of inflating their budget.
function extensionTemplate(data,source,profile){
  const id=`round_ext_v2_${source}_${profile}`;
  if(data.waves?.[id])return id;
  const original=data.waves?.[source];if(!original)throw new Error('扩展波次缺少原模板：'+source);
  const tpl=structuredClone(original);tpl.id=id;tpl.extensionSource=source;tpl.extensionProfile=profile;
  for(const action of tpl.spawns||[]){
    const route=Number(action.routeIndex)||0,slot=action.slot||'';
    const delay=profile==='transition'?(route%4)*4:profile==='consolidate'?(route%3)*6:profile==='focus'?(/^N/.test(slot)?6:/^S/.test(slot)?3:0):0;
    action.time=rounded((Number(action.time)||0)+delay);
    if(profile==='consolidate')action.interval=rounded((Number(action.interval)||0)*1.15);
  }
  data.waves[id]=tpl;return id;
}

export function extendRounds(data, total) {
  if (!ROUND_EXTENSION_TOTALS.includes(total)) throw new Error('不支持的扩展回合数');
  const bosses=EXTENSION_BOSSES[total];
  for (const [modeId,mode] of Object.entries(data.config.modes)) {
    if (!DIFFICULTIES.includes(mode.difficulty) || !['SINGLE', 'MULTI'].includes(mode.type)) continue;
    // Independent variants can share a difficulty/type without sharing the official round lifecycle.
    if (modeId !== modeIdFor(mode.type === 'SINGLE' ? 'solo' : 'coop', mode.difficulty)) continue;
    const boss = mode.bossRound, hidden = mode.hiddenRound;
    const bossCfg = structuredClone(mode.rounds[boss]);
    const hiddenCfg = structuredClone(mode.rounds[hidden]);
    const bossScale = structuredClone(mode.enemyScale[boss]);
    const hiddenScale = structuredClone(mode.enemyScale[hidden]);
    const base = mode.enemyScale[boss - 1];
    const extra=total-boss;
    for (let i = 0; i < extra; i++) {
      const r = boss + i;
      const source=mode.rounds[EXTENSION_SOURCES[i]],profile=EXTENSION_PROFILES[i];
      const mul=extensionMultipliers(mode.type,i);
      mode.rounds[r] = {...structuredClone(source),template:extensionTemplate(data,source.template,profile), prepTime: mode.type === 'SINGLE' ? null : 90, prepTimeData: mode.type === 'SINGLE' ? 300 : 90,
        combatTimeLimit: 115, levelMaxPlayTime: 115, isSpPrepare: false, isBoss: false, isHidden: false, bossTemplates: null, bossOvertimeAfter: null};
      mode.combatTimeLimit[r] = 115;
      mode.enemyScale[r] = {...base, hp: rounded(base.hp * mul.hp), atk: rounded(base.atk * mul.atk),kHp:(base.kHp||0)+mul.kHp,kAtk:(base.kAtk||0)+mul.kAtk};
    }
    mode.lastRound = mode.bossRound = total;
    mode.hiddenRound = total + 1;
    mode.rounds[total] = bossCfg;
    mode.rounds[total + 1] = hiddenCfg;
    mode.enemyScale[total] = {...bossScale,hp:rounded(bossScale.hp*bosses.escort),atk:rounded(bossScale.atk*bosses.attack)};
    mode.enemyScale[total + 1] = {...hiddenScale,hp:rounded(hiddenScale.hp*bosses.escort),atk:rounded(hiddenScale.atk*bosses.attack)};
    // Boss parts retain their original HP scaling; only ordinary escorts receive the new escort multiplier.
    mode.rounds[total].extensionBossPartHp=bossScale.hp;
    mode.rounds[total+1].extensionBossPartHp=hiddenScale.hp;
    mode.combatTimeLimit[total] = mode.combatTimeLimit[total + 1] = null;
    mode.testRoundExtension = {version:2,baselineBossRound: boss, baselineHiddenRound: hidden, baselineMaxLevelCnt: 15, extra,preferredFly:EXTENSION_FLY.slice(0,extra)};
    mode.bossHpScale = {...mode.bossHpScale, testMultiplier:bosses.main,testMainMultiplier:bosses.main,testHiddenMultiplier:bosses.hidden};
    // Explicit schedules prevent a late draft from falling back to an unintended equipment pool.
    const schedule=data.choices.schedule[modeId];
    for(const r of EXTENSION_DECISIONS[total]){
      if(r>=total)continue;
      mode.spRounds=[...new Set([...(mode.spRounds||[]),r])].sort((a,b)=>a-b);
      mode.rounds[r].isSpPrepare=true;
      const tactic=r===20||r===28;
      schedule.spRounds=[...mode.spRounds];
      schedule.rounds[r]={families:[{family:tactic?'tactic':'supply',weight:1}],cards:mode.type==='SINGLE'?3:6,supplyTiers:[4,6],extensionDecision:true,combatGearOnly:true,
        tacticIds:tactic?data.choices.cards.tactic.filter(c=>c.kind==='ally'&&data.effects[c.effectId]?.buffs?.length&&data.effects[c.effectId].buffs.every(b=>['global_special_choice_gain_equip','global_special_choice_gain_coin','global_special_choice_refresh_free','single_special_choice_gain_bond_chess','global_special_choice_bond_addlayer'].includes(b.key))).map(c=>c.effectId):undefined};
      if(!tactic)delete schedule.rounds[r].tacticIds;
    }
  }
  data.config.constants.maxLevelCnt = total + 1;
  data.factions.generation.maxLevelCnt = total + 1;
}

export function extraShopSlot(data) {
  for (const mode of Object.values(data.config.modes)) {
    if (!['SINGLE', 'MULTI'].includes(mode.type)) continue;
    for (const slots of Object.values(mode.shopSlots)) slots.chess++;
  }
}

export function largerCoopPool(data) {
  for (const tier of Object.keys(data.config.economy.poolCopies)) {
    data.config.economy.poolCopies[tier] = Math.ceil(data.config.economy.poolCopies[tier] * 1.5);
  }
  for (const id of Object.keys(data.config.economy.poolCopiesOverrides || {})) {
    data.config.economy.poolCopiesOverrides[id] = Math.ceil(data.config.economy.poolCopiesOverrides[id] * 1.5);
  }
}
