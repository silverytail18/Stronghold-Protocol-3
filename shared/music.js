const MUSIC_CONDITIONS=Object.freeze({
  'yu-ai':'有玩家生命值耗尽并完成结算，在下一回合开始时播放。',
  'peng-you-de-jiu':'第7回合有玩家将商店升到6级，升级后立即播放；或有玩家连续三回合漏怪待扣生命，本轮在联防阶段被队友全部救回，在下一回合开始时播放。两种条件共用该玩家本局的一次触发机会。',
  'ba-qian-li':'进入Boss回合（最终攻势或隐秘核心）时，有存活玩家生命值小于5，在该回合开始时播放。',
  'zhong-guo-ren':'战斗阶段开始时，有玩家的大炎盟约达到9人口。播放至曲终或下一回合结束，以先到者为准。',
  'xia-shan':'有玩家的一名真实干员在同一回合累计造成至少1000000（100万）伤害，在下一回合开始时播放。同一干员的普通战与联防伤害合并，不合并不同干员或不同玩家；不计召唤物及盟约独立伤害。',
  'zhen-xiong-di':'有玩家本阶段漏怪至少20只，并在联防阶段被队友全部救回，在下一回合开始时播放。',
  'qiu-fo':'第13回合起，战斗阶段开始时，有存活玩家没有任何核心盟约达到5人口。播放至曲终或下一回合结束，以先到者为准。',
  'pi-pa-xing':'有玩家从第1回合至第10回合（包括第10回合）生命值从未低于20，并在第10回合之后死亡结算，在下一回合开始时播放。',
  'guan-shan-jiu':'有玩家回合结束结算后的生命值恰好为1，在下一回合开始时播放。',
  'xin-zheng-cheng':'联机对局第1回合开始时播放，每局一次。',
  'rong-yao':'战斗阶段开始时，有玩家的任意盟约本局首次达到9人口；按人口判定，不按层数。播放至曲终或下一回合结束，以先到者为准。',
  'zhen-ying-xiong':'进入Boss回合时，所有存活的真人玩家生命值均小于10（至少一人存活），在该回合开始时播放。',
  'ci-jiu-men':'进入Boss回合时，有存活玩家生命值大于20，在该回合开始时播放。',
  'ban-shan-yao':'本回合获得对应干员，并在战斗阶段开始时仍持有且对应盟约已激活：阿戈尔／克莱门莎、罗德岛／丰川祥子、拉特兰／新约能天使、维多利亚／烛煌、谢拉格／圣聆初雪。播放至曲终或下一回合结束，以先到者为准。',
  'nan-wang-jin-xiao':'多人模式进入隐秘核心回合时，本局最初的全部真人成员仍存活、生命值大于0且无人退出。作为全体玩家事件，每局最多触发一次；播放至曲终或该回合结束。',
  'cha-yi-bu':'有玩家死亡，且本回合战斗开始时任意已激活核心盟约人口恰好为5，在下一回合开始时播放。',
  'tian-liang-yi-qian-shuo-zai-jian':'有玩家死亡，且本回合战斗开始时任意已激活核心盟约人口恰好为5，在下一回合开始时播放。',
  'gu-yong-zhe':'多人模式中有真人玩家死亡结算后，仅剩一名未退出的真人玩家存活，在下一回合开始时播放。',
  'guan-yu-zhi-ge':'有玩家生命值耗尽并完成结算，在下一回合开始时播放。',
  'pi-pa-qu':'有玩家连续10回合个人战斗胜利（无计入漏怪且无指挥终端生命损失），在下一回合开始时播放；联防救回漏怪不算个人战斗胜利。',
  'you-shan-lian':'战斗阶段开始时，有玩家的任意核心盟约人口本局首次达到或超过6。播放至曲终或下一回合结束，以先到者为准。',
});
// Catalog identifiers are stable; assets must be explicitly registered after audio QA.
export const MUSIC_CATALOG = Object.freeze([
  ['yu-ai','雨爱'],['peng-you-de-jiu','朋友的酒'],['ba-qian-li','八千里路明月照'],
  ['zhong-guo-ren','中国人能飞'],['xia-shan','下山'],['zhen-xiong-di','难得真兄弟'],
  ['qiu-fo','求佛'],['pi-pa-xing','琵琶行'],['guan-shan-jiu','关山酒'],
  ['xin-zheng-cheng','开启新征程2'],['rong-yao','荣耀向我俯首'],
  ['zhen-ying-xiong','真英雄'],['ci-jiu-men','辞九门回忆'],['ban-shan-yao','半山腰'],
  ['nan-wang-jin-xiao','难忘今宵'],
  ['cha-yi-bu','差一步'],['guan-yu-zhi-ge','关羽之歌'],['tian-liang-yi-qian-shuo-zai-jian','天亮以前说再见'],['gu-yong-zhe','孤勇者'],
  ['pi-pa-qu','琵琶曲'],['you-shan-lian','游山恋'],
].map(([id,name])=>Object.freeze({id,name,source:name+'.mp4',mode:'coop',condition:MUSIC_CONDITIONS[id]})));
export const musicTrack = id => MUSIC_CATALOG.find(t=>t.id===id);

/** Use the original roster, never only the filtered list of survivors. */
export function hiddenCoreMusicCandidates({mode,round,hiddenRound,players}){
  const members=players.filter(p=>!p.isBot);
  return mode==='coop'&&Number.isInteger(hiddenRound)&&hiddenRound>0&&round===hiddenRound&&members.length>0&&
    members.every(p=>p.alive&&!p.left&&Number.isFinite(p.lp)&&p.lp>0)
    ?[{playerId:'$room',trackId:'nan-wang-jin-xiao'}]:[];
}

/** Inclusive lifetime for an already received command. Receipt itself still requires the exact start round. */
export function musicPlaybackActive(command,round){
  const start=command?.scopeRoundId,end=command?.endRoundId??start;
  return Number.isSafeInteger(start)&&start>=1&&Number.isSafeInteger(end)&&end>=start&&end<=start+1&&Number.isSafeInteger(round)&&round>=start&&round<=end;
}

export function validateMusicRules(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([id,r]) => musicTrack(id) && r && typeof r==='object' &&
    Object.keys(r).every(k=>k==='enabled'||k==='probability') && typeof r.enabled==='boolean' &&
    Number.isFinite(r.probability) && r.probability>=0 && r.probability<=100);
}

/** Input is a trusted server snapshot, never a client-supplied condition claim.
 * Bond IDs and operator IDs must be resolved by the Match adapter, not name matching here.
 */
export function battleMusicCandidates({round,players,boss=false}) {
  const alive=players.filter(p=>p.alive&&!p.left&&!p.isBot), out=[];
  const allLow=alive.length>0 && alive.every(p=>p.lp<10);
  for(const p of alive){
    const add=trackId=>out.push({playerId:p.playerId,trackId});
    const bonds=p.bonds||[];
    if(bonds.some(b=>b.count>=9))add('rong-yao');
    if(bonds.some(b=>b.core&&b.count>=6))add('you-shan-lian');
    if(bonds.some(b=>b.dayan&&b.count>=9))add('zhong-guo-ren');
    if(round>12&&!bonds.some(b=>b.core&&b.count>=5))add('qiu-fo');
    if(p.acquiredWithActiveBond)add('ban-shan-yao');
    if(boss){if(p.lp<5)add('ba-qian-li');if(p.lp>20)add('ci-jiu-men');if(allLow)add('zhen-ying-xiong');}
  }
  return out;
}

export const HALF_MOUNTAIN_PAIRS=Object.freeze([
  ['阿戈尔','克莱门莎'],['罗德岛','丰川祥子'],['拉特兰','新约能天使'],
  ['维多利亚','烛煌'],['谢拉格','圣聆初雪'],
].map(p=>Object.freeze(p)));

export function shopMusicCandidates({round,playerId,before,after}) {
  return round===7&&before<6&&after===6?[{playerId,trackId:'peng-you-de-jiu'}]:[];
}

export const MUSIC_DAMAGE_THRESHOLD=1_000_000;
/** Values are the server's accepted per-operator totals for this round, never a team total or a condition claim. */
export function damageMusicCandidates({players}){
  return players.filter(p=>!p.left&&!p.isBot&&Array.isArray(p.operatorDamage)&&p.operatorDamage.some(n=>Number.isFinite(n)&&n>=MUSIC_DAMAGE_THRESHOLD))
    .map(p=>({playerId:p.playerId,trackId:'xia-shan'}));
}

/** rescuedByTeammates must come from verified ownership, not merely finalLoss === 0. */
export function settlementMusicCandidates({players}) {
  const out=[];
  for(const p of players){
    if(p.left||p.isBot)continue;
    const add=trackId=>out.push({playerId:p.playerId,trackId});
    if(p.lp===1)add('guan-shan-jiu');
    if(p.leaks>=20&&p.rescuedByTeammates===true)add('zhen-xiong-di');
    if(p.lossStreak>=3){
      if(p.rescuedByTeammates===true)add('peng-you-de-jiu');
    }
  }
  return out;
}
