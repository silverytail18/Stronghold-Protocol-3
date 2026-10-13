import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getData} from '../../server/data.js';
import {TestContent} from '../../server/test-content.js';
import {buildExpansionData} from '../../server/sim/content/expansion/expansion-data.js';
import {buildLoadoutCatalog,matchLoadout} from '../../server/sim/content/expansion/loadout-catalog.js';
import {buildEncyclopediaCatalog} from '../../server/sim/content/expansion/encyclopedia-catalog.js';
import {encyclopediaTraits} from '../../shared/encyclopedia.js';
import {CLEMNT} from '../../server/sim/content/expansion/clemnt-data.js';
import {addVortexErosion} from '../../server/sim/content/expansion/clemnt-kits.js';
import {TEST_OPERATOR_CATALOG} from '../../shared/test-operator-catalog.js';
import {bondLayers} from '../../server/sim/content/support/index.js';
import {DataSource} from '../../server/sim/simdata.js';
import {makeBattle,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {makeMatch,give,legalTileFor} from '../match/harness.js';
const BASE=getData(),DATA=buildExpansionData(BASE),ELITE=CLEMNT.replace(/_a$/,'_b');
function field(skill=2,golden=false,extra={}){
 const raw=structuredClone(DATA);raw.enemies.dummy=enemyRec({key:'dummy',hp:1e7,def:400,atk:0,speed:0,mass:1});
 const h=makeBattle({data:new DataSource(raw,null),units:[{chessId:golden?ELITE:CLEMNT,uid:1,row:10,col:4,dir:'RIGHT',skillIndex:skill,moduleId:'none'}],autoFinish:false,timeLimit:120,captureNoisy:true,...extra});h.step();const u=h.unit(1),e=h.spawn('dummy',{pos:[10,5]});return {h,b:h.b,u,e};
}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,a+' != '+b);

for(const golden of [false,true])test(`Clementia S2 ${golden} stopped circular vortex damages and erodes air; transport and ordinary enhanced hits stay ground-only`,()=>{
 const raw=structuredClone(DATA);raw.enemies.fly=enemyRec({key:'fly',motion:'FLY',hp:1e7,def:400,atk:0,speed:0});
 const h=makeBattle({data:new DataSource(raw,null),units:[{chessId:golden?ELITE:CLEMNT,uid:1,row:10,col:4,dir:'RIGHT',skillIndex:1}],autoFinish:false,captureNoisy:true});h.step();const u=h.unit(1);
 const transit=h.spawn('fly',{pos:[10,5]});u.skill.addCharge(1);u.skill.activate('test');h.run(1.6);assert.equal(transit.x,5);assert.equal(transit.y,10);
 const pod=u.mem.clemntPod;assert.ok(pod?.stopped);const inside=h.spawn('fly',{pos:[pod.y,pod.x+.2]}),outside=h.spawn('fly',{pos:[pod.y+1.1,pod.x+1.1]});pod.pulse=0;h.run(1.1);
 assert.ok(inside.hp<1e7);assert.equal(inside.elem.erosion,200);assert.ok(inside.findBuff('exp:clemnt:vortexSlow'));assert.equal(outside.hp,1e7);assert.equal(outside.elem.erosion,0);
 assert.ok(!h.hooksOf('damageResolved').some(c=>c.dmg.tags?.includes('exp:clemnt:s2Attack')&&c.target.isFlying));assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);
});
test('fixed vortex erosion accepts flying / hovering / levitated enemies while honoring invulnerability, sleep and burst lock',()=>{
 const {h,b,u}=field(1);for(const flag of ['flight','float','levitate']){const e=h.spawn('dummy',{pos:[10,6]});if(flag==='flight')e.motion='FLY';else b.addBuff(e,{key:'qa:'+flag,flags:{[flag]:true}});assert.ok(e.isFlying);assert.equal(addVortexErosion(b,u,e),200);assert.equal(e.elem.erosion,200);}
 for(const flag of ['invulnerable','sleep']){const e=h.spawn('dummy',{pos:[11,6]});b.addBuff(e,{key:'qa:'+flag,flags:{[flag]:true}});assert.equal(addVortexErosion(b,u,e),0);assert.equal(e.elem.erosion,0);}
});
test('Clementia test batch isolated, config catalog and encyclopedia include both qualities and accurate skill descriptions',()=>{
 const baseline=JSON.stringify(BASE),tc=new TestContent(),room={mode:'solo',difficulty:'NORMAL'},menu=tc.menu(room),entry=menu.items.find(e=>e.id==='arknights-expansion-v1');
 assert.equal(entry.clientVersion,18);assert.equal(entry.version,'expansion-test-9');const enabled=tc.resolve({version:menu.version,ids:[entry.id]},room,BASE).data;
 assert.ok(!BASE.chess[CLEMNT]);assert.deepEqual(matchLoadout({[CLEMNT]:{skill:2}},BASE.chess),{});const cat=buildLoadoutCatalog(BASE),enc=buildEncyclopediaCatalog(BASE);
 for(const id of [CLEMNT,ELITE]){const c=enabled.chess[id];assert.deepEqual(c.bonds,['egirShip','swiftShip']);assert.deepEqual(cat.chess[id].bonds,['egirShip','swiftShip']);assert.equal(c.tier,6);assert.equal(c.skills.length,3);assert.equal(c.module,null);assert.deepEqual(cat.chess[id].skills,c.skills);assert.ok(enc.garrisons[c.garrisonIds[0]]);assert.ok(!enc.garrisons[c.garrisonIds[0]].desc.includes('精准'));for(const s of c.skills)assert.ok(!/[{}]|attack@/.test(s.desc));}
 assert.ok(enc.bonds.egirShip.visibleMembers.includes(CLEMNT));assert.ok(enc.bonds.swiftShip.visibleMembers.includes(CLEMNT));assert.ok(!enc.bonds.preciShip.visibleMembers.includes(CLEMNT));assert.equal(TEST_OPERATOR_CATALOG.find(e=>e.baseId===CLEMNT).batch,entry.id);assert.equal(JSON.stringify(BASE),baseline);
});
test('encyclopedia consolidates Vigil runtime text and contained weakness entry without mutating original traits',()=>{
 const before=JSON.stringify(BASE.garrisons);for(const id of ['chess_char_3_19_a','chess_char_3_19_b']){const list=encyclopediaTraits(BASE.chess[id],BASE.garrisons);assert.equal(list.length,1);assert.match(list[0].desc,/叙拉古/);assert.match(list[0].desc,/奇迹/);assert.match(list[0].desc,/弱点伤害/);assert.ok(!/【152】/.test(list[0].desc));}assert.equal(JSON.stringify(BASE.garrisons),before);
 const independent=encyclopediaTraits({garrisonIds:['a','b','a']},{a:{desc:'受到攻击时获得2层。'},b:{desc:'击倒敌人时获得2层。'}});assert.equal(independent.length,2);
});
for(const golden of [false,true])for(const skill of [0,1,2])test('selected original skill plays normally: '+skill+' '+golden,()=>{
 const {h,u}=field(skill,golden);assert.equal(u.skill.id,'skchr_clemnt_'+(skill+1));u.skill.addCharge(1);h.run(25);assert.ok(h.hooksOf('skillStart').length);assert.ok(u.stats.dmg>0);assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);
});
test('S1 erosion is actual HP damage ratio, shields and lethal target produce no extra gauge',()=>{
 const {h,b,u,e}=field(0);b.rng=()=>1;u.skill.addCharge(1);u.skill.activate('test');b.forceAttack(u,[e]);const damage=h.hooks.damageResolved.filter(x=>x.source===u&&x.dmg.isAttack).at(-1);assert.ok(damage);close(e.elem.erosion,damage.dealt*u.skill.bb.ep_damage_ratio);
 const e2=h.spawn('dummy',{pos:[11,5]});b.addBuff(e2,{key:'testShield',shieldHits:1});u.skill.addCharge(1);u.skill.activate('test');b.forceAttack(u,[e2]);assert.equal(e2.elem.erosion,0);
});
test('S3 ordinary enhanced attacks do not consume bombardment ammo; non-erosion bursts ignored',()=>{
 const {h,b,u,e}=field(2);u.skill.addCharge(1);u.skill.activate('test');const n=u.skill.ammoLeft;b.forceAttack(u,[e]);assert.equal(u.skill.ammoLeft,n);b.emit('elementBurst',{source:u,target:e,element:'burn'});h.step();assert.equal(u.skill.ammoLeft,n);
});
test('S3 global ground erosion queues one ammo bombardment, three hits, ongoing tile prevents duplicate and last shell survives skill end',()=>{
 const {h,b,u,e}=field(2);e.x=8;e.y=11;u.skill.addCharge(1);u.skill.activate('test');u.skill.ammoLeft=1;b.emit('elementBurst',{source:null,target:e,element:'erosion'});h.step();assert.equal(u.skill.active,false);h.run(3);const hits=h.hooks.damageResolved.filter(x=>x.dmg.tags?.includes('exp:clemnt:bombard'));assert.equal(hits.filter(x=>x.dmg.type==='phys').length,3);assert.equal(hits.filter(x=>x.dmg.type==='elemental').length,3);checkInvariants(b);
});
test('S2 fixed erosion bypasses resistance and element hooks, bursts at five ticks and honors shared cooldown',()=>{
 const {b,u,e}=field(1);e.def={...e.def,epResistance:95};b.addBuff(e,{key:'resist',mods:{elemTakenMul:.1}});b.on('elementHit',ctx=>{ctx.dmg.amount=0;});for(let i=0;i<4;i++)addVortexErosion(b,u,e);assert.equal(e.elem.erosion,800);addVortexErosion(b,u,e);assert.ok(e.findBuff('erosionBurst'));assert.equal(e.s.def,280);assert.equal(addVortexErosion(b,u,e),0);
});
test('directional original talent mitigates front physical/arts only and original reduced-defense crit chance applies before mitigation',()=>{
 const {b,u,e}=field(0);b.rng=()=>.4;const a=b.dealDamage(u,e,{amount:1000,type:'phys'});close(a,600);b.addBuff(e,{key:'break',mods:{defFlat:-120}});const d=b.dealDamage(u,e,{amount:1000,type:'phys'});close(d,1350-280);
 e.x=u.x+1;e.y=u.y;let hp=u.hp;b.dealDamage(e,u,{amount:1000,type:'phys',canDodge:false});close(hp-u.hp,(1000-u.s.def)*.7);e.x=u.x-1;hp=u.hp;b.dealDamage(e,u,{amount:1000,type:'phys',canDodge:false});close(hp-u.hp,1000-u.s.def);
});
test('Clementia growth cap shared between copies, source ownership required, disabled battle growth excluded',()=>{
 const {b,u,e}=field(2,false,{bonds:{egirShip:{active:true,tier:1,count:3,layers:0},swiftShip:{active:true,tier:1,count:2,layers:0},preciShip:{active:true,tier:1,count:2,layers:0}}});const before=bondLayers(b,'p1','egirShip');for(let i=0;i<8;i++)b.emit('elementBurst',{source:u,target:e,element:'erosion'});assert.equal(bondLayers(b,'p1','egirShip')-before,6);assert.equal(bondLayers(b,'p1','swiftShip'),3);assert.equal(bondLayers(b,'p1','preciShip'),0);b.flags.layerGainsEnabled=false;b._clemntGrowth.clear();b.emit('elementBurst',{source:u,target:e,element:'erosion'});assert.equal(bondLayers(b,'p1','egirShip')-before,6);assert.equal(bondLayers(b,'p1','swiftShip'),3);
});

for(const golden of [false,true])test(`Clementia ${golden?'elite':'ordinary'} counts for Swift and grows only active owned bonds`,()=>{
 const id=golden?ELITE:CLEMNT,h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true}).start();h.toPrep(1);
 const m=h.m,p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.recompute();
 const partner=Object.values(DATA.chess).find(c=>c.visible&&!c.isGolden&&c.chessId!==CLEMNT&&c.bonds.includes('swiftShip')&&!c.bonds.includes('preciShip')).chessId;
 for(const member of [id,partner])give(m,p,member,'board',legalTileFor(m,p,member));
 assert.equal(p.bonds.swiftShip.active,true);assert.equal(p.bonds.swiftShip.count,2);assert.equal(p.bonds.preciShip.count,0);h.invariants();m.dispose();
 const {b,u,e}=field(2,golden,{bonds:{swiftShip:{active:true,tier:1,count:2,layers:0}}});
 b.emit('elementBurst',{source:null,target:e,element:'erosion'});assert.equal(bondLayers(b,'p1','swiftShip'),0);
 b.emit('elementBurst',{source:u,target:e,element:'erosion'});assert.equal(bondLayers(b,'p1','swiftShip'),golden?2:1);assert.equal(bondLayers(b,'p1','egirShip'),0);assert.equal(bondLayers(b,'p1','preciShip'),0);
});

test('ordinary and elite Clementia share three Swift/Agir growth triggers per owner',()=>{
 const {h,b,e}=field(2,false,{units:[{chessId:CLEMNT,uid:1,row:10,col:4,skillIndex:2},{chessId:ELITE,uid:2,row:11,col:4,skillIndex:2}],bonds:{egirShip:{active:true,tier:1,count:3,layers:0},swiftShip:{active:true,tier:1,count:2,layers:0}}});
 const a=h.unit(1),z=h.unit(2);for(const source of [a,z,a,z,z,z])b.emit('elementBurst',{source,target:e,element:'erosion'});
 assert.equal(bondLayers(b,'p1','egirShip'),8);assert.equal(bondLayers(b,'p1','swiftShip'),4);checkInvariants(b);
});
test('all fixed original assets available before a match, including both battle orientations and skill icons',()=>{
 const a=DATA.assets.chars.char_4231_clemnt;for(const side of ['front','back']){assert.ok(a.spine[side].anims.skills[2]);for(const p of [a.spine[side].atlas,a.spine[side].skel,...a.spine[side].textures])assert.ok(fs.existsSync('public'+p));}for(const p of [a.avatar,a.avatarE2,a.portrait,a.portraitE2,...[1,2,3].map(i=>DATA.assets.skills['skchr_clemnt_'+i])])assert.ok(fs.existsSync('public'+p));
});
