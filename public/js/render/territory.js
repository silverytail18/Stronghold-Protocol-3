// Presentation-only fixed Ursus domains. Owners are never added together; prep coordinates use the board transform.
export class TerritoryOverlay {
  constructor(P,ground,text,heightAt){this.P=P;this.heightAt=heightAt;this.fill=new P.Graphics();ground.addChild(this.fill);this.labels=new P.Container();text.addChild(this.labels);this.rows=[];this.signature='';this.camera=null;this.cameraVersion=-1;this.transform=null;this.owner=null;}
  set(rows){const clean=(rows||[]).map(row=>({playerId:row.playerId,cells:(row.cells||[]).filter(c=>Array.isArray(c)&&c.length===3&&c.every(Number.isFinite)&&c[0]>=0&&c[0]<19&&c[1]>=0&&c[1]<21&&c[2]>=1&&c[2]<=6)}));const key=JSON.stringify(clean);if(key===this.signature)return;this.signature=key;this.rows=clean;this.cameraVersion=-1;}
  clear(){this.set([]);this.fill.clear();this.labels.removeChildren().forEach(e=>e.destroy());}
  project(cam,transform,playerId){
    if(this.camera===cam&&this.cameraVersion===cam.version&&this.transform===transform&&this.owner===playerId)return;
    this.camera=cam;this.cameraVersion=cam.version;this.transform=transform;this.owner=playerId;
    const row=this.rows.find(r=>r.playerId===playerId)||this.rows[0],cells=row?.cells||[],colours=[0,0x4aa6a0,0x51b68b,0xaac46b,0xe6bd5b,0xef9a52,0xf57460];
    this.fill.clear();while(this.labels.children.length>cells.length)this.labels.removeChildAt(this.labels.children.length-1).destroy();
    this.labels.children.forEach(label=>{label.visible=false;});
    cells.forEach(([r,c,k],i)=>{
      const d=transform?.toDisp(r,c)||{row:r,col:c};r=d.row;c=d.col;if(r<0||r>=19||c<0||c>=21)return;const z=this.heightAt(r,c)+.025;
      const points=[[-.48,-.48],[.48,-.48],[.48,.48],[-.48,.48]].map(([dx,dy])=>cam.project(c+dx,r+dy,z));
      this.fill.lineStyle(1,colours[k],.7).beginFill(colours[k],.10+.025*k).drawPolygon(points.flatMap(p=>[p.x,p.y])).endFill();
      let label=this.labels.children[i];if(!label){label=new this.P.Text(String(k),{fontFamily:'Bender, sans-serif',fontSize:13,fontWeight:'bold',fill:0xffffff,stroke:0x132321,strokeThickness:3});label.anchor.set(.5);this.labels.addChild(label);}label.text=String(k);const p=cam.project(c+.24,r-.22,z+.02);label.position.set(p.x,p.y);label.scale.set(Math.max(.8,Math.min(1.25,p.s/48)));label.visible=true;
    });
  }
  destroy(){this.fill.destroy();this.labels.destroy({children:true});}
}
