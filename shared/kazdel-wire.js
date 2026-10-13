// Preserve bounded Kazdel phase state in b.result. The match separately validates it against its battle input.
const list=(a,max)=>Array.isArray(a)?a.slice(0,max):[];
const numeric=(o,keys)=>Object.fromEntries(keys.filter(k=>Number.isFinite(o?.[k])).map(k=>[k,o[k]]));
export function compactKazdelResult(p){
 const fixed=p?.kazdelFixedCarry;const fixedResult=fixed&&typeof fixed==='object'?{kazdelFixedCarry:{round:fixed.round,deployed:list(fixed.deployed,32).filter(Number.isFinite),cooldowns:list(fixed.cooldowns,32).map(v=>({...numeric(v,['uid','remaining']),key:v.key})),buffs:list(fixed.buffs,32).map(v=>numeric(v,['uid','remaining']))}}:{};
 const a=p?.kazdelCarry;if(!a||typeof a!=='object')return fixedResult;
 const carry=numeric(a,['round','time','Q','K0','E','capacity','generated','nativeGenerated','nativeSecondGenerated','activityRemaining','lastWaveSpent','second','secondGenerated','guardRemaining','releaseRemaining','resonanceRemaining','resonanceCooldown','decayGraceRemaining']);
 if(a.decayGraceRemaining==null)carry.decayGraceRemaining=null;
 for(const field of ['donations','bloodProcs','debts','marks','meleeCooldowns','followCooldowns','fireFloorCooldowns','recoveries','openingHp'])carry[field]=list(a[field],field==='debts'?256:32).filter(v=>v&&typeof v==='object').map(v=>({...numeric(v,['uid','remaining','n','amount','hp']),...(typeof v.id==='string'&&v.id.length<100?{id:v.id}:{})}));
 carry.traits={cooldowns:list(a.traits?.cooldowns,128).filter(v=>v&&typeof v.key==='string'&&v.key.length<60).map(v=>({...numeric(v,['uid','remaining']),key:v.key})),buffs:list(a.traits?.buffs,128).filter(v=>v&&typeof v.key==='string'&&v.key.length<60&&['shield','protection','handover'].includes(v.kind)).map(v=>({...numeric(v,['uid','amount','remaining']),key:v.key,kind:v.kind}))};
 carry.flow={};for(const [id,f]of Object.entries(a.flow||{}).slice(0,32)){
  if(id.length>100||!f||typeof f!=='object')continue;const out={tier:f.tier,blood:!!f.blood,units:{}};
  for(const [uid,v]of Object.entries(f.units||{}).slice(0,32))if(v&&typeof v==='object')out.units[uid]={...numeric(v,['amount','bloodAmount','startHp','seconds']),golden:!!v.golden,effective:!!v.effective,shortClear:!!v.shortClear,growth:numeric(v.growth,['attacks','blockedAttacks','blastHits','explosions','artsAttacks','skillStarts','shieldBreaks','lowHeals','healAmount','healSeconds','blockedSeconds','firstDeploy','legacyPoints'])};
  carry.flow[id]=out;
 }
 carry.waves=list(a.waves,32).filter(w=>w&&typeof w==='object').map(w=>({...numeric(w,['uid','x','y','dx','dy','max','distance','width','baseArts','baseTrue','spent']),sword:!!w.sword,committed:!!w.committed,parts:numeric(w.parts,['arts','true']),hit:list(w.hit,256).filter(k=>typeof k==='string'&&k.length<80)}));
 return{...fixedResult,kazdelCarry:carry,kazdelMetrics:numeric(p.kazdelMetrics,['guards','curse','release','rescue','deferred','repaid','followUp','wave','decayed','skillLoss','skillRecovery','meleeProcs','resonances','traitDamage','traitHealing'])};
}
