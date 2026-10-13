import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {makeBattle,chessRec} from '../helpers/battleHarness.js';
import {planUnite} from '../../server/match/unite.js';
import {makeMatch} from '../match/harness.js';

for(const key of ['enemy_1203_sfhu','enemy_1203_sfhu_2'])for(const metadata of [{bountyId:'tea'},{bountyCoins:2}]){
 test(`${key}: split children keep scaling and leak attribution, never inherit the parent's bounty (${Object.keys(metadata)[0]})`,()=>{
  const raw=getData(),h=makeBattle({autoFinish:false,defs:{chess:{wall:chessRec({id:'wall',stats:{maxHp:1e7,atk:0},skill:null})}},units:[{chessId:'wall',row:10,col:5}]});h.step();
  const mods={hpMul:1.5,atkMul:1.2,speedMul:1,...metadata},before=JSON.stringify(mods);
  const parent=h.spawn(key,{pos:[10,7],mods,bounty:{coins:2,ownerPlayerId:'p1'},ownerPlayerId:'p1',sourcePlayerId:'p1'});
  h.b.kill(parent,h.unit('wall'));assert.equal(h.result().perPlayer.p1.coins,2);
  const children=h.enemies().filter(e=>e.defId===raw.enemies[key].talents.bbStr['DeadSpawn.enemy_key']);assert.equal(children.length,4);
  for(const c of children){assert.equal(c.mods.hpMul,1.5);assert.equal(c.mods.atkMul,1.2);assert.equal(c.sourcePlayerId,'p1');assert.equal(c.ownerId,'p1');assert.equal(c.mods.bountyId,undefined);assert.equal(c.mods.bountyCoins,undefined);assert.equal(c.bounty,null);h.b.leak(c);}
  assert.equal(JSON.stringify(mods),before);assert.deepEqual(parent.mods,mods);
  const m=makeMatch({mode:'coop',humans:2,fake:true}),leaker=m.ps('p_0'),helper=m.ps('p_1');
  leaker.bounties=[{id:'tea',card:{payout:'kill',coin:2}}];
  const leaks=h.result().perPlayer.p1.leaked.map(l=>({...l,sourcePlayerId:'p_0'}));
  const plan=planUnite(m.m,new Map([['p_0',{leaked:leaks,perfect:false}],['p_1',{leaked:[],perfect:true}]]));
  assert.equal(plan.leaked.length,4);assert.ok(plan.leaked.every(l=>l.bounty===null));
  // The original target leaking into unite must still pay once to its killer.
  const direct=planUnite(m.m,new Map([['p_0',{leaked:[{enemyKey:key,mods}],perfect:false}],['p_1',{leaked:[],perfect:true}]]));
  assert.deepEqual(direct.leaked[0].bounty,{coins:2,ownerPlayerId:'p_0'});
  const unite=makeBattle({kind:'unite',players:[{playerId:'p_1',units:[],bonds:{}}],autoFinish:false});unite.step();
  for(const l of plan.leaked){const e=unite.spawn(l.enemyKey,{...l,ownerPlayerId:'p_1'});unite.b.kill(e,null);}
  assert.equal(unite.result().perPlayer.p_1.coins,0);
  const target=unite.spawn(key,{...direct.leaked[0],ownerPlayerId:'p_1'}),killer={side:'ally',ownerId:'p_1',stats:{kills:0}};
  unite.b.kill(target,killer);assert.equal(unite.result().perPlayer.p_1.coins,2);
  for(const child of unite.enemies())unite.b.kill(child,killer);
  assert.equal(unite.result().perPlayer.p_1.coins,2,'original target pays its helper once, tea children never multiply it');
  m.m.dispose();
 });
}
