import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {deflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {AppAssets} from '../server/app-assets.js';
import {packVersion,sha256} from '../server/resource-packs.js';
import {resourceMime} from '../server/resource-policy.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=buf=>{let n=0xffffffff;for(const b of buf)n=table[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0;};
// Deterministic standard ZIP, one blob per content hash. Each file is bounded; the full pack is streamed.
export async function writeResourceZip(filename,entries) {
  const handle=await fs.open(filename,'wx'),central=[];let offset=0;
  const output=async b=>{let written=0;while(written<b.length){const r=await handle.write(b,written,b.length-written);if(!r.bytesWritten)throw new Error('写入资源包失败');written+=r.bytesWritten;}offset+=b.length;if(offset>0xffffffff)throw new Error('资源包超过 ZIP32 上限');};
  try{for(const [name,getBytes] of entries){
    const raw=await getBytes(),compressed=deflateRawSync(raw,{level:6});const use=compressed.length<raw.length,body=use?compressed:raw,nameBytes=Buffer.from(name),crc=crc32(raw);
    const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(use?8:0,8);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(body.length,18);h.writeUInt32LE(raw.length,22);h.writeUInt16LE(nameBytes.length,26);
    const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(use?8:0,10);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(body.length,20);c.writeUInt32LE(raw.length,24);c.writeUInt16LE(nameBytes.length,28);c.writeUInt32LE(offset,42);
    central.push(Buffer.concat([c,nameBytes]));await output(h);await output(nameBytes);await output(body);
  }const start=offset;for(const c of central)await output(c);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length,8);end.writeUInt16LE(central.length,10);end.writeUInt32LE(offset-start,12);end.writeUInt32LE(start,16);await output(end);
  }finally{await handle.close();}
}
export async function buildResourcePack({root=ROOT,output=path.join(root,'resource-packs')}={}) {
  // No environment/state imports: only the fixed public mounts and explicit data whitelist are read.
  const assets=new AppAssets({publicDir:path.join(root,'public'),dataDir:path.join(root,'data'),sharedDir:path.join(root,'shared'),simDir:path.join(root,'server','sim')});
  await assets.manifest();
  const files=[...assets.snapshot.fixed].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([url,f])=>({path:url,hash:f.hash,size:f.size,mime:resourceMime(url)}));
  if(!files.length)throw new Error('没有可打包资源');
  // A committed manifest must never silently become a partial resource pack.
  for(const name of ['assets','local-assets']){
    const manifest=path.join(root,'data',name+'.json');let doc;try{doc=JSON.parse(await fs.readFile(manifest,'utf8'));}catch(e){if(e.code==='ENOENT')continue;throw e;}
    const missing=[];const walk=v=>{if(typeof v==='string'&&/^\/(assets|fonts|icons)\//.test(v)&&!assets.snapshot.fixed.has(v))missing.push(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};walk(doc);
    if(missing.length)throw new Error(`缺少 ${missing.length} 个清单素材，拒绝生成不完整资源包：${missing.slice(0,3).join(', ')}`);
  }
  const catalog={format:1,art:assets.snapshot.art,files};catalog.version=packVersion(catalog);
  const bytes=Buffer.from(JSON.stringify(catalog));await fs.mkdir(output,{recursive:true});
  const temp=path.join(output,`pack-${process.pid}.tmp`),unique=new Map(files.map(f=>[f.hash,f]));
  await writeResourceZip(temp,[['catalog.json',async()=>bytes],...[...unique].map(([hash,f])=>[`files/${hash}`,async()=>{
    const content=await fs.readFile(assets.snapshot.fixed.get(f.path).full);if(sha256(content)!==hash)throw new Error('素材在打包期间发生变化，请重试');return content;
  }])]);
  const h=createHash('sha256');for await(const b of (await import('node:fs')).createReadStream(temp))h.update(b);const archiveHash=h.digest('hex'),stat=await fs.stat(temp);
  const archive=path.join(output,archiveHash+'.zip');await fs.rename(temp,archive);
  await fs.writeFile(path.join(output,catalog.version+'.json'),bytes);
  const descriptor={format:1,version:catalog.version,art:catalog.art,fileCount:files.length,bytes:files.reduce((n,f)=>n+f.size,0),catalog:{url:`/app/resource-catalog/${catalog.version}.json`,sha256:sha256(bytes),bytes:bytes.length},archive:{url:`/app/resource-pack/${archiveHash}.zip`,sha256:archiveHash,bytes:stat.size}};
  await fs.writeFile(path.join(output,'current.json.tmp'),JSON.stringify(descriptor,null,2));await fs.rename(path.join(output,'current.json.tmp'),path.join(output,'current.json'));
  return descriptor;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildResourcePack().then(d=>console.log(`资源包已生成：${d.fileCount} 个文件，${(d.archive.bytes/1048576).toFixed(1)} MiB\n版本：${d.version}\n目录：${path.join(ROOT,'resource-packs')}`)).catch(e=>{console.error(e.message);process.exitCode=1;});
