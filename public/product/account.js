import {t,N_} from '/shared/i18n.js';
const L={
  title:N_('账号管理'),intro:N_('浏览器管理账号，使用客户端游玩'),login:N_('登录'),logout:N_('退出登录'),user:N_('账号'),password:N_('密码'),
  account:N_('我的账号'),versions:N_('游戏版本'),users:N_('账号列表'),season:N_('赛季与战绩'),admin:N_('管理员'),member:N_('用户'),sponsor:N_('赞助者'),
  currentPassword:N_('当前密码'),newPassword:N_('新密码'),changePassword:N_('修改密码'),save:N_('保存'),refresh:N_('刷新'),default:N_('新建房间默认版本'),
  policyHint:N_('选择服务器开放的原游戏版本。已有房间和正在进行的对局保留原版本。'),unavailable:N_('数据未就绪'),saved:N_('已保存'),loading:N_('正在读取'),
  enable:N_('启用'),disable:N_('禁用'),grant:N_('授予赞助者'),revoke:N_('撤销赞助者'),create:N_('创建账号'),role:N_('权限'),
  resetPassword:N_('重置密码'),deleteAccount:N_('删除账号'),confirmPassword:N_('确认新密码'),cancel:N_('取消'),confirmDelete:N_('确认删除'),
  resetHint:N_('为 {username} 设置临时密码。该玩家的现有登录会失效，可在客户端首次登录时修改密码。'),
  resetDone:N_('已重置 {username} 的密码。请让该玩家登录并修改临时密码。'),passwordMismatch:N_('两次输入的新密码不一致'),
  deleteHint:N_('删除 {username} 后，该账号将无法登录，现有登录也会失效。历史战绩和统计不会随此操作清空。'),
  deleteName:N_('输入要删除的账号名以确认'),deleteMismatch:N_('输入的账号名与要删除的账号不一致'),deleteDone:N_('已删除账号 {username}'),
  points:N_('积分'),rank:N_('段位'),games:N_('对局数'),wins:N_('胜利数'),empty:N_('暂无记录'),active:N_('当前赛季'),
  loginNeeded:N_('请先登录'),passwordChanged:N_('密码已修改，请重新登录'),disabled:N_('已禁用'),normal:N_('正常'),readFailed:N_('读取失败'),
  solo:N_('独立模拟'),coop:N_('同盟模拟'),funny:N_('标准'),normalDifficulty:N_('险境'),hard:N_('绝境'),abyss:N_('终极'),running:N_('进行中'),finished:N_('已结束'),interrupted:N_('已中断'),
};
const root=document.querySelector('#account-root');let playerTarget=null,session=null,tab='account',message='',isError=false,busy=false;
function node(tag,attrs={},...children){attrs=attrs||{};const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k.startsWith('on'))e.addEventListener(k.slice(2).toLowerCase(),v);else if(k==='class')e.className=v;else if(k==='checked'||k==='disabled'||k==='selected')e[k]=v;else e.setAttribute(k,v);}for(const c of children.flat())if(c!=null)e.append(c instanceof Node?c:document.createTextNode(String(c)));return e;}
const text=key=>t(key),button=(label,action,primary=false)=>node('button',{class:'btn btn--'+(primary?'primary':'secondary'),type:'button',onClick:action},text(label));
function field(label,type='text',name=''){const input=node(type==='select'?'select':'input',{name,type,required:'required',...(type==='password'?{autocomplete:name==='username'?'username':name==='currentPassword'?'current-password':'new-password'}:{})});return{input,label:node('label',{class:'account-field'},text(label),input)};}
function panel(title,...children){return node('section',{class:'panel panel--mint brackets'},node('header',{class:'panel__head'},node('h2',{class:'panel__title'},text(title))),node('div',{class:'panel__body'},children));}
async function api(url,options={}){const r=await fetch(url,{credentials:'same-origin',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});let d;try{d=await r.json();}catch{throw Error(text(L.readFailed));}if(!r.ok)throw Error(d.error||text(L.readFailed));return d;}
function status(value,error=false){message=value;isError=error;const e=document.querySelector('#account-status');if(e){e.textContent=message;e.classList.toggle('is-error',isError);}}
async function act(action){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await action();}catch(e){status(e.message,true);}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
async function loadSession(){session=await api('/auth/session');if(!session.authenticated)session=null;render();}
function render(){root.replaceChildren();const header=node('header',{class:'account-header'},node('div',{},node('h1',{},text(L.title)),node('p',{class:'account-subtitle'},text(L.intro))));
  if(session){const identity=node('div',{class:'account-user-info'},session.username,node('span',{class:'account-badge'},text(session.role==='admin'?L.admin:L.member)));if(session.sponsor)identity.append(node('span',{class:'account-badge account-badge--gold'},text(L.sponsor)));identity.append(button(L.logout,()=>act(async()=>{await api('/auth/logout',{method:'POST'});session=null;status('');render();})));header.append(identity);}root.append(header,node('p',{id:'account-status',class:'account-status'+(isError?' is-error':''),role:isError?'alert':'status'},message));
  if(!session){loginView();return;}
  const tabs=node('nav',{class:'account-tabs','aria-label':text(L.title)});for(const[id,label]of [['account',L.account],['players',N_('玩家统计')],['season',L.season],['users',L.users],...(session.role==='admin'?[['versions',L.versions],['modes',N_('玩法开放')],['mizuki',N_('水月存档')],['content',N_('内容协议')],['music',N_('规则音乐')],['emotes',N_('表情包')],['appeals',N_('对局申诉')],['feedback',N_('历史反馈')]]:[])]){const b=button(label,()=>{tab=id;status('');render();});b.dataset.accountTab=id;b.classList.toggle('is-active',tab===id);b.setAttribute('aria-current',tab===id?'page':'false');tabs.append(b);}root.append(tabs);
  const content=node('div',{id:'account-content'});root.append(content);if(tab==='players')playersView(content,playerTarget).catch(e=>status(e.message,true));else if(tab==='versions')versionsView(content).catch(e=>status(e.message,true));else if(tab==='users')usersView(content).catch(e=>status(e.message,true));else if(tab==='season'&&session.role==='admin')openProductRankedAdmin().catch(e=>status(e.message,true));else if(tab==='season')seasonView(content).catch(e=>status(e.message,true));else if(tab==='modes')import('/product/mode-admin.js').then(mod=>mod.renderModeAdmin({content,api,node,button,panel,status})).catch(e=>status(e.message,true));else if(tab==='mizuki')import('/product/mizuki-admin.js').then(mod=>mod.renderMizukiAdmin({content,api,node,button,panel,status})).catch(e=>status(e.message,true));else if(tab==='content')contentStatus().catch(e=>status(e.message,true));else if(tab==='music')import('/product/music-admin.js').then(mod=>mod.renderMusicAdmin({content,api,node,button,panel,status})).catch(e=>status(e.message,true));else if(tab==='emotes')import('/product/emote-admin.js').then(mod=>mod.renderEmoteAdmin({content,api,node,button,panel,status})).catch(e=>status(e.message,true));else if(tab==='appeals')import('/product/appeal-admin.js').then(mod=>mod.renderAppealAdmin({content,api,node,button,panel,status})).catch(e=>status(e.message,true));else if(tab==='feedback')import('/product/feedback-admin.js').then(mod=>mod.renderFeedbackAdmin({content,api,node,button,panel,status})).catch(e=>status(e.message,true));else accountView(content);
}
async function playersView(content,accountId=null){const mod=await import('/product/player-stats.js');if(!['players','users'].includes(tab))return;await mod.renderPlayerStats({content,api,node,button,panel,status,act,admin:session.role==='admin',accountId});}
function loginView(){const username=field(L.user,'text','username'),password=field(L.password,'password','password');username.input.autocomplete='username';password.input.autocomplete='current-password';const form=node('form',{class:'account-form',onSubmit:e=>{e.preventDefault();act(async()=>{await api('/auth/login',{method:'POST',body:JSON.stringify({username:username.input.value,password:password.input.value})});status('');await loadSession();});}},username.label,password.label,node('button',{class:'btn btn--primary',type:'submit'},text(L.login)));root.append(node('div',{class:'account-login'},panel(L.login,form)));}
function accountView(content){const current=field(L.currentPassword,'password','currentPassword'),next=field(L.newPassword,'password','newPassword');next.input.minLength=6;const form=node('form',{class:'account-form',onSubmit:e=>{e.preventDefault();act(async()=>{await api('/auth/password',{method:'POST',body:JSON.stringify({currentPassword:current.input.value,newPassword:next.input.value})});session=null;status(text(L.passwordChanged));render();});}},current.label,next.label,node('button',{class:'btn btn--primary',type:'submit'},text(L.changePassword)));content.append(panel(L.changePassword,form));}
async function versionsView(content){const p=await api('/auth/admin/game-versions');if(tab!=='versions')return;const enabled=new Set(p.versions.filter(v=>v.enabled).map(v=>v.id)),list=node('div',{class:'version-list'}),select=node('select',{class:'version-default',id:'official-version-default'});
  function defaults(){const old=select.value||p.default;select.replaceChildren();for(const v of p.versions.filter(v=>enabled.has(v.id)))select.append(node('option',{value:v.id,selected:v.id===old},t(v.label)));if(!select.value&&select.options.length)select.selectedIndex=0;}
  for(const v of p.versions){const check=node('input',{type:'checkbox',checked:v.enabled,disabled:!v.available,'data-version-id':v.id,onChange:e=>{if(e.target.checked)enabled.add(v.id);else enabled.delete(v.id);defaults();}});list.append(node('label',{class:'version-row'},check,node('span',{},t(v.label)),!v.available?node('small',{},text(L.unavailable)):null));}defaults();
  const save=button(L.save,()=>act(async()=>{await api('/auth/admin/game-versions',{method:'PUT',body:JSON.stringify({revision:p.revision,enabled:[...enabled],default:select.value})});status(text(L.saved));await versionsView(content);}),true);
  content.replaceChildren(panel(
    L.versions,
    node('p',{class:'account-hint'},text(L.policyHint)),
    list,
    node('label',{class:'account-field',for:'official-version-default'},text(L.default),select),
    node('div',{class:'account-actions'},save,button(L.refresh,()=>versionsView(content).catch(e=>status(e.message,true)))),
  ));
}
function userMaintenance(user,actions,editor,refresh){
  const url='/auth/admin/users/'+encodeURIComponent(user.username);
  const close=()=>{editor.replaceChildren();editor.hidden=true;};
  const show=form=>{editor.replaceChildren(form);editor.hidden=false;form.querySelector('input')?.focus();};
  const reset=button(L.resetPassword,()=>{
    const password=field(L.newPassword,'password','resetPassword'),confirm=field(L.confirmPassword,'password','confirmPassword');
    password.input.minLength=confirm.input.minLength=6;
    show(node('form',{class:'account-form account-user-form','data-account-editor':'reset',onSubmit:e=>{
      e.preventDefault();
      if(password.input.value!==confirm.input.value){status(text(L.passwordMismatch),true);confirm.input.focus();return;}
      act(async()=>{
        await api(url,{method:'PATCH',body:JSON.stringify({password:password.input.value})});
        password.input.value=confirm.input.value='';close();status(t(L.resetDone,{username:user.username}));await refresh();
      });
    }},node('p',{class:'account-hint'},t(L.resetHint,{username:user.username})),password.label,confirm.label,
    node('div',{class:'account-actions'},node('button',{class:'btn btn--primary',type:'submit'},text(L.resetPassword)),button(L.cancel,close))));
  });
  const remove=button(L.deleteAccount,()=>{
    const confirmation=field(L.deleteName,'text','deleteUsername');confirmation.input.autocomplete='off';confirmation.input.spellcheck=false;
    show(node('form',{class:'account-form account-user-form','data-account-editor':'delete',onSubmit:e=>{
      e.preventDefault();
      if(confirmation.input.value!==user.username){status(text(L.deleteMismatch),true);confirmation.input.focus();return;}
      act(async()=>{await api(url,{method:'DELETE'});close();status(t(L.deleteDone,{username:user.username}));await refresh();});
    }},node('p',{class:'account-hint'},t(L.deleteHint,{username:user.username})),confirmation.label,
    node('div',{class:'account-actions'},node('button',{class:'btn btn--secondary account-delete',type:'submit'},text(L.confirmDelete)),button(L.cancel,close))));
  });
  reset.dataset.accountAction='reset';remove.dataset.accountAction='delete';remove.classList.add('account-delete');actions.append(reset,remove);
}
async function usersView(content){if(session.role!=='admin')return playersView(content);const [d,presence]=await Promise.all([api('/auth/admin/users'),api('/auth/player-stats')]);if(tab!=='users')return;const list=node('div');for(const u of d.users){const actions=node('div',{class:'account-user-actions'}),editor=node('div',{class:'account-user-editor'});editor.hidden=true;if(u.username!==session.username){actions.append(button(u.disabled?L.enable:L.disable,()=>act(async()=>{await api('/auth/admin/users/'+encodeURIComponent(u.username),{method:'PATCH',body:JSON.stringify({disabled:!u.disabled})});status(text(L.saved));await usersView(content);})));userMaintenance(u,actions,editor,()=>usersView(content));}actions.append(button(u.sponsor?L.revoke:L.grant,()=>act(async()=>{await api('/auth/admin/users/'+encodeURIComponent(u.username),{method:'PATCH',body:JSON.stringify({sponsor:!u.sponsor})});session=await api('/auth/session');status(text(L.saved));render();})));list.append(node('div',{class:'account-user','data-account-username':u.username},node('div',{class:'account-user-info'},button(u.username,()=>{tab='players';playerTarget=u.accountId;render();}),node('span',{class:'account-badge'},text(u.role==='admin'?L.admin:L.member)),node('span',{class:'account-badge'},t(presence.players.some(p=>p.accountId===u.accountId&&p.online)?N_('游戏在线'):N_('离线'))),node('span',{},text(u.disabled?L.disabled:L.normal)),u.sponsor?node('span',{class:'account-badge account-badge--gold'},text(L.sponsor)):null),actions,editor));}
  const username=field(L.user,'text','username'),password=field(L.password,'password','password'),role=field(L.role,'select','role');role.input.append(node('option',{value:'user'},text(L.member)),node('option',{value:'admin'},text(L.admin)));const form=node('form',{class:'account-form',onSubmit:e=>{e.preventDefault();act(async()=>{await api('/auth/admin/users',{method:'POST',body:JSON.stringify({username:username.input.value,password:password.input.value,role:role.input.value})});status(text(L.saved));await usersView(content);});}},username.label,password.label,role.label,node('button',{class:'btn btn--primary',type:'submit'},text(L.create)));content.replaceChildren(node('div',{class:'account-grid'},panel(L.users,list),panel(L.create,form)));
}
async function seasonView(content){const[profile,records]=await Promise.all([api('/ranked/profile'),api('/ranked/records')]);if(tab!=='season')return;const metrics=node('div');for(const[label,value]of [[L.active,profile.season?.name||'—'],[L.points,profile.points??0],[L.rank,profile.rank?.label||'—'],[L.games,profile.games??0],[L.wins,profile.wins??0]])metrics.append(node('div',{class:'account-metric'},text(label),node('strong',{},value)));const list=node('ul',{class:'account-records'});const modes={solo:L.solo,coop:L.coop},difficulties={FUNNY:L.funny,NORMAL:L.normalDifficulty,HARD:L.hard,ABYSS:L.abyss},states={running:L.running,finished:L.finished,interrupted:L.interrupted};for(const r of records.rows||[])list.append(node('li',{},new Date(r.started_at).toLocaleString(),node('small',{},[text(modes[r.mode]||L.normal),text(difficulties[r.difficulty]||L.normal),text(states[r.status]||L.finished)].join(' · '))));if(!list.childElementCount)list.append(node('li',{},text(L.empty)));content.replaceChildren(node('div',{class:'account-grid'},panel(L.active,metrics),panel(L.season,list)));}
async function openProductRankedAdmin(){const module=await import('/product/ranked-admin.js');await module.renderRankedAdmin({content:document.querySelector('#account-content'),api,node,button,field,panel,status,act});}
async function contentStatus(){const module=await import('/product/content-admin.js');await module.renderContentAdmin({content:document.querySelector('#account-content'),api,node,button,panel,status});}
loadSession().catch(e=>{status(e.message,true);render();});
