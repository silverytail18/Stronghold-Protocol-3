import fs from 'node:fs/promises';
import {getData} from '../server/data.js';
import {TestContent} from '../server/test-content.js';
import {GameData} from '../server/match/gamedata.js';
import {createRng} from '../server/sim/rng.js';
import {setupMatchWaves,buildNormalWave} from '../server/match/waves.js';
import {DataSource} from '../server/sim/simdata.js';
import {buildBattleSpec,createBattleFromSpec} from '../server/sim/spec.js';
import {makeMatch,give} from '../test/match/harness.js';
import {createRegistry} from '../server/match/effectsMeta.js';
import {RI,NEARL,AMIYA,DOLRIS,AMORIS,MORTIS,TMORIS,OBLVNS} from '../server/sim/content/rhodes-mujica/data.js';
const quiet={warn(){},error(){},info(){}},base=getData({log:quiet}),tc=new TestContent(),room={mode:'solo',difficulty:'HARD'},resolved=tc.resolve({version:tc.menu(room).version,ids:['rhodes-mujica-v1','extended-rounds-20']},room,base),raw=resolved.data,gd=new GameData(raw,'mode_single_hard');
const native=name=>Object.values(raw.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
const families=[native('波登可'),native('休谟斯'),AMIYA,NEARL,DOLRIS,AMORIS,MORTIS,TMORIS,OBLVNS];
const positions=[[9,4],[9,5],[10,5],[12,5],[11,5],[12,4],[9,6],[10,6],[11,6]];
const output={version:'0.3.6',description:'Fixed staged acquisition, real generated 20-round HARD normal waves, stage01. No shop RNG, no items, no manual casts; therefore a reproducible balance sample, not live-game guarantee.',samples:[]};
for(const variant of ['late-nine','no-six-tier'])for(const seed of [17,83,991]){
 const rng=createRng(seed),schedule=setupMatchWaves(gd,rng),h=makeMatch({data:structuredClone(raw),mode:'solo',difficulty:'HARD',fake:true,registry:createRegistry({log:quiet})}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0');
 p.bandId=null;p.hand.fill(null);p.temp.fill(null);p.offers=[];p.layers={};const rounds=[];let total=0,engineering=0;
 for(let round=1;round<=20;round++){
  m.round=round;p.board.clear();p.layers[RI]=rounds.at(-1)?.layers||0;const count=round<3?2:round<6?3:round<11?6:round<12?7:variant==='no-six-tier'?9:round<13?7:round<15?8:9;
  const units=(variant==='no-six-tier'?[...families.slice(0,8),native('寒芒克洛丝')]:families).slice(0,count).map((id,i)=>({chessId:round>=10&&i<6?id.replace(/_a$/,'_b'):id,kind:'chess',uid:i+1,row:positions[i][0],col:positions[i][1],dir:'RIGHT'}));
  for(const u of units)give(m,p,u.chessId,'board',[u.row,u.col]);p.recompute();m.dispatch(p,'onPrepEnd',{round});const prep=p.layers[RI]||0;
  if(round===20){rounds.push({round,phase:'boss growth remains locked',layers:prep});break;}
  const wave=buildNormalWave(gd,rng,schedule.factions,round),spec=buildBattleSpec({battleId:'audit:'+seed+':'+round,fieldId:'n:'+p.playerId,kind:'normal',seed,modeId:'mode_single_hard',round,stageId:'act2autochess_m01',timeLimit:wave.timeLimit,players:[{playerId:p.playerId,seat:0,side:'L',colOffset:0,units,bonds:Object.fromEntries(Object.entries(p.bonds).map(([id,v])=>[id,{...v,layers:p.layers[id]||0}])),playerEffects:[]}],spawns:wave.spawns,routes:wave.routes,flags:{startOpCooldown:3}});
  const b=createBattleFromSpec(spec,new DataSource(raw,null),{quiet:true,recordEvents:false,logger:quiet});let dmg=0,fire=0;
  b.on('damageResolved',c=>{if(c.target.side==='enemy'&&c.credit?.side==='ally'&&c.dealt>0){dmg+=c.dealt;if(c.dmg.tags?.includes('bond:rhodes:engineering'))fire+=c.dealt;}});
  while(!b.finished&&b.time<Math.min(180,wave.timeLimit+1))b.step();
  if(b.errors.length)throw Error(JSON.stringify(b.errors));const layer=b.getPlayer(p.playerId)?.bonds[RI]?.layers||prep;
  rounds.push({round,count,prep,layers:layer,combatGrowth:layer-prep,damage:Math.round(dmg),engineeringDamage:Math.round(fire),share:dmg?+(fire/dmg).toFixed(4):0,reason:b.result().reason,leaks:b.result().leaks?.length||0});total+=dmg;engineering+=fire;
 }
 m.dispose();output.samples.push({variant,seed,layersAt20:rounds.at(-1).layers,totalDamage:Math.round(total),engineeringShare:total?+(engineering/total).toFixed(4):0,rounds});console.log(variant,seed,rounds.at(-1).layers,engineering/total);
}
await fs.writeFile('../reports/rhodes-0.3.6/balance-audit.json',JSON.stringify(output,null,2)+'\n');

