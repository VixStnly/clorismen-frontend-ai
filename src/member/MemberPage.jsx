import { useEffect, useState } from 'react';
import { useWaNumber, waHref } from '../lib/waNumber.js';
import { api } from '../lib/api.js';
import { loadMidtransSnap } from '../lib/midtrans.js';
import { goThanks } from '../lib/thanks.js';
import { PROVINCES, shipErrors, SHIP_ORDER, shipPayload } from '../lib/shipping.js';
import './member.css';

/*
 * Member Area Clorismen (/member).
 * Login: email + password. Akun & password dibuat otomatis saat pesanan lunas dan dikirim ke WhatsApp
 * pembeli (WhatsApp resmi Meta) bersama order ID.
 * Sesi disimpan di cookie HttpOnly oleh BFF; JavaScript tidak pernah memegang token.
 */
const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-');
const STATUS = {
  unpaid: ['Menunggu pembayaran', 'warn'],
  paid: ['Siap dikemas', 'info'],
  packed: ['Dikemas', 'info'],
  shipped: ['Dikirim', 'ok'],
  completed: ['Selesai', 'ok'],
  cancelled: ['Dibatalkan', 'bad'],
};

async function call(path, body) {
  const res = await fetch('/bff/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* bukan JSON */ }
  return { status: res.status, ok: res.ok && json?.ok !== false, data: json?.data, message: json?.message };
}

function Login({ onDone }) {
  useWaNumber();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setMsg({ t: 'bad', m: 'Masukkan email yang dipakai saat memesan.' }); return; }
    if (!password) { setMsg({ t: 'bad', m: 'Masukkan password dari WhatsApp.' }); return; }
    setBusy(true); setMsg(null);
    const r = await call('member/login', { email: email.trim(), password });
    setBusy(false);
    if (r.ok) onDone();
    else setMsg({ t: 'bad', m: r.message || 'Email atau password salah.' });
  };

  return (
    <div className="mb-login">
      <div className="mb-blob a" aria-hidden="true" />
      <div className="mb-blob b" aria-hidden="true" />
      <div className="mb-login-shell">
        <aside className="mb-login-hero">
          <Logo />
          <span className="mb-badge gold"><i className="fa-solid fa-crown" /> Eksklusif Pembeli</span>
          <h2>Perawatan kulitmu,<br /><em>semua di satu tempat.</em></h2>
          <p>Akses gratis untuk setiap pembeli Clorismen. Pantau paket sampai di tangan, dan rawat kulit dengan panduan dari ahlinya.</p>
          <ul className="mb-perks">
            <li><i className="fa-solid fa-truck-fast" /><div><b>Lacak pesanan &amp; resi</b><span>Status pengiriman terbaru, real-time</span></div></li>
            <li><i className="fa-solid fa-book-open" /><div><b>E-book perawatan 30 hari</b><span>Panduan rutin pagi &amp; malam</span></div></li>
            <li><i className="fa-solid fa-user-doctor" /><div><b>Konsultasi ahli kulit</b><span>Tanya langsung lewat WhatsApp</span></div></li>
          </ul>
          <img className="mb-hero-img" src="/images/opt/vip-hero-bundle-600.webp" alt="" width="600" height="600" loading="eager" decoding="async"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </aside>

        <section className="mb-login-card">
          <div className="mb-login-icon"><i className="fa-solid fa-lock" /></div>
          <h1>Masuk Member Area</h1>
          <p className="mb-dim">Pakai email saat memesan dan password yang kami kirim ke WhatsApp kamu.</p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="mb-email">Email</label>
            <div className="mb-field">
              <i className="fa-regular fa-envelope" />
              <input id="mb-email" type="email" inputMode="email" autoComplete="username" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <label htmlFor="mb-pass">Password</label>
            <div className="mb-field">
              <i className="fa-solid fa-key" />
              <input id="mb-pass" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Password dari WhatsApp" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="mb-eye" aria-label={show ? 'Sembunyikan password' : 'Lihat password'} onClick={() => setShow(!show)}>
                <i className={`fa-regular ${show ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {msg ? <p className={`mb-msg ${msg.t}`}><i className="fa-solid fa-circle-exclamation" /> {msg.m}</p> : null}
            <button type="submit" className="mb-btn gold" disabled={busy}>
              {busy ? <><i className="fa-solid fa-spinner fa-spin" /> Memeriksa…</> : <>Masuk Sekarang <i className="fa-solid fa-arrow-right" /></>}
            </button>
          </form>

          <div className="mb-forgot">
            <span>Lupa password?</span>
            <a href={waHref('Halo admin Clorismen, saya lupa password Member Area. Email saya: ' + email.trim())} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Minta kirim ulang</a>
          </div>

          <ol className="mb-howto" aria-label="Cara mendapatkan akun">
            <li><b>1</b><span>Pesan &amp; bayar</span></li>
            <li><b>2</b><span>Akun dikirim ke WhatsApp</span></li>
            <li><b>3</b><span>Masuk di sini</span></li>
          </ol>
          <p className="mb-small center">Belum punya akun? <a href="/">Belanja sekarang</a>, akunnya dibuat otomatis.</p>
        </section>
      </div>
    </div>
  );
}

const STEPS = [['paid', 'Siap dikemas'], ['packed', 'Dikemas'], ['shipped', 'Dikirim'], ['completed', 'Selesai']];

function Steps({ status }) {
  const idx = STEPS.findIndex(([k]) => k === status);
  if (idx < 0) return null;
  return (
    <div className="mb-steps">
      {STEPS.map(([k, label], i) => <span key={k} className={i <= idx ? 'on' : ''}>{label}</span>)}
    </div>
  );
}

/* Nomor resi + tombol ke situs cek resi resmi kurir. Resi otomatis disalin supaya tinggal ditempel di sana. */
function ResiBox({ o }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard?.writeText(o.tracking_number); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard ditolak */ }
  };
  return (
    <div className="mb-resi">
      <div className="mb-resi-top">
        <span><i className="fa-solid fa-truck-fast" /> {o.courier || 'Kurir'}</span>
        <b className="mb-resi-no">{o.tracking_number}</b>
        <button type="button" className="mb-link" onClick={copy}>{copied ? 'Tersalin ✓' : 'Salin'}</button>
      </div>
      {o.tracking_url ? (
        <a className="mb-btn sm track" href={o.tracking_url} target="_blank" rel="noopener" onClick={copy}>
          Cek resi di {o.tracking_site || 'situs kurir'} <i className="fa-solid fa-arrow-up-right-from-square" />
        </a>
      ) : null}
      {o.tracking_url ? <small>Nomor resi otomatis tersalin. Tempel di kolom lacak pada situs kurir.</small> : null}
    </div>
  );
}

function OrdersCard({ orders }) {
  if (!orders.length) return <p className="mb-dim">Belum ada pesanan.</p>;
  return (
    <div className="mb-orders">
      {orders.map((o) => {
        const [label, tone] = STATUS[o.status] || [o.status, 'info'];
        return (
          <div key={o.code} className="mb-order">
            <div className="mb-order-top">
              <b>{o.code}</b>
              <span className={`mb-pill ${tone}`}>{label}</span>
            </div>
            <Steps status={o.status} />
            <ul>{o.items.map((i) => <li key={i.name}>{i.name} <span>x{i.qty}</span></li>)}</ul>
            <div className="mb-order-foot">
              <span>{fmtDate(o.date)}{o.shipping_cost ? ` · ongkir ${rp(o.shipping_cost)}` : ' · gratis ongkir'}</span>
              <b>{rp(o.total)}</b>
            </div>
            {o.address ? <p className="mb-addr"><i className="fa-solid fa-location-dot" /> {o.recipient ? <b>{o.recipient}: </b> : null}{o.address}</p> : null}
            {o.tracking_number ? <ResiBox o={o} /> : null}
            {!o.tracking_number && ['paid', 'packed'].includes(o.status) ? <p className="mb-addr">Nomor resi muncul di sini setelah paket diserahkan ke kurir.</p> : null}
          </div>
        );
      })}
    </div>
  );
}

const cleanName = (n) => String(n || '').replace(/^Clorismen\s+/i, '').replace(/\s*\(.*$/, '');

function Products({ onBuy }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    call('products').then((r) => setItems(Array.isArray(r.data) ? r.data : []));
  }, []);
  if (!items) return <p className="mb-dim">Memuat produk…</p>;
  if (!items.length) return <p className="mb-dim">Belum ada produk.</p>;
  return (
    <div className="mb-products">
      {items.map((p) => {
        const soldOut = p.in_stock === false;
        return (
          <div key={p.slug} className="mb-product">
            <div className="mb-product-img">
              <i className="fa-solid fa-box" />
              {p.image_url ? <img src={p.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
            </div>
            <div className="mb-product-tx">
              <b>{cleanName(p.name)}</b>
              <span>{p.compare_price ? <s>{rp(p.compare_price)}</s> : null} {rp(p.price)}</span>
              <small className={p.free_shipping ? 'ok' : ''}>{p.free_shipping ? 'Gratis ongkir' : `Ongkir ${rp(p.shipping_fee)}`}</small>
            </div>
            <button type="button" className="mb-btn sm buy" disabled={soldOut} onClick={() => onBuy(p)}>
              {soldOut ? 'Stok habis' : <><i className="fa-solid fa-cart-shopping" /> Beli</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/*
 * Beli langsung dari member area: alamat diisi otomatis dari pesanan terakhir, bayar lewat payment gateway
 * yang sama dengan landing (Midtrans Snap / iPaymu), lalu pindah ke halaman /terima-kasih/{token}.
 */
function Checkout({ product, defaults, onBack }) {
  const d = defaults || {};
  const [qty, setQty] = useState(1);
  const [name, setName] = useState(d.name || '');
  const [wa, setWa] = useState(d.phone || '');
  const [ship, setShip] = useState({ email: d.email || '', province: d.province || '', city: d.city || '', district: d.district || '', postal: d.postal_code || '', addr: d.address || '' });
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const setS = (k) => (e) => setShip((x) => ({ ...x, [k]: k === 'postal' ? e.target.value.replace(/\D/g, '').slice(0, 5) : e.target.value }));
  const fee = product.free_shipping ? 0 : Number(product.shipping_fee || 0);
  const total = product.price * qty + fee;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const nextBad = { name: name.trim().length < 2, wa: !/^(0|62|8)\d{8,13}$/.test(wa.replace(/\D/g, '')), ...shipErrors(ship) };
    setBad(nextBad);
    if (['name', 'wa', ...SHIP_ORDER].some((k) => nextBad[k])) { setErr('Lengkapi data yang ditandai merah.'); return; }
    setBusy(true); setErr('');
    try {
      const data = await api.createOrderIntent({
        items: [{ slug: product.slug, qty }],
        customer: { name: name.trim().slice(0, 80), phone: wa.trim().slice(0, 30), ...shipPayload(ship), note: 'Member Area', source_url: window.location.href.split('#')[0].slice(0, 250) },
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
      setErr('Halaman pembayaran gagal dibuka. Muat ulang halaman lalu coba lagi.');
    } catch (ex) {
      setErr(ex.message || 'Gagal memproses pesanan. Coba lagi sebentar.');
    }
    setBusy(false);
  };

  const f = (k) => (bad[k] ? ' is-bad' : '');
  return (
    <form className="mb-checkout" onSubmit={submit} noValidate>
      <section className="mb-card">
        <button type="button" className="mb-link" onClick={onBack}><i className="fa-solid fa-arrow-left" /> Kembali ke produk</button>
        <div className="mb-co-item">
          <div className="mb-product-img"><i className="fa-solid fa-box" />{product.image_url ? <img src={product.image_url} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}</div>
          <div className="mb-product-tx"><b>{cleanName(product.name)}</b><span>{rp(product.price)}</span></div>
          <div className="mb-qty" aria-label="Jumlah">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kurangi">−</button>
            <b>{qty}</b>
            <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Tambah">+</button>
          </div>
        </div>
      </section>

      <section className="mb-card">
        <h2><i className="fa-solid fa-location-dot" /> Alamat pengiriman</h2>
        {d.address ? <p className="mb-dim">Diisi otomatis dari pesanan terakhir kamu. Ubah kalau perlu.</p> : null}
        <div className="mb-grid2">
          <label>Nama penerima<input className={f('name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          <label>Nomor WhatsApp<input className={f('wa')} value={wa} onChange={(e) => setWa(e.target.value)} inputMode="tel" autoComplete="tel" /></label>
          <label>Email<input className={f('email')} type="email" value={ship.email} onChange={setS('email')} autoComplete="email" /></label>
          <label>Provinsi
            <select className={f('province')} value={ship.province} onChange={setS('province')}>
              <option value="">Pilih provinsi</option>
              {PROVINCES.map((pv) => <option key={pv} value={pv}>{pv}</option>)}
            </select>
          </label>
          <label>Kota / Kabupaten<input className={f('city')} value={ship.city} onChange={setS('city')} autoComplete="address-level2" /></label>
          <label>Kecamatan<input className={f('district')} value={ship.district} onChange={setS('district')} autoComplete="address-level3" /></label>
          <label>Kode pos (opsional)<input className={f('postal')} value={ship.postal} onChange={setS('postal')} inputMode="numeric" autoComplete="postal-code" /></label>
          <label className="full">Alamat lengkap<textarea className={f('addr')} rows={2} maxLength={250} value={ship.addr} onChange={setS('addr')} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan" autoComplete="street-address" /></label>
        </div>
      </section>

      <section className="mb-card">
        <h2><i className="fa-solid fa-wallet" /> Ringkasan</h2>
        <div className="mb-kv"><span>{cleanName(product.name)} × {qty}</span><b>{rp(product.price * qty)}</b></div>
        <div className="mb-kv"><span>Ongkos kirim</span><b>{fee ? rp(fee) : 'Gratis'}</b></div>
        <div className="mb-kv total"><span>Total bayar</span><b>{rp(total)}</b></div>
        <p className="mb-dim small"><i className="fa-solid fa-lock" /> Bayar lewat QRIS / Virtual Account / E-wallet di payment gateway resmi. Status otomatis terkonfirmasi.</p>
        {err ? <p className="mb-msg bad">{err}</p> : null}
        <button type="submit" className="mb-btn gold" disabled={busy}>{busy ? <><i className="fa-solid fa-spinner fa-spin" /> Memproses…</> : <>Bayar Sekarang <i className="fa-solid fa-lock" /></>}</button>
      </section>
    </form>
  );
}

function PasswordCard() {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (next.length < 8) { setMsg({ t: 'bad', m: 'Password baru minimal 8 karakter.' }); return; }
    setBusy(true); setMsg(null);
    const r = await call('member/password', { current_password: cur, new_password: next });
    setBusy(false);
    setMsg(r.ok ? { t: 'ok', m: r.data?.message || 'Password berhasil diganti.' } : { t: 'bad', m: r.message || 'Gagal mengganti password.' });
    if (r.ok) { setCur(''); setNext(''); }
  };
  return (
    <section className="mb-card">
      <h2><i className="fa-solid fa-key" /> Password</h2>
      {open ? (
        <form onSubmit={save} className="mb-passform">
          <input type="password" autoComplete="current-password" placeholder="Password sekarang" value={cur} onChange={(e) => setCur(e.target.value)} />
          <input type="password" autoComplete="new-password" placeholder="Password baru (min. 8 karakter)" value={next} onChange={(e) => setNext(e.target.value)} />
          <button type="submit" className="mb-btn sm" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan password'}</button>
        </form>
      ) : <button type="button" className="mb-link" onClick={() => setOpen(true)}>Ganti password</button>}
      {msg ? <p className={`mb-msg ${msg.t}`}>{msg.m}</p> : null}
    </section>
  );
}

const LOGO_DARK = '/images/opt/vip-logo-dark.webp';

function Logo() {
  return (
    <a href="/" className="mb-logo" aria-label="Beranda Clorismen">
      <img src={LOGO_DARK} alt="Clorismen" width="132" height="40" onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('b'), { textContent: 'CLORISMEN' })); }} />
    </a>
  );
}

const PAGES = [
  { id: 'beranda', label: 'Beranda', icon: 'fa-house' },
  { id: 'pesanan', label: 'Pesanan Saya', short: 'Pesanan', icon: 'fa-receipt' },
  { id: 'ebook', label: 'E-Book', icon: 'fa-book-open' },
  { id: 'konsultasi', label: 'Konsultasi Ahli', short: 'Konsultasi', icon: 'fa-user-doctor', needs: 'consultation' },
  { id: 'produk', label: 'Produk Lainnya', short: 'Produk', icon: 'fa-bag-shopping' },
  { id: 'akun', label: 'Akun Saya', short: 'Akun', icon: 'fa-circle-user' },
];

// Halaman aktif disimpan di hash (#pesanan) supaya tombol Back & refresh tetap di halaman yang sama
function usePage(valid) {
  const read = () => { const h = window.location.hash.replace('#', ''); return valid.includes(h) ? h : 'beranda'; };
  const [page, setPage] = useState(read);
  useEffect(() => {
    const on = () => setPage(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid.join()]);
  const go = (id) => { if (window.location.hash !== `#${id}`) window.location.hash = id; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return [page, go];
}

function EbookList({ ebooks }) {
  if (!ebooks?.length) return <p className="mb-dim">Belum ada e-book untuk paket yang kamu beli.</p>;
  return (
    <div className="mb-ebooks">
      {ebooks.map((e) => (
        <div key={e.id} className="mb-ebook">
          <div className="mb-ebook-cover">{e.cover_url ? <img src={e.cover_url} alt="" /> : <i className="fa-solid fa-book" />}</div>
          <div className="mb-ebook-tx">
            <b>{e.title}</b>
            {e.description ? <p>{e.description}</p> : null}
            {e.has_file
              ? <a className="mb-btn sm" href={`/bff/member/ebooks/${e.id}`} target="_blank" rel="noopener"><i className="fa-solid fa-book-open-reader" /> Baca E-Book</a>
              : <span className="mb-pill warn">Segera tersedia</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Home({ data, go }) {
  const orders = data.orders || [];
  const active = orders.filter((o) => ['paid', 'packed', 'shipped'].includes(o.status));
  const last = orders[0];
  const [label, tone] = last ? (STATUS[last.status] || [last.status, 'info']) : [];
  return (
    <>
      <div className="mb-stats">
        <button type="button" className="mb-stat" onClick={() => go('pesanan')}><i className="fa-solid fa-truck-fast" /><b>{active.length}</b><span>Pesanan aktif</span></button>
        <button type="button" className="mb-stat" onClick={() => go('ebook')}><i className="fa-solid fa-book-open" /><b>{data.ebooks?.length || 0}</b><span>E-book</span></button>
        <button type="button" className="mb-stat" onClick={() => go('pesanan')}><i className="fa-solid fa-receipt" /><b>{orders.length}</b><span>Total pesanan</span></button>
      </div>

      {last ? (
        <section className="mb-card">
          <div className="mb-card-head"><h2><i className="fa-solid fa-box" /> Pesanan terakhir</h2><button type="button" className="mb-link" onClick={() => go('pesanan')}>Lihat detail <i className="fa-solid fa-arrow-right" /></button></div>
          <div className="mb-order-top"><b>{last.code}</b><span className={`mb-pill ${tone}`}>{label}</span></div>
          <Steps status={last.status} />
          {last.tracking_number ? <ResiBox o={last} /> : <p className="mb-addr">{fmtDate(last.date)} · {rp(last.total)}</p>}
        </section>
      ) : (
        <section className="mb-card"><h2><i className="fa-solid fa-box" /> Pesanan</h2><p className="mb-dim">Belum ada pesanan.</p></section>
      )}

      <div className="mb-quick">
        <button type="button" className="mb-quick-item" onClick={() => go('ebook')}><i className="fa-solid fa-book-open-reader" /><span><b>Baca e-book</b><small>Panduan perawatan 30 hari</small></span></button>
        {data.consultation ? <button type="button" className="mb-quick-item" onClick={() => go('konsultasi')}><i className="fa-solid fa-user-doctor" /><span><b>Konsultasi ahli</b><small>Tanya lewat WhatsApp</small></span></button> : null}
        <button type="button" className="mb-quick-item" onClick={() => go('produk')}><i className="fa-solid fa-bag-shopping" /><span><b>Belanja lagi</b><small>Produk Clorismen lainnya</small></span></button>
      </div>
    </>
  );
}

function Dashboard({ data, onLogout }) {
  useWaNumber();
  const first = (data.member?.name || '').split(' ')[0];
  const lastCode = data.orders?.[0]?.code;
  const pages = PAGES.filter((p) => !p.needs || data[p.needs]);
  const [page, go] = usePage([...pages.map((p) => p.id), 'beli']);
  const [buying, setBuying] = useState(null);
  const buy = (p) => { setBuying(p); go('beli'); };
  const current = page === 'beli' ? { label: 'Checkout', icon: 'fa-cart-shopping' } : (pages.find((p) => p.id === page) || pages[0]);
  const menuOn = page === 'beli' ? 'produk' : page;
  const helpHref = waHref('Halo admin Clorismen, saya member dan butuh bantuan.');

  return (
    <div className="mb-app">
      <aside className="mb-side">
        <Logo />
        <div className="mb-side-user">
          <span className="mb-avatar">{(first || 'M').slice(0, 1).toUpperCase()}</span>
          <div><b>{first || 'Member'}</b><small>{data.member?.email || '-'}</small></div>
        </div>
        <nav className="mb-menu" aria-label="Menu Member Area">
          {pages.map((p) => (
            <button key={p.id} type="button" className={menuOn === p.id ? 'on' : ''} aria-current={menuOn === p.id ? 'page' : undefined} onClick={() => go(p.id)}>
              <i className={`fa-solid ${p.icon}`} /> {p.label}
            </button>
          ))}
        </nav>
        <div className="mb-side-foot">
          <a href={helpHref} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Bantuan admin</a>
          <a href="/"><i className="fa-solid fa-store" /> Kembali ke toko</a>
          <button type="button" onClick={onLogout}><i className="fa-solid fa-right-from-bracket" /> Keluar</button>
        </div>
      </aside>

      <main className="mb-main">
        <div className="mb-mtop">
          <Logo />
          <button type="button" className="mb-mout" onClick={onLogout} aria-label="Keluar"><i className="fa-solid fa-right-from-bracket" /></button>
        </div>

        <header className="mb-pagehead">
          {page === 'beranda' ? (
            <>
              <span className="mb-badge"><i className="fa-solid fa-crown" /> Member Clorismen</span>
              <h1>Halo{first ? `, ${first}` : ''} 👋</h1>
              <p className="mb-dim">Member sejak {fmtDate(data.member?.since)}</p>
            </>
          ) : <h1><i className={`fa-solid ${current.icon}`} /> {current.label}</h1>}
        </header>

        {page === 'beranda' ? <Home data={data} go={go} /> : null}
        {page === 'pesanan' ? <section className="mb-card"><OrdersCard orders={data.orders || []} /></section> : null}
        {page === 'ebook' ? <section className="mb-card"><EbookList ebooks={data.ebooks} /></section> : null}
        {page === 'konsultasi' && data.consultation ? (
          <section className="mb-card mb-consult">
            <div>
              <h2><i className="fa-solid fa-user-doctor" /> Konsultasi Ahli Kesehatan Kulit</h2>
              <p className="mb-dim">Tanya seputar perawatan kulit wajahmu, gratis untuk pembeli Paket VIP.</p>
            </div>
            <a className="mb-btn wa" href={waHref(`Halo, saya member Clorismen${lastCode ? ` (order ${lastCode})` : ''} dan mau konsultasi kulit.`)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Mulai Konsultasi</a>
          </section>
        ) : null}
        {page === 'produk' || (page === 'beli' && !buying) ? <section className="mb-card"><Products onBuy={buy} /></section> : null}
        {page === 'beli' && buying ? <Checkout product={buying} defaults={data.checkout} onBack={() => go('produk')} /> : null}
        {page === 'akun' ? (
          <>
            <section className="mb-card">
              <h2><i className="fa-solid fa-id-card" /> Data akun</h2>
              <div className="mb-kv"><span>Nama</span><b>{data.member?.name || '-'}</b></div>
              <div className="mb-kv"><span>Email login</span><b>{data.member?.email || '-'}</b></div>
              <div className="mb-kv"><span>WhatsApp</span><b>{data.member?.phone || '-'}</b></div>
              <div className="mb-kv"><span>Member sejak</span><b>{fmtDate(data.member?.since)}</b></div>
            </section>
            <PasswordCard />
            <button type="button" className="mb-btn ghost" onClick={onLogout}><i className="fa-solid fa-right-from-bracket" /> Keluar dari Member Area</button>
          </>
        ) : null}

        <p className="mb-small center">Butuh bantuan? <a href={helpHref} target="_blank" rel="noopener">Chat admin di WhatsApp</a></p>
      </main>

      <nav className="mb-tabbar" aria-label="Menu Member Area">
        {pages.filter((p) => p.id !== 'konsultasi').map((p) => (
          <button key={p.id} type="button" className={menuOn === p.id ? 'on' : ''} onClick={() => go(p.id)}>
            <i className={`fa-solid ${p.icon}`} /><span>{p.short || p.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function MemberPage() {
  const [state, setState] = useState({ loading: true, data: null });

  const load = async () => {
    setState((s) => ({ ...s, loading: true }));
    const r = await call('member/me');
    setState({ loading: false, data: r.ok ? r.data : null });
  };

  useEffect(() => {
    document.title = 'Member Area — Clorismen Official';
    load();
  }, []);

  const logout = async () => {
    await call('member/logout', {});
    setState({ loading: false, data: null });
  };

  return (
    <div className="mb">
      {state.loading
        ? <div className="mb-loading"><i className="fa-solid fa-spinner fa-spin" /> Memuat…</div>
        : state.data ? <Dashboard data={state.data} onLogout={logout} /> : <Login onDone={load} />}
    </div>
  );
}
