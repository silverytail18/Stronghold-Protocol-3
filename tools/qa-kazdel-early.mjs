import fs from 'node:fs/promises';import path from 'node:path';
import {getData} from '../server/data.js';import {buildKazdelData,CORE,BLOOD,HODRER} from '../server/sim/content/kazdel/data.js';
import {GameData} from '../server/match/gamedata.js';import {buildNormalWave} from '../server/match/waves.js';import {createRng} from '../server/sim/rng.js';
import {buildBattleSpec,createBattleFromSpec} from '../server/sim/spec.js';import {DataSource} from '../server/sim/simdata.js';
const raw=buildKazdelData(getData()),kz=k=>'chess_kz_'+k+'_a';
const native=Object.values(raw.chess).find(c=>c.name==='隐现'&&c.visible&&!c.isGolden).chessId;
const base=[{chessId:kz('flameb'),row:9,col:8},{chessId:kz('vigna'),row:12,col:7},{chessId:kz('hibisc'),row:10,col:5}];
const configs=[{name:'三人纯卡兹戴尔',units:base},{name:'三人加隐现外援',units:[...base,{chessId:native,row:11,col:4}]},{name:'四人加入陨星',units:[...base,{chessId:kz('meteo'),row:11,col:4}]}],results=[];
for(const modeId of ['mode_multi_normal','mode_multi_hard','mode_multi_abyss'])for(const config of configs){
 const gd=new GameData(raw,modeId);
 for(const key of ['enemy_1045_hammer','enemy_1174_duholy','enemy_1017_defdrn','enemy_10084_hlegle'].filter(k=>gd.factions.entries[k]?.firstHalf))for(const seed of [17,73,131]){
  const e=gd.factions.entries[key],picks=[];picks[3]={round:3,type:e.type,key,normal:e.N[0].key,elite:e.E[0].key,fly:e.fly,firstHalf:true};const w=buildNormalWave(gd,createRng(seed),{picks},3);
  const spec=buildBattleSpec({battleId:`qa.kz.early.${config.name}.${modeId}.${key}.${seed}`,fieldId:'n:p1',kind:'normal',round:3,modeId,seed,stageId:'act2autochess_m01',timeLimit:w.timeLimit,spawns:w.spawns,routes:w.routes,enemyOverrides:w.overrides,waveId:w.templateId,players:[{playerId:'p1',seat:0,side:'L',bandId:HODRER,bonds:{[CORE]:{active:true,tier:1,layers:12,count:config.name==='四人加入陨星'?4:3},[BLOOD]:{active:true,tier:1,layers:2,count:2}},contentInfo:{round:3,kind:'normal'},units:config.units.map((u,i)=>({...u,uid:i+1,dir:'RIGHT'}))}]});
  const b=createBattleFromSpec(spec,new DataSource(raw),{quiet:true,recordEvents:false});let nativeDamage=0,curse=0,fire=0,firstFire=null;
  b.on('damageResolved',c=>{if(c.target.side!=='enemy')return;if(c.dmg.tags?.includes('kz:curse'))curse+=c.dealt;else if(c.dmg.tags?.some(x=>x==='kz:release'||x==='kz:releaseEcho'||x==='kz:rescueEcho')){fire+=c.dealt;firstFire??=b.time;}else if(c.credit?.side==='ally')nativeDamage+=c.dealt;});
  const result=b.runToEnd(20000);if(b.errors.length)throw Error(JSON.stringify(b.errors));const p=result.perPlayer.p1;
  results.push({modeId,lineup:config.name,key,seed,round:3,layers:12,total:p.total,killed:p.killed,leaks:p.leaked.length,duration:result.time,damage:{native:nativeDamage,curse,fire},firstFire,generated:p.kazdelCarry.generated,metrics:p.kazdelMetrics,enemyStats:Object.fromEntries(b.enemies.map(u=>[u.defId,{hp:u.s.maxHp,atk:u.s.atk,def:u.s.def,res:u.s.res,fly:u.isFlying}]))});
 }
}
const summary=configs.flatMap(c=>['mode_multi_normal','mode_multi_hard','mode_multi_abyss'].map(mode=>{const a=results.filter(r=>r.modeId===mode&&r.lineup===c.name);return{lineup:c.name,mode,scenarios:a.length,zeroLeaks:a.filter(r=>!r.leaks).length,leaks:a.reduce((n,r)=>n+r.leaks,0),withOffensiveFire:a.filter(r=>r.damage.fire>0).length};}));
const out=path.resolve(process.env.KAZDEL_QA_DIR||path.resolve(import.meta.dirname,'../../kazdel-integration/reports'));await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'kazdel-early.json'),JSON.stringify({method:'Actual R3 factions, native wave and mitigation pipeline; fixed L12/T2 and preformed ordinary units. Current runtime balance. Meteorite scenario costs one extra T3 unit and is not an economy-neutral comparison.',summary,results},null,2));console.log(JSON.stringify(summary,null,2));
