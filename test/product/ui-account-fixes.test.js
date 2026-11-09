import test from 'node:test';import assert from 'node:assert/strict';
import {productFixture,login} from './fixture.js';
import {startAccountServer} from '../../server/product/account-server.js';
import {referenceCatalog} from '../../server/product/reference-catalog.js';
import {productIcon} from '../../shared/product-icons.js';
import {ROOM_CARD_EXTRAS} from '../../shared/room-card-extras.js';
import {cardOperators} from '../../public/js/ui/seatArt.js';
import {AudioManager} from '../../public/js/audio.js';
import {masteredSkill} from '../../shared/skill-mastery.js';
import {aggregateStats,buildRecord} from '../../shared/stats.js';
import {getData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {makeMatch,give,giveItem,legalTileFor} from '../match/harness.js';
import {MASTERY_ITEM_ID,withMasteryItem} from '../../shared/skill-mastery.js';

test('public player statistics exclude secrets; only browser administrators clear a selected player without changing rank/history',async t=>{
  const f=await productFixture(),server=await startAccountServer({root:f.project,env:f.env});t.after(async()=>{await server.close();await f.close();});
  const a=await login(server.url),m=await login(server.url,'member'),id=f.users[1].accountId,other=f.users[0].accountId;
  const req=(url,cookie,method='GET',body)=>fetch(server.url+url,{method,headers:{Cookie:cookie,Origin:server.url,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const rec={id:'legacy',selfId:'p',players:[{playerId:'p',passwordHash:'do-not-publish'}],passwordHash:'do-not-publish',t:1,end:'settled'};
  await server.product.archive.importAchievements(id,{accountId:id,revision:0,records:[rec]});await server.product.archive.importAchievements(other,{accountId:other,revision:0,records:[rec]});
  const publicView=await req('/auth/player-stats?accountId='+id,m.cookie).then(r=>r.json());assert.ok(publicView.records.length>=1);assert.equal(publicView.management,undefined);assert.ok(!JSON.stringify(publicView).includes('passwordHash'));
  assert.equal((await req('/auth/admin/player-data?accountId='+id,m.cookie)).status,403);
  assert.equal((await req('/product/achievements',m.cookie,'PUT',{accountId:id,revision:1,records:[],clear:true})).status,403);
  const before=server.product.ranked.all('SELECT * FROM ledger'),history=server.product.ranked.all('SELECT * FROM battle_records');
  const full=await req('/auth/admin/player-data?accountId='+id,a.cookie).then(r=>r.json());assert.ok(full.management.loadout);assert.ok(full.management.battleRecords.length);assert.ok(!JSON.stringify(full).includes('passwordHash'));assert.equal(full.management.account.username,'member');
  assert.equal((await req('/auth/admin/player-data',a.cookie,'DELETE',{accountId:id})).status,200);
  const cleared=await req('/auth/player-stats?accountId='+id,m.cookie).then(r=>r.json());assert.equal(cleared.records.length,0);assert.ok(cleared.clearedAt);assert.equal(server.product.archive.achievements(other).records.length,1);
  await server.product.archive.importAchievements(id,{accountId:id,revision:2,records:[rec]});assert.equal(server.product.archive.achievements(id).records.length,0);
  assert.deepEqual(server.product.ranked.all('SELECT * FROM ledger'),before);assert.deepEqual(server.product.ranked.all('SELECT * FROM battle_records'),history);
  for(const file of ['/product/player-stats.js','/shared/stats.js','/shared/player-name.js','/shared/constants.js','/shared/versions.js'])assert.equal((await req(file,m.cookie)).status,200);
  for(let i=0;i<12;i++)assert.equal(server.product.auth.preferenceLimiter.take('ui-changes',Date.now()),0);
});
test('reference assets and every product-only symbol resolve distinctly; five band portraits and Japanese-only previews work',()=>{
  const ref=referenceCatalog('act1autochess'),m=getData().assets;assert.equal(ref.values.assets,undefined);assert.ok(m.audio.voiceJp.char_4182_oblvns);
  for(const kind of ['bonds','bands','items']){
    const icons=Object.entries(m[kind]).filter(([,v])=>v.startsWith('/assets/product/icons/')).map(([key,v])=>productIcon(m,kind,key,v));
    assert.ok(icons.length);assert.ok(icons.every(x=>x&&!x.startsWith('/assets/product/icons/')));assert.ok(new Set(icons).size>=icons.length-1);
  }
  assert.equal(cardOperators([],null).length,5);
  const a=new AudioManager({getManifest:()=>m});a.ctx={};a.voiceGain={};const played=[];a._playVoice=url=>played.push(url);
  for(const c of ROOM_CARD_EXTRAS)assert.equal(a.previewVoice(c.charId,'cn'),true,c.charId);
  assert.equal(played.length,5);assert.equal(new Set(played).size,5);assert.ok(played.every(x=>x.includes('jp')));
});
test('Talulah all three M3 records reach the shared skill selection and actual battle input',()=>{
  const data=withMasteryItem(composeProductData(getData(),['ursus-expansion-v1']));
  const golden=Object.values(data.chess).find(c=>c.isGolden&&c.name==='塔露拉');assert.ok(golden);
  for(const skill of golden.skills){const m=masteredSkill(golden,skill);assert.equal(m.level,10);assert.ok(Object.keys(m.bb).length);}
  const h=makeMatch({data,mode:'solo',fake:true}).start().toPrep(1),p=h.ps('p_0');
  try{
    const at=legalTileFor(h.m,p,golden.chessId),piece=give(h.m,p,golden.chessId,'board',at),device=giveItem(h.m,p,MASTERY_ITEM_ID);assert.equal(p.equip(device.uid,piece.uid).ok,true);
    assert.equal(p.battleInput().units.find(u=>u.uid===piece.uid).masterySkillId,piece.meta.masterySkillId);
  }finally{h.m.dispose();}
});
test('product-only rule selections are counted as plugin games by the shared stats aggregation',()=>{
  const summary={victory:true,productRules:{custom:['rhodes-mujica-v1']},players:[{playerId:'p',alive:true}],roundsPassed:14};
  const rec=buildRecord(summary,{myId:'p',roomMode:'solo',now:123});assert.ok(rec.content);assert.equal(aggregateStats([rec],{modded:true}).count,1);assert.equal(aggregateStats([rec],{modded:false}).count,0);
});
