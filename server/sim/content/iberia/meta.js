import {CORE,VOYAGE,tier} from '../../../../shared/iberia-rules.js';
import {metaBonds} from '../support/meta.js';
export function registerMeta(reg){reg.global('iberia_meta',{
 onPrepEnd(ctx){if(!ctx.gd.bond(CORE)||ctx.counter('ib:prep')===ctx.round)return;ctx.setCounter('ib:prep',ctx.round);if(ctx.bondActive(CORE))ctx.addLayers(CORE,[0,2,4,6][tier(ctx.bondCount(CORE))],{requireActive:true,reason:'iberia:prep'});
  const board=ctx.board().filter(p=>p.kind==='chess'),remote=new Set(board.filter(p=>metaBonds(ctx,p).includes(CORE)&&ctx.chessRecord(p.id)?.position==='RANGED').map(p=>ctx.gd.baseIdOf(p.id)));
  const elysms=board.filter(p=>ctx.chessRecord(p.id)?.charId==='char_401_elysm');if(remote.size>=2&&elysms.length){const n=elysms.some(p=>ctx.chessRecord(p.id).isGolden)?2:1;for(const bond of[CORE,'visiShip'])ctx.addLayers(bond,n,{requireActive:true,reason:'iberia:elysm'});}
 },
 onRefresh(ctx){if(!ctx.gd.bond(CORE)||ctx.bandId()!==VOYAGE||ctx.counter('ib:refresh')===ctx.round)return;ctx.setCounter('ib:refresh',ctx.round);const slots=ctx.shopSlots();if(slots.some(s=>s?.kind==='chess'&&ctx.chessRecord(s.id)?.bonds.includes(CORE)))return;const i=slots.findIndex(s=>s?.kind==='chess'&&!s.sold);if(i<0)return;const id=ctx.rollChess({bond:CORE,maxTier:ctx.shopLevel()});if(id)ctx.setShopSlot(i,{kind:'chess',id});},
 onBattleStart(ctx,ev){if(!ctx.gd.bond(CORE))return;ev.input.contentInfo||={};if(ev.kind==='unite'&&ev.input.iberiaCarry){ev.input.contentInfo.iberiaCarry=ev.input.iberiaCarry;delete ev.input.iberiaCarry;}}
});}
