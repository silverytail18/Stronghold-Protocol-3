// Static release cross-checks. Run from any directory after the fixed assets are prepared.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {APP_VERSION,RELEASE_SUMMARY} from '../shared/constants.js';
import {TECHNOLOGIES,TECH_ROWS,normalPoints,activationCount} from '../shared/rhine.js';
import {RESEARCH,researchCooldowns} from '../shared/rhine-balance.js';
import {getData} from '../server/data.js';
import {buildRhineData,NEW} from '../server/sim/content/rhine/data.js';
import {OVERLAY} from '../server/sim/content/rhine/records.js';
import {TestContent} from '../server/test-content.js';
const root=path.resolve(import.meta.dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const formal=getData(),before=JSON.stringify(formal),data=buildRhineData(formal);
assert.equal(JSON.stringify(formal),before,'overlay must not mutate formal data');
assert.equal(APP_VERSION,'0.5.3');assert.equal(json('package.json').version,APP_VERSION);assert.equal(RELEASE_SUMMARY,'莱茵科技调整与研究席强化');
assert.equal(normalPoints(999),19);assert.equal(TECHNOLOGIES.length,14);assert.equal(TECHNOLOGIES.reduce((n,t)=>n+t.cost,0),29);
assert.equal(TECHNOLOGIES.reduce((n,t)=>n+t.pre.length,0),15);assert.equal(TECH_ROWS.length,6);assert.ok(TECH_ROWS.every(r=>r.length<=3));
assert.deepEqual(TECH_ROWS.flat(),TECHNOLOGIES.map(t=>t.id));
const summary=json('docs/rhine-reference/design-summary.json');assert.equal(summary.designVersion,'1.13');
assert.deepEqual(summary.techRows,TECH_ROWS);assert.deepEqual(summary.currentRoster,summary.roster.map(r=>r.name));
for(const t of TECHNOLOGIES){const s=summary.technology.find(s=>s.id===t.id);assert.equal(s.minCount,t.count);assert.equal(s.activationMinCount,activationCount(t));assert.equal(s.ranks[0].activationMinCount,activationCount(t));assert.equal(s.ranks[0].effect,t.effect);assert.deepEqual(s.prerequisites,t.pre);assert.equal(s.ranks[0].additionalPointCost,t.cost);}
assert.equal(summary.membershipTechnology.minResearchCount,9);assert.equal(summary.membershipTechnology.activationMinCount,6);
assert.deepEqual(summary.membershipTechnology.localBonuses.sources,['T01','T02']);
assert.equal(NEW.length,6);assert.equal(Object.keys(OVERLAY.chess).length,12);assert.equal(Object.keys(OVERLAY.tokens).length,5);
assert.equal(data.bonds.rhineShip.visibleMembers.length,11);assert.equal(data.bonds[RESEARCH].visibleMembers.length,4);
assert.deepEqual(data.bonds[RESEARCH].visibleMembers.map(id=>data.chess[id].name).sort(),['星源','溯光星源','赫默','淬羽赫默'].sort());
for(const id of ['rhineShip',RESEARCH]){assert.equal(data.bonds[id].weight,0);assert.equal(data.bonds[id].bb.banWeight,0);}
assert.deepEqual(researchCooldowns(2),{attack:10,heal:10});assert.deepEqual(researchCooldowns(4),{attack:8,heal:5});
for(const key of ['chess','tokens','garrisons','assets'])assert.ok(!/doroth|10025|多萝西/.test(JSON.stringify(data[key])),'retired operator in '+key);
const batch=new TestContent().entries.find(e=>e.id==='rhine-lab-v1');assert.equal(batch.version,'rhine-test-4');assert.equal(batch.clientVersion,32);assert.equal(batch.name,'莱茵生命');
const proofs=json('docs/RHINE-ASSETS.json').proof;assert.equal(proofs.length,104);
for(const p of proofs){const target=path.join(root,'public',p.url);assert.equal(hash(target),p.deliveredSha256||p.sha256,'asset '+p.url);if(!p.deliveredSha256)assert.equal(fs.statSync(target).size,p.bytes);else assert.ok(p.normalization,'normalized atlas must document its transform');}
const docs=['docs/RHINE-LAB-DESIGN-1.13.md','docs/RHINE-0.5.3.md','docs/RHINE-BALANCE-0.5.2.md','docs/SERVER-UPLOAD-0.5.3.md'];
let links=0;
for(const file of docs){const text=read(file);for(const m of text.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)){if(/^(?:https?:|#)/.test(m[1]))continue;assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),m[1].split('#')[0])),`${file} broken link ${m[1]}`);links++;}}
const design=read(docs[0]);for(const t of TECHNOLOGIES)assert.ok(design.includes(t.effect),'rulebook missing current '+t.id);
assert.ok(read('public/js/screens/title.js').includes('VersionInfo'));assert.ok(!read('public/js/screens/lobby.js').includes('VersionInfo'));
assert.ok(read('public/css/components.css').includes('.version-entry'));assert.ok(read('public/js/ui/versionInfo.js').includes('RELEASE_SUMMARY'));
console.log(JSON.stringify({version:APP_VERSION,batch:batch.version,capability:batch.clientVersion,technologyCount:14,edges:15,cost:29,normalPointCap:19,roster:11,newForms:6,assets:proofs.length,checkedDocLinks:links,releaseSummary:RELEASE_SUMMARY},null,2));
