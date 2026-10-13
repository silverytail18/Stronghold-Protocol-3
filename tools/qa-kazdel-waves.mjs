import fs from 'node:fs/promises';import path from 'node:path';
import {getData} from '../server/data.js';import {buildKazdelData,CORE,BLOOD,HODRER} from '../server/sim/content/kazdel/data.js';
import {extendRounds} from '../server/test-batches.js';
import {GameData} from '../server/match/gamedata.js';import {buildNormalWave} from '../server/match/waves.js';import {createRng} from '../server/sim/rng.js';
import {buildBattleSpec,createBattleFromSpec,resultDigest} from '../server/sim/spec.js';import {DataSource} from '../server/sim/simdata.js';
const raw=buildKazdelData(getData());extendRounds(raw,24);const out=path.resolve(process.env.KAZDEL_QA_DIR||path.resolve(import.meta.dirname,'../../kazdel-integration/reports'));
const native=name=>Object.values(raw.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
const kz=k=>'chess_kz_'+k+'_a',gold=id=>id.replace(/_a$/,'_b');
const entry=(id,r,c,elite=false,skillIndex)=>({chessId:elite?gold(id):id,row:r,col:c,dir:'RIGHT',...(skillIndex==null?{}:{skillIndex})});
const early=[entry(kz('flameb'),9,8),entry(kz('vigna'),12,7),entry(kz('hibisc'),10,5),entry(native('隐现'),11,4)];
const mid=[entry(native('泥岩'),9,8),entry(kz('flameb'),9,7,true),entry(kz('vigna'),12,7,true),entry(kz('meteo'),12,6),entry(kz('hibisc'),10,5,true),entry(kz('cqbw'),9,5),entry(native('隐现'),11,4,true)];
const late=[entry(native('泥岩'),9,8,true),entry(kz('flameb'),9,7,true),entry(kz('meteo'),12,6,true),entry(kz('hibisc'),10,5,true),entry(kz('cqbw'),9,5,true),entry(native('华法琳'),11,4,true),entry(native('魔王'),10,7,true),entry(kz('hodrer'),12,7,true),entry(native('史尔特尔'),12,5,true)];
const noW=mid.map(u=>u.chessId===kz('cqbw')?entry(native('华法琳'),9,5):u);
const withLogos=late.map(u=>u.chessId===gold(native('史尔特尔'))?entry(kz('logos'),11,5,true,2):u);
const cases=[{name:'3核心普通＋隐现',round:3,S:12,T:2,units:early},{name:'6核心混合精锐',round:7,S:35,T:10,units:mid},{name:'6核心无W＋隐现',round:7,S:35,T:10,units:noW},{name:'9核心精锐无逻各斯',round:13,S:70,T:24,units:late},{name:'9核心精锐逻各斯S3',round:13,S:237,T:80,units:withLogos},{name:'9核心650质变前',round:20,S:649,T:180,units:withLogos},{name:'9核心650质变后',round:20,S:650,T:180,units:withLogos},{name:'9核心良好发育675',round:20,S:675,T:200,units:withLogos},{name:'9核心充分发育837',round:23,S:837,T:250,units:withLogos},{name:'9核心999极限',round:23,S:999,T:300,units:withLogos}];
const first=['enemy_1045_hammer','enemy_1174_duholy','enemy_1017_defdrn','enemy_10084_hlegle'];
const last=['enemy_1045_hammer_2','enemy_1174_duholy_2','enemy_1320_wdrrl_2','enemy_1425_lrcmra_2','enemy_1207_sfji','enemy_9010_acpupp','enemy_1005_yokai_3'];
const results=[],specs=[];
for(const modeId of ['mode_multi_normal','mode_multi_hard','mode_multi_abyss'])for(const config of cases){
 const gd=new GameData(raw,modeId),count=config.name.startsWith('3')?3:config.name.startsWith('6')?6:9,tier=count/3;
 for(const key of (config.round<=7?first:last).filter(key=>{const e=gd.factions.entries[key];return e&&(config.round<=7?e.firstHalf:!e.firstHalf);} ))for(const seed of [17,73,131]){
  const e=gd.factions.entries[key];if(!e)throw Error('Missing actual faction '+key);
  const picks=[];picks[config.round]={round:config.round,type:e.type,key,normal:e.N[0].key,elite:e.E[0].key,fly:e.fly,firstHalf:e.firstHalf};const w=buildNormalWave(gd,createRng(seed),{picks},config.round);
  if(w.pick?.key!==key||!w.spawns.some(s=>[key,e.N[0].key,e.E[0].key].includes(s.enemyKey)))throw Error('The requested real faction did not enter this wave: '+key);
  const spec=buildBattleSpec({battleId:`qa.kz.${modeId}.${config.name}.${key}.${seed}`,fieldId:'n:p1',kind:'normal',modeId,round:config.round,seed,stageId:'act2autochess_m01',timeLimit:w.timeLimit,spawns:w.spawns,routes:w.routes,enemyOverrides:w.overrides,waveId:w.templateId,
   players:[{playerId:'p1',seat:0,side:'L',colOffset:0,bandId:HODRER,bonds:{[CORE]:{active:true,tier,layers:config.S,count},[BLOOD]:{active:true,tier:count===9?2:1,layers:config.T,count:count===9?4:2}},contentInfo:{round:config.round,kind:'normal'},units:config.units.map((u,i)=>({...u,uid:i+1}))}]});
  const b=createBattleFromSpec(spec,new DataSource(raw),{quiet:true,recordEvents:false}),deaths={},peaks={fire:0,debt:0},enemyStats={};
  b.on('death',({unit:u})=>{if(u.side==='ally')deaths[u.def.raw?.name||u.defId]=(deaths[u.def.raw?.name||u.defId]||0)+1;});
  b.on('enemySpawn',({enemy:u})=>{enemyStats[u.defId]={hp:u.s.maxHp,atk:u.s.atk,def:u.s.def,res:u.s.res,fly:u.isFlying};});
  b.on('tick',()=>{const st=b.kazdel.states.get('p1');peaks.fire=Math.max(peaks.fire,st.Q);peaks.debt=Math.max(peaks.debt,...b.allyUnits.map(u=>b.kazdel.debt(u)));});
  const result=b.runToEnd(20000);if(b.errors.length)throw Error(JSON.stringify(b.errors));const p=result.perPlayer.p1;
  const r={modeId,lineup:config.name,round:config.round,layers:config.S,seed,key,template:w.templateId,spawnCount:w.spawns.reduce((n,s)=>n+s.count,0),duration:b.time,total:p.total,killed:p.killed,leaks:p.leaked?.length??p.leaks?.length??result.leaked?.length??0,reason:result.reason,deathEvents:deaths,peaks,enemyStats,metrics:p.kazdelMetrics,generated:p.kazdelCarry.generated,hash:resultDigest(result).hash};results.push(r);
  if(seed===17&&['enemy_1017_defdrn','enemy_1005_yokai_3','enemy_1425_lrcmra_2'].includes(key))specs.push({name:config.name,modeId,key,spec});
 }
 console.log(modeId,config.name,results.filter(r=>r.modeId===modeId&&r.lineup===config.name).map(r=>[r.key,r.killed,r.total,r.leaks,r.reason]));
}
await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'kazdel-real-waves.json'),JSON.stringify({method:'Controlled formed lineups on the actual stage #01 and native round spawn/scaling pipeline, with 3 seeds per faction. No claim of full-match draft win rate. Soul layers/elite status are scenario assumptions.',results},null,2));
await fs.writeFile(path.join(out,'kazdel-browser-specs.json'),JSON.stringify(specs,null,2));
console.log('Actual-wave scenarios:',results.length);
