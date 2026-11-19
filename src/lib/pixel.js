// Meta Pixel untuk landing utama & halaman VIP.
// ID diambil dari env build VITE_META_PIXEL_ID (diisi saat build, mis. Build Variable di Coolify).
// Kalau kosong, tidak ada script yang dimuat dan tidak ada event yang dikirim.
// Pixel ID bersifat publik (ada di source halaman), jadi aman ditaruh di kode.
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || '1815896740050776').trim();

let loaded = false;
const fired = new Set();

export const pixelEnabled = () => !!PIXEL_ID;

export function initPixel() {
  if (loaded || !PIXEL_ID || typeof window === 'undefined') return;
  loaded = true;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

/** Kirim event standar Meta. `once` = hanya sekali per kunjungan. */
export function track(event, params = {}, once = true) {
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
  if (once && fired.has(event)) return;
  fired.add(event);
  window.fbq('track', event, params);
}
