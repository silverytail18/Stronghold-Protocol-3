import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildRhodesMujicaData,RI,AMIYA,NEARL,DOLRIS,AMORIS} from '../../server/sim/content/rhodes-mujica/data.js';
import {ENGINEERING_BALANCE as E} from '../../server/sim/content/rhodes-mujica/balance.js';
import {formatBondEffect,richTextPlain} from '../../public/js/ui/richText.js';
import {engineeringDamage} from '../../shared/rhodes-engineering.js';
import {makeMatch,give} from '../match/harness.js';
const quiet={warn(){},error(){},info(){}},raw=buildRhodesMujicaData(getData({log:quiet})),bond=raw.bonds[RI];
test('current effect resolves new timing, radius, stats and per-shell damage without growth formula',()=>{
 for(const tier of [2,3])for(const L of [0,220,300,800,999]){
  const text=richTextPlain(formatBondEffect(bond,L,tier,{atk:10000,live:true})),i=tier===3?1:0,n=engineeringDamage(E,L,10000,tier);
  assert.ok(text.includes('每'+E.interval[i]+'秒'));assert.ok(text.includes('半径'+E.radius[i]+'格'));assert.ok(text.includes('物理 '+Math.round(n.fire)));assert.ok(text.includes('法术 '+Math.round(n.fire)));
  assert.equal(text.includes('真实 '+Math.round(n.fire*.5)),tier===3);assert.ok(!text.includes('平方'));assert.ok(!/[{}]/.test(text));assert.ok(!text.includes('预计'));
 }
});
test('opening preview is labelled, unknown context never implies zero or stale damage, inactive tiers are explicit',()=>{
 const prep=richTextPlain(formatBondEffect(bond,300,2,{atk:10000,live:false}));assert.ok(prep.includes('开战预计单发伤害：物理 2054'));assert.ok(prep.includes('攻击力+70%'));assert.ok(prep.includes('最大生命+70%'));assert.ok(!prep.includes('屏障'));
 const missing=richTextPlain(formatBondEffect(bond,300,2));assert.ok(missing.includes('物理 待获取'));assert.ok(!missing.includes('物理 1020'));assert.ok(!/[{}]/.test(missing));
 assert.ok(formatBondEffect(bond,300,0).includes('未激活'));assert.ok(!formatBondEffect(bond,300,1,{atk:10000}).includes('工程火力'));
});
test('server opening preview uses the existing unstepped attributes and is private, cached and non-mutating',()=>{
 const h=makeMatch({data:structuredClone(raw),mode:'solo',difficulty:'HARD',fake:false}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0');
 p.bandId=null;p.board.clear();p.layers[RI]=300;
 const native=name=>Object.values(raw.chess).find(c=>c.name===name&&c.visible&&!c.isGolden).chessId;
 for(const [i,id]of [native('波登可'),native('休谟斯'),AMIYA,NEARL,DOLRIS,AMORIS].entries())give(m,p,id,'board',[9+Math.floor(i/2),3+i%2]);p.recompute();
 const before=JSON.stringify([p.layers,p.coins,[...p.board]]);m.unitStats(p,17);const message=h.lastTo('p_0','m.unitStats');
 assert.equal(message.seq,17);assert.equal(message.rhodes.live,false);assert.ok(message.rhodes.atk>0);assert.ok(Math.abs(message.units.reduce((n,u)=>n+u.atk,0)-message.rhodes.atk)<4);
 const cached=m._unitStatsOf(p);assert.equal(cached,m._unitStatsOf(p));assert.equal(JSON.stringify([p.layers,p.coins,[...p.board]]),before);m.dispose();
});
