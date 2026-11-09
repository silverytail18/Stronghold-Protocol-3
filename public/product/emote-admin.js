import { t, N_ } from '/shared/i18n.js';

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
  reader.onerror = () => reject(reader.error || Error('read failed'));
  reader.readAsDataURL(file);
});

export async function renderEmoteAdmin({ content, api, node, button, panel, status }) {
  const data = await api('/auth/admin/chat-stickers');
  const hasSifeng = data.packs.some((pack) => pack.id === 'sifeng');
  const idInput = node('input', { value: hasSifeng ? `custom-${Date.now().toString(36)}` : 'sifeng', maxLength: 32, autocomplete: 'off' });
  const labelInput = node('input', { value: hasSifeng ? t('自定义表情包') : t('四风表情'), maxLength: 24, autocomplete: 'off' });
  const groupSelect = node('select', {},
    node('option', { value: 'personal' }, t('个性化')),
    node('option', { value: 'covenant' }, t('卫戍协议')));
  const fileInput = node('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true });
  const preview = node('div', { class: 'emote-admin-preview' });
  let files = [];

  const renderPreview = () => {
    preview.replaceChildren(...files.map((file, index) => node('figure', { key: `${file.name}-${index}`, class: 'emote-admin-file' },
      node('img', { src: file.data, alt: file.name }),
      node('figcaption', {}, `${index + 1}. ${file.name}`))));
    if (!files.length) preview.append(node('p', { class: 'emote-admin-empty' }, t('请选择图片')));
  };
  fileInput.addEventListener('change', () => {
    files = Array.from(fileInput.files || []).slice(0, 14);
    renderPreview();
  });

  const importButton = button(t('导入'), async () => {
    if (!files.length) { status(t('请选择图片'), true); return; }
    importButton.disabled = true;
    try {
      const images = await Promise.all(files.map(readFile));
      await api('/auth/admin/chat-stickers', {
        method: 'POST',
        body: JSON.stringify({ id: idInput.value.trim(), label: labelInput.value.trim(), group: groupSelect.value, images }),
      });
      status(t('表情包已导入'));
      await renderEmoteAdmin({ content, api, node, button, panel, status });
    } catch (error) {
      status(error.message, true);
    } finally {
      importButton.disabled = false;
    }
  });

  const form = node('form', { class: 'emote-admin-form', onSubmit: (event) => { event.preventDefault(); void importButton.click(); } },
    node('label', {}, t('表情包 ID'), idInput),
    node('label', {}, t('表情包名称'), labelInput),
    node('label', {}, t('分组'), groupSelect),
    node('label', {}, t('选择图片'), fileInput),
    node('p', { class: 'emote-admin-hint' }, t('支持 PNG、JPEG、GIF、WebP；动图会保留动画。单张不超过 4 MiB。')),
    node('p', { class: 'emote-admin-hint' }, t('四风包请使用 ID sifeng，最多 14 张；其他包按顺序生成表情位。')),
    preview,
    node('div', { class: 'account-actions' }, importButton));

  const packList = node('div', { class: 'emote-admin-packs' });
  if (!data.packs.length) packList.append(node('p', {}, t('暂无表情包')));
  for (const pack of data.packs) {
    const remove = button(t('删除'), async () => {
      if (!globalThis.confirm?.(t('确认删除表情包 {id}？', { id: pack.id }))) return;
      remove.disabled = true;
      try {
        await api(`/auth/admin/chat-stickers/${encodeURIComponent(pack.id)}`, { method: 'DELETE' });
        status(t('表情包已删除'));
        await renderEmoteAdmin({ content, api, node, button, panel, status });
      } catch (error) {
        status(error.message, true);
        remove.disabled = false;
      }
    });
    packList.append(node('article', { class: 'emote-admin-pack' },
      node('header', {},
        node('div', {}, node('b', {}, pack.label), node('small', {}, `${pack.id} · ${pack.group === 'covenant' ? t('卫戍协议') : t('个性化')} · ${pack.stickers.length} ${t('张')}`)),
        remove),
      node('div', { class: 'emote-admin-thumbs' }, pack.stickers.map((sticker) => node('img', {
        key: sticker.id, src: sticker.src, alt: sticker.label, title: sticker.label, loading: 'lazy',
      })))));
  }

  const slots = node('div', { class: 'emote-admin-slots' }, data.slots.map((slot) => node('span', { key: slot.id, class: 'emote-admin-slot' }, `${slot.slot + 1}. ${slot.label}`)));

  content.replaceChildren(node('div', { class: 'account-grid' },
    panel(N_('导入表情包'), form),
    panel(N_('个性化表情包'), node('p', { class: 'emote-admin-hint' }, t('客户端只显示已导入的表情；四风 14 个位置仅用于管理员对照。')),
      slots,
      packList)));
  renderPreview();
}
