import {CROISSANT,SORA,PENGUIN} from './penguin-data.js';
import {PENGUIN_BALANCE as P,isPenguinCombatGear} from './penguin-balance.js';
import {isShopItem} from '../../simdata.js';
const COUNTER='c1:penguin:growth:round';
export function registerMeta(registry){
  // Descriptive garrisons route through the one snapshot-based global settlement, not per-copy dispatch.
  registry.garrison('c1_croissant_growth',{onPrepEnd(){}});
  registry.garrison('c1_sora_growth',{onPrepEnd(){}});
  registry.global('c1_penguin_growth',{
    onPrepEnd(ctx){
      if(!ctx.gd.chess(CROISSANT)||ctx.counter(COUNTER)===ctx.round)return;
      const board=ctx.board().filter(p=>p.kind==='chess').map(p=>({piece:p,rec:ctx.gd.chess(p.id)})).filter(p=>p.rec);
      const families=new Map();
      for(const entry of board){const key=entry.rec.baseId||entry.piece.id;const old=families.get(key);if(!old||entry.rec.isGolden)families.set(key,entry);}
      const members=[...families.values()].filter(e=>e.rec.bonds?.includes(PENGUIN));
      const penguinActive=ctx.bondActive(PENGUIN),skillfulActive=ctx.bondActive('skillfulShip');
      let penguin=penguinActive&&members.length>=2?P.growth[members.length>=4?1:0]:0,skillful=0;
      const cro=families.get(CROISSANT),sora=families.get(SORA);
      const gearedFamilies=new Set(board.filter(e=>e.rec.bonds?.includes(PENGUIN)&&(e.piece.items||[]).some(it=>ctx.gd.item(it.id))).map(e=>e.rec.baseId||e.piece.id));
      if(cro&&penguinActive&&gearedFamilies.size>=1)penguin+=cro.rec.isGolden?P.croissantElite:P.croissantNormal;
      if(sora){
        if(penguinActive&&members.length>=2)penguin+=sora.rec.isGolden?P.soraElite:P.soraNormal;
        const sources=board.filter(e=>e.rec.baseId===SORA);
        const adjacent=board.some(e=>e.rec.baseId!==SORA&&e.rec.bonds?.includes('skillfulShip')&&sources.some(s=>Math.abs(s.piece.row-e.piece.row)+Math.abs(s.piece.col-e.piece.col)===1));
        if(skillfulActive&&adjacent)skillful+=sora.rec.isGolden?2:1;
      }
      // Mark before addLayers: nested effects cannot re-enter and issue the same reward twice.
      ctx.setCounter(COUNTER,ctx.round);
      if(penguin)ctx.addLayers(PENGUIN,penguin,{requireActive:true,reason:'c1:penguin:prepEnd'});
      if(skillful)ctx.addLayers('skillfulShip',skillful,{requireActive:true,reason:'c1:sora:prepEnd'});
    }
  });
}

// Only called at the PREP boundary, after existing entry effects and recomputation.
export function settlePenguinSupply(ctx){
  if(!ctx.alive()||!ctx.gd.raw.bonds?.[PENGUIN]||!ctx.bondActive(PENGUIN))return;
  const roundKey='exp:penguin:supply:round';
  if(ctx.counter(roundKey)===ctx.round)return;
  ctx.setCounter(roundKey,ctx.round);
  const count=ctx.bondCount(PENGUIN),done=ctx.counter('exp:penguin:supply:claimed');
  if(count>=2&&done<P.milestones.length&&ctx.layers(PENGUIN)>=P.milestones[done]){
    const advanced=count>=4;
    const pool=Object.entries(ctx.gd.raw.items||{}).filter(([,it])=>isShopItem(it)&&isPenguinCombatGear(it)&&it.tier>=1&&it.tier<=Math.min(P.maxGearTier,ctx.shopLevel())&&(!advanced||ctx.gd.item(it.goldenId)?.isGolden));
    pool.sort(([a],[b])=>a.localeCompare(b,'en'));
    if(pool.length){
      const [id,rec]=pool[Math.floor(ctx.rng()*pool.length)];
      ctx.setCounter('exp:penguin:supply:claimed',done+1);
      if(!ctx.grantItem(advanced?rec.goldenId:id,{source:'penguin:supply'}))ctx.setCounter('exp:penguin:supply:claimed',done);
    }
  }
  const claimed=ctx.counter('exp:penguin:supply:claimed');
  ctx.addEffect({id:'exp:penguin:supply',name:'企鹅物流 · 装备补给',desc:'已领取'+claimed+'/3件；'+(claimed<3?'下一里程'+P.milestones[claimed]+'层。':'本局补给已全部领取。')+'开始休整时按当前人数发放，2—3人普通、4人进阶，每次最多一件。',iconKind:'bond',iconId:PENGUIN,counter:claimed,battle:false});
}
