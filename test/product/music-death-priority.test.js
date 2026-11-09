import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MatchMusic} from '../../server/match/music.js';
import {MusicAdapter} from '../../server/match/musicAdapter.js';
import {installProductMusic} from '../../server/match/productMusic.js';
import {PHASE} from '../../shared/constants.js';

test('death candidates use the battle-start core population even after elimination clears bonds',()=>{
  for(const [count,active,core,expected] of [[5,true,true,true],[4,true,true,false],[6,true,true,false],[5,false,true,false],[5,true,false,false]]){
    const p={playerId:'p',alive:true,lp:10,bonds:{bond:{count,active}},board:new Map(),hand:[],temp:[]};
    const m={roomCode:'r',seed:1,opts:{musicRules:{}},mode:'coop',round:3,order:[p],gd:{bond:()=>({isCore:core})}};
    const a=new MusicAdapter(m);a.battle();p.lp=0;p.bonds={};a.settle([{ps:p,counted:1,saved:false}]);
    const delayed=a.engine.delayed.get(4);
    assert.equal(delayed.has('cha-yi-bu'),expected);assert.equal(delayed.has('tian-liang-yi-qian-shuo-zai-jian'),expected);assert.equal(delayed.get('yu-ai'),'p');assert.equal(delayed.get('guan-yu-zhi-ge'),'p');
  }
});

test('both new songs are indexed with matching audio bytes',async()=>{
  const catalog=JSON.parse(await fs.readFile('tools/assets/custom-music.json','utf8'));
  const assets=JSON.parse(await fs.readFile('data/assets.json','utf8'));
  for(const id of ['cha-yi-bu','guan-yu-zhi-ge','tian-liang-yi-qian-shuo-zai-jian','gu-yong-zhe','pi-pa-qu','you-shan-lian']){
    assert.deepEqual(assets.audio.musicCatalog[id],catalog[id]);
    const bytes=await fs.readFile('public'+catalog[id].file);
    assert.equal(bytes.length,catalog[id].bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog[id].sha256);
  }
});

test('ten consecutive individual wins are deferred, independent and consumed once',()=>{
  for(const mode of ['coop','solo']){
    const players=['a','b'].map(playerId=>({playerId,alive:true,lp:30}));
    const m={roomCode:'r',seed:1,opts:{musicRules:{'pi-pa-qu':{enabled:true,probability:100}}},mode,round:1,order:players};
    const a=new MusicAdapter(m);
    for(let round=1;round<=10;round++){
      m.round=round;
      a.settle(players.map((ps,i)=>({ps,counted:0,won:i===0||round!==5})));
      if(round<10)assert.equal(a.engine.used('a','pi-pa-qu'),false);
    }
    assert.equal(a.engine.used('a','pi-pa-qu'),mode==='coop');
    assert.equal(a.engine.used('b','pi-pa-qu'),false);
    if(mode==='coop'){
      assert.equal(a.engine.delayed.get(11).get('pi-pa-qu'),'a');
      const song=a.engine.batch('round:11',11,[],{includeDeferred:true});
      assert.equal(song.trackId,'pi-pa-qu');assert.equal(song.scopeRoundId,11);
    }
    m.round=11;a.settle([{ps:players[0],counted:0,won:true}]);
    assert.equal(a.engine.delayed.get(12)?.has('pi-pa-qu')??false,false);
  }
});

test('a loss, missing result or skipped round interrupts the win streak',()=>{
  for(const interruption of ['loss','missing','skip']){
    const p={playerId:'p',alive:true,lp:30},m={roomCode:'r',seed:1,opts:{musicRules:{}},mode:'coop',round:1,order:[p]},a=new MusicAdapter(m);
    for(let round=1;round<=10;round++){
      m.round=round;
      if(interruption==='skip'&&round===5)continue;
      a.settle([{ps:p,counted:0,won:round===5?(interruption==='loss'?false:undefined):true}]);
      if(round===4)a.settle([{ps:p,counted:0,won:true}]);
    }
    assert.equal(a.engine.used('p','pi-pa-qu'),false);
  }
});

test('settlement reads real normal combat results and rejects synthetic or incomplete results',()=>{
  class Fixture {
    dispatch(){} _startRoundAfterOffers(){} startCombat(){} startFinalAssault(){} _collectSimErrors(){} settle(){} flush(){} publicView(){return {};}
    alivePlayers(){return this.order;}
  }
  installProductMusic(Fixture);
  for(const [result,won] of [
    [{perPlayer:{p:{perfect:true,leaked:[]}}},true],
    [{perPlayer:{p:{perfect:true,leaked:[{counted:false}]}}},true],
    [{perPlayer:{p:{perfect:true,leaked:[{}]}}},false],
    [{perPlayer:{p:{perfect:false,leaked:[]}}},false],
    [{perPlayer:{p:{perfect:true,leaked:[],leaderLpLoss:1}}},false],
    [{synthetic:true,perPlayer:{p:{perfect:true,leaked:[]}}},false],
    [{perPlayer:{}},false],
  ]){
    const p={playerId:'p',alive:true,lp:30},m=new Fixture();
    Object.assign(m,{roomCode:'r',seed:1,opts:{musicRules:{}},mode:'coop',round:1,phase:PHASE.COMBAT,order:[p],players:new Map(),lastResults:new Map([['p',result.perPlayer.p||{leaked:[]} ]])});
    m.productMusic=new MusicAdapter(m);m._collectSimErrors({players:['p']},result);m.settle(null,null);
    assert.equal(m.productMusic.winStreak.get('p').count,won?1:0);
  }
});

test('last surviving human is nominated only when another human dies in this settlement',()=>{
  const alive=id=>({playerId:id,alive:true,lp:10});
  const dead=id=>({playerId:id,alive:false,lp:0});
  for(const [players,rows,expected] of [
    [[alive('a'),dead('b')],['b'],'a'],
    [[alive('a'),alive('c'),dead('b')],['b'],null],
    [[dead('a'),dead('b')],['a','b'],null],
    [[alive('a')],['a'],null],
    [[alive('a'),{...dead('b'),left:true}],['b'],null],
    [[alive('a'),{...dead('b'),isBot:true}],['b'],null],
  ]){
    const m={roomCode:'r',seed:1,opts:{musicRules:{}},mode:'coop',round:3,order:players};
    const a=new MusicAdapter(m);a.settle(rows.map(id=>({ps:players.find(p=>p.playerId===id),counted:1,saved:false})));
    assert.equal(a.engine.delayed.get(4)?.get('gu-yong-zhe')??null,expected);
  }
});

test('eligible songs prefer highest probability, ties are random, and failed rolls do not block lower probability',()=>{
  const candidates=[{playerId:'p',trackId:'yu-ai'},{playerId:'p',trackId:'guan-yu-zhi-ge'},{playerId:'p',trackId:'cha-yi-bu'}];
  const run=(probabilities,values)=>{const rules=Object.fromEntries(candidates.map((c,i)=>[c.trackId,{enabled:true,probability:probabilities[i]}]));const music=new MatchMusic({matchId:'x',mode:'coop',rules,random:()=>values.shift()??0});const result=music.batch('b',1,candidates);for(const c of candidates)assert.ok(music.used(c.playerId,c.trackId));return result?.trackId;};
  assert.equal(run([50,80,20],[0,0,0,0]),'guan-yu-zhi-ge');
  assert.equal(run([100,100,0],[0.99]),'guan-yu-zhi-ge');
  assert.equal(run([30,80,0],[0,0.99,0]),'yu-ai');
});

test('both five-member death songs enter the same next-round lottery and are consumed',()=>{
  const ids=['cha-yi-bu','tian-liang-yi-qian-shuo-zai-jian'];
  for(const random of [0,0.99]){
    const rules=Object.fromEntries(ids.map(id=>[id,{enabled:true,probability:100}]));
    const music=new MatchMusic({matchId:'x',mode:'coop',rules,random:()=>random});
    music.defer('settle:3',4,ids.map(trackId=>({playerId:'p',trackId})));
    assert.equal(music.batch('round:4',4,[],{includeDeferred:true}).trackId,ids[random===0?0:1]);
    for(const id of ids)assert.ok(music.used('p',id));
  }
});
