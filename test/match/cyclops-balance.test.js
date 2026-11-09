import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getData } from '../../server/data.js';
import { GameData } from '../../server/match/gamedata.js';
import { Match } from '../../server/match/Match.js';
import { VirtualScheduler } from '../../server/match/scheduler.js';
import { bossPoolHp } from '../../server/match/finalAssault.js';
import { buildNormalWave, buildBossWave, setupMatchWaves, bountySpawns } from '../../server/match/waves.js';
import { buildCyclopsBonusWave } from '../../server/match/cyclops.js';
import { buildResult } from '../../server/match/results.js';
import { snapshotCyclopsBalance } from '../../server/match/cyclopsBalance.js';
import { createRng } from '../../server/sim/rng.js';
import { buildBattleSpec } from '../../server/sim/spec.js';
import { makeBattle, chessRec } from '../helpers/battleHarness.js';
import * as enemies from '../../server/sim/content/enemies.js';
import * as bosses from '../../server/sim/content/bosses.js';

const data = getData({log:{warn(){},error(){},info(){}}});
const DIFFS = ['FUNNY','NORMAL','HARD','ABYSS'];
const BONUS = [4,8,12,16];
const near = (a,b,msg) => assert.ok(Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b)), `${msg}: ${a} ≈ ${b}`);
const gdFor = diff => {const g = new GameData(data,'mode_cyclops');g.setCyclopsDifficulty(diff);return g;};
function fixture(t,difficulty='NORMAL',count=2) {
  const sched = new VirtualScheduler({start:1000});
  const m = new Match({data,difficulty,mode:'coop',variant:'entertainment_cyclops',seed:77,scheduler:sched,
    clientCombat:true,botRehearsal:0,seats:Array.from({length:count},(_,seat)=>({seat,playerId:`p${seat}`,name:`P${seat}`,connected:true})),
    send(){},broadcast(){},onEnd(){}});
  t.after(()=>{m.dispose();sched.dispose();});return m;
}

test('四档完整曲线、险境关键目标、高难原版锚点、普通轮单调成长，奖励关与移速保持旧值', () => {
  for(const diff of DIFFS) {
    const gd = gdFor(diff), vanilla = new GameData(data,`mode_multi_${diff.toLowerCase()}`);
    let prev = null;
    for(let r=1;r<=21;r++) {
      const s=gd.enemyScale(r), old=data['cyclops-mode'].enemyScale[r];
      assert.ok(s.hpMul>0 && s.atkMul>=0);
      // The pre-stage1 difficulty mapping affects speed only at the original activation round.
      near(s.speedMul, diff==='ABYSS' && r>=6 && !BONUS.includes(r) ? 1.15 : old.speed, `${diff} R${r} speed`);
      if(BONUS.includes(r)) {
        assert.deepEqual(s,{hpMul:old.hp,atkMul:old.atk,speedMul:old.speed});
        assert.equal(buildCyclopsBonusWave(gd,r).spawns[0].count,10);
      } else if(r<21) {
        if(prev) {assert.ok(s.hpMul>=prev.hpMul-1e-6);assert.ok(s.atkMul>=prev.atkMul-1e-6);}
        prev=s;
      }
    }
    if(diff==='HARD'||diff==='ABYSS') {
      for(const [r,source] of [[3,2],[7,8],[11,11],[14,13]]) {
        near(gd.enemyScale(r).hpMul,vanilla.enemyScale(source).hpMul,`${diff} R${r} HP`);
        near(gd.enemyScale(r).atkMul,vanilla.enemyScale(source).atkMul,`${diff} R${r} ATK`);
      }
      near(gd.enemyScale(20).hpMul,vanilla.enemyScale(13).hpMul*1.9008,`${diff} R20 HP`);
    }
  }
  const normal=gdFor('NORMAL');
  assert.deepEqual([normal.enemyScale(7).hpMul,normal.enemyScale(10).hpMul,normal.enemyScale(20).hpMul],[1.3824,1.65888,5.448728]);
  assert.equal(normal.enemyScale(20).atkMul,2.178744);
  assert.equal(gdFor('FUNNY').enemyScale(20).hpMul,1.4);
});

test('配置按局冻结，规范化哈希稳定，源数据后续变动不影响既有曲线；非法完整配置拒绝', () => {
  const source=structuredClone(data),gd=new GameData(source,'mode_cyclops');gd.setCyclopsDifficulty('NORMAL');
  const info=gd.cyclopsBalanceInfo,scale=gd.enemyScale(20);
  assert.match(info.hash,/^[0-9a-f]{64}$/);
  assert.deepEqual(snapshotCyclopsBalance(source['cyclops-balance']).identity,info);
  source['cyclops-balance'].difficulties.NORMAL.rounds[20].hp=99;
  source.config.modes.mode_cyclops.enemyScale[20].hp=999;
  assert.deepEqual(gd.enemyScale(20),scale);
  assert.deepEqual(gd.cyclopsBalanceInfo,info);
  assert.throws(()=>{gd.cyclopsBalance.profile.difficulties.NORMAL.rounds[20].hp=99;},TypeError);
  assert.throws(()=>snapshotCyclopsBalance({schema:1}),/Invalid/);
});

test('所有首领四档1/2/4/8人数血池：正式入口与GameData一致；真实开战池与公开/结算/战斗规格同版本', t => {
  for(const diff of DIFFS) {
    const gd=gdFor(diff);
    for(const [id,boss] of Object.entries(data.bosses)) for(const n of [1,2,4,8]) {
      const expected=Math.round(boss.bloodPoint[diff]*n*(diff==='FUNNY'?1:1.3));
      assert.equal(gd.bossPoolHp(id,n),expected);
      assert.equal(bossPoolHp(gd,id,n),expected);
    }
    for(const n of [1,2,4,8]) {
      const m=fixture(t,diff,n);m.round=21;m.bossId='boss_1';
      m.startFinalAssault(false);
      assert.equal(m.bossPool.maxHp,gd.bossPoolHp('boss_1',n));
      const identity=m.gd.cyclopsBalanceInfo;
      assert.deepEqual(m.publicView().cyclopsBalance,identity);
      assert.deepEqual(buildResult(m,{victory:false,reason:'test'}).cyclopsBalance,identity);
      for(const f of m.fields) {
        const spec=f.spec;
        assert.deepEqual(spec.flags.cyclopsBalance,identity);
        assert.deepEqual(spec.flags.partEnemyScale,m.gd.bossPartScale(21));
      }
    }
  }
});

test('正式波次中本体不乘HP、护卫加成与部件分离；赏金及普通战斗规格读取同一份曲线', t => {
  for(const diff of DIFFS) {
    const gd=gdFor(diff),vanilla=new GameData(data,`mode_multi_${diff.toLowerCase()}`),rng=createRng(77),plan=setupMatchWaves(gd,rng);
    for(const id of Object.keys(data.bosses)) {
      const wave=buildBossWave(gd,rng,plan.factions,21,{bossId:id,solo:false});
      for(const s of wave.spawns) {
        if(s.tag==='boss') assert.equal(s.mods.hpMul,undefined);
        else if(s.tag==='part') assert.deepEqual({...s.mods,slot:undefined},{...gd.bossPartScale(21),slot:undefined});
        else assert.equal(s.mods.hpMul,gd.enemyScale(21).hpMul);
      }
    }
    if(diff!=='FUNNY') {
      near(gd.enemyScale(21).hpMul,vanilla.enemyScale(14).hpMul*1.35,'guard HP');
      near(gd.bossPartScale(21).hpMul,vanilla.enemyScale(14).hpMul,'part HP');
      near(gd.enemyScale(21).atkMul,vanilla.enemyScale(14).atkMul*1.1,'boss/guard ATK');
    }
    const m=fixture(t,diff);m.round=20;m.wave=buildNormalWave(m.gd,m.rngWaves,m.factions,20);
    const p=m.order[0],opts=m._normalOpts(p),spec=buildBattleSpec(opts);
    assert.deepEqual(spec.flags.cyclopsBalance,m.gd.cyclopsBalanceInfo);
    assert.deepEqual(m._normalOpts(p,{preview:true}).flags.cyclopsBalance,spec.flags.cyclopsBalance);
    const unite=m._uniteOpts({helpers:[p],leaked:[]},60);
    assert.deepEqual(buildBattleSpec(unite).flags.cyclopsBalance,spec.flags.cyclopsBalance);
    const card={id:'balance-bounty',card:{enemyKey:'enemy_1000_gopro_2',count:1}};
    const bounties=bountySpawns(gd,20,m.wave,[card],p.playerId);
    assert.ok(bounties.length);
    for(const s of bounties) assert.equal(s.mods.hpMul,gd.enemyScale(20).hpMul);
  }
});

test('真实敌人属性：普通生命/攻击使用新倍率，器物与专用弹丸/余音命中次数沿旧倍率', () => {
  for(const diff of DIFFS) {
    const gd=gdFor(diff),profile=data['cyclops-balance'].difficulties[diff];
    const h=makeBattle({content:'generic',extraContent:[enemies,bosses],autoFinish:false,
      flags:{cyclopsBalance:gd.cyclopsBalanceInfo},timeLimit:1});
    for(const r of [7,14,20,21]) {
      const scale=gd.enemyScale(r),e=h.spawn('enemy_1000_gopro_2',{pos:[9,8],mods:scale});
      near(e.s.maxHp,data.enemies.enemy_1000_gopro_2.stats.maxHp*scale.hpMul,`${diff} R${r} HP`);
      near(e.s.atk,data.enemies.enemy_1000_gopro_2.stats.atk*scale.atkMul,`${diff} R${r} ATK`);
      const count=h.spawn('enemy_9016_acstmr',{pos:[9,8],mods:r===21?gd.bossPartScale(r):scale});
      assert.equal(count.s.maxHp,Math.round(data.enemies.enemy_9016_acstmr.stats.maxHp*profile.rounds[r].frequencyHp));
      for(const key of ['enemy_1196_msfyin','enemy_1200_msfjin','enemy_1204_msfhu','enemy_1210_msfden_2']) {
        const item=h.spawn(key,{pos:[9,8],mods:scale});
        assert.equal(item.s.maxHp,Math.round(data.enemies[key].stats.maxHp*profile.rounds[r].frequencyHp));
      }
      const echo=h.spawn('enemy_9023_acdums',{pos:[9,8],mods:scale});
      assert.equal(echo.s.maxHp,Math.round(data.enemies.enemy_9023_acdums.stats.maxHp*profile.rounds[r].frequencyHp));
    }
    h.step(2);
  }
});

test('实际首领动态刺胄之弹继承部件倍率，普通召唤沿护卫倍率', () => {
  const gd=gdFor('ABYSS'),enemyScale=gd.enemyScale(21),partEnemyScale=gd.bossPartScale(21);
  const wall=chessRec({id:'balance_wall',profession:'TANK',stats:{maxHp:1e8,atk:0,blockCnt:3},rangeGrid:[[0,0]],skill:null});
  const h=makeBattle({kind:'boss',content:'generic',extraContent:[enemies,bosses],autoFinish:false,timeLimit:180,
    defs:{chess:{balance_wall:wall}},kits:{balance_wall:()=>({trait:{noAttack:true}})},
    units:[{chessId:'balance_wall',row:10,col:6}],sharedBoss:{hp:1e8,maxHp:1e8,damage(){}},
    flags:{enemyScale,partEnemyScale,cyclopsBalance:gd.cyclopsBalanceInfo},setup:b=>{b.opts.templateId='act1autochess_h07_01';}});
  h.step();h.spawn('enemy_9013_acstmk',{pos:[3,10],tag:'boss',mods:{atkMul:enemyScale.atkMul,speedMul:enemyScale.speedMul}});
  assert.ok(h.runUntil(()=>h.enemies().some(e=>e.defId==='enemy_9016_acstmr'),90));
  const shell=h.enemies().find(e=>e.defId==='enemy_9016_acstmr');
  assert.equal(shell.mods.hpMul,partEnemyScale.hpMul);
  assert.equal(shell.s.maxHp,Math.round(data.enemies.enemy_9016_acstmr.stats.maxHp*data['cyclops-balance'].difficulties.ABYSS.rounds[21].frequencyHp));
  const drone=h.enemies().find(e=>e.defId==='enemy_1005_yokai');
  assert.ok(drone);
  assert.equal(drone.mods.atkMul,enemyScale.atkMul);
});
