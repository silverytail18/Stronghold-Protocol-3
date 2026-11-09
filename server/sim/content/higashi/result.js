import {isHigashiResult} from '../../../../shared/higashi-wire.js';
import {CORE} from './data.js';
import {G} from '../../../../shared/higashi-rules.js';
export function sanitizeHigashiResult(input,p,gd){
 if(!gd?.bond(CORE)||!isHigashiResult(p?.higashi))return {};
 const tier=Math.max(1,Math.min(3,input.bonds?.[CORE]?.tier||1)),result=structuredClone(p.higashi),units=(input.units||[]).filter(u=>u.kind!=='token'),uids=new Set(units.map(u=>String(u.uid))),ids=new Set(units.map(u=>gd.baseIdOf(u.chessId)));
 result.points=Object.fromEntries(Object.entries(result.points).filter(([id])=>ids.has(id)).map(([id,n])=>[id,Math.min(n,units.some(u=>gd.baseIdOf(u.chessId)===id&&gd.chess(u.chessId)?.isGolden)?8:6)]));
 result.personal=Math.min(G.teamPersonalCapsByTier[tier-1],Object.values(result.points).reduce((n,v)=>n+v,0));
 result.performance=Math.min(result.performance,G.performanceCapsByTier[tier-1],Math.min(G.parryCapsByTier[tier-1],Math.floor((result.metrics.parries||0)/G.parriesPerLayer))+Math.min(G.releaseCapsByTier[tier-1],(result.metrics.effectiveReleases||0)*G.layersPerEffectiveRelease));
 for(const k of ['units','native'])result.carry[k]=Object.fromEntries(Object.entries(result.carry[k]||{}).filter(([uid])=>uids.has(uid)));
 result.carry.releaseUsers=Object.fromEntries(Object.entries(result.carry.releaseUsers).map(([serial,names])=>[serial,names.filter(id=>ids.has(id))]));
 if(tier<2){result.carry.ultimate=0;result.carry.ultimatePending=null;}else if(result.carry.ultimatePending?.tier>tier)result.carry.ultimatePending=null;
 result.carry.families=Object.fromEntries(Object.entries(result.carry.families||{}).filter(([id])=>ids.has(id)));
 if(!input.bonds?.[CORE]?.active){result.personal=0;result.performance=0;result.points={};result.carry.Q=0;result.carry.ultimate=0;result.carry.ultimatePending=null;}
 return {higashi:result};
}
