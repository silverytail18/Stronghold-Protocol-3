// Retained identity and history services. Game-engine admission and result adapters are separate.
import {MizukiStore} from './mizuki/store.js';
import {MizukiAdmin} from './mizuki/admin.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createAuth} from './auth.js';
import {Ranked} from './ranked.js';
import {inspectState} from './retention.js';
import {OfficialVersionPolicy} from './version-policy.js';
import {LoadoutPreferences} from './loadout-preferences.js';
import {ProductContentPolicy} from './content-policy.js';
import {ProductModePolicy} from './mode-policy.js';
import {ProductMusicPolicy} from './music-policy.js';
import {AccountArchive} from './account-archive.js';
import {PlayerData} from './player-data.js';
import {Community} from './community.js';
import {createEmotePacks} from './emote-packs.js';
import {MatchAppeals} from './appeals.js';
import {statePin} from './state-pin.js';
import {isAppRequest,isAccountResource} from './app-client.js';
import {VERSIONS,DEFAULT_VERSION} from '../../shared/versions.js';

export const ENGINE_GENERATION='upstream-bfd2a920-product-v1';
export async function createProductServices({root,env=process.env,initialVersions=null,available=()=>true,log=console,recoverCurrent=false}) {
  const inspected=await inspectState({project:root,env});
  let generation=null;
  try{generation=JSON.parse(await fs.readFile(path.join(inspected.paths.directory,'runtime-generation.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  if(generation&&(generation.format!==1||generation.engine!==ENGINE_GENERATION))throw Error('运行代际标记未知，拒绝自动处理旧对局');
  const pin=await statePin(root,inspected.paths,{generation,ranked:env.SP_RANKED!=='off'});
  if(!inspected.ready&&!(recoverCurrent&&generation?.engine===ENGINE_GENERATION))throw Error('旧数据仍有运行中对局、待结算或账号锁；请在原版本处理后再接入新底座');
  if(env.SP_AUTH==='off')throw Error('账号与客户端专用候选必须启用认证，拒绝匿名启动');
  const served=['public','data','shared','server','tools'].map(name=>path.join(root,name));
  const auth=await createAuth({usersFile:inspected.paths.usersFile,secureCookie:env.SP_AUTH_COOKIE_SECURE??'1',sessionTtlMs:Number(env.SP_AUTH_SESSION_HOURS??12)*3600_000},root,env.TRUST_PROXY??'auto',served);
  if(!auth)throw Error('认证被关闭，拒绝启动候选');
  let ranked, mizuki;
  try {
    const requested=String(env.SP_VERSIONS||'all').trim();
    const enabled=requested.toLowerCase()==='all'?VERSIONS.map(v=>v.id):requested.split(',').map(id=>id.trim());
    const initial=initialVersions||{enabled,default:env.SP_VERSION_DEFAULT||(enabled.includes(DEFAULT_VERSION)?DEFAULT_VERSION:enabled[0])};
    const versions=await OfficialVersionPolicy.load({filename:path.join(inspected.paths.directory,'official-versions.json'),catalog:VERSIONS,initial,available});
    const loadouts=await LoadoutPreferences.load(path.join(inspected.paths.directory,'operator-loadouts.json'),served);
    ranked=env.SP_RANKED==='off'?null:new Ranked({filename:inspected.paths.rankedFile,auth,log,servedRoots:served,maxMatches:env.SP_RANKED_MAX_MATCHES??4});
    const contentCatalog=await ProductContentPolicy.load(inspected.paths.directory);
    const modes=await ProductModePolicy.load(inspected.paths.directory);
    mizuki=new MizukiStore(path.join(inspected.paths.directory,'mizuki.sqlite'));
    mizuki.db.prepare("UPDATE runs SET status='suspended' WHERE status='running'").run();
    const music=await ProductMusicPolicy.load(inspected.paths.directory);contentCatalog.music=music;
    const archive=await AccountArchive.load(inspected.paths.directory);
    const playerData=new PlayerData({auth,ranked,archive,loadouts});
    const community=ranked?new Community({ranked,auth,playerData}):null;
    const appeals=ranked?new MatchAppeals({ranked,log}):null;
    if(appeals)playerData.appeals=appeals;
    const emotePacks=await createEmotePacks({directory:inspected.paths.directory,log});
    if(ranked)ranked.onlineStatus=id=>playerData.onlineStatus?.(id)===true;
    await pin.save();
    archive.publicRecords=id=>playerData.view(id).records;
    const services = {auth,ranked,versions,loadouts,contentCatalog,modes,mizuki,music,archive,playerData,community,emotePacks,appeals,paths:inspected.paths,
      async route(req,res,pathname) {
        const send=(status,body)=>{const bytes=Buffer.from(JSON.stringify(body));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);};
        if(pathname==='/auth/admin/mizuki-control'){await new MizukiAdmin(services).handle(req,res);return true;}
        if(isAppRequest(req)&&isAccountResource(pathname)&&pathname!=='/auth/password'){send(403,{error:'请使用浏览器管理账号'});return true;}
        if(pathname.startsWith('/chat-stickers/')||pathname==='/auth/admin/chat-stickers'||pathname.startsWith('/auth/admin/chat-stickers/')){await emotePacks.handle(req,res,pathname,auth);return true;}
        if(pathname.startsWith('/product/match-appeal')||pathname==='/auth/admin/match-appeals'||pathname.startsWith('/auth/admin/match-appeals/')){if(!appeals)send(503,{error:'申诉服务未启用'});else await appeals.handle(req,res,pathname,auth);return true;}
        if(pathname==='/auth/admin/mizuki-status'){
          auth.authorize(auth.session(req),true);
          if(isAppRequest(req)){send(403,{error:'请使用浏览器查看存档诊断'});return true;}
          if(!['GET','HEAD'].includes(req.method)){send(405,{error:'Method not allowed'});return true;}
          send(200,{...mizuki.diagnostics(),resourceReady:services.mizukiResourceReady===true,resourceHash:services.mizukiResourceHash||null,workers:services.mizukiHosts?.hosts.size||0});return true;
        }
        if(pathname==='/product/mizuki/profile'||pathname==='/product/mizuki/history'){
          const user=auth.authorize(auth.session(req));
          if(!['GET','HEAD'].includes(req.method)){send(405,{error:'Method not allowed'});return true;}
          if(pathname.endsWith('/history'))send(200,{records:mizuki.history(user.accountId)});
          else {const active=mizuki.active(user.accountId);send(200,{resourceReady:services.mizukiResourceReady===true,resourceHash:services.mizukiResourceHash||null,profile:mizuki.profile(user.accountId),active:active?{id:active.id,status:active.status,rulesVersion:active.rulesVersion,updatedAt:active.updatedAt,difficultyGrade:active.options.mizukiDifficultyGrade,phase:active.checkpoint?.phase}:null});}
          return true;
        }
        if(pathname.startsWith('/community/')){if(community)await community.handle(req,res);else send(503,{error:'资料服务未启用'});return true;}
        if(['/auth/player-stats','/auth/admin/player-data'].includes(pathname)){await playerData.handle(req,res,pathname);return true;}
        if(['/product/achievements','/product/feedback','/auth/admin/feedback'].includes(pathname)){await archive.handle(req,res,pathname,auth);return true;}
        if(pathname==='/auth/admin/content-status'){
          try{if(isAppRequest(req))throw Object.assign(Error('请使用浏览器管理内容'),{status:403});await contentCatalog.handle(req,res,auth);}
          catch(error){if(!error.status)throw error;send(error.status,{error:error.message});}return true;
        }
        if(pathname==='/auth/admin/game-versions'){if(isAppRequest(req))send(403,{error:'请使用浏览器管理版本'});else await versions.handle(req,res,auth);return true;}
        if(pathname==='/auth/admin/gameplay-modes'){if(isAppRequest(req))send(403,{error:'请使用浏览器管理玩法'});else await modes.handle(req,res,auth);return true;}
        if(pathname==='/auth/admin/music'){if(isAppRequest(req))send(403,{error:'请使用浏览器管理音乐'});else await music.handle(req,res,auth);return true;}
        if(pathname.startsWith('/ranked/')||pathname==='/auth/admin/ranked'||pathname.startsWith('/auth/admin/ranked/')){
          if(!ranked)send(503,{error:'排位服务未启用'});else await ranked.handle(req,res);return true;
        }
        if(pathname.startsWith('/auth/')){await auth.handle(req,res,pathname);return true;}
        return false;
      },
      async markGeneration(){const file=path.join(inspected.paths.directory,'runtime-generation.json');if(!generation){await fs.mkdir(inspected.paths.directory,{recursive:true,mode:0o700});await fs.writeFile(file,JSON.stringify({format:1,engine:ENGINE_GENERATION})+'\n',{flag:'wx',mode:0o600});}},
      async close(){
        const saves=await Promise.allSettled([archive.queue,loadouts.queue,modes.queue]);
        let pinError;try{await pin.save();}catch(error){pinError=error;}
        try{ranked?.close({clearUnfinished:true});}finally{mizuki?.close();auth.close();}
        if(pinError)throw pinError;
        const failed=saves.find(result=>result.status==='rejected');if(failed)throw failed.reason;
      },
    };
    return services;
  }catch(e){mizuki?.close();ranked?.close();auth.close();throw e;}
}
