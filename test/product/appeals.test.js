import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { MatchAppeals } from '../../server/product/appeals.js';

function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE accounts(id TEXT PRIMARY KEY,nickname TEXT,public_no INTEGER);
    CREATE TABLE battle_records(id TEXT PRIMARY KEY,status TEXT,mode TEXT,difficulty TEXT,started_at INTEGER,ended_at INTEGER);
    CREATE TABLE record_members(record_id TEXT,account_id TEXT,player_id TEXT,nickname TEXT);
    INSERT INTO accounts VALUES('a1','Alice',1);
    INSERT INTO battle_records VALUES('m1','finished','coop','NORMAL',1,2);
    INSERT INTO record_members VALUES('m1','a1','p1','Alice');
  `);
  const ranked = {
    db,
    one: (sql, ...args) => db.prepare(sql).get(...args),
    all: (sql, ...args) => db.prepare(sql).all(...args),
    run: (sql, ...args) => db.prepare(sql).run(...args),
    transaction: (fn) => { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } },
  };
  return { ranked, appeals: new MatchAppeals({ ranked, log: { info() {}, error() {} } }) };
}

test('a player can appeal a settled match and an admin approval excludes it', () => {
  const { appeals } = fixture();
  const submitted = appeals.submit('a1', 'm1', '结算数据不对');
  assert.equal(submitted.status, 'pending');
  assert.equal(appeals.excludedFor('a1').length, 0);
  const approved = appeals.decide(submitted.id, 'approve', 'admin1', '核对通过');
  assert.equal(approved.status, 'approved');
  assert.deepEqual(appeals.excludedFor('a1'), ['m1']);
  assert.equal(appeals.listFor('a1').appeals.length, 1);
  assert.equal(appeals.listAdmin().appeals[0].nickname, 'Alice');
  assert.throws(() => appeals.decide(submitted.id, 'approve', 'admin1'), /已处理/);
});

test('rejection keeps the record counted and the player can appeal again', () => {
  const { appeals } = fixture();
  const first = appeals.submit('a1', 'm1', '第一次原因');
  assert.equal(appeals.decide(first.id, 'reject', 'admin1', '证据不足').status, 'rejected');
  assert.equal(appeals.excludedFor('a1').length, 0);
  const second = appeals.submit('a1', 'm1', '补充证据');
  assert.equal(second.id, first.id);
  assert.equal(second.status, 'pending');
});

test('a non-member cannot appeal a match', () => {
  const { appeals } = fixture();
  assert.throws(() => appeals.submit('a2', 'm1', '不是这局的人'), /对局记录不存在|不在这局/);
});
