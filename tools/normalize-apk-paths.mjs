import fs from 'node:fs/promises';
// Windows aapt2 can emit assets/web\... ZIP names. Normalize both ZIP headers before signing.
// Filename byte lengths are unchanged, so data offsets/CRC/compression remain valid.
export async function normalizeApkPaths(file) {
  // Only ZIP names change. Avoid loading the complete embedded resource pack into memory.
  const handle=await fs.open(file,'r+');
  try {
    const length=(await handle.stat()).size;
    const read=async(position,size)=>{
      if(position<0||position+size>length)throw new Error('Invalid APK ZIP bounds');
      const bytes=Buffer.alloc(size);let offset=0;
      while(offset<size){const part=await handle.read(bytes,offset,size-offset,position+offset);if(!part.bytesRead)throw new Error('Truncated APK ZIP');offset+=part.bytesRead;}
      return bytes;
    };
    const tailStart=Math.max(0,length-65557),tail=await read(tailStart,length-tailStart);let end=tail.length-22;
    while(end>=0&&(tail.readUInt32LE(end)!==0x06054b50||end+22+tail.readUInt16LE(end+20)!==tail.length))end--;
    if(end<0)throw new Error('APK ZIP footer missing');
    let cursor=tail.readUInt32LE(end+16);const count=tail.readUInt16LE(end+10),seen=new Set(),edits=[];
    const normalize=bytes=>Buffer.from(bytes.toString('utf8').replaceAll('\\','/'),'utf8');
    for(let i=0;i<count;i++) {
      const header=await read(cursor,46);
      if(header.readUInt32LE(0)!==0x02014b50)throw new Error('Invalid APK directory');
      const size=header.readUInt16LE(28),extra=header.readUInt16LE(30),comment=header.readUInt16LE(32),local=header.readUInt32LE(42);
      const localHeader=await read(local,30);
      if(localHeader.readUInt32LE(0)!==0x04034b50||localHeader.readUInt16LE(26)!==size)throw new Error('Invalid APK entry header');
      const original=await read(cursor+46,size),localName=await read(local+30,size),normalized=normalize(original);
      if(normalized.length!==size||!normalize(localName).equals(normalized))throw new Error('APK entry names disagree');
      const name=normalized.toString('utf8');
      if(seen.has(name))throw new Error('Duplicate APK path: '+name);seen.add(name);
      if(!original.equals(normalized))edits.push({position:cursor+46,bytes:normalized});
      if(!localName.equals(normalized))edits.push({position:local+30,bytes:normalized});
      cursor+=46+size+extra+comment;
    }
    for(const {position,bytes}of edits){let offset=0;while(offset<bytes.length){const part=await handle.write(bytes,offset,bytes.length-offset,position+offset);if(!part.bytesWritten)throw new Error('APK path write failed');offset+=part.bytesWritten;}}
    await handle.sync();
  } finally {await handle.close();}
}
