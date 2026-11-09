// Emi ac00de2e ChatPanel interaction model adapted to the local match-only channel.
import {h} from '../../vendor/preact.module.js';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from '../../vendor/hooks.module.js';
import {AvatarFrame,Button,Icon} from './components.js';
import {useStore} from '../store.js';
import {actions} from './gameActions.js';
import {data,useData} from '../data.js';
import {cardOperators} from './seatArt.js';
import {chessAvatarUrl} from './assetUrls.js';
import {chatText,CHAT_MAX_LENGTH,CHAT_COOLDOWN_MS} from '../../../shared/chat.js';
import { t } from '../../../shared/i18n.js';

function messageTime(at) {
  const date = new Date(Number(at) || 0);
  return Number.isNaN(date.getTime()) || !at ? '' : date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPanel({open,onToggle,disabled=false}) {
  useData('chess','assets','backups');
  const messages=useStore(s=>s.chat),myId=useStore(s=>s.me.playerId);
  const [draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[cooldown,setCooldown]=useState(false),[unread,setUnread]=useState(0),[below,setBelow]=useState(0),[position,setPosition]=useState({left:12,bottom:70,height:320});
  const anchor=useRef(null),list=useRef(null),seen=useRef(0),pinned=useRef(true),timer=useRef(null),input=useRef(null);
  const chess=data.list('chess'),backups=data.get('backups'),manifest=data.get('assets');
  const portraits=useMemo(()=>{
    const pool=cardOperators(chess,backups);
    return {pool,manifest,byChar:new Map(pool.map(card=>[card.charId,card]))};
  },[chess,backups,manifest]);
  const avatarFor=item=>{
    const record=item?.card?portraits.byChar.get(item.card):null;
    return record?chessAvatarUrl(portraits.manifest,record):null;
  };
  useEffect(()=>{if(!document.querySelector('link[data-chat]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/css/chat.css';link.dataset.chat='true';document.head.append(link);}return()=>clearTimeout(timer.current);},[]);
  useLayoutEffect(()=>{const added=messages.filter(m=>m.seq>seen.current&&m.playerId!==myId).length;if(open){setUnread(0);if(pinned.current&&list.current){list.current.scrollTop=list.current.scrollHeight;setBelow(0);}else if(added)setBelow(n=>n+added);}else if(added)setUnread(n=>Math.min(99,n+added));seen.current=messages.at(-1)?.seq||0;},[messages,open,myId]);
  useLayoutEffect(()=>{
    if(!open)return;
    const place=()=>{const box=anchor.current?.getBoundingClientRect();if(!box)return;const v=globalThis.visualViewport,top=v?.offsetTop||0,left=v?.offsetLeft||0,width=v?.width||innerWidth,height=v?.height||innerHeight,bottom=Math.max(12,innerHeight-Math.min(top+height-12,box.top-8));setPosition({left:Math.max(left+12,Math.min(box.left,left+width-Math.min(340,width-24)-12)),bottom,height:Math.max(110,Math.min(420,innerHeight-bottom-top-12))});};
    place();addEventListener('resize',place);globalThis.visualViewport?.addEventListener('resize',place);globalThis.visualViewport?.addEventListener('scroll',place);const observer=new ResizeObserver(place);observer.observe(anchor.current);
    return()=>{removeEventListener('resize',place);globalThis.visualViewport?.removeEventListener('resize',place);globalThis.visualViewport?.removeEventListener('scroll',place);observer.disconnect();};
  },[open]);
  useEffect(()=>{if(open)input.current?.focus();},[open]);
  const send=async()=>{const text=chatText(draft);if(!text||busy||cooldown||disabled)return;setBusy(true);try{if(await actions.chat(text)){setDraft('');pinned.current=true;setCooldown(true);timer.current=setTimeout(()=>setCooldown(false),CHAT_COOLDOWN_MS);}}finally{setBusy(false);}};
  const latest=()=>{pinned.current=true;setBelow(0);if(list.current)list.current.scrollTop=list.current.scrollHeight;};
  const messageView=m=>h('article',{key:m.seq,class:m.playerId===myId?'is-self':''},
    h('div',{class:'match-chat__identity'},
      h(AvatarFrame,{size:'sm',class:'match-chat__avatar',name:m.name,src:avatarFor(m),frame:m.frame||undefined,namecard:m.namecard||undefined}),
      h('div',{class:'match-chat__who'},h('b',null,m.name),m.rank?.label?h('small',{class:'match-chat__rank','data-division':m.rank.division||''},m.rank.label):null),
      h('time',{class:'match-chat__time'},messageTime(m.at))),
    h('p',null,m.text));
  const sendLabel=t(disabled?t('连接已断开'):cooldown?t('请稍后'):t('发送'));
  const panel=open?h('section',{class:'match-chat__panel','aria-label':t('局内聊天'),style:{left:position.left+'px',bottom:position.bottom+'px',height:position.height+'px'}},
    h('header',null,h('div',null,h('small',null,'MATCH CHANNEL'),h('b',null,t('本局聊天'))),h('button',{type:'button','aria-label':t('关闭'),onClick:()=>onToggle(false)},'×')),
    h('div',{class:'match-chat__messages',role:'log','aria-live':'polite',ref:list,onScroll:()=>{const e=list.current;pinned.current=e.scrollHeight-e.scrollTop-e.clientHeight<=24;if(pinned.current)setBelow(0);}},messages.length?messages.map(messageView):h('p',null,t('发送文字，与队友交流战术。'))),
    below?h('button',{class:'match-chat__latest',type:'button',onClick:latest},below+' '+t('条新消息')):null,
    h('form',{onSubmit:e=>{e.preventDefault();void send();}},
      h('textarea',{ref:input,value:draft,rows:2,maxLength:400,'aria-label':t('聊天内容'),placeholder:t('输入聊天内容（最多 200 字）'),onInput:e=>setDraft(e.currentTarget.value),onKeyDown:e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();void send();}}}),
      h('footer',null,
        h('small',null,Array.from(draft).length+'/'+CHAT_MAX_LENGTH),
        h(Button,{type:'submit',size:'sm',disabled:disabled||busy||cooldown||!chatText(draft)},sendLabel))))
    : null;
  return h('div',{class:'match-chat',ref:anchor,onKeyDown:e=>{e.stopPropagation();if(e.key==='Escape')onToggle(false);},onPointerDown:e=>e.stopPropagation()},
    h('button',{type:'button',class:'gm__gear match-chat__trigger','aria-expanded':open,'aria-label':t('局内聊天'),onClick:()=>onToggle(!open)},h(Icon,{name:'users'}),h('span',null,t('聊天')),unread?h('b',{class:'match-chat__unread'},unread):null),
    panel);
}
