import {baseBonus,TECH_BY_ID,qualifies,activationCount,normalPoints} from './rhine.js';
import {calibrationGlobal,calibrationLocal,adaptationGlobal,adaptationLocal,pulseDamage,SCAN,BROADCAST} from './rhine-balance.js';
const value=n=>'<@ba.vup>'+n+'</>',percent=n=>value(Math.round(n*1000)/10+'%');
export function rhineCurrentEffect(layers,count,context=null){
 if(count<3)return '未激活：作战区至少3名不同【莱茵生命】干员后生效；已研发科技与选格保留。';
 const sp=count>=10?10:count>=9?9:count>=6?6:3;
 const points=Number.isInteger(context?.normalPoints)?context.normalPoints:normalPoints(layers);
 const lines=['【莱茵生命】干员攻击力与最大生命各+'+percent(baseBonus(layers))+'；首次部署技力'+value('+'+sp)+'。','科研'+value(points+'/19')+'正常科技点，每50层获得1点。'];
 if(!Array.isArray(context?.research)){lines.push('3/6人科技按原人数生效；更高科技解锁后6人生效。每场开战检查人数与前置；装备转职和访学身份同样享受科技。');return lines.join('\n');}
 for(const id of context.research){const t=TECH_BY_ID[id];if(!t)continue;
  const active=Array.isArray(context.active)?context.active.includes(id):qualifies(id,context.research,count);
  if(!active){lines.push(t.name+'：'+value('暂停')+'（开战需'+activationCount(t)+'人及前置）。');continue;}
  let text=t.effect;
  if(id==='T01')text='全体增伤+'+percent(calibrationGlobal(count))+'，所选格额外+'+percent(calibrationLocal(count))+'，格内合计+'+percent(calibrationGlobal(count)+calibrationLocal(count))+'。';
  if(id==='T02')text='全体减伤'+percent(adaptationGlobal(count))+'，所选格额外'+percent(adaptationLocal(count))+'，格内合计'+percent(adaptationGlobal(count)+adaptationLocal(count))+'。';
  if(id==='T07')text='每1秒对T04格内至多3名敌人造成'+value(pulseDamage(layers))+'物理伤害（减伤前；联动时最多5名）。';
  if(id==='T03')text='分享源当前攻击力'+percent(BROADCAST.ratio)+'；有效广播时攻速'+value('+30')+'。';
  if(id==='T12')text='每'+SCAN.interval+'秒全域显隐与实验标记'+value(SCAN.duration+'秒')+'。';
  if(id==='T13')text=(context.visitorUid!=null?'本场已授予访学身份。':'开战时所选格上的非莱茵干员获得身份。')+'研究席内莱茵成员额外增伤+'+percent(calibrationLocal(count))+'、减伤'+percent(adaptationLocal(count))+'（继承有效T01/T02区域额外加成，各一次）；仅本场战斗生效。';
  lines.push(t.name+'：'+text);
 }
 return lines.join('\n');
}
