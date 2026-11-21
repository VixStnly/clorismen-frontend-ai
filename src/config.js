/* =========================================================
   KONFIGURASI — ubah di sini
   ========================================================= */
import { waHref } from './lib/waNumber.js';

export const CONFIG = {
  // Nomor WA admin TIDAK diatur di sini: diambil dari ERP (Landing Page CMS → Brand), lihat src/lib/waNumber.js
  promoEnd: '2026-11-30T23:59:59+07:00',     // GANTI: tanggal akhir promo (jujur)
  endText: '30 November 2026',
  price: 199000, normal: 332000,            // cadangan; harga tampil diambil dari paket pertama di ERP
  serumPrice: null, sunPrice: null,          // GANTI: harga satuan serum & sunscreen, contoh 89000
  quotaLeft: null, quotaTotal: null,         // isi angka asli kalau mau tampilkan kuota, mis. 37 & 100
  // CADANGAN SAJA. Pilihan paket (judul, harga, harga coret, deskripsi, foto, stok, urutan) diatur dari
  // ERP → Master Produk → Edit → "Tampilan di Landing". Daftar di bawah hanya dipakai kalau ERP tidak bisa dihubungi.
  packages: [
    { qty: 1, slug: 'clean-skin-series-1-paket', title: '1 Paket', price: 199000, compare: 332000, desc: 'Untuk ±1 bulan pemakaian' },
    { qty: 2, slug: 'clean-skin-series-2-paket', title: '2 Paket', price: 379000, compare: 664000, desc: 'Untuk ±2 bulan, pas buat lihat hasil maksimal', hot: true },
    { qty: 3, slug: 'clean-skin-series-3-paket', title: '3 Paket', price: 549000, compare: 996000, desc: 'Bonus tambahan + bisa patungan bareng temen' },
  ],
};

export const rp = (n) => 'Rp' + n.toLocaleString('id-ID');
export const waLink = (txt = 'Halo admin Clorismen, saya mau tanya soal Clean Skin Series') => waHref(txt);

/* ---------- Aset ---------- */
// Foto dipakai dari folder images/ (lokal). Kalau file belum ada, otomatis coba ambil dari Google Drive.
export const drive = (id, w = 900) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;
export const LOCAL = {
  // WebP ringan hasil tools/optimize_images.py (PNG asli 240-320 KB → ±30 KB)
  micellar: '/images/opt/prod-micellar.webp',
  facewash: '/images/opt/prod-facewash.webp',
  serum: '/images/opt/prod-serum.webp',
  sunscreen: '/images/opt/prod-sunscreen.webp',
};
export const pimg = (key) => LOCAL[key];
export const PRODUCTS = {
  micellar: '1KpeOUgl-xCOnrkz46F1p7FH9WelZjmRU',
  facewash: '1mqRriQGwa6B_3dogwR3aQ79jRGmf7h_-',
  serum: '1pORTKmDziFLxiQgx0EbQUHL4bGJ-1NRa',
  sunscreen: '1eDLGw2If5665q90xWDjDk8KHEE0t49QD',
};
/** onError handler: sekali coba ambil dari Google Drive kalau file lokal tidak ada */
export const fbError = (id) => (e) => {
  const el = e.currentTarget;
  if (el.dataset.fb) return;
  el.dataset.fb = '1';
  el.src = drive(id);
};
