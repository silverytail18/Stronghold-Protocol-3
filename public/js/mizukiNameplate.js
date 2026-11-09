import { h } from '../vendor/preact.module.js';
import { useLayoutEffect, useState } from '../vendor/hooks.module.js';
import { html } from './ui/components.js';
import { acquireResourceUrl, resourceCache } from './resourceCache.js';
import { nameplateFor } from '../../shared/nameplates.js';

// This accessor deliberately never uses availableBlob: optional art must not download on render.
export function cachedNameplateSource(id, variant = 'long') {
  const row = nameplateFor(id);
  if (!row) return null;
  const url = row[variant] || row.long || row.short;
  return url && resourceCache.isCached(url) ? url : null;
}

export function useNameplateUrl(id, variant = 'long') {
  const [revision, refresh] = useState(0);
  const [loaded, setLoaded] = useState(null);
  const src = cachedNameplateSource(id, variant);
  useLayoutEffect(() => {
    let previous = cachedNameplateSource(id, variant);
    return resourceCache.subscribe(() => {
      const next = cachedNameplateSource(id, variant);
      if (next !== previous) { previous = next; refresh(n => n + 1); }
    });
  }, [id, variant]);
  useLayoutEffect(() => {
    let cancelled = false, resource, image;
    if (!src) { setLoaded(null); return undefined; }
    acquireResourceUrl(src, { cachedOnly: true }).then(handle => {
      if (cancelled) { handle.release(); return; }
      resource = handle;
      image = new Image();
      image.onload = () => { if (!cancelled) setLoaded({ src, url: handle.url }); };
      image.onerror = () => { if (!cancelled) setLoaded(null); };
      image.src = handle.url;
    }).catch(() => { if (!cancelled) setLoaded(null); });
    return () => {
      cancelled = true;
      if (image) image.onload = image.onerror = null;
      resource?.release();
    };
  }, [src, revision]);
  return loaded?.src === src ? loaded.url : undefined;
}

/** The wrapper keeps the original DOM layout and default class when optional art is absent. */
export function Nameplate({ as = 'div', nameplate = '', variant = 'long', hideUncached = false, class: cls = '', children, ...props }) {
  const native = nameplateFor(nameplate)?.game === 'arknights';
  const url = useNameplateUrl(nameplate, native ? 'long' : variant);
  if (hideUncached && !url) return null;
  return h(as, { ...props, class: `${cls}${url ? ' has-nc' : ''}` },
    url ? native ? html`<span class="nc-layer nc-layer--native" aria-hidden="true"><svg class="nc-native-art" viewBox=${variant === 'short' ? '20 1 530 134' : '20 1 960 134'} preserveAspectRatio="xMaxYMid slice"><image href=${url} x="0" y="0" width="1000" height="172" /></svg></span>` : html`<span class="nc-layer" aria-hidden="true" style=${{ '--nc': `url("${url}")` }}></span>` : null,
    children);
}

