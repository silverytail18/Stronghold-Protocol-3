// Optional owner-only test tool. Match needs only the view/intent hooks below.
// Keep test-copy accounting guards while any live match still contains copies.
import {PHASE,ERR} from '../../shared/constants.js';
import {TEST_OPERATOR_CATALOG} from '../../shared/test-operator-catalog.js';
const fail=detail=>({error:ERR.BAD_MSG,detail});
const catalog=m=>TEST_OPERATOR_CATALOG.filter(r=>m.testRules?.batches?.some(b=>b.id===r.batch)&&m.gd.chess(r.normalId)&&m.gd.chess(r.eliteId));
const allowed=(m,ps)=>m.canTestOperators(ps.playerId)===true&&catalog(m).length>0;
const inWindow=m=>m.round===1&&m.phase===PHASE.PREP;
export function testOperatorView(m,ps){
  if(!inWindow(m)||!allowed(m,ps))return null;
  const canToggle=ps.alive&&!ps.ready&&!ps.autoplay&&!ps.testOperatorsClaimed;
  return {enabled:!!ps.testOperatorsEnabled,claimed:!!ps.testOperatorsClaimed,canToggle,available:canToggle&&!!ps.testOperatorsEnabled,catalog:catalog(m).map(r=>({...r,name:m.gd.chess(r.normalId).name}))};
}
export function handleTestOperators(m,ps,msg){
  if(!allowed(m,ps))return fail('管理员测试领取工具未启用或当前账号无权限');
  if(!inWindow(m))return fail('快捷领取仅在第一回合休整期开放');
  const gate=ps._gate();if(gate)return gate;
  if(ps.autoplay)return fail('请先退出托管');
  if(ps.testOperatorsClaimed)return fail('本局已领取，开关不能撤销已发干员');
  if(msg.t==='g.testOperatorsEnabled'){
    if(typeof msg.enabled!=='boolean')return fail('开关值无效');
    ps.testOperatorsEnabled=msg.enabled;m.markPrivate(ps);return {ok:true};
  }
  if(!ps.testOperatorsEnabled)return fail('请先开启管理员快捷领取');
  const rows=catalog(m),lookup=new Map(rows.map(r=>[r.baseId,r]));
  // Older pages can still request both at one tier; the current UI sends explicit per-operator selections.
  const selections=msg.selections===undefined&&typeof msg.elite==='boolean'?rows.map(r=>({baseId:r.baseId,elite:msg.elite})):msg.selections;
  if(!Array.isArray(selections)||!selections.length||selections.length>16||msg.selections!==undefined&&msg.elite!==undefined)return fail('请选择至少一名干员及其普通／精锐等级');
  const seen=new Set(),ids=[];
  for(const s of selections){
    if(!s||typeof s.baseId!=='string'||typeof s.elite!=='boolean'||!lookup.has(s.baseId)||seen.has(s.baseId))return fail('同一干员只能选择一个等级，且必须在本局可领取目录中');
    seen.add(s.baseId);const row=lookup.get(s.baseId);ids.push(s.elite?row.eliteId:row.normalId);
  }
  if(ids.some(id=>!ps.gd.chess(id)))return {error:ERR.BAD_TARGET,detail:'本局未加载测试干员'};
  if(ps.hand.filter(p=>p==null).length<ids.length)return {error:ERR.HAND_FULL,detail:`请在整备区空出${ids.length}个位置后再领取`};
  // Pool-free, no onGain/merge rewards; never writes accounts or teammates.
  for(const id of ids)ps.stow(ps.newPiece('chess',id,{meta:{testOperator:true}}));
  ps.testOperatorsClaimed=true;ps.recompute();return {ok:true};
}
