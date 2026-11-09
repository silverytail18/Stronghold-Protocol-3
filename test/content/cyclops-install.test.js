import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match } from '../../server/match/Match.js';
import { VirtualScheduler } from '../../server/match/scheduler.js';
import { getData } from '../../server/data.js';
import { applyCyclopsHex, cyclopsHexCard, cyclopsHexes } from '../../server/match/cyclops.js';
import { isolateContentCallback } from '../../server/sim/content/support/index.js';
import { makeBattle } from '../helpers/battleHarness.js';

const data=getData({log:{warn(){},error(){},info(){}}});
const bonds={victoria:'victoriaShip',sargon:'sargonShip',yan:'yanShip',kjerag:'kjeragShip',laterano:'lateranoShip',egir:'egirShip',siracusa:'siracusaShip',kazimierz:'kazimierzShip'};

test('48条馈赠以真实Match战斗输入安装，短帧执行无内容安装异常',()=>{
  for(const hex of cyclopsHexes(data))for(const q of ['silver','gold','prismatic']) {
    const scheduler=new VirtualScheduler({instantCombat:true});
    const m=new Match({mode:'coop',variant:'entertainment_cyclops',difficulty:'NORMAL',data,seed:77,scheduler,clientCombat:false,botRehearsal:0,
      seats:[{seat:0,playerId:'p1',name:'P1',isBot:false,connected:true}],send(){},broadcast(){},onEnd(){}});
    try{
      m.round=15;const p=m.order[0];p.lp=100;
      const bond=bonds[hex.family], id=p.gd.visibleChess.find(id=>!bond||p.gd.chess(id).bonds?.includes(bond));
      applyCyclopsHex(m,p,cyclopsHexCard(hex,q));
      const input=p.battleInput();input.units=[{uid:1,kind:'chess',chessId:id,row:10,col:5}];
      if(bond)input.bonds[bond]={active:true,tier:1,count:3,layers:20};
      const h=makeBattle({players:[input],data:m.ds,round:15,autoFinish:false,recordEvents:false});h.run(.2);
      assert.deepEqual(h.b.errors,[],hex.id+':'+q);
      if(hex.family==='victoria') {
        const buffs=[...h.allies()[0].buffs.values()];
        assert.ok(buffs.some(b=>b.key?.startsWith('hex:')&&b.mods?.atkPct>0),'real gift ATK buff applied');
      }
    }finally{m.dispose();scheduler.dispose();}
  }
});

test('独立内容接收者错误被记录，后续接收者继续执行且不增加事件深度',()=>{
  const errors=[],battle={_emitDepth:3,_handlerError:(label,owner,error)=>errors.push({label,owner,error})};
  const owner={id:1},fault=Error('recipient failed');
  assert.equal(isolateContentCallback(battle,()=>{throw fault;},'cyclops:member',owner),undefined);
  assert.equal(isolateContentCallback(battle,()=>42,'cyclops:member'),42);
  assert.equal(battle._emitDepth,3);assert.deepEqual(errors,[{label:'cyclops:member',owner,error:fault}]);
});
