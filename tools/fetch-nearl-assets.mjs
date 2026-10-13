import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ASSETS} from '../server/sim/content/rhodes-mujica/assets.js';
import {atlasInfo,normalizeAtlas} from './assets/atlas.mjs';
import {parseSkel} from './assets/skel.mjs';
import {resolveRoles} from './assets/anim-roles.mjs';
import {fetchSkins} from './fetch-skins.mjs';
const source=JSON.parse(await fs.readFile('tools/assets/skins-source.json','utf8'));
const repo=path.resolve('../Stronghold-Protocol-3-RI-Mujica-lab/sources/resource-index'),commit=source.commit,id='char_148_nearl';
const tree=execFileSync('git',['-c','safe.directory='+repo.replaceAll('\\','/'),'-C',repo,'ls-tree','-r',commit],{encoding:'utf8',maxBuffer:64e6,windowsHide:true});
const index=new Map(tree.trim().split('\n').map(l=>{const m=/^\d+ blob (\w+)\t(.+)$/.exec(l);return m?[m[2],m[1]]:null;}).filter(Boolean)),proof=[];
async function req(url){for(let i=0;i<4;i++){try{const target=i%2?url.replace('https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@','https://raw.githubusercontent.com/fexli/ArknightsResource/'):url;const r=await fetch(target,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);return Buffer.from(await r.arrayBuffer());}catch(e){if(i===3)throw e;}}}
async function file(remote,url){const want=index.get(remote);if(!want)throw Error('Unpinned '+remote);let b;try{b=await fs.readFile('public'+url);}catch{}
 const blob=x=>createHash('sha1').update('blob '+x.length+'\0').update(x).digest('hex');
 if(!b||blob(b)!==want)b=await req('https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@'+commit+'/'+remote);
 if(blob(b)!==want)throw Error('Hash mismatch '+remote);await fs.mkdir(path.dirname('public'+url),{recursive:true});await fs.writeFile('public'+url,b);
 proof.push({source:remote,url,gitBlob:want,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});console.log(remote);return b;
}
async function model(modelId,skin=false){
 const entry={spine:{}};
 for(const side of ['front','back']){const pre='spine/'+id+'/'+modelId+'/'+(side==='front'?'Front':'Back')+'/',local=skin?'/assets/skins/'+pre:'/assets/spine/op/'+id+'/'+side+'/',files=[...index.keys()].filter(p=>p.startsWith(pre)),atlasPath=files.find(p=>p.endsWith('.atlas')),skelPath=files.find(p=>p.endsWith('.skel'));if(!atlasPath||!skelPath)throw Error('Incomplete side '+pre);
  const atlas=await file(atlasPath,local+path.posix.basename(atlasPath)),info=atlasInfo(atlas.toString()),sizes=new Map(),textures=[];
  for(const p of info.pages){const name=typeof p==='string'?p:p.name,b=await file(pre+name,local+name);sizes.set(name,{width:b.readUInt32BE(16),height:b.readUInt32BE(20)});textures.push(local+name);}
  const norm=normalizeAtlas(atlas.toString(),{pageSize:n=>sizes.get(n)});await fs.writeFile('public'+local+path.posix.basename(atlasPath),typeof norm==='string'?norm:norm.text);
  const skel=await file(skelPath,local+path.posix.basename(skelPath)),meta=parseSkel(skel,info.regions);if(meta.missingRegions.length)throw Error('Missing regions '+modelId);
  entry.spine[side]={skel:local+path.posix.basename(skelPath),atlas:local+path.posix.basename(atlasPath),textures,pma:false,anims:resolveRoles(meta.animations,{skillIndices:[0,1],durations:meta.durations}),animations:meta.durations,events:meta.events,hits:meta.hits,bounds:meta.bounds};console.log(side,meta.animations);
 }return entry;
}
const a=structuredClone(ASSETS),entry=await model(id);
for(const[key,remote,url]of [['avatar','avatar/ASSISTANT/'+id+'.png','/assets/char/avatar/'+id+'.png'],['avatarE2','avatar/ASSISTANT/'+id+'_2.png','/assets/char/avatar/'+id+'_2.png'],['portrait','charpor/'+id+'_1.png','/assets/char/portrait/'+id+'_1.png'],['portraitE2','charpor/'+id+'_2.png','/assets/char/portrait/'+id+'_2.png']]){await file(remote,url);entry[key]=url;}
a.chars[id]=entry;
for(const sk of ['skchr_nearl_1','skchr_nearl_2']){const url='/assets/skill/'+sk+'.png';await file('skills/skill_icon_'+sk+'.png',url);a.skills[sk]=url;a.skillsById[sk]=sk;}
a.modules||={};await file('equip/uniequip_002_nearl.png','/assets/module/uniequip_002_nearl.png');a.modules.uniequip_002_nearl='/assets/module/uniequip_002_nearl.png';
const skinTable=JSON.parse(await fs.readFile('.cache/rhodes-revision/gamedata/skin_table.json','utf8'));
const ark=JSON.parse(await fs.readFile('.cache/rhodes-revision/models_data.json','utf8'));
const added=[];
for(const skin of Object.values(skinTable.charSkins).filter(v=>v.charId===id&&v.displaySkin?.skinName&&v.skinId.startsWith(id+'@'))){
 const mid=skin.skinId.replace(/[@#]/g,'_'),avatar='avatar/ASSISTANT/'+skin.avatarId.replace(/#/g,'_')+'.png';let portrait='charpor/'+skin.portraitId.replace(/#/g,'_')+'.png',portraitKind;
 if(!index.has(portrait)){portrait='charpack/'+mid+'b.png';portraitKind='illustration';}
 const fronts=['Front','Back'].map(side=>'spine/'+id+'/'+mid+'/'+side+'/');
 if(!index.has(avatar)||!index.has(portrait)||fronts.some(pre=>![...index.keys()].some(p=>p.startsWith(pre)&&p.endsWith('.skel')))){console.log('UNAVAILABLE',skin.skinId);continue;}
 const m=await model(mid,true);await file(avatar,'/assets/skins/'+avatar);await file(portrait,'/assets/skins/'+portrait);
 const record={id:mid,charId:id,sourceId:skin.skinId,name:skin.displaySkin.skinName,brand:skin.displaySkin.skinGroupName,sort:skin.displaySkin.sortId,avatar,portrait,...(portraitKind?{portraitKind}:{}),spine:Object.fromEntries(fronts.map((pre,i)=>[i?'back':'front',[...index.keys()].filter(p=>p.startsWith(pre)&&/\.(skel|atlas|png)$/.test(p))])),tokens:[]};
 if(!source.skins.some(v=>v.id===mid))source.skins.push(record);
 for(const p of proof.filter(v=>v.url.startsWith('/assets/skins/')))source.files[p.source]={sha:index.get(p.source),bytes:p.bytes};
 added.push({sourceId:skin.skinId,name:record.name,arkModels:Object.entries(ark.data).filter(([k])=>k===skin.skinId.replace(/^char_/,'').replace('@','_')).map(([k,v])=>({id:k,type:v.type,style:v.style}))});
}
await fs.writeFile('server/sim/content/rhodes-mujica/assets.js','// Pinned native battle assets; Nearl proof in docs/NEARL-ASSETS.json.\nexport const ASSETS='+JSON.stringify(a,null,2)+';\n');
await fs.writeFile('tools/assets/skins-source.json',JSON.stringify(source,null,2)+'\n');
await fetchSkins({root:path.resolve('.'),offline:true});
await fs.writeFile('docs/NEARL-ASSETS.json',JSON.stringify({repository:'https://github.com/fexli/ArknightsResource',commit,arkModelsCommit:'8a3857c250a5c271429aefa82c660ff35803166e',added,files:proof},null,2)+'\n');
console.log('Nearl complete',added.map(v=>v.name));


