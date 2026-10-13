// Controlled official-wave measurement. Prescribed acquisitions are NOT an economy or player win-rate model.
import fs from 'node:fs/promises';
import path from 'node:path';
import {getData} from '../server/data.js';
import {buildRhineData} from '../server/sim/content/rhine/data.js';
import {extendRounds} from '../server/test-batches.js';
import {makeMatch} from '../test/match/harness.js';
import {arrange} from '../server/match/bot.js';
import {buildNormalWave,buildBossWave} from '../server/match/waves.js';
import {bossPoolHp,SharedBossPool} from '../server/match/finalAssault.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../server/sim/spec.js';
import {TICK} from '../server/sim/constants.js';
import {GEO} from '../shared/constants.js';
import {ensure,rhineIntent} from '../server/sim/content/rhine/state.js';
import {RHINE,RHINE_KRISTEN,TECHNOLOGIES,TECH_BY_ID,qualifies,spentPoints,income} from '../shared/rhine.js';
const output=path.resolve(process.env.RHINE_QA_DIR||path.join(import.meta.dirname,'../../reports/rhine-0.5.1'));
await fs.mkdir(output,{recursive:true});
const seeds=(process.env.RHINE_QA_SEEDS||'17,73,118,131').split(',').map(Number);
const profiles=(process.env.RHINE_QA_PROFILES||'eight,nine').split(',');
const normal=(process.env.RHINE_QA_ROUNDS||'14,24').split(',').map(Number);
const bossSelection=process.env.RHINE_QA_BOSSES?.split(',');
const bossPolicy=process.env.RHINE_QA_BOSS_POLICY||'formed';
const fullReport={version:'0.5.1',difficulty:'ABYSS',date:'2026-10-12',method:'Actual Match prep metadata and official waves, native BattleSpec simulation; legal bot placement, original DP/summons, inherited layers, paid-point research. Prescribed roster and promotions; no shop economy, no full-match player win-rate claim.',profiles:{eight:'Original eight operator slots; no deployment-cap bonus; late Muelsyse permits nine Rhine count through native Harmony.',nine:'One assumed deployment-cap bonus from R12; nine physical operators plus native Harmony permits ten Rhine count. An upper investment scenario, not guaranteed.'},campaigns:[],ablations:[],bosses:[],enemyCurve:{},originalCores:[],warnings:[]};
const base=buildRhineData(getData());
const byName=name=>Object.values(base.chess).find(c=>c.visible&&!c.isGolden&&c.name===name)?.chessId;
const ids={otter:'chess_rhine_otter_a',halo:'chess_rhine_halo_a',astesi:'chess_rhine_astesi_a',silent:'chess_char_2_02_a',mgllan:'chess_rhine_mgllan_a',ptilopsis:'chess_char_4_21_a',ifrit:'chess_rhine_ifrit_a',saria:'chess_char_5_11_a',muelsyse:'chess_char_6_11_a',tinman:'chess_char_6_16_a',alter:'chess_rhine_slent2_a'};
const nativeEarly=[byName('角峰'),byName('隐现')];
if(nativeEarly.some(x=>!x))throw Error('Missing early native benchmark operators');
const queue=['T04','T01','T07','T02','T09','T08','T10','T12','T03','T06','T11','T16','T21','T13'];
const posKey=p=>p.join(','),distance=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
function roster(r,profile){
 if(r<=2)return [ids.otter,...nativeEarly];
 if(r<=4)return [ids.otter,ids.halo,ids.silent,...nativeEarly];
 if(r<=6)return [ids.otter,ids.halo,ids.silent,ids.astesi,ids.mgllan,nativeEarly[1]];
 if(r<=9)return [ids.otter,ids.halo,ids.silent,ids.astesi,ids.mgllan,ids.ptilopsis];
 const out=[ids.otter,ids.halo,ids.silent,ids.astesi,ids.mgllan,ids.ifrit,ids.saria,r>=12?ids.muelsyse:ids.ptilopsis];
 if(profile==='research4'&&r>=12){out[0]=ids.alter;out[4]=ids.tinman;}
 if(profile==='nine'&&r>=12)out.push(ids.tinman);return out;
}
function elite(r,id){return r>=12||r>=7&&[ids.otter,ids.halo,ids.astesi].includes(id);}
function setup(p,round,profile){
 p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.ready=false;p.deployCapBonus=profile==='nine'&&round>=12?1:0;
 p.shop.level=round<3?1:round<5?2:round<7?3:round<10?4:round<12?5:6;
 p.startRound(round);p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];
 for(const [i,id]of roster(round,profile).entries())p.hand[i]=p.newPiece('chess',elite(round,id)?id.replace(/_a$/,'_b'):id);
 p.recompute();arrange(p.m,p,{final:true});p.recompute();
 if(p.deployCount>p.deployCap)throw Error('Illegal deployment cap');
 for(const [key,piece]of p.board)if(piece.kind==='chess'&&p.gd.tierOf(piece.id)>p.shop.level)throw Error('Prescribed tier exceeds shop '+round+' '+piece.id);
 const st=ensure(p);for(const id of queue){if(st.research.includes(id))continue;const t=TECH_BY_ID[id];if(t.count>p.bonds[RHINE].count||!t.pre.every(pre=>qualifies(pre,st.research,p.bonds[RHINE].count))||income(st,p.layers[RHINE]||0)-spentPoints(st.research)<t.cost)break;const res=rhineIntent(p,{t:'g.rhineResearch',id});if(!res.ok)throw Error('Research rejected '+id+' '+JSON.stringify(res));}
 configurePositions(p);
}
function configurePositions(p){
 const st=ensure(p);
 if(!p.privateView().rhine.enabled)return;
 // Reconfigure through legal intents. Pause data remains a production concern covered by focused tests.
 for(const id of st.research.filter(id=>TECH_BY_ID[id].region)){const res=rhineIntent(p,{t:'g.rhinePositions',id,positions:[]});if(!res.ok)throw Error('Position reset rejected '+id);}
 const grid=p.privateView().rhine.grid.filter(t=>t.legal),used=new Set(),chess=[...p.board.entries()].filter(([,v])=>v.kind==='chess').map(([key,piece])=>({piece,pos:key.split(',').map(Number),record:p.gd.chess(piece.id)}));
 const dealer=chess.find(u=>u.record.baseId===ids.ifrit)||chess.find(u=>u.record.baseId===ids.halo)||chess.find(u=>u.record.dmgType!=='none');
 const blocker=chess.find(u=>u.record.baseId===ids.saria)||chess.find(u=>u.record.baseId===ids.astesi)||chess[0];
 const place=(id,candidates,n=1)=>{if(!qualifies(id,st.research,p.bonds[RHINE].count))return;const positions=[];for(const c of candidates){if(positions.length>=n)break;const key=posKey(c);if(!used.has(key)&&grid.some(g=>posKey(g.position)===key)){positions.push(c);used.add(key);}}if(positions.length){const res=rhineIntent(p,{t:'g.rhinePositions',id,positions});if(!res.ok)throw Error('Position rejected '+id+' '+JSON.stringify(res));}};
 const capacity=qualifies('T09',st.research,p.bonds[RHINE].count)?2:1;
 place('T01',[dealer?.pos,...chess.filter(u=>u.record.dmgType!=='none').map(u=>u.pos)].filter(Boolean),capacity);
 place('T02',[blocker?.pos,...chess.map(u=>u.pos)].filter(Boolean),capacity);
 const group=p.m.bossGroupOf(p),routes=group?.wave.routes||p.m.wave?.routes||[];
 const vertices=routes.map(r=>[r.start,...(r.checkpoints||[]),r.end].filter(Array.isArray));
 const routePoints=vertices.flatMap(ps=>ps.flatMap((v,i)=>{
  if(!i)return[v];const a=ps[i-1],n=Math.max(1,Math.ceil(distance(a,v)));
  return Array.from({length:n},(_,j)=>[Math.round(a[0]+(v[0]-a[0])*(j+1)/n),Math.round(a[1]+(v[1]-a[1])*(j+1)/n)]);
 })).map(([r,c])=>group?[r+7,group.side==='R'?20-c:c]:[r,c]);
 const front=blocker?.pos&&[blocker.pos[0]+(blocker.piece.dir==='DOWN'?1:blocker.piece.dir==='UP'?-1:0),blocker.pos[1]+(blocker.piece.dir==='LEFT'?-1:blocker.piece.dir==='RIGHT'?1:0)];
 const roads=grid.map(g=>g.position).sort((a,b)=>{
  const score=x=>routePoints.reduce((v,q)=>v+Math.max(0,4-distance(x,q)),0)+(st.positions.T01||[]).some(q=>distance(x,q)===1)*25-(dealer?distance(x,dealer.pos):0)*2+(front?Math.max(0,4-distance(x,front))*15:0);
  return score(b)-score(a);
 });
 place('T04',roads,capacity);place('T06',chess.map(u=>u.pos));place('T03',[blocker?.pos,...chess.map(u=>u.pos)].filter(Boolean));
 if(spentPoints(st.research)>income(st,p.layers[RHINE]||0))throw Error('Research budget exceeded');
}
function instrument(b){const metrics={technology:0,total:0,t04:0,pulse:0,deaths:0,enemyStats:{}};
 b.on('damageResolved',({target,credit,dmg,dealt})=>{if(target?.side!=='enemy'||credit?.side!=='ally')return;metrics.total+=dealt;if(dmg?.tags?.includes('rhine:technology')){metrics.technology+=dealt;if(dmg.type==='true')metrics.t04+=dealt;else metrics.pulse+=dealt;}},{owner:'qa.rhine'});
 b.on('death',({unit})=>{if(unit.side==='ally'&&unit.kind==='op')metrics.deaths++;},{owner:'qa.rhine'});
 b.on('enemySpawn',({enemy:u})=>{metrics.enemyStats[u.defId]={hp:u.s.maxHp,atk:u.s.atk,def:u.s.def,res:u.s.res,fly:u.isFlying};},{owner:'qa.rhine'});return metrics;
}
function simulate(spec,ds){const b=createBattleFromSpec(spec,ds,{quiet:true,recordEvents:false}),metrics=instrument(b);b.runToEnd(300);if(b.errors.length)throw Error(JSON.stringify(b.errors));const result=b.result(),p=result.perPlayer.p_0;
  metrics.specialResearchDamage=[...(b.specialResearch?.states?.values()||[])].reduce((n,s)=>n+s.credit.stats.dmg,0);
  return {b,result,row:{total:p.total,killed:p.killed,leaks:(p.leaked||[]).filter(l=>l.counted!==false).length,lpLoss:Math.min(10,(p.leaked||[]).filter(l=>l.counted!==false).length),duration:b.time,reason:result.reason,metrics,hash:resultDigest(result).hash}};
}
function clonePrep(source,target,round,profile){
 target.bandId=source.bandId;target.layers=structuredClone(source.layers);target.rhineState=structuredClone(source.rhineState);target.rhineState.snapshot=null;
 target.board.clear();target.hand.fill(null);target.temp.fill(null);target.deployCapBonus=profile==='nine'?1:0;target.shop.level=6;target.ready=false;
 const oldOwner=new Map();for(const [key,piece]of source.board){if(piece.kind!=='chess')continue;const q={...structuredClone(piece),uid:target.m.nextUid()};target.board.set(key,q);oldOwner.set(piece.uid,q.uid);}
 for(const [key,piece]of source.board){if(piece.kind!=='token')continue;target.board.set(key,{...structuredClone(piece),uid:target.m.nextUid(),ownerUid:oldOwner.get(piece.ownerUid)});}target.recompute();
}
function bossRun(source,{length,profile,seed,mode,bossId,ablation='full'}){
 const raw=buildRhineData(getData());if(length===24)extendRounds(raw,24);
 const h=makeMatch({data:raw,mode,difficulty:'ABYSS',humans:mode==='solo'?1:4,fake:true,seed,captureFrames:false}).start();h.toPrep(1);const m=h.m;m.round=length;m.phase='PREP';
 const groups=[];for(let i=0;i<m.order.length;i+=2)groups.push(m.order.slice(i,i+2));
 m.bossWaves=groups.map(group=>({players:group.map(p=>p.playerId),wave:buildBossWave(m.gd,m.rngWaves,m.factions,length,{bossId,solo:mode==='solo'})}));
 for(const p of m.order){clonePrep(source,p,length,profile);arrange(m,p,{final:true});p.recompute();
  if(bossPolicy==='respec-scan'){
   const res=rhineIntent(p,{t:'g.rhineReset'});if(!res.ok)throw Error('Boss respec rejected '+JSON.stringify(res));
   for(const id of ['T04','T01','T07','T12','T02','T16','T06','T11','T09','T08','T10','T03','T13','T21']){const t=TECH_BY_ID[id],s=ensure(p);if(t.count>p.bonds[RHINE].count||!t.pre.every(pre=>qualifies(pre,s.research,p.bonds[RHINE].count))||income(s,p.layers[RHINE])-spentPoints(s.research)<t.cost)break;const res=rhineIntent(p,{t:'g.rhineResearch',id});if(!res.ok)throw Error('Boss research '+id+' '+JSON.stringify(res));}
  }
  configurePositions(p);
 }
 const pool=new SharedBossPool(bossPoolHp(m.gd,bossId,m.order.length));let teamLp=15*m.order.length,leakLp=0,drained=0,ratio150=null;
 const fields=groups.map((group,i)=>{const wave=m.bossWaves[i].wave;
  const players=group.map((p,j)=>{const input=p.battleInput({side:j?'R':'L',colOffset:j?8:0});input.lpForBoss=teamLp;const ev={input,kind:'boss',round:length,spawns:wave.spawns};m.dispatch(p,'onBattleStart',ev);const next=ev.input;
   if(ablation!=='full'){next.contentInfo.rhine.active=[];next.contentInfo.rhine.positions={};if(ablation==='off'){next.contentInfo.rhine.count=0;delete next.bonds[RHINE];}}return next;});
  const spec=buildBattleSpec({seed:seed+i,kind:'boss',modeId:m.modeId,round:length,stageId:m.stageId,rect:{...GEO.BOSS_RECT},timeLimit:Infinity,players,spawns:m._sanitizeSpawns(wave.spawns),routes:wave.routes,flags:{layerGainsEnabled:false,...m.gd.dp},fieldId:'qa.boss.'+i,enemyOverrides:wave.overrides,waveId:wave.templateId,bossId});
  const b=createBattleFromSpec(spec,m.ds,{sharedBoss:pool,quiet:true,recordEvents:false});
  const metrics=instrument(b);b.on('enemyLeak',({enemy:e})=>{const n=Number.isFinite(e.lpr)?e.lpr:1;teamLp-=n;leakLp+=n;},{owner:'qa.rhine'});b.on('lpLoss',({amount})=>{if(Number.isFinite(amount)&&amount>0){teamLp-=amount;leakLp+=amount;}},{owner:'qa.rhine'});return{b,metrics};});
 let time=0;for(let k=0;k<Math.ceil(420/TICK);k++){for(const f of fields)if(!f.b.finished)f.b.step();time=(k+1)*TICK;if(ratio150===null&&time>=150)ratio150=(pool.maxHp-pool.hp)/pool.maxHp;
  const over=time-m.gd.bossOvertimeAfter;if(over>=1){const due=Math.floor(over)*m.gd.bossOvertimeDrain;teamLp-=due-drained;drained=due;}
  if(pool.hp<=0||teamLp<=0||fields.every(f=>f.b.finished))break;
 }
 for(const {b}of fields)if(b.errors.length)throw Error(JSON.stringify(b.errors));
 for(const f of fields)f.metrics.specialResearchDamage=[...(f.b.specialResearch?.states?.values()||[])].reduce((n,s)=>n+s.credit.stats.dmg,0);
 const result={length,profile,seed,mode,bossId,bossPolicy,ablation,stageId:m.stageId,pool:pool.maxHp,damage:pool.maxHp-pool.hp,ratio:(pool.maxHp-pool.hp)/pool.maxHp,ratio150:ratio150??(pool.maxHp-pool.hp)/pool.maxHp,victory:pool.hp<=0&&teamLp>0,time,teamLpEnd:Math.max(0,teamLp),leakLp,metrics:fields.map(f=>f.metrics),research:m.order.map(p=>({playerId:p.playerId,count:p.bonds[RHINE].count,specialCount:p.bonds.specialResearchShip?.count||0,points:income(ensure(p),p.layers[RHINE]),spent:spentPoints(ensure(p).research),technologies:ensure(p).research}))};
 m.dispose();return result;
}
for(const length of normal)for(const profile of profiles)for(const seed of seeds){
 const raw=buildRhineData(getData());if(length===24)extendRounds(raw,24);
 const h=makeMatch({data:raw,mode:'solo',difficulty:'ABYSS',fake:true,seed,captureFrames:false}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0');p.bandId=RHINE_KRISTEN;p.layers[RHINE]=0;
 const campaign={length,profile,seed,stageId:m.stageId,trace:[],assumedLp:26,remainingLpWithoutOtherRewards:26};
 for(let round=1;round<length;round++){
  m.round=round;m.phase='PREP';m.wave=buildNormalWave(m.gd,m.rngWaves,m.factions,round);const before=p.layers[RHINE]||0;setup(p,round,profile);m.dispatch(p,'onPrepEnd',{});
  const spec=buildBattleSpec(m._normalOpts(p)),run=simulate(spec,m.ds),gain=run.result.perPlayer.p_0.layerGains?.[RHINE]||0;
  const rh=ensure(p),trace={round,count:p.bonds[RHINE].count,operators:p.deployCount,cap:p.deployCap,elites:[...p.board.values()].filter(q=>q.kind==='chess'&&m.gd.isGolden(q.id)).length,before,prep:(p.layers[RHINE]||0)-before,battleGain:gain,technologyPoints:income(rh,p.layers[RHINE]||0),spent:spentPoints(rh.research),research:[...rh.research],positions:structuredClone(rh.positions),...run.row};
  campaign.remainingLpWithoutOtherRewards-=trace.lpLoss;p.layers[RHINE]=Math.min(999,(p.layers[RHINE]||0)+gain);p.recompute();trace.after=p.layers[RHINE];campaign.trace.push(trace);
  if([6,9,13,19,23].includes(round))for(const ablation of ['base','off']){const copy=structuredClone(spec);copy.players[0].contentInfo.rhine.active=[];copy.players[0].contentInfo.rhine.positions={};if(ablation==='off'){copy.players[0].contentInfo.rhine.count=0;delete copy.players[0].bonds[RHINE];}fullReport.ablations.push({length,profile,seed,round,ablation,full:trace,...simulate(copy,m.ds).row});}
 }
 campaign.layers=p.layers[RHINE];campaign.points=income(ensure(p),p.layers[RHINE]);campaign.research=[...ensure(p).research];fullReport.campaigns.push(campaign);
 for(const mode of ['solo','coop'])for(const bossId of (bossSelection||Object.keys(raw.bosses).filter(id=>m.gd.mode.bossWeights?.[id]>0))){
  for(const ablation of mode==='solo'&&seed===seeds[0]?['full','base','off']:['full'])fullReport.bosses.push(bossRun(p,{length,profile,seed,mode,bossId,ablation}));
 }
 fullReport.enemyCurve[length]=m.gd.mode.enemyScale;
 m.dispose();await fs.writeFile(path.join(output,'rhine-balance-raw.json'),JSON.stringify(fullReport,null,2));console.log(JSON.stringify({length,profile,seed,stage:campaign.stageId,layers:campaign.layers,points:campaign.points,remainingLp:campaign.remainingLpWithoutOtherRewards,normalBattles:campaign.trace.length,bossSamples:fullReport.bosses.length}));
}
fullReport.originalCores=Object.values(getData().bonds).filter(b=>b.isCore).map(b=>({id:b.bondId,name:b.name,thresholds:b.thresholds,effect:b.effectDesc,bb:b.bb,buffs:b.buffs}));
const avg=ns=>ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:0;
fullReport.summary=[];for(const length of normal)for(const profile of profiles){const cs=fullReport.campaigns.filter(c=>c.length===length&&c.profile===profile),waves=cs.flatMap(c=>c.trace),boss=fullReport.bosses.filter(b=>b.length===length&&b.profile===profile&&b.ablation==='full');
 fullReport.summary.push({length,profile,campaigns:cs.length,layerRange:[Math.min(...cs.map(c=>c.layers)),Math.max(...cs.map(c=>c.layers))],normalPointRange:[Math.min(...cs.map(c=>Math.floor(c.layers/50))),Math.max(...cs.map(c=>Math.floor(c.layers/50)))],meanLayers:avg(cs.map(c=>c.layers)),normalWaves:waves.length,perfectWaves:waves.filter(w=>w.leaks===0&&w.reason==='cleared').length,meanCappedLoss:avg(waves.map(w=>w.lpLoss)),meanTechnologyShare:avg(waves.filter(w=>w.metrics.total>0).map(w=>w.metrics.technology/w.metrics.total)),soloBoss:{samples:boss.filter(b=>b.mode==='solo').length,wins:boss.filter(b=>b.mode==='solo'&&b.victory).length,meanRatio150:avg(boss.filter(b=>b.mode==='solo').map(b=>b.ratio150))},coopBoss:{samples:boss.filter(b=>b.mode==='coop').length,wins:boss.filter(b=>b.mode==='coop'&&b.victory).length,meanRatio150:avg(boss.filter(b=>b.mode==='coop').map(b=>b.ratio150))}});
}
fullReport.counts={normal:fullReport.campaigns.reduce((n,c)=>n+c.trace.length,0),ablation:fullReport.ablations.length,boss:fullReport.bosses.length};
await fs.writeFile(path.join(output,'rhine-balance-raw.json'),JSON.stringify(fullReport,null,2));await fs.writeFile(path.join(output,'rhine-balance-summary.json'),JSON.stringify({method:fullReport.method,summary:fullReport.summary,counts:fullReport.counts},null,2));console.log(JSON.stringify({summary:fullReport.summary,counts:fullReport.counts}));
