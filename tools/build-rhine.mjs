import fs from 'node:fs/promises';
import path from 'node:path';
import {composeStats} from '../shared/loadoutRecord.js';
const root=path.resolve(import.meta.dirname,'..'),sources=path.resolve(process.argv[2]||path.join(root,'.cache/rhine/gamedata'));
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const [spec,chars,skills,ranges,mods,equips,config]=await Promise.all([read(path.join(root,'tools/content/rhine.json')),...['character_table.json','skill_table.json','range_table.json','uniequip_table.json','battle_equip_table.json'].map(p=>read(path.join(sources,p))),read(path.join(root,'data/config.json'))]);
const clean=s=>String(s??'').replace(/\\n/g,'\n').replace(/<[@$#][^<>]*>|<\/>/g,'');
const bb=list=>Object.fromEntries((list||[]).filter(v=>v.value!==null).map(v=>[v.key,v.value]));
const bs=list=>Object.fromEntries((list||[]).filter(v=>v.valueStr).map(v=>[v.key,v.valueStr]));
const phase=v=>Number(String(v.unlockCondition?.phase).slice(-1));
const candidates=(list,p,l)=>(list||[]).filter(v=>(v.requiredPotentialRank||0)===0&&(phase(v)<p||phase(v)===p&&v.unlockCondition.level<=l));
const grid=id=>ranges[id]?.grids.map(v=>[v.row,v.col])||null;
const elite=id=>id.replace(/_a$/,'_b');
const describe=(s,b)=>clean(s).replace(/\{([^}:]+)(?::([^}]+))?\}/g,(m,k,f)=>k.replace(/^-/,'').toLowerCase() in b?String(f?.includes('%')?Math.round(b[k.replace(/^-/,'').toLowerCase()]*(k.startsWith('-')?-100:100))+'%':b[k.replace(/^-/,'').toLowerCase()]*(k.startsWith('-')?-1:1)):m);
const statMap={maxHp:'maxHp',atk:'atk',def:'def',magicResistance:'res',cost:'cost',blockCnt:'blockCnt',baseAttackTime:'bat',attackSpeed:'aspd',respawnTime:'respawnTime',spRecoveryPerSec:'spRecovery',hpRecoveryPerSec:'hpRecoveryPerSec',moveSpeed:'moveSpeed',tauntLevel:'tauntLevel',massLevel:'massLevel',maxDeployCount:'deployLimit',maxDeckStackCnt:'deckStack'};
function statsOf(c,p,l){const k=c.phases[p].attributesKeyFrames,a=k[0],z=k.at(-1),t=Math.max(0,Math.min(1,(l-a.level)/(z.level-a.level||1))),out={};for(const[k,v]of Object.entries(statMap)){const n=(a.data[k]??0)+((z.data[k]??0)-(a.data[k]??0))*t;out[v]=['maxHp','atk','def','cost','blockCnt','respawnTime','aspd'].includes(v)?Math.round(n):Math.round(n*1e6)/1e6;}return out;}
function talents(c,p,l){return(c.talents||[]).map((t,index)=>{const v=candidates(t.candidates,p,l).at(-1);return v?{index,name:v.name,desc:describe(v.description,bb(v.blackboard)),descRaw:describe(v.description,bb(v.blackboard)),bb:bb(v.blackboard),bbStr:bs(v.blackboard),rangeGrid:grid(v.rangeId),hidden:!!v.isHideTalent,tokenKey:v.tokenKey,fromModule:false}:null;}).filter(Boolean);}
function trait(c,p,l){const v=candidates(c.trait?.candidates,p,l).at(-1),b=bb(v?.blackboard),d=describe(v?.overrideDescripton??c.description,b);return{desc:d,descRaw:d,bb:b,bbStr:bs(v?.blackboard),rangeGrid:grid(v?.rangeId)};}
function moduleOf(id,base,level){const m=mods.equipDict[id],ep=equips[id]?.phases.find(v=>v.equipLevel===level);if(!m||!ep)throw Error('Missing module '+id);const names={max_hp:'maxHp',atk:'atk',def:'def',block_cnt:'blockCnt',magic_resistance:'res',attack_speed:'aspd'},attr={};for(const v of ep.attributeBlackboard){if(!names[v.key])throw Error('Unknown attr '+v.key);attr[names[v.key]]=v.value;}
 const traitOverride=structuredClone(base),talentChanges=[];
 for(const part of (ep.parts||[]).filter(p=>!p.isToken)){for(const v of part.overrideTraitDataBundle?.candidates||[]){if(v.requiredPotentialRank)continue;Object.assign(traitOverride.bb,bb(v.blackboard));if(v.overrideDescripton)traitOverride.desc=describe(v.overrideDescripton,traitOverride.bb);if(v.additionalDescription)traitOverride.moduleDesc=describe(v.additionalDescription,traitOverride.bb);}for(const v of part.addOrOverrideTalentDataBundle?.candidates||[])if(!v.requiredPotentialRank)talentChanges.push({talentIndex:v.talentIndex,name:v.name,desc:describe(v.description??v.upgradeDescription,bb(v.blackboard)),bb:bb(v.blackboard),bbStr:bs(v.blackboard),rangeGrid:grid(v.rangeId),hidden:!!v.isHideTalent});}
 return{uniEquipId:id,name:m.uniEquipName,typeName:m.typeName1+'-'+m.typeName2,isDefault:true,level,attr,traitOverride,talentChanges};
}
const growth=Object.fromEntries(spec.operators.map(o=>[o.key,'莱茵激活时，原生战斗事件提供科研层数，共享每回合20层额度。']));
const chess={},garrisons={};
const only=process.argv[3];
for(const [order,o]of spec.operators.entries())for(const golden of [false,true]){
 if(only&&o.key!==only)continue;
 const c=chars[o.charId],id=`chess_rhine_${o.key}_${golden?'b':'a'}`,base=`chess_rhine_${o.key}_a`,st=config.economy.chessStatus[o.tier][golden?'golden':'normal'];
 let p=Math.min(st.phase,c.phases.length-1),l=Math.min(st.level,c.phases[p].maxLevel);
 const sl=golden?7:4,ts=talents(c,p,l),tr=trait(c,p,l),statsBase=statsOf(c,p,l),ml=golden?1:0;
 const modules=golden?o.modules.map((id,index)=>({...moduleOf(id,tr,ml),isDefault:index===0})):[],dm=modules[0];
 const ss=c.skills.map((v,index)=>{const s=skills[v.skillId].levels[sl-1],b=bb(s.blackboard);return{skillId:v.skillId,iconId:v.skillId,name:s.name,level:sl,desc:describe(s.description,b),descRaw:describe(s.description,b),skillType:s.skillType,durationType:s.durationType,duration:s.duration,spType:s.spData.spType,spCost:s.spData.spCost,initSp:s.spData.initSp,maxChargeTime:s.spData.maxChargeTime,increment:s.spData.increment,bb:b,bbStr:bs(s.blackboard),rangeId:s.rangeId,rangeGrid:grid(s.rangeId),prefabId:s.prefabId,overrideTokenKey:v.overrideTokenKey||null,trigger:{rule:s.skillType==='AUTO'?'SP_FULL':'DEFAULT'},index,isDefault:index===o.defaultSkill};});
 const gid=`rhine_growth_${o.key}_${golden?'b':'a'}`;garrisons[gid]={garrisonId:gid,expansionBatch:spec.id,name:'行动积累',eventType:'IN_BATTLE',effectKey:'rhine_growth_'+o.key,desc:growth[o.key],bb:{},bbStr:{conditionkey:'character_target_inboard'},owners:[id]};
 chess[id]={chessId:id,baseId:base,goldenId:elite(base),isGolden:golden,tier:o.tier,identifier:o.identifier??13001+order,isHidden:false,isDiy:false,visible:true,chessType:'NORMAL',shopSortId:1300+o.tier,charId:o.charId,name:c.name,appellation:c.appellation,rarity:c.rarity,profession:c.profession,subProfessionId:c.subProfessionId,subProfessionName:{summoner:'召唤师',chain:'链术师',artsfghter:'术战者',trapper:'陷阱师',underminer:'护佑者',blastcaster:'轰击术师',bard:'吟游者',hammer:'撼地者',dollkeeper:'傀儡师',stalker:'伏击客',lord:'领主',pioneer:'尖兵',protector:'铁卫',guardian:'守护者',corecaster:'中坚术师'}[c.subProfessionId],position:c.position,nationId:c.nationId,bonds:o.bonds,garrisonIds:[gid],price:config.economy.chessPrice[o.tier].normal,sellPrice:golden?config.economy.chessPrice[o.tier].normal:1,upgradeNum:3,upgradeChessId:golden?null:elite(base),status:{phase:p,level:l,skillLevel:sl,equipLevel:ml},stats:dm?composeStats(statsBase,dm.attr):statsBase,statsBase,rangeId:c.phases[p].rangeId,rangeGrid:grid(c.phases[p].rangeId),immunities:{stun:false,silence:false,sleep:false,frozen:false,levitate:false},dmgType:o.dmgType,attackKind:o.attackKind,projectile:o.attackKind==='ranged'?'bolt':'none',canHitFly:o.attackKind==='ranged'&&o.key!=='dolris',targetPriority:null,trait:dm?dm.traitOverride:tr,traitBase:tr,talents:dm?[...ts,...dm.talentChanges.map(v=>({index:v.talentIndex,...v,fromModule:true}))]:ts,talentsBase:ts,tokens:[],skill:ss[o.defaultSkill],skills:ss,module:dm?{id:dm.uniEquipId,name:dm.name,type:dm.typeName,level:ml,active:true}:null,...(modules.length?{modules}:{}),assets:{avatar:o.charId+(golden?'_2':''),portrait:o.charId+(golden?'_2':'_1'),spine:o.charId,skillIcon:ss[o.defaultSkill].skillId,subProfIcon:`sub_${c.subProfessionId}_icon`},expansionBatch:spec.id};
}

const skillRecord=(entry,level,index)=>{const s=skills[entry.skillId].levels[level-1],b=bb(s.blackboard);return {skillId:entry.skillId,iconId:entry.skillId,name:s.name,level,desc:describe(s.description,b),descRaw:describe(s.description,b),skillType:s.skillType,durationType:s.durationType,duration:s.duration,spType:s.spData.spType,spCost:s.spData.spCost,initSp:s.spData.initSp,maxChargeTime:s.spData.maxChargeTime,bb:b,bbStr:bs(s.blackboard),rangeId:s.rangeId,rangeGrid:grid(s.rangeId),index};};
const tokens={};
for(const c of Object.values(chess)){
 const original=chars[c.charId];
 for(const t of [...c.talents,...c.talentsBase])if(t.tokenKey&&!chars[t.tokenKey]&&c.skill.overrideTokenKey){t.containerTokenKey=t.tokenKey;t.tokenKey=c.skill.overrideTokenKey;}
 const allIds=new Set(Object.keys(original.displayTokenDict||{}));
 for(const t of c.talents)if(t.tokenKey&&chars[t.tokenKey])allIds.add(t.tokenKey);
 for(const s of c.skills)if(s.overrideTokenKey&&chars[s.overrideTokenKey])allIds.add(s.overrideTokenKey);
 for(const s of c.skills)for(const [k,id]of Object.entries(s.bbStr||{}))if(k.includes('token')&&chars[id])allIds.add(id);
 for(const id of allIds){
  const tc=chars[id];if(!tc)continue;
  const ph=Math.min(c.status.phase,tc.phases.length-1),lv=Math.min(c.status.level,tc.phases[ph].maxLevel),tr=trait(tc,ph,lv);
  const stat=statsOf(tc,ph,lv),bySkill={},baseTalents=talents(tc,ph,lv);
  const matching=c.talents.find(t=>t.tokenKey===id||t.containerTokenKey&&c.skills.some(s=>s.overrideTokenKey===id))||c.talents.filter(t=>t.bb?.cnt&&c.skills.some(s=>s.overrideTokenKey===id)).at(-1),cnt=matching?.bb?.cnt||c.skills.find(s=>s.overrideTokenKey===id)?.bb.cnt||1;
  const use=(s)=>{const skId=s.overrideTokenKey===id||Object.values(s.bbStr||{}).find(v=>v===id),tal=matching&&(matching.tokenKey===id&&!matching.containerTokenKey||s.overrideTokenKey===id);return [...(tal?['talent']:[]),...(skId?['skill']:[]),...(Object.hasOwn(original.displayTokenDict||{},id)?['display']:[])];};
  const tokenSkill=(index)=>{const i=tc.skills?.[index]?.skillId?index:(tc.skills||[]).findIndex(s=>s?.skillId);return i>=0?skillRecord(tc.skills[i],c.status.skillLevel,i):null;};
  for(const s of c.skills)bySkill[s.index]={skill:tokenSkill(s.index),count:cnt,sources:use(s)};
  const variant={phase:ph,level:lv,stats:stat,rangeGrid:grid(tc.phases[ph].rangeId),trait:tr,talents:baseTalents,skill:tokenSkill(c.skill.index),count:cnt,sources:use(c.skill),bySkill,byModule:{}};
  for(const mod of c.modules||[]){
   const phaseRecord=equips[mod.uniEquipId]?.phases.find(x=>x.equipLevel===1),attrs=phaseRecord?.tokenAttributeBlackboard?.[id]||[];
   const ms={...stat},names={max_hp:'maxHp',atk:'atk',def:'def',attack_speed:'aspd',cost:'cost',max_deploy_count:'deployLimit',max_deck_stack_cnt:'deckStack'};
   for(const a of attrs)if(names[a.key])ms[names[a.key]]=(ms[names[a.key]]||0)+a.value;
   const mt=structuredClone(tr),tal=structuredClone(baseTalents);
   for(const part of (phaseRecord?.parts||[]).filter(p=>p.isToken)){
    for(const v of part.overrideTraitDataBundle?.candidates||[])if(!v.requiredPotentialRank){Object.assign(mt.bb,bb(v.blackboard));if(v.overrideDescripton)mt.desc=describe(v.overrideDescripton,mt.bb);if(v.additionalDescription)mt.moduleDesc=describe(v.additionalDescription,mt.bb);}
    for(const v of part.addOrOverrideTalentDataBundle?.candidates||[])if(!v.requiredPotentialRank){const rec={index:v.talentIndex,name:v.name,desc:describe(v.description??v.upgradeDescription,bb(v.blackboard)),bb:bb(v.blackboard),bbStr:bs(v.blackboard),fromModule:true};const i=tal.findIndex(t=>t.index===rec.index);if(i>=0)tal[i]=rec;else tal.push(rec);}
   }
   variant.byModule[mod.uniEquipId]={stats:ms,trait:mt,talents:tal};
  }
  variant.byModule.none={stats:stat,trait:tr,talents:baseTalents};
  const dm=c.modules?.[0];if(dm&&variant.byModule[dm.uniEquipId])Object.assign(variant,variant.byModule[dm.uniEquipId]);
  const t=tokens[id]||={tokenId:id,kind:'summon',name:tc.name,desc:tr.desc,descRaw:tr.desc,profession:tc.profession,subProfessionId:tc.subProfessionId,position:tc.position,displayType:'DEFAULT',placeable:true,ownerRange:/只能部署在.*攻击范围内/.test(tr.desc),owners:[],deployLimit:Math.max(1,stat.deployLimit||cnt),count:cnt,stats:variant.stats,rangeGrid:variant.rangeGrid,trait:tr,talents:baseTalents,skill:variant.skill,dmgType:id.endsWith('drone1')||id.includes('recttp')||id.includes('protrb')?'none':tr.desc.includes('法术')?'arts':'phys',attackKind:tc.position==='RANGED'?'ranged':'melee',projectile:tc.position==='RANGED'?'bolt':'none',canHitFly:tc.position==='RANGED'&&!id.endsWith('drone3'),abnormal:['healFree'],immunities:{stun:false,silence:false,sleep:false,frozen:false,levitate:false},variants:{},assets:{avatar:id,spine:id},expansionBatch:spec.id};
  t.owners.push(c.chessId);t.variants[c.chessId]=variant;c.tokens.push(id);
 }
}
const overlay={id:spec.id,version:spec.version,chess,garrisons,tokens,oldMembers:spec.oldMembers};
await fs.mkdir(path.join(root,'server/sim/content/rhine'),{recursive:true});
await fs.writeFile(path.join(root,'server/sim/content/rhine/records.js'),'// Generated by tools/build-rhine.mjs from pinned original GameData.\nexport const OVERLAY = '+JSON.stringify(overlay,null,2)+';\n');
console.log(JSON.stringify({states:Object.keys(chess).length,skills:Object.values(chess).reduce((n,c)=>n+c.skills.length,0),modules:Object.values(chess).filter(c=>c.isGolden).flatMap(c=>c.modules||[]).length,tokens:Object.keys(tokens).length}));
