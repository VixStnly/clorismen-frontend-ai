import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { loadMidtransSnap } from '../lib/midtrans.js';
import { REVIEWS } from '../data.js';
import { VIP, rp, waUrl } from './vipConfig.js';
import { initPixel, track } from './pixel.js';
import './vip.css';

/* Aset glossy hasil generate ulang: tools/make_vip_lux_images.py → images/vip-lux/ */
const IMG = {
  bundle: '/images/vip-lux/hero-bundle-light.webp',
  micellar: '/images/vip-lux/prod-micellar.webp',
  facewash: '/images/vip-lux/prod-facewash.webp',
  serum: '/images/vip-lux/prod-serum.webp',
  sunscreen: '/images/vip-lux/prod-sunscreen.webp',
  logo: '/images/vip-lux/logo-dark.webp',
  logoGold: '/images/vip-lux/logo-gold.webp',
};

const VIP_PKG = VIP.packages.find((p) => p.hot) || VIP.packages[VIP.packages.length - 1];
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

    // Parallax ringan untuk visual hero (scroll) + tilt mengikuti pointer
    const hero = root.querySelector('.vx-hero-visual');
    if (hero && !reduce) {
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const y = Math.min(window.scrollY, 700);
          hero.style.setProperty('--py', `${y * 0.08}px`);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
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
  return (
    <header className="vx-hero">
      <div className="vx-hero-bg" aria-hidden="true"><span className="o1" /><span className="o2" /><span className="o3" /></div>
      <Sparkles n={16} />

      <div className="vx-brandrow" data-rv>
        <img src={IMG.logo} alt="Clorismen" className="vx-logo" width="120" height="65" />
        <span className="vx-vipchip"><i className="fa-solid fa-crown" /> VIP ACCESS</span>
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
        <img className="vx-bundle" src={IMG.bundle} alt="Paket Bundling Clorismen: box eksklusif berisi Micellar Water, Face Wash, Brightening Serum, dan Sunscreen" width="1400" height="1260" fetchPriority="high" />
        <div className="vx-sweep" aria-hidden="true" />
        <div className="vx-badge-bpom">
          <span><i className="fa-solid fa-shield-halved" /> 100% Original BPOM</span>
          <em />
          <span><i className="fa-solid fa-truck-fast" /> Gratis Ongkir &amp; Bisa COD</span>
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
        <li><i className="fa-solid fa-hand-holding-dollar" /> Bisa COD</li>
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
              <div className="vx-shelf-img"><img src={IMG[r.k]} alt={r.n} loading="lazy" width="120" height="300" /></div>
              <figcaption><b>{r.v}</b><span>{r.n}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= SECTION 4: Social proof — Day 1 vs Day 14 ================= */
function Stars({ n = 5 }) {
  return <span className="vx-stars" aria-label={`${n} dari 5 bintang`}>{Array.from({ length: 5 }, (_, i) => <i key={i} className={`fa-solid fa-star${i < Math.round(n) ? '' : ' off'}`} />)}</span>;
}

function ReviewPhoto({ src, name, illustration }) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) {
    // Sementara foto asli pembeli belum ada: tampilkan paket yang dipakai (bukan foto orang),
    // supaya tidak ada foto "pembeli" palsu. Begitu images/vip/review-rizky.webp ada, foto itu yang tampil.
    return (
      <div className="vx-story-ph has-product">
        <img src={IMG.bundle} alt="Paket Lengkap VIP Clorismen yang dipakai pembeli" loading="lazy" width="700" height="630" />
        <span className="vx-story-cap">Paket yang dipakai {name}</span>
      </div>
    );
  }
  const alt = illustration ? 'Foto ilustrasi model pria dengan Paket VIP Clorismen' : `${name} memegang box Paket Clorismen`;
  return <img src={src} alt={alt} className="vx-story-photo" loading="lazy" onError={() => setOk(false)} />;
}

function SocialProof() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    // Meta: ViewContent saat pengunjung melewati Section 4
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top < 0) {
        track('ViewContent', { content_name: 'Paket VIP Clorismen', content_category: 'bundling', value: VIP_PKG.price, currency: 'IDR' });
        io.disconnect();
      }
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r = VIP.storyReview;
  const more = REVIEWS.slice(0, 6);
  return (
    <section className="vx-sec vx-proof" ref={ref}>
      <Head kicker="Review Pembeli">Dari <span className="vx-gold">Day 1</span> ke <span className="vx-gold">Day 14</span></Head>

      {r ? (
        <article className="vx-story" data-rv="zoom">
          <div className="vx-story-media">
            <ReviewPhoto src={r.photo} name={r.name.split(' ')[0]} illustration={r.photoIllustration} />
            {r.photoIllustration
              ? <span className="vx-story-illus">Foto ilustrasi (model)</span>
              : <span className="vx-story-badge"><i className="fa-solid fa-circle-check" /> Verified Buyer — Paket Lengkap VIP</span>}
            <div className="vx-story-rating">
              <Stars n={5} />
              <b><span data-count={r.rating} data-dec="1">0</span>/5</b>
            </div>
          </div>
          <div className="vx-story-body">
            <h3>{r.title}</h3>
            <div className="vx-story-who">
              <span className="vx-avatar">{r.name.charAt(0)}</span>
              <div><b>{r.name}</b><small>{r.meta}</small></div>
            </div>
            {r.photoIllustration ? <span className="vx-story-badge inline"><i className="fa-solid fa-circle-check" /> Verified Buyer — Paket Lengkap VIP</span> : null}
            <ol className="vx-timeline">
              {r.days.map((d, i) => (
                <li key={d.label} data-rv style={{ '--d': `${0.1 + i * 0.15}s` }}>
                  <div className="vx-tl-dot"><b>{d.label.replace('Day ', '')}</b></div>
                  <div className="vx-tl-body">
                    <div className="vx-tl-tag">{d.label} <span>({d.sub})</span></div>
                    <p>{d.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {r.quote ? <blockquote data-rv><i className="fa-solid fa-quote-left" />{r.quote.replace(/[“”]/g, '')}</blockquote> : null}
          </div>
        </article>
      ) : null}

      <div className="vx-more-head" data-rv>
        <b>Ulasan pembeli lainnya</b>
        <span>Dari marketplace · nama disamarkan</span>
      </div>
      <div className="vx-reviews">
        {more.map((rv) => (
          <article key={rv.n + rv.d} className="vx-review vx-glass">
            <div className="vx-review-top">
              <div className="vx-avatar sm">{rv.n.charAt(0).toUpperCase()}</div>
              <div><b>{rv.n}</b><div className="vx-review-meta"><Stars n={rv.r} /> <span>{rv.d}</span></div></div>
            </div>
            <p>{rv.t}</p>
            {rv.pics?.length ? (
              <div className="vx-review-pics">
                {rv.pics.map((p) => <img key={p} src={`/images/reviews/${p}`} alt="Foto ulasan pembeli" loading="lazy" width="56" height="56" />)}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <div className="vx-swipe"><i className="fa-solid fa-arrows-left-right" /> Geser untuk ulasan lain</div>
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
          <img src={IMG.logoGold} alt="" width="80" height="44" />
        </div>
        <div className="vx-book-spine" />
        <div className="vx-book-pages" />
      </div>
    </div>
  );
}

function ValueStack() {
  const items = [
    { t: 'Paket Lengkap Clorismen', s: 'Perawatan 30 Hari — Lebih murah dari Official Store Marketplace', tag: 'HEMAT' },
    { t: `BONUS 1: E-Book ‘${VIP.ebookTitle}’`, s: `Senilai ${rp(VIP.ebookValue)}`, tag: 'GRATIS' },
    { t: 'BONUS 2: Akses Konsultasi Langsung dengan Ahli Kesehatan Kulit', s: 'Pendampingan setelah pembelian', tag: 'GRATIS' },
    { t: 'Subsidi Gratis Ongkir & Layanan COD', s: 'Ongkir ditanggung, bisa bayar di tempat', tag: 'GRATIS' },
  ];
  return (
    <section className="vx-sec vx-value">
      <Head kicker="Penawaran Khusus" sub="Nggak perlu cek harga ke Shopee atau TikTok Shop. Ini semua yang kamu dapat kalau pesan di halaman ini.">
        Marketplace vs <span className="vx-gold">Halaman VIP</span>
      </Head>

      <div className="vx-stack vx-glass" data-rv data-glow>
        <div className="vx-stack-visual">
          <img className="vx-stack-bundle" src={IMG.bundle} alt="" loading="lazy" width="700" height="630" />
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
            <li><i className="fa-solid fa-check" /> Gratis ongkir &amp; COD</li>
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

/* ================= Pilih kecamatan (autocomplete RajaOngkir lewat BFF) ================= */
const titleCase = (s = '') => s.toLowerCase()
  .replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase())
  .replace(/\b(Dki|Di|Ntb|Ntt)\b/g, (m) => m.toUpperCase());

function destParts(d) {
  const kel = titleCase(d.subdistrict);
  const kec = titleCase(d.district);
  return {
    top: kel && kel !== kec ? `Kel. ${kel}, Kec. ${kec}` : `Kec. ${kec}`,
    bottom: [titleCase(d.city), titleCase(d.province)].filter(Boolean).join(', ') + (d.zip ? ` ${d.zip}` : ''),
  };
}

function destText(d) {
  if (!d) return '';
  if (d.manual) return d.text.trim();
  const p = destParts(d);
  return `${p.top}, ${p.bottom}`;
}

function DestinationPicker({ inputRef, value, onChange, invalid }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false); // API tidak tersedia → izinkan isi manual
  const boxRef = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (value && !value.manual) return undefined;
    if (term.length < 3 || failed) { setList([]); setLoading(false); return undefined; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const rows = await api.searchDestinations(term, ctrl.signal);
        setList(Array.isArray(rows) ? rows : []);
        setActive(rows?.length ? 0 : -1);
        setOpen(true);
      } catch (e) {
        if (e.name === 'AbortError' || ctrl.signal.aborted) return;
        setFailed(true);
        setList([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 320);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, value, failed]);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const pick = (d) => { onChange(d); setOpen(false); setQ(''); setList([]); };
  const clear = () => { onChange(null); setQ(''); setTimeout(() => inputRef.current?.focus(), 0); };

  const onKey = (e) => {
    if (!open || !list.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % list.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + list.length) % list.length); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(list[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  if (value && !value.manual) {
    const p = destParts(value);
    return (
      <div className="vx-dest-picked">
        <i className="fa-solid fa-location-dot" />
        <div><b>{p.top}</b><span>{p.bottom}</span></div>
        <button type="button" onClick={clear} ref={inputRef}>Ganti</button>
      </div>
    );
  }

  return (
    <div className="vx-dest" ref={boxRef}>
      <div className="vx-dest-inp">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          ref={inputRef}
          id="vxDest"
          className={`vx-inp${invalid ? ' is-bad' : ''}`}
          role="combobox"
          aria-expanded={open}
          aria-controls="vxDestList"
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={failed ? 'Ketik kecamatan, kota, dan kode pos' : 'Ketik nama kecamatan, contoh: Menteng'}
          value={failed ? (value?.text || q) : q}
          onChange={(e) => {
            setQ(e.target.value);
            if (failed) onChange(e.target.value.trim() ? { manual: true, text: e.target.value } : null);
          }}
          onFocus={() => { if (list.length) setOpen(true); }}
          onKeyDown={onKey}
        />
        {loading ? <i className="fa-solid fa-spinner fa-spin vx-dest-spin" /> : null}
      </div>
      {failed ? <small className="vx-hint">Pencarian otomatis sedang tidak tersedia, silakan ketik manual.</small>
        : q.trim().length > 0 && q.trim().length < 3 ? <small className="vx-hint">Ketik minimal 3 huruf.</small> : null}
      {open && !failed && q.trim().length >= 3 && !loading ? (
        <ul className="vx-dest-list" id="vxDestList" role="listbox">
          {list.length ? list.map((d, i) => {
            const p = destParts(d);
            return (
              <li key={d.id} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''}
                onPointerDown={(e) => { e.preventDefault(); pick(d); }} onMouseEnter={() => setActive(i)}>
                <b>{p.top}</b><span>{p.bottom}</span>
              </li>
            );
          }) : <li className="vx-dest-empty">Kecamatan tidak ditemukan. Coba ejaan lain atau nama kota.</li>}
        </ul>
      ) : null}
    </div>
  );
}

/* ================= SECTION 6: Pilihan paket & form pemesanan ================= */
const PAYS = [
  { id: 'online', label: 'QRIS / Virtual Account', sub: 'Konfirmasi otomatis', badge: 'Prioritas Kirim & Bebas Biaya Admin', icon: 'fa-qrcode' },
  { id: 'cod', label: 'COD (Bayar di Tempat)', sub: 'Bayar ke kurir saat paket tiba', icon: 'fa-hand-holding-dollar' },
];

function Checkout({ onResult }) {
  const defaultIdx = Math.max(0, VIP.packages.findIndex((p) => p.hot));
  const [pkgIdx, setPkgIdx] = useState(defaultIdx);
  const [bump, setBump] = useState(false);
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [addr, setAddr] = useState('');
  const [dest, setDest] = useState(null); // { id, label, ... } dari RajaOngkir, atau { manual: true, text }
  const [pay, setPay] = useState('online');
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);
  const refs = { name: useRef(null), wa: useRef(null), addr: useRef(null), dest: useRef(null) };
  const snapRef = useRef(null);

  const pkg = VIP.packages[pkgIdx];
  const total = pkg.price + (bump ? VIP.bump.price : 0);
  const normalTotal = pkg.marketplace + (bump ? VIP.bump.normal : 0);

  // Meta: InitiateCheckout saat user mulai mengisi form
  const startCheckout = () => track('InitiateCheckout', { value: total, currency: 'IDR', content_name: pkg.name });

  const finish = (status, extra = {}) => {
    setBusy(false);
    if (status === 'paid' || status === 'cod') track('Purchase', { value: extra.total || total, currency: 'IDR', content_name: pkg.name }, false);
    onResult({ status, pkg, ...extra, retry: snapRef.current ? retryPay : null });
  };

  const runSnap = async (data) => {
    const snap = await loadMidtransSnap(data.snap_js_url, data.client_key);
    const base = { code: data.code, total: data.total, snapToken: data.snap_token };
    snapRef.current = data;
    snap.pay(data.snap_token, {
      onSuccess: async () => {
        try { await api.verifyPayment(data.code); } catch { /* webhook tetap memperbarui status */ }
        finish('paid', base);
      },
      onPending: () => finish('pending', base),
      onError: () => finish('error', { ...base, message: 'Pembayaran gagal atau dibatalkan. Coba lagi, atau selesaikan lewat WhatsApp admin.' }),
      onClose: () => finish('pending', base),
    });
  };

  function retryPay() {
    const d = snapRef.current;
    if (!d) return;
    onResult(null);
    runSnap(d).catch(() => finish('manual', { code: d.code, total: d.total }));
  }

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const digits = wa.replace(/\D/g, '');
    const destOk = !!dest && (dest.manual ? dest.text.trim().length >= 5 : !!dest.id);
    const v = { name: name.trim().length >= 2, wa: /^(0|62|8)\d{8,13}$/.test(digits), addr: addr.trim().length >= 8, dest: destOk };
    const nextBad = { name: !v.name, wa: !v.wa, addr: !v.addr, dest: !v.dest };
    setBad(nextBad);
    const first = ['name', 'wa', 'addr', 'dest'].find((k) => nextBad[k]);
    if (first) { refs[first].current?.focus(); return; }

    setBusy(true);
    startCheckout();

    // Catatan pesanan (maks 300 karakter di ERP): alamat jalan + wilayah RajaOngkir + info paket/pembayaran
    const area = destText(dest);
    const bumpNote = bump && !VIP.bump.slug ? `+ ${VIP.bump.name} (${rp(VIP.bump.price)}, konfirmasi admin)` : '';
    const meta = [area, 'VIP Page', pkg.name, bumpNote, `Bayar: ${pay === 'cod' ? 'COD' : 'QRIS/VA'}`].filter(Boolean).join(' | ');
    const room = 300 - meta.length - 3;
    const note = room > 10 ? `${addr.trim().slice(0, room)} | ${meta}` : `${addr.trim()} | ${area}`.slice(0, 300);
    const fullAddr = `${addr.trim()}, ${area}`;

    const items = [{ slug: pkg.slug, qty: 1 }];
    if (bump && VIP.bump.slug) items.push({ slug: VIP.bump.slug, qty: 1 });

    const waFallback = waUrl(
      `Halo admin Clorismen, saya mau order *${pkg.name}* (halaman VIP)\n\n` +
      `Nama: ${name.trim()}\nWhatsApp: ${wa.trim()}\nAlamat: ${fullAddr}\n\n` +
      `Paket: ${pkg.name} (${rp(pkg.price)})\n` + (bump ? `+ ${VIP.bump.name} (${rp(VIP.bump.price)})\n` : '') +
      `Pembayaran: ${pay === 'cod' ? 'COD' : 'QRIS / Virtual Account'}`,
    );

    try {
      const data = await api.createOrderIntent({
        items,
        customer: { name: name.trim().slice(0, 80), phone: wa.trim().slice(0, 30), note, source_url: window.location.href.slice(0, 250) },
      });
      const base = { code: data.code, total: data.total, waUrl: data.whatsapp_url || waFallback };
      if (pay === 'cod') return finish('cod', base);
      if (data.snap_token && data.client_key && data.snap_js_url) {
        try { await runSnap(data); return undefined; } catch {
          if (data.redirect_url) { window.location.href = data.redirect_url; return undefined; }
        }
      }
      return finish('manual', base);
    } catch (err) {
      return finish('error', { message: `${err.message || 'Gagal memproses pesanan.'} Pesanan tetap bisa dikirim lewat WhatsApp admin.`, waUrl: waFallback });
    }
  };

  const err = (k) => (bad[k] ? ' is-bad' : '');
  const bumpPct = Math.round((1 - VIP.bump.price / VIP.bump.normal) * 100);

  return (
    <section className="vx-sec vx-checkout" id="pesan">
      <Head kicker="Form Pemesanan">Amankan <span className="vx-gold">Paket VIP</span> Kamu</Head>

      <form className="vx-form vx-glass" noValidate onSubmit={submit} onFocus={startCheckout}>
        <div className="vx-step"><span>1</span> Pilih paket</div>
        <div className="vx-pkgs" role="radiogroup" aria-label="Pilihan paket">
          {VIP.packages.map((p, i) => (
            <label key={p.id} className={`vx-pkg${pkgIdx === i ? ' is-on' : ''}${p.hot ? ' is-hot' : ''}`}>
              <input type="radio" name="pkg" checked={pkgIdx === i} onChange={() => setPkgIdx(i)} />
              {p.hot ? <span className="vx-ribbon"><i className="fa-solid fa-fire" /> PALING LARIS</span> : null}
              <span className="vx-radio" />
              <div className="vx-pkg-main">
                <b>{p.name}</b>
                <span className="vx-muted">{p.desc}</span>
                <ul>{p.perks.map((x) => <li key={x}><i className="fa-solid fa-check" /> {x}</li>)}</ul>
              </div>
              <div className="vx-pkg-price">
                <s>{rp(p.marketplace)}</s>
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
          <label htmlFor="vxDest">Kecamatan / Kota</label>
          <DestinationPicker inputRef={refs.dest} value={dest} onChange={setDest} invalid={!!bad.dest} />
          {bad.dest ? <small className="vx-err">Ketik lalu pilih kecamatan dari daftar.</small> : null}
        </div>
        <div className="vx-field">
          <label htmlFor="vxAddr">Alamat Lengkap</label>
          <textarea ref={refs.addr} id="vxAddr" className={`vx-inp${err('addr')}`} rows="2" autoComplete="street-address" maxLength={180}
            placeholder="Nama jalan, nomor rumah, RT/RW, patokan" value={addr} onChange={(e) => setAddr(e.target.value)} />
          {bad.addr ? <small className="vx-err">Isi nama jalan dan nomor rumah.</small> : null}
        </div>

        <div className="vx-step"><span>3</span> Metode pembayaran</div>
        <div className="vx-pays">
          {PAYS.map((p) => (
            <label key={p.id} className={`vx-pay${pay === p.id ? ' is-on' : ''}`}>
              <input type="radio" name="pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
              <span className="vx-pay-ic"><i className={`fa-solid ${p.icon}`} /></span>
              <div>
                <b>{p.label}</b>
                <span className="vx-muted">{p.sub}</span>
                {p.badge ? <em>{p.badge}</em> : null}
              </div>
              <span className="vx-radio" />
            </label>
          ))}
        </div>

        <label className={`vx-bump${bump ? ' is-on' : ''}`}>
          <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} />
          <span className="vx-check"><i className="fa-solid fa-check" /></span>
          <img src={VIP.bump.img} alt="" width="36" height="110" loading="lazy" />
          <span className="vx-bump-txt">
            <b>Ya! Tambahkan {VIP.bump.name}</b>
            <span>hanya tambah <b className="vx-goldtxt">{rp(VIP.bump.price)}</b> <s>{rp(VIP.bump.normal)}</s> <em>Hemat {bumpPct}%</em></span>
          </span>
        </label>

        <div className="vx-summary">
          <div className="vx-sum-title"><i className="fa-solid fa-receipt" /> Ringkasan pesanan</div>
          <div className="vx-sum-row"><span>{pkg.name}</span><span>{rp(pkg.price)}</span></div>
          {bump ? <div className="vx-sum-row vx-pop"><span>{VIP.bump.name}</span><span>{rp(VIP.bump.price)}</span></div> : null}
          <div className="vx-sum-row"><span>Bonus E-Book</span><span className="vx-free">GRATIS</span></div>
          {pkg.hot ? <div className="vx-sum-row"><span>Konsultasi Ahli Kesehatan Kulit</span><span className="vx-free">GRATIS</span></div> : null}
          <div className="vx-sum-row"><span>Ongkos kirim</span><span className="vx-free">GRATIS</span></div>
          <div className="vx-sum-total">
            <span>Total bayar</span>
            <div><s>{rp(normalTotal)}</s><b key={total} className="vx-pop">{rp(total)}</b></div>
          </div>
        </div>

        {VIP.slotsLeft ? (
          <div className="vx-scarcity"><span className="vx-live" /><span>⚠️ Kuota Konsultasi Ahli Kesehatan Kulit &amp; Bonus E-Book hari ini tersisa <b>{VIP.slotsLeft} slot</b>.</span></div>
        ) : null}

        <button type="submit" className="vx-btn vx-btn-gold vx-btn-xl vx-btn-block" disabled={busy}>
          {busy ? <><i className="fa-solid fa-spinner fa-spin" /> Memproses…</> : <>PESAN SEKARANG &amp; AMANKAN BONUSNYA 🔒</>}
        </button>
        <div className="vx-secure">
          <span><i className="fa-solid fa-lock" /> Data aman</span>
          <span><i className="fa-solid fa-truck-fast" /> Gratis ongkir</span>
          <span><i className="fa-brands fa-whatsapp" /> Admin siap bantu</span>
        </div>
      </form>
    </section>
  );
}

/* ================= Thank you (setelah checkout) ================= */
const RESULT_COPY = {
  paid: { icon: 'fa-circle-check', tone: 'ok', title: 'Pembayaran Berhasil', text: 'Terima kasih! Pesanan kamu sudah kami terima dan segera diproses.' },
  pending: { icon: 'fa-clock', tone: 'warn', title: 'Menunggu Pembayaran', text: 'Selesaikan pembayaran QRIS / Virtual Account. Status pesanan diperbarui otomatis setelah lunas.' },
  cod: { icon: 'fa-circle-check', tone: 'ok', title: 'Pesanan COD Tercatat', text: 'Admin akan mengonfirmasi pesanan lewat WhatsApp. Siapkan uang pas saat kurir tiba.' },
  manual: { icon: 'fa-circle-info', tone: 'warn', title: 'Pesanan Tercatat', text: 'Pembayaran online belum aktif. Admin akan membantu menyelesaikan pesanan lewat WhatsApp.' },
  error: { icon: 'fa-circle-exclamation', tone: 'bad', title: 'Pesanan Belum Terkirim', text: '' },
};

function ThankYou({ result, onClose }) {
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
        <h3>{c.title}</h3>
        <p className="vx-muted">{result.status === 'error' ? result.message : c.text}</p>

        {result.code ? (
          <div className="vx-ty-sum">
            <div><span>No. Order</span><b>#{result.code}</b></div>
            <div><span>Paket</span><b>{result.pkg?.name}</b></div>
            {result.total ? <div><span>Total</span><b>{rp(result.total)}</b></div> : null}
          </div>
        ) : null}

        <div className="vx-ty-actions">
          {result.status === 'pending' && result.retry ? (
            <button type="button" className="vx-btn vx-btn-gold vx-btn-block" onClick={result.retry}>Lanjut Bayar <i className="fa-solid fa-lock" /></button>
          ) : null}
          {result.status === 'paid' && VIP.ebookUrl ? (
            <a className="vx-btn vx-btn-dark vx-btn-block" href={VIP.ebookUrl} target="_blank" rel="noopener"><i className="fa-solid fa-download" /> Download E-Book {VIP.ebookTitle}</a>
          ) : null}
          {result.code && result.pkg?.hot && result.status !== 'error' ? (
            <a className="vx-btn vx-btn-wa vx-btn-block" href={waUrl(consultText)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Konsultasi Ahli Kesehatan Kulit</a>
          ) : null}
          <a className="vx-btn vx-btn-ghost vx-btn-block" href={result.waUrl || waUrl(adminText)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Chat Admin</a>
        </div>
        {result.status === 'paid' && !VIP.ebookUrl ? <p className="vx-hint center">Link E-Book dikirim admin lewat WhatsApp.</p> : null}
      </div>
    </div>
  );
}

/* ================= SECTION 7: FAQ (accordion) & garansi ================= */
const FAQ = [
  { q: 'Apakah produknya aman dan terdaftar BPOM?', a: 'Ya. Seluruh produk dalam paket adalah kosmetik perawatan kulit yang terdaftar BPOM. Nomor registrasinya tercantum di kemasan dan di bagian bawah halaman ini.' },
  { q: 'Bagaimana cara klaim Bonus E-Book & Konsultasi Ahli Kesehatan Kulit?', a: 'Setelah pembayaran QRIS / Virtual Account terkonfirmasi, tombol download E-Book muncul di halaman konfirmasi dan link-nya juga dikirim lewat WhatsApp. Untuk Paket VIP Komplit, tombol Konsultasi muncul di halaman konfirmasi dan pesannya sudah berisi nomor order kamu. Untuk COD, bonus dikirim setelah pesanan dikonfirmasi admin.' },
  { q: 'Berapa lama estimasi pengiriman?', a: 'Pesanan diproses di hari kerja. Lama pengiriman mengikuti lokasi dan kurir. Nomor resi dikirim lewat WhatsApp setelah paket diserahkan ke kurir.' },
  { q: 'Bagaimana ketentuan pembayaran COD / Transfer?', a: 'QRIS / Virtual Account terkonfirmasi otomatis dan diprioritaskan pengirimannya, tanpa biaya admin. COD dibayar langsung ke kurir saat paket tiba; admin akan mengonfirmasi pesanan COD lewat WhatsApp terlebih dahulu.' },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="vx-sec">
      <Head kicker="Tanya Jawab">Pertanyaan yang <span className="vx-gold">Sering Ditanya</span></Head>
      <div className="vx-faq">
        {FAQ.map((f, i) => (
          <div key={f.q} className={`vx-faq-item${open === i ? ' is-open' : ''}`} data-rv style={{ '--d': `${i * 0.06}s` }}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="vx-faq-no">0{i + 1}</span>
              <span className="vx-faq-q">{f.q}</span>
              <i className="fa-solid fa-plus" />
            </button>
            <div className="vx-faq-a"><div><p>{f.a}</p></div></div>
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
      'Pesanan COD wajib dikonfirmasi lewat WhatsApp sebelum dikirim. Pesanan dengan data tidak lengkap dapat dibatalkan.',
    ],
  },
};

function Footer({ onPolicy }) {
  return (
    <footer className="vx-footer">
      <img src={IMG.logo} alt="Clorismen" className="vx-footer-logo" width="140" height="76" loading="lazy" />
      <p className="vx-footer-company">{VIP.legal.company}</p>
      <p className="vx-footer-addr"><i className="fa-solid fa-location-dot" /> {VIP.legal.address}</p>
      <div className="vx-bpom">
        <b>Nomor Registrasi BPOM</b>
        <ul>{VIP.legal.bpom.map((b) => <li key={b.name}><span>{b.name}</span><span>{b.no}</span></li>)}</ul>
      </div>
      <div className="vx-footer-links">
        <button type="button" onClick={() => onPolicy('privacy')}>Kebijakan Privasi</button>
        <span>·</span>
        <button type="button" onClick={() => onPolicy('terms')}>Syarat &amp; Ketentuan</button>
        <span>·</span>
        <a href={waUrl('Halo admin Clorismen')} target="_blank" rel="noopener">Kontak</a>
      </div>
      <p className="vx-disclaimer">
        Hasil pemakaian dapat bervariasi pada setiap individu tergantung jenis kulit dan keteraturan penggunaan.
        Produk ini merupakan kosmetik perawatan kulit terdaftar BPOM dan bukan obat medis.
      </p>
      <p className="vx-copy">© {new Date().getFullYear()} Clorismen Official</p>
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
    setMeta('description', 'Paket Lengkap Perawatan Pria Clorismen 30 hari dengan harga khusus member VIP, bonus E-Book eksklusif, konsultasi Ahli Kesehatan Kulit, gratis ongkir & bisa COD.');
    setMeta('theme-color', '#121C26');
    const pre = document.createElement('link');
    pre.rel = 'preload'; pre.as = 'image'; pre.href = IMG.bundle;
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
        <SocialProof />
        <ValueStack />
        <Checkout onResult={setResult} />
        <Faq />
        <Footer onPolicy={setPolicy} />
      </main>
      <StickyCta />
      <ThankYou result={result} onClose={() => setResult(null)} />
      <PolicyModal id={policy} onClose={() => setPolicy(null)} />
    </div>
  );
}
