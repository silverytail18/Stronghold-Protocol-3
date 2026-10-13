// Builds an isolated browser-compatible copy; never edits production JS/data or reads player files.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function buildOfflineWeb({root=defaultRoot,output=path.join(root,'.cache/offline-web')}={}) {
  root=path.resolve(root);output=path.resolve(output);
  if(!output.startsWith(path.join(root,'.cache')+path.sep))throw new Error('单机暂存目录必须位于项目 .cache 内');
  await fs.mkdir(output,{recursive:true});
  for(const dir of ['css','js','vendor','fonts','assets','icons']) {
    try{await fs.cp(path.join(root,'public',dir),path.join(output,dir),{recursive:true,errorOnExist:false});}
    catch(e){if(e.code!=='ENOENT')throw e;}
  }
  for(const [source,target] of [['shared','shared'],['server/sim','sim'],['mobile/offline','offline']])
    await fs.cp(path.join(root,source),path.join(output,target),{recursive:true});
  // Content registries use computed imports (kits/tier${n}, domain names). Include the entire
  // battle subtree and shared helpers, rather than relying only on literal-import discovery.
  await fs.mkdir(path.join(output,'offline/engine/server'),{recursive:true});
  await fs.cp(path.join(root,'server/sim'),path.join(output,'offline/engine/server/sim'),{recursive:true});
  await fs.cp(path.join(root,'shared'),path.join(output,'offline/engine/shared'),{recursive:true});
  // Explicit JSON whitelist: config/server.env, accounts, rankings and private deployment settings are excluded.
  const dataFiles=['config','chess','bonds','garrisons','items','bands','effects','choices','enemies','factions','waves','stages','bosses','tokens','assets','local-assets'];
  await fs.mkdir(path.join(output,'data'),{recursive:true});
  for(const name of dataFiles)await fs.copyFile(path.join(root,'data',name+'.json'),path.join(output,'data',name+'.json'));
  const originalData=await fs.readFile(path.join(root,'server/data.js'),'utf8');
  const shim=`let singleton=null;\nexport function setData(data){singleton=data;}\nexport function getData(){if(!singleton)throw new Error('Offline data not initialized');return singleton;}\n${originalData.slice(originalData.indexOf('export function deepFreeze'),originalData.indexOf('/**\n * Read every'))}\n${originalData.slice(originalData.indexOf('export const INDEXED_FILES'))}`;
  const seen=new Set();
  const copyModule=async relative=>{
    if(seen.has(relative))return;seen.add(relative);
    let text=relative==='server/data.js'?shim:relative==='server/sim/nodeData.js'?
      "import {getData} from '../data.js';\nexport async function loadGenerated(){return getData();}\nexport const reloadGenerated=loadGenerated;\nexport function loadResearch(){return {chess:{},enemies:{},tokens:{},stages:{},waves:{}};}\n":await fs.readFile(path.join(root,relative),'utf8');
    text=text.replace("from 'node:crypto'","from '../../hash.js'");
    // Includes multiline static imports and literal dynamic imports; rejects new Node-only dependencies.
    const imports=[...text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]);
    for(const specifier of imports) {
      if(specifier==='../../hash.js'&&relative==='server/test-content.js')continue;
      if(!specifier.startsWith('.'))throw new Error('单机引擎不能引入外部/Node 模块：'+relative+' → '+specifier);
      const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(relative),specifier));
      if(resolved.startsWith('../'))throw new Error('模块越界：'+resolved);
      await copyModule(resolved);
    }
    const dest=path.join(output,'offline/engine',relative);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,text);
  };
  await copyModule('server/match/Match.js');await copyModule('server/test-content.js');await copyModule('shared/skins.js');
  await copyModule('server/sim/content/expansion/loadout-catalog.js');
  // The /sim mount's content helpers resolve ../../../data.js to /data.js, just as on the
  // online server. They must read the frontend's injected (possibly expanded) battle data.
  await fs.writeFile(path.join(output,'data.js'),"import {getSimData} from './sim/simdata.js';\nexport function getData(){return getSimData()||{};}\nexport function resetData(){}\n");
  await fs.writeFile(path.join(output,'js/auth.js'),'export async function initAuth(){return true;}\n');
  await fs.writeFile(path.join(output,'js/appResources.js'),`export const appArtUrl=v=>v,appArtPaths=v=>v;\nexport async function initAppResources(){}\nexport async function refreshAppResources(){}\nexport async function ensureAppResourcesCurrent(){return true;}\nexport function appendAppUpdateControl(){}\nexport async function installAppResourceGuard(){}\n`);
  await fs.writeFile(path.join(output,'js/ui/ranked.js'),`export async function rankApi(){throw new Error('单机版不连接排位服务');}\nexport function installRankedSync(){import('../store.js').then(({store})=>store.set({ranked:{enabled:false}}));}\nexport function RankedSelector(){return null;}\nexport function RankedSettlement(){return null;}\n`);
  const edit=async(file,transform)=>{const dest=path.join(output,file);await fs.writeFile(dest,transform(await fs.readFile(dest,'utf8')));};
  await edit('js/main.js',text=>text.replace("from './screens/lobby.js'","from '/offline/lobby.js'"));
  await edit('js/ui/testContent.js',text=>text.replace('服务器才会校验并为本局启用','本地引擎才会校验并为本局启用').replace('本局全员共用，排位按现有规则正常结算','只对当前单人模拟生效，不连接云端排位'));
  await edit('js/ui/gameComponents.js',text=>text.replaceAll('管理员快捷领取','单机测试快捷领取'));
  await edit('js/ui/testOperators.js',text=>text.replace('micro="ADMIN TEST"','micro="OFFLINE TEST"').replace('出战与排位计分沿用本局规则','出战沿用本局规则，单机版不连接排位服务'));
  await edit('js/ui/detailPanel.js',text=>text.replaceAll('管理员测试副本','单机测试副本'));
  await edit('js/net.js',text=>text.replace("OFFLINE: '未连接到服务器'","OFFLINE: '本地引擎未就绪'").replace("VERSION: '客户端版本与服务器不一致，请刷新页面'","VERSION: '单机资源版本不一致，请重新安装'"));
  // The media alias is a server convenience. The offline edition uses the bundled audio path directly.
  await edit('js/audio.js',text=>text.replace('const media = mediaUrl(url);','const media = url;'));
  for(const name of ['account.js','login.js','ranked-admin.js'])await fs.rm(path.join(output,'js',name),{force:true});
  let html=await fs.readFile(path.join(root,'public/index.html'),'utf8');
  html=html.replace(/<link\b[^>]*https:\/\/fonts\.[\s\S]*?\/>/g,'')
    .replace('src="/js/main.js"','src="/offline/bootstrap.js"')
    .replace('</head>','<link rel="stylesheet" href="/offline/offline.css" />\n</head>')
    .replace('卫戍协议：盟约 · STRONGHOLD PROTOCOL','卫戍协议：盟约 · 单机版')
    .replace('游戏脚本加载失败，请检查网络连接后刷新页面。','单机资源加载失败，请更新 Android System WebView 或重新安装。');
  if(html.includes('https://fonts.'))throw new Error('离线入口仍引用远程字体');
  await fs.writeFile(path.join(output,'index.html'),html);
  const inventory=[];
  const walk=async dir=>{for(const item of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,item.name);if(item.isSymbolicLink())throw new Error('拒绝打包符号链接');if(item.isDirectory())await walk(full);else{const bytes=await fs.readFile(full);inventory.push({path:path.relative(output,full).replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}};
  await walk(output);inventory.sort((a,b)=>a.path.localeCompare(b.path));
  await fs.writeFile(path.join(output,'offline-build.json'),JSON.stringify({edition:'offline',version:JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version,files:inventory},null,2));
  console.log(`单机资源已暂存：${inventory.length} 文件，${(inventory.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(1)} MiB，真实规则模块 ${seen.size} 个`);
  return {output,inventory};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildOfflineWeb().catch(e=>{console.error(e);process.exitCode=1;});
