import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {getData} from '../../server/data.js';
import {DataSource} from '../../server/sim/simdata.js';
import {NIAN,LING,SHU,AGLNA2,SUI,buildExpansionData,applyExpansion} from '../../server/sim/content/expansion/expansion-data.js';
import {CLEMNT} from '../../server/sim/content/expansion/clemnt-data.js';
import {CROISSANT,SORA,PENGUIN} from '../../server/sim/content/expansion/penguin-data.js';
import {ADVANCED,LING_TOKENS} from '../../server/sim/content/expansion/ling-kits.js';
import {groundbind,teleportEnemy} from '../../server/sim/content/expansion/operator-support.js';
import {makeBattle,chessRec,enemyRec,checkInvariants} from '../helpers/battleHarness.js';
import {makeMatch,give} from '../match/harness.js';
import {createRegistry} from '../../server/match/effectsMeta.js';
import {GameData} from '../../server/match/gamedata.js';
import {SharedPool,drawDisabledBonds} from '../../server/match/pool.js';
import {createRng} from '../../server/sim/rng.js';
import {TestContent} from '../../server/test-content.js';
import {effectiveProfile} from '../../server/sim/ai.js';
import {buildBattleSpec,createBattleFromSpec} from '../../server/sim/spec.js';
import {createDataStore} from '../../public/js/data.js';
import {createAssets} from '../../public/js/assets.js';
import {formatBondEffect,richTextPlain} from '../../public/js/ui/richText.js';
import {planLayout,botPrepBegin,botPrepEnd,rangeTiles} from '../../server/match/bot.js';
import {canPlace,positionClass} from '../../server/match/board.js';
import {buildRhodesMujicaData} from '../../server/sim/content/rhodes-mujica/data.js';
const Q={warn(){},error(){},info(){}};
const BASE=getData({log:Q}),DATA=buildRhodesMujicaData(buildExpansionData(BASE)),elite=id=>id.replace(/_a$/,'_b');
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const bond=(tier,L=0)=>({active:true,tier,layers:L,count:tier===2?4:2});
function battle(o={}){const raw=structuredClone(DATA);raw.enemies.enemy_exp_ground=enemyRec({key:'enemy_exp_ground',hp:1e7,atk:100,speed:0,def:0,res:0});raw.enemies.enemy_exp_air=enemyRec({key:'enemy_exp_air',hp:1e7,atk:100,speed:0,def:0,res:0,motion:'FLY'});raw.chess.exp_plain=chessRec({id:'exp_plain',stats:{atk:600},skill:null});const h=makeBattle({data:new DataSource(raw,null),timeLimit:180,autoFinish:false,...o});h.step(2);return h;}
function clean(h){assert.deepEqual(h.b.errors,[]);checkInvariants(h.b);}
function prep(){const h=makeMatch({data:structuredClone(DATA),mode:'solo',fake:true,registry:createRegistry({log:Q})}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0');for(const q of [...p.board.values(),...p.hand.filter(Boolean),...p.temp.filter(Boolean)])if(q.kind==='chess')p.returnCopies(q);p.board.clear();p.hand.fill(null);p.temp.fill(null);p.offers=[];p.layers={};p.bandId=null;p.funds=100;p.recompute();return {h,m,p,put:(id,r,c)=>give(m,p,id,'board',[r,c]),end:()=>m.dispatch(p,'onPrepEnd',{round:m.round})};}
const byChar=id=>Object.values(DATA.chess).find(c=>!c.isGolden&&c.charId===id).chessId;
test('All expansion skill, talent, module, strategy and garrison descriptions use readable concrete numbers',()=>{
 const unresolved=[];
 function walk(v,path='root'){if(!v||typeof v!=='object')return;for(const[k,x]of Object.entries(v)){if(['desc','descRaw','moduleDesc','moduleDescRaw'].includes(k)&&typeof x==='string'&&/\{[^{}]+\}/.test(x))unresolved.push(path+'.'+k);else if(x&&typeof x==='object')walk(x,path+'.'+k);}}
 for(const id of [CROISSANT,SORA,NIAN,LING,SHU,AGLNA2]){walk(DATA.chess[id]);walk(DATA.chess[elite(id)]);}
 for(const key of ['garrisons','bands'])for(const[id,r]of Object.entries(DATA[key]))if(id.startsWith('c1_')||id.startsWith('exp_')||id.startsWith('band_exp_')){walk(r);assert.ok(!/min\(|max\(|\b[A-Z]\s*[×*]|\b(?:atk|def|res)\b/i.test(r.desc),r.desc);}
 assert.deepEqual(unresolved,[]);
 assert.ok(richTextPlain(formatBondEffect(DATA.bonds[PENGUIN],999,2,{claimed:2})).includes('攻击力+80'));assert.ok(richTextPlain(formatBondEffect(DATA.bonds[PENGUIN],999,2,{claimed:2})).includes('50层'));
 assert.match(formatBondEffect(DATA.bonds[SUI],999,2),/340(?:\.0)?%/);for(const id of [PENGUIN,SUI])assert.ok(!/\{[^{}]+\}/.test(formatBondEffect(DATA.bonds[id],40,1)));
});
test('Whole overlay preserves baseline, is idempotent, adds six families and existing member tags only',()=>{
 const before=JSON.stringify(BASE),raw=buildExpansionData(BASE),first=JSON.stringify(raw);applyExpansion(raw);assert.equal(JSON.stringify(raw),first);assert.equal(JSON.stringify(BASE),before);
 assert.equal(new GameData(raw,'mode_single_normal').visibleChess.length,118);assert.equal(raw.bonds[SUI].visibleMembers.length,5);assert.equal(raw.bonds[PENGUIN].visibleMembers.length,6);
 const newAngel=byChar('char_1041_angel2');assert.ok(raw.chess[newAngel].bonds.includes(PENGUIN));assert.deepEqual(raw.chess[newAngel].garrisonIds,BASE.chess[newAngel].garrisonIds);
});
test('One ready batch is selected per match; unselected matches remain byte-identical to baseline',()=>{
 const tc=new TestContent(),room={mode:'solo',difficulty:'NORMAL'},menu=tc.menu(room),entry=menu.items.find(v=>v.id==='arknights-expansion-v1');assert.equal(entry.clientVersion,18);
 const off=tc.resolve({version:menu.version,ids:[]},room,BASE);assert.equal(off.data,BASE);assert.equal(off.manifest,null);
 const on=tc.resolve({version:menu.version,ids:[entry.id]},room,BASE);assert.ok(on.data.chess[NIAN]);assert.equal(on.manifest.batches.length,1);assert.equal(on.manifest.clientVersion,18);
 assert.ok(!tc.menu(room,{admin:false}).items.some(v=>v.id===entry.id));assert.ok(tc.menu(room,{admin:false,publicIds:[entry.id]}).items.some(v=>v.id===entry.id));assert.ok(!BASE.chess[NIAN]);
});
test('Batch composes with existing rounds, shop and coop pool overlays without mutating baseline',()=>{
 const tc=new TestContent(),room={mode:'coop',difficulty:'HARD'},menu=tc.menu(room);const x=tc.resolve({version:menu.version,ids:['arknights-expansion-v1','rhodes-mujica-v1','extended-rounds-24','shop-extra-slot','coop-pool-150']},room,BASE);
 const gd=new GameData(x.data,'mode_multi_hard'),pool=new SharedPool(gd);assert.equal(gd.lastRound,24);assert.equal(pool.cap(AGLNA2),8);assert.equal(pool.cap(NIAN),27);assert.equal(BASE.config.economy.poolCopies[6],5);
});
test('Sui and Penguin use normal add-on ban weights and the existing exclusion and shared-pool rules',()=>{
 const seen=new Set();assert.equal(BASE.bonds[SUI],undefined);assert.equal(BASE.bonds[PENGUIN],undefined);
 for(const id of [SUI,PENGUIN]){assert.equal(DATA.bonds[id].weight,BASE.bonds.arcaneShip.weight);assert.equal(DATA.bonds[id].bb.banWeight,10);}
 for(const mode of ['mode_single_normal','mode_single_hard','mode_single_abyss','mode_single_funny'])for(let seed=1;seed<=64;seed++){
  const gd=new GameData(DATA,mode),a=createRng(seed),b=createRng(seed),x=drawDisabledBonds(gd,a),y=drawDisabledBonds(gd,b);assert.deepEqual(x,y);assert.equal(a.state(),b.state());
  const off=new Set([...x.drawn,...x.staticOff]);for(const id of x.drawn){assert.ok(DATA.bonds[id].weight>0);assert.ok(!gd.modeInactiveBonds.has(id));seen.add(id);}
  for(const id of gd.visibleChess)assert.equal(x.banned.includes(id),DATA.chess[id].bonds.every(b=>off.has(b)));
  const pool=new SharedPool(gd,{banned:x.banned});for(const id of x.banned)assert.ok(!pool.has(id));
 }
 for(const id of [SUI,PENGUIN])assert.ok(seen.has(id),id);
});
for(const base of [NIAN,LING,SHU,AGLNA2])for(const id of [base,elite(base)])for(const skillIndex of [0,1,2])test(`${id} S${skillIndex+1} has authored kit, exact original SP and finite run`,()=>{
 const h=battle({units:[{chessId:id,skillIndex,row:10,col:4},{chessId:'exp_plain',row:11,col:4}],enemies:[{key:'enemy_exp_ground',pos:[10,5]}]}),u=h.unit(id),s=DATA.chess[id].skills[skillIndex];assert.equal(u.skill.id,s.skillId);assert.equal(u.kit.skillSource,'skills');assert.equal(u.skill.baseSpCost,s.spCost);assert.equal(u.skill.initSp,s.initSp);
 h.unit('exp_plain').hp=500;if(!u.skill.active){u.skill.gainSp(999,'test');u.skill.activate('test');}h.run(6);assert.ok(Number.isFinite(u.hp));clean(h);
});
for(const [base,ids]of [[NIAN,['none','uniequip_002_nian','uniequip_003_nian']],[LING,['none','uniequip_002_ling']],[SHU,['none','uniequip_002_shu']]])for(const mid of ids)test(`${base} module ${mid} resolves original bonuses and trait`,()=>{const h=battle({units:[{chessId:elite(base),moduleId:mid,row:10,col:4}]});const d=h.unit(elite(base)).def,rec=DATA.chess[elite(base)],m=rec.modules.find(m=>m.uniEquipId===mid);assert.equal(d.raw.module.active,mid!=='none');close(d.stats.atk,rec.statsBase.atk+(m?.attr.atk||0));close(d.stats.maxHp,rec.statsBase.maxHp+(m?.attr.maxHp||0));clean(h);});
test('Nian grants team tank HP once, three shield hits, and S2 counter after a real enemy attack',()=>{
 const h=battle({units:[{chessId:NIAN,row:10,col:4},{chessId:elite(NIAN),row:11,col:4}],enemies:[{key:'enemy_exp_ground',pos:[10,5]}],captureNoisy:true}),u=h.unit(NIAN),e=h.enemy('enemy_exp_ground');close(u.s.maxHp,2737*1.16);for(let n=0;n<3;n++)assert.equal(h.b.dealDamage(e,u,{amount:5000,type:'true',isAttack:true}),0);assert.ok(!u.findBuff('exp:nian:shield')?.shieldHits);clean(h);
 const x=battle({units:[{chessId:NIAN,skillIndex:1,row:10,col:4}],enemies:[{key:'enemy_exp_ground',pos:[10,5]}],captureNoisy:true}),a=x.unit(NIAN),t=x.enemy('enemy_exp_ground');a.skill.gainSp(99);a.skill.activate();x.b.dealDamage(t,a,{amount:5000,type:'true',isAttack:true});assert.ok(t.s.flags.silence);assert.equal(effectiveProfile(a).noAttack,true);clean(x);
});
test('Shu heals seed only actual own operator treatment, not passive regen, and clears on exit',()=>{
 const h=battle({units:[{chessId:SHU,skillIndex:0,row:10,col:4},{chessId:'exp_plain',row:10,col:5}]}),u=h.unit(SHU),a=h.unit('exp_plain');assert.equal(u.mem.expSeeds.size,0);h.b.heal(u,a,100);assert.equal(u.mem.expSeeds.size,0);a.hp=1000;h.b.heal(u,a,100);assert.equal(u.mem.expSeeds.size,5);h.run(.2);assert.ok(a.s.hpRegen>=70);h.b.retreat(u);assert.equal(u.mem.expSeeds.size,0);h.run(.2);assert.equal(a.s.hpRegen,0);clean(h);
});
test('Shu S3 teleports at entering Manhattan threshold, preserves route and refuses immune/boss targets',()=>{
 const h=battle({units:[{chessId:SHU,row:10,col:4}],enemies:[{key:'enemy_exp_ground',pos:[10,5]}]}),u=h.unit(SHU),e=h.enemy('enemy_exp_ground');u.mem.expSeeds.add(10*21+5);u.skill.gainSp(100);u.skill.activate();h.run(.1);assert.ok(u.mem.expShuMarks.has(e.id));e.x=5+u.skill.bb.max_distance;e.y=10;h.b._enemiesDirty=true;h.run(.1);close(e.x,5);assert.equal(e.motion,'WALK');e.isBoss=true;assert.equal(teleportEnemy(h.b,e,10,6,u),false);clean(h);
});
test('Shu four Sui is a distinct roster condition; SP and attack bonuses do not duplicate',()=>{
 const ids=[NIAN,LING,SHU,byChar('char_2015_dusk')],h=battle({units:ids.map((chessId,i)=>({chessId,row:10,col:3+i}))});for(const id of ids)assert.ok(h.unit(id).findBuff('exp:shu:fourSui'));h.run(4.1);clean(h);
 const x=battle({units:[{chessId:SHU,uid:1,row:10,col:3},{chessId:SHU,uid:2,row:10,col:4},{chessId:SHU,uid:3,row:10,col:5},{chessId:NIAN,row:10,col:6}]});assert.ok(!x.unit(1).findBuff('exp:shu:fourSui'));clean(x);
});
test('Ling prep token selection matches all skills; base has three field slots, stock 5/8 and module DP reduction',()=>{
 for(const skillIndex of [0,1,2]){const gd=new GameData(DATA,'mode_single_normal'),ds=new DataSource(DATA);for(const id of [LING,elite(LING)]){const ts=gd.placeableTokens(id,{skillIndex});assert.equal(ts.length,1);assert.equal(ts[0].tokenId,LING_TOKENS[skillIndex]);assert.equal(ts[0].count,3);const d=ds.getToken(ts[0].tokenId,id,{skillIndex});assert.ok(d.sources.includes('talent'));assert.equal(d.stats.cost,[12,9,23][skillIndex]-(id===LING?0:[3,3,5][skillIndex]));}}
});
test('Ling S3 fuses adjacent front base pair into real advanced, reserves both sources, restores bases on death',()=>{
 const h=battle({units:[{chessId:LING,skillIndex:2,uid:1,row:11,col:4},{kind:'token',tokenId:LING_TOKENS[2],ownerUid:1,uid:2,row:10,col:4},{kind:'token',tokenId:LING_TOKENS[2],ownerUid:1,uid:3,row:10,col:5}]}),u=h.unit(LING),a=h.b.allyUnits.find(t=>t.defId===ADVANCED);assert.ok(a);assert.equal(a.s.blockCnt,4);assert.equal(a.profile.dmgType,'arts');assert.ok(a.s.flags.noHeal);assert.equal(a.mem.expLingBases.length,2);assert.ok(a.mem.expLingBases.every(t=>!t.alive&&!t.removed&&t.mem.expLingJoined===a.id));assert.equal(u.mem.expLingStock,3);h.b.kill(a);assert.ok(a.mem.expLingBases.every(t=>!t.mem.expLingJoined));h.run(21);clean(h);
});
test('Ling S2 binds legal targets, recovers low HP summon and preserves total stock cap',()=>{
 const h=battle({units:[{chessId:LING,uid:1,row:10,col:4},{kind:'token',tokenId:LING_TOKENS[1],ownerUid:1,uid:2,row:11,col:4}],enemies:[{key:'enemy_exp_ground',pos:[10,5]}]}),u=h.unit(LING),t=h.unit(2),e=h.enemy('enemy_exp_ground');assert.ok(t.alive);t.hp=100;u.skill.gainSp(100);u.skill.activate();assert.ok(e.s.flags.bind);assert.ok(!t.alive);assert.equal(u.mem.expLingStock,5);h.run(11);clean(h);
});
test('Ling owner exit clears summons, preserves reserved positions and redeployment restarts stock with DP cost',()=>{
 const h=battle({units:[{chessId:LING,skillIndex:0,uid:1,row:11,col:4},{kind:'token',tokenId:LING_TOKENS[0],ownerUid:1,uid:2,row:10,col:4}]}),u=h.unit(1),t=h.unit(2);
 h.b.retreat(u);assert.ok(!t.alive&&!t.removed);assert.equal(t.mem.expLingReady,Infinity);h.run(2);assert.ok(!t.alive);
 h.b.players[0].dp=0;assert.equal(h.b.redeploy(u,{free:false,tile:[11,4]}),false);assert.ok(!u.alive);
 assert.equal(h.b.redeploy(u,{free:true,tile:[11,4]}),true);assert.equal(u.mem.expLingStock,5);h.b.players[0].dp=0;h.run(.1);assert.ok(!t.alive);h.b.players[0].dp=100;h.run(.1);assert.ok(t.alive);assert.equal(u.mem.expLingStock,4);assert.ok(h.b.players[0].dp<100);clean(h);
});
test('Sui uses two distinct families in 3s, constant average ATK, independent source and 8s cooldown',()=>{
 const h=battle({units:[{chessId:NIAN,row:10,col:4},{chessId:LING,row:10,col:5}],setup(b){for(const u of b.allyUnits)b.addBuff(u,{key:'test:noAuto',flags:{disarm:true},persist:true,allowDead:true});},bonds:{[SUI]:bond(1,40)},enemies:[{key:'enemy_exp_ground',pos:[10,5]}],captureNoisy:true}),u=h.unit(NIAN),l=h.unit(LING),e=h.enemy('enemy_exp_ground');const before=e.hp;h.b.dealDamage(u,e,{amount:10,type:'phys',isAttack:true});h.b.dealDamage(l,e,{amount:10,type:'arts',isAttack:true});const extra=(513+406)/2*(2.2+.015*40);close(before-e.hp,20+extra);const after=e.hp;h.b.dealDamage(u,e,{amount:10,type:'phys',isAttack:true});h.b.dealDamage(l,e,{amount:10,type:'arts',isAttack:true});close(after-e.hp,20);assert.equal(h.hooksOf('damaged').filter(c=>c.dmg?.tags.includes('exp:sui:combo')).length,1);clean(h);
});
test('Sui rejects duplicate family, regen and stale participants',()=>{
 const h=battle({units:[{chessId:NIAN,uid:1,row:10,col:4},{chessId:elite(NIAN),uid:2,row:11,col:4}],bonds:{[SUI]:bond(1)},enemies:[{key:'enemy_exp_ground',pos:[10,5]}],captureNoisy:true}),e=h.enemy('enemy_exp_ground');for(const u of h.allies())h.b.dealDamage(u,e,{amount:10,type:'phys',isAttack:true});assert.ok(!h.hooksOf('damaged').some(c=>c.dmg?.tags.includes('exp:sui:combo')));clean(h);
});
test('Aglna S1 is a 56s deployment flight, two targets, no permanent passive shortcut',()=>{
 const h=battle({units:[{chessId:AGLNA2,row:10,col:4}],enemies:[{route:2,key:'enemy_exp_air',pos:[10,4]}]}),u=h.unit(AGLNA2);assert.ok(u.skill.active&&u.s.flags.liftoff);assert.equal(effectiveProfile(u).maxTargets,2);h.run(57);assert.equal(u.skill.active,false);assert.ok(!u.s.flags.liftoff);clean(h);
});
test('Aglna S2 chant is interruptible, wave uses true deployment direction, then 22s skill with brief slide protection',()=>{
 const h=battle({units:[{chessId:AGLNA2,skillIndex:1,row:10,col:4}],enemies:[{key:'enemy_exp_ground',pos:[10,6]},{route:2,key:'enemy_exp_air',pos:[11,6]}]}),u=h.unit(AGLNA2),g=h.enemy('enemy_exp_ground'),a=h.enemy('enemy_exp_air');u.skill.gainSp(100);u.skill.activate();assert.ok(u.skill.chant&&!u.skill.active);h.run(.8);assert.ok(g.s.flags.levitate);assert.equal(a.isFlying,false);assert.equal(a.motion,'FLY');h.b.applyStatus(u,'stun',{duration:1});h.step(1);assert.ok(!u.skill.chant&&!u.skill.active);h.run(1.1);u.skill.gainSp(100);u.skill.activate();h.run(2.6);assert.ok(u.skill.active);assert.ok(u.s.flags.invulnerable);assert.ok(u.skill.timeLeft>21);h.run(1.1);assert.ok(!u.s.flags.invulnerable&&u.s.flags.liftoff);clean(h);
});
test('Aglna groundbind keeps original fly path, halves high weight duration and restores air state',()=>{
 const h=battle({units:[{chessId:AGLNA2,row:10,col:4}],enemies:[{route:2,key:'enemy_exp_air',pos:[10,6]}]}),u=h.unit(AGLNA2),e=h.enemy('enemy_exp_air');h.b.addBuff(e,{key:'weight',mods:{massFlat:5}});assert.ok(groundbind(h.b,u,e,2));assert.equal(e.isFlying,false);assert.equal(e.motion,'FLY');h.run(1.1);assert.equal(e.isFlying,true);clean(h);
});
test('Aglna S3 moves without redeployment, remains airborne, keeps HP/ammo and returns immediately on end',()=>{
 const h=battle({captureNoisy:true,units:[{chessId:AGLNA2,skillIndex:2,row:10,col:4}],enemies:[{route:2,key:'enemy_exp_air',pos:[10,6]}]}),u=h.unit(AGLNA2);h.b.addBuff(h.enemy('enemy_exp_air'),{key:'test:disarm',flags:{disarm:true}});u.hp=1000;let redeploys=0,retreats=0;h.b.on('deploy',({unit})=>{if(unit===u)redeploys++;});h.b.on('retreat',({unit})=>{if(unit===u)retreats++;});u.skill.gainSp(100);u.skill.activate();assert.ok(u.s.flags.liftoff);const n=u.deploySeq,ammo=u.skill.ammoLeft;u.atkCd=7;h.run(.2);close(u.atkCd,6.8);assert.equal(u.deploySeq,n);assert.equal(redeploys,0);assert.equal(retreats,0);assert.equal(u.tileC,6);assert.ok(u.hp>=1000&&u.hp<1000+u.s.maxHp*0.08*0.25,'Only actual sky-blocking talent regeneration changes HP');assert.equal(u.skill.ammoLeft,ammo-h.hooksOf('attack').filter(c=>c.attacker===u&&c.isSkill).length);assert.ok(u.skill.active&&u.s.flags.liftoff);assert.ok(u.blocking.some(e=>e.isFlying));assert.ok(u.s.hpRegen>0);
 assert.equal(h.b.unitAt(10,4),null);assert.equal(h.b.spawnDevice('test-return-conflict',10,4),null,'Return tile is reserved without a ghost blocker');
 const ground=h.spawn('enemy_exp_ground',{pos:[10,6]});assert.equal(h.b._blockerFor(u,ground,1),false);u.skill.end('test:ammoEnd');assert.ok(!u.s.flags.liftoff);assert.equal(u.tileR,10);assert.equal(u.tileC,4);assert.equal(h.b.unitAt(10,4),u);assert.equal(h.b.unitAt(10,6),null);assert.equal(h.b._movementHomes.size,0);assert.equal(redeploys,0);clean(h);
});
test('Aglna S3 natural ammo exhaustion returns home, repeated flight reuses the current origin, death frees reservation',()=>{
 const h=battle({units:[{chessId:AGLNA2,skillIndex:2,row:10,col:4}],enemies:[]}),u=h.unit(AGLNA2);u.skill.gainSp(100);u.skill.activate();assert.ok(h.b.relocate(u,10,6));assert.ok(u.s.flags.liftoff);
 for(let n=u.skill.ammoLeft;n>0;n--)u.skill.onAttackPerformed([],true);
 assert.equal(u.tileC,4);assert.ok(!u.skill.active&&!u.s.flags.liftoff);assert.equal(h.b._movementHomes.size,0);
 assert.ok(h.b.relocate(u,11,5));u.skill.gainSp(100);u.skill.activate();assert.ok(h.b.relocate(u,11,6));u.skill.stop();assert.equal(u.tileR,11);assert.equal(u.tileC,5);
 u.skill.gainSp(100);u.skill.activate();assert.ok(h.b.relocate(u,11,6));h.b.kill(u);assert.equal(u.alive,false);assert.equal(u.tileC,6);assert.equal(h.b._movementHomes.size,0);assert.equal(h.b.unitAt(11,5),null);clean(h);
});
test('All new families buy, merge, sell and return exact shared pool copies',()=>{
 for(const id of [NIAN,LING,SHU,AGLNA2,CLEMNT]){const s=prep(),cap=s.m.pool.cap(id);s.p.shop.level=6;for(let n=0;n<3;n++){s.p.shop.slots=[{kind:'chess',id,sold:false}];assert.deepEqual(s.p.buy(0),{ok:true});}const piece=[...s.p.hand,...s.p.temp].find(q=>q?.id===elite(id));assert.ok(piece);assert.equal(piece.poolCopies,3);assert.equal(s.m.pool.left(id),cap-3);s.p.sell(piece.uid);assert.equal(s.m.pool.left(id),cap);s.p.rollShop();s.h.invariants();s.m.dispose();}
});
test('Growth is a once per-round family snapshot, active condition checked, no summon/copy inflation',()=>{
 const s=prep();s.put(NIAN,9,3);s.put(elite(LING),10,3);s.put(SHU,9,4);s.put(byChar('char_2015_dusk'),10,4);s.put(AGLNA2,11,3);s.p.recompute();s.m.dispatch(s.p,'onMerge',{kind:'chess',piece:{id:elite(CROISSANT)}});s.end();assert.equal(s.p.layers[SUI],11);const first=JSON.stringify(s.p.layers);s.end();assert.equal(JSON.stringify(s.p.layers),first);s.m.dispose();
});
test('Nian strategy first real refresh supplies legal stocked Sui/yan and first merges capped at six rounds',()=>{
 const s=prep();s.p.bandId='band_exp_nian';s.p.shop.level=3;s.p.rollShop();s.p.refresh();const got=s.p.shop.slots.find(v=>v.kind==='chess'&&!v.sold);assert.ok(DATA.chess[got.id].bonds.some(b=>b===SUI||b==='yanShip'));for(let round=1;round<=8;round++){s.m.round=round;s.m.dispatch(s.p,'onMerge',{kind:'chess',piece:{id:elite(CROISSANT)}});s.m.dispatch(s.p,'onMerge',{kind:'chess',piece:{id:elite(SORA)}});}assert.equal(s.p.layers[SUI],12);s.m.dispose();
});
test('Bison counts genuine spend, waits for shop tier, grants each exact piece once from pool',()=>{
 const s=prep();s.p.bandId='band_exp_bison';s.m.dispatch(s.p,'onSpend',{amount:12,reason:'reward'});assert.equal(s.p.counters['exp:band:bison:spent'],undefined);s.m.dispatch(s.p,'onSpend',{amount:12,reason:'buy'});assert.ok(!s.p.hand.some(q=>q?.id===CROISSANT));s.p.shop.level=2;s.m.dispatch(s.p,'onLevelUp',{});assert.ok(s.p.hand.some(q=>q?.id===CROISSANT));s.p.shop.level=3;s.m.dispatch(s.p,'onSpend',{amount:12,reason:'refresh'});assert.ok(s.p.hand.some(q=>q?.id===SORA));assert.equal(s.m.pool.left(CROISSANT),s.m.pool.cap(CROISSANT)-1);s.h.invariants();s.m.dispose();
});
test('Liang requires distinct three professions/same-profession families, next round delivery and caps four',()=>{
 const s=prep();s.p.bandId='band_exp_liangxun';s.put(NIAN,9,3);s.put(SHU,9,4);s.put(CROISSANT,12,3);s.put(LING,10,3);s.put(AGLNA2,11,3);for(let round=1;round<=6;round++){s.m.round=round;s.end();s.m.dispatch(s.p,'onRoundStart',{round:round+1});}assert.equal(s.p.counters['exp:band:liang:gold'],4);assert.equal(s.p.counters['exp:band:liang:refresh'],4);assert.equal(s.p.pendingFunds,4);assert.equal(s.p.shop.freeRefreshes,4);s.m.dispose();
});
test('New strategy progress is visible, updates without duplicate effects and stays out of battle effects',()=>{
 for(const id of ['band_exp_nian','band_exp_bison','band_exp_liangxun']){const s=prep();s.p.bandId=id;s.m.dispatch(s.p,'onPrepStart',{});s.m.dispatch(s.p,'onPrepStart',{});const refs=s.p.effects.filter(e=>e.id.startsWith('exp:progress:'));assert.equal(refs.length,1);assert.equal(refs[0].battle,false);assert.ok(refs[0].desc.length>20);s.m.dispose();}
});
test('Client data overlay is reversible, preserves cached baseline and does not leak into next formal match',async()=>{
 const baseChess=structuredClone(BASE.chess),d=createDataStore({fetch:async()=>({ok:true,json:async()=>baseChess})});await d.load('chess');d.setOverlay({chess:DATA.chess});assert.equal(d.lookup('chess',NIAN).name,'年');d.setOverlay(null);assert.equal(d.lookup('chess',NIAN),null);assert.equal(d.get('chess'),baseChess);assert.equal(d.baseline('chess'),baseChess);
});
test('Renderer replaces per-match artwork and restores baseline without changing seed compatibility',async()=>{
 const a=createAssets({manifest:BASE.assets});assert.equal(a.seed(DATA.assets),false);assert.equal(a.avatar('char_2025_shu'),null);assert.equal(a.replaceManifest(DATA.assets),true);assert.ok(a.avatar('char_2025_shu'));assert.equal(a.replaceManifest(BASE.assets),true);assert.equal(a.avatar('char_2025_shu'),null);assert.equal(await a.ready(),BASE.assets);
});
test('AI legally lays out all six families and places S3 Ling summons with a possible fusion pair',()=>{
 const s=prep();s.p.funds=0;s.p.setLoadout({[LING]:{skill:2,module:'none'}});for(const id of [NIAN,LING,SHU,CROISSANT,SORA,AGLNA2])give(s.m,s.p,id);const pieces=s.p.hand.filter(q=>q?.kind==='chess'),plan=planLayout(s.m,s.p,pieces),map=s.m.deployMapFor(s.p);assert.equal(plan.size,6);for(const q of pieces){const[r,c]=plan.get(q.uid).split(',').map(Number);assert.ok(canPlace(map,positionClass(s.m.gd.chess(q.id)),r,c));}
 const job=botPrepBegin(s.m,s.p);botPrepEnd(s.m,s.p,job);s.h.invariants();assert.deepEqual(s.h.logs.error,[]);const ts=[...s.p.board.entries()].filter(([,q])=>q.kind==='token'&&q.id===LING_TOKENS[2]);assert.ok(ts.length>=2);assert.ok(ts.some(([k,q])=>{const[r,c]=k.split(',').map(Number);return ts.some(([key,p])=>p!==q&&rangeTiles(s.m.gd.token(q.id),r,c,q.dir).includes(key));}));
 const sim=makeBattle({data:new DataSource(DATA),players:[s.p.battleInput()],autoFinish:false});sim.step(2);assert.ok(sim.b.allyUnits.some(u=>u.defId===ADVANCED&&u.alive));clean(sim);s.m.dispose();
});
test('Client JSON BattleSpec carries owner-specific loadouts and reproduces server battle',()=>{
 const h=battle({units:[{chessId:elite(NIAN),skillIndex:2,moduleId:'none',uid:1,row:9,col:4},{chessId:LING,skillIndex:2,uid:2,row:11,col:4},{kind:'token',tokenId:LING_TOKENS[2],ownerUid:2,uid:3,row:10,col:4},{chessId:AGLNA2,skillIndex:1,uid:4,row:12,col:4}]});const input=h.b.players[0].input;const spec=JSON.parse(JSON.stringify(buildBattleSpec({stageId:'flat',players:[input],kind:'normal',seed:17,timeLimit:60,flags:{startOpCooldown:0}})));const b=createBattleFromSpec(spec,h.b.data,{logger:Q,quiet:true});b.start();b.step();assert.equal(b.allyUnits.find(u=>u.uid===1).skill.id,'skchr_nian_3');assert.equal(b.allyUnits.find(u=>u.uid===1).def.raw.module.active,false);assert.equal(b.allyUnits.find(u=>u.uid===3).ownerUnit.uid,2);assert.deepEqual(b.errors,[]);
});
test('Every new artwork reference and advanced animation role resolves to an actual local file',()=>{
 const manifest=DATA.assets,urls=[];for(const id of ['char_2014_nian','char_2023_ling','char_2025_shu','char_1015_aglna2']){const r=manifest.chars[id];urls.push(r.avatar,r.avatarE2,r.portrait,r.portraitE2);for(const m of Object.values(r.spine))urls.push(m.skel,m.atlas,...m.textures);}
 const assets=createAssets({manifest});for(const id of [...LING_TOKENS,ADVANCED]){const r=manifest.tokens[id],m=assets.spineEntry(id);assert.ok(m,`Renderer must accept ${id} manifest`);urls.push(r.avatar,m.skel,m.atlas,...m.textures);}
 urls.push(manifest.bonds[SUI],...['band_exp_nian','band_exp_bison','band_exp_liangxun'].map(id=>manifest.bands[id]));for(const url of urls){assert.ok(url);assert.ok(existsSync(fileURLToPath(new URL('../../public'+url,import.meta.url))),url);}assert.equal(manifest.tokens[ADVANCED].spine.anims.attack.loop,'Attack_02');
});
