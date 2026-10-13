// Cosmetic-only cached Canvas textures. Note paths/collisions still come exclusively from the simulation.
import {makeCanvas} from './textures.js';
const palettes={phys:{glow:'#768dff',edge:'#aac9ff'},arts:{glow:'#9d79ff',edge:'#c5b6ff'}};
const textures=new Map();

export function musicNoteTextures(type='phys'){
 const key=type==='arts'?'arts':'phys';if(textures.has(key))return textures.get(key);
 const P=globalThis.PIXI,p=palettes[key],glyph=makeCanvas(72,88),c=glyph.getContext('2d');
 const halo=c.createRadialGradient(35,45,5,35,45,39);
 halo.addColorStop(0,key==='arts'?'rgba(134,97,255,.28)':'rgba(92,131,255,.28)');halo.addColorStop(1,'rgba(93,97,255,0)');
 c.fillStyle=halo;c.fillRect(0,0,72,88);
 // A translucent faceted rim and an upright eighth note, like the native blue-violet musical projectile.
 c.lineJoin=c.lineCap='round';c.shadowColor=p.glow;c.shadowBlur=10;c.strokeStyle=p.edge;c.lineWidth=1.5;
 c.beginPath();c.moveTo(16,25);c.lineTo(29,12);c.lineTo(46,9);c.lineTo(58,22);c.lineTo(59,61);c.lineTo(47,77);c.lineTo(24,78);c.lineTo(13,65);c.stroke();
 const note=()=>{c.beginPath();c.ellipse(27,61,10,7,-.38,0,Math.PI*2);c.moveTo(36,58);c.lineTo(36,24);c.bezierCurveTo(43,24,51,32,46,43);};
 c.strokeStyle=p.glow;c.lineWidth=6;c.shadowBlur=14;note();c.stroke();
 c.strokeStyle='#eff4ff';c.lineWidth=2.8;c.shadowBlur=5;note();c.stroke();
 c.shadowBlur=0;c.fillStyle=p.edge;c.globalAlpha=.24;c.beginPath();c.ellipse(27,61,8,5,-.38,0,Math.PI*2);c.fill();
 c.globalAlpha=.9;c.fillStyle='#ffffff';c.beginPath();c.ellipse(20,60,1.6,1.1,-.38,0,Math.PI*2);c.fill();
 const ribbon=makeCanvas(128,32),r=ribbon.getContext('2d'),gradient=r.createLinearGradient(0,0,128,0);
 gradient.addColorStop(0,'rgba(116,116,255,0)');gradient.addColorStop(.25,key==='arts'?'rgba(145,107,255,.12)':'rgba(99,139,255,.12)');gradient.addColorStop(1,p.edge);
 r.lineCap='round';r.strokeStyle=gradient;r.shadowColor=p.glow;r.shadowBlur=7;
 for(const [y,width]of [[7,1.2],[16,2.2],[25,1.2]]){r.lineWidth=width;r.beginPath();r.moveTo(0,y+2);r.bezierCurveTo(48,y-1,89,y,128,y);r.stroke();}
 r.shadowBlur=0;r.fillStyle=gradient;r.globalAlpha=.12;r.beginPath();r.moveTo(3,12);r.lineTo(124,4);r.lineTo(127,27);r.lineTo(3,20);r.closePath();r.fill();
 const result={glyph:P.Texture.from(glyph),ribbon:P.Texture.from(ribbon)};textures.set(key,result);return result;
}

export class MusicNoteView{
 constructor(P){
  this.root=new P.Container();this.ribbon=new P.Sprite();this.glyph=new P.Sprite();
  this.ribbon.anchor.set(1,.5);this.glyph.anchor.set(.5,.5);
  this.ribbon.blendMode=this.glyph.blendMode=P.BLEND_MODES.ADD;this.root.addChild(this.ribbon,this.glyph);
  this.lastX=this.lastY=null;this.headingX=1;this.headingY=0;this.type=null;
 }
 update(note,cam,dt,{height,depth,ownerX,ownerY,dirX=1,dirY=0}){
  const [,x,y,type]=note,first=this.lastX==null;
  if(type!==this.type){const t=musicNoteTextures(type);this.glyph.texture=t.glyph;this.ribbon.texture=t.ribbon;this.type=type;}
  const dx=this.lastX==null?x-ownerX:x-this.lastX,dy=this.lastY==null?y-ownerY:y-this.lastY;
  const length=Math.hypot(dx,dy);
  if(length>1e-5){this.headingX=dx/length;this.headingY=dy/length;}
  else if(this.lastX==null){this.headingX=dirX;this.headingY=dirY;}
  this.lastX=x;this.lastY=y;
  const q=cam.project(x,y,height),forward=cam.project(x+this.headingX*.1,y+this.headingY*.1,height);
  this.root.position.set(q.x,q.y);this.root.zIndex=depth;
  const size=Math.max(12,Math.min(40,q.s*.55));this.glyph.height=size;this.glyph.width=size*72/88;
  // Rotate only the staff-like wake; the musical glyph stays upright in every direction.
  const angle=Math.atan2(forward.y-q.y,forward.x-q.x),delta=angle-this.ribbon.rotation;
  this.ribbon.rotation=first?angle:this.ribbon.rotation+Math.atan2(Math.sin(delta),Math.cos(delta))*Math.min(1,Math.max(0,dt)*18);
  this.ribbon.width=Math.max(18,Math.min(100,q.s*1.3));this.ribbon.height=size*.42;
  this.ribbon.alpha=.65;this.glyph.alpha=.96;
 }
 destroy(){this.root.destroy({children:true});}
}
