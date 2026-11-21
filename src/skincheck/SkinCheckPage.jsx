import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { loadMidtransSnap } from '../lib/midtrans.js';
import AreaSearch from '../components/AreaSearch.jsx';
import { PROVINCES, EMPTY_SHIP, shipErrors, SHIP_ORDER, shipPayload, useShippingFee } from '../lib/shipping.js';
import { initPixel, track, trackCustom } from '../lib/pixel.js';
import { goThanks } from '../lib/thanks.js';
import { useWaNumber } from '../lib/waNumber.js';
import { useCatalog } from '../lib/catalog.js';
import {
  PRODUCTS, PACKAGES, SHOWCASE, QUESTIONS, QUICK_QA, FAQ,
  cleanAnswers, optionOf, recommend, reasons, consultantNote, routineFor,
} from './skinCheckConfig.js';
import './skincheck.css';

/*
 * Halaman /skin-check
 * Alur: pilih jawaban dari 5 pertanyaan → hasil & rekomendasi paket (aturan sudah dipetakan, tanpa AI) → checkout.
 * Checkout sama dengan landing & VIP: payment gateway aktif di ERP (iPaymu redirect / Midtrans popup), tanpa COD.
 * Nama, foto, harga, dan stok paket dari Master Produk ERP; total dihitung ulang di server.
 */

const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const STORE_KEY = 'clm_skincheck_v1';
const MAX_QTY = 5;

/** Foto bawaan seeder (default-*) diabaikan, supaya kartu tetap memakai susunan foto produk. */
const uploadedImage = (url) => (typeof url === 'string' && /^https?:\/\//.test(url) && !/\/default-[^/]*$/.test(url) ? url : null);

/** Paket Skin Check + data ERP. Produk yang belum ada di ERP (atau harganya 0) tidak bisa dipesan. */
function usePackages() {
  const cat = useCatalog();
  const list = useMemo(() => PACKAGES.map((p) => {
    const e = cat.bySlug[p.slug];
    const price = e ? Number(e.price) || 0 : 0;
    const compare = e?.compare_price && Number(e.compare_price) > price ? Number(e.compare_price) : null;
    const exists = !!e && price > 0;
    return {
      ...p,
      // Paket landing utama punya judul kartu "1 Paket" di ERP; di Skin Check pakai nama & deskripsi dari config.
      title: p.erpText === false ? p.name : String(e?.landing_title || '').trim() || p.name,
      desc: p.erpText === false ? p.desc : String(e?.tagline || '').trim() || p.desc,
      price,
      compare,
      image: p.photo === false ? null : uploadedImage(e?.image_url),
      exists,
      inStock: exists && e.in_stock !== false,
    };
  }), [cat.bySlug]);
  return { loaded: cat.loaded, failed: cat.failed, list };
}

function readSaved() {
  try { return cleanAnswers(JSON.parse(window.sessionStorage.getItem(STORE_KEY) || 'null')); } catch { return {}; }
}
function save(a) {
  try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(a)); } catch { /* mode privat */ }
}

/* ================= Bagian kecil ================= */
function Logo() {
  return <img className="sc-logo" src="/images/opt/logo-white.webp" alt="Clorismen" width="120" height="65" />;
}

function Header({ stage }) {
  return (
    <header className="sc-top">
      <div className="sc-wrap sc-nav">
        <a href="/konsultan-clorismen" aria-label="Clorismen Skin Check"><Logo /></a>
        <nav className="sc-nav-right" aria-label="Menu">
          <span className="sc-chip sc-chip-hide"><i className="fa-solid fa-wand-magic-sparkles" /> Skin Check</span>
          {stage === 'result' ? <span className="sc-chip sc-chip-ok sc-chip-hide"><i className="fa-solid fa-check" /> Selesai</span> : null}
          <a className="sc-member" href="/member"><i className="fa-solid fa-circle-user" /> <span>Member Login</span></a>
        </nav>
      </div>
      <Journey stage={stage} />
    </header>
  );
}

function Journey({ stage }) {
  const idx = stage === 'result' ? 1 : 0;
  const steps = ['Skin Check', 'Rekomendasi', 'Checkout'];
  return (
    <div className="sc-journey">
      <div className="sc-wrap sc-journey-row">
        {steps.map((s, i) => (
          <div key={s} className={`sc-seg${i < idx ? ' is-done' : ''}${i === idx ? ' is-on' : ''}`}>
            <span className="sc-dot">{i < idx ? <i className="fa-solid fa-check" /> : i + 1}</span>
            <span className="sc-word">{s}</span>
            {i < steps.length - 1 ? <span className="sc-line" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Consultant({ small }) {
  return (
    <div className={`sc-cons${small ? ' is-small' : ''}`}>
      <span className="sc-cons-ic" aria-hidden="true"><i className="fa-solid fa-user-tie" /><span className="sc-cons-live" /></span>
      <span><b>Konsultan Clorismen</b><small>Skin Check</small></span>
    </div>
  );
}

/** Urutan tampil di panggung: micellar (paling tinggi) di tengah seperti hero landing utama. */
const STAGE_ORDER = ['facewash', 'micellar', 'serum', 'sunscreen'];

/** Panggung produk beranimasi (foto produk asli, animasi CSS ringan; mati otomatis bila "kurangi gerakan" aktif). */
function PackShot({ pkg, big, compact, tags }) {
  const shown = [...pkg.items].sort((a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b));
  if (pkg.image) {
    return (
      <div className={`sc-stage${big ? ' is-big' : ''}${compact ? ' is-compact' : ''}`}>
        <span className="sc-stage-ring" aria-hidden="true" />
        <span className="sc-stage-podium" aria-hidden="true" />
        <img className="sc-stage-one" src={pkg.image} alt={pkg.title} loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className={`sc-stage${big ? ' is-big' : ''}${compact ? ' is-compact' : ''}`} data-count={pkg.items.length}>
      <span className="sc-stage-glow" aria-hidden="true" />
      <span className="sc-stage-ring" aria-hidden="true" />
      <span className="sc-stage-ring is-2" aria-hidden="true" />
      {compact ? null : <span className="sc-stage-bubbles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>}
      <span className="sc-stage-podium" aria-hidden="true" />
      <div className="sc-stage-row">
        {shown.map((k, i) => {
          const p = PRODUCTS[k];
          return (
            <figure key={k} className={`sc-prod sc-prod-${k}`} style={{ '--d': `${i * 0.45}s` }}>
              <img src={p.img} alt={p.name} width={p.w} height={p.h} decoding="async" />
              <img className="sc-prod-refl" src={p.img} alt="" aria-hidden="true" width={p.w} height={p.h} decoding="async" />
            </figure>
          );
        })}
      </div>
      {tags && !compact ? (
        <div className="sc-stage-tags" aria-hidden="true">
          {shown.map((k, i) => <span key={k} className={`sc-tag sc-tag-${i}`}><i className={`fa-solid ${PRODUCTS[k].tagIcon}`} /> {PRODUCTS[k].tag}</span>)}
        </div>
      ) : null}
    </div>
  );
}

/* ================= Intro ================= */
function Intro({ onStart, hasSaved, onResume }) {
  return (
    <section className="sc-hero">
      <div className="sc-wrap sc-hero-grid">
        <div>
          <div className="sc-over"><i className="fa-solid fa-stopwatch" /> 5 PERTANYAAN · ± 1 MENIT</div>
          <h1>Bingung mulai skincare dari mana? <span>Cek dulu di sini.</span></h1>
          <p className="sc-lead">Jawab 5 pertanyaan singkat soal aktivitas dan kondisi wajah lu. Gue tunjukin paket Clorismen yang paling pas beserta cara pakainya, pagi sampai malam.</p>
          <div className="sc-hero-cta">
            <button type="button" className="sc-btn sc-btn-primary sc-btn-lg" onClick={onStart}>
              Mulai Skin Check <i className="fa-solid fa-arrow-right" />
            </button>
            {hasSaved ? <button type="button" className="sc-btn sc-btn-ghost" onClick={onResume}>Lihat hasil terakhir</button> : null}
          </div>
          <div className="sc-facts">
            <span><i className="fa-solid fa-hand-pointer" /> Tinggal pilih jawaban</span>
            <span><i className="fa-solid fa-user-shield" /> Tanpa isi data pribadi</span>
            <span><i className="fa-solid fa-calendar-check" /> Panduan pakai 30 hari</span>
          </div>
        </div>
        <div className="sc-hero-card">
          <Consultant />
          <div className="sc-bubble">Halo! Gue bantu pilihin rutinitas yang cocok buat lu. Nggak perlu nebak-nebak produk, cukup jawab sesuai keseharian lu aja.</div>
          <div className="sc-hero-shot"><PackShot pkg={SHOWCASE} big tags /></div>
        </div>
      </div>
    </section>
  );
}

/* ================= Kuis ================= */
function Quiz({ answers, onAnswer, onBack, step }) {
  const q = QUESTIONS[step];
  const cardRef = useRef(null);
  useEffect(() => { cardRef.current?.focus({ preventScroll: true }); }, [step]);
  const pct = Math.round((step / QUESTIONS.length) * 100);
  return (
    <section className="sc-quiz">
      <div className="sc-wrap sc-quiz-wrap">
        <div className={`sc-quiz-card sc-tone-${q.tone}`} ref={cardRef} tabIndex={-1} aria-live="polite">
          <div className="sc-quiz-top">
            <button type="button" className="sc-back" onClick={onBack} aria-label="Kembali"><i className="fa-solid fa-arrow-left" /></button>
            <div className="sc-progress" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1}>
              <span style={{ width: `${Math.max(6, pct)}%` }} />
            </div>
            <span className="sc-count">{step + 1}/{QUESTIONS.length}</span>
          </div>
          <Consultant small />
          <div className="sc-bubble sc-bubble-q" key={q.id}>{q.ask}</div>
          <div className={`sc-opts${q.options.length === 4 ? ' is-4' : ''}`} role="radiogroup" aria-label={q.ask}>
            {q.options.map((o) => (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={answers[q.id] === o.v}
                className={`sc-opt${answers[q.id] === o.v ? ' is-on' : ''}`}
                onClick={() => onAnswer(q.id, o.v)}
              >
                <span className="sc-opt-ic" aria-hidden="true"><i className={`fa-solid ${o.icon}`} /></span>
                <span className="sc-opt-txt"><b>{o.t}</b><small>{o.s}</small></span>
                <span className="sc-opt-radio" aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="sc-quiz-note">Jawaban hanya dipakai di browser lu untuk memilih rekomendasi, tidak dikirim ke mana pun.</p>
        </div>
      </div>
    </section>
  );
}

/* ================= Proses setelah jawaban terakhir ================= */
const PROCESS_STEPS = [
  { at: 0, icon: 'fa-person-running', t: 'Nyocokin aktivitas harian lu' },
  { at: 25, icon: 'fa-droplet', t: 'Ngecek kondisi kulit & target' },
  { at: 50, icon: 'fa-sun', t: 'Nyusun rutinitas pagi-malam' },
  { at: 75, icon: 'fa-box-open', t: 'Milih paket yang paling pas' },
];
// Durasi tiap fase (dipersingkat bila pengguna memilih "kurangi gerakan").
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const FADE_MS = 260;

/** Modal: konsultan "mikir" → progress bar sampai 100% → berhasil → tutup otomatis. */
function Processing({ onDone }) {
  const [phase, setPhase] = useState('think'); // think | load | done
  const [pct, setPct] = useState(0);
  const [closing, setClosing] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const rm = reduceMotion();
    const THINK_MS = rm ? 400 : 1200; // fase "mikir"
    const LOAD_MS = rm ? 900 : 2500; // progress 0 → 100
    const DONE_MS = rm ? 500 : 800; // tampil "berhasil"
    let raf = 0;
    let t2 = 0;
    let t3 = 0;
    const t1 = setTimeout(() => {
      setPhase('load');
      const start = performance.now();
      const tick = (now) => {
        const x = Math.min(1, (now - start) / LOAD_MS);
        setPct(Math.round(100 * (1 - Math.pow(1 - x, 2.2)))); // cepat di awal, melambat di akhir
        if (x < 1) { raf = requestAnimationFrame(tick); return; }
        setPhase('done');
        t2 = setTimeout(() => { setClosing(true); t3 = setTimeout(() => doneRef.current(), rm ? 0 : FADE_MS); }, DONE_MS);
      };
      raf = requestAnimationFrame(tick);
    }, THINK_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); cancelAnimationFrame(raf); document.body.style.overflow = ''; };
  }, []);

  const cur = PROCESS_STEPS.filter((s) => pct >= s.at).length - 1;
  return (
    <div className={`sc-modal sc-proc-bg${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Memproses hasil Skin Check">
      <div className={`sc-proc is-${phase}`}>
        <div className="sc-proc-orb" aria-hidden="true">
          <span className="sc-proc-ring" />
          <span className="sc-proc-ring is-2" />
          <span className="sc-proc-core">
            {phase === 'done' ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-user-tie" />}
          </span>
        </div>
        {phase === 'think' ? (
          <>
            <b className="sc-proc-title" aria-live="polite">Konsultan Clorismen lagi ngecek pilihan lu<span className="sc-dots" aria-hidden="true"><i /><i /><i /></span></b>
            <p className="sc-proc-sub">5 jawaban lu lagi dicocokin sama paket Clorismen.</p>
          </>
        ) : null}
        {phase === 'load' ? (
          <>
            <b className="sc-proc-title" aria-live="polite">{PROCESS_STEPS[Math.max(0, cur)].t}…</b>
            <div className="sc-proc-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="sc-proc-pct" aria-live="polite">{pct}%</div>
            <ul className="sc-proc-steps">
              {PROCESS_STEPS.map((s, i) => (
                <li key={s.t} className={i < cur ? 'is-done' : i === cur ? 'is-on' : ''}>
                  <span>{i < cur ? <i className="fa-solid fa-check" /> : <i className={`fa-solid ${s.icon}`} />}</span>{s.t}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {phase === 'done' ? (
          <>
            <b className="sc-proc-title" role="status">Beres! Hasil Skin Check lu udah siap</b>
            <p className="sc-proc-sub">Membuka rekomendasi…</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ================= Hasil ================= */
function ResultHero({ note, answers, onRestart }) {
  return (
    <section className="sc-hero sc-hero-result">
      <div className="sc-wrap sc-hero-grid">
        <div>
          <div className="sc-over"><i className="fa-solid fa-circle-check" /> SKIN CHECK SELESAI · INI HASIL BUAT LU</div>
          <h1>Rutinitas wajah lu <span>udah ketemu.</span></h1>
          <p className="sc-lead">Dari jawaban tadi, ini rutinitas yang bisa langsung lu mulai dengan langkah yang jelas.</p>
          <div className="sc-facts">
            <span><i className="fa-solid fa-list-check" /> {Object.keys(answers).length} jawaban dipertimbangkan</span>
            <span><i className="fa-solid fa-repeat" /> Paket bisa diganti</span>
            <button type="button" className="sc-link" onClick={onRestart}><i className="fa-solid fa-rotate-left" /> Ulangi Skin Check</button>
          </div>
        </div>
        <div className="sc-hero-card">
          <Consultant />
          <p className="sc-quote">“{note}”</p>
          <span className="sc-mini">Rekomendasi disusun dari jawaban yang lu pilih, bukan diagnosis dokter.</span>
        </div>
      </div>
    </section>
  );
}

function Summary({ answers, why }) {
  const boxes = ['activity', 'skin', 'steps'].map((id) => ({ id, label: QUESTIONS.find((q) => q.id === id).label, val: optionOf(id, answers[id])?.short || '-' }));
  return (
    <section className="sc-card">
      <div className="sc-label">01 / PROFIL KEBUTUHAN LU</div>
      <h2>Kenapa paket ini dipilih?</h2>
      <div className="sc-sum-grid">
        {boxes.map((b) => <div key={b.id} className="sc-sumbox"><small>{b.label}</small><strong>{b.val}</strong></div>)}
      </div>
      <div className="sc-why">
        {why.map((t) => <div key={t} className="sc-why-item"><span className="sc-whycheck"><i className="fa-solid fa-check" /></span><span>{t}</span></div>)}
      </div>
      {answers.skin === 'dry' ? (
        <div className="sc-softnote sc-softnote-warn"><i className="fa-solid fa-droplet" /> Kulit lu cenderung kering: pakai face wash secukupnya, jangan terlalu lama, dan bilas dengan air biasa (tidak panas).</div>
      ) : null}
      <div className="sc-softnote"><i className="fa-solid fa-circle-info" /> Skin Check membantu memilih rutinitas dasar, bukan diagnosis atau jaminan hasil. Hentikan pemakaian bila terjadi iritasi dan konsultasikan keluhan berat ke dokter.</div>
    </section>
  );
}

function Routine({ pkgId }) {
  const r = routineFor(pkgId);
  return (
    <section className="sc-card">
      <div className="sc-label">02 / CARA PAKAINYA</div>
      <h2>Rutinitas simpel, pagi sampai malam.</h2>
      <div className="sc-routine">
        <div className="sc-routine-panel sc-am">
          <div className="sc-routine-head"><span className="sc-rt-ic"><i className="fa-solid fa-sun" /></span> PAGI</div>
          <ol>{r.morning.map((t) => <li key={t}>{t}</li>)}</ol>
        </div>
        <div className="sc-routine-panel sc-pm">
          <div className="sc-routine-head"><span className="sc-rt-ic"><i className="fa-solid fa-moon" /></span> MALAM</div>
          <ol>{r.night.map((t) => <li key={t}>{t}</li>)}</ol>
        </div>
      </div>
      <div className="sc-schedule">
        <div><i className="fa-solid fa-seedling" /><b>HARI 1–7</b><span>Kenalan dengan cara pakai produk.</span></div>
        <div><i className="fa-solid fa-chart-line" /><b>HARI 8–21</b><span>Bangun rutinitas yang konsisten.</span></div>
        <div><i className="fa-solid fa-medal" /><b>HARI 22–30</b><span>Evaluasi kenyamanan dan kebiasaan.</span></div>
      </div>
    </section>
  );
}

function Bonus() {
  return (
    <section className="sc-card">
      <div className="sc-label">03 / BELI DI WEBSITE</div>
      <h2>Bukan cuma produk. Ada panduannya juga.</h2>
      <div className="sc-bonus-grid">
        <div className="sc-bonus"><span className="sc-bonus-ic"><i className="fa-solid fa-book-open" /></span><div><b>E-book panduan pria</b><p>Akses di Member Area setelah pembayaran lunas.</p></div></div>
        <div className="sc-bonus"><span className="sc-bonus-ic"><i className="fa-solid fa-calendar-check" /></span><div><b>Panduan pakai 30 hari</b><p>Urutan pagi & malam seperti di atas, tinggal diikuti.</p></div></div>
        <div className="sc-bonus"><span className="sc-bonus-ic"><i className="fa-solid fa-truck-fast" /></span><div><b>Lacak pesanan & resi</b><p>Cek status dan resi langsung dari Member Area.</p></div></div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="sc-card sc-faq">
      <div className="sc-label">04 / SEBELUM CHECKOUT</div>
      <h2>Pertanyaan yang sering muncul.</h2>
      {FAQ.map((f) => (
        <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
      ))}
    </section>
  );
}

function PriceTag({ pkg, loaded }) {
  if (!loaded) return <div className="sc-price sc-skel" aria-label="Memuat harga">&nbsp;</div>;
  if (!pkg.exists) return <div className="sc-price sc-price-na">Belum tersedia</div>;
  return (
    <div className="sc-price">
      {pkg.compare ? <s>{rp(pkg.compare)}</s> : null}
      {rp(pkg.price)} <small>/ paket</small>
    </div>
  );
}

function Offer({ data, recId, selId, onSelect, onCheckout, onAsk }) {
  const pkg = data.list.find((p) => p.id === selId);
  const isRec = selId === recId;
  const canBuy = pkg.inStock;
  return (
    <aside className="sc-offer" id="paket">
      <div className="sc-offer-band">{isRec ? <><i className="fa-solid fa-star" /> PAKET YANG DISARANKAN BUAT LU</> : <><i className="fa-solid fa-repeat" /> PAKET PILIHAN LU</>}</div>
      <div className="sc-offer-body">
        <div className="sc-label">HASIL SKIN CHECK</div>
        <h2>{pkg.title}</h2>
        <p className="sc-muted">{pkg.desc}</p>
        <PackShot pkg={pkg} tags />
        <div className="sc-included">{pkg.items.map((k) => <span key={k}><i className="fa-solid fa-check" /> {PRODUCTS[k].name}</span>)}</div>
        <div className="sc-pricecap">HARGA PAKET</div>
        <PriceTag pkg={pkg} loaded={data.loaded} />
        <ul className="sc-perks">
          <li><i className="fa-solid fa-check" /> Panduan pakai pagi & malam</li>
          <li><i className="fa-solid fa-check" /> Bayar QRIS / Virtual Account, konfirmasi otomatis</li>
          <li><i className="fa-solid fa-check" /> Status & resi bisa dicek di Member Area</li>
        </ul>
        {data.loaded && pkg.exists && !pkg.inStock ? <div className="sc-out"><i className="fa-solid fa-box-open" /> Stok paket ini sedang habis. Pilih paket lain atau tanya admin.</div> : null}
        {data.loaded && data.failed ? <div className="sc-out"><i className="fa-solid fa-wifi" /> Data produk gagal dimuat. Muat ulang halaman.</div> : null}
        <button type="button" className="sc-btn sc-btn-primary sc-btn-block sc-btn-lg" disabled={!canBuy} onClick={onCheckout}>
          {canBuy ? <>Ambil Paket Ini <i className="fa-solid fa-arrow-right" /></> : 'Belum bisa dipesan'}
        </button>
        <button type="button" className="sc-btn sc-btn-soft sc-btn-block" onClick={onAsk}><i className="fa-regular fa-comment-dots" /> Masih bingung? Lihat jawaban cepat</button>

        <div className="sc-alt">
          <div className="sc-label">ATAU PILIH PAKET LAIN</div>
          <div className="sc-alt-list" role="radiogroup" aria-label="Pilihan paket">
            {data.list.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={p.id === selId}
                className={`sc-alt-opt${p.id === selId ? ' is-on' : ''}${p.inStock ? '' : ' is-out'}`}
                onClick={() => onSelect(p.id)}>
                <span className="sc-radio" aria-hidden="true" />
                <span className="sc-alt-title">{p.title}<small>{p.items.length} produk{p.id === recId ? ' · rekomendasi' : ''}{data.loaded && p.exists && !p.inStock ? ' · stok habis' : ''}</small></span>
                <span className="sc-alt-price">{!data.loaded ? '…' : p.exists ? rp(p.price) : '-'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function QuickAsk({ open, onClose, ctx }) {
  const [log, setLog] = useState([]);
  const bodyRef = useRef(null);
  useEffect(() => { if (!open) setLog([]); }, [open]);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [log]);
  const wa = useWaNumber();
  if (!open) return null;
  return (
    <div className="sc-modal" role="dialog" aria-modal="true" aria-label="Jawaban cepat" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sc-ask">
        <div className="sc-ask-head"><Consultant small /><button type="button" className="sc-x" onClick={onClose} aria-label="Tutup"><i className="fa-solid fa-xmark" /></button></div>
        <div className="sc-ask-body" ref={bodyRef}>
          <div className="sc-bubble">Pilih pertanyaan di bawah ya. Jawabannya sudah disiapkan tim Clorismen.</div>
          {log.map((m, i) => <div key={i} className={`sc-bubble${m.me ? ' is-me' : ''}`}>{m.t}</div>)}
          <div className="sc-ask-quick">
            {QUICK_QA.map((x) => (
              <button key={x.q} type="button" onClick={() => setLog((l) => [...l, { me: true, t: x.q }, { t: x.a(ctx) }])}>{x.q}</button>
            ))}
          </div>
        </div>
        <a className="sc-ask-wa" href={`https://wa.me/${wa}?text=${encodeURIComponent('Halo admin Clorismen, saya habis ikut Skin Check dan mau tanya soal paket.')}`} target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-whatsapp" /> Pertanyaan lain? Chat admin
        </a>
      </div>
    </div>
  );
}

/* ================= Checkout ================= */
function Checkout({ open, onClose, pkg, recName }) {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [ship, setShip] = useState(EMPTY_SHIP);
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refs = { name: useRef(null), wa: useRef(null), email: useRef(null), province: useRef(null), city: useRef(null), district: useRef(null), postal: useRef(null), addr: useRef(null) };
  const shippingFee = useShippingFee(pkg ? [pkg.slug] : []);

  useEffect(() => {
    if (!open) return undefined;
    setQty(1); setError('');
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => refs.name.current?.focus(), 80);
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !pkg) return null;

  const subtotal = pkg.price * qty;
  const total = subtotal + shippingFee;
  const clearBad = (k) => setBad((b) => (b[k] ? { ...b, [k]: false } : b));
  const setS = (k) => (e) => { clearBad(k); setShip((s) => ({ ...s, [k]: k === 'postal' ? e.target.value.replace(/\D/g, '').slice(0, 5) : e.target.value })); };
  const err = (k) => (bad[k] ? ' is-bad' : '');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    const digits = wa.replace(/\D/g, '');
    const nextBad = { name: name.trim().length < 2, wa: !/^(0|62|8)\d{8,13}$/.test(digits), ...shipErrors(ship) };
    setBad(nextBad);
    const first = ['name', 'wa', ...SHIP_ORDER].find((k) => nextBad[k]);
    if (first) { refs[first].current?.focus(); return; }
    if (!pkg.inStock) { setError('Maaf, stok paket ini sedang habis. Pilih paket lain.'); return; }

    setBusy(true);
    try {
      // Hanya slug & jumlah yang dikirim. Harga, ongkir, dan stok dihitung ulang di ERP.
      const data = await api.createOrderIntent({
        items: [{ slug: pkg.slug, qty: Math.min(MAX_QTY, Math.max(1, qty)) }],
        customer: {
          name: name.trim().slice(0, 80),
          phone: wa.trim().slice(0, 30),
          ...shipPayload(ship),
          note: ['Skin Check', pkg.title, recName && recName !== pkg.title ? `rekomendasi: ${recName}` : ''].filter(Boolean).join(' | ').slice(0, 300),
          source_url: window.location.href.slice(0, 250),
        },
      });
      if (!data.snap_token && data.redirect_url) { window.location.href = data.redirect_url; return; }
      if (data.snap_token && data.client_key && data.snap_js_url) {
        try {
          const snap = await loadMidtransSnap(data.snap_js_url, data.client_key);
          const done = () => goThanks(data);
          snap.pay(data.snap_token, { onSuccess: done, onPending: done, onError: done, onClose: done });
          return;
        } catch {
          if (data.redirect_url) { window.location.href = data.redirect_url; return; }
        }
      }
      setBusy(false);
      setError('Halaman pembayaran gagal dibuka. Muat ulang halaman lalu coba lagi.');
    } catch (ex) {
      setBusy(false);
      setError(ex.message || 'Gagal memproses pesanan. Coba lagi sebentar.');
    }
  };

  return (
    <div className="sc-drawer-bg" role="dialog" aria-modal="true" aria-label="Checkout" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="sc-drawer">
        <div className="sc-drawer-head">
          <b><i className="fa-solid fa-lock" /> Checkout Clorismen</b>
          <button type="button" className="sc-x" onClick={onClose} disabled={busy} aria-label="Tutup checkout"><i className="fa-solid fa-xmark" /></button>
        </div>
        <form className="sc-drawer-body" noValidate onSubmit={submit}>
          <div className="sc-box">
            <h3>1. Pesanan lu</h3>
            <div className="sc-cart">
              <PackShot pkg={pkg} compact />
              <div className="sc-cart-info">
                <b>{pkg.title}</b>
                <small>{pkg.items.map((k) => PRODUCTS[k].short).join(' + ')}</small>
                <div className="sc-qty">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kurangi jumlah" disabled={qty <= 1}>−</button>
                  <b aria-live="polite">{qty}</b>
                  <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} aria-label="Tambah jumlah" disabled={qty >= MAX_QTY}>+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="sc-box">
            <h3>2. Data pengiriman</h3>
            <div className="sc-fld">
              <label htmlFor="scName">Nama penerima</label>
              <input ref={refs.name} id="scName" className={`sc-inp${err('name')}`} autoComplete="name" maxLength={80} placeholder="Contoh: Andika Pratama" value={name} onChange={(e) => { clearBad('name'); setName(e.target.value); }} />
              {bad.name ? <small className="sc-err">Isi nama lengkap penerima.</small> : null}
            </div>
            <div className="sc-fld">
              <label htmlFor="scWa">Nomor WhatsApp aktif</label>
              <input ref={refs.wa} id="scWa" className={`sc-inp${err('wa')}`} type="tel" inputMode="numeric" autoComplete="tel" placeholder="08xxxxxxxxxx" value={wa}
                onChange={(e) => { clearBad('wa'); setWa(e.target.value.replace(/[^\d+]/g, '').slice(0, 16)); }} />
              {bad.wa ? <small className="sc-err">Nomor WhatsApp belum valid (contoh 081234567890).</small> : <small className="sc-hint">Untuk konfirmasi pesanan dan resi.</small>}
            </div>
            <div className="sc-fld">
              <label htmlFor="scEmail">Email</label>
              <input ref={refs.email} id="scEmail" className={`sc-inp${err('email')}`} type="email" inputMode="email" autoComplete="email" maxLength={120} placeholder="nama@email.com" value={ship.email} onChange={setS('email')} />
              {bad.email ? <small className="sc-err">Email belum valid.</small> : <small className="sc-hint">Untuk login Member Area (password dikirim ke WhatsApp).</small>}
            </div>
            <div className="sc-fld">
              <label htmlFor="scArea">Cari Kecamatan / Kode Pos</label>
              <AreaSearch id="scArea" theme="light" inputClassName="sc-inp" onPick={(a) => { ['province', 'city', 'district', 'postal'].forEach(clearBad); setShip((s) => ({ ...s, ...a })); }} />
            </div>
            <div className="sc-frow">
              <div className="sc-fld">
                <label htmlFor="scProv">Provinsi</label>
                <select ref={refs.province} id="scProv" className={`sc-inp${err('province')}`} autoComplete="address-level1" value={ship.province} onChange={setS('province')}>
                  <option value="">Pilih provinsi</option>
                  {PROVINCES.map((pv) => <option key={pv} value={pv}>{pv}</option>)}
                </select>
                {bad.province ? <small className="sc-err">Pilih provinsi.</small> : null}
              </div>
              <div className="sc-fld">
                <label htmlFor="scCity">Kota / Kabupaten</label>
                <input ref={refs.city} id="scCity" className={`sc-inp${err('city')}`} autoComplete="address-level2" maxLength={80} placeholder="Contoh: Kota Bandung" value={ship.city} onChange={setS('city')} />
                {bad.city ? <small className="sc-err">Isi kota atau kabupaten.</small> : null}
              </div>
            </div>
            <div className="sc-frow">
              <div className="sc-fld">
                <label htmlFor="scDist">Kecamatan</label>
                <input ref={refs.district} id="scDist" className={`sc-inp${err('district')}`} autoComplete="address-level3" maxLength={80} placeholder="Contoh: Coblong" value={ship.district} onChange={setS('district')} />
                {bad.district ? <small className="sc-err">Isi kecamatan.</small> : null}
              </div>
              <div className="sc-fld">
                <label htmlFor="scPos">Kode pos <small className="sc-hint">(opsional)</small></label>
                <input ref={refs.postal} id="scPos" className={`sc-inp${err('postal')}`} inputMode="numeric" autoComplete="postal-code" placeholder="40132" value={ship.postal} onChange={setS('postal')} />
                {bad.postal ? <small className="sc-err">Kode pos 5 angka.</small> : null}
              </div>
            </div>
            <div className="sc-fld">
              <label htmlFor="scAddr">Alamat lengkap</label>
              <textarea ref={refs.addr} id="scAddr" className={`sc-inp${err('addr')}`} rows="2" autoComplete="street-address" maxLength={250}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan" value={ship.addr} onChange={setS('addr')} />
              {bad.addr ? <small className="sc-err">Isi nama jalan dan nomor rumah.</small> : null}
            </div>
          </div>

          <div className="sc-box">
            <h3>3. Pembayaran</h3>
            <div className="sc-pay">
              <span className="sc-pay-ic"><i className="fa-solid fa-qrcode" /></span>
              <div><b>QRIS / Virtual Account</b><small>QRIS · BCA · Mandiri · BNI · BRI · dan lainnya. Konfirmasi otomatis.</small></div>
              <i className="fa-solid fa-circle-check sc-pay-ok" />
            </div>
            <div className="sc-sum">
              <div className="sc-sum-row"><span>{pkg.title} × {qty}</span><b>{rp(subtotal)}</b></div>
              <div className="sc-sum-row"><span>Ongkos kirim</span>{shippingFee > 0 ? <b>{rp(shippingFee)}</b> : <b className="sc-free">GRATIS</b>}</div>
              <div className="sc-sum-row sc-sum-total"><span>Total bayar</span><b>{rp(total)}</b></div>
            </div>
          </div>

          {error ? <div className="sc-alert" role="alert"><i className="fa-solid fa-circle-exclamation" /> {error}</div> : null}

          <button type="submit" className="sc-btn sc-btn-primary sc-btn-block sc-btn-lg" disabled={busy || !pkg.inStock}>
            {busy ? <><i className="fa-solid fa-spinner fa-spin" /> Memproses…</> : <>Bayar Sekarang · {rp(total)} <i className="fa-solid fa-lock" /></>}
          </button>
          <p className="sc-secure"><i className="fa-solid fa-shield-halved" /> Pembayaran diproses payment gateway resmi. Total akhir dihitung ulang oleh sistem kami.</p>
        </form>
      </div>
    </div>
  );
}

function Footer() {
  const wa = useWaNumber();
  return (
    <footer className="sc-foot">
      <div className="sc-wrap sc-foot-grid">
        <div><Logo /><p>Perawatan wajah pria, simpel dan jelas cara pakainya.</p></div>
        <nav className="sc-foot-links" aria-label="Informasi">
          <a href="/faq">FAQ</a><a href="/kontak">Kontak</a><a href="/refund-policy">Kebijakan Refund</a>
          <a href="/terms-and-conditions">Syarat &amp; Ketentuan</a><a href="/privacy-policy">Kebijakan Privasi</a>
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" /> Admin</a>
        </nav>
      </div>
    </footer>
  );
}

/* ================= Halaman ================= */
export default function SkinCheckPage() {
  const data = usePackages();
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState({});
  const [stage, setStage] = useState('intro'); // intro | quiz | result
  const [step, setStep] = useState(0);
  const [selId, setSelId] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [ask, setAsk] = useState(false);
  const [processing, setProcessing] = useState(null); // jawaban lengkap yang sedang "diproses"
  const advanceRef = useRef(null);

  useEffect(() => {
    document.title = 'Skin Check Clorismen — Cari Rutinitas Wajah yang Pas Buat Lu';
    const setMeta = (n, c) => {
      let m = document.querySelector(`meta[name="${n}"]`);
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', n); document.head.appendChild(m); }
      m.setAttribute('content', c);
    };
    setMeta('description', 'Jawab 5 pertanyaan singkat dan dapatkan rekomendasi paket perawatan wajah pria Clorismen beserta cara pakainya.');
    setMeta('theme-color', '#060d1a');
    initPixel(); // Meta: PageView
    setSaved(readSaved());
    return () => clearTimeout(advanceRef.current);
  }, []);

  const complete = Object.keys(answers).length === QUESTIONS.length;
  const recId = complete ? recommend(answers) : 'daily';
  const curId = selId || recId;
  const pkg = data.list.find((p) => p.id === curId);
  const recPkg = data.list.find((p) => p.id === recId);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const start = () => {
    clearTimeout(advanceRef.current);
    setAnswers({}); setStep(0); setSelId(null); setStage('quiz');
    trackCustom('quiz_started');
    scrollTop();
  };

  const showResult = (a) => {
    setAnswers(a); setSelId(null); setStage('result');
    save(a); setSaved(a);
    scrollTop();
  };

  const onAnswer = (qid, v) => {
    const next = { ...answers, [qid]: v };
    setAnswers(next);
    clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => {
      if (step + 1 < QUESTIONS.length) { setStep(step + 1); return; }
      trackCustom('quiz_completed');
      setProcessing(next); // animasi mikir → progress → berhasil, lalu hasil tampil
    }, 260);
  };

  const onBack = () => {
    clearTimeout(advanceRef.current);
    if (step === 0) { setStage('intro'); return; }
    setStep(step - 1);
  };

  // Meta: rekomendasi tampil + ViewContent (tanpa data jawaban / kondisi kulit)
  useEffect(() => {
    if (stage !== 'result' || !data.loaded || !recPkg?.exists) return;
    trackCustom('recommendation_viewed', { content_name: recPkg.title });
    track('ViewContent', { content_name: recPkg.title, content_category: 'skin-check', value: recPkg.price, currency: 'IDR' });
  }, [stage, data.loaded, recPkg?.exists, recPkg?.title, recPkg?.price]);

  const openCheckout = () => {
    if (!pkg?.inStock) return;
    track('InitiateCheckout', { content_name: pkg.title, value: pkg.price, currency: 'IDR' });
    setCheckout(true);
  };

  const summary = complete ? ['activity', 'skin', 'steps'].map((id) => optionOf(id, answers[id])?.short.toLowerCase()).join(', ') : '';
  const ctx = { summary, pkgName: pkg?.title || '', has: (k) => !!pkg?.items.includes(k) };

  return (
    <div className="sc">
      <Header stage={stage} />
      {stage === 'intro' ? (
        <>
          <Intro onStart={start} hasSaved={Object.keys(saved).length === QUESTIONS.length} onResume={() => showResult(saved)} />
          <section className="sc-how">
            <div className="sc-wrap sc-how-grid">
              <div><span><i className="fa-solid fa-hand-pointer" /></span><em>01</em><b>Pilih jawaban</b><p>5 pertanyaan soal aktivitas, kondisi wajah, dan kebiasaan lu.</p></div>
              <div><span><i className="fa-solid fa-clipboard-check" /></span><em>02</em><b>Lihat rekomendasi</b><p>Paket yang pas, alasan singkatnya, dan cara pakai pagi–malam.</p></div>
              <div><span><i className="fa-solid fa-lock" /></span><em>03</em><b>Checkout aman</b><p>Bayar QRIS / Virtual Account, pesanan langsung diproses.</p></div>
            </div>
          </section>
        </>
      ) : null}
      {stage === 'quiz' ? <Quiz answers={answers} step={step} onAnswer={onAnswer} onBack={onBack} /> : null}
      {stage === 'result' && complete && pkg ? (
        <>
          <ResultHero note={consultantNote(answers, recId)} answers={answers} onRestart={start} />
          <main className="sc-main">
            <div className="sc-wrap sc-main-grid">
              <div className="sc-stack">
                <Summary answers={answers} why={reasons(answers, curId)} />
                <Routine pkgId={curId} />
                <Bonus />
                <Faq />
              </div>
              <Offer data={data} recId={recId} selId={curId} onSelect={setSelId} onCheckout={openCheckout} onAsk={() => setAsk(true)} />
            </div>
          </main>
          <div className="sc-mobile-cta">
            <div><small>{pkg.title}</small><strong>{!data.loaded ? '…' : pkg.exists ? rp(pkg.price) : 'Belum tersedia'}</strong></div>
            <button type="button" className="sc-btn sc-btn-primary" disabled={!pkg.inStock} onClick={openCheckout}>{pkg.inStock ? 'Lanjut Checkout' : 'Stok habis'} <i className="fa-solid fa-arrow-right" /></button>
          </div>
        </>
      ) : null}
      <Footer />
      {processing ? <Processing onDone={() => { const a = processing; setProcessing(null); showResult(a); requestAnimationFrame(() => window.scrollTo(0, 0)); }} /> : null}
      <QuickAsk open={ask} onClose={() => setAsk(false)} ctx={ctx} />
      <Checkout open={checkout} onClose={() => setCheckout(false)} pkg={pkg} recName={recPkg?.title} />
    </div>
  );
}
