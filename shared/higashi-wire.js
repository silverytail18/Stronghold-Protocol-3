const plain=x=>!!x&&Object.getPrototypeOf(x)===Object.prototype;
const scalar=x=>typeof x==='number'&&Number.isFinite(x)&&x>=-100&&x<=1e10||typeof x==='boolean'||typeof x==='string'&&x.length<=64;
export function safeTree(x,depth=0){if(depth>6)return false;if(scalar(x)||x===null)return true;if(Array.isArray(x))return x.length<=64&&x.every(v=>safeTree(v,depth+1));if(!plain(x))return false;const keys=Object.keys(x);return keys.length<=64&&keys.every(k=>k.length<=64&&!['__proto__','prototype','constructor'].includes(k)&&safeTree(x[k],depth+1));}
const deadlines=['parryReady','markReady','sealReady','shieldReady','markUntil','sealUntil','releaseUntil','releaseNext','shieldUntil','guardUntil','ultimateShieldUntil'];
function validCarry(c){
 if(!plain(c)||c.version!==4||!Number.isFinite(c.Q)||c.Q<0||c.Q>100||!Number.isFinite(c.elapsed)||c.elapsed<0||c.elapsed>1e5||!safeTree(c))return false;
 if(!['releaseReady','lastEvent','lastNinja','serial'].every(k=>Number.isFinite(c[k])))return false;
 if(c.releaseReady<0||c.releaseReady>c.elapsed+12.1||c.lastEvent<0||c.lastEvent>c.elapsed+.1||c.lastNinja>c.elapsed+.1||!Number.isInteger(c.serial)||c.serial<0)return false;
 if(c.windReady!==undefined&&(!Number.isFinite(c.windReady)||c.windReady<0||c.windReady>c.elapsed+2.6))return false;
 if(c.passiveSecond!==undefined&&(!Number.isInteger(c.passiveSecond)||c.passiveSecond<0||c.passiveSecond>Math.floor(c.elapsed)+1))return false;
 if(!Number.isFinite(c.ultimate)||c.ultimate<0||c.ultimate>100||!Number.isFinite(c.ultimateReady)||c.ultimateReady<0||c.ultimateReady>c.elapsed+18.1)return false;
 if(c.ultimateFullAt!==null&&(!Number.isFinite(c.ultimateFullAt)||c.ultimateFullAt<0||c.ultimateFullAt>c.elapsed+.1))return false;
 for(const key of ['ultimateSecond','ultimateGuardSecond','ultimateGuardUsed','ultimateSerial'])if(!Number.isInteger(c[key])||c[key]<-1)return false;
 if(c.ultimateGuardUsed>9||c.ultimateSecond>Math.floor(c.elapsed)+1||c.ultimateGuardSecond>Math.floor(c.elapsed)+1)return false;
 if(c.ultimatePending!==null){const p=c.ultimatePending;if(!plain(p)||![2,3].includes(p.tier)||!Number.isInteger(p.layers)||p.layers<0||p.layers>999||!Number.isFinite(p.attackSum)||p.attackSum<0||p.attackSum>1e10||!Number.isFinite(p.hitAt)||p.hitAt<0||p.hitAt>c.elapsed+.45||!Number.isInteger(p.serial)||p.serial<1||p.serial>c.ultimateSerial)return false;}
 if(!plain(c.releaseUsers)||Object.keys(c.releaseUsers).length>1||!Object.entries(c.releaseUsers).every(([serial,ids])=>/^\d+$/.test(serial)&&+serial===c.serial&&Array.isArray(ids)&&ids.length<=32&&ids.every(id=>typeof id==='string'&&id.length<=64)))return false;
 if(!Number.isFinite(c.duelBurstReady)||c.duelBurstReady<0||c.duelBurstReady>c.elapsed+12.1)return false;
 for(const collection of ['units','families','native'])if(!plain(c[collection]))return false;
 for(const u of Object.values(c.units)){if(!plain(u)||!Number.isInteger(u.releaseLeft)||u.releaseLeft<0||u.releaseLeft>2||!Number.isInteger(u.shieldCount)||u.shieldCount<0||u.shieldCount>2)return false;for(const key of deadlines)if(u[key]!==undefined&&(!Number.isFinite(u[key])||u[key]<0||u[key]>c.elapsed+12.1))return false;if(u.skillLeft!==undefined&&(!Number.isFinite(u.skillLeft)||u.skillLeft<0||u.skillLeft>1e9))return false;}
 for(const f of Object.values(c.families)){for(const [key,max]of [['insightReady',.6],['comboUntil',4.1]])if(f[key]!==undefined&&(!Number.isFinite(f[key])||f[key]<0||f[key]>c.elapsed+max))return false;if(f.guardUntil!==undefined&&(!Number.isFinite(f.guardUntil)||f.guardUntil<0||f.guardUntil>c.elapsed+4.1))return false;for(const key of ['parryReady','markReady','sealReady'])if(!Number.isFinite(f[key])||f[key]<0||f[key]>c.elapsed+8.1)return false;}
 return true;
}
export function isHigashiResult(v){return plain(v)&&v.version===4&&Number.isInteger(v.personal)&&v.personal>=0&&v.personal<=36&&Number.isInteger(v.performance)&&v.performance>=0&&v.performance<=16&&plain(v.points)&&Object.keys(v.points).length<=32&&Object.values(v.points).every(n=>Number.isInteger(n)&&n>=0&&n<=8)&&safeTree(v.metrics)&&validCarry(v.carry);}
export const compactHigashiResult=p=>isHigashiResult(p?.higashi)?{higashi:structuredClone(p.higashi)}:{};
