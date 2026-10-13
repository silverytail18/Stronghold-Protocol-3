import {THERESA,CORE} from './data.js';
import {PHASE} from '../../../../shared/constants.js';
export const RECRUIT_ROUNDS=[3,5];
const key=(n,p)=>`kz:roundRecruit:${n}:${p}`;
export const isKazdelRecruitOffer=o=>o?.source===THERESA&&RECRUIT_ROUNDS.includes(o.kazdelRound);
const eligible=ps=>ps.bandId===THERESA&&!!ps.gd.band(THERESA)&&ps.alive;
export function validKazdelChoice(ps,offer,id){const c=ps.gd.chess(id);return eligible(ps)&&RECRUIT_ROUNDS.includes(offer.kazdelRound)&&ps.counters[key(offer.kazdelRound,'unlocked')]&&!ps.counters[key(offer.kazdelRound,'claimed')]&&c?.visible&&!c.isGolden&&c.bonds?.includes(CORE)&&c.tier<=offer.kazdelMaxTier&&ps.m.pool.has(c.baseId)&&ps.m.pool.left(c.baseId)>0;}
export function kazdelRecruitPending(ps){if(!eligible(ps))return[];return RECRUIT_ROUNDS.filter(n=>ps.counters[key(n,'unlocked')]&&!ps.counters[key(n,'claimed')]).map(round=>({round,maxTier:ps.counters[key(round,'maxTier')]||null,hasOffer:ps.offers.some(o=>isKazdelRecruitOffer(o)&&o.kazdelRound===round)}));}
export function syncKazdelRecruit(ps){
 if(!eligible(ps))return;
 for(const n of RECRUIT_ROUNDS)if(ps.m.round>=n)ps.counters[key(n,'unlocked')]=1;
 if(ps.m.phase!==PHASE.PREP||ps.offers.some(isKazdelRecruitOffer))return;
 for(const n of RECRUIT_ROUNDS){const maxTier=ps.counters[key(n,'maxTier')];if(!ps.counters[key(n,'unlocked')]||ps.counters[key(n,'claimed')]||!maxTier)continue;
  const offer={kazdelRound:n,kazdelMaxTier:maxTier};ps.kazdelRecruitChoices||={};
  const ids=(ps.kazdelRecruitChoices[n]||[]).filter(id=>validKazdelChoice(ps,offer,id));
  while(ids.length<3){const id=ps.m.pool.roll(ps.m.rngMeta,{maxTier,filter:id=>!ids.includes(id)&&validKazdelChoice(ps,offer,id)});if(!id)break;ids.push(id);}
  ps.kazdelRecruitChoices[n]=ids;
  if(!ids.length)continue;
  const pending=Object.assign(ps.pushRewardOffer(THERESA,{ids,tier:maxTier,label:`共生之约 · 第${n}回合（最高${maxTier}阶）`}),offer);
  for(const s of pending.slots||[])s.price=0;
  return;
 }
}
export function openKazdelRecruit(ps,round){
 syncKazdelRecruit(ps);const pending=kazdelRecruitPending(ps).find(v=>v.round===round);
 if(!pending||ps.m.phase!==PHASE.PREP||ps.ready||ps.offers.some(isKazdelRecruitOffer))return false;
 // Opening captures the tier once; upgrading after seeing choices cannot reroll them.
 ps.counters[key(round,'maxTier')]||=ps.shop.level;syncKazdelRecruit(ps);ps.dirty();return true;
}
export function lockKazdelRecruit(ps){if(!eligible(ps))return;for(const p of kazdelRecruitPending(ps))ps.counters[key(p.round,'maxTier')]||=ps.shop.level;}
export function claimKazdelRecruit(ps,o){ps.counters[key(o.kazdelRound,'claimed')]=1;delete ps.kazdelRecruitChoices?.[o.kazdelRound];}
export function refreshKazdelRecruit(ps,o){const i=ps.offers.indexOf(o);if(i>=0)ps.offers.splice(i,1);syncKazdelRecruit(ps);ps.dirty();}
