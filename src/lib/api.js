// Klien BFF landing. Browser hanya bicara ke /bff/* (same-origin);
// bff.php yang menandatangani request ke Storefront API ERP.
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/bff/${path}`, {
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      credentials: 'same-origin',
      ...options,
    });
  } catch {
    throw new ApiError('Koneksi terputus. Cek internet lalu coba lagi.', 0, 'network');
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // respons bukan JSON (mis. BFF belum jalan)
  }

  if (!res.ok || !json || json.ok === false) {
    const fallback = res.status === 429
      ? 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.'
      : 'Server pemesanan sedang bermasalah. Coba lagi sebentar.';
    throw new ApiError(json?.message || fallback, res.status, json?.error || 'server');
  }
  return json.data;
}

export const api = {
  createOrderIntent: (payload) => request('order-intents', { method: 'POST', body: JSON.stringify(payload) }),
  orderDetail: (code) => request(`order-intents/${encodeURIComponent(code)}`),
  searchDestinations: (q, signal) => request(`destinations?q=${encodeURIComponent(q)}`, { signal }),
  // BFF hanya menerima POST ber-Content-Type JSON; tanpa body → 415 dan verifikasi diam-diam gagal.
  verifyPayment: (code) => request(`order-intents/${encodeURIComponent(code)}/verify-payment`, { method: 'POST', body: '{}' }),
};
