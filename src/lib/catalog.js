import { useSyncExternalStore } from 'react';
import { CONFIG, rp } from '../config.js';

/*
 * Katalog produk dari ERP (Master Produk) lewat /bff/products. Diambil SEKALI per halaman dan dipakai
 * bersama oleh kartu paket, form order, ongkir, dan halaman VIP.
 * Nama/judul, harga, harga coret, deskripsi singkat, foto, label unggulan, dan status stok diatur di Master Produk.
 * Produk MANA yang tampil di Landing Utama / VIP / Konsultan diatur di ERP → Landing Page CMS → Produk per Halaman
 * (dikirim sebagai `pages`). CONFIG.packages di config.js hanya cadangan kalau ERP tidak bisa dihubungi.
 */
let state = { loaded: false, failed: false, list: [], bySlug: {}, pages: {} };
const subs = new Set();
let started = false;

function emit(next) {
  state = next;
  subs.forEach((fn) => fn());
}

function load() {
  if (started || typeof window === 'undefined') return;
  started = true;
  fetch('/bff/products', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j) => {
      const list = Array.isArray(j?.data) ? j.data : [];
      const bySlug = {};
      list.forEach((p) => { bySlug[p.slug] = p; });
      // Produk per halaman dari ERP (Landing Page CMS → Produk per Halaman). null = belum diatur → bawaan di kode.
      const pages = j?.pages && typeof j.pages === 'object' ? j.pages : {};
      emit({ loaded: true, failed: false, list, bySlug, pages });
    })
    .catch(() => emit({ ...state, loaded: true, failed: true }));
}

const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
const snapshot = () => state;

export function useCatalog() {
  load();
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Foto bawaan seeder (default-*) tidak dipakai di kartu: kartu tetap memakai susunan foto produk landing. */
export const uploadedImage = (url) => (url && !/\/default-[^/]*$/.test(url) ? url : null);

const saveText = (price, compare) => (compare && compare > price ? `Hemat ${rp(compare - price)}` : '');

/** Satu produk ERP → bentuk paket yang dipakai komponen landing. */
function fromErp(p, i) {
  const price = Number(p.price || 0);
  const compare = p.compare_price ? Number(p.compare_price) : null;
  return {
    slug: p.slug,
    title: p.landing_title || p.name,
    price,
    compare,
    save: saveText(price, compare),
    desc: p.tagline || '',
    hot: !!p.is_featured,
    image: uploadedImage(p.image_url),
    inStock: p.in_stock !== false,
    qty: i + 1, // hanya untuk susunan foto cadangan
  };
}

/** Paket cadangan dari config.js, ditimpa data ERP (harga, stok, judul) bila produknya ada. */
function fromConfig(c, i, bySlug) {
  const e = bySlug[c.slug];
  if (e) return { ...fromErp(e, i), title: e.landing_title || c.title, desc: e.tagline || c.desc, qty: c.qty };
  return { slug: c.slug, title: c.title, price: c.price, compare: c.compare || null, save: saveText(c.price, c.compare), desc: c.desc, hot: !!c.hot, image: null, inStock: true, qty: c.qty };
}

/**
 * Slug pilihan ERP untuk satu slot halaman, hanya yang produknya ada di katalog.
 * Mengembalikan null kalau halaman/slot belum diatur di ERP (pakai bawaan di kode).
 */
export function pageSlugs(cat, page, slot) {
  const v = cat.pages?.[page]?.[slot];
  if (v == null) return null;
  return (Array.isArray(v) ? v : [v]).filter((s) => s && cat.bySlug[s]);
}

/** Halaman sudah diatur di ERP (ada di `pages` dan tidak null). */
export const pageConfigured = (cat, page) => !!cat.pages?.[page];

/** Pilihan paket landing utama: kartu "Landing Utama" di Landing Page CMS (urutan ikut ERP). */
export function useLandingPackages() {
  const cat = useCatalog();
  const chosen = pageSlugs(cat, 'main', 'package');
  if (chosen && chosen.length) return chosen.map((slug, i) => fromErp(cat.bySlug[slug], i));
  // ERP lama (belum ada `pages`): ikuti penanda on_landing dari Master Produk
  const onLanding = cat.list
    .filter((p) => p.on_landing)
    .sort((a, b) => (a.landing_order ?? 0) - (b.landing_order ?? 0));
  if (onLanding.length) return onLanding.map(fromErp);
  return CONFIG.packages.map((c, i) => fromConfig(c, i, cat.bySlug));
}

/** Harga utama untuk teks promosi (topbar, hero, penawaran): paket pertama di landing. */
export function useMainPrice() {
  const first = useLandingPackages()[0];
  const price = first?.price || CONFIG.price;
  const compare = first?.compare && first.compare > price ? first.compare : null;
  return { price, compare, save: compare ? compare - price : 0 };
}
