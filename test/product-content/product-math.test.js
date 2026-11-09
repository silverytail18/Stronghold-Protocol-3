import test from 'node:test';import assert from 'node:assert/strict';import {exp,log,positivePow,ieeeWords} from '../../server/sim/productMath.js';
const near=(a,b,relative=3e-14)=>assert.ok(Math.abs(a-b)<=Math.max(Number.MIN_VALUE,Math.abs(b)*relative),a+' != '+b);
test('deterministic exponential/logarithm cover decay, subnormals and IEEE limits',()=>{
 for(let i=-7000;i<=7000;i++){const x=i/10;near(exp(x),Math.exp(x),4e-15);if(x>0)near(log(x),Math.log(x),4e-15);}
 for(const x of [Number.MIN_VALUE,1e-300,.5,.999999999,1,2,1e300,Number.MAX_VALUE])near(log(x),Math.log(x),4e-15);
 assert.equal(exp(0),1);assert.equal(exp(-Infinity),0);assert.equal(exp(Infinity),Infinity);assert.equal(log(0),-Infinity);assert.ok(Number.isNaN(log(-1)));assert.deepEqual(ieeeWords(exp(1)),[0x4005bf0a,0x8b14576a]);
});
test('native-turn smoothing, integer falloff and continuous soul-fire decay keep configured formulas',()=>{
 for(const base of [.01,.5,.8,.94,.99,1,1.1,2])for(const power of [0,.3,.5,1,1.2,2,6,20,60])near(positivePow(base,power),Math.pow(base,power),3e-13);
 for(const rate of [.005,.015])for(const dt of [1/120,1/60,1/30,.1,1])near(1-exp(-rate*dt),1-Math.exp(-rate*dt),1e-10);
 assert.equal(positivePow(0,0),1);assert.equal(positivePow(0,2),0);assert.equal(positivePow(-2,3),-8);assert.ok(Number.isNaN(positivePow(-2,.5)));
});
