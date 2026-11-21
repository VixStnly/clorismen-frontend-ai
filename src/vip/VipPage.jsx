import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { loadMidtransSnap } from '../lib/midtrans.js';
import AreaSearch from '../components/AreaSearch.jsx';
import { PROVINCES, EMPTY_SHIP, shipErrors, SHIP_ORDER, shipPayload, useShippingFee } from '../lib/shipping.js';
import { REVIEWS } from '../data.js';
import { VIP, rp, waUrl } from './vipConfig.js';
import { initPixel, track } from './pixel.js';
import { goThanks } from '../lib/thanks.js';
import { useWaNumber, useBrand, fmtWa, brandSocials } from '../lib/waNumber.js';
import { useCatalog, pageSlugs, pageConfigured, uploadedImage } from '../lib/catalog.js';
import PurchaseToast from '../components/PurchaseToast.jsx';
import './vip.css';

/* Aset glossy hasil generate ulang: tools/make_vip_lux_images.py → images/vip-lux/ */
const IMG = {
  // Versi ringan untuk web (tools/optimize_images.py → images/opt/)
  bundle: '/images/opt/vip-hero-bundle.webp',
  bundleSet: '/images/opt/vip-hero-bundle-600.webp 600w, /images/opt/vip-hero-bundle.webp 1000w',
  bundleMask: '/images/opt/vip-hero-bundle-600.webp',
  micellar: '/images/opt/vip-prod-micellar.webp',
  facewash: '/images/opt/vip-prod-facewash.webp',
  serum: '/images/opt/vip-prod-serum.webp',
  sunscreen: '/images/opt/vip-prod-sunscreen.webp',
  logo: '/images/opt/vip-logo-dark.webp',
  logoGold: '/images/opt/vip-logo-gold.webp',
};

/*
 * Paket VIP & order bump: produk dipilih di ERP → Landing Page CMS → kartu "Landing VIP" (dikirim sebagai pages.vip).
 * Harga & stok selalu dari ERP (Master Produk). Untuk slug yang ada di vipConfig.js, teks khusus halaman ini
 * (nama paket, perks, harga pembanding marketplace, foto bump) tetap dipakai. Produk lain memakai teks dari Master Produk:
 * judul di landing / nama, deskripsi singkat, poin manfaat, dan harga coret sebagai harga pembanding.
 */
const cfgBySlug = Object.fromEntries(VIP.packages.map((p) => [p.slug, p]));

function erpPackage(e) {
  const price = Number(e.price) || 0;
  const compare = Number(e.compare_price) || 0;
  const perks = Array.isArray(e.benefits) ? e.benefits.slice(0, 5) : [];
  return {
    id: e.slug,
    slug: e.slug,
    name: String(e.landing_title || e.name || '').trim(),
    desc: String(e.tagline || '').trim(),
    price,
    marketplace: compare > price ? compare : price,
    hot: !!e.is_featured,
    perks,
    inStock: e.in_stock !== false,
  };
}

function useVipData() {
  const cat = useCatalog();
  const { bySlug } = cat;
  const chosen = pageSlugs(cat, 'vip', 'package');

  let packages;
  if (chosen && chosen.length) {
    packages = chosen.map((slug) => {
      const e = bySlug[slug];
      const c = cfgBySlug[slug];
      return c ? { ...c, price: Number(e.price) || c.price, inStock: e.in_stock !== false } : erpPackage(e);
    });
    // Label "Paling Laris" hanya satu: paket unggulan pertama
    const hotIdx = packages.findIndex((p) => p.hot);
    packages = packages.map((p, i) => ({ ...p, hot: i === hotIdx }));
  } else {
    packages = VIP.packages.map((p) => {
      const e = bySlug[p.slug];
      return e ? { ...p, price: Number(e.price) || p.price, inStock: e.in_stock !== false } : { ...p, inStock: true };
    });
  }

  // Order bump: halaman sudah diatur di ERP → ikut pilihan ERP (boleh kosong = tanpa bump)
  let bump;
  if (pageConfigured(cat, 'vip')) {
    const slug = pageSlugs(cat, 'vip', 'bump')?.[0];
    const be = slug ? bySlug[slug] : null;
    if (!be) {
      bump = null;
    } else {
      const base = slug === VIP.bump.slug ? VIP.bump : { slug, name: String(be.landing_title || be.name || '').trim(), price: 0, normal: 0, img: uploadedImage(be.image_url) || VIP.bump.img };
      const price = Number(be.price) || base.price;
      const compare = Number(be.compare_price) || 0;
      bump = { ...base, slug, price, normal: compare > price ? compare : (base.normal > price ? base.normal : price), inStock: be.in_stock !== false };
    }
  } else {
    const be = VIP.bump.slug ? bySlug[VIP.bump.slug] : null;
    bump = be
      ? { ...VIP.bump, price: Number(be.price) || VIP.bump.price, normal: be.compare_price && be.compare_price > be.price ? Number(be.compare_price) : VIP.bump.normal, inStock: be.in_stock !== false }
      : { ...VIP.bump, inStock: true };
  }

  const main = packages.find((p) => p.hot) || packages[packages.length - 1];
  return { packages, bump, main };
}
const scrollToOrder = () => document.getElementById('pesan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ================= Efek halaman ================= */
function countUp(el) {
  const to = parseFloat(el.dataset.count);
  const dec = +(el.dataset.dec || 0);
  const pre = el.dataset.pre || '';
  const t0 = performance.now();
  const dur = 1500;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const v = to * (1 - Math.pow(1 - k, 4));
    el.textContent = pre + v.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function usePageEffects() {
  useEffect(() => {
    const root = document.querySelector('.vx');
    if (!root) return undefined;
    const cleanups = [];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const els = root.querySelectorAll('[data-rv]');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      root.querySelectorAll('[data-count]').forEach((el) => countUp(el));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          e.target.querySelectorAll('[data-count]').forEach(countUp);
          if (e.target.dataset.count) countUp(e.target);
          io.unobserve(e.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
      els.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // Tilt visual hero mengikuti pointer (desktop). Parallax scroll dihapus karena badge jadi menutupi teks.
    const hero = root.querySelector('.vx-hero-visual');
    if (hero && !reduce) {
      if (matchMedia('(hover: hover)').matches) {
        const mv = (e) => {
          const r = hero.getBoundingClientRect();
          hero.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`);
          hero.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
        };
        const lv = () => { hero.style.setProperty('--rx', '0deg'); hero.style.setProperty('--ry', '0deg'); };
        hero.addEventListener('pointermove', mv);
        hero.addEventListener('pointerleave', lv);
        cleanups.push(() => { hero.removeEventListener('pointermove', mv); hero.removeEventListener('pointerleave', lv); });
      }
    }

    // Kilau mengikuti pointer pada kartu glass
    if (matchMedia('(hover: hover)').matches) {
      root.querySelectorAll('[data-glow]').forEach((el) => {
        const mv = (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--gx', `${e.clientX - r.left}px`);
          el.style.setProperty('--gy', `${e.clientY - r.top}px`);
        };
        el.addEventListener('pointermove', mv);
        cleanups.push(() => el.removeEventListener('pointermove', mv));
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

function Sparkles({ n = 14 }) {
  return (
    <div className="vx-sparkles" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <i key={i} style={{ '--i': i, '--x': `${(i * 37) % 100}%`, '--y': `${(i * 53) % 100}%` }} />)}
    </div>
  );
}

function Head({ kicker, children, sub }) {
  return (
    <div className="vx-head">
      <div className="vx-kicker" data-rv><span />{kicker}<span /></div>
      <h2 className="vx-h2" data-rv style={{ '--d': '.06s' }}>{children}</h2>
      {sub ? <p className="vx-sub" data-rv style={{ '--d': '.12s' }}>{sub}</p> : null}
    </div>
  );
}

/* ================= SECTION 1: Top announcement bar (sticky) ================= */
function Announcement() {
  return (
    <div className="vx-announce" role="note">
      <p><span className="vx-bolt">⚡</span> PENAWARAN EKSKLUSIF MEMBER VIP — LEBIH HEMAT DARI MARKETPLACE + GRATIS KONSULTASI AHLI KULIT</p>
    </div>
  );
}

/* ================= SECTION 2: Hero ================= */
function Hero() {
  const VIP_PKG = useVipData().main;
  return (
    <header className="vx-hero">
      <div className="vx-hero-bg" aria-hidden="true"><span className="o1" /><span className="o2" /><span className="o3" /></div>
      <Sparkles n={16} />

      <div className="vx-brandrow" data-rv>
        <img src={IMG.logo} alt="Clorismen" className="vx-logo" width="120" height="65" />
        <div className="vx-brandright">
          <span className="vx-vipchip"><i className="fa-solid fa-crown" /> VIP ACCESS</span>
          <a className="vx-memberlink" href="/member" aria-label="Masuk Member Area"><i className="fa-solid fa-circle-user" /> Member</a>
        </div>
      </div>

      <div className="vx-eyebrow" data-rv style={{ '--d': '.04s' }}>Paket Perawatan Pria · 30 Hari</div>
      <h1 className="vx-h1" data-rv style={{ '--d': '.1s' }}>
        Wajah Bersih, Bebas Kilap Minyak &amp; Jerawat dalam <span className="vx-gold">14 Hari</span>
      </h1>
      <p className="vx-h1-sub" data-rv style={{ '--d': '.16s' }}>Cukup 2 Menit Sehari Tanpa Ribet.</p>

      <div className="vx-hero-visual" data-rv="zoom" style={{ '--d': '.12s' }}>
        <div className="vx-halo" aria-hidden="true" />
        <div className="vx-orbit" aria-hidden="true" />
        <div className="vx-orbit o2" aria-hidden="true" />
        <img className="vx-bundle" src={IMG.bundle} srcSet={IMG.bundleSet} sizes="(min-width: 960px) 560px, 100vw" decoding="async" alt="Paket Bundling Clorismen: box eksklusif berisi Micellar Water, Face Wash, Brightening Serum, dan Sunscreen" width="1400" height="1260" fetchPriority="high" />
        <div className="vx-sweep" aria-hidden="true" style={{ WebkitMaskImage: `url(${IMG.bundleMask})`, maskImage: `url(${IMG.bundleMask})` }} />
        <div className="vx-badge-bpom">
          <span><i className="fa-solid fa-shield-halved" /> 100% Original BPOM</span>
          <em />
          <span><i className="fa-solid fa-truck-fast" /> Gratis Ongkir</span>
        </div>
      </div>

      <p className="vx-lead" data-rv style={{ '--d': '.08s' }}>
        Dapatkan <b>Paket Lengkap Perawatan Pria Clorismen (30 Hari)</b> dengan harga khusus lebih hemat dari Official Store Marketplace,
        lengkap dengan <b>Bonus E-Book Eksklusif</b> &amp; <b>Akses Konsultasi Langsung dengan Ahli Kesehatan Kulit</b>.
      </p>

      <div className="vx-hero-price" data-rv data-glow>
        <div>
          <small>Harga Paket VIP hari ini</small>
          <div className="vx-price"><b>{rp(VIP_PKG.price)}</b><s>{rp(VIP_PKG.marketplace)}</s></div>
        </div>
        <span className="vx-save">Hemat<br /><b>{rp(VIP_PKG.marketplace - VIP_PKG.price)}</b></span>
      </div>

      <button type="button" className="vx-btn vx-btn-gold vx-btn-xl vx-pulse" onClick={scrollToOrder} data-rv>
        AMBIL HARGA PROMO PAKET VIP <span className="vx-bounce">👇</span>
      </button>

      <ul className="vx-trust" data-rv>
        <li><i className="fa-solid fa-book-open" /> Bonus E-Book</li>
        <li><i className="fa-solid fa-user-shield" /> Konsultasi Ahli</li>
        <li><i className="fa-solid fa-truck-fast" /> Gratis Ongkir</li>
      </ul>
    </header>
  );
}

/* ================= SECTION 3: Edukasi logis ================= */
const EDU = [
  { icon: 'fa-droplet', t: 'Sabun Muka Saja Memicu Minyak Berlebih', d: 'Membersihkan kotoran tanpa mengunci kelembapan membuat kulit memproduksi minyak 2x lebih banyak.', stat: '2x', statLabel: 'produksi minyak' },
  { icon: 'fa-stopwatch', t: 'Perawatan Pria Harus Praktis (Anti-Ribet)', d: 'Rangkaian paket ini dirancang khusus untuk struktur kulit pria yang lebih tebal — cukup 3 langkah cepat pagi & malam.', stat: '3', statLabel: 'langkah cepat' },
  { icon: 'fa-link', t: 'Kombinasi Bahan Aktif Saling Mengunci', d: 'Pembersih membuka pori, sedangkan serum/krim menutrisi dan membantu memudarkan bekas jerawat secara optimal.', stat: '4in1', statLabel: 'rangkaian lengkap' },
];

const ROUTINE = [
  { k: 'micellar', n: 'Micellar Water', v: 'Angkat' },
  { k: 'facewash', n: 'Face Wash 3in1', v: 'Bersihkan' },
  { k: 'serum', n: 'Brightening Serum', v: 'Rawat' },
  { k: 'sunscreen', n: 'Sunscreen', v: 'Lindungi' },
];

function Education() {
  return (
    <section className="vx-sec">
      <Head kicker="Edukasi Singkat">Kenapa Cuci Muka Saja <span className="vx-gold">Tidak Cukup?</span></Head>
      <div className="vx-edu">
        {EDU.map((e, i) => (
          <article key={e.t} className="vx-edu-card vx-glass" data-rv data-glow style={{ '--d': `${i * 0.1}s` }}>
            <div className="vx-edu-top">
              <span className="vx-edu-ic"><i className={`fa-solid ${e.icon}`} /></span>
              <span className="vx-edu-no">POIN 0{i + 1}</span>
              <span className="vx-edu-stat"><b>{e.stat}</b><small>{e.statLabel}</small></span>
            </div>
            <h3>{e.t}</h3>
            <p>{e.d}</p>
          </article>
        ))}
      </div>

      <div className="vx-shelf" data-rv>
        <div className="vx-shelf-title">Isi paket yang saling melengkapi</div>
        <div className="vx-shelf-row">
          {ROUTINE.map((r, i) => (
            <figure key={r.k} className="vx-shelf-item" style={{ '--d': `${0.1 + i * 0.1}s`, '--f': `${i * 0.6}s` }}>
              <div className="vx-shelf-img"><img src={IMG[r.k]} alt={r.n} loading="lazy" decoding="async" width="120" height="300" /></div>
              <figcaption><b>{r.v}</b><span>{r.n}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= SECTION 5: Value stacking & perbandingan harga ================= */
function EbookCover() {
  return (
    <div className="vx-book" aria-hidden="true">
      <div className="vx-book-inner">
        <div className="vx-book-cover">
          <span className="vx-book-tag">E-BOOK EKSKLUSIF</span>
          <i className="fa-solid fa-user-tie vx-book-ic" />
          <b>{VIP.ebookTitle}</b>
          <span className="vx-book-line" />
          <img src={IMG.logoGold} alt="" width="80" height="44" loading="lazy" decoding="async" />
        </div>
        <div className="vx-book-spine" />
        <div className="vx-book-pages" />
      </div>
    </div>
  );
}

/* ================= SECTION 4: Ulasan pembeli (komentar asli dari marketplace) ================= */
function Stars({ n = 5 }) {
  return <span className="vx-stars" aria-label={`${n} dari 5 bintang`}>{Array.from({ length: 5 }, (_, i) => <i key={i} className={`fa-solid fa-star${i < Math.round(n) ? '' : ' off'}`} />)}</span>;
}

function BuyerReviews() {
  const list = REVIEWS.slice(0, 6);
  return (
    <section className="vx-sec vx-proof">
      <Head kicker="Review Pembeli" sub="Ulasan asli dari pembeli di marketplace, nama disamarkan.">Kata Mereka yang <span className="vx-gold">Sudah Pakai</span></Head>
      <div className="vx-reviews">
        {list.map((rv) => (
          <article key={rv.n + rv.d} className="vx-review vx-glass">
            <div className="vx-review-top">
              <div className="vx-avatar sm">{rv.n.charAt(0).toUpperCase()}</div>
              <div><b>{rv.n}</b><div className="vx-review-meta"><Stars n={rv.r} /> <span>{rv.d}</span></div></div>
            </div>
            <p>{rv.t}</p>
            {rv.pics?.length ? (
              <div className="vx-review-pics">
                {rv.pics.map((p) => <img key={p} src={`/images/reviews/${p}`} alt="Foto ulasan pembeli" loading="lazy" decoding="async" width="56" height="56" />)}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <div className="vx-swipe"><i className="fa-solid fa-arrows-left-right" /> Geser untuk ulasan lain</div>
    </section>
  );
}

function ValueStack() {
  const VIP_PKG = useVipData().main;
  const items = [
    { t: 'Paket Lengkap Clorismen', s: 'Perawatan 30 Hari — Lebih murah dari Official Store Marketplace', tag: 'HEMAT' },
    { t: `BONUS 1: E-Book ‘${VIP.ebookTitle}’`, s: `Senilai ${rp(VIP.ebookValue)}`, tag: 'GRATIS' },
    { t: 'BONUS 2: Akses Konsultasi Langsung dengan Ahli Kesehatan Kulit', s: 'Pendampingan setelah pembelian', tag: 'GRATIS' },
    { t: 'Subsidi Gratis Ongkir', s: 'Ongkir ke seluruh Indonesia ditanggung', tag: 'GRATIS' },
  ];

  // Meta: ViewContent saat pengunjung sampai ke penawaran
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        track('ViewContent', { content_name: 'Paket VIP Clorismen', content_category: 'bundling', value: VIP_PKG.price, currency: 'IDR' });
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="vx-sec vx-value" ref={ref}>
      <Head kicker="Penawaran Khusus" sub="Nggak perlu cek harga ke Shopee atau TikTok Shop. Ini semua yang kamu dapat kalau pesan di halaman ini.">
        Marketplace vs <span className="vx-gold">Halaman VIP</span>
      </Head>

      <div className="vx-stack vx-glass" data-rv data-glow>
        <div className="vx-stack-visual">
          <img className="vx-stack-bundle" src={IMG.bundle} srcSet={IMG.bundleSet} sizes="(min-width: 960px) 380px, 70vw" alt="" loading="lazy" decoding="async" width="700" height="630" />
          <EbookCover />
        </div>
        <ul className="vx-checklist">
          {items.map((it, i) => (
            <li key={it.t} data-rv style={{ '--d': `${0.08 + i * 0.12}s` }}>
              <span className="vx-tick">✅</span>
              <div><b>{it.t}</b><span>{it.s}</span></div>
              <em>{it.tag}</em>
            </li>
          ))}
        </ul>
      </div>

      <div className="vx-compare" data-rv="zoom">
        <div className="vx-compare-col mp">
          <span className="vx-compare-label"><i className="fa-solid fa-store" /> Official Store Marketplace</span>
          <div className="vx-strike"><span>{rp(VIP_PKG.marketplace)}</span></div>
          <ul>
            <li><i className="fa-solid fa-xmark" /> Tanpa bonus E-Book</li>
            <li><i className="fa-solid fa-xmark" /> Tanpa konsultasi ahli</li>
          </ul>
        </div>
        <div className="vx-compare-vs">VS</div>
        <div className="vx-compare-col vip">
          <span className="vx-compare-label"><i className="fa-solid fa-crown" /> Harga Spesial Paket VIP Hari Ini</span>
          <b className="vx-compare-price"><span data-count={VIP_PKG.price} data-pre="Rp">{rp(VIP_PKG.price)}</span></b>
          <ul>
            <li><i className="fa-solid fa-check" /> Bonus E-Book eksklusif</li>
            <li><i className="fa-solid fa-check" /> Konsultasi Ahli Kesehatan Kulit</li>
            <li><i className="fa-solid fa-check" /> Gratis ongkir</li>
          </ul>
        </div>
        <div className="vx-compare-badge"><i className="fa-solid fa-tags" /> Hemat Puluhan Ribu + Dapat Semua Bonus</div>
      </div>

      <button type="button" className="vx-btn vx-btn-gold vx-btn-xl" onClick={scrollToOrder} data-rv>
        AMBIL PAKET VIP SEKARANG <i className="fa-solid fa-arrow-down" />
      </button>
    </section>
  );
}

/* ================= SECTION 6: Pilihan paket & form pemesanan ================= */
// Pembayaran lewat payment gateway yang aktif di ERP (Midtrans popup / iPaymu redirect). COD sudah dihapus.
function Checkout({ onResult }) {
  const { packages, bump: BUMP } = useVipData();
  const defaultIdx = Math.max(0, packages.findIndex((p) => p.hot));
  const [pickedIdx, setPkgIdx] = useState(defaultIdx);
  // Daftar paket bisa berubah setelah data ERP datang: pilihan awal ikut paket unggulan
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!touched) setPkgIdx(defaultIdx); }, [defaultIdx, touched]);
  // Paket yang stoknya habis tidak bisa dipilih: pindah otomatis ke paket lain yang masih ada
  let pkgIdx = Math.min(pickedIdx, packages.length - 1);
  if (!packages[pkgIdx]?.inStock) {
    const alt = packages.findIndex((p) => p.inStock);
    if (alt >= 0) pkgIdx = alt;
  }
  const [bump, setBump] = useState(false);
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [ship, setShip] = useState(EMPTY_SHIP);
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);
  const refs = { name: useRef(null), wa: useRef(null), email: useRef(null), province: useRef(null), city: useRef(null), district: useRef(null), postal: useRef(null), addr: useRef(null) };
  const setS = (k) => (e) => setShip((s) => ({ ...s, [k]: k === 'postal' ? e.target.value.replace(/\D/g, '').slice(0, 5) : e.target.value }));

  const pkg = packages[pkgIdx];
  const soldOut = !pkg.inStock;
  const withBump = !!(bump && BUMP && BUMP.inStock);
  const shippingFee = useShippingFee([pkg.slug, ...(withBump && BUMP.slug ? [BUMP.slug] : [])]);
  const total = pkg.price + (withBump ? BUMP.price : 0) + shippingFee;
  const normalTotal = pkg.marketplace + (withBump ? BUMP.normal : 0) + shippingFee;

  // Meta: InitiateCheckout saat user mulai mengisi form
  const startCheckout = () => track('InitiateCheckout', { value: total, currency: 'IDR', content_name: pkg.name });

  // Hasil pembayaran tampil di halaman /terima-kasih/{token}; di sini hanya error sebelum bayar
  const fail = (message) => { setBusy(false); onResult({ status: 'error', message }); };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const digits = wa.replace(/\D/g, '');
    const nextBad = { name: name.trim().length < 2, wa: !/^(0|62|8)\d{8,13}$/.test(digits), ...shipErrors(ship) };
    setBad(nextBad);
    const first = ['name', 'wa', ...SHIP_ORDER].find((k) => nextBad[k]);
    if (first) { refs[first].current?.focus(); return; }
    if (soldOut) { onResult({ status: 'error', message: 'Maaf, stok paket ini sedang habis. Chat admin untuk info restock.' }); return; }

    setBusy(true);
    startCheckout();

    const bumpNote = withBump && !BUMP.slug ? `+ ${BUMP.name} (${rp(BUMP.price)})` : '';
    const note = ['VIP Page', pkg.name, bumpNote].filter(Boolean).join(' | ');

    const items = [{ slug: pkg.slug, qty: 1 }];
    if (withBump && BUMP.slug) items.push({ slug: BUMP.slug, qty: 1 });

    try {
      const data = await api.createOrderIntent({
        items,
        customer: { name: name.trim().slice(0, 80), phone: wa.trim().slice(0, 30), ...shipPayload(ship), note, source_url: window.location.href.slice(0, 250) },
      });
      // Semua jalur pembayaran berakhir di halaman /terima-kasih/{token} (bukan modal)
      if (!data.snap_token && data.redirect_url) { window.location.href = data.redirect_url; return undefined; }
      if (data.snap_token && data.client_key && data.snap_js_url) {
        try {
          const snap = await loadMidtransSnap(data.snap_js_url, data.client_key);
          const done = () => goThanks(data);
          snap.pay(data.snap_token, { onSuccess: done, onPending: done, onError: done, onClose: done });
          return undefined;
        } catch {
          if (data.redirect_url) { window.location.href = data.redirect_url; return undefined; }
        }
      }
      return fail('Halaman pembayaran gagal dibuka. Muat ulang halaman lalu coba lagi.');
    } catch (err) {
      // Termasuk "Payment gateway belum disetting": pesanan TIDAK dibuat di ERP
      return fail(err.message || 'Gagal memproses pesanan. Coba lagi sebentar.');
    }
  };

  const err = (k) => (bad[k] ? ' is-bad' : '');
  const bumpPct = BUMP && BUMP.normal > BUMP.price ? Math.round((1 - BUMP.price / BUMP.normal) * 100) : 0;

  return (
    <section className="vx-sec vx-checkout" id="pesan">
      <Head kicker="Form Pemesanan">Amankan <span className="vx-gold">Paket VIP</span> Kamu</Head>

      <form className="vx-form vx-glass" noValidate onSubmit={submit} onFocus={startCheckout}>
        <div className="vx-form-main">
          <div className="vx-step"><span>1</span> Pilih paket</div>
          <div className="vx-pkgs" role="radiogroup" aria-label="Pilihan paket">
            {packages.map((p, i) => (
              <label key={p.id} className={`vx-pkg${pkgIdx === i ? ' is-on' : ''}${p.hot && p.inStock ? ' is-hot' : ''}${p.inStock ? '' : ' is-out'}`}>
                <input type="radio" name="pkg" checked={pkgIdx === i} disabled={!p.inStock} onChange={() => { setTouched(true); setPkgIdx(i); }} />
                {!p.inStock ? <span className="vx-ribbon vx-ribbon-out">STOK HABIS</span> : p.hot ? <span className="vx-ribbon"><i className="fa-solid fa-fire" /> PALING LARIS</span> : null}
                <span className="vx-radio" />
                <div className="vx-pkg-main">
                  <b>{p.name}</b>
                  <span className="vx-muted">{p.desc}</span>
                  {p.perks?.length ? <ul>{p.perks.map((x) => <li key={x}><i className="fa-solid fa-check" /> {x}</li>)}</ul> : null}
                </div>
                <div className="vx-pkg-price">
                  {p.marketplace > p.price ? <s>{rp(p.marketplace)}</s> : null}
                  <b>{rp(p.price)}</b>
                </div>
              </label>
            ))}
          </div>

          <div className="vx-step"><span>2</span> Data pengiriman</div>
          <div className="vx-field">
            <label htmlFor="vxName">Nama Lengkap</label>
            <input ref={refs.name} id="vxName" className={`vx-inp${err('name')}`} autoComplete="name" placeholder="Contoh: Andika Pratama" value={name} onChange={(e) => setName(e.target.value)} />
            {bad.name ? <small className="vx-err">Isi nama lengkap penerima.</small> : null}
          </div>
          <div className="vx-field">
            <label htmlFor="vxWa">Nomor WhatsApp Aktif</label>
            <input ref={refs.wa} id="vxWa" className={`vx-inp${err('wa')}`} type="tel" inputMode="numeric" autoComplete="tel" placeholder="08xxxxxxxxxx" value={wa}
              onChange={(e) => setWa(e.target.value.replace(/[^\d+]/g, '').slice(0, 16))} />
            {bad.wa ? <small className="vx-err">Nomor WhatsApp belum valid (contoh 081234567890).</small> : <small className="vx-hint">Untuk konfirmasi pesanan, resi, dan bonus.</small>}
          </div>
          <div className="vx-field">
            <label htmlFor="vxEmail">Email</label>
            <input ref={refs.email} id="vxEmail" className={`vx-inp${err('email')}`} type="email" inputMode="email" autoComplete="email" placeholder="nama@email.com" value={ship.email} onChange={setS('email')} />
            {bad.email ? <small className="vx-err">Email belum valid.</small> : <small className="vx-hint">Dipakai untuk login Member Area (password dikirim ke WhatsApp).</small>}
          </div>
          <div className="vx-field">
            <label htmlFor="vxArea">Cari Kecamatan / Kode Pos</label>
            <AreaSearch id="vxArea" theme="light" inputClassName="vx-inp" onPick={(a) => setShip((s) => ({ ...s, ...a }))} />
          </div>
          <div className="vx-field">
            <label htmlFor="vxProv">Provinsi</label>
            <select ref={refs.province} id="vxProv" className={`vx-inp${err('province')}`} autoComplete="address-level1" value={ship.province} onChange={setS('province')}>
              <option value="">Pilih provinsi</option>
              {PROVINCES.map((pv) => <option key={pv} value={pv}>{pv}</option>)}
            </select>
            {bad.province ? <small className="vx-err">Pilih provinsi.</small> : null}
          </div>
          <div className="vx-field">
            <label htmlFor="vxCity">Kota / Kabupaten</label>
            <input ref={refs.city} id="vxCity" className={`vx-inp${err('city')}`} autoComplete="address-level2" placeholder="Contoh: Kota Bandung" value={ship.city} onChange={setS('city')} />
            {bad.city ? <small className="vx-err">Isi kota atau kabupaten.</small> : null}
          </div>
          <div className="vx-field">
            <label htmlFor="vxDist">Kecamatan</label>
            <input ref={refs.district} id="vxDist" className={`vx-inp${err('district')}`} autoComplete="address-level3" placeholder="Contoh: Coblong" value={ship.district} onChange={setS('district')} />
            {bad.district ? <small className="vx-err">Isi kecamatan.</small> : null}
          </div>
          <div className="vx-field">
            <label htmlFor="vxPos">Kode Pos <small className="vx-hint">(opsional)</small></label>
            <input ref={refs.postal} id="vxPos" className={`vx-inp${err('postal')}`} inputMode="numeric" autoComplete="postal-code" placeholder="40132" value={ship.postal} onChange={setS('postal')} />
            {bad.postal ? <small className="vx-err">Kode pos 5 angka.</small> : null}
          </div>
          <div className="vx-field">
            <label htmlFor="vxAddr">Alamat Lengkap</label>
            <textarea ref={refs.addr} id="vxAddr" className={`vx-inp${err('addr')}`} rows="2" autoComplete="street-address" maxLength={250}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan" value={ship.addr} onChange={setS('addr')} />
            {bad.addr ? <small className="vx-err">Isi nama jalan dan nomor rumah.</small> : null}
          </div>
        </div>
        <div className="vx-form-side">
          <div className="vx-step"><span>3</span> Metode pembayaran</div>
          <div className="vx-pay is-on is-single">
            <span className="vx-pay-ic"><i className="fa-solid fa-qrcode" /></span>
            <div>
              <b>QRIS / Virtual Account</b>
              <span className="vx-muted">Pembayaran resmi, konfirmasi otomatis</span>
              <span className="vx-pay-logos">QRIS · BCA · Mandiri · BNI · BRI · dan lainnya</span>
            </div>
            <i className="fa-solid fa-circle-check vx-pay-ok" />
          </div>

          {BUMP && BUMP.inStock ? (
          <label className={`vx-bump${bump ? ' is-on' : ''}`}>
            <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} />
            <span className="vx-check"><i className="fa-solid fa-check" /></span>
            <img src={BUMP.img} alt="" width="36" height="110" loading="lazy" />
            <span className="vx-bump-txt">
              <b>Ya! Tambahkan {BUMP.name}</b>
              <span>hanya tambah <b className="vx-goldtxt">{rp(BUMP.price)}</b>{BUMP.normal > BUMP.price ? <> <s>{rp(BUMP.normal)}</s> <em>Hemat {bumpPct}%</em></> : null}</span>
            </span>
          </label>
          ) : null}

          <div className="vx-summary">
            <div className="vx-sum-title"><i className="fa-solid fa-receipt" /> Ringkasan pesanan</div>
            <div className="vx-sum-row"><span>{pkg.name}</span><span>{rp(pkg.price)}</span></div>
            {withBump ? <div className="vx-sum-row vx-pop"><span>{BUMP.name}</span><span>{rp(BUMP.price)}</span></div> : null}
            <div className="vx-sum-row"><span>Bonus E-Book</span><span className="vx-free">GRATIS</span></div>
            {pkg.hot ? <div className="vx-sum-row"><span>Konsultasi Ahli Kesehatan Kulit</span><span className="vx-free">GRATIS</span></div> : null}
            <div className="vx-sum-row"><span>Ongkos kirim</span>{shippingFee > 0 ? <span>{rp(shippingFee)}</span> : <span className="vx-free">GRATIS</span>}</div>
            <div className="vx-sum-total">
              <span>Total bayar</span>
              <div><s>{rp(normalTotal)}</s><b key={total} className="vx-pop">{rp(total)}</b></div>
            </div>
          </div>

          {VIP.slotsLeft ? (
            <div className="vx-scarcity"><span className="vx-live" /><span>⚠️ Kuota Konsultasi Ahli Kesehatan Kulit &amp; Bonus E-Book hari ini tersisa <b>{VIP.slotsLeft} slot</b>.</span></div>
          ) : null}

          <button type="submit" className="vx-btn vx-btn-gold vx-btn-xl vx-btn-block" disabled={busy || soldOut}>
            {busy ? <><i className="fa-solid fa-spinner fa-spin" /> Memproses…</> : soldOut ? <>STOK SEDANG HABIS</> : <>PESAN SEKARANG &amp; AMANKAN BONUSNYA 🔒</>}
          </button>
          {soldOut ? (
            <a className="vx-btn vx-btn-block" style={{ marginTop: '10px' }} href={waUrl('Halo admin Clorismen, paket VIP di website lagi habis. Kapan restock?')} target="_blank" rel="noopener">
              <i className="fa-brands fa-whatsapp" /> Tanya Restock ke Admin
            </a>
          ) : null}
          <div className="vx-secure">
            <span><i className="fa-solid fa-lock" /> Data aman</span>
            <span><i className="fa-solid fa-truck-fast" /> {shippingFee > 0 ? 'Resi via WhatsApp' : 'Gratis ongkir'}</span>
            <span><i className="fa-brands fa-whatsapp" /> Admin siap bantu</span>
          </div>
        </div>
      </form>
    </section>
  );
}

/* ================= Thank you (setelah checkout) ================= */
const RESULT_COPY = {
  paid: { icon: 'fa-circle-check', tone: 'ok', title: 'Pembayaran Berhasil', text: 'Terima kasih! Pesanan kamu sudah kami terima. Email & password Member Area dikirim ke WhatsApp kamu untuk cek status pesanan dan resi.' },
  pending: { icon: 'fa-clock', tone: 'warn', title: 'Menunggu Pembayaran', text: 'Selesaikan pembayaran QRIS / Virtual Account. Status pesanan diperbarui otomatis setelah lunas.' },
  checking: { icon: 'fa-spinner fa-spin', tone: 'warn', title: 'Mengecek Pembayaran…', text: 'Sebentar ya, kami sedang memastikan status pembayaran kamu.' },
  error: { icon: 'fa-circle-exclamation', tone: 'bad', title: 'Pesanan Belum Terkirim', text: '' },
};

function ThankYou({ result, onClose }) {
  useWaNumber();
  useEffect(() => {
    if (!result) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [result]);
  if (!result) return null;
  const c = RESULT_COPY[result.status] || RESULT_COPY.error;
  const orderId = result.code || '-';
  const consultText = `Halo Tim Ahli Kulit Clorismen, saya pembeli Paket VIP dengan No. Order #${orderId}, ingin konsultasi kondisi kulit saya`;
  const adminText = result.code ? `Halo admin Clorismen, saya sudah order dengan No. Order #${orderId}` : 'Halo admin Clorismen, saya mau order Paket VIP';

  return (
    <div className="vx-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vx-modal-box">
        <button type="button" className="vx-modal-x" aria-label="Tutup" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        <div className={`vx-ty-icon ${c.tone}`}><i className={`fa-solid ${c.icon}`} /></div>
        <h3>{result.title || c.title}</h3>
        <p className="vx-muted">{result.status === 'error' ? result.message : c.text}</p>

        {result.code ? (
          <div className="vx-ty-sum">
            <div><span>No. Order</span><b>#{result.code}</b></div>
            {result.pkg ? <div><span>Paket</span><b>{result.pkg.name}</b></div> : null}
            {result.total ? <div><span>Total</span><b>{rp(result.total)}</b></div> : null}
          </div>
        ) : null}

        <div className="vx-ty-actions">
          {result.status === 'pending' && result.retry ? (
            <button type="button" className="vx-btn vx-btn-gold vx-btn-block" onClick={result.retry}>Lanjut Bayar <i className="fa-solid fa-lock" /></button>
          ) : null}
          {result.status === 'paid' ? (
            <a className="vx-btn vx-btn-dark vx-btn-block" href="/member"><i className="fa-solid fa-crown" /> Masuk Member Area (E-Book)</a>
          ) : null}
          {result.code && result.pkg?.hot && result.status !== 'error' ? (
            <a className="vx-btn vx-btn-wa vx-btn-block" href={waUrl(consultText)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Konsultasi Ahli Kesehatan Kulit</a>
          ) : null}
          <a className="vx-btn vx-btn-ghost vx-btn-block" href={result.waUrl || waUrl(adminText)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Chat Admin</a>
        </div>
        {result.status === 'paid' ? <p className="vx-hint center">Email &amp; password Member Area dikirim ke WhatsApp kamu.</p> : null}
      </div>
    </div>
  );
}

/* ================= SECTION 7: FAQ (accordion) & garansi ================= */
const FAQ = [
  { q: 'Apakah produknya aman dan terdaftar BPOM?', a: 'Ya. Seluruh produk dalam paket adalah kosmetik perawatan kulit yang terdaftar BPOM. Nomor registrasinya tercantum di kemasan dan di bagian bawah halaman ini.' },
  { q: 'Bagaimana cara klaim Bonus E-Book & Konsultasi Ahli Kesehatan Kulit?', a: 'Setelah pembayaran QRIS / Virtual Account terkonfirmasi, tombol download E-Book muncul di halaman konfirmasi dan link-nya juga dikirim lewat WhatsApp. Untuk Paket VIP Komplit, tombol Konsultasi muncul di halaman konfirmasi dan pesannya sudah berisi nomor order kamu.' },
  { q: 'Berapa lama estimasi pengiriman?', a: 'Pesanan diproses di hari kerja. Lama pengiriman mengikuti lokasi dan kurir. Nomor resi dikirim lewat WhatsApp setelah paket diserahkan ke kurir.' },
  { q: 'Pembayarannya bisa pakai apa?', a: 'Pembayaran lewat payment gateway resmi: QRIS (semua e-wallet & m-banking) atau Virtual Account bank (BCA, Mandiri, BNI, BRI, dan lainnya). Konfirmasi otomatis, jadi pesanan langsung diproses setelah lunas.' },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="vx-sec">
      <Head kicker="Tanya Jawab">Pertanyaan yang <span className="vx-gold">Sering Ditanya</span></Head>
      <div className="vx-faq">
        {FAQ.map((f, i) => (
          // Animasi muncul dipasang di pembungkus: className item berubah saat dibuka/tutup,
          // dan kalau kelas animasi ada di elemen yang sama, React menghapusnya → item jadi tak terlihat.
          <div key={f.q} data-rv style={{ '--d': `${i * 0.06}s` }}>
            <div className={`vx-faq-item${open === i ? ' is-open' : ''}`}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="vx-faq-no">0{i + 1}</span>
                <span className="vx-faq-q">{f.q}</span>
                <i className="fa-solid fa-plus" />
              </button>
              <div className="vx-faq-a"><div><p>{f.a}</p></div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="vx-guarantee vx-glass" data-rv>
        <div className="vx-seal"><i className="fa-solid fa-shield-halved" /><span>ORIGINAL</span></div>
        <div>
          <b>Garansi Produk 100% Original &amp; Terdaftar BPOM</b>
          <span>Dikirim langsung dari Clorismen Official. Ada kendala dengan pesanan? Admin siap bantu lewat WhatsApp.</span>
        </div>
      </div>
    </section>
  );
}

/* ================= SECTION 8: Footer (kepatuhan Meta Ads) ================= */
const POLICY = {
  privacy: {
    title: 'Kebijakan Privasi',
    body: [
      'Data yang kamu isi (nama, nomor WhatsApp, dan alamat) hanya dipakai untuk memproses dan mengirim pesanan, konfirmasi pembayaran, serta mengirim bonus yang termasuk dalam paket.',
      'Kami tidak menjual data pribadi kepada pihak lain. Data dibagikan seperlunya kepada mitra pengiriman dan penyedia pembayaran untuk menyelesaikan pesanan.',
      'Halaman ini memakai piksel iklan untuk mengukur kinerja iklan. Hubungi admin lewat WhatsApp untuk meminta penghapusan data.',
    ],
  },
  terms: {
    title: 'Syarat & Ketentuan',
    body: [
      'Harga dan bonus di halaman ini berlaku untuk pemesanan melalui halaman ini selama promo berlangsung dan dapat berubah sewaktu-waktu.',
      'Konsultasi Ahli Kesehatan Kulit bersifat edukasi perawatan kulit dan bukan pengganti pemeriksaan medis.',
      'Pembayaran dilakukan lewat QRIS / Virtual Account melalui payment gateway resmi. Pesanan dengan data tidak lengkap dapat dibatalkan.',
    ],
  },
};

function Footer({ onPolicy }) {
  const wa = useWaNumber();
  const brand = useBrand(); // diatur di ERP: Landing Page CMS → Brand
  const name = brand?.name || 'Clorismen';
  const address = brand?.address || (/^\[/.test(VIP.legal.address) ? '' : VIP.legal.address);
  const socials = brandSocials(brand);
  const bpom = VIP.legal.bpom.filter((b) => b.no && !/^\[/.test(b.no));
  return (
    <footer className="vx-footer">
      <img src={IMG.logo} alt={name} className="vx-footer-logo" width="140" height="76" loading="lazy" />
      <p className="vx-footer-company">{name} Official</p>
      {address ? <p className="vx-footer-addr"><i className="fa-solid fa-location-dot" /> {address}</p> : null}
      <p className="vx-footer-addr vx-footer-contact">
        {brand?.email ? <a href={`mailto:${brand.email}`}><i className="fa-solid fa-envelope" /> {brand.email}</a> : null}
        <a href={waUrl('Halo admin Clorismen, saya mau tanya soal Paket VIP')} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> {brand?.whatsapp_display || fmtWa(wa)}</a>
      </p>
      {socials.length ? (
        <p className="vx-footer-social">
          {socials.map((x) => <a key={x.href} href={x.href} target="_blank" rel="noopener" aria-label={x.label} title={x.label}><i className={x.icon} /></a>)}
        </p>
      ) : null}
      {brand?.footer_note ? <p className="vx-footer-note">{brand.footer_note}</p> : null}
      {bpom.length ? (
        <div className="vx-bpom">
          <b>Nomor Registrasi BPOM</b>
          <ul>{bpom.map((b) => <li key={b.name}><span>{b.name}</span><span>{b.no}</span></li>)}</ul>
        </div>
      ) : null}
      <div className="vx-footer-links">
        <a href="/faq">FAQ</a>
        <span>·</span>
        <a href="/refund-policy">Kebijakan Refund</a>
        <span>·</span>
        <a href="/terms-and-conditions">Syarat &amp; Ketentuan</a>
        <span>·</span>
        <a href="/privacy-policy">Kebijakan Privasi</a>
        <span>·</span>
        <a href="/kontak">Kontak</a>
        <span>·</span>
        <a href="/member">Member Area</a>
      </div>
      <p className="vx-disclaimer">
        Hasil pemakaian dapat bervariasi pada setiap individu tergantung jenis kulit dan keteraturan penggunaan.
        Produk ini merupakan kosmetik perawatan kulit terdaftar BPOM dan bukan obat medis.
      </p>
      <p className="vx-copy">© {new Date().getFullYear()} {name} Official</p>
    </footer>
  );
}

function PolicyModal({ id, onClose }) {
  if (!id) return null;
  const p = POLICY[id];
  return (
    <div className="vx-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vx-modal-box left">
        <button type="button" className="vx-modal-x" aria-label="Tutup" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        <h3>{p.title}</h3>
        {p.body.map((t) => <p key={t} className="vx-muted">{t}</p>)}
      </div>
    </div>
  );
}

/* ================= Sticky bottom CTA ================= */
function StickyCta() {
  const VIP_PKG = useVipData().main;
  const [state, setState] = useState({ past: false, atForm: false });
  useEffect(() => {
    const onScroll = () => setState((s) => (s.past === window.scrollY > 420 ? s : { ...s, past: window.scrollY > 420 }));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const el = document.getElementById('pesan');
    let io;
    if (el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => setState((s) => ({ ...s, atForm: e.isIntersecting })), { threshold: 0.05 });
      io.observe(el);
    }
    return () => { window.removeEventListener('scroll', onScroll); io?.disconnect(); };
  }, []);
  const show = state.past && !state.atForm;
  return (
    <div className={`vx-sticky${show ? ' is-on' : ''}`} aria-hidden={!show}>
      <div className="vx-sticky-in">
        <div className="vx-sticky-price"><s>{rp(VIP_PKG.marketplace)}</s><b>{rp(VIP_PKG.price)}</b></div>
        <button type="button" className="vx-btn vx-btn-gold" onClick={scrollToOrder} tabIndex={show ? 0 : -1}>AMANKAN PAKET VIP SEKARANG</button>
      </div>
    </div>
  );
}

/* ================= Halaman ================= */
export default function VipPage() {
  const [result, setResult] = useState(null);
  const [policy, setPolicy] = useState(null);
  usePageEffects();

  useEffect(() => {
    document.title = 'Paket VIP Clorismen — Lebih Hemat + Bonus E-Book & Konsultasi Ahli Kulit';
    const setMeta = (name, content) => {
      let m = document.querySelector(`meta[name="${name}"]`);
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', name); document.head.appendChild(m); }
      m.setAttribute('content', content);
    };
    setMeta('description', 'Paket Lengkap Perawatan Pria Clorismen 30 hari dengan harga khusus member VIP, bonus E-Book eksklusif, konsultasi Ahli Kesehatan Kulit, gratis ongkir.');
    setMeta('theme-color', '#121C26');
    const pre = document.createElement('link');
    pre.rel = 'preload'; pre.as = 'image'; pre.href = IMG.bundle; pre.setAttribute('imagesrcset', IMG.bundleSet); pre.setAttribute('imagesizes', '(min-width: 960px) 560px, 100vw'); pre.setAttribute('fetchpriority', 'high');
    document.head.appendChild(pre);
    initPixel(); // Meta: PageView
    return () => pre.remove();
  }, []);

  return (
    <div className="vx">
      <div className="vx-ambient" aria-hidden="true" />
      <Announcement />
      <main className="vx-shell">
        <Hero />
        <Education />
        <BuyerReviews />
        <ValueStack />
        <Checkout onResult={setResult} />
        <Faq />
        <Footer onPolicy={setPolicy} />
      </main>
      <StickyCta />
      <PurchaseToast theme="light" lift />
      <ThankYou result={result} onClose={() => setResult(null)} />
      <PolicyModal id={policy} onClose={() => setPolicy(null)} />
    </div>
  );
}
