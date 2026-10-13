import fs from 'node:fs/promises';
// Windows aapt2 can emit assets/web\... ZIP names. Normalize both ZIP headers before signing.
// Filename byte lengths are unchanged, so data offsets/CRC/compression remain valid.
export async function normalizeApkPaths(file) {
  const bytes=await fs.readFile(file);let end=bytes.length-22;
  while(end>=Math.max(0,bytes.length-65557)&&bytes.readUInt32LE(end)!==0x06054b50)end--;
  if(end<0)throw new Error('APK ZIP footer missing');
  let cursor=bytes.readUInt32LE(end+16);const count=bytes.readUInt16LE(end+10),seen=new Set();
  const normalize=(offset,length)=>{for(let i=offset;i<offset+length;i++)if(bytes[i]===92)bytes[i]=47;};
  for(let i=0;i<count;i++) {
    if(bytes.readUInt32LE(cursor)!==0x02014b50)throw new Error('Invalid APK directory');
    const size=bytes.readUInt16LE(cursor+28),extra=bytes.readUInt16LE(cursor+30),comment=bytes.readUInt16LE(cursor+32),local=bytes.readUInt32LE(cursor+42);
    if(bytes.readUInt32LE(local)!==0x04034b50||bytes.readUInt16LE(local+26)!==size)throw new Error('Invalid APK entry header');
    normalize(cursor+46,size);normalize(local+30,size);
    const name=bytes.subarray(cursor+46,cursor+46+size).toString('utf8');
    if(seen.has(name))throw new Error('Duplicate APK path: '+name);seen.add(name);
    cursor+=46+size+extra+comment;
  }
  await fs.writeFile(file,bytes);
}
