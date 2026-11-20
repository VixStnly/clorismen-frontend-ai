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
let loading = null;
const listeners = new Set();

export const getWaNumber = () => current;

export function loadWaNumber() {
  if (loading || typeof window === 'undefined') return loading;
  loading = fetch('/bff/config', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
    .then((r) => r.json())
    .then((j) => {
      const n = clean(j?.data?.content?.brand?.whatsapp_number);
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

export const waHref = (txt) => `https://wa.me/${current}?text=${encodeURIComponent(txt)}`;
