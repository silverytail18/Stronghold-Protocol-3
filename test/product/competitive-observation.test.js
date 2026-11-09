import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBattle,chessRec,enemyRec} from '../helpers/battleHarness.js';
import {makeMatch} from '../match/harness.js';
import {compactResult,resultDigest} from '../../server/sim/spec.js';
import {PHASE} from '../../shared/constants.js';

function observed(extra={}) {
 return makeBattle({content:'none',flags:{competitiveStats:true},defs:{chess:{guard:chessRec({id:'guard'})},enemies:{enemy_walker:enemyRec({key:'enemy_walker',hp:1000,speed:0})}},units:[{chessId:'guard',row:9,col:5}],enemies:[{key:'enemy_walker',sourcePlayerId:'p1'}],autoFinish:false,...extra});
}
test('real Battle caps effective damage by enemy initial HP and serializes it deterministically',()=>{
 const h=observed();h.step(2);const ally=h.unit('guard'),enemy=h.enemy('enemy_walker');
 h.b.dealDamage(ally,enemy,{amount:200,type:'true'});
 assert.equal(h.result().perPlayer.p1.rankedDamage,200);
 enemy.hp=1000;h.b.dealDamage(ally,enemy,{amount:5000,type:'true'});
 const result=h.result();assert.equal(result.perPlayer.p1.rankedDamage,1000);
 assert.equal(compactResult(result).perPlayer.p1.rankedDamage,1000);
 assert.equal(resultDigest(result).hash,resultDigest(JSON.parse(JSON.stringify(result))).hash);
});
test('unite field only credits leaked remaining HP budget',()=>{
 const h=observed({kind:'unite',flags:{competitiveStats:true,rankedLeakBudgets:[{enemyKey:'enemy_walker',sourcePlayerId:'p1',tag:null,ratio:.3}]}});h.step(2);
 h.b.dealDamage(h.unit('guard'),h.enemy('enemy_walker'),{amount:5000,type:'true'});
 assert.equal(h.result().perPlayer.p1.rankedDamage,300);
});
test('ordinary Battle result stays free of ranked fields',()=>{
 const h=observed({flags:{}});h.step(2);assert.equal(Object.hasOwn(h.result().perPlayer.p1,'rankedDamage'),false);
});
test('real match round sends observed client spec and accumulates personal statistics',()=>{
 const h=makeMatch({mode:'solo',humans:1,bots:0,clientCombat:true,captureFrames:false,seed:7331});h.m.competitiveStats=true;
 try{h.start();h.toPrep(1);h.m.handle('p_0',{t:'g.ready',ready:true});h.run(()=>h.m.phase===PHASE.SETTLE||h.ended);
  const starts=h.allTo('p_0','b.start');assert.ok(starts.length);assert.equal(starts[0].spec.flags.competitiveStats,true);
  assert.equal(h.ps('p_0').stats.rankedValid,true);assert.ok(h.ps('p_0').stats.survivalRounds>=0);
  h.m.finish({victory:false});assert.equal(h.ended.competitiveStatsVersion,1);assert.equal(h.ended.players[0].competitiveStats.valid,true);assert.equal(h.m.errorCount,0,JSON.stringify(h.logs));
 }finally{h.m.dispose();}
});
