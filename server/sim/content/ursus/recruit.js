import {MARKET,CORE} from './data.js';
import {PHASE} from '../../../../shared/constants.js';
const key=(tier,part)=>`ur:market:${tier}:${part}`;
export const isUrsusRecruitOffer=o=>o?.source===MARKET;
const held=ps=>new Set([...ps.board.values(),...ps.hand,...ps.temp].filter(p=>p?.kind==='chess').map(p=>ps.gd.baseIdOf(p.id)));
function available(ps,t){return Object.keys(ps.gd.raw.chess).filter(id=>{const c=ps.gd.chess(id);return c?.visible&&!c.isGolden&&!c.isHidden&&!c.isDiy&&c.tier<=t&&c.bonds.includes(CORE)&&ps.m.pool.has(id)&&ps.m.pool.left(id)>0;});}
export function validUrsusChoice(ps,o,id){const all=available(ps,o?.recruitTier),owned=held(ps),fresh=all.filter(id=>!owned.has(ps.gd.baseIdOf(id)));return ps.bandId===MARKET&&!!ps.gd.band(MARKET)&&[2,4].includes(o?.recruitTier)&&!ps.counters[key(o.recruitTier,'claimed')]&&(fresh.length?fresh:all).includes(id);}
export function syncUrsusRecruit(ps){
 if(ps.bandId!==MARKET||!ps.gd.band(MARKET)||!ps.alive)return;
 for(const t of [2,4])if(ps.shop.level>=t)ps.counters[key(t,'unlocked')]=1;
 if(ps.m.phase!==PHASE.PREP||ps.offers.some(isUrsusRecruitOffer))return;
 for(const t of [2,4]){if(!ps.counters[key(t,'unlocked')]||ps.counters[key(t,'claimed')])continue;
  const all=available(ps,t),owned=held(ps),fresh=all.filter(id=>!owned.has(ps.gd.baseIdOf(id))),candidates=fresh.length?fresh:all,ids=[];
  for(let n=0;n<3;n++){const id=ps.m.pool.roll(ps.m.rngMeta,{maxTier:t,filter:id=>candidates.includes(id)&&!ids.includes(id)});if(!id)break;ids.push(id);}
  if(!ids.length)continue;const o=ps.pushRewardOffer(MARKET,{ids,tier:t,label:`共同点名·${t}级机会（最高${t}阶）`});o.recruitTier=t;for(const s of o.slots)s.price=0;ps.dirty();return;
 }
}
export const claimUrsusRecruit=(ps,o)=>{ps.counters[key(o.recruitTier,'claimed')]=1;};
export function refreshUrsusRecruit(ps,o){const i=ps.offers.indexOf(o);if(i>=0)ps.offers.splice(i,1);syncUrsusRecruit(ps);ps.dirty();}
