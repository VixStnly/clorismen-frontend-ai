# Clorismen Landing Page (React + Vite)

Landing page ini sekarang proyek **React + Vite**. Tampilan (CSS) dan gambar sama persis dengan versi HTML lama
(`index.static.html` disimpan sebagai referensi). Checkout langsung ke **Midtrans Snap** lewat BFF PHP ke ERP.

```
Browser ──> clorismen-landing.local/bff/*   (dist/bff.php, dari static/bff.php)
              │  tanda tangan HMAC-SHA256 + API key (secret hanya ada di server/)
              ▼
            clorismen.local/api/v1/storefront/*   (ERP Laravel → Midtrans Snap)
```

## Struktur

| Path | Isi |
|---|---|
| `src/sections/` | Satu komponen per bagian halaman (markup sama dengan HTML lama) |
| `src/components/` | Bagian interaktif: Coverflow, Order form + Midtrans, FAQ, Paket, Testimoni, Countdown |
| `src/config.js` | **Konfigurasi** (nomor WA, harga, tanggal promo, slug paket ERP) |
| `src/data.js` | Data influencer, produk, testimoni, FAQ |
| `src/styles/landing.css` | CSS asli, tidak diubah. `checkout.css` = tambahan kecil untuk dialog hasil pesanan |
| `images/`, `logo.png` | Gambar (tidak dipindah; ikut disalin ke `dist/` saat build) |
| `static/` | `bff.php`, `.htaccess`, `healthz` → ikut tersalin ke `dist/` |
| `server/` | `StorefrontClient.php` (signer) + `config.local.php` (secret, tidak ikut Git) |

## Setup lokal (sekali)

1. **ERP**: `cd C:\xampp\htdocs\clorismen-erp` lalu
   `php artisan migrate`, `php artisan db:seed --class=LandingPackageSeeder`, `php artisan optimize:clear`
   (seeder membuat 3 produk paket: `clean-skin-series-1-paket`, `-2-paket`, `-3-paket`; **isi HPP-nya di Master Produk**).
2. **API key**: login ERP sebagai God Admin → *Landing Page CMS* → tab *API Key & Keamanan* → buat key baru.
   Salin `server/config.example.php` jadi `server/config.local.php`, isi `api_key` + `api_secret`.
3. **Midtrans**: ERP → *Integrasi* → isi Server Key & Client Key (sandbox dulu) dan aktifkan.
4. **Hosts**: jalankan `setup-hosts.bat` (di folder clorismen-erp) sebagai Administrator.
5. **Apache**: tempel isi `apache-vhost.conf` ke `C:\xampp\apache\conf\extra\httpd-vhosts.conf`, restart Apache.
6. `npm install` lalu `npm run build` → buka http://clorismen-landing.local

## Ngoding

```
npm run dev      # http://localhost:5175 (hot reload), /bff diproxy ke http://clorismen-landing.local
npm run build    # hasil ke dist/ (dipakai vhost)
```

> `npm run dev` butuh `dist/bff.php`, jadi jalankan `npm run build` minimal sekali.

## Pengaturan (`src/config.js`)
- `waNumber` — nomor WhatsApp admin
- `promoEnd` / `endText` — tanggal akhir promo
- `serumPrice`, `sunPrice` — harga satuan serum & sunscreen (tabel perbandingan)
- `quotaLeft`, `quotaTotal` — kuota promo (opsional)
- `packages[].slug` + `price` — harus sama dengan produk paket di ERP. **Harga yang dibayar = harga di ERP.**

## Alur checkout
1. Pengunjung isi form → `POST /bff/order-intents` (item = slug paket, qty 1).
2. ERP membuat order `unpaid` + token Midtrans Snap → popup Snap terbuka.
3. Setelah bayar → `verify-payment` → dialog hasil + tombol WhatsApp. Status final tetap masuk lewat webhook Midtrans ke ERP.
4. COD / Midtrans belum aktif / BFF error → pesanan tetap bisa dikirim lewat WhatsApp admin (tidak ada order yang hilang).

## Deploy ke Coolify (nanti, setelah lokal beres)
Build Pack **Dockerfile**, Port **80**. Isi Environment Variable di Coolify:
`STOREFRONT_API_BASE` (URL ERP publik), `STOREFRONT_API_KEY`, `STOREFRONT_API_SECRET`.
Port mapping `127.0.0.1:3280:80` dan Caddy tetap sama seperti sebelumnya. Cek `https://<domain>/healthz` → `ok`.
