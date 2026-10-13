// Download only the pinned operator skins listed in skins-source.json. Never runs upstream code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {processModels} from './assets/spine.mjs';
import {contentHash,totalBytes} from './assets/manifest.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function fetchSkins({root=ROOT,offline=false}={}) {
  const source=JSON.parse(await fs.readFile(path.join(root,'tools/assets/skins-source.json'),'utf8'));
  if(source.repository!=='https://github.com/fexli/ArknightsResource'||!/^[a-f0-9]{40}$/.test(source.commit))throw Error('Invalid skin source');
  const repo=path.join(root,'.cache/skins/repository'),assets=path.join(root,'public/assets');
  const git=(args,input)=>{const r=spawnSync('git',['-c','safe.directory='+repo.replaceAll('\\','/'),...args],{cwd:repo,input,encoding:'utf8',maxBuffer:8*1024*1024,windowsHide:true});if(r.status!==0)throw Error(r.stderr||r.stdout);return r.stdout;};
  const paths=Object.keys(source.files);
  for(const p of paths)if(!/^(avatar|charpor|charpack|spine)\/[A-Za-z0-9_./-]+$/.test(p)||p.split('/').some(s=>s==='..'||s==='.'))throw Error('Unsafe skin path');
  if(!offline){
    await fs.mkdir(repo,{recursive:true});
    try{await fs.access(path.join(repo,'.git'));}catch{
      git(['init']);git(['remote','add','origin',source.repository+'.git']);
      git(['config','remote.origin.promisor','true']);git(['config','remote.origin.partialclonefilter','blob:none']);
    }
    git(['config','core.autocrlf','false']);
    git(['fetch','--depth=1','--filter=blob:none','origin',source.commit]);
    git(['sparse-checkout','set','--no-cone','--stdin'],paths.map(p=>'/'+p).join('\n')+'\n');
    console.log('[skins] Checking out pinned assets (first download only)…');
    git(['checkout','--detach',source.commit]);
    git(['checkout-index','--force','--all']);
    // Read Git blobs directly: upstream .gitattributes can impose Windows EOL conversion even with autocrlf off.
    const batch=spawnSync('git',['-c','safe.directory='+repo.replaceAll('\\','/'),'cat-file','--batch'],{cwd:repo,input:paths.map(p=>source.files[p].sha).join('\n')+'\n',maxBuffer:512*1024*1024,windowsHide:true});
    if(batch.status!==0)throw Error(batch.stderr.toString());
    let copied=0,offset=0;
    for(const p of paths){
      const end=batch.stdout.indexOf(10,offset),header=batch.stdout.subarray(offset,end).toString().split(' ');
      if(header[0]!==source.files[p].sha||header[1]!=='blob')throw Error('Missing skin blob: '+p);
      const size=Number(header[2]),bytes=batch.stdout.subarray(end+1,end+1+size);offset=end+size+2;
      const hash=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      if(hash!==source.files[p].sha)throw Error('Skin blob checksum mismatch: '+p);
      const dest=path.join(assets,'skins',p);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);copied++;
    }
    console.log('[skins] Verified and copied '+copied+' files');
  }
  const models=new Map();
  const add=(key,files,skillIndices)=>{
    const skel=files.find(p=>p.endsWith('.skel')),atlas=files.find(p=>p.endsWith('.atlas'));
    const job=p=>({rel:'skins/'+p,urls:[],kind:path.extname(p).slice(1)});
    models.set(key,{key,dir:path.posix.dirname('skins/'+skel)+'/',skel:job(skel),atlas:job(atlas),pngs:files.filter(p=>p.endsWith('.png')).map(job),pma:false,skillIndices});
  };
  for(const s of source.skins){for(const [face,files] of Object.entries(s.spine))add(s.id+':'+face,files,[0,1,2]);for(const t of s.tokens)add(t.id,t.spine,[0,1,2]);}
  const parsed=await processModels(models,{root:assets,download:false,cachePath:path.join(root,'.cache/skins/spine-info.json')});
  if(parsed.entries.size!==models.size||parsed.problems.length)throw Error('Incomplete/invalid skin models: '+parsed.problems.join('\n'));
  const manifestFile=path.join(root,'data/assets.json');
  const manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));
  const skinModels={};
  for(const s of source.skins){
    for(const p of [s.avatar,s.portrait])await fs.access(path.join(assets,'skins',p));
    skinModels[s.id]={charId:s.charId,name:s.name,brand:s.brand,sort:s.sort,sourceId:s.sourceId,avatar:'/assets/skins/'+s.avatar,portrait:'/assets/skins/'+s.portrait,...(s.portraitKind?{portraitKind:s.portraitKind}:{}),...(s.frontOnly?{frontOnly:true}:{}),spine:{front:parsed.entries.get(s.id+':front'),back:parsed.entries.get(s.id+':back')},tokens:Object.fromEntries(s.tokens.map(t=>[t.tokenId,t.id]))};
    for(const t of s.tokens){
      const entry=structuredClone(parsed.entries.get(t.id));
      if(t.animationSuffix){
        const remap=value=>typeof value==='string'&&Object.hasOwn(entry.animations,value+t.animationSuffix)?value+t.animationSuffix:Array.isArray(value)?value.map(remap):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,val])=>[key,remap(val)])):value;
        entry.anims=remap(entry.anims);
        if(!entry.anims.idle?.endsWith(t.animationSuffix)||!entry.anims.attack?.loop?.endsWith(t.animationSuffix))throw Error('缺高级召唤动画：'+t.id);
      }
      skinModels[t.id]={tokenId:t.tokenId,avatar:'/assets/skins/'+s.avatar,spine:{front:entry}};
    }
  }
  manifest.skinModels=skinModels;
  manifest.skinSource={repository:source.repository,commit:source.commit,skins:source.skins.length,operators:new Set(source.skins.map(s=>s.charId)).size,unavailable:source.unavailable,...(source.comparison?{comparison:source.comparison}:{}),...(source.expansion?{expansion:source.expansion}:{}),...(source.rhodesBand?{rhodesBand:source.rhodesBand}:{})};
  const referenced=new Set();
  const collect=v=>{if(typeof v==='string'&&v.startsWith('/assets/'))referenced.add(v.slice(8));else if(v&&typeof v==='object')Object.values(v).forEach(collect);};collect(manifest);
  manifest.stats={...manifest.stats,files:referenced.size,bytes:totalBytes(assets,referenced),skins:source.skins.length,spineModels:new Set([...Object.values(manifest.chars||{}).flatMap(c=>Object.values(c.spine||{})),...Object.values(manifest.enemies||{}).map(e=>e.spine),...Object.values(manifest.tokens||{}).map(t=>t.spine),...Object.values(skinModels).flatMap(c=>Object.values(c.spine||{}))].filter(Boolean).map(s=>s.skel)).size};
  const {hash,stats,generator,version,...body}=manifest;manifest.hash=contentHash(body);
  await fs.writeFile(manifestFile+'.tmp',JSON.stringify(manifest)+'\n');await fs.rename(manifestFile+'.tmp',manifestFile);
  console.log('[skins] Published '+source.skins.length+' skins; incomplete upstream skins: '+source.unavailable.length);
  return manifest.skinSource;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)fetchSkins({offline:process.argv.includes('--offline')}).catch(e=>{console.error(e);process.exitCode=1;});
