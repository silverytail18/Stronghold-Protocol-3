import {t} from '../../shared/i18n.js';
export async function renderFeedbackAdmin({content,api,node,button,panel,status}){
  const data=await api('/auth/admin/feedback'),list=node('div');
  for(const row of data.reports){
    const select=node('select');for(const[value,label]of [['new',t('待处理')],['reviewing',t('处理中')],['resolved',t('已解决')]])select.append(node('option',{value,selected:row.status===value},label));
    const save=button(t('保存状态'),async()=>{try{await api('/auth/admin/feedback','PATCH',{id:row.id,status:select.value});status(t('已保存'));}catch(error){status(error.message,true);}});
    list.append(panel(row.username+' · '+new Date(row.at).toLocaleString(),node('div',{},node('p',{},row.message),node('details',{},node('summary',{},t('诊断信息')),node('pre',{style:'white-space:pre-wrap;overflow-wrap:anywhere'},row.diagnostics)),select,save)));
  }
  if(!data.reports.length)list.append(node('p',{},t('暂无反馈')));
  content.replaceChildren(panel(t('玩家反馈'),list));
}
