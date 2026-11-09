// Administrator-managed personalized emote packs.
//
// A pack is a small, self-contained folder under <state>/emote-packs/<pack-id>/ plus one JSON index.
// No game resource is imported here: the administrator uploads images from the admin page, and the
// server only serves those images back to logged-in clients. The 14 四风 slots always exist; an
// empty slot stays visible in the client and is filled only when an image is imported for it.
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { SIFENG_EMOTES } from '../../shared/chatStickers.js';

const FORMAT = 1;
const MAX_PACKS = 20;
const MAX_IMAGES = 14;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = 32 * 1024 * 1024;
const ID_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const GROUPS = new Set(['personal', 'covenant']);

const fail = (status, message) => { throw Object.assign(Error(message), { status }); };
const cleanText = (value, max) => typeof value === 'string' && Array.from(value).length <= max
  && !/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/.test(value);

const IMAGE_TYPES = [
  { type: 'image/png', ext: 'png', magic: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: 'image/jpeg', ext: 'jpg', magic: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/gif', ext: 'gif', magic: (b) => b.length >= 6 && b.subarray(0, 3).toString('latin1') === 'GIF' },
  { type: 'image/webp', ext: 'webp', magic: (b) => b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
];

function detectImage(buffer) {
  return IMAGE_TYPES.find((entry) => entry.magic(buffer)) || null;
}

function decodeImage(image) {
  if (!image || typeof image !== 'object') fail(400, '图片数据无效');
  const raw = typeof image.data === 'string' ? image.data.replace(/^data:[^;]+;base64,/, '') : '';
  if (!raw || raw.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 8) fail(413, '图片过大');
  let buffer;
  try { buffer = Buffer.from(raw, 'base64'); } catch { fail(400, '图片数据无效'); }
  if (!buffer?.length || buffer.length > MAX_IMAGE_BYTES) fail(413, '图片过大');
  const kind = detectImage(buffer);
  if (!kind) fail(415, '不支持的图片格式');
  return { buffer, type: kind.type, ext: kind.ext };
}

function stickerIdFor(packId, slot) {
  return packId === 'sifeng' ? SIFENG_EMOTES[slot].id : `pack.${packId}.${slot}`;
}

function publicSticker(pack, sticker) {
  return {
    id: sticker.id,
    label: sticker.label,
    slot: sticker.slot,
    src: `/chat-stickers/file/${encodeURIComponent(pack.id)}/${encodeURIComponent(sticker.file)}?v=${Number(pack.updatedAt || pack.createdAt) || 0}`,
    bytes: sticker.bytes,
    type: sticker.type,
  };
}

export class EmotePacks {
  constructor({ directory, log = console } = {}) {
    if (!directory) throw Error('emote packs need a state directory');
    this.directory = directory;
    this.root = path.join(directory, 'emote-packs');
    this.indexFile = path.join(this.root, 'index.json');
    this.log = log;
    this.index = { format: FORMAT, revision: 0, packs: [] };
    this.byId = new Set();
    this.onChange = null;
  }

  async load() {
    await fs.mkdir(this.root, { recursive: true, mode: 0o700 });
    for (const entry of await fs.readdir(this.root, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith('.tmp-')) {
        await fs.rm(path.join(this.root, entry.name), { recursive: true, force: true }).catch(() => {});
      }
    }
    try {
      const parsed = JSON.parse(await fs.readFile(this.indexFile, 'utf8'));
      if (parsed?.format === FORMAT && Array.isArray(parsed.packs)) {
        this.index = {
          format: FORMAT,
          revision: Number.isSafeInteger(parsed.revision) ? parsed.revision : 0,
          packs: parsed.packs.filter((pack) => this.validStoredPack(pack)),
        };
      }
    } catch (error) {
      if (error.code !== 'ENOENT') this.log.warn?.('[emote-packs] index unreadable; starting empty', error.message);
    }
    this.rebuild();
    return this;
  }

  validStoredPack(pack) {
    if (!pack || typeof pack !== 'object' || !ID_RE.test(pack.id || '') || !GROUPS.has(pack.group)
      || !cleanText(pack.label, 24) || !Array.isArray(pack.stickers) || pack.stickers.length > MAX_IMAGES) return false;
    return pack.stickers.every((sticker, index) => sticker && Number.isSafeInteger(sticker.slot)
      && sticker.slot >= 0 && sticker.slot < MAX_IMAGES && sticker.slot === index
      && /^[a-z0-9_-]{1,40}\.(?:png|jpg|gif|webp)$/i.test(sticker.file || '')
      && Number.isSafeInteger(sticker.bytes) && sticker.bytes > 0 && sticker.bytes <= MAX_IMAGE_BYTES
      && IMAGE_TYPES.some((entry) => entry.type === sticker.type));
  }

  rebuild() {
    this.byId = new Set();
    for (const pack of this.index.packs) {
      for (const sticker of pack.stickers) {
        const id = stickerIdFor(pack.id, sticker.slot);
        sticker.id = id;
        this.byId.add(id);
      }
    }
  }

  has(id) {
    return typeof id === 'string' && this.byId.has(id);
  }

  catalog() {
    return {
      format: FORMAT,
      revision: this.index.revision,
      slots: SIFENG_EMOTES.map(({ id, label, slot }) => ({ id, label, slot })),
      packs: this.index.packs.map((pack) => ({
        id: pack.id,
        label: pack.label,
        group: pack.group,
        updatedAt: pack.updatedAt || pack.createdAt || 0,
        stickers: pack.stickers.map((sticker) => publicSticker(pack, sticker)),
      })),
    };
  }

  async importPack(body) {
    if (!body || typeof body !== 'object') fail(400, '请求格式无效');
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const group = typeof body.group === 'string' ? body.group : 'personal';
    if (!ID_RE.test(id)) fail(400, '表情包 ID 无效（小写字母、数字、-、_，最多 32 位）');
    if (!cleanText(label, 24) || !label) fail(400, '表情包名称无效');
    if (!GROUPS.has(group)) fail(400, '分组无效');
    if (id === 'sifeng' && group !== 'personal') fail(400, '四风只能放在个性化分组');
    const images = Array.isArray(body.images) ? body.images : [];
    if (!images.length) fail(400, '请选择图片');
    if (images.length > MAX_IMAGES) fail(400, `最多 ${MAX_IMAGES} 张图片`);
    const decoded = images.map((image) => decodeImage(image));
    const total = decoded.reduce((sum, image) => sum + image.buffer.length, 0);
    if (total > MAX_REQUEST_BYTES) fail(413, '图片总大小过大');
    if (this.index.packs.length >= MAX_PACKS && !this.index.packs.some((pack) => pack.id === id)) fail(409, `最多 ${MAX_PACKS} 个表情包`);

    const existing = this.index.packs.find((pack) => pack.id === id);
    const createdAt = existing?.createdAt || Date.now();
    const temp = path.join(this.root, `.tmp-${randomUUID()}`);
    const final = path.join(this.root, id);
    const stickers = [];
    try {
      await fs.mkdir(temp, { recursive: true, mode: 0o700 });
      for (let slot = 0; slot < decoded.length; slot += 1) {
        const image = decoded[slot];
        const file = `${slot}.${image.ext}`;
        await fs.writeFile(path.join(temp, file), image.buffer, { mode: 0o600 });
        stickers.push({
          slot,
          file,
          bytes: image.buffer.length,
          type: image.type,
          label: id === 'sifeng' ? SIFENG_EMOTES[slot].label : `${label} ${slot + 1}`,
          id: stickerIdFor(id, slot),
        });
      }
      await fs.rm(final, { recursive: true, force: true });
      await fs.rename(temp, final);
    } catch (error) {
      await fs.rm(temp, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
    const pack = { id, label, group, createdAt, updatedAt: Date.now(), stickers };
    this.index = {
      format: FORMAT,
      revision: this.index.revision + 1,
      packs: [...this.index.packs.filter((entry) => entry.id !== id), pack],
    };
    await this.save();
    this.onChange?.();
    return pack;
  }

  async deletePack(id) {
    if (!ID_RE.test(id || '')) fail(400, '表情包 ID 无效');
    const pack = this.index.packs.find((entry) => entry.id === id);
    if (!pack) fail(404, '表情包不存在');
    await fs.rm(path.join(this.root, id), { recursive: true, force: true });
    this.index = {
      format: FORMAT,
      revision: this.index.revision + 1,
      packs: this.index.packs.filter((entry) => entry.id !== id),
    };
    await this.save();
    this.onChange?.();
    return pack;
  }

  async save() {
    const temp = `${this.indexFile}.${randomUUID()}.tmp`;
    await fs.writeFile(temp, `${JSON.stringify(this.index, null, 2)}\n`, { mode: 0o600 });
    await fs.rename(temp, this.indexFile);
    this.rebuild();
  }

  fileFor(packId, file) {
    if (!ID_RE.test(packId || '')) return null;
    const pack = this.index.packs.find((entry) => entry.id === packId);
    if (!pack) return null;
    const sticker = pack.stickers.find((entry) => entry.file === file);
    if (!sticker) return null;
    return { pack, sticker, path: path.join(this.root, pack.id, sticker.file) };
  }

  async handle(req, res, pathname, auth) {
    const send = (status, body, headers = {}) => {
      const bytes = Buffer.from(JSON.stringify(body));
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': bytes.length, ...headers });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    };
    try {
      const session = auth.session(req);
      const actor = auth.authorize(session);
      if (pathname === '/chat-stickers/catalog') {
        if (!['GET', 'HEAD'].includes(req.method)) { send(405, { error: 'Method not allowed' }); return; }
        send(200, this.catalog());
        return;
      }
      if (pathname.startsWith('/chat-stickers/file/')) {
        if (!['GET', 'HEAD'].includes(req.method)) { send(405, { error: 'Method not allowed' }); return; }
        const parts = pathname.slice('/chat-stickers/file/'.length).split('/');
        if (parts.length !== 2) { send(404, { error: '文件不存在' }); return; }
        let packId, file;
        try { packId = decodeURIComponent(parts[0]); file = decodeURIComponent(parts[1]); } catch { send(400, { error: '路径无效' }); return; }
        const found = this.fileFor(packId, file);
        if (!found) { send(404, { error: '文件不存在' }); return; }
        const bytes = await fs.readFile(found.path);
        res.writeHead(200, {
          'Content-Type': found.sticker.type,
          'Content-Length': bytes.length,
          'Cache-Control': 'private, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(req.method === 'HEAD' ? undefined : bytes);
        return;
      }
      if (pathname === '/auth/admin/chat-stickers') {
        auth.authorize(session, true);
        if (req.method === 'GET' || req.method === 'HEAD') { send(200, this.catalog()); return; }
        if (req.method !== 'POST') { send(405, { error: 'Method not allowed' }); return; }
        if (!auth.sameOrigin(req)) { send(403, { error: '请求来源不允许' }); return; }
        if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) { send(415, { error: '请使用 JSON' }); return; }
        const body = await readJson(req, Math.ceil(MAX_REQUEST_BYTES * 4 / 3) + 2 * 1024 * 1024);
        const pack = await this.importPack(body);
        this.log.info?.(`[emote-packs] ${actor.username} imported ${pack.id} (${pack.stickers.length} images)`);
        send(200, { ok: true, pack: this.catalog().packs.find((entry) => entry.id === pack.id) });
        return;
      }
      if (pathname.startsWith('/auth/admin/chat-stickers/')) {
        auth.authorize(session, true);
        if (req.method !== 'DELETE') { send(405, { error: 'Method not allowed' }); return; }
        if (!auth.sameOrigin(req)) { send(403, { error: '请求来源不允许' }); return; }
        let id;
        try { id = decodeURIComponent(pathname.slice('/auth/admin/chat-stickers/'.length)); } catch { send(400, { error: '路径无效' }); return; }
        const pack = await this.deletePack(id);
        this.log.info?.(`[emote-packs] ${actor.username} deleted ${pack.id}`);
        send(200, { ok: true });
        return;
      }
      send(404, { error: '接口不存在' });
    } catch (error) {
      if (!error.status) this.log.error?.('[emote-packs]', error.message);
      if (!res.headersSent) send(error.status || 500, { error: error.status ? error.message : '表情包服务不可用' });
      else res.destroy();
    }
  }
}

async function readJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) fail(413, '请求过大');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, '请求格式无效'); }
}

export async function createEmotePacks({ directory, log = console } = {}) {
  return new EmotePacks({ directory, log }).load();
}
