// Meta Pixel ringan. Tidak memuat apa pun kalau VIP.metaPixelId masih null.
import { VIP } from './vipConfig.js';

let loaded = false;
const fired = new Set();

export function initPixel() {
  if (loaded || !VIP.metaPixelId || typeof window === 'undefined') return;
  loaded = true;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', VIP.metaPixelId);
  window.fbq('track', 'PageView');
}

/** Kirim event standar Meta. `once` = hanya sekali per kunjungan. */
export function track(event, params = {}, once = true) {
  if (!VIP.metaPixelId || typeof window === 'undefined' || !window.fbq) return;
  if (once && fired.has(event)) return;
  fired.add(event);
  window.fbq('track', event, params);
}
