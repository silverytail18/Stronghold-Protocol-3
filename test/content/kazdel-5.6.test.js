// 5.6 added stronger population traits; 5.7 deliberately replaces them.
import {test} from 'node:test';import assert from 'node:assert/strict';
import {TRAIT_RULES,kazdelTraitFor} from '../../shared/kazdel-traits.js';
test('old extra converted templates and population pressure protection have been removed',()=>{
 assert.deepEqual(TRAIT_RULES.block,[1,1,1]);assert.deepEqual(TRAIT_RULES.pressureProtection,[0,0,0]);
 for(const profession of ['TANK','WARRIOR','MEDIC','SUPPORT','SNIPER'])assert.equal(kazdelTraitFor({profession,position:'MELEE'}),null);
 for(const key of ['flameRecovery','surtrTrue','logosTrue','hibiscShield','warfarinProtection','convertedShield'])assert.equal(TRAIT_RULES[key],undefined);
});
