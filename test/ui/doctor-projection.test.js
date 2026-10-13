import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DATA,makeMatch,give,giveItem,legalTileFor} from '../match/harness.js';
import {placementContext,dropIntent,itemAttaches} from '../../public/js/ui/gameLogic.js';
import {replaceRequest,replaceIntent} from '../../public/js/ui/equipReplace.js';

const NORMAL='chess_item_5_06_e_a',GOLDEN='chess_item_5_06_e_b';
const EQUIPMENT=['chess_item_1_01_e_a','chess_item_1_02_e_a'];
const getChess=id=>DATA.chess[id],getItem=id=>DATA.items[id];
function context(h){h.flushAll();return placementContext({priv:h.lastTo('p_0','m.private'),stage:DATA.stages.act2autochess_m01,editable:true,getChess,getItem,getToken:id=>DATA.tokens[id]});}
function setup(t,mode,area,count=2,projectionId=NORMAL){
  const h=makeMatch({mode,difficulty:'NORMAL',humans:mode==='solo'?1:2,fake:true,seed:711});
  t.after(()=>h.m.dispose());h.start();h.toPrep(1);
  const ps=h.ps('p_0'),id=Object.values(DATA.chess).find(c=>c.visible&&!c.isGolden&&c.tier===1&&h.m.pool.has(c.chessId)).chessId;
  const at=legalTileFor(h.m,ps,id),unit=give(h.m,ps,id,area,area==='board'?at:null);
  const equipment=EQUIPMENT.slice(0,count).map(id=>giveItem(h.m,ps,id));
  for(const item of equipment)assert.deepEqual(h.m.handle('p_0',{t:'g.equip',itemUid:item.uid,targetUid:unit.uid}),{ok:true});
  const projection=giveItem(h.m,ps,projectionId);
  const loc=ps.find(unit.uid),target=area==='board'?{area,row:at[0],col:at[1]}:{area,idx:loc.idx};
  return{h,ps,unit,equipment,projection,target};
}

test('normal Doctor projection needs an equipment slot; instant golden projection and coins do not',()=>{
  assert.equal(itemAttaches(getItem(NORMAL)),true);
  assert.equal(itemAttaches(getItem(GOLDEN)),false);
  assert.equal(itemAttaches(getItem('chess_item_1_03_e_a')),false);
});

for(const mode of ['solo','coop'])for(const area of ['board','hand'])for(const pick of [0,1]){
  test(`${mode}/${area}: normal projection asks, cancel changes nothing, replaces selected slot ${pick+1}, promotes next round`,t=>{
    const {h,ps,unit,equipment,projection,target}=setup(t,mode,area);
    const before=JSON.stringify(ps.privateView()),intent=dropIntent(context(h),projection.uid,target);
    assert.equal(intent.confirmReplace,true);
    const request=replaceRequest(context(h),intent,getChess,getItem);
    assert.equal(request.item.name,'博士投影');
    assert.deepEqual(request.options.map(o=>o.uid),equipment.map(i=>i.uid));
    // Opening the dialog or cancelling sends no equip request and must not remove any inventory.
    assert.equal(JSON.stringify(ps.privateView()),before);
    assert.ok(ps.find(projection.uid));
    const invalid=replaceIntent(intent,projection.uid);
    assert.ok(h.m.handle('p_0',{t:invalid.t,...invalid.fields}).error);
    assert.equal(JSON.stringify(ps.privateView()),before);
    const selected=replaceIntent(intent,equipment[pick].uid);
    assert.deepEqual(h.m.handle('p_0',{t:selected.t,...selected.fields}),{ok:true});
    assert.deepEqual(unit.items.map(i=>i.uid),[equipment[1-pick].uid,projection.uid]);
    assert.equal(ps.find(equipment[pick].uid),null);
    assert.equal(h.m.gd.isGolden(unit.id),false,'normal projection does not immediately promote');
    h.invariants();h.toPrep(2);
    assert.equal(h.m.gd.isGolden(unit.id),true);
    assert.equal(ps.find(projection.uid),null,'projection consumes itself next round');
    assert.ok(ps.find(equipment[1-pick].uid),'other equipment returns on promotion instead of being destroyed');
    h.invariants();
  });
}

for(const count of [0,1])test(`normal projection with ${count} equipped items attaches without a replacement dialog`,t=>{
  const {h,unit,equipment,projection,target}=setup(t,'solo','board',count);
  const intent=dropIntent(context(h),projection.uid,target);
  assert.equal(intent.confirmReplace,false);
  assert.deepEqual(h.m.handle('p_0',{t:intent.t,...intent.fields}),{ok:true});
  assert.deepEqual(unit.items.map(i=>i.uid),[...equipment.map(i=>i.uid),projection.uid]);h.invariants();
});

test('golden projection on a full carrier promotes immediately without destroying either original item',t=>{
  const {h,ps,unit,equipment,projection,target}=setup(t,'solo','board',2,GOLDEN);
  const intent=dropIntent(context(h),projection.uid,target);
  assert.equal(intent.confirmReplace,false);
  assert.deepEqual(h.m.handle('p_0',{t:intent.t,...intent.fields}),{ok:true});
  assert.equal(h.m.gd.isGolden(unit.id),true);
  assert.equal(ps.find(projection.uid),null);
  for(const item of equipment)assert.ok(ps.find(item.uid),'original equipment is returned, not replaced');
  h.invariants();
});

test('normal projection completing a merge on a full carrier does not destroy unrelated equipment',t=>{
  const {h,ps,unit,equipment,projection,target}=setup(t,'solo','board');
  // A second copy may exist in an imported snapshot; create it directly so the equip path handles the merge.
  const twin=giveItem(h.m,ps,NORMAL);
  const intent=dropIntent(context(h),projection.uid,target);
  assert.equal(intent.confirmReplace,false,'a merge needs no replacement');
  assert.deepEqual(h.m.handle('p_0',{t:intent.t,...intent.fields}),{ok:true});
  assert.deepEqual(unit.items.map(i=>i.uid),equipment.map(i=>i.uid));
  assert.equal(ps.find(projection.uid),null);assert.equal(ps.find(twin.uid),null);
  assert.ok([...ps.hand,...ps.temp].some(i=>i?.id===GOLDEN));h.invariants();
});
