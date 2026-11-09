import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {hashFile,resourceManifest} from './client-resources.mjs';
import {CLIENT_LINE,CLIENT_BUILD,RESOURCE_EPOCH,RESOURCE_CONTRACT} from '../shared/client-resources.js';
import {digest} from '../server/product/resource-updates.js';
import {writeResourceZip} from './resource-zip.mjs';
import {normalizeApkPaths} from './normalize-apk-paths.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OLD=path.resolve(ROOT,'../Stronghold-Protocol-3');
function run(command,args,env=process.env){const result=spawnSync(command,args,{cwd:ROOT,env,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});if(result.status!==0)throw Error(path.basename(command)+': '+(result.stderr||result.stdout||result.error));return result.stdout;}
async function list(directory,extension){const found=[];for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())found.push(...await list(file,extension));else if(entry.name.endsWith(extension))found.push(file);}return found;}
export async function generateNativePins(hash,root=ROOT){
 if(!/^[a-f0-9]{64}$/.test(hash))throw Error('Invalid resource manifest digest');
 const pem=await fs.readFile(path.join(root,'mobile/resource-update-public.pem'),'utf8');
 const base64=pem.replace(/-----[^-]+-----|\s/g,'');
 const java=path.join(root,'mobile/android/app/src/main/java/io/stronghold/protocol/ResourceBuild.java');
 await fs.writeFile(java,'package io.stronghold.protocol;\nfinal class ResourceBuild {static final int CONTRACT='+RESOURCE_CONTRACT+';static final int BUILD='+CLIENT_BUILD+';static final int EPOCH='+RESOURCE_EPOCH+';static final String CLIENT_LINE='+JSON.stringify(CLIENT_LINE)+';static final String MANIFEST_HASH="'+hash+'";static final String PUBLIC_KEY="'+base64+'";}\n');
 await fs.writeFile(path.join(root,'mobile/windows/ResourceBuild.cs'),'namespace Stronghold.Protocol;\nstatic class ResourceBuild {internal const int Contract='+RESOURCE_CONTRACT+';internal const int Build='+CLIENT_BUILD+';internal const int Epoch='+RESOURCE_EPOCH+';internal const string ClientLine='+JSON.stringify(CLIENT_LINE)+';internal const string ManifestHash="'+hash+'";internal const string PublicKey="'+pem.replace(/\r/g,'').replace(/\n/g,'\\n')+'";}\n');
}
export async function buildResources(){const manifest=await resourceManifest(),bytes=Buffer.from(JSON.stringify(manifest)),hash=digest(bytes);const directory=path.join(ROOT,'mobile/resource-packs',hash);await fs.mkdir(directory,{recursive:true});
 const manifestFile=path.join(directory,'resources.json');try{await fs.writeFile(manifestFile,bytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST'||digest(await fs.readFile(manifestFile))!==hash)throw e;}
 const zip=path.join(directory,'resource-pack.zip');try{await fs.access(zip);}catch(e){if(e.code!=='ENOENT')throw e;const unique=new Map(manifest.files.map(f=>[f.sha256,f]));await writeResourceZip(zip,[...unique].map(([sha,file])=>['blobs/'+sha,()=>fs.readFile(path.join(ROOT,file.path.startsWith('/data/')?'':'public',file.path))]));}
 await generateNativePins(hash);return{directory,hash,files:manifest.files.length};}
export async function buildAndroid(resources,{debug=false,outputDirectory=path.join(ROOT,'mobile/full-dist'),outputName=null}={}){
 const version=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8')).version;
 const sdk=process.env.ANDROID_HOME||path.join(OLD,'.cache/android-sdk'),bt=path.join(sdk,'build-tools/35.0.0'),platform=path.join(sdk,'platforms/android-35/android.jar');
 const cache=path.join(ROOT,'.cache');await fs.mkdir(cache,{recursive:true});const work=await fs.mkdtemp(path.join(cache,'native-android-'));
 // Source signing files are read-only inputs. Never create a replacement app signer.
 const signing=process.env.SP_ANDROID_SIGNING||path.join(OLD,'mobile/android/.signing'),credentials=JSON.parse(await fs.readFile(path.join(signing,'credentials.json'),'utf8'));
 if(typeof credentials.password!=='string'||!/^[a-f0-9]{64}$/.test(credentials.password))throw Error('Invalid existing signing credentials');
 const env={...process.env,SP_ANDROID_KEY_PASS:credentials.password};const assets=path.join(work,'assets'),generated=path.join(work,'generated'),classes=path.join(work,'classes'),dex=path.join(work,'dex');for(const dir of [assets,generated,classes,dex])await fs.mkdir(dir);
 await fs.copyFile(path.join(resources.directory,'resources.json'),path.join(assets,'resources.json'));await fs.copyFile(path.join(resources.directory,'resource-pack.zip'),path.join(assets,'resource-pack.zip'));
 for(const name of ['LICENSE','NOTICE.md','THIRD-PARTY-NOTICES.md'])await fs.copyFile(path.join(ROOT,name),path.join(assets,name));
 const source=path.join(ROOT,'mobile/android/app/src/main'),manifest=path.join(work,'AndroidManifest.xml');let xml=await fs.readFile(path.join(source,'AndroidManifest.xml'),'utf8');if(debug)xml=xml.replace('<application ','<application android:debuggable="true" ');await fs.writeFile(manifest,xml);
 const unsigned=path.join(work,'unsigned.apk'),aligned=path.join(work,'aligned.apk'),signed=path.join(work,'signed.apk');
 const aapt2=spawnSync(path.join(bt,'aapt2.exe'),['compile','--dir',path.join(source,'res'),'-o',path.join(work,'resources.zip')],{cwd:ROOT,env:process.env,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
 if(aapt2.status===0)run(path.join(bt,'aapt2.exe'),['link','-o',unsigned,'--manifest',manifest,'-I',platform,'--java',generated,'--min-sdk-version','26','--target-sdk-version','35','--version-code',String(CLIENT_BUILD),'--version-name',version,'-0','zip','-A',assets,path.join(work,'resources.zip')]);
 else if(aapt2.status===3221225794)run(path.join(bt,'aapt.exe'),['package','-f','-m','-J',generated,'-M',manifest,'-S',path.join(source,'res'),'-I',platform,'--min-sdk-version','26','--target-sdk-version','35','--version-code',String(CLIENT_BUILD),'--version-name',version,'-0','zip','-A',assets,'-F',unsigned]);
 else throw Error('aapt2 compile failed: '+(aapt2.stderr||aapt2.stdout||aapt2.error?.message||'exit '+aapt2.status));
 run('javac',['-encoding','UTF-8','--release','8','-classpath',platform,'-d',classes,...await list(path.join(source,'java'),'.java'),...await list(generated,'.java')]);
 run('java',['-cp',path.join(bt,'lib/d8.jar'),'com.android.tools.r8.D8','--release','--min-api','26','--lib',platform,'--output',dex,...await list(classes,'.class')]);run('jar',['uf',unsigned,'-C',dex,'classes.dex']);await normalizeApkPaths(unsigned);run(path.join(bt,'zipalign.exe'),['-f','4',unsigned,aligned]);
 run('java',['-jar',path.join(bt,'lib/apksigner.jar'),'sign','--ks',path.join(signing,'release.p12'),'--ks-key-alias','stronghold','--ks-pass','env:SP_ANDROID_KEY_PASS','--key-pass','env:SP_ANDROID_KEY_PASS','--out',signed,aligned],env);
 const verification=run('java',['-jar',path.join(bt,'lib/apksigner.jar'),'verify','--verbose','--print-certs',signed]);run(path.join(bt,'zipalign.exe'),['-c','4',signed]);
 const out=outputDirectory,name=outputName||`stronghold-protocol-v${version}-full-android`+(debug?'-test':'')+'.apk';if(path.basename(name)!==name||!name.endsWith('.apk'))throw Error('Invalid output name');await fs.mkdir(out,{recursive:true});const file=path.join(out,name);await fs.copyFile(signed,file,1);const sha=await hashFile(file);await fs.writeFile(file+'.sha256',sha+'  '+name+'\n',{flag:'wx'});await fs.writeFile(file+'.verify.txt',verification,{flag:'wx'});return {file,sha256:sha,bytes:(await fs.stat(file)).size,work};
}
export async function buildWindows(resources,{outputName=null}={}){const version=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8')).version;const selectedName=outputName||`stronghold-protocol-v${version}-full-windows-x64`;if(!/^[a-z0-9.-]+$/.test(selectedName))throw Error("Invalid Windows output name");const work=await fs.mkdtemp(path.join(ROOT,'.cache/native-windows-'));run('C:/Program Files/dotnet/dotnet.exe',['publish','mobile/windows/Stronghold.Protocol.csproj','-c','Release','-r','win-x64','--self-contained','true','-m:1','-p:PublishSingleFile=true','-o',work]);for(const name of ['resources.json','resource-pack.zip'])await fs.copyFile(path.join(resources.directory,name),path.join(work,name));const directory=path.join(ROOT,'mobile/full-dist',selectedName);await fs.mkdir(path.dirname(directory),{recursive:true});await fs.cp(work,directory,{recursive:true,errorOnExist:true,force:false});return{directory,resourceHash:resources.hash};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const command=process.argv[2];if(command==='pins'){await generateNativePins(process.argv[3]);}
 else{const resources=await buildResources();if(command==='resources')console.log(resources);else if(command==='android')console.log(await buildAndroid(resources,{debug:process.argv.includes('--test-host'),outputName:process.argv.find(a=>a.startsWith('--output-name='))?.slice(14)||null}));else if(command==='windows')console.log(await buildWindows(resources,{outputName:process.argv.find(a=>a.startsWith('--output-name='))?.slice(14)||null}));else throw Error('resources|android|windows|pins <hash>');}
}
