// Cosmetic water rings: one live view per caster, shared textures, normal blending.
// The simulation owns movement, radius, damage and expiry; repeated ticks only refresh this view.
import {makeCanvas} from './textures.js';

const cache=new WeakMap();
const SIZE=512,CENTER=SIZE/2,RADIUS=200,MAX_VORTICES=16;
const TAU=Math.PI*2;

export function waterVortexTextures(P=globalThis.PIXI){
  if(cache.has(P))return cache.get(P);
  const body=makeCanvas(SIZE,SIZE),foam=makeCanvas(SIZE,SIZE);
  const c=body.getContext('2d'),f=foam.getContext('2d');
  c.lineCap=f.lineCap='round';c.lineJoin=f.lineJoin='round';
  // The dark blue rim gives water depth without a filled disc or an additive glow.
  c.strokeStyle='rgba(22,66,94,.32)';c.lineWidth=32;
  c.beginPath();c.arc(CENTER,CENTER,RADIUS,0,TAU);c.stroke();
  const point=(angle,r)=>[CENTER+Math.cos(angle)*r,CENTER+Math.sin(angle)*r];
  for(let i=0;i<18;i++){
    const start=i*TAU/18,length=.72+(i%4)*.21,r=RADIUS-14+(i%5)*6;
    const a=point(start,r),z=point(start+length,r);
    const gradient=c.createLinearGradient(...a,...z);
    gradient.addColorStop(0,'rgba(28,89,132,0)');
    gradient.addColorStop(.35,'rgba(43,123,175,.52)');
    gradient.addColorStop(.82,'rgba(100,183,220,.66)');
    gradient.addColorStop(1,'rgba(52,119,160,.08)');
    c.fillStyle=gradient;c.beginPath();
    // Tapered curved ribbons, kept around the edge so the centre stays fully transparent.
    for(const side of [1,-1])for(let j=0;j<=64;j++){
      const t=side===1?j/64:1-j/64,angle=start+t*length;
      const ripple=Math.sin(t*6+i*1.7)*5+Math.sin(t*17+i*2.3)*2,width=Math.sin(t*Math.PI)*(5+i%4*2);
      const p=point(angle,r+ripple+side*width);
      if(side===1&&j===0)c.moveTo(...p);else c.lineTo(...p);
    }
    c.closePath();c.fill();
  }
  // Fine currents and uneven rim wisps break up the smooth ribbons into liquid texture.
  for(let i=0;i<96;i++){
    const start=i*2.399963,length=.12+(i%7)*.07,r=RADIUS-22+(i%13)*3.6;
    c.strokeStyle=i%4===0?'rgba(185,218,232,.34)':i%3===0?'rgba(15,62,99,.38)':'rgba(105,177,213,.32)';
    c.lineWidth=.65+(i%4)*.38;c.beginPath();
    for(let j=0;j<=24;j++){
      const t=j/24,p=point(start+t*length,r+Math.sin(t*9+i)*3+Math.sin(t*4+i*.7)*4);
      if(j===0)c.moveTo(...p);else c.lineTo(...p);
    }
    c.stroke();
  }
  // A few narrow foam crests rotate separately; no white centre, flash, smoke or sparks.
  for(let i=0;i<11;i++){
    const start=i*TAU/11,length=.22+(i%3)*.13;
    f.strokeStyle=i%3?'rgba(151,208,229,.58)':'rgba(207,231,239,.66)';
    f.lineWidth=1.8+i%3;f.beginPath();
    for(let j=0;j<=32;j++){
      const t=j/32,p=point(start+t*length,RADIUS+Math.sin(t*4+i)*8);
      if(j===0)f.moveTo(...p);else f.lineTo(...p);
    }
    f.stroke();
  }
  for(let i=0;i<19;i++){
    const angle=i*2.399963,r=RADIUS+14+(i%5)*2,p=point(angle,r);
    f.save();f.translate(...p);f.rotate(angle+Math.PI/2);
    f.fillStyle='rgba(137,195,221,.34)';f.beginPath();f.ellipse(0,0,2+i%4,.65,0,0,TAU);f.fill();f.restore();
  }
  const result={body:P.Texture.from(body),foam:P.Texture.from(foam)};
  cache.set(P,result);return result;
}

export class WaterVortexSystem{
  constructor(ctx){this.ctx=ctx;this.views=new Map();}
  refresh(src,x,y,r,duration){
    if(src==null||![x,y,r,duration].every(Number.isFinite)||r<=0)return;
    let v=this.views.get(src);
    if(!v){
      if(this.views.size>=MAX_VORTICES){const oldest=this.views.keys().next().value;this.remove(oldest);}
      const P=this.ctx.P,textures=waterVortexTextures(P),root=new P.Container();
      const body=new P.Sprite(textures.body),inner=new P.Sprite(textures.body),foam=new P.Sprite(textures.foam);
      for(const sprite of [body,inner,foam]){sprite.anchor.set(.5);sprite.blendMode=P.BLEND_MODES.NORMAL;}
      inner.scale.set(.88);inner.alpha=.3;foam.alpha=.64;
      root.addChild(body,inner,foam);this.ctx.layers.fxNormal.addChild(root);
      v={root,body,inner,foam,age:0,remaining:0};this.views.set(src,v);
    }
    Object.assign(v,{x,y,r});
    // Durations are game seconds; the small tail joins adjacent ticks and fades promptly after the last one.
    v.remaining=Math.max(v.remaining,duration+.12);
  }
  remove(src){const v=this.views.get(src);if(v)v.root.destroy({children:true});this.views.delete(src);}
  update(dt){
    const step=Math.max(0,dt)*(Number(this.ctx.timeScale?.())||1),cam=this.ctx.cam();
    for(const [src,v]of this.views){
      v.age+=step;v.remaining-=step;
      if(v.remaining<=0){this.remove(src);continue;}
      const z=this.ctx.heightAt?.(Math.round(v.y),Math.round(v.x))||0;
      const p=cam.project(v.x,v.y,z+.55);
      v.root.position.set(p.x,p.y);v.root.scale.set(v.r*p.s/RADIUS,v.r*p.s*.8/RADIUS);
      v.root.alpha=.78*Math.min(1,v.age/.12,v.remaining/.12);
      v.body.rotation=-v.age*.72;v.inner.rotation=v.age*.48+.9;v.foam.rotation=-v.age*1.1;
      v.root.visible=Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.s>0;
    }
  }
  clear(){for(const src of this.views.keys())this.remove(src);}
}
