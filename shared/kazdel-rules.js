// 5.10: population unlocks mechanics; layers scale numbers only. Native damage growth is preserved.
export const LAYER_CAP=999;
export const layers=n=>Math.max(0,Math.min(LAYER_CAP,Number.isFinite(n)?Math.floor(n):0));
export const PREP_GROWTH=[6,10,15],PERFORMANCE_CAP=[18,30,40];
export const BLOOD_PREP=[2,4],BLOOD_PERFORMANCE_CAP=[8,16];
const idx=tier=>Math.min(3,Math.max(1,tier))-1;
export const prosperity=()=>false; // legacy compatibility: no layer-unlocked state
// Smooth front-loaded offensive growth; no milestone unlock, and the same 999-layer endpoint.
export const offensiveGrowth=L=>{const n=layers(L);return n+.9*n*(1-n/LAYER_CAP);};
export const NATIVE_DAMAGE_BASE=[0,.25,.4];
export const nativeDamageBonus=(tier,L)=>NATIVE_DAMAGE_BASE[idx(tier)]+[.002,.0035,.005][idx(tier)]*(tier>=2?offensiveGrowth(L):layers(L));
export const HP_BASE=[.1,.15,.2],HP_PER_LAYER=[.0015,.002,.0025];
export const hpBonus=(tier,L)=>HP_BASE[idx(tier)]+HP_PER_LAYER[idx(tier)]*layers(L);
export const SKILL_RECOVERY_MULTIPLIER=1.2;
export const resourceDamageScale=()=>1;
export const deferRate=L=>Math.min(.45,.2+.0003*layers(L));
export const initialFireScale=()=>0; // old milestone grant removed; use openingFire
export const flowPoints=(amount,M0,golden,participated=false)=>Math.min(golden?10:6,(participated?(golden?2:1):0)+Math.floor(Math.max(0,amount)/Math.max(1,M0*.25))*(golden?2:1));
export const bloodFlowPoints=(amount,M0,golden)=>Math.min(golden?8:4,Math.floor(Math.max(0,amount)/Math.max(1,M0*.5))*(golden?2:1));
export const storageCapacity=(C,N=0,H=0)=>Math.floor((2+.2*Math.max(0,N))*C+.15*Math.max(0,H));
export const openingFire=(tier,C,H)=>Math.floor(Math.min([1.3,1.8,1.9][idx(tier)]*C,[1,1.3,1.4][idx(tier)]*C+[.04,.05,.06][idx(tier)]*H));
export const generationRate=(tier,L,K)=>Math.max(400+5*layers(L),[.12,.15,.18][idx(tier)]*K);
export const lifeFireRate=(tier,L,blood=0)=>Math.min(.6,[.3,.35,.4][idx(tier)]+.0003*layers(L)+blood);
export const NATIVE_FIRE_RATES=[.1,.18,.2],NATIVE_FIRE_BUDGET_SHARE=.35;
export const FOLLOW_UP_ARTS=[1.2,1.8,1.8],FOLLOW_UP_INTERVAL=.5;
export const OUTPUT_REFILL=[.25,.45,.6],HEAL_MARK_SECONDS=4,HEAL_MARK_WEIGHT=1.5;
export const MELEE_COOLDOWNS=[0,2,1],SWORD_RANGE=3,SWORD_SPEED=5,SWORD_WIDTH=1;
export const MELEE_BASE_ARTS=[0,.8,1.2],MELEE_BASE_TRUE=[0,0,.15];
export const RESONANCE_DURATION=6,RESONANCE_CD=16,NATURAL_SP_SCALE=1.2;
export const DECAY_GRACE=8,DECAY_RATE=.015,ACTIVE_DECAY_RATE=.005,ACTIVITY_SECONDS=5;
export const TRUE_ECHO_SCALE=1.25;
export const generationBudget=(tier,S,K0=0)=>Math.max(tier>=3?14000+180*layers(S):10000+80*layers(S),3*K0);
export const CURSE_INTERVAL=2;
export const curseBase=(tier,S)=>tier>=2?[375,500,650][idx(tier)]+[.25,.65,.85][idx(tier)]*offensiveGrowth(S):375+.25*layers(S);
// Per pulse; tiers 6/9 strengthen the reliable whole-field component.
export const CURSE_FIRE_RATES=[.0005,.002,.003];
export const curseDamage=(tier,S,Q,K)=>curseBase(tier,S)+CURSE_FIRE_RATES[idx(tier)]*Math.max(0,Math.min(K,Q));
export const CURSE_GROUND_MULTIPLIERS=[1,.5,.5],CURSE_AIR_MULTIPLIER=2;
export const curseTargetDamage=(tier,S,Q,K,flying=false)=>curseDamage(tier,S,Q,K)*(flying?CURSE_AIR_MULTIPLIER:CURSE_GROUND_MULTIPLIERS[idx(tier)]);
export const ATTACK_MIN_FIRE=[1,1,1],ATTACK_RESERVE_SCALES=[.5,.75,1.1];
export const attackReserve=(tier,C,danger=false)=>C*(danger?1.1:ATTACK_RESERVE_SCALES[idx(tier)]);
export const GUARD_BASE_CD=12,GUARD_MAX_REDUCTION=0,GUARD_MIN_CD=12,GUARD_COST_SCALE=.75;
export const guardEnabled=tier=>tier>=3;
export const guardCooldown=()=>GUARD_BASE_CD;

// 5.5 waves: one payment per action; population/layer base survives an empty fire pool.
export const ATTACK_FLOOR_RATES=[.003,.006,.007];
export const waveCost=(tier,C)=>[0,.03,.04][idx(tier)]*C;
export const WAVE_FIRE_RATES=[0,.05,.06],WAVE_DAMAGE_SCALES=[1,.85,.8],SWORD_TRUE_FRACTION=.15;
export function waveDamage(tier,N,L,Q,fraction=1){
 const sword=tier>=3,scale=WAVE_DAMAGE_SCALES[idx(tier)],base=((sword?1250:800)+(sword?160:120)*Math.max(0,N)+(sword?3:2)*offensiveGrowth(L))*scale;
 const fire=WAVE_FIRE_RATES[idx(tier)]*Math.max(0,Q)*Math.max(0,Math.min(1,fraction))*scale;
 return {baseArts:base,baseTrue:sword?SWORD_TRUE_FRACTION*base:0,arts:base+fire,true:sword?SWORD_TRUE_FRACTION*(base+fire):0,fireArts:fire,fireTrue:sword?SWORD_TRUE_FRACTION*fire:0};
}
// Genuine operator kits use the same kz namespace as covenant effects; only these kit tags are native damage.
const nativeKitTags=new Set(['kz:skill','kz:hodrerDot','kz:logosExecute','kz:logosEcho','kz:logosBeam','kz:logosTalent','kz:bomb']);
export const nativeDamagePacket=dmg=>!!dmg&&!dmg.sourceless&&['phys','arts','true'].includes(dmg.type)
 &&!(dmg.tags||[]).some(t=>/^(bond|item|element|reflect|hpLoss)/.test(t)||t.startsWith('kz:')&&!nativeKitTags.has(t));
