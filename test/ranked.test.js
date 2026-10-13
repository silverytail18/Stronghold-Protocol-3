import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Ranked } from '../server/ranked.js';
import { RANK_RULES, rankOf, rankedDifficultyAllowed, validateRankRules } from '../shared/ranked.js';

const quiet = { error() {} };
function fixture(t, extra = {}) {
  let clock = 1000000000000;
  const accounts = Array.from({ length: 4 }, (_, i) => ({ username: `user${i}`, accountId: randomUUID(), disabled: false, mustChangePassword: false }));
  const auth = { users: new Map(accounts.map(u => [u.username, u])) };
  const rank = new Ranked({ filename: ':memory:', auth, log: quiet, now: () => clock, ...extra });
  t.after(() => rank.close());
  const seats = n => accounts.slice(0, n).map((u, i) => ({ accountId: u.accountId, playerId: `p${i}`, name: `玩家${i}`, isBot: false }));
  const start = (difficulty = 'NORMAL', n = 1) => rank.start({ mode: n === 1 ? 'solo' : 'coop', difficulty, roomCode: 'ABCD', seats: seats(n) });
  const finish = (id, victory, hiddenCleared = false, extraSummary = {}) => rank.finish(id, { players: seats(4), reason: victory ? 'victory' : 'defeat', victory, hiddenCleared, errors: 0, ...extraSummary });
  return { rank, accounts, auth, seats, start, finish, advance: ms => { clock += ms; } };
}

test('tier boundaries, no placements, exact shared difficulty qualification', () => {
  for (const [score, label] of [[0,'青铜 III'],[99,'青铜 III'],[100,'青铜 II'],[299,'青铜 I'],[300,'白银 III'],[600,'黄金 III'],[900,'铂金 III'],[1200,'钻石 III'],[1500,'大师 III'],[1800,'传奇'],[3000,'传奇']]) assert.equal(rankOf(score).label, label);
  assert.equal(rankedDifficultyAllowed(599, 'NORMAL'), true); assert.equal(rankedDifficultyAllowed(600, 'NORMAL'), false);
  assert.equal(rankedDifficultyAllowed(1199, 'HARD'), true); assert.equal(rankedDifficultyAllowed(1200, 'HARD'), false);
  assert.equal(rankedDifficultyAllowed(5000, 'ABYSS'), true); assert.equal(rankedDifficultyAllowed(0, 'FUNNY'), false);
  assert.throws(() => validateRankRules({ ...RANK_RULES, HARD: { win:45, loss:25, hidden:8 } }), /偶数/);
});

for (const difficulty of Object.keys(RANK_RULES)) for (const humans of [1, 2, 3, 4]) {
  test(`${difficulty}: ${humans} humans receive equal win and hidden points; loss is fixed for every member`, t => {
    const f = fixture(t), rule = RANK_RULES[difficulty];
    let match = f.start(difficulty, humans); f.finish(match.id, true, true);
    const expected = (rule.win + rule.hidden) / (humans === 1 ? 1 : 2);
    for (const account of f.accounts.slice(0, humans)) assert.equal(f.rank.profile(account.accountId).points, expected);
    match = f.start(difficulty, humans); f.finish(match.id, false);
    for (const account of f.accounts.slice(0, humans)) {
      const p = f.rank.profile(account.accountId); assert.equal(p.points, Math.max(0, expected - rule.loss)); assert.equal(p.games, 2); assert.equal(p.wins, 1);
      const ledger = f.rank.history(account.accountId).rows[0]; assert.equal(ledger.nominal, -rule.loss);
    }
  });
}

test('solo and coop update the same season score; duplicate result never credits twice', t => {
  const f = fixture(t); let m = f.start(); f.finish(m.id, true); f.finish(m.id, true);
  assert.equal(f.rank.profile(f.accounts[0].accountId).points, 30);
  m = f.start('NORMAL', 2); f.finish(m.id, true);
  assert.equal(f.rank.profile(f.accounts[0].accountId).points, 45);
  assert.equal(f.rank.profile(f.accounts[1].accountId).points, 15);
  assert.equal(f.rank.leaderboard(m.season.id).total, 2);
});
test('qualify before start; crossing a threshold gives full equal coop win and blocks next low difficulty', t => {
  const f = fixture(t), account = f.accounts[0].accountId, season = f.rank.current();
  f.rank.run('INSERT INTO standings(season_id,account_id,points,peak) VALUES(?,?,?,?)', season.id, account, 590, 590);
  const m = f.start('NORMAL', 2); f.finish(m.id, true);
  assert.equal(f.rank.profile(account).points, 605); assert.equal(f.rank.profile(f.accounts[1].accountId).points, 15);
  assert.throws(() => f.start('NORMAL', 2), /黄金/);
  assert.equal(f.rank.one("SELECT COUNT(*) AS n FROM locks").n, 0);
});
test('normal elimination does not change team win; completed main stays victory if later run is abandoned', t => {
  const f = fixture(t), m = f.start('ABYSS', 4);
  f.finish(m.id, false, false, { rankMainCleared: true, reason: 'abandoned', players: f.seats(4).map((s, i) => ({ ...s, alive: i !== 0, eliminatedRound: i === 0 ? 8 : null })) });
  for (const u of f.accounts) assert.equal(f.rank.profile(u.accountId).points, 30);
});
test('solo forfeit cooldown is 5/15/30 minutes without duplicate abandon; coop remains available', t => {
  const f = fixture(t), id = f.accounts[0].accountId;
  for (const minutes of [5, 15, 30]) {
    const m = f.start('HARD'); f.rank.markLeave(m.id, id); f.rank.markLeave(m.id, id); f.finish(m.id, true);
    const profile = f.rank.profile(id); assert.equal(profile.points, 0);
    assert.equal(f.rank.history(id).rows[0].nominal, -25);
    assert.throws(() => f.start(), /冷却/);
    assert.equal(profile.cooldowns.coop,0);
    const coop = f.start('HARD',2);
    assert.throws(() => f.start('HARD',2),/已有/);
    f.rank.markLeave(coop.id,id);f.finish(coop.id,true);
    assert.equal(f.rank.profile(id).cooldownUntil,profile.cooldownUntil,'coop leave never changes solo cooldown');
    f.advance(minutes * 60000 + 1);
  }
  assert.equal(f.rank.profile(f.accounts[1].accountId).points, 60);
  assert.equal(f.rank.one('SELECT COUNT(*) AS n FROM abandons').n,3);
});

test('historical coop cooldown rows are preserved, ignored and excluded from solo escalation',t=>{
  const f=fixture(t),id=f.accounts[0].accountId,coop=f.start('NORMAL',2);
  f.rank.run('INSERT INTO abandons VALUES(?,?,?,?)',coop.id,id,1000000000000,1000000000000+1800000);
  f.finish(coop.id,true);
  assert.equal(f.rank.profile(id).cooldownUntil,0);
  assert.equal(f.rank.one('SELECT COUNT(*) AS n FROM abandons').n,1);
  const solo=f.start();f.rank.markLeave(solo.id,id);f.finish(solo.id,false);
  assert.equal(f.rank.profile(id).cooldownUntil,1000000000000+300000);
  assert.equal(f.rank.one('SELECT COUNT(*) AS n FROM abandons').n,2);
});
test('leaving after main clear gets base victory, no core reward and no cooldown', t => {
  const f = fixture(t), m = f.start('ABYSS', 2);
  f.rank.markLeave(m.id, f.accounts[0].accountId, true); f.finish(m.id, true, true);
  assert.equal(f.rank.profile(f.accounts[0].accountId).points, 30); assert.equal(f.rank.profile(f.accounts[1].accountId).points, 36);
  assert.equal(f.rank.profile(f.accounts[0].accountId).cooldownUntil, 0);
});
test('account lock, duplicate seats, bots, minimum players, disabled users and concurrent match limit', t => {
  const f = fixture(t, { maxMatches: 1 }); const m = f.start();
  assert.throws(() => f.start(), /已有/);
  assert.throws(() => f.rank.start({ mode:'coop',difficulty:'NORMAL',roomCode:'ABCD',seats:[f.seats(1)[0],f.seats(1)[0]] }), /重复/);
  assert.throws(() => f.rank.start({ mode:'coop',difficulty:'NORMAL',roomCode:'ABCD',seats:f.seats(1) }), /2–4/);
  assert.throws(() => f.rank.start({ mode:'coop',difficulty:'NORMAL',roomCode:'ABCD',seats:f.seats(2).map(s => ({...s,isBot:true})) }), /AI/);
  assert.throws(() => f.rank.start({ mode:'solo',difficulty:'NORMAL',roomCode:'EFGH',seats:[f.seats(2)[1]] }), /上限/);
  f.finish(m.id, true); f.accounts[0].disabled = true; assert.throws(() => f.start(), /账号不能/);
});
test('new season archives old scores and starts every account at bronze 0; pending old match drains first', t => {
  const f = fixture(t), old = f.rank.current(), m = f.start('HARD', 2), next = f.rank.createSeason({ name:'S2 测试' }, 'admin');
  f.rank.rollover(next.id, 'admin'); assert.equal(f.rank.current().state, 'closing'); assert.throws(() => f.start(), /赛季/);
  f.finish(m.id, true); f.rank.tick();
  assert.equal(f.rank.current().id, next.id);
  for (const u of f.accounts) { assert.equal(f.rank.profile(u.accountId).points, 0); assert.equal(f.rank.profile(u.accountId).rank.label, '青铜 III'); }
  assert.equal(f.rank.leaderboard(old.id).rows[0].points, 20);
  assert.equal(f.rank.history(f.accounts[0].accountId).rows[0].season, old.name);
});
test('drain timeout voids run without points or penalties, and advances season once', t => {
  const f = fixture(t, { drainMs:1000 }), m = f.start('HARD', 2), next = f.rank.createSeason({name:'next'},'admin');
  f.rank.markLeave(m.id, f.accounts[0].accountId); f.rank.rollover(next.id, 'admin'); f.advance(1001); f.rank.tick(); f.rank.tick();
  assert.equal(f.rank.current().id, next.id); assert.equal(f.rank.one('SELECT status FROM matches WHERE id=?',m.id).status,'void');
  assert.equal(f.rank.profile(f.accounts[0].accountId).cooldownUntil,0); assert.equal(f.rank.one('SELECT COUNT(*) AS n FROM locks').n,0);
  f.finish(m.id,true); assert.equal(f.rank.profile(f.accounts[0].accountId).points,0);
});
test('server errors void all players, not a loss; admission pauses while score write is pending', t => {
  const f = fixture(t); let m = f.start(); f.finish(m.id, true, false, { errors:1 }); assert.equal(f.rank.profile(f.accounts[0].accountId).games,0);
  m = f.start(); const settle = f.rank.settle.bind(f.rank); f.rank.settle = () => { throw new Error('disk temporarily unavailable'); };
  f.finish(m.id,true); assert.equal(f.rank.profile(f.accounts[0].accountId).points,0); assert.equal(f.rank.profile(f.accounts[0].accountId).pending,true);
  assert.throws(() => f.start(), /待恢复/); f.rank.settle = settle; f.rank.tick(); assert.equal(f.rank.profile(f.accounts[0].accountId).points,30);
});
test('a failed transaction cannot partially credit a winning team', t => {
  const f = fixture(t), m = f.start('ABYSS',4), run = f.rank.run.bind(f.rank);
  let count=0; f.rank.run=(sql,...args) => { if(sql.startsWith('INSERT INTO ledger') && ++count === 3) throw new Error('injected disk failure'); return run(sql,...args); };
  f.finish(m.id,true); for(const u of f.accounts) assert.equal(f.rank.profile(u.accountId).points,0);
  assert.equal(f.rank.one('SELECT COUNT(*) AS n FROM ledger').n,0);
  f.rank.run=run; f.rank.tick(); for(const u of f.accounts) assert.equal(f.rank.profile(u.accountId).points,30);
});
test('withdrawal replays remaining valid history with 0-floor correctly, once only', t => {
  const f=fixture(t), account=f.accounts[0].accountId;
  let m=f.start(); f.finish(m.id,true); const wrong=m.id;
  m=f.start(); f.finish(m.id,false); m=f.start(); f.finish(m.id,true);
  assert.equal(f.rank.profile(account).points,40); f.rank.voidMatch(wrong,'admin','错误对局');
  assert.equal(f.rank.profile(account).points,30); assert.equal(f.rank.profile(account).games,2); assert.equal(f.rank.profile(account).peak,30);
  f.rank.voidMatch(wrong,'admin','重复撤销'); assert.equal(f.rank.profile(account).points,30);
});
test('account deletion and same-name recreation never inherits scores; password changes keep account ID', t => {
  const f=fixture(t), m=f.start(); f.finish(m.id,true); const old=f.accounts[0];
  f.auth.users=new Map(f.auth.users); f.auth.users.delete(old.username); f.rank.syncAccounts(); assert.equal(f.rank.leaderboard(m.season.id).total,0);
  const fresh={...old,accountId:randomUUID()}; f.auth.users=new Map(f.auth.users).set(old.username,fresh); f.rank.syncAccounts();
  assert.equal(f.rank.profile(fresh.accountId).points,0); assert.equal(f.rank.standing(old.accountId,m.season.id).points,30);
});
test('durable pending settlement resumes once after restart; running battle becomes void', async t => {
  const cache=path.resolve('.cache'); await fs.mkdir(cache,{recursive:true}); const dir=await fs.mkdtemp(path.join(cache,'ranked-test-')), filename=path.join(dir,'ranked.sqlite');
  const id=randomUUID(), auth={users:new Map([['player',{username:'player',accountId:id}]])}, options={filename,auth,log:quiet};
  let rank=new Ranked(options); const seats=[{accountId:id,playerId:'p',name:'玩家',isBot:false}];
  let m=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'ABCD',seats});
  rank.run("UPDATE matches SET status='pending',summary=?,ended_at=? WHERE id=?",JSON.stringify({players:seats,victory:true,reason:'victory',errors:0}),Date.now(),m.id); rank.close();
  rank=new Ranked(options); assert.equal(rank.profile(id).points,30);
  m=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'ABCD',seats}); rank.close();
  rank=new Ranked(options); assert.equal(rank.profile(id).points,30); assert.equal(rank.profile(id).activeMatch,null); assert.equal(rank.one('SELECT status FROM matches WHERE id=?',m.id).status,'void'); rank.close();
  const resolved=path.resolve(dir); assert.ok(resolved.startsWith(cache+path.sep) && path.basename(resolved).startsWith('ranked-test-')); await fs.rm(resolved,{recursive:true,force:true});
});

test('scheduled next season activates at deadline, resets points and keeps rules frozen', t => {
  const f = fixture(t), old = f.rank.current(), m = f.start(); f.finish(m.id, true);
  const deadline = 1000000000000 + 2000;
  const next = f.rank.createSeason({ name:'自动 S2', endsAt:deadline + 5000 },'admin');
  f.rank.settings({ name:'重命名 S1', endsAt:deadline, nextId:next.id, rules:{} }, 'admin');
  assert.deepEqual(f.rank.current().rules, RANK_RULES);
  f.rank.pause(true,'admin'); assert.throws(() => f.start(), /赛季/);
  f.advance(2001); f.rank.tick();
  assert.equal(f.rank.current().id, next.id);
  assert.equal(f.rank.profile(f.accounts[0].accountId).points, 0);
  assert.equal(f.rank.leaderboard(old.id).rows[0].points,30);
  assert.equal(f.rank.leaderboard(old.id).season.name,'重命名 S1');
});

test('next season with expired end date cannot be scheduled or started', t => {
  const f = fixture(t), deadline = 1000000000000 + 1000;
  const next = f.rank.createSeason({ name:'短期草稿', endsAt:deadline }, 'admin');
  assert.throws(() => f.rank.settings({ name:'S1', endsAt:deadline + 1000,nextId:next.id },'admin'), /草稿/);
  f.advance(1001); assert.throws(() => f.rank.rollover(next.id,'admin'), /草稿|结束/);
  assert.equal(f.rank.current().state,'active');
});
