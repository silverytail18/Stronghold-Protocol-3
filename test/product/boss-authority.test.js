import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMatch} from '../match/harness.js';
import {PHASE,ERR} from '../../shared/constants.js';

for (const humans of [1,2,3,4]) {
  for (const hidden of [false,true]) {
    test(`ranked ${humans}-player ${hidden?'hidden':'boss'} uses real server battles and rejects client result reports`,()=>{
      const h=makeMatch({mode:humans===1?'solo':'coop',humans,clientCombat:true,clients:false,serverBoss:true,instant:false,captureFrames:false,seed:12345});
      const m=h.m;
      try {
        h.start();h.toPrep(1);
        assert.equal(m.clientCombat,true,'ordinary combat remains client simulated');
        if(hidden)m._openTeamLp();
        m.round=hidden?m.gd.hiddenRound:m.gd.bossRound;
        m.startFinalAssault(hidden);
        assert.equal(m.phase,hidden?PHASE.HIDDEN_CORE:PHASE.FINAL_ASSAULT);
        assert.equal(m.clientCombat,false);
        assert.ok(m.fields.length>0);
        for(const field of m.fields){assert.ok(field.battle,'real server battle created');assert.ok(!field.cc,'no client authority bookkeeping');}
        const hp=m.bossPool.hp;
        const response=m.handle('p_0',{t:'b.progress',battleId:'forged',fieldId:m.fields[0].fieldId,bossDmg:1e30,leaks:0});
        assert.equal(response.error,ERR.WRONG_PHASE);
        assert.equal(m.bossPool.hp,hp,'client report cannot credit leader damage');
        for(const field of m.fields)field.battle.step();
        assert.deepEqual(h.logs.error,[]);
      } finally {m.dispose();}
    });
  }
}
