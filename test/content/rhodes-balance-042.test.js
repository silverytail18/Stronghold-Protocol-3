import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../../server/data.js';
import {buildRhodesMujicaData,RI} from '../../server/sim/content/rhodes-mujica/data.js';
import {makeMatch,give} from '../match/harness.js';
import {chessRec} from '../helpers/battleHarness.js';
import {formatBondEffect,richTextPlain} from '../../public/js/ui/richText.js';
import {testBondCalculation} from '../../shared/test-bond-descriptions.js';
const raw=buildRhodesMujicaData(getData());
// No personal growth traits: isolate the actual match's base/composition settlement.
for(const count of [3,6,9])for(const diverse of [false,true])test(`RI${count} integer prep settlement, diversity=${diverse}, once per round`,()=>{
 const data=structuredClone(raw),jobs=['WARRIOR','CASTER','SUPPORT','MEDIC','SNIPER'];
 for(let i=0;i<count;i++){const id='qa_ri_prep_'+i;data.chess[id]={...chessRec({id,bonds:[RI],profession:diverse?jobs[i%Math.min(count,5)]:'WARRIOR',skill:null}),visible:true,garrisonIds:[]};}
 const h=makeMatch({data,mode:'solo',fake:true}).start();h.toPrep(1);const m=h.m,p=h.ps('p_0');p.board.clear();p.hand.fill(null);p.temp.fill(null);p.layers={};p.bandId=null;
 for(let i=0;i<count;i++)give(m,p,'qa_ri_prep_'+i,'board',[9+Math.floor(i/3),3+i%3]);
 if(count===9){const item=p.acquireItem('chess_item_6_08_e_a');assert.ok(p.equip(item.uid,[...p.board.values()][0].uid).ok);assert.equal(p.deployCap,9);}p.recompute();
 assert.equal(p.bonds[RI].tier,count/3);
 const expected=({3:diverse?1:0,6:diverse?4:2,9:diverse?11:7})[count];
 m.dispatch(p,'onPrepEnd',{round:m.round});assert.equal(p.layers[RI]||0,expected);assert.ok(Number.isInteger(p.layers[RI]||0));
 m.dispatch(p,'onPrepEnd',{round:m.round});assert.equal(p.layers[RI]||0,expected);
 m.round++;m.dispatch(p,'onPrepEnd',{round:m.round});assert.equal(p.layers[RI]||0,expected*2);m.dispose();
});
test('latest overview, tier details and current panel agree on prep growth and reduced artillery caps',()=>{
 const b=raw.bonds[RI];assert.ok(!b.desc.includes('屏障')&&!b.desc.includes('协同')&&!b.desc.includes('接力'));const details=b.detailSections.map(s=>s.text).join('\n');assert.ok(details.includes('休整基础0／2／7层'));assert.ok(details.includes('额外1／2／4层'));
 assert.ok(details.includes('攻击10%＋每层0.2个百分点'));assert.ok(details.includes('0.05×超出层数的平方'));
 for(const tier of [2,3])assert.ok(b.effectDescByTier[tier].includes('0.05×超出层数的平方'));
 for(const [tier,base,jobs,extra,cap]of [[1,0,3,1,null],[2,2,4,2,50],[3,7,5,4,100]]){
  const text=richTextPlain(formatBondEffect(b,800,tier,{atk:10000,live:true}));assert.ok(text.includes(`休整基础+${base}层，至少${jobs}职业额外+${extra}层`));
  if(cap){const calculation=richTextPlain(testBondCalculation(b,800,tier,{atk:10000,live:true}));assert.ok(calculation.includes(`攻击力系数 ${cap}%`));assert.ok(!text.includes('攻击力系数'));assert.ok(b.effectDescByTier[tier].includes(`系数4%—${cap}%`));}
 }
});
