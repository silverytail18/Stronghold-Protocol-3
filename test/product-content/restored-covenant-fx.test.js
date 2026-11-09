import test from 'node:test';
import assert from 'node:assert/strict';
import {HigashiBladeSystem} from '../../public/js/render/higashiBlade.js';
import {IberiaEffects} from '../../public/js/render/iberia.js';
import {SnapshotBuffer} from '../../public/js/render/interp.js';
import {FxSim} from '../../public/js/render/fx/simfx.js';

class Graphics{
  constructor(){this.ops=[];}
  clear(){this.ops=[];return this;}
  lineStyle(...a){this.ops.push(['line',...a]);return this;}
  beginFill(...a){this.ops.push(['fill',...a]);return this;}
  drawPolygon(...a){this.ops.push(['polygon',...a]);return this;}
  drawCircle(...a){this.ops.push(['circle',...a]);return this;}
  moveTo(...a){this.ops.push(['move',...a]);return this;}
  lineTo(...a){this.ops.push(['to',...a]);return this;}
  endFill(){return this;}
  destroy(){this.destroyed=true;}
}
const ctx=()=>({P:{Graphics},layers:{unitFrontFx:{addChild(){}},overlay:{addChild(){}}},
  cam:()=>({project:(x,y,z)=>({x:x*60,y:y*60-z*20,s:60})}),heightAt:()=>0,timeScale:()=>1,screenSize:()=>({width:1280,height:720})});
test('original Higashi ribbons keep gold draw and blue return/wind, bounded lifetime and white-night fractures',()=>{
  for(const[kind,color]of [['higashiSlash',0xffd78f],['higashiReturn',0x9ed9ee],['higashiWind',0xb9e8f1]]){
    const h=new HigashiBladeSystem(ctx());h.emit(kind,{x:6,y:10,fromX:4,fromY:10});h.update(.14);
    assert.ok(h.g.ops.some(o=>o[0]==='fill'&&o[1]===color));assert.ok(h.g.ops.filter(o=>o[0]==='polygon').length>=3);
    h.update(1);assert.equal(h.count,0);h.clear();assert.deepEqual(h.g.ops,[]);h.destroy();assert.equal(h.g.destroyed,true);
  }
  const h=new HigashiBladeSystem(ctx());h.emit('higashiUltimate',{x:4,y:10,age:.3});h.update(0);
  assert.ok(h.g.ops.some(o=>o[0]==='line'&&o[2]===0xfffff7),'ivory main cut');
  assert.ok(h.g.ops.some(o=>o[0]==='line'&&o[2]===0xf4fcff),'fracture branches');
  h.update(.6);assert.equal(h.count,0);for(let i=0;i<80;i++)h.emit('higashiSlash',{x:6,y:10});assert.equal(h.count,64);
});
test('Higashi events go only to the dedicated blade controller; snapshot judgment does not spawn a generic reticle',()=>{
  const events=[],fx={higashi:{emit:(...a)=>events.push(a)}};
  for(const kind of ['higashiSlash','higashiReturn','higashiWind','higashiInsight','higashiUltimate'])FxSim.prototype.simFx.call(fx,kind,6,10,{id:2,src:1});
  assert.equal(events.length,5);assert.deepEqual(events[0],['higashiSlash',{x:6,y:10,id:2,src:1}]);
  FxSim.prototype.simFx.call(fx,'iberiaJudgment',0,0,{id:2,kind:'rune'});assert.equal(events.length,5);
});
function flower(){
  const views=new Map([1,2,3].map(id=>[id,{alive:true,alpha:1,root:{visible:true},screen:{x:100*id,y:200,s:60}}]));
  const h=new IberiaEffects(ctx());h.owner='p1';return{h,views};
}
const rows=[{playerId:'p1',marks:[[1,3,3,0],[2,5,3,0]],pending:[[2,.6,0,12]],metrics:{lights:1}},
  {playerId:'p2',marks:[[3,2,3,0]],pending:[[3,.8,0,13]],metrics:{lights:4}}];
test('blue petals 1–5 and execution runes reconstruct from a snapshot and follow only the displayed player',()=>{
  const{h,views}=flower();h.set(rows,2);h.update(views);assert.equal(h.petals,8);assert.equal(h.runes,1);
  const replay=flower();replay.h.set(JSON.parse(JSON.stringify(rows)),2);replay.h.update(replay.views);
  assert.deepEqual(replay.h.g.ops,h.g.ops,'reconnect needs no old judgment/hit events');
  const before=JSON.stringify(h.g.ops);views.get(2).screen.x+=60;h.update(views);assert.notEqual(JSON.stringify(h.g.ops),before);
  h.owner='p2';h.set(rows,2);h.update(views);assert.equal(h.petals,2);assert.equal(h.runes,1);
  h.owner='unknown';h.set(rows,2);h.update(views);assert.equal(h.petals,0);assert.equal(h.runes,0);
});
test('death/hidden units, canceled judgments, scene reset and owner switches cannot leave petals/runes or false scan pulses',()=>{
  const{h,views}=flower();h.set(rows,2);h.update(views);views.get(2).alive=false;h.update(views);assert.equal(h.petals,3);assert.equal(h.runes,0);
  views.get(1).root.visible=false;h.update(views);assert.equal(h.petals,0);
  h.set([{...rows[0],marks:[],pending:[],metrics:{lights:2}}],2.1);assert.equal(h.scanActive,true);h.update(views);assert.equal(h.runes,0);
  h.owner='p2';h.set(rows,2.2);assert.equal(h.scanActive,false);h.set(rows,1);assert.equal(h.scanActive,false);
  h.clear();assert.equal(h.petals,0);assert.equal(h.runes,0);assert.deepEqual(h.rows,[]);h.destroy();assert.equal(h.g.destroyed,true);assert.equal(h.beam.destroyed,true);
});
test('overlay samples the displayed snapshot, not the latest arrival or a stale previous field',()=>{
  const b=new SnapshotBuffer();b.push({gt:1,units:[],iberia:rows},0);b.push({gt:2,units:[],iberia:[]},1);
  assert.deepEqual(b.cosmeticMetaAt(1.5).iberia,rows);assert.deepEqual(b.cosmeticMetaAt(2).iberia,[]);
  b.reset();assert.equal(b.cosmeticMetaAt(3),null);
});
