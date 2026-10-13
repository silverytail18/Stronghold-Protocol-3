import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../server/data.js';
import {buildRhineData} from '../server/sim/content/rhine/data.js';
import {buildEncyclopediaCatalog} from '../server/sim/content/expansion/encyclopedia-catalog.js';
import {buildRecordCatalog} from '../server/sim/content/expansion/record-catalog.js';
import {snapshotRecordContent,recordCatalog} from '../shared/record-content.js';
import {encyclopediaTraits} from '../shared/encyclopedia.js';
import {rhineCurrentEffect} from '../shared/rhine-description.js';
import {richTextPlain} from '../public/js/ui/richText.js';
import {buildResult} from '../server/match/results.js';
import {makeMatch} from './match/harness.js';
import {Ranked} from '../server/ranked.js';
import {randomUUID} from 'node:crypto';
const base=getData();
test('Encyclopedia shows normal and elite Rhine research traits and labels the correct content package',()=>{
 const before=JSON.stringify(base),catalog=buildEncyclopediaCatalog(base);assert.equal(JSON.stringify(base),before);
 assert.equal(catalog.batches.bonds.rhineShip,'莱茵生命');assert.equal(catalog.batches.bonds.specialResearchShip,'莱茵生命');assert.equal(catalog.batches.items.rhine_sampler_a,'莱茵生命');
 for(const id of catalog.bonds.rhineShip.visibleMembers)for(const key of [id,id.replace(/_a$/,'_b')]){const c=catalog.chess[key],traits=encyclopediaTraits(c,catalog.garrisons);assert.ok(traits.some(t=>t.name==='科研记录'),c.name);assert.ok(traits.some(t=>t.descRaw.includes('20层')),c.name);}
});
test('Record browsing resolves all current packages without installing a match overlay; snapshots retain historical names',()=>{
 const before=JSON.stringify(base),catalog=buildRecordCatalog(base);assert.equal(JSON.stringify(base),before);
 for(const id of ['chess_rhine_halo_a','chess_kz_meteo_a','chess_exp_clemnt_a','chess_rm_kalts2_a'])assert.ok(catalog.chess[id]);assert.ok(catalog.bands.band_rhine_joint);assert.ok(catalog.items.rhine_sampler_a);
 const data=buildRhineData(base),rows=[{accountId:'must-not-appear',bandId:'band_rhine_joint',lineup:[{id:'chess_rhine_halo_a',items:['rhine_sampler_a']}],bonds:[{bondId:'rhineShip'}]}];
 const snapshot=snapshotRecordContent(data,rows,{batches:[{id:'rhine-lab-v1',name:'莱茵生命'}]});assert.ok(!JSON.stringify(snapshot).includes('must-not-appear'));assert.ok(snapshot.assets.chars.char_135_halo.avatar);
 snapshot.chess.chess_rhine_halo_a.name='历史星源';const view=recordCatalog(catalog,snapshot);assert.equal(view.chess.chess_rhine_halo_a.name,'历史星源');assert.equal(catalog.chess.chess_rhine_halo_a.name,'星源');
});
test('Real match results persist content snapshots through the owned-record API without changing points',()=>{
 const data=buildRhineData(base),rules={clientVersion:32,batches:[{id:'rhine-lab-v1',name:'莱茵生命',version:'rhine-test-4'}]},h=makeMatch({data,mode:'solo',fake:true,testRules:rules}).start();h.m.testRules=rules;h.toPrep(1);const p=h.ps('p_0');p.board.clear();p.board.set('10,5',p.newPiece('chess','chess_rhine_halo_a'));p.bandId='band_rhine_joint';p.recompute();const result=buildResult(h.m,{victory:false,hiddenReached:false,hiddenCleared:false,reason:'defeat'});
 assert.equal(result.content.chess.chess_rhine_halo_a.name,'星源');assert.equal(result.testRules.clientVersion,32);
 const accountId=randomUUID(),rank=new Ranked({filename:':memory:',auth:{users:new Map([['tester',{username:'tester',accountId}]])},log:{error(){},warn(){},info(){}}});
 try{const before=rank.profile(accountId).points,id=rank.recordStart({mode:'solo',difficulty:'NORMAL',seats:[{accountId,playerId:'p_0',name:'玩家',isBot:false}]});rank.recordFinish(id,result);const detail=rank.recordDetail(accountId,id);assert.equal(detail.summary.content.chess.chess_rhine_halo_a.name,'星源');assert.equal(detail.summary.content.bands.band_rhine_joint.name,'赫默');assert.equal(rank.profile(accountId).points,before);assert.ok(!JSON.stringify(detail.summary.content).includes(accountId));}finally{rank.close();h.m.dispose();}
});
test('Rhine panel style resolves current tier, exact technology values and paused research',()=>{
 const text=richTextPlain(rhineCurrentEffect(600,9,{research:['T04','T01','T02','T07','T03','T12'],active:['T04','T01','T02','T07','T03','T12']}));
 for(const expected of ['70%','全体增伤+20%','格内合计+40%','全体减伤6%','格内合计30%','1320物理伤害','50%','标记3秒'])assert.ok(text.includes(expected),expected);
 assert.ok(rhineCurrentEffect(600,3,{research:['T04','T01','T07']}).includes('暂停'));assert.ok(rhineCurrentEffect(600,2).includes('未激活'));
 assert.ok(richTextPlain(rhineCurrentEffect(600,3,{normalPoints:19})).includes('科研19/19'),'earned milestones are not inferred from a lowered current layer count');
});

test('Current-effect descriptions distinguish six-member high-tier activation from nine-member research',()=>{
 const research=['T04','T01','T02','T09','T08','T10','T07','T12','T03','T13'];
 const six=richTextPlain(rhineCurrentEffect(600,6,{research}));assert.ok(six.includes('分享源当前攻击力50%'));assert.ok(six.includes('仅本场战斗生效'));assert.ok(!six.includes('暂停'));
 const five=richTextPlain(rhineCurrentEffect(600,5,{research}));assert.ok(five.includes('数据广播：暂停（开战需6人及前置）'));assert.ok(five.includes('访学聘任：暂停（开战需6人及前置）'));assert.ok(five.includes('全体增伤+10%'));
});
