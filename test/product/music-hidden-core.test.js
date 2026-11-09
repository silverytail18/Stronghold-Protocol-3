import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';
import {hiddenCoreMusicCandidates,MUSIC_CATALOG} from '../../shared/music.js';
import {ProductMusicPolicy} from '../../server/product/music-policy.js';
import {makeMatch} from '../match/harness.js';
const id='nan-wang-jin-xiao',rule={[id]:{enabled:true,probability:100}},members=[{playerId:'a',alive:true,lp:1},{playerId:'b',alive:true,lp:30}];
test('hidden core requires every original human alive, including left/dead players, and only coop hidden round',()=>{
 const input={mode:'coop',round:15,hiddenRound:15,players:members};assert.deepEqual(hiddenCoreMusicCandidates(input),[{playerId:'$room',trackId:id}]);
 for(const patch of [{mode:'solo'},{round:14},{hiddenRound:null},{players:[]},{players:[{isBot:true,alive:true,lp:30}]}])assert.deepEqual(hiddenCoreMusicCandidates({...input,...patch}),[]);
 for(const patch of [{alive:false},{left:true},{lp:0},{lp:-1},{lp:NaN}])assert.deepEqual(hiddenCoreMusicCandidates({...input,players:[members[0],{...members[1],...patch}]}),[]);
 assert.equal(hiddenCoreMusicCandidates({...input,players:[members[0]]}).length,1,'one human in coop still uses coop music');
 assert.equal(hiddenCoreMusicCandidates({...input,players:[{...members[0],connected:false},members[1]]}).length,1,'alive disconnected player is still a member');
});
test('real product Match round entry emits one collective song and ticker; normal boss and lost member never qualify',()=>{
 for(const lost of [null,'dead','left']){
  const h=makeMatch({mode:'coop',humans:2,fake:true,musicRules:rule});try{
   h.start();h.toPrep(1);const m=h.m,p=h.ps('p_1');assert.ok(m.gd.hiddenRound);m.productMusic.round();
   assert.equal(m.productMusic.pending.length,0);m.round=m.gd.bossRound;m.productMusic.round();assert.equal(m.productMusic.pending.length,0);
   if(lost==='dead'){p.alive=false;p.lp=0;}if(lost==='left')p.left=true;
   // Invoke the actual post-offer round transition, whose product hook performs the entry check.
   m._startRoundAfterOffers(m.gd.hiddenRound);m.flush(true);m.productMusic.round();m.flush(true);
   const songs=h.bc.filter(x=>x.t==='m.musicPlay'&&x.trackId===id),notices=h.bc.filter(x=>x.t==='m.ticker'&&x.text?.includes('难忘今宵'));
   assert.equal(songs.length,lost?0:1);assert.equal(notices.length,lost?0:1);
   if(!lost){assert.equal(songs[0].scopeRoundId,m.gd.hiddenRound);assert.equal(songs[0].endRoundId,m.gd.hiddenRound);assert.equal(notices[0].text,'全体玩家为大家点播《难忘今宵》');m.onReconnect('p_0');m.flush(true);assert.equal(h.bc.filter(x=>x.t==='m.musicPlay'&&x.trackId===id).length,1);}
  }finally{h.m.dispose();}
 }
});
test('new song keeps disabled/probability gates and shares existing one-song lottery with hidden entry conditions',()=>{
 for(const enabled of [false,true]){const h=makeMatch({mode:'coop',humans:2,fake:true,musicRules:{[id]:{enabled,probability:0}}});try{h.start();h.toPrep(1);h.m.round=h.m.gd.hiddenRound;h.m.productMusic.round();assert.equal(h.m.productMusic.pending.length,0);}finally{h.m.dispose();}}
 const h=makeMatch({mode:'coop',humans:2,fake:true,musicRules:{...rule,'ci-jiu-men':{enabled:true,probability:100}}});try{h.start();h.toPrep(1);h.m.round=h.m.gd.hiddenRound;h.m.productMusic.engine.random=()=>.99;h.m.productMusic.round();assert.equal(h.m.productMusic.pending.length,1);assert.ok(h.m.productMusic.engine.used('$room',id));}finally{h.m.dispose();}
});
test('legacy settings add only the new default in memory, preserve explicit opt-out and never rewrite on read',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-hidden-music-'));try{
  const filename=path.join(dir,'music-rules.json'),doc={format:1,revision:8,rules:{'yu-ai':{enabled:false,probability:23},future:{keep:1}},keep:true};await fs.writeFile(filename,JSON.stringify(doc));const before=await fs.readFile(filename);
  const p=await ProductMusicPolicy.load(dir);assert.deepEqual(p.frozen(),{'yu-ai':{enabled:false,probability:23},...rule,'cha-yi-bu':{enabled:true,probability:100},'guan-yu-zhi-ge':{enabled:true,probability:100},'tian-liang-yi-qian-shuo-zai-jian':{enabled:true,probability:100},'gu-yong-zhe':{enabled:true,probability:100},'pi-pa-qu':{enabled:true,probability:100},'you-shan-lian':{enabled:true,probability:100}});assert.equal(p.view().tracks.length,21);assert.match(p.view().tracks.find(t=>t.id===id).condition,/全部真人成员/);assert.deepEqual(await fs.readFile(filename),before);
  doc.rules[id]={enabled:false,probability:17};await fs.writeFile(filename,JSON.stringify(doc));const q=await ProductMusicPolicy.load(dir);assert.deepEqual(q.frozen()[id],doc.rules[id]);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('new audio registration, runtime asset index and real MP3 bytes agree',async()=>{
 const catalog=JSON.parse(await fs.readFile('tools/assets/custom-music.json','utf8')),assets=JSON.parse(await fs.readFile('data/assets.json','utf8'));
 assert.equal(MUSIC_CATALOG.length,21);assert.equal(catalog[id].name,'难忘今宵');assert.deepEqual(assets.audio.musicCatalog[id],catalog[id]);
 const bytes=await fs.readFile('public'+catalog[id].file);assert.equal(bytes.length,catalog[id].bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog[id].sha256);
});
