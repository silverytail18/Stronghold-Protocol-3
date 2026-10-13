import {NIAN,LING,SHU,AGLNA2,SUI} from './expansion-data.js';
import {CROISSANT,SORA,PENGUIN} from './penguin-data.js';
import {PENGUIN_BALANCE as P} from './penguin-balance.js';
function board(ctx){return ctx.board().filter(p=>p.kind==='chess').map(p=>({p,c:ctx.gd.chess(p.id)})).filter(e=>e.c);}
function distinct(entries){const m=new Map();for(const e of entries){const id=e.c.baseId||e.p.id;if(!m.has(id)||e.c.isGolden)m.set(id,e);}return [...m.values()];}
const byBond=(es,id)=>es.filter(e=>e.c.bonds?.includes(id));
const professions=es=>new Set(es.map(e=>e.c.profession));
function progress(ctx,id,name,desc,counter){ctx.addEffect({id:`exp:progress:${id}`,name,desc,iconKind:'band',iconId:ctx.bandId(),counter,battle:false});}
function nianProgress(ctx){progress(ctx,'nian','锻造筹备',`本回合首次主动刷新${ctx.counter('exp:band:nian:refresh')===ctx.round?'已使用':'尚可使用'}；合成奖励已领取 ${ctx.counter('exp:band:nian:total')}/6 回合。`,ctx.counter('exp:band:nian:total'));}
function bisonProgress(ctx){progress(ctx,'bison','护送排班',`购买、刷新与商店升级累计支出：${ctx.counter('exp:band:bison:spent')}资金。可颂奖励需${P.bisonFirstSpend}资金、2级商店（${ctx.counter('exp:band:bison:12')?'已领取':'待领取'}）；空奖励需${P.bisonSecondSpend}资金、3级商店（${ctx.counter('exp:band:bison:24')?'已领取':'待领取'}）。`,ctx.counter('exp:band:bison:spent'));}
function liangProgress(ctx){progress(ctx,'liang','统筹诸职',`下回合资金奖励已领取 ${ctx.counter('exp:band:liang:gold')}/4 次；免费刷新奖励已领取 ${ctx.counter('exp:band:liang:refresh')}/4 次，待发放 ${ctx.counter('exp:band:liang:pending')}。`,ctx.counter('exp:band:liang:gold')+ctx.counter('exp:band:liang:refresh'));}
function adjacent(es,sources,id){return es.some(e=>e.c.baseId!==id&&e.c.bonds?.includes('skillfulShip')&&sources.some(s=>Math.abs(s.p.row-e.p.row)+Math.abs(s.p.col-e.p.col)===1));}
export function registerMeta(reg){
  for(const key of ['exp_nian_growth','exp_ling_growth','exp_shu_growth','exp_aglna2_growth'])reg.garrison(key,{onPrepEnd(){}});
  reg.global('expansion_growth',{
    onMerge(ctx,ev){if(!ctx.gd.chess(NIAN)||ev.kind!=='chess'||!ev.piece||!ctx.gd.chess(ev.piece.id)?.isGolden)return;if(board(ctx).some(e=>e.c.baseId===NIAN))ctx.setCounter('exp:nian:eligible',ctx.round);},
    onPrepEnd(ctx){
      if(!ctx.gd.chess(NIAN)||ctx.counter('exp:growth:round')===ctx.round)return;
      const all=board(ctx),es=distinct(all),find=id=>es.find(e=>e.c.baseId===id),sui=byBond(es,SUI),rewards=new Map();
      const give=(id,n)=>{if(ctx.bondActive(id)&&n>0)rewards.set(id,(rewards.get(id)||0)+n);};
      const nian=find(NIAN),ling=find(LING),shu=find(SHU);
      if(nian&&ctx.counter('exp:nian:eligible')===ctx.round){if(ctx.bondActive(SUI))give(SUI,nian.c.isGolden?6:3);else give('steadShip',nian.c.isGolden?4:2);}
      if(ling)give(SUI,Math.min(ling.c.isGolden?8:4,Math.max(0,sui.length-1)*(ling.c.isGolden?2:1)));
      if(shu){if(professions(es).size>=3)give(SUI,shu.c.isGolden?4:2);if(es.filter(e=>e.c.profession==='TANK').length>=3)give('steadShip',shu.c.isGolden?2:1);}
      ctx.setCounter('exp:growth:round',ctx.round);for(const[id,n]of rewards)ctx.addLayers(id,n,{requireActive:true,reason:'expansion:prepEnd'});
    }
  });
  // The moved operator retains her original traits even when the Sui batch is disabled.
  reg.global('exp_angelina_growth',{
    onPrepEnd(ctx){
      if(!ctx.gd.chess(AGLNA2)||ctx.counter('exp:angelina:growth:round')===ctx.round)return;
      ctx.setCounter('exp:angelina:growth:round',ctx.round);
      const all=board(ctx),es=distinct(all),agl=es.find(e=>e.c.baseId===AGLNA2);if(!agl)return;
      const syr=byBond(es,'siracusaShip');
      if(ctx.bondActive('siracusaShip')&&syr.length>=3&&professions(syr).size>=3)ctx.addLayers('siracusaShip',agl.c.isGolden?4:2,{requireActive:true,reason:'expansion:prepEnd'});
      if(ctx.bondActive('skillfulShip')&&adjacent(all,all.filter(e=>e.c.baseId===AGLNA2),AGLNA2))ctx.addLayers('skillfulShip',agl.c.isGolden?2:1,{requireActive:true,reason:'expansion:prepEnd'});
    }
  });
  reg.band('band_exp_nian',{
    onPrepStart:nianProgress,
    onRefresh(ctx){if(!ctx.gd.chess(NIAN)||ctx.counter('exp:band:nian:refresh')===ctx.round)return;ctx.setCounter('exp:band:nian:refresh',ctx.round);
      const slots=ctx.shopSlots(),at=slots.findIndex(s=>s?.kind==='chess'&&!s.sold);if(at<0)return;
      const id=ctx.rollChess({bond:SUI,maxTier:ctx.shopLevel()})||ctx.rollChess({bond:'yanShip',maxTier:ctx.shopLevel()});if(id)ctx.setShopSlot(at,{kind:'chess',id});nianProgress(ctx);
    },
    onMerge(ctx,ev){if(!ctx.gd.chess(NIAN)||ev.kind!=='chess'||!ctx.gd.chess(ev.piece?.id)?.isGolden||ctx.counter('exp:band:nian:merge')===ctx.round||ctx.counter('exp:band:nian:total')>=6||ctx.gd.modeInactiveBonds.has(SUI))return;ctx.setCounter('exp:band:nian:merge',ctx.round);ctx.incCounter('exp:band:nian:total');ctx.addLayers(SUI,2,{requireActive:false,reason:'band_exp_nian'});nianProgress(ctx);}
  });
  function bison(ctx){
    for(const [threshold,tier,wanted,milestone]of [[P.bisonFirstSpend,2,CROISSANT,12],[P.bisonSecondSpend,3,SORA,24]]){
      const key=`exp:band:bison:${milestone}`;if(ctx.counter(key)||ctx.counter('exp:band:bison:spent')<threshold||ctx.shopLevel()<tier)continue;
      ctx.setCounter(key,1); // Mark before gain hooks can re-enter.
      const choose=ctx.rollChess({bond:PENGUIN,maxTier:tier,filter:id=>id===wanted})||ctx.rollChess({bond:PENGUIN,maxTier:tier});
      if(!choose||!ctx.grantChess(choose,{requirePool:true,fromPool:true,source:'band_exp_bison'}))ctx.grantFreeRefresh(1);
    }
    bisonProgress(ctx);
  }
  reg.band('band_exp_bison',{
    onSpend(ctx,ev){if(!ctx.gd.chess(NIAN)||!(ev.amount>0)||!['buy','refresh','levelUp'].includes(ev.reason))return;ctx.incCounter('exp:band:bison:spent',ev.amount);bison(ctx);},
    onLevelUp:bison,onPrepStart:bison
  });
  reg.band('band_exp_liangxun',{
    onPrepEnd(ctx){if(!ctx.gd.chess(NIAN)||ctx.round>=ctx.gd.lastRound||ctx.counter('exp:band:liang:round')===ctx.round)return;ctx.setCounter('exp:band:liang:round',ctx.round);
      const es=distinct(board(ctx)),counts=new Map();for(const e of es)counts.set(e.c.profession,(counts.get(e.c.profession)||0)+1);
      if(counts.size>=3&&ctx.counter('exp:band:liang:gold')<4){ctx.incCounter('exp:band:liang:gold');ctx.addPendingFunds(1);}
      if([...counts.values()].some(n=>n>=3)&&ctx.counter('exp:band:liang:refresh')<4){ctx.incCounter('exp:band:liang:refresh');ctx.incCounter('exp:band:liang:pending');}
      liangProgress(ctx);
    },
    onPrepStart:liangProgress,
    onRoundStart(ctx){const n=ctx.counter('exp:band:liang:pending');if(n){ctx.setCounter('exp:band:liang:pending',0);ctx.grantFreeRefresh(n);}liangProgress(ctx);}
  });
}
