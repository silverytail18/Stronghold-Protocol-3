import test from 'node:test';import assert from 'node:assert/strict';
import {operatorConflicts} from '../../server/product/operator-conflicts.js';
import {ProductContentPolicy} from '../../server/product/content-policy.js';
test('new official roster admission blocks the whole package by identity, independent of chess ID and elite form',()=>{
  const identities={pack:[{charId:'char_future',name:'未来干员'}]},data={chess:{future_renamed:{charId:'char_future',visible:true,isGolden:true}}};
  assert.equal(operatorConflicts('pack','future',{data,identities}).length,1);
  data.chess.future_renamed.isDiy=true;assert.deepEqual(operatorConflicts('pack','future',{data,identities}),[]);
});
test('current earlier-period conflicts cannot be bypassed by admin settings or match freeze, act2 stays usable',async()=>{
  const p=new ProductContentPolicy('unused');for(const rule of Object.values(p.doc.items)){rule.public=true;rule.versions=['act1autochess','act2autochess'];}
  const row=p.view({version:'act1autochess',admin:true}).items.find(x=>x.id==='rhine-lab-v1');assert.equal(row.enabled,false);assert.deepEqual(row.operatorConflicts.map(c=>c.name),['星源','淬羽赫默','伊芙利特']);
  assert.throws(()=>p.freeze('act1autochess',['rhine-lab-v1'],{admin:true}),/本体已包含干员/);
  await assert.rejects(p.update({revision:0,items:[{id:'rhine-lab-v1',public:true,versions:['act1autochess']}]},'admin'),/本体已包含干员/);
  assert.deepEqual(p.freeze('act2autochess',['rhine-lab-v1'],{admin:true}).custom,['rhine-lab-v1']);
});
