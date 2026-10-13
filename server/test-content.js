// Test batches are registered in source, never supplied by a client or written to player storage.
import {createHash} from 'node:crypto';
import {APP_VERSION} from '../shared/constants.js';
import {extendRounds,extraShopSlot,largerCoopPool,openingBans,strategyConfirmOrder} from './test-batches.js';
import {applyExpansion} from './sim/content/expansion/expansion-data.js';
import {applyRhodesMujica} from './sim/content/rhodes-mujica/data.js';
import {applyRhine} from './sim/content/rhine/data.js';
import {applyKazdel} from './sim/content/kazdel/data.js';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const roundIds=[20,24,30].map(total=>`extended-rounds-${total}`);
const roundConflicts=total=>roundIds.filter(id=>id!==`extended-rounds-${total}`);
export const TEST_CONTENT = Object.freeze([
  Object.freeze({id:'extended-rounds-20',version:'test-2',name:'20 回合扩展',group:'回合扩展',description:'非标准：原版式阶梯成长与平台波次；R16装备补给，最终攻势20、隐藏21。末轮HP144%、攻击121%（相对本模式原R13）；主线／隐藏血池130%／125%，护卫HP120%、攻击105%。扩展只能选一项。',status:'ready',clientVersion:1,difficulties:['NORMAL','HARD','ABYSS'],conflicts:roundConflicts(20),apply:data=>extendRounds(data,20)}),
  Object.freeze({id:'extended-rounds-24',version:'test-2',name:'24 回合扩展',group:'回合扩展',description:'非标准：阶梯成长与错峰／空地检查；R16装备、R20战术，最终攻势24、隐藏25。末轮HP207.36%、攻击单人146.41%／多人133.1%（原R13基数）；主线／隐藏血池150%／140%，护卫HP135%、攻击110%。扩展只能选一项。',status:'ready',clientVersion:1,difficulties:['NORMAL','HARD','ABYSS'],conflicts:roundConflicts(24),apply:data=>extendRounds(data,24)}),
  Object.freeze({id:'extended-rounds-30',version:'test-1',name:'30 回合扩展',group:'回合扩展',description:'非标准：长线阶梯成长；R16／24装备、R20战术，最终攻势30、隐藏31。末轮HP298.6%、攻击单人177.16%／多人161.05%（原R13基数）；主线／隐藏血池180%／165%，护卫HP150%、攻击115%。平台期适应，两轮以上不连续同势力，扩展只能选一项。',status:'ready',clientVersion:1,difficulties:['NORMAL','HARD','ABYSS'],conflicts:roundConflicts(30),apply:data=>extendRounds(data,30)}),
  Object.freeze({id:'shop-extra-slot',version:'test-1',name:'商店增加一个角色格',group:'体验优化',description:'所有商店等级增加一个角色格，道具格、刷新费用与抽取方式保持。',status:'ready',clientVersion:1,apply:extraShopSlot}),
  Object.freeze({id:'coop-pool-150',version:'test-1',name:'联机角色库存增加50%',group:'体验优化',description:'仅多人：所有可入池角色副本×1.5向上取整；各阶18/21/27/24/12/8，缪尔赛思6。',status:'ready',clientVersion:1,modes:['coop'],apply:largerCoopPool}),
  Object.freeze({id:'strategy-confirm-order',version:'test-1',name:'策略按就绪顺序选择',group:'体验优化',description:'仅多人：按服务器首次收到有效就绪确认的顺序选择策略；未确认玩家、AI和托管玩家补在后面。未启用时沿用随机排序，跳过仍移至末尾。',status:'ready',clientVersion:1,modes:['coop'],apply:strategyConfirmOrder}),
  Object.freeze({id:'opening-bans-4-6',version:'test-1',name:'开局禁用：4核心＋6附加',group:'卡池优化',description:'非标准：本局随机禁用4个核心盟约、6个附加盟约，替代原3＋4。只调整数量，沿用现有候选、等概率抽样和全归属禁用角色入池规则。与5＋8互斥。',status:'ready',clientVersion:1,difficulties:['NORMAL','HARD','ABYSS'],conflicts:['opening-bans-5-8'],apply:data=>openingBans(data,4,6)}),
  Object.freeze({id:'opening-bans-5-8',version:'test-1',name:'开局禁用：5核心＋8附加',group:'卡池优化',description:'非标准：本局随机禁用5个核心盟约、8个附加盟约，替代原3＋4。只调整数量，沿用现有候选、等概率抽样和全归属禁用角色入池规则。与4＋6互斥。',status:'ready',clientVersion:1,difficulties:['NORMAL','HARD','ABYSS'],conflicts:['opening-bans-4-6'],apply:data=>openingBans(data,5,8)}),
  // A match-scoped batch; existing publication and authorization rules apply.
  Object.freeze({id:'arknights-expansion-v1',version:'expansion-test-9',name:'岁与企鹅',group:'内容拓展',description:'六名新干员（含阿戈尔／迅捷克莱门莎）、岁、企鹅物流、雪境向导三附加盟约、四项策略（新增山路招募）；雪境向导2/4人全范围寒冷（12秒CD）、4人解锁主目标全额／周围半额的属性冰爆与冻结冷却返还；新约能天使追加企鹅归属。企鹅物流装备补给：12/30/50层、休整开始发放；2/4人装备干员获得固定攻防及5%/10%攻防。岁／企鹅按正常权重10参与禁用。',status:'ready',clientVersion:18,difficulties:['NORMAL','HARD','ABYSS','FUNNY'],apply:applyExpansion}),
  Object.freeze({id:'rhodes-mujica-v1',version:'ri-mujica-test-15',name:'罗德岛与乐队',group:'内容拓展',description:'九名新／移入干员（新增三阶临光、予愿保留原归属）、五名旧罗德岛成员；天然罗德岛13名。6人物法双发、9人物法真三发工程火力，盟约攻击10%＋每层0.2个百分点、炮火底伤100＋2×层数＋0.05×超过220层部分的平方、6人攻击力系数上限50%、9人100%，6人4秒／0.8格、9人2.5秒／1.2格，灼热包裹炮弹与精修锁定圈；预告锁定减速50%、局内当前数值与有效炮击成长，已移除协同屏障及其承压／接力成长。休整基础0／2／7层，3／4／5职业额外1／2／4层。罗德岛／少女乐队按正常权重10参与开局禁用，干员沿用全归属禁用规则；终端与两项策略沿用现有处理。',status:'ready',clientVersion:27,difficulties:['NORMAL','HARD','ABYSS','FUNNY'],apply:applyRhodesMujica}),
  // Apply after existing packs, matching browser and browsing-catalog overlay order.
  Object.freeze({id:'kazdel-expansion-v1',version:'kazdel-test-9',name:'卡兹戴尔 · 魂契',group:'内容拓展',description:'11名天然成员固定战斗特质与专属成长，不受盟约数值影响；3人时所有近战干员阻挡+1，转职保留自身特质；魂契3/6/9、血脉2/4：开战魂火与动态上限、技能献血回血、六人回技与对空血卷、九人一格宽、1秒五格圆弧穿透剑气与共鸣；六人起输出成长前移，血卷、剑气与全图血咒增伤，增强开战与普攻供火，每秒额度恢复；全图2秒血咒、地面全额空中双倍；层数只增数值，正常20回合约700层。保留招募、两策略与两装备。',status:'ready',clientVersion:28,difficulties:['NORMAL','HARD','ABYSS','FUNNY'],apply:applyKazdel}),
  Object.freeze({id:'rhine-lab-v1',version:'rhine-test-4',name:'莱茵生命',group:'内容拓展',description:'莱茵3/6/9/10；攻血10%＋每层0.1%，仅真实莱茵成员。科研最高999，每50层1科技点，正常最多19点；十人及两策略独立奖励。14项单级科技，六层可滚动科技树、互斥二维选格、彩色科技格标志；休整判人数，3/6人科技按原人数生效，高于6人科技解锁后6人生效，开战固定科技资格。六名新干员、五种旧形态、两装备两策略；专项研究2/4，攻击与治疗两种爆炸共用各自独立冷却；固定人数档科技，格内物理脉冲、每场临时访学及研究席增伤／减伤与无敌救援；显示和记录修复，移除多萝西。',status:'ready',clientVersion:32,difficulties:['NORMAL','HARD','ABYSS','FUNNY'],apply:applyRhine}),
]);
export class TestContent {
  constructor(entries=TEST_CONTENT){this.entries=entries;this.version=digest(entries.map(({apply,...entry})=>entry));}
  menu(room,{admin=true,publicIds=[],revision=0}={}){
    return {version:admin?this.version:digest({catalog:this.version,publicIds,revision}),items:this.entries.filter(entry=>admin||publicIds.includes(entry.id)).map(({apply,...entry})=>({
      ...entry,enabled:entry.status==='ready'&&typeof apply==='function'&&(!entry.difficulties||entry.difficulties.includes(room.difficulty))&&(!entry.modes||entry.modes.includes(room.mode)),
      reason:entry.status!=='ready'?'方案待确认，暂不可启用':entry.difficulties&&!entry.difficulties.includes(room.difficulty)?'标准模拟不支持此测试':entry.modes&&!entry.modes.includes(room.mode)?'仅联机模式可启用':null,
    }))};
  }
  resolve(selection,room,data,access){
    const menu=this.menu(room,access);
    if(!selection||selection.version!==menu.version||!Array.isArray(selection.ids)||selection.ids.length>16||selection.ids.some(id=>typeof id!=='string')||new Set(selection.ids).size!==selection.ids.length)throw new Error('测试内容清单已变化或选择无效，请重新打开测试窗口');
    const items=menu.items,ids=new Set(selection.ids);
    const picked=selection.ids.map(id=>{
      const item=items.find(item=>item.id===id);
      if(!item?.enabled)throw new Error('测试内容不存在、尚未启用或不支持当前模拟');
      if((item.requires||[]).some(id=>!ids.has(id)))throw new Error('所选测试内容缺少依赖');
      if((item.conflicts||[]).some(id=>ids.has(id)))throw new Error('所选测试内容互相冲突');
      return this.entries.find(entry=>entry.id===id);
    });
    if(!picked.length)return {data,manifest:null};
    const ordered=[],visiting=new Set(),done=new Set();
    const visit=entry=>{
      if(done.has(entry.id))return;if(visiting.has(entry.id))throw new Error('测试内容依赖存在循环');
      visiting.add(entry.id);for(const id of entry.requires||[])visit(this.entries.find(entry=>entry.id===id));visiting.delete(entry.id);done.add(entry.id);ordered.push(entry);
    };
    for(const entry of this.entries)if(ids.has(entry.id))visit(entry);
    const rules=structuredClone(data);
    for(const entry of ordered)entry.apply(rules,room);
    const batches=this.entries.filter(entry=>ids.has(entry.id)).map(({id,version,name})=>({id,version,name}));
    const manifest=Object.freeze({baseline:APP_VERSION,catalog:this.version,batches,clientVersion:Math.max(0,...picked.map(e=>e.clientVersion||0)),fingerprint:digest({baseline:APP_VERSION,batches,data:rules})});
    return {data:rules,manifest};
  }
}
