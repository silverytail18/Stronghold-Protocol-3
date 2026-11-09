import {syncUrsusRecruit} from '../sim/content/ursus/recruit.js';
import {boardTerritory} from '../../shared/ursus-board.js';
import {fieldTile} from './board.js';
import {Grid} from '../sim/grid.js';
import {GEO} from '../../shared/constants.js';
import {syncHigashiRecruit} from '../sim/content/higashi/recruit.js';
import {rhineMetaApi} from './productRhine.js';
import {syncKjeragRecruit} from '../sim/content/expansion/kjerag-recruit.js';
export function extendProductContext(ctx,m,ps){if(!ps.gd.raw.config?.productContent?.ids?.length)return ctx;const gd=ps.gd;return Object.assign(ctx,{
rhine: rhineMetaApi(ps),

syncUrsusRecruit: () => syncUrsusRecruit(ps),
ursusDomain: () => {const field=m.deployFieldOf?.(ps)||'normal',grid=new Grid({...m.stage,legend:m.stage?.tiles||m.stage?.legend},field==='normal'?GEO.NORMAL_RECT:GEO.BOSS_RECT);return boardTerritory(ctx.board(),{getChess:id=>gd.chess(id),getBonds:p=>ctx.pieceBonds(p.uid),getLoadout:c=>ps.loadoutFor(c),tierIndex:ctx.bond('ursusShip')?.tier||0,validCell:(r,c)=>{const[sr,sc]=fieldTile(field,r,c);return grid.inRect(sr,sc)&&grid.tile(sr,sc).pass!=='NONE';}});},
syncHigashiRecruit: () => syncHigashiRecruit(ps),
syncKjeragRecruit: () => syncKjeragRecruit(ps)
});}
