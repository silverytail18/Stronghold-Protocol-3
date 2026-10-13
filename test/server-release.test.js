import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {releaseFiles} from '../tools/build-server-release.mjs';

test('Linux release includes runtime art and lightweight clients while excluding state, full clients, signing and compiled artifacts',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'sp-server-release-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const keep=['package.json','package-lock.json','server/index.js','public/assets/board/mesh.obj','public/vendor/preact.module.js','resource-packs/current.json','mobile/dist/stronghold-protocol.apk','mobile/dist/stronghold-protocol.apk.sha256','mobile/dist/stronghold-windows.zip','tools/update-project.mjs'];
  const deny=['server/test-content-access.json','config/server.env','storage/auth-users.json','.env','mobile/full-dist/stronghold-windows-full/resource-pack.zip','mobile/dist/stronghold-windows-full.zip','mobile/dist/stronghold-protocol-full.apk','mobile/dist/stronghold-protocol-full.apk.sha256','mobile/dist/credentials.json','mobile/android/.signing/release.p12','mobile/windows/obj/build.json','test/resource-scenes/obj/build.json','public/assets/auth-users.json','public/private/accounts.custom.json','data/private/ranked.custom.db','data/private/ranked.custom.db-wal','data/private/ranked.custom.db-shm','shared/private/secret.txt','scripts/service.env.cmd'];
  deny.push('mobile/offline-dist/stronghold-protocol-offline.apk','mobile/offline-dist/offline-build-report.json');
  for(const file of [...keep,...deny]){await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});await fs.writeFile(path.join(root,file),'fixture');}
  const files=await releaseFiles(root,{SP_STATE_DIR:'shared/private',SP_AUTH_USERS_FILE:'public/private/accounts.custom.json',SP_RANKED_FILE:'data/private/ranked.custom.db'});
  assert.deepEqual(files,keep.sort());
});

test('release includes only the current fixed resource archive; older packs remain in the workspace',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'sp-current-pack-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(path.join(root,'resource-packs'));const version='1'.repeat(64),hash='2'.repeat(64),old='3'.repeat(64);
  await fs.writeFile(path.join(root,'resource-packs/current.json'),JSON.stringify({version,archive:{sha256:hash}}));
  for(const file of [version+'.json',hash+'.zip',old+'.zip'])await fs.writeFile(path.join(root,'resource-packs',file),'fixture');
  assert.deepEqual(await releaseFiles(root,{}),['resource-packs/'+version+'.json','resource-packs/'+hash+'.zip','resource-packs/current.json']);
  assert.ok((await fs.stat(path.join(root,'resource-packs',old+'.zip'))).size);
});
