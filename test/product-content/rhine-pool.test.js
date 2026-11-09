import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {TestContent} from '../../server/test-content.js';
import {GameData} from '../../server/match/gamedata.js';
import {SharedPool} from '../../server/match/pool.js';
import {buildRhineData} from '../../server/sim/content/rhine/data.js';
import {makeMatch,give,checkInvariants} from '../match/harness.js';
const BASE=getData(),ID='chess_char_6_11_a',catalog=new TestContent();
const resolve=(mode,ids=['rhine-lab-v1'],data=BASE)=>catalog.resolve({version:catalog.version,ids},{mode,difficulty:'NORMAL'},data,{admin:true});
const pool=data=>new SharedPool(new GameData(data,'mode_multi_normal'));

test('Rhine adds exactly two shared copies only in coop; solo, unselected and formal data remain unchanged',()=>{
 const before=JSON.stringify(BASE),ordinary=pool(BASE);assert.equal(ordinary.cap(ID),10);
 for(const [mode,ids,expected]of [['coop',['rhine-lab-v1'],12],['solo',['rhine-lab-v1'],10],['coop',[],10],['solo',[],10]]){
  const result=resolve(mode,ids);assert.equal(pool(result.data).cap(ID),expected);assert.equal(result.manifest?.clientVersion??0,ids.length?33:0);
 }
 assert.equal(JSON.stringify(BASE),before);assert.equal(pool(resolve('coop').data).cap(ID),12,'new matches do not accumulate bonuses');
});
test('50% inventory and Rhine combine as upstream enlarged pool plus two, independent of UI selection order',()=>{
 assert.equal(pool(resolve('coop',['coop-pool-150']).data).cap(ID),16);
 for(const ids of [['rhine-lab-v1','coop-pool-150'],['coop-pool-150','rhine-lab-v1']]){
  const data=resolve('coop',ids).data,p=pool(data);assert.equal(p.cap(ID),18);const base=pool(resolve('coop',['coop-pool-150']).data);for(const [id,e]of base.entries)assert.equal(p.cap(id),e.cap+(id===ID?2:0),id);
 }
});
test('The pool bonus changes no other operator and does not add a separate elite pool or bypass bans',()=>{
 const before=pool(buildRhineData(BASE)),after=pool(resolve('coop').data);assert.equal(after.entries.size,before.entries.size);
 for(const [id,e]of before.entries)assert.equal(after.cap(id),e.cap+(id===ID?2:0),id);
 assert.equal(after.has(ID.replace(/_a$/,'_b')),false);const banned=new SharedPool(new GameData(resolve('coop').data,'mode_multi_normal'),{banned:[ID]});assert.equal(banned.has(ID),false);assert.equal(banned.take(ID,1),0);
 const customized=structuredClone(BASE);customized.config.economy.poolCopiesOverrides[ID]=7;assert.equal(pool(resolve('coop',['rhine-lab-v1'],customized).data).cap(ID),16);assert.equal(customized.config.economy.poolCopiesOverrides[ID],7);
});
test('Two, three and four-player real Matches share one twelve-copy pool; reconnect never adds copies',()=>{
 for(const humans of [2,3,4]){
  const h=makeMatch({data:resolve('coop').data,mode:'coop',humans,fake:true}).start();h.toPrep(1);assert.equal(h.m.pool.cap(ID),12);const initial=h.m.pool.left(ID);h.m.onReconnect('p_0');h.m.onReconnect('p_0');assert.equal(h.m.pool.cap(ID),12);assert.equal(h.m.pool.left(ID),initial);checkInvariants(h.m);h.m.dispose();
 }
});
test('Expanded pool supports four elites; sales and eliminations return exactly the held copies',()=>{
 const h=makeMatch({data:resolve('coop').data,mode:'coop',humans:2,fake:true}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0'),q=h.ps('p_1'),elite=ID.replace(/_a$/,'_b');
 const a=give(m,p,elite);give(m,p,elite);give(m,q,elite);give(m,q,elite);assert.equal(m.pool.left(ID),0);assert.equal(m.pool.take(ID),0);checkInvariants(m);
 assert.deepEqual(m.handle('p_0',{t:'g.sell',uid:a.uid}),{ok:true});assert.equal(m.pool.left(ID),3);checkInvariants(m);q.eliminate(1);assert.equal(m.pool.left(ID),9);checkInvariants(m);p.eliminate(1);assert.equal(m.pool.left(ID),12);checkInvariants(m);assert.equal(m.pool.give(ID,2),0);m.dispose();
});
