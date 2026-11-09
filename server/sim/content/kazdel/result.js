import {GROWTH_KEYS,personalGrowthPoints,kazdelTraitFor} from '../../../../shared/kazdel-traits.js';
import {CORE,BLOOD} from './data.js';
import {generationRate,storageCapacity,waveDamage,SWORD_RANGE,GUARD_BASE_CD,GUARD_MIN_CD,guardEnabled,hpBonus,SKILL_RECOVERY_MULTIPLIER,layers,flowPoints,bloodFlowPoints} from './rules.js';
// Match-owned phase carry. Membership comes from server battle input and server records.
export function sanitizeKazdelResult(input,p,time,gd=null){
 const fixed=sanitizeFixedCarry(input,p,gd);
 if(!input?.bonds?.[CORE]?.active)return fixed;
 const a=p.kazdelCarry;if(!a||typeof a!=='object')return fixed;
 const S=layers(input.bonds[CORE].layers),tier=Math.min(3,input.bonds[CORE].tier||1),C=1000+25*S;
 const n=(v,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
 const units=(input.units||[]).filter(u=>u.kind!=='token'&&typeof u.chessId==='string'),uids=new Set(units.map(u=>u.uid));
 const base=id=>id.replace(/_b$/,'_a'),bases=new Set(units.map(u=>base(u.chessId)));
 const rec=u=>gd?.chess?.(u.chessId),bonds=u=>{
  const r=rec(u),own=[...(r?.bonds||[])],items=(u.items||[]).map(id=>gd?.item?.(id)).filter(Boolean);
  if(items.some(i=>i.canGiveBond))for(const i of items)if(i.giveBondId&&!own.includes(i.giveBondId))own.push(i.giveBondId);
  return own;
 };
 const actual=u=>!gd||bonds(u).includes(CORE),benefit=u=>actual(u)||input.bonds.maniShip?.active&&bonds(u).includes('maniShip');
 // A conservative ceiling permits other legitimate permanent buffs, without trusting arbitrary client HP/capacity.
 const hpLimit=u=>gd?Math.max(1,(rec(u)?.stats?.maxHp||rec(u)?.stats?.hp||1000)*(1+hpBonus(tier,S))*32+100000):1e7;
 const names=new Map();for(const u of units.filter(actual))names.set(base(u.chessId),Math.max(names.get(base(u.chessId))||0,hpLimit(u)));
 const ceiling=storageCapacity(C,names.size,[...names.values()].reduce((x,y)=>x+y,0));
 const K0=n(a.K0,0,ceiling),K=n(a.capacity,2*C,ceiling),R=generationRate(tier,S,K),D=waveDamage(tier,input.bonds[CORE].count||[3,6,9][tier-1],S,0);
 const carry={round:input.contentInfo?.round??0,time:n(a.time,0,7200),Q:n(a.Q,0,K),K0,E:n(a.E,0,C),nativeGenerated:n(a.nativeGenerated,0,.35*R*(n(a.time,0,7200)+1)),nativeSecondGenerated:n(a.nativeSecondGenerated,0,.35*R),activityRemaining:n(a.activityRemaining,0,5),lastWaveSpent:n(a.lastWaveSpent,0,.04*C),generated:n(a.generated,0,K0+R*(n(a.time,0,7200)+1)),second:n(a.second,-1,7200),secondGenerated:n(a.secondGenerated,0,R),guardRemaining:guardEnabled(tier)?n(a.guardRemaining,0,GUARD_BASE_CD):0,releaseRemaining:n(a.releaseRemaining,0,8),resonanceRemaining:n(a.resonanceRemaining,0,6),resonanceCooldown:n(a.resonanceCooldown,0,16),decayGraceRemaining:a.decayGraceRemaining==null?null:n(a.decayGraceRemaining,0,8),donations:[],bloodProcs:[],debts:[],flow:{},marks:[],meleeCooldowns:[],followCooldowns:[],fireFloorCooldowns:[],recoveries:[],waves:[],openingHp:[]};
 for(const v of (Array.isArray(a.openingHp)?a.openingHp:[]).slice(0,units.length)){const u=units.find(u=>u.uid===v.uid);if(u)carry.openingHp.push({uid:v.uid,hp:n(v.hp,1,hpLimit(u))});}
 for(const [id,f]of Object.entries(a.flow||{}))if(bases.has(id)&&f&&typeof f==='object'){
  const eligible=units.filter(u=>base(u.chessId)===id&&benefit(u));if(!eligible.length)continue;
  const blood=gd?eligible.some(u=>bonds(u).includes(BLOOD)):['chess_kz_hibisc_a','chess_kz_flameb_a','chess_char_4_26_a','chess_kz_hodrer_a'].includes(id);
  const record={tier,blood,units:{},points:0,bloodPoints:0};
  for(const u of eligible){const v=f.units?.[u.uid];if(!v||typeof v!=='object')continue;
   const amount=n(v.amount,0,1e10),bloodAmount=n(v.bloodAmount,0,amount),startHp=n(v.startHp,1,hpLimit(u)),golden=u.chessId.endsWith('_b'),seconds=n(v.seconds,0,Math.min(7200,time+(input.contentInfo?.kazdelCarry?.time||0))),effective=!!v.effective,shortClear=!!v.shortClear&&p.perfect===true&&time<8&&seconds>=1;
   const participated=seconds>=8-1e-8||effective||shortClear;
   const growth=Object.fromEntries(GROWTH_KEYS.map(k=>[k,n(v.growth?.[k],0,k==='firstDeploy'?1:k==='legacyPoints'?10:['healSeconds','blockedSeconds'].includes(k)?seconds:k==='healAmount'?1e10:1e6)]));
   record.units[u.uid]={amount,bloodAmount,startHp,golden,seconds,effective,shortClear,participated,growth};
   record.points=Math.max(record.points,personalGrowthPoints(rec(u),record.units[u.uid])??Math.min(golden?10:6,flowPoints(amount,startHp,golden,participated)+growth.legacyPoints));record.bloodPoints=Math.max(record.bloodPoints,bloodFlowPoints(bloodAmount,startHp,golden));
  }
  if(Object.keys(record.units).length)carry.flow[id]=record;
 }
 for(const v of (Array.isArray(a.donations)?a.donations:[]).slice(0,11))if(bases.has(v.id))carry.donations.push({id:v.id,remaining:n(v.remaining,0,8)});
 for(const v of (Array.isArray(a.bloodProcs)?a.bloodProcs:[]).slice(0,32))if(bases.has(v.id))carry.bloodProcs.push({id:v.id,remaining:n(v.remaining,0,10),n:Math.floor(n(v.n,0,3))});
 let total=0;for(const v of (Array.isArray(a.debts)?a.debts:[]).slice(0,256))if(uids.has(v.uid)&&Number.isFinite(v.amount)&&v.amount>0&&total+v.amount<=C*32+11200){carry.debts.push({uid:v.uid,amount:Math.min(v.amount,C+350),remaining:n(v.remaining,0,6)});total+=v.amount;}
 for(const [field,max]of [['marks',4],['meleeCooldowns',tier===3?1:2],['followCooldowns',.5],['fireFloorCooldowns',1]]){const seen=new Set();for(const v of (Array.isArray(a[field])?a[field]:[]).slice(0,units.length))if(uids.has(v.uid)&&!seen.has(v.uid)){seen.add(v.uid);carry[field].push({uid:v.uid,remaining:n(v.remaining,0,max)});}}
 for(const v of (Array.isArray(a.recoveries)?a.recoveries:[]).slice(0,32)){const u=units.find(u=>u.uid===v.uid);if(u&&actual(u)&&v.amount>0&&v.remaining>0)carry.recoveries.push({uid:v.uid,amount:n(v.amount,0,SKILL_RECOVERY_MULTIPLIER*hpLimit(u)),remaining:n(v.remaining,0,1)});}
 if(tier===3)for(const w of (Array.isArray(a.waves)?a.waves:[]).slice(0,units.length*2)){
  const u=units.find(u=>u.uid===w.uid);if(!u||!actual(u)||(gd&&rec(u)?.position!=='MELEE')||!w.sword||![w.x,w.y,w.dx,w.dy,w.max,w.distance].every(Number.isFinite)||Math.abs(w.dx)+Math.abs(w.dy)!==1)continue;
  const max=n(w.max,0,SWORD_RANGE);if(w.distance>=max)continue;
  const fire=waveDamage(tier,input.bonds[CORE].count||9,S,K);
  carry.waves.push({pid:input.playerId,uid:u.uid,id:0,seq:0,x:n(w.x,0,20),y:n(w.y,0,18),dx:w.dx,dy:w.dy,max,sword:true,width:1,distance:n(w.distance,0,max),baseArts:n(w.baseArts,0,D.baseArts),baseTrue:n(w.baseTrue,0,D.baseTrue),parts:{arts:n(w.parts?.arts,0,fire.fireArts),true:n(w.parts?.true,0,fire.fireTrue)},spent:n(w.spent,0,.04*C),committed:!!w.committed,hit:(Array.isArray(w.hit)?w.hit:[]).filter(k=>typeof k==='string'&&k.length<80).slice(0,256)});
 }
 carry.traits={cooldowns:[],buffs:[]};
 const metrics=['guards','curse','release','rescue','deferred','repaid','followUp','wave','decayed','skillLoss','skillRecovery','meleeProcs','resonances','traitDamage','traitHealing'];
 return{...fixed,kazdelCarry:carry,kazdelFlow:input.contentInfo?.kind==='normal'?carry.flow:{},kazdelMetrics:Object.fromEntries(metrics.map(k=>[k,n(p.kazdelMetrics?.[k],0,k==='guards'?(guardEnabled(tier)?Math.ceil(time/GUARD_MIN_CD)+1:0):1e13)]))};
}

function sanitizeFixedCarry(input,p,gd){
 const a=p?.kazdelFixedCarry;if(!a||!gd?.raw?.bonds?.[CORE]?.kazdelTraits)return{};
 const units=(input?.units||[]).filter(u=>u.kind!=='token'),round=input?.contentInfo?.round??0;
 if(a.round!==round)return{};
 const find=(uid,name)=>{const u=units.find(u=>u.uid===uid),c=u&&gd.chess(u.chessId);return c?.kazdelTrait?.native&&kazdelTraitFor(c)?.id===name;};
 const seen=new Set(),out={round,deployed:[],cooldowns:[],buffs:[]};
 for(const uid of (Array.isArray(a.deployed)?a.deployed:[]).slice(0,32))if(find(uid,'surtr')&&!seen.has('d:'+uid)){seen.add('d:'+uid);out.deployed.push(uid);}
 for(const v of (Array.isArray(a.cooldowns)?a.cooldowns:[]).slice(0,32))if(find(v.uid,'mudrock')&&v.key==='mudrockShield'&&Number.isFinite(v.remaining)&&v.remaining>0&&!seen.has('c:'+v.uid)){seen.add('c:'+v.uid);out.cooldowns.push({uid:v.uid,key:v.key,remaining:Math.min(6,v.remaining)});}
 for(const v of (Array.isArray(a.buffs)?a.buffs:[]).slice(0,32))if(find(v.uid,'mudrock')&&Number.isFinite(v.remaining)&&v.remaining>0&&!seen.has('b:'+v.uid)){seen.add('b:'+v.uid);out.buffs.push({uid:v.uid,remaining:Math.min(3,v.remaining)});}
 return{kazdelFixedCarry:out};
}
