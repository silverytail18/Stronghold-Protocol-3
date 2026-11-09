import test from 'node:test';import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';import {composeProductData} from '../../server/product/content-data.js';import {makeMatch} from '../match/harness.js';
import {adminOperatorView} from '../../server/match/adminOperators.js';
test('admin grant defaults off, requires both live permissions and own switch, gives selected forms once without pool inflation',()=>{
  const data=composeProductData(getData(),['arknights-expansion-v1']),h=makeMatch({data,mode:'coop',humans:2,fake:true}).start().toPrep(1),p=h.ps('p_0'),q=h.ps('p_1');
  try{
    const send=(who,msg)=>h.m.handle(who.playerId,msg),choice={baseId:'chess_exp_aglna2_a',elite:true};
    assert.equal(adminOperatorView(h.m,p),null);assert.ok(send(p,{t:'g.adminOperatorsEnabled',enabled:true}).error);
    let enabled=true;h.m.productCanTestOperators=id=>enabled&&id===p.playerId;
    assert.equal(adminOperatorView(h.m,p).enabled,false);assert.equal(adminOperatorView(h.m,q),null);
    assert.ok(send(p,{t:'g.adminOperatorsClaim',selections:[choice]}).error);assert.equal(send(p,{t:'g.adminOperatorsEnabled',enabled:true}).ok,true);
    assert.ok(send(q,{t:'g.adminOperatorsEnabled',enabled:true}).error);
    assert.equal(send(p,{t:'g.adminOperatorsClaim',selections:[choice]}).ok,true);
    const piece=p.hand.find(c=>c?.id==='chess_exp_aglna2_b');assert.ok(piece);assert.equal(piece.poolCopies,0);assert.equal(q.hand.filter(Boolean).length,0);
    assert.ok(send(p,{t:'g.adminOperatorsClaim',selections:[choice]}).error);enabled=false;assert.equal(adminOperatorView(h.m,p),null);
    enabled=true;h.m.productRanked=true;assert.equal(adminOperatorView(h.m,p),null);assert.ok(send(p,{t:'g.adminOperatorsEnabled',enabled:true}).error);
  }finally{h.m.dispose();}
});
