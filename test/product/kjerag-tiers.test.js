import {test} from 'node:test';
import assert from 'node:assert/strict';
import {KJERAG_GUIDE,guideDescription} from '../../server/sim/content/expansion/kjerag-balance.js';
import {testBondEffect} from '../../shared/test-bond-descriptions.js';

const bond={name:'雪境向导',thresholds:[2,5],testDescription:{kind:'snow',...KJERAG_GUIDE}};

test('雪境向导2人档只有冰爆，5人档在冰爆外增加寒冷',()=>{
  const base=guideDescription();
  const two=testBondEffect(bond,0,1);
  const five=testBondEffect(bond,0,2);

  assert.match(base,/^2名：[\s\S]*冰爆/);
  assert.match(base,/\n5名：[\s\S]*寒冷/);
  assert.match(two,/冰爆固定基础伤害/);
  assert.match(two,/5人后冰爆范围提高至1\.2格并额外解锁寒冷/);
  assert.doesNotMatch(two,/范围寒冷/);
  assert.match(two,/周围半径0\.8格/);
  assert.match(five,/范围寒冷/);
  assert.match(five,/周围半径1\.2格/);
  assert.match(five,/冰爆返还寒冷/);
  assert.equal(KJERAG_GUIDE.iceBase,500);
  assert.equal(KJERAG_GUIDE.coldCooldown,30);
  assert.equal(KJERAG_GUIDE.coldMinimum,20);
  assert.equal(KJERAG_GUIDE.iceCooldown,16);
  assert.equal(KJERAG_GUIDE.iceMinimum,12);
  assert.equal(KJERAG_GUIDE.iceRadius2,0.8);
  assert.equal(KJERAG_GUIDE.iceRadius5,1.2);
});
