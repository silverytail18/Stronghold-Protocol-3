// Resource coverage is derived from authored records and the upstream planner, never legacy asset maps.
import fs from 'node:fs';
import path from 'node:path';
import {TEST_CONTENT} from '../../server/test-content.js';
import {productIcons} from './product-icons.mjs';
import {withMasteryItem} from '../../shared/skill-mastery.js';
const CONTENT=new Set(['arknights-expansion-v1','rhodes-mujica-v1','rhine-lab-v1','kazdel-expansion-v1','higashi-expansion-v1','ursus-expansion-v1','iberia-expansion-v1']);
export function productAssetData(root){
  if(!fs.existsSync(path.join(root,'data/config.json')))return [];
  const data={};for(const file of fs.readdirSync(path.join(root,'data')))if(file.endsWith('.json')&&fs.statSync(path.join(root,'data',file)).isFile())data[file.slice(0,-5)]=JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8'));
  if(!data.config?.modes||!data.chess)return [];
  for(const entry of TEST_CONTENT)if(CONTENT.has(entry.id))entry.apply(data,{mode:'solo'});
  return[{...data,version:{id:'product',label:'定制内容'}}];
}
export function mergeLocalOperatorFallbacks(root,body,files){
  const musicFile=path.join(root,'tools/assets/custom-music.json');
  if(fs.existsSync(musicFile)){
    body.audio||={};body.audio.musicCatalog={};
    const music=JSON.parse(fs.readFileSync(musicFile,'utf8'));
    for(const[id,entry]of Object.entries(music)){
      if(entry.file!==`/assets/audio/music/${id}/song.mp3`||!fs.existsSync(path.join(root,'public',entry.file)))throw Error('Preserved soundtrack missing '+id);
      body.audio.musicCatalog[id]=entry;files.add(entry.file.slice(8));
    }
  }
  const file=path.join(root,'data/local-assets.json');if(!fs.existsSync(file))return;
  const local=JSON.parse(fs.readFileSync(file,'utf8'));
  const exists=url=>typeof url==='string'&&url.startsWith('/assets/local/')&&!url.includes('..')&&fs.existsSync(path.join(root,'public',url));
  const remember=value=>{if(typeof value==='string'&&value.startsWith('/assets/'))files.add(value.slice(8));else if(value&&typeof value==='object')for(const v of Object.values(value))remember(v);};
  const product=productAssetData(root)[0];if(product)productIcons(root,body,withMasteryItem(product),remember);
  for(const [id,entry]of Object.entries(local.chars||{})){
    const char=body.chars?.[id];if(!char)continue;
    for(const name of ['avatar','avatarE2','portrait','portraitE2'])if(!char[name]&&exists(entry[name])){char[name]=entry[name];remember(char[name]);}
    for(const [face,model]of Object.entries(entry.spine||{}))if(!char.spine?.[face]&&exists(model.skel)&&exists(model.atlas)&&model.textures?.length&&model.textures.every(exists)){
      char.spine||={};char.spine[face]=structuredClone(model);remember(model);
    }
    for(const[skinId,skin]of Object.entries(entry.skins||{})){
      const ready=skin.spine?.front&&exists(skin.spine.front.skel)&&exists(skin.spine.front.atlas)&&skin.spine.front.textures?.every(exists);
      if(ready||exists(skin.avatar)||exists(skin.portrait)){char.skins||={};char.skins[skinId]=structuredClone(skin);remember(skin);}
    }
  }
  for(const[id,entry]of Object.entries(local.tokens||{}))if(body.tokens?.[id])for(const[skinId,skin]of Object.entries(entry.skins||{})){body.tokens[id].skins||={};body.tokens[id].skins[skinId]=structuredClone(skin);remember(skin);}
}
