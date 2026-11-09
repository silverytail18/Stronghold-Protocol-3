// 0.7.0: player-approved unique garrisons. No fixed member income is restored.
export const TRAIT_TEAM_CAP=12;
export const URSUS_TRAITS=Object.freeze(Object.fromEntries([
 ['brownb','连击笔记','attack',6,[1,2],[4,8],'每累计6次造成实际伤害的原生普攻，乌萨斯＋1／2层。'],
 ['headbr','集结号令','skill',1,[2,3],[4,6],'每次正常消耗自身技力开启原生技能，乌萨斯＋2／3层。'],
 ['wintim','前线记录','skillAttack',4,[1,2],[4,8],'每累计4次造成实际伤害的原生技能普攻，乌萨斯＋1／2层。'],
 ['glassb','交叉校验','multi',1,[1,2],[3,6],'一次原生普攻对至少2名不同敌人造成实际伤害后，乌萨斯＋1／2层。'],
 ['absin','执法记录','kills',2,[1,2],[3,6],'每累计以原生直接伤害击败2名敌人，乌萨斯＋1／2层。'],
 ['leto','同窗协作','studentSkill',1,[2,3],[4,6],'正常消耗自身技力开启原生技能时，若本人另有天然学生干员存活在场，乌萨斯＋2／3层。'],
 ['turdus','链式病历','chainHeal',1,[1,2],[3,6],'一次原生链式治疗实际恢复至少3名不同的本人真实干员生命后，乌萨斯＋1／2层。'],
 ['helage','独战心得','selfHeal',.2,[1,2],[4,8],'自身原生攻击自愈与原生天赋回复每累计实际恢复自身20%最大生命，乌萨斯＋1／2层；溢出治疗不计。'],
 ['poca','沉钩重压','terminal',0,[.12,.20],[0,0],'自身原生直接伤害对重量等级至少3的敌人提高12%／20%；不额外叠层，不依赖盟约激活。'],
 ['headb2','万众之锤','terminal',0,[.15,.25],[0,0],'自身原生溅射伤害提高15%／25%，包括三技能锤击；不加成地形扩散、装备、盟约或持续伤害，不额外叠层，不依赖盟约激活。'],
 ['oxi','不灭炬火','terminal',0,[.15,.25],[0,0],Object.freeze([
  '自身造成的法术伤害和元素伤害提高15%，第一天赋附加的灼燃损伤比例提高至25%。乌萨斯盟约激活时，二技能首次触发后进入常驻架势；此后每次受到攻击、持续伤害每跳或生命流失，都按二技能完整效果反击，能命中空中与隐匿敌人。无来源生命流失时以塔露拉自身为中心；退场后架势结束。',
  '自身造成的法术伤害和元素伤害提高25%，第一天赋附加的灼燃损伤比例提高至35%。乌萨斯盟约激活时，二技能首次触发后进入常驻架势；此后每次受到攻击、持续伤害每跳或生命流失，都按二技能完整效果反击，能命中空中与隐匿敌人。无来源生命流失时以塔露拉自身为中心；退场后架势结束。'
 ])]
].map(([key,name,event,threshold,amount,cap,description])=>[key,Object.freeze({key,name,event,threshold,amount:Object.freeze(amount),cap:Object.freeze(cap),description})])));
export const traitId=(key,elite)=>'ursus_trait_'+key+(elite?'_b':'_a');
export const OXI_BURN_RATIO=Object.freeze([.25,.35]);
export function traitDescription(t,elite=false){return (Array.isArray(t.description)?t.description[elite?1:0]:t.description)+(t.event==='terminal'?'':' 仅乌萨斯已激活时累计；同名普通／精锐每正式回合共享上限'+t.cap.join('／')+'层，所有专属叠层共用每人每正式回合12层基础奖励上限；转联防继承，免费／继承开技不触发。');}
