import { useEffect, useState } from 'react';
import { useWaNumber, waHref } from '../lib/waNumber.js';
import './member.css';

/*
 * Member Area Clorismen (/member).
 * Login: email + password. Akun & password dibuat otomatis saat pesanan lunas dan dikirim ke WhatsApp
 * pembeli (WhatsApp resmi Meta) bersama order ID.
 * Sesi disimpan di cookie HttpOnly oleh BFF; JavaScript tidak pernah memegang token.
 */
const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-');
const fmtTime = (iso) => (iso ? `${new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB` : '');
const STATUS = {
  unpaid: ['Menunggu pembayaran', 'warn'],
  paid: ['Dibayar, menunggu dikemas', 'info'],
  packed: ['Sedang dikemas', 'info'],
  shipped: ['Dalam pengiriman', 'ok'],
  completed: ['Diterima', 'ok'],
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

function Tracking({ o }) {
  if (!o.tracking?.length) return null;
  return (
    <ol className="mb-track">
      {o.tracking.map((t, i) => (
        <li key={`${t.at}-${i}`} className={i === 0 ? 'is-now' : ''}>
          <b>{t.label}{t.location ? <span> · {t.location}</span> : null}</b>
          <p>{t.description}</p>
          <small>{fmtTime(t.at)}</small>
        </li>
      ))}
    </ol>
  );
}

const STEPS = [['paid', 'Dibayar'], ['packed', 'Dikemas'], ['shipped', 'Dikirim'], ['completed', 'Diterima']];

function Steps({ status }) {
  const idx = STEPS.findIndex(([k]) => k === status);
  if (idx < 0) return null;
  return (
    <div className="mb-steps">
      {STEPS.map(([k, label], i) => <span key={k} className={i <= idx ? 'on' : ''}>{label}</span>)}
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
            {o.tracking_number ? (
              <div className="mb-resi"><i className="fa-solid fa-truck-fast" /> {o.courier || 'Kurir'} · resi <b>{o.tracking_number}</b>
                <button type="button" className="mb-link" onClick={() => navigator.clipboard?.writeText(o.tracking_number)}>Salin</button>
                {o.tracking_url ? <a className="mb-link" href={o.tracking_url} target="_blank" rel="noopener">Lacak</a> : null}
              </div>
            ) : (['paid', 'packed'].includes(o.status) ? <p className="mb-addr">Nomor resi muncul di sini setelah paket diserahkan ke kurir.</p> : null)}
            <Tracking o={o} />
          </div>
        );
      })}
    </div>
  );
}

function Products() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    call('products').then((r) => setItems(Array.isArray(r.data) ? r.data : []));
  }, []);
  if (!items) return <p className="mb-dim">Memuat produk…</p>;
  if (!items.length) return <p className="mb-dim">Belum ada produk.</p>;
  const buyUrl = (p) => (p.slug === 'paket-vip-komplit' ? '/vip-paket-clorismen' : p.slug.startsWith('clean-skin-series') ? '/#paket' : waHref(`Halo admin Clorismen, saya member dan mau pesan ${p.name}`));
  return (
    <div className="mb-products">
      {items.map((p) => (
        <a key={p.slug} className="mb-product" href={buyUrl(p)} target={buyUrl(p).startsWith('http') ? '_blank' : undefined} rel="noopener">
          <div className="mb-product-img">
            <i className="fa-solid fa-box" />
            {p.image_url ? <img src={p.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
          </div>
          <div className="mb-product-tx">
            <b>{p.name.replace(/^Clorismen\s+/i, '').replace(/\s*\(.*$/, '')}</b>
            <span>{p.compare_price ? <s>{rp(p.compare_price)}</s> : null} {rp(p.price)}</span>
          </div>
        </a>
      ))}
    </div>
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
      <h2><i className="fa-solid fa-key" /> Akun</h2>
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

function Dashboard({ data, onLogout }) {
  useWaNumber();
  const first = (data.member?.name || '').split(' ')[0];
  const lastCode = data.orders?.[0]?.code;
  return (
    <div className="mb-wrap">
      <div className="mb-hello">
        <div>
          <span className="mb-badge"><i className="fa-solid fa-crown" /> Member Clorismen</span>
          <h1>Halo{first ? `, ${first}` : ''} 👋</h1>
          <p className="mb-dim">{data.member?.email || data.member?.phone} · member sejak {fmtDate(data.member?.since)}</p>
        </div>
        <button type="button" className="mb-link" onClick={onLogout}><i className="fa-solid fa-right-from-bracket" /> Keluar</button>
      </div>

      <section className="mb-card">
        <h2><i className="fa-solid fa-receipt" /> Pesanan Saya</h2>
        <OrdersCard orders={data.orders || []} />
      </section>

      <section className="mb-card">
        <h2><i className="fa-solid fa-book-open" /> E-Book Kamu</h2>
        {data.ebooks?.length ? (
          <div className="mb-ebooks">
            {data.ebooks.map((e) => (
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
        ) : <p className="mb-dim">Belum ada e-book untuk paket yang kamu beli.</p>}
      </section>

      {data.consultation ? (
        <section className="mb-card mb-consult">
          <div>
            <h2><i className="fa-solid fa-user-doctor" /> Konsultasi Ahli Kesehatan Kulit</h2>
            <p className="mb-dim">Tanya seputar perawatan kulit wajahmu, gratis untuk pembeli Paket VIP.</p>
          </div>
          <a className="mb-btn wa" href={waHref(`Halo, saya member Clorismen${lastCode ? ` (order ${lastCode})` : ''} dan mau konsultasi kulit.`)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Mulai Konsultasi</a>
        </section>
      ) : null}


      <section className="mb-card">
        <h2><i className="fa-solid fa-bag-shopping" /> Produk Clorismen Lainnya</h2>
        <Products />
      </section>

      <PasswordCard />

      <p className="mb-small center">Butuh bantuan? <a href={waHref('Halo admin Clorismen, saya member dan butuh bantuan.')} target="_blank" rel="noopener">Chat admin di WhatsApp</a></p>
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
      <header className="mb-head">
        <a href="/" aria-label="Beranda Clorismen"><img src="/images/opt/logo-white.webp" alt="Clorismen" width="120" height="65" /></a>
        <a href="/" className="mb-back"><i className="fa-solid fa-arrow-left" /> Toko</a>
      </header>
      {state.loading
        ? <div className="mb-loading"><i className="fa-solid fa-spinner fa-spin" /> Memuat…</div>
        : state.data ? <Dashboard data={state.data} onLogout={logout} /> : <Login onDone={load} />}
    </div>
  );
}
