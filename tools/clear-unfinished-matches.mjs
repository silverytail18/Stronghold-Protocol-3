// Explicit stopped-server cleanup for records left by older releases; no backup or full-state inspection.
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {settingsFor,statePaths} from '../server/product/retention.js';
import {clearUnfinishedRecords} from '../server/product/shutdown-records.js';
const args=process.argv.slice(2);
if(args.length!==1||args[0]!=='--stopped')throw Error('请先停服，再在部署目录执行 node tools/clear-unfinished-matches.mjs --stopped');
const project=await fs.realpath(process.cwd()),paths=await statePaths(project,await settingsFor(project,process.env));
await fs.access(paths.rankedFile); // Never initialize an empty database when a path is wrong.
const db=new DatabaseSync(paths.rankedFile,{timeout:5000});
try{db.exec('PRAGMA foreign_keys=ON');console.log({cleared:clearUnfinishedRecords(db),completedAndPendingPreserved:true});}
finally{db.close();}
