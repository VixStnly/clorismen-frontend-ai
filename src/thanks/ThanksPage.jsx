import { useCallback, useEffect, useRef, useState } from 'react';
import { useWaNumber, waHref } from '../lib/waNumber.js';
import { initPixel, track } from '../lib/pixel.js';
import './thanks.css';

/*
 * Halaman terima kasih / status pembayaran: /terima-kasih/{token}
 * Dipakai landing utama & VIP (menggantikan pop-up/modal), jadi tidak bisa tertutup karena kepencet.
 * Token = 40 karakter acak dari ERP. Kode order (WEB-XXXX) tidak dipakai di URL supaya tidak bisa ditebak.
 * Data yang tampil sengaja minim: nama depan, isi pesanan, total. Tanpa alamat & email.
 */
const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const fmtTime = (iso) => (iso ? `${new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB` : '');
const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });

const COPY = {
  checking: { icon: 'fa-spinner fa-spin', tone: 'warn', title: 'Mengecek Pembayaran…', text: 'Sebentar ya, kami sedang memastikan status pembayaran kamu. Jangan tutup halaman ini.' },
  paid: { icon: 'fa-circle-check', tone: 'ok', title: 'Pembayaran Berhasil', text: 'Terima kasih! Pesanan kamu sudah kami terima dan segera dikemas. Email & password Member Area dikirim ke WhatsApp kamu untuk cek status pesanan, resi, dan baca e-book.' },
  pending: { icon: 'fa-clock', tone: 'warn', title: 'Menunggu Pembayaran', text: 'Pesanan kamu sudah dibuat. Selesaikan pembayaran lewat tombol di bawah, status di halaman ini otomatis berubah setelah lunas.' },
  failed: { icon: 'fa-circle-xmark', tone: 'bad', title: 'Pembayaran Gagal', text: 'Pembayaran gagal atau dibatalkan. Silakan pesan ulang, atau chat admin kalau butuh bantuan.' },
  expired: { icon: 'fa-hourglass-end', tone: 'bad', title: 'Waktu Bayar Habis', text: 'Batas waktu pembayaran sudah lewat. Silakan pesan ulang, atau chat admin kalau butuh bantuan.' },
  notfound: { icon: 'fa-link-slash', tone: 'bad', title: 'Link Tidak Valid', text: 'Halaman pesanan ini tidak ditemukan. Pastikan link-nya lengkap, atau chat admin dengan menyebutkan nomor order kamu.' },
  error: { icon: 'fa-wifi', tone: 'bad', title: 'Status Belum Bisa Dicek', text: 'Koneksi ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi.' },
};

function readToken() {
  const m = window.location.pathname.match(/^\/terima-kasih\/([A-Za-z0-9]{40})\/?$/);
  return m ? m[1] : null;
}

// iPaymu / Midtrans menambahkan parameter (trx_id, status, order_id…) saat kembali. Dibaca sekali lalu dibuang dari URL.
function takeTrxId() {
  const url = new URL(window.location.href);
  const trx = (url.searchParams.get('trx_id') || '').trim();
  if (url.search) window.history.replaceState(window.history.state, '', url.pathname);
  return /^\d{1,20}$/.test(trx) ? trx : null;
}

async function verify(token, trxId) {
  const res = await fetch(`/bff/thanks/${token}/verify-payment`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(trxId ? { trx_id: trxId } : {}),
  });
  let json = null;
  try { json = await res.json(); } catch { /* bukan JSON */ }
  if (res.status === 404) return { notFound: true };
  if (!res.ok || !json?.ok) throw new Error(json?.message || 'server');
  return { data: json.data };
}

// Meta Purchase hanya sekali per pesanan, walau halaman di-reload
function trackPurchaseOnce(token, d) {
  const key = `clm_purchase_${token.slice(0, 12)}`;
  try { if (window.localStorage.getItem(key)) return; window.localStorage.setItem(key, '1'); } catch { /* private mode */ }
  track('Purchase', { value: d.total || 0, currency: 'IDR', content_name: d.source === 'vip' ? 'Paket VIP Clorismen' : 'Clean Skin Series' }, false);
}

export default function ThanksPage() {
  useWaNumber();
  const tokenRef = useRef(typeof window !== 'undefined' ? readToken() : null);
  const [state, setState] = useState(tokenRef.current ? 'checking' : 'notfound');
  const [d, setD] = useState(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async (trxId = null, tries = 5) => {
    const token = tokenRef.current;
    if (!token) return;
    setBusy(true);
    let last = null;
    for (let i = 0; i < tries; i += 1) {
      try {
        const r = await verify(token, trxId);
        if (r.notFound) { setState('notfound'); setBusy(false); return; }
        last = r.data;
        setD(last);
        if (last.payment_status !== 'pending' && last.payment_status !== 'unpaid') break;
      } catch {
        if (i === tries - 1 && !last) { setState('error'); setBusy(false); return; }
      }
      // Notifikasi gateway bisa datang beberapa detik setelah pembeli kembali
      if (i < tries - 1) await wait(2500);
    }
    if (last) {
      const st = ['paid', 'failed', 'expired'].includes(last.payment_status) ? last.payment_status : 'pending';
      setState(st);
      if (st === 'paid') trackPurchaseOnce(token, last);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    document.title = 'Status Pesanan | Clorismen';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots); }
    robots.setAttribute('content', 'noindex, nofollow');
    initPixel();
    if (tokenRef.current) check(takeTrxId());
  }, [check]);

  const c = COPY[state] || COPY.error;
  const isVip = d?.source === 'vip';
  const backHref = isVip ? '/vip-paket-clorismen' : '/';
  const code = d?.code;
  const adminText = code ? `Halo admin Clorismen, saya sudah order dengan No. Order #${code}` : 'Halo admin Clorismen, saya butuh bantuan soal pesanan saya';
  const consultText = `Halo Tim Ahli Kulit Clorismen, saya pembeli Paket VIP dengan No. Order #${code}, ingin konsultasi kondisi kulit saya`;
  const hasVipBundle = isVip && (d?.items || []).some((l) => l.slug === 'paket-vip-komplit');

  return (
    <div className="ty">
      <header className="ty-head">
        <a href={backHref} aria-label="Beranda Clorismen"><img src="/images/opt/logo-white.webp" alt="Clorismen" width="120" height="65" /></a>
      </header>

      <main className="ty-main">
        <section className="ty-card" aria-live="polite">
          <div className={`ty-icon ${c.tone}`}><i className={`fa-solid ${c.icon}`} /></div>
          <h1>{c.title}</h1>
          {d?.first_name && state !== 'notfound' ? <p className="ty-hi">Halo, {d.first_name}</p> : null}
          <p className="ty-text">{c.text}</p>

          {d && state !== 'notfound' ? (
            <div className="ty-sum">
              <div className="ty-row"><span>No. Order</span><b>#{d.code}</b></div>
              {d.created_at ? <div className="ty-row"><span>Tanggal</span><b>{fmtTime(d.created_at)}</b></div> : null}
              <div className="ty-items">
                {(d.items || []).map((l, i) => (
                  <div className="ty-row" key={i}><span>{l.name} × {l.qty}</span><b>{rp(l.subtotal)}</b></div>
                ))}
                <div className="ty-row"><span>Ongkos kirim</span><b>{d.shipping_cost > 0 ? rp(d.shipping_cost) : 'Gratis'}</b></div>
              </div>
              <div className="ty-row total"><span>Total</span><b>{rp(d.total)}</b></div>
              {state === 'paid' && d.paid_at ? <div className="ty-row"><span>Dibayar</span><b>{fmtTime(d.paid_at)}</b></div> : null}
            </div>
          ) : null}

          <div className="ty-actions">
            {state === 'pending' && d?.payment_url ? (
              <a className="ty-btn gold" href={d.payment_url}>Lanjut Bayar <i className="fa-solid fa-lock" /></a>
            ) : null}
            {state === 'pending' ? (
              <button type="button" className="ty-btn ghost" disabled={busy} onClick={() => check(null, 2)}>
                {busy ? 'Mengecek…' : <>Saya Sudah Bayar, Cek Lagi <i className="fa-solid fa-rotate" /></>}
              </button>
            ) : null}
            {state === 'paid' ? (
              <a className="ty-btn dark" href="/member"><i className="fa-solid fa-crown" /> Masuk Member Area</a>
            ) : null}
            {state === 'paid' && hasVipBundle ? (
              <a className="ty-btn wa" href={waHref(consultText)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Konsultasi Ahli Kesehatan Kulit</a>
            ) : null}
            {['failed', 'expired'].includes(state) ? (
              <a className="ty-btn gold" href={`${backHref}#pesan`}>Pesan Ulang</a>
            ) : null}
            {state === 'error' ? (
              <button type="button" className="ty-btn dark" onClick={() => window.location.reload()}>Muat Ulang</button>
            ) : null}
            <a className="ty-btn ghost" href={d?.whatsapp_url || waHref(adminText)} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> Chat Admin</a>
          </div>

          <p className="ty-note">
            {state === 'paid'
              ? 'Simpan halaman ini. Status pengiriman & nomor resi bisa dicek kapan saja di Member Area.'
              : 'Simpan link halaman ini untuk mengecek status pesanan kamu.'}
          </p>
        </section>
        <a className="ty-back" href={backHref}><i className="fa-solid fa-arrow-left" /> Kembali ke halaman utama</a>
      </main>
    </div>
  );
}
