import {LIGHTHOUSE} from '../../shared/iberia-lighthouse.js';
export function syncIberiaLighthouse(ps){
 const enabled=!!ps.gd.token(LIGHTHOUSE)&&ps.bonds?.iberiaShip?.active&&ps.bonds.iberiaShip.count>=9;
 const locations=[];for(const[k,p]of ps.board)if(p.id===LIGHTHOUSE)locations.push({area:'board',key:k,p});
 for(const area of ['hand','temp'])for(const[i,p]of ps[area].entries())if(p?.id===LIGHTHOUSE)locations.push({area,idx:i,p});
 const remove=l=>{if(l.area==='board')ps.board.delete(l.key);else ps[l.area][l.idx]=null;};
 if(!enabled){for(const l of locations)remove(l);return;}
 // Keep the placed copy first; reconciliation is idempotent and can never accumulate duplicate structures.
 for(const l of locations.slice(1))remove(l);if(locations.length){locations[0].p.count=1;return;}
 const t=ps.newPiece('token',LIGHTHOUSE,{count:1,meta:{iberiaLighthouse:true}});ps.stow(t,{allowTemp:true});
}
