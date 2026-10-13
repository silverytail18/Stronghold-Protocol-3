// Download only verified artwork; never runs upstream code. Existing skins and models are retained.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ASSETS} from '../server/sim/content/rhodes-mujica/assets.js';
import {OVERLAY} from '../server/sim/content/rhodes-mujica/records.js';
import {PENGUIN_OVERLAY} from '../server/sim/content/expansion/penguin-records.js';
import {EXPANSION_OVERLAY} from '../server/sim/content/expansion/expansion-records.js';
import {atlasInfo,normalizeAtlas} from './assets/atlas.mjs';
import {parseSkel} from './assets/skel.mjs';
import {resolveRoles} from './assets/anim-roles.mjs';
import {fetchSkins} from './fetch-skins.mjs';
const root=path.resolve(import.meta.dirname,'..'),sourceRoot=path.resolve(process.argv[2]||path.join(root,'.cache/rhodes-band/sources'));
const sourceFile=path.join(root,'tools/assets/skins-source.json'),source=JSON.parse(await fs.readFile(sourceFile,'utf8'));
const repo=path.join(sourceRoot,'resource-index'),commit=source.commit;
const tree=execFileSync('git',['-c','safe.directory='+repo.replaceAll('\\','/'),'-C',repo,'ls-tree','-r',commit],{encoding:'utf8',maxBuffer:64e6,windowsHide:true});
const index=new Map(tree.trim().split('\n').map(l=>{const m=/^\d+ blob (\w+)\t(.+)$/.exec(l);return m?[m[2],m[1]]:null;}).filter(Boolean));
const skinTable=JSON.parse(await fs.readFile(path.join(root,'.cache/skins/skin.json'),'utf8'));
const arkBytes=await fs.readFile(path.join(root,'.cache/ark-models/models_data.json'));
const ark=JSON.parse(arkBytes),comparison=JSON.parse(await fs.readFile(path.join(root,'tools/assets/skins-comparison.json'),'utf8'));
const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),sha=b=>createHash('sha256').update(b).digest('hex');
if(blob(arkBytes)!==comparison.arkModels.modelIndexSha)throw Error('Ark-Models index differs from the pinned audit');
const operators=new Set([OVERLAY,PENGUIN_OVERLAY,EXPANSION_OVERLAY].flatMap(o=>Object.values(o.chess).map(c=>c.charId))),proof=[],added=[],unavailable=[],audit=[];
async function fetchFile(remote,url){
 if(!/^[A-Za-z0-9_./-]+$/.test(remote)||remote.split('/').some(v=>v==='..')||!index.has(remote))throw Error('Unpinned asset '+remote);
 const cache=path.join(root,'.cache/rhodes-band/art',remote);let bytes;
 try{bytes=await fs.readFile(cache);}catch{for(let attempt=0;attempt<6;attempt++){try{const host=attempt%2?'https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@'+commit:'https://raw.githubusercontent.com/fexli/ArknightsResource/'+commit;const res=await fetch(host+'/'+remote,{signal:AbortSignal.timeout(45000)});if(!res.ok)throw Error(res.status+' '+remote);bytes=Buffer.from(await res.arrayBuffer());break;}catch(e){console.log('Retry '+(attempt+1)+' '+remote+': '+e.message);if(attempt===5)throw Error('Download failed: '+remote,{cause:e});}}}
 if(blob(bytes)!==index.get(remote))throw Error('Git blob checksum differs: '+remote);
 await fs.mkdir(path.dirname(cache),{recursive:true});await fs.writeFile(cache,bytes);
 const dest=path.join(root,'public',url);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);
 proof.push({source:remote,url,gitBlob:index.get(remote),sha256:sha(bytes),bytes:bytes.length});return bytes;
}
const a=structuredClone(ASSETS),id='char_2013_cerber',c=OVERLAY.chess.chess_rm_cerber_a,entry={spine:{}};
for(const [key,remote,url]of [['avatar',`avatar/ASSISTANT/${id}.png`,`/assets/char/avatar/${id}.png`],['avatarE2',`avatar/ASSISTANT/${id}_2.png`,`/assets/char/avatar/${id}_2.png`],['portrait',`charpor/${id}_1.png`,`/assets/char/portrait/${id}_1.png`],['portraitE2',`charpor/${id}_2.png`,`/assets/char/portrait/${id}_2.png`]]){await fetchFile(remote,url);entry[key]=url;}
for(const side of ['front','back']){
 const prefix=`spine/${id}/${id}/${side==='front'?'Front':'Back'}/`,local=`/assets/spine/op/${id}/${side}/`;
 const atlas=await fetchFile(prefix+id+'.atlas',local+id+'.atlas'),info=atlasInfo(atlas.toString()),sizes=new Map(),textures=[];
 for(const p of info.pages){const name=typeof p==='string'?p:p.name,b=await fetchFile(prefix+name,local+name);sizes.set(name,{width:b.readUInt32BE(16),height:b.readUInt32BE(20)});textures.push(local+name);}
 const norm=normalizeAtlas(atlas.toString(),{pageSize:n=>sizes.get(n)});await fs.writeFile(path.join(root,'public',local+id+'.atlas'),typeof norm==='string'?norm:norm.text);
 const skel=await fetchFile(prefix+id+'.skel',local+id+'.skel'),meta=parseSkel(skel,info.regions);if(meta.missingRegions.length)throw Error('Incomplete Ceobe battle model');
 entry.spine[side]={skel:local+id+'.skel',atlas:local+id+'.atlas',textures,pma:false,anims:resolveRoles(meta.animations,{skillIndices:[0,1,2],durations:meta.durations}),animations:meta.durations,events:meta.events,hits:meta.hits,bounds:meta.bounds};
}
a.chars[id]=entry;for(const s of c.skills){const url='/assets/skill/'+s.skillId+'.png';await fetchFile('skills/skill_icon_'+s.skillId+'.png',url);a.skills[s.skillId]=url;a.skillsById[s.skillId]=s.skillId;}
for(const m of OVERLAY.chess.chess_rm_cerber_b.modules){const url='/assets/module/'+m.uniEquipId+'.png';await fetchFile('equip/'+m.uniEquipId+'.png',url);a.modules[m.uniEquipId]=url;}
await fs.writeFile(path.join(root,'server/sim/content/rhodes-mujica/assets.js'),'// Verified pinned native battle assets. See docs/RHODES-BAND-ASSETS.json and tools/assets/rhodes-band-skins-audit.json.\nexport const ASSETS='+JSON.stringify(a,null,2)+';\n');
for(const s of Object.values(skinTable.charSkins)){
 if(!operators.has(s.charId)||!s.displaySkin?.skinName||!s.skinId.startsWith(s.charId+'@'))continue;
 const skinId=s.skinId.replace(/[@#]/g,'_'),avatar='avatar/ASSISTANT/'+s.avatarId.replace(/#/g,'_')+'.png';
 let portrait='charpor/'+s.portraitId.replace(/#/g,'_')+'.png',portraitKind;
 if(!index.has(portrait)){portrait='charpack/'+skinId+'b.png';portraitKind='illustration';}
 const sides={};for(const [face,remote]of [['front','Front'],['back','Back']]){const prefix=`spine/${s.charId}/${skinId}/${remote}/`;const files=[...index.keys()].filter(p=>p.startsWith(prefix)&&/\.(skel|atlas|png)$/.test(p));if(files.some(p=>p.endsWith('.skel'))&&files.some(p=>p.endsWith('.atlas'))&&files.some(p=>p.endsWith('.png')))sides[face]=files;}
 // Sora has one original independent battle model for both orientations; retain its verified mapping.
 const existing=source.skins.find(v=>v.id===skinId);if(existing)Object.assign(sides,existing.spine);
 const frontOnly=s.charId==='char_4184_dolris'&&!!sides.front&&!sides.back;
 const arkModels=Object.entries(ark.data).filter(([key])=>key===s.skinId.replace(/^char_/,'').replace('@','_')).map(([key,v])=>({id:key,style:v.style,type:v.type,assetId:v.assetId}));
 const missing=[!index.has(avatar)&&'avatar',!index.has(portrait)&&'portrait',!sides.front&&'front',!sides.back&&!frontOnly&&'back'].filter(Boolean);
 const record={id:skinId,charId:s.charId,sourceId:s.skinId,name:s.displaySkin.skinName,brand:s.displaySkin.skinGroupName,sort:s.displaySkin.sortId,avatar,portrait,...(portraitKind?{portraitKind}:{}),...(frontOnly?{frontOnly:true}:{}),spine:sides,tokens:[]};
 audit.push({sourceId:s.skinId,name:record.name,arkModels,missing,frontOnly});if(missing.length){unavailable.push({sourceId:s.skinId,charId:s.charId,name:record.name,missing});continue;}
 if(source.skins.some(v=>v.id===skinId))continue;
 added.push(record);console.log('Skin ready: '+record.name);
}
const jobs=new Set();for(const s of added){jobs.add(s.avatar);jobs.add(s.portrait);for(const files of Object.values(s.spine))files.forEach(p=>jobs.add(p));}
let cursor=0;const paths=[...jobs];await Promise.all(Array.from({length:6},async()=>{while(cursor<paths.length){const p=paths[cursor++],bytes=await fetchFile(p,'/assets/skins/'+p);source.files[p]={sha:index.get(p),bytes:bytes.length};}}));
source.skins.push(...added);for(const s of unavailable)if(!source.unavailable.some(v=>v.sourceId===s.sourceId))source.unavailable.push(s);
source.unavailable=source.unavailable.filter(v=>!source.skins.some(s=>s.sourceId===v.sourceId));
source.expansion.noNonDefaultSkin=[];
source.rhodesBand={noNonDefaultSkin:['char_1015_aglna2'],batch:'rhodes-mujica-v1',version:'ri-mujica-test-2',skins:source.skins.filter(s=>operators.has(s.charId)).map(s=>s.id),arkModels:comparison.arkModels};
await fs.writeFile(sourceFile,JSON.stringify(source,null,2)+'\n');
await fetchSkins({root,offline:true});
let previous={};try{previous=JSON.parse(await fs.readFile(path.join(root,'tools/assets/rhodes-band-skins-audit.json'),'utf8'));}catch{}
const union=(a,b,key)=>[...new Map([...a,...b].map(v=>[v[key],v])).values()];
await fs.writeFile(path.join(root,'tools/assets/rhodes-band-skins-audit.json'),JSON.stringify({repository:source.repository,commit,batch:'rhodes-mujica-v1',arkModels:comparison.arkModels,operators:[...operators].map(charId=>({charId,skins:source.skins.filter(s=>s.charId===charId).map(s=>s.id),officialSkins:Object.values(skinTable.charSkins).filter(s=>s.charId===charId&&s.displaySkin?.skinName&&s.skinId.startsWith(charId+'@')).length})),added:union(previous.added||[],added,'id'),unavailable,audit,proof:union(previous.proof||[],proof,'source')},null,2)+'\n');
console.log(JSON.stringify({added:added.length,files:proof.length,unavailable},null,2));
