// Native PIXI artillery: heated shell envelope, exact reticles and fast straight descent.
export const RI_FIRE_COLORS=Object.freeze({phys:0xf1a658,arts:0xab91ed,true:0xf2d483});
export const RI_FIRE_ANGLES=Object.freeze({phys:12,arts:18,true:6});
export const riShellProgress=t=>Math.min(1,Math.max(0,t));

function shellTextures(P,type,shellCache){
 if(shellCache.has(type))return shellCache.get(type);
 const col=RI_FIRE_COLORS[type]||RI_FIRE_COLORS.phys,r=col>>16&255,g=col>>8&255,b=col&255;
 const rgba=a=>'rgba('+r+','+g+','+b+','+a+')';
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};


 const body=canvas(128,320),c=body.getContext('2d');
 const steel=c.createLinearGradient(34,0,94,0);steel.addColorStop(0,'rgba(34,38,41,.7)');steel.addColorStop(.36,'rgba(178,169,145,.65)');steel.addColorStop(.6,'rgba(112,114,104,.65)');steel.addColorStop(1,'rgba(30,36,42,.8)');
 c.fillStyle=steel;c.beginPath();c.moveTo(64,300);c.bezierCurveTo(43,268,34,239,34,207);c.lineTo(37,53);c.quadraticCurveTo(64,28,91,53);c.lineTo(94,207);c.bezierCurveTo(94,239,85,268,64,300);c.closePath();c.fill();
 c.strokeStyle=rgba(.45);c.lineWidth=2;c.stroke();
 // A single heated envelope extends all the way to the physical nose. No separate exhaust nozzle.
 const plume=canvas(160,512),f=plume.getContext('2d');
 const wrap=()=>{f.beginPath();f.moveTo(80,511);f.bezierCurveTo(43,487,28,452,41,411);f.bezierCurveTo(26,357,53,297,44,242);f.lineTo(61,270);f.bezierCurveTo(49,197,74,128,69,82);f.lineTo(78,9);f.bezierCurveTo(86,84,80,140,96,205);f.lineTo(108,187);f.bezierCurveTo(95,277,128,343,117,404);f.bezierCurveTo(134,451,118,488,80,511);f.closePath();};
 const flame=f.createLinearGradient(0,8,0,511);flame.addColorStop(0,rgba(0));flame.addColorStop(.15,rgba(.1));flame.addColorStop(.34,rgba(.43));flame.addColorStop(.62,rgba(.84));flame.addColorStop(.88,rgba(.98));flame.addColorStop(1,'rgba(255,255,242,1)');f.fillStyle=flame;
 f.save();f.filter='blur(6px)';f.globalAlpha=.42;wrap();f.fill();f.restore();wrap();f.fill();
 const edge=f.createLinearGradient(0,220,0,511);edge.addColorStop(0,rgba(0));edge.addColorStop(.38,'rgba(255,238,203,.25)');edge.addColorStop(.75,'rgba(255,249,224,.88)');edge.addColorStop(1,'rgba(255,255,246,1)');f.fillStyle=edge;
 // Hot boundary layer wraps along both flanks, revealing a thin shaded central shell silhouette.
 f.beginPath();f.moveTo(80,509);f.bezierCurveTo(43,479,46,433,56,384);f.bezierCurveTo(52,338,66,296,65,240);f.bezierCurveTo(77,305,60,355,69,397);f.bezierCurveTo(56,445,66,482,80,509);f.closePath();f.fill();
 f.beginPath();f.moveTo(80,509);f.bezierCurveTo(106,482,106,444,95,397);f.bezierCurveTo(107,335,85,279,90,226);f.bezierCurveTo(94,294,124,351,112,405);f.bezierCurveTo(127,458,115,489,80,509);f.closePath();f.fill();
 f.fillStyle='rgba(255,255,239,.97)';f.beginPath();f.moveTo(80,511);f.quadraticCurveTo(64,499,61,478);f.quadraticCurveTo(80,494,99,478);f.quadraticCurveTo(96,499,80,511);f.fill();
 const halo=canvas(128,128),h=halo.getContext('2d'),glow=h.createRadialGradient(64,64,4,64,64,58);glow.addColorStop(0,'rgba(255,240,170,.55)');glow.addColorStop(.35,rgba(.21));glow.addColorStop(1,rgba(0));h.fillStyle=glow;h.fillRect(0,0,128,128);
 const smoke=canvas(192,512),q=smoke.getContext('2d');
 // One shared baked smoke texture: fading, expanding turbulent wake; no random in combat.
 for(let i=0;i<22;i++){const y=18+i*22,a=.07+.09*i/22,rad=41-27*i/22,x=96+Math.sin(i*2.13)*18*(1-i/22);const grad=q.createRadialGradient(x-4,y-3,1,x,y,rad);grad.addColorStop(0,'rgba(187,185,172,'+a+')');grad.addColorStop(.55,'rgba(118,121,116,'+a*.8+')');grad.addColorStop(1,'rgba(97,101,96,0)');q.fillStyle=grad;q.fillRect(x-rad,y-rad,rad*2,rad*2);}

 const textures={body:P.Texture.from(body),plume:P.Texture.from(plume),halo:P.Texture.from(halo),smoke:P.Texture.from(smoke)};shellCache.set(type,textures);return textures;
}
function makeShell(P,type,layer,salvo,shellCache){
 const tex=shellTextures(P,type,shellCache),root=new P.Container(),body=new P.Sprite(tex.body),plume=new P.Sprite(tex.plume),halo=new P.Sprite(tex.halo),smoke=new P.Sprite(tex.smoke);
 body.anchor.set(.5);plume.anchor.set(.5,1);smoke.anchor.set(.5,1);halo.anchor.set(.5);
 halo.blendMode=plume.blendMode=P.BLEND_MODES.ADD;body.alpha=.38;
 root.addChild(smoke,halo,plume,body);layer.addChild(root);return{root,body,plume,halo,smoke,salvo};
}

export class RhodesFireSystem{
 constructor(ctx){this.ctx=ctx;this.shellCache=new Map();this.salvos=[];this.rocketNodes=[];this.rocketLayer=new ctx.P.Container();ctx.layers.fxAdd.addChild(this.rocketLayer);this.ground=new ctx.P.Graphics();this.air=new ctx.P.Graphics();this.ground.blendMode=ctx.P.BLEND_MODES.NORMAL;this.air.blendMode=ctx.P.BLEND_MODES.ADD;ctx.layers.groundFx.addChild(this.ground);ctx.layers.fxAdd.addChild(this.air);}
 salvo(ex){if(!Array.isArray(ex.locks))return;this.salvos.push({locks:ex.locks,r:ex.r,tier:ex.tier,age:0,dur:ex.t||.5});if(this.salvos.length>32){const removed=this.salvos.shift();for(const n of removed.rockets||[])n.root.destroy({children:true,texture:false,baseTexture:false});this.rocketNodes=this.rocketNodes.filter(n=>n.salvo!==removed);}}
 mark(ex){if(!Number.isFinite(ex.x)||!Number.isFinite(ex.y))return;if(!this.marks)this.marks=[];this.marks=this.marks.filter(v=>v.id!==ex.id);this.marks.push({id:ex.id,x:ex.x,y:ex.y,age:0,dur:Math.min(3,Math.max(.1,ex.t||1))});if(this.marks.length>128)this.marks.shift();}
 impact(){}
 hitAt(){}
 z(x,y){return this.ctx.heightAt?.(Math.round(y),Math.round(x))||0;}
 reticle(l,s,t){
  const g=this.ground,cam=this.ctx.cam(),z=this.z(l.x,l.y)+.025,col=RI_FIRE_COLORS[l.type],p=cam.project(l.x,l.y,z),tier=s.tier>=3,alpha=.58+.16*t;
  const point=(a,r=s.r)=>cam.project(l.x+Math.cos(a)*r,l.y+Math.sin(a)*r,z);
  const arc=(a,b,r,width,color,opacity)=>{g.lineStyle(Math.max(1,p.s*width),color,opacity);const n=Math.max(4,Math.ceil((b-a)*14));for(let i=0;i<=n;i++){const q=point(a+(b-a)*i/n,r);if(i===0)g.moveTo(q.x,q.y);else g.lineTo(q.x,q.y);}};
  arc(0,Math.PI*2,s.r,.009,0xa4c7d2,.3);
  const parts=tier?6:4;
  for(let i=0;i<parts;i++){const a=i*Math.PI*2/parts,b=a+Math.PI*2/parts;
   arc(a+.1,b-.16,s.r,tier?.024:.020,col,alpha);
   const q=point(a,s.r*.97),v=point(a,s.r*1.045);g.lineStyle(Math.max(1.2,p.s*.017),col,.88).moveTo(q.x,q.y).lineTo(v.x,v.y);
   if(tier)arc(a+.25,a+.55,s.r*.91,.010,col,.48);
  }
  g.lineStyle(Math.max(1.1,p.s*.014),col,.92);
  const d=p.s*.055;g.moveTo(p.x,p.y-d*.65).lineTo(p.x+d,p.y).lineTo(p.x,p.y+d*.65).lineTo(p.x-d,p.y).lineTo(p.x,p.y-d*.65);
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const c=Math.cos(a),h=Math.sin(a)*.65;g.moveTo(p.x+c*d*1.6,p.y+h*d*1.6).lineTo(p.x+c*d*2.5,p.y+h*d*2.5);}
 }

 update(dt){const step=Math.max(0,dt)*(Number(this.ctx.timeScale?.())||1),cam=this.ctx.cam();this.ground.clear();this.air.clear();
  for(const m of this.marks||[]){m.age+=step;if(m.age>=m.dur)continue;const p=cam.project(m.x,m.y,this.z(m.x,m.y)+.03),g=this.ground,d=p.s*.11,a=.7*(1-m.age/m.dur);g.lineStyle(Math.max(1.2,p.s*.015),0xa8dbe3,a);for(const sx of [-1,1])for(const sy of [-1,1])g.moveTo(p.x+sx*d,p.y+sy*d*.25).lineTo(p.x+sx*d,p.y+sy*d*.55).lineTo(p.x+sx*d*.45,p.y+sy*d*.55);}
  this.marks=(this.marks||[]).filter(m=>m.age<m.dur);
  const warnings=new Set();for(const s of this.salvos){s.age+=step;if(s.age>=s.dur)continue;const t=Math.min(1,s.age/s.dur),fall=riShellProgress(t);
   for(const l of s.locks){const col=RI_FIRE_COLORS[l.type]||RI_FIRE_COLORS.phys,p=cam.project(l.x,l.y,this.z(l.x,l.y)+.04);
    const key=l.x+':'+l.y+':'+s.r;if(!warnings.has(key)){warnings.add(key);this.reticle(l,s,t);}

    const angle=(RI_FIRE_ANGLES[l.type]||12)*Math.PI/180,height=p.s*(s.tier>=3?2.8:2.5),dy=height*(1-fall),dx=dy*Math.tan(angle),x=p.x-dx,y=p.y-dy;

    const size=s.tier>=3?1.18:1,bodyW=p.s*.095*size,bodyL=p.s*.30*size;
    const li=s.locks.indexOf(l);if(!s.rockets)s.rockets=[];if(!s.rockets[li]){s.rockets[li]=makeShell(this.ctx.P,l.type,this.rocketLayer,s,this.shellCache);this.rocketNodes.push(s.rockets[li]);}
    const n=s.rockets[li];n.root.position.set(x-Math.sin(angle)*bodyL*.5,y-Math.cos(angle)*bodyL*.5);n.root.rotation=-angle;
    n.body.width=bodyW*128/60;n.body.height=bodyL*320/276;
    const rear=bodyL*.5;
    n.plume.position.set(0,rear);n.plume.width=p.s*.37*size*(1+.025*Math.sin(s.age*57+li));n.plume.height=p.s*(1.08+.23*t)*size;n.plume.alpha=.92;
    n.halo.position.set(0,bodyL*.25);n.halo.width=p.s*.25*size;n.halo.height=p.s*.35*size;n.halo.alpha=.6;
    n.smoke.position.set(0,rear-p.s*.64*size);n.smoke.width=p.s*.35*size;n.smoke.height=p.s*.65*size;n.smoke.alpha=.22;
    // Short isolated embers move along the wake. Their shape and placement never touch simulation RNG.
    for(let i=0;i<(s.tier>=3?5:3);i++){const f=(t*1.8+i*.23)%1,dist=p.s*(.32+.93*f)*size,side=Math.sin(i*3.7+li)*p.s*(.025+.075*f)*size,ax=Math.sin(angle),ay=Math.cos(angle),xx=x-ax*dist+ay*side,yy=y-ay*dist-ax*side;
     this.air.lineStyle(Math.max(1.2,p.s*.013*size),col,.8*(1-f)).moveTo(xx,yy).lineTo(xx-ax*p.s*.065,yy-ay*p.s*.065);
    };

   }
  }this.salvos=this.salvos.filter(s=>s.age<s.dur);
  this.rocketNodes=this.rocketNodes.filter(n=>{if(n.salvo.age>=n.salvo.dur){n.root.destroy({children:true,texture:false,baseTexture:false});return false;}return true;}); }
 clear(){for(const n of this.rocketNodes)n.root.destroy({children:true,texture:false,baseTexture:false});this.rocketNodes=[];this.salvos=[];this.marks=[];this.ground.clear();this.air.clear();}
 destroy(){this.clear();this.ground.destroy();this.air.destroy();this.rocketLayer.destroy({children:true,texture:false,baseTexture:false});for(const set of this.shellCache.values())for(const texture of Object.values(set))texture.destroy(true);this.shellCache.clear();}
}
