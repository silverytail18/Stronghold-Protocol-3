import test from 'node:test';
import assert from 'node:assert/strict';
import {getVersionData} from '../../server/data.js';
import {composeProductData} from '../../server/product/content-data.js';
import {modeIdFor} from '../../shared/constants.js';
import {VERSIONS} from '../../shared/versions.js';

test('round extensions preserve independent variants across official versions and room types',()=>{
  for(const version of VERSIONS){
    const base=getVersionData(version.id);
    const before=JSON.stringify(base);
    for(const mode of ['solo','coop'])for(const total of [20,24,30]){
      const data=composeProductData(base,[`extended-rounds-${total}`],{version:version.id,mode});
      for(const difficulty of ['NORMAL','HARD','ABYSS']){
        const id=modeIdFor(mode,difficulty);
        assert.equal(data.config.modes[id].bossRound,total,`${version.id}/${id}/${total}`);
        assert.equal(data.config.modes[id].hiddenRound,total+1);
      }
      for(const id of ['mode_cyclops','mode_training_1','mode_single_funny','mode_multi_funny']){
        assert.deepEqual(data.config.modes[id],base.config.modes[id],`${version.id}/${id}/${total}`);
        assert.deepEqual(data.choices.schedule[id],base.choices.schedule[id]);
      }
    }
    assert.equal(JSON.stringify(base),before,'shared version data remains unchanged');
  }
});
