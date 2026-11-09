// Repository-owned bridge: discovery and Spine metadata, never a plugin module or network request.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installedArtReferences } from '../../server/plugins/artReferences.js';
import { parseSkel } from '../assets/skel.mjs';
import { resolveRoles } from '../assets/anim-roles.mjs';
import {productAssetData} from '../assets/product-content.mjs';

const [mode, arg] = process.argv.slice(2);
if (mode === '--spine') {
  const sk = parseSkel(fs.readFileSync(arg));
  process.stdout.write(JSON.stringify({ pma: true,
    anims: resolveRoles(sk.animations, { skillIndices: [0, 1, 2], durations: sk.durations }),
    animations: sk.durations, events: sk.events, hits: sk.hits, bounds: sk.bounds }));
} else {
  const root = mode || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const official=new Set();
  for(const dir of ['', 'versions/act2autochess-v2_1','versions/act1autochess','versions/act1autochess-v1_1']){
    for(const name of ['chess','backups']){const file=path.join(root,'data',dir,name+'.json');if(!fs.existsSync(file))continue;const doc=JSON.parse(fs.readFileSync(file,'utf8'));for(const record of Object.values(name==='chess'?doc:doc.units||{}))if(record.charId)official.add(record.charId);if(name==='backups')for(const id of Object.keys(doc.units||{}))official.add(id);}
  }
  const product=productAssetData(root).flatMap(data=>Object.values(data.chess).filter(record=>record.charId&&!official.has(record.charId)).map(record=>record.charId));
  process.stdout.write(JSON.stringify([...new Set([...installedArtReferences(root),...product])]));
}
