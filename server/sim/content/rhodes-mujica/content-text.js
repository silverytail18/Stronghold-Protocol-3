import {RI_BALANCE as R,ENGINEERING_BALANCE as E,NEARL_BALANCE as N,TERMINAL,TERMINAL_BALANCE as T} from './balance.js';
import {setTestBondDescription} from '../../../../shared/test-bond-descriptions.js';
const growth={amiya:'至少三名不同罗德岛干员且覆盖三种职业',dolris:'作战区有另一名不同少女乐队成员',amoris:'本回合在场时完成罗德岛真实精锐合成，或作战区已有两名不同罗德岛精锐',mortis:'至少三名不同罗德岛干员且覆盖三种职业',tmoris:'作战区罗德岛成员同时有近卫与特种职业',oblvns:'至少两名不同罗德岛成员各携带至少一件装备',kalts2:'作战区有另一名罗德岛近卫或重装'};
export function readableRhodes(overlay){
 const o=structuredClone(overlay),b=o.bonds.rhodesShip;
 const attrs='攻击'+R.atkBase*100+'%＋每层'+R.atkPerLayer*100+'个百分点，生命'+R.hpBase*100+'%＋每层'+R.hpPerLayer*100+'个百分点；';
 const fireBase='底伤'+E.base+'＋'+E.perLayer+'×层数，超过'+E.rampStart+'层另加'+E.layerRamp+'×超出层数的平方';
 const opening='1—3阶首次部署补给8／12点技力，与乐队／终端只补差额，继承和重部署不补。';
 const rules='存活成员2格内索敌，阻挡敌人优先；各发锁定不同敌人，目标不足才重复。被主锁定敌人预告期间移动速度降低50%，6人0.5秒／9人0.4秒，同名减速取最高不叠加。锁定落点后不追踪；不同弹范围重叠可分别命中。火力不继承干员伤害倍率或个人击杀特质。';
 b.desc=b.descRaw='3人：'+attrs+opening+' 6人：每'+E.interval[0]+'秒物理／法术各一发，每发'+fireBase+'；全队攻击力系数从4%随220—800层成长至'+E.atkScale[0]*100+'%，半径'+E.radius[0]+'格每发最多3目标，0.5秒预告。9人：每'+E.interval[1]+'秒物理／法术／真实各一发，物法使用相同底伤，全队攻击力系数从4%随220—800层成长至'+E.atkScale[1]*100+'%，真实为50%，半径'+E.radius[1]+'格范围全体，0.4秒预告。首次有目标2秒后发射。'+rules+' 休整基础'+R.growth.join('／')+'层，作战区至少'+R.professions.join('／')+'种罗德岛职业额外'+R.composition.join('／')+'层。有效炮击每轮+2层，每场上限24／30。角色成长另计，层数0—999。';
 b.bb={atkBase:R.atkBase,atkPerLayer:R.atkPerLayer,hpBase:R.hpBase,hpPerLayer:R.hpPerLayer,fireBase:E.base,firePerLayer:E.perLayer};
 b.effectDescParams=[['atkBase','atkPerLayer'],['hpBase','hpPerLayer']].map(([base,perStack],index)=>({index,base,perStack,format:'0.0%'}));
 b.effectDescParams.push({index:4,base:'fireBase',perStack:'firePerLayer',format:'0'});
 b.effectDescByTier={
  1:'攻击+{0:0.0%}，最大生命+{1:0.0%}。\n'+opening+'\n休整基础+'+R.growth[0]+'，'+R.professions[0]+'职业额外+'+R.composition[0]+'；角色成长另计。',
  2:'攻击+{0:0.0%}，最大生命+{1:0.0%}。\n'+opening+'\n工程火力：每'+E.interval[0]+'秒物理／法术各一发；每发当前底伤{4:0}，另加全队攻击力{5:0.0%}（系数4%—'+E.atkScale[0]*100+'%）；'+fireBase+'，系数在220—800层逐步提升。预告0.5秒，半径'+E.radius[0]+'格，每发最多3目标。\n'+rules+'\n休整基础+'+R.growth[1]+'，'+R.professions[1]+'职业额外+'+R.composition[1]+'。有效炮击每轮+2、每场24。',
  3:'攻击+{0:0.0%}，最大生命+{1:0.0%}。\n'+opening+'\n工程火力：每'+E.interval[1]+'秒物理／法术／真实各一发；物法每发当前底伤{4:0}，另加全队攻击力{5:0.0%}（系数4%—'+E.atkScale[1]*100+'%）；'+fireBase+'，系数在220—800层逐步提升，真实弹为其50%。预告0.4秒，半径'+E.radius[1]+'格，范围全体。\n'+rules+'\n休整基础+'+R.growth[2]+'，'+R.professions[2]+'职业额外+'+R.composition[2]+'。有效炮击每轮+2、每场30。'
 };
 b.effectDescRaw=Object.values(b.effectDescByTier).join('\n\n');b.engineering={...E};b.prepGrowth={base:[...R.growth],professions:[...R.professions],composition:[...R.composition]};
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

