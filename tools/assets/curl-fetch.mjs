// Optional host-side transport for networks that reset Node's TLS handshake.
// Parsing, format validation, retry policy and source selection remain in the upstream downloader.
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {githubSourceUrl} from './sources.mjs';
const evidence=process.env.SP_ASSET_HTTP_EVIDENCE?JSON.parse(readFileSync(process.env.SP_ASSET_HTTP_EVIDENCE,'utf8')):{};
export function curlFetch(url,options={},redirects=0) {
  if(redirects>5)return Promise.reject(Error('Too many redirects'));
  const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)return Promise.reject(Error('Invalid asset URL'));
  // A GitHub API 404 from this extraction session is a definitive miss, not a mirror outage.
  if(evidence[githubSourceUrl(parsed.href)]==='missing')return Promise.resolve(new Response(null,{status:404}));
  return new Promise((resolve,reject)=>{
    let header=Buffer.alloc(0),controller,ready=false,settled=false,cancelled=false,stderr='';
    const args=['--http1.1','--silent','--show-error','--include','--no-buffer','--max-time','600'];
    for(const [name,value] of new Headers(options.headers))args.push('--header',name+': '+value);
    args.push('--url',parsed.href);
    const child=spawn('curl.exe',args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
    const abort=()=>{cancelled=true;child.kill();const error=options.signal?.reason||Error('Asset request aborted');if(ready)controller?.error(error);else reject(error);};
    if(options.signal?.aborted){abort();return;}options.signal?.addEventListener('abort',abort,{once:true});
    function emit(bytes){if(!bytes.length)return;controller.enqueue(bytes);if(controller.desiredSize<=0)child.stdout.pause();}
    child.stdout.on('data',chunk=>{
      if(cancelled)return;
      if(ready){emit(chunk);return;}
      header=Buffer.concat([header,chunk]);const end=header.indexOf('\r\n\r\n');if(end<0){if(header.length>65536){child.kill();reject(Error('Asset headers too large'));}return;}
      const lines=header.subarray(0,end).toString('latin1').split('\r\n'),match=/^HTTP\/\S+ (\d{3})/.exec(lines.shift());
      if(!match){child.kill();reject(Error('Invalid HTTP response'));return;}const status=Number(match[1]);const headers=new Headers();for(const line of lines){const colon=line.indexOf(':');if(colon>0)headers.append(line.slice(0,colon),line.slice(colon+1).trim());}
      if(status>=300&&status<400&&headers.has('location')){cancelled=true;child.kill();settled=true;resolve(curlFetch(new URL(headers.get('location'),parsed).href,options,redirects+1));return;}
      if(status<200){header=header.subarray(end+4);return;}
      ready=true;const body=new ReadableStream({start(c){controller=c;},pull(){child.stdout.resume();},cancel(){cancelled=true;child.kill();}});
      const response=new Response([204,205,304].includes(status)?null:body,{status,headers});settled=true;resolve(response);emit(header.subarray(end+4));header=null;
    });
    child.stderr.on('data',bytes=>{if(stderr.length<4096)stderr+=bytes.toString();});
    child.once('error',error=>{if(ready)controller?.error(error);else reject(error);});
    child.once('close',code=>{options.signal?.removeEventListener('abort',abort);if(cancelled)return;if(code!==0){const error=Error('curl asset transport failed: '+stderr.trim());if(ready)controller?.error(error);else reject(error);}else if(ready)controller.close();else if(!settled)reject(Error('Empty asset response'));});
  });
}
