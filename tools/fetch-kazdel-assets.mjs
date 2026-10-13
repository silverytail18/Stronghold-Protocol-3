import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {OVERLAY} from '../server/sim/content/kazdel/records.js';
import {atlasInfo,normalizeAtlas} from './assets/atlas.mjs';
import {parseSkel} from './assets/skel.mjs';
import {resolveRoles} from './assets/anim-roles.mjs';
const root=path.resolve(import.meta.dirname,'..'),source=path.resolve(process.argv[2]);
const {commit,repository}=JSON.parse(await fs.readFile(path.join(root,'tools/assets/skins-source.json'),'utf8'));
const repo=path.join(source,'.cache/skins/repository');
const tree=execFileSync((process.env.KAZDEL_GIT||'git'),['-c','safe.directory='+repo.replaceAll('\\','/'),'-C',repo,'ls-tree','-r',commit],{encoding:'utf8',maxBuffer:64e6,windowsHide:true});
const index=new Map(tree.trim().split('\n').map(l=>{const m=/^\d+ blob (\w+)\t(.+)$/.exec(l);return m?[m[2],m[1]]:null;}).filter(Boolean));
const gitHash=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const a=structuredClone((await import('../server/sim/content/kazdel/assets.js')).ASSETS),proof=(JSON.parse(await fs.readFile(path.join(root,'docs/KAZDEL-ASSETS.json'),'utf8'))).proof.filter(p=>!p.remote.includes('chimes'));delete a.chars.char_4083_chimes;
async function obtain(remote,url){
 if(!index.has(remote)||remote.includes('..')||url.includes('..'))throw Error('Unpinned path '+remote);
 const dest=path.join(root,'public',url);let bytes;
 try{const b=await fs.readFile(dest);if(gitHash(b)===index.get(remote))bytes=b;}catch{}
 if(!bytes)try{const b=await fs.readFile(path.join(source,'.cache/rhodes-band/art',remote));if(gitHash(b)===index.get(remote))bytes=b;}catch{}
 if(!bytes)for(let attempt=0;attempt<4;attempt++){try{const host=attempt%2?'https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@'+commit:'https://raw.githubusercontent.com/fexli/ArknightsResource/'+commit;const r=await fetch(host+'/'+remote,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(String(r.status));bytes=Buffer.from(await r.arrayBuffer());break;}catch(e){if(attempt===3)throw Error('Asset fetch failed '+remote,{cause:e});}}
 if(gitHash(bytes)!==index.get(remote))throw Error('Asset checksum mismatch '+remote);
 await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);proof.push({remote,url,gitBlob:index.get(remote),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});return bytes;
}
const ops=Object.values(OVERLAY.chess).filter(c=>!c.isGolden&&(!process.argv[3]||c.charId===process.argv[3]));let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<ops.length){const c=ops[cursor++],id=c.charId,entry={spine:{}};
 for(const [key,suffix]of [['avatar',''],['avatarE2','_2']]){const remote='avatar/ASSISTANT/'+id+suffix+'.png',fallback='avatar/ASSISTANT/'+id+'.png';entry[key]='/assets/kazdel/char/avatar/'+id+suffix+'.png';await obtain(index.has(remote)?remote:fallback,entry[key]);}
 for(const [key,suffix]of [['portrait','_1'],['portraitE2','_2']]){const remote='charpor/'+id+suffix+'.png',fallback='charpor/'+id+'_1.png';entry[key]='/assets/kazdel/char/portrait/'+id+suffix+'.png';await obtain(index.has(remote)?remote:fallback,entry[key]);}
 for(const side of ['front','back']){const prefix=`spine/${id}/${id}/${side==='front'?'Front':'Back'}/`,local=`/assets/kazdel/spine/op/${id}/${side}/`;
  const atlas=await obtain(prefix+id+'.atlas',local+id+'.atlas'),info=atlasInfo(atlas.toString()),sizes=new Map(),textures=[];
  for(const p of info.pages){const name=typeof p==='string'?p:p.name,b=await obtain(prefix+name,local+name);sizes.set(name,{width:b.readUInt32BE(16),height:b.readUInt32BE(20)});textures.push(local+name);}
  const norm=normalizeAtlas(atlas.toString(),{pageSize:n=>sizes.get(n)}),normalized=Buffer.from(typeof norm==='string'?norm:norm.text);await fs.writeFile(path.join(root,'public',local+id+'.atlas'),normalized);
  Object.assign(proof.find(p=>p.url===local+id+'.atlas'),{deliveredSha256:createHash('sha256').update(normalized).digest('hex'),deliveredBytes:normalized.length,normalization:'tools/assets/atlas.mjs normalizeAtlas: explicit PNG page sizes and standard atlas fields'});
  const skel=await obtain(prefix+id+'.skel',local+id+'.skel'),meta=parseSkel(skel,info.regions);if(meta.missingRegions.length)throw Error('Incomplete model '+id);
  entry.spine[side]={skel:local+id+'.skel',atlas:local+id+'.atlas',textures,pma:false,anims:resolveRoles(meta.animations,{skillIndices:c.skills.map(s=>s.index),durations:meta.durations}),animations:meta.durations,events:meta.events,hits:meta.hits,bounds:meta.bounds};
 }
 a.chars[id]=entry;
 for(const s of c.skills){const icon='/assets/kazdel/skill/'+s.iconId.replaceAll('[','_').replaceAll(']','')+'.png';await obtain('skills/skill_icon_'+s.iconId+'.png',icon);a.skills[s.iconId]=icon;a.skills[s.skillId]=icon;a.skillsById[s.skillId]=s.iconId;}
 for(const m of OVERLAY.chess[c.goldenId]?.modules||[]){const icon='/assets/kazdel/module/'+m.uniEquipId+'.png';await obtain('equip/'+m.uniEquipId+'.png',icon);a.modules[m.uniEquipId]=icon;}
 console.log('Verified native assets: '+c.name);
}}));
await fs.writeFile(path.join(root,'server/sim/content/kazdel/assets.js'),'// Verified pinned original assets; see docs/KAZDEL-ASSETS.json.\nexport const ASSETS='+JSON.stringify(a,null,2)+';\n');
await fs.mkdir(path.join(root,'docs'),{recursive:true});await fs.writeFile(path.join(root,'docs/KAZDEL-ASSETS.json'),JSON.stringify({repository,commit,proof},null,2));
console.log(JSON.stringify({operators:ops.length,files:proof.length}));
