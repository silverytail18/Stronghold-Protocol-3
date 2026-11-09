import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {diyRecord} from '../../shared/diy.js';
import {masteredSkill,withMasteryItem,MASTERY_ITEM_ID} from '../../shared/skill-mastery.js';
import {chessLoadout} from '../../public/js/ui/gameLogic/loadout.js';
import {makeMatch,give,giveItem,legalTileFor} from '../match/harness.js';
import {composeProductData} from '../../server/product/content-data.js';

test('every owned DIY skill has real M3 data and reaches UI and simulation without contaminating rank-seven caches',()=>{
 const data=getData(),ds=new DataSource(data);let checked=0;
 for(const charId of data.backups.diy.ownedPool)for(const tier of [5,6]){
  const slot='chess_char_'+tier+'_diy1_a',unit=data.backups.units[charId];
  for(const skill of unit.forms['2/60/7/'+(tier===5?1:3)].skills){
   const pick={charId,skillIndex:skill.index,uniEquipId:null},rec=diyRecord(slot,pick,{elite:true,data});
   if(!rec)continue;
   const m3=masteredSkill(rec,rec.skill);assert(m3,charId+' '+skill.skillId);assert.equal(m3.level,10);
   const id=slot.replace(/_a$/,'_b'),normal=ds.getChess(id,{diy:pick}),def=ds.getChess(id,{diy:pick,masterySkillId:skill.skillId});
   assert.equal(normal.raw.skill.level,7);assert.equal(def.raw.skill.level,10);assert.equal(def.loadout.masterySkillId,skill.skillId);
   assert.deepEqual(def.raw.skill.bb,m3.bb);assert.equal(def.skill.spCost,m3.spCost);
   assert.equal(def.tokenOwner,normal.tokenOwner);assert.equal(ds.getChess(id,{diy:pick}),normal);
   const ui=chessLoadout(rec,null,k=>data.chess[k],{masterySkillId:skill.skillId});assert.equal(ui.skill.level,10);assert.deepEqual(ui.skill.bb,m3.bb);
   const plain=diyRecord(slot,pick,{data});assert.equal(masteredSkill(plain,plain.skill),null);checked++;
  }
 }
 assert(checked>300);tally(checked);
});
function tally(n){console.log('Owned DIY skill/tier combinations verified:',n);}

test('equipping a DIY mastery device consumes it and carries the chosen M3 into battle input and the simulation',()=>{
 const data=withMasteryItem(composeProductData(getData(),['extended-rounds-24','genius-trader-v1'])),slot='chess_char_6_diy1_a',pick={charId:'char_1035_wisdel',skillIndex:2,uniEquipId:null};
 const h=makeMatch({data,mode:'solo',fake:true,seats:[{seat:0,playerId:'p_0',name:'DIY',isBot:false,connected:true,diy:{[slot]:pick}}]}).start().toPrep(1);
 try{
  const p=h.ps('p_0'),id=slot.replace(/_a$/,'_b'),piece=give(h.m,p,id,'board',legalTileFor(h.m,p,id)),device=giveItem(h.m,p,MASTERY_ITEM_ID);
  assert.equal(p.equip(device.uid,piece.uid).ok,true);assert.equal(p.find(device.uid),null);
  const input=p.battleInput().units.find(u=>u.uid===piece.uid);assert.equal(input.masterySkillId,'skchr_wisdel_3');assert.equal(input.diy.charId,pick.charId);
  const def=new DataSource(data).getChess(id,{diy:input.diy,masterySkillId:input.masterySkillId});assert.equal(def.raw.skill.level,10);assert.equal(def.skill.spCost,50);
 }finally{h.m.dispose();}
});
