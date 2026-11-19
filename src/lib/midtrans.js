export function loadMidtransSnap(snapJsUrl, clientKey) {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve(window.snap);
    const existing = document.querySelector('script[data-midtrans-snap="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.snap));
      existing.addEventListener('error', () => reject(new Error('Gagal memuat sistem pembayaran online.')));
      return;
    }
    const script = document.createElement('script');
    script.src = snapJsUrl;
    script.setAttribute('data-client-key', clientKey);
    script.setAttribute('data-midtrans-snap', '1');
    script.async = true;
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat skrip pembayaran online.'));
    document.body.appendChild(script);
  });
}
