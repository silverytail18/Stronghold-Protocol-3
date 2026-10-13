// Independent offline APK; does not generate/replace signing keys, online APKs or cloud state.
import fs from 'node:fs/promises';
import {existsSync,createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildOfflineWeb} from './build-offline-web.mjs';
import {normalizeApkPaths} from './normalize-apk-paths.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cache=path.join(root,'.cache'),android=path.join(root,'mobile/android');
const source=path.join(root,'mobile/android-offline/app/src/main');
const win=process.platform==='win32';
const offlineRevision=3,versionCode=3;
const args=process.argv.slice(2);let sdkArgument;
for(let i=0;i<args.length;i++){if(args[i]==='--sdk'&&args[i+1])sdkArgument=args[++i];else throw new Error('用法：node tools/build-android-offline.mjs [--sdk <SDK 路径>]');}
const sdk=path.resolve(sdkArgument||process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||path.join(cache,'android-sdk'));
const buildTools=path.join(sdk,'build-tools/35.0.0'),platform=path.join(sdk,'platforms/android-35/android.jar');
const tool=n=>path.join(buildTools,n+(win?'.exe':''));
const java=n=>{const p=process.env.JAVA_HOME&&path.join(process.env.JAVA_HOME,'bin',n+(win?'.exe':''));return p&&existsSync(p)?p:n;};
function run(command,args,env=process.env){const r=spawnSync(command,args,{cwd:root,env,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});if(r.status!==0)throw new Error(path.basename(command)+' 执行失败：'+(r.error?.message||r.stderr||r.stdout));if(r.stderr.trim())process.stderr.write(r.stderr);return r.stdout;}
async function files(dir,ext){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await files(p,ext));else if(e.name.endsWith(ext))out.push(p);}return out;}
async function build(){
  for(const file of [platform,tool('aapt2'),tool('zipalign'),path.join(buildTools,'lib/d8.jar'),path.join(buildTools,'lib/apksigner.jar')])await fs.access(file);
  const signing=path.join(android,'.signing');
  const key=path.join(signing,'release.p12');
  await fs.access(key);
  const credentials=JSON.parse(await fs.readFile(path.join(signing,'credentials.json'),'utf8'));
  if(typeof credentials.password!=='string'||!/^[a-f0-9]{64}$/.test(credentials.password))throw new Error('请恢复现有签名备份；单机构建不会生成或更换密钥');
  const signingEnv={...process.env,SP_ANDROID_KEY_PASS:credentials.password};
  await fs.mkdir(cache,{recursive:true});const work=await fs.mkdtemp(path.join(cache,'android-offline-build-'));
  try{
    const generated=path.join(work,'generated'),classes=path.join(work,'classes'),dex=path.join(work,'dex'),assets=path.join(work,'assets');
    for(const dir of [generated,classes,dex,assets])await fs.mkdir(dir);
    const {inventory}=await buildOfflineWeb({root,output:path.join(assets,'web')});
    const manifest=path.join(work,'AndroidManifest.xml');
    await fs.writeFile(manifest,(await fs.readFile(path.join(source,'AndroidManifest.xml'),'utf8')).replace('<manifest ','<manifest package="io.stronghold.protocol.offline" '));
    const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version+'-offline.'+offlineRevision;
    const unsigned=path.join(work,'unsigned.apk');
    run(tool('aapt2'),['compile','--dir',path.join(android,'app/src/main/res'),'-o',path.join(work,'resources.zip')]);
    run(tool('aapt2'),['link','-o',unsigned,'--manifest',manifest,'-I',platform,'--java',generated,'--min-sdk-version','26','--target-sdk-version','35','--version-code',String(versionCode),'--version-name',version,'-A',assets,path.join(work,'resources.zip')]);
    await normalizeApkPaths(unsigned);
    run(java('javac'),['-encoding','UTF-8','-Xlint:-options','--release','8','-classpath',platform,'-d',classes,...await files(path.join(source,'java'),'.java'),...await files(generated,'.java')]);
    run(java('java'),['-cp',path.join(buildTools,'lib/d8.jar'),'com.android.tools.r8.D8','--release','--min-api','26','--lib',platform,'--output',dex,...await files(classes,'.class')]);
    run(java('jar'),['uf',unsigned,'-C',dex,'classes.dex']);
    const aligned=path.join(work,'aligned.apk'),signed=path.join(work,'signed.apk');
    run(tool('zipalign'),['-f','4',unsigned,aligned]);
    run(java('java'),['-jar',path.join(buildTools,'lib/apksigner.jar'),'sign','--ks',key,'--ks-key-alias','stronghold','--ks-pass','env:SP_ANDROID_KEY_PASS','--key-pass','env:SP_ANDROID_KEY_PASS','--out',signed,aligned],signingEnv);
    const verification=run(java('java'),['-jar',path.join(buildTools,'lib/apksigner.jar'),'verify','--verbose',signed]);
    run(tool('zipalign'),['-c','4',signed]);
    const manifestDump=run(tool('aapt2'),['dump','xmltree',signed,'--file','AndroidManifest.xml']);
    if(manifestDump.includes('android.permission.INTERNET')||!manifestDump.includes('io.stronghold.protocol.offline'))throw new Error('离线权限/包名校验失败');
    const output=path.join(root,'mobile/offline-dist');await fs.mkdir(output,{recursive:true});
    const apk=path.join(output,'stronghold-protocol-offline.apk');await fs.copyFile(signed,apk);
    const hash=createHash('sha256');for await(const bytes of createReadStream(apk))hash.update(bytes);const checksum=hash.digest('hex');
    await fs.writeFile(apk+'.sha256',checksum+'  stronghold-protocol-offline.apk\n');
    await fs.writeFile(path.join(output,'offline-build-report.json'),JSON.stringify({edition:'offline',version,versionCode,package:'io.stronghold.protocol.offline',internetPermission:false,resources:inventory.length,resourceBytes:inventory.reduce((n,f)=>n+f.bytes,0),apkBytes:(await fs.stat(apk)).size,sha256:checksum,signatureVerification:verification.trim()},null,2));
    console.log('安卓单机 APK 已构建、验签并确认无网络权限：'+apk+'\nSHA-256: '+checksum);
  }finally{
    const resolved=path.resolve(work);if(resolved.startsWith(path.resolve(cache)+path.sep)&&path.basename(resolved).startsWith('android-offline-build-'))await fs.rm(resolved,{recursive:true,force:true});
  }
}
build().catch(e=>{console.error(e.message);process.exitCode=1;});
