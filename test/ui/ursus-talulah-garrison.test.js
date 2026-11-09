import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nativeGarrisonVisible} from '../../public/js/ui/detailPanel.js';
import {CORE} from '../../shared/ursus-rules.js';

test('Talulah Ursus terminal trait is listed only while the current Ursus bond is active',()=>{
 const trait={effectKey:'ursus_trait_oxi',operatorTrait:null};
 assert.equal(nativeGarrisonVisible(trait,[]),false);
 assert.equal(nativeGarrisonVisible(trait,[{bondId:CORE,active:false}]),false);
 assert.equal(nativeGarrisonVisible(trait,[{bondId:CORE,active:true}]),true);
 assert.equal(nativeGarrisonVisible({effectKey:'other',operatorTrait:null},[]),true);
});
