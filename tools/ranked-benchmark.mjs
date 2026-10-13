// Control work only: browser combat is intentionally not simulated here.
import { performance } from 'node:perf_hooks';
import os from 'node:os';
import fs from 'node:fs/promises';
import { Match } from '../server/match/Match.js';
import { VirtualScheduler } from '../server/match/scheduler.js';
import { getData } from '../server/data.js';
const quiet={info(){},warn(){},debug(){},error(){}};
const data=getData({log:quiet}), rows=[];
for(const simultaneous of [1,2,4,8]) {
  let messages=0;const matches=[],errors=[],cpu=process.cpuUsage(),started=performance.now();
  for(let i=0;i<simultaneous;i++) {
    const match=new Match({roomCode:'BEN'+i,mode:'coop',difficulty:'ABYSS',seed:i+1,data,ranked:true,scheduler:new VirtualScheduler(),
      seats:Array.from({length:4},(_,seat)=>({seat,playerId:'p'+i+'-'+seat,name:'测试'+seat,isBot:false,connected:true})),
      send:()=>{messages++;return true;},broadcast:()=>{messages++;},onEnd:()=>{},log:{...quiet,error(...a){errors.push(a.map(String).join(' '));}}});
    matches.push(match);match.start();for(const p of match.players.values())match.handle(p.playerId,{t:'g.infoReady'});
  }
  const consumed=process.cpuUsage(cpu),row={simultaneous,playersPerMatch:4,wallMs:Math.round((performance.now()-started)*100)/100,
    cpuMs:(consumed.user+consumed.system)/1000,rssMiB:Math.round(process.memoryUsage().rss/1024/1024),messages,
    clientCombat:matches.every(m=>m.clientCombat),serverVerification:matches.some(m=>m.verifyMode!=='off'),errors:errors.length};
  for(const m of matches)m.dispose();rows.push(row);console.log(JSON.stringify(row));
  if(!row.clientCombat||row.serverVerification||row.errors)process.exitCode=1;
}
await fs.mkdir('.cache',{recursive:true});
await fs.writeFile('.cache/ranked-benchmark.json',JSON.stringify({node:process.version,cpu:os.cpus()[0]?.model,
  note:'仅测初始化、简报与消息分发；不含浏览器战斗、网络、数据库及断线接管。',rows},null,2));
