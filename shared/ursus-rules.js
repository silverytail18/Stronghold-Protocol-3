import {GEO} from './constants.js';
export const CORE='ursusShip',STUDENT='ursusStudentShip',BATCH='ursus-expansion-v1';
export const MARKET='band_ursus_rollcall',AID='band_ursus_aid',BADGE='ursus_badge',SURVEY='ursus_survey';
export const STUDENT_CHARS=Object.freeze(['char_196_sunbr','char_115_headbr','char_195_glassb','char_405_absin','char_194_leto','char_197_poca','char_1051_headb2']);
export const THRESHOLDS=Object.freeze([3,6,8]),DEPTH_CAPS=Object.freeze([3,4,6]);
export const LEVELS=Object.freeze([
 {depth:1,slow:0,haste:0,reveal:false,def:0,res:0,extra:1},
 {depth:2,slow:.20,haste:0,reveal:false,def:0,res:0,extra:1},
 {depth:3,slow:.25,haste:15,reveal:true,def:0,res:0,extra:1},
 {depth:4,slow:.30,haste:20,reveal:true,def:.25,res:8,extra:1},
 {depth:5,slow:.35,haste:25,reveal:true,def:.30,res:10,extra:1.20},
 {depth:6,slow:.70,haste:50,reveal:true,def:.60,res:20,extra:1.40}
].map(value=>Object.freeze(value)));
export const EXECUTION=Object.freeze({depth:5,cooldown:30,refund:1,refundCap:5,windup:.6,retry:.5,maxHpRatio:1});
export const layers=n=>Math.max(0,Math.min(999,Math.trunc(Number.isFinite(n)?n:0)));
export const tier=n=>n>=8?3:n>=6?2:n>=3?1:0;
export const depthCap=t=>DEPTH_CAPS[t-1]||0;
export const damageMultiplier=L=>1.50+.004*layers(L);
export const attackReduction=L=>Math.min(.60,.20+.40*layers(L)/999);
export const LATE_BONUSES=Object.freeze([{hp:0,guard:0,boss:0},{hp:.30,guard:.15,boss:.50},{hp:.50,guard:.25,boss:1}].map(value=>Object.freeze(value)));
export const lateBonuses=t=>LATE_BONUSES[t-1]||LATE_BONUSES[0];
export const OPENING_SHIELD=Object.freeze({tier:3,depth:4,ratio:.50});
export const effects=(K,t)=>LEVELS[Math.min(Math.max(0,K),depthCap(t))-1]||null;
export const originalDirect=d=>!!d&&!d.sourceless&&['phys','arts','true'].includes(d.type)&&!d.tags?.some(t=>/(?:^|:)(bond|item|dot|periodic|reflect|counter|hpLoss|aftershock)(?::|$)/.test(t)||/^(ur:|hg:)/.test(t))&&!d.isPeriodic;
export function refundExecution(state,T){
 if(state.pending||!(state.readyAt>T)||state.refundUsed>=EXECUTION.refundCap)return 0;
 const delta=Math.min(EXECUTION.refund,EXECUTION.refundCap-state.refundUsed,state.readyAt-T);
 state.readyAt-=delta;state.refundUsed+=delta;return delta;
}
export const bossTarget=e=>!!(e?.isBoss||e?.def?.rank==='BOSS'||e?.bossPool||e?.mem?.storyBoss);
export function rangeCells(grid,row,col,dir='RIGHT',{extend=0,rows=GEO.ROWS,cols=GEO.COLS}={}){
 const cells=new Map(),push=(dr,dc)=>{const [r,c]=dir==='UP'?[dc,-dr]:dir==='LEFT'?[-dr,-dc]:dir==='DOWN'?[-dc,dr]:[dr,dc];const rr=row+r,cc=col+c;if(rr>=0&&rr<rows&&cc>=0&&cc<cols)cells.set(rr*cols+cc,[rr,cc]);};
 const valid=(Array.isArray(grid)?grid:[]).filter(v=>Array.isArray(v)&&Number.isInteger(v[0])&&Number.isInteger(v[1]));
 for(const [r,c]of valid)push(r,c);
 if(extend>0){const far=new Map();for(const [r,c]of valid)far.set(r,Math.max(far.get(r)??-Infinity,c));for(const[r,c]of far)for(let i=1;i<=Math.min(cols,Math.trunc(extend));i++)push(r,c+i);}
 return [...cells.values()];
}
export function territory(sources,t,{cols=GEO.COLS,validCell=(_r,_c)=>true}={}){
 const families=new Map(),counts=new Map();
 for(const s of sources){if(!s?.family||!Array.isArray(s.cells))continue;const keys=families.get(s.family)||new Set();for(const [r,c]of s.cells)if(validCell(r,c))keys.add(r*cols+c);families.set(s.family,keys);}
 for(const keys of families.values())for(const key of keys)counts.set(key,(counts.get(key)||0)+1);
 const cells=[...counts].sort((a,b)=>a[0]-b[0]).map(([key,K])=>({key,row:Math.floor(key/cols),col:key%cols,K,k:Math.min(K,depthCap(t))}));
 return{cells,counts,union:new Set(counts.keys()),shared:new Set(cells.filter(c=>c.k>=2).map(c=>c.key)),empowered:new Set(cells.filter(c=>c.k>=2).map(c=>c.key)),area:cells.length,families:families.size};
}
export const CORE_DESCRIPTION="<在场<@autochess.dgreen>3</>名不同【乌萨斯】干员>开战前按成员原生攻击范围确定本场国度，按不同干员计重，阵亡、再部署和技能范围变化均不重算，开放最高<@ba.vup>三重</>。二重起共享普通攻击目标，近战成员可普通攻击共享国度内的空中敌人；二重及以上，对其中敌人的原生直接伤害提高<@ba.vup>50%</>（每层再提高<@ba.vup>0.4个百分点</>），敌人攻击力降低<@ba.vup>20%—60%</>（随层数提升）；二重使敌人移动速度降低<@ba.vup>20%</>；三重提高至<@ba.vup>25%</>，并使攻击速度降低<@ba.vup>15</>、隐匿敌人显形。\n<在场<@autochess.dgreen>6</>名不同【乌萨斯】干员>本人成员最大生命提高<@ba.vup>30%</>，位于本人一重及以上国度内时受到的敌方伤害降低<@ba.vup>15%</>；对本人二重及以上国度内Boss的原生直接伤害额外提高<@ba.vup>50%</>。开放<@ba.vup>四重</>：移动速度降低<@ba.vup>30%</>、攻击速度降低<@ba.vup>20</>、防御力降低<@ba.vup>25%</>、法术抗性降低<@ba.vup>8</>，并使隐匿敌人显形。\n<在场<@autochess.dgreen>8</>名不同【乌萨斯】干员>开战时，位于本人四重及以上国度内的本人真实干员获得当时当前生命值<@ba.vup>50%</>的护盾，每场一次；上述生命、域内减伤与对Boss增伤分别提高至<@ba.vup>50%／25%／100%</>，替代六人档。开放最高<@ba.vup>六重</>；五重使移动速度降低<@ba.vup>35%</>、攻击速度降低<@ba.vup>25</>、防御力降低<@ba.vup>30%</>、法术抗性降低<@ba.vup>10</>，成员原生直接伤害额外提高<@ba.vup>20%</>，解锁国度裁决。六重使上述压制数值翻倍至<@ba.vup>70%／50／60%／20</>，额外增伤提高至<@ba.vup>40%</>，替代五重数值，沿用同一裁决冷却。三重以上均可显形，各重效果取所在格最高值。\n休整结束时，按至少一重的去重覆盖面积，每格获得<@ba.vup>1层</>，最多<@ba.vup>999层</>；同名普通／精锐的范围合并计算。";
export const STUDENT_DESCRIPTION='2名不同【学生自治团】：本人真实学生最大生命＋15%；4名提高至30%，替代15%。不叠层、不授乌萨斯共享，不改变原作天然学生分类。';
export const EXECUTION_DESCRIPTION='国度裁决：锁定五重及以上国度内当前HP最高合法非Boss，0.6秒后造成结算时目标最大生命100%的真伤，走正常护盾/减免/保命，不受本盟约层数或五重额外倍率放大。每人CD30秒；本人真实干员有效原生直伤命中五重及以上敌人每次返还1秒、每轮最多5秒，就绪不储存；裁决自身不触发。';
export function currentEffect(L,t,context={}){
 const value=n=>'<@ba.vup>'+n+'</>',num=n=>String(Number(n.toFixed(2))),lines=[
  '本场国度在开战前确定，战斗中不重算。',
  '二重及以上国度：成员共享普通攻击目标，近战成员可普通攻击其中的空中敌人。',
  '二重及以上国度：原生直接伤害提高'+value(num((damageMultiplier(L)-1)*100)+'%')+'，敌人攻击力降低'+value(num(attackReduction(L)*100)+'%')+'。',
  '当前开放最高'+value(depthCap(t)+'重')+'；二重：敌人移动速度降低'+value('20%')+'；三重：移动速度降低'+value('25%')+'、攻击速度降低'+value('15')+'，隐匿敌人显形。'
 ];
 if(t>=2){const f=lateBonuses(t);lines.push('本人成员最大生命提高'+value(num(f.hp*100)+'%')+'；位于本人一重及以上国度内时受到的敌方伤害降低'+value(num(f.guard*100)+'%')+'；对本人二重及以上国度内Boss的原生直接伤害额外提高'+value(num(f.boss*100)+'%')+'。');}
 if(t>=2)lines.push('四重：移动速度降低'+value('30%')+'、攻击速度降低'+value('20')+'、防御力降低'+value('25%')+'、法术抗性降低'+value('8')+'，隐匿敌人显形。');
 if(t>=3){lines.push('开战护盾：位于本人四重及以上国度内的本人真实干员，获得当时当前生命值'+value('50%')+'的护盾，每场一次，再部署不补发。');lines.push('五重：移动速度降低'+value('35%')+'、攻击速度降低'+value('25')+'、防御力降低'+value('30%')+'、法术抗性降低'+value('10')+'，原生直接伤害额外提高'+value('20%')+'，可发动国度裁决。');lines.push('六重：五重压制数值翻倍为'+value('70%／50／60%／20')+'，原生直接伤害额外提高'+value('40%')+'，替代五重数值，沿用同一裁决冷却与返还额度。');}
 if(Number.isFinite(context.area)){
  const delta=n=>Number.isFinite(n)?'（'+(n>=0?'+':'')+n+'）':'';
  lines.push((context.preview?'布置预演':'当前疆域')+'：覆盖'+value(context.area+'格')+(context.preview?delta(context.deltaArea):'')+'，增益区域（二重及以上）'+value((context.sharedArea||0)+'格')+(context.preview?delta(context.deltaShared):'')+'。');
  if(context.live===false)lines.push('整备结束按实际覆盖面积获得层数；'+(context.preview?'预演尚未结算。':'当前布置预计获得'+value(context.area+'层')+'。'));
 }
 if(t>=3&&context.live===true){
  const cooldown=Number.isFinite(context.cooldown)?Math.max(0,context.cooldown):null;
  lines.push('国度裁决：'+(context.lockedTarget!=null?'锁定中'+(Number.isFinite(context.resolveIn)?'，'+value(Math.max(0,context.resolveIn).toFixed(1)+'秒')+'后结算':''):cooldown===null?'状态待获取':cooldown>0?'冷却剩余'+value(cooldown.toFixed(1)+'秒'):value('已就绪'))+'；本轮已返还'+value(num(Math.max(0,context.refundUsed||0))+'/5秒')+'。');
 }
 return lines.join('\n');
}
