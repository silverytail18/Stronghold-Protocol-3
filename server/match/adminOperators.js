import {PHASE,ERR} from '../../shared/constants.js';
const fail=detail=>({error:ERR.BAD_TARGET,detail});
const catalog=m=>Object.values(m.data.chess).filter(c=>!c.isGolden&&c.visible&&c.expansionBatch&&m.gd.chess(c.goldenId)).map(c=>({baseId:c.chessId,name:c.name,normalId:c.chessId,eliteId:c.goldenId}));
const allowed=(m,p)=>m.productAdminContext?!m.productAdminContext.ranked&&m.productAdminContext.enabled&&m.productAdminContext.adminIds.includes(p.playerId):!m.productRanked&&m.productCanTestOperators?.(p.playerId)===true;
export function adminOperatorView(m,p){
  const admin=m.productAdminContext?.adminIds.includes(p.playerId)||allowed(m,p);
  if(!admin||m.productAdminContext?.ranked||m.productRanked||m.round!==1)return null;
  const rows=catalog(m);
  return {available:allowed(m,p),enabled:!!p.adminOperatorsEnabled,claimed:!!p.adminOperatorsClaimed,canToggle:allowed(m,p)&&m.phase===PHASE.PREP&&p.alive&&!p.ready&&!p.autoplay&&!p.adminOperatorsClaimed,catalog:rows};
}
export function adminOperatorIntent(m,p,msg){
  if(!allowed(m,p))return fail('管理员快捷领取未开放或账号无权限');
  if(m.round!==1||m.phase!==PHASE.PREP)return fail('快捷领取仅限第一回合休整期');
  const gate=p._gate();if(gate)return gate;if(p.autoplay||p.adminOperatorsClaimed)return fail('当前不能领取测试干员');
  if(msg.t==='g.adminOperatorsEnabled'){if(typeof msg.enabled!=='boolean')return fail('开关值无效');p.adminOperatorsEnabled=msg.enabled;p.dirty();return{ok:true};}
  if(!p.adminOperatorsEnabled)return fail('请先开启本人快捷领取开关');
  if(!Array.isArray(msg.selections)||!msg.selections.length||msg.selections.length>16||msg.selections.some(s=>!s||typeof s.elite!=='boolean'))return fail('请选择干员及普通或精锐等级');
  const rows=new Map(catalog(m).map(c=>[c.baseId,c])),seen=new Set(),ids=[];
  for(const s of msg.selections){const c=rows.get(s.baseId);if(!c||seen.has(s.baseId))return fail('请选择本局测试包中的不同干员');seen.add(s.baseId);ids.push(s.elite?c.eliteId:c.normalId);}
  if(p.hand.filter(c=>!c).length<ids.length)return{error:ERR.HAND_FULL,detail:'请先在整备区留出足够位置'};
  for(const id of ids)p.stow(p.newPiece('chess',id,{meta:{productAdminGrant:true}}));
  p.adminOperatorsClaimed=true;m.productAdminToolsUsed=true;p.recompute();return{ok:true};
}
