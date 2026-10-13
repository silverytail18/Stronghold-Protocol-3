// Original Amiya naming predates numbered skill clips: S1 uses normal attacks,
// S2 is Skill, S3 is Skill_2. Never infer its indices from the generic resolver.
export function fixRhodesModels(assets){
 const records=[assets.chars?.char_002_amiya,...Object.values(assets.skinModels||{}).filter(s=>s.charId==='char_002_amiya')];
 for(const record of records)for(const e of Object.values(record?.spine||{})){
  const a=e.anims;if(!a?.attack)continue;
  const clip=(prefix,index)=>({begin:e.animations[prefix+'_Begin']!==undefined?prefix+'_Begin':null,loop:prefix,end:e.animations[prefix+'_End']!==undefined?prefix+'_End':null,index,idle:null});
  a.skills={'0':{...a.attack,index:0,via:'attack',idle:null},'1':clip('Skill',1),'2':clip('Skill_2',2)};a.skill=a.skills['0'];
 }
 for(const s of Object.values(assets.skinModels||{}))if(s.charId==='char_4183_mortis')for(const e of Object.values(s.spine||{}))e.requireClipping=true;
}
