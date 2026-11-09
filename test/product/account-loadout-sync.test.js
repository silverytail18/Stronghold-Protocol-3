import test from 'node:test';import assert from 'node:assert/strict';
import http from 'node:http';
import {LoadoutPreferences} from '../../server/product/loadout-preferences.js';
import {accountChoices,accountOps,accountByCharValid,accountOpsValid} from '../../shared/account-loadout.js';
import {productFixture,login} from './fixture.js';

test('legacy dirty cache fields reproduce whole-account rejection; canonical choices preserve valid skills/modules',async()=>{
  const s=new LoadoutPreferences(),dirty={char_1050_chen3:{skill:2,module:null,skin:'char_1050_chen3#1'},char_2023_ling:{module:'uniequip_002_ling'},char_002_amiya:{},chess_old:{skill:1}},ops={char_1050_chen3:{potential:3,cultivate:2,legacy:true}};
  await assert.rejects(s.save('fixture',{revision:0,entries:{},byChar:dirty,ops}),/账号干员调配格式无效/);
  const byChar=accountChoices(dirty),cleanOps=accountOps(ops);assert.equal(accountByCharValid(byChar),true);assert.equal(accountOpsValid(cleanOps),true);
  const saved=await s.save('fixture',{revision:0,entries:{},byChar,ops:cleanOps,skins:{char_1050_chen3:'char_1050_chen3#1'}});
  assert.deepEqual(saved.byChar,{char_1050_chen3:{skill:2},char_2023_ling:{module:'uniequip_002_ling'}});
  assert.deepEqual(saved.ops,{char_1050_chen3:{potential:3,cultivate:2}});
});

test('skins and choices share a revision, persist through restart and remain compatible with old clients without losing other accounts',async t=>{
  const f=await productFixture();t.after(()=>f.close());let s=await f.start();const a=await login(s.url),id=f.users[0].accountId,member=f.users[1].accountId;
  const endpoint=http.createServer((req,res)=>{void s.product.loadouts.handle(req,res,s.product.auth);});
  await new Promise(resolve=>endpoint.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>{endpoint.closeAllConnections();endpoint.close(resolve);}));const url='http://127.0.0.1:'+endpoint.address().port;
  await s.product.loadouts.save(member,{revision:0,entries:{},byChar:{char_2023_ling:{skill:1}}});
  const request=async body=>{const r=await fetch(url+'/product/loadout',{method:'PUT',headers:{Origin:url,Cookie:a.cookie,'Content-Type':'application/json'},body:JSON.stringify(body)});return{status:r.status,body:await r.json()};};
  const choices={char_1050_chen3:{skill:2,module:'uniequip_002_chen3'}},skins={char_1050_chen3:'char_1050_chen3#1'};
  const body={accountId:id,revision:0,entries:{},byChar:choices,ops:{},skins};const saved=await request(body);assert.equal(saved.status,200);assert.deepEqual(saved.body.skins,skins);assert.deepEqual(saved.body.entries,{char_1050_chen3:{skin:skins.char_1050_chen3}});
  assert.equal((await request(body)).status,409);
  assert.equal((await request({...body,accountId:member,revision:1})).status,409);
  assert.equal((await request({...body,revision:1,skins:{char_1050_chen3:'bad/skin'}})).status,400);
  const old=await request({accountId:id,revision:1,entries:{char_1050_chen3:{skin:'char_1050_chen3#2'}}});assert.equal(old.status,200);assert.equal(old.body.skins.char_1050_chen3,'char_1050_chen3#2');assert.deepEqual(old.body.byChar,choices);
  await f.stop();s=await f.start();assert.equal(s.product.loadouts.view(id).skins.char_1050_chen3,'char_1050_chen3#2');assert.deepEqual(s.product.loadouts.view(id).byChar,choices);assert.deepEqual(s.product.loadouts.view(member).byChar,{char_2023_ling:{skill:1}});
  assert.deepEqual(s.product.ranked.records(member),f.expected.records);
  const current=s.product.loadouts.view(id);const cleared=await s.product.loadouts.save(id,{revision:current.revision,entries:current.entries,skins:{}});assert.deepEqual(cleared.entries,{});assert.deepEqual(cleared.skins,{});assert.deepEqual(cleared.byChar,choices);
});
