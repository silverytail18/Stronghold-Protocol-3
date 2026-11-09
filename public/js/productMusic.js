import {audio} from './audio.js';
import {store} from './store.js';
import {net} from './net.js';
import {data} from './data.js';
import {musicPlaybackActive,musicTrack} from '../../shared/music.js';
import {t} from '../../shared/i18n.js';
// A rule song uses the upstream BGM mixer. The media element streams decoded audio, avoiding a whole-song PCM cache.
class EventMusic {
  constructor(){this.sequence=new Map();this.generation=0;this.enabled=true;this.volume=.6;this.listeners=new Set();try{this.enabled=localStorage.getItem('product.ruleMusic')!=='off';const v=localStorage.getItem('product.ruleMusic.volume');if(v!==null&&Number.isFinite(Number(v)))this.volume=Math.max(0,Math.min(1,Number(v)));}catch{ /* storage unavailable */ }}
  subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  notify(){for(const fn of this.listeners)fn();}
  setVolume(value){if(!Number.isFinite(value))return;this.volume=Math.max(0,Math.min(1,value));try{localStorage.setItem('product.ruleMusic.volume',String(this.volume));}catch{/* session preference */}if(this.gain&&audio.ctx)this.gain.gain.setTargetAtTime(this.volume**2*.55*(this.trackGain||1),audio.ctx.currentTime,.03);this.notify();}
  install(){
    const original=audio.playBgm.bind(audio);this.resume=()=>original(audio.lastBgmKey);
    audio.playBgm=key=>{if(this.command){audio.lastBgmKey=key;return;}original(key);};
    net.on('m.musicPlay',msg=>this.receive(msg));
    store.subscribe(()=>{const pub=store.get().match?.public;if(this.command&&!this.command.preview&&(!pub||pub.musicMatchId!==this.command.matchId||!musicPlaybackActive(this.command,pub.round)))this.stop();if(this.command?.preview&&store.get().room?.inMatch)this.stop();if(this.pending){const message=this.pending;if(!pub||pub.musicMatchId!==message.matchId||pub.round>message.scopeRoundId)this.pending=null;else if(pub.round===message.scopeRoundId){this.pending=null;this.play(message);}}});
  }
  toggle(){this.enabled=!this.enabled;try{localStorage.setItem('product.ruleMusic',this.enabled?'on':'off');}catch{ /* storage unavailable */ }if(!this.enabled)this.stop();this.notify();}
  async preview(trackId){if(store.get().productAccount?.role!=='admin'||store.get().room?.inMatch)throw Error(t('试听仅供管理员在局外使用'));await audio._unlock();if(!await this.play({trackId,preview:true}))throw Error(t('无法试听，请检查本地音乐资源'));}
  async receive(command){
    const pub=store.get().match?.public;
    if(!pub||pub.musicMode!=='coop'||command.matchId!==pub.musicMatchId||![pub.round,pub.round+1].includes(command.scopeRoundId)||!musicTrack(command.trackId)||!Number.isSafeInteger(command.sequence)||command.sequence<1||command.sequence<=(this.sequence.get(command.matchId)||0))return;
    this.sequence.set(command.matchId,command.sequence);if(this.sequence.size>12)this.sequence.delete(this.sequence.keys().next().value);
    if(command.scopeRoundId>pub.round){this.pending=command;return;}
    return this.play(command);
  }
  async play(command){
    if(!this.enabled||!audio.ctx||audio.volumes.muted)return;
    const entry=data.get('assets')?.audio?.musicCatalog?.[command.trackId];
    if(!entry?.file?.startsWith('/assets/audio/music/'))return;
    this.stop();const generation=++this.generation;this.command=command;
    try{
      const response=await fetch(entry.file);if(!response.ok)throw Error('Song unavailable');const blob=await response.blob();
      if(generation!==this.generation)return;
      this.url=URL.createObjectURL(blob);const player=document.createElement('audio');this.player=player;player.src=this.url;player.preload='auto';
      const source=audio.ctx.createMediaElementSource(player);this.source=source;this.gain=audio.ctx.createGain();this.trackGain=entry.gain||1;this.gain.gain.value=this.volume**2*.55*this.trackGain;source.connect(this.gain);this.gain.connect(audio.master);
      ++audio.bgmToken;audio._fadeOutBgm();player.onended=()=>this.stop();player.onerror=()=>this.stop();await player.play();this.notify();return true;
    }catch{if(generation===this.generation)this.stop();return false;}
  }
  stop(){++this.generation;const had=this.command;this.command=null;if(this.player){this.player.pause();this.player.removeAttribute('src');this.player.load();this.player=null;}this.source?.disconnect();this.source=null;this.gain?.disconnect();this.gain=null;if(this.url)URL.revokeObjectURL(this.url);this.url=null;if(had)this.resume?.();this.notify();}
}
export const eventMusic=new EventMusic();
