import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startServer} from '../../server/index.js';
import {TestClient} from '../helpers/wsClient.js';
const KZ='kazdel-expansion-v1',RI='rhodes-mujica-v1',EXP='arknights-expansion-v1';
async function fixture(t,version){
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());srv.lobby.testContentAccess.publicIds=[KZ,RI,EXP,'extended-rounds-24'];
 const c=await TestClient.connect(srv.url.replace('http','ws')+'/ws');t.after(()=>c.close());c.playerId=(await c.hello('卡兹戴尔兼容验证',undefined,{testContentVersion:version})).playerId;
 await c.request({t:'room.create',mode:'solo',difficulty:'HARD',ranked:false});return{srv,c,room:await c.waitFor('room.state')};
}
for(const version of [17,20,23])test(`Capability ${version} cannot create a revised Kazdel match`,async t=>{
 const {srv,c,room}=await fixture(t,version);assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[KZ]}})).t,'error');assert.equal(srv.lobby.rooms.get(room.code).match,null);
});
test('Capability 28 starts revised Kazdel alongside updated RI, expansion and 24 rounds; downgrade cannot resume',async t=>{
 const {srv,c,room}=await fixture(t, 28);assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:[KZ,RI,EXP,'extended-rounds-24']}})).t,'ok');
 const m=srv.lobby.rooms.get(room.code).match;assert.equal(m.testRules.clientVersion, 28);for(const [id,version]of [[KZ,'kazdel-test-9'],[RI,'ri-mujica-test-15'],[EXP,'expansion-test-9']])assert.ok(m.testRules.batches.some(b=>b.id===id&&b.version===version));
 const session=srv.lobby.registry.byId(c.playerId);assert.equal(srv.lobby.canResumeTestContent(session,20),false);assert.equal(srv.lobby.canResumeTestContent(session, 28),true);
});
