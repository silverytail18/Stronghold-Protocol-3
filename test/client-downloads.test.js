import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {CLIENT_DOWNLOADS,downloadsPage,downloadName} from '../server/client-downloads.js';
import {startServer} from '../server/index.js';

test('downloads list only lightweight clients, even when full installers remain on disk',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-downloads-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  for(const file of ['stronghold-protocol.apk','stronghold-windows.zip','stronghold-protocol-full.apk','stronghold-windows-full.zip'])await fs.writeFile(path.join(dir,file),'installer');
  assert.deepEqual([...CLIENT_DOWNLOADS.keys()],['stronghold-protocol.apk','stronghold-windows.zip']);
  const html=(await downloadsPage(dir)).toString();
  assert.match(html,/href="\/downloads\/stronghold-protocol.apk"/);assert.match(html,/href="\/downloads\/stronghold-windows.zip"/);
  assert.doesNotMatch(html,/stronghold-(?:protocol|windows)-full|完整版/);
  for(const file of CLIENT_DOWNLOADS.keys()){assert.equal(downloadName('/downloads/'+file),file);assert.equal(downloadName('/downloads/'+file+'.sha256'),file+'.sha256');}
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  for(const file of ['stronghold-protocol-full.apk','stronghold-windows-full.zip']){
    for(const suffix of ['','.sha256']){
      const route='/downloads/'+file+suffix;assert.equal(downloadName(route),null);
      for(const method of ['GET','HEAD']){const res=await fetch(srv.url+route,{method});assert.equal(res.status,404);await res.arrayBuffer();}
    }
  }
});
