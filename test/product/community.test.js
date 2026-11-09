import test from 'node:test';
import assert from 'node:assert/strict';
import {productFixture,login} from './fixture.js';
test('presentation is persistent, public history is sanitized, invitation expiry follows room identity',async t=>{
 const f=await productFixture();t.after(()=>f.close());let server=await f.start();let {cookie}=await login(server.url,'member');
 const request=(route,body)=>fetch(server.url+route,{headers:{Cookie:cookie,Origin:server.url,...(body?{'Content-Type':'application/json'}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});
 let view=await request('/community/me').then(r=>r.json());assert.equal(view.presentation.number,2);
 assert.equal((await request('/community/presentation',{...view.presentation,nickname:'朋友甲',motto:'一起作战',frame:'gold',namecard:'night',avatar:''})).status,200);
 assert.equal((await request('/community/presentation',{...view.presentation,nickname:'过期写入',frame:'mint',namecard:'standard',avatar:''})).status,409);
 const directory=await request('/community/players').then(r=>r.json());assert.equal(directory.players.find(p=>p.accountId===f.users[1].accountId).nickname,'朋友甲');assert.ok(!JSON.stringify(directory).includes('passwordHash'));
 const id=f.expected.records.rows[0].id;const record=await request('/community/record?accountId='+f.users[1].accountId+'&id='+id).then(r=>r.json());assert.ok(record.summary);assert.ok(!JSON.stringify(record).includes('passwordHash'));
 assert.equal((await request('/auth/admin/ranked/upgrade',{name:'新季',reason:'越权',confirm:'保留对局并清理旧赛季'})).status,403);
 await f.stop();server=await f.start();({cookie}=await login(server.url,'member'));view=await request('/community/me').then(r=>r.json());assert.equal(view.presentation.nickname,'朋友甲');assert.equal(view.presentation.frame,'gold');
});
