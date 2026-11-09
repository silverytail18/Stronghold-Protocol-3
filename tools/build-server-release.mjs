import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {hashFile} from './client-resources.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_DIRS=['server','shared','data','public','tools','scripts','types','docs','test','packs','product-plugins','mobile'];
const ROOT_FILES=['package.json','package-lock.json','LICENSE','NOTICE.md','THIRD-PARTY-NOTICES.md','CONTRIBUTING.md','README.md','CHANGELOG.md','AGENTS.md','eslint.config.js','jsconfig.json','ci-shards.json'];
const text=/\.(?:js|mjs|cjs|ts|json|css|html|md|txt|xml|yml|yaml|sh|ps1|bat|cmd|wasm|java|cs|csproj|gradle|properties|py|manifest)$/i;
const excluded=name=>name.split('/').some(part=>part.startsWith('.')||['node_modules','bin','obj','__pycache__'].includes(part))||/^public\/(?:assets|fonts|icons)(?:\/|$)/.test(name)||/^(?:mobile\/(?:full-dist|resource-packs|dist|offline-dist)|test\/(?:browser-profile|artifacts))(?:\/|$)/.test(name)||/\b(?:auth-users|operator-loadouts)\.json$/.test(name)||/\.(?:sqlite|p12|jks|keystore)$/i.test(name);
export async function releaseInputs(root=ROOT){const result=[];async function walk(directory,relative){let entries;try{entries=await fs.readdir(directory,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}for(const entry of entries){const name=relative+'/'+entry.name;if(excluded(name))continue;if(entry.isSymbolicLink())throw Error('Release input is a symlink: '+name);if(entry.isDirectory())await walk(path.join(directory,entry.name),name);else if(entry.isFile()&&text.test(name))result.push(name);}}
 for(const dir of SOURCE_DIRS)await walk(path.join(root,dir),dir);for(const name of ROOT_FILES){try{await fs.access(path.join(root,name));result.push(name);}catch(e){if(e.code!=='ENOENT')throw e;}}
 result.push('mobile/resource-update-public.pem');await walk(path.join(root,'client-updates'),'client-updates');
 return [...new Set(result)].sort();}
export async function buildServerRelease({root=ROOT,output=path.resolve(root,'../release-packages'),name='Stronghold-Protocol-3-server-light-v1.0.0-20261104'}={}){
 if(!/^[A-Za-z0-9_.-]+$/.test(name))throw Error('Invalid release name');await fs.mkdir(output,{recursive:true});const archive=path.join(output,name+'.tar.gz');try{await fs.access(archive);throw Error('Release already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version,inputs=await releaseInputs(root),files=[];
 const cache=path.join(root,'.cache');await fs.mkdir(cache,{recursive:true});const work=await fs.mkdtemp(path.join(cache,'server-release-')),stage=path.join(work,'Stronghold-Protocol-3');await fs.mkdir(stage);
 for(const relative of inputs){const source=path.join(root,relative),destination=path.join(stage,relative),stat=await fs.stat(source),sha256=await hashFile(source);files.push({path:relative,size:stat.size,sha256});await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(source,destination,1);if(await hashFile(destination)!==sha256)throw Error('Source changed during staging: '+relative);}
 const manifest={format:1,version,upstream:'bfd2a9209b3a42545acb757e0f6e51052d8694ff',createdAt:new Date().toISOString(),files};await fs.writeFile(path.join(stage,'SERVER-RELEASE.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
 const tar=spawnSync('tar',['-czf',archive,'-C',work,'Stronghold-Protocol-3'],{windowsHide:true,encoding:'utf8',maxBuffer:1024*1024});if(tar.status!==0)throw Error('tar failed: '+(tar.stderr||tar.error));
 const sha256=await hashFile(archive),bytes=(await fs.stat(archive)).size;await fs.writeFile(archive+'.sha256',sha256+'  '+path.basename(archive)+'\n',{flag:'wx'});await fs.writeFile(archive+'.manifest.json',JSON.stringify({...manifest,archive:{file:path.basename(archive),bytes,sha256}},null,2)+'\n',{flag:'wx'});
 for(const row of files)if(await hashFile(path.join(root,row.path))!==row.sha256)throw Error('Release inputs changed during archive build');
 return{archive,sha256,bytes,files:files.length,stage,work};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(await buildServerRelease());
