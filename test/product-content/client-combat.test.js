import test from'node:test';import assert from'node:assert/strict';
import{getVersionData}from'../../server/data.js';import{composeProductData}from'../../server/product/content-data.js';import{makeMatch,give,legalTileFor}from'../match/harness.js';
import{operatorConflicts}from'../../server/product/operator-conflicts.js';
const cases=[['arknights-expansion-v1','egirShip'],['rhodes-mujica-v1','rhodesShip'],['kazdel-expansion-v1','kazdelShip'],['rhine-lab-v1','rhineShip'],['higashi-expansion-v1','higashiShip'],['ursus-expansion-v1','ursusShip'],['iberia-expansion-v1','iberiaShip']];
for(const version of ['act1autochess','act1autochess@V1_1','act2autochess@V2_1','act2autochess'])for(const[id,bond]of cases){
 const blocked=operatorConflicts(id,version).length>0;
 test(`${version}: ${id} ${blocked?'unreviewed overlap refuses composition':'actual client battle and server result acceptance'}`,()=>{
 if(blocked){assert.throws(()=>composeProductData(getVersionData(version),[id],{version,mode:'solo'}),/本体已包含干员/);return;}
 const data=composeProductData(getVersionData(version),[id],{version,mode:'solo'}),h=makeMatch({data,mode:'solo',clientCombat:true,verify:'all'}).start().toPrep(1),p=h.ps('p_0');
 try{
  p.deployCapMin=10;
  const records=Object.values(data.chess).filter(c=>c.visible&&!c.isGolden&&c.bonds?.includes(bond)).slice(0,9);
  assert.ok(records.length>=3,bond);
  for(const record of records){const at=legalTileFor(h.m,p,record.chessId);if(at)give(h.m,p,record.chessId,'board',at);}
  p.recompute();assert.ok(p.bonds[bond]?.active,bond);
  h.toPrep(2);
  const client=h.clients.get('p_0');assert.ok(client.log.some(msg=>msg.t==='b.result'));
  for(const entry of client.battles.values())assert.deepEqual(entry.battle.errors,[],id);
  assert.deepEqual(h.logs.error,[],id);
  assert.ok(!h.logs.warn.some(msg=>/rejected client result|differs from the server|product carry|exception/.test(msg)),h.logs.warn.join('\n'));
  assert.equal(h.m.verifyStats.mismatches,0);
 }finally{h.m.dispose();h.clients?.forEach(client=>client.close());}
});
}
