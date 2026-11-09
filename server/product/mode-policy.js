import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {PRODUCT_MODES, productMode} from '../../shared/product-modes.js';

const fail = (status, message) => {throw Object.assign(Error(message), {status});};

/** Independent product admission settings; never alters a running Match's rules or state. */
export class ProductModePolicy {
  constructor(directory) {
    this.filename = path.join(directory, 'product-mode-policy.json');
    this.queue = Promise.resolve();
    this.doc = {format: 1, revision: 0, modes: Object.fromEntries(PRODUCT_MODES.map(mode => [mode.id, {enabled: mode.defaultEnabled}])), audit: []};
  }
  validate(doc) {
    if (doc?.format !== 1 || !Number.isSafeInteger(doc.revision) || doc.revision < 0 || !doc.modes || typeof doc.modes !== 'object' || Array.isArray(doc.modes) || !Array.isArray(doc.audit)) throw Error('玩法开放设置格式未知，拒绝覆盖');
    for (const mode of PRODUCT_MODES) {
      const rule = doc.modes[mode.id];
      if (rule !== undefined && (!rule || typeof rule !== 'object' || Array.isArray(rule) || typeof rule.enabled !== 'boolean')) throw Error('玩法开放设置无效，拒绝覆盖');
    }
  }
  static async load(directory) {
    const result = new ProductModePolicy(directory);
    try {
      if ((await fs.lstat(result.filename)).isSymbolicLink()) throw Error('玩法设置不能为符号链接');
      const bytes = await fs.readFile(result.filename);
      if (bytes.length > 256 * 1024) throw Error('玩法设置过大');
      const doc = JSON.parse(bytes); result.validate(doc);
      // Fill newly registered modes only; preserve existing settings and unknown future records.
      result.doc = {...doc, modes: {...result.doc.modes, ...doc.modes}};
    } catch (error) {if (error.code !== 'ENOENT') throw error;}
    return result;
  }
  permits(id) {return !!productMode(id) && this.doc.modes[id]?.enabled === true;}
  reason(id) {return productMode(id) ? `${productMode(id).name}暂未开放，请等待管理员开放` : '此玩法尚未开放';}
  view() {
    return {revision: this.doc.revision, modes: PRODUCT_MODES.map(mode => ({...mode, rules: [...mode.rules], enabled: this.permits(mode.id)}))};
  }
  update(body, actor, authorize = () => {}) {
    const job = this.queue.then(async () => {
      authorize();
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !['revision', 'modes'].includes(key)) || !Array.isArray(body.modes) || !body.modes.length || body.modes.length > PRODUCT_MODES.length) fail(400, '玩法设置请求无效');
      if (body.revision !== this.doc.revision) fail(409, '玩法开放设置已变化，请刷新后重试');
      if (this.doc.revision === Number.MAX_SAFE_INTEGER) fail(409, '玩法设置修订号已达上限');
      const next = structuredClone(this.doc), seen = new Set();
      for (const rule of body.modes) {
        if (!rule || typeof rule !== 'object' || Array.isArray(rule) || Object.keys(rule).some(key => !['id', 'enabled'].includes(key)) || !productMode(rule.id) || seen.has(rule.id) || typeof rule.enabled !== 'boolean') fail(400, '玩法设置包含未知、重复或无效项目');
        seen.add(rule.id); next.modes[rule.id] = {...next.modes[rule.id], enabled: rule.enabled};
      }
      next.revision++;
      next.audit = [...next.audit, {revision: next.revision, actor, at: new Date().toISOString(), modes: structuredClone(body.modes)}].slice(-1000);
      await fs.mkdir(path.dirname(this.filename), {recursive: true, mode: 0o700});
      try {if ((await fs.lstat(this.filename)).isSymbolicLink()) throw Error('玩法设置路径被替换');} catch (error) {if (error.code !== 'ENOENT') throw error;}
      const temporary = this.filename + '.' + randomUUID() + '.tmp';
      try {await fs.writeFile(temporary, JSON.stringify(next, null, 2) + '\n', {flag: 'wx', mode: 0o600}); await fs.rename(temporary, this.filename);}
      finally {await fs.rm(temporary, {force: true});}
      this.doc = next;
      return this.view();
    });
    this.queue = job.catch(() => {});
    return job;
  }
  async handle(req, res, auth) {
    const send = (status, value) => {const bytes = Buffer.from(JSON.stringify(value)); res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': bytes.length}); res.end(req.method === 'HEAD' ? undefined : bytes);};
    try {
      const session = auth.session(req), actor = auth.authorize(session, true);
      if (['GET', 'HEAD'].includes(req.method)) {send(200, this.view()); return;}
      if (req.method !== 'PUT') {send(405, {error: '仅支持 GET、HEAD 和 PUT'}); return;}
      if (!auth.sameOrigin(req)) fail(403, '请求来源不允许');
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, '请使用 JSON 请求');
      if (auth.accountLimiter.take(actor.username, auth.now())) fail(429, '操作过于频繁，请稍后重试');
      let size = 0; const chunks = [];
      for await (const chunk of req) {size += chunk.length; if (size > 8192) fail(413, '请求过大'); chunks.push(chunk);}
      let body; try {body = JSON.parse(Buffer.concat(chunks));} catch {fail(400, 'JSON 格式错误');}
      send(200, await this.update(body, actor.accountId, () => auth.authorize(session, true)));
    } catch (error) {send(error.status || 500, {error: error.status ? error.message : '玩法开放设置保存失败，原配置保持'});}
  }
}
