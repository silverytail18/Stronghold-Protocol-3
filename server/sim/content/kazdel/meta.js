import {CORE,BLOOD} from './data.js';
import {PREP_GROWTH,PERFORMANCE_CAP,BLOOD_PREP,BLOOD_PERFORMANCE_CAP} from './rules.js';
const benefit=(bonds,own)=>own.includes(CORE)||bonds[CORE]?.active&&bonds.maniShip?.active&&own.includes('maniShip');
export function pendingGrowth({round,counters,bonds,board,baseId,pieceBonds}){
 if(round<=1||counters['kz:flowRound']!==round-1)return{core:0,blood:0};
 const seen=new Set();let core=0,blood=0;
 for(const p of board){if(p.kind!=='chess')continue;const id=baseId(p.id),own=pieceBonds(p);
  if(seen.has(id)||!benefit(bonds,own))continue;seen.add(id);
  const n=counters['kz:points:'+id]||0;core+=n;
  if(own.includes(BLOOD)&&counters['kz:blood:'+id])blood+=counters['kz:bloodPoints:'+id]||0;
 }
 const tier=bonds[CORE]?.active?Math.min(3,bonds[CORE].tier||1):0,bt=bonds[BLOOD]?.active?Math.min(2,bonds[BLOOD].tier||1):0;
 return{core:tier?Math.min(PERFORMANCE_CAP[tier-1],PERFORMANCE_CAP[(counters['kz:earningTier']||1)-1],core):0,
  blood:bt?Math.min(BLOOD_PERFORMANCE_CAP[bt-1],BLOOD_PERFORMANCE_CAP[(counters['kz:earningBloodTier']||1)-1],Math.floor(blood*.5)):0};
}
export const pendingForPlayer=ps=>pendingGrowth({round:ps.m.round,counters:ps.counters,bonds:ps.bonds,board:[...ps.board.values()],baseId:id=>ps.gd.baseIdOf(id),pieceBonds:p=>ps.kazdelPieceBonds(p)});
export function registerMeta(reg){
 reg.global('kazdel_growth',{
  onBattleStart(ctx,ev){if(!ctx.gd.bond(CORE))return;ev.input.contentInfo||={};if(ev.input.kazdelFixedCarry){ev.input.contentInfo.kazdelFixedCarry=ev.input.kazdelFixedCarry;delete ev.input.kazdelFixedCarry;}delete ev.input.contentInfo.kazdelDonationIds;if(ev.input.kazdelCarry){ev.input.contentInfo.kazdelCarry=ev.input.kazdelCarry;delete ev.input.kazdelCarry;}},
  onBattleResult(ctx,ev){
   if(!ctx.gd.bond(CORE)||ev.boss||ctx.counter('kz:flowRound')===ctx.round)return;
   ctx.setCounter('kz:flowRound',ctx.round);ctx.setCounter('kz:earningTier',Math.min(3,ctx.bond(CORE)?.tier||1));ctx.setCounter('kz:earningBloodTier',Math.min(2,ctx.bond(BLOOD)?.tier||1));
   for(const id of Object.keys(ctx.data.chess||{}))if(!ctx.data.chess[id].isGolden){ctx.setCounter('kz:points:'+id,0);ctx.setCounter('kz:blood:'+id,0);ctx.setCounter('kz:bloodPoints:'+id,0);}
   for(const [id,f]of Object.entries(ev.result?.kazdelFlow||{})){
    ctx.setCounter('kz:points:'+id,Math.min(10,Math.max(0,f.points||0)));ctx.setCounter('kz:blood:'+id,f.blood?1:0);ctx.setCounter('kz:bloodPoints:'+id,Math.min(8,Math.max(0,f.bloodPoints||0)));
   }
  },
  onPrepEnd(ctx){
   if(!ctx.gd.bond(CORE)||ctx.counter('kz:prepRound')===ctx.round)return;ctx.setCounter('kz:prepRound',ctx.round);
   const extra=pendingGrowth({round:ctx.round,counters:Object.fromEntries(['kz:flowRound','kz:earningTier','kz:earningBloodTier',...ctx.board().flatMap(p=>{const id=ctx.gd.baseIdOf(p.id);return['kz:points:'+id,'kz:blood:'+id,'kz:bloodPoints:'+id];})].map(k=>[k,ctx.counter(k)])),bonds:ctx.bonds(),board:ctx.board(),baseId:id=>ctx.gd.baseIdOf(id),pieceBonds:p=>ctx.pieceBonds(p.uid)});
   if(ctx.bondActive(CORE)){const tier=Math.min(3,ctx.bond(CORE).tier||1);ctx.addLayers(CORE,PREP_GROWTH[tier-1]+extra.core,{requireActive:true,reason:'kz:prepGrowth'});}
   if(ctx.bondActive(BLOOD)){const tier=Math.min(2,ctx.bond(BLOOD).tier||1);ctx.addLayers(BLOOD,BLOOD_PREP[tier-1]+extra.blood,{requireActive:true,reason:'kz:bloodGrowth'});}
  }
 });
}
