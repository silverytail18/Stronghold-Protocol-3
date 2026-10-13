// Pinned artwork only. Reads the existing repository index; writes only this isolated runtime.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {OVERLAY} from '../server/sim/content/rhine/records.js';
import {atlasInfo,normalizeAtlas} from './assets/atlas.mjs';
import {parseSkel} from './assets/skel.mjs';
import {resolveRoles} from './assets/anim-roles.mjs';
const root=path.resolve(import.meta.dirname,'..'),source=path.resolve(process.argv[2]);
const {commit,repository}=JSON.parse(await fs.readFile(path.join(root,'tools/assets/skins-source.json'),'utf8'));
const repo=path.join(source,'.cache/skins/repository');
const tree=execFileSync('git',['-c','safe.directory='+repo.replaceAll('\\','/'),'-C',repo,'ls-tree','-r',commit],{encoding:'utf8',maxBuffer:64e6,windowsHide:true});
const index=new Map(tree.trim().split('\n').map(l=>{const m=/^\d+ blob (\w+)\t(.+)$/.exec(l);return m?[m[2],m[1]]:null;}).filter(Boolean));
const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),sha=b=>createHash('sha256').update(b).digest('hex');
const assets={chars:{},tokens:{},skills:{},skillsById:{},modules:{}},proof=[];
async function obtain(remote,url){
 if(!index.has(remote)||remote.includes('..')||url.includes('..'))throw Error('Unpinned asset '+remote);
 const dest=path.join(root,'public',url);let bytes;
 try{const b=await fs.readFile(dest);if(blob(b)===index.get(remote))bytes=b;}catch{}
 if(!bytes)for(let attempt=0;attempt<4;attempt++){
  try{const host=attempt%2?'https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@'+commit:'https://raw.githubusercontent.com/fexli/ArknightsResource/'+commit;await fs.mkdir(path.dirname(dest),{recursive:true});const quote=v=>"'"+v.replaceAll("'","''")+"'";execFileSync('pwsh',['-NoProfile','-NonInteractive','-Command','Invoke-WebRequest -Uri '+quote(host+'/'+remote)+' -OutFile '+quote(dest)+' -TimeoutSec 25'],{windowsHide:true,timeout:30000,stdio:'pipe'});bytes=await fs.readFile(dest);break;}catch(e){if(attempt===3)throw Error('Download failed '+remote,{cause:e});}
 }
 if(blob(bytes)!==index.get(remote))throw Error('Checksum mismatch '+remote);
 await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);proof.push({remote,url,gitBlob:index.get(remote),sha256:sha(bytes),bytes:bytes.length});return bytes;
}
async function model(id,side,prefix){
 const basename=index.has(prefix+id+'.atlas')?id:[...index.keys()].find(k=>k.startsWith(prefix)&&k.endsWith('.atlas'))?.slice(prefix.length,-6);if(!basename)throw Error('Missing model '+prefix);
 const local=`/assets/rhine/spine/${id}/${side}/`,atlas=await obtain(prefix+basename+'.atlas',local+id+'.atlas'),info=atlasInfo(atlas.toString()),sizes=new Map(),textures=[];
 for(const p of info.pages){const name=typeof p==='string'?p:p.name,b=await obtain(prefix+name,local+name);sizes.set(name,{width:b.readUInt32BE(16),height:b.readUInt32BE(20)});textures.push(local+name);}
 const norm=normalizeAtlas(atlas.toString(),{pageSize:n=>sizes.get(n)}),normalized=Buffer.from(typeof norm==='string'?norm:norm.text);await fs.writeFile(path.join(root,'public',local+id+'.atlas'),normalized);Object.assign(proof.find(p=>p.url===local+id+'.atlas'),{deliveredSha256:sha(normalized),normalization:'normalizeAtlas explicit PNG dimensions'});
 const skel=await obtain(prefix+basename+'.skel',local+id+'.skel'),meta=parseSkel(skel,info.regions);if(meta.missingRegions.length)throw Error('Incomplete '+id);
 return {skel:local+id+'.skel',atlas:local+id+'.atlas',textures,pma:false,anims:resolveRoles(meta.animations,{skillIndices:[0,1,2],durations:meta.durations}),animations:meta.durations,events:meta.events,hits:meta.hits,bounds:meta.bounds};
}
const ops=Object.values(OVERLAY.chess).filter(c=>!c.isGolden);let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<ops.length){const c=ops[cursor++],id=c.charId,entry={spine:{}};
 for(const[key,suffix]of [['avatar',''],['avatarE2','_2']]){const remote=`avatar/ASSISTANT/${id}${suffix}.png`;entry[key]=`/assets/rhine/char/avatar/${id}${suffix}.png`;await obtain(index.has(remote)?remote:`avatar/ASSISTANT/${id}.png`,entry[key]);}
 for(const[key,suffix]of [['portrait','_1'],['portraitE2','_2']]){const remote=`charpor/${id}${suffix}.png`;entry[key]=`/assets/rhine/char/portrait/${id}${suffix}.png`;await obtain(index.has(remote)?remote:`charpor/${id}_1.png`,entry[key]);}
 for(const side of ['front','back'])entry.spine[side]=await model(id,side,`spine/${id}/${id}/${side==='front'?'Front':'Back'}/`);
 assets.chars[id]=entry;
 for(const s of c.skills){const url='/assets/rhine/skill/'+s.skillId+'.png';await obtain('skills/skill_icon_'+s.iconId+'.png',url);assets.skills[s.skillId]=url;assets.skillsById[s.skillId]=s.skillId;}
 for(const m of OVERLAY.chess[c.goldenId].modules){const url='/assets/rhine/module/'+m.uniEquipId+'.png';await obtain('equip/'+m.uniEquipId+'.png',url);assets.modules[m.uniEquipId]=url;}
 console.log('Verified operator '+c.name);
}}));
for(const t of Object.values(OVERLAY.tokens)){
 const id=t.tokenId,owner=OVERLAY.chess[t.owners[0]].charId,entries=[...index.keys()].filter(p=>p.startsWith('spine/'+id+'/')&&p.endsWith('.atlas'));
 // ASSETS.md token fallback: the verified native skin variant, explicitly identified in the manifest.
 const p=entries.find(p=>p.includes('/'+id+'/Spine/'))||entries[0];if(!p)throw Error('Missing native token '+id);
 const entry={owner,spineVariant:p.split('/')[2],spine:await model(id,'native',p.slice(0,p.lastIndexOf('/')+1))};
 const avatar='avatar/ASSISTANT/'+id+'.png';if(index.has(avatar)){entry.avatar='/assets/rhine/token/'+id+'.png';await obtain(avatar,entry.avatar);}
 assets.tokens[id]=entry;console.log('Verified token '+id);
}
await fs.writeFile(path.join(root,'server/sim/content/rhine/assets.js'),'// Verified pinned original artwork; see docs/RHINE-ASSETS.json.\nexport const ASSETS='+JSON.stringify(assets,null,2)+';\n');
await fs.writeFile(path.join(root,'docs/RHINE-ASSETS.json'),JSON.stringify({repository,commit,proof},null,2)+'\n');
console.log(JSON.stringify({operators:ops.length,tokens:Object.keys(assets.tokens).length,files:proof.length}));
