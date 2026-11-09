// Snapshot-driven overlays: reconnects and perspective changes reconstruct flowers without replaying hit events.
export class IberiaEffects{
 constructor(ctx){this.ctx=ctx;this.rows=[];this.owner=null;this.g=new ctx.P.Graphics();this.g.eventMode='none';ctx.layers.unitFrontFx.addChild(this.g);this.beam=new ctx.P.Graphics();this.beam.eventMode='none';(ctx.layers.overlay||ctx.layers.unitFrontFx).addChild(this.beam);this.petals=0;this.runes=0;this.clock=0;this.scanAt=null;this.lastLight=null;this.lastOwner=null;}
 set(rows,time=this.clock){
  this.rows=Array.isArray(rows)?rows:[];const changed=this.lastOwner!==this.owner||time<this.clock;this.clock=Number.isFinite(time)?time:this.clock;
  const state=this.rows.find(s=>s.playerId===this.owner),n=state?.metrics?.lights===undefined?undefined:state.metrics.lights+(state.sunPulseCount||0);
  if(changed||!Number.isFinite(n)){this.scanAt=null;this.lastLight=null;this.lastOwner=this.owner;}
  if(Number.isFinite(n)){if(this.lastLight!==null&&n>this.lastLight)this.scanAt=this.clock;this.lastLight=n;}
 }
 get scanActive(){return this.scanAt!==null&&this.clock-this.scanAt>=0&&this.clock-this.scanAt<1.2;}
 update(views){const g=this.g;g.clear();this.beam.clear();this.petals=0;this.runes=0;
  if(this.scanActive){const {width:w,height:h}=this.ctx.viewport?.()||{width:1,height:1},t=(this.clock-this.scanAt)/1.2,angle=-1.25+t*1.4,x=w*.10,y=h*.72,r=Math.hypot(w,h)*1.2,alpha=Math.sin(Math.PI*t),low=this.ctx.settings?.quality==='low',p=a=>[x+Math.cos(a)*r,y+Math.sin(a)*r];
   if(!low){this.beam.beginFill(0x8ddbe9,.065*alpha);this.beam.drawPolygon([x,y,...p(angle-.045),...p(angle+.045)]);this.beam.endFill();}
   this.beam.lineStyle(low?1:2,0xb7f2f5,.24*alpha);this.beam.moveTo(x,y);this.beam.lineTo(...p(angle));
  }
  const anchor=id=>{const v=views.get(id);return v?.alive&&v.alpha>.01&&!v.hidden&&v.root?.visible!==false?{v,x:v.screen.x,y:v.screen.y,s:v.screen.s}:null;};
  for(const state of this.rows){if(state.playerId!==this.owner)continue;for(const[id,n]of state.marks||[]){const a=anchor(id);if(!a)continue;const x=a.x,y=a.y-a.s*.86,r=Math.max(3,Math.min(5,a.s*.06)),ring=r*1.15;
   g.lineStyle(1,0x9ceaff,.95);for(let i=0;i<Math.min(5,n);i++){const angle=-Math.PI/2+i*Math.PI*2/5,cx=x+Math.cos(angle)*ring,cy=y+Math.sin(angle)*ring,pts=[];for(let j=0;j<16;j++){const t=j*Math.PI/8,radial=Math.cos(t)*r,tangent=Math.sin(t)*r*.48;pts.push(cx+Math.cos(angle)*radial-Math.sin(angle)*tangent,cy+Math.sin(angle)*radial+Math.cos(angle)*tangent);}g.beginFill(n===5?0x3fa9ff:0x2179d0,.96);g.drawPolygon(pts);g.endFill();this.petals++;}g.lineStyle(0);g.beginFill(0xc4f5ff,1);g.drawCircle(x,y,r*.25);g.endFill();
  }}
  const seen=new Set();for(const state of this.rows.filter(s=>s.playerId===this.owner))for(const[id,left,_boss,_serial]of state.pending||[]){if(seen.has(id))continue;seen.add(id);const a=anchor(id);if(!a)continue;const r=Math.max(13,a.s*.25),x=a.x,y=a.y-a.s*.34,progress=Math.max(0,Math.min(1,1-left));g.lineStyle(Math.max(1.5,a.s*.018),0x65cfff,.5+.4*progress);g.drawCircle(x,y,r);g.lineStyle(1.5,0xa1e7ff,.9);const points=5;for(let i=0;i<points;i++){const t=-Math.PI/2+i*Math.PI*2/points,xx=x+Math.cos(t)*r*.7,yy=y+Math.sin(t)*r*.7;g.moveTo(xx,yy-r*.2);g.lineTo(xx+r*.12,yy);g.lineTo(xx-r*.12,yy);g.lineTo(xx,yy+r*.2);}g.moveTo(x,y-r*1.2);g.lineTo(x,y+r*1.2);g.moveTo(x-r*.42,y-r*.45);g.lineTo(x+r*.42,y-r*.45);this.runes++;}
 }
 clear(){this.rows=[];this.g.clear();this.beam.clear();this.petals=this.runes=0;this.lastLight=null;this.scanAt=null;this.lastOwner=null;this.clock=0;}
 destroy(){this.clear();this.g.destroy();this.beam.destroy();}
}
