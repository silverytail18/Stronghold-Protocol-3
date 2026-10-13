import fs from 'node:fs/promises';
import path from 'node:path';
import {APP_VERSION} from '../shared/constants.js';
export const CLIENT_DOWNLOADS = new Map([
  ['stronghold-protocol.apk','安卓轻量版'],
  ['stronghold-windows.zip','Windows x64 轻量版'],
]);
export function downloadName(route){const name=route.slice('/downloads/'.length),base=name.replace(/\.sha256$/,'');return route.startsWith('/downloads/')&&CLIENT_DOWNLOADS.has(base)?name:null;}
export async function downloadsPage(directory) {
  let rows='';for(const [file,label] of CLIENT_DOWNLOADS){let stat;try{stat=await fs.stat(path.join(directory,file));}catch(e){if(e.code==='ENOENT')continue;throw e;}
    rows+=`<li><a href="/downloads/${file}">${label}</a><span>${(stat.size/1048576).toFixed(1)} MiB · <a href="/downloads/${file}.sha256">SHA-256</a></span></li>`;
  }
  return Buffer.from(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>卫戍协议客户端下载</title><style>body{margin:0;background:#0c100f;color:#e9f0ed;font:16px/1.8 system-ui,sans-serif}main{max-width:760px;margin:8vh auto;padding:24px}h1{font-size:30px}a{color:#66d9b1}li{margin:16px 0;padding:16px;background:#18201d;border-radius:8px;list-style:none}ul{padding:0}span{display:block;font-size:14px;color:#b5c6be}small{color:#b5c6be}</style><main><small>STRONGHOLD PROTOCOL · ${APP_VERSION}</small><h1>卫戍协议：盟约</h1><p>下载客户端，连接本服务器后登录游玩。</p><ul>${rows||'<li>客户端正在准备，请稍后再来。</li>'}</ul><p>轻量版会在首次进入游戏前准备资源；已有完整本地资源时直接复用，后续只更新变化的文件。</p><p>Windows 下载后解压，运行 Stronghold.Protocol.exe；需安装 Microsoft Edge WebView2 Runtime。安卓更新请直接覆盖安装以保留本地资源。</p><p><a href="/login">登录与账号管理</a></p><small>非官方同人项目，素材版权归原权利人所有，仅供非商业学习交流。</small></main></html>`);
}
