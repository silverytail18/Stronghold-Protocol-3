// Independent local preview. Uses fresh in-memory sessions and the existing app client policy.
import fs from 'node:fs/promises';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {startServer,ROOT} from '../server/index.js';
import {APP_USER_AGENT} from '../server/app-client.js';
import {BATCH} from '../server/sim/content/kazdel/data.js';

export async function startKazdelPreview({port=3107,openBrowser=true,headless=false}={}) {
 const srv=await startServer({port,host:'127.0.0.1',quiet:true,auth:false,ranked:false});
 let browser,profile,closing;
 const close=()=>closing||=(async()=>{
  await browser?.close();await srv.close();
  if(profile){const cache=path.resolve(ROOT,'.cache');if(!path.resolve(profile).startsWith(cache+path.sep))throw Error('Unsafe preview cleanup path');await fs.rm(profile,{recursive:true,force:true});}
 })();
 try {
  await srv.lobby.testContentAccess.update({revision:0,catalog:srv.lobby.testContent.version,publicIds:[BATCH]},srv.lobby.testContent);
  if(openBrowser){
   const executablePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
   if(!executablePath)throw Error('未找到 Chrome/Edge。可设置 CHROME_PATH，或用 --server-only 供独立桌面客户端连接。');
   await fs.mkdir(path.join(ROOT,'.cache'),{recursive:true});profile=await fs.mkdtemp(path.join(ROOT,'.cache','kazdel-preview-'));
   browser=await(await import('puppeteer-core')).default.launch({executablePath,userDataDir:profile,headless,args:['--no-first-run'],defaultViewport:null});
   const page=await browser.newPage();await page.setUserAgent((await browser.userAgent())+' '+APP_USER_AGENT);
   await page.evaluateOnNewDocument(()=>{localStorage.setItem('sp.name','卡兹戴尔试玩');sessionStorage.setItem('sp.entered','1');});
   await page.goto(srv.url+'/',{waitUntil:'domcontentloaded'});
  }
  return{...srv,browser,close};
 }catch(e){await close();throw e;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const p=process.argv.find(a=>a.startsWith('--port=')),port=p?Number(p.slice(7)):3107;
 if(!Number.isInteger(port)||port<0||port>65535)throw Error('端口必须为0—65535。');
 const preview=await startKazdelPreview({port,openBrowser:!process.argv.includes('--server-only')});
 console.log(`卡兹戴尔独立试玩：${preview.url}\n创建房间 → 测试内容 → 勾选「卡兹戴尔 · 魂契」 → 开始模拟。\n按 Ctrl+C 关闭；使用独立临时会话，不接入账号或排位。`);
 let closing=false;const stop=async()=>{if(closing)return;closing=true;await preview.close();process.exit(0);};
 process.once('SIGINT',stop);process.once('SIGTERM',stop);preview.browser?.once('disconnected',stop);
}
