import {RI_BALANCE as R,ENGINEERING_BALANCE as E,FIRE_CONTROL_BALANCE as F,NEARL_BALANCE as N,TERMINAL,TERMINAL_BALANCE as T} from './balance.js';
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
import {engineeringBase,RHODES_FIRE_BASE_BONUS} from '../../../../shared/rhodes-engineering.js';
const growth={amiya:'至少三名不同罗德岛干员且覆盖三种职业',dolris:'作战区有另一名不同少女乐队成员',amoris:'本回合在场时完成罗德岛真实精锐合成，或作战区已有两名不同罗德岛精锐',mortis:'至少三名不同罗德岛干员且覆盖三种职业',tmoris:'作战区罗德岛成员同时有近卫与特种职业',oblvns:'至少两名不同罗德岛成员各携带至少一件装备',kalts2:'作战区有另一名罗德岛近卫或重装'};
export function readableRhodes(overlay){
 const o=structuredClone(overlay),b=o.bonds.rhodesShip;
 const attrs='攻击'+R.atkBase*100+'%＋每层'+R.atkPerLayer*100+'个百分点，生命'+R.hpBase*100+'%＋每层'+R.hpPerLayer*100+'个百分点；';
 const fireBase='底伤保留全阶段固定+'+RHODES_FIRE_BASE_BONUS+'并吸收中段攻击力成长（参考攻击力8000），0层500；6／9人300层约'+Math.round(engineeringBase(300,2))+'／'+Math.round(engineeringBase(300,3))+'，999层'+Math.round(engineeringBase(999,2))+'／'+Math.round(engineeringBase(999,3))+'。';
 const opening='1—3阶首次部署补给'+R.openingSp.join('／')+'点技力，与乐队／终端只补差额，继承和重部署不补。';
 const rules='存活成员2格内索敌；原生有效伤害标定存活敌人3秒，仍被本人阻挡或处于本人成员合法原生攻击／持续技能范围时可纳入标定索敌。阻挡／危急漏怪优先，同危险档匹配物法双抗；各弹主锁定不同敌人，目标不足才重复。预告期间主目标减速50%，6人0.5秒／9人0.4秒，固定落点不追踪。6人起所有阶真实成员原生有效伤害或有效直接治疗供1枚校射指令：同名1—3阶6秒、4—5阶8秒、6阶10秒，全队2秒冷却，库存2。炮火／装备／其他盟约／召唤物／自然回复不供令。主炮有效命中主目标后可消耗指令追射；旧目标死亡可接续其他受牵制的合法标定敌人，无目标停止且不扣令。追射间隔1秒，6人最多两轮物法双发，9人最多一轮且真弹不追加。整条链共用主炮快照、最多一次+2炮击成长；同回合联防继承指令／冷却／成长及有界个人进度，不继承旧敌人绑定或追射链。不新增炮火穿透。';
 b.desc=b.descRaw='3人：'+attrs+opening+' 6人：每4秒物法双发，半径0.8格每发最多3目标，伤害为本档底伤＋存活本人成员攻击力总和固定8%。9人：每2.5秒物法真三发，半径1.2格范围全体，物法每发为本档底伤＋成员攻击力总和固定12%，真弹为50%。'+fireBase+rules+' 休整基础'+R.growth.join('／')+'层，'+R.professions.join('／')+'职业额外'+R.composition.join('／')+'层，有效炮击上限24／30，层数0—999。';
 b.bb={atkBase:R.atkBase,atkPerLayer:R.atkPerLayer,hpBase:R.hpBase,hpPerLayer:R.hpPerLayer,fireBase:E.base,firePerLayer:E.perLayer};b.openingSp=[...R.openingSp];
 b.effectDescParams=[['atkBase','atkPerLayer'],['hpBase','hpPerLayer']].map(([base,perStack],index)=>({index,base,perStack,format:'0.0%'}));
 b.effectDescByTier={1:'攻击+{0:0.0%}，最大生命+{1:0.0%}。\n'+opening,
  2:'攻击+{0:0.0%}，最大生命+{1:0.0%}。\n'+opening+'\n6人：每4秒物法双发，半径0.8格／每发最多3目标；本档底伤＋全体攻击力固定8%。'+fireBase+'\n'+rules,
  3:'攻击+{0:0.0%}，最大生命+{1:0.0%}。\n'+opening+'\n9人：每2.5秒物法真三发，半径1.2格范围全体；物法为本档底伤＋全体攻击力固定12%，真弹50%。'+fireBase+'\n'+rules};
 for(const [tier,desc]of Object.entries(b.effectDescByTier)){const i=Number(tier)-1;b.effectDescByTier[tier]=desc+'\n休整基础+'+R.growth[i]+'层，'+R.professions[i]+'职业额外+'+R.composition[i]+'层；角色成长另计。';}
 b.effectDescRaw=Object.values(b.effectDescByTier).join('\n\n');b.engineering={...E};b.fireControl={...F};b.prepGrowth={base:[...R.growth],professions:[...R.professions],composition:[...R.composition]};
 setTestBondDescription(b,'rhodes');
 setTestBondDescription(o.bonds.girlbandShip,'girl');
 for(const[id,g]of Object.entries(o.garrisons)){const key=id.replace(/^rm_growth_/,'').replace(/_[ab]$/,''),v=id.endsWith('_b')?2:1;
  if(key==='nearl'){const i=v-1;g.name='盾前誓约';g.desc=g.descRaw='罗德岛激活、本人阻挡且2格内另一名本人成员在场：来自自己阻挡敌人的物法伤害降低'+N.reduction[i]*100+'%。每8秒有效承压使罗德岛+'+N.growth[i]+'层，每场同名共享上限'+N.cap[i]+'层。有效承压要求最近2秒被阻挡敌人造成生命损失或屏障吸收。暂停保留进度，重部署不重置上限。';}
  else if(growth[key])g.desc=g.descRaw=growth[key]+'，休整结束罗德岛+'+(['amiya','amoris'].includes(key)?2*v:v)+'层；本人在场、罗德岛激活，同名每轮一次。';
 }
 o.items={};for(const elite of [false,true]){const i=+elite,id=TERMINAL+(elite?'_b':'_a');o.items[id]={id,baseId:TERMINAL+'_a',goldenId:TERMINAL+'_b',isGolden:elite,trapId:'rm_terminal',iconId:'rm_terminal',identifier:11101+i,itemType:'EQUIP',tier:4,name:'罗德岛作战终端',shopSortId:110,price:elite?5:4,hideInShop:false,shopExcluded:false,mergeable:!elite,upgradeNum:elite?0:2,upgradeChessId:elite?null:TERMINAL+'_b',duration:-1,giveBondId:'rhodesShip',givePowerId:null,canGiveBond:false,requiresBondId:'rhodesShip',category:'SP',kind:'passive',effectId:'rm_terminal',effectName:'罗德岛作战终端',desc:'攻击力+'+T.atk[i]*100+'%；罗德岛成员首次部署获得'+T.openingSp[i]+'点技力。与变形同构体共同装备时视为罗德岛成员；同名不重复计数。',params:{atk:T.atk[i],openingSp:T.openingSp[i]},buffs:[],expansionBatch:o.id};}
 return o;
}
export const RHODES_ITEMS=readableRhodes({id:'rhodes-mujica-v1',bonds:{rhodesShip:{}},garrisons:{}}).items;
export const RHODES_CORE=Object.freeze({bondId:'rhodesShip',isCore:true});

