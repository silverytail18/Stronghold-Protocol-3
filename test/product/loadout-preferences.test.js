import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {LoadoutPreferences} from '../../server/product/loadout-preferences.js';import {productFixture} from './fixture.js';
test('legacy operator choices, skins and unknown extension fields survive a new upstream preference save',async t=>{
 const f=await productFixture();t.after(()=>f.close());const id=f.users[1].accountId,file=path.join(f.state,'operator-loadouts.json'),legacy={revision:17,entries:{old_custom_operator:{skill:2,module:'CUSTOM_X',skin:'retained_skin'},upstream_operator:{skill:1}},extra:{keep:true}};
 await fs.writeFile(file,JSON.stringify({format:1,accounts:{[id]:legacy,retired_account:{revision:3,entries:{retired_custom:{skill:0}}}},extension:{schemaNote:'preserve'}}));
 const store=await LoadoutPreferences.load(file,[path.join(f.project,'public')]);assert.deepEqual(store.view(id).entries,legacy.entries);
 await store.save(id,{revision:17,entries:{old_custom_operator:legacy.entries.old_custom_operator,upstream_operator:{skill:2,module:'none'}}});
 const after=JSON.parse(await fs.readFile(file,'utf8'));assert.deepEqual(after.extension,{schemaNote:'preserve'});assert.deepEqual(after.accounts[id].extra,{keep:true});assert.deepEqual(after.accounts[id].legacyBeforeRebase,legacy);assert.equal(after.accounts.retired_account.revision,3);assert.equal(after.accounts[id].entries.old_custom_operator.skin,'retained_skin');
 const frozen=structuredClone(after.accounts[id].legacyBeforeRebase);await store.save(id,{revision:18,entries:{upstream_operator:{skill:0}}});assert.deepEqual(JSON.parse(await fs.readFile(file)).accounts[id].legacyBeforeRebase,frozen);
});
test('preference revision conflicts, revoked authorization and invalid format do not overwrite data',async t=>{
 const f=await productFixture();t.after(()=>f.close());const file=path.join(f.state,'operator-loadouts.json'),store=await LoadoutPreferences.load(file),id=f.users[1].accountId;await store.save(id,{revision:0,entries:{operator:{skill:0}}});const before=await fs.readFile(file);
 await assert.rejects(store.save(id,{revision:0,entries:{operator:{skill:1}}}),{status:409});await assert.rejects(store.save(id,{revision:1,entries:{operator:{skill:1}}},()=>{throw Error('revoked');}),/revoked/);await assert.rejects(store.save(id,{revision:1,entries:{operator:{skill:999}}}),/格式无效/);assert.deepEqual(await fs.readFile(file),before);
});
