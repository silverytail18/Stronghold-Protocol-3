import {t,N_} from '/shared/i18n.js';
export async function renderRankedAdmin({content,api,node,button,field,panel,status,act}) {
  const state=await api('/auth/admin/ranked');
  const refresh=()=>renderRankedAdmin({content,api,node,button,field,panel,status,act});
  const post=(route,body)=>act(async()=>{await api('/auth/admin/ranked/'+route,{method:'POST',body:JSON.stringify(body)});await refresh();});
  const form=(children,submit)=>node('form',{class:'account-form',onSubmit:e=>{e.preventDefault();submit();}},children,node('button',{type:'submit',class:'btn btn--primary'},t('确认执行')));
  const current=state.current;
  const summary=node('div',{class:'admin-season-status'},node('strong',{},current?.name||t('暂无开放赛季')),node('span',{},current?.state||'—'),node('p',{},current?.rules?.kind==='emi'?t('Emi表现积分 · 三场定级 · 五天失活规则'):t('旧规则赛季：可保留历史对局并切换新规则')));
  const controls=node('div',{class:'account-actions'});
  if(current?.state==='active')controls.append(button(current.paused?N_('恢复新排位'):N_('暂停新排位'),()=>post('pause',{paused:!current.paused})));
  const next=node('select',{'aria-label':t('下一赛季')},node('option',{value:''},t('结束后暂不开新季')));
  for(const season of state.seasons.filter(s=>s.state==='draft'))next.append(node('option',{value:season.id},season.name));
  if(current?.state==='active')controls.append(next,button(N_('开始赛季收尾'),()=>{if(confirm(t('停止新排位，等待当前局和可靠结果结清，再归档并切换赛季。')))post('rollover',{nextId:next.value||null});}));
  const draftName=field(N_('新赛季名称'),'text','draft-name');
  const draft=form([node('p',{},t('定级3场，险境25／绝境40／终极50表现预算；六项权重固定为所选Emi版本。')),draftName.label],()=>post('seasons',{name:draftName.input.value,rules:state.competitiveRules}));
  const upgradeName=field(N_('新赛季名称'),'text','upgrade-name'),upgradeReason=field(N_('升级原因'),'text','upgrade-reason'),confirmation=field(N_('输入 保留对局并清理旧赛季'),'text','upgrade-confirm');
  upgradeName.input.value=t('同盟新章');
  const preview=state.migrationPreview||{};
  const migration=form([node('p',{},t('旧版排位对局转为普通对局，移除旧规则赛季、积分和榜单。新规则赛季及其历史、账号、皮肤、调配和成就保留。')),
    node('p',{},t('历史对局')+' '+(preview.records??'—')+' · '+t('旧规则赛季')+' '+(preview.legacySeasons??0)+' · '+t('未解决对局')+' '+state.running.length),upgradeName.label,upgradeReason.label,confirmation.label],
    ()=>post('upgrade',{name:upgradeName.input.value,reason:upgradeReason.input.value,confirm:confirmation.input.value}));
  const player=node('select',{'aria-label':t('指定玩家')});
  for(const p of state.players||[])player.append(node('option',{value:p.id},p.nickname+' #'+p.public_no));
  const points=field(N_('定级总分'),'number','placement-points'),reason=field(N_('定级原因'),'text','placement-reason');points.input.min='0';points.input.max='1000000';points.input.value='1500';
  const placement=form([node('p',{},t('管理员可为指定账号完成定级；不增加虚构对局或胜场。正在排位的账号不可操作。')),node('label',{},t('指定玩家'),player),points.label,reason.label],()=>post('placement',{accountId:player.value,points:Number(points.input.value),reason:reason.input.value}));
  const matches=node('div',{class:'admin-match-list'});
  for(const match of state.recent) {
    const r=field(N_('原因'),'text','void-'+match.id);
    const block=node('section',{class:'account-user'},node('strong',{},match.room_code||match.id),node('p',{},match.mode+' · '+match.difficulty+' · '+match.status));
    if(match.status==='settled')block.append(r.label,button(N_('有理由作废'),()=>post('void',{matchId:match.id,reason:r.input.value})));
    else if(match.status==='pending')block.append(button(N_('重试已有可靠结果'),()=>post('retry',{matchId:match.id})));
    matches.append(block);
  }
  const audit=node('div',{class:'account-records'});for(const item of state.audit)audit.append(node('article',{},node('b',{},item.actor+' · '+item.action),node('small',{},new Date(item.created_at).toLocaleString()),node('p',{},item.reason||item.target)));
  content.replaceChildren(panel(N_('当前赛季'),summary,controls),node('div',{class:'admin-columns'},panel(N_('新赛季草稿'),draft),panel(N_('管理员指定账号定级'),placement)),...(state.seasons.some(s=>s.rules?.kind!=='emi')?[panel(N_('升级并移除旧赛季'),migration)]:[]),panel(N_('战绩与异常结算'),matches),panel(N_('操作记录'),audit));
}
