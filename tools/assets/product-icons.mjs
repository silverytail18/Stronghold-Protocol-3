import fs from 'node:fs';
import path from 'node:path';
const glyphs={
  bonds:'<path d="M32 6 54 19v26L32 58 10 45V19Z M20 27l12-7 12 7v14l-12 7-12-7Z"/>',
  bands:'<path d="M14 7h36v50L32 47 14 57Z M24 19h16M24 28h16M24 37h10"/>',
  items:'<path d="m32 6 23 13v26L32 58 9 45V19Z M9 19l23 13 23-13M32 32v26 M20 13l24 13"/>',
};
/** Authored UI glyphs for project-only concepts; never presented as extracted official sprites. */
export function productIcons(root,body,data,remember){
  const logos={rhodesShip:'rhodes',higashiShip:'higashi',ursusShip:'ursus',iberiaShip:'iberia'};
  for(const kind of ['bonds','bands','items']){
    body[kind]||={};
    const baseline=JSON.parse(fs.readFileSync(path.join(root,'data',kind+'.json'),'utf8'));
    for(const[id,row]of Object.entries(data[kind]||{})){
      if(baseline[id]&&!row.expansionBatch)continue;
      const key=kind==='items'?row.iconId||row.trapId||id:id;if(body[kind][key])continue;
      const logo=kind==='bonds'&&body.ui?.['campLogo/logo_'+logos[id]];
      if(logo){body[kind][key]=logo;remember(logo);continue;}
      const safe=String(key).replace(/[^A-Za-z0-9_.-]/g,'_'),relative=`product/icons/${kind}/${safe}.svg`;
      const symbol=key==='chess_item_mastery_training_a'?'<path d="m32 5 7 16 18 2-14 12 4 19-15-10-15 10 4-19L7 23l18-2Z"/>':key==='chess_item_prts_archive_a'?'<path d="M14 7h26l10 10v40H14Z M40 7v12h10M23 29h18M23 38h18M23 47h10"/>':glyphs[kind];
      const text=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g fill="none" stroke="#eef7f5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${symbol}</g></svg>`;
      const file=path.join(root,'public/assets',relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);
      body[kind][key]='/assets/'+relative;remember(body[kind][key]);
    }
  }
}
