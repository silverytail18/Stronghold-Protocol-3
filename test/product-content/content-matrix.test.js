import test from'node:test';import assert from'node:assert/strict';
import{getVersionData}from'../../server/data.js';import{TEST_CONTENT}from'../../server/test-content.js';import{VERSIONS}from'../../shared/versions.js';import{composeProductData}from'../../server/product/content-data.js';import{makeMatch}from'../match/harness.js';import{MUSIC_CATALOG}from'../../shared/music.js';
import{operatorConflicts}from'../../server/product/operator-conflicts.js';
test('four-period package matrix preserves admitted identities and rejects unreviewed overlaps',()=>{
 for(const version of VERSIONS){const base=getVersionData(version.id),before=JSON.stringify(base);for(const entry of TEST_CONTENT){if(operatorConflicts(entry.id,version.id).length){assert.throws(()=>composeProductData(base,[entry.id],{version:version.id}),/本体已包含干员/);continue;}const data=composeProductData(base,[entry.id],{version:version.id});for(const[id,rec]of Object.entries(data.chess)){assert.equal(rec.chessId,id);if(base.chess[id])assert.equal(rec.charId,base.chess[id].charId);for(const bond of rec.bonds||[])assert.ok(data.bonds[bond],version.id+'/'+entry.id+'/'+id+'/'+bond);}assert.equal(JSON.stringify(base),before);}}
});
test('admitted covenant packs and thirty-round trader run through the actual Match lifecycle',()=>{
 const ids=['extended-rounds-30','genius-trader-v1','arknights-expansion-v1','rhodes-mujica-v1','kazdel-expansion-v1','rhine-lab-v1','higashi-expansion-v1','ursus-expansion-v1','iberia-expansion-v1'];
 for(const version of VERSIONS){const admitted=ids.filter(id=>!operatorConflicts(id,version.id).length);const data=composeProductData(getVersionData(version.id),admitted,{version:version.id,mode:'solo'}),h=makeMatch({data,mode:'solo',fake:true}).start().toPrep(1);assert.equal(h.m.gd.bossRound,30);h.toPrep(13);const p=h.ps('p_0');assert.ok(p.privateView().investment);p.funds=100;assert.ok(h.m.handle(p.playerId,{t:'g.investment',action:'invest',style:'normal'}).ok);assert.ok(h.m.handle(p.playerId,{t:'g.ready',ready:true}).ok);h.toPrep(14);assert.ok(p.investment.last);assert.equal(p.investment.last.round,14);h.m.dispose();assert.deepEqual(h.logs.error,[],version.id);}
});
test('Angelina belongs to pro only, and changing selection does not mutate another room',()=>{
 const base=getVersionData('act2autochess'),pro=composeProductData(base,['arknights-expansion-v1']),ri=composeProductData(base,['rhodes-mujica-v1']);
 for(const suffix of ['a','b']){const id='chess_exp_aglna2_'+suffix;assert.ok(pro.chess[id]);assert.ok(!ri.chess[id]);assert.ok(!base.chess[id]);}
});
test('real Match rule music sends once at round start and never replays on reconnect',()=>{
 const rules=Object.fromEntries(MUSIC_CATALOG.map(track=>[track.id,{enabled:true,probability:100}]));const h=makeMatch({mode:'coop',fake:true,musicRules:rules}).start().toPrep(1);h.flushAll();
 assert.equal(h.bc.filter(msg=>msg.t==='m.musicPlay'&&msg.trackId==='xin-zheng-cheng').length,1);assert.equal(h.lastBc('m.public').musicMode,'coop');const count=h.bc.filter(msg=>msg.t==='m.musicPlay').length;h.m.onReconnect('p_0');h.flushAll();assert.equal(h.bc.filter(msg=>msg.t==='m.musicPlay').length,count);h.m.dispose();
});
