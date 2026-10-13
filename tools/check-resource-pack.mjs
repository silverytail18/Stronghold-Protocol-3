// Read-only diagnosis of the exact fixed-content snapshot used by App login.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {AppAssets} from '../server/app-assets.js';
import {ResourcePacks} from '../server/resource-packs.js';
export async function checkResourcePack(root=path.resolve(import.meta.dirname,'..')){
 const assets=new AppAssets({publicDir:path.join(root,'public'),dataDir:path.join(root,'data'),sharedDir:path.join(root,'shared'),simDir:path.join(root,'server/sim')});
 await assets.manifest();const packs=new ResourcePacks(path.join(root,'resource-packs'));
 const descriptor=await packs.current(assets.snapshot);
 if(!descriptor&&!packs.loaded)return{status:'missing',message:'未找到resource-packs/current.json，请在实际运行目录执行npm run resources:build',actualFiles:assets.snapshot.fixed.size};
 if(!descriptor){const catalog=packs.loaded.catalog,expected=new Map(catalog.files.map(f=>[f.path,f]));const extra=[...assets.snapshot.fixed.keys()].filter(p=>!expected.has(p)),missing=catalog.files.filter(f=>!assets.snapshot.fixed.has(f.path)).map(f=>f.path),changed=catalog.files.filter(f=>assets.snapshot.fixed.has(f.path)&&assets.snapshot.fixed.get(f.path).hash!==f.hash).map(f=>f.path);return{status:'stale',message:'资源包存在，但与当前目录不一致；执行npm run resources:build后按原方式重启服务器',catalogFiles:catalog.files.length,actualFiles:assets.snapshot.fixed.size,extraCount:extra.length,missingCount:missing.length,changedCount:changed.length,extra:extra.slice(0,20),missing:missing.slice(0,20),changed:changed.slice(0,20)};}
 try{const stat=await fs.stat(path.join(packs.directory,descriptor.archive.sha256+'.zip'));if(!stat.isFile()||stat.size!==descriptor.archive.bytes)throw new Error('ZIP大小不符');}catch(e){return{status:'missing-archive',message:'资源目录匹配，但ZIP不存在或大小不符；执行npm run resources:build',version:descriptor.version};}
 return{status:'ready',version:descriptor.version,files:descriptor.fileCount,archiveBytes:descriptor.archive.bytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))checkResourcePack().then(r=>{console.log(JSON.stringify(r,null,2));if(r.status!=='ready')process.exitCode=1;}).catch(e=>{console.error('资源包检查失败：'+e.message);process.exitCode=1;});
