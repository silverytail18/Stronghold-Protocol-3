import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {buildRhodesMujicaData,RI} from '../../server/sim/content/rhodes-mujica/data.js';
import {makeBattle,chessRec,enemyRec} from './battleHarness.js';
export const RI_RAW=buildRhodesMujicaData(getData({log:{warn(){},error(){},info(){}}}));
export function fireFixture({tier=2,layers=40,carry=null,kind='normal',round=7,enemies,players,atk=0,providerTier=null,autoAttack=false,...rest}={}){
 const raw=structuredClone(RI_RAW),ids=['qa_ri_low_a','qa_ri_other_a','qa_ri_third_a','qa_ri_high_a','qa_ri_plain_a','qa_ri_low_b'];
 for(const [i,id]of ids.entries())raw.chess[id]=chessRec({id,baseId:i===5?ids[0]:id,golden:i===5,tier:providerTier??(i===3?5:3),bonds:i===4?[]:[RI],stats:{atk,cost:0},rangeGrid:[[0,0],[0,1],[0,2],[0,3],[0,4]],skill:{spCost:10000}});
 raw.enemies.qa_ri_enemy=enemyRec({key:'qa_ri_enemy',hp:1e7,speed:0,atk:0});
 raw.enemies.qa_ri_air=enemyRec({key:'qa_ri_air',hp:1e7,speed:0,atk:0,motion:'FLY'});
 const input={playerId:'p1',seat:0,side:'L',colOffset:0,units:ids.map((chessId,i)=>({uid:i+1,chessId,kind:'chess',row:9+Math.floor(i/2),col:3+i%2})),
  bonds:{[RI]:{active:true,tier,count:tier*3,layers}},contentInfo:{round,kind,...(carry?{rhodesCarry:carry}:{})}};
 const h=makeBattle({data:new DataSource(raw,null),players:players||[input],enemies:enemies??[{key:'qa_ri_enemy',pos:[10,5]}],round,kind,autoFinish:false,timeLimit:180,...rest});
 h.step(2);if(!autoAttack)for(const u of h.allies())u.atkCd=1e6;
 h.fireTimes=[];const fx=h.b.fx.bind(h.b);h.b.fx=(kind,args)=>{if(kind==='rm-ri-salvo')h.fireTimes.push(h.b.time);return fx(kind,args);};
 h.raw=raw;h.input=input;return h;
}
export const fireEvents=h=>h.eventsOf('fx').filter(e=>e[1]==='rm-ri-salvo').map((e,i)=>({time:h.fireTimes[i],...e[4]}));
export const artilleryHits=h=>h.hooksOf('damageResolved').filter(c=>c.dmg?.tags?.includes('bond:rhodes:engineering'));
export const nativeHit=(h,u=h.allies()[0],e=h.enemies()[0],extra={})=>h.b.dealDamage(u,e,{amount:1,type:'true',canDodge:false,isAttack:true,...extra});
export function finishFire(h){h.b.forceEnd();return h.result().perPlayer.p1.rhodesCarry;}
