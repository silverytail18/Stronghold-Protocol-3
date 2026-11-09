import test from 'node:test';import assert from 'node:assert/strict';
import {makeMatch} from '../match/harness.js';
import {S2C,validateC2S} from '../../shared/protocol.js';
import {validHostMessage} from '../../server/match/host/ipc.js';
import {EMOTES} from '../../shared/constants.js';
import {CHAT_KEEP} from '../../shared/chat.js';
test('match text chat validates, rate limits, retains bounded history and leaves emotes available',()=>{
  const h=makeMatch({mode:'coop',humans:2,fake:true});
  try{
    assert.ok(S2C.includes('m.chat')&&S2C.includes('m.chatHistory')&&S2C.includes('chatStickers.changed'));
    assert.equal(validHostMessage({type:'broadcast',matchId:'m1',msg:{t:'m.chat',seq:1,playerId:'p_0',name:'P0',text:'一起防守',at:1}}),true);
    assert.equal(validHostMessage({type:'send',matchId:'m1',playerId:'p_0',msg:{t:'m.chatHistory',messages:[]}}),true);
    assert.equal(validateC2S({t:'g.chat',text:'一起防守'}),null);
    assert.ok(validateC2S({t:'g.chat',text:'x'.repeat(401)}));
    assert.ok(!h.m.handle('p_0',{t:'g.chat',text:' <img onerror=x>\u0000一起防守 '}).error);
    assert.equal(h.bc.at(-1).t,'m.chat');assert.equal(h.bc.at(-1).name,'P0');assert.equal(h.bc.at(-1).text,'<img onerror=x> 一起防守');
    assert.ok(h.m.handle('p_0',{t:'g.chat',text:'重复'}).error);
    assert.ok(!h.m.handle('p_0',{t:'g.emote',id:EMOTES[0]}).error);
    h.m.isPackEmote=id=>id==='sifeng_win';
    h.ps('p_0').lastEmoteAt=-Infinity;
    assert.ok(!h.m.handle('p_0',{t:'g.emote',id:'sifeng_win'}).error);
    assert.equal(h.bc.at(-1).id,'sifeng_win');
    assert.ok(h.m.handle('p_0',{t:'g.emote',id:'pack.missing.0'}).error);
    // a hosted match has no pack index in the worker: the shape is accepted, a malformed id is not.
    delete h.m.isPackEmote;
    h.ps('p_0').lastEmoteAt=-Infinity;
    assert.ok(!h.m.handle('p_0',{t:'g.emote',id:'pack.demo.0'}).error);
    assert.equal(h.bc.at(-1).id,'pack.demo.0');
    h.ps('p_0').lastEmoteAt=-Infinity;
    assert.ok(h.m.handle('p_0',{t:'g.emote',id:'pack.BAD!'}).error);
    h.m.playerPresentation=()=>({avatar:'char_1001_amiya2',frame:'gold',namecard:'milestone_gold',rank:{label:'黄金I',division:'gold'}});
    h.ps('p_0').lastChatAt=-Infinity;
    assert.ok(!h.m.handle('p_0',{t:'g.chat',text:'带身份'}).error);
    assert.equal(h.bc.at(-1).frame,'gold');
    assert.equal(h.bc.at(-1).namecard,'milestone_gold');
    assert.equal(h.bc.at(-1).rank.label,'黄金I');
    assert.ok(h.m.handle('outsider',{t:'g.chat',text:'不应发送'}).error);
    for(let i=0;i<CHAT_KEEP+2;i++){h.ps('p_1').lastChatAt=-Infinity;h.m.handle('p_1',{t:'g.chat',text:'消息'+i});}
    assert.equal(h.m.chatMessages.length,CHAT_KEEP);
    h.m.onReconnect('p_1');assert.ok(h.sent.some(([id,m])=>id==='p_1'&&m.t==='m.chatHistory'&&m.messages.length===CHAT_KEEP));
  }finally{h.m.dispose();}
});
