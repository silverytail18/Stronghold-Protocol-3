// Functional acceptance with actual maps/waves. Scripted rosters are not economic/balance evidence.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {makeMatch,give,DATA} from '../test/match/harness.js';
import {buildExpansionData,NIAN,LING} from '../server/sim/content/expansion/expansion-data.js';
import {createRegistry} from '../server/match/effectsMeta.js';
import {canPlace,positionClass} from '../server/match/board.js';
import {buildBossWave} from '../server/match/waves.js';
import {createRng} from '../server/sim/rng.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../server/sim/spec.js';
import {GEO} from '../shared/constants.js';
const Q={info(){},warn(){},error(){}},raw=buildExpansionData(DATA);
const BUILDS=[
 ['B1','惊蛰','小满','年','令','星熊','诗怀雅','角峰','白面鸮'],
 ['B2','年','令','黍','夕','余','小满','深靛','白面鸮'],
 ['B3','德克萨斯','可颂','空','能天使','莫斯提马','隐现','拉普兰德','阿罗玛'],
 ['B4','可颂','空','能天使','莫斯提马','隐现','送葬人','空弦','圣约送葬人'],
 ['B5','德克萨斯','拉普兰德','忍冬','予愿安洁莉娜','安洁莉娜','伺夜','蒂比','塞雷娅'],
 ['B6','年','夕','黍','余','可颂','空','德克萨斯','新约能天使']
];
const byName=name=>{const c=Object.values(raw.chess).find(c=>c.name===name&&!c.isGolden);assert.ok(c,`Unknown build operator: ${name}`);return c.chessId;};
const full=BUILDS.map(([id,...names])=>({id,names,ids:names.map(byName)}));
function clear(p){for(const q of [...p.board.values(),...p.hand.filter(Boolean),...p.temp.filter(Boolean)])if(q.kind==='chess')p.returnCopies(q);p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.recompute();}
function fill(m,p,build,r,skill){clear(p);const map=m.deployMapFor(p),spots=[...map.keys()].map(k=>k.split(',').map(Number)).sort((a,b)=>b[1]-a[1]||a[0]-b[0]),used=new Set();
 for(const base of build.ids.slice(0,p.deployCap)){const id=r>=7?m.gd.goldenIdOf(base)||base:base,c=m.gd.chess(id);p.setLoadout({[base]:{skill:Math.min(skill,c.skills.length-1),module:'none'}});const tile=spots.find(([a,b])=>!used.has(`${a},${b}`)&&canPlace(map,positionClass(c),a,b));assert.ok(tile,`No legal tile: ${id}`);used.add(tile.join(','));give(m,p,id,'board',tile);}
 p.recompute();
 // Real summon positions supplied by PlayerState; deploy only legal, vacant positions.
 for(const t of [...p.hand,...p.temp].filter(q=>q?.kind==='token')){const rec=m.gd.token(t.id),tile=spots.find(([a,b])=>!used.has(`${a},${b}`)&&canPlace(map,positionClass(rec),a,b));if(!tile)continue;const ok=p.move(t.uid,{area:'board',row:tile[0],col:tile[1]},'RIGHT');if(ok.ok)used.add(tile.join(','));}
 p.recompute();
}
function execute(spec,m){const b=createBattleFromSpec(spec,m.ds,{logger:Q,quiet:true,recordEvents:false});b.start();const cap=spec.kind==='normal'?180:100;while(!b.finished&&b.time<cap)b.step();if(!b.finished)b.forceEnd('timeout');assert.deepEqual(b.errors,[]);const result=b.result();const digest=resultDigest(result),checksum=createHash('sha256').update(JSON.stringify(digest)).digest('hex');return {reason:result.reason,time:result.time,kills:result.kills,leaks:result.leaks,checksum};}
const cases=[];
for(const mode of ['solo','coop'])for(const difficulty of ['NORMAL','HARD'])for(const seed of [17,83])for(const build of full){
 const h=makeMatch({data:raw,mode,difficulty,humans:mode==='solo'?1:2,seed,registry:createRegistry({log:Q}),checkFrames:true}).start();h.toPrep(1,{band:'band_exp_nian'});const m=h.m;
 for(const r of [1,7,13,m.gd.bossRound,m.gd.hiddenRound]){
  m.startRound(r);assert.ok(h.drive(()=>m.phase==='PREP',{ready:false,band:'band_exp_nian'}));
  for(const p of m.alivePlayers()){fill(m,p,build,r,seed===17?0:2);m.dispatch(p,'onPrepEnd',{round:r});}
  h.invariants();
  const boss=r===m.gd.bossRound||r===m.gd.hiddenRound;let opts;
  if(!boss)opts=m._normalOpts(m.alivePlayers()[0]);else{const wave=buildBossWave(m.gd,createRng(seed+r),m.factions,r,{bossId:r===m.gd.hiddenRound?m.hiddenBossId:m.bossId,solo:mode==='solo'});opts={kind:r===m.gd.hiddenRound?'hidden':'boss',seed,modeId:m.modeId,round:r,stageId:m.stageId,rect:{...GEO.BOSS_RECT},timeLimit:100,players:m.alivePlayers().map((p,i)=>p.battleInput({side:i?'R':'L',colOffset:0})),spawns:wave.spawns,routes:wave.routes,enemyOverrides:wave.overrides,flags:{layerGainsEnabled:false,...m.gd.dp},boss:{hp:1e7,maxHp:1e7}};}
  const spec=buildBattleSpec({...opts,battleId:'lab',fieldId:'lab'}),a=execute(spec,m),b=execute(JSON.parse(JSON.stringify(spec)),m);assert.equal(a.checksum,b.checksum);cases.push({build:build.id,mode,difficulty,seed,round:r,kind:opts.kind,stage:m.stageId,spawns:spec.spawns.length,roster:spec.players.map(p=>p.units.map(u=>u.chessId||u.tokenId)),...a});
 }
 assert.deepEqual(h.logs.error,[]);m.dispose();console.log(JSON.stringify({build:build.id,mode,difficulty,seed,scenarios:cases.length}));
}
const games=[];
for(const mode of ['solo','coop'])for(const seed of [17,83]){const h=makeMatch({data:raw,mode,humans:1,bots:mode==='coop'?2:0,seed,clientCombat:true,verify:'all',captureFrames:false,registry:createRegistry({log:Q})}).start();assert.ok(h.drive(()=>h.ended!=null,{band:'band_exp_bison'}));h.invariants();assert.deepEqual(h.logs.error,[]);games.push({mode,seed,round:h.m.round,result:h.ended,errors:h.logs.error,warnings:h.logs.warn});h.m.dispose();}
await writeFile(new URL('../.cache/sui-penguin/expansion-official-playtest.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),scope:'Actual maps and enemy waves; scripted builds, no balance/win-rate claim. Boss scenarios bounded at 100 game seconds.',scenarios:cases.length,executions:cases.length*2,deterministic:true,builds:full,cases,fullGames:games},null,2)+'\n');console.log(JSON.stringify({scenarios:cases.length,fullGames:games.length,passed:true}));
