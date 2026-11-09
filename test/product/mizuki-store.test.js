import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MizukiStore } from '../../server/product/mizuki/store.js';

function fixture(t) {
  const store = new MizukiStore(':memory:'); t.after(() => store.close());
  const seats = [{ playerId: 'p1', seat: 0, connected: true }];
  const run = store.begin({ seats, roomCode: 'MZ01', seed: 123, matchNo: 1, mizukiDifficultyGrade: 0 }, new Map([['p1', 'a1']]));
  const checkpoint = { v: 1, engine: 'mizuki', variant: 'entertainment_mizuki', matchId: run.id,
    roomCode: 'MZ01', seed: 123, matchNo: 1, players: [{ ...seats[0], alive: true, left: false }],
    mizuki: { difficultyGrade: 0, battleDiceSpent: { '["node","n:p1"]': 1 } } };
  const packet = { epoch: 1, seq: 1, checkpoint, banks: { p1: { current: 1, record: 1, totalPut: 1 } },
    operation: { playerId: 'p1', opId: 'op1', command: { t: 'fixture', opId: 'op1' } }, result: { ok: true } };
  return { store, run, checkpoint, packet };
}

test('bank, checkpoint and idempotency record commit atomically; failed retry rolls back', t => {
  const { store, run, packet } = fixture(t);
  store.commit(run.id, packet);
  assert.equal(store.profile('a1').bank.current, 1);
  assert.deepEqual(store.operation(run.id, 'p1', 'op1', packet.operation.command), { ok: true });
  assert.throws(() => store.operation(run.id, 'p1', 'op1', { t: 'different' }));
  assert.throws(() => store.commit(run.id, { ...packet, seq: 2, banks: { p1: { current: 2, record: 2, totalPut: 2 } } }));
  assert.equal(store.profile('a1').bank.current, 1);
  assert.equal(store.get(run.id).seq, 1);
  assert.throws(() => store.begin(run.options, new Map([['p1', 'a1']])));
});

test('frozen run identity and invalid bank high-water marks are rejected before mutation', t => {
  const { store, run, packet } = fixture(t);
  for (const patch of [{ seed: 444 }, { matchNo: 2 }, { players: [{ playerId: 'intruder', seat: 0 }] }, { mizuki: { difficultyGrade: 18 } }])
    assert.throws(() => store.commit(run.id, { ...packet, checkpoint: { ...packet.checkpoint, ...patch } }));
  assert.throws(() => store.commit(run.id, { ...packet, banks: { p1: { current: 1, record: 1000, totalPut: 1000 } } }));
  assert.equal(store.get(run.id).seq, 0); assert.equal(store.profile('a1').bank.current, 0);
});

test('resume requires original accounts; rebinds dice keys and fences obsolete workers', t => {
  const { store, run, packet } = fixture(t); store.commit(run.id, packet); store.suspend(run.id);
  assert.throws(() => store.rebindAndClaim(run.id, [{ playerId: 'p2', seat: 0 }], new Map([['p2', 'a2']]), 'MZ02'));
  const resumed = store.rebindAndClaim(run.id, [{ playerId: 'p2', seat: 0 }], new Map([['p2', 'a1']]), 'MZ02');
  assert.equal(resumed.epoch, 2);
  assert.equal(resumed.checkpoint.mizuki.battleDiceSpent['["node","n:p2"]'], 1);
  assert.throws(() => store.commit(run.id, { ...packet, seq: 2 }));
});

test('result grants once, releases active lock and stores independent history', t => {
  const { store, run, packet } = fixture(t);
  const summary = { matchId: run.id, variant: 'entertainment_mizuki', ranked: false, players: [{ playerId: 'p1', mizuki: { explorationScore: 12, cellPoints: 13 } }] };
  store.commit(run.id, { ...packet, summary });
  assert.equal(store.profile('a1').score, 12); assert.equal(store.profile('a1').cells, 13);
  assert.equal(store.active('a1'), null); assert.equal(store.history('a1').length, 1);
  assert.throws(() => store.commit(run.id, { ...packet, seq: 2, summary }));
  assert.equal(store.profile('a1').score, 12);
});

test('resume saves the new waiting room capacity without changing frozen player seats', t => {
  const { store, run, packet } = fixture(t); store.commit(run.id, packet); store.suspend(run.id);
  const seats = [{ playerId: 'p2', seat: 0 }], accounts = new Map([['p2', 'a1']]);
  for (const capacity of [0, 5, 1.5]) assert.throws(() => store.rebindAndClaim(run.id, seats, accounts, 'MZ02', capacity));
  assert.equal(store.get(run.id).status, 'suspended');
  assert.equal(store.get(run.id).epoch, 1);
  const resumed = store.rebindAndClaim(run.id, seats, accounts, 'MZ02', 3);
  assert.equal(resumed.options.roomCapacity, 3);
  assert.equal(resumed.options.seats[0].seat, 0);
  assert.equal(resumed.checkpoint.players[0].seat, 0);
});

test('failed start releases its lock without granting results', t => {
  const { store, run } = fixture(t); store.cancelStart(run.id);
  assert.equal(store.active('a1'), null); assert.equal(store.get(run.id).status, 'start_failed');
  assert.equal(store.history('a1').length, 0);
});

test('abandon settles only the caller; remaining members resume and old bank cannot overwrite a new run', t => {
 const store=new MizukiStore(':memory:');t.after(()=>store.close());
 const seats=[{playerId:'p1',seat:0,connected:true},{playerId:'p2',seat:1,connected:true}],accounts=new Map([['p1','a1'],['p2','a2']]);
 const run=store.begin({seats,roomCode:'MZ01',seed:123,matchNo:1,mizukiDifficultyGrade:0},accounts);
 const checkpoint={v:1,engine:'mizuki',variant:'entertainment_mizuki',matchId:run.id,roomCode:'MZ01',seed:123,matchNo:1,
 players:seats.map(s=>({...s,alive:true,left:false})),mizuki:{difficultyGrade:0,explorationScores:{p1:{},p2:{}}}};
 const bank={current:1,record:1,totalPut:1};store.commit(run.id,{epoch:1,seq:1,checkpoint,banks:{p1:bank,p2:bank}});store.suspend(run.id);
 assert.equal(store.abandon(run.id,'a1').ok,true);assert.equal(store.active('a1'),null);assert.equal(store.active('a2').status,'suspended');
 assert.equal(store.history('a1').length,1);assert.throws(()=>store.abandon(run.id,'a1'));
 const newRun=store.begin({seats:[seats[0]],roomCode:'MZ03',seed:456,matchNo:1,mizukiDifficultyGrade:0},accounts);
 const cp2={...checkpoint,matchId:newRun.id,roomCode:'MZ03',seed:456,players:[checkpoint.players[0]]};
 store.commit(newRun.id,{epoch:1,seq:1,checkpoint:cp2,banks:{p1:{current:2,record:2,totalPut:2}}});
 const resumed=store.rebindAndClaim(run.id,[{playerId:'r2',seat:1,connected:true}],new Map([['r2','a2']]),'MZ02');
 assert.equal(resumed.checkpoint.players.find(p=>p.playerId==='p1').left,true);
 store.commit(run.id,{epoch:resumed.epoch,seq:resumed.seq+1,checkpoint:resumed.checkpoint,banks:{p1:bank,r2:bank},
 summary:{matchId:run.id,variant:'entertainment_mizuki',ranked:false,players:[{playerId:'r2',mizuki:{explorationScore:12,cellPoints:13}}]}});
 assert.equal(store.profile('a1').bank.current,2);assert.equal(store.history('a1').length,1);assert.equal(store.profile('a2').score,12);
 assert.equal(store.active('a1').id,newRun.id);assert.equal(store.active('a2'),null);
});
