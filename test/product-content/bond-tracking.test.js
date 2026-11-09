import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMatch,give} from '../match/harness.js';
import {PHASE} from '../../shared/constants.js';

test('vanilla tracks two covenants privately; a third is refused and zero population clears selections',()=>{
  const h=makeMatch({mode:'coop',humans:2,fake:true}).start().toPrep(1);
  try{
    const p=h.ps('p_0'),other=h.ps('p_1');
    let col=2;
    for(const id of Object.keys(h.m.data.chess)){
      const c=h.m.gd.chess(id);if(col<=10&&!c?.isGolden&&!c?.isDiy&&c?.visible!==false&&c?.bonds?.some(key=>!p.bonds[key]?.count))give(h.m,p,id,'board',[12,col++]);
      if(Object.values(p.bonds).filter(b=>b.count>0).length>=3)break;
    }
    const ids=Object.keys(p.bonds).filter(id=>p.bonds[id].count>0);assert.ok(ids.length>=3);
    for(const id of ids.slice(0,2))assert.equal(h.m.handle(p.playerId,{t:'g.trackBond',bondId:id}).ok,true);
    assert.ok(h.m.handle(p.playerId,{t:'g.trackBond',bondId:ids[2]}).error);
    assert.deepEqual(p.privateView().trackedBonds,ids.slice(0,2));
    assert.deepEqual(other.privateView().trackedBonds,[]);
    h.m.phase=PHASE.COMBAT;p.recompute();assert.deepEqual(p.privateView().trackedBonds,ids.slice(0,2));
    assert.ok(p.trackBond(ids[0]).error);
    h.m.phase=PHASE.PREP;p.board.clear();p.hand.fill(null);p.temp.fill(null);p.recompute();
    assert.deepEqual(p.privateView().trackedBonds,[]);
  }finally{h.m.dispose();}
});
