import {t,N_} from '/shared/i18n.js';
export async function renderMusicAdmin({content,api,node,button,panel,status}){
  const data=await api('/auth/admin/music'),draft=structuredClone(data.rules);
  const rows=data.tracks.map(track=>{const rule=draft[track.id]||={enabled:false,probability:0},enabled=node('input',{type:'checkbox',checked:rule.enabled}),probability=node('input',{type:'number',min:0,max:100,step:1,value:rule.probability});enabled.addEventListener('change',()=>rule.enabled=enabled.checked);probability.addEventListener('change',()=>rule.probability=Number(probability.value));return node('section',{class:'content-admin-row'},node('strong',{},track.name),node('p',{},track.condition),node('label',{},enabled,t('启用')),node('label',{},t('触发概率（%）'),probability));});
  const save=button(N_('保存音乐规则'),async()=>{save.disabled=true;try{await api('/auth/admin/music',{method:'PUT',body:JSON.stringify({revision:data.revision,rules:draft})});status(t('已保存'));await renderMusicAdmin({content,api,node,button,panel,status});}catch(error){status(error.message,true);}finally{save.disabled=false;}},true);
  content.replaceChildren(panel(N_('规则音乐设置'),node('p',{},t('新设置在下一场对局生效，已开始对局使用开局冻结的规则。')),node('p',{},t('歌曲先按各自概率判定；同时通过判定时，概率最高的优先，概率相同则随机播放一首。')),node('div',{},...rows),save));
}
