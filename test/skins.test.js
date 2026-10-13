import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {pngSize} from '../tools/assets/formats.mjs';
import {roleAnimationNames} from '../tools/assets/anim-roles.mjs';
import {ROOT,getData} from '../server/data.js';
import {checkLoadout,validateC2S} from '../shared/protocol.js';
import {skinIds,skinRecord,skinsFor,selectedSkin} from '../shared/skins.js';
import {parseStored,toStored,setChoice,effectiveChoice,sanitizeEntries,changedCount} from '../public/js/ui/loadoutModel.js';
import {chessAvatarUrl,chessPortraitUrl,chessFullPortrait} from '../public/js/ui/assetUrls.js';
import {spineEntry,hasBackSpine,unitSfxUrl} from '../public/js/assets.js';
import {unitLoadout,chessLoadout} from '../public/js/ui/gameLogic.js';
import {preserveSkinAssets} from '../tools/assets/skins-manifest.mjs';
import {makeMatch} from './match/harness.js';
import {makeBattle} from './helpers/battleHarness.js';
import {unitInfo} from '../server/sim/snapshot.js';
import {buildBattleSpec,sanitizeUnitLoadout} from '../server/sim/spec.js';
import {buildLoadoutCatalog} from '../server/sim/content/expansion/loadout-catalog.js';
const D=getData(),M=D.assets,C=id=>D.chess[id],ids=base=>skinIds(M,base);
const base=Object.values(D.chess).find(c=>!c.isGolden&&c.visible&&ids(c).length>=2),gold=C(base.goldenId);
const [first,second]=skinsFor(M,base.charId);

test('all published skins have real avatars, portraits and parsed front/back models; partial upstream skins are excluded',async()=>{
  assert.equal(M.skinSource.skins,179);assert.equal(M.skinSource.operators,119);assert.equal(M.skinSource.unavailable.length,6);
  const paths=new Set();
  for(const [id,s] of Object.entries(M.skinModels)){
    assert.ok(s.spine.front.anims.idle,id);if(s.charId){if(!s.spine.back){assert.equal(s.frontOnly,true);assert.equal(s.charId,'char_4184_dolris');}assert.ok(s.portrait);assert.ok(s.avatar);}
    const walk=v=>{if(typeof v==='string'&&v.startsWith('/assets/skins/'))paths.add(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};walk(s);
  }
  assert.equal(paths.size,1465);for(const p of paths)assert.ok((await fs.stat(path.join(ROOT,'public',p))).size>0,p);
});
test('cross-repository audit only supplements matching artwork and never substitutes building models for battle models',async()=>{
  const source=JSON.parse(await fs.readFile(path.join(ROOT,'tools/assets/skins-source.json'),'utf8'));
  const audit=JSON.parse(await fs.readFile(path.join(ROOT,'tools/assets/skins-comparison.json'),'utf8'));
  assert.equal(audit.skins.length,43);assert.equal(audit.addedSkins.length,38);
  assert.equal(M.skinSource.comparison.commit,audit.arkModels.commit);
  const fallback=source.skins.filter(s=>s.portraitKind==='illustration'&&!source.rhodesBand.skins.includes(s.id));assert.equal(fallback.length,38);
  for(const s of fallback){
    assert.match(s.portrait,new RegExp('^charpack/'+s.id+'b\\.png$'));
    assert.ok(audit.addedSkins.includes(s.id));assert.equal(chessFullPortrait(M,{charId:s.charId},s.id),true);
    assert.ok(s.spine.front.every(p=>p.includes('/Front/')));assert.ok(s.spine.back.every(p=>p.includes('/Back/')));
    assert.equal(checkLoadout({[Object.values(D.chess).find(c=>c.charId===s.charId&&!c.isGolden&&c.visible).chessId]:{skin:s.id}},C,ids).ok,true);
  }
  assert.equal(chessFullPortrait(M,base,first.id),first.portraitKind==='illustration');
  for(const row of audit.skins.filter(s=>s.resolution==='unavailable')){
    assert.equal(row.battleFaces.back,false);assert.ok(row.arkModels.every(m=>m.type==='DynIllust'||m.style==='BuildingSkin'));
    assert.equal(source.skins.some(s=>s.sourceId===row.sourceId),false);
  }
});
test('all 369 unique skin models load with the Pixi atlas reader at actual PNG dimensions and pose every resolved animation role',()=>{
  const require=createRequire(path.join(ROOT,'package.json'));
  const core=require('@pixi/core'),base=require('@pixi-spine/base'),r=require('@pixi-spine/runtime-3.8');
  const models=new Map(Object.values(M.skinModels).flatMap(s=>Object.values(s.spine)).map(s=>[s.skel,s]));
  assert.equal(models.size,369);
  for(const s of models.values()){
    const dir=path.posix.dirname(s.atlas);
    assert.equal(s.skel.replace(/\.skel$/,'.atlas'),s.atlas);
    let done=false;
    const atlas=new base.TextureAtlas(readFileSync(path.join(ROOT,'public',s.atlas),'utf8'),(page,cb)=>{
      const size=pngSize(readFileSync(path.join(ROOT,'public',dir,page)));assert.ok(size,s.atlas);
      const texture=new core.BaseTexture(null,{width:size.width,height:size.height});
      texture.setRealSize(size.width,size.height);texture.valid=true;cb(texture);
    },()=>{done=true;});
    assert.ok(done,s.atlas);assert.deepEqual(atlas.pages.map(p=>dir+'/'+p.name),s.textures);
    for(const page of atlas.pages)assert.equal(!!page.pma,s.pma);
    const skeletonData=new r.SkeletonBinary(new r.AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(readFileSync(path.join(ROOT,'public',s.skel))));
    const skeleton=new r.Skeleton(skeletonData),state=new r.AnimationState(new r.AnimationStateData(skeletonData));
    for(const name of roleAnimationNames(s.anims)){state.setAnimation(0,name,true);state.update(.25);state.apply(skeleton);skeleton.updateWorldTransform();}
    atlas.dispose();
  }
});
test('skin choice preserves old skill/module preferences, persists, sanitises and resets without an account migration',()=>{
  const old={[base.chessId]:{skill:base.skills.find(s=>!s.isDefault).index,module:'none'}};
  assert.deepEqual(parseStored(toStored(old)),old);
  const next=setChoice(old,base,gold,{skin:first.id},ids);assert.equal(next[base.chessId].skill,old[base.chessId].skill);assert.equal(next[base.chessId].module,'none');
  assert.deepEqual(parseStored(toStored(next)),next);assert.deepEqual(sanitizeEntries(next,C,ids),next);
  assert.equal(effectiveChoice(next,base,gold,ids).skin,first.id);assert.equal(changedCount(next,C,ids),1);
  assert.deepEqual(setChoice(next,base,gold,{skin:null},ids),old);
  const bad={[base.chessId]:{...old[base.chessId],skin:'missing_skin'}};assert.deepEqual(sanitizeEntries(bad,C,ids),old);
});
test('server validates skin ownership and rejects arbitrary paths, URLs, unknown and elite-only keys',()=>{
  const payload={[base.chessId]:{skin:first.id}};assert.equal(validateC2S({t:'room.loadout',entries:payload}),null);
  const checked=checkLoadout(payload,C,ids);assert.equal(checked.ok,true);assert.equal(checked.loadout[base.chessId].skin,first.id);
  for(const id of ['other_skin','../secret','https://other.invalid/asset'])assert.ok(checkLoadout({[base.chessId]:{skin:id}},C,ids).error);
  const other=Object.values(D.chess).find(c=>!c.isGolden&&c.visible&&c.charId!==base.charId);
  assert.equal(checkLoadout({[other.chessId]:{skin:first.id}},C,ids).error,'BAD_TARGET');
  assert.equal(checkLoadout({[gold.chessId]:{skin:first.id}},C,ids).error,'BAD_TARGET');
});
test('avatars, portraits, forward and upward models, sound and teammate details resolve the chosen skin',()=>{
  for(const c of [base,gold]){
    assert.equal(chessAvatarUrl(M,c,first.id),first.avatar);assert.equal(chessPortraitUrl(M,c,first.id),first.portrait);
    assert.equal(selectedSkin({[base.chessId]:{skin:first.id}},c,M),first.id);
    const lo=unitLoadout(c,{skinId:first.id,skillIndex:0,moduleId:'none'});assert.equal(chessLoadout(c,lo,C).record.skinId,first.id);
  }
  assert.equal(spineEntry(M,first.id),first.spine.front);assert.equal(spineEntry(M,first.id,{back:true}),first.spine.back);assert.equal(hasBackSpine(M,first.id),true);
  assert.equal(unitSfxUrl(M,first.id,'attack'),unitSfxUrl(M,base.charId,'attack'));
  assert.equal(skinRecord(M,'constructor'),null);
});
test('two teammates with the same operator keep their own skins in pieces, scouting, normal/boss/hidden specs and locked loadouts',()=>{
  const seats=[first,second].map((skin,seat)=>({seat,playerId:'p_'+seat,name:'P'+seat,isBot:false,connected:true,loadout:{[base.chessId]:{skin:skin.id}}}));
  const h=makeMatch({seats,data:D,clients:false,clientCombat:true}).start();
  for(let i=0;i<2;i++){
    const ps=h.ps('p_'+i);ps.board.clear();const p=ps.newPiece('chess',i?gold.chessId:base.chessId);ps.board.set('10,3',p);
    assert.equal(ps.pieceView(p).skinId,seats[i].loadout[base.chessId].skin);
    const unit=ps.battleInput().units[0];assert.equal(unit.skinId,seats[i].loadout[base.chessId].skin);
    const scout=h.m.prepFieldMeta(ps).units[0];assert.equal(scout.spine,unit.skinId);assert.equal(scout.avatar,unit.skinId);
    for(const kind of ['normal','boss','hidden'])assert.equal(buildBattleSpec({kind,players:[ps.battleInput()],seed:1}).players[0].units[0].skinId,unit.skinId);
  }
  h.toPrep(1);assert.ok(h.m.setLoadout('p_0',{[base.chessId]:{skin:second.id}}).error);
  assert.equal(h.ps('p_0').loadout[base.chessId].skin,first.id);h.m.dispose();
});
test('skin changes only UnitInfo appearance: identical combat definitions, stats, RNG and full battle results',()=>{
  const options={seed:718,timeLimit:20,units:[{chessId:gold.chessId,row:10,col:3}],enemies:[{key:'enemy_1422_lrsldr',time:0,route:0}]};
  const a=makeBattle(options),b=makeBattle({...options,units:[{...options.units[0],skinId:first.id}]});
  assert.equal(a.unit(gold.chessId).def,b.unit(gold.chessId).def);assert.deepEqual(a.unit(gold.chessId).base,b.unit(gold.chessId).base);
  assert.equal(unitInfo(b.unit(gold.chessId)).spine,first.id);assert.equal(unitInfo(a.unit(gold.chessId)).spine,gold.assets.spine);
  assert.deepEqual(b.runToEnd(),a.runToEnd());assert.equal(b.b.rng.state(),a.b.rng.state());
});
test('skin metadata for summons follows the owner, including tokens listed before their operator',()=>{
  const s=Object.entries(M.skinModels).find(([,s])=>s.charId&&Object.keys(s.tokens||{}).length),[id,skin]=s;
  const owner=Object.values(D.chess).find(c=>c.charId===skin.charId&&c.isGolden),[tokenId,tokenSkin]=Object.entries(skin.tokens)[0];
  const h=makeBattle({units:[{kind:'token',tokenId,ownerUid:2,row:9,col:3,uid:1},{chessId:owner.chessId,skinId:id,skinTokens:skin.tokens,row:10,col:3,uid:2}],autoFinish:false});
  const token=h.b.allyUnits.find(u=>u.kind==='token');assert.equal(unitInfo(token).spine,tokenSkin);
  const spawned=h.b.spawnToken(h.unit(2),tokenId,11,3,{anySource:true});assert.equal(unitInfo(spawned).spine,tokenSkin);
});
test('ordinary asset rebuild retains every skin file and skin choices; malformed cosmetic spec fields are dropped',()=>{
  const body={},files=new Set();preserveSkinAssets(M,body,files,path.join(ROOT,'public/assets'));assert.equal(body.skinModels,M.skinModels);assert.equal(files.size,1465);
  assert.equal(sanitizeUnitLoadout({skinId:'../../bad',skinTokens:{x:'https://bad'}}).skinId,undefined);
});

test('both content batches expose every published new-operator skin in the outside-match catalog with strict ownership',async()=>{
  const catalog=buildLoadoutCatalog(D),lookup=id=>catalog.chess[id],allowed=c=>skinIds(catalog.assets,c),audit=JSON.parse(await fs.readFile(path.join(ROOT,'tools/assets/rhodes-band-skins-audit.json'),'utf8'));
  assert.equal(audit.operators.length,16);
  for(const row of audit.operators){
    // Historical audit retains operators retired by the approved Rhodes r4/r6 revisions.
    if(['char_123_fang','char_122_beagle','char_2013_cerber'].includes(row.charId)){assert.ok(!Object.values(catalog.chess).some(c=>c.charId===row.charId),row.charId);continue;}
    const c=Object.values(catalog.chess).find(v=>!v.isGolden&&v.charId===row.charId);assert.ok(c,row.charId);
    for(const skin of row.skins)assert.equal(checkLoadout({[c.chessId]:{skin}},lookup,allowed).ok,true,skin);
    if(row.charId!=='char_101_sora')assert.equal(row.skins.length,row.officialSkins);
  }
  assert.equal(audit.operators.find(r=>r.charId==='char_1015_aglna2').officialSkins,0);
  assert.deepEqual(audit.unavailable.map(s=>s.sourceId),['char_101_sora@summer#1']);
  const [id,s]=Object.entries(catalog.assets.skinModels).find(([,s])=>s.charId==='char_4184_dolris');
  assert.equal(s.frontOnly,true);assert.equal(hasBackSpine(catalog.assets,id),false);assert.equal(spineEntry(catalog.assets,id,{back:true}),s.spine.front);
});
