import fs from 'node:fs/promises';import path from 'node:path';
import {getData} from '../server/data.js';import {buildKazdelData,CORE,HODRER} from '../server/sim/content/kazdel/data.js';
import {GameData} from '../server/match/gamedata.js';import {createBattleFromSpec,buildBattleSpec} from '../server/sim/spec.js';import {DataSource} from '../server/sim/simdata.js';
const raw=buildKazdelData(getData()),results=[];
for(const modeId of ['mode_multi_hard','mode_multi_abyss'])for(const [round,L]of [[13,237],[23,657]])for(const id of ['chess_char_4_18_b','chess_kz_hodrer_b','chess_kz_vigna_a'])for(const key of ['enemy_1045_hammer_2','enemy_1425_lrcmra_2'])for(const charged of [false,true]){
 const gd=new GameData(raw,modeId);const scale=gd.enemyScale(13);if(round===23){scale.hpMul*=1.92;scale.atkMul*=1.4;}
 const spec=buildBattleSpec({kind:'normal',fieldId:'n:p1',seed:17,stageId:'act2autochess_m01',modeId:gd.modeId,round,timeLimit:200,players:[{playerId:'p1',seat:0,side:'L',bandId:HODRER,bonds:{[CORE]:{active:true,tier:3,count:9,layers:L}},units:[{chessId:id,uid:1,row:9,col:7}]}],spawns:[],routes:[]});
 const b=createBattleFromSpec(spec,new DataSource(raw),{quiet:true});b.autoFinish=false;b.step();const u=b.allyUnits[0];if(id==='chess_kz_hodrer_b')u.skill.activate('stress',{free:true});void u.s;
 const st=b.kazdel.states.get('p1');st.Q=charged?st.C:0;st.generated=0;st.secondGenerated=0;st.releaseReady=999;
 const start={hp:u.hp,maxHp:u.s.maxHp,def:u.s.def,res:u.s.res,fire:st.Q},packets=[];
 const sources=Array.from({length:3},()=>b.spawnEnemy(key,{pos:[9,8],mods:scale}));
 for(const e of sources)for(const type of key.includes('lrcmra')?['phys','arts']:['phys']){const before=u.hp,dealt=b.dealDamage(e,u,{amount:e.s.atk,type,canDodge:false,isAttack:true,attackId:++b._attackSeq});packets.push({enemyAtk:e.s.atk,type,before,after:u.hp,dealt,debt:b.kazdel.debt(u),fire:st.Q,alive:u.alive,guards:st.metrics.guards});}
 if(b.errors.length)throw Error(JSON.stringify(b.errors));results.push({modeId,round,layers:L,operator:raw.chess[id].name,state:id.endsWith('_b')?'精锐':'普通',key,charged,start,packets,end:{alive:u.alive,hp:u.hp,fire:st.Q,guards:st.metrics.guards,debt:b.kazdel.debt(u)}});
}
const out=path.resolve(process.env.KAZDEL_QA_DIR||path.resolve(import.meta.dirname,'../../kazdel-integration/reports'));await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,'kazdel-three-hit.json'),JSON.stringify({method:'Three same-frame attack packets using actual R13/R23 hard and abyss enemy stats and the native mitigation/shield/fatal pipeline. Chimera has both physical and arts packets. Hodrer uses native S3. This isolates the instant HP pressure; enemy stun/aura/skill timing are covered separately by actual AI wave simulations. The single operator fixture supplies a nine-core snapshot to compare protection, not a full legal lineup.',results},null,2));
console.log(results.map(r=>[r.operator,r.key,r.charged?'开场C魂火':'冷启动',r.start.hp,r.end.hp,r.end.alive,r.end.guards]));
