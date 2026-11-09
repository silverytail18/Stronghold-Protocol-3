import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
// A checkpoint may replay only against the same gameplay implementation and data.
// UI-only fixes and new signed art can ship without invalidating a run.
const root=fileURLToPath(new URL('../../..',import.meta.url));
function sourceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sourceFiles(path.join(dir,e.name)):e.isFile()&&/\.(js|json)$/.test(e.name)?[path.join(dir,e.name)]:[]);}
const files=[...sourceFiles(path.join(root,'server/modes/mizuki')),...sourceFiles(path.join(root,'server/sim')),...sourceFiles(path.join(root,'server/match')),
 ...sourceFiles(path.join(root,'shared')),...sourceFiles(path.join(root,'data'))].sort();
const hash=createHash('sha256');for(const file of files){hash.update(path.relative(root,file).replaceAll('\\','/')+'\0');hash.update(fs.readFileSync(file));hash.update('\0');}
export const MIZUKI_RULES_HASH=hash.digest('hex');
export const MIZUKI_SOURCE=Object.freeze({upstream:'f07b8965061bbc311ad7aa815879b09264a1e47d',emi:'ac00de2ead13a3fe6511a6e1eb3fb7c707dc2e16',integration:'product-1',checkpointSchema:1,rulesHash:MIZUKI_RULES_HASH});
