import { useEffect, useState } from 'react';

/*
 * Data pengiriman checkout (tanpa RajaOngkir/Komship): pembeli mengetik alamat lengkap sendiri,
 * tim gudang yang membuat resi. Dipakai landing utama & halaman VIP.
 */
export const PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung',
  'Bengkulu', 'Lampung', 'DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Bali',
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur',
  'Kalimantan Utara', 'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan',
];

export const EMPTY_SHIP = { email: '', province: '', city: '', district: '', postal: '', addr: '' };

export const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Field yang belum valid → true. */
export function shipErrors(s) {
  return {
    email: !emailOk(s.email),
    province: !s.province,
    city: s.city.trim().length < 3,
    district: s.district.trim().length < 3,
    postal: s.postal !== '' && !/^\d{5}$/.test(s.postal.trim()),
    addr: s.addr.trim().length < 8,
  };
}

export const SHIP_ORDER = ['email', 'province', 'city', 'district', 'postal', 'addr'];

/** Bagian `customer` untuk API order. */
export function shipPayload(s) {
  return {
    email: s.email.trim().toLowerCase().slice(0, 120),
    province: s.province.slice(0, 80),
    city: s.city.trim().slice(0, 80),
    district: s.district.trim().slice(0, 80),
    postal_code: s.postal.trim().slice(0, 10),
    address: s.addr.trim().slice(0, 300),
  };
}

export const shipText = (s) => [s.addr.trim(), s.district.trim() && `Kec. ${s.district.trim()}`, s.city.trim(), s.province, s.postal.trim()].filter(Boolean).join(', ');

/*
 * Ongkir per produk diatur di ERP (Master Produk: gratis ongkir / ongkir flat).
 * Satu pesanan = ongkir flat tertinggi dari produk yang tidak gratis ongkir (sama dengan perhitungan ERP).
 */
let feeCache = null;
export function useShippingFee(slugs) {
  const [fees, setFees] = useState(feeCache);
  useEffect(() => {
    if (feeCache) return undefined;
    let alive = true;
    fetch('/bff/products', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then((r) => r.json())
      .then((j) => {
        const map = {};
        (j?.data || []).forEach((p) => { map[p.slug] = Number(p.shipping_fee || 0); });
        feeCache = map;
        if (alive) setFees(map);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!fees) return 0;
  return slugs.reduce((max, s) => Math.max(max, fees[s] || 0), 0);
}
