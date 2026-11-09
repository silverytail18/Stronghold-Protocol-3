import {CORE,SURVEY,rangeCells,territory,tier} from './ursus-rules.js';
import {attackRangeGrid,loadoutRecord,resolveRecordLoadout} from './loadoutRecord.js';
export const offensiveRecord=c=>!!c&&c.profession!=='MEDIC'&&c.dmgType!=='none'&&(c.dmgType!=='heal'||c.subProfessionId==='guardian');
export const surveyExtension=(piece,rec)=>offensiveRecord(rec)&&(piece.items||[]).some(i=>String(i.id||i).replace(/_[ab]$/,'')===SURVEY)?1:0;
/** Shared prep calculation: permanent deployment geometry only, never a future skill's active range. */
export function boardTerritory(pieces,{getChess=(_id)=>null,getBonds=p=>getChess(p.id)?.bonds||[],getLoadout=(_record)=>null,validCell=(_r,_c)=>true,tierIndex=undefined}={}){
 const members=pieces.filter(p=>p.kind==='chess'&&getBonds(p).includes(CORE));
 const t=tierIndex??tier(new Set(members.map(p=>getChess(p.id)?.baseId||p.id)).size);
 const sources=members.map(p=>{const raw=getChess(p.id),c=loadoutRecord(raw,resolveRecordLoadout(raw,getLoadout(raw)));return offensiveRecord(c)?{family:c.baseId||p.id,cells:rangeCells(attackRangeGrid(c),p.row,p.col,p.dir,{extend:surveyExtension(p,c)})}:null;}).filter(Boolean);
 return {...territory(sources,t,{validCell}),tier:t};
}
