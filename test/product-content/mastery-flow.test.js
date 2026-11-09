import test from 'node:test';import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';import {composeProductData} from '../../server/product/content-data.js';import {makeMatch,give,giveItem,legalTileFor} from '../match/harness.js';
import {MASTERY_ITEM_ID,withMasteryItem} from '../../shared/skill-mastery.js';
import {chessLoadout} from '../../public/js/ui/gameLogic/loadout.js';
test('mastery device consumes without replacing two equipped items and reaches private card and actual client simulation',()=>{
  const data=withMasteryItem(composeProductData(getData(),['arknights-expansion-v1'])),h=makeMatch({data,mode:'solo',clientCombat:true,verify:'all'}).start().toPrep(1),p=h.ps('p_0');
  try{
    const id='chess_exp_chen3_b',rec=data.chess[id],at=legalTileFor(h.m,p,id),piece=give(h.m,p,id,'board',at);
    const wear=Object.values(data.items).filter(i=>i.visible!==false&&!i.isGolden&&i.itemType==='EQUIP'&&!i.kind?.startsWith('consume_on_equip')&&!i.canGiveBond).slice(0,2);assert.equal(wear.length,2);
    for(const it of wear){const item=giveItem(h.m,p,it.id);assert.equal(p.equip(item.uid,piece.uid).ok,true);}assert.equal(piece.items.length,2);
    const before=piece.items.map(i=>i.uid),device=giveItem(h.m,p,MASTERY_ITEM_ID);assert.equal(p.equip(device.uid,piece.uid).ok,true);assert.deepEqual(piece.items.map(i=>i.uid),before);assert.equal(p.find(device.uid),null);
    const shown=p.pieceView(piece);assert.equal(shown.masterySkillId,piece.meta.masterySkillId);
    const input=p.battleInput();assert.equal(input.units.find(u=>u.uid===piece.uid).masterySkillId,piece.meta.masterySkillId);
    const ui=chessLoadout(rec,p.loadout,id=>data.chess[id],{masterySkillId:shown.masterySkillId});assert.equal(ui.skill.level,10);
    h.toPrep(2);const battles=[...h.clients.get('p_0').battles.values()];assert.ok(battles.length);
    const unit=battles.flatMap(r=>r.battle.allyUnits).find(u=>u.uid===piece.uid);console.log('mastery trace',JSON.stringify({input:input.units.find(u=>u.uid===piece.uid),clientInput:battles[0].battle.opts.players[0].units.find(u=>u.uid===piece.uid),loadout:unit.def.loadout,rawLevel:unit.def.raw.skill.level,ui:ui.skill.level}));assert.equal(unit.def.raw.skill.level,10);assert.deepEqual(unit.def.skill.bb,ui.skill.bb);assert.equal(unit.def.skill.spCost,ui.skill.spCost);assert.equal(h.m.verifyStats.mismatches,0);
    assert.deepEqual(h.logs.error,[]);
  }finally{h.m.dispose();h.clients?.forEach(c=>c.close());}
});
