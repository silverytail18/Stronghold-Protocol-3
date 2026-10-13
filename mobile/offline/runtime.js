import {Match} from './engine/server/match/Match.js';
import {TestContent} from './engine/server/test-content.js';
import {validateC2S,checkLoadout} from './engine/shared/protocol.js';
import {skinIds} from './engine/shared/skins.js';
import {modeIdFor,ERR} from './engine/shared/constants.js';
import {setSimData} from './engine/server/sim/simdata.js';
import {loadoutCatalogFor,matchLoadout} from './engine/server/sim/content/expansion/loadout-catalog.js';

// A local transport adapter, not a network server. No account/rank/persistence services are imported.
export class OfflineRuntime {
  constructor(data, emit, options = {}) {
    this.data=data;this.emit=emit;this.options=options;this.catalog=new TestContent();
    this.playerId='offline_doctor';this.name='单机博士';this.room=null;this.match=null;
    this.loadout={};this.matchNo=0;this.hello=false;this.ended=false;
  }
  roomState() {
    if (!this.room) return;
    this.emit({t:'room.state',code:this.room.code,hostId:this.playerId,mode:'solo',difficulty:this.room.difficulty,
      inMatch:!!this.match&&!this.ended,ranked:false,testMenu:this.catalog.menu(this.room,{admin:true}),
      seats:[{seat:0,playerId:this.playerId,name:this.name,isBot:false,ready:true,connected:true},null,null,null]});
  }
  receive(msg) {
    try {
      const invalid=validateC2S(msg);
      if(invalid)return this.reply(msg,{error:ERR.BAD_MSG,detail:invalid});
      if(msg.t==='ping'){this.emit({t:'pong',c:msg.c,s:Date.now()});return;}
      if(msg.t==='hello') {
        this.name=msg.name.trim();this.hello=true;
        this.emit({t:'welcome',rid:msg.rid,playerId:this.playerId,name:this.name,token:'0'.repeat(64),serverNow:Date.now()});
        this.roomState();if(this.match&&!this.ended)this.match.onReconnect(this.playerId);return;
      }
      if(!this.hello)return this.reply(msg,{error:ERR.BAD_MSG,detail:'本地会话未就绪'});
      let result={ok:true};
      switch(msg.t) {
        case 'room.create':
          if(msg.mode!=='solo'||msg.ranked)throw new Error('单机版只开放独立模拟，不连接联机或排位服务');
          if(this.room)throw new Error('请先离开当前模拟');
          this.room={code:'SOLO',mode:'solo',difficulty:msg.difficulty};this.ended=false;this.roomState();break;
        case 'room.setDifficulty':
          if(!this.room||this.match&&!this.ended)throw new Error('当前不能更改难度');
          this.room.difficulty=msg.difficulty;this.roomState();break;
        case 'room.ready':this.roomState();break;
        case 'room.loadout': {
          const running=this.match&&!this.ended;
          const expanded=running&&this.match.testRules?.batches?.some(b=>['arknights-expansion-v1','rhodes-mujica-v1'].includes(b.id));
          const data=expanded?this.match.data:loadoutCatalogFor(this.data);
          const checked=checkLoadout(msg.entries,id=>data.chess?.[id],base=>skinIds(data.assets,base));
          if(checked.error)throw new Error(checked.detail||checked.error);
          if(running)result=this.match.setLoadout(this.playerId,matchLoadout(checked.loadout,this.match.data.chess));
          if(!result.error&&!expanded)this.loadout=checked.loadout;break;
        }
        case 'room.start':this.start(msg.tests);break;
        case 'room.leave':case 'g.leave':this.leave();break;
        default:
          if(this.ended&&(msg.t==='b.progress'||msg.t==='b.result'))break;
          if(!this.match||this.ended)throw new Error('当前没有进行中的模拟');
          if(!msg.t.startsWith('g.')&&!msg.t.startsWith('b.'))throw new Error('单机版不支持此操作');
          if(msg.t==='g.pause'){result=this.match.setPause(this.match.players.get(this.playerId),msg.on);this.match.flush();}
          else result=this.match.handle(this.playerId,msg)||{ok:true};
      }
      this.reply(msg,result);
    } catch(error) {this.reply(msg,{error:ERR.BAD_MSG,detail:error.message});}
  }
  reply(msg,result) {
    if(result?.error)this.emit({t:'error',rid:msg?.rid,code:result.error,detail:result.detail,msg:result.detail||'本地操作失败'});
    else if(msg?.rid!=null)this.emit({t:'ok',rid:msg.rid});
  }
  start(selection) {
    if(!this.room||this.match&&!this.ended)throw new Error('当前不能开始模拟');
    const {data,manifest}=this.catalog.resolve(selection||{version:this.catalog.version,ids:[]},this.room,this.data,{admin:true});
    setSimData(data);
    this.match?.dispose();this.ended=false;
    const seed=this.options.seed??crypto.getRandomValues(new Uint32Array(1))[0];
    this.match=new Match({
      ...this.options,roomCode:this.room.code,mode:'solo',difficulty:this.room.difficulty,modeId:modeIdFor('solo',this.room.difficulty),
      seats:[{seat:0,playerId:this.playerId,name:this.name,isBot:false,connected:true,loadout:matchLoadout(this.loadout,data.chess)}],
      seed,matchNo:++this.matchNo,data,testRules:manifest,log:console,now:this.options.now||Date.now,
      clientCombat:this.options.clientCombat??true,verify:'off',canTestOperators:()=>true,
      send:(_id,msg)=>{this.emit(msg);return true;},broadcast:msg=>this.emit(msg),
      onEnd:()=>{this.ended=true;this.roomState();const endedMatch=this.match;setTimeout(()=>endedMatch?.dispose(),0);},
    });
    this.roomState();this.match.start();
  }
  suspend() {
    if(this.match&&!this.ended){this.match.setPause(this.match.players.get(this.playerId),true);this.match.flush();}
  }
  leave() {
    this.match?.dispose();this.match=null;this.room=null;this.ended=false;this.emit({t:'room.closed',reason:'left'});
  }
  dispose() {this.match?.dispose();this.match=null;}
}
