import {CORE,D,layers,lateHaste,originalAttack} from '../../../../shared/higashi-rules.js';
const live=u=>u?.alive&&u.deployed&&!u.removed;
const family=u=>u.def?.baseId||u.defId;
const rank=e=>e?.isBoss||e?.def?.rank==='BOSS'?2:e?.def?.rank==='ELITE'?1:0;
const fresh=previous=>({target:null,cuts:0,lastHit:0,decayAt:0,previous:null,bucket:previous?.bucket??-1,used:previous?.used??0,contributors:new Map()});
// This mechanic modifies the operator's existing attack. It creates no damage packets or resource grants.
export function installDuel(b,{states,preview,time,identity,F}){
 const actions=new WeakMap();
 for(const s of states.values())s.duel=fresh();
 const currentLayers=s=>layers(b.getPlayer(s.pid)?.bonds?.[CORE]?.layers??s.L);
 const buff=(u,key,aspd)=>{if(!(aspd>0)){b.removeBuff(u,key);return;}if(u.findBuff(key)?.mods?.aspd===aspd)return;b.addBuff(u,{key,mods:{aspd},persist:true,allowDead:true});};
 function sync(){for(const u of b.allyUnits){const s=states.get(u.ownerId);if(!s?.tier||!identity(u)){buff(u,'hg:lateHaste',0);buff(u,'hg:comboHaste',0);continue;}
  buff(u,'hg:lateHaste',lateHaste(currentLayers(s),s.tier));
  buff(u,'hg:comboHaste',s.tier>=2&&live(u)&&(s.families.get(family(u))?.comboUntil||0)>time(s)?D.comboHaste[s.tier-1]:0);
 }}
 function update(s){const q=s.duel,T=time(s),e=b.enemies.find(e=>e.id===q.target);
  if(q.target!==null&&!live(e)){s.duel=fresh(q);return;}
  if(q.cuts&&T+1e-7>=q.decayAt){const n=Math.floor((T-q.decayAt)/D.decayInterval)+1;q.cuts=Math.max(0,q.cuts-n);q.decayAt+=n*D.decayInterval;if(!q.cuts)q.previous=null;}
  for(const [id,t]of q.contributors)if(T-t>D.participationWindow)q.contributors.delete(id);
 }
 const source=(u,e,dmg)=>{const s=states.get(u?.ownerId);return !preview&&s?.tier>=2&&identity(u)&&live(u)&&e?.side==='enemy'&&live(e)&&originalAttack(dmg)&&!dmg.tags?.some(t=>/^(counter|reflect|native:hg:counter)/.test(t))&&['phys','arts','true'].includes(dmg.type)?s:null;};
 b.on('hit',({source:u,target:e,dmg})=>{const s=source(u,e,dmg);if(!s)return;update(s);const q=s.duel;if(q.target!==e.id||!q.cuts)return;
  dmg.mul=(dmg.mul??1)*(1+q.cuts*D.damagePerCut[s.tier-1]);
  if((s.families.get(family(u))?.comboUntil||0)>time(s)&&dmg.type==='phys')dmg.defIgnorePct=(dmg.defIgnorePct||0)+D.comboDefIgnore[s.tier-1];
 });
 b.on('damageResolved',({source:u,target:e,dmg,dealt})=>{if(!(dealt>0))return;const s=source(u,e,dmg);if(!s)return;update(s);let q=s.duel;const T=time(s),id=family(u);
  if(q.target===null||q.target!==e.id&&(rank(e)>rank(b.enemies.find(z=>z.id===q.target))||q.cuts===0&&T-q.lastHit>=D.decayAfter)){q=s.duel=fresh(q);q.target=e.id;}
  if(q.target!==e.id)return;
  const action=dmg.attackId||0,f=F(u);
  if(action){let seen=actions.get(u);if(!seen){seen=new Set();actions.set(u,seen);}if(seen.has(action))return;seen.add(action);if(seen.size>128)seen.delete(seen.values().next().value);}
  if(T+1e-7<(f.insightReady||0))return;f.insightReady=T+D.familyInterval;
  const bucket=Math.floor(T+1e-7);if(q.bucket!==bucket){q.bucket=bucket;q.used=0;}
  q.lastHit=T;q.decayAt=T+D.decayAfter;q.contributors.set(id,T);
  const gain=Math.min(q.previous&&q.previous!==id?2:1,D.gainCapPerSecond-q.used),before=q.cuts;q.used+=gain;q.cuts=Math.min(D.cutCap,q.cuts+gain);q.previous=id;s.metrics.insightHits++;
  let burst=false;if(q.cuts===D.cutCap&&q.contributors.size>=2&&T+1e-7>=s.duelBurstReady){
   s.duelBurstReady=T+D.comboCooldown;s.metrics.duelBursts++;burst=true;
   for(const a of b.allyUnits)if(a.ownerId===s.pid&&identity(a)&&live(a)&&q.contributors.has(family(a)))F(a).comboUntil=T+D.comboDuration;
   sync();
  }
  if(burst||Math.floor(before/4)!==Math.floor(q.cuts/4))b.fx('higashiInsight',{src:u.id,id:e.id,x:e.x,y:e.y,cuts:q.cuts,burst});
 });
 for(const event of ['battleStart','deploy','death','retreat','layerGain'])b.on(event,sync);
 b.on('tick',()=>{for(const s of states.values())if(s.tier>=2)update(s);sync();});sync();
 return {view(s){const q=s.duel,e=b.enemies.find(e=>e.id===q.target),T=time(s);return {haste:lateHaste(currentLayers(s),s.tier),target:live(e)?e.id:null,targetName:live(e)?e.name:'',cuts:live(e)?q.cuts:0,cap:D.cutCap,bonus:live(e)?q.cuts*(D.damagePerCut[s.tier-1]||0):0,combo:Math.max(0,...[...s.families.values()].map(f=>(f.comboUntil||0)-T)),cooldown:Math.max(0,s.duelBurstReady-T)};}};
}
