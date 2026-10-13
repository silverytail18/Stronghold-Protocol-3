import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startServer} from '../../server/index.js';
import {TestClient} from '../helpers/wsClient.js';
import {getData} from '../../server/data.js';
import {TestContent} from '../../server/test-content.js';
const EXP='arknights-expansion-v1',RI='rhodes-mujica-v1';
async function fixture(t,version){
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  srv.lobby.testContentAccess.publicIds=[EXP,RI,'opening-bans-4-6','extended-rounds-20'];
  const c=await TestClient.connect(srv.url.replace('http','ws')+'/ws');t.after(()=>c.close());c.playerId=(await c.hello('雪境向导版本验证',undefined,{testContentVersion:version})).playerId;
  await c.request({t:'room.create',mode:'solo',difficulty:'HARD',ranked:false});const room=await c.waitFor('room.state');return {srv,c,room};
}
for(const version of [14,15,16,17])test(`Capability${version} rejects corrected Sui / Penguin and RI before match creation`,async t=>{
  const {srv,c,room}=await fixture(t,version);const denied=await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[EXP]}});
  assert.equal(denied.t,'error');assert.equal(srv.lobby.rooms.get(room.code).match,null);
  assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[RI]}})).t,'error');assert.equal(srv.lobby.rooms.get(room.code).match,null);
});
test('Capability27 starts combined rebalanced RI / guide / opening bans / twenty rounds and rejects downgrade on resume',async t=>{
  const {srv,c,room}=await fixture(t,27);assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[EXP,RI,'opening-bans-4-6','extended-rounds-20']}})).t,'ok');
  const match=srv.lobby.rooms.get(room.code).match;assert.equal(match.testRules.clientVersion,27);assert.ok(match.testRules.batches.some(b=>b.id===RI&&b.version==='ri-mujica-test-15'));assert.ok(match.testRules.batches.some(b=>b.id===EXP&&b.version==='expansion-test-9'));
  const session=srv.lobby.registry.byId(c.playerId);assert.equal(srv.lobby.canResumeTestContent(session,19),false);assert.equal(srv.lobby.canResumeTestContent(session,27),true);
});
test('Capability18 also starts the corrected guide alone',async t=>{
  const {srv,c,room}=await fixture(t,18);
  assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[RI]}})).t,'error');assert.equal(srv.lobby.rooms.get(room.code).match,null);
  assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[EXP]}})).t,'ok');assert.equal(srv.lobby.rooms.get(room.code).match.testRules.clientVersion,18);
});

for(const version of [19,20,25,26])test(`Capability${version} cannot start rebalanced RI`,async t=>{
 const {srv,c,room}=await fixture(t,version);assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[RI]}})).t,'error');assert.equal(srv.lobby.rooms.get(room.code).match,null);
});
test('Both published opening-ban variants compose with guide and current RI without changing baseline or either batch version',()=>{
  const base=getData({log:{info(){},warn(){},error(){}}}),before=JSON.stringify(base),tc=new TestContent(),room={mode:'solo',difficulty:'HARD'},menu=tc.menu(room);
  for(const ban of ['opening-bans-4-6','opening-bans-5-8']){const x=tc.resolve({version:menu.version,ids:[EXP,RI,ban]},room,base);assert.equal(x.manifest.clientVersion,27);assert.equal(x.data.bonds.snowfieldGuideShip.bb.coldCooldown,12);assert.equal(x.data.bonds.rhodesShip.visibleMembers.length,13);assert.ok(x.manifest.batches.some(b=>b.id===RI&&b.version==='ri-mujica-test-15'));}
  assert.equal(JSON.stringify(base),before);assert.equal(menu.items.find(b=>b.id===RI).clientVersion,27);
});
