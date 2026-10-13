import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TestContent} from '../../server/test-content.js';
import {openingBans} from '../../server/test-batches.js';
import {GameData} from '../../server/match/gamedata.js';
import {drawDisabledBonds,SharedPool} from '../../server/match/pool.js';
import {createRng} from '../../server/sim/rng.js';
import {toggleTestSelection} from '../../public/js/ui/testContent.js';
import {DATA,makeMatch} from './harness.js';
const tc=new TestContent(),presets=[['opening-bans-4-6',4,6],['opening-bans-5-8',5,8]];
const resolve=(ids,mode='solo',difficulty='NORMAL')=>tc.resolve({version:tc.version,ids},{mode,difficulty},DATA);

test('opening ban choices replace one another, forged combinations fail, and standard is disabled',()=>{
 const before=JSON.stringify(DATA),items=tc.menu({mode:'solo',difficulty:'NORMAL'}).items;
 for(const [id]of presets){
  const other=presets.find(p=>p[0]!==id)[0];
  assert.deepEqual(toggleTestSelection(items,[other,'shop-extra-slot'],id),items.filter(i=>[id,'shop-extra-slot'].includes(i.id)).map(i=>i.id));
  assert.throws(()=>resolve([id,other]),/冲突/);
  for(const mode of ['solo','coop']){assert.equal(tc.menu({mode,difficulty:'FUNNY'}).items.find(i=>i.id===id).enabled,false);assert.throws(()=>resolve([id],mode,'FUNNY'),/不支持/);}
 }
 for(const pair of [[3,4],[4,8],[5,6],[-1,6],[4,'6']])assert.throws(()=>openingBans({},...pair),/不支持/);
 assert.equal(resolve([]).data,DATA);assert.equal(JSON.stringify(DATA),before);
});

for(const[id,core,addon]of presets)test(`${id} draws exact counts in real solo/co-op setup and preserves pool filtering`,()=>{
 const before=JSON.stringify(DATA);
 for(const mode of ['solo','coop'])for(const difficulty of ['NORMAL','HARD','ABYSS']){
  const {data,manifest}=resolve([id],mode,difficulty),gd=new GameData(data,`mode_${mode==='solo'?'single':'multi'}_${difficulty.toLowerCase()}`);
  assert.deepEqual(gd.bans(difficulty),{core,addon});assert.equal(manifest.batches[0].id,id);
  assert.deepEqual(data.config.bans.FUNNY,DATA.config.bans.FUNNY);assert.deepEqual(data.config.bans.TRAINING,DATA.config.bans.TRAINING);
  assert.deepEqual(data.chess,DATA.chess);assert.deepEqual(data.bonds,DATA.bonds);assert.deepEqual(data.config.economy,DATA.config.economy);
  for(let seed=1;seed<=32;seed++){
   const bans=drawDisabledBonds(gd,createRng(seed)),off=new Set([...bans.drawn,...bans.staticOff]),pool=new SharedPool(gd,{banned:bans.banned});
   assert.equal(bans.drawn.filter(b=>gd.bond(b).isCore).length,core);assert.equal(bans.drawn.filter(b=>!gd.bond(b).isCore).length,addon);assert.equal(new Set(bans.drawn).size,core+addon);
   for(const b of bans.drawn)assert.ok(gd.bond(b).weight>0&&!gd.modeInactiveBonds.has(b));
   for(const chessId of gd.visibleChess){const bs=gd.chess(chessId).bonds,excluded=bs.length>0&&bs.every(b=>off.has(b));assert.equal(bans.banned.includes(chessId),excluded);assert.equal(pool.has(chessId),!excluded&&gd.poolCopies(chessId)>0);}
  }
  const h=makeMatch({mode,difficulty,data,seed:19});try{assert.equal(h.m.disabledBonds.filter(b=>gd.bond(b).isCore).length,core);assert.equal(h.m.disabledBonds.filter(b=>!gd.bond(b).isCore).length,addon);}finally{h.m.dispose();}
 }
 assert.equal(JSON.stringify(DATA),before);
});

test('ban presets compose with all existing content, economy and round extensions without changing weight-zero protection',()=>{
 const before=JSON.stringify(DATA);
 for(const[id,core,addon]of presets){
  const ids=[id,'extended-rounds-24','shop-extra-slot','coop-pool-150','arknights-expansion-v1','rhodes-mujica-v1'],{data,manifest}=resolve(ids,'coop','ABYSS'),gd=new GameData(data,'mode_multi_abyss');
  assert.equal(gd.bossRound,24);assert.equal(gd.shopSlots(6).chess,6);assert.equal(gd.poolCopies('chess_char_5_07_a'),12);assert.deepEqual(gd.bans('ABYSS'),{core,addon});assert.equal(manifest.batches.length,6);
  const bans=drawDisabledBonds(gd,createRng(7));assert.equal(bans.drawn.length,core+addon);assert.ok(!bans.drawn.includes('rhodesShip')&&!bans.drawn.includes('girlbandShip'));
  assert.deepEqual(resolve(['arknights-expansion-v1','rhodes-mujica-v1']).data.config.bans,DATA.config.bans);
 }
 assert.equal(JSON.stringify(DATA),before);
});
