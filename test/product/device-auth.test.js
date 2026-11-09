import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {DeviceAuth} from '../../server/product/device-auth.js';
import {productFixture} from './fixture.js';
test('remembered device survives restart; credentials, disable, expiry and explicit revoke invalidate it',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-device-')),file=path.join(dir,'devices.sqlite');
 const user={accountId:'stable-id',username:'test',passwordHash:'password-hash',role:'user',disabled:false,mustChangePassword:false},users=new Map([[user.username,user]]);
 let devices=new DeviceAuth(file);try{
  devices.remember('hashed-token',user,1000,'测试设备',1);devices.close();devices=new DeviceAuth(file);
  assert.ok(devices.restore('hashed-token',users,10));assert.equal(devices.list(user.accountId,'hashed-token')[0].current,true);
  users.set('test',{...user,passwordHash:'changed'});assert.equal(devices.restore('hashed-token',users,11),null);
  users.set('test',user);devices.remember('new-hash',user,1000,'测试设备',12);devices.revokeUser('test');assert.equal(devices.restore('new-hash',users,13),null);
  devices.remember('expired',user,20,'测试设备',14);assert.equal(devices.restore('expired',users,21),null);
  devices.remember('disabled',user,1000,'测试设备',22);users.set('test',{...user,disabled:true});assert.equal(devices.restore('disabled',users,23),null);
 }finally{devices.close();await fs.rm(dir,{recursive:true,force:true});}
});
test('HTTP remembered login survives service restart and explicit revocation invalidates its cookie',async t=>{
 const f=await productFixture();t.after(()=>f.close());let s=await f.start();
 const response=await fetch(s.url+'/auth/login',{method:'POST',headers:{Origin:s.url,'Content-Type':'application/json'},body:JSON.stringify({username:'member',password:'fixture-pass',remember:true})});
 assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/Max-Age=2592000/);const cookie=response.headers.get('set-cookie').split(';')[0];
 await f.stop();s=await f.start();assert.equal((await fetch(s.url+'/auth/session',{headers:{Cookie:cookie}}).then(r=>r.json())).authenticated,true);
 const devices=await fetch(s.url+'/auth/devices',{headers:{Cookie:cookie}}).then(r=>r.json());assert.equal(devices.devices.length,1);assert.equal(devices.devices[0].current,true);
 assert.equal((await fetch(s.url+'/auth/devices',{method:'POST',headers:{Origin:s.url,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({id:devices.devices[0].id})})).status,200);
 assert.equal((await fetch(s.url+'/auth/session',{headers:{Cookie:cookie}}).then(r=>r.json())).authenticated,false);
});
