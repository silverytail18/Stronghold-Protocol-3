// Deterministic exp/log adaptation of fdlibm e_exp.c / e_log.c (netlib.org/fdlibm).
// Copyright (C) 1993, 2004 by Sun Microsystems, Inc. All rights reserved.
// Permission to use, copy, modify, and distribute this software is freely granted,
// provided that this notice is preserved.
import {powi} from './detmath.js';
const words=new DataView(new ArrayBuffer(8));
const high=x=>{words.setFloat64(0,x,false);return words.getUint32(0,false);};
const low=x=>{words.setFloat64(0,x,false);return words.getUint32(4,false);};
const setHigh=(x,h)=>{words.setFloat64(0,x,false);words.setUint32(0,h>>>0,false);return words.getFloat64(0,false);};
const HI=6.93147180369123816490e-1,LO=1.90821492927058770002e-10,INV=1.442695040888963387;
const P1=1.66666666666666019037e-1,P2=-2.77777777770155933842e-3,P3=6.61375632143793436117e-5,P4=-1.65339022054652515390e-6,P5=4.13813679705723846039e-8;
export function exp(x){
  if(Number.isNaN(x))return x;if(x===Infinity)return Infinity;if(x===-Infinity)return 0;
  if(x>709.782712893383973096)return Infinity;if(x< -745.13321910194110842)return 0;
  const sign=x<0?-1:1,hx=high(x)&0x7fffffff;let k=0,hi=0,lo=0;
  if(hx>0x3fd62e42){
    if(hx<0x3ff0a2b2){hi=x-sign*HI;lo=sign*LO;k=sign;}
    else{k=Math.trunc(INV*x+sign*.5);hi=x-k*HI;lo=k*LO;}
    x=hi-lo;
  }else if(hx<0x3e300000)return 1+x;
  const t=x*x,c=x-t*(P1+t*(P2+t*(P3+t*(P4+t*P5))));
  if(k===0)return 1-((x*c)/(c-2)-x);
  let y=1-((lo-(x*c)/(2-c))-hi);
  if(k>=-1021)return setHigh(y,high(y)+k*0x100000);
  y=setHigh(y,high(y)+(k+1000)*0x100000);return y*9.33263618503218878990e-302;
}
const L1=6.666666666666735130e-1,L2=3.999999999940941908e-1,L3=2.857142874366239149e-1,L4=2.222219843214978396e-1,L5=1.818357216161805012e-1,L6=1.531383769920937332e-1,L7=1.479819860511658591e-1;
export function log(x){
  if(x===0)return-Infinity;if(x<0)return NaN;if(!Number.isFinite(x))return x;
  let hx=high(x),k=0;if(hx<0x100000){k-=54;x*=1.8014398509481984e16;hx=high(x);}
  k+=(hx>>>20)-1023;hx&=0xfffff;const normalize=(hx+0x95f64)&0x100000;x=setHigh(x,hx|(normalize^0x3ff00000));k+=normalize>>>20;
  const f=x-1;
  if((0xfffff&(2+hx))<3){if(f===0)return k===0?0:k*HI+k*LO;const r=f*f*(.5-f/3);return k===0?f-r:k*HI-((r-k*LO)-f);}
  const s=f/(2+f),z=s*s,w=z*z,r=w*(L2+w*(L4+w*L6))+z*(L1+w*(L3+w*(L5+w*L7)));
  if(((hx-0x6147a)|(0x6b851-hx))>0){const h=.5*f*f;return k===0?f-(h-s*(h+r)):k*HI-((h-(s*(h+r)+k*LO))-f);}
  return k===0?f-s*(f-r):k*HI-((s*(f-r)-k*LO)-f);
}
/** Product decay/falloff uses nonnegative finite bases. Integer powers retain upstream powi's precision. */
export function positivePow(base,power){
  if(power===0)return 1;if(Number.isNaN(base)||Number.isNaN(power))return NaN;
  if(base===0)return power>0?0:Infinity;
  if(base===1)return Number.isFinite(power)?1:NaN;
  if(!Number.isFinite(power)){if(base<0)return NaN;return (base>1)===(power>0)?Infinity:0;}
  if(!Number.isFinite(base)){if(base<0&&!Number.isInteger(power))return NaN;const value=power>0?Infinity:0;return base<0&&Math.abs(power%2)===1?-value:value;}
  if(Number.isInteger(power)&&Math.abs(base)<1e150)return powi(base,power);
  if(base<0)return NaN;
  return exp(power*log(base));
}
export const ieeeWords=x=>[high(x),low(x)];
