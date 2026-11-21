import { useEffect, useSyncExternalStore } from 'react';

// Nomor WhatsApp admin diambil dari ERP (Landing Page CMS → Brand → Nomor WhatsApp).
// Ganti nomor cukup di ERP; landing tidak perlu di-build ulang.
// Nomor terakhir dari ERP disimpan di browser supaya link langsung benar di kunjungan berikutnya.
// EMERGENCY_FALLBACK hanya dipakai kalau ERP tidak bisa dihubungi DAN browser belum pernah menyimpan nomor.
const EMERGENCY_FALLBACK = '6285217866413';
const CACHE_KEY = 'clorismen_wa_number';

const clean = (n) => {
  let d = String(n || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return /^62\d{8,13}$/.test(d) ? d : '';
};

const readCache = () => {
  try { return clean(window.localStorage.getItem(CACHE_KEY)); } catch { return ''; }
};

let current = (typeof window !== 'undefined' && readCache()) || EMERGENCY_FALLBACK;
// Data Brand lengkap dari ERP (Landing Page CMS → Brand): nama, alamat, email, sosial media, catatan footer.
let brand = null;
let loading = null;
const listeners = new Set();

export const getWaNumber = () => current;

export function loadWaNumber() {
  if (loading || typeof window === 'undefined') return loading;
  loading = fetch('/bff/config', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
    .then((r) => r.json())
    .then((j) => {
      const b = j?.data?.content?.brand;
      if (b && typeof b === 'object') {
        brand = b;
        listeners.forEach((fn) => fn());
      }
      const n = clean(b?.whatsapp_number);
      if (!n) return;
      try { window.localStorage.setItem(CACHE_KEY, n); } catch { /* mode privat */ }
      if (n !== current) {
        current = n;
        listeners.forEach((fn) => fn());
      }
    })
    .catch(() => { /* tetap pakai nomor tersimpan */ });
  return loading;
}

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

/** Pakai di komponen yang menampilkan link WA, supaya ikut berubah saat nomor dari ERP datang. */
export function useWaNumber() {
  useEffect(() => { loadWaNumber(); }, []);
  return useSyncExternalStore(subscribe, getWaNumber, getWaNumber);
}

const getBrand = () => brand;

/** Data Brand dari ERP untuk footer (null selama belum termuat). */
export function useBrand() {
  useEffect(() => { loadWaNumber(); }, []);
  useSyncExternalStore(subscribe, getWaNumber, getWaNumber);
  return useSyncExternalStore(subscribe, getBrand, getBrand);
}

/** 6281234567890 → 0812-3456-7890 */
export const fmtWa = (n) => {
  const d = String(n || '').replace(/^62/, '0');
  return d.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
};

/** Link sosial media / marketplace Brand yang sudah diisi di ERP. */
export const brandSocials = (b) => [
  ['instagram_url', 'fa-brands fa-instagram', 'Instagram'],
  ['tiktok_url', 'fa-brands fa-tiktok', 'TikTok'],
  ['shopee_url', 'fa-solid fa-bag-shopping', 'Shopee'],
  ['tiktokshop_url', 'fa-solid fa-store', 'TikTok Shop'],
].filter(([k]) => /^https?:\/\//i.test(String(b?.[k] || ''))).map(([k, icon, label]) => ({ href: b[k], icon, label }));

export const waHref = (txt) => `https://wa.me/${current}?text=${encodeURIComponent(txt)}`;
