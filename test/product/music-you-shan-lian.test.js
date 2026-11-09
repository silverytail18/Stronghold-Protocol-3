import test from 'node:test';
import assert from 'node:assert/strict';
import {MusicAdapter} from '../../server/match/musicAdapter.js';

test('core population is checked at battle start and each player triggers only once',()=>{
  const player=id=>({playerId:id,alive:true,lp:30,bonds:{core:{count:5},other:{count:9}},board:new Map(),hand:[],temp:[]});
  for(const mode of ['coop','solo']){
    const a=player('a'),b=player('b');
    const m={roomCode:'r',seed:1,opts:{musicRules:{'you-shan-lian':{enabled:true,probability:100}}},mode,round:1,order:[a,b],gd:{bond:id=>({isCore:id==='core'})}};
    const adapter=new MusicAdapter(m);adapter.battle();assert.equal(adapter.pending.length,0);
    m.round=2;a.bonds.core.count=6;b.bonds.core.count=7;adapter.battle();
    assert.equal(adapter.pending.length,mode==='coop'?1:0);
    if(mode==='coop'){
      assert.equal(adapter.pending[0].trackId,'you-shan-lian');
      assert.equal(adapter.pending[0].scopeRoundId,2);assert.equal(adapter.pending[0].endRoundId,3);
      assert.equal(adapter.engine.used('a','you-shan-lian'),true);assert.equal(adapter.engine.used('b','you-shan-lian'),true);
    }
    m.round=3;a.bonds.core.count=5;adapter.battle();m.round=4;a.bonds.core.count=8;adapter.battle();
    assert.equal(adapter.pending.length,mode==='coop'?1:0);
  }
});

test('simultaneous candidates consume the song even when a higher priority song plays',()=>{
  const p={playerId:'p',alive:true,lp:30,bonds:{core:{count:9}},board:new Map(),hand:[],temp:[]};
  const m={roomCode:'r',seed:1,opts:{musicRules:{'you-shan-lian':{enabled:true,probability:50},'rong-yao':{enabled:true,probability:100}}},mode:'coop',round:1,order:[p],gd:{bond:()=>({isCore:true})}};
  const adapter=new MusicAdapter(m);adapter.engine.random=()=>0;adapter.battle();
  assert.equal(adapter.pending[0].trackId,'rong-yao');assert.equal(adapter.engine.used('p','you-shan-lian'),true);
  m.round=2;adapter.battle();assert.equal(adapter.pending.length,1);
});
