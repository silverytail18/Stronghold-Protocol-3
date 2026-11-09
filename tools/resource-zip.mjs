import fs from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
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
