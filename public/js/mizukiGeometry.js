// Emi geometry observer; private to the Mizuki renderer.
export function observeFieldGeometry(host, onResize) {
  let frame = 0, dead = false;
  const scheduleFit = () => {
    if (dead) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { if (!dead) onResize(); });
  };
  const hud = host?.parentElement?.querySelector('.gm__hud');
  const onShopAnimationEnd = event => {
    if (event.animationName === 'shop-up' && event.target?.classList?.contains('shopbar')) scheduleFit();
  };
  hud?.addEventListener('animationend', onShopAnimationEnd);
  const geometryObserver = new ResizeObserver(scheduleFit);
  const observeHud = () => {
    geometryObserver.disconnect();
    if (hud) geometryObserver.observe(hud);
    if (host) geometryObserver.observe(host);
    for (const el of hud?.querySelectorAll('.shopbar, .shopbar__row, .shopbar__tools, .shopbar-tab, .shopbar__capacity, .gm__inventory-pages, .gm__corner') || []) geometryObserver.observe(el);
    const chatToggle = document.querySelector('.sp-chat--match .sp-chat__toggle');
    if (chatToggle) geometryObserver.observe(chatToggle);
    scheduleFit();
  };
  const hudObserver = new MutationObserver(observeHud);
  if (hud) hudObserver.observe(hud, { childList: true });
  observeHud();
  window.addEventListener('resize', scheduleFit);
  window.visualViewport?.addEventListener('resize', scheduleFit);
  window.visualViewport?.addEventListener('scroll', scheduleFit);
  return {
    refresh: scheduleFit,
    destroy() {
      dead = true; cancelAnimationFrame(frame);
      geometryObserver.disconnect(); hudObserver.disconnect();
      hud?.removeEventListener('animationend', onShopAnimationEnd);
      window.removeEventListener('resize', scheduleFit);
      window.visualViewport?.removeEventListener('resize', scheduleFit);
      window.visualViewport?.removeEventListener('scroll', scheduleFit);
    },
  };
}
