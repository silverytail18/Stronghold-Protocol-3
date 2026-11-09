import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root=process.cwd();
for(const [source,target]of[['app.js','mizukiNativeApp.js'],['drag.js','mizukiNativeDrag.js']]){
 const file=path.join(root,'public/js/render',source),raw=fs.readFileSync(file,'utf8');
 let text=raw.replace(/(from\s+|import\s*\()(['"])(\.{1,2}\/[^'"]+)\2/g,(_,prefix,quote,spec)=>prefix+quote+new URL(spec,'http://local/js/render/'+source).pathname+quote);
 text=text.replace(/import \{ GEO, ANIM \} from '[^']+';/,"import { ANIM } from '/shared/constants.js';\nimport { MIZUKI_GEO as GEO } from './mizukiPrep.js';");
 text=text.replace(/import \{ GEO \} from '[^']+';/,"import { MIZUKI_GEO as GEO } from './mizukiPrep.js';");
 if(source==='drag.js') text=text.replace("import { activeBenchSize, handTile, tempTile, benchSlot } from '/js/zhajingMode.js';", "import { mizukiBenchSize as activeBenchSize, mizukiHandTile as handTile, mizukiTempTile as tempTile } from './mizukiPrep.js';")
  .replace("if (geo === GEO && activeBenchSize() > 10) { const slot = benchSlot(row, col); if (slot) return slot; }", "");
 if(source==='app.js') text=text.replace("import { activeBenchSize, handTile, zhajingStage } from '/js/zhajingMode.js';", "import { mizukiBenchSize as activeBenchSize, mizukiHandTile as handTile } from './mizukiPrep.js';").replace("st = zhajingStage(st);", "// Mizuki prep supplies its already shifted mode-local map.");
 text=text.replace("from '/js/render/drag.js'","from './mizukiNativeDrag.js'");
 if(source==='app.js') text=text.replace("from '/js/render/tiles.js'", "from './mizukiNativeTiles.js'");
 if(source==='app.js') text=text.replace("from '/js/render/board3d/scene.js'", "from './mizukiBoard3dScene.js'");
 if(source==='app.js') text=text.replace("import { loadImageElement } from '/js/assets.js';", "import { loadMizukiLocalImage as loadImageElement } from './mizukiAssets.js';");
 if(source==='app.js') text=text.replace("if (range) t = t.filter(([r]) => r !== GEO.HAND_ROW && r !== GEO.TEMP_ROW);", "if (range && mode === 'prep') t = t.filter(([r]) => r !== GEO.HAND_ROW && r !== GEO.TEMP_ROW);");
 if(source==='app.js') text=text.replaceAll("pickTile(cam, x, y, heightAt, tiles.levels)", "pickTile(cam, x, y, heightAt, tiles.levels, stageRec?.rows?.length || 19, 21)").replaceAll("pickTile(cam, p.x, p.y + hold * s0, heightAt, tiles.levels)", "pickTile(cam, p.x, p.y + hold * s0, heightAt, tiles.levels, stageRec?.rows?.length || 19, 21)");
 if(source==='app.js') text=text.replace("Math.max(-1, Math.min(19, w.y))", "Math.max(-1, Math.min((stageRec?.rows?.length || 19) - 1, w.y))");
 if(source==='app.js') text=text.replace("rect, side: o.side, half: !!o.half, shop: o.shop, fit: !!o.fit, config: stageRec?.config || null,", "rect, nativeRect: o.nativeRect, side: o.side, half: !!o.half, shop: o.shop, fit: !!o.fit, config: stageRec?.config || null,");
 // RO2 opening enemies have exact zero-time map previews; the ordinary boss
 // pen must not also place its composition-only leader on the same map.
 if(source==='app.js') text=text.replace(', leaderStand }', ' }').replace(', hitTiles }', ' }');
 if(source==='app.js') text=text.replace("const stand = leaderStand(list, (k) => data.enemy(k)?.hitArea ?? null, hitTiles);", "const stand = null; // RO2 map enemies come only from authoritative prepEnemies.");
 if(source==='app.js') text=text.replace("if (!tile || !Number.isInteger(tile.row) || !Number.isInteger(tile.col)) { held.delete(uid); return true; }", `if (!tile || !Number.isInteger(tile.row) || !Number.isInteger(tile.col)) {
        const released = held.delete(uid);
        // Acknowledged moves may arrive while the direction preview holds the
        // piece. Release to the latest prep state, including its committed dir;
        // cancellation also restores the original slot instead of a stale ghost.
        if (released && mode === 'prep' && lastPrep) {
          setPrep(lastPrep.ps, lastPrep.o);
          const piece = prepPieces.find(value => value.uid === uid);
          if (piece && piece.area !== 'board') views.get('p:' + uid)?.setDir?.('RIGHT');
        }
        return true;
      }`);
 if(source==='app.js') text=text.replace("import { Camera, presetCamera, lerpCamera, easeInOutCubic, pickTile, normRect } from '/js/render/projection.js';", "import { Camera, lerpCamera, easeInOutCubic, pickTile, normRect } from '/js/render/projection.js';\nimport { mizukiPresetCamera as presetCamera } from './mizukiProjection.js';");
 if(source==='app.js') text=text.replace("import { boardPreference, switchableBox, bandFor, fieldRows, boardArea, viewKind, restView, flightView } from '/js/render/app/view.js';", "import { boardPreference, switchableBox, bandFor, fieldRows, boardArea, viewKind, restView, flightView } from '/js/render/app/view.js';\nimport { MIZUKI_PREP_AREA, mizukiPrepViewState } from './mizukiPrep.js';\nconst mizukiRestView = kind => kind === 'prep' ? mizukiPrepViewState(restView(kind)) : restView(kind);\nconst mizukiBoardArea = kind => kind === 'prep' ? MIZUKI_PREP_AREA : boardArea(kind);");
 if(source==='app.js') text=text.replace("import { boardPreference, switchableBox, bandFor, fieldRows, boardArea, viewKind, restView, flightView } from '/js/render/app/view.js';", "import { boardPreference, switchableBox, boardArea, viewKind, restView, flightView } from '/js/render/app/view.js';");
 if(source==='app.js') text=text.replace("if (camOpts.rect) { const r = normRect(camOpts.rect); return k === 'prep' ? { ...r, r0: Math.min(r.r0, GEO.HAND_ROW) } : r; }", "if (camOpts.rect) { const r = normRect(camOpts.rect, stageRec?.rows?.length || 19, 21); return k === 'prep' ? { ...r, r0: Math.min(r.r0, GEO.HAND_ROW) } : r; }");
 if(source==='app.js') text=text.replace("tiles.setView(bandFor('prep'), camRect(), fieldRows('prep'));", "tiles.setView([0, 20], camRect(), [0, 20]);");
 if(source==='app.js') text=text.replace("b.setArea(boardArea(viewKind(camKind, camOpts)));", "b.setArea(mizukiBoardArea(viewKind(camKind, camOpts)));");
 if(source==='app.js') text=text.replace("const rest = restView(vk);", "const rest = mizukiRestView(vk);");
 if(source==='app.js') text=text.replace("v = info.kind === 'device' ? new DeviceView(ctx, info) : new UnitView(ctx, info, { prep: !!battleMeta?.prep && info.side === 'ally' });", "v = ctx.mizukiFacilityFactory?.(info) || (info.kind === 'device' ? new DeviceView(ctx, info) : new UnitView(ctx, info, { prep: !!battleMeta?.prep && info.side === 'ally' }));");
 if(source==='app.js') text=text.replace('  };\n  const onPointerMove = (e) => {', "    if (mode === 'prep') { const tile = groundTile(ev.x, ev.y); if (tile) emit('tileClick', { row:tile.row, col:tile.col }); }\n  };\n  const onPointerMove = (e) => {");
 fs.writeFileSync(path.join(root,'public/js',target),'// Generated from native render/'+source+'; source SHA256 '+createHash('sha256').update(raw).digest('hex')+'\n// Rebuild: node tools/build-mizuki-render.mjs. Only mode geometry/import ownership differs.\n'+text);
}
for(const [source,target,pattern,replacement] of [
 ['tiles.js','mizukiNativeTiles.js','const ROWS = 19, COLS = 21;','const ROWS = 21, COLS = 21;'],
 ['board3d/layout.js','mizukiBoard3dLayout.js','export const ROWS = 19;','export const ROWS = 21;'],
 ['board3d/scene.js','mizukiBoard3dScene.js',"from '/js/render/board3d/layout.js'","from './mizukiBoard3dLayout.js'"]
]){
 const file=path.join(root,'public/js/render',source),raw=fs.readFileSync(file,'utf8');
 let text=raw.replace(/(from\s+|import\s*\()(['"])(\.{1,2}\/[^'"]+)\2/g,(_,prefix,quote,spec)=>prefix+quote+new URL(spec,'http://local/js/render/'+source).pathname+quote);
 if(!text.includes(pattern)) throw new Error('Mizuki renderer generation anchor missing: '+source);
 text=text.replace(pattern,replacement);
 if(target==='mizukiBoard3dScene.js') text=text.replace(replacement,"from './mizukiBoard3dLayout.js'");
 const lintDirective=['mizukiBoard3dLayout.js','mizukiBoard3dScene.js'].includes(target)
  ? '/* eslint-disable no-unused-vars -- Generated copy retains the native renderer APIs. */\n' : '';
 fs.writeFileSync(path.join(root,'public/js',target),'// Generated from native render/'+source+'; source SHA256 '+createHash('sha256').update(raw).digest('hex')+'\n// Rebuild: node tools/build-mizuki-render.mjs. Mizuki prep maps reserve two extra render rows.\n'+lintDirective+text);
}
{
 const source='ui/facingWheel.js',file=path.join(root,'public/js',source),raw=fs.readFileSync(file,'utf8');
 let text=raw.replace(/(from\s+|import\s*\()(['"])(\.{1,2}\/[^'"]+)\2/g,(_,prefix,quote,spec)=>prefix+quote+new URL(spec,'http://local/js/'+source).pathname+quote);
 text=text.replace('normDir, boardDir, viewMirrored','normDir, boardDir as nativeBoardDir, viewMirrored');
 text="import { mizukiVerticalDirection } from './mizukiCoordinates.js';\nconst boardDir = (dir, mirror) => mizukiVerticalDirection(nativeBoardDir(dir, mirror));\n"+text;
 fs.writeFileSync(path.join(root,'public/js/mizukiFacingWheel.js'),'// Generated from native ui/facingWheel.js; source SHA256 '+createHash('sha256').update(raw).digest('hex')+'\n// Rebuild: node tools/build-mizuki-render.mjs. Only mode-local vertical direction differs.\n'+text);
}
