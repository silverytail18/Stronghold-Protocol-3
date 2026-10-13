import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {normalizeApkPaths} from '../tools/normalize-apk-paths.mjs';
import {writeResourceZip} from '../tools/build-resource-pack.mjs';
import {sha256} from '../mobile/offline/hash.js';
import {createHash} from 'node:crypto';
test('offline catalog SHA-256 matches Node for Unicode, padding boundaries and large payloads',()=>{
  for(const text of ['', 'abc', '岁与企鹅 🐧',...[55,56,63,64,65,1000000].map(n=>'a'.repeat(n))])
    assert.equal(sha256(text),createHash('sha256').update(text).digest('hex'));
});
test('normalize Windows APK paths without changing compressed payloads',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-offline-zip-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const zip=path.join(dir,'fixture.apk');const payload=Buffer.from('单机真实资源'.repeat(100));
  await writeResourceZip(zip,[['assets/web\\offline\\worker.js',async()=>payload],['classes.dex',async()=>Buffer.from('fixture')]]);
  const before=await fs.readFile(zip);await normalizeApkPaths(zip);const after=await fs.readFile(zip);
  assert.equal(after.length,before.length);assert.ok(after.includes(Buffer.from('assets/web/offline/worker.js')));
  assert.ok(!after.includes(Buffer.from('assets/web\\offline\\worker.js')));
  const offset=30+before.readUInt16LE(26)+before.readUInt16LE(28),size=before.readUInt32LE(18);
  assert.deepEqual(after.subarray(offset,offset+size),before.subarray(offset,offset+size));
});
