// Shared runtime/text constants. Layers remain 0..999.
export const RI_BALANCE=Object.freeze({atkBase:.10,atkPerLayer:.002,hpBase:.10,hpPerLayer:.002,growth:[0,2,7],professions:[3,4,5],composition:[1,2,4],openingSp:[8,12]});
export const ENGINEERING_BALANCE=Object.freeze({base:100,perLayer:2,layerRamp:.05,rampStart:220,rampEnd:800,atkFloor:.04,atkScale:[.5,1],openingDelay:2,interval:[4,2.5],fuse:[.5,.4],radius:[.8,1.2],reach:2,maxTargets:[3,Infinity],trueScale:.5,lockSlow:.5,growth:[2,2],cap:[24,30],angles:{phys:12,arts:18,true:6}});
export const TERMINAL='chess_rm_terminal_e';
export const TERMINAL_BALANCE=Object.freeze({atk:[.12,.20],openingSp:[10,15]});
export const OLD_RI_GROWTH=Object.freeze({prep:1,humus:[2,3],humusCap:[8,16]});
export const NEARL_BALANCE=Object.freeze({reduction:[.10,.15],seconds:8,growth:[2,4],cap:[10,20],reach:2,recent:2});
