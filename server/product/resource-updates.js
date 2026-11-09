import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {createHash, verify} from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {RESOURCE_CONTRACT, SHA256, validateResourceManifest, clientCompatibility} from '../../shared/client-resources.js';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function decodeSignedManifest(envelope, publicKey) {
  if (envelope?.algorithm !== 'RSA-SHA256' || typeof envelope.payload !== 'string' || envelope.payload.length > 32 * 1024 ** 2
    || !/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.payload) || typeof envelope.signature !== 'string') throw Error('Invalid signed update');
  const bytes = Buffer.from(envelope.payload, 'base64');
  if (!verify('RSA-SHA256', bytes, publicKey, Buffer.from(envelope.signature, 'base64'))) throw Error('Resource update signature mismatch');
  const doc = JSON.parse(bytes.toString('utf8'));
  if (doc?.format !== 1 || !SHA256.test(doc.from) || !SHA256.test(doc.to) || typeof doc.manifestBase64 !== 'string') throw Error('Invalid update generation');
  const manifestBytes=Buffer.from(doc.manifestBase64,'base64');
  if(digest(manifestBytes)!==doc.to)throw Error('Invalid update generation digest');
  const manifest=validateResourceManifest(JSON.parse(manifestBytes.toString('utf8')));
  return {...doc,manifest};
}
export function capability(req) {
  const ua = req.headers['user-agent'] || '';
  const match = /(?:^|\s)StrongholdProtocolApp\/2 Resources\/([a-f0-9]{64}) ClientLine\/(\d+\.\d+) Build\/(\d+) Epoch\/(\d+)(?:\s|$)/.exec(ua);
  return match ? {contract:RESOURCE_CONTRACT, resourceHash:match[1], clientLine:match[2], build:Number(match[3]), epoch:Number(match[4])} : null;
}
export async function loadResourceUpdates({directory, publicKey}) {
  const descriptor = JSON.parse(await fs.readFile(path.join(directory, 'client.json'), 'utf8'));
  if (descriptor.format !== 1 || descriptor.contract !== RESOURCE_CONTRACT || !SHA256.test(descriptor.resourceHash)
    || !/^\d+\.\d+$/.test(descriptor.clientLine) || !Number.isSafeInteger(descriptor.epoch) || descriptor.epoch < 1
    || !Number.isSafeInteger(descriptor.minBuild) || descriptor.minBuild < 1 || !Array.isArray(descriptor.updates)) throw Error('Invalid client policy');
  const manifests = new Map(), blobs = new Map();
  let targetManifest = null;
  // Complete installers carry their blobs locally. The signed inventory proves
  // the target generation without publishing those blobs on the game server.
  if (descriptor.inventory !== undefined) {
    if (!SHA256.test(descriptor.inventory)) throw Error('Invalid resource inventory index');
    const bytes = await fs.readFile(path.join(directory, 'inventories', descriptor.inventory + '.json'));
    if (digest(bytes) !== descriptor.inventory) throw Error('Resource inventory digest mismatch');
    const doc = decodeSignedManifest(JSON.parse(bytes), publicKey);
    if (doc.from !== descriptor.resourceHash || doc.to !== descriptor.resourceHash
      || doc.manifest.clientLine !== descriptor.clientLine || doc.manifest.epoch !== descriptor.epoch
      || !Array.isArray(doc.blobs) || doc.blobs.length !== 0) throw Error('Resource inventory compatibility mismatch');
    targetManifest = doc.manifest;
  }
  for (const update of descriptor.updates) {
    if (!SHA256.test(update.id) || !SHA256.test(update.from) || update.to !== descriptor.resourceHash || manifests.has(update.id)) throw Error('Invalid patch index');
    const bytes = await fs.readFile(path.join(directory, 'manifests', update.id + '.json'));
    if (digest(bytes) !== update.id) throw Error('Update envelope digest mismatch');
    const doc = decodeSignedManifest(JSON.parse(bytes), publicKey);
    targetManifest = doc.manifest;
    if (doc.from !== update.from || doc.to !== update.to || doc.manifest.clientLine !== descriptor.clientLine || doc.manifest.epoch !== descriptor.epoch) throw Error('Update compatibility mismatch');
    if (!Array.isArray(doc.blobs) || new Set(doc.blobs).size !== doc.blobs.length) throw Error('Invalid changed blob list');
    const entries = new Map(doc.manifest.files.map(file => [file.sha256, file]));
    for (const sha of doc.blobs) {
      const entry = entries.get(sha); if (!entry || !SHA256.test(sha)) throw Error('Unexpected patch blob');
      const filename = path.join(directory, 'blobs', sha);
      if (!blobs.has(sha)) {
        const stat = await fs.lstat(filename); if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== entry.size) throw Error('Invalid patch blob size');
        const hash = createHash('sha256'); for await (const chunk of createReadStream(filename)) hash.update(chunk);
        if (hash.digest('hex') !== sha) throw Error('Patch blob digest mismatch');
        blobs.set(sha, {filename, size:entry.size});
      }
    }
    manifests.set(update.id, {bytes, from:update.from, hashes:new Set(doc.blobs)});
  }
  const view = {...descriptor, updates:descriptor.updates.map(update => ({...update, url:'/client-updates/manifests/' + update.id + '.json'}))};
  return {descriptor:view, targetManifest, compatible:req => clientCompatibility(view, capability(req)),
    async route(req, res, pathname, auth) {
      if (pathname === '/product/client.json') {json(res, ['GET','HEAD'].includes(req.method)?200:405, ['GET','HEAD'].includes(req.method)?view:{error:'Method not allowed'}, req.method);return true;}
      if (!pathname.startsWith('/client-updates/')) return false;
      if (!['GET', 'HEAD'].includes(req.method)) {json(res, 405, {error:'Method not allowed'});return true;}
      const client = capability(req);
      if (clientCompatibility(view, client) !== 'patch') {json(res, 409, {error:'请安装新客户端', action:'installer'});return true;}
      auth.authorize(auth.session(req));
      const permitted = [...manifests.values()].filter(m => m.from === client.resourceHash);
      const manifestId = /^\/client-updates\/manifests\/([a-f0-9]{64})\.json$/.exec(pathname)?.[1];
      const manifest = manifests.get(manifestId);
      if (manifest && manifest.from === client.resourceHash) {
        res.writeHead(200, {'Content-Type':'application/json', 'Content-Length':manifest.bytes.length, 'Cache-Control':'private, no-store'});
        res.end(req.method === 'HEAD' ? undefined : manifest.bytes);return true;
      }
      const sha = /^\/client-updates\/blobs\/([a-f0-9]{64})$/.exec(pathname)?.[1], blob = blobs.get(sha);
      if (!blob || !permitted.some(m => m.hashes.has(sha))) {json(res, 404, {error:'Not found'});return true;}
      res.writeHead(200, {'Content-Type':'application/octet-stream', 'Content-Length':blob.size, 'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff'});
      if (req.method === 'HEAD') res.end(); else await pipeline(createReadStream(blob.filename), res);
      return true;
    },
  };
}
function json(res, status, body, method) {const bytes = Buffer.from(JSON.stringify(body));res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Content-Length':bytes.length, 'Cache-Control':'no-store'});res.end(method === 'HEAD' ? undefined : bytes);}
