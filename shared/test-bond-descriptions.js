import {engineeringDamage} from './rhodes-engineering.js';
import {rhineCurrentEffect} from './rhine-description.js';

// Presentation only. Each overlay supplies its existing balance constants; no battle values are changed here.
export const TEST_BOND_IDS=Object.freeze(['suiShip','penguinShip','snowfieldGuideShip','rhodesShip','girlbandShip']);
const num=n=>String(Math.round(n*10)/10);
const value=n=>'<@ba.vup>'+n+'</>';
const pct=n=>value(num(n*100)+'%');
const integer=n=>value(String(Math.round(n)));
const need=(n,name)=>'<在场<@autochess.dgreen>'+n+'</>名不同【'+name+'】干员>';
export function setTestBondDescription(b,kind,config={}){
 if(!b)return;
 const old=b.descRaw||b.desc||'';
 b.testDescription={kind,...config};
 b.detailSections=[{title:'触发与结算',text:old}];
 let text='';
 if(kind==='sui')text='两名不同【岁】干员在3秒内攻击造成伤害或直接治疗后，发动合击：对目标造成法术伤害，波及附近至多2名敌人'+value('（受层数影响）')+'，冷却'+value('8秒')+'\n'+need(4,'岁')+'合击追加物理伤害，波及目标提高至'+value('4名')+'\n（按参与者开战时、不含技能增益的平均攻击力计算，最多计入80层）';
 if(kind==='penguin'){const p=config;text='本队携带持续战斗装备的干员攻击力'+value('+'+p.atkFlat[0])+'、防御力'+value('+'+p.defFlat[0])+'，攻击力和防御力各+'+pct(p.statPct[0])+'；休整期结束增加'+value(p.growth[0]+'层')+'\n'+need(4,'企鹅物流')+'固定加成提高至'+value('+'+p.atkFlat[1]+'／+'+p.defFlat[1])+'，比例加成提高至'+pct(p.statPct[1])+'，每回合增加'+value(p.growth[1]+'层')+'\n<达到'+value(p.milestones.join('／')+'层')+'>各获得一件随机装备，4人档获得进阶装备\n（开始休整时发放，每次最多一件，每局最多三件）';}
 if(kind==='snow'){const k=config;text='每'+value(k.coldCooldown+'秒')+'使本方存活【雪境向导】干员攻击范围内的敌人'+value('寒冷'+k.coldDuration2+'秒')+'，可对空\n'+need(4,'雪境向导')+'寒冷提高至'+value(k.coldDuration4+'秒')+'；成员攻击冻结敌人并造成生命损失时触发冰爆，造成'+value(k.iceBase+'＋攻击力'+k.iceAtkRatio*100+'%')+'法术伤害（攻击力部分最多'+k.iceAtkCap+'），周围'+k.iceRadius+'格受到一半伤害，共享冷却'+value(k.iceCooldown+'秒')+'\n新冻结缩短冰爆冷却，冰爆缩短寒冷冷却（两项间隔最短'+k.coldMinimum+'秒）\n（首个有效目标出现'+k.firstDelay+'秒后首次施加寒冷，效果不随层数变化）';}
 if(kind==='rhodes'){const e=b.engineering;text='【罗德岛】干员攻击力和生命值提升（受层数影响）；1—3阶首次部署技力'+value('+8／12')+'（普通／精锐）\n'+need(6,'罗德岛')+'每'+value(e.interval[0]+'秒')+'发射物理、法术炮弹各一发，对'+value(e.radius[0]+'格')+'内至多'+value(e.maxTargets[0]+'名')+'敌人造成伤害\n'+need(9,'罗德岛')+'炮击间隔缩短至'+value(e.interval[1]+'秒')+'，范围扩大至'+value(e.radius[1]+'格')+'并命中范围内全部敌人，追加真实炮弹\n（炮击预告期间主目标减速'+e.lockSlow*100+'%；真实弹伤害为物理／法术弹的'+e.trueScale*100+'%）';}
 if(kind==='girl')text='【少女乐队】干员首次部署技力'+value('+10')+'，自身物理、法术伤害及直接治疗量'+value('+15%')+'\n'+need(4,'少女乐队')+'首次部署技力提高至'+value('15')+'，伤害及直接治疗加成提高至'+value('20%')+'，Fever获得量'+value('+30%')+'；Fever期间加成提高至'+value('40%')+'，结束后延续'+value('6秒')+'余韵';
 b.descRaw=b.effectDescRaw=text;
 b.desc=b.effectDesc=text.replace(/<[@$][A-Za-z0-9_.-]+>/g,'').replace(/<\/>/g,'');
}

/** Null means this is an original bond or an excluded pack. Undefined tier is used only by old callers. */
export function testBondEffect(b,layers,tier,context){
 const p=b?.testDescription;if(!p)return null;
 if(!(tier>=1))return '未激活：在场至少'+b.thresholds[0]+'名不同【'+b.name+'】干员后生效。';
 const i=tier>=2?1:0,L=Math.max(0,Math.min(b.effectLayerCap??999,Number(layers)||0)),c=context||{};
 if(p.kind==='rhine')return rhineCurrentEffect(L,Number.isFinite(c.count)?c.count:[3,6,9,10][Math.min(3,tier-1)],c);
 if(p.kind==='sui'){
  const arts=b.bb.artsBase+b.bb.artsPerLayer*L,phys=b.bb.physicalBase+b.bb.physicalPerLayer*L;
  return ['合击主目标：'+pct(arts)+'法术伤害'+(i?'，追加'+pct(phys)+'物理伤害':'')+'。','附近至多'+value(i?4:2)+'名敌人各受'+pct(arts*.6)+'法术伤害；冷却'+value('8秒')+'。','（以两名参与者开战攻击平均值为基准，不计技能增益；有效层数'+L+'／80）'].join('\n');
 }
 if(p.kind==='penguin'){
  const n=Number.isInteger(c.claimed)?Math.min(p.milestones.length,Math.max(0,c.claimed)):null;
  return ['装备干员攻击力'+value('+'+p.atkFlat[i])+'、防御力'+value('+'+p.defFlat[i])+'，两项各+'+pct(p.statPct[i])+'。','基础休整成长'+value('+'+p.growth[i]+'层')+'；当前补给品质：'+value(i?'进阶':'普通')+'。',c.preview?'补给里程'+p.milestones.join('／')+'层，每次休整最多一件。':n===null?'已领取装备：待获取（层数不代表领取次数）。':'已领取装备'+value(n+'/'+p.milestones.length)+'；'+(n<p.milestones.length?'下一未领取里程'+value(p.milestones[n]+'层')+'。':'本局补给已全部领取。')].join('\n');
 }
 if(p.kind==='snow'){
  const lines=['范围寒冷'+value((i?p.coldDuration4:p.coldDuration2)+'秒')+'，基础间隔'+value(p.coldCooldown+'秒')+'；首次有效目标后'+p.firstDelay+'秒。'];
  if(c.live)lines.push('寒冷：'+(c.coldRemaining===null?'等待首次有效目标':c.coldRemaining>0?'剩余'+value(num(c.coldRemaining)+'秒'):'已就绪，等待有效目标')+'。');
  if(i){
   const rows=Array.isArray(c.members)?c.members:[],amounts=rows.map(r=>p.iceBase+Math.min(Math.max(0,r.atk)*p.iceAtkRatio,p.iceAtkCap));
   const range=a=>a.length?integer(Math.min(...a))+(Math.max(...a)!==Math.min(...a)?'—'+integer(Math.max(...a)):''):'待获取';
   lines.push((c.preview?'示例':c.live===false?'开战预计':'当前')+'成员冰爆：主目标 '+range(amounts)+'，周围 '+range(amounts.map(n=>n*p.iceSplashRatio))+'（减伤前）。');
   lines.push('周围半径'+p.iceRadius+'格，基础冷却'+value(p.iceCooldown+'秒')+'；'+(c.live?'冰爆'+(c.iceRemaining>0?'剩余'+value(num(c.iceRemaining)+'秒'):'已就绪')+'。':'需攻击冻结敌人并造成生命损失。'));
   lines.push('新冻结返还'+p.freezeRefund+'秒（单轮最多'+p.freezeRefundCap+'秒）；冰爆返还寒冷'+p.coldRefund+'秒，最短间隔'+p.iceMinimum+'秒。');
  }
  return lines.join('\n');
 }
 if(p.kind==='girl'){
  const live=c.live===true,fever=live&&c.feverRemaining>0,encore=live&&!fever&&c.encoreRemaining>0,boost=i?((fever||encore) ? .4 : .2):.15;
  const lines=['首次部署技力'+value('+'+(i?15:10))+'；自身物理、法术伤害及直接治疗量+'+pct(boost)+'。'];
  if(i){lines.push('Fever获得量'+value('+30%')+'；'+(live?(fever?'Fever剩余'+value(num(c.feverRemaining)+'秒'):encore?'余韵剩余'+value(num(c.encoreRemaining)+'秒'):'当前常态')+'。':'Fever／余韵期间加成提高至'+value('40%')+'，余韵持续6秒。'));}
  if(live&&Number.isFinite(c.heat))lines.push('Fever进度'+value(num(c.heat)+'/450')+'。');
  return lines.join('\n');
 }
 if(p.kind==='rhodes'){
  const e=b.engineering,bb=b.bb,j=tier>=3?1:0,known=Number.isFinite(c.atk),n=engineeringDamage(e,L,known?c.atk:0,tier);
  const lines=['攻击力+'+pct(bb.atkBase+bb.atkPerLayer*L)+'，最大生命+'+pct(bb.hpBase+bb.hpPerLayer*L)+'。','1—3阶首次部署技力'+value('+8／12')+'（普通／精锐，与乐队／终端补差额）。'];
  if(tier>=2){lines.push((c.preview?'示例':c.live===false?'开战预计':'当前')+'单发伤害：物理 '+(known?integer(n.fire):'待获取')+'，法术 '+(known?integer(n.fire):'待获取')+(j?'，真实 '+(known?integer(n.fire*e.trueScale):'待获取'):'')+'（减伤前）。');lines.push('工程火力：每'+e.interval[j]+'秒一轮，半径'+e.radius[j]+'格，'+(j?'范围内全部敌人':'每发最多'+e.maxTargets[j]+'个敌人')+'。');lines.push('预告'+e.fuse[j]+'秒，主锁定敌人减速'+e.lockSlow*100+'%；固定落点。');}
  const prep=b.prepGrowth,k=Math.min(2,tier-1);if(prep)lines.push('休整基础+'+prep.base[k]+'层，至少'+prep.professions[k]+'职业额外+'+prep.composition[k]+'层（角色成长另计）。');
  return lines.join('\n');
 }
 return null;
}

export function testBondMemberEffects(b,context){
 const p=b?.testDescription;
 if(p?.kind!=='snow'||!Array.isArray(context?.members))return [];
 return context.members.map(r=>{const damage=p.iceBase+Math.min(Math.max(0,r.atk)*p.iceAtkRatio,p.iceAtkCap);return {uid:r.uid,name:r.name,text:'主目标 '+integer(damage)+'／周围 '+integer(damage*p.iceSplashRatio)+'（减伤前）'};});
}
export function testBondCalculation(b,layers,tier,c){
 if(b?.testDescription?.kind!=='rhodes'||tier<2)return '';
 const known=Number.isFinite(c?.atk),n=engineeringDamage(b.engineering,layers,known?c.atk:0,tier);
 return '炮火底伤 '+integer(n.base)+'，攻击力系数 '+pct(n.atkScale)+'；'+(c?.live===false?'开战预计':'当前')+'存活在场本人成员攻击力总和 '+(known?integer(c.atk):'待获取')+'。';
}
