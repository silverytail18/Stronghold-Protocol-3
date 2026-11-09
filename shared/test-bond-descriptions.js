import {currentEffect as iberiaCurrentEffect} from './iberia-rules.js';
import {currentEffect as ursusCurrentEffect,STUDENT_DESCRIPTION} from './ursus-rules.js';
import {engineeringDamage} from './rhodes-engineering.js';
import {rhineCurrentEffect} from './rhine-description.js';
import {CORE_DESCRIPTION,NINJA_DESCRIPTION,higashiCurrentEffect,N as HG_N} from './higashi-rules.js';

// Presentation only. Each overlay supplies its existing balance constants; no battle values are changed here.
export const TEST_BOND_IDS=Object.freeze(['iberiaShip','ursusShip','ursusStudentShip','suiShip','penguinShip','lateranoSupportShip','knightPreparationShip','snowfieldGuideShip','rhodesShip','girlbandShip','higashiShip','higashiNinjutsuShip']);
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
 if(kind==='higashi')text=CORE_DESCRIPTION;
 if(kind==='higashiNinja')text=NINJA_DESCRIPTION;
 if(kind==='sui')text='两名不同【岁】干员在3秒内攻击造成伤害或直接治疗后，发动合击：对目标造成法术伤害，波及附近至多2名敌人'+value('（受层数影响）')+'，冷却'+value('8秒')+'\n'+need(4,'岁')+'合击追加物理伤害，波及目标提高至'+value('4名')+'\n（按参与者开战时、不含技能增益的平均攻击力计算，最多计入80层）';
 if(kind==='penguin'){const p=config;text='本队携带持续战斗装备的干员攻击力'+value('+'+p.atkFlat[0])+'、防御力'+value('+'+p.defFlat[0])+'，攻击力和防御力各+'+pct(p.statPct[0])+'；休整期结束增加'+value(p.growth[0]+'层')+'\n'+need(4,'企鹅物流')+'固定加成提高至'+value('+'+p.atkFlat[1]+'／+'+p.defFlat[1])+'，比例加成提高至'+pct(p.statPct[1])+'，每回合增加'+value(p.growth[1]+'层')+'\n<达到'+value(p.milestones.join('／')+'层')+'>各获得一件随机装备，4人档获得进阶装备\n（开始休整时发放，每次最多一件，每局最多三件）';}
 if(kind==='knight')text='至少3卡西米尔激活时，前'+value('3名')+'本人真实干员初始部署，各额外贡献'+pct(config.perInitial)+'攻击，最多'+value('15%')+'\n'+need(4,'骑士整备')+'至少6卡西米尔激活时，名额提高至'+value('8名')+'，最多'+value('40%')+'，替代15%额度\n（受益对象为本人卡西米尔核心受益成员，与原部署攻击共享层数上限；再部署不追加，转联防继承，不叠层）';
 if(kind==='laterano')text='至少3拉特兰激活时，本人拉特兰核心受益真实干员所选原生技能非弹药时攻击力+'+pct(config.nonAmmoAtk)+'\n'+need(4,'铳械协同')+'至少6拉特兰激活时，全体本人拉特兰核心受益真实干员获得'+pct(config.startup)+'启动攻击补偿，与消耗弹药加成共享'+value('200%上限')+'；保留非弹药10%\n（无需受益者拥有本附加；调和／转职按核心资格；转联防继承，再部署不重领，不叠层）';
 if(kind==='snow'){const k=config;text='达到2人后：成员攻击命中结算前已冻结的敌人并造成生命损失时触发冰爆，造成'+value('固定'+k.iceBase)+'点法术基础伤害，周围'+k.iceRadius2+'格受到一半伤害，共享冷却'+value(k.iceCooldown+'秒')+'\n新冻结缩短冰爆冷却（单轮最多返还'+k.freezeRefundCap+'秒，最短间隔'+k.iceMinimum+'秒）。'+need(5,'雪境向导')+'冰爆范围提高至'+k.iceRadius5+'格并额外解锁范围寒冷：每'+value(k.coldCooldown+'秒')+'对本方存活成员攻击范围内的敌人施加'+value('寒冷'+k.coldDuration5+'秒')+'，首个有效目标出现'+k.firstDelay+'秒后首次施加，可对空；冰爆返还寒冷冷却'+k.coldRefund+'秒，最短间隔'+k.coldMinimum+'秒。冰爆与寒冷均不随层数变化。';}
 if(kind==='rhodes'){const e=b.engineering;text='【罗德岛】干员攻击力和生命值提升（受层数影响）；1—3阶首次部署技力'+value('+'+(b.openingSp||[8,12]).join('／'))+'（普通／精锐）\n'+need(6,'罗德岛')+'每'+value(e.interval[0]+'秒')+'发射物理、法术炮弹各一发，对'+value(e.radius[0]+'格')+'内至多'+value(e.maxTargets[0]+'名')+'敌人造成伤害，附加全体攻击力固定'+value(e.atkScale[0]*100+'%')+'\n'+need(9,'罗德岛')+'炮击间隔缩短至'+value(e.interval[1]+'秒')+'，范围扩大至'+value(e.radius[1]+'格')+'并命中范围内全部敌人，追加真实炮弹\n（炮击预告期间主目标减速'+e.lockSlow*100+'%；真实弹伤害为物理／法术弹的'+e.trueScale*100+'%）';}
 if(kind==='rhodes'&&b.fireControl){const f=b.fireControl;text+='\n'+need(6,'罗德岛')+'所有阶成员原生有效伤害／直接治疗供令（同名1—3阶6秒、4—5阶8秒、6阶10秒／全队'+f.teamCooldown+'秒，最多'+f.stock+'枚）；每枚追加物法双发，六人最多追射'+f.followRounds[0]+'轮，九人最多'+f.followRounds[1]+'轮且不追加真实弹。原生伤害标定敌人'+f.markDuration+'秒，可索敌仍在本人成员合法攻击范围或被本人阻挡的标定敌人。';}
 if(kind==='girl')text='【少女乐队】干员首次部署技力'+value('+10')+'，自身物理、法术伤害及直接治疗量'+value('+15%')+'\n'+need(4,'少女乐队')+'首次部署技力提高至'+value('15')+'，伤害及直接治疗加成提高至'+value('20%')+'，Fever获得量'+value('+30%')+'；Fever期间加成提高至'+value('40%')+'，结束后延续'+value('6秒')+'余韵';
 b.descRaw=b.effectDescRaw=text;
 b.desc=b.effectDesc=text.replace(/<[@$][A-Za-z0-9_.-]+>/g,'').replace(/<\/>/g,'');
}

/** Null means this is an original bond or an excluded pack. Undefined tier is used only by old callers. */
export function testBondEffect(b,layers,tier,context){
 const p=b?.testDescription;if(!p)return null;
 if(!(tier>=1))return '未激活：在场至少'+b.thresholds[0]+'名不同【'+b.name+'】干员后生效。';
 const i=tier>=2?1:0,L=Math.max(0,Math.min(b.effectLayerCap??999,Number(layers)||0)),c=context||{};
 if(p.kind==='iberia')return iberiaCurrentEffect(L,tier,c);
 if(p.kind==='ursus')return ursusCurrentEffect(L,tier,c);
 if(p.kind==='ursusStudent')return STUDENT_DESCRIPTION+' 当前最大生命＋'+(tier>=2?30:15)+'%。';
 if(p.kind==='higashi')return higashiCurrentEffect(L,tier,c);
 if(p.kind==='higashiNinja')return '影袭：'+pct(HG_N.damageRatios[i])+'攻击力法术伤害；减速'+pct(HG_N.slows[i])+'、持续'+value(HG_N.slowDurations[i]+'秒')+'。\n有效原生攻击命中后触发，同名冷却'+value(HG_N.markCooldowns[i]+'秒')+'；'+(i?'周围最多两名敌人受到半额影袭及减速。':'首次部署或正常开技即就绪。');
 if(p.kind==='rhine')return rhineCurrentEffect(L,Number.isFinite(c.count)?c.count:[3,6,9,10][Math.min(3,tier-1)],c);
 if(p.kind==='sui'){
  const arts=b.bb.artsBase+b.bb.artsPerLayer*L,phys=b.bb.physicalBase+b.bb.physicalPerLayer*L;
  return ['合击主目标：'+pct(arts)+'法术伤害'+(i?'，追加'+pct(phys)+'物理伤害':'')+'。','附近至多'+value(i?4:2)+'名敌人各受'+pct(arts*.6)+'法术伤害；冷却'+value('8秒')+'。','（以两名参与者开战攻击平均值为基准，不计技能增益；有效层数'+L+'／80）'].join('\n');
 }
 if(p.kind==='penguin'){
  const n=Number.isInteger(c.claimed)?Math.min(p.milestones.length,Math.max(0,c.claimed)):null;
  return ['装备干员攻击力'+value('+'+p.atkFlat[i])+'、防御力'+value('+'+p.defFlat[i])+'，两项各+'+pct(p.statPct[i])+'。','基础休整成长'+value('+'+p.growth[i]+'层')+'；当前补给品质：'+value(i?'进阶':'普通')+'。',c.preview?'补给里程'+p.milestones.join('／')+'层，每次休整最多一件。':n===null?'已领取装备：待获取（层数不代表领取次数）。':'已领取装备'+value(n+'/'+p.milestones.length)+'；'+(n<p.milestones.length?'下一未领取里程'+value(p.milestones[n]+'层')+'。':'本局补给已全部领取。')].join('\n');
 }
 if(p.kind==='knight')return ['初始部署补偿：2人且3卡西米尔，前3名各+5%，最多15%；4人且6卡西米尔，前8名各+5%，最多40%。','与原每次部署20%共享卡西米尔层数上限；再部署不追加补偿，转联防继承。'].join('\n');
 if(p.kind==='laterano')return ['至少3拉特兰激活：本人拉特兰核心受益真实干员，当前所选原生技能非弹药时攻击力+'+pct(p.nonAmmoAtk)+'。',i?'至少6拉特兰激活：全体核心受益真实干员获得'+pct(p.startup)+'启动补偿，与弹药消耗加成共享200%上限。':'四人后解锁六拉特兰启动补偿。','仅本人；调和／转职沿核心资格，召唤物排除；转联防继承，不重复发放，不叠层。'].join('\n');
 if(p.kind==='snow'){
  const lines=[];
  if(i){lines.push('范围寒冷'+value(p.coldDuration5+'秒')+'，基础间隔'+value(p.coldCooldown+'秒')+'；首次有效目标后'+p.firstDelay+'秒。');if(c.live)lines.push('寒冷：'+(c.coldRemaining===null?'等待首次有效目标':c.coldRemaining>0?'剩余'+value(num(c.coldRemaining)+'秒'):'已就绪，等待有效目标')+'。');}
  lines.push('冰爆固定基础伤害：主目标 '+value(integer(p.iceBase))+'，周围 '+value(integer(p.iceBase*p.iceSplashRatio))+'（减伤前，不随攻击力变化）。');
  lines.push('周围半径'+(i?p.iceRadius5:p.iceRadius2)+'格，基础冷却'+value(p.iceCooldown+'秒')+'；'+(c.live?'冰爆'+(c.iceRemaining>0?'剩余'+value(num(c.iceRemaining)+'秒'):'已就绪')+'。':'需攻击冻结敌人并造成生命损失。'));
  lines.push('新冻结返还冰爆'+p.freezeRefund+'秒（单轮最多'+p.freezeRefundCap+'秒），冰爆最短间隔'+p.iceMinimum+'秒。'+(i?'冰爆返还寒冷'+p.coldRefund+'秒，寒冷最短间隔'+p.coldMinimum+'秒。':'5人后冰爆范围提高至'+p.iceRadius5+'格并额外解锁寒冷。'));
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
  const lines=['攻击力+'+pct(bb.atkBase+bb.atkPerLayer*L)+'，最大生命+'+pct(bb.hpBase+bb.hpPerLayer*L)+'。','1—3阶首次部署技力'+value('+'+(b.openingSp||[8,12]).join('／'))+'（普通／精锐，与乐队／终端补差额）。'];
  if(tier>=2){lines.push((c.preview?'示例':c.live===false?'开战预计':'当前')+'单发伤害：物理 '+(known?integer(n.fire):'待获取')+'，法术 '+(known?integer(n.fire):'待获取')+(j?'，真实 '+(known?integer(n.fire*e.trueScale):'待获取'):'')+'（减伤前）。');lines.push('工程火力：攻击力供给固定'+e.atkScale[j]*100+'%；每'+e.interval[j]+'秒一轮，半径'+e.radius[j]+'格，'+(j?'范围内全部敌人':'每发最多'+e.maxTargets[j]+'个敌人')+'。');lines.push('预告'+e.fuse[j]+'秒，主锁定敌人减速'+e.lockSlow*100+'%；固定落点。');}
  if(tier>=2&&b.fireControl){const f=b.fireControl;
   lines.push('校射指令：所有阶本人成员原生有效伤害／直接治疗供令，同名1—3阶6秒、4—5阶8秒、6阶10秒；全队'+f.teamCooldown+'秒，上限'+f.stock+'枚。'+(c.live===true&&Number.isFinite(c.commands)?'当前 '+value(c.commands+'/'+f.stock)+'，供令冷却 '+value(num(c.commandCooldown||0)+'秒')+'。':''));
   lines.push('主炮主目标有效受击后，每枚指令追加物法双发，间隔'+f.followInterval+'秒，整轮最多追射'+f.followRounds[j]+'轮'+(j?'（不追加真实弹）':'')+'；旧目标死亡可接续其他受牵制的标定目标，无目标停止。整轮快照一致、成长最多+2。');
   lines.push('原生有效伤害标定敌人'+f.markDuration+'秒；标定目标仍在本人成员合法攻击范围或被本人阻挡时纳入炮火索敌。');
  }
  const prep=b.prepGrowth,k=Math.min(2,tier-1);if(prep)lines.push('休整基础+'+prep.base[k]+'层，至少'+prep.professions[k]+'职业额外+'+prep.composition[k]+'层（角色成长另计）。');
  const personal=(c.personal||[]).filter(v=>v.focus||v.leading||v.charges||v.fusion).map(v=>v.name+' '+(v.focus?'专注'+v.focus+'/4':v.leading?'领奏'+v.leading+'/3':v.fusion?'熔毁蓄能'+v.fusion+'/3':'修复'+v.charges+'/3'));if(personal.length)lines.push('个人强化：'+personal.join('，')+'。');
  return lines.join('\n');
 }
 return null;
}

export function testBondMemberEffects(b,context){
 const p=b?.testDescription;
 if(p?.kind!=='snow'||!Array.isArray(context?.members))return [];
 return context.members.map(r=>{const damage=p.iceBase;return {uid:r.uid,name:r.name,text:'主目标 '+integer(damage)+'／周围 '+integer(damage*p.iceSplashRatio)+'（减伤前）'};});
}
export function testBondCalculation(b,layers,tier,c){
 if(b?.testDescription?.kind!=='rhodes'||tier<2)return '';
 const known=Number.isFinite(c?.atk),n=engineeringDamage(b.engineering,layers,known?c.atk:0,tier);
 return '炮火底伤 '+integer(n.base)+'，攻击力系数 '+pct(n.atkScale)+'；'+(c?.live===false?'开战预计':'当前')+'存活在场本人成员攻击力总和 '+(known?integer(c.atk):'待获取')+'。';
}
