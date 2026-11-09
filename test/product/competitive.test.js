import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Ranked} from '../../server/product/ranked.js';
import {calculateCompetitive,emptyCompetitive,COMPETITIVE_RULES} from '../../shared/competitive.js';
const person=()=>({accountId:randomUUID(),username:randomUUID(),role:'user',disabled:false,mustChangePassword:false});
function fixture() {
  const users=[person(),person()],auth={users:new Map(users.map(x=>[x.username,x]))};
  const rank=new Ranked({filename:':memory:',auth,now:()=>1_800_000_000_000});
  return {users,rank,seats:users.map((u,i)=>({accountId:u.accountId,playerId:'p'+i,name:'朋友'+i,isBot:false}))};
}
const upgrade=rank=>rank.upgradeSeason({name:'新赛季',reason:'测试升级',confirm:'保留对局并清理旧赛季'},'admin');
const stats={survivalRounds:15,rankedDamage:1000000,bossDamage:250000,rankedPerfectRounds:15,activatedLayers:999,assists:10,valid:true};
const finish=(rank,id,seats,extra={})=>rank.finish(id,{competitiveStatsVersion:1,victory:true,errors:0,players:seats.map(s=>({...s,alive:true,roundsPassed:15,competitiveStats:stats})),...extra});
test('upgrade removes old season aggregates but retains match records and stable identities',()=>{
  const {rank,seats}=fixture();try {
    const old=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'KEEP',seats:[seats[0]]});rank.finish(old.id,{victory:true,players:seats,errors:0});
    const previous=rank.current().id;upgrade(rank);
    assert.equal(rank.one('SELECT id FROM seasons WHERE id=?',previous),undefined);
    const detail=rank.recordDetail(seats[0].accountId,old.id);
    assert.equal(detail.ranked,0);assert.equal(detail.ranking,null);assert.equal(detail.summary.legacyScoreReceipts,undefined);
    assert.equal(rank.records(seats[0].accountId).total,1);
    assert.equal(rank.profile(seats[0].accountId).placementPlayed,0);
  }finally{rank.close();}
});
test('three placement matches and replays are atomic and idempotent',()=>{
  const {rank,seats}=fixture();try{upgrade(rank);
    for(let i=0;i<3;i++){const m=rank.start({mode:'coop',difficulty:'ABYSS',roomCode:'PLAY',seats});finish(rank,m.id,seats);finish(rank,m.id,seats);}
    const p=rank.profile(seats[0].accountId);assert.equal(p.placementDone,true);assert.equal(p.points,2050);assert.equal(p.games,3);assert.equal(rank.all('SELECT * FROM locks').length,0);
  }finally{rank.close();}
});
test('legacy cleanup preserves archived and current Emi seasons, their scores, receipts and records',()=>{
  const {rank,seats}=fixture();try{
    const legacy=rank.current().id;
    const old=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'OLD1',seats:[seats[0]]});rank.finish(old.id,{victory:true,players:seats,errors:0});
    const first=rank.createSeason({name:'Emi第一季',rules:COMPETITIVE_RULES},'admin');rank.rollover(first.id,'admin');
    const m=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'EMI1',seats:[seats[0]]});finish(rank,m.id,[seats[0]]);
    const second=rank.createSeason({name:'Emi第二季',rules:COMPETITIVE_RULES},'admin');rank.rollover(second.id,'admin');
    const before={season:rank.one('SELECT * FROM seasons WHERE id=?',first.id),match:rank.one('SELECT * FROM matches WHERE id=?',m.id),profile:rank.competitiveState(seats[0].accountId,first.id),record:rank.recordDetail(seats[0].accountId,m.id)};
    upgrade(rank);
    assert.equal(rank.one('SELECT id FROM seasons WHERE id=?',legacy),undefined);
    assert.equal(rank.current().id,second.id);
    assert.deepEqual(rank.one('SELECT * FROM seasons WHERE id=?',first.id),before.season);
    assert.deepEqual(rank.one('SELECT * FROM matches WHERE id=?',m.id),before.match);
    assert.deepEqual(rank.competitiveState(seats[0].accountId,first.id),before.profile);
    assert.deepEqual(rank.recordDetail(seats[0].accountId,m.id),before.record);
    assert.equal(rank.recordDetail(seats[0].accountId,old.id).season_id,null);
    assert.throws(()=>upgrade(rank),/旧规则赛季已经清理/);
  }finally{rank.close();}
});
test('administrator placement has a reason, never creates a fake game, and refuses active locks',()=>{
  const {rank,seats}=fixture();try{upgrade(rank);assert.throws(()=>rank.directPlacement({accountId:seats[0].accountId,points:2200,reason:''},'admin'));
    rank.directPlacement({accountId:seats[0].accountId,points:2200,reason:'帮助定级'},'admin');
    assert.equal(rank.profile(seats[0].accountId).games,0);
    const m=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'PLAY',seats:[seats[0]]});
    assert.throws(()=>rank.directPlacement({accountId:seats[0].accountId,points:2200,reason:'帮助定级'},'admin'));
    rank.markLeave(m.id,seats[0].accountId);finish(rank,m.id,[seats[0]],{victory:false,players:[{...seats[0],alive:false,roundsPassed:0,competitiveStats:{...stats,survivalRounds:0,rankedDamage:0,bossDamage:0,rankedPerfectRounds:0,activatedLayers:0,assists:0}}]});
    assert.equal(rank.profile(seats[0].accountId).games,1);assert.equal(rank.profile(seats[0].accountId).cooldownUntil,0);
  }finally{rank.close();}
});
test('missing stats remain pending rather than counting a guessed zero',()=>{
  const {rank,seats}=fixture();try{upgrade(rank);const m=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'PLAY',seats:[seats[0]]});rank.finish(m.id,{victory:true,players:seats,errors:0});
    assert.equal(rank.one('SELECT status FROM matches WHERE id=?',m.id).status,'pending');assert.equal(rank.profile(seats[0].accountId).games,0);assert.throws(()=>upgrade(rank));
  }finally{assert.throws(()=>rank.close(),/未能写入/);}
});
test('Emi full performance examples and zero-round placement floor are preserved',()=>{
  const input={difficulty:'ABYSS',win:true,alive:true,startingParticipantCount:4,roundsPassed:15,survivalRounds:15,rankedDamage:1000000,bossDamage:250000,rankedPerfectRounds:15,layers:999,assists:10};
  const state={...emptyCompetitive(),points:2200,placementDone:true};
  assert.equal(calculateCompetitive(state,input,1).receipt.totalDelta,50);
  assert.equal(calculateCompetitive(state,{...input,startingParticipantCount:1},1).receipt.totalDelta,80);
  assert.equal(calculateCompetitive(state,{...input,win:false},1).receipt.totalDelta,17);
  let placement=emptyCompetitive();for(let i=0;i<3;i++)placement=calculateCompetitive(placement,{difficulty:'ABYSS',win:false,alive:false,roundsPassed:0,layers:0,assists:0},i).state;
  assert.equal(placement.points,480);
});
