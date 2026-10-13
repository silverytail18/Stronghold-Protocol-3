import {RHINE,RHINE_SILENCE,RHINE_SAMPLER,growthBase} from '../../../../shared/rhine.js';
export function registerMeta(reg){
 reg.global('rhine_authority',{
  onBattleStart(ctx,ev){if(ctx.gd.bond(RHINE))ctx.rhine.input(ev.input,{preview:!!ev.preview,kind:ev.kind||'normal'});},
  onBattleResult(ctx,ev){if(ctx.gd.bond(RHINE))ctx.rhine.result(ev.result);},
  onRefresh(ctx,ev){
   if(!ctx.gd.bond(RHINE))return;
   const n=ctx.rhine.refresh(ev);
   if(!ev.free&&ev.price>0&&n===1&&ctx.rhine.canUse('T21'))ctx.rhine.preferRecruit(ev);
  },
  onLayers(ctx){if(ctx.gd.bond(RHINE))ctx.rhine.sync();},
  onPrepEnd(ctx){
   if(!ctx.gd.bond(RHINE)||ctx.counter('rhine:prep')===ctx.round)return;
   ctx.setCounter('rhine:prep',ctx.round);
   if(ctx.bondActive(RHINE))ctx.addLayers(RHINE,growthBase(ctx.bondCount(RHINE)),{requireActive:true,reason:'rhine:base'});
   // Equipment carriers stack; ordinary/advanced copies on one carrier take the higher effect.
   for(const p of ctx.board().filter(p=>p.kind==='chess')){
    const gear=(p.items||[]).map(i=>ctx.gd.item(i.id)).filter(r=>r?.baseId===RHINE_SAMPLER+'_a').sort((a,b)=>Number(b.isGolden)-Number(a.isGolden))[0];
    if(!gear)continue;
    for(const id of ctx.pieceBonds(p.uid))if(ctx.bondActive(id))ctx.addLayers(id,id===RHINE?gear.params.rhineLayers:1,{requireActive:true,reason:'rhine:sampler'});
   }
   ctx.rhine.sync();
  },
  onRoundStart(ctx){if(ctx.gd.bond(RHINE)&&ctx.bandId()===RHINE_SILENCE&&[2,3].includes(ctx.round))ctx.rhine.queueGift(ctx.round);},
  onPrepStart(ctx){
   if(!ctx.gd.bond(RHINE)||ctx.bandId()!==RHINE_SILENCE)return;
   for(const round of ctx.rhine.pendingGifts()){
    const id=ctx.rollChess({maxTier:ctx.shopLevel(),bond:RHINE});
    if(id&&ctx.grantChess(id,{source:'rhine:jointRecruit'})){ctx.rhine.clearGift(round);ctx.rhine.giftDone(round);}
   }
  }
 });
}
