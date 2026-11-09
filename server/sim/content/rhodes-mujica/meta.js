import {RI,GIRL,AMIYA,DOLRIS,AMORIS,MORTIS,TMORIS,OBLVNS,KALTS2} from './data.js';
import {RI_BALANCE as R,OLD_RI_GROWTH as G} from './balance.js';
import {metaBonds} from '../support/meta.js';
const board=ctx=>ctx.board().filter(p=>p.kind==='chess').map(p=>({p,c:ctx.gd.chess(p.id)})).filter(v=>v.c);
const distinct=es=>{const m=new Map();for(const e of es){const id=e.c.baseId||e.p.id;if(!m.has(id)||e.c.isGolden)m.set(id,e);}return[...m.values()];};
const members=(ctx,es,bond)=>es.filter(e=>metaBonds(ctx,e.p).includes(bond));
function progress(ctx,id,name,desc,count){ctx.addEffect({id:'rm:progress:'+id,name,desc,iconKind:'band',iconId:ctx.bandId(),counter:count,battle:false});}
export function registerMeta(reg){
 reg.garrison('rm_personal',{onBattleStart(){}});
 for(const k of ['podenco','amiya','dolris','amoris','mortis','tmoris','oblvns','kalts2','nearl'])reg.garrison('rm_growth_'+k,{onPrepEnd(){}});
 reg.global('rm_growth',{
  onMerge(ctx,ev){if(!ctx.gd.bond(RI)||ev.kind!=='chess'||!ctx.gd.chess(ev.piece?.id)?.isGolden||!metaBonds(ctx,ev.piece).includes(RI))return;if(board(ctx).some(e=>e.c.baseId===AMORIS))ctx.setCounter('rm:amoris:eligible',ctx.round);},
  onPrepEnd(ctx){if(!ctx.gd.bond(RI)||ctx.counter('rm:growth:round')===ctx.round)return;ctx.setCounter('rm:growth:round',ctx.round);if(!ctx.bondActive(RI))return;
   const all=board(ctx),es=distinct(all),rs=members(ctx,es,RI),gs=es.filter(e=>e.c.bonds.includes(GIRL)),profs=new Set(rs.map(e=>e.c.profession));const tier=Math.min(2,Math.max(0,(ctx.bond(RI)?.tier||1)-1));let n=R.growth[tier]+(profs.size>=R.professions[tier]?R.composition[tier]:0);
   for(const e of es){const id=e.c.baseId,v=e.c.isGolden?2:1;
    if(e.c.name==='波登可'&&e.c.bonds.includes(RI))n+=G.prep*v;
    if(id===DOLRIS&&gs.length>=2)n+=v;
    if(id===AMORIS&&(ctx.counter('rm:amoris:eligible')===ctx.round||rs.filter(a=>a.c.isGolden).length>=2))n+=2*v;
    if(id===KALTS2&&rs.some(a=>['WARRIOR','TANK'].includes(a.c.profession)))n+=v;
   }if(n>0)ctx.addLayers(RI,n,{requireActive:true,reason:'rm:prepGrowth'});
  }
 });
 const kaltsitProgress=ctx=>progress(ctx,'kaltsit','行动编组',`开局调派${ctx.counter('rm:kaltsit:start')?'已提供':'待提供'}；3人3职业／6人4职业奖励${ctx.counter('rm:kaltsit:3')?'已领取':'未领取'}/${ctx.counter('rm:kaltsit:6')?'已领取':'未领取'}；第1—6轮首次付费刷新定向罗德岛。`,ctx.counter('rm:kaltsit:3')*4+ctx.counter('rm:kaltsit:6')*8);
 reg.band('band_rm_kaltsit',{
  onPrepStart(ctx){if(ctx.round===1&&!ctx.counter('rm:kaltsit:start')){ctx.setCounter('rm:kaltsit:start',1);const ids=ctx.gd.visibleChess.filter(id=>ctx.gd.tierOf(id)===1&&ctx.gd.chess(id).bonds.includes(RI)&&ctx.rollChess({tier:1,bond:RI,filter:k=>k===id})===id);if(!ids.length||!ctx.offerChess(ids,{source:'band_rm_kaltsit',label:'行动编组：选择预备干员'}))ctx.grantFreeRefresh(1);}kaltsitProgress(ctx);},
  onRefresh(ctx,ev){if(ctx.round>6||ev.free||!(ev.price>0)||ctx.counter('rm:kaltsit:refresh')===ctx.round)return;ctx.setCounter('rm:kaltsit:refresh',ctx.round);const slots=ctx.shopSlots(),idx=slots.findIndex(s=>s?.kind==='chess'&&!s.sold);if(idx>=0){const id=ctx.rollChess({bond:RI,maxTier:ctx.shopLevel()});if(id)ctx.setShopSlot(idx,{kind:'chess',id});}kaltsitProgress(ctx);},
  onPrepEnd(ctx){if(!ctx.bondActive(RI))return;const es=members(ctx,distinct(board(ctx)),RI),jobs=new Set(es.map(e=>e.c.profession));for(const [need,prof,layers]of [[3,3,4],[6,4,8]]){const k='rm:kaltsit:'+need;if(es.length>=need&&jobs.size>=prof&&!ctx.counter(k)){ctx.setCounter(k,1);ctx.addLayers(RI,layers,{requireActive:true,reason:'band_rm_kaltsit'});}}kaltsitProgress(ctx);}
 });
 reg.band('band_rm_closure',{
  onPrepStart(ctx){if([3,7,11].includes(ctx.round)&&!ctx.counter('rm:closure:'+ctx.round)){ctx.setCounter('rm:closure:'+ctx.round,1);const max=Math.min(4,ctx.shopLevel()),ids=[];for(let t=1;t<=max;t++)for(const id of ctx.gd.shopItemsByTier[t]||[])if(!ctx.gd.item(id)?.isGolden)ids.push(id);const pick=ctx.rng.shuffle([...new Set(ids)]).slice(0,3);if(pick.length)ctx.offerItems(pick,{source:'band_rm_closure',label:'战备调配：选择装备'});else ctx.grantFreeRefresh(1);}
   progress(ctx,'closure','战备调配',`第3/7/11轮普通装备三选一；已提供${[3,7,11].filter(r=>ctx.counter('rm:closure:'+r)).length}/3次。至少一件装备物法减伤10%；两件装备物法伤害+12%。`,[3,7,11].filter(r=>ctx.counter('rm:closure:'+r)).length);
  }
 });
}
