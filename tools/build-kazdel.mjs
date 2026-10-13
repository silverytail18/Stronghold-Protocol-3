import {personalGarrisonText} from '../shared/kazdel-personal.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {composeStats} from '../shared/loadoutRecord.js';
const root=path.resolve(import.meta.dirname,'..'),sources=path.resolve(process.argv[2]||path.join(root,'.cache/rhodes-band/gamedata'));
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const [spec,chars,skills,ranges,mods,equips,config]=await Promise.all([read(path.join(root,'tools/content/kazdel.json')),...['character_table.json','skill_table.json','range_table.json','uniequip_table.json','battle_equip_table.json'].map(p=>read(path.join(sources,p))),read(path.join(root,'data/config.json'))]);
const clean=s=>String(s??'').replace(/\\n/g,'\n').replace(/<[@$#][^<>]*>|<\/>/g,'');
const bb=list=>Object.fromEntries((list||[]).filter(v=>v.value!==null).map(v=>[v.key,v.value]));
const bs=list=>Object.fromEntries((list||[]).filter(v=>v.valueStr).map(v=>[v.key,v.valueStr]));
const phase=v=>Number(String(v.unlockCondition?.phase).slice(-1));
const candidates=(list,p,l)=>(list||[]).filter(v=>(v.requiredPotentialRank||0)===0&&(phase(v)<p||phase(v)===p&&v.unlockCondition.level<=l));
const grid=id=>ranges[id]?.grids.map(v=>[v.row,v.col])||null;
const elite=id=>id.replace(/_a$/,'_b');
const describe=(s,b)=>clean(s).replace(/\{([^}:]+)(?::([^}]+))?\}/g,(m,k,f)=>{const negative=k.startsWith('-'),key=(negative?k.slice(1):k).toLowerCase();if(!(key in b))return m;const value=b[key]*(negative?-1:1);return String(f?.includes('%')?Math.round(value*100)+'%':value);});
const statMap={maxHp:'maxHp',atk:'atk',def:'def',magicResistance:'res',cost:'cost',blockCnt:'blockCnt',baseAttackTime:'bat',attackSpeed:'aspd',respawnTime:'respawnTime',spRecoveryPerSec:'spRecovery',hpRecoveryPerSec:'hpRecoveryPerSec',moveSpeed:'moveSpeed',tauntLevel:'tauntLevel',massLevel:'massLevel',maxDeployCount:'deployLimit',maxDeckStackCnt:'deckStack'};
function statsOf(c,p,l){const k=c.phases[p].attributesKeyFrames,a=k[0],z=k.at(-1),t=Math.max(0,Math.min(1,(l-a.level)/(z.level-a.level||1))),out={};for(const[k,v]of Object.entries(statMap)){const n=(a.data[k]??0)+((z.data[k]??0)-(a.data[k]??0))*t;out[v]=['maxHp','atk','def','cost','blockCnt','respawnTime','aspd'].includes(v)?Math.round(n):Math.round(n*1e6)/1e6;}return out;}
function talents(c,p,l){return(c.talents||[]).map((t,index)=>{const v=candidates(t.candidates,p,l).at(-1);return v?{index,name:v.name,desc:describe(v.description,bb(v.blackboard)),descRaw:describe(v.description,bb(v.blackboard)),bb:bb(v.blackboard),bbStr:bs(v.blackboard),rangeGrid:grid(v.rangeId),hidden:!!v.isHideTalent,fromModule:false}:null;}).filter(Boolean);}
function trait(c,p,l){const v=candidates(c.trait?.candidates,p,l).at(-1),b=bb(v?.blackboard),d=describe(v?.overrideDescripton??c.description,b);return{desc:d,descRaw:d,bb:b,bbStr:bs(v?.blackboard),rangeGrid:grid(v?.rangeId)};}
function moduleOf(id,base,level){const m=mods.equipDict[id],ep=equips[id]?.phases.find(v=>v.equipLevel===level);if(!m||!ep)throw Error('Missing module '+id);const names={max_hp:'maxHp',atk:'atk',def:'def',block_cnt:'blockCnt',magic_resistance:'res',attack_speed:'aspd'},attr={};for(const v of ep.attributeBlackboard){if(!names[v.key])throw Error('Unknown attr '+v.key);attr[names[v.key]]=v.value;}
 const traitOverride=structuredClone(base),talentChanges=[];
 for(const part of ep.parts||[]){for(const v of part.overrideTraitDataBundle?.candidates||[]){if(v.requiredPotentialRank)continue;Object.assign(traitOverride.bb,bb(v.blackboard));if(v.overrideDescripton)traitOverride.desc=describe(v.overrideDescripton,traitOverride.bb);if(v.additionalDescription)traitOverride.moduleDesc=describe(v.additionalDescription,traitOverride.bb);}for(const v of part.addOrOverrideTalentDataBundle?.candidates||[])if(!v.requiredPotentialRank)talentChanges.push({talentIndex:v.talentIndex,name:v.name,desc:describe(v.description??v.upgradeDescription,bb(v.blackboard)),bb:bb(v.blackboard),bbStr:bs(v.blackboard),rangeGrid:grid(v.rangeId),hidden:!!v.isHideTalent});}
 return{uniEquipId:id,name:m.uniEquipName,typeName:m.typeName1+'-'+m.typeName2,isDefault:true,level,attr,traitOverride,talentChanges};
}
const growth={amiya:'至少三名不同罗德岛且覆盖三种职业；休整结束罗德岛+2／4层。',dolris:'四邻格存在另一名少女乐队成员；休整结束罗德岛+1／2层。',amoris:'在场期间本回合完成少女乐队真实精锐合成；休整结束罗德岛+2／4层。',mortis:'至少三名不同罗德岛且覆盖三种职业；休整结束罗德岛+1／2层。',tmoris:'少女乐队同时有近卫与特种职业；休整结束罗德岛+1／2层。',oblvns:'至少两名不同少女乐队成员各携带至少一件装备；休整结束罗德岛+1／2层。'};
const chess={},garrisons={};
const only=process.argv[3];
for(const [order,o]of spec.operators.entries())for(const golden of [false,true]){
 if(only&&o.key!==only)continue;
 const c=chars[o.charId],id=`chess_kz_${o.key}_${golden?'b':'a'}`,base=`chess_kz_${o.key}_a`,st=config.economy.chessStatus[o.tier][golden?'golden':'normal'];
 let p=Math.min(st.phase,c.phases.length-1),l=Math.min(st.level,c.phases[p].maxLevel);
 const sl=golden?7:4,ts=talents(c,p,l),tr=trait(c,p,l),statsBase=statsOf(c,p,l),ml=golden?(o.tier===6?3:1):0;
 const modules=golden?o.modules.map((id,index)=>({...moduleOf(id,tr,ml),isDefault:index===0})):[],dm=modules[0];
 const ss=c.skills.map((v,index)=>{const s=skills[v.skillId].levels[sl-1],b=bb(s.blackboard);return{skillId:v.skillId,iconId:skills[v.skillId].iconId||v.skillId,name:s.name,level:sl,desc:describe(s.description,b),descRaw:describe(s.description,b),skillType:s.skillType,durationType:s.durationType,duration:s.duration,spType:s.spData.spType,spCost:s.spData.spCost,initSp:s.spData.initSp,maxChargeTime:s.spData.maxChargeTime,increment:s.spData.increment,bb:b,bbStr:bs(s.blackboard),rangeId:s.rangeId,rangeGrid:grid(s.rangeId),prefabId:s.prefabId,trigger:{rule:s.skillType==='AUTO'?'SP_FULL':'DEFAULT'},index,isDefault:index===o.defaultSkill};});
 const gid=`kz_growth_${o.key}_${golden?'b':'a'}`;garrisons[gid]={garrisonId:gid,expansionBatch:spec.id,name:'行动积累',eventType:'SERVER_PREP_FIN',effectKey:'kz_growth_'+o.key,desc:'上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。',bb:{},bbStr:{conditionkey:'character_target_inboard'},owners:[id]};
 chess[id]={chessId:id,baseId:base,goldenId:elite(base),isGolden:golden,tier:o.tier,identifier:o.identifier??11001+order,isHidden:false,isDiy:false,visible:true,chessType:'NORMAL',shopSortId:1100+o.tier,charId:o.charId,name:c.name,appellation:c.appellation,rarity:c.rarity,profession:c.profession,subProfessionId:c.subProfessionId,subProfessionName:{bard:'吟游者',aoesniper:'炮手',hammer:'撼地者',dollkeeper:'傀儡师',stalker:'伏击客',lord:'领主',pioneer:'尖兵',protector:'铁卫',guardian:'守护者',corecaster:'中坚术师'}[c.subProfessionId],position:c.position,nationId:c.nationId,bonds:o.bonds,garrisonIds:[gid],price:config.economy.chessPrice[o.tier].normal,sellPrice:golden?config.economy.chessPrice[o.tier].normal:1,upgradeNum:3,upgradeChessId:golden?null:elite(base),status:{phase:p,level:l,skillLevel:sl,equipLevel:ml},stats:dm?composeStats(statsBase,dm.attr):statsBase,statsBase,rangeId:c.phases[p].rangeId,rangeGrid:grid(c.phases[p].rangeId),immunities:{stun:false,silence:false,sleep:false,frozen:false,levitate:false},dmgType:o.dmgType,attackKind:o.attackKind,projectile:o.attackKind==='ranged'?'bolt':'none',canHitFly:o.attackKind==='ranged'&&o.key!=='dolris',targetPriority:null,trait:dm?dm.traitOverride:tr,traitBase:tr,talents:dm?[...ts,...dm.talentChanges.map(v=>({index:v.talentIndex,...v,fromModule:true}))]:ts,talentsBase:ts,tokens:[],skill:ss[o.defaultSkill],skills:ss,module:dm?{id:dm.uniEquipId,name:dm.name,type:dm.typeName,level:ml,active:true}:null,...(modules.length?{modules}:{}),assets:{avatar:o.charId+(golden?'_2':''),portrait:o.charId+(golden?'_2':'_1'),spine:o.charId,skillIcon:ss[o.defaultSkill].skillId,subProfIcon:`sub_${c.subProfessionId}_icon`},expansionBatch:spec.id};
}

for(const c of Object.values(chess)){const g=garrisons[c.garrisonIds[0]];g.desc=g.descRaw=personalGarrisonText(c);}
const overlay={id:spec.id,version:spec.version,chess,garrisons,tokens:{},oldMembers:spec.oldMembers};
await fs.writeFile(path.join(root,"server/sim/content/kazdel/records.js"),"// Generated from pinned GameData by tools/build-kazdel.mjs.\nexport const OVERLAY = "+JSON.stringify(overlay,null,2)+";\n");
console.log(JSON.stringify({states:Object.keys(chess).length,skills:Object.values(chess).reduce((n,c)=>n+c.skills.length,0)}));
