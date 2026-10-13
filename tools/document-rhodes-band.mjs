import fs from 'node:fs/promises';
import path from 'node:path';
import {OVERLAY as raw} from '../server/sim/content/rhodes-mujica/records.js';
import {readableRhodes} from '../server/sim/content/rhodes-mujica/content-text.js';
import {ASSETS} from '../server/sim/content/rhodes-mujica/assets.js';
import {moveAngelina} from '../server/sim/content/rhodes-mujica/moved-angelina.js';
const OVERLAY=moveAngelina(readableRhodes(raw),structuredClone(ASSETS));
const lab=path.resolve(import.meta.dirname,'..');
const cells=v=>String(v??'—').replaceAll('|','／').replaceAll('\n','；');
let out='# 罗德岛与乐队：实装数值表\n\n此表从本体可选测试包 records.js 自动生成。数值来自锁定的原作 GameData，技能描述是原作数值说明；本项目自动战斗适配以 RHODES-BAND.md 为准。普通技能4级，精锐技能7级，无潜能、无信赖。精锐默认模组已计入“默认属性”；选无模组时使用基础属性。\n\n';
out+='|干员|阶|状态|精英／等级|基础生命／攻击／防御／法抗|默认生命／攻击／防御／法抗|部署费|攻击间隔|默认技能|\n|---|---:|---|---|---|---|---:|---:|---|\n';
for(const c of Object.values(OVERLAY.chess)){const s=c.stats,base=c.statsBase;out+=`|${c.name}|${c.tier}|${c.isGolden?'精锐':'普通'}|E${c.status.phase} Lv${c.status.level}|${base.maxHp}／${base.atk}／${base.def}／${base.res}|${s.maxHp}／${s.atk}／${s.def}／${s.res}|${s.cost}|${s.bat}|S${c.skill.index+1}|\n`;}
for(const base of Object.values(OVERLAY.chess).filter(c=>!c.isGolden)){
out+=`\n## ${base.name}（${base.tier}阶）\n\n主职业：${base.profession}；分支：${base.subProfessionName}；盟约：${base.bonds.map(id=>OVERLAY.bonds[id]?.name||id).join('／')}。\n\n`;
for(const c of [base,OVERLAY.chess[base.goldenId]]){
out+=`### ${c.isGolden?'精锐':'普通'}\n\n${c.trait.desc}\n\n`;
out+='|技能|名称|初始技力／消耗|回复类型|持续秒|原作描述|\n|---|---|---|---|---|---|\n';
for(const s of c.skills)out+=`|S${s.index+1}|${s.name}|${s.initSp}／${s.spCost}|${s.spType}|${s.duration}|${cells(s.desc)}|\n`;
out+='\n天赋：\n\n';for(const t of c.talentsBase)out+=`- ${t.name||'隐藏天赋'}：${cells(t.desc)}\n`;
for(const m of c.modules||[]){out+=`\n模组 **${m.name}（${m.typeName}，${m.level}级）**：${Object.entries(m.attr).map(([k,v])=>k+'+'+v).join('，')}。\n\n${m.traitOverride.moduleDesc||m.traitOverride.desc}\n\n`;for(const t of m.talentChanges)out+=`- ${t.name||'天赋升级'}：${cells(t.desc)}\n`;}
}
out+=`\n项目特质：${OVERLAY.garrisons[base.garrisonIds[0]].desc}\n`;
}
await fs.writeFile(path.join(lab,'docs/RHODES-BAND-NUMBERS.md'),out);
console.log('NUMBERS.md generated');
