// Synchronous SHA-256 for the shared test-rule catalog in a browser Worker.
const K = new Uint32Array(64), H = new Uint32Array(8);
let found = 0;
for (let n = 2; found < 64; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
  if (!prime) continue;
  if (found < 8) H[found] = (Math.sqrt(n) % 1 * 0x100000000) >>> 0;
  K[found++] = (Math.cbrt(n) % 1 * 0x100000000) >>> 0;
}
const rotr = (n, s) => (n >>> s) | (n << (32 - s));
export function sha256(text) {
  const input = new TextEncoder().encode(text);
  const bytes = new Uint8Array(Math.ceil((input.length + 9) / 64) * 64);
  bytes.set(input); bytes[input.length] = 0x80;
  const view = new DataView(bytes.buffer);
  view.setUint32(bytes.length - 8, Math.floor(input.length / 0x20000000));
  view.setUint32(bytes.length - 4, (input.length * 8) >>> 0);
  const h = new Uint32Array(H), w = new Uint32Array(64);
  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = w[i-15], b = w[i-2];
      w[i] = (w[i-16] + (rotr(a,7)^rotr(a,18)^(a>>>3)) + w[i-7] + (rotr(b,17)^rotr(b,19)^(b>>>10))) >>> 0;
    }
    let [a,b,c,d,e,f,g,j] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (j + (rotr(e,6)^rotr(e,11)^rotr(e,25)) + ((e&f)^(~e&g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a,2)^rotr(a,13)^rotr(a,22)) + ((a&b)^(a&c)^(b&c))) >>> 0;
      j=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    [a,b,c,d,e,f,g,j].forEach((v,i)=>{h[i]=(h[i]+v)>>>0;});
  }
  return [...h].map(v=>v.toString(16).padStart(8,'0')).join('');
}
export function createHash(algorithm) {
  if (algorithm !== 'sha256') throw new Error('Unsupported offline digest');
  let value = '';
  return { update(text) { value += text; return this; }, digest(format) {
    if (format !== 'hex') throw new Error('Unsupported offline digest format');
    return sha256(value);
  }};
}
