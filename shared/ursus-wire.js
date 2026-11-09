const obj=x=>!!x&&Object.getPrototypeOf(x)===Object.prototype;
const n=(x,max)=>Number.isFinite(x)&&x>=0&&x<=max;
const integer=(x,max)=>Number.isInteger(x)&&n(x,max);
const traitKeys=new Set(['brownb','headbr','wintim','glassb','absin','leto','turdus','helage']);
const validNative=x=>obj(x)&&Object.keys(x).length<=32&&Object.entries(x).every(([id,v])=>/^\d{1,12}$/.test(id)&&obj(v)&&Object.keys(v).length<=4&&Object.values(v).every(x=>typeof x==='boolean'||n(x,10000)));
const validTraits=x=>obj(x)&&Object.keys(x).length===2&&integer(x.teamUsed,12)&&obj(x.families)&&Object.keys(x.families).length<=8&&Object.entries(x.families).every(([key,f])=>traitKeys.has(key)&&obj(f)&&Object.keys(f).length===3&&integer(f.used,8)&&integer(f.cap,8)&&f.used<=f.cap&&n(f.progress,6));
export function isUrsusResult(v){
 if(!obj(v)||v.version!==1||!obj(v.carry)||!obj(v.metrics))return false;
 const c=v.carry,m=v.metrics;
 return Object.keys(v).length===3&&Object.keys(c).length<=7&&Object.keys(c).every(k=>['version','elapsed','readyAt','refundUsed','serial','native','traits'].includes(k))&&Object.keys(m).length===5
  &&c.version===1&&n(c.elapsed,1e5)&&n(c.readyAt,c.elapsed+30.1)&&n(c.refundUsed,5)&&integer(c.serial,1e7)
  &&['casts','hits','kills'].every(k=>integer(m[k],1e5))&&n(m.trueDamage,1e13)&&n(m.refund,5e5)&&m.kills<=m.hits&&m.hits<=m.casts
  &&(c.native===undefined||validNative(c.native))&&(c.traits===undefined||validTraits(c.traits));
}
export const compactUrsusResult=p=>isUrsusResult(p?.ursus)?{ursus:structuredClone(p.ursus)}:{};
