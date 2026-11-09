// Same-round fire control state. Enemy ids, marks and pending shots never cross fields.
const num=(n,max)=>Number.isFinite(n)&&n>=0&&n<=max;
const int=(n,max)=>Number.isInteger(n)&&num(n,max);
export function isRhodesCarry(a){
 return !!a&&typeof a==='object'&&!Array.isArray(a)&&a.version===2&&int(a.round,100)
  &&num(a.elapsed,1e5)&&int(a.commands,2)&&int(a.gained,50001)&&int(a.spent,50001)
  &&a.gained-a.spent===a.commands&&a.gained<=Math.floor((a.elapsed+1e-6)/2)+1
  &&num(a.teamCooldown,2)&&num(a.mainCooldown,4)
  &&(a.openingCooldown===null||num(a.openingCooldown,2))
  &&int(a.growthUsed,30)&&int(a.serial,1e6)&&Array.isArray(a.families)&&a.families.length<=32
  &&a.families.every(v=>v&&typeof v.family==='string'&&/^[\w.:-]{1,64}$/.test(v.family)&&num(v.remaining,10))
  &&new Set(a.families.map(v=>v.family)).size===a.families.length
  &&Array.isArray(a.personal)&&a.personal.length<=32&&a.personal.every(v=>v&&int(v.uid,2**31)&&v.uid>0&&typeof v.family==='string'&&/^[\w.:-]{1,64}$/.test(v.family)
   &&int(v.leading,3)&&num(v.leadRemaining,4)&&num(v.mortisRemaining,4)&&int(v.charges,3)&&int(v.fusion,3)&&typeof v.refundArmed==='boolean'&&typeof v.refundEffective==='boolean')
  &&new Set(a.personal.map(v=>v.uid)).size===a.personal.length
  &&Array.isArray(a.personalCooldowns)&&a.personalCooldowns.length<=32&&a.personalCooldowns.every(v=>v&&typeof v.family==='string'&&/^[\w.:-]{1,64}$/.test(v.family)&&num(v.remaining,8))
  &&new Set(a.personalCooldowns.map(v=>v.family)).size===a.personalCooldowns.length;
}
export function compactRhodesResult(p){
 const a=p?.rhodesCarry;if(!isRhodesCarry(a))return {};
 return {rhodesCarry:{version:2,round:a.round,elapsed:a.elapsed,commands:a.commands,gained:a.gained,spent:a.spent,
  teamCooldown:a.teamCooldown,mainCooldown:a.mainCooldown,openingCooldown:a.openingCooldown,growthUsed:a.growthUsed,serial:a.serial,
  families:a.families.map(v=>({family:v.family,remaining:v.remaining})),
  personal:a.personal.map(v=>({uid:v.uid,family:v.family,leading:v.leading,leadRemaining:v.leadRemaining,mortisRemaining:v.mortisRemaining,charges:v.charges,fusion:v.fusion,refundArmed:v.refundArmed,refundEffective:v.refundEffective})),
  personalCooldowns:a.personalCooldowns.map(v=>({family:v.family,remaining:v.remaining}))}};
}
