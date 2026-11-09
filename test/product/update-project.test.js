import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
import {productFixture} from './fixture.js';import {updateProject} from '../../tools/update-project.mjs';import {digest} from '../../server/product/resource-updates.js';
async function fixture(t){const f=await productFixture();t.after(()=>f.close());await fs.writeFile(path.join(f.project,'package.json'),JSON.stringify({name:'stronghold-protocol-covenant',version:'0.9.13'}));const source=path.join(f.dir,'release');await fs.mkdir(source);const files={
 'package.json':JSON.stringify({name:'stronghold-protocol-alliance',version:'0.9.14'}),'package-lock.json':'{}','server/product/game-server.js':'// new engine\n','tools/update-project.mjs':'// updater\n','mobile/resource-update-public.pem':'fixture public key','client-updates/client.json':'{}','shared/constants.js':'export const APP_VERSION="0.9.14";'};
 const rows=[];for(const[name,body]of Object.entries(files)){await fs.mkdir(path.dirname(path.join(source,name)),{recursive:true});await fs.writeFile(path.join(source,name),body);rows.push({path:name,size:Buffer.byteLength(body),sha256:digest(Buffer.from(body))});}
 const manifest={format:1,version:'0.9.14',files:rows};await fs.writeFile(path.join(source,'SERVER-RELEASE.json'),JSON.stringify(manifest));
 await fs.mkdir(path.join(f.project,'server'),{recursive:true});await fs.writeFile(path.join(f.project,'server/retired-runtime.js'),'retired source');await fs.writeFile(path.join(f.project,'notes.txt'),'user notes');await fs.mkdir(path.join(f.project,'mobile/android/.signing'),{recursive:true});await fs.writeFile(path.join(f.project,'mobile/android/.signing/release.p12'),'private signer');
 const protectedFiles=[f.authFile,path.join(f.state,'ranked.sqlite'),path.join(f.project,'config/server.env'),path.join(f.project,'mobile/android/.signing/release.p12')];const before=new Map(await Promise.all(protectedFiles.map(async file=>[file,digest(await fs.readFile(file))])));
 return {...f,source,manifest,async assertProtected(){for(const[file,sha]of before)assert.equal(digest(await fs.readFile(file)),sha,file);}};
}
test('stopped source-only rebase update retains accounts, database, external state configuration and signer',async t=>{
 const f=await fixture(t);const result=await updateProject({env:{},source:f.source,target:f.project,stopped:true});assert.equal(result.version,'0.9.14');assert.equal(result.statePreserved,true);await f.assertProtected();
 assert.equal(await fs.readFile(path.join(f.project,'notes.txt'),'utf8'),'user notes');await assert.rejects(fs.access(path.join(f.project,'server/retired-runtime.js')),{code:'ENOENT'});
 assert.equal(await fs.readFile(path.join(result.backup,'source/server/retired-runtime.js'),'utf8'),'retired source');assert.equal(JSON.parse(await fs.readFile(path.join(result.backup,'private-state/manifest.json'),'utf8')).kind,'stronghold-state-retention');
});
test('update refuses running old records before changing source',async t=>{
 const f=await fixture(t);const db=new DatabaseSync(path.join(f.state,'ranked.sqlite'));db.prepare("UPDATE battle_records SET status='running' WHERE id=(SELECT id FROM battle_records LIMIT 1)").run();db.close();
 await assert.rejects(updateProject({env:{},source:f.source,target:f.project,stopped:true}),/待结算|账号锁/);assert.equal(JSON.parse(await fs.readFile(path.join(f.project,'package.json'),'utf8')).version,'0.9.13');
});
test('tampered, private and traversal release entries cannot overwrite deployment state',async t=>{
 const f=await fixture(t);await fs.writeFile(path.join(f.source,'shared/constants.js'),'tampered');await assert.rejects(updateProject({env:{},source:f.source,target:f.project,stopped:true}),/校验失败/);await f.assertProtected();
 for(const name of ['config/server.env','../private/auth-users.json','mobile/android/.signing/release.p12']){await fs.writeFile(path.join(f.source,'SERVER-RELEASE.json'),JSON.stringify({...f.manifest,files:[{path:name,sha256:'a'.repeat(64),size:1}]}));await assert.rejects(updateProject({env:{},source:f.source,target:f.project,stopped:true}),/不合法/);await f.assertProtected();}
});
test('update requires explicit stopped state and independent source directory',async t=>{const f=await fixture(t);await assert.rejects(updateProject({env:{},source:f.source,target:f.project}),/停止服务器|停止服务/);await assert.rejects(updateProject({env:{},source:f.project,target:f.project,stopped:true}),/不能相同/);await f.assertProtected();});
