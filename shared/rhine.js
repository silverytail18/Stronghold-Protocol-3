// Rhine Lab design v1.13. Pure ESM shared by match authority and browser; no Node APIs.
export const RHINE = 'rhineShip', RHINE_BATCH = 'rhine-lab-v1';
export const RHINE_SILENCE = 'band_rhine_joint', RHINE_KRISTEN = 'band_rhine_milestones';
export const RHINE_CONTROLLER = 'rhine_field_controller', RHINE_SAMPLER = 'rhine_sampler';
export const TECHNOLOGIES = Object.freeze([
  {
    "id": "T21",
    "name": "定向招募",
    "count": 3,
    "cost": 1,
    "pre": [],
    "layer": 1,
    "region": false,
    "effect": "每回合前1次主动刷新，优先出现1名当前可招募的莱茵核心干员；刷新与购买照常付费，遵守当前商店阶数及候选池，不提供免费刷新"
  },
  {
    "id": "T04",
    "name": "观测标记",
    "count": 3,
    "cost": 1,
    "pre": [],
    "layer": 1,
    "region": true,
    "effect": "选1个实验格；格内敌人减速50%且显隐，实验标记离格保留3秒；受本人莱茵原生有效伤害后追加实际生命伤害10%的真实科技伤害"
  },
  {
    "id": "T01",
    "name": "精密校准",
    "count": 3,
    "cost": 1,
    "pre": [
      "T04"
    ],
    "layer": 2,
    "region": true,
    "effect": "所有本人莱茵原生伤害增加10%/15%/20%/30%（3/6/9/10人）；所选格内额外增加相同幅度，合计20%/30%/40%/60%，不随层数增加；支持所有合法部署格"
  },
  {
    "id": "T02",
    "name": "细胞适应",
    "count": 3,
    "cost": 1,
    "pre": [
      "T04"
    ],
    "layer": 2,
    "region": true,
    "effect": "所有本人莱茵受到敌伤降低2%/4%/6%/8%（3/6/9/10人）；所选格内额外降低8%/16%/24%/32%，合计10%/20%/30%/40%，不随层数增加；支持高台"
  },
  {
    "id": "T16",
    "name": "结构解析",
    "count": 6,
    "cost": 2,
    "pre": [
      "T04"
    ],
    "layer": 2,
    "region": false,
    "effect": "本人莱茵原生物法攻击标记敌人：防御≥800时无视60%防御，法抗≥40时无视25点法抗"
  },
  {
    "id": "T07",
    "name": "离子实验",
    "count": 6,
    "cost": 2,
    "pre": [
      "T01"
    ],
    "layer": 3,
    "region": false,
    "effect": "开战2秒首次，此后每1秒，只对T04所选格内最多3名合法敌人各造成120＋2L物理科技伤害，优先高生命敌人；不独立选格，离格或仅有实验标记不会受到脉冲"
  },
  {
    "id": "T06",
    "name": "生态修复",
    "count": 6,
    "cost": 2,
    "pre": [
      "T02"
    ],
    "layer": 3,
    "region": true,
    "effect": "所有本人莱茵每秒恢复当前最大生命1%，所选恢复格内改为3%；仅战斗生效"
  },
  {
    "id": "T09",
    "name": "区域扩建",
    "count": 6,
    "cost": 3,
    "pre": [
      "T01",
      "T02"
    ],
    "layer": 3,
    "region": false,
    "effect": "T01/T02/T04各自可选格数+1，由1变2；所有科技选格仍互斥"
  },
  {
    "id": "T12",
    "name": "全域扫描",
    "count": 6,
    "cost": 3,
    "pre": [
      "T07"
    ],
    "layer": 4,
    "region": false,
    "effect": "存在有效T04格时，开战2秒首扫、此后每10秒，全战场合法敌人显隐并获得实验标记3秒；区外不附加T04减速"
  },
  {
    "id": "T11",
    "name": "应急隔离",
    "count": 6,
    "cost": 2,
    "pre": [
      "T06"
    ],
    "layer": 4,
    "region": false,
    "effect": "每名本人莱茵本场一次：敌伤后生命≤40%或首次致命敌伤时救援，致命时保留1生命；获得无敌2秒，恢复最大生命30%，获得最大生命50%屏障8秒，解除晕眩/冻结并免疫5秒"
  },
  {
    "id": "T08",
    "name": "并行运算",
    "count": 6,
    "cost": 2,
    "pre": [
      "T09"
    ],
    "layer": 4,
    "region": false,
    "effect": "所有本人莱茵自然技力额外＋1/秒；本场3名不同莱茵成员首次开技后，所有本人莱茵额外回复8技力一次"
  },
  {
    "id": "T10",
    "name": "联合实验",
    "count": 6,
    "cost": 3,
    "pre": [
      "T08"
    ],
    "layer": 5,
    "region": false,
    "effect": "T01与T04至少一对选格正交相邻时，所有本人莱茵原生物法对标记目标增伤50%；T01格内成员原生伤敌也标记3秒；T07上限增至5，脉冲命中停顿0.5秒"
  },
  {
    "id": "T03",
    "name": "数据广播",
    "count": 9,
    "cost": 3,
    "pre": [
      "T10",
      "T12"
    ],
    "layer": 6,
    "region": true,
    "effect": "选1个支援格含高台；格内存活莱茵将当前攻击力50%固定分享给本人其他所有场上莱茵；剔除广播赠攻，源本人不领；有效广播时所有本人莱茵攻速＋30"
  },
  {
    "id": "T13",
    "name": "访学聘任",
    "count": 9,
    "cost": 3,
    "pre": [
      "T10",
      "T09"
    ],
    "layer": 6,
    "region": true,
    "effect": "9人解锁；研发后每场开战授予身份前至少6莱茵且前置满足时，所选合法部署格上的本人非莱茵干员获得莱茵身份，仅本场战斗有效。研究席内莱茵成员另享有效T01/T02当前区域额外增伤和减伤，各计一次。自动授予，无需安排、相邻条件或一次性聘任，不占装备槽"
  }
].map(t=>Object.freeze({...t,pre:Object.freeze(t.pre)})));
export const TECH_BY_ID = Object.freeze(Object.fromEntries(TECHNOLOGIES.map(t=>[t.id,t])));
export const TECH_ROWS = Object.freeze([["T21","T04"],["T01","T02","T16"],["T07","T06","T09"],["T12","T11","T08"],["T10"],["T03","T13"]].map(Object.freeze));
export const clampLayers = n => Math.max(0,Math.min(999,Number.isFinite(n)?Math.floor(n):0));
export const baseBonus = layers => .1 + .001*clampLayers(layers);
export const normalPoints = layers => Math.floor(clampLayers(layers)/50);
export const tierOf = count => [3,6,9,10].filter(n=>count>=n).length;
export const positionKey = p => p.join(',');
export const adjacent = (a,c) => Math.abs(a[0]-c[0])+Math.abs(a[1]-c[1])===1;
// count remains the research threshold; higher-tier research only needs six to activate.
export const activationCount = tech => {
 const t=typeof tech==='string'?TECH_BY_ID[tech]:tech;
 return t?Math.min(6,t.count):Infinity;
};
export function qualifies(id,research,count) {
 if(count<3||!research.includes(id))return false;
 const t=TECH_BY_ID[id];if(!t||count<activationCount(t))return false;
 return t.pre.every(pre=>qualifies(pre,research,count));
}
export function activePositions(id,state,count) {
 const n=['T01','T02','T04'].includes(id)&&qualifies('T09',state.research,count)?2:1;
 return qualifies(id,state.research,count)?(state.positions[id]||[]).slice(0,n):[];
}
export function spentPoints(research) {return research.reduce((n,id)=>n+(TECH_BY_ID[id]?.cost||0),0);}
export function income(state,layers) {return normalPoints(Math.max(layers,state.highestLayers||0))+(state.tenReward?1:0)+(state.strategyPoints||0);}
export function emptyRhineState() {return {research:[],positions:{},highestLayers:0,tenReward:false,strategyPoints:0,milestones:[],respecUsed:false,refreshRound:0,paidRefreshes:0,giftRounds:[],pendingGifts:[]};}
export const growthBase = count => [6,10,12,14][tierOf(count)-1]||0;
export const growthRegion = count => [4,8,12,14][tierOf(count)-1]||0;
export function nativePacket(dmg) {
 return !!dmg&&['phys','arts','true'].includes(dmg.type)&&!dmg.sourceless&&!dmg.tags?.some(t=>t==='hpLoss'||t==='bond'||t==='item'||t==='counter'||t==='share'||t==='reflect'||t.startsWith('rhine:'));
}
