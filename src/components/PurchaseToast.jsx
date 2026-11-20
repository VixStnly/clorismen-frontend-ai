import { useEffect, useRef, useState } from 'react';
import './purchase-toast.css';

/*
 * Notifikasi kiri bawah "Saiful R. baru saja membeli ...".
 * Data HANYA dari pesanan asli yang sudah dibayar di ERP (Shopee / TikTok / website), lewat /bff/recent-purchases.
 * Kalau ERP belum punya data, notifikasi tidak muncul sama sekali (tidak ada data karangan).
 */
const FIRST_DELAY = 3000; // notifikasi pertama muncul di detik ke-3 (sebelum 5 detik)
const SHOW_MS = 5500;
const GAP_MS = 9000;
const MAX_PER_VISIT = 8;
const CLOSED_KEY = 'clm_toast_closed';

const CHANNEL = { shopee: 'via Shopee', tiktok: 'via TikTok Shop', website: 'via website' };
const CHANNEL_SHORT = { shopee: 'Shopee', tiktok: 'TikTok', website: '' };

// Pratinjau HANYA di komputer lokal (localhost / *.local) saat ERP belum punya order lunas,
// supaya tampilannya bisa dicek. Di domain asli data contoh ini tidak pernah dipakai.
const IS_LOCAL = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\]|.+\.local|.+\.test)$/i.test(window.location.hostname);
const LOCAL_PREVIEW = () => {
  const ago = (m) => new Date(Date.now() - m * 60000).toISOString();
  return [
    { name: 'Contoh Lokal', product: 'Paket VIP Komplit', qty: 1, more: 0, channel: 'shopee', at: ago(12), preview: true },
    { name: 'Contoh Lokal', product: 'Clean Skin Series 2 Paket', qty: 1, more: 0, channel: 'shopee', at: ago(95), preview: true },
  ];
};

function timeAgo(iso) {
  const t = Date.parse(iso || '');
  if (!t) return '';
  const min = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (min < 60) return `${min} menit lalu`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.round(h / 24);
  return d <= 1 ? 'kemarin' : `${d} hari lalu`;
}

export default function PurchaseToast({ theme = 'dark', lift = false }) {
  const [list, setList] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [visible, setVisible] = useState(false);
  const shown = useRef(0);

  useEffect(() => {
    try { if (sessionStorage.getItem(CLOSED_KEY)) return undefined; } catch { /* mode privat */ }
    // Data diambil langsung saat halaman dibuka; notifikasi pertama tampil di detik ke-3
    // (atau segera setelah data datang kalau datanya lebih lambat dari 3 detik).
    const ctrl = new AbortController();
    const start = Date.now();
    let t;
    const showLater = (use) => {
      if (!use.length) return;
      t = setTimeout(() => { setList(use); setIdx(0); }, Math.max(0, FIRST_DELAY - (Date.now() - start)));
    };
    fetch('/bff/recent-purchases', { headers: { Accept: 'application/json' }, signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => {
        const rows = Array.isArray(j?.data) ? j.data.filter((r) => r && r.name && r.product) : [];
        showLater(rows.length ? rows : (IS_LOCAL ? LOCAL_PREVIEW() : []));
      })
      .catch((e) => { if (e?.name !== 'AbortError' && IS_LOCAL) showLater(LOCAL_PREVIEW()); });
    return () => { clearTimeout(t); ctrl.abort(); };
  }, []);

  useEffect(() => {
    if (idx < 0 || !list.length) return undefined;
    if (shown.current >= MAX_PER_VISIT) return undefined;
    shown.current += 1;
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), SHOW_MS);
    const next = setTimeout(() => setIdx((i) => (i + 1) % list.length), SHOW_MS + GAP_MS);
    return () => { clearTimeout(hide); clearTimeout(next); };
  }, [idx, list]);

  if (!list.length || idx < 0) return null;
  const p = list[idx];
  // Dari ulasan marketplace: pembelinya pasti sudah membeli, tapi bukan "baru saja" → tampilkan tanggal ulasan
  const isReview = p.kind === 'review';
  const reviewDate = isReview && p.at ? new Date(p.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';
  const shortMeta = isReview ? `★${p.rating || 5} ${CHANNEL_SHORT[p.channel] || ''}`.trim() : timeAgo(p.at);
  const meta = isReview
    ? [`★${p.rating || 5} ulasan ${CHANNEL_SHORT[p.channel] || ''}`.trim(), reviewDate].filter(Boolean).join(' · ')
    : [timeAgo(p.at), CHANNEL[p.channel]].filter(Boolean).join(' · ');
  const close = () => {
    setVisible(false);
    setList([]);
    try { sessionStorage.setItem(CLOSED_KEY, '1'); } catch { /* abaikan */ }
  };

  return (
    <div className={`ptoast ptoast-${theme}${lift ? ' ptoast-lift' : ''}${visible ? ' is-on' : ''}`} role="status" aria-live="polite">
      <span className="ptoast-ic" aria-hidden="true"><i className="fa-solid fa-bag-shopping" /></span>
      <div className="ptoast-tx">
        <p><b>{p.name}</b> <span className="ptoast-long">{isReview ? 'sudah membeli' : 'baru saja membeli'}</span><span className="ptoast-short">beli · {shortMeta}</span></p>
        <p className="ptoast-prod">{p.qty > 1 ? `${p.qty}x ` : ''}{p.product}{p.more ? ` +${p.more} lainnya` : ''}</p>
        <p className="ptoast-meta"><i className="fa-solid fa-circle-check" /> {meta}</p>
      </div>
      <button type="button" className="ptoast-x" onClick={close} aria-label="Tutup notifikasi" tabIndex={visible ? 0 : -1}>×</button>
    </div>
  );
}
