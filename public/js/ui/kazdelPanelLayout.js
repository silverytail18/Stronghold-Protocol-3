const overlaps=(a,b,gap=8)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
/** Prefer the right middle, inset left of the effects column; hide if occupied. */
export function kazdelPanelPlacement(frame,size,obstacles=[]){
 const gap=12,width=Math.min(size.width,frame.width-2*gap),height=size.height;
 const xs=[frame.left+frame.width-width-82,frame.left+frame.width-width-110];
 // Wide HUD counters can extend beyond the fixed insets. Keep the card in the
 // right half while allowing it to sit immediately left of a measured panel.
 xs.push(...obstacles.map(b=>b.left-width-8).filter(x=>x>=frame.left+frame.width*.5&&x<xs[0]).sort((a,b)=>b-a));
 for(const fraction of [.46,.34,.58])for(const x of xs){
  const left=Math.max(frame.left+gap,x),top=frame.top+frame.height*fraction-height/2;
  const r={left,right:left+width,top,bottom:top+height};
  if(r.top<frame.top+gap||r.bottom>frame.top+frame.height-gap)continue;
  if(!obstacles.some(b=>overlaps(r,b)))return{left:left-frame.left,top:top-frame.top};
 }
 return null;
}
