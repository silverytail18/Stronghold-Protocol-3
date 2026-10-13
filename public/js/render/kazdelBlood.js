import {createBloodTextureCanvas} from './kazdelBloodTextures.js';
// World origin is the ground contact. Horizontal travel and vertical blade height use independent camera vectors.
export class KazdelBloodSystem{
 constructor(ctx){this.ctx=ctx;this.effects=[];this.textures=new Map();this.spare=[];this.g=new ctx.P.Graphics();ctx.layers.fxNormal.addChild(this.g);}
 texture(kind,frame){const k=kind+':'+frame;if(!this.textures.has(k))this.textures.set(k,this.ctx.P.Texture.from(createBloodTextureCanvas(kind,frame)));return this.textures.get(k);}
 free(e){if(e.sprite){e.sprite.visible=false;this.spare.push(e.sprite);e.sprite=null;}}
 emit(kind,ex){
  if(!Number.isFinite(ex.x)||!Number.isFinite(ex.y))return;
  const sword=kind==='kz-blood-sword',vortex=kind==='kz-blood-vortex',e={...ex,kind,age:0,flight:Math.max(0,ex.t??.4),dur:Math.max(.05,ex.t??.4)+(sword?.06:0)};
  if(sword||vortex){e.sprite=this.spare.pop()||new this.ctx.P.Sprite();e.sprite.anchor.set(135/190,90/125);e.sprite.visible=true;const parent=sword?this.ctx.layers.units:this.ctx.layers.fxNormal;if(e.sprite.parent!==parent)parent.addChild(e.sprite);e.sprite.texture=this.texture(sword?'sword':'vortex',0);}
  this.effects.push(e);if(this.effects.length>96)this.free(this.effects.shift());
 }
 update(dt){
  const scale=this.ctx.timeScale?.(),step=Math.max(0,dt)*(Number.isFinite(scale)?Math.max(0,scale):1),g=this.g,cam=this.ctx.cam();g.clear();
  for(const e of this.effects){e.age+=step;if(e.age>=e.dur){this.free(e);continue;}
   const alpha=Math.min(1,(e.dur-e.age)/.08),dx=Number.isFinite(e.dx)?e.dx:0,dy=Number.isFinite(e.dy)?e.dy:1;
   const ground=(x,y)=>this.ctx.heightAt?.(Math.round(y),Math.round(x))||0;
   if(e.sprite){
    const sword=e.kind==='kz-blood-sword',d=sword?Math.min(e.distance??5,e.age*(e.speed??5)):0,x=e.x+dx*d,y=e.y+dy*d,z=ground(x,y)+.025;
    const p=cam.project(x,y,z),a=cam.project(x+dx,y+dy,z),up=cam.project(x,y,z+1);
    e.sprite.alpha=Math.min(1,e.age/.025)*alpha;
    if(sword){
     e.sprite.texture=this.texture('sword',0);
     let depth=-cam.depthOf(x,y,0)*100+x*.001;
     for(const v of this.ctx.views?.()||[])if(v.root&&!v.destroyed&&v.alive!==false&&v.root.visible!==false&&(dx?Math.round(v.y)===Math.round(y):Math.round(v.x)===Math.round(x)))depth=Math.max(depth,v.root.zIndex);
     e.sprite.zIndex=depth+.02;
     // One source texel equals 1/(60*3) tile. Up is perpendicular to the board, including at camera rotation.
     // A near edge-on flight gets a thin camera-facing plane so the curved blade stays visible in all four directions.
     const vx=Math.abs(a.x-p.x)<p.s*.25?p.s*.42:(a.x-p.x);
     e.sprite.transform.setFromMatrix(new this.ctx.P.Matrix(vx/180,(a.y-p.y)/180,(p.x-up.x)*1.12/180,(p.y-up.y)*1.12/180,p.x,p.y));
    }else{
     e.sprite.texture=this.texture('vortex',Math.min(11,Math.floor(e.age/.45*12)));
     e.sprite.position.set(p.x,p.y);e.sprite.scale.set(p.s/180);e.sprite.rotation=0;e.sprite.skew.set(0,0);
    }
   }else if(e.kind==='kz-curse-mark'){
    const v=this.ctx.view?.(e.id);if(!v||v.destroyed||v.alive===false||v.hidden||v.root?.visible===false)continue;
    const p=cam.project(v.x,v.y,(v.z??ground(v.x,v.y))+(v.hover||0)+.35),s=Math.max(4,p.s*.105),x=p.x+p.s*.27,y=p.y;
    g.lineStyle(Math.max(1,p.s*.018),0xff4055,alpha*.9);g.moveTo(x,y-s);g.lineTo(x+s*.55,y);g.lineTo(x,y+s);g.lineTo(x-s*.55,y);g.lineTo(x,y-s);
    g.lineStyle(Math.max(1,p.s*.014),0xffb68b,alpha*.85);g.moveTo(x-s*.3,y);g.lineTo(x+s*.3,y);g.moveTo(x,y-s*.4);g.lineTo(x,y+s*.4);
   }else{
    const p=cam.project(e.x,e.y,ground(e.x,e.y)+.05);g.lineStyle(Math.max(1,p.s*.023),0xb8294e,alpha*.4);g.drawEllipse(p.x,p.y,p.s*.36,p.s*.19);
   }
  }this.effects=this.effects.filter(e=>e.age<e.dur);
 }
 clear(){for(const e of this.effects)this.free(e);this.effects=[];this.g.clear();}
 destroy(){this.clear();for(const sp of this.spare)sp.destroy();this.spare=[];for(const t of this.textures.values())t.destroy(true);this.textures.clear();this.g.destroy();}
}
