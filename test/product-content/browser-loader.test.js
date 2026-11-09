import test from'node:test';import assert from'node:assert/strict';
import{getVersionData}from'../../server/data.js';import{composeProductData}from'../../server/product/content-data.js';import{loadBrowserSim}from'../../public/js/battle/simLoader.js';import{makeMatch,give,legalTileFor}from'../match/harness.js';import{compactResult}from'../../server/sim/spec.js';import{validateClientResult}from'../../server/match/fields.js';
test('actual browser loader retains built-in covenant context, CS and full custom result',async()=>{
 const data=composeProductData(getVersionData('act2autochess'),['rhodes-mujica-v1','iberia-expansion-v1','ursus-expansion-v1'],{mode:'solo'}),h=makeMatch({data,mode:'solo',clientCombat:true}).start().toPrep(1),p=h.ps('p_0');
 try{p.deployCapMin=10;for(const c of Object.values(data.chess).filter(c=>c.visible&&!c.isGolden&&c.bonds?.includes('rhodesShip')).slice(0,6)){const at=legalTileFor(h.m,p,c.chessId);if(at)give(h.m,p,c.chessId,'board',at);}h.toPrep(2);
 const entry=[...h.clients.get('p_0').battles.values()][0],cs='1'.repeat(64),sim=await loadBrowserSim({base:new URL('../../server/sim/',import.meta.url).href,data,cs});assert.equal(sim.cs,cs);assert.deepEqual(sim.raw.config.productContent.ids,data.config.productContent.ids);assert.ok(sim.ds.raw.bonds.iberiaShip);
 const battle=sim.spec.createBattleFromSpec(entry.spec,sim.ds,{quiet:true});for(let ticks=0;ticks<20000&&!battle.finished;ticks++)battle.step();assert.ok(battle.finished);assert.deepEqual(battle.errors,[]);const result=compactResult(battle.result());assert.ok(result.perPlayer.p_0.iberia);assert.ok(result.perPlayer.p_0.ursus);assert.ok(validateClientResult(entry.spec,result,{gd:h.m.gd}).ok);
 }finally{h.m.dispose();}
});
