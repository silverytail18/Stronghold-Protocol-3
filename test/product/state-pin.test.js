import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {productFixture} from './fixture.js';import {statePin} from '../../server/product/state-pin.js';import {LoadoutPreferences} from '../../server/product/loadout-preferences.js';
test('known private files and paths cannot silently change into an empty database on a later startup',async t=>{
  const f=await productFixture();t.after(()=>f.close());const paths={directory:f.state,usersFile:f.authFile,rankedFile:path.join(f.state,'ranked.sqlite')};
  const pin=await statePin(f.project,paths);await pin.save();await statePin(f.project,paths,{generation:{format:1}});
  await assert.rejects(statePin(f.project,{...paths,rankedFile:path.join(f.state,'new-empty.sqlite')}),/路径.*不一致/);
  await fs.rename(paths.rankedFile,paths.rankedFile+'.fixture-kept');await assert.rejects(statePin(f.project,paths),/持久化文件已缺失/);
  await fs.rename(paths.rankedFile+'.fixture-kept',paths.rankedFile);
});
test('canonical account choices survive old-client saves and reloads, with bounded prior revisions',async t=>{
  const f=await productFixture();t.after(()=>f.close());const file=path.join(f.state,'operator-loadouts.json'),store=await LoadoutPreferences.load(file),id=f.users[0].accountId;
  const byChar={char_1050_chen3:{skill:2,module:'uniequip_002_chen3'}},ops={char_1050_chen3:{potential:6,cultivate:3}};
  await store.save(id,{revision:0,entries:{legacy_id:{skill:1}},byChar,ops});
  for(let revision=1;revision<=5;revision++)await store.save(id,{revision,entries:{legacy_id:{skill:revision%3}}});
  const again=await LoadoutPreferences.load(file);assert.deepEqual(again.view(id).byChar,byChar);assert.deepEqual(again.view(id).ops,ops);
  assert.equal(again.accounts[id].recentVersions.length,3);assert.deepEqual(again.accounts[id].recentVersions[0].byChar,byChar);
  await assert.rejects(again.save(id,{revision:6,entries:{},byChar:{wrong:{skill:1}}}),/格式无效/);
  assert.deepEqual((await LoadoutPreferences.load(file)).view(id).byChar,byChar);
});
test('administrator UUID, loadout, historical records and source files survive service shutdown and restart',async t=>{
  const f=await productFixture();t.after(()=>f.close());let s=await f.start();const id=f.users[0].accountId,authBefore=await fs.readFile(f.authFile);
  await s.product.loadouts.save(id,{revision:0,entries:{char_1050_chen3:{skin:'char_1050_chen3#1'}},byChar:{char_1050_chen3:{skill:2}},ops:{char_1050_chen3:{potential:6,cultivate:3}}});
  const seats=[{accountId:id,playerId:'admin-seat',name:'fixture',isBot:false}],match=s.product.ranked.start({mode:'solo',difficulty:'NORMAL',roomCode:'KEEP-ADMIN',seats});
  s.product.ranked.finish(match.id,{victory:true,reason:'victory',roundsPassed:14,errors:0,players:seats});const before=s.product.ranked.records(id);
  assert.ok(before.rows.length);await f.stop();s=await f.start();assert.deepEqual(s.product.ranked.records(id),before);
  assert.equal(s.product.auth.users.get('admin').accountId,id);assert.equal(s.product.loadouts.view(id).byChar.char_1050_chen3.skill,2);
  assert.equal(s.product.loadouts.view(id).ops.char_1050_chen3.potential,6);assert.deepEqual(await fs.readFile(f.authFile),authBefore);
});
