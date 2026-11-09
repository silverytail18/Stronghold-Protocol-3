import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {spawn} from 'node:child_process';
import {Ranked} from '../../server/product/ranked.js';
import {clearUnfinishedRecords} from '../../server/product/shutdown-records.js';
import {productFixture} from './fixture.js';
const quiet={info(){},error(){}};
function fixture(filename=':memory:'){
  const users=[0,1,2].map(i=>({username:'user'+i,accountId:randomUUID(),disabled:false,mustChangePassword:false}));
  const rank=new Ranked({filename,auth:{users:new Map(users.map(u=>[u.username,u]))},log:quiet});
  const seats=i=>[{accountId:users[i].accountId,playerId:'player'+i,name:'测试'+i,isBot:false}];
  const begin=i=>rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'STOP',seats:seats(i)}).id;
  const normal=i=>rank.recordStart({mode:'coop',difficulty:'NORMAL',seats:seats(i)});
  const result=i=>({victory:true,reason:'victory',errors:0,roundsPassed:14,players:seats(i)});
  return{rank,begin,normal,result};
}
test('unfinished normal/ranked history, membership, locks and abandons are deleted; finished and pending records stay intact',()=>{
  const{rank,begin,normal,result}=fixture();try{
    const completed=begin(0);rank.finish(completed,result(0));const active=begin(0),ordinary=normal(1),queued=normal(2),pending=begin(1);
    rank.run("UPDATE matches SET status='pending',summary=? WHERE id=?",JSON.stringify(result(1)),pending);
    rank.run('INSERT INTO abandons VALUES(?,?,?,?)',active,rank.all('SELECT account_id FROM participants WHERE match_id=?',active)[0].account_id,1,2);
    const scores=rank.all('SELECT * FROM ledger'),standings=rank.all('SELECT * FROM standings');
    assert.deepEqual(clearUnfinishedRecords(rank.db,{pendingIds:[queued]}),{matches:1,records:2});
    for(const id of [active,ordinary]){assert.equal(rank.one('SELECT * FROM battle_records WHERE id=?',id),undefined);assert.equal(rank.one('SELECT * FROM record_members WHERE record_id=?',id),undefined);}
    assert.equal(rank.one('SELECT * FROM matches WHERE id=?',active),undefined);assert.equal(rank.one('SELECT * FROM locks WHERE match_id=?',active),undefined);assert.equal(rank.one('SELECT * FROM abandons WHERE match_id=?',active),undefined);
    assert.equal(rank.one('SELECT status FROM matches WHERE id=?',completed).status,'settled');assert.equal(rank.one('SELECT status FROM matches WHERE id=?',pending).status,'pending');assert.ok(rank.one('SELECT * FROM battle_records WHERE id=?',queued));assert.deepEqual(rank.all('SELECT * FROM ledger'),scores);assert.deepEqual(rank.all('SELECT * FROM standings'),standings);
    assert.deepEqual(clearUnfinishedRecords(rank.db,{pendingIds:[queued]}),{matches:0,records:0});
  }finally{rank.close();}
});
test('close persists queued and durable final results before deleting result-less matches, and is idempotent',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-shutdown-'));const filename=path.join(dir,'ranked.sqlite');
  try{const{rank,begin,normal,result}=fixture(filename),queued=begin(0),durable=begin(1),dropped=begin(2),record=normal(0);
    rank.pending.set(queued,result(0));rank.run("UPDATE matches SET status='pending',summary=? WHERE id=?",JSON.stringify(result(1)),durable);rank.recordPending.set(record,{at:Date.now(),summary:JSON.stringify(result(0))});
    rank.close({clearUnfinished:true});rank.close({clearUnfinished:true});
    const db=new DatabaseSync(filename,{readOnly:true});try{for(const id of [queued,durable])assert.equal(db.prepare('SELECT status FROM matches WHERE id=?').get(id).status,'settled');assert.equal(db.prepare('SELECT status FROM battle_records WHERE id=?').get(record).status,'finished');assert.equal(db.prepare('SELECT * FROM matches WHERE id=?').get(dropped),undefined);assert.equal(db.prepare("SELECT COUNT(*) n FROM battle_records WHERE status='running'").get().n,0);assert.equal(db.prepare('SELECT COUNT(*) n FROM locks').get().n,0);}finally{db.close();}
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('failed result persistence keeps queued records and reports a shutdown error instead of deleting their history',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-shutdown-error-')),filename=path.join(dir,'ranked.sqlite');
  try{const{rank,begin,result}=fixture(filename),id=begin(0);rank.pending.set(id,result(0));rank.finish=()=>{};assert.throws(()=>rank.close({clearUnfinished:true}),/已完成结果未能写入/);
    const db=new DatabaseSync(filename,{readOnly:true});try{assert.equal(db.prepare('SELECT status FROM matches WHERE id=?').get(id).status,'running');assert.ok(db.prepare('SELECT * FROM battle_records WHERE id=?').get(id));}finally{db.close();}
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('actual product CLI shutdown handler clears stale history before process exit without a game or GUI',async t=>{
  const f=await productFixture();t.after(()=>f.close());
  const wrapper=`const m=await import(${JSON.stringify(new URL('../../server/product/game-server.js',import.meta.url).href)});const s=await m.startProductServer({root:${JSON.stringify(f.project)}});m.installProductShutdown(s);console.log('客户端专用服务器已启动：'+s.url);process.on('message',()=>{process.emit('SIGTERM');process.emit('SIGINT');});`;
  const child=spawn(process.execPath,['--input-type=module','-e',wrapper],{env:{...process.env,...f.env,SP_AUTH_USERS_FILE:f.authFile,SP_RANKED_FILE:path.join(f.state,'ranked.sqlite'),SP_RANKED:'on',PORT:'0',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe','ipc'],windowsHide:true});
  t.after(()=>{if(child.exitCode===null)child.kill();});let logs='';child.stdout.on('data',b=>{logs+=b;});child.stderr.on('data',b=>{logs+=b;});
  const exited=new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{clearInterval(timer);reject(Error(logs));},15000),timer=setInterval(()=>{if(logs.includes('客户端专用服务器已启动')){clearInterval(timer);clearTimeout(timeout);resolve();}else if(child.exitCode!==null){clearInterval(timer);clearTimeout(timeout);reject(Error(logs));}},25);});
  const db=new DatabaseSync(path.join(f.state,'ranked.sqlite'));db.prepare("INSERT INTO battle_records(id,mode,difficulty,ranked,started_at,status) VALUES('unfinished-shutdown','coop','NORMAL',0,1,'running')").run();db.prepare("INSERT INTO record_members VALUES('unfinished-shutdown',?,'p','合成账号')").run(f.users[0].accountId);db.close();
  child.send('stop');const exit=await exited;assert.equal(exit.code,0,logs);assert.match(logs,/服务器已停止，未完成对局记录已清除/);
  const after=new DatabaseSync(path.join(f.state,'ranked.sqlite'),{readOnly:true});try{assert.equal(after.prepare("SELECT * FROM battle_records WHERE id='unfinished-shutdown'").get(),undefined);assert.equal(after.prepare("SELECT COUNT(*) n FROM battle_records WHERE status='finished'").get().n,1);}finally{after.close();}
});
