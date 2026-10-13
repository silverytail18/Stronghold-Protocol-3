import {test} from 'node:test';
import assert from 'node:assert/strict';
import {engineeringDamage} from '../../shared/rhodes-engineering.js';
import {ENGINEERING_BALANCE as E} from '../../server/sim/content/rhodes-mujica/balance.js';
import {riShellProgress} from '../../public/js/render/rhodesFire.js';
test('early layers retain modest base and ATK supply even at nine; late six and nine separate',()=>{
 const early=engineeringDamage(E,84,4732,2),earlyNine=engineeringDamage(E,84,4732,3);
 assert.ok(early.fire<500);assert.equal(early.fire,earlyNine.fire);
 const six=engineeringDamage(E,800,10000,2),nine=engineeringDamage(E,800,10000,3);
 assert.equal(six.atkScale,.5);assert.equal(nine.atkScale,1);assert.equal(six.fire,23520);assert.equal(nine.fire,28520);
});
test('damage is continuous at the ramp start, bounded at 999 and grows monotonically',()=>{
 for(const tier of [2,3]){let last=0;for(let L=0;L<=999;L++){const n=engineeringDamage(E,L,10000,tier);assert.ok(n.fire>=last);last=n.fire;}
 assert.ok(engineeringDamage(E,221,10000,tier).fire-engineeringDamage(E,220,10000,tier).fire<40);
 assert.equal(engineeringDamage(E,2000,10000,tier).fire,engineeringDamage(E,999,10000,tier).fire);}
});
test('shell falls linearly within its fuse and reaches the impact without lingering',()=>{
 assert.equal(riShellProgress(0),0);assert.equal(riShellProgress(1),1);
 const p=[0,.25,.5,.75,1].map(riShellProgress),steps=p.slice(1).map((v,i)=>v-p[i]);assert.ok(steps.every(v=>v===.25));assert.ok(E.fuse.every(v=>v>0&&v<=.5));
});
