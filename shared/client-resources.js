// The native clients pin this contract. A new clientLine or epoch requires a new installer.
export const RESOURCE_CONTRACT = 2;
export const CLIENT_LINE = '1.2';
export const RESOURCE_EPOCH = 1;
export const CLIENT_BUILD = 49;
export const SHA256 = /^[a-f0-9]{64}$/;
export function resourcePath(value) {
  return typeof value === 'string' && value.length <= 1024
    && /^\/(?:assets|fonts|icons)\/[A-Za-z0-9_@.,+~()!\[\]\-/]+$/.test(value)
    && !value.slice(1).split('/').some(part => part === '.' || part === '..' || part === '')
    || ['/data/assets.json', '/data/local-assets.json', '/data/local-fx.json'].includes(value);
}
export function validateResourceManifest(doc) {
  if (doc?.format !== 1 || doc.contract !== RESOURCE_CONTRACT || !/^\d+\.\d+$/.test(doc.clientLine)
    || !Number.isSafeInteger(doc.epoch) || doc.epoch < 1 || !Array.isArray(doc.files)
    || !doc.files.length || doc.files.length > 100000) throw Error('Invalid resource manifest');
  let previous = '', total = 0;
  for (const file of doc.files) {
    if (!resourcePath(file.path) || file.path <= previous || !SHA256.test(file.sha256)
      || !Number.isSafeInteger(file.size) || file.size < 0 || file.size > 512 * 1024 * 1024
      || typeof file.mime !== 'string' || !/^[a-z0-9.+-]+\/[a-z0-9.+-]+(?:; charset=utf-8)?$/.test(file.mime)) throw Error('Invalid resource entry');
    previous = file.path; total += file.size;
  }
  if (total > 8 * 1024 ** 3) throw Error('Resource generation exceeds limit');
  return doc;
}
export function clientCompatibility(descriptor, capability) {
  if (!descriptor || !capability || descriptor.contract !== capability.contract
    || descriptor.clientLine !== capability.clientLine || descriptor.epoch !== capability.epoch
    || capability.build < descriptor.minBuild) return 'installer';
  if (descriptor.resourceHash === capability.resourceHash) return 'ready';
  return descriptor.updates?.some(update => update.from === capability.resourceHash && update.to === descriptor.resourceHash) ? 'patch' : 'installer';
}
