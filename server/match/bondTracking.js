import {ERR} from '../../shared/constants.js';

/** Account-independent, private per-match preferences; counts are the same ones the bond strip displays. */
export function installBondTracking(Player) {
  const recompute=Player.prototype.recompute,view=Player.prototype.privateView;
  Player.prototype.recompute=function(...args){
    const result=recompute.apply(this,args);
    if(this.trackedBonds)this.trackedBonds=this.trackedBonds.filter(id=>(this.bonds[id]?.count||0)>0);
    return result;
  };
  Player.prototype.privateView=function(...args){return {...view.apply(this,args),trackedBonds:[...(this.trackedBonds||[])]};};
  Player.prototype.trackBond=function(id){
    const gate=this._gate();if(gate)return gate;
    if(typeof id!=='string'||!this.gd.bond(id))return{error:ERR.BAD_TARGET,detail:'盟约不存在'};
    const selected=this.trackedBonds||[];
    if(selected.includes(id))this.trackedBonds=selected.filter(key=>key!==id);
    else {
      if(selected.length>=2)return{error:ERR.BAD_TARGET,detail:'最多追踪两个盟约，请先取消一个'};
      if(!(this.bonds[id]?.count>0))return{error:ERR.BAD_TARGET,detail:'该盟约人口为零'};
      this.trackedBonds=[...selected,id];
    }
    this.dirty();return{ok:true};
  };
}
