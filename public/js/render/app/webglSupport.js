// Pixi 7 renders with WebGL2, but its renderer-selection test probes WebGL1 only.
// Some Android WebViews expose a working WebGL2 context while WebGL1 is unavailable.
// Keep its normal test first; extend detection without changing the selected renderer or its options.
const installed=new WeakSet();
// Android WebView does not pass dedicated-Worker fetches through WebViewClient.
// Decode the same bytes with ImageBitmap after a page fetch, which the local native store intercepts.
export function configureNativeTextures(P,win=globalThis){
  if(win.SPAndroid?.request)P.Assets?.setPreferences?.({preferWorkers:false});
}
export function installWebGL2Detection(P,doc=globalThis.document){
  const Renderer=P?.Renderer;
  if(!Renderer?.test||installed.has(Renderer)||!doc?.createElement)return;
  const original=Renderer.test;
  let supported;
  Renderer.test=function(options){
    if(original.call(this,options))return true;
    if(options?.forceCanvas)return false;
    if(supported===undefined){
      let gl;
      try{gl=doc.createElement('canvas').getContext('webgl2',{stencil:true,failIfMajorPerformanceCaveat:P.settings?.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT===true});supported=!!gl?.getContextAttributes()?.stencil;}
      catch{supported=false;}
      finally{gl?.getExtension('WEBGL_lose_context')?.loseContext();}
    }
    return supported;
  };
  installed.add(Renderer);
}
