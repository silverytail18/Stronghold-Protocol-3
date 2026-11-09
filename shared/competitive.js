// Emi ac00de2e rules, adapted to immutable local identities and transactional seasons (GPL-3.0-or-later).
import {rankOf, placementPoints, placementTotal, rankDelta, isDominantWin, inactiveRank, RANK_INACTIVITY_MS} from './emi-ranks.js';
import {observeRankProgress} from './rank-pyramid.js';
export const COMPETITIVE_RULES = Object.freeze({kind:'emi',version:1,placementMatches:3,scoreCapRound:15,inactiveDays:5});
export const competitive = rules => rules?.kind === 'emi' && rules?.version === 1;
export const emptyCompetitive = () => ({points:0,placementPlayed:0,placementScore:0,placementDone:false,games:0,wins:0,streak:0,lastScoredAt:0,lastActive:0,pyramid:null});
export function competitiveView(state, globalRank=null, now=Date.now()) {
  const inactive=!!state.placementDone&&state.points>=2100&&now-state.lastScoredAt>=RANK_INACTIVITY_MS;
  const rank=state.placementDone?(inactive?inactiveRank(state.points):rankOf(state.points,globalRank)):{label:'未定级',icon:'unranked',points:0};
  return {...state,rank,globalRank:inactive?null:globalRank,inactive};
}
export function calculateCompetitive(previous, input, now) {
  const state={...emptyCompetitive(),...previous};
  const before=state.points,wasPlacement=!state.placementDone;
  const perf={...input,pointsBefore:before,dominantStreakBefore:state.streak};
  const base=observeRankProgress(state.pyramid,{ranked:state.placementDone,wins:state.wins,points:before,rank:rankOf(before),startedAt:now});
  let detail;
  if(wasPlacement) {
    state.placementPlayed++;
    state.placementScore+=placementPoints(perf);
    state.placementDone=state.placementPlayed>=3;
    if(state.placementDone)state.points=placementTotal(state.placementScore);
    detail={kind:'placement',delta:state.points-before,baseGain:0,shortageBonus:0,skipBonus:0,rawLoss:0};
  } else {
    detail=rankDelta(perf);
    state.points=Math.max(0,state.points+detail.delta);
  }
  const eligible=wasPlacement||(input.alive&&detail.kind==='win');
  state.streak=eligible&&isDominantWin(perf)?state.streak+1:0;
  state.games++;state.wins+=input.win?1:0;state.lastActive=now;
  if(state.points>before)state.lastScoredAt=now;
  state.pyramid=observeRankProgress(base,{ranked:state.placementDone,wins:state.wins,points:state.points,rank:rankOf(state.points),scoreDelta:state.points-before,startedAt:now});
  return {state,receipt:{...detail,before,after:state.points,totalDelta:state.points-before,placementDone:state.placementDone,placementPlayed:state.placementPlayed,placementMatches:3,ruleVersion:1,rankBefore:rankOf(before),rankAfter:state.placementDone?rankOf(state.points):null}};
}
