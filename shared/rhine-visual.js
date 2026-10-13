// One visual vocabulary for the prep selector and all battlefield renderers.
export const RHINE_COLORS=Object.freeze({T01:'#ffce78',T02:'#79b8ff',T03:'#c69cff',T04:'#ff8299',T06:'#8ad9a1',T13:'#71dfd4'});
export function rhineMarks(positions){return Object.entries(positions||{}).flatMap(([id,tiles])=>RHINE_COLORS[id]?(tiles||[]).map(([row,col])=>({id,row,col,color:RHINE_COLORS[id]})):[]);}
export const markStyle=(id,paused=false)=>({group:'rhine:'+id,color:parseInt(RHINE_COLORS[id].slice(1),16),fill:paused?.025:.07,line:paused?.13:.3,rhine:true,stampAlpha:paused?.16:.36});
