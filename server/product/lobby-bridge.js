import {attachMizukiProduct} from './mizuki/bridge.js';
import {ERR,PROTOCOL_VERSION} from '../../shared/constants.js';
import {randomUUID} from 'node:crypto';
import {DEFAULT_VERSION} from '../../shared/versions.js';
const fail=detail=>({error:ERR.BAD_TARGET,detail});
const cleanPlayers=message=>({...message,players:(message.players||[]).map(({autoplay,autoplayAllowed,productAutoplayAllowed,...p})=>{void autoplay;void autoplayAllowed;void productAutoplayAllowed;return p;})});

export function attachProductLobby({lobby,network,registry,product}) {
  const {auth,ranked,versions}=product;
  lobby.product=product;
  if(product.community) {
    product.community.rooms=()=>product.currentRooms?.(null)||[];
    product.community.presence=id=>product.currentRooms?.(id).find(r=>r.own)||null;
    product.community.onPresentation=(id,view)=>{for(const s of registry.all())if(s.accountId===id){s.name=view.nickname;const room=lobby.roomOf(s),seat=room?.seatOf(s.playerId);if(seat){seat.name=view.nickname;const updated=lobby.humanSeat(seat.seat,s,room);seat.card=updated.card;}if(room)lobby.broadcastState(room);}};
  }
  if(product.playerData)product.playerData.onlineStatus=id=>[...registry.all()].some(s=>s.accountId===id&&s.connected&&!!s.ws&&network.conns.has(s.ws));
  const humanSeat=lobby.humanSeat.bind(lobby);lobby.humanSeat=(index,session,room)=>{const portrait=product.community?.presentation(session.accountId)?.avatar;return humanSeat(index,portrait?{...session,card:portrait}:session,room);};
  const userFor=session=>[...auth.users.values()].find(u=>u.accountId===session?.accountId&&!u.disabled&&!u.mustChangePassword);
  product.gameplayUserFor = userFor;
  const modeClosed=id=>({error:ERR.MODE_CLOSED,detail:product.modes.reason(id)});
  if(product.emotePacks)product.emotePacks.onChange=()=>{const revision=product.emotePacks.catalog().revision;for(const session of registry.all()){const conn=network.conns.get(session.ws);if(session.connected&&conn)network.reply(conn,{t:'chatStickers.changed',revision});}};
  const adminContext=room=>({ranked:!!room.productRanked,enabled:product.contentCatalog.doc.adminControls?.testOperatorGrant===true,adminIds:room.seats.filter(s=>s&&!s.isBot&&userFor(registry.byId(s.playerId))?.role==='admin').map(s=>s.playerId)});
  const matchPresentation=(room,playerId)=>{
    const accountId=room?.productAccounts?.get(playerId);
    if(!accountId)return null;
    const presentation=product.community?.presentation(accountId)||null;
    const profile=product.ranked?.profile(accountId)||null;
    return {avatar:presentation?.avatar||null,frame:presentation?.frame||null,namecard:presentation?.namecard||null,
      rank:profile?.rank?{label:profile.rank.label,division:profile.rank.division||null,icon:profile.rank.icon||null}:null};
  };
  product.contentCatalog.onChange=()=>{for(const room of lobby.rooms.values())if(room.match){room.productAdminContext=adminContext(room);room.match.setProductAdminContext?.(room.productAdminContext);}};
  const wrap=(object,key,fn)=>{const original=object[key].bind(object);object[key]=(...args)=>fn(original,...args);};
  const policyVersions=()=>{
    const raw=lobby.versions?.welcome()||[];
    return raw.filter(v=>versions.permits(v.id)).map(v=>({...v,default:v.id===versions.defaultId}));
  };
  wrap(lobby,'defaultVersion',original=>versions.permits(versions.defaultId)?versions.defaultId:policyVersions()[0]?.id||original());
  wrap(lobby,'welcomeInfo',original=>({...original(),versions:policyVersions()}));
  const changed=versions.onChange;
  versions.onChange=view=>{changed?.(view);for(const session of registry.all()){const conn=network.conns.get(session.ws);if(session.connected&&conn)network.reply(conn,{t:'versions.policy',versions:policyVersions()});}};
  wrap(lobby,'create',(original,session,msg={})=>{
    if(!userFor(session))return fail('请重新登录');
    if(msg.variant&&!product.mizukiResuming?.has(session)&&!product.modes.permits(msg.variant))return modeClosed(msg.variant);
    const version=msg.version||lobby.defaultVersion();if(!versions.permits(version))return fail('此原游戏版本尚未开放');
    const result=original(session,{...msg,version});
    if(!result?.error){const room=lobby.roomOf(session);if(room){room.productRanked=false;room.productSelection=[];room.productSelectionRevision=product.contentCatalog.doc.revision;const toState=room.toState.bind(room);room.toState=now=>{const base=toState(now);return {...base,seats:base.seats.map(seat=>{const id=seat&&!seat.isBot?registry.byId(seat.playerId)?.accountId:null;return id&&product.community&&ranked?{...seat,presentation:{...product.community.presentation(id),accountId:id},competitive:ranked.profile(id)}:seat;}),ranked:room.productRanked===true,productContent:{revision:room.productSelectionRevision,ids:[...room.productSelection],version:room.version||DEFAULT_VERSION}};};lobby.broadcastState(room);}}
    return result;
  });
  wrap(lobby,'join',(original,session,msg)=>{
    const room=lobby.getRoom(msg.code);
    if(room?.variant&&!room.match&&!room.mizukiResumeRunId&&!product.modes.permits(room.variant))return modeClosed(room.variant);
    return original(session,msg);
  });
  function selectVersion(session,{version}){
    if(!userFor(session))return fail('请重新登录');
    const room=lobby.roomOf(session);if(!room)return fail('请先进入房间');
    if(room.spectatorOf(session.playerId)||room.hostId!==session.playerId)return fail('仅房主可以选择游戏版本');
    if(room.match)return fail('对局已开始，不能切换版本');
    if(room.variant)return fail('此独立玩法使用固定的原版游戏版本');
    if(!versions.permits(version)||!lobby.versionEnabled(version))return fail('此原游戏版本尚未开放');
    if(room.modded&&!room.productSelection?.length||!lobby.offered(version,room.mode).length||!lobby.versionAvailable(version))return fail('当前房间不支持此版本或版本数据尚未就绪');
    if(version===(room.version||DEFAULT_VERSION))return{ok:true};
    if(room.productSelection?.length)product.installContent?.(room,[]);
    room.productSelection=[];room.productSelectionRevision=product.contentCatalog.doc.revision;
    lobby.dropReplay(room,session.playerId);lobby.applyVersion(room,version,'host');return{ok:true};
  }
  wrap(lobby,'proposeVersion',(_original,session,msg)=>selectVersion(session,msg));
  wrap(lobby,'versionVote',()=>fail('游戏版本由房主在开局前选择，无需投票'));
  const rankedSeats=room=>room.seats.filter(Boolean).map(s=>({...s,accountId:s.isBot?null:registry.byId(s.playerId)?.accountId}));
  wrap(lobby,'handleMessage',(original,session,msg,ctx)=>{
    const user=userFor(session);if(!user)return fail('请重新登录');
    if(msg.t==='room.resume')return resume(session,msg.code);
    if(msg.t==='room.setVersion')return selectVersion(session,msg);
    if(msg.t==='room.setProductContent'){
      const room=lobby.roomOf(session);if(!room||room.spectatorOf(session.playerId)||room.hostId!==session.playerId)return fail('仅房主可以选择测试包');
      if(room.match)return fail('对局已开始，不能更改测试包');
      if(msg.version!==(room.version||DEFAULT_VERSION)||msg.revision!==product.contentCatalog.doc.revision)return fail('游戏版本或测试包设置已变化，请重新选择');
      try{const ids=product.contentCatalog.resolve(msg.ids,{version:room.version||DEFAULT_VERSION,admin:user.role==='admin',mode:room.mode,difficulty:room.difficulty,ranked:room.productRanked,variant:room.variant});
        if(!product.installContent&&ids.length)return fail('测试包运行数据尚未就绪');
        product.installContent?.(room,ids);room.productSelection=ids;room.productSelectionRevision=msg.revision;for(const seat of room.seats)if(seat&&!seat.isBot&&seat.playerId!==room.hostId)seat.ready=false;lobby.broadcastState(room);return{ok:true};
      }catch(error){return fail(error.message);}
    }
    if(msg.t==='room.versionVote'||msg.t==='room.cancelVersionVote')return fail('游戏版本由房主在开局前选择，无需投票');
    if(msg.t==='room.setRanked'){
      const room=lobby.roomOf(session);if(!room||room.spectatorOf(session.playerId)||room.hostId!==session.playerId)return fail('仅房主可以设置排位');
      if(room.match)return fail('对局已开始');
      if(room.variant)return fail('此独立玩法不支持排位');
      if(msg.on&&(room.test||room.seats.some(s=>s?.isBot)||room.difficulty==='FUNNY'))return fail('排位需要险境及以上、真人房间');
      room.productRanked=msg.on;for(const s of room.seats)if(s&&!s.isBot&&s.playerId!==room.hostId)s.ready=false;lobby.broadcastState(room);return{ok:true};
    }
    if(msg.t==='room.setPlugins'||msg.t==='room.consent')return fail('第一批暂未开放插件扩展');
    if(msg.t==='room.addBot')return fail('房间不允许添加 AI 队友');
    return original(session,msg,ctx);
  });
  wrap(lobby,'routeGame',(original,session,msg)=>{
    const room=lobby.roomOf(session),user=userFor(session);if(!user)return fail('请重新登录');
    if(msg.t==='g.adminOperatorsEnabled'||msg.t==='g.adminOperatorsClaim'){
      if(!room?.match)return fail('当前没有进行中的对局');
      if(user.role!=='admin'||room?.productRanked||product.contentCatalog.doc.adminControls?.testOperatorGrant!==true)return fail('管理员快捷领取未开放或账号无权限');
      room.productAdminContext=adminContext(room);room.match?.setProductAdminContext?.(room.productAdminContext);
    }
    if(room?.productRanked&&msg.t==='g.autoplay'&&user.role!=='admin')return fail('普通账号排位不能开启AI托管');
    return original(session,msg);
  });
  wrap(lobby,'startMatch',(original,room,key)=>{
    if(room.match)return fail('对局已经开始');
    if(room.variant&&!room.mizukiResumeRunId&&!product.modes.permits(room.variant))return modeClosed(room.variant);
    const seats=rankedSeats(room);
    if(room.mode==='coop'&&seats.some(s=>s.isBot))return fail('多人房间不允许 AI 队友，请移除后开始');
    try{
      if(room.productSelection?.length&&room.productSelectionRevision!==product.contentCatalog.doc.revision)return fail('测试包设置已变化，请重新选择');
      const owner=userFor(registry.byId(room.hostId));
      const productRules=product.contentCatalog.freeze(room.version||DEFAULT_VERSION,room.productSelection||[],{admin:owner?.role==='admin',mode:room.mode,difficulty:room.difficulty,ranked:room.productRanked,variant:room.variant});
      if(seats.some(s=>!s.isBot&&!userFor(registry.byId(s.playerId))))return fail('成员账号状态已变化，请重新登录');
      if(!room.variant) {
        if(room.productRanked){if(!ranked)return fail('排位未启用');room.productRecordId=ranked.start({mode:room.mode,difficulty:room.difficulty,roomCode:room.code,seats}).id;}
        else room.productRecordId=ranked?.recordStart({mode:room.mode,difficulty:room.difficulty,seats})||randomUUID();
      }
      room.productRecordVersion=room.version||DEFAULT_VERSION;room.productMainCleared=false;room.productAccounts=new Map(seats.filter(s=>!s.isBot).map(s=>[s.playerId,s.accountId]));
      room.productRules=productRules;
      room.productAdminContext=adminContext(room);
      const result=original(room,key);
      if(!result?.error&&room.match){room.match.productRanked=!!room.productRanked;room.match.productCanTestOperators=playerId=>product.contentCatalog.doc.adminControls?.testOperatorGrant===true&&userFor(registry.byId(playerId))?.role==='admin';room.match.isPackEmote=id=>product.emotePacks?.has(id)===true;room.match.playerPresentation=playerId=>matchPresentation(room,playerId);for(const p of room.match.order||[])room.match.markPrivate(p);}
      if(result?.error&&room.productRecordId){if(room.productRanked)ranked.voidMatch(room.productRecordId,'system','新引擎对局启动失败');else ranked?.recordInterrupt(room.productRecordId);room.productRecordId=null;}
      return result;
    }catch(e){if(room.productRecordId){if(room.productRanked)ranked?.voidMatch(room.productRecordId,'system','新引擎对局启动异常');else ranked?.recordInterrupt(room.productRecordId);room.productRecordId=null;}return fail(e.status?e.message:'结算存储不可用，未开始新对局');}
  });
  wrap(lobby,'onMatchEnd',(original,room,ctx,summary)=>{
    if(!ctx.ended&&ctx.live&&room.matchCtx===ctx&&room.productRecordId){
      const safe={...cleanPlayers(summary||{reason:'error',errors:1,players:[]}),rankMainCleared:!!room.productMainCleared,officialVersion:room.productRecordVersion,productRules:room.productRules,engine:'upstream-bfd2a920-product-v1'};
      const snapshot=lobby.dataFor(room);
      safe.players=safe.players.map(player=>({...player,...(player.lineup?{lineup:player.lineup.map(unit=>({...unit,name:snapshot?.chess?.[unit.id]?.name||unit.id}))}:{})}));
      if(!room.test&&!room.variant&&room.productAccounts)product.archive.recordSettlement({id:room.productRecordId,accounts:room.productAccounts,summary:safe,version:room.productRecordVersion,content:room.toState(Date.now()).content,mode:room.mode}).catch(error=>console.error('[achievements] 保存失败',error.message));
      if(room.productRanked)ranked?.finish(room.productRecordId,safe);else ranked?.recordFinish(room.productRecordId,safe);
      room.productRecordId=null;
    }
    return original(room,ctx,summary);
  });
  wrap(lobby,'removeMember',(original,room,playerId,...args)=>{if(room?.match&&room.productRanked&&room.productAccounts?.has(playerId)&&!room.spectatorOf(playerId))ranked?.markLeave(room.productRecordId,room.productAccounts.get(playerId),!!room.productMainCleared);return original(room,playerId,...args);});
  wrap(lobby,'matchSend',(original,room,ctx,pid,message,encoded)=>{
    if(message?.t==='m.private'){
      const user=userFor(registry.byId(pid));message={...message,productRanked:room.productRanked===true,productAutoplayAllowed:!room.productRanked||user?.role==='admin'};encoded=null;
    }
    if(message?.t==='m.result'&&room.productRanked){message={...message,productRecordId:room.productRecordId,competitivePending:true};encoded=null;}
    if(room.productRanked&&message?.t==='m.result'){message=cleanPlayers(message);encoded=null;}
    return original(room,ctx,pid,message,encoded);
  });
  wrap(lobby,'matchBroadcast',(original,room,ctx,message,encoded)=>{
    if(room.productRanked&&message?.t==='m.public'&&(message.phase==='HIDDEN_CORE'||message.phase==='FINAL_ASSAULT'&&message.bossHp?.hp===0))room.productMainCleared=true;
    if(room.productRanked&&['m.public','m.result'].includes(message?.t)){message=cleanPlayers(message);encoded=null;}return original(room,ctx,message,encoded);
  });
  attachMizukiProduct({lobby,registry,product});
  function resume(session,code){
    const current=lobby.roomOf(session);if(current?.match&&!current.spectatorOf(session.playerId))return fail('请先离开当前对局');
    const room=lobby.getRoom(code);if(!room)return fail('对局已结束或不存在');
    const candidates=room.seats.filter(s=>s&&!s.isBot&&!s.left).map(s=>registry.byId(s.playerId)).filter(s=>s?.accountId===session.accountId);
    if(candidates.length!==1)return fail('此账号没有唯一可恢复座位');const target=candidates[0];
    if(registry.isExpired(target,Date.now()))return fail('原座位已过期');
    if(target===session){lobby.resync(session,true);return{ok:true};}
    if(target.connected)return fail('该座位仍在线，请先退出另一客户端');
    if(current)lobby.removeMember(current,session.playerId);
    const conn=network.conns.get(session.ws);if(!conn)return fail('连接已失效');registry.remove(session);conn.session=null;
    network.onHelloMsg(conn,{t:'hello',name:target.name,token:target.token,version:PROTOCOL_VERSION},Date.now());return{ok:true};
  }
  product.resume=resume;
  product.accountSession=accountId=>{
    const sessions=[...registry.all()].filter(s=>s.accountId===accountId&&!registry.isExpired(s,Date.now()));
    // Never guess between pre-existing duplicate identities: that could abandon a live match.
    if(sessions.length>1)return{error:'此账号没有唯一可恢复座位'};
    return{session:sessions[0]||null};
  };
  product.currentRooms=accountId=>[...lobby.rooms.values()].filter(r=>!r.disposed&&!r.test&&(!r.modded||r.productSelection?.length)).slice(0,200).map(r=>({code:r.code,mode:r.mode,variant:r.variant,difficulty:r.difficulty,version:r.version,ranked:!!r.productRanked,inMatch:!!r.match,
    createdAt:r.createdAt??r.created??0,seats:r.seats.filter(Boolean).map(s=>({name:s.name,connected:!!s.connected,isBot:!!s.isBot})),spectators:r.spectators.length,
    own:r.seats.some(s=>s&&!s.isBot&&registry.byId(s.playerId)?.accountId===accountId),canJoin:!r.match&&r.mode==='coop'&&r.freeSeat()>=0&&(!r.variant||product.modes.permits(r.variant))}));
  return product;
}
