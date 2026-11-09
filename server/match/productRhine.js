// Authority for research intents and persistent match-only data (DESIGN §6/§8, META §2).
import {PHASE,ERR} from '../../shared/constants.js';
import {RHINE,RHINE_SILENCE,RHINE_KRISTEN,TECH_BY_ID,TECHNOLOGIES,emptyRhineState,clampLayers,qualifies,activePositions,spentPoints,income,positionKey} from '../../shared/rhine.js';
import {computeBonds,pieceBonds,bondSnapshot} from './bondsMeta.js';
import {fieldTile,inField} from './board.js';
const OK={ok:true},fail=detail=>({error:ERR.BAD_TARGET,detail});
export const enabled=ps=>!!ps.gd.bond(RHINE);
export function ensure(ps){return ps.rhineState||=emptyRhineState();}
export function syncRhine(ps){
 if(!enabled(ps))return;
 const st=ensure(ps);st.highestLayers=Math.max(st.highestLayers,clampLayers(ps.layers[RHINE]||0));
 // Milestones are prep roster achievements, never live-combat body counts.
 if(![PHASE.PREP,PHASE.ROUND_START,PHASE.SP_DRAFT,PHASE.BAND_DRAFT,PHASE.BATTLE_CHECK].includes(ps.m.phase))return;
 const n=ps.bonds[RHINE]?.count||0;
 if(n>=10)st.tenReward=true;
 const thresholds=ps.bandId===RHINE_SILENCE?[8]:ps.bandId===RHINE_KRISTEN?[3,6,9]:[];
 for(const need of thresholds){if(n>=need&&!st.milestones.includes(need)){st.milestones.push(need);st.strategyPoints++;}}
}
export function regionTile(ps,p,id){
 if(!Array.isArray(p)||p.length!==2||!inField(...p))return false;
 const stage=ps.gd.stage(ps.m.stageId),field=ps.m.deployFieldOf(ps),[r,c]=fieldTile(field,...p),glyph=stage?.rows?.[r]?.[c],tile=stage?.tiles?.[glyph];
 // Deployment devices can make a tile legal although its original glyph is a wall/water tile.
 // Supporting regions must accept every authoritative deploy-map cell, including platforms/high ground.
 if(['T01','T02','T03','T13'].includes(id)&&ps.deployMap().has(positionKey(p)))return true;
 if(!tile||glyph==='S'||glyph==='E'||p[1]===10&&field!=='normal')return false;
 if(!['LOW','HIGH'].includes(tile.height))return false;
 const key=tile.key||tile.tileKey||'';
 if(/wall|hole|forbidden|invalid/.test(key)||tile.passable==='NONE'&&tile.buildable==='NONE')return false;
 if(id==='T13'&&!ps.deployMap().has(positionKey(p)))return false;
 return true;
}
export function legalPositions(ps,id,positions){
 if(!Array.isArray(positions)||positions.length>2)return false;
 if(positions.some(p=>!regionTile(ps,p,id)))return false;
 const keys=positions.map(positionKey);if(new Set(keys).size!==keys.length)return false;
 for(const[other,tiles]of Object.entries(ensure(ps).positions))if(other!==id&&tiles.some(p=>keys.includes(positionKey(p))))return false;
 return true;
}
function canEdit(ps){return enabled(ps)&&ps.m.phase===PHASE.PREP&&ps.alive&&!ps.ready&&!ps.autoplay;}
export function rhineIntent(ps,msg){
 if(!canEdit(ps))return {error:ERR.WRONG_PHASE,detail:'仅本人可操作的休整阶段允许修改科技'};
 syncRhine(ps);const st=ensure(ps),n=ps.bonds[RHINE]?.active?ps.bonds[RHINE].count:0;
 if(n<3)return fail('作战区莱茵人数不足3，科技暂停，数据保留');
 if(msg.t==='g.rhineReset'){
  if(st.respecUsed)return fail('本局研究重置已使用');
  st.respecUsed=true;st.research=[];st.positions={};
  ps.recompute();return OK;
 }
 if(msg.t==='g.rhineHire')return fail('访学改为所选格开战自动授予身份，无需安排');
 const t=TECH_BY_ID[msg.id];if(!t)return fail('未知科技');
 if(msg.t==='g.rhineResearch'){
  if(st.research.includes(t.id))return fail('该科技已经研究');
  if(n<t.count||!t.pre.every(id=>qualifies(id,st.research,n)))return fail('人数或前置不足');
  if(income(st,ps.layers[RHINE])-spentPoints(st.research)<t.cost)return fail('科技点不足');
  st.research.push(t.id);
 }else if(msg.t==='g.rhinePositions'){
  if(!t.region||!qualifies(t.id,st.research,n))return fail('区域科技未研究或资格不足');
  const max=['T01','T02','T04'].includes(t.id)&&qualifies('T09',st.research,n)?2:1;
  if(msg.positions.length>max||!legalPositions(ps,t.id,msg.positions))return fail('位置无效、与其他科技冲突');
  st.positions[t.id]=msg.positions.map(p=>[...p]);
 }else return fail('未知科技操作');
 ps.dirty();return OK;
}
export function rhineView(ps){
 if(!enabled(ps))return null;
 const st=ensure(ps),count=ps.bonds[RHINE]?.active?ps.bonds[RHINE].count:0,total=income(st,ps.layers[RHINE]);
 const battle=![PHASE.PREP,PHASE.ROUND_START,PHASE.SP_DRAFT].includes(ps.m.phase),snap=battle?st.snapshot:null;
 const n=snap?.count??count,active=snap?.active??TECHNOLOGIES.filter(t=>qualifies(t.id,st.research,n)).map(t=>t.id);
 const grid=[];
 for(let r=12;r>=9;r--)for(let c=2;c<=10;c++){
  const p=[r,c],stage=ps.gd.stage(ps.m.stageId),[sr,sc]=fieldTile(ps.m.deployFieldOf(ps),r,c),g=stage?.rows?.[sr]?.[sc],tile=stage?.tiles?.[g];
  grid.push({position:p,legal:regionTile(ps,p,'T04'),legalFor:['T01','T02','T03','T04','T06','T13'].filter(id=>regionTile(ps,p,id)),deployable:ps.deployMap().has(positionKey(p)),height:tile?.height||null,glyph:g||'#'});
 }
 return {count:n,enabled:n>=3,layers:clampLayers(ps.layers[RHINE]),normalPoints:Math.floor(st.highestLayers/50),tenPoint:st.tenReward?1:0,strategyPoints:st.strategyPoints,totalPoints:total,availablePoints:total-spentPoints(st.research),research:[...st.research],positions:structuredClone(st.positions),active,visitorUid:snap?.visitorUid??null,respecUsed:st.respecUsed,firstRefreshUsed:st.refreshRound===ps.m.round&&st.paidRefreshes>0,grid,phase:battle?'battle':'preparation'};
}
export function rhineBattleInput(ps,input,{preview=false,kind='normal'}={}){
 if(!enabled(ps))return input;const st=ensure(ps);
 // Each field starts from the real roster. Temporary visiting identity never mutates a piece or prep state.
 let bonds=computeBonds(ps.gd,ps),count=bonds[RHINE]?.count||0,visitorUid=null;
 for(const u of input.units||[])delete u.rhineIdentity;
 const seat=st.positions.T13?.[0],piece=seat?ps.board.get(positionKey(seat)):null;
 const candidate=piece&&(input.units||[]).find(u=>u.uid===piece.uid&&u.kind!=='token');
 if(!preview&&qualifies('T13',st.research,count)&&seat&&legalPositions(ps,'T13',[seat])&&piece?.kind==='chess'&&candidate&&!pieceBonds(ps.gd,piece).includes(RHINE)){
  candidate.rhineIdentity=true;visitorUid=piece.uid;
  const board=new Map(ps.board);board.set(positionKey(seat),{...piece,rhineIdentity:true});
  bonds=computeBonds(ps.gd,{...ps,board});count=bonds[RHINE]?.count||0;
 }
 const snap={round:ps.m.round,count,researchIds:[...st.research],active:TECHNOLOGIES.filter(t=>qualifies(t.id,st.research,count)).map(t=>t.id),positions:Object.fromEntries(TECHNOLOGIES.filter(t=>t.region).map(t=>[t.id,activePositions(t.id,st,count).filter(p=>regionTile(ps,p,t.id))])),visitorUid};
 if(!preview)st.snapshot=structuredClone(snap);
 input.bonds=bondSnapshot(bonds);
 input.contentInfo={...input.contentInfo,rhine:{...snap,preview,layers:clampLayers(ps.layers[RHINE]),round:ps.m.round,controllerUsed:kind==='unite'&&st.carryRound===ps.m.round?[...(st.controllerUsed||[])]:[]}};
 return input;
}
export function rhineMetaApi(ps){return {
 sync:()=>syncRhine(ps),
 result:r=>{const st=ensure(ps),a=r?.rhineCarry;if(a){st.carryRound=ps.m.round;st.controllerUsed=[...(a.controllerUsed||[])];ps.dirty();}},
 preferRecruit:ev=>{const id=ps.m.pool.roll(ps.m.rngMeta,{maxTier:ps.shop.level,filter:id=>ps.gd.chess(id)?.bonds?.includes(RHINE)});if(!id)return false;const i=ev.slots.findIndex(s=>s?.kind==='chess');if(i<0)return false;ev.slots[i]={kind:'chess',id,basePrice:ps.gd.chessPrice(id),frozen:ps.shop.frozen,sold:false};ps.dirty();return true;},
 refresh:ev=>{const st=ensure(ps);if(st.refreshRound!==ps.m.round){st.refreshRound=ps.m.round;st.paidRefreshes=0;}if(!ev.free&&ev.price>0)st.paidRefreshes++;return st.paidRefreshes;},
 canUse:id=>qualifies(id,ensure(ps).research,ps.bonds[RHINE]?.active?ps.bonds[RHINE].count:0),
 input:(input,opts)=>rhineBattleInput(ps,input,opts),
 giftRounds:()=>[...ensure(ps).giftRounds],
 giftDone:r=>{ensure(ps).giftRounds.push(r);ps.dirty();},
 pendingGifts:()=>[...ensure(ps).pendingGifts],
 queueGift:r=>{const st=ensure(ps);if(!st.pendingGifts.includes(r)&&!st.giftRounds.includes(r))st.pendingGifts.push(r);},
 clearGift:r=>{ensure(ps).pendingGifts=ensure(ps).pendingGifts.filter(x=>x!==r);},
 }; }
