import test from 'node:test';import assert from 'node:assert/strict';
import {mergeMizukiPublic,mergeMizukiField,mergeMizukiSnapshot,mergeMizukiEvents} from '../public/js/mizukiSnapshots.js';
const frame=fields=>({variant:'entertainment_mizuki',mizuki:{fields}});
const field={fieldId:'n:p',battleId:'battle-a',stage:{id:'stage-a'},geometry:{rows:5},meta:{units:[{id:1}],rect:{r0:0,r1:4,c0:0,c1:5}},t:0};
test('reliable metadata survives periodic public and snapshot updates, and spawns survive until superseded',()=>{
 let p=frame([field]);p=mergeMizukiPublic(p,frame([{fieldId:'n:p',battleId:'battle-a',t:.1}]));assert.equal(p.mizuki.fields[0].stage.id,'stage-a');
 p=mergeMizukiSnapshot(p,{t:'b.snap',fieldId:'n:p',battleId:'battle-a',time:.2,units:[[1,2,3,100]]});assert.equal(p.mizuki.fields[0].meta.units.length,1);assert.equal(p.mizuki.fields[0].t,.2);
 p=mergeMizukiEvents(p,{fieldId:'n:p',battleId:'battle-a',events:[['spawn',{id:2}]]});assert.equal(p.mizuki.fields[0].meta.units.length,2);
 p=mergeMizukiField(p,{t:'m.field',fieldId:'n:p',battleId:'battle-a',units:[{id:1},{id:2}],rect:field.meta.rect});assert.equal(p.mizuki.fields[0].stage.id,'stage-a');
});
test('metadata and late snapshots cannot cross battle identity or affect ordinary games',()=>{
 const previous=frame([field]);const next=mergeMizukiPublic(previous,frame([{fieldId:'n:p',battleId:'battle-b',t:0}]));assert.equal(next.mizuki.fields[0].meta,undefined);
 assert.equal(mergeMizukiSnapshot(next,{t:'b.snap',fieldId:'n:p',battleId:'battle-a',time:50}),next);
 const ordinary={variant:'normal'};assert.equal(mergeMizukiPublic(previous,ordinary),ordinary);assert.equal(mergeMizukiField(ordinary,{t:'m.field',battleId:'x',fieldId:'x'}),ordinary);
});
