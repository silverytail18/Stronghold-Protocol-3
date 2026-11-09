import {h} from '../../vendor/preact.module.js';
import {useEffect,useState} from '../../vendor/hooks.module.js';
import {Button,Icon} from './components.js';
import {createStore,useStore,store} from '../store.js';
import {net} from '../net.js';
import {data,useData} from '../data.js';
import {chessAvatarUrl} from './assetUrls.js';
import {cardOperators,setCard} from './seatArt.js';
import {rankPyramidView} from '../../../shared/rank-pyramid.js';
import {rankBoundaries} from '../../../shared/emi-ranks.js';
import {RANK_MILESTONE_CARDS} from '../../../shared/nameCards.js';
import {rankNameCardLabel,takeNewRankNameCards} from './nameCardNotices.js';
import {DEFAULT_VERSION} from '../../../shared/versions.js';
import { t, N_ } from '../../../shared/i18n.js';
export const communityUI=createStore({page:null,target:null,invites:[]});
export function openCommunity(page='ranked',target=null){communityUI.set({page,target});}
export async function communityApi(url,body) {
  const response=await fetch(url,{cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
  const value=await response.json();if(!response.ok)throw Error(value.error||t('读取失败'));return value;
}
const labels={mode:N_('模拟协议'),ranked:N_('排位大厅'),profile:N_('玩家档案'),players:N_('熟人'),rooms:N_('房间目录'),modes:N_('模拟协议'),devices:N_('账号与设备'),rules:N_('段位规则'),board:N_('全服排名')};
const node=(tag,props,...children)=>h(tag,props,...children);
const button=(label,onClick,disabled=false,variant='secondary')=>h(Button,{onClick,disabled,variant},t(label));
const title=(label)=>h('h2',null,t(label));
const paragraph=(text)=>h('p',null,text);
const actions=(...children)=>h('div',{class:'emi-actions'},...children);
function Avatar({presentation={}}) {
  useData('assets','chess','backups');
  const record=cardOperators(data.list('chess'),data.get('backups')).find(x=>x.charId===presentation.avatar);
  const url=record?chessAvatarUrl(data.get('assets'),record):null;
  return h('span',{class:'emi-avatar frame-'+(presentation.frame||'mint')},url?h('img',{src:url,alt:''}):h(Icon,{name:'user'}));
}
export function RankBadge({profile}) {
  const label=profile?.placementDone?profile.rank?.label:profile?.rules?.kind==='emi'?t('未定级'):profile?.rank?.label||t('未定级');
  return node('div',{class:'emi-rank-badge','data-division':profile?.rank?.division||'unranked'},node('span',{class:'emi-rank-glyph'},h(Icon,{name:'shield'})),node('div',null,h('small',null,'RANKED PROTOCOL'),h('h2',null,label),paragraph(profile?.placementDone?profile.points+' '+t('积分'):(profile?.placementPlayed||0)+' / 3 '+t('定级赛')),profile?.inactive?paragraph(t('五天未获得净加分，段位展示暂时隐藏')):null));
}
function Pyramid({value}) {
  const view=rankPyramidView(value);
  return node('section',{class:'emi-pyramid'},h('h3',null,t('排位金字塔')),view.rows.map((row,i)=>node('div',{class:'emi-pyramid-row',key:i},row.map((cell,j)=>h('i',{key:j,class:cell?'is-earned':'',title:cell?.division||t('未获得')})))),paragraph(view.filledWins+' / 49 · '+t('净加分对局')));
}
export function CompetitiveReceipt({receipt}) {
  if(!receipt)return null;
  const names={survival:t('存活回合'),damage:t('有效伤害'),boss:t('领袖伤害'),layers:t('盟约层数'),perfect:t('完美作战'),other:t('协助')};
  const metric=(name,value)=>node('div',{class:'emi-metric'},node('span',null,t(name)),node('b',null,value));
  const delta=receipt.totalDelta??receipt.delta??0;
  return node('section',{class:'emi-receipt'},node('small',null,'RANKED RESULT'),title(receipt.afterRank?.label||receipt.tierAfter||t('定级赛')),node('strong',{class:'emi-score'},(delta>=0?'+':'')+delta),paragraph(receipt.before+' → '+receipt.after),receipt.kind==='placement'?paragraph(t('定级进度')+' '+receipt.placementPlayed+' / 3'):null,node('details',null,node('summary',null,t('积分明细')),receipt.performance?.items?.map(item=>metric(names[item.key],item.score.toFixed(2))),metric(t('人数补偿'),'+'+(receipt.shortageBonus||0)),metric(t('额外奖励'),'+'+(receipt.skipBonus||0)),metric(t('失败扣分'),'−'+(receipt.actualLoss||receipt.rawLoss||0))));
}
export function LiveCompetitiveReceipt({recordId,playerId}) {
  const [receipt,setReceipt]=useState(null),[error,setError]=useState('');
  useEffect(()=>{if(!recordId)return;let alive=true,timer;const read=async()=>{try{const record=await communityApi('/ranked/records/'+encodeURIComponent(recordId));const row=record.summary?.players?.find(x=>x.playerId===playerId);if(!alive)return;if(row?.rank)setReceipt(row.rank);else if(record.ranking?.status==='void')setError(t('本局已作废，不计排位'));else timer=setTimeout(read,2000);}catch(e){if(alive){setError(e.message);timer=setTimeout(read,5000);}}};read();return()=>{alive=false;clearTimeout(timer);};},[recordId,playerId]);
  return receipt?h(CompetitiveReceipt,{receipt}):recordId?node('p',{class:'emi-pending',role:'status'},error||t('排位结算待确认')):null;
}
export function CommunityLauncher({page='profile',label}) {
  const account=useStore(s=>s.productAccount);
  return account?h(Button,{size:'sm',variant:'secondary',onClick:()=>openCommunity(page)},label||t(labels[page])):null;
}
export function RoomIdentity({seat}) {
  useData('assets','chess','backups');
  const p=seat?.presentation;if(!p)return null;
  const record=p.avatar?cardOperators(data.list('chess'),data.get('backups')).find(x=>x.charId===p.avatar):null;
  const url=record?chessAvatarUrl(data.get('assets'),record):null;
  return node('button',{type:'button',class:'emi-seat-identity frame-'+(p.frame||'mint'),onClick:()=>openCommunity('profile',p.accountId),'aria-label':t('查看玩家档案')},
    node('span',{class:'emi-seat-identity__avatar'},url?node('img',{src:url,alt:''}):h(Icon,{name:'user'})),
    node('span',{class:'emi-seat-identity__text'},node('span',null,'#'+p.number+' · '+(seat.competitive?.rank?.label||t('未定级'))),p.motto?node('small',null,p.motto):null));
}
function PresentationEditor({value,onChange,onSave,busy,unlocked=[]}) {
  useData('chess','backups');
  const field=(key,next)=>onChange({...value,[key]:next});
  const input=(key,label,max)=>node('label',null,t(label),h('input',{value:value[key],maxLength:max,onInput:e=>field(key,e.currentTarget.value)}));
  const select=(key,label,options)=>node('label',null,t(label),h('select',{value:value[key],onChange:e=>field(key,e.currentTarget.value)},options.map(([id,name])=>h('option',{key:id,value:id},t(name)))));
  const namecards=[['standard','标准'],['covenant','盟约'],['night','夜幕'],
    ...unlocked.filter(id=>RANK_MILESTONE_CARDS.some(card=>card.id===id)).map(id=>[id,rankNameCardLabel(id)])];
  return node('form',{class:'emi-editor',onSubmit:e=>{e.preventDefault();onSave();}},input('nickname',t('公开昵称'),12),input('motto',t('个人签名'),60),select('avatar',t('名片形象'),[['',t('默认')],...cardOperators(data.list('chess'),data.get('backups')).map(x=>[x.charId,x.name])]),select('frame',t('头像框'),[['mint',t('薄荷')],['gold',t('金色')],['silver',t('银色')],['rose',t('蔷薇')]]),select('namecard',t('名片主题'),namecards),h(Button,{type:'submit',disabled:busy},t('保存展示')));
}
function PasswordEditor() {
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  return node('form',{class:'emi-editor',onSubmit:async e=>{e.preventDefault();if(busy)return;const fields=new FormData(e.currentTarget);setBusy(true);try{if(fields.get('newPassword')!==fields.get('confirmPassword'))throw Error(t('两次输入的新密码不一致'));await communityApi('/auth/password',{currentPassword:fields.get('currentPassword'),newPassword:fields.get('newPassword')});location.replace('/product/login.html');}catch(error){setMessage(error.message);}finally{setBusy(false);}}},title(t('修改密码')),[['currentPassword',t('当前密码')],['newPassword',t('新密码')],['confirmPassword',t('确认新密码')]].map(([name,label])=>node('label',{key:name},t(label),h('input',{name,type:'password',required:true,minLength:6,autocomplete:name==='currentPassword'?'current-password':'new-password'}))),h(Button,{type:'submit',disabled:busy},t('修改并重新登录')),node('p',{role:'status'},message));
}
export function CommunityHost() {
  const ui=useStore(s=>s,Object.is,communityUI),account=useStore(s=>s.productAccount);
  const [boardSeason,setBoardSeason]=useState(''),[boardPage,setBoardPage]=useState(0);
  const [historyPage,setHistoryPage]=useState(0),[historyKind,setHistoryKind]=useState(''),[historyMode,setHistoryMode]=useState('');
  const [loaded,setPayload]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[revision,refresh]=useState(0),[code,setCode]=useState(''),[difficulty,setDifficulty]=useState('NORMAL'),[mode,setMode]=useState('coop'),[editing,setEditing]=useState(false),[draft,setDraft]=useState(null),[record,setRecord]=useState(null),[nameCardNotice,setNameCardNotice]=useState([]);
  const payload=loaded?._page===ui.page?loaded:null;
  useEffect(()=>{if(!account)return;let alive=true;const pulse=()=>{if(document.visibilityState==='visible')communityApi('/community/invites').then(v=>{if(alive)communityUI.set({invites:v.invites||[]});}).catch(()=>{});};pulse();const timer=setInterval(pulse,15000);return()=>{alive=false;clearInterval(timer);};},[account?.accountId]);
  useEffect(()=>{
    if(!ui.page)return;let alive=true;setPayload(null);setError('');setRecord(null);setEditing(false);
    const id=ui.target||account?.accountId;
    const paths={ranked:'/ranked/profile',board:'/ranked/leaderboard?scope=all&page='+boardPage+(boardSeason?'&season='+encodeURIComponent(boardSeason):''),players:'/community/players',rooms:'/product/rooms',mode:'/product/content?version='+encodeURIComponent(store.get().lobbyVersion||DEFAULT_VERSION)+'&mode='+mode+'&difficulty='+difficulty,modes:'/product/content?version='+encodeURIComponent(store.get().lobbyVersion||DEFAULT_VERSION)+'&mode='+mode+'&difficulty='+difficulty,devices:'/auth/devices',profile:'/community/profile?accountId='+encodeURIComponent(id)+'&page='+historyPage+'&kind='+historyKind+'&mode='+historyMode};
    if(paths[ui.page])communityApi(paths[ui.page]).then(async value=>{if(ui.page==='board')value.seasons=(await communityApi('/ranked/seasons')).seasons;if(ui.page==='ranked')value.history=await communityApi('/ranked/records?kind=ranked');if(alive)setPayload({...value,_page:ui.page});}).catch(e=>{if(alive)setError(e.message);});
    else setPayload({_page:ui.page});
    return()=>{alive=false;};
  },[ui.page,ui.target,revision,account?.accountId,historyPage,historyKind,historyMode,mode,difficulty,boardSeason,boardPage]);
  useEffect(()=>{if(!ui.page)return;const fn=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();communityUI.set({page:null});}};document.addEventListener('keydown',fn,true);return()=>document.removeEventListener('keydown',fn,true);},[ui.page]);
  useEffect(()=>{
    if(ui.page!=='profile'||!payload?.rank||!account||(ui.target&&ui.target!==account.accountId)){setNameCardNotice([]);return;}
    const newly=takeNewRankNameCards(account.accountId,payload.rank.unlockedNameCards||[]);
    setNameCardNotice(newly);
  },[ui.page,ui.target,payload?.rank?.unlockedNameCards?.join('|'),account?.accountId]);
  if(!ui.page||!account)return null;
  const close=()=>communityUI.set({page:null,target:null});
  const run=async fn=>{if(busy)return;setBusy(true);setError('');try{await fn();}catch(e){setError(e.message);}finally{setBusy(false);}};
  const create=async (ranked,selected=[])=>{
    const selection=new Set(selected);for(let pass=0;pass<(payload.items?.length||0);pass++)for(const item of payload.items||[])if(selection.has(item.id)){for(const id of item.requires||[])selection.add(id);if(item.requiresAny?.length&&!item.requiresAny.some(id=>selection.has(id))){const choice=item.requiresAny.find(id=>payload.items.some(x=>x.id===id&&x.enabled));if(!choice)throw Error(t('缺少可用的依赖内容'));selection.add(choice);}}selected=[...selection];
    if(store.get().room?.inMatch)throw Error(t('请先完成当前对局'));
    await net.request('room.create',{mode,difficulty,version:store.get().lobbyVersion||DEFAULT_VERSION});
    if(ranked)await net.request('room.setRanked',{on:true});
    if(selected.length)await net.request('room.setProductContent',{version:store.get().room?.version||DEFAULT_VERSION,revision:payload.revision,ids:selected});
    close();
  };
  const join=async roomCode=>{await net.request('room.join',{code:roomCode.trim().toUpperCase()});close();};
  const listHistory=rows=>node('div',{class:'emi-history'},rows?.length?rows.map(row=>node('button',{type:'button',key:row.id,class:'emi-record',disabled:busy,onClick:()=>run(async()=>setRecord(await communityApi('/community/record?id='+encodeURIComponent(row.id)+'&accountId='+encodeURIComponent(ui.target||account.accountId))))},node('span',{class:row.victory?'emi-win':'emi-loss'},t(row.victory?t('胜利'):row.score_reason==='abandoned'?t('放弃'):t('对局记录'))),node('span',null,node('b',null,t({NORMAL:t('险境'),HARD:t('绝境'),ABYSS:t('终极'),FUNNY:t('标准')}[row.difficulty]||row.difficulty)+' · '+t(row.mode==='solo'?t('独立模拟'):t('同盟模拟'))),node('small',null,new Date(row.started_at).toLocaleString()+' · '+row.roundsPassed+' '+t('回合'))),node('strong',null,row.rank?(row.rank.totalDelta>=0?'+':'')+row.rank.totalDelta:row.after_points!=null?row.after_points-row.before_points:'—'),h(Icon,{name:'chevronRight'}))):paragraph(t('暂无记录')));
  const controls=node('div',{class:'emi-protocol-options'},node('label',null,t('模拟方式'),node('select',{value:mode,onChange:e=>setMode(e.target.value)},node('option',{value:'coop'},t('同盟模拟')),node('option',{value:'solo'},t('独立模拟')))),node('label',null,t('难度'),node('select',{value:difficulty,onChange:e=>setDifficulty(e.target.value)},[['NORMAL',t('险境')],['HARD',t('绝境')],['ABYSS',t('终极')]].map(([id,label])=>node('option',{key:id,value:id},t(label))))));
  let content=null;
  if(ui.page==='rules')content=node('section',null,title(t('三场定级，按个人表现得分')),paragraph(t('存活35% · 有效伤害32% · 领袖12% · 盟约8% · 完美8% · 协助5%')),paragraph(t('神话以下失败不扣基础分；神话以上按难度扣分，表现可抵扣。零回合弃局仍计场。')),paragraph(t('五天没有净加分将隐藏高段排名，真实积分保留。')),node('div',{class:'emi-boundaries'},rankBoundaries().map(r=>node('div',{key:r.icon},node('span',null,r.label),node('b',null,r.from+'–'+(r.to??'∞'))))));
  if(payload&&ui.page==='ranked')content=node('div',{class:'emi-rank-layout'},node('section',{class:'emi-identity'},node('small',null,'RANKED SIMULATION'),h(RankBadge,{profile:payload}),title(t('以同盟之名，攀登巅峰')),paragraph(payload.season?.name),paragraph(t(payload.rules?.kind==='emi'?t('个人表现计分 · 三场定级'):t('管理员尚未切换新规则赛季'))),controls,actions(button(t('创建排位'),()=>run(()=>create(true)),busy||!!payload.activeMatch||payload.pending,'primary'),button(t('加入房间'),()=>openCommunity('rooms'))),actions(button(t('全服排名'),()=>openCommunity('board')),button(t('段位规则'),()=>openCommunity('rules'))),h(Pyramid,{value:payload.rankPyramid})),node('section',null,title(t('最近排位')),listHistory(payload.history?.rows)));
  if(payload&&ui.page==='board')content=node('div',null,title(payload.season?.name||t('全服排名')),node('select',{'aria-label':t('赛季'),value:boardSeason||payload.season?.id,onChange:e=>{setBoardSeason(e.target.value);setBoardPage(0);}},payload.seasons?.map(season=>node('option',{value:season.id},season.name))),actions(button(t('上一页'),()=>setBoardPage(x=>x-1),boardPage===0),paragraph(String(boardPage+1)),button(t('下一页'),()=>setBoardPage(x=>x+1),(boardPage+1)*50>=(payload.total||0))),node('div',{class:'emi-board'},payload.rows.map(row=>node('button',{key:row.accountId,type:'button',onClick:()=>openCommunity('profile',row.accountId)},node('strong',null,row.position||'—'),node('span',null,node('b',null,row.nickname),node('small',null,'#'+row.public_no)),node('span',null,row.rank?.label),node('b',null,row.placementDone?row.points:t('未定级'))))));
  if(payload&&ui.page==='profile')content=node('div',{class:'emi-profile'},
    nameCardNotice.length?node('section',{class:'emi-unlock',role:'status'},node('small',null,'RANK MILESTONE'),node('b',null,t('解锁新名片')),node('p',null,nameCardNotice.map(id=>t(rankNameCardLabel(id))).join(' / ')),button(t('知道了'),()=>setNameCardNotice([]))):null,
    node('section',{class:'emi-profile-banner namecard-'+payload.presentation.namecard},h(Avatar,{presentation:payload.presentation}),node('div',null,node('small',null,'DOCTOR PROFILE / #'+payload.presentation.number),node('h1',null,payload.presentation.nickname),paragraph(payload.presentation.motto||t('以同盟之名'))),(!ui.target||ui.target===account.accountId)?button(t('编辑展示'),()=>{setDraft({...payload.presentation});setEditing(!editing);}):null),
    h(RankBadge,{profile:payload.rank}),
    editing&&draft?h(PresentationEditor,{value:draft,onChange:setDraft,busy,unlocked:payload.rank?.unlockedNameCards||[],onSave:()=>run(async()=>{await communityApi('/community/presentation',draft);setCard(draft.avatar);refresh(x=>x+1);})}):null,
    node('section',{class:'emi-namecards'},title(t('段位里程碑名片')),node('div',{class:'emi-namecard-grid'},RANK_MILESTONE_CARDS.map(card=>{const has=(payload.rank?.unlockedNameCards||[]).includes(card.id);return node('article',{key:card.id,class:'emi-namecard'+(has?' is-unlocked':''),'data-card':card.id},node('b',null,t(card.label)),paragraph(has?t('已解锁'):t('未解锁')));}))),
    h(Pyramid,{value:payload.rank.rankPyramid}),
    title(t('对局记录')),
    node('div',{class:'emi-actions'},node('select',{'aria-label':t('对局类型'),value:historyKind,onChange:e=>{setHistoryKind(e.target.value);setHistoryPage(0);}},[['',t('全部对局')],['ranked',t('排位')],['normal',t('普通模拟')]].map(([value,label])=>node('option',{value},t(label)))),node('select',{'aria-label':t('模拟方式'),value:historyMode,onChange:e=>{setHistoryMode(e.target.value);setHistoryPage(0);}},[['',t('全部方式')],['solo',t('独立模拟')],['coop',t('同盟模拟')]].map(([value,label])=>node('option',{value},t(label))))),
    listHistory(payload.history?.rows),
    actions(button(t('上一页'),()=>setHistoryPage(x=>x-1),historyPage===0),paragraph((historyPage+1)+' / '+Math.max(1,Math.ceil((payload.history?.total||0)/20))),button(t('下一页'),()=>setHistoryPage(x=>x+1),(historyPage+1)*20>=(payload.history?.total||0))),
    button(t('成就与完整统计'),()=>run(async()=>{const {openPlayerStats}=await import('../screens/stats.js');close();openPlayerStats({accountId:ui.target||account.accountId,name:payload.presentation.nickname});})));
  if(payload&&ui.page==='players')content=node('section',null,actions(button(t('静音邀请一小时'),()=>run(async()=>{await communityApi('/community/mute',{enabled:true});refresh(x=>x+1);})),button(t('恢复邀请通知'),()=>run(async()=>{await communityApi('/community/mute',{enabled:false});refresh(x=>x+1);}))),node('div',{class:'emi-invites'},payload.invites.map(invite=>node('article',{key:invite.id},node('b',null,invite.senderName+' · '+invite.room_code),actions(button(t('加入'),()=>run(async()=>{const r=await communityApi('/community/respond',{id:invite.id,action:'accept'});await join(r.code);}),busy),button(t('预约'),()=>run(async()=>{await communityApi('/community/respond',{id:invite.id,action:'reserve'});refresh(x=>x+1);}),busy),button(t('忽略'),()=>run(async()=>{await communityApi('/community/respond',{id:invite.id,action:'ignore'});refresh(x=>x+1);})))))),node('div',{class:'emi-players'},payload.players.sort((a,b)=>Number(b.favorite)-Number(a.favorite)||Number(b.online)-Number(a.online)).map(p=>node('article',{key:p.accountId},node('button',{class:'emi-player-identity',type:'button',onClick:()=>openCommunity('profile',p.accountId)},h(Avatar,{presentation:p}),node('span',null,node('b',null,p.nickname+' #'+p.number),node('small',null,t(p.online?p.presence?.inMatch?t('对局中'):t('在线'):t('离线'))+' · '+(p.rank.rank?.label||'')))),p.accountId!==account.accountId?actions(button(p.presence?.inMatch?t('预约好友'):t('邀请'),()=>run(async()=>{await communityApi('/community/invite',{target:p.accountId});refresh(x=>x+1);}),busy),button(p.favorite?t('取消置顶'):t('常用队友'),()=>run(async()=>{await communityApi('/community/favorite',{target:p.accountId,enabled:!p.favorite});refresh(x=>x+1);} ))):null))));
  if(payload&&ui.page==='rooms')content=node('section',null,node('form',{class:'emi-join',onSubmit:e=>{e.preventDefault();run(()=>join(code));}},node('input',{value:code,'aria-label':t('房间密钥'),maxLength:4,placeholder:t('输入房间密钥'),onInput:e=>setCode(e.currentTarget.value.toUpperCase())}),h(Button,{type:'submit',disabled:busy||code.length!==4},t('加入'))),node('div',{class:'emi-rooms'},payload.rooms.length?payload.rooms.map(room=>node('article',{key:room.code},node('div',null,node('small',null,room.ranked?'RANKED':'COOPERATIVE'),title(room.code),paragraph(room.seats.map(s=>s.name).join(' / '))),actions(room.own?button(t('继续对局'),()=>run(async()=>{await net.request('room.resume',{code:room.code});close();}),busy):room.canJoin?button(t('加入同盟'),()=>run(()=>join(room.code)),busy):null,button(t('观战'),()=>run(async()=>{await net.request('room.spectate',{code:room.code});close();}))))):paragraph(t('暂无可用房间'))));
  if(payload&&ui.page==='modes')content=node('section',null,title(t('选择模拟协议')),controls,node('div',{class:'emi-mode-grid'},node('article',null,node('small',null,'ORIGINAL'),title(t('原版模拟')),paragraph(t('沿用官方回合、卡池与盟约规则')),button(t('创建普通模拟'),()=>run(()=>create(false)),busy,'primary')),payload.items.map(item=>node('article',{key:item.id,class:!item.enabled?'is-disabled':''},node('small',null,'CONTENT PROTOCOL'),title(item.name),paragraph(t(item.group||'')),paragraph(t(item.description||'').slice(0,110)+'…'),paragraph(t(item.reason||'')),button(t('详情'),()=>openCommunity('mode',item.id))))));
  if(payload&&ui.page==='mode'){const item=payload.items.find(x=>x.id===ui.target);content=item?node('section',{class:'emi-mode-detail'},button(t('返回列表'),()=>openCommunity('modes')),node('small',null,'CONTENT PROTOCOL / '+t(item.group||'')),title(item.name),paragraph(t(item.description||'')),controls,node('div',{class:'emi-boundaries'},node('div',null,t('游戏版本'),payload.version),node('div',null,t('排位'),t('个人表现计分 · 三场定级'))),paragraph(t(item.reason||'')),node('div',{class:'emi-actions'},button(t('创建普通模拟'),()=>run(()=>create(false,[item.id])),busy||!item.enabled),button(t('创建排位'),()=>run(()=>create(true,[item.id])),busy||!item.enabled,'primary'))):paragraph(t('暂无记录'));}
  if(payload&&ui.page==='devices')content=node('section',null,title(t('已记住的设备')),payload.devices.length?payload.devices.map(device=>node('div',{class:'emi-device',key:device.id},node('span',null,node('b',null,device.label+' '+(device.current?t('当前设备'):'')),node('small',null,new Date(device.expiresAt).toLocaleDateString())),button(t('撤销授权'),()=>run(async()=>{await communityApi('/auth/devices',{id:device.id});if(device.current)location.replace('/product/login.html');else refresh(x=>x+1);})))):paragraph(t('没有长期设备授权，登录时可选择记住本设备')),h(PasswordEditor),actions(button(t('退出登录'),()=>run(async()=>{await communityApi('/auth/logout',{});location.replace('/product/login.html');})),button(t('退出全部设备'),()=>run(async()=>{await communityApi('/auth/devices',{all:true});location.replace('/product/login.html');}))));
  const detail=record?node('section',{class:'emi-record-detail'},button(t('返回列表'),()=>setRecord(null)),title(record.summary?.victory?t('胜利'):t('对局记录')),paragraph(t('游戏版本')+' · '+(record.summary?.officialVersion||DEFAULT_VERSION)),paragraph(record.summary?.productRules?.custom?.join(' / ')||''),record.summary?.players?.map(p=>node('article',{key:p.playerId},title(p.name+' · '+p.roundsPassed+' '+t('回合')),h(CompetitiveReceipt,{receipt:p.rank}),actions(p.lineup?.map((unit,i)=>node('span',{key:i},unit.name||unit.diy?.charId||unit.id)))))):null;
  return node('div',{class:'emi-page',role:'dialog','aria-modal':true,'aria-label':t(labels[ui.page]||t('卫戍档案'))},node('header',{class:'emi-page-head'},node('button',{type:'button',class:'emi-back',onClick:close},h(Icon,{name:'chevronLeft'}),t('返回')),node('div',null,node('small',null,'STRONGHOLD / COVENANT'),node('h1',null,t(labels[ui.page]))),node('button',{type:'button',class:'emi-close',onClick:close,'aria-label':t('关闭')},'×')),node('nav',{class:'emi-nav'},['ranked','profile','players','rooms','modes','devices'].map(page=>node('button',{type:'button',key:page,class:page===ui.page?'is-active':'',onClick:()=>openCommunity(page)},t(labels[page]),page==='players'&&ui.invites.length?node('b',null,ui.invites.length):null))),node('main',{class:'emi-page-body','aria-busy':busy},error?node('p',{role:'alert',class:'emi-error'},error,button(t('重试'),()=>refresh(x=>x+1))):null,!payload&&!error&&ui.page!=='rules'?paragraph(t('正在读取')):null,detail||content));
}
