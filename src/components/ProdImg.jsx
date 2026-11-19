import { LOCAL, PRODUCTS, fbError } from '../config.js';

/** Foto produk: file lokal, otomatis fallback ke Google Drive kalau belum ada. */
export default function ProdImg({ k, alt = '', style, eager = false }) {
  return <img src={LOCAL[k]} alt={alt} style={style} decoding="async" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} onError={fbError(PRODUCTS[k])} />;
}
