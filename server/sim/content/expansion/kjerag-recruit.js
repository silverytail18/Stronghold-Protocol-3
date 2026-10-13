import {RECRUIT} from './kjerag-data.js';
import {PHASE} from '../../../../shared/constants.js';
const key=(tier,part)=>`exp:kjerag:recruit:${tier}:${part}`;
export const isKjeragRecruitOffer=offer=>offer?.source===RECRUIT;
function held(ps){return new Set([...ps.board.values(),...ps.hand,...ps.temp].filter(p=>p?.kind==='chess').map(p=>ps.gd.baseIdOf(p.id)));}
export function validRecruitChoice(ps,offer,id){
  const c=ps.gd.chess(id),base=ps.gd.baseIdOf(id);
  return ps.bandId===RECRUIT&&ps.gd.band(RECRUIT)&&[3,4].includes(offer?.recruitTier)&&!ps.counters[key(offer.recruitTier,'claimed')]&&c?.visible&&!c.isGolden&&c.tier<=offer.recruitTier&&c.bonds?.includes('kjeragShip')&&!held(ps).has(base)&&ps.m.pool.has(base)&&ps.m.pool.left(base)>0;
}
export function syncKjeragRecruit(ps){
  if(ps.bandId!==RECRUIT||!ps.gd.band(RECRUIT)||!ps.alive)return;
  for(const tier of [3,4])if(ps.shop.level>=tier)ps.counters[key(tier,'unlocked')]=1;
  const done=[3,4].filter(t=>ps.counters[key(t,'claimed')]).length;
  const ref={id:'exp:progress:kjerag_recruit',name:'山路招募',desc:`免费招募已领取 ${done}/2；3级最高3阶、4级最高4阶。未领取机会跨回合保留；没有候选时等待后续休整。`,iconKind:'band',iconId:RECRUIT,counter:done,battle:false};
  const existing=ps.effects.find(e=>e.id===ref.id);if(existing)Object.assign(existing,ref);else ps.effects.push(ref);ps.dirty();
  if(ps.m.phase!==PHASE.PREP||ps.offers.some(isKjeragRecruitOffer))return;
  for(const tier of [3,4]){
    if(!ps.counters[key(tier,'unlocked')]||ps.counters[key(tier,'claimed')])continue;
    const ids=[],offer={recruitTier:tier};
    for(let n=0;n<3;n++){const id=ps.m.pool.roll(ps.m.rngMeta,{maxTier:tier,filter:id=>!ids.includes(id)&&validRecruitChoice(ps,offer,id)});if(!id)break;ids.push(id);}
    if(!ids.length)continue;
    const pending=ps.pushRewardOffer(RECRUIT,{ids,tier,label:`山路招募 · ${tier}级机会（最高${tier}阶）`});
    pending.recruitTier=tier;for(const slot of pending.slots)slot.price=0;
    return; // The next offer is drawn after the first acquisition has changed the owned roster.
  }
}
export function claimKjeragRecruit(ps,offer){ps.counters[key(offer.recruitTier,'claimed')]=1;}
export function refreshKjeragRecruit(ps,offer){const i=ps.offers.indexOf(offer);if(i>=0)ps.offers.splice(i,1);syncKjeragRecruit(ps);ps.dirty();}
