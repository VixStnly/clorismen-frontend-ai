import { api } from './api.js';

// iPaymu mengembalikan pembeli ke landing dengan ?order=KODE (+ trx_id & status dari iPaymu).
// Param dibaca sekali lalu dihapus dari URL supaya reload tidak memicu ulang dialog / event Purchase.
export function takePaymentReturn() {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const code = (url.searchParams.get('order') || '').trim();
  if (!/^[A-Za-z0-9-]{4,24}$/.test(code)) return null;
  const trxId = (url.searchParams.get('trx_id') || '').trim();
  ['order', 'trx_id', 'status', 'tipe', 'sid', 'payment_method', 'payment_channel'].forEach((k) => url.searchParams.delete(k));
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  return { code, trxId: /^\d{1,20}$/.test(trxId) ? trxId : null };
}

const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });

/**
 * Konfirmasi status ke ERP (ERP yang cek ke iPaymu). Callback iPaymu bisa datang beberapa detik
 * setelah pembeli kembali, jadi dicoba beberapa kali sebelum dianggap masih menunggu.
 * @returns {Promise<{status: 'paid'|'pending'|'error', code: string, total?: number, items?: array, payUrl?: string, waUrl?: string, message?: string}>}
 */
export async function confirmPaymentReturn({ code, trxId }, tries = 5) {
  let detail = null;
  for (let i = 0; i < tries; i += 1) {
    try { await api.verifyPayment(code, trxId); } catch { /* lanjut baca status */ }
    try { detail = await api.orderDetail(code); } catch { detail = null; }
    if (detail?.payment_status === 'paid') break;
    if (['failed', 'expired'].includes(detail?.payment_status)) break;
    if (i < tries - 1) await wait(2500);
  }
  if (!detail) return { status: 'error', code, message: 'Status pembayaran belum bisa dicek. Hubungi admin lewat WhatsApp dengan kode order di atas.' };

  const base = { code: detail.code, total: detail.total, items: detail.items || [], payUrl: detail.payment_url || null, waUrl: detail.whatsapp_url || undefined };
  if (detail.payment_status === 'paid') return { status: 'paid', ...base };
  if (['failed', 'expired'].includes(detail.payment_status)) {
    // Pesanan sudah tercatat di ERP; yang gagal hanya pembayarannya, jadi judulnya dibedakan dari "Pesanan Belum Terkirim"
    const expired = detail.payment_status === 'expired';
    return { status: 'error', ...base, title: expired ? 'Waktu Bayar Habis' : 'Pembayaran Gagal', message: expired ? 'Batas waktu pembayaran sudah lewat. Silakan pesan ulang atau hubungi admin.' : 'Pembayaran gagal atau dibatalkan. Coba lagi, atau selesaikan lewat WhatsApp admin.' };
  }
  return { status: 'pending', ...base };
}
