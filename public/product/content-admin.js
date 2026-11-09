import {t,N_} from '/shared/i18n.js';
export async function renderContentAdmin({content,api,node,button,panel,status}){
  const data=await api('/auth/admin/content-status'),draft=new Map(data.items.map(item=>[item.id,{id:item.id,public:item.public,versions:[...item.versions]}]));
  const grant=node('input',{type:'checkbox',checked:data.adminControls?.testOperatorGrant===true});
  const rows=data.items.map(item=>{
    const row=draft.get(item.id),access=node('input',{type:'checkbox',checked:row.public});access.addEventListener('change',()=>row.public=access.checked);
    const versions=node('div',{class:'content-admin-options'});
    for(const version of data.versions){const conflicts=item.versionConflicts?.[version.id]||[],blocked=conflicts.length>0;if(blocked)row.versions=row.versions.filter(v=>v!==version.id);const input=node('input',{type:'checkbox',checked:!blocked&&row.versions.includes(version.id),disabled:blocked});input.addEventListener('change',()=>{row.versions=input.checked?[...row.versions,version.id]:row.versions.filter(v=>v!==version.id);});versions.append(node('label',{},input,t(version.label),blocked?node('small',{},t('本体干员冲突')+'：'+conflicts.map(c=>c.name).join('、')):null));}
    return node('section',{class:'content-admin-row'},node('strong',{},t(item.name)),node('label',{},access,t('向普通账号开放')),versions);
  });
  const save=button(N_('保存测试包设置'),async()=>{try{save.disabled=true;await api('/auth/admin/content-status',{method:'PUT',body:JSON.stringify({revision:data.revision,items:[...draft.values()],adminControls:{testOperatorGrant:grant.checked}})});status(t('已保存'));await renderContentAdmin({content,api,node,button,panel,status});}catch(error){status(error.message,true);}finally{save.disabled=false;}},true);
  content.replaceChildren(panel(N_('测试包设置'),node('p',{},t('每个测试包独立设置适用版本，管理员也遵守版本限制。不勾选任何版本将禁用该包。已有对局保留开局规则，新设置在下次选择和开局时检查。')),node('label',{},grant,t('允许管理员在第一回合开启本人测试领取（默认关闭）')),node('div',{},...rows),save));
}
