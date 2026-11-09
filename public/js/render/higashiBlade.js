// Hand-drawn blade ribbons in projected world space; cosmetic only, no textures or simulation RNG.
export class HigashiBladeSystem{
 constructor(ctx){this.ctx=ctx;this.effects=[];this.g=new ctx.P.Graphics();(ctx.layers.unitFrontFx||ctx.layers.fxNormal).addChild(this.g);}
 emit(kind,ex){if(!Number.isFinite(ex.x)||!Number.isFinite(ex.y))return;this.effects.push({...ex,kind,age:kind==='higashiUltimate'?Math.max(0,Math.min(.85,Number(ex.age)||0)):0,dur:kind==='higashiUltimate'?.85:kind==='higashiWind'?.36:.48});if(this.effects.length>64)this.effects.shift();}
 update(dt){const rate=this.ctx.timeScale?.(),step=Math.max(0,dt)*(Number.isFinite(rate)?Math.max(0,rate):1),g=this.g,cam=this.ctx.cam();g.clear();
  for(const e of this.effects){e.age+=step;if(e.age>=e.dur)continue;if(e.kind==='higashiUltimate'){this.ultimate(e);continue;}if(e.kind==='higashiInsight'){this.insight(e);continue;}const t=Math.max(0,e.age-.06)/(e.dur-.06),back=e.kind==='higashiReturn',wind=e.kind==='higashiWind';
   const v=this.ctx.view?.(e.id),src=this.ctx.view?.(e.src),x=v&&!v.destroyed?v.x:e.x,y=v&&!v.destroyed?v.y:e.y;
   const z=(v?.z??this.ctx.heightAt?.(Math.round(y),Math.round(x))??0)+(v?.hover??(e.air?.9:0))+.65;
   const p=cam.project(x,y,z),sx=src?.x??e.fromX??x-.7,sy=src?.y??e.fromY??y;
   const a=cam.project(sx,sy,(src?.z??this.ctx.heightAt?.(Math.round(sy),Math.round(sx))??0)+(src?.hover||0)+.65);
   const angle=wind?-.9:Math.atan2(p.y-a.y,p.x-a.x)+(back?-.35:.35),c=Math.cos(angle),s=Math.sin(angle),scale=p.s*(wind?.83:1.17),alpha=Math.min(1,e.age/.035)*Math.pow(1-t,1.1);
   const color=wind?0xb9e8f1:back?0x9ed9ee:0xffd78f,edge=back||wind?0x4a839f:0xa95336;
   const point=(xx,yy)=>[p.x+(xx*c-yy*s)*scale,p.y+(xx*s+yy*c)*scale];
   if(t<.42){const k=Math.min(1,t/.20),tail=Math.max(0,k-.68);g.lineStyle(Math.max(1,p.s*.045),edge,alpha*.45);g.moveTo(a.x+(p.x-a.x)*tail,a.y+(p.y-a.y)*tail);g.lineTo(a.x+(p.x-a.x)*k,a.y+(p.y-a.y)*k);g.lineStyle(Math.max(.8,p.s*.014),0xfffbeb,alpha);g.moveTo(a.x+(p.x-a.x)*tail,a.y+(p.y-a.y)*tail);g.lineTo(a.x+(p.x-a.x)*k,a.y+(p.y-a.y)*k);}
   const sweep=Math.min(1,t/.3),start=-1.25+(back?.2:0),end=start+2.75*sweep,sign=back?-1:1;
   const ribbon=(thickness,tint,opacity)=>{const outer=[],inner=[];for(let i=0;i<=18;i++){const u=i/18,theta=start+(end-start)*u,r=.68+.10*u,w=thickness*Math.sin(Math.PI*u)**.7;outer.push(...point(Math.cos(theta)*(r+w),sign*Math.sin(theta)*(r+w)*.72));inner.push(...point(Math.cos(theta)*(r-w),sign*Math.sin(theta)*(r-w)*.72));}const inside=[];for(let i=inner.length-2;i>=0;i-=2)inside.push(inner[i],inner[i+1]);g.lineStyle(0);g.beginFill(tint,alpha*opacity);g.drawPolygon([...outer,...inside]);g.endFill();};
   // Dark copper/ink edge, coloured blade face, thin ivory cutting edge.
   ribbon(.15,edge,.72);ribbon(.094,color,.95);ribbon(.028,0xfffcf1,1);
   for(let j=0;j<3;j++){const q=point(.12+j*.16,-.05+j*.08),k=Math.max(0,1-t*1.8);g.lineStyle(Math.max(.7,p.s*.013),0xfff9e6,alpha*k);g.moveTo(q[0],q[1]);g.lineTo(q[0]+p.s*(.12+j*.05),q[1]-p.s*(.07+j*.04));}
   if(t<.55){const q=point(.12,-.05);g.lineStyle(Math.max(.7,p.s*.012),color,alpha*.8);g.moveTo(q[0]-p.s*.14,q[1]+p.s*.08);g.lineTo(q[0]+p.s*.19,q[1]-p.s*.1);}
  }this.effects=this.effects.filter(e=>e.age<e.dur);
 }
 insight(e){const g=this.g,cam=this.ctx.cam(),v=this.ctx.view?.(e.id),x=v?.x??e.x,y=v?.y??e.y,z=(v?.z??this.ctx.heightAt?.(Math.round(y),Math.round(x))??0)+(v?.hover||0)+.7,p=cam.project(x,y,z),t=e.age/e.dur,a=Math.max(0,1-t),r=p.s*(.3+t*.08);
  for(let j=0;j<Math.min(12,e.cuts||0);j++){const angle=j*Math.PI/6-Math.PI/2,c=Math.cos(angle),s=Math.sin(angle);g.lineStyle(Math.max(1,p.s*.014),e.burst?0xfdf9ed:0xc7e6ec,a*.9);g.moveTo(p.x+c*r,p.y+s*r);g.lineTo(p.x+c*(r+p.s*(e.burst?.09:.045)),p.y+s*(r+p.s*(e.burst?.09:.045)));}
 }
 ultimate(e){const g=this.g,size=this.ctx.screenSize?.()||{width:1000,height:600},w=size.width,h=size.height,t=e.age/.85;
  // Original white-night preview: -17° white main cut, +12° hairline and a soft pale-blue halo.
  const alpha=t<.14?Math.min(1,t/.14):t<.4?1:Math.max(0,(1-t)/.6),drift=t<.14?-.16*(1-t/.14):t<.4?.02*(t-.14)/.26:.02+.07*(t-.4)/.6;
  const cut=(y,angle,width,color,opacity)=>{const dx=w*.8,dy=Math.tan(angle*Math.PI/180)*dx,x=w*(.5+drift);for(let j=0;j<32;j++){const u=j/32,v=(j+1)/32,fade=Math.sin(Math.PI*(u+v)/2)**.7;g.lineStyle(width,color,alpha*opacity*fade);g.moveTo(x+(u*2-1)*dx,y+(u*2-1)*dy);g.lineTo(x+(v*2-1)*dx,y+(v*2-1)*dy);}};
  cut(h*.4,-17,24,0xdcefff,.035);cut(h*.4,-17,13,0xdcefff,.065);cut(h*.4,-17,7,0xdcefff,.12);
  cut(h*.54,12,1,0xc5dcef,.6);cut(h*.4,-17,3,0xe6f3ff,.88);cut(h*.4,-17,1.3,0xfffff7,1);
  this.fracture(e,w,h);
 }
 fracture(e,w,h){
  if(e.age<.18)return;const g=this.g,t=Math.min(1,(e.age-.18)/.67),grow=Math.min(1,t/.25),fade=Math.min(1,t/.055)*Math.pow(1-t,1.15),cx=w*.5,cy=h*.4,span=Math.hypot(w,h);
  // Short local impact flash; the actual world/camera and all HUD layers stay still.
  const flash=Math.max(0,1-Math.abs(e.age-.35)/.045)*.07;
  if(flash){g.lineStyle(0);g.beginFill(0xeaf7ff,flash);g.drawPolygon([0,0,w,0,w,h,0,h]);g.endFill();}
  const segment=(a,b,width,color,alpha)=>{g.lineStyle(width,color,Math.max(0,Math.min(1,alpha)));g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);};
  const angles=[-2.94,-2.28,-1.68,-1.03,-.34,.34,.96,1.62,2.40];
  for(let j=0;j<angles.length;j++){
   const angle=angles[j],dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,length=span*(.22+(j%3)*.045),nodes=[[cx,cy]];
   for(let k=1;k<=3;k++){const q=k/3,jag=(k%2?1:-1)*(j%2?1:-1)*Math.min(18,h*.035);nodes.push([cx+dx*length*q*grow+nx*jag*grow,cy+dy*length*q*grow+ny*jag*grow]);}
   for(let k=0;k<3;k++){segment(nodes[k],nodes[k+1],3.1,0x223644,fade*.55);segment(nodes[k],nodes[k+1],1.15,0xf4fcff,fade*(.92-k*.14));}
   for(const k of [1,2]){const a=nodes[k],turn=angle+(j%2?1:-1)*(.5+k*.12),n=length*(k===1?.20:.13)*grow,b=[a[0]+Math.cos(turn)*n,a[1]+Math.sin(turn)*n];segment(a,b,.8,0xd7eef5,fade*.62);}
   // Small glass facets drift away from the fracture, with ivory rims and transparent faces.
   if(j%2===0&&t>.13){const a=nodes[2],drift=(t-.13)*Math.min(36,h*.065),x=a[0]+dx*drift,y=a[1]+dy*drift,sh=Math.min(12,h*.024)*(1-t*.35),poly=[x,y,x+nx*sh+dx*sh*.4,y+ny*sh+dy*sh*.4,x+dx*sh*1.65,y+dy*sh*1.65];g.lineStyle(.7,0xf0fbff,fade*.58);g.beginFill(0xcbe8f5,fade*.12);g.drawPolygon(poly);g.endFill();}
  }
 }
 clear(){this.effects=[];this.g.clear();}
 destroy(){this.clear();this.g.destroy();}
 get count(){return this.effects.length;}
}
