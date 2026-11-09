import {t,N_} from '/shared/i18n.js';
import {aggregateStats,selfRowOf,highestBondRecord,achievementRecords} from '/shared/stats.js';
const fieldNames={NORMAL:N_('险境'),FUNNY:N_('标准'),HARD:N_('绝境'),ABYSS:N_('终极'),TRAINING:N_('战术特训'),kills:N_('击倒敌人'),bossDamage:N_('领袖伤害'),dmgDealt:N_('造成伤害'),activatedLayers:N_('盟约层数'),merges:N_('晋升次数'),itemsEquipped:N_('配发装备'),gold:N_('消耗资金'),perfectRounds:N_('完美作战'),refreshes:N_('刷新次数'),leaks:N_('未击倒'),lpLost:N_('损失生命')};

/** Uses the same aggregation as the client; no passwords or session data are returned by this API. */
export async function renderPlayerStats({content,api,node,button,panel,status,act,admin=false,accountId=null}){
  const endpoint=admin?'/auth/admin/player-data':'/auth/player-stats';
  const result=await api(endpoint),list=node('div',{class:'player-list'}),detail=node('div');
  let selected=null,includePlugins=true;
  const show=async id=>{
    selected=id;const data=await api(endpoint+'?accountId='+encodeURIComponent(id));if(selected!==id||!content.isConnected)return;
    const draw=()=>{
      const stats=aggregateStats(data.records,{modded:includePlugins});
      const toggle=node('input',{type:'checkbox',checked:includePlugins,onChange:e=>{includePlugins=e.target.checked;draw();}});
      const metrics=node('div',{class:'player-metrics'});
      for(const[label,value]of [[N_('对局数'),stats.count],[N_('胜利数'),stats.wins],[N_('最高通过回合'),stats.rounds.max],[N_('总通过回合'),stats.rounds.total],[N_('隐藏关胜利'),stats.hidden.cleared],[N_('奖杯'),stats.trophies]])metrics.append(node('div',{class:'account-metric'},t(label),node('strong',{},value)));
      const peak=highestBondRecord(achievementRecords(data.records,includePlugins));const achievement=node('section',{class:'player-achievements'},node('h3',{},t('卫戍成就')),node('p',{},peak?`${data.labels?.bonds?.[peak.bond.bondId]||peak.bond.bondId} · ${peak.bond.layers} ${t('层')}`:t('暂无记录')));for(const[key,label]of [['gold',N_('单局消耗资金纪录')],['merges',N_('单局晋升纪录')],['kills',N_('单局击败纪录')]])achievement.append(node('div',{class:'account-metric'},t(label),node('strong',{},stats.maxima[key]??'—')));
      const categories=node('div');
      for(const[kind,title]of [['bands',N_('策略统计')],['bonds',N_('盟约统计')],['byDifficulty',N_('难度统计')],['sums',N_('战斗累计')]]){
        const rows=Object.entries(stats[kind]);if(!rows.length)continue;const block=node('details',{},node('summary',{},t(title)));
        for(const[id,row]of rows)block.append(node('div',{class:'account-metric'},data.labels?.[kind]?.[id]||t(fieldNames[id]||id),node('strong',{},typeof row==='number'?row:`${row.games??row.count??0}${row.wins!=null?' / '+row.wins+' '+t('胜利'):''}`)));categories.append(block);
      }
      const records=node('div',{class:'player-records'});
      for(const rec of data.records.filter(r=>includePlugins||!r.content)){
        const me=selfRowOf(rec);const entry=node('details',{},node('summary',{},`${new Date(rec.t).toLocaleString()} · ${rec.victory?t('胜利'):t('对局记录')} · ${me?.name||data.player.name}`));
        for(const[label,value]of [[N_('通过回合'),rec.roundsPassed],[N_('策略'),data.labels?.bands?.[me?.bandId]||'—'],[N_('参战玩家'),rec.players.map(p=>p.name).filter(Boolean).join('、')],[N_('出战干员'),(me?.lineup||[]).map(p=>p.name||data.labels?.chess?.[p.id||p.chessId]||'').filter(Boolean).join('、')]])entry.append(node('div',{class:'account-metric'},t(label),node('span',{},value??'—')));
        records.append(entry);
      }
      if(!records.childElementCount)records.append(node('p',{},t('暂无记录')));
      const sections=[node('label',{class:'version-row'},toggle,t('含插件对局')),metrics,achievement,categories,node('h3',{},t('对局记录')),records];
      if(admin){
        sections.push(node('details',{},node('summary',{},t('查看玩家全部管理数据')),node('pre',{},JSON.stringify(data.management,null,2))));
        sections.push(button(N_('清空该玩家的成就统计'),()=>{
          if(!confirm(t('确定清空该玩家的成就统计？账号、积分、赛季和服务器战绩不会删除。')))return;
          act(async()=>{await api(endpoint,{method:'DELETE',body:JSON.stringify({accountId:id})});status(t('已清空该玩家的成就统计'));await show(id);});
        }));
      }
      detail.replaceChildren(panel(data.player.name,...sections));
    };draw();
  };
  for(const player of result.players){const b=button(`${player.name}${player.number?' #'+player.number:''}${admin?' ('+player.username+')':''} · ${player.online?t('游戏在线'):t('离线')}`,()=>show(player.accountId).catch(e=>status(e.message,true)));b.dataset.playerId=player.accountId;list.append(b);}
  content.replaceChildren(node('div',{class:'player-stats-layout'},panel(N_('账号列表'),list,button(N_('刷新'),()=>renderPlayerStats({content,api,node,button,panel,status,act,admin,accountId:selected}).catch(e=>status(e.message,true)))),detail));
  if(accountId||result.players[0])await show(accountId||result.players[0].accountId);
}
