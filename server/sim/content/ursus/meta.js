import {CORE} from './data.js';
export function registerMeta(reg){reg.global('ursus_meta',{
 onPrepEnd(ctx){if(!ctx.gd.bond(CORE)||!ctx.bondActive(CORE)||ctx.counter('ur:prep')===ctx.round)return;ctx.setCounter('ur:prep',ctx.round);ctx.addLayers(CORE,ctx.ursusDomain().area,{requireActive:true,reason:'ursus:coverage'});},
 onBattleStart(ctx,ev){if(!ctx.gd.bond(CORE))return;ev.input.contentInfo||={};ev.input.contentInfo.ursusPreview=!!ev.preview;if(ev.input.ursusCarry){ev.input.contentInfo.ursusCarry=ev.input.ursusCarry;delete ev.input.ursusCarry;}},
 onPrepStart(ctx){ctx.syncUrsusRecruit();},onLevelUp(ctx){ctx.syncUrsusRecruit();},onGain(ctx){ctx.syncUrsusRecruit();}
});}
