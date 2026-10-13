import {existsSync} from 'node:fs';
import {join} from 'node:path';
// Keep downloaded skins across ordinary fetch-assets rebuilds, including --prune.
export function preserveSkinAssets(current,body,files,root) {
  if(!current?.skinModels)return;
  const kept=new Set();
  const walk=v=>{if(typeof v==='string'&&v.startsWith('/assets/skins/')){
    const rel=v.slice('/assets/'.length);
    if(rel.split('/').some(p=>p==='..')||!existsSync(join(root,rel)))throw Error('Missing downloaded skin: '+v+'; run tools/fetch-skins.mjs');
    kept.add(rel);
  }else if(v&&typeof v==='object')Object.values(v).forEach(walk);};
  walk(current.skinModels);
  body.skinModels=current.skinModels;body.skinSource=current.skinSource;
  for(const rel of kept)files.add(rel);
}
