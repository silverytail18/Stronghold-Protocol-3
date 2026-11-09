import test from 'node:test';import assert from 'node:assert/strict';
import {getData,getVersionData} from '../../server/data.js';
import {VERSIONS} from '../../shared/versions.js';
import {ROOM_CARD_EXTRAS} from '../../shared/room-card-extras.js';
import {composeProductData} from '../../server/product/content-data.js';
import {cardOperators,cardContext,seatOperator} from '../../public/js/ui/seatArt.js';
import {chessAvatarUrl,chessPortraitUrl} from '../../public/js/ui/assetUrls.js';

test('all five band members appear at their numeric stars with their gameplay pack disabled in every official version',()=>{
  for(const version of VERSIONS){
    const d=getVersionData(version.id),list=cardOperators(Object.values(d.chess),d.backups),ctx=cardContext(list);
    for(const c of ROOM_CARD_EXTRAS){
      const row=list.find(r=>r.charId===c.charId);assert.ok(row,c.name);assert.equal(row.rarity,c.charId==='char_4182_oblvns'?6:5);
      assert.ok(list.filter(r=>r.rarity===row.rarity).includes(row));assert.ok(ctx.pool.includes(row));
      assert.equal(seatOperator({playerId:'p',card:c.charId},ctx).chess.charId,c.charId);
      assert.match(chessAvatarUrl({chars:{}},row),/^\/assets\/char\/avatar\//);assert.match(chessPortraitUrl({chars:{}},row),/^\/assets\/char\/portrait\//);
    }
    assert.equal(new Set(list.map(c=>c.charId)).size,list.length);assert.ok(list.every(c=>Number.isFinite(c.rarity)));
    for(let i=1;i<list.length;i++)assert.ok(list[i-1].rarity>=list[i].rarity);
  }
});
test('enabling the band gameplay pack also normalizes enum stars without modifying its chess records',()=>{
  const d=composeProductData(getData(),['rhodes-mujica-v1']),before=JSON.stringify(d.chess),list=cardOperators(Object.values(d.chess),d.backups);
  for(const c of ROOM_CARD_EXTRAS){const row=list.find(r=>r.charId===c.charId);assert.equal(row.rarity,c.rarity);assert.equal(list.filter(r=>r.charId===c.charId).length,1);}
  assert.equal(JSON.stringify(d.chess),before);
});
