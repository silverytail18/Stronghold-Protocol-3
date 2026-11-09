// Product admission runs before the upstream host opens its listening socket.
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startServer} from '../index.js';
import {referenceCatalog} from './reference-catalog.js';
import {createProductServices} from './service.js';
import {attachProductLobby} from './lobby-bridge.js';
import {attachProductContent} from './content-sets.js';
import {ACCOUNT_FILES, normalizedPath, isFixedResource} from './game-policy.js';
import {isAppRequest} from './app-client.js';
import {loadResourceUpdates} from './resource-updates.js';
import {deploymentSettings} from './state-paths.js';
import {ERR} from '../../shared/constants.js';
import {errorMsg} from '../net.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
function json(req, res, status, body) {
  const bytes = Buffer.from(JSON.stringify(body));res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'Content-Length':bytes.length});res.end(req.method === 'HEAD' ? undefined : bytes);
}
function secureNetwork({server, network, registry, product, updates}) {
  const {auth} = product;
  const upgrades = server.listeners('upgrade');server.removeAllListeners('upgrade');
  server.on('upgrade', (req, socket, head) => {
    try {
      if (product.stopping) throw Error('Server stopping');
      if (normalizedPath(req.url) !== '/ws' || updates.compatible(req) !== 'ready' || !auth.sameOrigin(req)) throw Error('Client upgrade required');
      req.productAuthSession = auth.session(req);auth.authorize(req.productAuthSession);
      for (const handler of upgrades) handler.call(server, req, socket, head);
    } catch {socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');}
  });
  const connect = network.handleConnection.bind(network);
  network.handleConnection = (ws, req) => {auth.attachSocket(ws, req.productAuthSession);ws.productAuthSession = req.productAuthSession;connect(ws, req);};
  const frame = network.onFrame.bind(network);
  network.onFrame = (conn, ...args) => {if(product.stopping){conn.ws.close(1012,'server stopping');return;}try {auth.authorize(conn.ws.productAuthSession);} catch {conn.ws.close(4003, 'authentication required');return;}frame(conn, ...args);};
  const hello = network.onHelloMsg.bind(network);
  network.onHelloMsg = (conn, msg, now) => {
    const user = auth.authorize(conn.ws.productAuthSession), target = registry.byToken(msg.token);
    if (target && target.accountId !== user.accountId) {network.reply(conn, errorMsg(ERR.BAD_TARGET,msg.rid,'此座位属于其他账号'));return;}
    // An account owns one gameplay identity across devices, including the lobby and co-op.
    // A fresh device has no local token; use the account's existing identity before upstream can create another.
    const own = product.accountSession(user.accountId);
    if (own.error) {network.reply(conn,errorMsg(ERR.BAD_TARGET,msg.rid,own.error));return;}
    if (!conn.session && own.session) msg = {...msg,token:own.session.token};
    const presentation=product.community?.presentation(user.accountId);
    if(presentation?.nickname)msg={...msg,name:presentation.nickname};
    hello(conn, msg, now);
    if (conn.session) conn.session.accountId = user.accountId;
  };
  // hello's welcome precedes Lobby.onHello: attach ownership before either can create a room.
  const reply = network.reply.bind(network);
  network.reply = (conn, message) => {
    if (message.t === 'welcome') {
      const user = auth.authorize(conn.ws.productAuthSession);
      conn.session.accountId = user.accountId;
      message = {...message, account:{accountId:user.accountId,username:user.username, role:user.role, sponsor:user.sponsor === true}};
    }
    return reply(conn, message);
  };
}
export async function startProductServer({root=ROOT, applicationRoot=ROOT, env=process.env, port, host, log=console, resourceDirectory=path.join(applicationRoot, 'client-updates'), publicKey=null, ...options}={}) {
  env={...await deploymentSettings(root,env),...env};port??=Number(env.PORT||3000);host??=env.HOST||'::';
  const updates = await loadResourceUpdates({directory:resourceDirectory, publicKey:publicKey||await fs.readFile(path.join(applicationRoot, 'mobile/resource-update-public.pem'))});
  const product = await createProductServices({root, env, log, recoverCurrent:true});
  // The target inventory comes only from verified update signatures.
  const mizukiFiles = updates.targetManifest?.files.filter(f => f.path.startsWith('/assets/mizuki/')) || [];
  const requiredMizuki = ['/assets/mizuki/library/manifest.json','/assets/mizuki/native-ui-route/manifest.json',
    '/assets/mizuki/native-ui-motion/manifest.json','/assets/mizuki/native-sfx/manifest.json',
    '/assets/mizuki/native-facilities/manifest.json','/assets/mizuki/data/runtime-ui.json'];
  product.mizukiResourceReady = requiredMizuki.every(p => mizukiFiles.some(f => f.path === p));
  product.mizukiResourceHash = product.mizukiResourceReady ? updates.descriptor.resourceHash : null;
  product.mizuki.resourceHash = product.mizukiResourceHash;
  let upstream;
  try {
    upstream = await startServer({...options, port, host, log, studio:false, assetIndex:false, localImageFetch:true, pluginsDir:path.join(applicationRoot,'product-plugins'), versions:{enabled:'all'},
      async beforeListen(context) {
        const {server} = context;
        attachProductContent({...context,product});attachProductLobby({...context, product});secureNetwork({...context, product, updates});
        const handlers = server.listeners('request');server.removeAllListeners('request');
        server.on('request', (req, res) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');res.setHeader('Cache-Control', 'no-store');
          const run = async () => {
            if(product.stopping){json(req,res,503,{error:'服务器正在停止'});return;}
            const pathname = normalizedPath(req.url);
            if (await updates.route(req, res, pathname, product.auth)) return;
            if (await product.route(req, res, pathname)) return;
            if(pathname==='/product/loadout'){
              if(updates.compatible(req)!=='ready'){json(req,res,403,{error:'请使用兼容客户端调配'});return;}
              await product.loadouts.handle(req,res,product.auth);return;
            }
            if (pathname === '/healthz') {json(req, res, 200, {ok:true});return;}
            if (!['GET', 'HEAD'].includes(req.method)) {json(req, res, 405, {error:'Method not allowed'});return;}
            const account = ACCOUNT_FILES.get(pathname);
            if (account) {
              if (isAppRequest(req) && pathname.startsWith('/account')) {json(req, res, 403, {error:'请使用浏览器管理账号'});return;}
              const bytes = await fs.readFile(path.join(applicationRoot, account[0]));res.writeHead(200, {'Content-Type':account[1], 'Content-Length':bytes.length});res.end(req.method === 'HEAD' ? undefined : bytes);return;
            }
            if (/^\/(?:product\/(?:login\.(?:html|js|css)|boot\.js|native\.js)|shared\/client-resources\.js)$/.test(pathname)) {
              const bytes = await fs.readFile(path.join(applicationRoot, pathname.startsWith('/shared/')?'':'public', pathname));res.writeHead(200, {'Content-Type':pathname.endsWith('.js')?'text/javascript; charset=utf-8':pathname.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);return;
            }
            if (isFixedResource(pathname)) {json(req, res, 404, {error:'资源由客户端本地提供'});return;}
            if (!isAppRequest(req)) {if (pathname==='/') {res.writeHead(302, {Location:'/account'});res.end();} else json(req, res, 403, {error:'请使用客户端游玩'});return;}
            if (updates.compatible(req) !== 'ready') {res.writeHead(302, {Location:'/product/login.html'});res.end();return;}
            try {product.auth.authorize(product.auth.session(req));} catch {if (pathname==='/'||pathname==='/index.html') {res.writeHead(302, {Location:'/product/login.html'});res.end();} else json(req, res, 401, {error:'请先登录'});return;}
            if (pathname==='/product/rooms') {const user=product.auth.authorize(product.auth.session(req));json(req,res,200,{rooms:product.currentRooms(user.accountId)});return;}
            if (pathname==='/product/modes') {json(req,res,200,product.modes.view());return;}
            if(pathname==='/product/catalog'&&['GET','HEAD'].includes(req.method)){json(req,res,200,referenceCatalog(new URL(req.url,'http://localhost').searchParams.get('version')||undefined));return;}
            if (pathname==='/product/content') {const user=product.auth.authorize(product.auth.session(req)),query=new URL(req.url,'http://localhost').searchParams;json(req,res,200,product.contentCatalog.view({version:query.get('version')||undefined,admin:user.role==='admin',mode:query.get('mode')||undefined,difficulty:query.get('difficulty')||undefined,ranked:query.get('ranked')==='true',variant:query.get('variant')||null}));return;}
            for (const handler of handlers) handler.call(server, req, res);
          };
          run().catch(error => {log.error?.('[product-http]', error.message);if (!res.headersSent) json(req, res, error.status||400, {error:error.status?error.message:'请求无法处理'});else res.destroy();});
        });
        await product.markGeneration();
      },
    });
  } catch (error) {try{await product.close();}catch(closeError){log.error?.('[shutdown]',closeError);}throw error;}
  let closing;
  return {...upstream, product, updates, close() {product.stopping=true;return closing ??= (async()=>{await product.mizukiHosts?.suspendAll();await upstream.close();product.mizukiHosts?.close();await product.close();})();}};
}
export function installProductShutdown(server) {
  let stopping=false;
  const stop=async()=>{
    if(stopping)return;stopping=true;
    try{await server.close();console.log('服务器已停止，水月探索已保存，普通对局按原规则收尾');process.exit(0);}
    catch(error){console.error('[shutdown] 停服收尾失败：',error);process.exit(1);}
  };
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, stop);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await startProductServer();console.log('客户端专用服务器已启动：' + server.url);
  installProductShutdown(server);
}
