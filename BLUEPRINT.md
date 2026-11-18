# 🧴 Clorismen Landing Page — Clean Skin Series
### Blueprint Rancangan Lengkap · React JS · Modern UI/UX
> **Owner:** Andika · **Dibuat:** 18 Nov 2026 · **Status:** Pre-Development

---

## 📌 Daftar Isi
1. [Overview Proyek](#1-overview-proyek)
2. [Stack & Tech](#2-stack--tech)
3. [Struktur Folder](#3-struktur-folder)
4. [Design System](#4-design-system)
5. [Sitemap & Alur Section](#5-sitemap--alur-section)
6. [Detail Setiap Section](#6-detail-setiap-section)
7. [Komponen Reusable](#7-komponen-reusable)
8. [State Management & Logic](#8-state-management--logic)
9. [Integrasi & Third-Party](#9-integrasi--third-party)
10. [SEO & Performance](#10-seo--performance)
11. [Checklist Pre-Launch](#11-checklist-pre-launch)
12. [Asset yang Dibutuhkan](#12-asset-yang-dibutuhkan)

---

## 1. Overview Proyek

| Field | Detail |
|---|---|
| **Nama Proyek** | Clorismen Landing Page — Clean Skin Series |
| **Tujuan** | Konversi kunjungan iklan → order langsung di website |
| **Target Pasar** | Pria Indonesia 18–35 tahun, aktif di luar ruangan |
| **USP Utama** | Micellar Water Spray tanpa bilas (bintang utama paket) |
| **Harga Normal** | Rp332.000 |
| **Harga Website** | Rp199.000 (sama atau lebih murah dari marketplace) |
| **Bonus Eksklusif** | Ebook "Strategi Tampil Lebih Baik Sebagai Seorang Pria Dalam Waktu 30 Hari" (nilai Rp149.000) — GRATIS khusus order di website |
| **Platform Referensi** | Tokopedia Clorismen Official (rating 4.8, 10.000+ terjual, 757.000+ produk terjual) |
| **Brand Berdiri** | Sejak 2016 |
| **Data BPOM** | Wajib cantumkan nomor BPOM tiap produk · Tanpa hidroquinon & merkuri |

---

## 2. Stack & Tech

### Frontend
| Teknologi | Versi | Keterangan |
|---|---|---|
| **React JS** | 18+ | UI framework |
| **Vite** | 5+ | Build tool (lebih cepat dari CRA) |
| **Tailwind CSS** | 3.4+ | Utility-first styling |
| **Framer Motion** | latest | Animasi smooth & modern |
| **React Router DOM** | v6 | Routing (single page, 1 route utama) |
| **Lucide React** | latest | Icon library |
| **Swiper.js** | latest | Carousel testimoni & produk |
| **React Hook Form** | latest | Form order handling |
| **React Countdown Circle Timer / react-countdown** | latest | Countdown timer urgency |

### Styling Approach
- **Design style:** Glassmorphism + Dark/Masculine modern (bukan pink/feminine)
- **Color palette:** Hitam (#0A0A0A), Putih (#FAFAFA), Aksen Hijau/Teal modern (#00C9A7) untuk CTA, Kuning emas (#F5A623) untuk highlight/badge
- **Font:** `Space Grotesk` (heading, bold, modern) + `Inter` (body text)
- **Gradient:** Linear diagonal + Mesh gradient untuk hero section

### Analytics & Tracking
| Tool | Fungsi |
|---|---|
| **Meta Pixel** | Tracking event Purchase, AddToCart, ViewContent |
| **TikTok Pixel** | Tracking event Purchase, ViewContent |
| **Google Analytics 4** | Traffic & conversion tracking |

### Deployment
- **Hosting:** VPS/Shared Hosting via XAMPP (dev) → Production bisa Cloudflare Pages / Vercel
- **Domain:** sesuai keputusan owner

---

## 3. Struktur Folder

```
clorismen-landing/
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg                  # Open Graph image (1200x630)
│   └── robots.txt
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── hero-product.png       # 4 produk Clean Skin Series
│   │   │   ├── hero-model.png         # Foto model cowok (habis naik motor/helm)
│   │   │   ├── product-micellar.png
│   │   │   ├── product-facewash.png
│   │   │   ├── product-serum.png
│   │   │   ├── product-sunscreen.png
│   │   │   ├── ebook-mockup.png       # Mockup cover ebook
│   │   │   ├── before-after-1.jpg
│   │   │   ├── before-after-2.jpg
│   │   │   ├── influencer-aloy.jpg
│   │   │   ├── influencer-paris.jpg
│   │   │   ├── influencer-kkjhe.jpg
│   │   │   ├── influencer-kevin.jpg
│   │   │   ├── influencer-sansan.jpg
│   │   │   └── influencer-coki.jpg
│   │   ├── videos/
│   │   │   ├── testimony-1.mp4
│   │   │   ├── testimony-2.mp4
│   │   │   ├── testimony-3.mp4
│   │   │   ├── collab-1.mp4
│   │   │   ├── collab-2.mp4
│   │   │   └── collab-3.mp4
│   │   └── icons/
│   │       └── bpom-logo.svg
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.jsx             # Sticky promo bar
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── sections/
│   │   │   ├── HeroSection.jsx        # Section 1
│   │   │   ├── SocialProofSection.jsx # Section 1A — Stats + Testimoni
│   │   │   ├── InfluencerSection.jsx  # Section 1B
│   │   │   ├── PainPointSection.jsx   # Section 2
│   │   │   ├── AgitasiSection.jsx     # Section 3 — Tes kapas
│   │   │   ├── SolusiSection.jsx      # Section 4 — 4 step sistem
│   │   │   ├── ProdukDetailSection.jsx# Section 5 — Detail tiap produk
│   │   │   ├── BeforeAfterSection.jsx # Section 6
│   │   │   ├── VideoSection.jsx       # Section 7 — UGC video
│   │   │   ├── KomparatorSection.jsx  # Section 8 — Tabel vs kompetitor
│   │   │   ├── KomparatorHargaSection.jsx # Section 9 — Tabel harga
│   │   │   ├── EbookSection.jsx       # Section 10 — Bonus ebook
│   │   │   ├── PenawaranSection.jsx   # Section 11 — What you get
│   │   │   ├── PilihPaketSection.jsx  # Section 12 — Pilih qty
│   │   │   ├── UrgensiSection.jsx     # Section 13 — Timer + kuota
│   │   │   ├── GaransiSection.jsx     # Section 14
│   │   │   ├── FAQSection.jsx         # Section 15
│   │   │   ├── FormOrderSection.jsx   # Section 16 — Order form
│   │   │   └── PenutupSection.jsx     # Section 17 — Closing PS
│   │   │
│   │   └── ui/
│   │       ├── CTAButton.jsx          # Tombol CTA utama (animated)
│   │       ├── CountdownTimer.jsx     # Timer urgensi
│   │       ├── TestimoniCard.jsx      # Card ulasan
│   │       ├── ProductCard.jsx        # Card detail produk
│   │       ├── BeforeAfterSlider.jsx  # Slider sebelum/sesudah
│   │       ├── VideoCard.jsx          # UGC video card
│   │       ├── InfluencerCard.jsx     # Influencer grid card
│   │       ├── BadgeBPOM.jsx          # Badge BPOM trust signal
│   │       ├── StatBox.jsx            # Kotak angka statistik
│   │       ├── PackageCard.jsx        # Kartu pilihan paket
│   │       ├── FAQItem.jsx            # Accordion FAQ
│   │       └── OrderForm.jsx          # Form input order
│   │
│   ├── hooks/
│   │   ├── useCountdown.js            # Custom hook countdown timer
│   │   ├── useScrollAnimation.js      # Trigger animasi saat scroll
│   │   └── useFormSubmit.js           # Logic submit form ke WA/server
│   │
│   ├── utils/
│   │   ├── formatRupiah.js            # Format angka ke Rupiah
│   │   ├── pixel.js                   # Meta Pixel & TikTok Pixel events
│   │   └── constants.js              # Data produk, harga, testimoni, FAQ
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                      # Tailwind directives + custom CSS
│
├── .env                               # API keys, Pixel IDs, WA number
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
├── package.json
└── BLUEPRINT.md                       # File ini
```

---

## 4. Design System

### Color Palette

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-bg` | `#0A0A0A` | Background utama |
| `--color-surface` | `#141414` | Card, section bergantian |
| `--color-surface-2` | `#1E1E1E` | Elevated card |
| `--color-primary` | `#00C9A7` | CTA button, aksen utama (teal) |
| `--color-primary-glow` | `#00C9A750` | Glow effect CTA |
| `--color-gold` | `#F5A623` | Badge promo, harga coret, highlight |
| `--color-text` | `#FAFAFA` | Teks utama |
| `--color-text-muted` | `#9CA3AF` | Teks sekunder |
| `--color-danger` | `#EF4444` | Countdown timer, stok menipis |
| `--color-border` | `#2A2A2A` | Border card |

### Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| H1 Headline | Space Grotesk | 56px / clamp(36px, 6vw, 64px) | 800 |
| H2 Section | Space Grotesk | 36px / clamp(28px, 4vw, 44px) | 700 |
| H3 Sub | Space Grotesk | 24px | 600 |
| Body | Inter | 16px | 400 |
| Body Large | Inter | 18px | 400 |
| Caption | Inter | 14px | 400 |
| Label/Badge | Space Grotesk | 12px | 700 |

### Spacing System
- Base unit: `4px`
- Section padding: `py-20` (mobile: `py-12`)
- Container max-width: `1200px`
- Section gap: `gap-16` (mobile: `gap-10`)

### Effects & Motion
| Effect | Implementasi |
|---|---|
| Glassmorphism card | `backdrop-blur-xl bg-white/5 border border-white/10` |
| Glow CTA button | `box-shadow: 0 0 40px var(--color-primary-glow)` |
| Mesh gradient hero | CSS `radial-gradient` multi-layer |
| Scroll reveal | `Framer Motion` `whileInView` + `initial={{ opacity:0, y:40 }}` |
| Hover card | `scale(1.03)` + `border-color` transition 300ms |
| Shimmer loading | CSS animation `@keyframes shimmer` |
| Parallax hero | Framer Motion `useScroll` + `useTransform` |

---

## 5. Sitemap & Alur Section

```
Landing Page (Single Page / One-Page)
│
├── [TOP BAR] Sticky promo bar — promo harga + countdown ringkas
│
├── [SECTION 0] Hero
│   ├── Headline utama (30 hari tagline)
│   ├── Sub-headline (4 produk + USP)
│   ├── Gambar produk + model
│   ├── Trust badge (rating, terjual, BPOM)
│   └── CTA Button #1
│
├── [SECTION 1A] Social Proof — Sejak 2016
│   ├── 4 stat boxes (tahun berdiri, pengguna, rating, produk terjual)
│   ├── Carousel testimoni (6–9 screenshot asli)
│   ├── Video testimoni UGC (2–3 video)
│   ├── Foto before–after
│   └── CTA Button #2
│
├── [SECTION 1B] Influencer Collab
│   ├── Grid foto 6 influencer
│   ├── Embed 2–3 video kolaborasi
│   ├── Tagline penutup
│   └── CTA Button #3
│
├── [SECTION 2] Pain Point
│   └── 6 bullet masalah dengan ikon ❌
│
├── [SECTION 3] Agitasi — Tes Kapas
│   ├── Narasi tes kapas
│   └── 3 akibat kotoran sisa
│
├── [SECTION 4] Solusi — 4 Langkah Sistem
│   ├── Step 1: Micellar Water Spray
│   ├── Step 2: Face Wash 3in1
│   ├── Step 3: Brightening Serum
│   └── Step 4: Sunscreen
│
├── [SECTION 5] Detail Produk (4 card produk)
│   ├── Nama, foto, kandungan utama, manfaat, volume, no. BPOM
│   └── CTA Button #4
│
├── [SECTION 6] Before–After
│   └── Slider interaktif foto sebelum & sesudah
│
├── [SECTION 7] Video UGC & Testimoni Lanjutan
│
├── [SECTION 8] Komparator — Clean Skin Series vs Beli Satuan vs Kompetitor
│   └── Tabel perbandingan fitur
│
├── [SECTION 9] Komparator Harga
│   └── Tabel harga: Satuan vs Paket website
│
├── [SECTION 10] Bonus Ebook Eksklusif
│   ├── Mockup cover ebook
│   ├── Preview isi 4 minggu
│   └── Nilai ebook vs GRATIS
│
├── [SECTION 11] Penawaran — What You Get
│   └── Checklist isi paket + bonus
│
├── [SECTION 12] Pilih Paket (1/2/3 paket)
│   └── 3 package card dengan harga & hemat
│
├── [SECTION 13] Urgensi — Countdown + Kuota
│   ├── Timer countdown
│   └── Sisa kuota promo
│
├── [SECTION 14] Garansi
│   └── 2 poin garansi (original + rusak/salah kirim)
│
├── [SECTION 15] FAQ (Accordion)
│   └── 9 pertanyaan umum
│
├── [SECTION 16] Form Order
│   ├── Fields: nama, WA, alamat, jumlah paket, metode bayar
│   ├── Order bump (tambah Micellar Water ekstra)
│   └── CTA Button Final
│
└── [SECTION 17] Penutup + P.S.
    ├── Closing copy
    ├── P.S. reminder tes kapas
    └── Link WhatsApp admin
```

---

## 6. Detail Setiap Section

---

### 🔴 TOP BAR — Sticky Promo Bar

**Komponen:** `TopBar.jsx`

| Elemen | Detail |
|---|---|
| Background | Gradient `#F5A623` → `#EF8C00` (amber/gold) |
| Teks | 🔥 PROMO KHUSUS WEBSITE: Clean Skin Series cuma **Rp199.000** (normal ~~Rp332.000~~) + Gratis Ongkir + Bonus Ebook. Sampai [tanggal] |
| Perilaku | `position: sticky; top: 0; z-index: 100` — selalu tampil di atas |
| Mobile | Teks diperkecil, bisa scroll horizontal jika panjang |
| Interaksi | Klik CTA → scroll ke `#form-order` |

---

### 🟢 SECTION 1 — Hero

**Komponen:** `HeroSection.jsx`

**Layout:** 2 kolom (desktop) / 1 kolom stack (mobile)
- Kiri: Copy text + CTA
- Kanan: Gambar produk + model

| Elemen | Detail |
|---|---|
| **Headline** | "30 Hari dari Sekarang, Lo Bisa Ngaca dan Bilang: "Gila, Muka Gue Beda."" — Font Space Grotesk 64px, bold, gradient text (white → teal) |
| **Sub-headline** | "Clorismen Clean Skin Series: 4 langkah perawatan wajah pria (Micellar Water, Face Wash, Brightening Serum & Sunscreen) yang bantu angkat debu, polusi & minyak yang nggak keangkat sabun biasa. Muka lebih bersih, nggak kusam, dan seger seharian. Hemat Rp133.000 + GRATIS Ebook Strategi Tampil Lebih Baik Sebagai Seorang Pria Dalam Waktu 30 Hari, khusus order di website." |
| **Gambar** | 4 produk Clean Skin Series + foto model cowok baru lepas helm / habis naik motor. Efek: floating animation (keyframes up-down), product glow teal |
| **Trust Badges** | ⭐ 4.8/5 · 📦 10.000+ paket terjual · ✅ BPOM · ✅ Tanpa hidroquinon & merkuri — ditampilkan sebagai badge pill row |
| **CTA Button** | `AMBIL PROMONYA SEKARANG 👇` — Besar, full-width di mobile, warna teal dengan glow effect, pulse animation |
| **Background** | Mesh radial gradient dark, partikel floating (opsional dengan canvas) |
| **Animasi** | Headline: `animate-in` dari kiri; Gambar: parallax scroll subtle |

---

### 🟢 SECTION 1A — Social Proof: Dipercaya Sejak 2016

**Komponen:** `SocialProofSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Sejak 2016, [Jutaan] Cowok Indonesia Udah Percayain Mukanya ke Clorismen" |
| **Sub copy** | "Hampir 10 tahun kami fokus di satu hal: bikin skincare yang beneran cocok buat kulit cowok Indonesia, yang tiap hari kena panas, debu, dan polusi. Bukan brand kemarin sore yang cuma ikut tren." |
| **4 Stat Boxes** | Grid 4 kolom (2x2 mobile): 🗓️ Sejak 2016 / 👨 [Jutaan] cowok / ⭐ 4.8/5 dari 79.000+ ulasan / 📦 757.000+ produk terjual |
| **Stat box design** | Glassmorphism card, angka besar gradient teal, label kecil muted |
| **Carousel Testimoni** | Swiper.js, 6–9 screenshot ulasan asli (Tokopedia/Shopee/TikTok), autoplay, loop, nama/foto disamarkan |
| **Video Testimoni UGC** | 2–3 video UGC 15–30 detik, layout horizontal scroll di mobile |
| **Before–After** | Slider interaktif (drag handle tengah) atau 2 foto berdampingan |
| **CTA** | "GUE MAU COBA JUGA 👇" |
| **Catatan** | ⚠️ Angka "jutaan pengguna" wajib sesuai data internal. Pakai angka pasti jika belum yakin (mis. 757.000+ produk terjual) |

---

### 🟢 SECTION 1B — Influencer Collaboration

**Komponen:** `InfluencerSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Udah Dipercaya Juga oleh Nama-Nama Ini" |
| **Sub copy** | "Clorismen udah berkolaborasi dengan banyak figur publik dan influencer Indonesia, di antaranya:" |
| **Grid Influencer** | 6 card: Aloy · Paris Pernandes · KKJHE · Kevin Aprilio · Sansan Pee Wee Gaskins · Coki Pardede |
| **Card design** | Foto lingkaran/rounded dengan nama di bawah, hover → overlay play button → embed video kolaborasi |
| **Video Kolaborasi** | 2–3 video embed (Reels/TikTok asli, 15–30 detik), tampil dalam lightbox modal saat klik |
| **Closing tagline** | "Kalau mereka aja percaya, giliran lo buktiin sendiri." |
| **CTA** | "AMBIL PROMONYA SEKARANG 👇" |
| **Catatan** | ⚠️ Pastikan hak pakai konten kolaborasi masih berlaku. Gunakan frasa "berkolaborasi dengan", bukan "dipakai tiap hari oleh" |

---

### 🔴 SECTION 2 — Pain Point

**Komponen:** `PainPointSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Lo pasti pernah ngalamin ini:" |
| **Layout** | 6 card pain point, grid 2 kolom (mobile: 1 kolom), animasi staggered dari bawah |
| **Pain points** | ❌ Lepas helm, muka kusam, lepek & berminyak · ❌ Udah cuci muka, tapi pas diusap kapas masih ada kotoran item · ❌ Pori-pori keliatan besar dan muncul komedo · ❌ Siang hari muka mengkilap, padahal mau meeting atau ketemu orang · ❌ Wajah keliatan belang: dahi & hidung lebih gelap karena sering kena matahari · ❌ Jerawat kecil muncul terus, padahal udah rajin cuci muka |
| **Card design** | Dark card dengan border merah subtle, ikon ❌ merah besar, teks bold |
| **Animasi** | Stagger reveal saat scroll masuk viewport |

---

### 🟡 SECTION 3 — Agitasi: Kenapa Cuci Muka Biasa Nggak Cukup

**Komponen:** `AgitasiSection.jsx`

| Elemen | Detail |
|---|---|
| **Narasi utama** | "Coba tes ini malam ini: abis cuci muka pakai sabun biasa, usap muka lo pakai kapas basah. Kalau kapasnya masih kotor, berarti masih ada debu, polusi, dan minyak yang ketinggalan di pori-pori lo." |
| **Visual** | Ilustrasi/foto kapas kotor setelah usap — efek dramatis (highlight area kapas) |
| **3 akibat** | • Pori tersumbat → komedo & jerawat · • Kulit kusam karena kotoran numpuk · • Skincare tidak meresap maksimal |
| **Transisi** | Section ini langsung mengalir ke Section 4 (Solusi) sebagai jawaban |

---

### 🟢 SECTION 4 — Solusi: 4 Langkah Sistem Clean Skin

**Komponen:** `SolusiSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Solusinya: Clean Skin Series — 4 Langkah yang Udah Terbukti" |
| **Layout** | Timeline/step vertikal atau 4 card horizontal |
| **Step 1** | 🌊 Micellar Water Spray — "Semprot & usap. Angkat debu, polusi, minyak, sisa sunscreen. Tanpa bilas. Ini bintang utamanya." |
| **Step 2** | 💧 Face Wash 3in1 — "Cuci muka yang beneran bersih sampai dalam pori." |
| **Step 3** | ✨ Brightening Serum — "Nutrisi kulit, bantu tampilan lebih cerah & tidak kusam." |
| **Step 4** | ☀️ Sunscreen [SPF] — "Proteksi dari UV, cegah belang & penuaan dini." |
| **Visual** | Tiap step ada foto produknya, nomor step besar dengan aksen teal |
| **Animasi** | Step muncul bergantian saat scroll (stagger) |

---

### 🟢 SECTION 5 — Detail Produk

**Komponen:** `ProdukDetailSection.jsx`

4 card produk, layout horizontal scroll di mobile atau grid 2x2:

**Card tiap produk berisi:**
- Foto produk (high quality, png transparan)
- Nama produk
- Volume/ukuran
- Kandungan utama
- Manfaat utama (3–4 bullet)
- Nomor BPOM
- Badge "Micellar Water — Tanpa Bilas!" (khusus produk bintang)

| Produk | Detail |
|---|---|
| **Micellar Water Spray 100ml** | Kandungan: [sesuai kemasan] · Manfaat: angkat debu, polusi, minyak, sisa sunscreen tanpa bilas · BPOM: [nomor] |
| **Face Wash 3in1** | Kandungan: [sesuai kemasan] · Manfaat: bersihkan mendalam, control minyak, segar · BPOM: [nomor] |
| **Brightening Serum** | Kandungan: [sesuai kemasan] · Manfaat: bantu cerahkan, kurangi kusam · BPOM: [nomor] |
| **Sunscreen [SPF]** | Kandungan: [sesuai kemasan] · Manfaat: proteksi UV, cegah belang · BPOM: [nomor] · SPF: [angka] |

**CTA:** "PESAN SEKARANG 👇"

---

### 🟢 SECTION 6 — Before & After

**Komponen:** `BeforeAfterSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Ini Hasilnya Setelah Pakai Clean Skin Series" |
| **Layout** | 2–3 pasang foto before/after |
| **Interaksi** | Slider drag (handle di tengah) reveal before/after — gunakan library `react-compare-image` |
| **Caption** | Durasi pemakaian (mis. "Setelah 30 hari") |
| **Catatan** | ⚠️ Hanya foto pelanggan asli dengan izin. Klaim sesuai BPOM: gunakan "membantu" bukan "menghilangkan" |

---

### 🟢 SECTION 7 — Video UGC

**Komponen:** `VideoSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Ini Kata Mereka yang Udah Pakai" (atau sub dari 1A) |
| **Layout** | Horizontal scroll row di mobile, 3 kolom di desktop |
| **Video** | 2–3 video UGC 15–30 detik, diplay dengan thumbnail + play button |
| **Player** | Custom HTML5 video player atau embed TikTok/IG Reels |
| **Badge** | "Pelanggan Asli" badge di tiap video |

---

### 🟡 SECTION 8 — Komparator Fitur

**Komponen:** `KomparatorSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Kenapa Clean Skin Series Lebih Worth It?" |
| **Layout** | Tabel 3 kolom: Beli Satuan vs Clean Skin Series (Website) vs Kompetitor |
| **Rows** | Micellar Water · Face Wash · Brightening Serum · Sunscreen · Ebook 30 Hari · Konsultasi WA · Gratis Ongkir · Harga Total |
| **Styling** | Kolom tengah (Clean Skin Series) dihighlight dengan border teal + badge "TERBAIK" |
| **Checklist** | ✅ / ❌ dengan warna green/red |

---

### 🟡 SECTION 9 — Komparator Harga

**Komponen:** `KomparatorHargaSection.jsx`

Tabel detail sesuai dokumen owner:

| Item | Beli Satuan | Clean Skin Series (Website) |
|---|---|---|
| Micellar Water 100ml | Rp99.000 | ✅ Termasuk |
| Face Wash 3in1 | Rp120.000 | ✅ Termasuk |
| Brightening Serum | Rp[xx.000] | ✅ Termasuk |
| Sunscreen | Rp[xx.000] | ✅ Termasuk |
| Ebook 30 Hari | ❌ | ✅ GRATIS |
| Ongkir | Bayar | ✅ GRATIS |
| **Total** | **Rp332.000+** | **Rp199.000** |

**Visual:** Angka harga besar, coretan di harga normal, angka hijau untuk harga hemat.

---

### 🟣 SECTION 10 — Bonus Ebook Eksklusif

**Komponen:** `EbookSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | 'BONUS EKSKLUSIF: Ebook "Strategi Tampil Lebih Baik Sebagai Seorang Pria Dalam Waktu 30 Hari"' |
| **Visual** | Mockup cover ebook 3D (buku standing/tablet mockup) |
| **Nilai** | ~~Rp149.000~~ → **GRATIS** khusus order lewat website |
| **Isi Preview** | • Minggu 1: Kulit & Wajah (rutinitas skincare, kesalahan cuci muka) · • Minggu 2: Grooming (rambut, alis, jenggot, bau badan) · • Minggu 3: Gaya (pakaian, parfum) · • Minggu 4: Percaya Diri (postur, bahasa tubuh) · • Plus: checklist harian 30 hari + template foto progres |
| **CTA** | Implicit → mengarah ke form order |

---

### 🟣 SECTION 11 — Penawaran: What You Get

**Komponen:** `PenawaranSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Yang Lo Dapetin:" |
| **Checklist items** | ✅ Micellar Water Spray 100ml · ✅ Face Wash 3in1 · ✅ Brightening Serum · ✅ Sunscreen [SPF] · 🎁 BONUS #1: Ebook "Tampil Lebih Baik dalam 30 Hari" (nilai Rp149.000) · 🎁 BONUS #2: [Kapas wajah / pouch travel] (nilai Rp[xx.000]) · 🎁 BONUS #3: Konsultasi skincare via WhatsApp · 🎁 BONUS #4: Gratis ongkir |
| **Harga Block** | ~~Harga Normal: Rp332.000~~ → **Harga Website: Rp199.000** · Hemat Rp133.000 + bonus senilai Rp[xxx.000]! |
| **Design** | Gold card/box, checklist animasi muncul satu per satu, harga besar dengan effect coret |

---

### 🔵 SECTION 12 — Pilih Paket

**Komponen:** `PilihPaketSection.jsx`

3 Package Card:

| Paket | Harga | Label | Keterangan |
|---|---|---|---|
| 🟢 1 Paket | Rp199.000 | — | Untuk ±1 bulan pemakaian |
| 🔵 2 Paket | Rp379.000 | ⭐ PALING HEMAT | Hemat Rp19.000 · Untuk ±2 bulan, lihat hasil maksimal |
| 🟣 3 Paket | Rp549.000 | — | Hemat Rp48.000 + bonus tambahan · Bisa patungan bareng temen |

**Design:** Card 2 Paket paling besar/menonjol (selected state by default), hover effect, klik → auto-select di form order di bawah.

---

### 🔴 SECTION 13 — Urgensi

**Komponen:** `UrgensiSection.jsx`

| Elemen | Detail |
|---|---|
| **Countdown Timer** | ⏰ Harga website + bonus ebook berakhir dalam: [HH:MM:SS] — warna merah, font besar |
| **Kuota** | 📦 Kuota promo tersisa: [angka asli] — real number, update manual atau via API |
| **Background** | Warna gelap dengan aksen merah/warning |
| **Catatan** | ⚠️ Timer & kuota harus jujur, bukan fake urgency |

---

### 🟢 SECTION 14 — Garansi

**Komponen:** `GaransiSection.jsx`

| Elemen | Detail |
|---|---|
| **Headline** | "Belanja Aman, Dijamin." |
| **Garansi 1** | 🛡️ 100% Original: dikirim langsung dari Clorismen Official |
| **Garansi 2** | 🛡️ Rusak/Salah Kirim = Ganti Baru: cukup kirim video unboxing ke admin |
| **Garansi 3 (Opsional)** | Garansi uang kembali X hari dengan S&K — jika sanggup |
| **Design** | Shield icon besar, warna hijau/teal, clean minimal |

---

### 🟡 SECTION 15 — FAQ

**Komponen:** `FAQSection.jsx`

9 pertanyaan accordion:

| # | Pertanyaan | Jawaban |
|---|---|---|
| 1 | Kenapa harus pakai Micellar Water kalau udah ada Face Wash? | Micellar Water mengangkat minyak, debu & sisa sunscreen. Face Wash membersihkan sisanya. Kombinasi ini (double cleansing) bikin muka bersih lebih maksimal dan serum meresap lebih baik. |
| 2 | Micellar Water-nya harus dibilas? | Nggak perlu. Tinggal semprot, usap pakai kapas. Praktis buat dipakai di luar rumah. |
| 3 | Sunscreen-nya bikin muka putih atau lengket? | [Jawaban sesuai produk] |
| 4 | Aman buat kulit berjerawat atau sensitif? | [Jawaban sesuai formula.] Sarankan patch test dulu di area rahang. |
| 5 | Udah BPOM? | Ya, cantumkan nomor BPOM tiap produk. Tanpa hidroquinon & merkuri. |
| 6 | Satu paket cukup berapa lama? | Kurang lebih 1 bulan pemakaian rutin. |
| 7 | Ebook-nya dikirim gimana? | Link download dikirim ke WhatsApp/email setelah pembayaran dikonfirmasi. |
| 8 | Bisa COD? | [Bisa/Tidak. Sebutkan metode pembayaran.] |
| 9 | Pengiriman berapa lama? | Order sebelum jam 15.00 WIB dikirim hari itu juga. Estimasi 2–5 hari kerja. |

**Design:** Accordion smooth collapse/expand dengan Framer Motion, border teal saat open.

---

### 🔴 SECTION 16 — Form Order

**Komponen:** `FormOrderSection.jsx`

| Field | Type | Keterangan |
|---|---|---|
| Nama lengkap | text input | Required |
| Nomor WhatsApp | tel input | Required · Format: 08xx/+628xx · Untuk konfirmasi, resi & kirim ebook |
| Alamat lengkap | textarea | Required |
| Pilih jumlah | radio group | ○ 1 Paket ○ 2 Paket (Paling Hemat) ○ 3 Paket |
| Metode pembayaran | radio group | ○ Transfer ○ E-wallet/QRIS ○ COD |
| Order Bump | checkbox | "+ Tambah 1 Micellar Water ekstra buat di tas/motor cuma Rp[xx.000]" |

**CTA Besar:** `YA, GUE MAU MUKA BERSIH MAKSIMAL – PESAN SEKARANG`

**Trust signals bawah form:**
- 🔒 Data aman
- 📦 Gratis ongkir
- 💬 Admin siap bantu

**Logic submit:**
1. Validasi semua field (react-hook-form)
2. Format pesan WhatsApp (wa.me link dengan pre-filled text)
3. Fire Meta Pixel event `Purchase` / `InitiateCheckout`
4. Fire TikTok Pixel event
5. Redirect ke WhatsApp admin

---

### 🟡 SECTION 17 — Penutup + P.S.

**Komponen:** `PenutupSection.jsx`

| Elemen | Detail |
|---|---|
| **Copy utama** | "Tiap hari muka lo nempel debu, polusi, dan minyak. Itu nggak bisa lo hindari. Yang bisa lo pilih: mau dibiarin numpuk, atau dibersihin dengan cara yang benar." |
| **P.S.** | "Malam ini, coba tes kapas setelah cuci muka. Kalau kapasnya masih kotor, lo udah tahu jawabannya. Harga website Rp199.000 + Ebook gratis cuma sampai [tanggal]." |
| **CTA Final** | `AMANKAN CLEAN SKIN SERIES GUE` |
| **Link WA** | 💬 Masih ragu? Chat admin di WhatsApp → [link wa.me] |

---

## 7. Komponen Reusable

### `CTAButton.jsx`
```jsx
// Props: label, href, variant (primary|ghost), size (lg|md|sm), pulse (bool)
// Primary: bg teal, glow box-shadow, pulse animation
// Ghost: border teal, transparent bg
```

### `CountdownTimer.jsx`
```jsx
// Props: targetDate (ISO string)
// Output: HH:MM:SS live countdown
// Style: 3 kotak digit besar warna merah
```

### `TestimoniCard.jsx`
```jsx
// Props: screenshot (img src), name (disamarkan), platform, rating
// Design: glassmorphism card, bintang rating, platform badge (Tokopedia/Shopee/TikTok)
```

### `PackageCard.jsx`
```jsx
// Props: qty, price, label, savings, isRecommended
// isRecommended: border highlight + badge "PALING HEMAT"
```

### `FAQItem.jsx`
```jsx
// Props: question, answer
// Accordion dengan Framer Motion AnimatePresence
```

### `StatBox.jsx`
```jsx
// Props: icon, value, label
// Design: glassmorphism, angka besar gradient teal, animasi count-up saat masuk viewport
```

### `BeforeAfterSlider.jsx`
```jsx
// Library: react-compare-image
// Props: before (img src), after (img src), caption
```

---

## 8. State Management & Logic

### Global State (React Context / useState)

```
AppState
├── selectedPackage: 1 | 2 | 3        # Paket dipilih dari Section 12
├── orderBump: boolean                  # Checkbox tambah Micellar Water
├── formData: {                         # Data form order
│     name: string
│     whatsapp: string
│     address: string
│     package: 1|2|3
│     paymentMethod: string
│     orderBump: boolean
│   }
└── countdown: Date                     # Target tanggal promo
```

### Form Submit Flow
```
User klik CTA →
  1. Validasi form (react-hook-form)
  2. Build WA message string:
     "Halo Clorismen, saya [nama] mau pesan Clean Skin Series..."
  3. Fire pixel events (Meta + TikTok)
  4. window.open(wa.me/[nomorWA]?text=[encoded_message])
```

### Countdown Timer Logic
```js
// countdown.js
const targetDate = new Date("[TANGGAL_PROMO_BERAKHIR]");
const diff = targetDate - new Date();
// Update setiap detik dengan setInterval
// Persist dengan localStorage agar tidak reset saat refresh
```

---

## 9. Integrasi & Third-Party

### Meta Pixel
```js
// src/utils/pixel.js
export const firePixelEvent = (event, data) => {
  if (window.fbq) {
    window.fbq('track', event, data);
  }
};
// Events: ViewContent, AddToCart, InitiateCheckout, Purchase
```

### TikTok Pixel
```js
// Events: ViewContent, AddToPaymentInfo, CompletePayment
if (window.ttq) {
  window.ttq.track('ViewContent', { ... });
}
```

### WhatsApp Order
```js
const buildWAMessage = (formData) => {
  return encodeURIComponent(
    `Halo Clorismen Official 👋\n\n` +
    `*Nama:* ${formData.name}\n` +
    `*Paket:* ${formData.package} Paket\n` +
    `*Alamat:* ${formData.address}\n` +
    `*Metode Bayar:* ${formData.paymentMethod}\n` +
    `*Order Bump:* ${formData.orderBump ? 'Ya, tambah Micellar Water ekstra' : 'Tidak'}\n\n` +
    `Mohon konfirmasi pemesanan saya. Terima kasih!`
  );
};
```

---

## 10. SEO & Performance

### Meta Tags (index.html)
```html
<title>Clorismen Clean Skin Series — Skincare Pria, Muka Bersih Maksimal</title>
<meta name="description" content="4 langkah skincare pria: Micellar Water, Face Wash, Serum & Sunscreen. Hemat Rp133.000 + GRATIS Ebook. Order di website lebih murah dari marketplace." />
<meta property="og:title" content="Clorismen Clean Skin Series" />
<meta property="og:image" content="/og-image.jpg" />
<meta property="og:type" content="website" />
<meta name="robots" content="index, follow" />
```

### Performance Checklist
- [ ] Semua gambar: format WebP, lazy loading (`loading="lazy"`)
- [ ] Hero image: preload (`<link rel="preload">`)
- [ ] Video: lazy load, poster thumbnail
- [ ] Font: `font-display: swap`
- [ ] Bundle size: code splitting per section (React.lazy + Suspense)
- [ ] Tailwind: purge unused CSS di production build
- [ ] LCP target: < 2.5 detik
- [ ] CLS target: < 0.1
- [ ] Mobile-first responsive: tested di 320px, 375px, 390px, 768px, 1200px+

---

## 11. Checklist Pre-Launch

> Sesuai checklist dari owner dokumen asli + tambahan teknis

### Konten & Legal
- [ ] Harga website final — sama atau lebih murah dari marketplace (Tokopedia/Shopee)
- [ ] Harga satuan serum & sunscreen dilengkapi di tabel perbandingan
- [ ] Kandungan & SPF tiap produk diisi sesuai kemasan
- [ ] Nomor BPOM tiap produk dicantumkan
- [ ] Semua klaim dicek sesuai regulasi BPOM (gunakan "membantu", bukan "menghilangkan")
- [ ] Angka statistik (jutaan pengguna, sejak 2016) sesuai data internal
- [ ] Testimoni & before–after dari pelanggan asli, dengan izin tertulis
- [ ] Hak pakai foto & video influencer masih berlaku
- [ ] Semua teks [kurung siku] sudah diisi dengan data asli
- [ ] Video "tes kapas" direkam jujur (tanpa rekayasa)
- [ ] Ebook sudah selesai dibuat, alur kirim otomatis sudah dites
- [ ] Timer & kuota jujur (bukan fake urgency)
- [ ] Nomor WhatsApp admin sudah benar dan aktif

### Teknis
- [ ] Pixel Meta terpasang + event Purchase terverifikasi di Events Manager
- [ ] Pixel TikTok terpasang + event CompletePayment terverifikasi
- [ ] Google Analytics 4 terpasang
- [ ] Form order berfungsi (validasi + format pesan WA)
- [ ] Countdown timer berjalan dan sinkron
- [ ] Responsive design dicek di HP (Android & iPhone)
- [ ] Loading time < 3 detik di koneksi 4G
- [ ] Semua link WA mengarah ke nomor yang benar
- [ ] OG Image terpasang (tes di Facebook Debugger & Twitter Card Validator)
- [ ] SSL/HTTPS aktif

---

## 12. Asset yang Dibutuhkan

> Semua asset ini wajib disiapkan tim sebelum development selesai

### Gambar (Foto)
| File | Spesifikasi |
|---|---|
| `hero-product.png` | 4 produk Clean Skin Series, background transparan, min 1200px |
| `hero-model.png` | Foto model cowok (habis naik motor/lepas helm), editorial quality |
| `product-micellar.png` | Foto produk Micellar Water, background transparan |
| `product-facewash.png` | Foto produk Face Wash, background transparan |
| `product-serum.png` | Foto produk Brightening Serum, background transparan |
| `product-sunscreen.png` | Foto produk Sunscreen, background transparan |
| `ebook-mockup.png` | Mockup cover ebook 3D |
| `before-after-1.jpg` | Pasang foto before/after (dengan izin pelanggan) |
| `before-after-2.jpg` | Pasang foto before/after (dengan izin pelanggan) |
| `influencer-*.jpg` | 6 foto influencer dari konten kolaborasi resmi |
| Screenshot testimoni | 6–9 screenshot ulasan asli Tokopedia/Shopee/TikTok (nama disamarkan) |
| `og-image.jpg` | 1200x630px untuk Open Graph share |

### Video
| File | Spesifikasi |
|---|---|
| `testimony-1.mp4` | UGC pelanggan asli, 15–30 detik, min 720p |
| `testimony-2.mp4` | UGC pelanggan asli, 15–30 detik, min 720p |
| `testimony-3.mp4` | UGC pelanggan asli, 15–30 detik, min 720p |
| `collab-1.mp4` | Cuplikan video kolaborasi influencer, 15–30 detik |
| `collab-2.mp4` | Cuplikan video kolaborasi influencer, 15–30 detik |

### Data yang Harus Diisi
| Data | Keterangan |
|---|---|
| Harga website final | Misal: Rp199.000 |
| Harga satuan serum | Cek Tokopedia/kemasan |
| Harga satuan sunscreen | Cek Tokopedia/kemasan |
| SPF sunscreen | Sesuai kemasan |
| Kandungan tiap produk | Copy dari kemasan resmi |
| Nomor BPOM tiap produk | 4 nomor BPOM |
| Tanggal berakhir promo | Untuk countdown timer |
| Kuota stok promo | Jumlah real |
| Nomor WA admin | Format internasional 628xx |
| Harga bonus #2 | Kapas wajah / pouch travel |
| Total nilai bonus | Rp[xxx.000] |
| Angka jutaan pengguna | Konfirmasi ke data internal |
| Jawaban FAQ #3, #4, #8 | Sesuai produk & kebijakan |
| Link wa.me admin | Nomor yang aktif |
| Meta Pixel ID | Dari Facebook Business Manager |
| TikTok Pixel ID | Dari TikTok Ads Manager |

---

## 📋 Catatan Penting dari Owner

> ⚠️ Semua catatan ini WAJIB diperhatikan oleh developer & copywriter

1. **Harga website** harus sama atau lebih murah dari marketplace (Tokopedia/Shopee)
2. **Ebook bonus** adalah diferensiasi utama — ini alasan utama orang order di website, bukan marketplace
3. **USP utama produk:** Micellar Water Spray tanpa bilas — jadikan bintang utama di hero & narasi
4. **Klaim produk:** Wajib sesuai regulasi BPOM — gunakan "membantu" bukan "menghilangkan"
5. **Testimoni:** Hanya dari pelanggan asli, bukan rekayasa
6. **Timer & kuota promo:** Harus jujur, bukan fake urgency
7. **Influencer:** Gunakan kata "berkolaborasi dengan", pastikan hak pakai konten masih berlaku
8. **Angka statistik:** Verifikasi ke data internal sebelum tayang (jutaan pengguna, dll)
9. **Video tes kapas:** Direkam jujur, tidak direkayasa
10. **Semua teks dalam [kurung siku]** = placeholder yang wajib diisi sebelum tayang

---

*Blueprint ini dibuat berdasarkan dokumen brief dari Owner (Andika, 18 Nov 2026).*
*Seluruh isi [kurung siku] wajib diisi oleh tim sebelum development dimulai.*
