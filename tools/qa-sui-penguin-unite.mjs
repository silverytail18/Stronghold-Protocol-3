import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {makeMatch,give,DATA} from '../test/match/harness.js';
import {buildExpansionData,NIAN,LING,SHU,AGLNA2} from '../server/sim/content/expansion/expansion-data.js';
import {CROISSANT,SORA} from '../server/sim/content/expansion/penguin-data.js';
import {canPlace,positionClass} from '../server/match/board.js';
import {createRegistry} from '../server/match/effectsMeta.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../server/sim/spec.js';
const raw=buildExpansionData(DATA),Q={info(){},warn(){},error(){}},cases=[];
for(const seed of [17,83])for(const helpers of [1,2])for(const skill of [0,1,2]){
 const h=makeMatch({data:raw,mode:'coop',humans:3,seed,registry:createRegistry({log:Q})}).start();h.toPrep(1);const m=h.m;m.startRound(7);assert.ok(h.drive(()=>m.phase==='PREP',{ready:false}));
 const ps=m.alivePlayers();for(const p of ps){for(const q of [...p.board.values(),...p.hand.filter(Boolean),...p.temp.filter(Boolean)])if(q.kind==='chess')p.returnCopies(q);p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.recompute();}
 for(const p of ps.slice(0,helpers)){const map=m.deployMapFor(p),used=new Set();for(const id of [NIAN,LING,SHU,AGLNA2,CROISSANT,SORA]){p.setLoadout({[id]:{skill:Math.min(skill,m.gd.chess(id).skills.length-1),module:'none'}});const tile=[...map.keys()].find(k=>!used.has(k)&&canPlace(map,positionClass(m.gd.chess(id)),...k.split(',').map(Number)));assert.ok(tile);used.add(tile);give(m,p,m.gd.goldenIdOf(id),'board',tile.split(',').map(Number));}p.recompute();m.dispatch(p,'onPrepEnd',{round:7});}
 h.invariants();const own=new Map();for(const p of ps){const b=m._normalBattle(p);b.start();while(!b.finished&&b.time<150)b.step();if(!b.finished)b.forceEnd('timeout');assert.deepEqual(b.errors,[]);own.set(p.playerId,b.result().perPlayer[p.playerId]);}m.lastResults=own;
 const leaks=own.get(ps.at(-1).playerId).leaked.map(l=>({...l,sourcePlayerId:ps.at(-1).playerId}));assert.ok(leaks.length>0);const plan={helpers:ps.slice(0,helpers),leakers:[ps.at(-1)],leaked:leaks,notReentered:new Map()};const spec=buildBattleSpec({...m._uniteOpts(plan,m.wave.timeLimit),battleId:'lab:unite'});
 const run=()=>{const b=createBattleFromSpec(JSON.parse(JSON.stringify(spec)),m.ds,{quiet:true,logger:Q,recordEvents:false});b.start();while(!b.finished&&b.time<180)b.step();if(!b.finished)b.forceEnd('timeout');assert.deepEqual(b.errors,[]);return {result:resultDigest(b.result()),reason:b.result().reason,carry:spec.players.flatMap(p=>p.units.filter(u=>u.carryState).map(u=>({owner:p.playerId,uid:u.uid,state:u.carryState})))};};const a=run(),b=run();assert.deepEqual(a.result,b.result);assert.equal(m.errorCount,0);cases.push({seed,helpers,skill,stage:m.stageId,leaked:leaks.length,...a});m.dispose();
}
await writeFile(new URL('../.cache/sui-penguin/expansion-unite.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),passed:true,scope:'Actual R7 waves and actual carried operator state; helper selection is a controlled fixture, no balance claim.',scenarios:cases.length,executions:cases.length*2,cases},null,2)+'\n');console.log(JSON.stringify({scenarios:cases.length,passed:true}));
