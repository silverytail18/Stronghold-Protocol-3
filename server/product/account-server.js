// Review host for the first-batch account service. It exposes no game page, WebSocket or binary resources.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createProductServices} from './service.js';
import {isAppRequest} from './app-client.js';
import {VERSIONS} from '../../shared/versions.js';
import {VERSION_DATA_FILES} from '../data.js';
const APP_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const FILES=new Map([
  ['/css/community.css',['public/css/community.css','text/css; charset=utf-8']],
  ['/account',['public/product/account.html','text/html; charset=utf-8']],
  ['/product/player-stats.js',['public/product/player-stats.js','text/javascript; charset=utf-8']],
  ['/shared/stats.js',['shared/stats.js','text/javascript; charset=utf-8']],
  ['/shared/player-name.js',['shared/player-name.js','text/javascript; charset=utf-8']],
  ['/shared/constants.js',['shared/constants.js','text/javascript; charset=utf-8']],
  ['/shared/versions.js',['shared/versions.js','text/javascript; charset=utf-8']],
  ['/product/account.js',['public/product/account.js','text/javascript; charset=utf-8']],
  ['/product/content-admin.js',['public/product/content-admin.js','text/javascript; charset=utf-8']],
  ['/product/mode-admin.js',['public/product/mode-admin.js','text/javascript; charset=utf-8']],
  ['/product/music-admin.js',['public/product/music-admin.js','text/javascript; charset=utf-8']],
  ['/product/feedback-admin.js',['public/product/feedback-admin.js','text/javascript; charset=utf-8']],
  ['/product/ranked-admin.js',['public/product/ranked-admin.js','text/javascript; charset=utf-8']],
  ['/product/account.css',['public/product/account.css','text/css; charset=utf-8']],
  ['/css/theme.css',['public/css/theme.css','text/css; charset=utf-8']],
  ['/css/components.css',['public/css/components.css','text/css; charset=utf-8']],
  ['/shared/i18n.js',['shared/i18n.js','text/javascript; charset=utf-8']],
  ['/shared/i18nPacks.js',['shared/i18nPacks.js','text/javascript; charset=utf-8']],
]);
async function availableVersions(root) {
  const ids=[];
  for(const v of VERSIONS){try{for(const file of VERSION_DATA_FILES)await fs.access(path.join(root,'data',v.dir,file+'.json'));ids.push(v.id);}catch{/* not offered */}}
  return ids;
}
export async function startAccountServer({root=APP_ROOT,applicationRoot=APP_ROOT,uiRoot=APP_ROOT,env=process.env,port=0,host='127.0.0.1',log=console}={}) {
  const available=await availableVersions(applicationRoot);
  const product=await createProductServices({root,env,available:id=>available.includes(id),log});
  const server=http.createServer((req,res)=>{
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
    const run=async()=>{
      let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.includes('\\')||pathname.includes('\0'))throw Error('bad path');}catch{res.writeHead(400);res.end();return;}
      if(await product.route(req,res,pathname))return;
      if(pathname==='/healthz'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,mode:'account-review',gameplay:false}));return;}
      if(pathname==='/'){res.writeHead(302,{Location:'/account'});res.end();return;}
      if(isAppRequest(req)){res.writeHead(403);res.end();return;}
      const file=FILES.get(pathname);if(!file){res.writeHead(404);res.end();return;}
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
      const bytes=await fs.readFile(path.join(file[0].startsWith('public/product/')?uiRoot:applicationRoot,file[0]));res.writeHead(200,{'Content-Type':file[1],'Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
    };
    run().catch(e=>{log.error?.('[account-review]',e.message);if(!res.headersSent)res.writeHead(503);res.end();});
  });
  server.on('upgrade',(_req,socket)=>socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'));
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});}
  catch(e){product.close();throw e;}
  return {server,product,url:'http://'+host+':'+server.address().port,
    async close(){await product.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const srv=await startAccountServer({port:Number(process.env.PORT||9746)});console.log('账号候选预览：'+srv.url+'/account（不提供游戏或资源下载）');
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await srv.close();process.exit();});
}
