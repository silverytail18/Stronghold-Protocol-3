import {LIGHTHOUSE} from '../../../../shared/iberia-lighthouse.js';
import {CORE} from '../../../../shared/iberia-rules.js';
import {unitBonds} from '../support/index.js';
import {bodyInKeys} from '../../body.js';
const live=u=>u?.alive&&u.deployed&&!u.removed&&!u.hidden;
export const isLighthouse=u=>u?.kind==='token'&&u.defId===LIGHTHOUSE;
export function lighthouseKit(){return{trait:{noAttack:true},skill:{kind:'instant',trigger:'NEVER',onStart({battle:b,unit:u}){
 for(const a of b.allyUnits)if(live(a)&&a.ownerId===u.ownerId&&a.kind==='op'&&!a.trait?.doll&&unitBonds(a).includes(CORE)&&bodyInKeys(a,u.rangeKeys)){
  b.addBuff(a,{key:'ib:lighthouse:ward',shieldHits:1,visible:true,refresh:'replace'});b.fx('shield',{id:a.id,x:a.x,y:a.y,from:u.id});
 }
}},install(b,u){b.addBuff(u,{key:'ib:lighthouse:structure',persist:true,allowDead:true,flags:{invulnerable:true,untargetable:true,isolated:true,noHeal:true,noMove:true},mods:{blockCnt:0}});
 b.on('tick',({dt})=>{if(live(u)&&u.canAct&&b.enemies.some(e=>live(e)&&bodyInKeys(e,u.rangeKeys)))u.skill?.gainSp(dt,'iberia:lighthouse:enemy');if(!live(u)||!u.skill?.ready||!u.canAct)return;if(b.allyUnits.some(a=>live(a)&&a.ownerId===u.ownerId&&a.kind==='op'&&!a.trait?.doll&&unitBonds(a).includes(CORE)&&bodyInKeys(a,u.rangeKeys)))u.skill.activate('iberia:lighthouse');},{owner:u});
}};}
