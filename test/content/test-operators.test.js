import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeMatch,DATA} from '../match/harness.js';
import {buildExpansionData,SHU,AGLNA2} from '../../server/sim/content/expansion/expansion-data.js';
import {validateC2S} from '../../shared/protocol.js';
import {buildRhodesMujicaData,GIRLS,BATCH,KALTS2,NEARL} from '../../server/sim/content/rhodes-mujica/data.js';
import {CLEMNT} from '../../server/sim/content/expansion/clemnt-data.js';
const raw=buildRhodesMujicaData(buildExpansionData(DATA));
test('Girl Band grant catalog is private, mixed-grade, atomic, pool-free and first-prep only',()=>{
  const h=makeMatch({data:buildRhodesMujicaData(DATA),humans:2,fake:true}).start();h.toPrep(1);
  const m=h.m,p=h.ps('p_0'),q=h.ps('p_1');m.testRules={batches:[{id:BATCH}]};m.canTestOperators=id=>id===p.playerId;p.hand.fill(null);
  const selections=GIRLS.map((baseId,i)=>({baseId,elite:i%2===0}));
  const claim=()=>m.handle(p.playerId,{t:'g.testOperators',selections});
  assert.ok(claim().error);assert.ok(m.handle(p.playerId,{t:'g.testOperatorsEnabled',enabled:true}).ok);
  m.markPrivate(p);m.markPrivate(q);m.flush(true);
  assert.deepEqual(h.lastTo(p.playerId,'m.private').testOperators.catalog.map(c=>c.baseId).sort(),[AGLNA2,KALTS2,NEARL,...GIRLS].sort());
  assert.equal(h.lastTo(q.playerId,'m.private').testOperators,undefined);
  for(let i=0;i<p.hand.length-4;i++)p.hand[i]=p.newPiece('chess',GIRLS[0]);
  const before=JSON.stringify(p.hand),pool=JSON.stringify([...m.pool.entries]),other=JSON.stringify(q.privateView());
  assert.equal(claim().error,'HAND_FULL');assert.equal(JSON.stringify(p.hand),before);assert.ok(!p.testOperatorsClaimed);
  p.hand.fill(null);assert.ok(claim().ok);
  assert.deepEqual(p.hand.filter(c=>c?.meta?.testOperator).map(c=>c.id).sort(),selections.map(c=>c.elite?c.baseId.replace(/_a$/,'_b'):c.baseId).sort());
  assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.equal(JSON.stringify(q.privateView()),other);assert.ok(claim().error);
  h.invariants();m.phase='COMBAT';m.markPrivate(p);m.flush(true);assert.equal(h.lastTo(p.playerId,'m.private').testOperators,undefined);assert.ok(claim().error);
});
test('Girl Band grants require the enabled batch and current administrator permission',()=>{
  const h=makeMatch({data:buildRhodesMujicaData(DATA),humans:1,fake:true}).start();h.toPrep(1);
  const m=h.m,p=h.ps('p_0');p.testOperatorsEnabled=true;m.canTestOperators=()=>true;
  const claim=()=>m.handle(p.playerId,{t:'g.testOperators',selections:[{baseId:GIRLS[0],elite:false}]});
  m.testRules=null;assert.ok(claim().error);m.testRules={batches:[{id:BATCH}]};m.canTestOperators=()=>false;
  assert.ok(claim().error);assert.ok(!p.testOperatorsClaimed);assert.ok(!p.hand.some(c=>c?.meta?.testOperator));
});
function prep(){const h=makeMatch({data:structuredClone(raw),humans:2,fake:true}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0'),q=h.ps('p_1');m.testRules={batches:[{id:'arknights-expansion-v1'},{id:BATCH}]};m.canTestOperators=id=>id===p.playerId;p.testOperatorsEnabled=true;
  return{h,m,p,q,claim:elite=>m.handle(p.playerId,{t:'g.testOperators',selections:[SHU,AGLNA2].map(baseId=>({baseId,elite}))})};}
test('Quick-test protocol only accepts an explicit boolean choice',()=>{
  assert.equal(validateC2S({t:'g.testOperators',elite:true}),null);
  for(const elite of [undefined,'true',0,null])assert.ok(validateC2S({t:'g.testOperators',elite}));
});
test('Quick-test switch defaults off, is owner-only, reversible before claim and resets next match',()=>{
  const {h,m,p,q,claim}=prep();delete p.testOperatorsEnabled;const pool=JSON.stringify([...m.pool.entries]),other=JSON.stringify(q.privateView());
  const toggle=enabled=>m.handle(p.playerId,{t:'g.testOperatorsEnabled',enabled});
  assert.ok(claim(false).error);m.markPrivate(p);m.flush(true);assert.equal(h.lastTo(p.playerId,'m.private').testOperators.enabled,false);
  assert.equal(h.lastTo(p.playerId,'m.private').testOperators.available,false);
  assert.ok(m.handle(q.playerId,{t:'g.testOperatorsEnabled',enabled:true}).error);assert.ok(toggle(true).ok);assert.ok(toggle(false).ok);assert.ok(claim(false).error);
  assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.equal(JSON.stringify(q.privateView()),other);
  assert.ok(toggle(true).ok);m.onDisconnect(p.playerId);m.onReconnect(p.playerId);assert.equal(p.testOperatorsEnabled,true);
  assert.ok(claim(false).ok);assert.ok(toggle(false).error);
  const next=prep();delete next.p.testOperatorsEnabled;assert.ok(next.claim(false).error);
});
test('Toggle rejects absent package, revoked role, ready and combat phases without altering its owner',()=>{
  const {m,p}=prep(),toggle=()=>m.handle(p.playerId,{t:'g.testOperatorsEnabled',enabled:false});m.testRules=null;assert.ok(toggle().error);m.testRules={batches:[{id:'arknights-expansion-v1'}]};m.canTestOperators=()=>false;assert.ok(toggle().error);m.canTestOperators=()=>true;
  p.ready=true;assert.ok(toggle().error);p.ready=false;m.phase='COMBAT';assert.ok(toggle().error);assert.equal(p.testOperatorsEnabled,true);
  assert.ok(validateC2S({t:'g.testOperatorsEnabled',enabled:'true'}));assert.equal(validateC2S({t:'g.testOperatorsEnabled',enabled:false}),null);
});
test('First prep deadline hides controls and refuses unclaimed grants in combat, later prep and reconnect',()=>{
  const {h,m,p,q,claim}=prep();delete p.testOperatorsEnabled;
  const toggle=()=>m.handle(p.playerId,{t:'g.testOperatorsEnabled',enabled:true});
  m.markPrivate(p);m.markPrivate(q);m.flush(true);
  assert.equal(h.lastTo(p.playerId,'m.private').testOperators.enabled,false);
  assert.equal(h.lastTo(q.playerId,'m.private').testOperators,undefined);
  assert.ok(toggle().ok);const hand=JSON.stringify(p.hand),pool=JSON.stringify([...m.pool.entries]);
  for(const [phase,round] of [['COMBAT',1],['PREP',2],['PREP',13]]){
    m.phase=phase;m.round=round;m.markPrivate(p);m.flush(true);
    assert.equal(h.lastTo(p.playerId,'m.private').testOperators,undefined);
    assert.ok(toggle().error);assert.ok(claim(false).error);assert.ok(claim(true).error);
    m.onDisconnect(p.playerId);m.onReconnect(p.playerId);
    assert.equal(h.lastTo(p.playerId,'m.private').testOperators,undefined);
  }
  assert.equal(JSON.stringify(p.hand),hand);assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.ok(!p.testOperatorsClaimed);
});
for(const elite of [false,true])test(`Atomic ${elite?'elite':'normal'} grant uses no shared copies and changes only its owner`,()=>{
  const {h,m,p,q,claim}=prep(),pool=JSON.stringify([...m.pool.entries]),teammate=JSON.stringify(q.privateView()),funds=p.funds,offers=JSON.stringify(p.offers),stats=JSON.stringify(p.stats);
  assert.ok(claim(elite).ok);const copies=p.hand.filter(c=>c?.meta?.testOperator);assert.deepEqual(copies.map(c=>c.id).sort(),[SHU,AGLNA2].map(id=>elite?id.replace(/_a$/,'_b'):id).sort());
  assert.ok(copies.every(c=>c.poolCopies===0));assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.equal(JSON.stringify(q.privateView()),teammate);assert.equal(p.funds,funds);assert.equal(JSON.stringify(p.offers),offers);assert.equal(JSON.stringify(p.stats),stats);assert.ok(claim(elite).error);
  m.flush(true);assert.equal(h.lastTo(p.playerId,'m.private').testOperators.claimed,true);assert.equal(h.lastTo(q.playerId,'m.private').testOperators,undefined);assert.ok(!JSON.stringify(m.publicView()).includes('testOperators'));h.invariants();
});
test('Disabled package, ordinary player and revoked real role refuse before any grant',()=>{
  const {m,p,q,claim}=prep();assert.ok(m.handle(q.playerId,{t:'g.testOperators',elite:false}).error);
  m.testRules=null;assert.ok(claim(false).error);m.testRules={batches:[{id:'arknights-expansion-v1'}]};m.canTestOperators=()=>false;assert.ok(claim(false).error);assert.ok(!p.testOperatorsClaimed);assert.ok(!p.hand.some(c=>c?.meta?.testOperator));
});
test('Only a living, manually controlled, unready prep owner can claim',()=>{
  const {m,p,claim}=prep();for(const phase of ['INFO_CHECK','BAND_DRAFT','COMBAT','RESULT']){m.phase=phase;assert.ok(claim(false).error);}m.phase='PREP';p.ready=true;assert.ok(claim(false).error);p.ready=false;p.autoplay=true;assert.ok(claim(false).error);p.autoplay=false;p.alive=false;assert.ok(claim(false).error);assert.ok(!p.testOperatorsClaimed);
});
test('Insufficient persistent hand space refuses atomically, then allows a retry after freeing two slots',()=>{
  const {m,p,claim}=prep();p.hand.fill(null);for(let i=0;i<p.hand.length-1;i++)p.hand[i]=p.newPiece('chess',SHU);const before=JSON.stringify(p.hand),pool=JSON.stringify([...m.pool.entries]);assert.equal(claim(false).error,'HAND_FULL');assert.equal(JSON.stringify(p.hand),before);assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.ok(!p.testOperatorsClaimed);p.hand[0]=null;assert.ok(claim(false).ok);
});
test('Normal test copies never merge into ordinary purchases; promotion and transformation cannot drain pool',()=>{
  const {h,m,p,claim}=prep();p.hand.fill(null);assert.ok(claim(false).ok);const shu=p.hand.find(c=>c?.id===SHU);assert.equal(p.countCopies(SHU),0);const a=p.acquireChess(SHU),b=p.acquireChess(SHU);assert.ok(a&&b);assert.ok(p.find(shu.uid));assert.equal(shu.id,SHU);const pool=JSON.stringify([...m.pool.entries]);assert.ok(p.promote(shu));assert.equal(shu.poolCopies,0);assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.equal(p.transformChess(shu,AGLNA2),null);assert.ok(p.find(shu.uid));h.invariants();
});
test('Test copies cannot sell for funds; leaving returns only real copies and keeps pool invariants',()=>{
  const {h,m,p,claim}=prep();assert.ok(claim(true).ok);const pieces=p.hand.filter(c=>c?.meta?.testOperator),pool=JSON.stringify([...m.pool.entries]),funds=p.funds;for(const c of pieces)assert.ok(p.sell(c.uid).error);assert.equal(p.funds,funds);p.eliminate(1);assert.equal(JSON.stringify([...m.pool.entries]),pool);h.invariants();
});

test('Avatar-table protocol accepts a subset or mixed grades and rejects empty/ambiguous inputs',()=>{
  for(const selections of [[{baseId:SHU,elite:false}],[{baseId:SHU,elite:false},{baseId:AGLNA2,elite:true}]])assert.equal(validateC2S({t:'g.testOperators',selections}),null);
  for(const msg of [{selections:[]},{selections:[{baseId:SHU,elite:'true'}]},{selections:[{baseId:SHU,elite:true}],elite:false}])assert.ok(validateC2S({t:'g.testOperators',...msg}));
});
test('Mixed per-operator selections grant only chosen grades without changing pool or teammate',()=>{
  const {h,m,p,q}=prep(),pool=JSON.stringify([...m.pool.entries]),other=JSON.stringify(q.privateView());
  assert.ok(m.handle(p.playerId,{t:'g.testOperators',selections:[{baseId:SHU,elite:false},{baseId:AGLNA2,elite:true}]}).ok);
  assert.deepEqual(p.hand.filter(c=>c?.meta?.testOperator).map(c=>c.id).sort(),[SHU,AGLNA2.replace(/_a$/,'_b')].sort());
  assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.equal(JSON.stringify(q.privateView()),other);h.invariants();
});
test('One selected operator needs one slot, consumes the once-per-match claim, and catalog stays owner-only',()=>{
  const {h,m,p,q}=prep();p.hand.fill(null);for(let i=0;i<p.hand.length-1;i++)p.hand[i]=p.newPiece('chess',SHU);
  m.markPrivate(p);m.markPrivate(q);m.flush(true);const view=h.lastTo(p.playerId,'m.private').testOperators;
  assert.deepEqual(view.catalog.map(r=>r.baseId).sort(),[SHU,AGLNA2,CLEMNT,KALTS2,NEARL,...GIRLS].sort());assert.equal(h.lastTo(q.playerId,'m.private').testOperators,undefined);
  assert.ok(m.handle(p.playerId,{t:'g.testOperators',selections:[{baseId:AGLNA2,elite:true}]}).ok);
  assert.equal(p.hand.filter(c=>c?.meta?.testOperator).length,1);assert.ok(m.handle(p.playerId,{t:'g.testOperators',selections:[{baseId:SHU,elite:false}]}).error);
});
test('Duplicate, unknown, missing-grade and empty selections are refused atomically',()=>{
  const {m,p}=prep(),before=JSON.stringify(p.hand),pool=JSON.stringify([...m.pool.entries]);
  for(const selections of [[],[{baseId:SHU,elite:true},{baseId:SHU,elite:false}],[{baseId:'chess_103_angel_a',elite:true}],[{baseId:SHU}]]){
    assert.ok(m.handle(p.playerId,{t:'g.testOperators',selections}).error);assert.equal(JSON.stringify(p.hand),before);assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.ok(!p.testOperatorsClaimed);
  }
});

for(const [baseId,batch,otherBatch] of [[CLEMNT,'arknights-expansion-v1',BATCH],[KALTS2,BATCH,'arknights-expansion-v1']]){
  for(const elite of [false,true])test(`${baseId}: ${elite?'elite':'ordinary'} grant requires its own batch and stays private`,()=>{
    const {h,m,p,q}=prep();p.hand.fill(null);
    const before=JSON.stringify(q.privateView()),pool=JSON.stringify([...m.pool.entries]),funds=p.funds;
    const request={t:'g.testOperators',selections:[{baseId,elite}]};
    const catalog=()=>{m.markPrivate(p);m.flush(true);return h.lastTo(p.playerId,'m.private').testOperators.catalog;};
    m.testRules={batches:[{id:otherBatch}]};
    assert.ok(!catalog().some(row=>row.baseId===baseId));
    assert.ok(m.handle(p.playerId,request).error);
    assert.ok(!p.testOperatorsClaimed);
    m.testRules={batches:[{id:batch}]};
    const row=catalog().find(row=>row.baseId===baseId);
    assert.ok(row);assert.equal(row.normalId,baseId);assert.equal(row.eliteId,baseId.replace(/_a$/,'_b'));
    assert.ok(m.handle(q.playerId,request).error);
    assert.ok(m.handle(p.playerId,request).ok);
    const piece=p.hand.find(x=>x?.meta?.testOperator);
    assert.equal(piece.id,elite?row.eliteId:row.normalId);assert.equal(piece.poolCopies,0);
    assert.equal(p.funds,funds);assert.equal(JSON.stringify(q.privateView()),before);
    assert.equal(JSON.stringify([...m.pool.entries]),pool);assert.ok(m.handle(p.playerId,request).error);
    m.round=2;m.markPrivate(p);m.flush(true);
    assert.equal(h.lastTo(p.playerId,'m.private').testOperators,undefined);
    h.invariants();m.dispose();
  });
}

test('Kaltsit and Clementia can be claimed together with independent grades when both packages are enabled',()=>{
  const {h,m,p,q}=prep();p.hand.fill(null);
  const before=JSON.stringify(q.privateView()),pool=JSON.stringify([...m.pool.entries]);
  const selections=[{baseId:KALTS2,elite:true},{baseId:CLEMNT,elite:false}];
  assert.ok(m.handle(p.playerId,{t:'g.testOperators',selections}).ok);
  assert.deepEqual(p.hand.filter(x=>x?.meta?.testOperator).map(x=>x.id).sort(),[KALTS2.replace(/_a$/,'_b'),CLEMNT].sort());
  assert.equal(JSON.stringify(q.privateView()),before);assert.equal(JSON.stringify([...m.pool.entries]),pool);
  h.invariants();m.dispose();
});
