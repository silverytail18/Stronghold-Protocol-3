import {CORE} from './data.js';
import {G} from '../../../../shared/higashi-rules.js';
export function registerMeta(reg){reg.global('higashi_meta',{
 onBattleStart(ctx,ev){if(!ctx.gd.bond(CORE))return;ev.input.contentInfo||={};ev.input.contentInfo.higashiPreview=!!ev.preview;if(ev.input.higashiCarry){ev.input.contentInfo.higashiCarry=ev.input.higashiCarry;delete ev.input.higashiCarry;}},
 onPrepEnd(ctx){if(!ctx.gd.bond(CORE)||ctx.counter('hg:prep')===ctx.round)return;ctx.setCounter('hg:prep',ctx.round);if(ctx.bondActive(CORE))ctx.addLayers(CORE,G.restByTier[Math.min(3,ctx.bond(CORE).tier||1)-1],{requireActive:true,reason:'higashi:base'});},
 onBattleResult(ctx,ev){if(ev.boss||!ctx.gd.bond(CORE)||ctx.counter('hg:result')===ctx.round)return;ctx.setCounter('hg:result',ctx.round);const p=ev.result?.higashi;if(p&&ctx.bondActive(CORE))ctx.addLayers(CORE,Math.min(G.teamPersonalCapsByTier[Math.min(3,ctx.bond(CORE).tier||1)-1],p.personal||0)+Math.min(G.performanceCapsByTier[Math.min(3,ctx.bond(CORE).tier||1)-1],p.performance||0),{requireActive:true,reason:'higashi:performance'});},
 onPrepStart(ctx){ctx.syncHigashiRecruit();},onLevelUp(ctx){ctx.syncHigashiRecruit();},onGain(ctx){ctx.syncHigashiRecruit();}
});}
