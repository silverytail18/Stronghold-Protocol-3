import {MARKET,CORE} from './data.js';
import {PHASE} from '../../../../shared/constants.js';
const key=(tier,part)=>`hg:market:${tier}:${part}`;
export const isHigashiRecruitOffer=o=>o?.source===MARKET;
const held=ps=>new Set([...ps.board.values(),...ps.hand,...ps.temp].filter(p=>p?.kind==='chess').map(p=>ps.gd.baseIdOf(p.id)));
export function validHigashiChoice(ps,o,id){const c=ps.gd.chess(id),base=ps.gd.baseIdOf(id);return ps.bandId===MARKET&&ps.gd.band(MARKET)&&[2,4].includes(o?.recruitTier)&&!ps.counters[key(o.recruitTier,'claimed')]&&c?.visible&&!c.isGolden&&!c.isHidden&&!c.isDiy&&c.tier<=o.recruitTier&&c.bonds.includes(CORE)&&!held(ps).has(base)&&ps.m.pool.has(base)&&ps.m.pool.left(base)>0;}
export function syncHigashiRecruit(ps){if(ps.bandId!==MARKET||!ps.gd.band(MARKET)||!ps.alive)return;for(const tier of [2,4])if(ps.shop.level>=tier)ps.counters[key(tier,'unlocked')]=1;
 if(ps.m.phase!==PHASE.PREP||ps.offers.some(isHigashiRecruitOffer))return;
 for(const tier of [2,4]){if(!ps.counters[key(tier,'unlocked')]||ps.counters[key(tier,'claimed')])continue;const ids=[],offer={recruitTier:tier};for(let n=0;n<3;n++){const owned=[...held(ps)].map(id=>ps.gd.chess(id)).filter(Boolean),needBlock=!owned.some(c=>c.position==='MELEE'&&c.stats?.blockCnt>=2),needAir=!owned.some(c=>c.canHitFly);const filter=id=>!ids.includes(id)&&validHigashiChoice(ps,offer,id);let id=null;if(tier===2&&n===0&&(needBlock||needAir))id=ps.m.pool.roll(ps.m.rngMeta,{maxTier:tier,filter:id=>{const c=ps.gd.chess(id);return filter(id)&&(needBlock&&c.position==='MELEE'&&c.stats?.blockCnt>=2||needAir&&c.canHitFly);}});if(!id)id=ps.m.pool.roll(ps.m.rngMeta,{maxTier:tier,filter});if(!id)break;ids.push(id);}if(!ids.length)continue;const o=ps.pushRewardOffer(MARKET,{ids,tier,label:`町巷联络·${tier}级机会（最高${tier}阶）`});o.recruitTier=tier;for(const s of o.slots)s.price=0;ps.dirty();return;}
}
export const claimHigashiRecruit=(ps,o)=>{ps.counters[key(o.recruitTier,'claimed')]=1;};
export function refreshHigashiRecruit(ps,o){const i=ps.offers.indexOf(o);if(i>=0)ps.offers.splice(i,1);syncHigashiRecruit(ps);ps.dirty();}
