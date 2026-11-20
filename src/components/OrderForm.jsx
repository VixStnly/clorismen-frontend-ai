import { useEffect, useRef, useState } from 'react';
import { CONFIG, rp, waLink } from '../config.js';
import { api } from '../lib/api.js';
import { loadMidtransSnap } from '../lib/midtrans.js';
import { useOrder } from '../state/OrderContext.jsx';
import { track } from '../lib/pixel.js';
import { takePaymentReturn, confirmPaymentReturn } from '../lib/paymentReturn.js';
import ProdImg from './ProdImg.jsx';
import { PROVINCES, EMPTY_SHIP, shipErrors, SHIP_ORDER, shipPayload, useShippingFee } from '../lib/shipping.js';
import { useWaNumber } from '../lib/waNumber.js';

/* Dialog hasil pesanan: memakai kelas .lightbox/.box yang sudah ada (tanpa gaya baru selain lebar, lihat checkout.css) */
const STATUS_COPY = {
  checking: { eyebrow: 'Mengecek Pembayaran', title: 'Sebentar Ya…', text: 'Kami sedang memastikan status pembayaran lo.' },
  paid: { eyebrow: 'Pembayaran Berhasil', title: 'Makasih, Pesanan Lo Masuk!', text: 'Pembayaran sudah kami terima. Email & password Member Area kami kirim ke WhatsApp lo. Di sana lo bisa cek status pesanan, resi, dan baca e-book.' },
  pending: { eyebrow: 'Menunggu Pembayaran', title: 'Pesanan Dibuat', text: 'Selesaikan pembayarannya, status pesanan otomatis diperbarui. Kalau butuh bantuan, chat admin lewat WhatsApp.' },
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
            {result.status === 'paid' ? (
              <a href="/member" className="btn btn-primary"><i className="fa-solid fa-crown" /> Masuk Member Area (E-Book)</a>
            ) : null}
            <a href={result.waUrl || waLink()} target="_blank" rel="noopener" className="btn btn-ghost">
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
  const [ship, setShip] = useState(EMPTY_SHIP);
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const refs = { name: useRef(null), wa: useRef(null), email: useRef(null), province: useRef(null), city: useRef(null), district: useRef(null), postal: useRef(null), addr: useRef(null) };
  const snapRef = useRef(null);
  const shippingFee = useShippingFee([CONFIG.packages[qtyIdx].slug]);

  const red = (k) => (bad[k] ? { borderColor: 'var(--red)' } : undefined);
  const setS = (k) => (e) => setShip((s) => ({ ...s, [k]: k === 'postal' ? e.target.value.replace(/\D/g, '').slice(0, 5) : e.target.value }));

  const finish = (status, extra = {}) => {
    setResult({ status, ...extra });
    setBusy(false);
    // Meta: Purchase hanya saat pembayaran sudah pasti lunas
    if (status === 'paid') track('Purchase', { value: extra.total || 0, currency: 'IDR', content_name: 'Clean Skin Series' }, false);
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
      onError: () => finish('error', { ...base, message: 'Pembayaran gagal atau dibatalkan. Silakan coba lagi.' }),
      onClose: () => finish('pending', base),
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const nextBad = { name: !name.trim(), wa: !/^(0|62|8)\d{8,13}$/.test(wa.replace(/\D/g, '')), ...shipErrors(ship) };
    setBad(nextBad);
    const first = ['name', 'wa', ...SHIP_ORDER].find((k) => nextBad[k]);
    if (first) { refs[first].current?.focus(); return; }

    const p = CONFIG.packages[qtyIdx];
    setBusy(true);

    const note = [bump ? '+1 Micellar Water ekstra' : '', 'Landing utama'].filter(Boolean).join(' | ');

    try {
      const data = await api.createOrderIntent({
        items: [{ slug: p.slug, qty: 1 }],
        customer: { name: name.trim().slice(0, 80), phone: wa.trim().slice(0, 30), ...shipPayload(ship), note, source_url: window.location.href.slice(0, 250) },
      });
      const base = { code: data.code, total: data.total, waUrl: data.whatsapp_url || undefined };

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
      return finish('error', { ...base, message: 'Halaman pembayaran gagal dibuka. Muat ulang halaman lalu coba lagi.' });
    } catch (err) {
      // Termasuk "Payment gateway belum disetting": pesanan TIDAK dibuat di ERP
      return finish('error', { message: err.message || 'Gagal memproses pesanan. Coba lagi sebentar.' });
    }
  };

  const retryPay = () => {
    const s = snapRef.current;
    if (!s) return;
    setResult(null);
    runSnap(s.data, s.pkgLabel).catch(() => finish('error', { code: s.data.code, total: s.data.total, message: 'Halaman pembayaran gagal dibuka. Coba lagi.' }));
  };

  return (
    <>
      <form className="form glass gborder" id="orderForm" data-reveal="left" noValidate onSubmit={submit} onFocus={startCheckout}>
        <div className="fg"><label htmlFor="fName"><i className="fa-solid fa-user" />Nama lengkap</label>
          <input ref={refs.name} className="inp" id="fName" required placeholder="Contoh: Andika Pratama" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={red('name')} /></div>
        <div className="fg"><label htmlFor="fWa"><i className="fa-brands fa-whatsapp" />Nomor WhatsApp <small style={{ color: 'var(--muted)', fontWeight: 600 }}>(konfirmasi, resi &amp; kirim ebook)</small></label>
          <input ref={refs.wa} className="inp" id="fWa" required inputMode="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" value={wa} onChange={(e) => setWa(e.target.value)} style={red('wa')} /></div>
        <div className="fg"><label htmlFor="fEmail"><i className="fa-solid fa-envelope" />Email <small style={{ color: 'var(--muted)', fontWeight: 600 }}>(untuk login Member Area)</small></label>
          <input ref={refs.email} className="inp" id="fEmail" type="email" required inputMode="email" placeholder="nama@email.com" autoComplete="email" value={ship.email} onChange={setS('email')} style={red('email')} /></div>
        <div className="fg"><label htmlFor="fProv"><i className="fa-solid fa-map" />Provinsi</label>
          <select ref={refs.province} className="inp" id="fProv" required value={ship.province} onChange={setS('province')} style={red('province')} autoComplete="address-level1">
            <option value="">Pilih provinsi</option>
            {PROVINCES.map((pv) => <option key={pv} value={pv}>{pv}</option>)}
          </select></div>
        <div className="fg"><label htmlFor="fCity"><i className="fa-solid fa-city" />Kota / Kabupaten</label>
          <input ref={refs.city} className="inp" id="fCity" required placeholder="Contoh: Kota Bandung" autoComplete="address-level2" value={ship.city} onChange={setS('city')} style={red('city')} /></div>
        <div className="fg"><label htmlFor="fDist"><i className="fa-solid fa-map-location-dot" />Kecamatan</label>
          <input ref={refs.district} className="inp" id="fDist" required placeholder="Contoh: Coblong" autoComplete="address-level3" value={ship.district} onChange={setS('district')} style={red('district')} /></div>
        <div className="fg"><label htmlFor="fPos"><i className="fa-solid fa-hashtag" />Kode pos <small style={{ color: 'var(--muted)', fontWeight: 600 }}>(opsional)</small></label>
          <input ref={refs.postal} className="inp" id="fPos" inputMode="numeric" placeholder="40132" autoComplete="postal-code" value={ship.postal} onChange={setS('postal')} style={red('postal')} /></div>
        <div className="fg"><label htmlFor="fAddr"><i className="fa-solid fa-location-dot" />Alamat lengkap</label>
          <textarea ref={refs.addr} className="inp" id="fAddr" required maxLength={250} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan" autoComplete="street-address" value={ship.addr} onChange={setS('addr')} style={red('addr')} /></div>
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
        <div className="fg"><label><i className="fa-solid fa-wallet" />Pembayaran</label>
          <div className="opts"><label className="opt"><input type="radio" name="pay" checked readOnly /><span>QRIS / Transfer / E-wallet<small>Lewat payment gateway resmi, konfirmasi otomatis</small></span></label></div>
        </div>
        <label className="bump"><input type="checkbox" id="fBump" checked={bump} onChange={(e) => setBump(e.target.checked)} /><ProdImg k="micellar" alt="" /><span><b>+ Tambah 1 Micellar Water ekstra buat di tas/motor</b><small id="bumpTxt">Harga spesial, dikonfirmasi admin</small></span></label>
        <div className="incl"><span><i className="fa-solid fa-check" /> Ebook 30 Hari</span><span><i className="fa-solid fa-check" /> Konsultasi WA</span><span><i className="fa-solid fa-check" /> {shippingFee > 0 ? `Ongkir ${rp(shippingFee)}` : 'Gratis Ongkir'}</span></div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Memproses…' : 'Ya, Gue Mau Muka Bersih Maksimal – Pesan Sekarang'}</button>
        <div className="secure"><span><i className="fa-solid fa-lock" />Data aman</span><span><i className="fa-solid fa-truck-fast" />{shippingFee > 0 ? 'Resi via WhatsApp' : 'Gratis ongkir'}</span><span><i className="fa-brands fa-whatsapp" />Admin siap bantu</span></div>
      </form>
      <ResultDialog result={result} onClose={() => setResult(null)} onRetryPay={retryPay} />
    </>
  );
}

export function OrderSummary() {
  const { qtyIdx, bump } = useOrder();
  const p = CONFIG.packages[qtyIdx];
  const shippingFee = useShippingFee([p.slug]);
  return (
    <aside className="summary glass" data-reveal="right">
      <div className="eyebrow">Ringkasan Order</div>
      <div className="sum-img"><ProdImg k="facewash" alt="" /><ProdImg k="micellar" alt="" style={{ height: '170px', position: 'relative', zIndex: 2 }} /><ProdImg k="serum" alt="" style={{ height: '120px' }} /><ProdImg k="sunscreen" alt="" style={{ height: '135px' }} /></div>
      <div className="row"><span>Clean Skin Series</span><b id="sQty">{p.qty} Paket</b></div>
      <div className="row"><span>Harga normal</span><s id="sNormal" style={{ color: 'var(--dim)' }}>{rp(CONFIG.normal * p.qty)}</s></div>
      {bump ? <div className="row" id="sBumpRow"><span>+ Micellar Water ekstra</span><b>dikonfirmasi admin</b></div> : null}
      <div className="row"><span>Ebook 30 Hari</span><span className="free">GRATIS</span></div>
      <div className="row"><span>Ongkir</span>{shippingFee > 0 ? <b>{rp(shippingFee)}</b> : <span className="free">GRATIS</span>}</div>
      <div className="tot"><span>Total</span><b className="grad-text" id="sTotal">{rp(p.price + shippingFee)}</b></div>
    </aside>
  );
}
