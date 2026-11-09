import test from 'node:test';import assert from 'node:assert/strict';
import {installWebGL2Detection,configureNativeTextures} from '../../public/js/render/app/webglSupport.js';
function fixture(normal,context){
  let probes=0,releases=0;
  const P={Renderer:class{static test(){return normal;}},settings:{FAIL_IF_MAJOR_PERFORMANCE_CAVEAT:false}};
  const doc={createElement(){return{getContext(type,options){
    probes++;assert.equal(type,'webgl2');assert.equal(options.stencil,true);
    return context===null?null:{getContextAttributes:()=>({stencil:context}),getExtension:()=>({loseContext(){releases++;}})};
  } };} };
  return{P,doc,counts:()=>({probes,releases})};
}
test('existing supported renderer stays unchanged and forceCanvas is not widened',()=>{const f=fixture(true,true);installWebGL2Detection(f.P,f.doc);assert.equal(f.P.Renderer.test({}),true);assert.deepEqual(f.counts(),{probes:0,releases:0});const g=fixture(false,true);installWebGL2Detection(g.P,g.doc);assert.equal(g.P.Renderer.test({forceCanvas:true}),false);assert.deepEqual(g.counts(),{probes:0,releases:0});});
test('WebGL2-only context with stencil is detected once and its probe context released',()=>{const f=fixture(false,true);installWebGL2Detection(f.P,f.doc);installWebGL2Detection(f.P,f.doc);assert.equal(f.P.Renderer.test({}),true);assert.equal(f.P.Renderer.test({}),true);assert.deepEqual(f.counts(),{probes:1,releases:1});});
for(const value of [null,false])test('missing WebGL2 or stencil retains fallback: '+value,()=>{const f=fixture(false,value);installWebGL2Detection(f.P,f.doc);assert.equal(f.P.Renderer.test({}),false);});
test('Android native textures use intercepted page fetch without changing other hosts or image decoding',()=>{
 const calls=[],P={Assets:{setPreferences:options=>calls.push(options)}};
 configureNativeTextures(P,{});assert.deepEqual(calls,[]);
 configureNativeTextures(P,{SPAndroid:{request(){}}});assert.deepEqual(calls,[{preferWorkers:false}]);
});
