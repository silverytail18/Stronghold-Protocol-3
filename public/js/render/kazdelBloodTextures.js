// Shared approved procedural shape, rendered once per cached animation frame. No HTTP or combat RNG.
export function createBloodTextureCanvas(kind,frame){
const SCALE=3;
const ARC_CX=-74,ARC_CY=0,ARC_R2=ARC_CX**2+ARC_CY**2;
const frontX=f=>ARC_CX+Math.sqrt(Math.max(0,ARC_R2-(-74+74*f-ARC_CY)**2));
function makeSurface(){const image=document.createElement('canvas');image.width=190*SCALE;image.height=125*SCALE;const c=image.getContext('2d');c.scale(SCALE,SCALE);c.translate(135,90);return{image,c};}
const n=(a,b=0)=>.5+.5*Math.sin(a*12.9898+b*4.731+Math.sin(a*1.31)*3.17);
function gradient(c,colors,x0=-110,y0=0,x1=8,y1=0){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [f,color]of colors)g.addColorStop(f,color);return g;}
function curve(c,points,color,width,blur=0,alpha=1){c.save();c.globalAlpha*=alpha;c.filter=blur?`blur(${blur*SCALE}px)`:'none';c.strokeStyle=color;c.lineWidth=width;c.lineCap='butt';c.lineJoin='round';c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i+=3)c.bezierCurveTo(...points[i],...points[i+1],...points[i+2]);c.stroke();c.restore();}
function wash(c,path,fill,blur=0,alpha=1){c.save();c.globalAlpha*=alpha;c.filter=blur?`blur(${blur*SCALE}px)`:'none';c.fillStyle=fill;c.beginPath();path(c);c.fill();c.restore();}
function disc(c,x,y,rx,ry,color){c.save();c.translate(x,y);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color);g.addColorStop(1,'rgba(255,70,35,0)');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();}
function swordTexture(frame){
 const{image,c}=makeSurface(),t=frame/24;
 const outer=p=>{p.moveTo(frontX(0),-74);p.lineTo(-114,-74);p.lineTo(-124,-47);p.bezierCurveTo(-81,-43,-89,-14,-126,-8);p.bezierCurveTo(-77,-8,-48,1,0,0);for(let i=96;i>=0;i--){const f=i/96;p.lineTo(frontX(f),-74+74*f);}p.closePath();};
 const red=gradient(c,[[0,'rgba(135,0,21,0)'],[.2,'rgba(138,3,26,.13)'],[.5,'rgba(177,5,26,.46)'],[.8,'rgba(255,18,30,.72)'],[1,'rgba(255,133,92,.64)']]);
 wash(c,outer,red,2.4,.45);wash(c,outer,red,.28,.83);
 c.save();c.beginPath();outer(c);c.clip();
 // Continuous translucent red flow: no red outlines, speed strokes, or hard strip boundaries.
 for(let i=0;i<7;i++){
  const yy=-58+i*7.0,start=-117+8*n(i),bend=2*Math.sin(t*9+i*.8);
  const sheet=p=>{p.moveTo(start,yy+4);p.bezierCurveTo(-76,yy-8+bend,-32,yy-5,-4,yy+8);p.lineTo(-8,yy+16);p.bezierCurveTo(-34,yy+2,-76,yy+2,start,yy+8);p.closePath();};
  wash(c,sheet,gradient(c,[[0,'rgba(90,0,20,0)'],[.25,'rgba(104,1,19,.10)'],[.6,'rgba(175,4,24,.23)'],[.88,'rgba(255,30,26,.38)'],[1,'rgba(255,102,69,.25)']]),1.4,.74);
 }
 c.restore();
 // A wide red -> orange -> pale gold -> white transition joins the tail to the blade.
 const join=p=>{p.moveTo(frontX(0)-24,-74);p.lineTo(frontX(0),-74);for(let i=1;i<=64;i++){const f=i/64;p.lineTo(frontX(f),-74+74*f);}for(let i=63;i>=0;i--){const f=i/64;p.lineTo(frontX(f)-24*Math.pow(1-f,.6),-74+74*f);}p.closePath();};
 wash(c,join,gradient(c,[[0,'rgba(224,10,26,0)'],[.25,'rgba(245,25,27,.38)'],[.52,'rgba(255,95,48,.64)'],[.72,'rgba(255,190,100,.82)'],[.88,'rgba(255,243,199,.94)'],[1,'rgba(255,254,238,1)']],-29,-30,8,-30),.8,.92);
 // No gold filaments inside the sword: only the continuous blade gradient remains.
 // The whole curved blade is a crosswise gradient, not a separate solid-white crescent.
 const stops=[[0,[200,7,25,0]],[.18,[222,14,26,.25]],[.42,[246,43,30,.74]],[.64,[255,116,54,.88]],[.82,[255,207,129,.95]],[1,[255,253,233,1]]];
 const tint=q=>{let k=1;while(k<stops.length-1&&stops[k][0]<q)k++;const[a,A]=stops[k-1],[b,B]=stops[k],f=(q-a)/(b-a);return A.map((x,i)=>x+(B[i]-x)*f);};
 const bladeLayer=document.createElement('canvas');bladeLayer.width=image.width;bladeLayer.height=image.height;const bc=bladeLayer.getContext('2d'),pixels=bc.createImageData(image.width,image.height);
 // A true circular leading edge; thin pointed ends provide the cutting impression.
 for(let py=16*SCALE;py<90*SCALE;py++){const yy=(py+.5)/SCALE-90,f=(yy+74)/74,af=.12+.88*f,x=frontX(f),w=(8+22*Math.sin(Math.PI*af)**.65)*Math.min(1,af*15)*Math.min(1,(1-af)*10);if(!(w>0))continue;
  const left=x-w;for(let px=Math.max(0,Math.floor((left+135)*SCALE));px<Math.ceil((x+135)*SCALE);px++){const xx=(px+.5)/SCALE-135,q=(xx-left)/w;if(q<0||q>1)continue;const v=tint(q),edge=Math.min(1,q*w*SCALE,(1-q)*w*SCALE),at=(py*image.width+px)*4;pixels.data[at]=v[0];pixels.data[at+1]=v[1];pixels.data[at+2]=v[2];pixels.data[at+3]=255*v[3]*edge;}
 }
 bc.putImageData(pixels,0,0);c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(bladeLayer,0,0);c.restore();
 disc(c,0,-2,10,6,'rgba(255,230,161,.26)');disc(c,0,0,18,6,'rgba(255,60,28,.19)');
 // Short ground skim only at the lower tip; its endpoint is exactly local (0,0).
 disc(c,-13,0,22,2.3,'rgba(238,27,28,.23)');
 for(let i=0;i<5;i++){const f=(t*2.7+n(i))%1,xx=-3-f*26,yy=-Math.sin(f*Math.PI)*(1+i%3)*2;disc(c,xx,yy,.35,.25,'rgba(255,211,146,.45)');}
 return image;
}
function vortexTexture(frame){
 const{image,c}=makeSurface(),t=frame/30,turn=t*10.5;
 disc(c,0,-5,42,26,'rgba(245,18,36,.21)');
 const point=(angle,r)=>[Math.cos(angle)*r,Math.sin(angle)*r*.58-5];
 // Layered, tapering sheets of blood-red wind. Most of the ring remains transparent.
 for(let j=0;j<12;j++){
  const start=turn+j*.153,span=2.5+1.1*n(j),r=22+7*n(j+20),outer=[],inner=[];
  for(let i=0;i<=70;i++){const f=i/70,a=start+f*span,rr=r+1.8*Math.sin(f*5+j);outer.push(point(a,rr));inner.push(point(a,rr-(3+7*Math.sin(f*Math.PI))));}
  const p=q=>{q.moveTo(...outer[0]);outer.slice(1).forEach(v=>q.lineTo(...v));inner.reverse().forEach(v=>q.lineTo(...v));q.closePath();};
  wash(c,p,gradient(c,[[0,'rgba(114,1,26,.12)'],[.4,'rgba(229,8,33,.26)'],[.8,'rgba(255,63,46,.36)'],[1,'rgba(255,135,88,.12)']],-35,0,35,0),.8,.56);
 }
 function arcPoints(start,span,r){const p=[];for(let i=0;i<=72;i++)p.push(point(start+span*i/72,r));return p;}
 function arcStroke(points,color,width,blur,alpha){c.save();c.globalAlpha*=alpha;c.filter=blur?`blur(${blur*SCALE}px)`:'none';c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.restore();}
 // Inward flowing ribbons fill the volume and break the circular outline into a real whirl.
 for(let j=0;j<16;j++){
  const points=[];for(let i=0;i<=90;i++){const f=i/90,a=turn+j*.075+f*4.1,r=30*(1-f*.87)+1.5*Math.sin(f*11+j);points.push([Math.cos(a)*r,Math.sin(a)*r*.62-5-7*Math.sin(f*Math.PI)]);}
  arcStroke(points,'#d60625',3.4+2*n(j),1.2,.22);arcStroke(points,'#ff3639',1.3,.6,.20);
 }
 for(let j=0;j<2;j++){
  const p=arcPoints(turn+j*2.05,2.85,24+j*2);
  arcStroke(p,'#ff2437',5.0,2.1,.27);arcStroke(p,'#f12739',1.9,.65,.39);
  const gold=arcPoints(turn+j*2.05+.8,1.1,21+j*2);
  arcStroke(gold,'#ffbb60',2.4,1.1,.26);arcStroke(gold,'#ffe5a8',.72,.3,.66);
 }
 const inner=[];for(let i=0;i<=42;i++){const f=i/42,a=turn+1.2+f*1.6,r=19-11*f;inner.push([Math.cos(a)*r,Math.sin(a)*r*.62-5-6*Math.sin(f*Math.PI)]);}arcStroke(inner,'#ffb45d',2.1,.9,.3);arcStroke(inner,'#ffe4a4',.68,.3,.61);
 // One short hot leading edge, with a glowing tip; no uniform gold outline.
 const leading=arcPoints(turn+3.45,.70,29);arcStroke(leading,'#ff6b33',7,2,.55);arcStroke(leading,'#ffdca2',4,.8,.84);arcStroke(leading,'#fffbea',2.1,.4,.95);
 const tip=leading.at(-1);disc(c,...tip,8,6,'rgba(255,236,185,.58)');
 for(let i=0;i<11;i++){const p=point(turn+i*1.39,30+9*n(i,t));disc(c,p[0],p[1],1.4,1,i%3?'rgba(255,49,39,.36)':'rgba(255,209,121,.40)');}
 return image;
}

return kind==='sword'?swordTexture(frame):vortexTexture(frame);
}
