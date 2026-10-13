import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {startServer} from '../../server/index.js';
import {buildLoadoutCatalog,matchLoadout} from '../../server/sim/content/expansion/loadout-catalog.js';
import {buildExpansionData,NIAN,LING,SHU,AGLNA2} from '../../server/sim/content/expansion/expansion-data.js';
import {CROISSANT,SORA} from '../../server/sim/content/expansion/penguin-data.js';
import {checkLoadout,loadoutOptions} from '../../shared/protocol.js';
import {skinIds} from '../../shared/skins.js';
import {TestClient} from '../helpers/wsClient.js';
import {rosterOf,filterRoster} from '../../public/js/ui/loadoutModel.js';
import {RI,GIRL,BATCH,NEW,OBLVNS,buildRhodesMujicaData} from '../../server/sim/content/rhodes-mujica/data.js';
const D=getData(),ids=[CROISSANT,SORA,NIAN,LING,SHU,AGLNA2];
test('Lobby Rhodes and Girl categories contain new operators and every retagged old member without enabling battle content',()=>{
 const catalog=buildLoadoutCatalog(D),enabled=buildRhodesMujicaData(D),roster=rosterOf(Object.values(catalog.chess));
 for(const bond of [RI,GIRL])assert.deepEqual(filterRoster(roster,{bond}).map(c=>c.chessId).sort(),enabled.bonds[bond].visibleMembers.slice().sort());
 assert.equal(catalog.bonds[RI].visibleMembers.length,13);assert.equal(catalog.bonds[GIRL].visibleMembers.length,5);
 for(const id of NEW)assert.ok(catalog.chess[id]);for(const c of Object.values(D.chess))if(enabled.chess[c.chessId].bonds.includes(RI)){assert.ok(catalog.chess[c.chessId].bonds.includes(RI));assert.ok(!c.bonds.includes(RI));}
 assert.equal(D.bonds[RI],undefined);assert.equal(D.bonds[GIRL],undefined);
});
test('Real host sees renamed test option; formal match filters new content and opted-in match restores new loadout and memberships',async t=>{
 const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());srv.lobby.testContentAccess.publicIds=[BATCH];
 const client=await TestClient.connect(srv.url.replace('http','ws')+'/ws');t.after(()=>client.close());const hello=await client.hello('罗德岛入局验证',undefined,{testContentVersion:20});
 const entries={[OBLVNS]:{skill:2,module:'none'}};assert.equal((await client.request({t:'room.loadout',entries})).t,'ok');
 await client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:false});let room=await client.waitFor('room.state',r=>!r.inMatch&&r.seats.some(s=>s.playerId===hello.playerId));
 assert.equal(room.testMenu.items.find(i=>i.id===BATCH).name,'罗德岛与乐队');assert.equal((await client.request({t:'room.start'})).t,'ok');let m=srv.lobby.rooms.get(room.code).match;
 assert.equal(m.data.chess[OBLVNS],undefined);assert.equal(m.data.bonds[RI],undefined);assert.equal(m.data.bands.band_rm_kaltsit,undefined);assert.equal(m.players.get(hello.playerId).loadout[OBLVNS],undefined);
 await client.request({t:'room.leave'});await client.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:false});room=await client.waitFor('room.state',r=>!r.inMatch&&r.code!==room.code);
 assert.equal((await client.request({t:'room.start',tests:{version:room.testMenu.version,ids:[BATCH]}})).t,'ok');m=srv.lobby.rooms.get(room.code).match;
 assert.ok(m.data.chess[OBLVNS]&&m.data.bonds[RI]&&m.data.bonds[GIRL]&&m.data.bands.band_rm_kaltsit&&m.data.bands.band_rm_closure);assert.equal(m.players.get(hello.playerId).loadout[OBLVNS].skill,2);
});
test('Configuration catalog adds twenty-two optional operator families and scoped RI traits without changing baseline rules or inventory',()=>{
  const before=JSON.stringify(D),c=buildLoadoutCatalog(D);
  assert.deepEqual(Object.keys(c).sort(),['assets','bonds','chess']);assert.equal(JSON.stringify(D),before);
  for(const [id,record] of Object.entries(D.chess)){
    assert.deepEqual({...c.chess[id],bonds:record.bonds,garrisonIds:record.garrisonIds},record);
    assert.ok(record.garrisonIds.every(g=>c.chess[id].garrisonIds.includes(g)));
    assert.ok(c.chess[id].garrisonIds.filter(g=>!record.garrisonIds.includes(g)).every(g=>g.startsWith('rm_old_')));
    assert.ok(record.bonds.every(b=>c.chess[id].bonds.includes(b)));
    assert.ok(c.chess[id].bonds.filter(b=>!record.bonds.includes(b)).every(b=>['penguinShip','suiShip','rhodesShip','snowfieldGuideShip','kazdelShip','bloodlineShip'].includes(b)));
  }
  for(const id of ids){assert.equal(D.chess[id],undefined);assert.equal(c.chess[id].expansionBatch,id===AGLNA2?BATCH:'arknights-expansion-v1');const opt=loadoutOptions(c.chess[id],c.chess[c.chess[id].goldenId]);assert.ok(opt.skills.length>=2);assert.ok(opt.modules.includes('none'));}
  assert.equal(Object.keys(c.chess).length,Object.keys(D.chess).length+44);
  assert.deepEqual(matchLoadout({[SHU]:{skill:0}},D.chess),{});
});
test('Ordinary-user configuration categories include all original Penguin and Sui members without enabling match rules',()=>{
  const c=buildLoadoutCatalog(D),enabled=buildExpansionData(D);
  for(const bondId of ['penguinShip','suiShip']){
    assert.deepEqual(c.bonds[bondId].visibleMembers,enabled.bonds[bondId].visibleMembers);
    for(const id of enabled.bonds[bondId].members)assert.ok(c.chess[id].bonds.includes(bondId));
    assert.deepEqual(filterRoster(rosterOf(Object.values(c.chess)),{bond:bondId}).map(r=>r.chessId).sort(),enabled.bonds[bondId].visibleMembers.slice().sort());
  }
  for(const charId of ['char_102_texas','char_103_angel','char_1041_angel2']){
    const rec=Object.values(c.chess).find(r=>r.charId===charId&&!r.isGolden);
    assert.ok(rec?.bonds.includes('penguinShip'),charId);assert.ok(!D.chess[rec.chessId].bonds.includes('penguinShip'));
  }
});
test('Catalog validates every new skill/module and real skin with the same choices as an enabled match',()=>{
  const c=buildLoadoutCatalog(D),enabled=buildRhodesMujicaData(buildExpansionData(D));
  for(const id of ids){const base=c.chess[id],gold=c.chess[base.goldenId];
    for(const skill of base.skills.map(s=>s.index))for(const module of loadoutOptions(base,gold).modules){const entry={[id]:{skill,module}};assert.ok(checkLoadout(entry,k=>c.chess[k]).ok);assert.ok(checkLoadout(entry,k=>enabled.chess[k]).ok);}
    for(const skin of skinIds(c.assets,base))assert.ok(checkLoadout({[id]:{skin}},k=>c.chess[k],b=>skinIds(c.assets,b)).ok);
  }
  assert.ok(checkLoadout({[SHU]:{skin:'char_2014_nian_nian_4'}},k=>c.chess[k],b=>skinIds(c.assets,b)).error);
});
test('Real lobby saves new preferences before selecting a batch, formal match filters only those entries and test match restores them',async t=>{
  const srv=await startServer({port:0,host:'127.0.0.1',quiet:true,auth:false,ranked:false});t.after(()=>srv.close());
  // Publication is only a synthetic fixture; player is an ordinary host.
  srv.lobby.testContentAccess.publicIds=['arknights-expansion-v1',BATCH];
  const c=await TestClient.connect(srv.url.replace('http','ws')+'/ws');t.after(()=>c.close());const hello=await c.hello('调配测试',undefined,{testContentVersion:20});
  const old=Object.values(D.chess).find(x=>!x.isGolden&&x.visible&&x.skills?.length>=2),skill=old.skills.find(s=>s.index!==old.skill.index).index;
  const entries={[old.chessId]:{skill},[SHU]:{skill:0,module:'none',skin:'char_2025_shu_nian_11'},[AGLNA2]:{skill:2,module:'none'},[LING]:{skill:2,skin:'char_2023_ling_nian_12'}};
  assert.equal((await c.request({t:'room.loadout',entries})).t,'ok');
  const saved=srv.lobby.registry.byId(hello.playerId).loadout;assert.equal(saved[SHU].skin,entries[SHU].skin);
  assert.equal((await c.request({t:'room.loadout',entries:{[SHU]:{skin:'char_2014_nian_nian_4'}}})).t,'error');assert.deepEqual(srv.lobby.registry.byId(hello.playerId).loadout,saved);
  await c.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:false});let room=await c.waitFor('room.state',r=>!r.inMatch&&r.seats.some(s=>s.playerId===hello.playerId));
  assert.equal((await c.request({t:'room.start'})).t,'ok');let m=srv.lobby.rooms.get(room.code).match,p=m.players.get(hello.playerId);
  assert.equal(m.data.chess[SHU],undefined);assert.equal(m.pool.entries.has(SHU),false);assert.equal(p.loadout[SHU],undefined);assert.equal(p.loadout[old.chessId].skill,skill);
  assert.equal((await c.request({t:'room.loadout',entries})).t,'ok');assert.equal(p.loadout[SHU],undefined);assert.equal(p.loadout[old.chessId].skill,skill);
  await c.request({t:'room.leave'});await c.request({t:'room.create',mode:'solo',difficulty:'NORMAL',ranked:false});room=await c.waitFor('room.state',r=>!r.inMatch&&r.code!==room.code);
  assert.equal((await c.request({t:'room.start',tests:{version:room.testMenu.version,ids:['arknights-expansion-v1',BATCH]}})).t,'ok');m=srv.lobby.rooms.get(room.code).match;p=m.players.get(hello.playerId);
  assert.ok(m.data.chess[SHU]);assert.equal(p.loadout[SHU].skill,0);assert.equal(p.loadout[SHU].module,'none');assert.equal(p.loadout[SHU].skin,entries[SHU].skin);assert.equal(p.loadout[AGLNA2].skill,2);
  assert.equal(p.skinFor(m.gd.chess(SHU)),entries[SHU].skin);assert.equal(srv.lobby.registry.byId(hello.playerId).loadout[SHU].skin,entries[SHU].skin);
});
