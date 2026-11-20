import { useEffect, useRef, useState } from 'react';
import { CONFIG, rp, waLink } from '../config.js';
import { api } from '../lib/api.js';
import { loadMidtransSnap } from '../lib/midtrans.js';
import { useOrder } from '../state/OrderContext.jsx';
import { track } from '../lib/pixel.js';
import { takePaymentReturn, confirmPaymentReturn } from '../lib/paymentReturn.js';
import ProdImg from './ProdImg.jsx';
import DestinationPicker, { destText, destValid } from './DestinationPicker.jsx';
import { useWaNumber } from '../lib/waNumber.js';

/* Dialog hasil pesanan: memakai kelas .lightbox/.box yang sudah ada (tanpa gaya baru selain lebar, lihat checkout.css) */
const STATUS_COPY = {
  checking: { eyebrow: 'Mengecek Pembayaran', title: 'Sebentar Ya…', text: 'Kami sedang memastikan status pembayaran lo.' },
  paid: { eyebrow: 'Pembayaran Berhasil', title: 'Makasih, Pesanan Lo Masuk!', text: 'Pembayaran sudah kami terima. Admin akan konfirmasi lewat WhatsApp dan kirim ebook-nya.' },
  pending: { eyebrow: 'Menunggu Pembayaran', title: 'Pesanan Dibuat', text: 'Selesaikan pembayarannya, status pesanan otomatis diperbarui. Kalau butuh bantuan, chat admin lewat WhatsApp.' },
  cod: { eyebrow: 'Pesanan Dicatat', title: 'Konfirmasi Lewat WhatsApp', text: 'Untuk COD, admin akan konfirmasi pesanan & ongkirnya lewat WhatsApp. Klik tombol di bawah untuk lanjut.' },
  manual: { eyebrow: 'Pesanan Dicatat', title: 'Lanjut Konfirmasi di WhatsApp', text: 'Pesanan lo sudah tercatat. Pembayaran online belum aktif, jadi admin bantu selesaikan lewat WhatsApp.' },
  error: { eyebrow: 'Ups', title: 'Pesanan Belum Terkirim', text: '' },
};

function ResultDialog({ result, onClose, onRetryPay }) {
  useWaNumber();
  const open = !!result;
  const copy = result ? STATUS_COPY[result.status] : STATUS_COPY.error;
  return (
    <div className={`lightbox${open ? ' open' : ''}`} aria-hidden={open ? 'false' : 'true'} role="dialog"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="box glass payd">
        <button type="button" className="close" aria-label="Tutup" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        {open ? (
          <div className="txt">
            <div className="eyebrow">{copy.eyebrow}</div>
            <div className="h2" style={{ fontSize: '30px' }}>{result?.title || copy.title}</div>
            <p style={{ color: 'var(--muted)' }}>{result.status === 'error' ? result.message : copy.text}</p>
            {result.code ? (
              <div className="sum-code" style={{ fontWeight: 800 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Kode order: </span>{result.code}
                {result.total ? <span style={{ color: 'var(--muted)', fontWeight: 600 }}> · Total </span> : null}
                {result.total ? rp(result.total) : null}
              </div>
            ) : null}
            {result.status === 'pending' && result.snapToken ? (
              <button type="button" className="btn btn-primary" onClick={onRetryPay}>Lanjut Bayar <i className="fa-solid fa-lock" /></button>
            ) : null}
            {result.status === 'pending' && !result.snapToken && result.payUrl ? (
              <a href={result.payUrl} className="btn btn-primary">Lanjut Bayar <i className="fa-solid fa-lock" /></a>
            ) : null}
            <a href={result.waUrl || waLink()} target="_blank" rel="noopener" className={`btn ${result.status === 'cod' || result.status === 'manual' || result.status === 'error' ? 'btn-primary' : 'btn-ghost'}`}>
              <i className="fa-brands fa-whatsapp" /> Chat Admin via WhatsApp
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function OrderForm() {
  const { qtyIdx, setPkg, bump, setBump } = useOrder();
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [addr, setAddr] = useState('');
  const [dest, setDest] = useState(null); // kecamatan dari RajaOngkir
  const [pay, setPay] = useState('Transfer');
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const refs = { name: useRef(null), wa: useRef(null), addr: useRef(null), dest: useRef(null) };
  const snapRef = useRef(null);

  const red = (k) => (bad[k] ? { borderColor: 'var(--red)' } : undefined);

  const finish = (status, extra = {}) => {
    setResult({ status, ...extra });
    setBusy(false);
    // Meta: Purchase saat pembayaran sudah pasti (lunas / COD tercatat)
    if (status === 'paid' || status === 'cod') track('Purchase', { value: extra.total || 0, currency: 'IDR', content_name: 'Clean Skin Series' }, false);
  };
  const startCheckout = () => track('InitiateCheckout', { content_name: 'Clean Skin Series', currency: 'IDR' });

  // Kembali dari halaman bayar iPaymu: konfirmasi status ke ERP lalu tampilkan hasilnya
  useEffect(() => {
    const ret = takePaymentReturn();
    if (!ret) return;
    setResult({ status: 'checking', code: ret.code });
    confirmPaymentReturn(ret).then((r) => finish(r.status, r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSnap = async (data, pkgLabel) => {
    const snap = await loadMidtransSnap(data.snap_js_url, data.client_key);
    const base = { code: data.code, total: data.total, waUrl: data.whatsapp_url, snapToken: data.snap_token };
    snapRef.current = { snap, data, pkgLabel };
    snap.pay(data.snap_token, {
      onSuccess: async () => {
        try { await api.verifyPayment(data.code); } catch { /* status tetap diperbarui via webhook */ }
        finish('paid', base);
      },
      onPending: () => finish('pending', base),
      onError: () => finish('error', { ...base, message: 'Pembayaran gagal atau dibatalkan. Coba lagi, atau selesaikan lewat WhatsApp admin.' }),
      onClose: () => finish('pending', base),
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const v = { name: !!name.trim(), wa: wa.replace(/\D/g, '').length >= 9, dest: destValid(dest), addr: addr.trim().length >= 8 };
    const nextBad = { name: !v.name, wa: !v.wa, dest: !v.dest, addr: !v.addr };
    setBad(nextBad);
    const first = ['name', 'wa', 'dest', 'addr'].find((k) => nextBad[k]);
    if (first) { refs[first].current?.focus(); return; }

    const p = CONFIG.packages[qtyIdx];
    setBusy(true);

    // Alamat jalan + wilayah RajaOngkir disimpan di catatan pesanan (maks 300 karakter di ERP)
    const area = destText(dest);
    const fullAddr = `${addr.trim()}, ${area}`;
    const meta = [area, bump ? '+1 Micellar Water ekstra' : '', `Bayar: ${pay}`].filter(Boolean).join(' | ');
    const room = 300 - meta.length - 3;
    const note = room > 10 ? `${addr.trim().slice(0, room)} | ${meta}` : fullAddr.slice(0, 300);

    const waFallback = waLink(
      `Halo admin Clorismen, saya mau order *Clean Skin Series* (promo website)\n\n` +
      `Nama: ${name.trim()}\nWhatsApp: ${wa.trim()}\nAlamat: ${fullAddr}\n\n` +
      `Jumlah: ${p.qty} Paket (${rp(p.price)})\n` + (bump ? `+ Tambah 1 Micellar Water ekstra\n` : '') +
      `Pembayaran: ${pay}\n\nTermasuk: Ebook 30 Hari + Konsultasi WA + Gratis Ongkir`,
    );

    try {
      const data = await api.createOrderIntent({
        items: [{ slug: p.slug, qty: 1 }],
        customer: { name: name.trim().slice(0, 80), phone: wa.trim().slice(0, 30), note, source_url: window.location.href.slice(0, 250) },
      });
      const base = { code: data.code, total: data.total, waUrl: data.whatsapp_url || waFallback };

      if (pay === 'COD') return finish('cod', base);

      // iPaymu: pindah ke halaman bayar iPaymu, nanti kembali ke landing dengan ?order=
      if (!data.snap_token && data.redirect_url) { window.location.href = data.redirect_url; return undefined; }

      if (data.snap_token && data.client_key && data.snap_js_url) {
        try {
          await runSnap({ ...data, whatsapp_url: base.waUrl }, p.tier);
          return undefined;
        } catch {
          if (data.redirect_url) { window.location.href = data.redirect_url; return undefined; }
        }
      }
      return finish('manual', base);
    } catch (err) {
      return finish('error', { message: `${err.message || 'Gagal memproses pesanan.'} Pesanan bisa langsung dikirim lewat WhatsApp admin.`, waUrl: waFallback });
    }
  };

  const retryPay = () => {
    const s = snapRef.current;
    if (!s) return;
    setResult(null);
    runSnap(s.data, s.pkgLabel).catch(() => finish('manual', { code: s.data.code, total: s.data.total, waUrl: s.data.whatsapp_url }));
  };

  return (
    <>
      <form className="form glass gborder" id="orderForm" data-reveal="left" noValidate onSubmit={submit} onFocus={startCheckout}>
        <div className="fg"><label htmlFor="fName"><i className="fa-solid fa-user" />Nama lengkap</label>
          <input ref={refs.name} className="inp" id="fName" required placeholder="Contoh: Andika Pratama" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={red('name')} /></div>
        <div className="fg"><label htmlFor="fWa"><i className="fa-brands fa-whatsapp" />Nomor WhatsApp <small style={{ color: 'var(--muted)', fontWeight: 600 }}>(konfirmasi, resi &amp; kirim ebook)</small></label>
          <input ref={refs.wa} className="inp" id="fWa" required inputMode="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" value={wa} onChange={(e) => setWa(e.target.value)} style={red('wa')} /></div>
        <div className="fg"><label htmlFor="fDest"><i className="fa-solid fa-map-location-dot" />Kecamatan / Kota</label>
          <DestinationPicker id="fDest" theme="dark" inputClassName="inp" inputRef={refs.dest} value={dest} onChange={setDest} invalid={!!bad.dest} invalidStyle={{ borderColor: 'var(--red)' }} />
          {bad.dest ? <small style={{ color: 'var(--red)', display: 'block', marginTop: '6px' }}>Ketik lalu pilih kecamatan dari daftar.</small> : null}</div>
        <div className="fg"><label htmlFor="fAddr"><i className="fa-solid fa-location-dot" />Alamat lengkap</label>
          <textarea ref={refs.addr} className="inp" id="fAddr" required maxLength={180} placeholder="Nama jalan, nomor rumah, RT/RW, patokan" autoComplete="street-address" value={addr} onChange={(e) => setAddr(e.target.value)} style={red('addr')} /></div>
        <div className="fg"><label><i className="fa-solid fa-box" />Pilih jumlah</label>
          <div className="opts c3" id="qtyOpts">
            {CONFIG.packages.map((p, i) => (
              <label className="opt" key={p.slug}>
                <input type="radio" name="qty" value={i} checked={qtyIdx === i} onChange={() => setPkg(i)} />
                <span>{p.qty} Paket{p.hot ? ' ⭐' : ''}<small>{rp(p.price)}{p.hot ? ' · Paling Hemat' : ''}</small></span>
              </label>
            ))}
          </div>
        </div>
        <div className="fg"><label><i className="fa-solid fa-wallet" />Metode pembayaran</label>
          <div className="opts c3">
            {[['Transfer', 'Transfer', 'Bank'], ['E-wallet/QRIS', 'E-wallet / QRIS', 'Instan'], ['COD', 'COD', 'Bayar di tempat']].map(([val, label, sub]) => (
              <label className="opt" key={val}><input type="radio" name="pay" value={val} checked={pay === val} onChange={() => setPay(val)} /><span>{label}<small>{sub}</small></span></label>
            ))}
          </div>
        </div>
        <label className="bump"><input type="checkbox" id="fBump" checked={bump} onChange={(e) => setBump(e.target.checked)} /><ProdImg k="micellar" alt="" /><span><b>+ Tambah 1 Micellar Water ekstra buat di tas/motor</b><small id="bumpTxt">Harga spesial, dikonfirmasi admin</small></span></label>
        <div className="incl"><span><i className="fa-solid fa-check" /> Ebook 30 Hari</span><span><i className="fa-solid fa-check" /> Konsultasi WA</span><span><i className="fa-solid fa-check" /> Gratis Ongkir</span></div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Memproses…' : 'Ya, Gue Mau Muka Bersih Maksimal – Pesan Sekarang'}</button>
        <div className="secure"><span><i className="fa-solid fa-lock" />Data aman</span><span><i className="fa-solid fa-truck-fast" />Gratis ongkir</span><span><i className="fa-brands fa-whatsapp" />Admin siap bantu</span></div>
      </form>
      <ResultDialog result={result} onClose={() => setResult(null)} onRetryPay={retryPay} />
    </>
  );
}

export function OrderSummary() {
  const { qtyIdx, bump } = useOrder();
  const p = CONFIG.packages[qtyIdx];
  return (
    <aside className="summary glass" data-reveal="right">
      <div className="eyebrow">Ringkasan Order</div>
      <div className="sum-img"><ProdImg k="facewash" alt="" /><ProdImg k="micellar" alt="" style={{ height: '170px', position: 'relative', zIndex: 2 }} /><ProdImg k="serum" alt="" style={{ height: '120px' }} /><ProdImg k="sunscreen" alt="" style={{ height: '135px' }} /></div>
      <div className="row"><span>Clean Skin Series</span><b id="sQty">{p.qty} Paket</b></div>
      <div className="row"><span>Harga normal</span><s id="sNormal" style={{ color: 'var(--dim)' }}>{rp(CONFIG.normal * p.qty)}</s></div>
      {bump ? <div className="row" id="sBumpRow"><span>+ Micellar Water ekstra</span><b>dikonfirmasi admin</b></div> : null}
      <div className="row"><span>Ebook 30 Hari</span><span className="free">GRATIS</span></div>
      <div className="row"><span>Ongkir</span><span className="free">GRATIS</span></div>
      <div className="tot"><span>Total</span><b className="grad-text" id="sTotal">{rp(p.price)}</b></div>
    </aside>
  );
}
