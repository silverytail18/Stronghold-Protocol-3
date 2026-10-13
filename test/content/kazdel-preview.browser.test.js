import {test} from 'node:test';import assert from 'node:assert/strict';
import {startKazdelPreview} from '../../tools/preview-kazdel.mjs';
import {BATCH} from '../../server/sim/content/kazdel/data.js';
test('independent preview opens a native app session and selects Kazdel in a real room',{skip:process.env.KAZDEL_BROWSER_QA==='1'?false:'set KAZDEL_BROWSER_QA=1; requires Chrome'},async t=>{
 const preview=await startKazdelPreview({port:0,headless:true});t.after(()=>preview.close());
 assert.equal(preview.auth,null);assert.equal(preview.ranked,null);assert.deepEqual(preview.lobby.testContentAccess.publicIds,[BATCH]);
 const pages=await preview.browser.pages(),page=pages.at(-1);
 await page.waitForFunction(()=>globalThis.__SP__?.store.get().connection.status==='online'&&document.querySelector('.lobby-screen'),{timeout:30000});
 const result=await page.evaluate(async batch=>{
  await __SP__.net.request('room.create',{mode:'solo',difficulty:'NORMAL'});
  const state=__SP__.store.get();return{room:state.room,batch};
 },BATCH);
 const room=result.room?.state||result.room;
 assert.ok(room.testMenu.items.some(i=>i.id===BATCH&&i.enabled));
 await page.evaluate(async({batch,version})=>{await __SP__.net.request('room.start',{tests:{version,ids:[batch]}});},{batch:BATCH,version:room.testMenu.version});
 await page.waitForFunction(()=>__SP__.store.get().match.public?.phase==='INFO_CHECK',{timeout:30000});
 const pack=await page.evaluate(()=>__SP__.store.get().match.public.testRules);
 assert.ok(pack.batches.some(i=>i.id===BATCH));
 await page.evaluate(()=>__SP__.net.request('g.leave',{}));
});
