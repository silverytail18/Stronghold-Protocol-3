// Pure artillery damage curve, shared by simulation and the live bond description.
export const RHODES_FIRE_BASE_BONUS=400;
export const RHODES_FIXED_ATK=Object.freeze([.08,.12]);
export const RHODES_REFERENCE_ATK=8000;
// Convert the approved middle-game ATK ramp into intrinsic damage at A=8000.
export const RHODES_TRANSFER_POINTS=Object.freeze([
 [[0,0],[100,0],[150,0],[200,320],[300,1120],[400,1920],[500,2560],[650,3200],[800,3360],[999,3360]],
 [[0,0],[100,0],[150,0],[200,320],[300,1600],[400,3040],[500,4480],[650,6080],[800,7040],[999,7040]]
].map(a=>Object.freeze(a.map(Object.freeze))));
export const RHODES_CURVE_POINTS=Object.freeze([[150,324.907],[200,406.134],[220,438.624],[260,568.587],[300,828.513],[400,2046.914],[500,4077.583],[600,6920.520],[700,10575.724],[800,15043.195],[900,20322.934],[999,26350]].map(Object.freeze));
const points=RHODES_CURVE_POINTS,n=points.length;
const h=points.slice(1).map((p,i)=>p[0]-points[i][0]);
const secants=points.slice(1).map((p,i)=>(p[1]-points[i][1])/h[i]);
const reduction=1-points[0][1]/400,slopes=Array(n);
slopes[0]=2*(1-reduction);
for(let i=1;i<n-1;i++){
 const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];
 slopes[i]=secants[i-1]*secants[i]<=0?0:(w1+w2)/(w1/secants[i-1]+w2/secants[i]);
}
const a=h[n-2],b=h[n-3],u=secants[n-2],v=secants[n-3];
let last=((2*a+b)*u-a*v)/(a+b);
if(last*u<=0)last=0;else if(u*v<0&&Math.abs(last)>3*Math.abs(u))last=3*u;
slopes[n-1]=last;
export function legacyEngineeringBase(layers){
 const L=Math.min(999,Math.max(0,Number(layers)||0));
 if(L<=150){const t=L/150;return (100+2*L)*(1-reduction*t*t*(3-2*t))+RHODES_FIRE_BASE_BONUS;}
 let i=0;while(i<n-2&&L>points[i+1][0])i++;
 const t=(L-points[i][0])/h[i],t2=t*t,t3=t2*t;
 return (2*t3-3*t2+1)*points[i][1]+(t3-2*t2+t)*h[i]*slopes[i]
  +(-2*t3+3*t2)*points[i+1][1]+(t3-t2)*h[i]*slopes[i+1]+RHODES_FIRE_BASE_BONUS;
}
const transferred=RHODES_TRANSFER_POINTS.map(ps=>{
 const hs=ps.slice(1).map((p,i)=>p[0]-ps[i][0]),ds=ps.slice(1).map((p,i)=>(p[1]-ps[i][1])/hs[i]),ms=ps.map(()=>0);
 for(let i=1;i<ps.length-1;i++)if(ds[i-1]*ds[i]>0){const w1=2*hs[i]+hs[i-1],w2=hs[i]+2*hs[i-1];ms[i]=(w1+w2)/(w1/ds[i-1]+w2/ds[i]);}
 return L=>{let k=0;while(k<ps.length-2&&L>ps[k+1][0])k++;const t=(L-ps[k][0])/hs[k],t2=t*t,t3=t2*t;
  return(2*t3-3*t2+1)*ps[k][1]+(t3-2*t2+t)*hs[k]*ms[k]+(-2*t3+3*t2)*ps[k+1][1]+(t3-t2)*hs[k]*ms[k+1];};
});
export function engineeringBase(layers,tier=2){const L=Math.min(999,Math.max(0,Number(layers)||0));return legacyEngineeringBase(L)+transferred[tier>=3?1:0](L);}
export function engineeringDamage(e,layers,atk,tier){
 const A=Math.max(0,Number(atk)||0),i=tier>=3?1:0,base=engineeringBase(layers,tier),atkScale=e.atkScale[i];
 return {base,atkScale,fire:base+atkScale*A};
}
