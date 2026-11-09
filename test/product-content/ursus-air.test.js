import{test}from'node:test';import assert from'node:assert/strict';import{getData}from'../../server/data.js';import{buildUrsusData,CORE}from'../../server/sim/content/ursus/data.js';import{makeBattle,enemyRec}from'../helpers/battleHarness.js';import{acquireTargets,effectiveProfile,performAttack}from'../../server/sim/ai.js';
function fixture({active=true,key='brownb',skillIndex=0,single=false}={}){
 const data=buildUrsusData(getData());data.enemies.ur_air=enemyRec({key:'ur_air',hp:1e7,speed:0,motion:'FLY'});
 const units=[key,'headbr','wintim'].map((k,i)=>({uid:i+1,chessId:'chess_ursus_'+k+'_a',row:10,col:2+i,skillIndex:i===0?skillIndex:0}));
 const h=makeBattle({data,autoFinish:false,players:[{playerId:'p1',units,bonds:{[CORE]:{active,count:active?3:2,tier:active?1:0,layers:0}}}],enemies:[5,6,7,8].map(col=>({key:'ur_air',route:2,pos:[10,col]})),setup(b){for(const u of b.allyUnits){u.rangeGrid=single?(u.uid===2?[[0,5-u.homeC]]:[[0,0]]):u.uid===1?[[0,0],[0,5]]:[[0,5-u.homeC],[0,6-u.homeC]];b.addBuff(u,{key:'qa:pause',flags:{disarm:true,noSp:true},persist:true});}}});h.step();return{h,b:h.b,u:h.allies()[0],enemies:h.enemies()};
}
test('three-member Ursus melee really attacks flyers in shared cells outside native range, without changing its native profile',()=>{
 const{h,b,u,enemies:[e]}=fixture(),before=e.hp,area=b.ursus.states.get('p1').domain.area;assert.equal(u.profile.canHitFly,false);assert.ok(!u.rangeKeys.includes(10*21+5));assert.equal(b.ursus.depth('p1',e),2);assert.ok(acquireTargets(b,u,effectiveProfile(u)).includes(e));b.removeBuff(u,'qa:pause');h.run(1);assert.ok(e.hp<before);assert.ok(u.stats.dmg>0);assert.equal(u.profile.canHitFly,false);assert.equal(b.ursus.states.get('p1').domain.area,area);assert.deepEqual(b.errors,[]);
});
test('one-depth, zero-depth and inactive core grant neither shared targets nor added air permission',()=>{
 const off=fixture({active:false});assert.equal(acquireTargets(off.b,off.u,effectiveProfile(off.u)).length,0);
 const{h,b,u,enemies:[e,,,outside]}=fixture({single:true});assert.equal(b.ursus.depth('p1',e),1);assert.equal(b.ursus.depth('p1',outside),0);assert.equal(b.ursus.canHitAir(u,e,u.profile),false);assert.equal(b.ursus.canHitAir(u,outside,u.profile),false);assert.ok(!u.rangeKeys.includes(10*21+5));const hp=e.hp;assert.equal(acquireTargets(b,u,effectiveProfile(u)).length,0);b.removeBuff(u,'qa:pause');h.run(1);assert.equal(e.hp,hp);
 for(const a of h.allies()){a.rangeGrid=[[1,0]];b.refreshRange(a);}b.ursus.invalidate();assert.equal(b.ursus.depth('p1',e),1);assert.equal(acquireTargets(b,u,effectiveProfile(u)).length,0);e.x=8;e.y=10;h.step();assert.equal(b.ursus.depth('p1',e),0);assert.equal(acquireTargets(b,u,effectiveProfile(u)).length,0);
});
test('air sharing preserves target filters, hidden/sleep rules, explicit ground-only attacks and independent skills',()=>{
 const{b,u,enemies}=fixture(),prof=effectiveProfile(u);assert.equal(acquireTargets(b,u,{...prof,groundOnly:true}).length,0);assert.equal(acquireTargets(b,u,{...prof,targetFilter:()=>false}).length,0);
 for(const flags of [{stealth:true},{sleep:true},{untargetable:true}]){for(const e of enemies)b.addBuff(e,{key:'qa:hidden',flags});assert.equal(acquireTargets(b,u,prof).length,0);for(const e of enemies)b.removeBuff(e,'qa:hidden');}
 u.skill.active=true;u.skill.spec={...u.skill.spec,allowSharedRange:false};assert.equal(acquireTargets(b,u,prof).length,0);
});
test('native air attacks remain legal in one-depth cells, while added melee air permission follows the target depth',()=>{
 const{b,u,enemies:[two,,one]}=fixture();assert.equal(b.ursus.depth('p1',one),1);assert.ok(u.rangeKeys.includes(10*21+7));assert.ok(!acquireTargets(b,u,u.profile).includes(one));assert.ok(acquireTargets(b,u,{...u.profile,canHitFly:true,targetFilter:e=>e===one}).includes(one));
 assert.equal(b.ursus.canHitAir(u,two,u.profile),true);two.x=7;two.y=10;assert.equal(b.ursus.depth('p1',two),1);assert.equal(b.ursus.canHitAir(u,two,u.profile),false);assert.ok(!acquireTargets(b,u,u.profile).includes(two));two.x=5;assert.ok(acquireTargets(b,u,u.profile).includes(two));assert.deepEqual(b.errors,[]);
});
test('air sharing is owner- and operator-scoped, excludes ranged-only exceptions, tokens and healing profiles',()=>{
 const{b,u}=fixture(),prof=u.profile;u.ownerId='p2';assert.equal(acquireTargets(b,u,prof).length,0);u.ownerId='p1';u.kind='token';assert.equal(acquireTargets(b,u,prof).length,0);u.kind='op';u.def={...u.def,position:'RANGED'};assert.equal(acquireTargets(b,u,prof).length,0);u.def={...u.def,position:'MELEE'};assert.equal(acquireTargets(b,u,{...prof,dmgType:'heal',heal:{mode:'single'}}).length,0);
});
test('melee splash reaches only shared flyers and does not extend air permission outside that area',()=>{
 const{b,u,enemies:[main,inside,one,outside]}=fixture(),prof={...u.profile,splashRadius:3.5,splashScale:1},before=[main,inside,one,outside].map(e=>e.hp);performAttack(b,u,prof,[main]);assert.ok(main.hp<before[0]);assert.ok(inside.hp<before[1]);assert.equal(one.hp,before[2]);assert.equal(outside.hp,before[3]);assert.equal(prof.canHitFly,false);assert.deepEqual(b.errors,[]);
});
test('a native attack-enhancing skill starts against a shared flyer and still deals its native multi-hit attack',()=>{
 const{h,b,u,enemies:[e]}=fixture({key:'helage',skillIndex:1});b.removeBuff(u,'qa:pause');u.skill.gainSp(1000,'qa');assert.equal(u.skill._defaultCondition(),true);const hp=e.hp;h.run(3);assert.ok(u.skill.active);assert.ok(e.hp<hp);assert.equal(u.profile.canHitFly,false);assert.deepEqual(b.errors,[]);
});

test('native area attacks add eligible shared flyers without bypassing their own target filter',()=>{
 const{h,b,u,enemies:[air,remote]}=fixture();u.rangeGrid=[[0,3]];b.refreshRange(u);b.ursus.invalidate();const ground=b.spawnEnemy('qa_ground',{def:enemyRec({key:'qa_ground',hp:1e7,speed:0}),pos:[10,5],routeIndex:0}),prof={...u.profile,allInRange:true};
 h.step();const targets=acquireTargets(b,u,prof);assert.ok(targets.includes(ground));assert.ok(targets.includes(air));assert.ok(!targets.includes(remote));assert.deepEqual(acquireTargets(b,u,{...prof,targetFilter:e=>!e.isFlying}),[ground]);assert.equal(u.profile.canHitFly,false);
});
